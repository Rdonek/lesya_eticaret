import { createClient } from '@/lib/supabase/client';
import type { Product, ProductWithVariants } from '@/types/product';

export const productService = {
  _transform(data: any[]) {
    const transformed: any[] = [];
    data?.forEach((product) => {
      const variantsByColor = product.product_variants.reduce((acc: any, curr: any) => {
        const color = curr.color || 'Standart';
        if (!acc[color]) acc[color] = [];
        acc[color].push(curr);
        return acc;
      }, {});

      Object.keys(variantsByColor).forEach((color) => {
        const colorVariants = variantsByColor[color];
        const totalStock = colorVariants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);

        const colorImages = product.product_images
          .filter((img: any) => img.color?.toLowerCase() === color.toLowerCase())
          .sort((a: any, b: any) => a.display_order - b.display_order);

        transformed.push({
          ...product,
          id: `${product.id}-${color}`, 
          originalId: product.id,
          displayColor: color,
          price: colorVariants[0]?.price || product.base_price,
          image: colorImages[0]?.url || product.product_images[0]?.url,
          variants: colorVariants,
          totalStock: totalStock,
          categoryName: product.categories?.name
        });
      });
    });
    return transformed;
  },

  async getAll() {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name, slug, id),
          product_variants (*),
          product_images (*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ProductService] Fetch Error:', error);
        throw error;
      }
      return this._transform(data || []);
    } catch (e) {
      console.error('[ProductService] Fatal Exception:', e);
      return [];
    }
  },

  async getBySlug(slug: string) {
    const supabase = createClient();
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
    return data as ProductWithVariants;
  },

  async getRelated(categoryId: string, excludeId: string) {
    const supabase = createClient();
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (name, slug),
        product_variants (*),
        product_images (*)
      `)
      .eq('is_active', true)
      .neq('id', excludeId);

    if (categoryId) query = query.eq('category_id', categoryId);

    const { data, error } = await query.limit(20);
    if (error) throw error;

    const allTransformed = this._transform(data || []);
    return allTransformed.sort(() => 0.5 - Math.random()).slice(0, 3);
  },

  async getTrending() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (name, slug),
        product_variants (*),
        product_images (*)
      `)
      .eq('is_active', true)
      .limit(8);

    if (error) throw error;
    const all = this._transform(data || []);
    return all.sort(() => 0.5 - Math.random()).slice(0, 4);
  },

  async getDeals() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (name, slug),
        product_variants (*),
        product_images (*)
      `)
      .eq('is_active', true)
      .order('base_price', { ascending: true }) 
      .limit(4);

    if (error) throw error;
    return this._transform(data || []);
  },

  async getAllVariantsForBulk() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('product_variants')
      .select(`
        id,
        sku,
        size,
        color,
        stock,
        price,
        cost_price,
        products (id, name, base_price)
      `)
      .order('sku', { ascending: true });

    if (error) throw error;
    return data;
  },

  async bulkUpdateVariants(updates: any[]) {
    const supabase = createClient();
    const promises = updates.map(update => 
      supabase
        .from('product_variants')
        .update({
          price: update.price,
          cost_price: update.cost_price
        })
        .eq('id', update.id)
    );
    const results = await Promise.all(promises);
    const firstError = results.find(r => r.error);
    if (firstError) throw firstError.error;
  },

  /**
   * AFI: Add stock with WEIGHTED AVERAGE COST calculation
   */
  async addStockWithFinance(payload: {
    variantId: string;
    quantity: number;
    unitCost: number;
    description?: string;
    recordAsExpense: boolean;
  }) {
    const supabase = createClient();
    const newQuantity = payload.quantity;
    const newUnitCost = payload.unitCost;
    const totalNewValue = newQuantity * newUnitCost;

    // 1. Get current stock and current cost
    const { data: variant, error: varError } = await supabase
      .from('product_variants')
      .select('stock, cost_price, products(name)')
      .eq('id', payload.variantId)
      .single();

    if (varError) throw varError;

    const currentStock = variant.stock || 0;
    const currentCost = variant.cost_price || 0;
    const totalStockAfter = currentStock + newQuantity;

    // 2. Calculate Weighted Average Cost (WAC)
    // Formula: ((Old Stock * Old Cost) + (New Stock * New Cost)) / Total Stock
    // Handle edge case: if current stock is negative (due to some error), treat as 0 for calculation
    const baseStock = Math.max(0, currentStock);
    const weightedAverageCost = totalStockAfter > 0 
        ? ((baseStock * currentCost) + (newQuantity * newUnitCost)) / totalStockAfter 
        : newUnitCost;

    // 3. Create Inventory Log (Record the actual purchase unit cost for history)
    const { data: log, error: logError } = await supabase
      .from('inventory_logs')
      .insert({
        product_variant_id: payload.variantId,
        type: 'purchase',
        quantity: newQuantity,
        unit_cost: newUnitCost,
        total_value: totalNewValue,
        description: payload.description || 'Stok Girişi'
      })
      .select()
      .single();

    if (logError) throw logError;

    // 4. Update Variant Stock & the NEW AVERAGE COST
    const { error: updateError } = await supabase
      .from('product_variants')
      .update({
        stock: totalStockAfter,
        cost_price: weightedAverageCost // Now saving the calculated average
      })
      .eq('id', payload.variantId);

    if (updateError) throw updateError;

    // 5. Create Finance Record (Actual cash out)
    if (payload.recordAsExpense && totalNewValue > 0) {
      const { error: finError } = await supabase
        .from('finances')
        .insert({
          type: 'expense',
          category: 'inventory',
          amount: totalNewValue,
          source: 'system_purchase',
          related_id: log.id,
          description: `Stok Alımı: ${(variant.products as any).name} (+${newQuantity} Adet)`
        });

      if (finError) throw finError;
    }

    return true;
  }
};