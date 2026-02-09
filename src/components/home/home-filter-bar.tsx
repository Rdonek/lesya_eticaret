
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown, Filter, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "../ui/drawer";

export function HomeFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort');

  const handleSort = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentSort === sortValue) {
      params.delete('sort');
    } else {
      params.set('sort', sortValue);
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <div className="sticky top-[56px] md:top-[72px] z-40 w-full bg-white border-b border-neutral-100 shadow-sm transition-all duration-300">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 h-12 md:h-14">
          
          <div className="flex items-center w-full h-full divide-x divide-neutral-100">
            
            {/* Sort Trigger */}
            <Drawer>
              <DrawerTrigger asChild>
                <button className="flex-1 flex items-center justify-center gap-2 h-full text-xs md:text-sm font-bold text-neutral-600 active:bg-neutral-50 hover:bg-neutral-50 transition-colors">
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="truncate">
                    {currentSort === 'price_asc' ? 'En Düşük Fiyat' : 
                     currentSort === 'price_desc' ? 'En Yüksek Fiyat' : 'Sırala'}
                  </span>
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                  <DrawerHeader>
                    <DrawerTitle>Sıralama Seçenekleri</DrawerTitle>
                  </DrawerHeader>
                  <div className="p-4 space-y-2">
                    <Button 
                        variant="ghost" 
                        className={cn("w-full justify-between", currentSort === 'price_asc' && "bg-neutral-50 text-neutral-900 font-bold")}
                        onClick={() => handleSort('price_asc')}
                    >
                        En Düşük Fiyat
                        {currentSort === 'price_asc' && <Check className="h-4 w-4" />}
                    </Button>
                    <Button 
                        variant="ghost" 
                        className={cn("w-full justify-between", currentSort === 'price_desc' && "bg-neutral-50 text-neutral-900 font-bold")}
                        onClick={() => handleSort('price_desc')}
                    >
                        En Yüksek Fiyat
                        {currentSort === 'price_desc' && <Check className="h-4 w-4" />}
                    </Button> 
                    <Button 
                        variant="ghost" 
                        className={cn("w-full justify-between", !currentSort && "bg-neutral-50 text-neutral-900 font-bold")}
                        onClick={() => handleSort('')}
                    >
                        Önerilen
                        {!currentSort && <Check className="h-4 w-4" />}
                    </Button>
                  </div>
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button variant="outline">Kapat</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>

            {/* Filter Trigger (Redirects for now, or could be another Drawer) */}
            <Link 
              href="/urunler" 
              className="flex-1 flex items-center justify-center gap-2 h-full text-xs md:text-sm font-bold text-neutral-600 active:bg-neutral-50 hover:bg-neutral-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filtrele
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
