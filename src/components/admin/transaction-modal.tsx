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
import { Label } from '@/components/ui/label';
import { Loader2, Plus } from 'lucide-react';
import { financeService } from '@/lib/services/finance-service';
import { useToast } from '@/providers/toast-provider';
import { cn } from '@/lib/utils';

type TransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const CATEGORIES = [
  'marketing', 'rent', 'salary', 'inventory', 'other'
];

export function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const [type, setType] = React.useState<'income' | 'expense'>('expense');
  const [category, setCategory] = React.useState('other');
  const [amount, setAmount] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!amount || !description) return;
    
    setLoading(true);
    try {
      await financeService.addTransaction({
        type,
        category,
        amount: parseFloat(amount),
        description,
        date: new Date().toISOString(),
        source: 'manual'
      } as any);

      showToast('İşlem başarıyla kaydedildi.');
      setAmount('');
      setDescription('');
      onSuccess();
      onClose();
    } catch (error) {
      showToast('İşlem kaydedilemedi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[32px] p-8 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-900 text-white">
              <Plus size={20} />
            </div>
            Manuel İşlem Ekle
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-6">
          
          {/* Type Selector */}
          <div className="flex p-1 bg-neutral-100 rounded-xl">
            <button 
                onClick={() => setType('income')}
                className={cn("flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all", type === 'income' ? "bg-white shadow-sm text-green-600" : "text-neutral-400")}
            >
                Gelir
            </button>
            <button 
                onClick={() => setType('expense')}
                className={cn("flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all", type === 'expense' ? "bg-white shadow-sm text-red-600" : "text-neutral-400")}
            >
                Gider
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="ml-1">Kategori</Label>
              <select 
                className="w-full h-12 rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200 px-3 outline-none text-sm font-medium"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="ml-1">Tutar (TL)</Label>
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200 font-bold"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="ml-1">Açıklama</Label>
            <Input 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="h-12 rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200"
                placeholder="Örn: Ofis Kirası"
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
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}