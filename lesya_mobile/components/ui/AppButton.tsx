import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { cn } from '@/utils/cn';

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  isLoading?: boolean;
}

export function AppButton({
  title,
  variant = 'primary',
  size = 'default',
  isLoading = false,
  className,
  disabled,
  ...props
}: AppButtonProps) {
  const baseStyles = "flex-row items-center justify-center rounded-xl";
  
  const variants = {
    primary: "bg-primary",
    secondary: "bg-muted",
    outline: "border border-input bg-background",
    ghost: "bg-transparent",
    destructive: "bg-destructive",
  };

  const textVariants = {
    primary: "text-primary-foreground",
    secondary: "text-muted-foreground",
    outline: "text-foreground",
    ghost: "text-foreground",
    destructive: "text-destructive-foreground",
  };

  const sizes = {
    default: "h-12 px-4 py-2",
    sm: "h-9 rounded-lg px-3",
    lg: "h-14 rounded-xl px-8",
  };

  return (
    <TouchableOpacity
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        (disabled || isLoading) && "opacity-50",
        className
      )}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator 
          color={variant === 'primary' || variant === 'destructive' ? 'white' : 'black'} 
          className="mr-2"
        />
      ) : null}
      <Text className={cn("font-medium text-base", textVariants[variant])}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
