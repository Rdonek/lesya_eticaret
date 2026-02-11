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
    <div className="bg-white">
      
      {/* 1. HERO SECTION - Refined & Balanced */}
      <section className="relative px-6 md:px-10 max-w-[1400px] mx-auto pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-neutral-100 pb-16">
            <div className="lg:col-span-6 space-y-6">
                <div className="flex items-center gap-3">
                    <span className="h-px w-6 bg-neutral-900"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900">New Season Collection</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-neutral-900 tracking-tighter leading-[0.9]">
                    ZAMANSIZ<br />
                    <span className="text-neutral-300 italic font-medium">MODERNİZM.</span>
                </h1>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-neutral-500 leading-relaxed max-w-sm">
                    Kusursuz kalıplar ve sürdürülebilir dokularla hazırlanan rafine detaylar.
                </p>
                <div className="pt-4">
                    <Link href="/urunler" className="group inline-flex items-center gap-4 bg-neutral-900 text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-neutral-800 active:scale-95">
                        Koleksiyonu Keşfet
                        <MoveRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
            <div className="lg:col-span-6">
                <div className="relative aspect-[16/10] lg:aspect-[4/3] w-full rounded-3xl overflow-hidden bg-neutral-50 group">
                    <img 
                        src="https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=1964&auto=format&fit=crop" 
                        alt="Lesya Studio" 
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                    />
                </div>
            </div>
        </div>
      </section>

      {/* 2. TRENDING NOW - Tighter spacing */}
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-12">
        <div className="flex items-end justify-between border-b border-neutral-100 pb-4 mb-8">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-neutral-900">
                    <Flame size={14} fill="currentColor" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Haftanın Favorileri</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-neutral-900">Çok Satanlar</h2>
            </div>
            <Link href="/urunler" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-900 transition-colors">
                Tümünü Gör
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
            </Link>
        </div>
        {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <div key={i} className="aspect-[3/4] rounded-2xl bg-neutral-50 animate-pulse" />)}
            </div>
        ) : (
            <ProductGrid products={trending} />
        )}
      </section>

      {/* 3. SEASON HIGHLIGHTS - Global style applied */}
      <section className="bg-black py-16">
         <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-neutral-900 pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-neutral-500">
                        <Sparkles size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Özel Seçki</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none text-white">
                        Sezonun <span className="text-neutral-700 underline decoration-1 underline-offset-8">Yıldızları.</span>
                    </h2>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-500 max-w-[200px] leading-relaxed">
                    Sınırlı sayıda üretilen premium tasarım parçalar.
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1,2,3,4].map(i => <div key={i} className="aspect-[3/4] rounded-2xl bg-white/5 animate-pulse" />)}
                </div>
            ) : (
                <div className="text-white">
                    <ProductGrid products={deals} />
                </div>
            )}
         </div>
      </section>

    </div>
  );
}
