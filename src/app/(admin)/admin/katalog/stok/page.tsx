'use client';

import * as React from 'react';
import { productService } from '@/lib/services/product-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/providers/toast-provider';
import { ChevronLeft, Save, Loader2, Search, TrendingUp, PackagePlus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { StockEntryModal } from '@/components/admin/stock-entry-modal';
import { AdminHeader } from '@/components/admin/header';

export default function BulkStockPage() {
  const [variants, setVariants] = React.useState<any[]>([]);
  const [originalVariants, setVariantsOriginal] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [selectedVariant, setSelectedVariant] = React.useState<any>(null);
  const { showToast } = useToast();

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getAllVariantsForBulk();
      setVariants(JSON.parse(JSON.stringify(data))); 
      setVariantsOriginal(JSON.parse(JSON.stringify(data)));
    } catch (error) {
      showToast('Veriler yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (id: string, field: string, value: string) => {
    setVariants(prev => prev.map(v => {
      if (v.id === id) {
        return { ...v, [field]: value === '' ? 0 : parseFloat(value) };
      }
      return v;
    }));
  };

  const getChangedVariants = () => {
    return variants.filter((v, idx) => {
      const orig = originalVariants.find(ov => ov.id === v.id);
      if (!orig) return false;
      return v.price !== orig.price || v.cost_price !== orig.cost_price;
    });
  };

  const handleBulkSave = async () => {
    const changed = getChangedVariants();
    if (changed.length === 0) {
      showToast('Değişiklik bulunamadı');
      return;
    }

    setSaving(true);
    try {
      const payload = changed.map(v => ({
        id: v.id,
        price: v.price === 0 ? null : v.price,
        cost_price: v.cost_price
      }));

      await productService.bulkUpdateVariants(payload);
      showToast(`${changed.length} varyant güncellendi`);
      fetchData();
    } catch (error) {
      showToast('Güncelleme sırasında hata oluştu', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredVariants = variants.filter(v => 
    v.products?.name.toLowerCase().includes(search.toLowerCase()) || 
    v.sku.toLowerCase().includes(search.toLowerCase()) ||
    v.color?.toLowerCase().includes(search.toLowerCase())
  );

  const changedCount = getChangedVariants().length;

  return (
    <div className="space-y-6 pb-40">
      
      <AdminHeader title="Hızlı Stok">
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <Input 
                    placeholder="Ara..." 
                    className="pl-9 h-9 w-32 md:w-64 rounded-xl bg-white border-neutral-200 text-xs"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <Button 
                onClick={handleBulkSave} 
                disabled={saving || changedCount === 0}
                className={cn(
                    "h-9 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all gap-2",
                    changedCount > 0 ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/20" : "bg-neutral-100 text-neutral-400"
                )}
            >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                {changedCount > 0 ? `KAYDET (${changedCount})` : 'KAYDET'}
            </Button>
        </div>
      </AdminHeader>

      {/* MOBILE LIST VIEW (Cards) - Hidden on Tablet/Desktop */}
      <div className="grid grid-cols-1 gap-4 md:hidden px-1">
        {loading ? (
            [1,2,3].map(i => <div key={i} className="h-48 rounded-3xl bg-white animate-pulse border border-neutral-100" />)
        ) : filteredVariants.map((v) => {
            const salePrice = v.price || v.products?.base_price || 0;
            const profit = salePrice - v.cost_price;
            const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;

            return (
                <div key={v.id} className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="min-w-0">
                            <p className="font-bold text-neutral-900 text-sm truncate">{v.products?.name}</p>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{v.color} / {v.size}</p>
                        </div>
                        <button 
                            onClick={() => setSelectedVariant(v)}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-neutral-900 text-white shadow-lg shadow-neutral-900/20"
                        >
                            <PackagePlus size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-neutral-400 uppercase tracking-tighter ml-1">Maliyet (TL)</label>
                            <Input 
                                type="number" 
                                value={v.cost_price}
                                onChange={(e) => handleInputChange(v.id, 'cost_price', e.target.value)}
                                className="h-10 rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200 font-bold"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-neutral-400 uppercase tracking-tighter ml-1">Satış (TL)</label>
                            <Input 
                                type="number" 
                                value={v.price || v.products?.base_price}
                                onChange={(e) => handleInputChange(v.id, 'price', e.target.value)}
                                className="h-10 rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200 font-bold"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-50">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Stok:</span>
                            <span className={cn("text-xs font-black", v.stock < 5 ? "text-red-600" : "text-neutral-900")}>{v.stock} Adet</span>
                        </div>
                        <div className={cn("flex items-center gap-1 font-black text-xs", margin > 30 ? "text-green-600" : "text-amber-600")}>
                            {margin > 0 && <TrendingUp size={12} />} %{margin.toFixed(0)} Kâr
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      {/* DESKTOP TABLE VIEW - Hidden on Mobile */}
      <div className="hidden md:block rounded-[32px] bg-white border border-neutral-100 shadow-sm overflow-hidden mx-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100">
                <th className="px-6 py-4 font-bold text-neutral-900">Ürün & Varyant</th>
                <th className="px-6 py-4 font-bold text-neutral-900 w-32 text-center">Mevcut Stok</th>
                <th className="px-6 py-4 font-bold text-neutral-900 w-40">Maliyet (TL)</th>
                <th className="px-6 py-4 font-bold text-neutral-900 w-40">Satış (TL)</th>
                <th className="px-6 py-4 font-bold text-neutral-900 w-32 text-right">Kâr (%)</th>
                <th className="px-6 py-4 font-bold text-neutral-900 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan={6} className="h-16 px-6" /></tr>
                ))
              ) : filteredVariants.map((v) => {
                const salePrice = v.price || v.products?.base_price || 0;
                const profit = salePrice - v.cost_price;
                const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;

                return (
                  <tr key={v.id} className="group hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="min-w-[200px]">
                        <p className="font-bold text-neutral-900">{v.products?.name}</p>
                        <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-tighter mt-0.5">
                          {v.color} / {v.size} — {v.sku}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className={cn(
                            "px-3 py-1 rounded-full font-bold text-xs border",
                            v.stock === 0 ? "bg-red-50 border-red-100 text-red-600" : 
                            v.stock < 5 ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-neutral-100 border-neutral-200 text-neutral-600"
                        )}>
                            {v.stock} Adet
                        </span>
                    </td>
                    <td className="px-6 py-4">
                      <Input 
                        type="number" 
                        step="0.01"
                        value={v.cost_price}
                        onChange={(e) => handleInputChange(v.id, 'cost_price', e.target.value)}
                        className="h-9 rounded-lg bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200 text-sm font-bold"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Input 
                        type="number" 
                        step="0.01"
                        value={v.price || v.products?.base_price}
                        onChange={(e) => handleInputChange(v.id, 'price', e.target.value)}
                        className="h-9 rounded-lg bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200 text-sm font-bold"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={cn(
                        "inline-flex items-center gap-1 font-black tracking-tighter text-sm",
                        margin > 30 ? "text-green-600" : margin > 0 ? "text-amber-600" : "text-red-600"
                      )}>
                        {margin > 0 && <TrendingUp size={12} />}
                        %{margin.toFixed(0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button 
                            onClick={() => setSelectedVariant(v)}
                            className="h-9 w-9 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 hover:bg-neutral-900 hover:text-white transition-all shadow-inner mx-auto"
                        >
                            <PackagePlus size={16} />
                        </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <StockEntryModal 
        isOpen={!!selectedVariant}
        onClose={() => setSelectedVariant(null)}
        variant={selectedVariant}
        onSuccess={fetchData}
      />
    </div>
  );
}