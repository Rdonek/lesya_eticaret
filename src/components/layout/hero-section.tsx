'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';

export function HeroSection() {
  return (
    <div className="px-4 pt-4 md:px-6 md:pt-6">
      <div className="relative h-[500px] w-full overflow-hidden rounded-3xl md:h-[600px] lg:h-[700px]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070")',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative flex h-full items-end p-6 md:p-12 lg:p-16">
          <div className="max-w-2xl space-y-4 md:space-y-6">
            <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-md md:text-sm">
              2026 İlkbahar / Yaz
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-7xl">
              Doğallığın <br /> Modern Yüzü.
            </h1>
            <p className="max-w-lg text-base text-neutral-200 md:text-xl">
              Zamansız parçalar, sürdürülebilir kumaşlar ve minimal estetik.
            </p>
            <div className="pt-4">
              <Link href={ROUTES.PRODUCTS}>
                <Button 
                  variant="secondary"
                  size="lg" 
                  className="group h-12 gap-2 rounded-full px-8 md:h-14"
                >
                  Koleksiyonu İncele
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}