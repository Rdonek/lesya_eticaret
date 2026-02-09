'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  Settings, 
  Users, 
  Wallet,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminBottomNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Core tabs always visible
  const coreLinks = [
    { name: 'Panel', href: '/admin', icon: LayoutDashboard },
    { name: 'Sipariş', href: '/admin/siparisler', icon: Package },
    { name: 'Katalog', href: '/admin/urunler', icon: Tag },
  ];

  // Secondary links hidden in menu
  const menuLinks = [
    { name: 'Finans', href: '/admin/finans', icon: Wallet, desc: 'Kâr & Nakit Raporu' },
    { name: 'Müşteriler', href: '/admin/musteriler', icon: Users, desc: 'CRM & Segmentler' },
    { name: 'Ayarlar', href: '/admin/ayarlar', icon: Settings, desc: 'Mağaza Yapılandırması' },
  ];

  // Close menu on route change
  React.useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Menu Overlay (Drawer) */}
      <div 
        className={cn(
            "fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-all duration-300 md:hidden",
            isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMenuOpen(false)}
      >
        <div 
            className={cn(
                "absolute bottom-0 left-0 w-full bg-white rounded-t-[32px] p-6 pb-12 transition-transform duration-500 ease-out shadow-2xl",
                isMenuOpen ? "translate-y-0" : "translate-y-full"
            )}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-black uppercase tracking-widest text-neutral-400">Yönetim Menüsü</h2>
                <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="h-8 w-8 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-900 active:scale-90 transition-transform"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Links Grid */}
            <div className="space-y-3">
                {menuLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname.startsWith(link.href);
                    
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98]",
                                isActive ? "bg-neutral-900 border-neutral-900 text-white shadow-lg" : "bg-neutral-50 border-transparent text-neutral-900"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", isActive ? "bg-white/10" : "bg-white")}>
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{link.name}</p>
                                    <p className={cn("text-[10px] font-medium", isActive ? "text-neutral-400" : "text-neutral-400")}>{link.desc}</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className={cn(isActive ? "text-white/40" : "text-neutral-300")} />
                        </Link>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Main Bottom Bar */}
      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-neutral-100 bg-white/80 backdrop-blur-md pb-safe md:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          {coreLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));

            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 p-2 text-[10px] font-bold uppercase tracking-widest transition-all active:scale-90",
                  isActive ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                <span>{link.name}</span>
              </Link>
            );
          })}

          {/* More / Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 p-2 text-[10px] font-bold uppercase tracking-widest transition-all active:scale-90",
              isMenuOpen ? "text-neutral-900" : "text-neutral-400"
            )}
          >
            <Menu className={cn("h-5 w-5", isMenuOpen && "stroke-[2.5px]")} />
            <span>Menü</span>
          </button>
        </div>
      </div>
    </>
  );
}