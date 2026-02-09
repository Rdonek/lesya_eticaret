'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { checkoutSchema, type CheckoutFormData } from '@/schemas/checkout-schema';

type CheckoutFormProps = {
  onSubmit: (data: CheckoutFormData) => void;
  isSubmitting?: boolean;
};

export function CheckoutForm({ onSubmit, isSubmitting = false }: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Ad Soyad
          </label>
          <Input
            id="name"
            placeholder="Adınız Soyadınız"
            {...register('name')}
            aria-invalid={!!errors.name}
            className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {errors.name && (
            <p className="mt-1 text-xs font-medium text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500">
            E-posta
          </label>
          <Input
            id="email"
            type="email"
            placeholder="ornek@email.com"
            {...register('email')}
            aria-invalid={!!errors.email}
            className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {errors.email && (
            <p className="mt-1 text-xs font-medium text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Telefon
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="05xxxxxxxxx"
            maxLength={11}
            {...register('phone')}
            aria-invalid={!!errors.phone}
            className={errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {errors.phone && (
            <p className="mt-1 text-xs font-medium text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="address" className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Adres
          </label>
          <Input
            id="address"
            placeholder="Sokak, Mahalle, No..."
            {...register('address')}
            aria-invalid={!!errors.address}
            className={errors.address ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {errors.address && (
            <p className="mt-1 text-xs font-medium text-red-500">{errors.address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="city" className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Şehir
            </label>
            <Input
              id="city"
              placeholder="Şehir"
              {...register('city')}
              aria-invalid={!!errors.city}
              className={errors.city ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.city && (
              <p className="mt-1 text-xs font-medium text-red-500">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="postalCode" className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Posta Kodu
            </label>
            <Input
              id="postalCode"
              placeholder="İsteğe bağlı"
              {...register('postalCode')}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full h-14 text-base"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'İşleniyor...' : 'Ödemeye Geç'}
      </Button>
    </form>
  );
}
