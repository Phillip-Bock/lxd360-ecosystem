'use client';

import { cn } from '@/lib/utils';

export interface ProgressRingProps {
  /** Progress value (0-100) */
  progress: number;
  /** Ring size in pixels */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Ring color variant */
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  /** Show percentage label */
  showPercentage?: boolean;
  /** Additional class names */
  className?: string;
}

const variantColors = {
  primary: { stroke: 'var(--color-lxd-primary)', glow: 'oklch(60% 0.15 240 / 0.4)' },
  success: { stroke: 'var(--color-lxd-success)', glow: 'oklch(50% 0.2 140 / 0.4)' },
  warning: { stroke: 'var(--color-lxd-warning)', glow: 'oklch(55% 0.15 50 / 0.4)' },
  danger: { stroke: 'var(--color-lxd-error)', glow: 'oklch(50% 0.25 25 / 0.4)' },
};

/**
 * ProgressRing - Circular progress indicator for learner dashboard
 *
 * Features:
 * - SVG-based circular progress
 * - Animated stroke with glow effect
 * - Multiple color variants
 * - Accessible with proper ARIA attributes
 */
export function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 5,
  variant = 'primary',
  showPercentage = true,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const offset = circumference - (clampedProgress / 100) * circumference;
  const colorConfig = variantColors[variant];
  const accessibleLabel = `Progress: ${Math.round(clampedProgress)}%`;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        role="img"
        aria-label={accessibleLabel}
      >
        <title>{accessibleLabel}</title>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorConfig.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.5s ease-out',
            filter: `drop-shadow(0 0 4px ${colorConfig.glow})`,
          }}
        />
      </svg>

      {/* Center percentage */}
      {showPercentage && (
        <span
          className="absolute font-mono font-bold text-foreground"
          style={{ fontSize: size * 0.22 }}
          aria-hidden="true"
        >
          {Math.round(clampedProgress)}%
        </span>
      )}
    </div>
  );
}
