'use client';

/**
 * =============================================================================
 * INSPIRE Studio | Ribbon Button Component
 * =============================================================================
 *
 * A versatile button component for the ribbon interface.
 * Supports multiple sizes, tooltips, badges, gradients, and keyboard shortcuts.
 */

import type { LucideIcon } from 'lucide-react';
import { forwardRef } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface RibbonButtonProps {
  icon: LucideIcon;
  label?: string;
  size?: 'tiny' | 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
  tooltip?: string;
  shortcut?: string;
  badge?: string;
  gradient?: boolean;
  isActive?: boolean;
  className?: string;
}

export const RibbonButton = forwardRef<HTMLButtonElement, RibbonButtonProps>(
  (
    {
      icon: Icon,
      label,
      size = 'medium',
      onClick,
      disabled,
      tooltip,
      shortcut,
      badge,
      gradient,
      isActive,
      className,
    },
    ref,
  ) => {
    const sizeClasses = {
      tiny: 'w-6 h-6',
      small: 'h-7 px-2 gap-1',
      medium: 'h-8 px-2.5 gap-1.5',
      large: 'h-[68px] w-[58px] flex-col gap-1',
    };

    const iconSizes = {
      tiny: 'w-3.5 h-3.5',
      small: 'w-4 h-4',
      medium: 'w-4 h-4',
      large: 'w-5 h-5',
    };

    const buttonContent = (
      <button
        type="button"
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'relative flex items-center justify-center rounded-lg',
          'transition-all duration-150 font-medium',
          sizeClasses[size],
          disabled
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:bg-(--surface-card-hover)/50 active:bg-(--surface-card-hover)',
          isActive
            ? 'bg-(--brand-primary-hover)/20 text-(--brand-primary-hover)'
            : 'text-(--text-muted)',
          gradient && !disabled
            ? 'bg-linear-to-r from-(--brand-primary-hover)/20 to-(--brand-secondary)/20 hover:from-(--brand-primary-hover)/30 hover:to-(--brand-secondary)/30'
            : '',
          className,
        )}
      >
        <Icon className={iconSizes[size]} />
        {label && size !== 'tiny' && (
          <span
            className={cn(size === 'large' ? 'text-[10px] text-center leading-tight' : 'text-xs')}
          >
            {label}
          </span>
        )}

        {/* Badge */}
        {badge && (
          <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-brand-warning text-[8px] text-brand-primary rounded font-bold">
            {badge}
          </span>
        )}
      </button>
    );

    if (tooltip || shortcut) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent
            className="bg-(--surface-page) border border-(--surface-card-hover) text-(--text-inverse)"
            sideOffset={5}
          >
            <div className="text-center">
              <div className="text-xs">{tooltip || label}</div>
              {shortcut && (
                <div className="text-[10px] text-(--text-tertiary) mt-0.5">{shortcut}</div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    return buttonContent;
  },
);

RibbonButton.displayName = 'RibbonButton';
