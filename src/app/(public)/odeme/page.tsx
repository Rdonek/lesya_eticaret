'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { CartSummary } from '@/components/cart/cart-summary';
import type { CheckoutFormData } from '@/schemas/checkout-schema';
import { ROUTES } from '@/lib/constants/routes';
import { useToast } from '@/providers/toast-provider';
import { ShieldCheck, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal } = useCartStore();
  const { showToast } = useToast();
  const [mounted, setMounted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted && items.length === 0) {
      router.push(ROUTES.CART);
    }
  }, [mounted, items, router]);

  if (!mounted || items.length === 0) return null;

  const subtotal = getTotal();

  const handleCheckoutSubmit = async (data: CheckoutFormData & { checkoutId: string }) => {
    setIsSubmitting(true);
    try {
      const payload = {
        cartItems: items,
        customer: data,
        checkoutId: data.checkoutId // CRITICAL: Link browser session to server purchase
      };

      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ödeme başlatılamadı');
      }

      router.push(result.paymentUrl);
      
    } catch (error) {
      console.error('Checkout error:', error);
      showToast(error instanceof Error ? error.message : 'Bir hata oluştu.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-neutral-50/50 min-h-screen pb-32">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8 pt-10 md:pt-16">
        
        {/* Secure Header */}
        <div className="flex flex-col items-center justify-center mb-12 space-y-2">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-neutral-900">Güvenli Ödeme</h1>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <Lock size={12} />
                256-Bit SSL Secured
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Left: Form (7/12) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-[32px] border border-neutral-100 bg-white p-6 md:p-10 shadow-sm">
              <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white text-xs">1</span>
                Teslimat & İletişim
              </h2>
              <CheckoutForm 
                onSubmit={handleCheckoutSubmit} 
                isSubmitting={isSubmitting} 
              />
            </div>
            
            {/* Payment Method Placeholder */}
            <div className="rounded-[32px] border border-neutral-100 bg-white p-6 md:p-10 shadow-sm opacity-60">
                <h2 className="text-lg font-bold text-neutral-900 mb-2 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-neutral-500 text-xs">2</span>
                    Ödeme Yöntemi
                </h2>
                <p className="text-xs text-neutral-400 pl-8">Adres bilgilerini girdikten sonra iyzico ile güvenli ödeme ekranına yönlendirileceksiniz.</p>
            </div>
          </div>

          {/* Right: Summary (5/12) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-[32px] bg-white p-8 border border-neutral-100 shadow-xl shadow-neutral-900/5">
                <h3 className="text-lg font-bold text-neutral-900 mb-6">Sipariş Özeti</h3>
                {/* Disable checkout button in summary since form handles it */}
                <div className="pointer-events-none [&>button]:hidden">
                  <CartSummary subtotal={subtotal} />
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-neutral-100 shadow-sm">
                <ShieldCheck className="text-green-600 shrink-0" size={24} />
                <div className="text-xs text-neutral-500">
                    <strong className="text-neutral-900 block mb-0.5">Müşteri Koruması</strong>
                    Bilgileriniz 3. şahıslarla asla paylaşılmaz. %100 güvenli alışveriş garantisi.
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}