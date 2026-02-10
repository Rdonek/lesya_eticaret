import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

export type CatalogProduct = {
  id: string; // original product id
  name: string;
  base_price: number;
  categoryName: string;
  categoryId: string;
  image: string;
  totalStock: number;
  isActive: boolean;
  variantsCount: number;
  hasOrders: boolean; // To decide if we can delete or just archive
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export function useCatalog(searchQuery: string, categoryId: string | null) {
  return useQuery({
    queryKey: ['catalog', searchQuery, categoryId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (name, id),
          product_variants (id, stock, order_items(count)),
          product_images (url, display_order)
        `)
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform for UI
      return data.map((p: any) => {
        const totalStock = p.product_variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
        const mainImage = p.product_images?.sort((a: any, b: any) => a.display_order - b.display_order)[0]?.url;

        // Check if product has any orders (to disable delete)
        const hasOrders = p.product_variants?.some((v: any) => v.order_items?.[0]?.count > 0);

        return {
          id: p.id,
          name: p.name,
          base_price: p.base_price,
          categoryName: p.categories?.name || 'Genel',
          categoryId: p.categories?.id,
          image: mainImage,
          totalStock,
          isActive: p.is_active,
          variantsCount: p.product_variants?.length || 0,
          hasOrders
        } as CatalogProduct;
      });
    }
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });
}

export function useCatalogActions() {
  const queryClient = useQueryClient();

  // Toggle Archive Status
  const toggleStatus = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string, currentStatus: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
    }
  });

  const addCategory = useMutation({
    mutationFn: async (name: string) => {
      const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const { error } = await supabase
        .from('categories')
        .insert({ name, slug });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      Alert.alert('Başarılı', 'Kategori eklendi.');
    },
    onError: (e) => Alert.alert('Hata', e.message)
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      Alert.alert('Başarılı', 'Kategori silindi.');
    },
    onError: (e) => Alert.alert('Hata', 'Kategori silinemedi. Bu kategoriye bağlı ürünler olabilir.')
  });

  return { toggleStatus, addCategory, deleteCategory };
}