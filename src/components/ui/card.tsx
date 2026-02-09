import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva('rounded-2xl overflow-hidden transition-shadow duration-300', {
  variants: {
    variant: {
      default: 'bg-white shadow-bento border border-neutral-100 hover:shadow-hover',
      outline: 'border border-neutral-200 bg-transparent',
      flat: 'bg-neutral-50 border-none', // New flat variant for bento grids
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cardVariants({ variant, className })}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export { Card, cardVariants };