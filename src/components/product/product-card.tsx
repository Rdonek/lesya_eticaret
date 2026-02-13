'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShoppingBag, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';
import { useCartStore } from '@/store/cart-store';
import { useToast } from '@/providers/toast-provider';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: any; 
};

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

export function ProductCard({ product }: ProductCardProps) {
  const [showSizePicker, setShowSizePicker] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { addItem } = useCartStore();
  const { showToast } = useToast();

  const variants = product.variants || [];
  
  const sortedVariants = [...variants].sort((a, b) => {
    const indexA = SIZE_ORDER.indexOf(a.size?.toUpperCase());
    const indexB = SIZE_ORDER.indexOf(b.size?.toUpperCase());
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (sortedVariants.length > 0) {
      setShowSizePicker(true);
    } else {
      addToCart(product.originalId || product.id);
    }
  };

  const handleSizeSelect = (e: React.MouseEvent, variantId: string, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(variantId, size);
    setShowSizePicker(false);
  };

  const addToCart = (variantId: string, size?: string) => {
    setLoading(true);
    
    // Find the variant to get its stock
    const variant = sortedVariants.find(v => v.id === variantId) || sortedVariants[0];
    const availableStock = variant ? (variant.stock - variant.reserved_stock) : 99;

    addItem({
      variantId: variantId,
      productId: product.originalId || product.id,
      name: product.name,
      price: product.price || product.base_price,
      quantity: 1,
      image: product.image,
      size: size,
      color: product.displayColor,
      stock: availableStock
    });

    setTimeout(() => {
      setLoading(false);
      showToast(`${product.name} ${size ? `(${size})` : ''} sepete eklendi`);
    }, 300);
  };

  const price = formatPrice(product.price || product.base_price);
  const detailUrl = `/urunler/${product.slug}?renk=${encodeURIComponent(product.displayColor || '')}`;

  return (
    <div className="group relative block w-full">
      <Link href={detailUrl} className="block w-full">
        <div className="flex flex-col overflow-hidden bg-inherit border-inherit transition-all duration-500">
          
          <div className="relative aspect-[3/4.2] w-full overflow-hidden rounded-[20px] md:rounded-[32px] bg-neutral-100 shadow-sm border border-neutral-100/50">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-300 font-black tracking-widest uppercase">LESYA STUDIO</div>
            )}
            
            <button
              onClick={handleQuickAddClick}
              disabled={loading}
              className="absolute bottom-3 right-3 h-8 w-8 md:h-12 md:w-12 flex items-center justify-center rounded-full bg-white text-neutral-900 shadow-xl active:scale-90 transition-all md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
            >
              <ShoppingBag size={14} strokeWidth={2.5} className="md:size-20" />
            </button>
          </div>

          <div className="py-3 px-0.5 space-y-1">
            <div className="flex flex-col gap-0.5">
                <h3 className="text-[11px] md:text-sm font-bold text-neutral-900 truncate uppercase tracking-tight">
                    {product.name}
                </h3>
                <div className="flex items-center justify-between">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400">
                        {product.displayColor || 'Standart'}
                    </p>
                    <span className="text-[11px] md:text-sm font-black text-neutral-900 tracking-tighter">
                        {price}
                    </span>
                </div>
            </div>
          </div>
        </div>
      </Link>

      {showSizePicker && (
        <div className="fixed inset-0 z-[110] flex flex-col justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowSizePicker(false)}>
          <div className="w-full bg-white p-6 pb-12 rounded-t-[40px] shadow-2xl slide-in-from-bottom-full animate-in duration-500 max-w-[600px] mx-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Beden Seçimi</span>
              <button onClick={() => setShowSizePicker(false)} className="h-10 w-10 flex items-center justify-center rounded-full bg-neutral-50 active:scale-90 transition-transform"><X size={20} className="text-neutral-400" /></button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {sortedVariants.map((v: any) => {
                const isAvailable = (v.stock - v.reserved_stock) > 0;
                return (
                  <button key={v.id} disabled={!isAvailable} onClick={(e) => isAvailable && handleSizeSelect(e, v.id, v.size)} className={cn("flex h-14 items-center justify-center rounded-2xl border text-xs font-black transition-all", isAvailable ? "border-neutral-200 bg-white text-neutral-900 active:bg-neutral-900 active:text-white" : "bg-neutral-50 text-neutral-300 border-neutral-100 line-through cursor-not-allowed")}>
                    {v.size}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}