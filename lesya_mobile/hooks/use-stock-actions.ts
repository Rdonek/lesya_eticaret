import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

export function useStockActions() {
  const queryClient = useQueryClient();

  // 1. ADD STOCK with Weighted Average Cost & Finance (AFI Engine)
  const addStock = useMutation({
    mutationFn: async ({ 
      variantId, 
      quantity, 
      unitCost, 
      description 
    }: { 
      variantId: string; 
      quantity: number; 
      unitCost: number;
      description?: string;
    }) => {
      const newQuantity = Number(quantity);
      const newUnitCost = Number(unitCost);

      if (newQuantity <= 0) throw new Error('Stok miktarı 0\'dan büyük olmalıdır.');
      
      const totalNewValue = newQuantity * newUnitCost;

      // A. Get current stock and cost
      const { data: variant, error: varError } = await supabase
        .from('product_variants')
        .select('stock, cost_price, products(name)')
        .eq('id', variantId)
        .single();

      if (varError) throw varError;

      const currentStock = variant.stock || 0;
      const currentCost = variant.cost_price || 0;
      const totalStockAfter = currentStock + newQuantity;

      // B. Calculate Weighted Average Cost (WAC)
      // Logic: ((Old Stock * Old Cost) + (New Stock * New Cost)) / Total Stock
      // If total stock is 0 (first entry), use new cost.
      const weightedAverageCost = totalStockAfter > 0 
          ? ((currentStock * currentCost) + (newQuantity * newUnitCost)) / totalStockAfter 
          : newUnitCost;

      // C. Create Inventory Log
      const { data: log, error: logError } = await supabase
        .from('inventory_logs')
        .insert({
          product_variant_id: variantId,
          type: 'purchase',
          quantity: newQuantity,
          unit_cost: newUnitCost,
          total_value: totalNewValue,
          description: description || 'Mobil Stok Girişi'
        })
        .select()
        .single();

      if (logError) throw logError;

      // D. Update Variant (Stock + New Cost)
      const { error: updateError } = await supabase
        .from('product_variants')
        .update({
          stock: totalStockAfter,
          cost_price: weightedAverageCost // Saving the calculated average
        })
        .eq('id', variantId);

      if (updateError) throw updateError;

      // E. Create Finance Record (Expense)
      if (totalNewValue > 0) {
        const { error: finError } = await supabase
          .from('finances')
          .insert({
            type: 'expense',
            category: 'inventory',
            amount: totalNewValue,
            source: 'system_purchase',
            related_id: log.id,
            description: `Stok Alımı: ${(variant.products as any).name || 'Ürün'} (+${newQuantity} Adet)`
          });

        if (finError) throw finError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }); // Update low stock count
      Alert.alert('Başarılı', 'Stok, maliyet ve finans kayıtları güncellendi.');
    },
    onError: (error) => {
      Alert.alert('Hata', 'Stok işlemi başarısız: ' + error.message);
    }
  });

  // 2. BULK UPDATE (Price & Cost)
  const updateVariantDetails = useMutation({
    mutationFn: async ({ variantId, price, costPrice }: { variantId: string, price?: number, costPrice?: number }) => {
      const updates: any = {};
      if (price !== undefined) updates.price = price;
      if (costPrice !== undefined) updates.cost_price = costPrice;

      if (Object.keys(updates).length === 0) return;

      const { error } = await supabase
        .from('product_variants')
        .update(updates)
        .eq('id', variantId);
      if (error) throw error;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['catalog'] });
        queryClient.invalidateQueries({ queryKey: ['all-variants'] });
    }
  });

  return { addStock, updateVariantDetails };
}

// Hook for fetching all variants (Flat List)
export function useAllVariants(search: string) {
  return useQuery({
    queryKey: ['all-variants', search],
    queryFn: async () => {
      let query = supabase
        .from('product_variants')
        .select(`
          id, sku, size, color, stock, price, cost_price,
          products (name, base_price)
        `)
        .order('sku', { ascending: true });

      if (search) {
        // Search on joined table is tricky in Supabase without full text search setup properly
        // We will filter client side for MVP or use simple variant SKU search
        query = query.ilike('sku', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}
