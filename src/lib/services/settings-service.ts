import { createAdminClient } from '@/lib/supabase/admin';

export type StoreSettings = {
  shipping: {
    free_threshold: number;
    standard_fee: number;
  };
  tax: {
    vat_rate: number;
  };
  store_status: {
    is_active: boolean;
    message: string;
  };
  contact: {
    whatsapp: string;
    email: string;
    phone: string;
  };
};

export const settingsService = {
  async getAll(): Promise<StoreSettings> {
    const supabase = createAdminClient(); // Bypass RLS for calculation services
    const { data, error } = await supabase
      .from('store_settings')
      .select('key, value');

    if (error) {
      console.error('Error fetching settings:', error);
      return {
        shipping: { free_threshold: 500, standard_fee: 30 },
        tax: { vat_rate: 20 },
        store_status: { is_active: true, message: '' },
        contact: { whatsapp: '', email: '', phone: '' }
      };
    }

    const settings: any = {};
    data.forEach(item => {
      settings[item.key] = item.value;
    });

    return settings as StoreSettings;
  },

  async update(key: string, value: any) {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('store_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() });

    if (error) throw error;
  }
};