'use client';

/**
 * =============================================================================
 * INSPIRE Studio | Ribbon Toggle Component
 * =============================================================================
 *
 * A toggle button for the ribbon that maintains active/inactive state.
 * Used for formatting toggles like Bold, Italic, alignment, etc.
 */

import type { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface RibbonToggleProps {
  icon: LucideIcon;
  isActive?: boolean;
  onClick?: () => void;
  tooltip?: string;
  disabled?: boolean;
  className?: string;
}

export function RibbonToggle({
  icon: Icon,
  isActive = false,
  onClick,
  tooltip,
  disabled,
  className,
}: RibbonToggleProps) {
  const buttonContent = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150',
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:bg-studio-surface/70 active:bg-studio-surface',
        isActive
          ? 'bg-studio-accent/20 text-studio-accent ring-1 ring-studio-accent/50'
          : 'text-studio-text',
        className,
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent
          className="bg-studio-bg border border-studio-surface text-brand-primary text-xs"
          sideOffset={5}
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
}
