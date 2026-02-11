import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

export function useStockActions() {
  const queryClient = useQueryClient();

  // 1. ADD STOCK - Now using secure RPC
  const addStock = useMutation({
    mutationFn: async ({ 
      variantId,
      quantity,
      unitCost,
      description
    }: {
      variantId: string;
      quantity: number;
      unitCost: number;
      description?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Oturum bulunamadı.');

      // Execute all logic in one single database transaction
      const { data, error } = await supabase.rpc('rpc_add_stock_entry', {
        p_variant_id: variantId,
        p_quantity: Number(quantity),
        p_unit_cost: Number(unitCost),
        p_description: description || 'Mobil Stok Girişi',
        p_admin_id: user.id
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      queryClient.invalidateQueries({ queryKey: ['all-variants'] });
      queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      Alert.alert('Başarılı', 'Stok ve maliyet kayıtları güvenli şekilde güncellendi.');
    },
    onError: (error) => {
      Alert.alert('Hata', 'Stok işlemi başarısız: ' + error.message);
    }
  });

  // 2. BULK UPDATE (Price Only - Safe to keep as direct update)
  const updateVariantDetails = useMutation({
    mutationFn: async ({ variantId, price }: { variantId: string, price?: number }) => {
      if (price === undefined) return;

      const { error } = await supabase
        .from('product_variants')
        .update({ price })
        .eq('id', variantId);
      if (error) throw error;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['catalog'] });
        queryClient.invalidateQueries({ queryKey: ['all-variants'] });
    }
  });

  return { addStock, updateVariantDetails };
}

export function useAllVariants(search: string) {
  return useQuery({
    queryKey: ['all-variants', search],
    queryFn: async () => {
      let query = supabase
        .from('product_variants')
        .select(`
          id, sku, size, color, stock, price, cost_price,
          products (name, base_price)
        `)
        .order('sku', { ascending: true });

      if (search) {
        query = query.ilike('sku', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}