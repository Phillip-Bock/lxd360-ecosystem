'use client';

/**
 * =============================================================================
 * INSPIRE Studio | Ribbon Dropdown Component
 * =============================================================================
 *
 * A simple dropdown selector for the ribbon.
 * Used for font sizes, zoom levels, and other single-value selections.
 */

import { Check, ChevronDown } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface RibbonDropdownProps {
  value?: string;
  options?: string[];
  onChange?: (value: string) => void;
  width?: number;
  disabled?: boolean;
  className?: string;
  trigger?: ReactNode;
  children?: ReactNode;
  placeholder?: string;
}

export function RibbonDropdown({
  value,
  options = [],
  onChange,
  width = 80,
  disabled,
  className,
  trigger,
  children,
  placeholder = 'Select...',
}: RibbonDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If trigger is provided, use it as a custom trigger
  if (trigger) {
    return (
      <div ref={ref} className={cn('relative', className)}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'flex items-center justify-center w-6 h-6 rounded transition-colors',
            disabled
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-studio-surface/50 text-studio-text-muted hover:text-brand-primary',
          )}
        >
          {trigger}
        </button>

        {isOpen && children && (
          <div className="absolute top-full right-0 mt-1 py-1 bg-studio-bg border border-studio-surface/50 rounded-lg shadow-xl z-50 min-w-[180px] max-h-[400px] overflow-y-auto">
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn('relative', className)} style={{ width }}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full h-7 px-2 flex items-center justify-between gap-1 rounded-md',
          'bg-studio-surface/30 border border-studio-surface/50',
          'transition-all duration-150',
          disabled
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:border-studio-accent/50 hover:bg-studio-surface/50',
          isOpen && 'border-studio-accent bg-studio-surface/50',
        )}
      >
        <span className="text-xs text-brand-primary truncate">{value || placeholder}</span>
        <ChevronDown className="w-3.5 h-3.5 text-studio-text-muted shrink-0" />
      </button>

      {/* Dropdown */}
      {isOpen && options.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full py-1 bg-studio-bg border border-studio-surface/50 rounded-lg shadow-xl z-50 max-h-[200px] overflow-y-auto">
          {options.map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => {
                onChange?.(option);
                setIsOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors',
                value === option
                  ? 'bg-studio-accent/20 text-studio-accent'
                  : 'text-studio-text hover:bg-studio-surface/50 hover:text-brand-primary',
              )}
            >
              {value === option && <Check className="w-3 h-3 shrink-0" />}
              <span className={cn(value !== option && 'ml-5')}>{option}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
