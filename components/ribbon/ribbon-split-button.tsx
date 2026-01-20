'use client';

import { ChevronDown } from 'lucide-react';
import type * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface RibbonSplitButtonOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface RibbonSplitButtonProps {
  icon?: React.ReactNode;
  label?: string;
  options: RibbonSplitButtonOption[];
  onMainClick?: () => void;
  onOptionSelect?: (value: string) => void;
  className?: string;
}

export function RibbonSplitButton({
  icon,
  label,
  options,
  onMainClick,
  onOptionSelect,
  className,
}: RibbonSplitButtonProps) {
  return (
    <div data-slot="ribbon-split-button" className={cn('inline-flex', className)}>
      {/* Main button */}
      <button
        type="button"
        onClick={onMainClick}
        className={cn(
          'inline-flex items-center justify-center gap-1 rounded-l-xs px-2 py-1.5',
          'text-sm text-(--ribbon-text)',
          'hover:bg-(--ribbon-hover) active:bg-(--ribbon-active)',
          'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--ribbon-accent)',
          'border border-r-0 border-(--ribbon-border)',
        )}
      >
        {icon}
        {label && <span>{label}</span>}
      </button>

      {/* Dropdown trigger */}
      <Select onValueChange={onOptionSelect}>
        <SelectTrigger
          className={cn(
            'h-full w-6 rounded-l-none rounded-r-xs border border-(--ribbon-border)',
            'bg-transparent text-(--ribbon-text)',
            'hover:bg-(--ribbon-hover)',
            'focus:ring-1 focus:ring-(--ribbon-accent)',
            '[&>svg]:hidden',
          )}
        >
          <ChevronDown className="h-3 w-3" />
        </SelectTrigger>
        <SelectContent
          className={cn('border-(--ribbon-border) bg-(--ribbon-bg)', 'text-(--ribbon-text)')}
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="hover:bg-(--ribbon-hover)"
            >
              <span className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
