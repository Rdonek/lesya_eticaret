'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type ProductGalleryProps = {
  images: { url: string; id: string; color?: string | null }[];
  productName: string;
  selectedColor: string;
};

export function ProductGallery({ images, productName, selectedColor }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  // Renk değiştiğinde ilk resme geri dön
  React.useEffect(() => {
    setActiveIndex(0);
  }, [selectedColor]);

  const activeImage = images[activeIndex]?.url || images[0]?.url;

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-neutral-50 shadow-sm border border-neutral-100">
        {activeImage ? (
          <img 
            src={activeImage} 
            alt={`${productName} - ${selectedColor}`}
            className="h-full w-full object-cover object-top transition-all duration-500"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300 font-bold">
            Görsel Yok
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200",
                activeIndex === idx 
                  ? "border-neutral-900 ring-2 ring-neutral-900 ring-offset-2" 
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
