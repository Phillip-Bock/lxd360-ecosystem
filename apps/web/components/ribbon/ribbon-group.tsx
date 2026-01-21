'use client';

import type * as React from 'react';
import { cn } from '@/lib/utils';

interface RibbonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  children: React.ReactNode;
}

export function RibbonGroup({ label, className, children, ...props }: RibbonGroupProps) {
  return (
    <div
      data-slot="ribbon-group"
      className={cn(
        'flex flex-col items-stretch',
        'border-r border-(--ribbon-border) last:border-r-0',
        'px-2 py-1',
        className,
      )}
      {...props}
    >
      <div className="flex flex-1 items-center gap-0.5">{children}</div>
      {label && (
        <span className="mt-1 text-center text-[10px] text-(--ribbon-text-muted) uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
}
