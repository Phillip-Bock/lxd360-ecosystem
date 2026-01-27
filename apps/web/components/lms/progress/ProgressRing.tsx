'use client';

import type React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressRingProps {
  /** Progress value from 0-100 */
  value: number;
  /** Maximum value (defaults to 100) */
  max?: number;
  /** Size preset */
  size?: 'sm' | 'md' | 'lg';
  /** Custom size in pixels (overrides size preset) */
  customSize?: number;
  /** Stroke width (defaults based on size) */
  strokeWidth?: number;
  /** Color theme */
  color?: 'cyan' | 'purple' | 'green' | 'blue' | 'amber' | 'red';
  /** Show percentage label in center */
  showLabel?: boolean;
  /** Custom label content */
  label?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

const sizeConfig = {
  sm: { size: 48, strokeWidth: 4 },
  md: { size: 80, strokeWidth: 6 },
  lg: { size: 120, strokeWidth: 8 },
} as const;

const colorConfig = {
  cyan: {
    stroke: 'stroke-[var(--color-neural-cyan)]',
    text: 'text-[var(--color-neural-cyan)]',
  },
  purple: {
    stroke: 'stroke-[var(--color-neural-purple)]',
    text: 'text-[var(--color-neural-purple)]',
  },
  green: {
    stroke: 'stroke-[var(--color-lxd-success)]',
    text: 'text-[var(--color-lxd-success)]',
  },
  blue: {
    stroke: 'stroke-[var(--color-lxd-primary)]',
    text: 'text-[var(--color-lxd-primary)]',
  },
  amber: {
    stroke: 'stroke-amber-500',
    text: 'text-amber-500',
  },
  red: {
    stroke: 'stroke-[var(--color-lxd-error)]',
    text: 'text-[var(--color-lxd-error)]',
  },
} as const;

export function ProgressRing({
  value,
  max = 100,
  size = 'md',
  customSize,
  strokeWidth,
  color = 'cyan',
  showLabel = true,
  label,
  className,
}: ProgressRingProps): React.JSX.Element {
  const config = sizeConfig[size];
  const actualSize = customSize ?? config.size;
  const actualStrokeWidth = strokeWidth ?? config.strokeWidth;

  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (actualSize - actualStrokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = colorConfig[color];

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      role="progressbar"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress: ${Math.round(percentage)}%`}
    >
      <svg
        aria-hidden="true"
        width={actualSize}
        height={actualSize}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={actualSize / 2}
          cy={actualSize / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={actualStrokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={actualSize / 2}
          cy={actualSize / 2}
          r={radius}
          fill="none"
          strokeWidth={actualStrokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            'transition-[stroke-dashoffset] duration-500 ease-out motion-reduce:transition-none',
            colors.stroke,
          )}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          {label || (
            <span className={cn('font-bold', labelSizeClasses[size], colors.text)}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default ProgressRing;
