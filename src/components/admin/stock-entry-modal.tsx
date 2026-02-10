'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, PackagePlus } from 'lucide-react';
import { productService } from '@/lib/services/product-service';
import { useToast } from '@/providers/toast-provider';

type StockEntryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  variant: any;
  onSuccess: () => void;
};

export function StockEntryModal({ isOpen, onClose, variant, onSuccess }: StockEntryModalProps) {
  const [quantity, setQuantity] = React.useState('1');
  const [cost, setCost] = React.useState(variant?.cost_price?.toString() || '0');
  const [recordAsExpense, setRecordAsExpense] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const { showToast } = useToast();

  React.useEffect(() => {
    if (variant) {
      setCost(variant.cost_price?.toString() || '0');
    }
  }, [variant]);

  const handleSubmit = async () => {
    if (!variant) return;
    
    const qty = parseInt(quantity);
    const unitCost = parseFloat(cost);

    if (isNaN(qty) || qty <= 0) {
      showToast('Lütfen geçerli bir adet girin (en az 1).', 'error');
      return;
    }

    if (isNaN(unitCost) || unitCost < 0) {
      showToast('Lütfen geçerli bir maliyet girin.', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await productService.addStockWithFinance({
        variantId: variant.id,
        quantity: qty,
        unitCost: unitCost,
        recordAsExpense
      });

      showToast('Stok girişi ve finansal kayıt başarıyla yapıldı.');
      onSuccess();
      onClose();
    } catch (error) {
      showToast('İşlem sırasında bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!variant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[32px] p-8 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-900 text-white">
              <PackagePlus size={20} />
            </div>
            Stok Girişi
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Ürün / Varyant</p>
            <p className="font-bold text-neutral-900">{variant.products?.name}</p>
            <p className="text-xs text-neutral-500">{variant.color} / {variant.size}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Eklenecek Adet</Label>
              <Input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)}
                className="h-12 rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Birim Maliyet (TL)</Label>
              <Input 
                type="number" 
                step="0.01"
                value={cost} 
                onChange={(e) => setCost(e.target.value)}
                className="h-12 rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border border-neutral-100 bg-white shadow-sm">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold text-neutral-900 italic uppercase">Finansal Gider Yaz</Label>
              <p className="text-[10px] text-neutral-400 font-medium">Bu işlem kasadan nakit çıkışı olarak kaydedilsin mi?</p>
            </div>
            <Switch 
              checked={recordAsExpense} 
              onCheckedChange={setRecordAsExpense} 
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold uppercase text-xs tracking-widest">Vazgeç</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="rounded-xl bg-neutral-900 text-white font-bold px-8 h-12 shadow-lg shadow-neutral-900/20 gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Kaydı Onayla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}