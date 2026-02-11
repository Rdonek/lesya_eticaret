import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL || 'https://lesyastudio.com';

export function useOrderDetail(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

export function useOrderActions() {
  const queryClient = useQueryClient();

  // 1. SHIP ORDER - Now using secure RPC
  const shipOrder = useMutation({
    mutationFn: async ({ orderId, trackingNumber }: { orderId: string, trackingNumber: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Oturum bulunamadı.');

      const { error } = await supabase.rpc('rpc_ship_order', {
        p_order_id: orderId,
        p_tracking_number: trackingNumber,
        p_admin_id: user.id
      });

      if (error) throw error;

      // Trigger Email (Async)
      fetch(`${SITE_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, type: 'shipped' })
      }).catch((e) => console.error('Email trigger error:', e));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
      Alert.alert('Başarılı', 'Sipariş kargoya verildi.');
    },
    onError: (error) => {
      Alert.alert('Hata', 'Kargolama işlemi başarısız: ' + error.message);
    }
  });

  // 2. CANCEL ORDER - Now using secure RPC
  const cancelOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Oturum bulunamadı.');

      const { error } = await supabase.rpc('rpc_cancel_order', {
        p_order_id: orderId,
        p_reason: 'Mobil Panelden İptal Edildi',
        p_admin_id: user.id
      });

      if (error) throw error;

      // Trigger Email (Async)
      fetch(`${SITE_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, type: 'cancelled' })
      }).catch((e) => console.error('Email trigger error:', e));
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
      queryClient.invalidateQueries({ queryKey: ['catalog'] }); // Stock restored
      Alert.alert('İptal Edildi', 'Sipariş iptal edildi ve stoklar geri yüklendi.');
    },
    onError: (error) => {
      Alert.alert('Hata', 'İptal işlemi başarısız: ' + error.message);
    }
  });

  return { shipOrder, cancelOrder };
}
