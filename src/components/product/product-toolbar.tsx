'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpDown, Filter, SlidersHorizontal } from 'lucide-react';
import { FilterDrawer } from '@/components/product/filter-drawer';
import type { Category } from '@/lib/services/category-service';
import { cn } from '@/lib/utils';

type ProductToolbarProps = {
  categories: Category[];
};

export function ProductToolbar({ categories }: ProductToolbarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const searchParams = useSearchParams();
  const sort = searchParams.get('sort');
  const kategori = searchParams.get('kategori');

  const getSortUrl = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort === 'price_asc' ? 'price_desc' : 'price_asc');
    return `/urunler?${params.toString()}`;
  };

  return (
    <>
      <div className="flex items-center justify-between px-2 md:px-0">
        
        {/* Count Info (Left) */}
        <div className="hidden md:block">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                Filtrele & Sırala
            </span>
        </div>

        {/* Buttons (Right / Center on Mobile) */}
        <div className="flex items-center gap-2 w-full md:w-auto">
            
            {/* Sort Button - Compact Pill */}
            <Link 
              href={getSortUrl()}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-2 h-10 px-5 rounded-full border text-[11px] font-black uppercase tracking-wider transition-all active:scale-95",
                sort ? "bg-neutral-900 border-neutral-900 text-white shadow-lg shadow-neutral-900/10" : "bg-white border-neutral-100 text-neutral-600 hover:border-neutral-300"
              )}
            >
              <ArrowUpDown size={14} strokeWidth={2.5} />
              {sort === 'price_asc' ? 'Artan' : sort === 'price_desc' ? 'Azalan' : 'Sırala'}
            </Link>

            {/* Filter Button - Compact Pill */}
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-2 h-10 px-5 rounded-full border text-[11px] font-black uppercase tracking-wider transition-all active:scale-95",
                kategori ? "bg-neutral-900 border-neutral-900 text-white shadow-lg shadow-neutral-900/10" : "bg-white border-neutral-100 text-neutral-600 hover:border-neutral-300"
              )}
            >
              <SlidersHorizontal size={14} strokeWidth={2.5} />
              Filtrele
              {kategori && <span className="h-1.5 w-1.5 rounded-full bg-white ml-1" />}
            </button>

        </div>
      </div>

      <FilterDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        categories={categories}
      />
    </>
  );
}