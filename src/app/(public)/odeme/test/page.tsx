'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';
import { useToast } from '@/providers/toast-provider';

function PaymentContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [processing, setProcessing] = React.useState(false);

  if (!orderId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-red-500 font-bold">Geçersiz işlem: Order ID eksik.</p>
      </div>
    );
  }

  const handlePayment = async (success: boolean) => {
    setProcessing(true);
    try {
      const response = await fetch('/api/webhook/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, success }),
      });

      if (!response.ok) throw new Error('Sistem hatası oluştu.');

      if (success) {
        showToast('Ödeme Başarılı! Siparişiniz onaylandı.');
        router.push(ROUTES.ORDER_SUCCESS(orderId));
      } else {
        showToast('Ödeme Reddedildi! Sepetinize geri dönüyorsunuz.', 'error');
        router.push(ROUTES.CART);
      }
    } catch (error) {
      console.error('Payment simulation error:', error);
      showToast('İşlem sırasında bir hata oluştu.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-neutral-50">
      <div className="max-w-md w-full rounded-[32px] bg-white p-10 text-center shadow-bento border border-neutral-100 animate-in fade-in zoom-in duration-500">
        <h1 className="text-2xl font-bold mb-2 text-neutral-900">Iyzico Ödeme Simülasyonu</h1>
        <p className="text-sm text-neutral-500 mb-8 font-medium">
          Sipariş No: <span className="font-mono bg-neutral-100 px-2 py-1 rounded text-neutral-900">{orderId.slice(0, 8)}...</span>
        </p>
        
        <div className="space-y-4">
          <Button 
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white h-14 rounded-2xl font-bold shadow-lg shadow-neutral-900/20 transition-all active:scale-95"
            onClick={() => handlePayment(true)}
            disabled={processing}
          >
            {processing ? 'Onaylanıyor...' : 'Kartla Öde (Başarılı)'}
          </Button>

          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl font-bold border-neutral-200 text-neutral-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all active:scale-95"
            onClick={() => handlePayment(false)}
            disabled={processing}
          >
            {processing ? 'İptal Ediliyor...' : 'Ödemeyi İptal Et'}
          </Button>
        </div>

        <div className="mt-10 pt-8 border-t border-neutral-50">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-300 font-bold">
            GÜVENLİ TEST ORTAMI
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MockPaymentPage() {
  return (
    <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-neutral-50 font-bold uppercase tracking-widest text-xs text-neutral-400">Yükleniyor...</div>}>
      <PaymentContent />
    </React.Suspense>
  );
}