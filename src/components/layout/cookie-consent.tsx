'use client';

import * as React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CookieConsent() {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Check if user already made a choice
    const consent = localStorage.getItem('lesya_cookie_consent');
    if (!consent) {
      // Delay showing the banner for better UX
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (status: 'granted' | 'denied') => {
    localStorage.setItem('lesya_cookie_consent', status);
    // Dispatch a custom event so other components (like Pixel) know the status changed
    window.dispatchEvent(new Event('cookie-consent-change'));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-xl animate-in slide-in-from-bottom-10 fade-in duration-700">
      <div className="bg-white/80 backdrop-blur-2xl border border-neutral-100 p-6 md:p-8 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center gap-6">
        
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-white">
          <ShieldCheck size={24} strokeWidth={1.5} />
        </div>

        <div className="flex-grow space-y-1 text-center md:text-left">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-900">Deneyiminizi Kişiselleştirin</h3>
          <p className="text-xs text-neutral-500 font-medium leading-relaxed">
            Size daha iyi hizmet sunabilmek ve tarzınıza uygun önerilerde bulunabilmek için çerezleri kullanıyoruz.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => handleConsent('denied')}
            className="flex-1 md:flex-none text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors py-3 px-4"
          >
            Reddet
          </button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => handleConsent('granted')}
            className="flex-1 md:flex-none h-12 px-8 rounded-2xl bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-neutral-900/20 active:scale-95 transition-all"
          >
            Kabul Et
          </Button>
        </div>

      </div>
    </div>
  );
}
