'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { ChevronDown } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/lib/utils';

export interface GalleryItem {
  id: string;
  label: string;
  preview: React.ReactNode;
  disabled?: boolean;
}

interface RibbonGalleryProps {
  items: GalleryItem[];
  value?: string;
  onSelect: (id: string) => void;
  columns?: number;
  previewCount?: number;
  label: string;
  className?: string;
}

export function RibbonGallery({
  items,
  value,
  onSelect,
  columns = 4,
  previewCount = 4,
  label,
  className,
}: RibbonGalleryProps) {
  const visibleItems = items.slice(0, previewCount);
  const hasMore = items.length > previewCount;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Inline preview items */}
      <div className="flex gap-0.5">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            disabled={item.disabled}
            className={cn(
              'w-12 h-12 rounded border-2 transition-all',
              'hover:border-(--ribbon-accent) hover:scale-105',
              'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--ribbon-accent)',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              value === item.id
                ? 'border-(--ribbon-accent) ring-2 ring-(--ribbon-accent)/30'
                : 'border-white/20',
            )}
            title={item.label}
            aria-pressed={value === item.id}
          >
            {item.preview}
          </button>
        ))}
      </div>

      {/* Expand button for full gallery */}
      {hasMore && (
        <PopoverPrimitive.Root>
          <PopoverPrimitive.Trigger asChild>
            <button
              type="button"
              className={cn(
                'flex flex-col items-center justify-center',
                'w-6 h-12 rounded',
                'text-white/60 hover:text-white hover:bg-(--ribbon-hover)',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--ribbon-accent)',
              )}
              aria-label={`More ${label} options`}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </PopoverPrimitive.Trigger>

          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              className={cn(
                'z-50 rounded-lg',
                'bg-(--ribbon-bg) border border-(--ribbon-border)',
                'p-3 shadow-xl shadow-black/30',
                'animate-in fade-in-0 zoom-in-95',
              )}
              sideOffset={8}
              align="start"
            >
              <div className="mb-2 text-xs text-white/50 uppercase tracking-wider">{label}</div>

              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
              >
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item.id)}
                    disabled={item.disabled}
                    className={cn(
                      'w-14 h-14 rounded border-2 transition-all',
                      'hover:border-(--ribbon-accent) hover:scale-105',
                      'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--ribbon-accent)',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      value === item.id ? 'border-(--ribbon-accent)' : 'border-transparent',
                    )}
                    title={item.label}
                    aria-pressed={value === item.id}
                  >
                    {item.preview}
                  </button>
                ))}
              </div>

              <PopoverPrimitive.Arrow className="fill-(--ribbon-border)" />
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      )}
    </div>
  );
}
