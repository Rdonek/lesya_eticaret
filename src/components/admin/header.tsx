'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type AdminHeaderProps = {
  title: string;
  children?: React.ReactNode;
  className?: string;
};

export function AdminHeader({ title, children, className }: AdminHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1 py-2", className)}>
      <div className="space-y-0.5">
        <h1 className="text-lg font-bold tracking-tight text-neutral-900">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {children}
      </div>
    </div>
  );
}