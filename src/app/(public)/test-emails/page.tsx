'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/providers/toast-provider';

export default function TestEmailsPage() {
  const { showToast } = useToast();
  const [lastOrderId, setLastOrderId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Note: This is a hacky way to get an ID for testing purposes only
  // In real app, this logic belongs to Admin Panel
  const triggerEmail = async (type: string) => {
    if (!lastOrderId) {
      showToast("Önce bir sipariş verin veya DB'den bir ID bulun", 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: lastOrderId, type }),
      });

      if (res.ok) {
        showToast(`${type} maili başarıyla gönderildi!`);
      } else {
        throw new Error('Gönderim başarısız');
      }
    } catch (error) {
      showToast('Hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold mb-8">E-posta Test Paneli</h1>
      <p className="mb-8 text-neutral-500">
        Kalan 3 mail tipini (Kargo, Teslimat, İptal) test etmek için sipariş ID'sini girin ve butonlara basın.
      </p>

      <div className="mb-12">
        <input 
          type="text" 
          placeholder="Sipariş ID (UUID)" 
          className="w-full p-4 rounded-xl border border-neutral-200 mb-4 font-mono text-sm"
          onChange={(e) => setLastOrderId(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Button 
          variant="secondary" 
          onClick={() => triggerEmail('shipped')}
          disabled={loading}
        >
          Kargoya Verildi
        </Button>

        <Button 
          variant="secondary" 
          onClick={() => triggerEmail('delivered')}
          disabled={loading}
        >
          Teslim Edildi
        </Button>

        <Button 
          variant="destructive" 
          onClick={() => triggerEmail('cancelled')}
          disabled={loading}
        >
          Sipariş İptal
        </Button>
      </div>

      <div className="mt-12 p-6 bg-neutral-50 rounded-2xl text-xs text-neutral-400 text-left">
        <strong>Nasıl Kullanılır?</strong>
        <ol className="list-decimal ml-4 mt-2 space-y-1">
          <li>Supabase "orders" tablosuna gidin.</li>
          <li>En son siparişin "id" değerini kopyalayın.</li>
          <li>Yukarıdaki kutuya yapıştırın ve butona basın.</li>
        </ol>
      </div>
    </div>
  );
}
