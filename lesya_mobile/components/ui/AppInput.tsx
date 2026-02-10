import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';
import { cn } from '@/utils/cn';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function AppInput({ label, error, icon, className, ...props }: AppInputProps) {
  return (
    <View className="gap-2 mb-4">
      {label && <Text className="text-foreground font-medium">{label}</Text>}
      <View className={cn(
        "flex-row items-center bg-input border border-border rounded-xl h-12 px-3",
        error && "border-destructive",
        className
      )}>
        {icon && <View className="mr-2">{icon}</View>}
        <TextInput
          className="flex-1 text-foreground h-full"
          placeholderClassName="text-muted-foreground"
          {...props}
        />
      </View>
      {error && <Text className="text-destructive text-sm">{error}</Text>}
    </View>
  );
}
