import React, { useState, useMemo, useCallback } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, TextInput, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { H3, Body, Caption } from '@/components/ui/Typography';
import { useCustomers, Customer } from '@/hooks/use-customers';
import { formatPrice } from '@/utils/format';
import { 
  ChevronLeft, 
  Search, 
  X, 
  Star, 
  Flame, 
  User, 
  Ghost 
} from 'lucide-react-native';

export default function CustomersScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { data: customers, isLoading, refetch } = useCustomers();

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    return customers.filter(c => 
      (c.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <ScreenWrapper noPadding className="bg-background">
      {/* Menu Style Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-neutral-50">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 rounded-full bg-neutral-50 items-center justify-center">
          <ChevronLeft size={20} color="#000" />
        </TouchableOpacity>
        
        {isSearching ? (
            <TextInput 
                placeholder="Müşteri ara..."
                className="flex-1 mx-4 h-10 bg-neutral-50 rounded-xl px-4 text-sm font-bold"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                autoCorrect={false}
            />
        ) : (
            <H3 className="text-base uppercase tracking-widest">Müşteriler</H3>
        )}

        <TouchableOpacity 
            onPress={() => {
                setIsSearching(!isSearching);
                if (isSearching) setSearchQuery('');
            }}
            className="h-10 w-10 rounded-full bg-neutral-50 items-center justify-center"
        >
          {isSearching ? <X size={18} color="#000" /> : <Search size={18} color="#000" />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#000" />
        }
        renderItem={({ item }) => <CustomerCard customer={item} />}
        ListEmptyComponent={!isLoading ? (
          <View className="py-20 items-center justify-center">
            <Caption className="text-neutral-300">MÜŞTERİ BULUNAMADI</Caption>
          </View>
        ) : null}
        keyboardShouldPersistTaps="handled"
      />

      {isLoading && !customers && (
        <View className="flex-1 items-center justify-center absolute inset-0 bg-background/50">
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}
    </ScreenWrapper>
  );
}

function CustomerCard({ customer }: { customer: Customer }) {
  return (
    <View className="mb-4 bg-white p-5 rounded-[28px] border border-neutral-100 shadow-sm gap-4">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Body className="font-bold text-sm text-neutral-900">{customer.full_name || 'İsimsiz'}</Body>
          <Caption className="text-neutral-400 mt-0.5 lowercase font-medium">{customer.email}</Caption>
        </View>
        <SegmentBadge segment={customer.segment} />
      </View>

      <View className="flex-row justify-between items-end pt-4 border-t border-neutral-50">
        <View className="flex-row gap-6">
            <View>
                <Caption className="text-[8px] mb-1">SİPARİŞ</Caption>
                <Body className="font-black text-xs">{customer.total_orders}</Body>
            </View>
            <View>
                <Caption className="text-[8px] mb-1">HARCAMA</Caption>
                <Body className="font-black text-xs">{formatPrice(customer.total_spent)}</Body>
            </View>
        </View>
        <View className="items-end">
            <Caption className="text-[8px] mb-1 text-neutral-300">SON ALIŞVERİŞ</Caption>
            <Body className="font-bold text-[10px] text-neutral-400">
                {customer.last_order_date 
                    ? new Date(customer.last_order_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
                    : '-'
                }
            </Body>
        </View>
      </View>
    </View>
  );
}

function SegmentBadge({ segment }: { segment: string }) {
  const config: any = {
    vip: { color: "#b45309", bg: "#fef3c7", icon: Star, label: "VIP" },
    returning: { color: "#15803d", bg: "#dcfce7", icon: Flame, label: "SADIK" },
    new: { color: "#1d4ed8", bg: "#dbeafe", icon: User, label: "YENİ" },
    lost: { color: "#525252", bg: "#f5f5f5", icon: Ghost, label: "KAYIP" }
  };
  const s = config[segment] || config.new;
  const Icon = s.icon;

  return (
    <View style={{ backgroundColor: s.bg }} className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg">
      <Icon size={10} color={s.color} />
      <Text style={{ color: s.color, fontSize: 8, fontWeight: '900' }}>{s.label}</Text>
    </View>
  );
}
