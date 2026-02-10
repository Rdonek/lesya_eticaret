import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Transformed Product type for Mobile UI
 */
export type TransformedProduct = {
  id: string; // Unique combination of product ID and color
  originalId: string;
  name: string;
  description: string;
  displayColor: string;
  price: number;
  image: string;
  variants: any[];
  totalStock: number;
  categoryName?: string;
  slug: string;
};

/**
 * Helper to transform raw Supabase data into Color-based entries
 * This logic must match the web-side transformation for consistency.
 */
function transformProducts(data: any[]): TransformedProduct[] {
  const transformed: TransformedProduct[] = [];

  data?.forEach((product) => {
    // Group variants by color
    const variantsByColor = product.product_variants.reduce((acc: any, curr: any) => {
      const color = curr.color || 'Standart';
      if (!acc[color]) acc[color] = [];
      acc[color].push(curr);
      return acc;
    }, {});

    Object.keys(variantsByColor).forEach((color) => {
      const colorVariants = variantsByColor[color];
      const totalStock = colorVariants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);

      // Only show if there is stock
      if (totalStock > 0) {
        // Find images for this specific color
        const colorImages = product.product_images
          .filter((img: any) => img.color?.toLowerCase() === color.toLowerCase())
          .sort((a: any, b: any) => a.display_order - b.display_order);

        transformed.push({
          id: `${product.id}-${color}`,
          originalId: product.id,
          name: product.name,
          description: product.description,
          displayColor: color,
          price: colorVariants[0]?.price || product.base_price,
          image: colorImages[0]?.url || product.product_images[0]?.url,
          variants: colorVariants,
          totalStock: totalStock,
          categoryName: product.categories?.name,
          slug: product.slug
        });
      }
    });
  });

  return transformed;
}

/**
 * Hook to fetch all active products
 */
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name, slug),
          product_variants (*),
          product_images (*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return transformProducts(data || []);
    },
  });
}

/**
 * Hook to fetch a single product by slug
 */
export function useProductDetail(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name, slug),
          product_variants (*),
          product_images (*)
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}
