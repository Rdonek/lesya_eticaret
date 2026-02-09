'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

// Static categories for now, can be dynamic later
const CATEGORIES = [
  { name: 'Tümü', slug: 'tumu', href: '/urunler' },
  { name: 'Elbise', slug: 'elbise', href: '/urunler?kategori=elbise' },
  { name: 'Bluz', slug: 'bluz', href: '/urunler?kategori=bluz' },
  { name: 'Pantolon', slug: 'pantolon', href: '/urunler?kategori=pantolon' },
  { name: 'Etek', slug: 'etek', href: '/urunler?kategori=etek' },
  { name: 'Ceket', slug: 'ceket', href: '/urunler?kategori=ceket' },
];

export function CategoryRail() {
  return (
    <div className="w-full overflow-x-auto pb-4 pt-2 scrollbar-hide">
      <div className="flex gap-3 px-4 md:gap-4 md:px-6">
        {CATEGORIES.map((cat, index) => (
          <Link 
            key={cat.slug} 
            href={cat.href}
            className={cn(
              "flex-shrink-0 rounded-full border border-neutral-200 bg-white px-6 py-2.5 text-sm font-medium text-neutral-600 transition-all hover:border-neutral-900 hover:text-neutral-900",
              index === 0 && "bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800 hover:text-white" // Active state simulation for 'All'
            )}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
