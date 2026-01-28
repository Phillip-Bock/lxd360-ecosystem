'use client';

import type * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressRingProps {
  /** Progress value from 0 to 100 */
  value: number;
  /** Ring diameter in pixels */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Show percentage label in center */
  showLabel?: boolean;
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'danger';
  /** Custom content to render in the center */
  children?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

const variantColors = {
  default: {
    stroke: 'var(--color-lxd-primary, #0056B8)',
    glow: 'drop-shadow(0 0 6px rgba(0, 86, 184, 0.5))',
  },
  success: {
    stroke: 'var(--color-success, #22C55E)',
    glow: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.5))',
  },
  warning: {
    stroke: 'var(--color-warning, #F59E0B)',
    glow: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.5))',
  },
  danger: {
    stroke: 'var(--color-error, #EF4444)',
    glow: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.5))',
  },
} as const;

/**
 * ProgressRing - Circular SVG-based progress indicator
 *
 * Features:
 * - SVG-based for crisp rendering at any size
 * - Animated stroke progress
 * - Customizable center content via children
 * - Motion-safe animations
 * - WCAG 2.2 AA compliant with proper ARIA attributes
 *
 * @example
 * ```tsx
 * <ProgressRing value={75} showLabel />
 * <ProgressRing value={100} variant="success" size={100}>
 *   <span className="text-lg font-bold">Done!</span>
 * </ProgressRing>
 * ```
 */
export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 6,
  showLabel = true,
  variant = 'default',
  children,
  className,
}: ProgressRingProps): React.JSX.Element {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clampedValue / 100) * circumference;
  const colorConfig = variantColors[variant];
  const accessibleLabel = `Progress: ${Math.round(clampedValue)}% complete`;

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
          className="transition-[stroke-dashoffset] duration-500 ease-out motion-reduce:transition-none"
          style={{
            filter: clampedValue > 0 ? colorConfig.glow : undefined,
          }}
        />
      </svg>

      {/* Center content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        aria-hidden="true"
      >
        {children ??
          (showLabel && (
            <span className="font-mono font-bold text-foreground" style={{ fontSize: size * 0.22 }}>
              {Math.round(clampedValue)}%
            </span>
          ))}
      </div>
    </div>
  );
}
