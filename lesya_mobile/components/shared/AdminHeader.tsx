import React from 'react';
import { View } from 'react-native';
import { H1, Caption } from '@/components/ui/Typography';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, children }: AdminHeaderProps) {
  return (
    <View className="flex-row items-end justify-between px-2 pb-6 pt-2">
      <View className="gap-1">
        <H1 className="text-3xl">{title}</H1>
        {subtitle && (
          <Caption className="text-neutral-400 font-bold">{subtitle}</Caption>
        )}
      </View>
      
      <View className="flex-row items-center gap-2">
        {children}
      </View>
    </View>
  );
}
