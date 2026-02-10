import { Body, Caption } from '@/components/ui/Typography';
import { Notification, NotificationType } from '@/types/notification';
import { formatDistanceToNow } from '@/utils/format';
import {
    AlertTriangle,
    Bell,
    DollarSign,
    Package,
    TrendingDown,
    Users,
    X
} from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
  onDelete?: () => void;
}

export function NotificationCard({ notification, onPress, onDelete }: NotificationCardProps) {
  const iconConfig = getIconConfig(notification.type);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-start gap-4 p-4 rounded-[24px] border ${
        notification.is_read 
          ? 'bg-background border-border' 
          : 'bg-card border-neutral-200'
      }`}
    >
      {/* Icon */}
      <View className={`h-10 w-10 rounded-full items-center justify-center ${iconConfig.bgClass} border border-neutral-100`}>
        <iconConfig.icon size={18} color={iconConfig.color} strokeWidth={2} />
      </View>

      {/* Content */}
      <View className="flex-1 gap-1">
        <View className="flex-row items-start justify-between gap-2">
          <Body className="font-bold text-sm flex-1 text-foreground">
            {notification.title}
          </Body>
          {!notification.is_read && (
            <View className="h-2 w-2 rounded-full bg-primary mt-1" />
          )}
        </View>

        <Text className="text-sm text-muted-foreground font-medium leading-snug">
          {notification.body}
        </Text>

        <Caption className="text-neutral-400 mt-1 tracking-normal normal-case">
          {formatDistanceToNow(notification.created_at)}
        </Caption>
      </View>

      {/* Delete Button */}
      {onDelete && (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          activeOpacity={0.7}
          className="h-8 w-8 items-center justify-center"
        >
          <X size={16} color="#a3a3a3" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

function getIconConfig(type: NotificationType): { icon: any; color: string; bgClass: string } {
  switch (type) {
    case 'order_new':
    case 'order_status_change':
    case 'order_delayed':
      return { icon: Package, color: '#000000', bgClass: 'bg-neutral-50' };
    
    case 'stock_critical':
    case 'stock_out':
    case 'stock_low':
      return { icon: AlertTriangle, color: '#dc2626', bgClass: 'bg-red-50' };
    
    case 'finance_loss':
    case 'finance_low_margin':
      return { icon: TrendingDown, color: '#dc2626', bgClass: 'bg-red-50' };
    
    case 'finance_daily_report':
      return { icon: DollarSign, color: '#000000', bgClass: 'bg-neutral-50' };
    
    case 'crm_vip_customer':
    case 'crm_high_ltv':
      return { icon: Users, color: '#000000', bgClass: 'bg-neutral-50' };
    
    default:
      return { icon: Bell, color: '#000000', bgClass: 'bg-neutral-50' };
  }
}
