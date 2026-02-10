import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Truck, ShieldCheck, RefreshCcw } from 'lucide-react';
import { productService } from '@/lib/services/product-service';
import { formatPrice } from '@/lib/utils/format';
import { ProductGrid } from '@/components/product/product-grid';
import { ProductActions } from '@/components/product/product-actions';
import { ProductGallery } from '@/components/product/product-gallery';
import { AccordionItem } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

export const revalidate = 60; // 1 minute cache is enough for a smooth balance

type ProductDetailPageProps = {
  params: {
    slug: string;
  };
  searchParams: {
    renk?: string;
  };
};

export default async function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
  const product = await productService.getBySlug(params.slug);

  if (!product) {
    notFound();
  }

  // 1. Determine Selected Color
  const allColors = Array.from(new Set(product.product_variants.map((v: any) => v.color).filter(Boolean)));
  const selectedColor = searchParams.renk || allColors[0] as string;

  // 2. Filter variants and images by selected color
  const filteredVariants = product.product_variants.filter((v: any) => v.color === selectedColor);
  const colorImages = product.product_images
    .filter((img: any) => img.color === selectedColor)
    .sort((a: any, b: any) => a.display_order - b.display_order);

  // If no color images, fallback to all images (legacy support)
  const displayImages = colorImages.length > 0 ? colorImages : product.product_images;

  const relatedProducts = product.category 
    ? await productService.getRelated(product.category, product.id)
    : [];

  const price = formatPrice(product.base_price);
  const categoryName = product.categories?.name || 'Koleksiyon';

  return (
    <div className="bg-white pb-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 pt-8 md:pt-16">
        
        {/* Minimal Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300">
          <Link href="/" className="hover:text-neutral-900 transition-colors">Ana Sayfa</Link>
          <ChevronRight size={10} strokeWidth={3} />
          <Link href="/urunler" className="hover:text-neutral-900 transition-colors">Mağaza</Link>
          <ChevronRight size={10} strokeWidth={3} />
          <span className="text-neutral-900 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-20">
          
          {/* Left Column: Gallery (7/12) */}
          <div className="lg:col-span-7">
            <div className="sticky top-28">
              <ProductGallery 
                images={displayImages} 
                productName={product.name} 
                selectedColor={selectedColor} 
              />
            </div>
          </div>

          {/* Right Column: Details (5/12) */}
          <div className="flex flex-col lg:col-span-5 pt-4 md:pt-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">{categoryName}</span>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-neutral-900 leading-[0.9] uppercase italic">
                    {product.name}
                </h1>
              </div>
              
              <div className="flex items-center gap-4">
                <p className="text-3xl font-bold text-neutral-900 tracking-tighter">
                    {price}
                </p>
                {product.base_price > 2000 && (
                    <span className="px-2 py-1 bg-neutral-100 rounded text-[9px] font-bold uppercase tracking-wide text-neutral-500">Ücretsiz Kargo</span>
                )}
              </div>
            </div>

            <div className="my-10 h-px w-full bg-neutral-100" />

            {/* COLOR SELECTOR */}
            {allColors.length > 1 && (
              <div className="mb-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900">Renk Seçimi: <span className="text-neutral-400 font-medium ml-1">{selectedColor}</span></span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {allColors.map((color: any) => {
                    const firstColorImg = product.product_images.find((img: any) => img.color === color)?.url;
                    return (
                      <Link
                        key={color}
                        href={`/urunler/${product.slug}?renk=${encodeURIComponent(color)}`}
                        className={cn(
                          "relative h-24 w-20 overflow-hidden rounded-xl border transition-all duration-300",
                          selectedColor === color ? "border-neutral-900 ring-1 ring-neutral-900 ring-offset-2 scale-105" : "border-transparent opacity-70 hover:opacity-100"
                        )}
                      >
                        <img src={firstColorImg} alt={color} className="h-full w-full object-cover" />
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size Selector & Add to Cart */}
            <ProductActions 
              product={{...product, display_color: selectedColor}} 
              variants={filteredVariants} 
            />

            {/* Accordions (Clean Style) */}
            <div className="mt-12 space-y-4">
              <AccordionItem title="Ürün Hikayesi" defaultOpen>
                <div className="prose prose-neutral prose-sm max-w-none text-neutral-500 font-medium leading-relaxed">
                  {product.description || 'Bu özel tasarım parça, Lesya Studio atölyelerinde özenle üretilmiştir. Sürdürülebilir materyaller ve zamansız estetik anlayışı ile gardırobunuzun vazgeçilmezi olmaya aday.'}
                </div>
              </AccordionItem>
              <AccordionItem title="Bakım & Yıkama">
                <div className="text-xs text-neutral-500 font-medium space-y-1">
                  <p>• 30°C'de hassas yıkama yapınız.</p>
                  <p>• Ağartıcı kullanmayınız.</p>
                  <p>• Düşük ısıda ütüleyiniz.</p>
                </div>
              </AccordionItem>
              <AccordionItem title="Teslimat & İade">
                <div className="text-xs text-neutral-500 space-y-2 font-medium">
                  <p>• Siparişiniz 1-3 iş günü içerisinde kargoya teslim edilir.</p>
                  <p>• Memnun kalmadığınız ürünleri 14 gün içerisinde ücretsiz iade edebilirsiniz.</p>
                </div>
              </AccordionItem>
            </div>

            {/* Trust Badges - Minimal */}
            <div className="mt-12 flex items-center justify-between border-t border-neutral-100 pt-8 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
              <div className="flex flex-col items-center gap-2">
                <Truck strokeWidth={1.5} size={20} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Hızlı Kargo</span>
              </div>
              <div className="h-8 w-px bg-neutral-200" />
              <div className="flex flex-col items-center gap-2">
                <ShieldCheck strokeWidth={1.5} size={20} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Güvenli Ödeme</span>
              </div>
              <div className="h-8 w-px bg-neutral-200" />
              <div className="flex flex-col items-center gap-2">
                <RefreshCcw strokeWidth={1.5} size={20} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Kolay İade</span>
              </div>
            </div>

          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 border-t border-neutral-100 pt-20">
            <h2 className="mb-12 text-3xl font-black text-neutral-900 md:text-5xl uppercase italic tracking-tighter">Bunu da Beğenebilirsin</h2>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  );
}