import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Text, RefreshControl, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { H3, Body, Caption } from '@/components/ui/Typography';
import { useSettings, useSettingsActions } from '@/hooks/use-settings';
import { supabase } from '@/lib/supabase';
import { 
  ChevronLeft, 
  Store, 
  Truck, 
  Phone, 
  LogOut,
  User,
  ShieldCheck
} from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { data: settings, isLoading, refetch } = useSettings();
  const { updateSetting } = useSettingsActions();

  const [localSettings, setLocalSettings] = useState<any>(null);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading || !localSettings) {
    return (
      <ScreenWrapper className="bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </ScreenWrapper>
    );
  }

  const handleSave = (section: string, key: string, value: any) => {
    // Check if value actually changed
    if (localSettings[section][key] === value) return;
    
    const newValue = { ...localSettings[section], [key]: value };
    // Optimistic update
    setLocalSettings((prev: any) => ({
        ...prev,
        [section]: newValue
    }));
    updateSetting.mutate({ key: section, value: newValue });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <ScreenWrapper noPadding className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-neutral-50">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 rounded-full bg-neutral-50 items-center justify-center border border-neutral-100">
          <ChevronLeft size={20} color="#000" />
        </TouchableOpacity>
        <H3 className="text-base uppercase tracking-widest">Mağaza Ayarları</H3>
        <View className="w-10" />
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#000" />}
      >
        <View className="gap-8">
          
          {/* 1. Store Status (Safe Mode Styles) */}
          <View className="bg-white rounded-[32px] p-6 border border-neutral-100 shadow-sm gap-6">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                    <View className={`h-10 w-10 rounded-xl items-center justify-center ${localSettings.store_status.is_active ? 'bg-green-50' : 'bg-red-50'}`}>
                        <Store size={20} color={localSettings.store_status.is_active ? '#15803d' : '#dc2626'} />
                    </View>
                    <View>
                        <Body className="font-bold text-sm">MAĞAZA DURUMU</Body>
                        <Caption>{localSettings.store_status.is_active ? 'YAYINDA' : 'BAKIM MODU'}</Caption>
                    </View>
                </View>
                <View className={`h-2.5 w-2.5 rounded-full ${localSettings.store_status.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
            </View>

            <View style={{ flexDirection: 'row', gap: 8, padding: 4, backgroundColor: '#f9f9f9', borderRadius: 12 }}>
                <TouchableOpacity 
                    onPress={() => handleSave('store_status', 'is_active', true)}
                    style={{ 
                        flex: 1, 
                        height: 44, 
                        borderRadius: 8, 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        backgroundColor: localSettings.store_status.is_active ? '#fff' : 'transparent',
                        shadowOpacity: localSettings.store_status.is_active ? 0.1 : 0,
                        shadowRadius: 4,
                        elevation: localSettings.store_status.is_active ? 2 : 0
                    }}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 12, color: localSettings.store_status.is_active ? '#000' : '#a3a3a3' }}>AÇIK</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => handleSave('store_status', 'is_active', false)}
                    style={{ 
                        flex: 1, 
                        height: 44, 
                        borderRadius: 8, 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        backgroundColor: !localSettings.store_status.is_active ? '#fff' : 'transparent',
                        shadowOpacity: !localSettings.store_status.is_active ? 0.1 : 0,
                        shadowRadius: 4,
                        elevation: !localSettings.store_status.is_active ? 2 : 0
                    }}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 12, color: !localSettings.store_status.is_active ? '#dc2626' : '#a3a3a3' }}>KAPALI</Text>
                </TouchableOpacity>
            </View>
          </View>

          {/* 2. Shipping & Tax */}
          <View className="bg-white rounded-[32px] p-6 border border-neutral-100 shadow-sm gap-6">
            <View className="flex-row items-center gap-3 border-b border-neutral-50 pb-4">
                <Truck size={20} color="#000" />
                <H3 className="text-base">KARGO VE VERGİ</H3>
            </View>
            
            <View className="gap-4">
                <SettingInput 
                    label="Kargo Ücreti (TL)" 
                    keyboardType="numeric"
                    value={String(localSettings.shipping.standard_fee)} 
                    onChangeText={(v: string) => setLocalSettings({...localSettings, shipping: {...localSettings.shipping, standard_fee: v}})}
                    onEndEditing={() => handleSave('shipping', 'standard_fee', parseFloat(localSettings.shipping.standard_fee))}
                />
                <SettingInput 
                    label="Ücretsiz Kargo Alt Limiti" 
                    keyboardType="numeric"
                    value={String(localSettings.shipping.free_threshold)} 
                    onChangeText={(v: string) => setLocalSettings({...localSettings, shipping: {...localSettings.shipping, free_threshold: v}})}
                    onEndEditing={() => handleSave('shipping', 'free_threshold', parseFloat(localSettings.shipping.free_threshold))}
                />
                <SettingInput 
                    label="KDV Oranı (%)" 
                    keyboardType="numeric"
                    value={String(localSettings.tax.vat_rate)} 
                    onChangeText={(v: string) => setLocalSettings({...localSettings, tax: {...localSettings.tax, vat_rate: v}})}
                    onEndEditing={() => handleSave('tax', 'vat_rate', parseFloat(localSettings.tax.vat_rate))}
                />
            </View>
          </View>

          {/* 3. Contact Info */}
          <View className="bg-white rounded-[28px] p-6 border border-neutral-100 shadow-sm gap-6">
            <View className="flex-row items-center gap-3 border-b border-neutral-50 pb-4">
                <Phone size={20} color="#000" />
                <H3 className="text-base">İLETİŞİM</H3>
            </View>
            
            <View className="gap-4">
                <SettingInput 
                    label="WhatsApp Hattı" 
                    placeholder="90..." 
                    value={localSettings.contact.whatsapp} 
                    onChangeText={(v: string) => setLocalSettings({...localSettings, contact: {...localSettings.contact, whatsapp: v}})}
                    onEndEditing={() => handleSave('contact', 'whatsapp', localSettings.contact.whatsapp)}
                />
                <SettingInput 
                    label="Destek E-posta" 
                    placeholder="destek@..." 
                    value={localSettings.contact.email} 
                    onChangeText={(v: string) => setLocalSettings({...localSettings, contact: {...localSettings.contact, email: v}})}
                    onEndEditing={() => handleSave('contact', 'email', localSettings.contact.email)}
                />
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleSignOut}
            className="flex-row items-center justify-center gap-3 p-6 rounded-[28px] bg-red-50 border border-red-100"
          >
            <LogOut size={20} color="#dc2626" />
            <Text className="text-red-600 font-bold uppercase tracking-widest">Oturumu Kapat</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

// Optimized Input Component to prevent re-renders crashing keyboard
function SettingInput({ label, value, onChangeText, onEndEditing, placeholder, keyboardType }: any) {
    return (
        <View className="gap-2">
            <Text className="ml-1 text-[10px] font-black text-neutral-400 uppercase tracking-widest">{label}</Text>
            <TextInput 
                style={{ 
                    backgroundColor: '#f9f9f9', 
                    height: 48, 
                    borderRadius: 12, 
                    paddingHorizontal: 16, 
                    fontSize: 14, 
                    fontWeight: 'bold', 
                    color: '#000'
                }}
                value={value}
                onChangeText={onChangeText}
                onEndEditing={onEndEditing}
                placeholder={placeholder}
                placeholderTextColor="#a3a3a3"
                keyboardType={keyboardType}
            />
        </View>
    );
}