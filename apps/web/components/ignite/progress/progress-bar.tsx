'use client';

import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  /** Progress value from 0 to 100 */
  value: number;
  /** Optional label displayed above the progress bar */
  label?: string;
  /** Show percentage value on the right side */
  showPercentage?: boolean;
  /** Size variant of the progress bar */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant based on status */
  variant?: 'default' | 'success' | 'warning' | 'danger';
  /** Additional class names */
  className?: string;
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
} as const;

const variantStyles = {
  default: 'bg-lxd-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-error',
} as const;

const variantGlowStyles = {
  default: 'shadow-[0_0_8px_rgba(0,86,184,0.4)]',
  success: 'shadow-[0_0_8px_rgba(34,197,94,0.4)]',
  warning: 'shadow-[0_0_8px_rgba(245,158,11,0.4)]',
  danger: 'shadow-[0_0_8px_rgba(239,68,68,0.4)]',
} as const;

/**
 * ProgressBar - Linear progress indicator with labels
 *
 * Features:
 * - Multiple size variants (sm, md, lg)
 * - Color variants for status indication
 * - Optional label and percentage display
 * - Motion-safe animations
 * - WCAG 2.2 AA compliant
 *
 * @example
 * ```tsx
 * <ProgressBar value={75} label="Course Progress" showPercentage />
 * <ProgressBar value={90} variant="success" size="lg" />
 * ```
 */
export function ProgressBar({
  value,
  label,
  showPercentage = false,
  size = 'md',
  variant = 'default',
  className,
}: ProgressBarProps): React.JSX.Element {
  const clampedValue = Math.min(100, Math.max(0, value));
  const accessibleLabel = label
    ? `${label}: ${Math.round(clampedValue)}% complete`
    : `Progress: ${Math.round(clampedValue)}% complete`;

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm font-medium text-foreground">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-muted-foreground tabular-nums">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn('w-full rounded-full bg-muted/30 overflow-hidden', sizeStyles[size])}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={accessibleLabel}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out motion-reduce:transition-none',
            variantStyles[variant],
            clampedValue > 0 && variantGlowStyles[variant],
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
