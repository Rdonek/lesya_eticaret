'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Hash, Mail, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/providers/toast-provider';
import { createClient } from '@/lib/supabase/client';

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [forgotLoading, setForgotLoading] = React.useState(false);
  const { showToast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !email) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', orderNumber.toUpperCase().trim())
        .eq('email', email.toLowerCase().trim())
        .single();

      if (error || !data) {
        showToast('Sipariş bulunamadı. Lütfen bilgilerinizi kontrol edin.', 'error');
      } else {
        router.push(`/siparis/${data.id}?track=true`);
      }
    } catch (e) {
      showToast('Bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotOrderNumber = async () => {
    if (!email) {
      showToast('Lütfen önce e-posta adresinizi girin.', 'error');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'forgot_order_number' }),
      });

      if (response.ok) {
        showToast('Sipariş bilgileriniz mail adresinize gönderildi.');
      } else {
        showToast('Bilgileriniz gönderilemedi. Lütfen tekrar deneyin.', 'error');
      }
    } catch (e) {
      showToast('Bir hata oluştu.', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] bg-neutral-50/50 flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-md space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900">Sipariş Takibi</h1>
          <p className="text-sm font-medium text-neutral-400">Siparişinizin durumunu öğrenmek için bilgileri girin.</p>
        </div>

        <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-xl shadow-neutral-900/5 border border-neutral-100 space-y-6">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Sipariş Numarası</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                <Input 
                  placeholder="ORD-123456" 
                  className="h-14 pl-11 rounded-2xl bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200 font-mono font-bold uppercase"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">E-Posta Adresi</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                <Input 
                  type="email"
                  placeholder="ornegin@mail.com" 
                  className="h-14 pl-11 rounded-2xl bg-neutral-50 border-transparent focus:bg-white focus:border-neutral-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-neutral-900 text-white font-bold text-sm shadow-lg shadow-neutral-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Search size={18} />}
              Siparişi Sorgula
            </Button>
          </form>

          <div className="pt-6 border-t border-neutral-50 text-center">
            <button 
              onClick={handleForgotOrderNumber}
              disabled={forgotLoading}
              className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              {forgotLoading ? <Loader2 className="animate-spin h-3 w-3" /> : <ArrowRight size={14} />}
              Sipariş Numaramı Hatırlamıyorum
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-neutral-400 font-medium px-8 leading-relaxed">
          Kargoya verilen siparişlerin takip numarası sorgulama ekranında görünecektir. 
          Destek için: <a href="mailto:hello@lesyastudio.com" className="text-neutral-900 underline">hello@lesyastudio.com</a>
        </p>
      </div>
    </main>
  );
}
