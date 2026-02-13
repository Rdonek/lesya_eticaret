'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';
import { MobileNav } from './mobile-nav';
import { CookieConsent } from './cookie-consent';
import { PixelTracker } from '../marketing/pixel-tracker';
import { useSettings } from '@/hooks/use-settings';
import { createClient } from '@/lib/supabase/client';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings } = useSettings();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const supabase = createClient();
  
  const isAdminRoute = pathname.startsWith('/admin') || pathname === '/login';
  const isMaintenancePage = pathname === '/bakimda';

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAdmin(!!session);
    };
    checkAuth();
  }, [supabase]);

  React.useEffect(() => {
    if (settings) {
      const isStoreActive = settings.store_status.is_active ?? true;
      if (!isStoreActive && !isAdmin && !isAdminRoute && !isMaintenancePage) {
        router.replace('/bakimda');
      } else if (isStoreActive && isMaintenancePage) {
        router.replace('/');
      }
    }
  }, [settings, isAdmin, isAdminRoute, isMaintenancePage, router]);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  if (isMaintenancePage) {
    return <main>{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <CookieConsent />
      <PixelTracker />
    </div>
  );
}
