'use client';

import * as React from 'react';
import Link from 'next/link';
import { productService } from '@/lib/services/product-service';
import { ProductGrid } from '@/components/product/product-grid';
import { ArrowRight, MoveRight, Flame, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [trending, setTrending] = React.useState<any[]>([]);
  const [deals, setDeals] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadShowcase = async () => {
      try {
        const [trendData, dealData] = await Promise.all([
            productService.getTrending(),
            productService.getDeals()
        ]);
        // Limit to 4 items each for a clean single row look
        setTrending(trendData.slice(0, 4));
        setDeals(dealData.slice(0, 4));
      } catch (error) {
        console.error('Showcase error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadShowcase();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative px-6 md:px-10 max-w-[1400px] mx-auto pt-8 md:pt-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-8 order-2 lg:order-1">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="h-px w-8 bg-neutral-900"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-900">SS/26 Collection</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-neutral-900 tracking-tighter leading-[0.85]">
                        ZAMANSIZ<br />
                        <span className="text-neutral-200 italic">MODERN.</span>
                    </h1>
                    <p className="text-xs md:text-sm text-neutral-500 font-bold uppercase tracking-[0.15em] leading-relaxed max-w-xs">
                        Kusursuz kalıplar, sürdürülebilir dokular ve rafine detaylar.
                    </p>
                </div>
                <div className="pt-2">
                    <Link href="/urunler" className="group inline-flex items-center gap-6 bg-neutral-900 text-white px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-neutral-800 active:scale-95">
                        Keşfet
                        <MoveRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                    </Link>
                </div>
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2">
                <div className="relative aspect-[4/5] md:aspect-[3/4] w-full rounded-[40px] md:rounded-[60px] overflow-hidden bg-neutral-50 shadow-2xl shadow-neutral-200 group">
                    <img src="https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=1964&auto=format&fit=crop" alt="Lesya Studio" className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-1000 group-hover:scale-105" />
                </div>
            </div>
        </div>
      </section>

      {/* 2. TRENDING NOW */}
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 mt-12 mb-20">
        <div className="flex items-end justify-between border-b border-neutral-100 pb-6 mb-10">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-neutral-900">
                    <Flame size={16} fill="currentColor" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Popüler</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic text-neutral-900">Haftanın Favorileri</h2>
            </div>
            <Link href="/urunler" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900 hover:text-neutral-400 transition-colors">
                Tümünü Gör
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
            </Link>
        </div>
        {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {[1,2,3,4].map(i => <div key={i} className="aspect-[3/4] rounded-[24px] bg-neutral-50 animate-pulse" />)}
            </div>
        ) : (
            <ProductGrid products={trending} />
        )}
      </section>

      {/* 3. SEASON HIGHLIGHTS - Seamless & Compact */}
      <section className="relative bg-black text-white mt-32">
         
         {/* COMPACT GRADIENT TOP */}
         <div className="absolute top-0 left-0 w-full h-[160px] -translate-y-full pointer-events-none">
            <div className="w-full h-full bg-gradient-to-b from-white via-white to-black"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-black"></div>
         </div>
         
         <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-neutral-500">
                        <Sparkles size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Special Selection</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-[0.85]">
                        Sezonun <br /><span className="text-neutral-700">Yıldızları.</span>
                    </h2>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 max-w-[180px] leading-relaxed">
                    Sınırlı sayıda üretilen özel tasarım parçalar.
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1,2,3,4].map(i => <div key={i} className="aspect-[3/4] rounded-[24px] bg-white/5 animate-pulse" />)}
                </div>
            ) : (
                <div className="[&_h3]:text-white [&_span]:text-white [&_p]:text-neutral-500 [&_div]:border-neutral-900">
                    <ProductGrid products={deals} />
                </div>
            )}
         </div>

         {/* COMPACT GRADIENT BOTTOM */}
         <div className="w-full h-[160px] bg-gradient-to-b from-black via-white to-white"></div>
      </section>

    </div>
  );
}