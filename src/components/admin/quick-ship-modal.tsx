'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type QuickShipModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (trackingNumber: string) => Promise<void>;
  isProcessing: boolean;
};

export function QuickShipModal({ isOpen, onClose, onConfirm, isProcessing }: QuickShipModalProps) {
  const [trackingNumber, setTrackingNumber] = React.useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-[32px] bg-white p-8 shadow-2xl slide-in-from-bottom-8 animate-in duration-300 border border-neutral-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-neutral-900">Kargola</h3>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full bg-neutral-50 text-neutral-400 hover:text-neutral-900 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Takip Numarası</label>
            <Input 
              autoFocus
              placeholder="Kargo kodunu girin"
              className="h-12 rounded-xl border-neutral-200 bg-white focus:ring-2 focus:ring-neutral-900 transition-all"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>
          <Button 
            className="w-full h-12 rounded-xl bg-neutral-900 text-white font-bold shadow-lg shadow-neutral-900/20 transition-transform active:scale-[0.98]"
            onClick={() => onConfirm(trackingNumber)}
            disabled={isProcessing || !trackingNumber}
          >
            {isProcessing ? 'İşleniyor...' : 'Kargola ve Bildir'}
          </Button>
        </div>
      </div>
    </div>
  );
}
