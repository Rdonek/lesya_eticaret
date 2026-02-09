import { createClient } from '@/lib/supabase/client';

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
};

export const categoryService = {
  async getAll() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as Category[];
  },

  async create(category: Partial<Category>) {
    const supabase = createClient();
    const slug = category.name?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') || '';
    
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...category, slug })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, category: Partial<Category>) {
    const supabase = createClient();
    const { error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
