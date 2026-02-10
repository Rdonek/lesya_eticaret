import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

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

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async (): Promise<StoreSettings> => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('key, value');

      if (error) throw error;

      const settings: any = {};
      data.forEach(item => {
        settings[item.key] = item.value;
      });

      return settings as StoreSettings;
    }
  });
}

export function useSettingsActions() {
  const queryClient = useQueryClient();

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: any }) => {
      const { error } = await supabase
        .from('store_settings')
        .upsert({ 
            key, 
            value, 
            updated_at: new Date().toISOString() 
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (e) => Alert.alert('Hata', e.message)
  });

  return { updateSetting };
}
