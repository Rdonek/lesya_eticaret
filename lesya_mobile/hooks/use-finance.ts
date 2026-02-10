import { supabase } from '@/lib/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

export type FinanceStat = {
  grossRevenue: number;
  netRevenue: number;
  vat: number;
  cogs: number;
  operationalExpenses: number;
  netProfit: number;
  margin: number;
  cashBalance: number; // Global Balance
  periodIncome: number; // Cash Inflow in Period
  periodExpense: number; // Cash Outflow in Period
};

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  source: string;
  related_id?: string;
};

export function useFinanceStats(dateRange: 'this_month' | 'last_month' | 'all_time') {
  return useQuery({
    queryKey: ['finance-stats', dateRange],
    queryFn: async (): Promise<FinanceStat> => {
      // 1. Calculate Date Ranges (UTC Safe)
      const now = new Date();
      let startDate = new Date(0).toISOString(); // Default 1970
      let endDate = new Date().toISOString(); // Now

      if (dateRange === 'this_month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate = start.toISOString();
      } else if (dateRange === 'last_month') {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 1); 
        startDate = start.toISOString();
        endDate = end.toISOString();
      }

      // 2. Fetch All Required Data (Parallel)
      const [
        periodFinanceRes, 
        periodOrdersRes, 
        settingsRes, 
        globalFinanceRes, 
        globalOrdersRes
      ] = await Promise.all([
        // Period Finances
        supabase.from('finances').select('*').gte('date', startDate).lt('date', endDate),
        
        // Period Orders (Revenue Source)
        supabase.from('orders')
            .select('total_amount, order_items(quantity, unit_price, product_snapshot, product_variant_id)')        
            .in('status', ['paid', 'processing', 'shipped', 'delivered'])
            .gte('created_at', startDate)
            .lt('created_at', endDate),
            
        // Settings (VAT)
        supabase.from('store_settings').select('value').eq('key', 'tax').single(),

        // Global Finances (For Total Balance)
        supabase.from('finances').select('type, category, amount'),

        // Global Orders (For Total Balance Revenue)
        supabase.from('orders')
            .select('total_amount')
            .in('status', ['paid', 'processing', 'shipped', 'delivered'])
      ]);

      if (periodFinanceRes.error) throw periodFinanceRes.error;
      if (periodOrdersRes.error) throw periodOrdersRes.error;
      if (globalFinanceRes.error) throw globalFinanceRes.error;
      if (globalOrdersRes.error) throw globalOrdersRes.error;

      // ---------------------------------------------------------
      // A. GLOBAL CASH BALANCE CALCULATION (The Absolute Truth)
      // Formula: (Total Sales) + (Total Other Income) - (Total Expenses)
      // ---------------------------------------------------------
      
      let totalSalesRevenue = 0;
      globalOrdersRes.data.forEach(o => {
        totalSalesRevenue += Number(o.total_amount || 0);
      });

      let totalOtherIncome = 0;
      let totalExpenses = 0;

      globalFinanceRes.data.forEach(item => {
        const amt = Number(item.amount);
        if (item.type === 'expense') {
            totalExpenses += amt;
        } else if (item.type === 'income') {
            // Only count income if it is NOT a 'sale' (to avoid double counting with orders)
            if (item.category !== 'sale') {
                totalOtherIncome += amt;
            }
        }
      });

      const cashBalance = (totalSalesRevenue + totalOtherIncome) - totalExpenses;


      // ---------------------------------------------------------
      // B. PERIOD CALCULATIONS (Filtered by Date)
      // ---------------------------------------------------------
      
      const vatRate = (settingsRes.data?.value as any)?.vat_rate ? (settingsRes.data?.value as any).vat_rate / 100 : 0.20;

      // 1. Period Revenue & COGS from Orders
      let periodOrderRevenue = 0;
      let totalCOGS = 0;

      // Fetch variant costs fallback for COGS
      const variantIds = periodOrdersRes.data?.flatMap(o => o.order_items.map((i: any) => i.product_variant_id)) || [];   
      const { data: variantsCost } = await supabase.from('product_variants').select('id, cost_price').in('id', variantIds);
      const costMap = new Map(variantsCost?.map(v => [v.id, v.cost_price]));

      periodOrdersRes.data?.forEach(order => {
        periodOrderRevenue += Number(order.total_amount);
        order.order_items.forEach((item: any) => {
            const snapshot = typeof item.product_snapshot === 'string' ? JSON.parse(item.product_snapshot) : item.product_snapshot;
            let cost = Number(snapshot?.cost_price || 0);
            if (cost === 0 && item.product_variant_id) {
                cost = Number(costMap.get(item.product_variant_id) || 0);
            }
            totalCOGS += cost * item.quantity;
        });
      });

      // 2. Period Expenses & Other Income from Finances
      let periodOtherIncome = 0; // Income from finances (not sales)
      let periodOperationalExpenses = 0; // Expenses (not inventory/refund)
      let periodTotalExpense = 0; // All expenses (for cash flow)

      periodFinanceRes.data?.forEach(item => {
        const amt = Number(item.amount);

        if (item.type === 'expense') {
            periodTotalExpense += amt; // For Cash Flow
            
            // For P&L (Exclude Inventory & Refund)
            if (item.category !== 'inventory' && item.category !== 'refund') {
                periodOperationalExpenses += amt;
            }
        } else if (item.type === 'income') {
            // Only count if not sale
            if (item.category !== 'sale') {
                periodOtherIncome += amt;
            }
        }
      });

      // 3. Final Period Metrics
      const grossRevenue = periodOrderRevenue + periodOtherIncome; // Total Inflow
      const estimatedVAT = periodOrderRevenue - (periodOrderRevenue / (1 + vatRate));
      const netRevenue = grossRevenue - estimatedVAT;
      const netProfit = netRevenue - totalCOGS - periodOperationalExpenses;
      const margin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

      // Cash Flow for Period
      // Income = Sales + Other Income
      // Expense = All Expenses (Including Inventory)
      const periodIncome = periodOrderRevenue + periodOtherIncome;
      const periodExpense = periodTotalExpense;

      return {
        grossRevenue,
        netRevenue,
        vat: estimatedVAT,
        cogs: totalCOGS,
        operationalExpenses: periodOperationalExpenses,
        netProfit,
        margin,
        cashBalance, // GLOBAL
        periodIncome, // PERIOD SPECIFIC (Sales + Other)
        periodExpense // PERIOD SPECIFIC (All Expenses)
      };
    }
  });
}

