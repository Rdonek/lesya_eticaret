'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';
import { ShoppingBag, Loader2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, updateItems, getTotal } = useCartStore();
  const [mounted, setMounted] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);
  const supabase = createClient();

  const syncPrices = React.useCallback(async () => {
    if (items.length === 0) return;
    
    setSyncing(true);
    try {
      const productIds = items.map(item => item.productId);
      const { data: latestProducts, error } = await supabase
        .from('products')
        .select('id, base_price')
        .in('id', productIds);

      if (error) throw error;

      if (latestProducts) {
        let hasChanged = false;
        const updatedItems = items.map(cartItem => {
          const latest = latestProducts.find(p => p.id === cartItem.productId);
          if (latest && latest.base_price !== cartItem.price) {
            hasChanged = true;
            return { ...cartItem, price: latest.base_price };
          }
          return cartItem;
        });

        if (hasChanged) {
          updateItems(updatedItems);
        }
      }
    } catch (err) {
      console.error('Price sync failed:', err);
    } finally {
      setSyncing(false);
    }
  }, [items, supabase, updateItems]);

  React.useEffect(() => {
    setMounted(true);
    syncPrices();
  }, [syncPrices]);

  if (!mounted) return null;

  const subtotal = getTotal();

  const handleCheckout = () => {
    router.push(ROUTES.CHECKOUT);
  };

  return (
    <main className="min-h-screen bg-white pb-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 pt-12 md:pt-20">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic text-neutral-900">Alışveriş Sepeti</h1>
          {syncing && (
            <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-bold uppercase tracking-widest animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" />
              Güncelleniyor
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 rounded-[48px] bg-neutral-50 border border-neutral-100 border-dashed text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg shadow-neutral-200/50 mb-8">
              <ShoppingBag className="h-8 w-8 text-neutral-300" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">Sepetin Boş</h2>
            <p className="mt-4 text-sm text-neutral-500 max-w-xs font-medium leading-relaxed">
                Henüz bir şey eklemedin. Yeni sezon parçalarına göz atmaya ne dersin?
            </p>
            <Link href={ROUTES.PRODUCTS} className="mt-10 group">
              <Button size="lg" className="rounded-full px-10 h-14 bg-neutral-900 text-white font-bold uppercase tracking-widest text-xs hover:bg-neutral-800 hover:scale-105 transition-all">
                Koleksiyonu Keşfet
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            {/* Cart Items List (8/12) */}
            <div className="lg:col-span-8">
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.variantId} className="group relative bg-white transition-all hover:bg-neutral-50 p-6 rounded-[32px] border border-neutral-100">
                    <CartItem
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeItem}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <Link href={ROUTES.PRODUCTS} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors">
                    <ArrowLeft size={14} />
                    Alışverişe Devam Et
                </Link>
              </div>
            </div>

            {/* Order Summary (4/12) */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 p-8 rounded-[40px] bg-neutral-50 border border-neutral-100">
                <h3 className="text-xl font-black uppercase tracking-tight text-neutral-900 mb-8">Sipariş Özeti</h3>
                <CartSummary 
                  subtotal={subtotal} 
                  onCheckout={handleCheckout}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}