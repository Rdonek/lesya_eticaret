import * as React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils/format';
import { ORDER_STATUS } from '@/lib/constants/order-status';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { OrderActions } from '@/components/admin/order-actions';
import { 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  Truck, 
  ChevronLeft,
  Clock
} from 'lucide-react';
import Link from 'next/link';

type OrderDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const supabase = createClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', params.id)
    .single();

  if (error || !order) {
    return notFound();
  }

  const isPaid = order.status === ORDER_STATUS.PAID;
  const isShipped = order.status === 'shipped';

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div className="flex items-center gap-4">
          <Link href="/admin/siparisler">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-neutral-100 shadow-sm hover:bg-neutral-50 transition-colors text-neutral-400 hover:text-neutral-900">
              <ChevronLeft className="h-5 w-5" />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Sipariş Detayı</h1>
            <p className="text-sm font-medium text-neutral-400 uppercase tracking-widest mt-0.5">#{order.order_number}</p>
          </div>
        </div>
        <div className={cn(
          "px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest border",
          isPaid ? "bg-green-50 text-green-700 border-green-100" :
          isShipped ? "bg-blue-50 text-blue-700 border-blue-100" :
          "bg-neutral-50 text-neutral-500 border-neutral-100"
        )}>
          {order.status === 'paid' ? 'Ödendi' : order.status}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Customer & Shipping (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Customer Info Widget */}
          <div className="rounded-[32px] bg-white p-8 border border-neutral-100 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-900">
                <User className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-neutral-900">Müşteri Bilgileri</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Ad Soyad</p>
                    <p className="text-sm font-semibold text-neutral-900 mt-1">{order.customer_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">E-posta</p>
                    <p className="text-sm font-semibold text-neutral-900 mt-1">{order.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Telefon</p>
                    <p className="text-sm font-semibold text-neutral-900 mt-1">{order.phone}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Teslimat Adresi</p>
                  <p className="text-sm font-semibold text-neutral-900 mt-1 leading-relaxed">
                    {order.address_line}<br />
                    {order.city} {order.postal_code && `(${order.postal_code})`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ordered Items List */}
          <div className="rounded-[32px] bg-white p-8 border border-neutral-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-900">
                <Package className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-neutral-900">Sipariş İçeriği</h2>
            </div>

            <div className="divide-y divide-neutral-50">
              {order.order_items.map((item: any) => (
                <div key={item.id} className="py-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={item.product_snapshot.image} 
                      alt="Product" 
                      className="h-16 w-12 object-cover rounded-xl bg-neutral-50"
                    />
                    <div>
                      <p className="font-bold text-neutral-900">{item.product_snapshot.name}</p>
                      <p className="text-xs font-medium text-neutral-400">
                        Beden: {item.product_snapshot.size || '-'} • Adet: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-neutral-900">{formatPrice(item.unit_price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Payment & Timeline (1/3) */}
        <div className="space-y-8">
          
          {/* Quick Actions */}
          <OrderActions 
            orderId={order.id} 
            currentStatus={order.status} 
            orderNumber={order.order_number} 
          />

          {/* Payment Summary */}
          <div className="rounded-[32px] bg-neutral-900 p-8 text-white shadow-xl shadow-neutral-900/20">
            <div className="flex items-center gap-3 mb-8">
              <CreditCard className="h-5 w-5 text-neutral-400" />
              <h2 className="text-lg font-bold">Ödeme Özeti</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm opacity-60">
                <span>Ara Toplam</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm opacity-60">
                <span>Kargo</span>
                <span>{order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : 'Ücretsiz'}</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <span className="text-xs font-bold uppercase tracking-widest opacity-40">Toplam</span>
                <span className="text-2xl font-bold tracking-tight">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="rounded-[32px] bg-white p-8 border border-neutral-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Clock className="h-5 w-5 text-neutral-400" />
              <h2 className="text-lg font-bold text-neutral-900">Zaman Tüneli</h2>
            </div>
            <div className="space-y-6">
              <div className="relative pl-6 border-l-2 border-neutral-100">
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-neutral-900" />
                <p className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Sipariş Alındı</p>
                <p className="text-xs text-neutral-400 mt-1">{new Date(order.created_at).toLocaleString('tr-TR')}</p>
              </div>
              {isShipped && (
                <div className="relative pl-6 border-l-2 border-neutral-100">
                  <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-green-500" />
                  <p className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Kargoya Verildi</p>
                  <p className="text-xs text-neutral-400 mt-1">{new Date(order.updated_at).toLocaleString('tr-TR')}</p>
                  <div className="mt-2 p-3 rounded-xl bg-neutral-50 text-[10px] font-mono text-neutral-600 break-all">
                    Takip No: {order.tracking_number}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
