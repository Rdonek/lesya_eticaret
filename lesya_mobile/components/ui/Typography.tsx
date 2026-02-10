import React from 'react';
import { Text, TextProps } from 'react-native';
import { cn } from '@/utils/cn';

interface TypographyProps extends TextProps {
  children: React.ReactNode;
}

export function H1({ children, className, ...props }: TypographyProps) {
  return (
    <Text 
      className={cn("text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none", className)} 
      {...props}
    >
      {children}
    </Text>
  );
}

export function H2({ children, className, ...props }: TypographyProps) {
  return (
    <Text 
      className={cn("text-2xl font-bold tracking-tight text-foreground uppercase tracking-[0.1em]", className)} 
      {...props}
    >
      {children}
    </Text>
  );
}

export function H3({ children, className, ...props }: TypographyProps) {
  return (
    <Text 
      className={cn("text-lg font-bold tracking-tight text-foreground uppercase", className)} 
      {...props}
    >
      {children}
    </Text>
  );
}

export function Subtitle({ children, className, ...props }: TypographyProps) {
  return (
    <Text 
      className={cn("text-sm font-black uppercase tracking-[0.3em] text-muted-foreground", className)} 
      {...props}
    >
      {children}
    </Text>
  );
}

export function Body({ children, className, ...props }: TypographyProps) {
  return (
    <Text 
      className={cn("text-base font-medium text-foreground leading-relaxed", className)} 
      {...props}
    >
      {children}
    </Text>
  );
}

export function Caption({ children, className, ...props }: TypographyProps) {
  return (
    <Text 
      className={cn("text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground", className)} 
      {...props}
    >
      {children}
    </Text>
  );
}
