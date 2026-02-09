'use client';

import * as React from 'react';
import { useCartStore } from '@/store/cart-store';

export function CartClearer() {
  const { clear } = useCartStore();

  React.useEffect(() => {
    clear();
  }, [clear]);

  return null;
}
