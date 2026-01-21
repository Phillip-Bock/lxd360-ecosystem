'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Check, ChevronDown, Search } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface ComboboxOption {
  value: string;
  label: string;
  preview?: React.ReactNode;
}

interface RibbonComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  width?: number;
  className?: string;
}

export function RibbonCombobox({
  options,
  value,
  onSelect,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  width = 140,
  className,
}: RibbonComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(lower));
  }, [options, search]);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'flex items-center justify-between gap-1 h-7 px-2 rounded-xs',
            'bg-white/5 border border-(--ribbon-border)',
            'text-(--ribbon-text-muted) hover:text-(--ribbon-text) hover:bg-white/10',
            'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--ribbon-accent)',
            className,
          )}
          style={{ width }}
        >
          <span className="truncate text-xs">{selectedOption?.label || placeholder}</span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className={cn(
            'z-50 rounded-lg overflow-hidden',
            'bg-(--ribbon-bg) border border-(--ribbon-border)',
            'shadow-xl shadow-black/30',
            'animate-in fade-in-0 zoom-in-95',
          )}
          style={{ width: Math.max(width, 180) }}
          sideOffset={4}
        >
          {/* Search input */}
          <div className="flex items-center gap-2 p-2 border-b border-white/10">
            <Search className="h-4 w-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                'flex-1 bg-transparent text-sm text-(--ribbon-text) placeholder:text-white/40',
                'focus:outline-hidden',
              )}
            />
          </div>

          {/* Options list */}
          <div className="max-h-50 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-white/40">No results found</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onSelect(option.value);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    'flex items-center gap-2 w-full px-2 py-1.5 rounded-xs',
                    'text-sm text-(--ribbon-text-muted)',
                    'hover:bg-(--ribbon-hover) hover:text-(--ribbon-text)',
                    'focus:bg-(--ribbon-hover) focus:text-(--ribbon-text) focus:outline-hidden',
                    value === option.value && 'bg-(--ribbon-active)',
                  )}
                >
                  {option.preview && <div className="shrink-0">{option.preview}</div>}
                  <span className="flex-1 text-left truncate">{option.label}</span>
                  {value === option.value && <Check className="h-4 w-4 text-(--ribbon-accent)" />}
                </button>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