export function useTransactions(dateRange?: 'this_month' | 'last_month' | 'all_time') {
  return useQuery({
    queryKey: ['transactions', dateRange],
    queryFn: async () => {
      const now = new Date();
      let query = supabase.from('finances').select('*').order('date', { ascending: false });

      if (dateRange === 'this_month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        query = query.gte('date', start);
      } else if (dateRange === 'last_month') {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const end = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        query = query.gte('date', start).lt('date', end);
      } else {
        query = query.limit(100);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Transaction[];
    }
  });
}

export function useFinanceActions() {
  const queryClient = useQueryClient();

  const addTransaction = useMutation({
    mutationFn: async (tx: { type: 'income' | 'expense', category: string, amount: number, description: string }) => {
      const { error } = await supabase.from('finances').insert({
        ...tx,
        date: new Date().toISOString(),
        source: 'manual'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      Alert.alert('Başarılı', 'İşlem kaydedildi.');
    },
    onError: (e) => Alert.alert('Hata', e.message)
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      // 1. Get Transaction
      const { data: tx, error: txError } = await supabase.from('finances').select('*').eq('id', id).single();
      if (txError || !tx) throw new Error("İşlem bulunamadı.");

      // 2. Rollback Inventory if needed
      if (tx.category === 'inventory' && tx.related_id) {
        const { data: log } = await supabase.from('inventory_logs').select('*').eq('id', tx.related_id).single();
        if (log) {
            const { data: variant } = await supabase.from('product_variants').select('stock').eq('id', log.product_variant_id).single();
            if (variant) {
                const newStock = Math.max(0, (variant.stock || 0) - log.quantity);
                await supabase.from('product_variants').update({ stock: newStock }).eq('id', log.product_variant_id);
            }
            await supabase.from('inventory_logs').delete().eq('id', log.id);
        }
      }

      // 3. Delete Finance Record
      const { error: delError } = await supabase.from('finances').delete().eq('id', id);
      if (delError) throw delError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      Alert.alert('Silindi', 'İşlem başarıyla geri alındı.');
    },
    onError: (e) => Alert.alert('Hata', 'Silinemedi: ' + e.message)
  });

  return { addTransaction, deleteTransaction };
}