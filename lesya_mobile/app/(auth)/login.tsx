'use client';

import React from 'react';
import { View, Image, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { H1, H2, Body, Caption } from '@/components/ui/Typography';
import { supabase } from '@/lib/supabase';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHeaderHeight } from '@react-navigation/elements';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const [loading, setLoading] = React.useState(false);
  const headerHeight = useHeaderHeight();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onLogin = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
    } catch (error: any) {
      Alert.alert('Erişim Reddedildi', 'Yetkisiz giriş denemesi. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper className="bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 justify-center px-6 gap-10">
              
              {/* 1. ADMIN BRANDING */}
              <View className="items-center gap-6 mt-10">
                <View className="h-32 w-32 rounded-[40px] bg-white items-center justify-center shadow-xl shadow-black/5 border border-neutral-100">
                  <Image 
                    source={require('@/assets/lesya_favicon/android/res/mipmap-xxxhdpi/lesya_launcher_foreground.png')} 
                    style={{ width: 80, height: 80 }}
                    resizeMode="contain"
                  />
                </View>
                <View className="items-center">
                  <H1 className="text-4xl text-foreground text-center">LESYA</H1>
                  <Caption className="tracking-[0.6em] text-muted-foreground mt-1 text-center">MANAGEMENT</Caption>
                </View>
              </View>

              {/* 2. SECURITY NOTICE */}
              <View className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 mx-2">
                  <Body className="text-[11px] font-black text-center text-neutral-400 uppercase tracking-widest">
                      Yönetici Erişim Paneli
                  </Body>
              </View>

              {/* 3. FORM SECTION */}
              <View className="gap-5">
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label="Yönetici E-posta"
                      placeholder="admin@lesyastudio.com"
                      value={value}
                      onChangeText={onChange}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      error={errors.email?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label="Erişim Şifresi"
                      placeholder="••••••••"
                      secureTextEntry
                      value={value}
                      onChangeText={onChange}
                      error={errors.password?.message}
                    />
                  )}
                />

                <View className="pt-4">
                  <AppButton 
                    title="SİSTEME GİRİŞ YAP" 
                    onPress={handleSubmit(onLogin)} 
                    isLoading={loading}
                    size="lg"
                    variant="primary"
                    className="rounded-2xl"
                  />
                </View>
              </View>

              {/* 4. FOOTER INFO */}
              <View className="items-center pt-4">
                <Body className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                  v1.0.0 — Autonomous Intelligence
                </Body>
              </View>

            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
