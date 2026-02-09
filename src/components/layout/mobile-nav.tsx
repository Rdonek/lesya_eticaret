'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const pathname = usePathname();
  const { items } = useCartStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);

  const links = [
    { name: 'Anasayfa', href: ROUTES.HOME, icon: Home },
    { name: 'Ürünler', href: ROUTES.PRODUCTS, icon: Search },
    { name: 'Sepetim', href: ROUTES.CART, icon: ShoppingBag, badge: cartItemsCount },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full border-t border-neutral-100 bg-white pb-safe md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 p-2 text-xs font-medium transition-colors",
                isActive ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-6 w-6", isActive && "fill-current")} />
                {mounted && link.badge !== undefined && link.badge > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white ring-2 ring-white">
                    {link.badge}
                  </span>
                )}
              </div>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
