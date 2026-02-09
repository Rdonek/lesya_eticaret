
import { createClient } from '@/lib/supabase/client';

export type CatalogItem = {
  variant_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  size: string | null;
  color: string | null;
  price: number;
  stock: number;
  cost_price: number;
};

export type CatalogUpdate = {
  variant_id: string;
  price?: number;
  stock?: number;
  cost_price?: number;
};

export const catalogService = {
  async getAllVariants(): Promise<CatalogItem[]> {
    const supabase = createClient();
    
    // Join products and variants
    const { data, error } = await supabase
      .from('product_variants')
      .select(`
        id,
        sku,
        size,
        color,
        price,
        stock,
        cost_price,
        products (
          id,
          name,
          base_price
        )
      `)
      .order('products(name)', { ascending: true });

    if (error) {
      console.error('Error fetching catalog:', error);
      throw error;
    }

    // Flatten and normalize data
    return data.map((variant: any) => ({
      variant_id: variant.id,
      product_id: variant.products.id,
      product_name: variant.products.name,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      // Variant price might be null if it uses base_price, but for catalog we want explicit control usually.
      // If null, we show base_price. When saving, we save to variant price, effectively overriding it.
      price: variant.price ?? variant.products.base_price, 
      stock: variant.stock,
      cost_price: variant.cost_price || 0
    }));
  },

  async batchUpdateVariants(updates: CatalogUpdate[]) {
    const supabase = createClient();
    
    // Supabase doesn't support bulk update with different values for different rows in one reliable query easily via client helper
    // without using 'upsert' which requires all columns.
    // However, since we only update price/stock/cost, we can iterate or use upsert if we had all data.
    // Best interaction for bulk here: Loop updates. It's not atomic but fine for this scale (3-4 products).
    // For larger scale, we would use a stored procedure.
    
    const results = [];
    const errors = [];

    for (const update of updates) {
      const { variant_id, ...fields } = update;
      
      const { data, error } = await supabase
        .from('product_variants')
        .update(fields)
        .eq('id', variant_id)
        .select();

      if (error) errors.push({ variant_id, error });
      else results.push(data);
    }

    if (errors.length > 0) {
      console.error('Batch update errors:', errors);
      throw new Error(`Failed to update ${errors.length} items`);
    }

    return results;
  }
};
