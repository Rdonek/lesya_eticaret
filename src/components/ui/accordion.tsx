'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type AccordionItemProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border-b border-neutral-100">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-neutral-900 transition-colors hover:text-neutral-600"
      >
        {title}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-neutral-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100 mb-4" : "max-h-0 opacity-0"
        )}
      >
        <div className="text-sm leading-relaxed text-neutral-600">
          {children}
        </div>
      </div>
    </div>
  );
}
