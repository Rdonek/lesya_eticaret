'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/providers/toast-provider';
import { ChevronLeft, Trash2, Archive, Save, Loader2, RefreshCw, PackagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils/format';
import Link from 'next/link';
import { categoryService, Category } from '@/lib/services/category-service';
import { StockEntryModal } from '@/components/admin/stock-entry-modal';

type ProductEditPageProps = {
  params: {
    id: string;
  };
};

export default function ProductEditPage({ params }: ProductEditPageProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createClient();
  
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [product, setProduct] = React.useState<any>(null);
  const [variants, setVariants] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);

  // Stock Modal State
  const [selectedVariant, setSelectedVariant] = React.useState<any>(null);
  const [isStockModalOpen, setIsStockModalOpen] = React.useState(false);

  const fetchProductData = React.useCallback(async () => {
    setLoading(true);
    try {
      const cats = await categoryService.getAll();
      setCategories(cats);

      const { data: prod, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();

      if (prodError) throw prodError;

      const { data: vars } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', params.id)
        .order('color', { ascending: true });

      setProduct(prod);
      setVariants(vars || []);
    } catch (error) {
      showToast('Ürün verisi alınamadı', 'error');
      router.push('/admin/urunler');
    } finally {
      setLoading(false);
    }
  }, [supabase, params.id, router, showToast]);

  React.useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const handleProductUpdate = (field: string, value: any) => {
    setProduct({ ...product, [field]: value });
  };

  const handleVariantUpdate = (id: string, field: string, value: string) => {
    setVariants(variants.map(v => v.id === id ? { 
        ...v, 
        [field]: parseFloat(value) 
    } : v));
  };

  const handleStockClick = (v: any) => {
    setSelectedVariant({
      ...v,
      products: { name: product.name }
    });
    setIsStockModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error: prodError } = await supabase
        .from('products')
        .update({
          name: product.name,
          base_price: parseFloat(product.base_price),
          category_id: product.category_id,
          description: product.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (prodError) throw prodError;

      // Update variants (ONLY COST AND PRICE, NOT STOCK)
      for (const v of variants) {
        await supabase
          .from('product_variants')
          .update({ 
            cost_price: v.cost_price 
          })
          .eq('id', v.id);
      }

      showToast('Tüm değişiklikler kaydedildi.');
      fetchProductData();
    } catch (error) {
      showToast('Kaydetme sırasında bir hata oluştu', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);

      if (error) throw error;

      showToast(product.is_active ? 'Ürün satışa kapatıldı' : 'Ürün tekrar yayına alındı');
      setProduct({ ...product, is_active: !product.is_active });
    } catch (error) {
      showToast('İşlem başarısız', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('DİKKAT: Bu ürün ve tüm varyantları kalıcı olarak silinecektir. Onaylıyor musunuz?')) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) {
        if (error.code === '23503') {
          showToast('Bu ürünün geçmiş siparişleri olduğu için silinemez. Lütfen arşivlemeyi deneyin.', 'error');
        } else {
          throw error;
        }
        return;
      }

      showToast('Ürün kalıcı olarak silindi');
      router.push('/admin/urunler');
    } catch (error: any) {
      showToast('Silme işlemi başarısız oldu', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-neutral-200" />
    </div>
  );

  return (
    <div className="space-y-10 pb-40">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div className="flex items-center gap-4">
          <Link href="/admin/urunler">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-neutral-100 shadow-sm hover:bg-neutral-50 transition-colors text-neutral-400 hover:text-neutral-900">
              <ChevronLeft className="h-5 w-5" />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Ürün Detayı</h1>
            <p className="text-sm font-medium text-neutral-400 uppercase tracking-widest mt-0.5">{product.is_active ? 'Satışta' : 'Arşivde'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleArchive}
            disabled={saving}
            className="h-11 rounded-xl border-neutral-200 text-neutral-600 gap-2 font-bold text-xs uppercase tracking-widest"
          >
            {product.is_active ? <Archive className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
            {product.is_active ? 'Arşivle' : 'Yayına Al'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDelete}
            disabled={saving}
            className="h-11 rounded-xl border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 gap-2 font-bold text-xs uppercase tracking-widest"
          >
            <Trash2 className="h-4 w-4" />
            Kalıcı Sil
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="rounded-[32px] bg-white p-8 border border-neutral-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-neutral-900">Temel Bilgiler</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Ürün Adı</label>
                <Input className="h-12 rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200" value={product.name} onChange={(e) => handleProductUpdate('name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Satış Fiyatı (TL)</label>
                <Input type="number" className="h-12 rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200" value={product.base_price} onChange={(e) => handleProductUpdate('base_price', e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Kategori</label>
                <select 
                  className="w-full h-12 rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200 px-3 outline-none transition-all cursor-pointer text-sm"
                  value={product.category_id || ''}
                  onChange={(e) => handleProductUpdate('category_id', e.target.value)}
                >
                  <option value="" disabled>Seçiniz</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Açıklama</label>
                <textarea rows={6} className="w-full p-4 rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200 text-sm outline-none resize-none" value={product.description || ''} onChange={(e) => handleProductUpdate('description', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-[32px] bg-white p-8 border border-neutral-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-neutral-900">Varyantlar & Stok</h2>
            <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 px-4 items-center">
                    <div className="col-span-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Varyant</div>
                    <div className="col-span-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Stok</div>
                    <div className="col-span-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Maliyet (TL)</div>
                </div>
                <div className="space-y-3">
                    {variants.map((v) => (
                        <div key={v.id} className="grid grid-cols-12 gap-4 items-center p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                            <div className="col-span-4">
                                <p className="font-bold text-neutral-900 text-sm">{v.color}</p>
                                <p className="text-[10px] font-bold uppercase text-neutral-400">Beden: {v.size}</p>
                            </div>
                            <div className="col-span-4 flex items-center gap-2">
                                <div className="flex-1 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center font-mono font-bold text-sm text-neutral-900 select-none">
                                  {v.stock}
                                </div>
                                <button 
                                    onClick={() => handleStockClick(v)}
                                    className="h-10 w-10 rounded-lg bg-neutral-900 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shadow-neutral-900/10"
                                >
                                    <PackagePlus size={16} />
                                </button>
                            </div>
                            <div className="col-span-4">
                                <div className="h-10 rounded-lg bg-neutral-100/50 border border-neutral-100 flex items-center justify-center font-mono text-xs font-bold text-neutral-400 select-none">
                                  {formatPrice(v.cost_price || 0)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-neutral-100 flex justify-end z-40">
        <Button onClick={handleSave} disabled={saving} className="h-14 px-10 rounded-2xl bg-neutral-900 text-white font-bold text-base shadow-lg shadow-neutral-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Değişiklikleri Kaydet
        </Button>
      </div>

      <StockEntryModal 
        isOpen={isStockModalOpen}
        onClose={() => {
            setIsStockModalOpen(false);
            setSelectedVariant(null);
        }}
        variant={selectedVariant}
        onSuccess={fetchProductData}
      />
    </div>
  );
}