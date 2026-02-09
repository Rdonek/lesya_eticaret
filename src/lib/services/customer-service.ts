import { createClient } from '@/lib/supabase/client';

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

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    const supabase = createClient();
    
    // Fetch directly from the optimized customers table created by the trigger
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('total_spent', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }

    return data as Customer[];
  },

  async updateCustomer(id: string, updates: Partial<Customer>) {
    const supabase = createClient();
    const { error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }
};