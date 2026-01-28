'use client';

/**
 * =============================================================================
 * INSPIRE Studio | Ribbon Color Picker Component
 * =============================================================================
 *
 * A color picker button with dropdown for selecting text colors,
 * highlights, and background colors.
 */

import { ChevronDown, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface RibbonColorPickerProps {
  icon: LucideIcon;
  color: string;
  onChange: (color: string) => void;
  tooltip?: string;
  disabled?: boolean;
  className?: string;
}

const PRESET_COLORS = [
  // Row 1 - Theme colors
  ['#ffffff', '#000000', '#0056B8', '#479DFF', '#BA23FB', '#22c55e', '#f59e0b', '#ef4444'],
  // Row 2 - Light variants
  ['#f8fafc', '#374151', '#004494', '#7eb8ff', '#d580ff', '#4ade80', '#fbbf24', '#f87171'],
  // Row 3 - Dark variants
  ['#e2e8f0', '#1f2937', '#003570', '#3a8ae6', '#9333ea', '#16a34a', '#d97706', '#dc2626'],
  // Row 4 - Pastels
  ['#fef3c7', '#dbeafe', '#f3e8ff', '#dcfce7', '#fce7f3', '#e0f2fe', '#fef9c3', '#fee2e2'],
];

export function RibbonColorPicker({
  icon: Icon,
  color,
  onChange,
  tooltip,
  disabled,
  className,
}: RibbonColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(color);
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

  const buttonContent = (
    <button
      type="button"
      onClick={() => !disabled && setIsOpen(!isOpen)}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center justify-center gap-0.5 w-8 h-8 rounded-md',
        'transition-all duration-150',
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:bg-(--surface-card-hover)/50 active:bg-(--surface-card-hover)',
        'text-(--text-muted)',
        className,
      )}
    >
      <Icon className="w-4 h-4" />
      <div
        className="w-4 h-1 rounded-sm"
        style={{ backgroundColor: color === 'transparent' ? undefined : color }}
      />
      <ChevronDown className="w-2.5 h-2.5 text-(--text-tertiary)" />
    </button>
  );

  return (
    <div ref={ref} className="relative">
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent
            className="bg-studio-bg border border-studio-surface text-brand-primary text-xs"
            sideOffset={5}
          >
            {tooltip}
          </TooltipContent>
        </Tooltip>
      ) : (
        buttonContent
      )}

      {/* Color picker dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 p-3 bg-studio-bg border border-studio-surface/50 rounded-lg shadow-xl z-50 w-[200px]">
          {/* Preset colors grid */}
          <div className="space-y-1.5 mb-3">
            {PRESET_COLORS.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1">
                {row.map((presetColor) => (
                  <button
                    type="button"
                    key={presetColor}
                    onClick={() => {
                      onChange(presetColor);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-5 h-5 rounded border transition-all',
                      color === presetColor
                        ? 'border-studio-accent ring-1 ring-studio-accent'
                        : 'border-studio-surface/50 hover:border-studio-accent/50',
                    )}
                    style={{ backgroundColor: presetColor }}
                    title={presetColor}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-studio-surface/50 mb-3" />

          {/* Custom color input */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-studio-surface/50"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="flex-1 px-2 py-1 text-xs bg-studio-surface/30 border border-studio-surface/50 rounded text-brand-primary"
              placeholder="#000000"
            />
            <button
              type="button"
              onClick={() => {
                onChange(customColor);
                setIsOpen(false);
              }}
              className="px-2 py-1 text-xs bg-studio-accent text-brand-primary rounded hover:bg-studio-accent-hover transition-colors"
            >
              OK
            </button>
          </div>

          {/* No color option */}
          <button
            type="button"
            onClick={() => {
              onChange('transparent');
              setIsOpen(false);
            }}
            className="w-full mt-2 px-2 py-1.5 text-xs text-studio-text hover:bg-studio-surface/50 rounded transition-colors text-left"
          >
            No Color
          </button>
        </div>
      )}
    </div>
  );
}
