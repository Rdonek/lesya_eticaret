import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils'; // Use our utility for merging classes

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-neutral-900 text-white shadow-bento hover:bg-neutral-800 hover:shadow-hover',
        primary: 'bg-neutral-900 text-white shadow-bento hover:bg-neutral-800 hover:shadow-hover',
        secondary: 'bg-white text-neutral-900 shadow-bento hover:bg-neutral-50 hover:shadow-hover', // Pure white variant
        outline: 'border border-neutral-200 bg-transparent text-neutral-900 hover:bg-neutral-50',
        ghost: 'hover:bg-neutral-100 text-neutral-900',
        destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-bento',
      },
      size: {
        sm: 'h-9 px-4 text-xs',
        md: 'h-11 px-6 text-sm',
        lg: 'h-14 px-8 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
