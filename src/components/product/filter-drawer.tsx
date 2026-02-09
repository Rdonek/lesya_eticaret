'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/services/category-service';

type FilterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
};

export function FilterDrawer({ isOpen, onClose, categories }: FilterDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Local state for filters
  const [selectedCategory, setSelectedCategory] = React.useState<string>(searchParams.get('kategori') || '');
  const [selectedSort, setSelectedSort] = React.useState<string>(searchParams.get('sort') || '');

  // Sync with URL when drawer opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedCategory(searchParams.get('kategori') || '');
      setSelectedSort(searchParams.get('sort') || '');
    }
  }, [isOpen, searchParams]);

  const handleApply = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('kategori', selectedCategory);
    if (selectedSort) params.set('sort', selectedSort);
    
    router.push(`/urunler?${params.toString()}`);
    onClose();
  };

  const handleClear = () => {
    setSelectedCategory('');
    setSelectedSort('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-bold text-neutral-900">Filtrele & Sırala</h2>
          <button onClick={onClose}>
            <X className="h-6 w-6 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Kategoriler</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  selectedCategory === '' ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                )}
              >
                Tümü
                {selectedCategory === '' && <Check className="h-4 w-4" />}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all",
                    selectedCategory === cat.slug ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                  )}
                >
                  {cat.name}
                  {selectedCategory === cat.slug && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Sıralama</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedSort('price_asc')}
                className={cn(
                  "flex items-center justify-center rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wide transition-all border",
                  selectedSort === 'price_asc' 
                    ? "border-neutral-900 bg-neutral-900 text-white" 
                    : "border-neutral-100 bg-white text-neutral-600 hover:border-neutral-300"
                )}
              >
                Fiyat Artan
              </button>
              <button
                onClick={() => setSelectedSort('price_desc')}
                className={cn(
                  "flex items-center justify-center rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wide transition-all border",
                  selectedSort === 'price_desc' 
                    ? "border-neutral-900 bg-neutral-900 text-white" 
                    : "border-neutral-100 bg-white text-neutral-600 hover:border-neutral-300"
                )}
              >
                Fiyat Azalan
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-100 bg-white space-y-3">
          <Button 
            onClick={handleApply}
            className="w-full h-14 rounded-xl bg-neutral-900 text-white font-bold text-base shadow-lg shadow-neutral-900/20"
          >
            Sonuçları Göster
          </Button>
          {(selectedCategory || selectedSort) && (
            <Button 
              variant="ghost" 
              onClick={handleClear}
              className="w-full h-10 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
            >
              Temizle
            </Button>
          )}
        </div>

      </div>
    </>
  );
}
