import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/notification';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

/**
 * Fetch all notifications
 */
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async (): Promise<Notification[]> => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    }
  });
}

/**
 * Get count of unread notifications
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: ['unread-notifications-count'],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    }
  });
}

/**
 * Mark a single notification as read (with Optimistic Update)
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);
      if (error) throw error;
    },
    onMutate: async (id) => {
      // Cancel refetches to not overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      
      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications']);

      // Optimistically update to the new value
      if (previousNotifications) {
        queryClient.setQueryData(['notifications'], 
          previousNotifications.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
      }

      return { previousNotifications };
    },
    onError: (err, id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    },
  });
}

/**
 * Mark ALL notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      // Immediately update local cache for instant UI feedback
      queryClient.setQueryData(['notifications'], (old: Notification[]) => 
        old?.map(n => ({ ...n, is_read: true }))
      );
      queryClient.setQueryData(['unread-notifications-count'], 0);
      
      // Then revalidate in background
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    },
    onError: () => Alert.alert('Hata', 'İşlem tamamlanamadı.')
  });
}

/**
 * Delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    },
  });
}
