'use client';

/**
 * ProgressBar - Linear progress indicator
 *
 * Features:
 * - Animated fill with smooth transitions
 * - Optional label display
 * - Striped animation option
 * - Fully accessible
 * - Respects prefers-reduced-motion
 */

import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  /** Progress value from 0-100 */
  progress: number;
  /** Show percentage label */
  showLabel?: boolean;
  /** Enable striped animation */
  animated?: boolean;
  /** Bar height */
  size?: 'sm' | 'md' | 'lg';
  /** Color theme */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'cyan' | 'purple';
  /** Custom className */
  className?: string;
  /** Accessible label */
  ariaLabel?: string;
  /** Label position */
  labelPosition?: 'inside' | 'right' | 'above';
}

const SIZE_CONFIG = {
  sm: { height: 'h-1.5', fontSize: 'text-[10px]', labelOffset: 'text-xs' },
  md: { height: 'h-2.5', fontSize: 'text-xs', labelOffset: 'text-sm' },
  lg: { height: 'h-4', fontSize: 'text-sm', labelOffset: 'text-base' },
} as const;

const COLOR_CONFIG = {
  primary: 'bg-lxd-primary',
  secondary: 'bg-lxd-secondary',
  success: 'bg-success',
  warning: 'bg-warning',
  cyan: 'bg-[hsl(187,100%,50%)]',
  purple: 'bg-[hsl(250,89%,66%)]',
} as const;

export function ProgressBar({
  progress,
  showLabel = false,
  animated = false,
  size = 'md',
  color = 'primary',
  className,
  ariaLabel,
  labelPosition = 'right',
}: ProgressBarProps): React.JSX.Element {
  // Clamp progress to 0-100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const config = SIZE_CONFIG[size];
  const bgColor = COLOR_CONFIG[color];

  const barContent = (
    <div
      className={cn('relative w-full overflow-hidden rounded-full bg-muted', config.height)}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel ?? `Progress: ${clampedProgress}%`}
    >
      {/* Progress fill */}
      <div
        className={cn(
          'h-full rounded-full motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out',
          bgColor,
          animated &&
            'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] motion-safe:animate-[shimmer_2s_linear_infinite]',
        )}
        style={{ width: `${clampedProgress}%` }}
      >
        {/* Inside label */}
        {showLabel && labelPosition === 'inside' && clampedProgress > 15 && (
          <span
            className={cn(
              'absolute inset-0 flex items-center justify-center text-white font-medium tabular-nums',
              config.fontSize,
            )}
          >
            {Math.round(clampedProgress)}%
          </span>
        )}
      </div>
    </div>
  );

  // Above label layout
  if (showLabel && labelPosition === 'above') {
    return (
      <div className={cn('w-full', className)}>
        <div className="flex justify-between mb-1">
          <span className={cn('text-muted-foreground', config.labelOffset)}>Progress</span>
          <span className={cn('font-medium tabular-nums', config.labelOffset)}>
            {Math.round(clampedProgress)}%
          </span>
        </div>
        {barContent}
      </div>
    );
  }

  // Right label layout
  if (showLabel && labelPosition === 'right') {
    return (
      <div className={cn('flex items-center gap-3 w-full', className)}>
        <div className="flex-1">{barContent}</div>
        <span className={cn('font-medium tabular-nums shrink-0', config.labelOffset)}>
          {Math.round(clampedProgress)}%
        </span>
      </div>
    );
  }

  // No label or inside label
  return <div className={cn('w-full', className)}>{barContent}</div>;
}

/**
 * Segmented progress bar showing multiple items
 */
export interface SegmentedProgressBarProps {
  /** Array of segment values (0-100 each, total should sum to 100 or less) */
  segments: Array<{
    value: number;
    color: keyof typeof COLOR_CONFIG;
    label?: string;
  }>;
  /** Bar height */
  size?: ProgressBarProps['size'];
  /** Custom className */
  className?: string;
  /** Show legend */
  showLegend?: boolean;
}

export function SegmentedProgressBar({
  segments,
  size = 'md',
  className,
  showLegend = false,
}: SegmentedProgressBarProps): React.JSX.Element {
  const config = SIZE_CONFIG[size];
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn('relative w-full overflow-hidden rounded-full bg-muted flex', config.height)}
        role="progressbar"
        aria-valuenow={total}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress: ${Math.round(total)}%`}
      >
        {segments.map((segment, index) => (
          <div
            key={index}
            className={cn(
              'h-full motion-safe:transition-all motion-safe:duration-500',
              COLOR_CONFIG[segment.color],
              index === 0 && 'rounded-l-full',
              index === segments.length - 1 && segment.value > 0 && 'rounded-r-full',
            )}
            style={{ width: `${segment.value}%` }}
          />
        ))}
      </div>

      {showLegend && (
        <div className="flex flex-wrap gap-4 mt-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <div className={cn('w-2.5 h-2.5 rounded-sm', COLOR_CONFIG[segment.color])} />
              <span className="text-xs text-muted-foreground">
                {segment.label ?? `Segment ${index + 1}`}: {Math.round(segment.value)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
