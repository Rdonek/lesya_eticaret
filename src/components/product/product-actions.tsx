'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { useToast } from '@/providers/toast-provider';
import { cn } from '@/lib/utils';

type Variant = {
  id: string;
  size: string | null;
  color: string | null;
  stock: number;
  reserved_stock: number;
};

type ProductActionsProps = {
  product: any; // Using any to accommodate the joined structure
  variants: Variant[];
};

export function ProductActions({ product, variants }: ProductActionsProps) {
  // Get unique sizes and sort them (S, M, L logic is tricky without explicit order, so alpha sort for now)
  const sizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean))).sort();
  
  const [selectedSize, setSelectedSize] = React.useState<string | null>(
    sizes.length === 1 ? sizes[0] : null // Auto-select if only 1 size
  );
  
  const [loading, setLoading] = React.useState(false);
  const { addItem } = useCartStore();
  const { showToast } = useToast();

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      showToast('Lütfen bir beden seçiniz', 'error');
      return;
    }

    // Find the specific variant based on selection
    const selectedVariant = variants.find(v => v.size === selectedSize) || variants[0]; // Fallback to first if no size logic

    if (!selectedVariant) return;

    setLoading(true);
    
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      price: product.base_price, // Ideally variant price
      quantity: 1,
      image: product.product_images?.[0]?.url,
      size: selectedSize,
    });

    setTimeout(() => {
      setLoading(false);
      showToast('Ürün sepete eklendi');
    }, 300);
  };

  return (
    <div className="space-y-8">
      {/* Size Selector */}
      {sizes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-neutral-900">Beden</span>
            <button className="text-neutral-500 underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-neutral-900">
              Beden Tablosu
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {sizes.map((size) => {
              const variant = variants.find(v => v.size === size);
              const isOutOfStock = variant ? (variant.stock - variant.reserved_stock) <= 0 : true;

              return (
                <button
                  key={size as string}
                  onClick={() => !isOutOfStock && setSelectedSize(size as string)}
                  disabled={isOutOfStock}
                  className={cn(
                    "flex h-12 min-w-[48px] items-center justify-center rounded-lg border px-4 text-sm font-medium transition-all",
                    selectedSize === size
                      ? "border-neutral-900 bg-neutral-900 text-white shadow-md"
                      : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-900",
                    isOutOfStock && "cursor-not-allowed bg-neutral-50 text-neutral-300 decoration-slice line-through"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex gap-4">
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleAddToCart}
          disabled={loading}
          className="h-14 w-full flex-1 rounded-full text-base font-semibold shadow-xl shadow-neutral-200/50 transition-transform active:scale-[0.98]"
        >
          {loading ? 'Ekleniyor...' : 'Sepete Ekle'}
        </Button>
        
        {/* Wishlist Button (Future) */}
        <button className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 transition-colors hover:bg-neutral-50">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </button>
      </div>
    </div>
  );
}
