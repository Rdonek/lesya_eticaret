import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export type DashboardStats = {
  totalRevenue: number;
  monthlyGrowth: number;
  pendingOrders: number;
  totalOrders: number;
  lowStockItems: number;
  trend: { date: string; revenue: number }[];
};

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const now = new Date();

      // 1. Calculate Date Ranges (Rolling 30 Days Logic)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();
      const sixtyDaysAgoIso = sixtyDaysAgo.toISOString();

      // 2. Fetch Revenue Data (Successful Orders Only)
      const successStatuses = ['paid', 'processing', 'shipped', 'delivered'];

      // Fetch ALL relevant orders in one go (last 60 days) to minimize DB calls
      const { data: allOrders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', sixtyDaysAgoIso)
        .in('status', successStatuses);

      let currentRevenue = 0;
      let previousRevenue = 0;

      allOrders?.forEach(order => {
        const orderDate = new Date(order.created_at);
        if (orderDate >= thirtyDaysAgo) {
            currentRevenue += Number(order.total_amount || 0);
        } else {
            previousRevenue += Number(order.total_amount || 0);
        }
      });

      const monthlyGrowth = previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : currentRevenue > 0 ? 100 : 0;

      // 3. Fetch Operational Counts (ALL TIME)
      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'); // Web logic excludes pending from 'new orders' badge usually, but keeps count. Let's keep it consistent.

      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', successStatuses);

      const { count: lowStockItems } = await supabase
        .from('product_variants')
        .select('*', { count: 'exact', head: true })
        .lt('stock', 5);

      // 4. Fetch 30-Day Trend (For Chart)
      // We can reuse 'currentRevenue' loop or fetch specifically if needed. 
      // Reusing logic for chart data:
      
      const groupedTrend: Record<string, number> = {};
      
      // Initialize last 30 days with 0
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        groupedTrend[dateStr] = 0;
      }

      allOrders?.forEach(order => {
        const orderDate = new Date(order.created_at);
        // Only include last 30 days for the chart
        if (orderDate >= thirtyDaysAgo) {
            const dateStr = orderDate.toISOString().split('T')[0];
            if (groupedTrend[dateStr] !== undefined) {
                groupedTrend[dateStr] += Number(order.total_amount);
            }
        }
      });

      const trend = Object.entries(groupedTrend)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalRevenue: currentRevenue,
        monthlyGrowth,
        pendingOrders: pendingOrders || 0,
        totalOrders: totalOrders || 0,
        lowStockItems: lowStockItems || 0,
        trend
      };
    }
  });
}