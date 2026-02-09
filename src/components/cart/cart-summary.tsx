'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils/format';
import { useSettings } from '@/hooks/use-settings';

type CartSummaryProps = {
  subtotal: number;
  onCheckout?: () => void;
};

export function CartSummary({ subtotal, onCheckout }: CartSummaryProps) {
  const { settings, loading } = useSettings();
  
  // Defaults while loading or if error
  const freeThreshold = settings?.shipping.free_threshold ?? 500;
  const shippingFee = settings?.shipping.standard_fee ?? 30;

  const shipping = subtotal >= freeThreshold ? 0 : shippingFee;
  const total = subtotal + shipping;

  if (loading) return <div className="h-48 animate-pulse rounded-2xl bg-neutral-100" />;

  return (
    <div className="rounded-2xl bg-white p-8 shadow-bento border border-neutral-100">
      <h2 className="text-xl font-bold text-neutral-900">Sipariş Özeti</h2>
      
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <span>Ara Toplam</span>
          <span className="font-medium text-neutral-900">{formatPrice(subtotal)}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <span>Kargo</span>
          <span className="font-medium text-neutral-900">
            {shipping === 0 ? (
              <span className="text-green-600">Ücretsiz</span>
            ) : (
              formatPrice(shipping)
            )}
          </span>
        </div>

        {shipping > 0 && (
          <p className="text-xs text-neutral-500">
            {formatPrice(freeThreshold - subtotal)} daha ekleyin, kargo bedava olsun!
          </p>
        )}

        <div className="border-t border-neutral-200 pt-4">
          <div className="flex items-center justify-between text-base font-bold text-neutral-900">
            <span>Toplam</span>
            <span>{formatPrice(total)}</span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">KDV dahildir</p>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={onCheckout}
        className="mt-8 w-full"
        disabled={subtotal === 0}
      >
        Ödemeye Geç
      </Button>
    </div>
  );
}
