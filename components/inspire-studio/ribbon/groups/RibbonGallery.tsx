'use client';

/**
 * =============================================================================
 * INSPIRE Studio | Ribbon Gallery Component
 * =============================================================================
 *
 * A visual gallery picker for inserting shapes, templates, callouts, etc.
 * Displays items in a grid with icons and labels.
 */

import { ChevronDown, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { safeInnerHtml } from '@/lib/sanitize';
import { cn } from '@/lib/utils';

export interface GalleryItem {
  icon?: LucideIcon | string;
  label: string;
  color?: string;
  onClick?: () => void;
  preview?: string;
}

interface RibbonGalleryProps {
  icon: LucideIcon;
  label: string;
  size?: 'medium' | 'large';
  items: GalleryItem[];
  columns?: number;
  disabled?: boolean;
  tooltip?: string;
  className?: string;
}

export function RibbonGallery({
  icon: Icon,
  label,
  size = 'large',
  items,
  columns = 3,
  disabled,
  tooltip,
  className,
}: RibbonGalleryProps) {
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

  const sizeClasses = {
    medium: 'h-8 px-2.5',
    large: 'h-[68px] w-[58px] flex-col',
  };

  const buttonContent = (
    <button
      type="button"
      onClick={() => !disabled && setIsOpen(!isOpen)}
      disabled={disabled}
      className={cn(
        'flex items-center justify-center gap-1 rounded-lg',
        'transition-all duration-150',
        sizeClasses[size],
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:bg-studio-surface/50 active:bg-studio-surface',
        'text-studio-text',
        className,
      )}
    >
      <Icon className={size === 'large' ? 'w-5 h-5' : 'w-4 h-4'} />
      <div className="flex items-center gap-0.5">
        <span className={size === 'large' ? 'text-[10px]' : 'text-xs'}>{label}</span>
        <ChevronDown className="w-3 h-3 text-studio-text-muted" />
      </div>
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

      {/* Gallery dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 p-3 bg-studio-bg border border-studio-surface/50 rounded-lg shadow-xl z-50">
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {items.map((item, index) => {
              const ItemIcon = typeof item.icon !== 'string' ? item.icon : undefined;

              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg',
                    'border border-studio-surface/50 transition-all duration-150',
                    'hover:border-studio-accent/50 hover:bg-studio-surface/30',
                    'min-w-[70px]',
                  )}
                >
                  {ItemIcon && (
                    <div
                      className="w-8 h-8 flex items-center justify-center rounded-md"
                      style={{ backgroundColor: item.color ? `${item.color}20` : undefined }}
                    >
                      <ItemIcon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                  )}
                  {item.preview && (
                    <div
                      className="w-8 h-8 flex items-center justify-center rounded-md bg-studio-surface/30"
                      {...safeInnerHtml(item.preview, 'rich')}
                    />
                  )}
                  <span className="text-[10px] text-studio-text text-center leading-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
