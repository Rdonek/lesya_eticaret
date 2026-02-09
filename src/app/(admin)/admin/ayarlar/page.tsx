'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  Percent,
  Phone,
  Store,
  Truck,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AdminHeader } from '@/components/admin/header';

export default function AdminSettingsPage() {
  const supabase = createClient();
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  
  // Settings State
  const [settings, setSettings] = React.useState<any>({
    shipping: { free_threshold: 500, standard_fee: 30 },
    tax: { vat_rate: 20 },
    store_status: { is_active: true, message: '' },
    contact: { whatsapp: '', email: '', phone: '' }
  });

  React.useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings((prev: any) => ({ ...prev, ...data }));
        }
      } catch (error) {
        toast.error('Ayarlar yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [supabase]);

  const handleSave = async (section: string, key: string, value: any) => {
    setSaving(true);
    try {
      const payload = { 
        key: section, 
        value: { ...settings[section], [key]: value } 
      };

      const res = await fetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Save failed');
      
      setSettings((prev: any) => ({
        ...prev,
        [section]: { ...prev[section], [key]: value }
      }));

      toast.success('Ayarlar güncellendi.');
    } catch (error) {
      toast.error('Kaydetme hatası.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) return <div className="p-10 text-center text-xs font-bold text-neutral-400 animate-pulse uppercase tracking-widest">Yükleniyor...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-32">
      
      <AdminHeader 
        title="Ayarlar" 
        description="Mağaza yapılandırması ve yönetim."
      >
        <Button variant="outline" size="sm" onClick={handleSignOut} className="h-9 px-4 rounded-xl border-neutral-200 text-xs font-bold text-red-600 hover:bg-red-50 hover:border-red-100 transition-all gap-2">
            <LogOut size={14} /> Çıkış Yap
        </Button>
      </AdminHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
        
        {/* Col 1: Store Status & Contact */}
        <div className="space-y-6">
            
            {/* Store Status */}
            <div className="rounded-[28px] bg-white p-6 border border-neutral-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center transition-colors", settings.store_status.is_active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                            <Store size={18} />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-neutral-900 block">Mağaza Durumu</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                                {settings.store_status.is_active ? 'Yayında' : 'Bakım Modu'}
                            </span>
                        </div>
                    </div>
                    <div className={cn("h-2 w-2 rounded-full", settings.store_status.is_active ? "bg-green-500" : "bg-red-500 animate-pulse")} />
                </div>
                
                <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
                    Mağazayı bakıma almak için kapatabilirsiniz. Bakım modunda sadece yöneticiler siteye erişebilir.
                </p>

                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => handleSave('store_status', 'is_active', true)}
                        className={cn("h-9 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", settings.store_status.is_active ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/10" : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100")}
                    >
                        Açık
                    </button>
                    <button 
                        onClick={() => handleSave('store_status', 'is_active', false)}
                        className={cn("h-9 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", !settings.store_status.is_active ? "bg-red-600 text-white shadow-lg shadow-red-600/10" : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100")}
                    >
                        Kapalı
                    </button>
                </div>
            </div>

            {/* Contact Info */}
            <div className="rounded-[28px] bg-white p-6 border border-neutral-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-neutral-50 pb-4">
                    <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                        <Phone size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">İletişim Bilgileri</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">WhatsApp Hattı</label>
                        <input 
                            type="text" 
                            placeholder="90532..."
                            value={settings.contact.whatsapp}
                            onChange={(e) => setSettings({...settings, contact: {...settings.contact, whatsapp: e.target.value}})}
                            onBlur={(e) => handleSave('contact', 'whatsapp', e.target.value)}
                            className="w-full h-10 rounded-xl border-neutral-200 bg-neutral-50 px-4 text-xs font-bold focus:bg-white focus:ring-4 focus:ring-neutral-900/5 outline-none transition-all"
                        />
                    </div>
                   <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Destek E-posta</label>
                        <input 
                            type="email" 
                            placeholder="destek@lesya.com"
                            value={settings.contact.email}
                            onChange={(e) => setSettings({...settings, contact: {...settings.contact, email: e.target.value}})}
                            onBlur={(e) => handleSave('contact', 'email', e.target.value)}
                            className="w-full h-10 rounded-xl border-neutral-200 bg-neutral-50 px-4 text-xs font-bold focus:bg-white focus:ring-4 focus:ring-neutral-900/5 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Col 2: Shipping & Tax & Account */}
        <div className="space-y-6">
            
            {/* Shipping & Tax */}
            <div className="rounded-[28px] bg-white p-6 border border-neutral-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-neutral-50 pb-4">
                    <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Truck size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">Kargo ve Vergi</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Kargo Ücreti (TL)</label>
                        <input 
                            type="number" 
                            value={settings.shipping.standard_fee}
                            onChange={(e) => setSettings({...settings, shipping: {...settings.shipping, standard_fee: Number(e.target.value)}})}
                            onBlur={(e) => handleSave('shipping', 'standard_fee', Number(e.target.value))}
                            className="w-full h-10 rounded-xl border-neutral-200 bg-neutral-50 px-4 text-xs font-bold focus:bg-white focus:ring-4 focus:ring-neutral-900/5 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Ücretsiz Kargo Alt Limiti</label>
                        <input 
                            type="number" 
                            value={settings.shipping.free_threshold}
                            onChange={(e) => setSettings({...settings, shipping: {...settings.shipping, free_threshold: Number(e.target.value)}})}
                            onBlur={(e) => handleSave('shipping', 'free_threshold', Number(e.target.value))}
                            className="w-full h-10 rounded-xl border-neutral-200 bg-neutral-50 px-4 text-xs font-bold focus:bg-white focus:ring-4 focus:ring-neutral-900/5 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">KDV Oranı (%)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={settings.tax.vat_rate}
                                onChange={(e) => setSettings({...settings, tax: {...settings.tax, vat_rate: Number(e.target.value)}})}
                                onBlur={(e) => handleSave('tax', 'vat_rate', Number(e.target.value))}
                                className="w-full h-10 rounded-xl border-neutral-200 bg-neutral-50 px-4 text-xs font-bold focus:bg-white focus:ring-4 focus:ring-neutral-900/5 outline-none transition-all"
                            />
                            <Percent size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Info */}
            <div className="rounded-[28px] bg-neutral-50 p-6 border border-neutral-100/50 shadow-inner flex items-center gap-4">
                 <div className="h-10 w-10 rounded-full bg-white border border-neutral-200 overflow-hidden shrink-0 shadow-sm">
                     <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                        alt="Profile" 
                        className="h-full w-full object-cover"
                     />
                 </div>
                 <div className="min-w-0">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Aktif Yönetici</p>
                     <p className="text-xs font-bold text-neutral-900 truncate">{user?.email}</p>
                 </div>
            </div>

        </div>

      </div>
    </div>
  );
}