import { useState, useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';

export function usePushToken() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    // Session her değiştiğinde (Giriş/Çıkış) token kaydını tazele
    if (session?.user) {
        registerForPushNotificationsAsync()
          .then(token => {
            if (token) {
                setExpoPushToken(token);
                saveTokenToSupabase(token, session.user.id);
            }
          })
          .catch(err => {
            console.warn('Push Registration Error:', err.message);
          });
    }

    defineActionCategories();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.url) router.push(data.url as any);
      else if (data?.orderId) router.push(`/orders/${data.orderId}` as any);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [session]); // Session değişimini dinliyoruz!

  return expoPushToken;
}

async function defineActionCategories() {
    await Notifications.setNotificationCategoryAsync('new_order', [
        { identifier: 'view_order', buttonTitle: 'İncele', options: { opensAppToForeground: true } },
        { identifier: 'ship_quick', buttonTitle: 'Hızlı Kargola', options: { opensAppToForeground: true } }
    ]);
}

async function saveTokenToSupabase(token: string, userId: string) {
    try {
        const { error } = await supabase
            .from('profiles')
            .upsert({ 
                id: userId, 
                push_token: token,
                updated_at: new Date().toISOString()
            });

        if (error) console.warn('Push token save warning:', error.message);
        else console.log('NEW TOKEN SAVED TO DB:', token);
    } catch (e) {
        console.error('Supabase token save error:', e);
    }
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;
    
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId || "e5336a34-0f0a-47c1-a365-ba7d99d34e3f";
    
    console.log('[Push] Using Project ID for Token:', projectId);
    
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('[Push] Generated Token:', token);
  }
  return token;
}
