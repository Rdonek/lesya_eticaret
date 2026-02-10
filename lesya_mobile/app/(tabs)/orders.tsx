import { AdminHeader } from '@/components/shared/AdminHeader';
import { OrderCard } from '@/components/shared/OrderCard';
import { OrderStatusFilter, StatusTabs } from '@/components/shared/StatusTabs';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Caption } from '@/components/ui/Typography';
import { useOrders } from '@/hooks/use-orders';
import { Search, X } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, TextInput, TouchableOpacity, View } from 'react-native';

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState<OrderStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Hook handles data fetching based on tab and search
  const { data: orders, isLoading, refetch } = useOrders(activeTab, searchQuery);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // STABLE HEADER COMPONENT: 
  // Defining this inside useMemo or as a separate component prevents 
  // the keyboard from closing on every keystroke.
  const HeaderComponent = useMemo(() => (
    <View className="gap-2">
      <AdminHeader title="SİPARİŞLER" subtitle="LOJİSTİK YÖNETİMİ">
        <TouchableOpacity 
          onPress={() => {
            setIsSearching(!isSearching);
            if (isSearching) setSearchQuery(''); // Clear search when closing
          }}
          className="h-10 w-10 rounded-xl bg-white border border-neutral-100 items-center justify-center shadow-sm"
        >
          {isSearching ? <X size={18} color="#000" /> : <Search size={18} color="#000" />}
        </TouchableOpacity>
      </AdminHeader>

      {isSearching && (
        <View className="px-4 mb-4">
          <View className="flex-row items-center bg-white border border-neutral-100 rounded-2xl px-4 h-12 shadow-sm">
            <Search size={16} color="#a3a3a3" />
            <TextInput 
              placeholder="Sipariş no veya müşteri adı..."
              className="flex-1 ml-3 text-sm font-medium h-full"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
        </View>
      )}

      <StatusTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        counts={{
          all: activeTab === 'all' ? (orders?.length ?? 0) : undefined,
          pending: orders?.filter((o: any) => o.status === 'pending').length ?? 0
        }}
      />
    </View>
  ), [isSearching, searchQuery, activeTab, orders?.length]);

  return (
    <ScreenWrapper noPadding className="bg-background">
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4">
            <OrderCard order={item} />
          </View>
        )}
        ListHeaderComponent={HeaderComponent}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={onRefresh} 
            tintColor="#000" 
          />
        }
        ListEmptyComponent={!isLoading ? (
          <View className="py-20 items-center justify-center">
            <Caption className="text-neutral-300">SİPARİŞ BULUNAMADI</Caption>
          </View>
        ) : null}
        keyboardShouldPersistTaps="handled"
      />
      
      {isLoading && !orders && (
        <View className="flex-1 items-center justify-center absolute inset-0 bg-background/50">
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}
    </ScreenWrapper>
  );
}
