'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { Product } from '@/types/database';
import { useToast } from '@/providers/toast-provider';

type AddToCartButtonProps = {
  product: Product;
};

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const { addItem } = useCartStore();
  const { showToast } = useToast();

  const handleAddToCart = () => {
    setLoading(true);
    
    addItem({
      variantId: product.id, // Using product ID as variant ID for now
      productId: product.id,
      name: product.name,
      price: product.base_price,
      quantity: 1,
      image: (product as any).product_images?.[0]?.url,
    });

    setTimeout(() => {
      setLoading(false);
      showToast('Ürün sepete eklendi');
    }, 300);
  };

  return (
    <Button 
      variant="primary" 
      size="lg" 
      onClick={handleAddToCart}
      disabled={loading}
      className="w-full md:w-auto md:min-w-[240px]"
    >
      {loading ? 'Ekleniyor...' : 'Sepete Ekle'}
    </Button>
  );
}
