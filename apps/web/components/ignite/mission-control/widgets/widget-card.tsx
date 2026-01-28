'use client';

import { cn } from '@/lib/utils';

export interface WidgetCardProps {
  /** Widget title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Icon emoji or component */
  icon?: React.ReactNode;
  /** Accent color for the top border */
  accentColor?: 'cyan' | 'purple' | 'success' | 'warning' | 'danger' | 'magenta';
  /** Widget size */
  size?: 'small' | 'medium' | 'large' | 'full';
  /** Action buttons in header */
  headerActions?: React.ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Widget content */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

const accentColors = {
  cyan: 'from-cyan-500 to-cyan-400',
  purple: 'from-violet-500 to-violet-400',
  success: 'from-emerald-500 to-emerald-400',
  warning: 'from-amber-500 to-amber-400',
  danger: 'from-red-500 to-red-400',
  magenta: 'from-fuchsia-500 to-fuchsia-400',
};

const sizeClasses = {
  small: 'col-span-1',
  medium: 'col-span-2',
  large: 'col-span-3',
  full: 'col-span-4',
};

/**
 * WidgetCard - Glass morphism card for Mission Control widgets
 *
 * Features:
 * - Accent color top border
 * - Glass background
 * - Header with icon, title, actions
 * - Loading state
 */
export function WidgetCard({
  title,
  subtitle,
  icon,
  accentColor = 'cyan',
  size = 'medium',
  headerActions,
  isLoading = false,
  children,
  className,
}: WidgetCardProps) {
  return (
    <div
      className={cn(
        // Base styles
        'relative rounded-xl overflow-hidden',
        // Glass morphism
        'bg-card/60 backdrop-blur-xl border border-border/50',
        // Shadow
        'shadow-lg shadow-black/5 dark:shadow-black/20',
        // Grid sizing
        sizeClasses[size],
        className,
      )}
    >
      {/* Accent line */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-[2px]',
          'bg-gradient-to-r',
          accentColors[accentColor],
        )}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                'bg-muted/30 text-lg',
              )}
            >
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-muted/30 rounded w-3/4" />
            <div className="h-4 bg-muted/30 rounded w-1/2" />
            <div className="h-20 bg-muted/30 rounded" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
