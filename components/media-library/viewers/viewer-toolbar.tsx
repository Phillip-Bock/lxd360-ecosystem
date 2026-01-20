'use client';

import type * as React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  shortcut?: string;
}

export function ToolbarButton({
  icon,
  label,
  onClick,
  active = false,
  disabled = false,
  shortcut,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            'h-8 w-8 rounded-md transition-colors',
            active && 'bg-accent text-accent-foreground',
          )}
        >
          {icon}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-2">
        <span>{label}</span>
        {shortcut && (
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export interface ToolbarGroupProps {
  children?: React.ReactNode;
  className?: string;
}

export function ToolbarGroup({ children, className }: ToolbarGroupProps) {
  return <div className={cn('flex items-center gap-0.5', className)}>{children}</div>;
}

export function ToolbarSeparator() {
  return <Separator orientation="vertical" className="mx-2 h-6" />;
}

export interface ViewerToolbarProps {
  children?: React.ReactNode;
  position?: 'top' | 'bottom';
  className?: string;
  floating?: boolean;
}

export function ViewerToolbar({
  children,
  position = 'bottom',
  className,
  floating = true,
}: ViewerToolbarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-1 px-2 py-1.5',
        floating
          ? cn(
              'absolute left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-xs border rounded-lg shadow-lg',
              position === 'top' ? 'top-3' : 'bottom-3',
            )
          : 'bg-muted/50 border-t',
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface ToolbarSelectProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}

export function ToolbarSelect({ value, options, onChange, className }: ToolbarSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'h-8 px-2 rounded-md bg-transparent border text-sm focus:outline-hidden focus:ring-2 focus:ring-ring',
        className,
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
