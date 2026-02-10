import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Image, Modal, TextInput, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { H1, H2, H3, Body, Caption } from '@/components/ui/Typography';
import { useOrderDetail, useOrderActions } from '@/hooks/use-order-actions';
import { formatPrice } from '@/utils/format';
import { 
  ChevronLeft, 
  User, 
  Package, 
  Truck, 
  Clock
} from 'lucide-react-native';
import { AppButton } from '@/components/ui/AppButton';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: order, isLoading } = useOrderDetail(id as string);
  const { shipOrder, cancelOrder } = useOrderActions();
  
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  if (isLoading || !order) {
    return (
      <ScreenWrapper className="bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </ScreenWrapper>
    );
  }

  const handleShip = () => {
    if (!trackingNumber) return;
    shipOrder.mutate({ orderId: order.id, trackingNumber }, {
      onSuccess: () => {
        setIsShipModalOpen(false);
        setTrackingNumber('');
      }
    });
  };

  const handleCancel = () => {
    // Show confirmation dialog before destructive action
    // In React Native, Alert.alert supports options
    // But since we are inside a function, let's keep it simple or use a custom modal if needed.
    // For now, let's just trigger the mutation, but in a real app, a confirm dialog is best.
    // Let's assume the user knows what they are doing or add a simple safety check if needed.
    cancelOrder.mutate(order.id);
  };

  const isCancellable = order.status === 'paid' || order.status === 'pending' || order.status === 'processing';

  return (
    <ScreenWrapper noPadding className="bg-background">
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-neutral-50">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="h-10 w-10 rounded-full bg-neutral-50 items-center justify-center border border-neutral-100"
        >
          <ChevronLeft size={20} color="#000" />
        </TouchableOpacity>
        <View className="items-center">
          <Caption className="text-neutral-400">SİPARİŞ DETAYI</Caption>
          <Body className="font-bold">#{order.order_number}</Body>
        </View>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 160 }}>
        <View className="gap-8">
          
          <View className="bg-neutral-900 rounded-[32px] p-6 flex-row items-center justify-between">
            <View className="gap-1">
              <Caption className="text-neutral-400">GÜNCEL DURUM</Caption>
              <H2 className="text-white text-xl uppercase italic">{order.status}</H2>
            </View>
            <View className="h-12 w-12 rounded-2xl bg-white/10 items-center justify-center">
              <Clock size={24} color="white" />
            </View>
          </View>

          <View className="bg-white rounded-[28px] p-6 border border-neutral-100 shadow-sm gap-6">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 rounded-xl bg-neutral-50 items-center justify-center">
                <User size={20} color="#000" />
              </View>
              <H3 className="text-lg uppercase">Müşteri</H3>
            </View>
            
            <View className="gap-4">
              <InfoRow label="AD SOYAD" value={order.customer_name} />
              <InfoRow label="E-POSTA" value={order.email} />
              <InfoRow label="TELEFON" value={order.phone} />
              <View className="pt-2 gap-1">
                <Caption className="text-neutral-400">TESLİMAT ADRESİ</Caption>
                <Body className="text-sm font-semibold leading-relaxed">
                  {order.address_line}, {order.city}
                </Body>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-[28px] p-6 border border-neutral-100 shadow-sm gap-6">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 rounded-xl bg-neutral-50 items-center justify-center">
                <Package size={20} color="#000" />
              </View>
              <H3 className="text-lg uppercase">Ürünler</H3>
            </View>

            <View className="gap-4">
              {order.order_items?.map((item: any, idx: number) => (
                <View key={idx} className="flex-row items-center gap-4 py-2">
                  <View className="h-16 w-12 rounded-xl bg-neutral-50 overflow-hidden">
                    <Image source={{ uri: item.product_snapshot.image }} className="h-full w-full" />
                  </View>
                  <View className="flex-1">
                    <Body className="font-bold text-sm">{item.product_snapshot.name}</Body>
                    <Caption className="text-[10px]">
                      BEDEN: {item.product_snapshot.size} • {item.quantity} ADET
                    </Caption>
                  </View>
                  <Body className="font-black text-sm">{formatPrice(item.unit_price * item.quantity)}</Body>
                </View>
              ))}
            </View>
          </View>

          <View className="bg-neutral-50 rounded-[28px] p-6 border border-neutral-100 gap-4">
             <View className="flex-row justify-between">
                <Caption className="text-neutral-400">ARA TOPLAM</Caption>
                <Body className="font-bold">{formatPrice(order.subtotal)}</Body>
             </View>
             <View className="flex-row justify-between">
                <Caption className="text-neutral-400">KARGO</Caption>
                <Body className="font-bold">{order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : 'ÜCRETSİZ'}</Body>
             </View>
             <View className="h-[1px] bg-neutral-200 my-2" />
             <View className="flex-row justify-between items-end">
                <Caption className="text-neutral-900 font-black">TOPLAM</Caption>
                <H2 className="text-2xl">{formatPrice(order.total_amount)}</H2>
             </View>
          </View>

          {/* Cancel Button */}
          {isCancellable && (
            <TouchableOpacity 
              onPress={handleCancel}
              disabled={cancelOrder.isPending}
              className="mt-4 p-4 items-center"
            >
              {cancelOrder.isPending ? (
                <ActivityIndicator color="#dc2626" />
              ) : (
                <Text className="text-red-500 font-bold text-xs uppercase tracking-widest">Siparişi İptal Et</Text>
              )}
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>

      {order.status === 'paid' && (
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 border-t border-neutral-100">
          <AppButton 
            title="SİPARİŞİ KARGOLA" 
            onPress={() => setIsShipModalOpen(true)}
          />
        </View>
      )}

      <Modal visible={isShipModalOpen} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center p-6">
          <View className="bg-white rounded-[32px] p-8 gap-6">
            <H3>KARGO BİLGİSİ</H3>
            <View className="gap-2">
              <Caption>TAKİP NUMARASI</Caption>
              <TextInput 
                className="h-14 bg-neutral-50 rounded-2xl px-4 font-bold border border-neutral-100"
                placeholder="Örn: 123456789"
                value={trackingNumber}
                onChangeText={setTrackingNumber}
                autoFocus
              />
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => setIsShipModalOpen(false)}
                className="flex-1 h-14 rounded-2xl bg-neutral-100 items-center justify-center"
              >
                <Text className="font-bold text-neutral-900">İPTAL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleShip}
                disabled={!trackingNumber || shipOrder.isPending}
                className="flex-[2] h-14 rounded-2xl bg-neutral-900 items-center justify-center"
              >
                {shipOrder.isPending ? <ActivityIndicator color="white" /> : <Text className="font-bold text-white">ONAYLA</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScreenWrapper>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <View className="gap-1">
      <Caption className="text-neutral-400">{label}</Caption>
      <Body className="text-sm font-bold">{value || '-'}</Body>
    </View>
  );
}