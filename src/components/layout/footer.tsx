'use client';

import * as React from 'react';
import Link from 'next/link';
import { Instagram, MessageCircle, Mail, Phone } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

export function Footer() {
  const { settings } = useSettings();
  
  const whatsappNumber = settings?.contact.whatsapp?.replace(/[^0-9]/g, '') || '';
  const email = settings?.contact.email || '';

  return (
    <footer className="bg-white py-10 border-t border-neutral-100">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <Link href="/" className="text-xl font-black tracking-tighter italic">LESYA</Link>
            <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">© 2026 Tüm Hakları Saklıdır</p>
          </div>

          {/* Minimal Navigation */}
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <Link href="/urunler" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors">Ürünler</Link>
            <Link href="/takip" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors">Sipariş Takibi</Link>
            {email && (
                <a href={`mailto:${email}`} className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors">İletişim</a>
            )}
            <Link href="/iade" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors">İade</Link>
            <Link href="/gizlilik" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors">Gizlilik</Link>
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-5 text-neutral-400">
            <a href="https://www.instagram.com/studio.lesya" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors"><Instagram size={18} /></a>
            {whatsappNumber && (
                <a 
                    href={`https://wa.me/${whatsappNumber}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-green-600 transition-colors"
                    title="WhatsApp"
                >
                    <MessageCircle size={18} />
                </a>
            )}
            {email && (
                <a href={`mailto:${email}`} className="hover:text-neutral-900 transition-colors"><Mail size={18} /></a>
            )}
          </div>

        </div>
      </div>
    </footer>
  );
}