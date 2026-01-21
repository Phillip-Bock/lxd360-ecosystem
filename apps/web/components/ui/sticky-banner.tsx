'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * =============================================================================
 * LXP360-SaaS | Sticky Banner Component
 * =============================================================================
 *
 * @fileoverview A dismissible sticky banner component for announcements,
 * alerts, and promotional messages.
 *
 * @version      1.0.0
 * @updated      2025-12-20
 *
 * =============================================================================
 */

const stickyBannerVariants = cva(
  'sticky top-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        success: 'bg-green-500 text-white',
        warning: 'bg-yellow-500 text-black',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
        glass: 'bg-background/80 backdrop-blur-md border-b border-border',
        neural:
          'bg-linear-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-md border-b border-cyan-500/30 text-cyan-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface StickyBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stickyBannerVariants> {
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function StickyBanner({
  className,
  variant,
  dismissible = false,
  onDismiss,
  children,
  ...props
}: StickyBannerProps): React.JSX.Element | null {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleDismiss = React.useCallback((): void => {
    setIsVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  if (!isVisible) return null;

  return (
    <div className={cn(stickyBannerVariants({ variant }), className)} role="alert" {...props}>
      <div className="flex-1 text-center">{children}</div>
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="ml-2 rounded-full p-1 hover:bg-white/20 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
