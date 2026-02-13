'use client';

import * as React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils/format';
import type { CartItem as CartItemType } from '@/types/cart';

type CartItemProps = {
  item: CartItemType;
  onUpdateQuantity: (variantId: string, quantity: number) => void;
  onRemove: (variantId: string) => void;
};

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const handleIncrease = () => {
    onUpdateQuantity(item.variantId, item.quantity + 1);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.variantId, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    onRemove(item.variantId);
  };

  return (
    <div className="flex items-start gap-4 py-6 md:gap-6">
      {/* Product Image Placeholder */}
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100 border border-neutral-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
            Resim Yok
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col h-24 justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-bold text-neutral-900 line-clamp-1">
              {item.name}
            </h3>
            {(item.size || item.color) && (
              <p className="mt-1 text-sm text-neutral-500">
                {item.size && <span>{item.size}</span>}
                {item.size && item.color && <span className="mx-2 text-neutral-300">|</span>}
                {item.color && <span>{item.color}</span>}
              </p>
            )}
          </div>
          <p className="text-base font-bold text-neutral-900">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center h-9 rounded-lg border border-neutral-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={handleDecrease}
              className="h-full px-3 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 transition-colors"
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-neutral-900">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              className="h-full px-3 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 transition-colors"
              disabled={item.quantity >= item.stock}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="group flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">Kaldır</span>
          </button>
        </div>
      </div>
    </div>
  );
}
