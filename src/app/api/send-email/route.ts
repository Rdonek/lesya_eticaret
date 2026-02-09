import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { emailService } from '@/lib/services/email-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, type } = body;

    if (!orderId || !type) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          unit_price,
          product_snapshot
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let result;
    switch (type) {
      case 'confirmation':
        result = await emailService.sendOrderConfirmation(order);
        break;
      case 'payment_failed':
        result = await emailService.sendPaymentFailed(order);
        break;
      case 'shipped':
        result = await emailService.sendShippingUpdate(order);
        break;
      case 'delivered':
        result = await emailService.sendOrderDelivered(order);
        break;
      case 'cancelled':
        result = await emailService.sendOrderCancelled(order);
        break;
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });

  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json({ error: 'Email sending failed' }, { status: 500 });
  }
}
