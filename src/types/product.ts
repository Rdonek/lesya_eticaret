import { Product, ProductVariant } from './database';

export type { Product, ProductVariant };

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  display_order: number;
  color?: string | null;
  created_at: string;
};

export type ProductWithVariants = Product & {
  product_variants: ProductVariant[];
  product_images: ProductImage[];
  categories?: {
    name: string;
    slug: string;
  } | null;
};