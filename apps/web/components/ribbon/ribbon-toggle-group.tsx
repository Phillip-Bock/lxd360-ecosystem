'use client';

import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import type * as React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ToggleItem {
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
}

interface RibbonToggleGroupProps {
  items: ToggleItem[];
  value?: string | string[];
  onValueChange: (value: string | string[]) => void;
  type?: 'single' | 'multiple';
  className?: string;
}

export function RibbonToggleGroup({
  items,
  value,
  onValueChange,
  type = 'multiple',
  className,
}: RibbonToggleGroupProps) {
  if (type === 'single') {
    return (
      <TooltipProvider>
        <ToggleGroupPrimitive.Root
          type="single"
          value={value as string}
          onValueChange={onValueChange as (value: string) => void}
          className={cn('flex rounded-xs border border-(--ribbon-border)', className)}
        >
          {items.map((item, index) => (
            <Tooltip key={item.value}>
              <TooltipTrigger asChild>
                <ToggleGroupPrimitive.Item
                  value={item.value}
                  className={cn(
                    'flex items-center justify-center w-8 h-7',
                    'text-(--ribbon-text-muted) hover:text-(--ribbon-text)',
                    'hover:bg-(--ribbon-hover)',
                    'data-[state=on]:bg-(--ribbon-active) data-[state=on]:text-(--ribbon-text)',
                    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--ribbon-accent) focus-visible:z-10',
                    'transition-colors',
                    index === 0 && 'rounded-l-xs',
                    index === items.length - 1 && 'rounded-r-xs',
                    index !== items.length - 1 && 'border-r border-(--ribbon-border)',
                  )}
                  aria-label={item.label}
                >
                  <item.icon className="h-4 w-4" />
                </ToggleGroupPrimitive.Item>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="flex items-center gap-2">
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <kbd className="px-1.5 py-0.5 text-[10px] bg-black/20 rounded">
                      {item.shortcut}
                    </kbd>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroupPrimitive.Root>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <ToggleGroupPrimitive.Root
        type="multiple"
        value={value as string[]}
        onValueChange={onValueChange as (value: string[]) => void}
        className={cn('flex rounded-xs border border-(--ribbon-border)', className)}
      >
        {items.map((item, index) => (
          <Tooltip key={item.value}>
            <TooltipTrigger asChild>
              <ToggleGroupPrimitive.Item
                value={item.value}
                className={cn(
                  'flex items-center justify-center w-8 h-7',
                  'text-(--ribbon-text-muted) hover:text-(--ribbon-text)',
                  'hover:bg-(--ribbon-hover)',
                  'data-[state=on]:bg-(--ribbon-active) data-[state=on]:text-(--ribbon-text)',
                  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--ribbon-accent) focus-visible:z-10',
                  'transition-colors',
                  index === 0 && 'rounded-l-xs',
                  index === items.length - 1 && 'rounded-r-xs',
                  index !== items.length - 1 && 'border-r border-(--ribbon-border)',
                )}
                aria-label={item.label}
              >
                <item.icon className="h-4 w-4" />
              </ToggleGroupPrimitive.Item>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="flex items-center gap-2">
                <span>{item.label}</span>
                {item.shortcut && (
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-black/20 rounded">
                    {item.shortcut}
                  </kbd>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroupPrimitive.Root>
    </TooltipProvider>
  );
}
