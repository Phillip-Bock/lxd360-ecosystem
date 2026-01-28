'use client';

import { cn } from '@/lib/utils';

export interface ProgressRingProps {
  /** Progress value (0-100) */
  progress: number;
  /** Ring size in pixels */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Ring color */
  color?: 'cyan' | 'purple' | 'success' | 'warning' | 'danger';
  /** Center label */
  label?: string;
  /** Show percentage */
  showPercentage?: boolean;
  /** Additional class names */
  className?: string;
}

const colorClasses = {
  cyan: { stroke: '#00F0FF', glow: 'drop-shadow(0 0 6px #00F0FF)' },
  purple: { stroke: '#A855F7', glow: 'drop-shadow(0 0 6px #A855F7)' },
  success: { stroke: '#10B981', glow: 'drop-shadow(0 0 6px #10B981)' },
  warning: { stroke: '#F59E0B', glow: 'drop-shadow(0 0 6px #F59E0B)' },
  danger: { stroke: '#EF4444', glow: 'drop-shadow(0 0 6px #EF4444)' },
};

/**
 * ProgressRing - Circular progress indicator
 *
 * Features:
 * - SVG-based circular progress
 * - Animated stroke
 * - Glow effect
 * - Center label
 */
export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
  color = 'cyan',
  label,
  showPercentage = true,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;
  const colorConfig = colorClasses[color];
  const accessibleLabel = label
    ? `${label}: ${Math.round(progress)}%`
    : `Progress: ${Math.round(progress)}%`;

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
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
            transition: 'stroke-dashoffset 0.5s ease',
            filter: colorConfig.glow,
          }}
        />
      </svg>

      {/* Center content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        aria-hidden="true"
      >
        {showPercentage && (
          <span className="font-mono font-bold text-foreground" style={{ fontSize: size * 0.22 }}>
            {Math.round(progress)}%
          </span>
        )}
        {label && (
          <span
            className="text-muted-foreground uppercase tracking-wide"
            style={{ fontSize: Math.max(8, size * 0.11) }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
