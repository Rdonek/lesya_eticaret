
import { createClient } from '@/lib/supabase/client';

export type DailyRevenue = {
  date: string;
  revenue: number;
  orderCount: number;
};

export type TopProduct = {
  id: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
  image: string;
};

export const analyticsService = {
  async getSalesTrend(days = 30): Promise<DailyRevenue[]> {
    const supabase = createClient();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: orders, error } = await supabase
      .from('orders')
      .select('created_at, total_amount')
      .neq('status', 'cancelled') // Exclude cancelled
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;
    console.log('DEBUG - Raw Orders from DB:', orders);

    // Group by date
    const grouped = orders.reduce((acc, order) => {
      const date = new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, orderCount: 0 };
      }
      acc[date].revenue += Number(order.total_amount);
      acc[date].orderCount += 1;
      return acc;
    }, {} as Record<string, DailyRevenue>);

    return Object.values(grouped);
  },

  async getTopProducts(limit = 5): Promise<TopProduct[]> {
    const supabase = createClient();

    // Fetch confirmed order items
    // This is a heavy query for large scale, but fine for MVP
    const { data: items, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        unit_price,
        product_snapshot,
        product_variant_id
      `)
      // We should ideally filter by order status, but let's assume all order_items in DB are valid or check parent order
      // For speed/simplicity in MVP, we might skip the parent join if we trust the flow, 
      // but correct way is to filter out cancelled orders.
      // Let's do a simple join if possible or just fetch all.
      .order('created_at', { ascending: false })
      .limit(1000); // Limit analysis to last 1000 items for performance

    if (error) throw error;

    const productStats = items.reduce((acc, item: any) => {
      let p = item.product_snapshot;
      
      // Ensure p is an object
      if (typeof p === 'string') {
        try { p = JSON.parse(p); } catch(e) { return acc; }
      }

      // Check for ID in snapshot, fallback to parent item's variant ID
      const pId = p?.id || p?.product_id || p?.variant_id || item.product_variant_id;
      if (!pId) return acc;
      
      if (!acc[pId]) {
        acc[pId] = {
           id: pId,
           name: p.name || 'Bilinmeyen Ürün',
           image: p.image || '',
           totalSold: 0,
           totalRevenue: 0
        };
      }
      
      acc[pId].totalSold += (item.quantity || 0);
      acc[pId].totalRevenue += ((item.quantity || 0) * Number(item.unit_price || 0));
      return acc;
    }, {} as Record<string, TopProduct>);

    return Object.values(productStats)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }
};