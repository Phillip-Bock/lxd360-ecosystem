'use client';

import type * as React from 'react';
import { cn } from '@/lib/utils';
import { RibbonProvider, useRibbon } from './ribbon-context';

interface RibbonProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultTab?: string;
  children: React.ReactNode;
}

export function Ribbon({ defaultTab, children, className, ...props }: RibbonProps) {
  return (
    <RibbonProvider defaultTab={defaultTab}>
      <RibbonRoot className={className} {...props}>
        {children}
      </RibbonRoot>
    </RibbonProvider>
  );
}

function RibbonRoot({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { collapsed } = useRibbon();

  return (
    <div
      data-slot="ribbon"
      className={cn(
        'flex flex-col border-b border-(--ribbon-border)',
        'bg-(--ribbon-bg) backdrop-blur-xs',
        collapsed && 'ribbon-collapsed',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface RibbonContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function RibbonContent({ className, children, ...props }: RibbonContentProps) {
  const { collapsed } = useRibbon();

  if (collapsed) return null;

  return (
    <div
      data-slot="ribbon-content"
      className={cn(
        'flex items-stretch gap-1 px-2 py-1.5',
        'min-h-(--ribbon-content-height)',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
