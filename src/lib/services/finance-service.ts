import { createAdminClient } from '@/lib/supabase/admin';
import { settingsService } from './settings-service';
import { ORDER_STATUS } from '@/lib/constants/order-status';

export type FinanceStat = {
  grossRevenue: number;
  netRevenue: number;
  vat: number;
  cogs: number;
  operationalExpenses: number;
  netProfit: number;
  margin: number;
};

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  source?: string;
  order_id?: string;
};

export const financeService = {
  async getStats(startDate: Date, endDate: Date): Promise<FinanceStat> {
    const supabase = createAdminClient(); 
    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();

    // 1. Fetch Finance Entries
    const { data: financeData } = await supabase
      .from('finances')
      .select('*')
      .gte('date', startIso)
      .lte('date', endIso);

    // 2. Fetch Successful Orders (Revenue Source)
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        id, 
        total_amount, 
        shipping_cost_actual, 
        order_items (
            quantity,
            product_snapshot,
            product_variants (cost_price)
        )
      `)
      .in('status', [ORDER_STATUS.PAID, ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED])
      .gte('created_at', startIso)
      .lte('created_at', endIso);

    const settings = await settingsService.getAll();
    const vatRate = (settings?.tax?.vat_rate || 20) / 100;

    let totalOrderRevenue = 0;
    let totalCOGS = 0;
    let totalOtherIncome = 0;
    let operationalExpenses = 0; 
    
    // We do NOT subtract refunds here for Cancelled orders because Cancelled orders are already excluded from 'totalOrderRevenue'.
    // Subtracting them again would be double counting.
    // Future V2: If we have 'Partial Refunds' on active orders, we would sum them here.

    // 3. Process Orders for Revenue & COGS
    orders?.forEach(order => {
        totalOrderRevenue += Number(order.total_amount);
        
        order.order_items?.forEach((item: any) => {
            const snapshot = typeof item.product_snapshot === 'string' 
                ? JSON.parse(item.product_snapshot) 
                : item.product_snapshot;
            
            let cost = Number(snapshot?.cost_price || 0);
            if (cost === 0 && item.product_variants?.cost_price) {
                cost = Number(item.product_variants.cost_price);
            }
            totalCOGS += cost * item.quantity;
        });
    });

    // 4. Process Finances Ledger
    financeData?.forEach(item => {
      const amount = Number(item.amount);
      
      if (item.type === 'income') {
        // Only include non-sale income (e.g. custom added income)
        if (item.category !== 'sale') totalOtherIncome += amount;
      } else {
        // EXCLUDE 'inventory' (Asset purchase)
        // EXCLUDE 'refund' (It's a cash flow movement, but for P&L, since we excluded the revenue, we exclude the refund too)
        if (item.category !== 'inventory' && item.category !== 'refund') {
            operationalExpenses += amount;
        }
      }
    });

    // 5. Final P&L Mathematics
    const grossRevenue = totalOrderRevenue + totalOtherIncome;
    const estimatedVAT = totalOrderRevenue - (totalOrderRevenue / (1 + vatRate));
    const netRevenue = grossRevenue - estimatedVAT;
    
    const netProfit = netRevenue - totalCOGS - operationalExpenses;
    const margin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    console.log(`[FinanceService] Stats Calculated: Revenue=${grossRevenue}, Profit=${netProfit}, Margin=${margin}%`);
    
    return {
      grossRevenue,
      netRevenue,
      vat: estimatedVAT,
      cogs: totalCOGS,
      operationalExpenses,
      netProfit,
      margin
    };
  },

  async getInventoryValue() {
    console.log('[FinanceService] Calculating Inventory Value...');
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('product_variants').select('stock, cost_price, id');
    
    if (error) {
        console.error('[FinanceService] Inventory Fetch Error:', error);
        return { totalValue: 0, totalItems: 0 };
    }

    const totalValue = data?.reduce((sum, v) => sum + (Number(v.stock) * Number(v.cost_price || 0)), 0) || 0;
    const totalItems = data?.reduce((sum, v) => sum + Number(v.stock), 0) || 0;
    
    console.log(`[FinanceService] Inventory Result: ${totalItems} Items, Value: ${totalValue} TL (From ${data?.length} variants)`);
    
    return { totalValue, totalItems };
  },

  async getCashFlow(startDate: Date, endDate: Date) {
    const supabase = createAdminClient();
    const { data } = await supabase.from('finances').select('type, amount').gte('date', startDate.toISOString()).lte('date', endDate.toISOString());
    let income = 0;
    let expense = 0;
    data?.forEach(item => {
      if (item.type === 'income') income += Number(item.amount);
      else expense += Number(item.amount);
    });
    return { income, expense, balance: income - expense };
  },

  async getTransactions() {
    const supabase = createAdminClient();
    const { data } = await supabase.from('finances').select('*').order('date', { ascending: false }).limit(50);
    return data as Transaction[];
  },

  async addTransaction(transaction: Omit<Transaction, 'id'>) {
    const supabase = createAdminClient();
    await supabase.from('finances').insert({
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date || new Date().toISOString(),
        source: (transaction as any).source || 'manual'
    });
  },

  /**
   * ROLLBACK (UNDO) Transaction
   * 1. If Inventory: Reverses stock and refund money
   * 2. If Expense: Refund money (Income)
   * 3. If Income: Deduct money (Expense)
   */
  async rollbackTransaction(transactionId: string) {
    const supabase = createAdminClient();

    // 1. Get the transaction details
    const { data: tx, error } = await supabase
        .from('finances')
        .select('*')
        .eq('id', transactionId)
        .single();

    if (error || !tx) throw new Error("İşlem bulunamadı.");

    // 2. Handle Inventory Rollback (The Hard Part)
    if (tx.category === 'inventory' && tx.related_id) {
        // Fetch the inventory log to know which product and how many
        const { data: log } = await supabase
            .from('inventory_logs')
            .select('*')
            .eq('id', tx.related_id)
            .single();

        if (log) {
            // Restore (Decrease) Stock
            const { data: variant } = await supabase
                .from('product_variants')
                .select('stock')
                .eq('id', log.product_variant_id)
                .single();

            if (variant) {
                const newStock = Math.max(0, (variant.stock || 0) - log.quantity);
                await supabase
                    .from('product_variants')
                    .update({ stock: newStock })
                    .eq('id', log.product_variant_id);
            }
        }
    }

    // 3. Delete the transaction record (Or mark as void? Deleting is cleaner for MVP)
    // Actually, for audit logs, it is better to insert a COUNTER-TRANSACTION.
    // But user asked to "fix/reset" erroneous entry. So we will DELETE the erroneous entry 
    // AND revert its effects.
    
    // However, if we delete it, we lose history. 
    // Let's DELETE it for simplicity in this Admin Dashboard context, 
    // as it is presented as "Removing a mistake".
    
    await supabase.from('finances').delete().eq('id', transactionId);
    
    // Also delete related inventory log if exists
    if (tx.related_id && tx.category === 'inventory') {
        await supabase.from('inventory_logs').delete().eq('id', tx.related_id);
    }

    return true;
  }
};
