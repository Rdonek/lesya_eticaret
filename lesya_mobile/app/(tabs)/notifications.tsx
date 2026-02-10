import { AdminHeader } from '@/components/shared/AdminHeader';
import { NotificationCard } from '@/components/shared/NotificationCard';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Body, Caption, H3 } from '@/components/ui/Typography';
import { useDeleteNotification, useMarkAllAsRead, useMarkAsRead, useNotifications } from '@/hooks/use-notifications';
import { Notification } from '@/types/notification';
import { useRouter } from 'expo-router';
import { BellOff, CheckCheck, Trash2 } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, View, Text, ScrollView, Alert } from 'react-native';
import { cn } from '@/utils/cn';

type FilterType = 'all' | 'orders' | 'stock' | 'finance';

export default function NotificationsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { data: notifications, isLoading, isRefetching, refetch } = useNotifications();
  
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  const filteredNotifications = notifications?.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'orders') return n.type.startsWith('order_');
    if (activeFilter === 'stock') return n.type.startsWith('stock_');
    if (activeFilter === 'finance') return n.type.startsWith('finance_');
    return true;
  });

  const handleNotificationPress = (notification: Notification) => {
    // 1. Mark as read immediately (Optimistic)
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }

    // 2. Navigate immediately (Don't wait for mutation)
    if (notification.data?.action === 'open_order' && notification.related_id) {
      router.push(`/orders/${notification.related_id}` as any);
    } else if (notification.data?.action === 'open_product' && notification.related_id) {
      router.push(`/catalog` as any);
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;
    Alert.alert('Onay', 'Tüm bildirimleri okundu olarak işaretlemek istiyor musunuz?', [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Evet', onPress: () => markAllAsRead.mutate() }
    ]);
  };

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading indicator only for initial load
  if (isLoading && !notifications) {
    return (
      <ScreenWrapper className="items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper noPadding className="bg-background">
      <AdminHeader title="BİLDİRİMLER" subtitle="KOMUTA MERKEZİ">
        <View className="flex-row gap-2">
            {unreadCount > 0 && (
            <TouchableOpacity
                onPress={handleMarkAllAsRead}
                activeOpacity={0.7}
                disabled={markAllAsRead.isPending}
                className={cn(
                    "h-10 px-4 rounded-xl items-center justify-center flex-row gap-2 shadow-lg shadow-black/10",
                    markAllAsRead.isPending ? "bg-neutral-400" : "bg-neutral-900"
                )}
            >
                {markAllAsRead.isPending ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <CheckCheck size={14} color="#fff" strokeWidth={3} />
                )}
                <Text className="text-[10px] font-black text-white uppercase tracking-widest">Tümünü Oku</Text>
            </TouchableOpacity>
            )}
        </View>
      </AdminHeader>

      {/* Category Tabs */}
      <View className="py-2 border-b border-neutral-50 bg-white">
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
            <FilterTab 
                label="TÜMÜ" 
                active={activeFilter === 'all'} 
                onPress={() => setActiveFilter('all')} 
                count={unreadCount > 0 ? unreadCount : undefined}
            />
            <FilterTab 
                label="SİPARİŞLER" 
                active={activeFilter === 'orders'} 
                onPress={() => setActiveFilter('orders')} 
            />
            <FilterTab 
                label="KRİTİK STOK" 
                active={activeFilter === 'stock'} 
                onPress={() => setActiveFilter('stock')} 
            />
            <FilterTab 
                label="FİNANS" 
                active={activeFilter === 'finance'} 
                onPress={() => setActiveFilter('finance')} 
            />
        </ScrollView>
      </View>

      {filteredNotifications && filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 150, gap: 4 }}
          renderItem={({ item }) => (
            <NotificationCard
              notification={item}
              onPress={() => handleNotificationPress(item)}
              onDelete={() => deleteNotification.mutate(item.id)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#000" />
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8 gap-6">
          <View className="h-32 w-32 rounded-full bg-neutral-50 items-center justify-center border border-neutral-100 shadow-inner">
            <BellOff size={48} color="#d4d4d4" strokeWidth={1} />
          </View>
          <View className="items-center gap-2">
            <H3 className="text-lg font-black text-neutral-900 uppercase italic">Sessizlik Hakim</H3>
            <Text className="text-neutral-400 text-center text-xs font-medium leading-relaxed">
                Şu an için okunmamış veya filtrenize uygun bir bildirim bulunmuyor. Her şey yolunda görünüyor.
            </Text>
          </View>
          <TouchableOpacity 
            onPress={onRefresh}
            className="px-8 py-4 rounded-2xl bg-neutral-100 border border-neutral-200"
          >
            <Text className="text-[10px] font-black text-neutral-900 uppercase tracking-widest">Yenile</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenWrapper>
  );
}

function FilterTab({ label, active, onPress, count }: any) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            className={cn(
                "px-5 py-2.5 rounded-2xl border flex-row items-center gap-2 transition-all",
                active ? "bg-neutral-900 border-neutral-900 shadow-sm" : "bg-white border-neutral-100"
            )}
        >
            <Text className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                active ? "text-white" : "text-neutral-400"
            )}>
                {label}
            </Text>
            {count !== undefined && (
                <View className={cn(
                    "h-4 w-4 rounded-lg items-center justify-center",
                    active ? "bg-white/20" : "bg-neutral-100"
                )}>
                    <Text className={cn("text-[8px] font-black", active ? "text-white" : "text-neutral-500")}>
                        {count}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}
