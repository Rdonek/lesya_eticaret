'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { ORDER_STATUS } from '@/lib/constants/order-status';
import { revalidatePath } from 'next/cache';

/**
 * Server Action to Cancel Order
 */
export async function cancelOrderAction(orderId: string) {
  try {
    const supabase = createAdminClient();

    const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('product_variant_id, quantity')
        .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    const { error: updateError } = await supabase
        .from('orders')
        .update({ status: ORDER_STATUS.CANCELLED })
        .eq('id', orderId);

    if (updateError) throw updateError;

    // RESTORE STOCK
    for (const item of (items || [])) {
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

    // AFI: REVERSE FINANCE (Correct Cash Flow)
    // If we have an income record for this order, we should neutralize it
    // We insert a negative income record to represent the refund
    const { data: order } = await supabase.from('orders').select('total_amount, order_number').eq('id', orderId).single();
    
    if (order) {
        await supabase.from('finances').insert({
            type: 'expense', // Money leaving the safe (Refund)
            category: 'refund',
            amount: order.total_amount,
            source: 'system_return',
            related_id: orderId,
            order_id: orderId,
            description: `İade/İptal: Sipariş #${order.order_number}`
        });
    }

    revalidatePath('/admin/siparisler');
    revalidatePath(`/admin/siparisler/${orderId}`);
    return { success: true };
  } catch (error: any) {
    console.error("[ServerAction] Cancel Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action to Ship Order
 */
export async function shipOrderAction(orderId: string, trackingNumber: string) {
  try {
    const supabase = createAdminClient();

    // 1. Fetch Shipping Settings
    const { data: setting, error: settingsError } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'shipping')
        .single();
    
    if (settingsError) console.warn("Settings fetch failed, using default fee 30");
    const standardFee = (setting?.value as any)?.standard_fee || 30;

    // 2. Update Order Status & Actual Cost
    const { data: order, error: orderFetchError } = await supabase
        .from('orders')
        .select('order_number')
        .eq('id', orderId)
        .single();

    if (orderFetchError) throw new Error("Sipariş bilgileri alınamadı.");

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: ORDER_STATUS.SHIPPED,
        tracking_number: trackingNumber,
        shipping_cost_actual: standardFee,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    // 3. Create Finance Record
    const { error: financeError } = await supabase.from('finances').insert({
        type: 'expense',
        category: 'shipping',
        amount: standardFee,
        source: 'system_shipping',
        related_id: orderId, // AFI Link
        order_id: orderId,   // Legacy Link
        description: `Kargo Gönderimi: Sipariş #${order.order_number}`
    });

    if (financeError) {
        console.error("[ServerAction] Finance insert failed:", financeError);
    }

    revalidatePath('/admin/siparisler');
    revalidatePath(`/admin/siparisler/${orderId}`);
    return { success: true };
  } catch (error: any) {
    console.error("[ServerAction] Ship Error:", error);
    return { success: false, error: error.message };
  }
}
