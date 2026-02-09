import { Product } from '@/types/database';
import { ProductCard } from './product-card';

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[40px] border-2 border-dashed border-neutral-100 p-12 text-center bg-neutral-50/50">
        <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Henüz ürün bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
      {products.map((product) => (
        <ProductCard 
          key={`${product.id}-${product.display_color || 'default'}`} 
          product={product} 
        />
      ))}
    </div>
  );
}