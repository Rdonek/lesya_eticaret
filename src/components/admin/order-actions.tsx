'use client';

import * as React from 'react';
import { Truck, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/providers/toast-provider';
import { useRouter } from 'next/navigation';
import { cancelOrderAction, shipOrderAction } from '@/app/actions/order';

type OrderActionsProps = {
  orderId: string;
  currentStatus: string;
  orderNumber: string;
};

export function OrderActions({ orderId, currentStatus, orderNumber }: OrderActionsProps) {
  const [trackingNumber, setTrackingNumber] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleShipOrder = async () => {
    if (!trackingNumber) {
      showToast('Lütfen takip numarası girin', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await shipOrderAction(orderId, trackingNumber);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Email notification (Non-blocking)
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, type: 'shipped' }),
      }).catch(console.error);

      showToast('Sipariş kargoya verildi.');
    } catch (error) {
      showToast('İşlem başarısız oldu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Bu siparişi iptal etmek istediğinize emin misiniz? Stoklar otomatik olarak geri yüklenecektir.')) return;

    setLoading(true);
    try {
      const result = await cancelOrderAction(orderId);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Email notification
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, type: 'cancelled' }),
      }).catch(console.error);

      showToast('Sipariş iptal edildi ve stoklar geri yüklendi.');
    } catch (error) {
      showToast('İptal işlemi başarısız', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === 'cancelled') {
    return (
        <div className="rounded-[32px] bg-red-50 p-8 border border-red-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-red-600 text-white flex items-center justify-center">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-red-900 uppercase tracking-tight">Sipariş İptal Edildi</p>
            <p className="text-xs text-red-700 opacity-80">Stoklar envantere geri iade edildi.</p>
          </div>
        </div>
      );
  }

  if (currentStatus === 'shipped') {
    return (
      <div className="rounded-[32px] bg-neutral-900 p-8 text-white flex items-center gap-4 shadow-xl shadow-neutral-900/20">
        <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
          <Truck className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="font-bold text-white uppercase tracking-tight">Sipariş Yolda</p>
          <p className="text-xs text-neutral-400">Müşteriye takip numarası iletildi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[32px] bg-white p-8 border border-neutral-100 shadow-sm space-y-6">
      <div className="flex items-center gap-3 px-1">
        <div className="h-10 w-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center">
          <Truck className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Sevkiyat Yönetimi</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 ml-1">Kargo Takip No</label>
          <Input 
            placeholder="Örn: AB123456789"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="h-12 rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200"
          />
        </div>
        
        <div className="flex flex-col gap-3 pt-2">
          <Button 
            onClick={handleShipOrder}
            disabled={loading || !trackingNumber}
            className="h-14 rounded-2xl bg-neutral-900 text-white font-bold text-sm shadow-lg shadow-neutral-900/20 hover:scale-[1.02] transition-all"
          >
            Kargola ve Tamamla
          </Button>
          <button 
            onClick={handleCancelOrder}
            disabled={loading}
            className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={12} /> Siparişi İptal Et & Stok İade
          </button>
        </div>
      </div>
    </div>
  );
}
