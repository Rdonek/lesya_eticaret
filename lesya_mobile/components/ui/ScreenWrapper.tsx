import React from 'react';
import { View, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from '@/utils/cn';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export function ScreenWrapper({ children, style, noPadding = false, className, ...props }: ScreenWrapperProps) {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <View
        className={cn(
          "flex-1 bg-background",
          !noPadding && "px-4",
          className
        )}
        style={style}
        {...props}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
