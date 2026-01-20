'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { ServiceHealth } from '@/lib/monitoring/types';
import { cn } from '@/lib/utils';

interface MetricOrbProps {
  value: number;
  maxValue?: number;
  label: string;
  unit?: string;
  health?: ServiceHealth;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showRing?: boolean;
  animated?: boolean;
  trend?: 'up' | 'down' | 'stable';
}

const sizeConfig = {
  sm: { container: 'w-20 h-20', text: 'text-lg', label: 'text-[10px]' },
  md: { container: 'w-28 h-28', text: 'text-2xl', label: 'text-xs' },
  lg: { container: 'w-36 h-36', text: 'text-3xl', label: 'text-sm' },
  xl: { container: 'w-48 h-48', text: 'text-4xl', label: 'text-base' },
};

const healthColors: Record<ServiceHealth, { glow: string; ring: string; text: string }> = {
  healthy: {
    glow: 'rgba(34, 197, 94, 0.4)',
    ring: 'var(--color-lxd-success)',
    text: 'text-brand-success',
  },
  warning: {
    glow: 'rgba(245, 158, 11, 0.4)',
    ring: 'var(--color-lxd-warning)',
    text: 'text-brand-warning',
  },
  critical: {
    glow: 'rgba(239, 68, 68, 0.4)',
    ring: 'var(--color-lxd-error)',
    text: 'text-brand-error',
  },
  unknown: {
    glow: 'rgba(107, 114, 128, 0.4)',
    ring: 'var(--text-brand-muted)',
    text: 'text-brand-muted',
  },
};

export function MetricOrb({
  value,
  maxValue = 100,
  label,
  unit = '',
  health = 'healthy',
  size = 'md',
  showRing = true,
  animated = true,
  trend,
}: MetricOrbProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const config = sizeConfig[size];
  const colors = healthColors[health];
  const percentage = Math.min((value / maxValue) * 100, 100);

  // Animate value on mount/change
  useEffect(() => {
    if (!animated) {
      setDisplayValue(value);
      return;
    }

    const duration = 1000;
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = (value - displayValue) / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue((prev) => prev + increment);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, animated, displayValue]);

  // Calculate SVG parameters for the ring
  const ringSize = size === 'sm' ? 36 : size === 'md' ? 52 : size === 'lg' ? 68 : 92;
  const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : size === 'lg' ? 5 : 6;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      className={cn('relative flex items-center justify-center', config.container)}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full blur-xl"
        style={{ backgroundColor: colors.glow }}
      />

      {/* Background circle */}
      <div
        className="absolute inset-2 rounded-full bg-black/60 backdrop-blur-xs border border-brand-subtle"
        style={{
          boxShadow: `inset 0 0 30px ${colors.glow}, 0 0 20px ${colors.glow}`,
        }}
      />

      {/* Progress ring */}
      {showRing && (
        <svg
          className="absolute inset-0 -rotate-90"
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          role="img"
          aria-label={`${label} progress: ${Math.round(percentage)}%`}
        >
          <title>{`${label} progress: ${Math.round(percentage)}%`}</title>
          {/* Background ring */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <motion.circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke={colors.ring}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 6px ${colors.ring})`,
            }}
          />
        </svg>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="flex items-baseline gap-0.5">
          <AnimatePresence mode="wait">
            <motion.span
              key={Math.round(displayValue)}
              className={cn('font-mono font-bold', config.text, colors.text)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
            >
              {typeof value === 'number' && value % 1 !== 0
                ? displayValue.toFixed(1)
                : Math.round(displayValue)}
            </motion.span>
          </AnimatePresence>
          {unit && (
            <span className={cn('text-brand-primary/50', size === 'sm' ? 'text-[8px]' : 'text-xs')}>
              {unit}
            </span>
          )}
        </div>
        <span className={cn('text-brand-primary/50 uppercase tracking-wider mt-1', config.label)}>
          {label}
        </span>
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            {trend === 'up' && (
              <svg
                className="w-3 h-3 text-brand-success"
                fill="currentColor"
                viewBox="0 0 20 20"
                role="img"
                aria-label="Trending up"
              >
                <title>Trending up</title>
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {trend === 'down' && (
              <svg
                className="w-3 h-3 text-brand-error"
                fill="currentColor"
                viewBox="0 0 20 20"
                role="img"
                aria-label="Trending down"
              >
                <title>Trending down</title>
                <path
                  fillRule="evenodd"
                  d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {trend === 'stable' && (
              <svg
                className="w-3 h-3 text-brand-muted"
                fill="currentColor"
                viewBox="0 0 20 20"
                role="img"
                aria-label="Stable trend"
              >
                <title>Stable trend</title>
                <path
                  fillRule="evenodd"
                  d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Pulse animation for critical status */}
      {health === 'critical' && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-brand-error"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.3, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
