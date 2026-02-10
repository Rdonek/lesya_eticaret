import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export type OrderStatus = 'all' | 'pending' | 'paid' | 'shipped' | 'cancelled';

export function useOrders(status: OrderStatus, searchQuery: string) {
  return useQuery({
    queryKey: ['orders', status, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*, order_items(count)') // Get item count for list view
        .order('created_at', { ascending: false });

      // Status Filter
      if (status !== 'all') {
        query = query.eq('status', status);
      }

      // Search Filter (Client-side filtering is expensive, we use ILIKE for server-side)
      if (searchQuery) {
        // Search by Order Number OR Customer Name
        // Supabase PostgREST syntax for OR logic
        query = query.or(`order_number.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}
