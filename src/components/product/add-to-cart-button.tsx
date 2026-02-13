'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { Product } from '@/types/database';
import { useToast } from '@/providers/toast-provider';
import { usePixel } from '@/hooks/use-pixel';

type AddToCartButtonProps = {
  product: Product;
};

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { track } = usePixel();
  const [loading, setLoading] = React.useState(false);
  const { addItem } = useCartStore();
  const { showToast } = useToast();

  const handleAddToCart = () => {
    setLoading(true);

    const variants = (product as any).product_variants || [];
    const firstVariant = variants[0];
    const availableStock = firstVariant ? (firstVariant.stock - firstVariant.reserved_stock) : 99;

    // Track Meta AddToCart
    track('AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: product.base_price,
      currency: 'TRY'
    }, `atc_grid_${product.id}_${Date.now()}`);
    
    addItem({
      variantId: firstVariant?.id || product.id,
      productId: product.id,
      name: product.name,
      price: product.base_price,
      quantity: 1,
      image: (product as any).product_images?.[0]?.url,
      stock: availableStock
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
