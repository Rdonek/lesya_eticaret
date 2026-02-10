import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { H3, Body, Caption } from '@/components/ui/Typography';
import { formatPrice } from '@/utils/format';
import { useRouter } from 'expo-router';
import { ChevronRight, Package, Clock, XCircle, CheckCircle } from 'lucide-react-native';

const STATUS_CONFIG: Record<string, { label: string, color: string, icon: any, bg: string }> = {
  pending: { label: 'Bekliyor', color: '#d97706', icon: Clock, bg: '#fef3c7' }, // Amber
  paid: { label: 'Ödendi', color: '#059669', icon: CheckCircle, bg: '#d1fae5' }, // Emerald
  shipped: { label: 'Kargoda', color: '#2563eb', icon: Package, bg: '#dbeafe' }, // Blue
  cancelled: { label: 'İptal', color: '#dc2626', icon: XCircle, bg: '#fee2e2' }, // Red
  processing: { label: 'Hazırlanıyor', color: '#4f46e5', icon: Package, bg: '#e0e7ff' }, // Indigo
};

interface OrderCardProps {
  order: any;
}

export function OrderCard({ order }: OrderCardProps) {
  const router = useRouter();
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  const itemCount = order.order_items?.[0]?.count || 0;

  return (
    <TouchableOpacity 
      onPress={() => router.push(`/orders/${order.id}`)}
      activeOpacity={0.7}
      className="bg-white p-5 rounded-[24px] border border-neutral-100 shadow-sm gap-4 mb-3"
    >
      {/* Header: ID & Status */}
      <View className="flex-row justify-between items-start">
        <View>
          <Caption className="text-neutral-400">SİPARİŞ NO</Caption>
          <Body className="font-bold text-neutral-900">#{order.order_number}</Body>
        </View>
        <View style={{ backgroundColor: status.bg }} className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-lg">
          <StatusIcon size={12} color={status.color} />
          <Caption style={{ color: status.color }} className="tracking-wide">{status.label}</Caption>
        </View>
      </View>

      {/* Content: Customer & Items */}
      <View>
        <H3 className="text-base">{order.customer_name}</H3>
        <Caption className="text-neutral-400 mt-0.5 normal-case tracking-normal">
          {itemCount} parça ürün • {new Date(order.created_at).toLocaleDateString('tr-TR')}
        </Caption>
      </View>

      {/* Footer: Price & Action */}
      <View className="flex-row justify-between items-end border-t border-neutral-50 pt-4">
        <View>
          <Caption className="text-neutral-400">TOPLAM</Caption>
          <H3 className="text-lg font-black">{formatPrice(order.total_amount)}</H3>
        </View>
        <View className="h-8 w-8 rounded-full bg-neutral-50 items-center justify-center border border-neutral-100">
          <ChevronRight size={16} color="#000" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
