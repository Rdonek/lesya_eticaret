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
    X,
    ArrowUpRight
} from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { cn } from '@/utils/cn';

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
  onDelete?: () => void;
}

export function NotificationCard({ notification, onPress, onDelete }: NotificationCardProps) {
  const iconConfig = getIconConfig(notification.type);
  const isUrgent = ['stock_critical', 'stock_out', 'finance_loss'].includes(notification.type);

  return (
    <View className="relative mb-2">
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            className={cn(
                "flex-row items-start gap-4 p-5 rounded-[32px] border transition-all",
                notification.is_read
                ? 'bg-white border-neutral-100 opacity-60'
                : 'bg-white border-neutral-900 shadow-xl shadow-black/5'
            )}
        >
            {/* Icon */}
            <View className={cn(
                "h-12 w-12 rounded-2xl items-center justify-center border",
                isUrgent ? "bg-red-50 border-red-100" : "bg-neutral-50 border-neutral-100"
            )}>   
                <iconConfig.icon size={20} color={isUrgent ? "#dc2626" : "#000"} strokeWidth={2.5} />
            </View>

            {/* Content Area */}
            <View className="flex-1 gap-1.5">
                <View className="flex-row items-center justify-between">
                    <Text className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em]",
                        isUrgent ? "text-red-500" : "text-neutral-400"
                    )}>
                        {getCategoryLabel(notification.type)}
                    </Text>
                    <Caption className="text-[9px] font-bold text-neutral-300">
                        {formatDistanceToNow(notification.created_at)}
                    </Caption>
                </View>

                <View className="pr-6">
                    <Body className={cn(
                        "text-sm tracking-tight leading-tight",
                        notification.is_read ? "font-medium text-neutral-500" : "font-black text-neutral-900"
                    )}>
                        {notification.title}
                    </Body>
                    <Text 
                        numberOfLines={2}
                        className={cn(
                            "text-xs mt-1 leading-snug",
                            notification.is_read ? "text-neutral-400" : "text-neutral-500 font-medium"
                        )}
                    >
                        {notification.body}
                    </Text>
                </View>

                {!notification.is_read && (
                    <View className="flex-row items-center gap-1 mt-1">
                        <Text className="text-[10px] font-black text-neutral-900 uppercase">İncele</Text>
                        <ArrowUpRight size={10} color="#000" strokeWidth={3} />
                    </View>
                )}
            </View>
        </TouchableOpacity>

        {/* Floating Delete Button */}
        <TouchableOpacity
            onPress={onDelete}
            hitSlop={15}
            className="absolute top-4 right-4 h-8 w-8 items-center justify-center rounded-full bg-neutral-50 border border-neutral-100 shadow-sm"
        >
            <X size={14} color="#a3a3a3" />
        </TouchableOpacity>
    </View>
  );
}

function getCategoryLabel(type: NotificationType): string {
    if (type.startsWith('order_')) return 'SİPARİŞ';
    if (type.startsWith('stock_')) return 'STOK UYARISI';
    if (type.startsWith('finance_')) return 'FİNANS';
    if (type.startsWith('crm_')) return 'MÜŞTERİ';
    return 'SİSTEM';
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
