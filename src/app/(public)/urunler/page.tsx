import { productService } from '@/lib/services/product-service';
import { categoryService } from '@/lib/services/category-service';
import { ProductGrid } from '@/components/product/product-grid';
import { ProductToolbar } from '@/components/product/product-toolbar';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ProductsPageProps = {
  searchParams: {
    kategori?: string;
    sort?: string;
  };
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const [categories, allProducts] = await Promise.all([
    categoryService.getAll(),
    productService.getAll()
  ]);

  const activeCategory = categories.find(c => c.slug === searchParams.kategori);

  let filteredProducts = activeCategory
    ? allProducts.filter((p: any) => p.category_id === activeCategory.id)
    : allProducts;

  if (searchParams.sort === 'price_asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (searchParams.sort === 'price_desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="bg-white">
      
      {/* 1. Header Section - Balanced Spacing */}
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 pt-8 pb-10 border-b border-neutral-100">
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300 mb-6">
          <Link href="/" className="hover:text-neutral-900 transition-colors">Ana Sayfa</Link>
          <ChevronRight size={10} strokeWidth={3} />
          <span className="text-neutral-900">{activeCategory ? activeCategory.name : 'Koleksiyon'}</span>
        </nav>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-neutral-900 italic">
                    {activeCategory ? activeCategory.name : 'Tüm Ürünler'}
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                    {filteredProducts.length} Ürün Listeleniyor
                </p>
            </div>
            <div className="w-full md:w-auto shrink-0">
                <ProductToolbar categories={categories} />
            </div>
        </div>
      </div>

      {/* 2. Product Grid - Refined Spacing */}
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-12">
        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : (
          <div className="py-24 text-center rounded-3xl bg-neutral-50 border border-neutral-100 border-dashed">
            <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Sonuç Bulunamadı</p>
            <Link href="/urunler" className="mt-6 inline-block text-[10px] font-black uppercase tracking-widest bg-neutral-900 text-white px-8 py-4 rounded-full shadow-lg shadow-neutral-900/20 active:scale-95 transition-all">
              Filtreleri Temizle
            </Link>
          </div>
        )}
      </section>

    </div>
  );
}
