
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';
import type { CatalogItem, CatalogUpdate } from '@/lib/services/catalog-service';

export default function AdminCatalogPage() {
  const [items, setItems] = React.useState<CatalogItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updates, setUpdates] = React.useState<Record<string, CatalogUpdate>>({});
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setUpdates({}); // Clear pending updates on refresh
    try {
      const res = await fetch('/api/catalog');
      if (res.ok) {
        setItems(await res.json());
      } else {
        toast.error('Katalog yüklenemedi');
      }
    } catch (error) {
      toast.error('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (variantId: string, field: keyof CatalogUpdate, value: number) => {
    setUpdates(prev => {
      const currentUpdate = prev[variantId] || { variant_id: variantId };
      return {
        ...prev,
        [variantId]: {
            ...currentUpdate,
            [field]: value
        }
      };
    });
  };

  const handleSave = async () => {
    const updateList = Object.values(updates);
    if (updateList.length === 0) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/catalog/batch', {
        method: 'PUT',
        body: JSON.stringify(updateList),
      });

      if (res.ok) {
        toast.success(`${updateList.length} ürün güncellendi.`);
        await fetchData(); // Refresh data to get verified server state and clear "dirty" UI
      } else {
        toast.error('Kaydedilirken hata oluştu.');
      }
    } catch (error) {
      toast.error('Hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = Object.keys(updates).length > 0;

  if (loading && items.length === 0) return <div className="p-10">Katalog Yükleniyor...</div>;

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-32">
      
      {/* Header */}
      <header className="px-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Katalog Yönetimi</h1>
          <p className="text-sm font-medium text-neutral-400 uppercase tracking-widest mt-1">Toplu Fiyat ve Stok Düzenleme</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={fetchData} disabled={isSaving}>
             <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} /> Yenile
           </Button>
           <Button 
             variant="primary" 
             size="sm" 
             onClick={handleSave} 
             disabled={!hasChanges || isSaving}
             className={cn("transition-all", hasChanges ? "opacity-100 translate-y-0" : "opacity-50")}
           >
             <Save className="mr-2 h-4 w-4" /> 
             {isSaving ? 'Kaydediliyor...' : hasChanges ? `${Object.keys(updates).length} Değişikliği Kaydet` : 'Kaydet'}
           </Button>
        </div>
      </header>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-800">
            <p className="font-bold">Nasıl Kullanılır?</p>
            <p>Tablodaki Fiyat, Stok ve Maliyet alanlarına tıklayarak doğrudan değişiklik yapabilirsiniz. Değişiklikleriniz "hafızada" tutulur, <strong>Kaydet</strong> butonuna basana kadar veritabanına yazılmaz.</p>
        </div>
      </div>

      {/* Data Grid */}
      <div className="rounded-[32px] bg-white border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="bg-neutral-50/50 border-b border-neutral-100">
                        <th className="px-6 py-4 font-bold text-neutral-900">Ürün</th>
                        <th className="px-6 py-4 font-bold text-neutral-900">SKU / Varyant</th>
                        <th className="px-6 py-4 font-bold text-neutral-900 w-32">Maliyet (TL)</th>
                        <th className="px-6 py-4 font-bold text-neutral-900 w-32">Satış Fiyatı (TL)</th>
                        <th className="px-6 py-4 font-bold text-neutral-900 w-24">Stok</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                    {items.map((item) => {
                        const isDirty = !!updates[item.variant_id];
                        const pendingUpdate = updates[item.variant_id];

                        return (
                        <tr key={item.variant_id} className={cn("group transition-colors", isDirty ? "bg-orange-50/30 hover:bg-orange-50/50" : "hover:bg-neutral-50")}>
                            <td className="px-6 py-4">
                                <span className="font-bold text-neutral-900 block">{item.product_name}</span>
                            </td>
                            <td className="px-6 py-4 text-neutral-500">
                                <div className="flex flex-col">
                                    <span className="text-xs font-mono bg-neutral-100 px-1 py-0.5 rounded w-fit mb-1">{item.sku}</span>
                                    <span className="text-xs">{item.color || '-'} / {item.size || '-'}</span>
                                </div>
                            </td>
                            
                            {/* Cost Input */}
                            <td className="px-6 py-4">
                                <input 
                                    type="number"
                                    className={cn(
                                        "w-full bg-transparent border-b border-transparent focus:border-neutral-900 focus:outline-none py-1 font-mono transition-colors",
                                        pendingUpdate?.cost_price !== undefined ? "font-bold text-orange-600 border-orange-200" : "text-neutral-600"
                                    )}
                                    defaultValue={item.cost_price}
                                    onChange={(e) => handleChange(item.variant_id, 'cost_price', parseFloat(e.target.value))}
                                />
                            </td>

                            {/* Price Input */}
                            <td className="px-6 py-4">
                                <input 
                                    type="number"
                                    className={cn(
                                        "w-full bg-transparent border-b border-transparent focus:border-neutral-900 focus:outline-none py-1 font-bold transition-colors",
                                        pendingUpdate?.price !== undefined ? "text-orange-600 border-orange-200" : "text-neutral-900"
                                    )}
                                    defaultValue={item.price}
                                    onChange={(e) => handleChange(item.variant_id, 'price', parseFloat(e.target.value))}
                                />
                            </td>

                            {/* Stock Input */}
                            <td className="px-6 py-4">
                                <input 
                                    type="number"
                                    className={cn(
                                        "w-full bg-transparent border-b border-transparent focus:border-neutral-900 focus:outline-none py-1 font-mono transition-colors",
                                        pendingUpdate?.stock !== undefined ? "font-bold text-orange-600 border-orange-200" : 
                                        item.stock < 5 ? "text-red-600 font-bold" : "text-neutral-600"
                                    )}
                                    defaultValue={item.stock}
                                    onChange={(e) => handleChange(item.variant_id, 'stock', parseFloat(e.target.value))}
                                />
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
}
