import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export type Customer = {
  id: string;
  email: string;
  phone: string | null;
  full_name: string | null;
  total_spent: number;
  total_orders: number;
  last_order_date: string | null;
  segment: 'new' | 'returning' | 'vip' | 'lost';
  notes: string | null;
  created_at: string;
};

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('total_spent', { ascending: false });

      if (error) throw error;
      return data as Customer[];
    }
  });
}
