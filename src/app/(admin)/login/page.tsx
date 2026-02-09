'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/providers/toast-provider';

export default function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showToast('Hoş geldin patron.');
      router.push('/admin');
    } catch (error: any) {
      showToast(error.message || 'Giriş başarısız', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-50 px-4">
      {/* Background Decor (Apple-ish gradients) */}
      <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-neutral-200/50 blur-[120px]" />
      <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-neutral-300/30 blur-[120px]" />

      <div className="relative w-full max-w-[440px] space-y-10">
        <div className="text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-neutral-900 shadow-2xl mb-8">
            <img src="/logo.svg" alt="Logo" className="h-10 w-auto invert" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">Yönetim Paneli</h1>
          <p className="mt-3 text-sm font-medium text-neutral-500">Lesya operasyon merkezine giriş yapın.</p>
        </div>

        <div className="rounded-[32px] border border-white/40 bg-white/70 p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] backdrop-blur-xl md:p-12">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Kimlik</label>
              <Input
                type="email"
                placeholder="E-posta adresiniz"
                className="h-12 rounded-2xl border-neutral-100 bg-neutral-50/50 focus:bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Güvenlik</label>
              <Input
                type="password"
                placeholder="Şifreniz"
                className="h-12 rounded-2xl border-neutral-100 bg-neutral-50/50 focus:bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-14 rounded-2xl text-base font-bold transition-all hover:shadow-2xl active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? 'Doğrulanıyor...' : 'Giriş Yap'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-400">
          &copy; {new Date().getFullYear()} Lesya Boutique. All rights reserved.
        </p>
      </div>
    </main>
  );
}