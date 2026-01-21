'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/core/utils';

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: 'cyan' | 'green' | 'blue' | 'purple' | 'amber';
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  color = 'cyan',
  label,
  showValue = true,
  className,
}: ProgressRingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    cyan: { stroke: 'var(--lxd-blue-light)', bg: 'rgba(var(--lxd-blue-light-rgb), 0.1)' },
    green: { stroke: 'var(--color-lxd-success)', bg: 'rgba(var(--color-lxd-success-rgb), 0.1)' },
    blue: { stroke: 'var(--brand-primary)', bg: 'rgba(var(--brand-primary-rgb), 0.1)' },
    purple: { stroke: 'var(--brand-secondary)', bg: 'rgba(var(--brand-secondary-rgb), 0.1)' },
    amber: { stroke: 'var(--color-lxd-warning)', bg: 'rgba(var(--color-lxd-warning-rgb), 0.1)' },
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg aria-hidden="true" width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[color].bg}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[color].stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: mounted ? offset : circumference }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-brand-primary">{Math.round(percentage)}%</span>
          {label && <span className="text-xs text-brand-muted">{label}</span>}
        </div>
      )}
    </div>
  );
}
