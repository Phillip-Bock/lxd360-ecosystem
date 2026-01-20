'use client';

import type React from 'react';
import { cn } from '@/lib/core/utils';

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: 'blue' | 'purple' | 'emerald' | 'amber' | 'red';
  showLabel?: boolean;
  label?: React.ReactNode;
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  color = 'blue',
  showLabel = true,
  label,
  className,
}: ProgressRingProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colorStyles = {
    blue: 'var(--lxd-blue-light)',
    purple: 'var(--brand-secondary)',
    emerald: 'var(--color-lxd-success)',
    amber: 'var(--color-lxd-warning)',
    red: 'var(--color-lxd-error)',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg aria-hidden="true" width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(30, 58, 95, 0.5)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorStyles[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          {label || (
            <span className="text-lg font-bold text-brand-primary">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
    </div>
  );
}

export default ProgressRing;
