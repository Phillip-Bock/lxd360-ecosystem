'use client';

/**
 * =============================================================================
 * INSPIRE Studio | Ribbon Split Button Component
 * =============================================================================
 *
 * A button with a primary action and a dropdown for additional options.
 * Combines immediate action with expanded menu capabilities.
 */

import { ChevronDown, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/** Menu item with label and optional action */
interface MenuItemWithLabel {
  icon?: LucideIcon | string;
  label: string;
  onClick?: () => void;
  type?: never;
  disabled?: boolean;
  shortcut?: string;
}

/** Menu separator */
interface MenuSeparator {
  type: 'separator';
}

export type MenuItem = MenuItemWithLabel | MenuSeparator;

interface RibbonSplitButtonProps {
  icon: LucideIcon;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  menuItems: MenuItem[];
  disabled?: boolean;
  tooltip?: string;
  gradient?: boolean;
  className?: string;
}

export function RibbonSplitButton({
  icon: Icon,
  label,
  size = 'medium',
  onClick,
  menuItems,
  disabled,
  tooltip,
  gradient,
  className,
}: RibbonSplitButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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
    small: 'h-7',
    medium: 'h-8',
    large: 'h-[68px] w-[58px]',
  };

  const mainButton = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center justify-center gap-1 rounded-l-lg',
        'transition-all duration-150',
        size === 'large' ? 'flex-col h-[52px] w-full rounded-lg rounded-b-none' : sizeClasses[size],
        size !== 'large' ? 'px-2' : 'px-1',
        disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-studio-surface/50',
        gradient
          ? 'bg-linear-to-r from-studio-accent/20 to-lxd-purple-light/20 hover:from-studio-accent/30 hover:to-lxd-purple-light/30'
          : '',
        'text-studio-text',
      )}
    >
      <Icon className={size === 'large' ? 'w-5 h-5' : 'w-4 h-4'} />
      {label && <span className={size === 'large' ? 'text-[10px]' : 'text-xs'}>{label}</span>}
    </button>
  );

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div className={cn('flex', size === 'large' ? 'flex-col' : 'flex-row')}>
        {/* Main button */}
        {tooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>{mainButton}</TooltipTrigger>
            <TooltipContent
              className="bg-studio-bg border border-studio-surface text-brand-primary text-xs"
              sideOffset={5}
            >
              {tooltip}
            </TooltipContent>
          </Tooltip>
        ) : (
          mainButton
        )}

        {/* Dropdown trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'flex items-center justify-center rounded-r-lg border-l border-studio-surface/30',
            'transition-all duration-150',
            size === 'large' ? 'h-4 w-full rounded-lg rounded-t-none' : `${sizeClasses[size]} w-5`,
            disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-studio-surface/50',
            'text-studio-text-muted',
          )}
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 min-w-[200px] py-1 bg-studio-bg border border-studio-surface/50 rounded-lg shadow-xl z-50">
          {menuItems.map((item, index) =>
            item.type === 'separator' ? (
              <div key={index} className="h-px bg-studio-surface/50 my-1" />
            ) : (
              <button
                type="button"
                key={index}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-studio-text hover:bg-studio-surface/50 hover:text-brand-primary transition-colors disabled:opacity-40"
              >
                <div className="flex items-center gap-2">
                  {item.icon &&
                    typeof item.icon !== 'string' &&
                    (() => {
                      const ItemIcon = item.icon;
                      return <ItemIcon className="w-4 h-4" />;
                    })()}
                  <span>{item.label}</span>
                </div>
                {item.shortcut && (
                  <span className="text-xs text-studio-text-muted">{item.shortcut}</span>
                )}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
