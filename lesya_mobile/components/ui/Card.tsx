import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/utils/cn';

export function Card({ className, children, ...props }: ViewProps) {
  return (
    <View
      className={cn(
        "bg-card border border-border p-4 rounded-xl shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}
