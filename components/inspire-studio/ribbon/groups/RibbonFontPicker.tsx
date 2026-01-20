'use client';

/**
 * =============================================================================
 * INSPIRE Studio | Ribbon Font Picker Component
 * =============================================================================
 *
 * A dropdown for selecting font families in the ribbon.
 * Shows font previews in their actual typeface.
 */

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface RibbonFontPickerProps {
  value: string;
  onChange: (font: string) => void;
  width?: number;
  disabled?: boolean;
  className?: string;
}

const FONT_OPTIONS = [
  { name: 'Inter', family: 'Inter, sans-serif' },
  { name: 'Arial', family: 'Arial, sans-serif' },
  { name: 'Helvetica', family: 'Helvetica, sans-serif' },
  { name: 'Georgia', family: 'Georgia, serif' },
  { name: 'Times New Roman', family: '"Times New Roman", serif' },
  { name: 'Courier New', family: '"Courier New", monospace' },
  { name: 'Verdana', family: 'Verdana, sans-serif' },
  { name: 'Trebuchet MS', family: '"Trebuchet MS", sans-serif' },
  { name: 'Roboto', family: 'Roboto, sans-serif' },
  { name: 'Open Sans', family: '"Open Sans", sans-serif' },
  { name: 'Lato', family: 'Lato, sans-serif' },
  { name: 'Montserrat', family: 'Montserrat, sans-serif' },
  { name: 'Source Sans Pro', family: '"Source Sans Pro", sans-serif' },
  { name: 'Raleway', family: 'Raleway, sans-serif' },
  { name: 'Poppins', family: 'Poppins, sans-serif' },
];

export function RibbonFontPicker({
  value,
  onChange,
  width = 140,
  disabled,
  className,
}: RibbonFontPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredFonts = FONT_OPTIONS.filter((font) =>
    font.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedFont = FONT_OPTIONS.find((f) => f.name === value);

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
        <span
          className="text-xs text-brand-primary truncate"
          style={{ fontFamily: selectedFont?.family }}
        >
          {value}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-studio-text-muted shrink-0" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full py-1 bg-studio-bg border border-studio-surface/50 rounded-lg shadow-xl z-50 max-h-[300px] overflow-hidden flex flex-col">
          {/* Search input */}
          <div className="px-2 pb-2">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search fonts..."
              className="w-full px-2 py-1.5 text-xs bg-studio-surface/30 border border-studio-surface/50 rounded text-brand-primary placeholder:text-studio-text-muted"
            />
          </div>

          {/* Font list */}
          <div className="overflow-y-auto flex-1">
            {filteredFonts.map((font) => (
              <button
                type="button"
                key={font.name}
                onClick={() => {
                  onChange(font.name);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                  value === font.name
                    ? 'bg-studio-accent/20 text-studio-accent'
                    : 'text-studio-text hover:bg-studio-surface/50 hover:text-brand-primary',
                )}
              >
                {value === font.name && <Check className="w-3.5 h-3.5 shrink-0" />}
                <span
                  className={cn('truncate', value !== font.name && 'ml-5')}
                  style={{ fontFamily: font.family }}
                >
                  {font.name}
                </span>
              </button>
            ))}

            {filteredFonts.length === 0 && (
              <div className="px-3 py-4 text-xs text-studio-text-muted text-center">
                No fonts found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
