import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export type DailyRevenue = {
  date: string;
  revenue: number;
};

export function useSalesTrend(days = 7) {
  return useQuery({
    queryKey: ['sales-trend', days],
    queryFn: async () => {
      const now = new Date();
      const startDate = new Date();
      startDate.setDate(now.getDate() - days);

      const { data, error } = await supabase
        .from('orders')
        .select('created_at, total_amount')
        .gte('created_at', startDate.toISOString())
        .neq('status', 'cancelled')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by Date & Fill gaps with 0
      const grouped: Record<string, number> = {};
      
      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        grouped[dateStr] = 0;
      }

      data?.forEach(order => {
        const dateStr = new Date(order.created_at).toISOString().split('T')[0];
        if (grouped[dateStr] !== undefined) {
          grouped[dateStr] += Number(order.total_amount);
        }
      });

      return Object.entries(grouped)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date)) as DailyRevenue[];
    }
  });
}
