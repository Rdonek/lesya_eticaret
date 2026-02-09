'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/providers/toast-provider';
import { ChevronLeft, Plus, Trash2, Upload, X, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { categoryService, Category } from '@/lib/services/category-service';

type ProductForm = {
  name: string;
  description: string;
  base_price: string;
  general_cost: string; // New field for UX
  category_id: string;
  variants: VariantGroup[];
};

type VariantGroup = {
  id: string;
  color: string;
  images: File[];
  imagePreviews: string[];
  sizes: { size: string; stock: string; cost_price: string }[];
};

export default function NewProductPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createClient();
  const [loading, setLoading] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);

  const [formData, setFormData] = React.useState<ProductForm>({
    name: '',
    description: '',
    base_price: '',
    general_cost: '', // Default empty
    category_id: '',
    variants: [
      { 
        id: '1', 
        color: '', 
        images: [], 
        imagePreviews: [],
        sizes: [
          { size: 'S', stock: '0', cost_price: '0' }, 
          { size: 'M', stock: '0', cost_price: '0' }, 
          { size: 'L', stock: '0', cost_price: '0' }, 
          { size: 'XL', stock: '0', cost_price: '0' }
        ] 
      }
    ]
  });

  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
        if (data && data.length > 0) {
          setFormData(prev => ({ ...prev, category_id: data[0].id }));
        }
      } catch (error) {
        console.error('Failed to load categories');
      }
    };
    loadCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Smart Sync: When general_cost changes, update all variant costs
  const applyGeneralCost = () => {
    if (!formData.general_cost) return;
    
    setFormData({
      ...formData,
      variants: formData.variants.map(v => ({
        ...v,
        sizes: v.sizes.map(s => ({ ...s, cost_price: formData.general_cost }))
      }))
    });
    showToast('Maliyet tüm varyantlara uygulandı.');
  };

  const addVariantGroup = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { 
          id: Math.random().toString(36).substr(2, 9), 
          color: '', 
          images: [], 
          imagePreviews: [],
          sizes: [
            { size: 'S', stock: '0', cost_price: formData.general_cost || '0' }, 
            { size: 'M', stock: '0', cost_price: formData.general_cost || '0' }, 
            { size: 'L', stock: '0', cost_price: formData.general_cost || '0' },
            { size: 'XL', stock: '0', cost_price: formData.general_cost || '0' }
          ] 
        }
      ]
    });
  };

  const removeVariantGroup = (id: string) => {
    if (formData.variants.length === 1) return;
    setFormData({
      ...formData,
      variants: formData.variants.filter(v => v.id !== id)
    });
  };

  const updateVariantColor = (id: string, color: string) => {
    setFormData({
      ...formData,
      variants: formData.variants.map(v => v.id === id ? { ...v, color } : v)
    });
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));

    setFormData({
      ...formData,
      variants: formData.variants.map(v => v.id === id ? {
        ...v,
        images: [...v.images, ...newFiles],
        imagePreviews: [...v.imagePreviews, ...newPreviews]
      } : v)
    });
  };

  const removeImage = (variantId: string, imageIndex: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.map(v => {
        if (v.id === variantId) {
          const newImages = [...v.images];
          const newPreviews = [...v.imagePreviews];
          newImages.splice(imageIndex, 1);
          newPreviews.splice(imageIndex, 1);
          return { ...v, images: newImages, imagePreviews: newPreviews };
        }
        return v;
      })
    });
  };

  const updateSizeStock = (variantId: string, sizeIndex: number, stock: string) => {
    setFormData({
      ...formData,
      variants: formData.variants.map(v => {
        if (v.id === variantId) {
          const newSizes = [...v.sizes];
          newSizes[sizeIndex].stock = stock;
          return { ...v, sizes: newSizes };
        }
        return v;
      })
    });
  };

  const updateSizeCost = (variantId: string, sizeIndex: number, cost: string) => {
    setFormData({
      ...formData,
      variants: formData.variants.map(v => {
        if (v.id === variantId) {
          const newSizes = [...v.sizes];
          newSizes[sizeIndex].cost_price = cost;
          return { ...v, sizes: newSizes };
        }
        return v;
      })
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.base_price) {
      showToast('Lütfen ürün adı ve fiyatını girin', 'error');
      return;
    }

    setLoading(true);
    try {
      const slug = formData.name.toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '') + '-' + Math.floor(Math.random() * 1000);
      
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          description: formData.description,
          base_price: parseFloat(formData.base_price),
          category_id: formData.category_id,
          slug: slug
        })
        .select()
        .single();

      if (productError) throw productError;

      const imageUploadPromises: Promise<any>[] = [];
      for (const variantGroup of formData.variants) {
        if (!variantGroup.color) continue;
        variantGroup.images.forEach((file, i) => {
          const uploadPromise = (async () => {
            const fileExt = file.name.split('.').pop();
            const safeColor = variantGroup.color.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
            const fileName = `${product.id}/${safeColor}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
            if (uploadError) return null;
            const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
            return { product_id: product.id, url: publicUrl, display_order: i, color: variantGroup.color };
          })();
          imageUploadPromises.push(uploadPromise);
        });
      }

      const uploadResults = await Promise.all(imageUploadPromises);
      const allImageRecords = uploadResults.filter(res => res !== null);
      if (allImageRecords.length > 0) {
        await supabase.from('product_images').insert(allImageRecords);
      }

      for (const variantGroup of formData.variants) {
        if (!variantGroup.color) continue;
        const sizesToCreate = variantGroup.sizes.filter(s => parseInt(s.stock) > 0);
        for (const s of sizesToCreate) {
            const stock = parseInt(s.stock);
            const unitCost = parseFloat(s.cost_price || '0');
            const totalCost = stock * unitCost;

            const { data: variant, error: varError } = await supabase
                .from('product_variants')
                .insert({
                    product_id: product.id,
                    sku: `${slug}-${variantGroup.color}-${s.size}`.toUpperCase().replace(/[^A-Z0-9-]/g, ''),
                    size: s.size,
                    color: variantGroup.color,
                    stock: stock,
                    cost_price: unitCost,
                    price: null
                })
                .select()
                .single();

            if (varError) throw varError;

            const { data: log, error: logError } = await supabase
                .from('inventory_logs')
                .insert({
                    product_variant_id: variant.id,
                    type: 'purchase',
                    quantity: stock,
                    unit_cost: unitCost,
                    total_value: totalCost,
                    description: 'İlk Stok Girişi'
                })
                .select()
                .single();

            if (logError) throw logError;

            if (totalCost > 0) {
                await supabase.from('finances').insert({
                    type: 'expense',
                    category: 'inventory',
                    amount: totalCost,
                    source: 'system_purchase',
                    related_id: log.id,
                    description: `Stok Alımı: ${product.name} (${variantGroup.color}/${s.size})`
                });
            }
        }
      }

      showToast('Ürün başarıyla oluşturuldu');
      router.push('/admin/urunler');
    } catch (error: any) {
      console.error(error);
      showToast('Hata: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-40">
      <header className="flex items-center gap-4">
        <Link href="/admin/urunler">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-neutral-100 shadow-sm hover:bg-neutral-50 transition-colors text-neutral-400 hover:text-neutral-900">
            <ChevronLeft className="h-5 w-5" />
          </div>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Yeni Ürün</h1>
          <p className="text-sm font-medium text-neutral-400 uppercase tracking-widest mt-0.5">Katalog Ekleme</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="rounded-[32px] bg-white p-8 border border-neutral-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-neutral-900">Temel Bilgiler</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Ürün Adı</label>
                <Input name="name" className="h-12 rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Satış Fiyatı (TL)</label>
                <Input name="base_price" type="number" className="h-12 rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200" value={formData.base_price} onChange={handleInputChange} />
              </div>
              
              {/* SMART COST UX */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Birim Maliyet (TL)</label>
                <div className="flex gap-2">
                    <Input name="general_cost" type="number" className="h-12 rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200" value={formData.general_cost} onChange={handleInputChange} placeholder="Örn: 150" />
                    <Button variant="outline" onClick={applyGeneralCost} className="h-12 rounded-xl border-neutral-200 text-xs font-bold px-4 gap-2 whitespace-nowrap">
                        <Sparkles className="h-3 w-3" /> Tümüne Uygula
                    </Button>
                </div>
                <p className="text-[10px] text-neutral-400 font-medium px-1">Girdiğiniz maliyet tüm renk ve bedenlere otomatik dağıtılır.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Kategori</label>
                <select name="category_id" className="w-full h-12 rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200 px-3 outline-none transition-all cursor-pointer text-sm" value={formData.category_id} onChange={handleInputChange}>
                  <option value="" disabled>Seçiniz</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Açıklama</label>
                <textarea name="description" rows={4} className="w-full p-4 rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200 transition-all text-sm outline-none resize-none" value={formData.description} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {formData.variants.map((variant, index) => (
            <div key={variant.id} className="rounded-[32px] bg-white p-8 border border-neutral-100 shadow-sm relative group">
              {formData.variants.length > 1 && (
                <button onClick={() => removeVariantGroup(variant.id)} className="absolute top-6 right-6 h-8 w-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold text-lg">{index + 1}</div>
                  <div className="flex-1 max-w-xs space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Renk Seçeneği</label>
                    <Input className="h-12 rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200" value={variant.color} onChange={(e) => updateVariantColor(variant.id, e.target.value)} />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Görseller</label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                    {variant.imagePreviews.map((src, i) => (
                      <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden group/img">
                        <img src={src} alt="Preview" className="h-full w-full object-cover" />
                        <button onClick={() => removeImage(variant.id, i)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                          <X className="h-5 w-5 text-white" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-neutral-200 hover:border-neutral-400 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-50 hover:bg-neutral-100">
                      <Upload className="h-6 w-6 text-neutral-400 mb-2" />
                      <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(variant.id, e)} />
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Stok & Maliyet (Opsiyonel Düzenleme)</label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-4 items-center px-2">
                        <div className="col-span-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Beden</div>
                        <div className="col-span-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Stok Adedi</div>
                        <div className="col-span-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Maliyet (TL)</div>
                    </div>
                    {variant.sizes.map((sizeObj, i) => (
                      <div key={sizeObj.size} className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-2 text-center text-xs font-bold text-neutral-900 bg-neutral-100 h-10 flex items-center justify-center rounded-lg">{sizeObj.size}</div>
                        <div className="col-span-5">
                            <Input type="number" className="h-10 rounded-lg text-center bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200" value={sizeObj.stock} onChange={(e) => updateSizeStock(variant.id, i, e.target.value)} />
                        </div>
                        <div className="col-span-5">
                            <Input type="number" step="0.01" className="h-10 rounded-lg text-center bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200" value={sizeObj.cost_price} onChange={(e) => updateSizeCost(variant.id, i, e.target.value)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addVariantGroup} className="w-full h-14 rounded-[24px] border-2 border-dashed border-neutral-200 text-neutral-400 hover:border-neutral-900 hover:text-neutral-900 gap-2 text-sm font-bold uppercase tracking-widest">
            <Plus className="h-5 w-5" /> Yeni Renk Ekle
          </Button>
        </div>
      </div>

      <div className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-neutral-100 flex justify-end z-40">
        <Button onClick={handleSubmit} disabled={loading} className="h-14 px-10 rounded-2xl bg-neutral-900 text-white font-bold text-base shadow-lg shadow-neutral-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
          {loading ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
        </Button>
      </div>
    </div>
  );
}