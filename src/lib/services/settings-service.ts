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

    if (error || !data || data.length === 0) {
      console.error('Critical Error: Store settings could not be retrieved from DB.', error);
      throw new Error('Mağaza ayarları veritabanından alınamadı. Lütfen sistem yöneticisi ile iletişime geçin.');
    }

    const settings: any = {};
    data.forEach(item => {
      settings[item.key] = item.value;
    });

    // Ensure all required keys exist, if not throw
    const requiredKeys = ['shipping', 'tax', 'store_status', 'contact'];
    for (const key of requiredKeys) {
        if (!settings[key]) {
            throw new Error(`Kritik ayar eksik: ${key}. Lütfen Ayarlar sayfasından bu alanı güncelleyin.`);
        }
    }

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