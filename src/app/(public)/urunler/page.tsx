import { productService } from '@/lib/services/product-service';
import { categoryService } from '@/lib/services/category-service';
import { ProductGrid } from '@/components/product/product-grid';
import { ProductToolbar } from '@/components/product/product-toolbar';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

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
    <div className="bg-white min-h-screen pb-32">
      
      {/* 1. Header Section */}
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 pt-12 md:pt-20">
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300 mb-6">
          <Link href="/" className="hover:text-neutral-900 transition-colors">Ana Sayfa</Link>
          <ChevronRight size={10} strokeWidth={3} />
          <span className="text-neutral-900">{activeCategory ? activeCategory.name : 'Koleksiyon'}</span>
        </nav>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85] text-neutral-900 italic">
                {activeCategory ? activeCategory.name : 'Tüm Ürünler'}
            </h1>
            <div className="w-full md:w-auto shrink-0">
                <ProductToolbar categories={categories} />
            </div>
        </div>
      </div>

      {/* 2. Product Grid */}
      <section className="mx-auto max-w-[1400px] px-4 md:px-8 mt-12 md:pt-16">
        <div className="mb-8 px-2 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
            {filteredProducts.length} Ürün Listeleniyor
          </span>
        </div>
        
        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : (
          <div className="py-32 text-center rounded-[48px] bg-neutral-50 border border-neutral-100 border-dashed mx-2">
            <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Sonuç Bulunamadı</p>
            <Link href="/urunler" className="mt-6 inline-block text-[11px] font-black uppercase tracking-widest bg-neutral-900 text-white px-8 py-4 rounded-full shadow-lg shadow-neutral-900/20 active:scale-95 transition-all">
              Filtreleri Temizle
            </Link>
          </div>
        )}
      </section>

    </div>
  );
}