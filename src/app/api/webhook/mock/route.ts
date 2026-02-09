import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ORDER_STATUS } from '@/lib/constants/order-status';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, success } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (success) {
      // 1. PAYMENT SUCCESS
      
      // Update Order Status -> PAID
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: ORDER_STATUS.PAID,
          payment_id: `pay_${Date.now()}_success` // Simulate real payment ID
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Log Status Change
      await supabase.from('order_logs').insert({
        order_id: orderId,
        old_status: ORDER_STATUS.PENDING,
        new_status: ORDER_STATUS.PAID,
        note: 'Mock payment successful'
      });

      // PERMANENT STOCK DECREASE
      const { data: items } = await supabase
        .from('order_items')
        .select('product_variant_id, quantity')
        .eq('order_id', orderId);

      if (items) {
        for (const item of items) {
          // Try to decrement stock and reserved_stock via RPC
          const { error: rpcError } = await supabase.rpc('confirm_stock_deduction', {
            variant_id: item.product_variant_id,
            qty: item.quantity
          });

          // Only use fallback if RPC failed (e.g., function not found)
          if (rpcError) {
            console.warn('RPC failed, using fallback stock update:', rpcError);
            
            const { data: variant } = await supabase
              .from('product_variants')
              .select('stock, reserved_stock')
              .eq('id', item.product_variant_id)
              .single();

            if (variant) {
              await supabase
                .from('product_variants')
                .update({
                  stock: variant.stock - item.quantity,
                  reserved_stock: variant.reserved_stock - item.quantity
                })
                .eq('id', item.product_variant_id);
            }
          }
        }
      }

      // Trigger Confirmation Email
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        await fetch(`${baseUrl}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, type: 'confirmation' }),
        });
        console.log('Email trigger sent for order:', orderId);
      } catch (e) {
        console.error('Failed to trigger email:', e);
      }

    } else {
      // 2. PAYMENT FAILED / CANCELLED

      // Update Order Status -> CANCELLED
      await supabase
        .from('orders')
        .update({ 
          status: ORDER_STATUS.CANCELLED,
          cancelled_reason: 'Mock payment failed by user'
        })
        .eq('id', orderId);

      // Log Status Change
      await supabase.from('order_logs').insert({
        order_id: orderId,
        old_status: ORDER_STATUS.PENDING,
        new_status: ORDER_STATUS.CANCELLED,
        note: 'Mock payment failed'
      });

      // RELEASE RESERVED STOCK
      const { data: items } = await supabase
        .from('order_items')
        .select('product_variant_id, quantity')
        .eq('order_id', orderId);

      if (items) {
        for (const item of items) {
          const { data: variant } = await supabase
            .from('product_variants')
            .select('reserved_stock')
            .eq('id', item.product_variant_id)
            .single();

          if (variant) {
             await supabase
              .from('product_variants')
              .update({
                reserved_stock: Math.max(0, variant.reserved_stock - item.quantity)
              })
              .eq('id', item.product_variant_id);
          }
        }
      }

      // Trigger Payment Failed Email
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        await fetch(`${baseUrl}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, type: 'payment_failed' }),
        });
      } catch (e) {
        console.error('Failed to trigger failed payment email:', e);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Mock webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}