'use client';

/**
 * =============================================================================
 * INSPIRE Studio | Ribbon Separator Component
 * =============================================================================
 *
 * A visual separator between ribbon groups.
 */

import { cn } from '@/lib/utils';

interface RibbonSeparatorProps {
  className?: string;
}

export function RibbonSeparator({ className }: RibbonSeparatorProps) {
  return (
    <div
      className={cn(
        'w-px h-[72px] bg-linear-to-b from-transparent via-studio-surface/50 to-transparent mx-1',
        className,
      )}
    />
  );
}
