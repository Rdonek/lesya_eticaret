import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { settingsService } from '@/lib/services/settings-service';
import { ORDER_STATUS } from '@/lib/constants/order-status';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cartItems, customer, checkoutId } = body;
    
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Sepet boş' }, { status: 400 });
    }
    if (!customer) {
      return NextResponse.json({ error: 'Müşteri bilgileri eksik' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. FINAL PRICE & STOCK VERIFICATION (Server-side Only)
    let calculatedSubtotal = 0;
    const verifiedItems: any[] = [];
    
    for (const item of cartItems) {
      const { data: variant, error } = await supabase
        .from('product_variants')
        .select('stock, reserved_stock, price, cost_price, product_id, products(name, base_price)')
        .eq('id', item.variantId)
        .single();

      if (error || !variant) {
        return NextResponse.json({ error: `${item.name} ürünü bulunamadı.` }, { status: 400 });
      }

      const availableStock = variant.stock - variant.reserved_stock;
      if (availableStock < item.quantity) {
        return NextResponse.json({ error: `${item.name} için yeterli stok yok. (Kalan: ${availableStock})` }, { status: 400 });
      }

      // CRITICAL: Always use the latest price from the database, ignore client price
      const productData = Array.isArray(variant.products) ? variant.products[0] : variant.products;
      const currentPrice = variant.price || (productData as any).base_price;
      const verifiedUnitPrice = Number(currentPrice);
      calculatedSubtotal += verifiedUnitPrice * item.quantity;

      // Keep track of verified data for next steps
      verifiedItems.push({
        ...item,
        verifiedPrice: verifiedUnitPrice,
        costPrice: Number(variant.cost_price || 0),
        productName: (variant.products as any).name
      });
    }

    // Get Dynamic Settings
    const settings = await settingsService.getAll();
    const { free_threshold, standard_fee } = settings.shipping;

    const shippingCost = calculatedSubtotal >= free_threshold ? 0 : standard_fee;
    const totalAmount = calculatedSubtotal + shippingCost;

    // 2. Create Order
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
    const mockPaymentId = `mock_pay_${Date.now()}`;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address_line: customer.address,
        city: customer.city,
        postal_code: customer.postalCode,
        subtotal: calculatedSubtotal,
        shipping_cost: shippingCost,
        total_amount: totalAmount,
        status: ORDER_STATUS.PENDING,
        payment_id: mockPaymentId,
        checkout_id: checkoutId // Store for Meta CAPI
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation failed:', orderError);
      throw new Error('Sipariş oluşturulamadı');
    }

    // 3. Create Items & Reserve Stock
    for (const item of verifiedItems) {
      // Use verifiedPrice instead of browser price
      await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_variant_id: item.variantId,
          quantity: item.quantity,
          unit_price: item.verifiedPrice,
          product_snapshot: { ...item, price: item.verifiedPrice, cost_price: item.costPrice } 
        });

      // Reserve Stock
      await supabase.rpc('increment_reserved_stock', {
        variant_id: item.variantId,
        qty: item.quantity
      });
    }

    return NextResponse.json({ 
      paymentUrl: `/odeme/test?orderId=${order.id}` 
    });

  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu.' }, { status: 500 });
  }
}