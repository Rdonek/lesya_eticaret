import { AdminHeader } from '@/components/shared/AdminHeader';
import { NotificationCard } from '@/components/shared/NotificationCard';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Body, Caption } from '@/components/ui/Typography';
import { useDeleteNotification, useMarkAllAsRead, useMarkAsRead, useNotifications } from '@/hooks/use-notifications';
import { Notification } from '@/types/notification';
import { useRouter } from 'expo-router';
import { BellOff, CheckCheck } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';

export default function NotificationsScreen() {
  const router = useRouter();
  const { data: notifications, isLoading, refetch } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }

    // Navigate based on action
    if (notification.data?.action === 'open_order' && notification.related_id) {
      router.push(`/orders/${notification.related_id}` as any);
    } else if (notification.data?.action === 'open_product' && notification.related_id) {
      router.push(`/catalog` as any);
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsRead.mutate();
    }
  };

  const handleDelete = (notificationId: string) => {
    deleteNotification.mutate(notificationId);
  };

  const onRefresh = useCallback(() => {
    refetch();
  }, []);

  if (isLoading) {
    return (
      <ScreenWrapper className="items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper noPadding className="bg-background">
      <AdminHeader title="BİLDİRİMLER" subtitle="GÜNCEL">
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            activeOpacity={0.7}
            className="h-9 px-3 rounded-full bg-neutral-100 items-center justify-center flex-row gap-2 border border-neutral-200"
          >
            <CheckCheck size={14} color="#000000" strokeWidth={2.5} />
            <Caption className="text-foreground">Tümü Okundu</Caption>
          </TouchableOpacity>
        )}
      </AdminHeader>

      {notifications && notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 8 }}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={({ item }) => (
            <NotificationCard
              notification={item}
              onPress={() => handleNotificationPress(item)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={onRefresh}
              tintColor="#000"
            />
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center px-4 gap-4">
          <View className="h-20 w-20 rounded-full bg-neutral-50 items-center justify-center border border-neutral-100">
            <BellOff size={32} color="#a3a3a3" strokeWidth={1.5} />
          </View>
          <View className="items-center gap-2">
            <Body className="font-bold text-base text-foreground">Bildirim Yok</Body>
            <Caption className="text-muted-foreground text-center normal-case tracking-normal">
              Henüz bildiriminiz bulunmuyor.
            </Caption>
          </View>
        </View>
      )}
    </ScreenWrapper>
  );
}
