'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Instagram, Search, Menu, Package } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const { items } = useCartStore();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header
      className={cn(
        'sticky top-0 z-[100] w-full transition-all duration-500 ease-in-out',
        isScrolled 
          ? 'bg-white/70 backdrop-blur-xl py-3 border-b border-neutral-100 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)]' 
          : 'bg-white py-5 border-b border-transparent'
      )}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 md:px-10">
        
        {/* Left: Desktop Navigation (Hidden on Mobile) */}
        <div className="flex-1 hidden md:flex items-center gap-6">
            <Link 
                href={ROUTES.PRODUCTS}
                className={cn(
                    "text-[11px] font-black uppercase tracking-[0.2em] transition-colors hover:text-neutral-500",
                    pathname === ROUTES.PRODUCTS ? "text-neutral-900 underline underline-offset-8 decoration-2" : "text-neutral-400"
                )}
            >
                Koleksiyon
            </Link>
        </div>

        {/* Mobile Left Spacer (to keep logo centered) */}
        <div className="flex-1 md:hidden" />

        {/* Center: Logo */}
        <Link href={ROUTES.HOME} className="flex shrink-0 items-center justify-center transition-transform hover:scale-[1.02] active:scale-95 duration-300">
          <img src="/logo.svg" alt="LESYA" className={cn("transition-all duration-500", isScrolled ? "h-5 md:h-6" : "h-7 md:h-10")} />
        </Link>

        {/* Right: Icons */}
        <div className="flex-1 flex items-center justify-end gap-0.5 md:gap-3">
          <Link 
            href="/takip"
            className={cn(
                "p-2 transition-all hover:scale-110",
                pathname === "/takip" ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-900"
            )}
            title="Sipariş Takibi"
          >
            <Package strokeWidth={2} className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
          </Link>

          <a 
            href="https://www.instagram.com/studio.lesya" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 text-neutral-900 transition-all hover:text-neutral-400 hover:scale-110"
          >
            <Instagram strokeWidth={2} className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
          </a>

          <Link href={ROUTES.CART} className="group relative p-2">
            <ShoppingBag strokeWidth={2} className="text-neutral-900 transition-transform group-hover:scale-110 w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
            {mounted && cartItemsCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-neutral-900 text-[8px] font-black text-white shadow-sm">
                {cartItemsCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}