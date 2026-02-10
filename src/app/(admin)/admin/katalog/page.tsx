
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save, RefreshCw, AlertCircle, PackagePlus } from 'lucide-react';
import type { CatalogItem, CatalogUpdate } from '@/lib/services/catalog-service';
import { StockEntryModal } from '@/components/admin/stock-entry-modal';

export default function AdminCatalogPage() {
  const [items, setItems] = React.useState<CatalogItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updates, setUpdates] = React.useState<Record<string, CatalogUpdate>>({});
  const [isSaving, setIsSaving] = React.useState(false);

  // Stock Modal State
  const [selectedVariant, setSelectedVariant] = React.useState<any>(null);
  const [isStockModalOpen, setIsStockModalOpen] = React.useState(false);

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

  const handleStockClick = (item: CatalogItem) => {
    setSelectedVariant({
      id: item.variant_id,
      cost_price: item.cost_price,
      products: { name: item.product_name },
      color: item.color,
      size: item.size
    });
    setIsStockModalOpen(true);
  };

  const handleChange = (variantId: string, field: keyof CatalogUpdate, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    
    setUpdates(prev => {
      const currentUpdate = prev[variantId] || { variant_id: variantId };
      return {
        ...prev,
        [variantId]: {
            ...currentUpdate,
            [field]: numValue
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
          <p className="text-sm font-medium text-neutral-400 uppercase tracking-widest mt-1">Toplu Fiyat ve Maliyet Düzenleme</p>
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
            <p className="font-bold">Finansal Güvenlik Uyarısı</p>
            <p>Fiyat ve Maliyet alanlarını buradan topluca düzenleyebilirsiniz. <strong>Stok girişleri</strong> maliyet ortalamasını ve kasa nakit akışını etkilediği için sağdaki buton aracılığıyla güvenli modda yapılır.</p>
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
                        <th className="px-6 py-4 font-bold text-neutral-900 w-32">Stok Durumu</th>
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
                            
                            {/* Cost - LOCKED LABEL */}
                            <td className="px-6 py-4">
                                <div className="bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-100/50 text-center">
                                    <span className="font-mono text-xs font-bold text-neutral-400 select-none">
                                        {formatPrice(item.cost_price)}
                                    </span>
                                </div>
                            </td>

                            {/* Price Input */}
                            <td className="px-6 py-4">
                                <div className="relative flex items-center">
                                    <input 
                                        type="number"
                                        min="0"
                                        className={cn(
                                            "w-full bg-neutral-50/50 rounded-lg px-3 py-2 text-sm font-bold outline-none border border-transparent focus:border-neutral-200 transition-all",
                                            pendingUpdate?.price !== undefined ? "text-orange-600 bg-orange-50/50 border-orange-100" : "text-neutral-900"
                                        )}
                                        value={pendingUpdate?.price ?? item.price}
                                        onChange={(e) => handleChange(item.variant_id, 'price', e.target.value)}
                                        onBlur={(e) => {
                                            if (e.target.value === '') handleChange(item.variant_id, 'price', '0');
                                        }}
                                    />
                                </div>
                            </td>

                            {/* Stock - COMPLETELY LOCKED LABEL */}
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-between bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-100/50">
                                    <span className={cn(
                                        "font-mono font-black text-xs select-none",
                                        item.stock < 5 ? "text-red-600" : "text-neutral-600"
                                    )}>
                                        {item.stock} <span className="text-[9px] opacity-50 ml-0.5">ADET</span>
                                    </span>
                                    <button 
                                        onClick={() => handleStockClick(item)}
                                        className="h-6 w-6 rounded-lg bg-white shadow-sm border border-neutral-100 flex items-center justify-center text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all active:scale-90"
                                        title="Stok Girişi Yap"
                                    >
                                        <PackagePlus size={12} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
      </div>

      <StockEntryModal 
        isOpen={isStockModalOpen}
        onClose={() => {
            setIsStockModalOpen(false);
            setSelectedVariant(null);
        }}
        variant={selectedVariant}
        onSuccess={fetchData}
      />

    </div>
  );
}
