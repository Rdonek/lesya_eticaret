import { createAdminClient } from '@/lib/supabase/admin';
import { settingsService } from './settings-service';
import { ORDER_STATUS } from '@/lib/constants/order-status';

export const orderService = {
  /**
   * AFI: Ship order and automatically record shipping expense
   */
  async shipOrder(orderId: string, trackingNumber: string) {
    const supabase = createAdminClient();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('order_number')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    const settings = await settingsService.getAll();
    const actualShippingCost = settings.shipping.standard_fee; 

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: ORDER_STATUS.SHIPPED,
        tracking_number: trackingNumber,
        shipping_cost_actual: actualShippingCost,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    const { error: finError } = await supabase
      .from('finances')
      .insert({
        type: 'expense',
        category: 'shipping',
        amount: actualShippingCost,
        source: 'system_shipping',
        related_id: orderId,
        description: `Kargo Gönderimi: Sipariş #${order.order_number}`
      });

    if (finError) throw finError;

    return true;
  },

  /**
   * AFI: Cancel order and RESTORE STOCK
   */
  async cancelOrder(orderId: string) {
    console.log(`[OrderService] Starting cancellation for Order ID: ${orderId}`);
    const supabase = createAdminClient();

    // 1. Get Order Items to restore stock
    console.log('[OrderService] Fetching order items...');
    const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('product_variant_id, quantity')
        .eq('order_id', orderId);

    if (itemsError) {
        console.error("[OrderService] Error fetching order items:", itemsError);
        throw itemsError;
    }
    console.log(`[OrderService] Found ${items?.length || 0} items to restore.`);

    // 2. Start Cancellation Process
    console.log('[OrderService] Updating order status to CANCELLED...');
    const { error: updateError } = await supabase
        .from('orders')
        .update({ 
            status: ORDER_STATUS.CANCELLED,
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

    if (updateError) {
        console.error("[OrderService] Error updating order status:", updateError);
        throw updateError;
    }
    console.log('[OrderService] Order status updated.');

    // 3. Restore Stocks manually
    console.log('[OrderService] Starting stock restoration loop...');
    for (const item of (items || [])) {
        console.log(`[OrderService] Processing Item - Variant: ${item.product_variant_id}, Qty: ${item.quantity}`);
        
        // Fetch current stock first
        const { data: variant, error: varError } = await supabase
            .from('product_variants')
            .select('stock')
            .eq('id', item.product_variant_id)
            .single();
        
        if (varError) {
            console.error(`[OrderService] Error fetching variant stock for ${item.product_variant_id}:`, varError);
            continue; 
        }

        const newStock = (variant.stock || 0) + item.quantity;
        console.log(`[OrderService] Updating stock: ${variant.stock} -> ${newStock}`);

        // Update with new stock
        const { error: restockError } = await supabase
            .from('product_variants')
            .update({ stock: newStock })
            .eq('id', item.product_variant_id);

        if (restockError) {
            console.error(`[OrderService] Error restoring stock for ${item.product_variant_id}:`, restockError);
        } else {
            console.log(`[OrderService] Stock restored successfully for ${item.product_variant_id}`);
        }
    }

    console.log('[OrderService] Cancellation process completed.');
    return true;
  }
};