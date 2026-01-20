'use client';

import type * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useRibbon } from './ribbon-context';

interface RibbonTabsProps {
  children: React.ReactNode;
  className?: string;
}

export function RibbonTabs({ className, children }: RibbonTabsProps) {
  const { activeTab, setActiveTab } = useRibbon();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className={cn('w-full', className)}>
      {children}
    </Tabs>
  );
}

interface RibbonTabListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function RibbonTabList({ className, children, ...props }: RibbonTabListProps) {
  return (
    <TabsList
      data-slot="ribbon-tab-list"
      className={cn(
        'h-(--ribbon-tab-height) w-full justify-start',
        'rounded-none border-b border-(--ribbon-border)',
        'bg-transparent p-0 px-2',
        className,
      )}
      {...props}
    >
      {children}
    </TabsList>
  );
}

interface RibbonTabProps extends React.ComponentPropsWithoutRef<typeof TabsTrigger> {
  children: React.ReactNode;
}

export function RibbonTab({ className, children, ...props }: RibbonTabProps) {
  return (
    <TabsTrigger
      data-slot="ribbon-tab"
      className={cn(
        'relative h-full rounded-none border-b-2 border-transparent px-4 py-2',
        'text-sm font-medium text-(--ribbon-text-muted)',
        'hover:text-(--ribbon-text) hover:bg-(--ribbon-hover)',
        'data-[state=active]:border-(--ribbon-accent)',
        'data-[state=active]:text-(--ribbon-text)',
        'data-[state=active]:bg-transparent',
        'transition-colors',
        className,
      )}
      {...props}
    >
      {children}
    </TabsTrigger>
  );
}

interface RibbonTabPanelProps extends React.ComponentPropsWithoutRef<typeof TabsContent> {
  children: React.ReactNode;
}

export function RibbonTabPanel({ className, children, ...props }: RibbonTabPanelProps) {
  return (
    <TabsContent
      data-slot="ribbon-tab-panel"
      className={cn('mt-0 outline-hidden', className)}
      {...props}
    >
      {children}
    </TabsContent>
  );
}
