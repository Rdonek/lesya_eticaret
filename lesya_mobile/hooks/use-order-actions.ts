import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

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

  // 1. SHIP ORDER MUTATION
  const shipOrder = useMutation({
    mutationFn: async ({ orderId, trackingNumber }: { orderId: string, trackingNumber: string }) => {
      // Logic Mirroring from Web OrderService
      // A. Get settings for shipping fee
      const { data: settings } = await supabase.from('store_settings').select('value').eq('key', 'shipping').single();
      const actualCost = (settings?.value as any)?.standard_fee || 30;

      // B. Update Order
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'shipped',
          tracking_number: trackingNumber,
          shipping_cost_actual: actualCost,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // C. Record Finance Expense
      await supabase.from('finances').insert({
        type: 'expense',
        category: 'shipping',
        amount: actualCost,
        source: 'system_shipping',
        related_id: orderId,
        description: `Mobil Kargo Gönderimi: #${orderId.slice(0,8)}`
      });

      // D. Trigger Email (Optional: via Web API if configured)
      fetch('https://lesya.com/api/send-email', {
        method: 'POST',
        body: JSON.stringify({ orderId, type: 'shipped' })
      }).catch(() => {}); // Non-blocking
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      Alert.alert('Başarılı', 'Sipariş kargoya verildi.');
    },
    onError: (error) => {
      Alert.alert('Hata', 'Kargolama işlemi başarısız: ' + error.message);
    }
  });

  // 2. CANCEL ORDER MUTATION (With Stock Restoration)
  const cancelOrder = useMutation({
    mutationFn: async (orderId: string) => {
      // A. Get Order Items to restore stock
      const { data: items } = await supabase
        .from('order_items')
        .select('product_variant_id, quantity')
        .eq('order_id', orderId);

      if (!items) throw new Error('Sipariş kalemleri bulunamadı');

      // B. Update Order Status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
            status: 'cancelled',
            cancelled_reason: 'Mobil Panelden İptal',
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // C. Restore Stocks (Loop)
      for (const item of items) {
        const { data: variant } = await supabase
            .from('product_variants')
            .select('stock')
            .eq('id', item.product_variant_id)
            .single();
        
        if (variant) {
            await supabase
                .from('product_variants')
                .update({ stock: (variant.stock || 0) + item.quantity })
                .eq('id', item.product_variant_id);
        }
      }

      // D. AFI: REVERSE FINANCE (Correct Cash Flow)
      // Mirroring Web Logic: Record an expense to represent the refund
      const { data: order } = await supabase
        .from('orders')
        .select('total_amount, order_number')
        .eq('id', orderId)
        .single();
    
      if (order) {
        await supabase.from('finances').insert({
            type: 'expense', // Money leaving the safe (Refund)
            category: 'refund',
            amount: order.total_amount,
            source: 'system_return',
            related_id: orderId,
            order_id: orderId,
            description: `Mobil İade/İptal: Sipariş #${order.order_number}`
        });
      }

      // E. Trigger Email (Optional)
      fetch('https://lesya.com/api/send-email', {
        method: 'POST',
        body: JSON.stringify({ orderId, type: 'cancelled' })
      }).catch(() => {});
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      Alert.alert('İptal Edildi', 'Sipariş iptal edildi ve stoklar geri yüklendi.');
    },
    onError: (error) => {
      Alert.alert('Hata', 'İptal işlemi başarısız: ' + error.message);
    }
  });

  return { shipOrder, cancelOrder };
}
