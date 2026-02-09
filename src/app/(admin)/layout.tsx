'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, Tag, Settings, LogOut, Loader2, Wallet, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminBottomNav } from '@/components/admin/bottom-nav';
import { createClient } from '@/lib/supabase/client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = React.useState(true);
  
  const isLoginPage = pathname === '/login';

  // Auth Protection
  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !isLoginPage) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [supabase, isLoginPage, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const sidebarLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Siparişler', href: '/admin/siparisler', icon: Package },
    { name: 'Katalog', href: '/admin/urunler', icon: Tag },
    { name: 'Finans', href: '/admin/finans', icon: Wallet },
    { name: 'Müşteriler', href: '/admin/musteriler', icon: Users },
    { name: 'Ayarlar', href: '/admin/ayarlar', icon: Settings },
  ];

  if (isLoginPage) return <>{children}</>;
  
  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <Loader2 className="h-8 w-8 animate-spin text-neutral-200" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-neutral-200 bg-white md:flex">
        <div className="p-6">
          <Link href="/admin" className="text-xl font-black tracking-tighter italic">
            LESYA <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400 not-italic">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all",
                  isActive 
                    ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/20" 
                    : "text-neutral-500 hover:bg-neutral-100"
                )}
              >
                <Icon className="h-5 w-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4">
          <button 
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0"> 
        <div className="flex-1 p-4 pb-24 md:p-10 md:pb-10">
          <div className="mx-auto max-w-5xl w-full">
            {children}
          </div>
        </div>
      </main>

      <AdminBottomNav />
    </div>
  );
}