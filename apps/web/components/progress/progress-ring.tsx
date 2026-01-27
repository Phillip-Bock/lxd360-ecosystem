'use client';

/**
 * ProgressRing - Circular progress indicator with animated fill
 *
 * Features:
 * - SVG-based circular progress
 * - Animated fill with transitions
 * - Multiple sizes and colors
 * - Fully accessible (ARIA attributes)
 * - Respects prefers-reduced-motion
 */

import { cn } from '@/lib/utils';

export interface ProgressRingProps {
  /** Progress value from 0-100 */
  progress: number;
  /** Ring size */
  size?: 'sm' | 'md' | 'lg';
  /** Show percentage label in center */
  showLabel?: boolean;
  /** Ring color theme */
  color?: 'cyan' | 'purple' | 'green' | 'primary' | 'success' | 'warning';
  /** Custom className */
  className?: string;
  /** Stroke width override */
  strokeWidth?: number;
  /** Accessible label */
  ariaLabel?: string;
}

const SIZE_CONFIG = {
  sm: { diameter: 48, stroke: 4, fontSize: 'text-xs', fontWeight: 'font-medium' },
  md: { diameter: 80, stroke: 6, fontSize: 'text-lg', fontWeight: 'font-bold' },
  lg: { diameter: 120, stroke: 8, fontSize: 'text-2xl', fontWeight: 'font-bold' },
} as const;

const COLOR_CONFIG = {
  cyan: { stroke: 'var(--color-neural-cyan, #00D4FF)', track: 'var(--muted)' },
  purple: { stroke: 'var(--color-neural-purple, #8B5CF6)', track: 'var(--muted)' },
  green: { stroke: 'var(--color-success, #22C55E)', track: 'var(--muted)' },
  primary: { stroke: 'var(--brand-primary, #0056B8)', track: 'var(--muted)' },
  success: { stroke: 'var(--color-success, #22C55E)', track: 'var(--muted)' },
  warning: { stroke: 'var(--color-warning, #F59E0B)', track: 'var(--muted)' },
} as const;

export function ProgressRing({
  progress,
  size = 'md',
  showLabel = true,
  color = 'cyan',
  className,
  strokeWidth,
  ariaLabel,
}: ProgressRingProps): React.JSX.Element {
  // Clamp progress to 0-100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const config = SIZE_CONFIG[size];
  const colorConfig = COLOR_CONFIG[color];
  const stroke = strokeWidth ?? config.stroke;

  // SVG calculations
  const radius = (config.diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;
  const center = config.diameter / 2;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel ?? `Progress: ${clampedProgress}%`}
    >
      <svg
        aria-hidden="true"
        className="-rotate-90 motion-safe:transition-all motion-safe:duration-500"
        width={config.diameter}
        height={config.diameter}
        viewBox={`0 0 ${config.diameter} ${config.diameter}`}
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colorConfig.stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out"
        />
      </svg>

      {/* Center label */}
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(config.fontSize, config.fontWeight, 'tabular-nums')}>
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Mini progress ring for inline use
 */
export interface MiniProgressRingProps {
  progress: number;
  color?: ProgressRingProps['color'];
  className?: string;
}

export function MiniProgressRing({
  progress,
  color = 'cyan',
  className,
}: MiniProgressRingProps): React.JSX.Element {
  return (
    <ProgressRing
      progress={progress}
      size="sm"
      showLabel={false}
      color={color}
      className={className}
    />
  );
}
