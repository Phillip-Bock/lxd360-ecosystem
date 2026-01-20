'use client';

import type * as React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type RibbonButtonSize = 'sm' | 'md' | 'lg' | 'lg-row';
type RibbonButtonVariant = 'default' | 'ghost' | 'accent' | 'pill';

interface RibbonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  label?: string;
  tooltip?: string;
  size?: RibbonButtonSize;
  variant?: RibbonButtonVariant;
  active?: boolean;
}

const sizeStyles: Record<RibbonButtonSize, string> = {
  sm: 'h-7 min-w-7 p-1',
  md: 'h-8 min-w-8 p-1.5',
  lg: 'h-14 min-w-14 flex-col gap-1 p-1',
  'lg-row': 'h-8 px-3 py-1.5 gap-2', // Horizontal: icon left, label right
};

const variantStyles: Record<RibbonButtonVariant, string> = {
  default: 'hover:bg-(--ribbon-hover) active:bg-(--ribbon-active)',
  ghost: 'hover:bg-transparent active:bg-transparent hover:text-(--ribbon-accent)',
  accent: 'bg-(--ribbon-accent) text-white hover:bg-(--ribbon-accent)/90',
  pill: 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 border border-gray-200',
};

export function RibbonButton({
  icon,
  label,
  tooltip,
  size = 'md',
  variant = 'default',
  active,
  className,
  children,
  ...props
}: RibbonButtonProps) {
  const isRowLayout = size === 'lg-row';
  const isLgVertical = size === 'lg';

  const button = (
    <button
      type="button"
      data-slot="ribbon-button"
      className={cn(
        'inline-flex items-center justify-center rounded-md',
        'text-(--ribbon-text) transition-colors',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--ribbon-accent)',
        'disabled:pointer-events-none disabled:opacity-40',
        sizeStyles[size],
        variantStyles[variant],
        active && 'bg-(--ribbon-active) ring-1 ring-(--ribbon-accent)/50',
        className,
      )}
      {...props}
    >
      {icon && (
        <span className={cn(isLgVertical ? 'text-xl' : 'text-base', 'shrink-0')}>{icon}</span>
      )}
      {label && (isLgVertical || isRowLayout) && (
        <span
          className={cn(
            'leading-tight whitespace-nowrap',
            isLgVertical ? 'text-[10px]' : 'text-xs font-medium',
          )}
        >
          {label}
        </span>
      )}
      {children}
    </button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
