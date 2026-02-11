'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';
import { MobileNav } from './mobile-nav';
import { useSettings } from '@/hooks/use-settings';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, loading: settingsLoading } = useSettings();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [authLoading, setAuthLoading] = React.useState(true);
  const supabase = createClient();
  
  // Define routes where we don't want the public header/footer
  const isAdminRoute = pathname.startsWith('/admin') || pathname === '/login';
  const isMaintenancePage = pathname === '/bakimda';

  // Check if current user is an admin (authenticated)
  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAdmin(!!session);
      setAuthLoading(false);
    };
    checkAuth();
  }, [supabase]);

  // Handle Maintenance Mode Redirection
  React.useEffect(() => {
    if (!settingsLoading && !authLoading) {
      const isStoreActive = settings?.store_status.is_active ?? true;
      
      if (!isStoreActive && !isAdmin && !isAdminRoute && !isMaintenancePage) {
        router.replace('/bakimda');
      } else if (isStoreActive && isMaintenancePage) {
        router.replace('/');
      }
    }
  }, [settings, isAdmin, isAdminRoute, isMaintenancePage, settingsLoading, authLoading, router]);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  // If in maintenance mode and NOT an admin, only show the maintenance page content
  if (isMaintenancePage) {
    return <main className="flex-grow">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-grow min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}