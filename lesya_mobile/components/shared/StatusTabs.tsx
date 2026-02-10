import { cn } from '@/utils/cn';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export type OrderStatusFilter = 'all' | 'paid' | 'shipped' | 'cancelled' | 'pending';

interface StatusTabsProps {
  activeTab: OrderStatusFilter;
  onTabChange: (tab: OrderStatusFilter) => void;
  counts?: Partial<Record<OrderStatusFilter, number>>;
}

const TABS: { label: string, value: OrderStatusFilter }[] = [
  { label: 'TÜMÜ', value: 'all' },
  { label: 'ÖDENDİ', value: 'paid' },
  { label: 'KARGODA', value: 'shipped' },
  { label: 'İPTAL', value: 'cancelled' },
  { label: 'BEKLEYEN', value: 'pending' },
];

export function StatusTabs({ activeTab, onTabChange, counts }: StatusTabsProps) {
  return (
    <View className="mb-4">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          const count = counts ? counts[tab.value] : null;

          return (
            <TouchableOpacity
              key={tab.value}
              onPress={() => onTabChange(tab.value)}
              activeOpacity={0.8}
              className={cn(
                "px-5 py-2.5 rounded-2xl border transition-all flex-row items-center gap-2",
                isActive 
                  ? "bg-neutral-900 border-neutral-900 shadow-lg shadow-black/10" 
                  : "bg-white border-neutral-100"
              )}
            >
              <Text className={cn(
                "text-[10px] font-bold tracking-widest",
                isActive ? "text-white" : "text-neutral-400"
              )}>
                {tab.label}
              </Text>
              
              {count !== undefined && count !== null && count > 0 && (
                <View className={cn(
                  "px-1.5 py-0.5 rounded-md min-w-[18px] items-center justify-center",
                  isActive ? "bg-white/20" : "bg-neutral-50"
                )}>
                  <Text className={cn(
                    "text-[9px] font-black",
                    isActive ? "text-white" : "text-neutral-500"
                  )}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
