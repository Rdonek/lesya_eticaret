'use client';

import * as React from 'react';
import { PackageOpen, Truck, Ban, ListFilter } from 'lucide-react';
import { cn } from '@/lib/utils';

export type OrderStatusFilter = 'all' | 'paid' | 'shipped' | 'cancelled';

type StatusTabsProps = {
  activeTab: OrderStatusFilter;
  onTabChange: (tab: OrderStatusFilter) => void;
  counts: {
    all: number;
    paid: number;
    shipped: number;
    cancelled: number;
  };
};

export function StatusTabs({ activeTab, onTabChange, counts }: StatusTabsProps) {
  const tabs = [
    { id: 'all', label: 'Tümü', icon: ListFilter, count: counts.all },
    { id: 'paid', label: 'Hazırlanacak', icon: PackageOpen, count: counts.paid },
    { id: 'shipped', label: 'Yoldakiler', icon: Truck, count: counts.shipped },
    { id: 'cancelled', label: 'İptaller', icon: Ban, count: counts.cancelled },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button 
            key={tab.id}
            onClick={() => onTabChange(tab.id as OrderStatusFilter)}
            className={cn(
              "flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all border",
              isActive 
                ? "bg-neutral-900 text-white border-neutral-900 shadow-lg shadow-neutral-900/10" 
                : "bg-white text-neutral-500 border-neutral-100 hover:border-neutral-200"
            )}
          >
            {tab.id !== 'all' && <Icon className="h-3.5 w-3.5" />}
            {tab.label}
            <span className={cn("ml-1", isActive ? "opacity-80" : "opacity-60")}>
              ({tab.count})
            </span>
          </button>
        );
      })}
    </div>
  );
}
