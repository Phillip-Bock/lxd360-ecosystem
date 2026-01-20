'use client';

/**
 * =============================================================================
 * INSPIRE Studio | Ribbon Group Component
 * =============================================================================
 *
 * A container component for grouping related ribbon tools together.
 * Displays a label below the group content following Office ribbon patterns.
 */

import { cn } from '@/lib/utils';

interface RibbonGroupProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function RibbonGroup({ label, children, className }: RibbonGroupProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Group content */}
      <div className="flex-1 flex items-center px-1">{children}</div>

      {/* Group label */}
      <div className="h-4 flex items-center justify-center border-t border-studio-surface/30">
        <span className="text-[9px] text-studio-text-muted uppercase tracking-wider font-medium">
          {label}
        </span>
      </div>
    </div>
  );
}
