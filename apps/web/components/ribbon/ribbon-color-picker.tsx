'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { ChevronDown } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/lib/utils';

interface ColorOption {
  value: string;
  label: string;
}

interface RibbonColorPickerProps {
  colors?: ColorOption[];
  value?: string;
  onSelect: (color: string) => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  columns?: number;
  className?: string;
}

// Default theme colors
export const DEFAULT_COLORS: ColorOption[] = [
  { value: '#000000', label: 'Black' },
  { value: '#FFFFFF', label: 'White' },
  { value: '#FF0000', label: 'Red' },
  { value: '#00FF00', label: 'Green' },
  { value: '#0000FF', label: 'Blue' },
  { value: '#FFFF00', label: 'Yellow' },
  { value: '#FF00FF', label: 'Magenta' },
  { value: '#00FFFF', label: 'Cyan' },
  { value: '#FFA500', label: 'Orange' },
  { value: '#800080', label: 'Purple' },
  { value: '#008080', label: 'Teal' },
  { value: '#808080', label: 'Gray' },
  { value: '#0072f5', label: 'Primary' },
  { value: '#019ef3', label: 'Secondary' },
  { value: '#237406', label: 'Success' },
  { value: '#a75d20', label: 'Warning' },
];

export function RibbonColorPicker({
  colors = DEFAULT_COLORS,
  value,
  onSelect,
  icon: Icon,
  label,
  columns = 8,
  className,
}: RibbonColorPickerProps) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-1 h-7 px-2 rounded-xs',
            'text-(--ribbon-text-muted) hover:text-(--ribbon-text)',
            'hover:bg-(--ribbon-hover)',
            'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--ribbon-accent)',
            className,
          )}
          aria-label={label}
        >
          <div className="relative">
            <Icon className="h-5 w-5" />
            {/* Color indicator bar */}
            <div
              className="absolute -bottom-0.5 left-0 right-0 h-1 rounded-full"
              style={{ backgroundColor: value || colors[0]?.value }}
            />
          </div>
          <ChevronDown className="h-3 w-3 opacity-50" />
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
        >
          <div className="mb-2 text-xs text-white/50 uppercase tracking-wider">{label}</div>

          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {colors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => onSelect(color.value)}
                className={cn(
                  'w-6 h-6 rounded border-2 transition-all',
                  'hover:scale-110 hover:z-10',
                  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white',
                  value === color.value
                    ? 'border-white ring-2 ring-white/30'
                    : 'border-transparent hover:border-white/50',
                )}
                style={{ backgroundColor: color.value }}
                title={color.label}
                aria-pressed={value === color.value}
              />
            ))}
          </div>

          {/* Custom color input */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <label className="flex items-center gap-2 text-xs text-white/60">
              <span>Custom:</span>
              <input
                type="color"
                value={value || '#000000'}
                onChange={(e) => onSelect(e.target.value)}
                className="w-8 h-6 rounded cursor-pointer bg-transparent"
              />
            </label>
          </div>

          <PopoverPrimitive.Arrow className="fill-(--ribbon-border)" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
