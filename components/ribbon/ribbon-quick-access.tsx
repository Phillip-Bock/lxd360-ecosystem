'use client';

import type * as React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface QuickAccessAction {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  onClick: () => void;
}

interface RibbonQuickAccessProps {
  actions: QuickAccessAction[];
  className?: string;
}

export function RibbonQuickAccess({ actions, className }: RibbonQuickAccessProps) {
  return (
    <TooltipProvider>
      <div
        className={cn('flex items-center gap-0.5 h-7 px-2', 'bg-(--ribbon-bg)/50', className)}
        role="toolbar"
        aria-label="Quick access toolbar"
      >
        {actions.map((action) => (
          <Tooltip key={action.id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={action.onClick}
                className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-xs',
                  'text-(--ribbon-text-muted) hover:text-(--ribbon-text) hover:bg-white/10',
                  'focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-(--ribbon-accent)',
                  'transition-colors',
                )}
                aria-label={action.label}
              >
                <action.icon className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <div className="flex items-center gap-2">
                <span>{action.label}</span>
                {action.shortcut && (
                  <kbd className="px-1 py-0.5 text-[9px] bg-black/20 rounded">
                    {action.shortcut}
                  </kbd>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
