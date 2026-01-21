'use client';

import { ChevronDown } from 'lucide-react';
import type * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface RibbonDropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface RibbonDropdownProps {
  options: RibbonDropdownOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RibbonDropdown({
  options,
  value,
  onValueChange,
  placeholder = 'Select...',
  className,
}: RibbonDropdownProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        data-slot="ribbon-dropdown"
        className={cn(
          'h-7 w-auto min-w-25 gap-1 rounded-xs border-(--ribbon-border)',
          'bg-(--ribbon-bg) text-(--ribbon-text)',
          'hover:bg-(--ribbon-hover)',
          'focus:ring-1 focus:ring-(--ribbon-accent)',
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
        <ChevronDown className="h-3 w-3 opacity-50" />
      </SelectTrigger>
      <SelectContent
        className={cn('border-(--ribbon-border) bg-(--ribbon-bg)', 'text-(--ribbon-text)')}
      >
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="hover:bg-(--ribbon-hover)">
            <span className="flex items-center gap-2">
              {option.icon}
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
