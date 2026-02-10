import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, MapPin, ChevronLeft, CreditCard, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';
import { createAdminClient } from '@/lib/supabase/admin';
import { CartClearer } from '@/components/cart/cart-clearer';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

type OrderPageProps = {
  params: { id: string };
  searchParams: { track?: string };
};

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const supabase = createAdminClient();
  const isTracking = searchParams.track === 'true';
  
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', params.id)
    .single();

  if (!order) return notFound();

  const statusMap: any = {
    'pending': { label: 'Ödeme Bekleniyor', color: 'text-orange-500', bg: 'bg-orange-50', icon: Clock },
    'paid': { label: 'Hazırlanıyor', color: 'text-green-600', bg: 'bg-green-50', icon: Package },
    'shipped': { label: 'Kargoya Verildi', color: 'text-blue-600', bg: 'bg-blue-50', icon: Truck },
    'delivered': { label: 'Teslim Edildi', color: 'text-neutral-900', bg: 'bg-neutral-100', icon: CheckCircle },
    'cancelled': { label: 'İptal Edildi', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
  };

  const currentStatus = statusMap[order.status] || statusMap['pending'];

  return (
    <main className="min-h-screen bg-neutral-50/50 pb-32">
      {!isTracking && <CartClearer />}
      
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 py-6 mb-8">
        <div className="mx-auto max-w-4xl px-4 flex items-center justify-between">
            <Link href={isTracking ? "/takip" : "/"} className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-neutral-900 transition-colors uppercase tracking-widest">
                <ChevronLeft size={14} /> {isTracking ? 'Geri Dön' : 'Ana Sayfa'}
            </Link>
            <div className="text-right">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Sipariş No</p>
                <p className="text-sm font-black font-mono">#{order.order_number}</p>
            </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 space-y-6">
        
        {/* Top Section: Success Message or Tracking Header */}
        {!isTracking ? (
            <div className="bg-white rounded-[32px] p-10 md:p-16 text-center border border-neutral-100 shadow-xl shadow-neutral-900/5 space-y-6">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-50 animate-in zoom-in duration-700">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900">Siparişiniz Alındı!</h1>
                    <p className="text-neutral-500 font-medium max-w-sm mx-auto leading-relaxed">
                        Teşekkür ederiz {order.customer_name.split(' ')[0]}. Siparişini aldık ve hazırlıklara başladık. Detayları aşağıda bulabilirsin.
                    </p>
                </div>
            </div>
        ) : (
            <div className={cn("rounded-[32px] p-8 md:p-12 border flex flex-col md:flex-row items-center justify-between gap-8", currentStatus.bg)}>
                <div className="flex items-center gap-6">
                    <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center bg-white shadow-sm", currentStatus.color)}>
                        <currentStatus.icon size={32} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">Şu Anki Durum</p>
                        <h2 className={cn("text-2xl font-black uppercase tracking-tight", currentStatus.color)}>{currentStatus.label}</h2>
                    </div>
                </div>
                {order.tracking_number && (
                    <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-white/50 flex-1 md:flex-none">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Takip Numarası</p>
                        <div className="flex items-center gap-3">
                            <span className="text-lg font-mono font-bold text-neutral-900 tracking-tighter">{order.tracking_number}</span>
                            <Button size="sm" variant="outline" className="h-8 rounded-lg text-[10px] font-bold px-3">Kopyala</Button>
                        </div>
                    </div>
                )}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left: Products (7/12) */}
            <div className="md:col-span-7 space-y-6">
                <div className="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-sm space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Ürünler</h3>
                    <div className="divide-y divide-neutral-50">
                        {order.order_items.map((item: any) => (
                            <div key={item.id} className="py-4 flex items-center gap-4 group">
                                <div className="h-20 w-16 rounded-xl bg-neutral-50 overflow-hidden border border-neutral-100 shrink-0">
                                    <img src={item.product_snapshot.image} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-neutral-900 truncate">{item.product_snapshot.name}</p>
                                    <p className="text-[10px] font-medium text-neutral-400 uppercase mt-1">Beden: {item.product_snapshot.size || 'STD'} | {item.quantity} Adet</p>
                                </div>
                                <p className="text-sm font-bold text-neutral-900">{formatPrice(item.unit_price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="pt-6 border-t border-neutral-50 space-y-2">
                        <div className="flex justify-between text-xs text-neutral-400">
                            <span>Ara Toplam</span>
                            <span className="font-medium text-neutral-900">{formatPrice(order.total_amount - (order.shipping_cost || 0))}</span>
                        </div>
                        <div className="flex justify-between text-xs text-neutral-400">
                            <span>Kargo</span>
                            <span className="font-medium text-neutral-900">{order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : 'Ücretsiz'}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-neutral-900 pt-2">
                            <span>TOPLAM</span>
                            <span className="text-lg tracking-tighter">{formatPrice(order.total_amount)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Info Boxes (5/12) */}
            <div className="md:col-span-5 space-y-6">
                
                {/* Shipping Address */}
                <div className="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-900">
                            <MapPin size={16} />
                        </div>
                        <h3 className="text-sm font-bold text-neutral-900">Teslimat Adresi</h3>
                    </div>
                    <div className="text-xs text-neutral-500 leading-relaxed">
                        <p className="font-bold text-neutral-900 mb-1">{order.customer_name}</p>
                        <p>{order.address_line}</p>
                        <p>{order.city} / Türkiye</p>
                        <p className="mt-2 text-neutral-400">{order.phone}</p>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-900">
                            <CreditCard size={16} />
                        </div>
                        <h3 className="text-sm font-bold text-neutral-900">Ödeme Bilgisi</h3>
                    </div>
                    <div className="text-xs text-neutral-500 leading-relaxed">
                        <p className="flex justify-between items-center">
                            <span>Yöntem</span>
                            <span className="font-bold text-neutral-900 uppercase">Kredi Kartı</span>
                        </p>
                        <p className="flex justify-between items-center mt-2">
                            <span>Tarih</span>
                            <span className="font-medium">{new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </p>
                    </div>
                </div>

            </div>

        </div>

        <div className="text-center pt-8">
            <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest mb-4">Bir sorunuz mu var?</p>
            <Link href="mailto:hello@lesyastudio.com">
                <Button variant="ghost" className="text-xs font-bold text-neutral-400 hover:text-neutral-900 uppercase tracking-widest transition-all">
                    Destek Ekibine Yaz
                </Button>
            </Link>
        </div>

      </div>
    </main>
  );
}