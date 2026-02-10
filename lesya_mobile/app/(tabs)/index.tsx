import { AdminHeader } from '@/components/shared/AdminHeader';
import { TrendChart } from '@/components/shared/TrendChart';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Body, Caption, H1, H2 } from '@/components/ui/Typography';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { formatPrice } from '@/utils/format';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowRight,
  Box,
  CreditCard,
  Package,
  TrendingUp,
  Users
} from 'lucide-react-native';
import React, { useCallback } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const { data: stats, isLoading, refetch } = useDashboardStats();

  const onRefresh = useCallback(() => {
    refetch();
  }, []);

  if (isLoading) {
    return (
      <ScreenWrapper className="bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper noPadding className="bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#000" />}
      >
        <AdminHeader title="PANEL" subtitle="GENEL BAKIŞ" />

        <View className="px-4 gap-6">

          {/* 1. Main Revenue Card (Dark Theme) */}
          <View className="bg-neutral-900 rounded-[32px] p-6 shadow-xl shadow-black/20 overflow-hidden relative">   
            {/* Chart Background */}
            <View className="absolute bottom-0 left-0 right-0 opacity-20">
               <TrendChart data={stats?.trend || []} height={80} color="#ffffff" />
            </View>

            <View className="gap-6 relative z-10">
              <View className="flex-row justify-between items-start">
                <View className="h-12 w-12 rounded-2xl bg-white/10 items-center justify-center backdrop-blur-md border border-white/5">
                  <TrendingUp size={24} color="white" />
                </View>
                <View className="items-end">
                  <Body className={`font-bold text-sm ${stats?.monthlyGrowth! >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {`${stats?.monthlyGrowth! >= 0 ? '+' : ''}${stats?.monthlyGrowth?.toFixed(1) ?? '0.0'}%`}       
                  </Body>
                  <Caption className="text-neutral-500 lowercase">geçen aya göre</Caption>
                </View>
              </View>

              <View>
                <Caption className="text-neutral-400 mb-1">AYLIK CİRO</Caption>
                <H1 className="text-white text-4xl tracking-tighter">
                  {formatPrice(stats?.totalRevenue || 0)}
                </H1>
              </View>
            </View>
          </View>

          {/* 2. Operational Stats Grid */}
          <View className="flex-row gap-4">

            {/* Total Orders */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/orders')}
              activeOpacity={0.9}
              className="flex-1 bg-white rounded-[24px] p-5 border border-neutral-100 shadow-sm gap-4"
            >
              <View className="flex-row justify-between items-start">
                <View className="h-10 w-10 rounded-xl bg-neutral-50 items-center justify-center border border-neutral-100">
                  <Package size={20} color="black" />
                </View>
                {(stats?.pendingOrders ?? 0) > 0 && (
                  <View className="bg-amber-100 px-2 py-0.5 rounded-md">
                    <Caption className="text-amber-700 text-[9px]">{`${stats?.pendingOrders ?? 0} YENİ`}</Caption> 
                  </View>
                )}
              </View>
              <View>
                <H2 className="text-2xl">{stats?.totalOrders ?? 0}</H2>
                <Caption>TOPLAM SİPARİŞ</Caption>
              </View>
            </TouchableOpacity>

            {/* Low Stock */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/catalog')}
              activeOpacity={0.9}
              className="flex-1 bg-white rounded-[24px] p-5 border border-neutral-100 shadow-sm gap-4"
            >
              <View className="flex-row justify-between items-start">
                <View className="h-10 w-10 rounded-xl bg-neutral-50 items-center justify-center border border-neutral-100">
                  <AlertTriangle size={20} color="black" />
                </View>
              </View>
              <View>
                <H2 className={`text-2xl ${stats?.lowStockItems! > 0 ? 'text-red-600' : 'text-neutral-900'}`}>      
                  {stats?.lowStockItems ?? 0}
                </H2>
                <Caption>KRİTİK STOK</Caption>
              </View>
            </TouchableOpacity>

          </View>

          {/* 3. Quick Actions List */}
          <View className="gap-4">
            <Caption className="ml-1">HIZLI İŞLEMLER</Caption>
            <View className="bg-white rounded-[24px] border border-neutral-100 overflow-hidden divide-y divide-neutral-100 shadow-sm">
              <ActionRow
                icon={Box}
                label="Hızlı Stok Girişi"
                sub="Katalog yönetimi"
                onPress={() => router.push('/(tabs)/catalog')}
              />
              <ActionRow
                icon={CreditCard}
                label="Finansal Rapor"
                sub="Kasa ve kâr durumu"
                onPress={() => router.push('/finance')}
              />
              <ActionRow
                icon={Users}
                label="Müşteri Analizi"
                sub="Segmentler ve LTV"
                onPress={() => router.push('/customers')}
              />
            </View>
          </View>

        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

function ActionRow({ icon: Icon, label, sub, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center justify-between p-5 bg-white active:bg-neutral-50 transition-colors"
    >
      <View className="flex-row items-center gap-4">
        <View className="h-10 w-10 rounded-full bg-neutral-50 items-center justify-center border border-neutral-100">
          <Icon size={18} color="black" />
        </View>
        <View>
          <Body className="font-bold text-sm">{label}</Body>
          <Caption className="text-neutral-400 mt-0.5 tracking-normal normal-case font-medium">{sub}</Caption>      
        </View>
      </View>
      <ArrowRight size={16} color="#d4d4d4" />
    </TouchableOpacity>
  );
}
