import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { emailService } from '@/lib/services/email-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, type, email } = body;

    if (!type) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Special case for forgot_order_number
    if (type === 'forgot_order_number' && email) {
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('order_number, total_amount, created_at, status')
            .eq('email', email.toLowerCase().trim())
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (ordersError || !orders || orders.length === 0) {
            return NextResponse.json({ error: 'No orders found' }, { status: 404 });
        }

        await emailService.sendForgotOrderNumbers(email, orders);
        return NextResponse.json({ success: true });
    }

    if (!orderId) {
        return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

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
