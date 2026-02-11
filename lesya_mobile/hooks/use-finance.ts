import { supabase } from '@/lib/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { Database } from '@/types/database';
import { widgetService } from '@/services/widget-service';

export type Transaction = Database['public']['Tables']['finances']['Row'];

export type FinanceStat = {
  grossRevenue: number;
  netRevenue: number;
  vat: number;
  cogs: number;
  operationalExpenses: number;
  netProfit: number;
  margin: number;
  cashBalance: number;
  periodIncome: number;
  periodExpense: number;
};

export function useFinanceStats(dateRange: 'this_month' | 'last_month' | 'all_time') {
  return useQuery({
    queryKey: ['finance-stats', dateRange],
    queryFn: async (): Promise<FinanceStat> => {
      const now = new Date();
      let startDate = new Date(0).toISOString();
      let endDate = new Date().toISOString();

      if (dateRange === 'this_month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      } else if (dateRange === 'last_month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        endDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      }

      const [periodFinanceRes, periodOrdersRes, settingsRes, globalFinanceRes, globalOrdersRes] = await Promise.all([
        supabase.from('finances').select('*').gte('date', startDate).lt('date', endDate),
        supabase.from('orders')
            .select('total_amount, order_items(quantity, unit_price, product_snapshot, product_variant_id)')        
            .in('status', ['paid', 'processing', 'shipped', 'delivered'])
            .gte('created_at', startDate)
            .lt('created_at', endDate),
        supabase.from('store_settings').select('value').eq('key', 'tax').single(),
        supabase.from('finances').select('type, category, amount'),
        supabase.from('orders')
            .select('total_amount')
            .in('status', ['paid', 'processing', 'shipped', 'delivered'])
      ]);

      if (periodFinanceRes.error) throw periodFinanceRes.error;
      if (periodOrdersRes.error) throw periodOrdersRes.error;
      if (globalFinanceRes.error) throw globalFinanceRes.error;
      if (globalOrdersRes.error) throw globalOrdersRes.error;

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
            if (item.category !== 'sale') {
                totalOtherIncome += amt;
            }
        }
      });

      const cashBalance = (totalSalesRevenue + totalOtherIncome) - totalExpenses;

      const vatRate = ((settingsRes.data?.value as any)?.vat_rate ?? 20) / 100;
      let periodOrderRevenue = 0;
      let totalCOGS = 0;

      const variantIds = periodOrdersRes.data?.flatMap(o => o.order_items.map((i: any) => i.product_variant_id)) || [];
      const { data: variantsCost } = await supabase.from('product_variants').select('id, cost_price').in('id', variantIds);
      const costMap = new Map(variantsCost?.map(v => [v.id, v.cost_price]));

      periodOrdersRes.data?.forEach(order => {
        periodOrderRevenue += Number(order.total_amount);
        (order.order_items as any[]).forEach((item: any) => {
            const snapshot = typeof item.product_snapshot === 'string' ? JSON.parse(item.product_snapshot) : item.product_snapshot;
            let cost = Number(snapshot?.cost_price || 0);
            if (cost === 0 && item.product_variant_id) {
                cost = Number(costMap.get(item.product_variant_id) || 0);
            }
            totalCOGS += cost * (item.quantity || 0);
        });
      });

      let periodOtherIncome = 0;
      let periodOperationalExpenses = 0;
      let periodTotalExpense = 0;

      periodFinanceRes.data?.forEach(item => {
        const amt = Number(item.amount);
        if (item.type === 'expense') {
            periodTotalExpense += amt;
            if (item.category !== 'inventory' && item.category !== 'refund') {
                periodOperationalExpenses += amt;
            }
        } else if (item.type === 'income') {
            if (item.category !== 'sale') {
                periodOtherIncome += amt;
            }
        }
      });

      const grossRevenue = periodOrderRevenue + periodOtherIncome;
      const estimatedVAT = periodOrderRevenue - (periodOrderRevenue / (1 + vatRate));
      const netRevenue = grossRevenue - estimatedVAT;
      const netProfit = netRevenue - totalCOGS - periodOperationalExpenses;
      const margin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

      const result = {
        grossRevenue,
        netRevenue,
        vat: estimatedVAT,
        cogs: totalCOGS,
        operationalExpenses: periodOperationalExpenses,
        netProfit,
        margin,
        cashBalance,
        periodIncome: periodOrderRevenue + periodOtherIncome,
        periodExpense: periodTotalExpense
      };

      // Sync with Android Widget
      widgetService.updateFinanceWidget(result);

      return result;
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
    mutationFn: async (tx: { type: 'income' | 'expense', category: 'sale' | 'shipping' | 'marketing' | 'rent' | 'salary' | 'inventory' | 'refund' | 'other', amount: number, description: string }) => {
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
      const { error } = await supabase.rpc('rpc_rollback_transaction', {
        p_transaction_id: id
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      queryClient.invalidateQueries({ queryKey: ['all-variants'] });
      Alert.alert('Silindi', 'İşlem ve etkileri güvenli şekilde geri alındı.');
    },
    onError: (e) => Alert.alert('Hata', 'Silinemedi: ' + e.message)
  });

  return { addTransaction, deleteTransaction };
}
