'use client';

import { motion } from 'framer-motion';
import type { ServiceHealth } from '@/lib/monitoring/types';
import { cn } from '@/lib/utils';

interface PulseRingProps {
  health: ServiceHealth;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showLabel?: boolean;
}

const sizeConfig = {
  sm: { ring: 'w-3 h-3', outer: 'w-6 h-6' },
  md: { ring: 'w-4 h-4', outer: 'w-8 h-8' },
  lg: { ring: 'w-6 h-6', outer: 'w-12 h-12' },
};

const healthConfig: Record<ServiceHealth, { color: string; bgColor: string; label: string }> = {
  healthy: { color: 'bg-brand-success', bgColor: 'bg-brand-success/20', label: 'Healthy' },
  warning: { color: 'bg-brand-warning', bgColor: 'bg-brand-warning/20', label: 'Warning' },
  critical: { color: 'bg-brand-error', bgColor: 'bg-brand-error/20', label: 'Critical' },
  unknown: { color: 'bg-gray-500', bgColor: 'bg-gray-500/20', label: 'Unknown' },
};

export function PulseRing({ health, size = 'md', label, showLabel = false }: PulseRingProps) {
  const config = sizeConfig[size];
  const colors = healthConfig[health];
  const displayLabel = label || colors.label;

  return (
    <div className="flex items-center gap-2">
      <div className={cn('relative flex items-center justify-center', config.outer)}>
        {/* Pulsing outer ring */}
        <motion.div
          className={cn('absolute rounded-full', colors.bgColor, config.outer)}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: health === 'critical' ? 1 : 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Second pulse for critical */}
        {health === 'critical' && (
          <motion.div
            className={cn('absolute rounded-full', colors.bgColor, config.outer)}
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          />
        )}

        {/* Core dot */}
        <motion.div
          className={cn('rounded-full shadow-lg', colors.color, config.ring)}
          style={{
            boxShadow: `0 0 10px ${health === 'healthy' ? 'var(--color-lxd-success)' : health === 'warning' ? 'var(--color-lxd-warning)' : health === 'critical' ? 'var(--color-lxd-error)' : 'var(--text-brand-muted)'}`,
          }}
          animate={health === 'critical' ? { opacity: [1, 0.5, 1] } : {}}
          transition={{
            duration: 0.5,
            repeat: health === 'critical' ? Infinity : 0,
          }}
        />
      </div>

      {showLabel && (
        <span
          className={cn(
            'text-sm font-medium',
            health === 'healthy' && 'text-brand-success',
            health === 'warning' && 'text-brand-warning',
            health === 'critical' && 'text-brand-error',
            health === 'unknown' && 'text-brand-muted',
          )}
        >
          {displayLabel}
        </span>
      )}
    </div>
  );
}

export function StatusDot({ health, size = 'sm' }: { health: ServiceHealth; size?: 'sm' | 'md' }) {
  const colors = healthConfig[health];
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';

  return (
    <span className="relative flex items-center justify-center">
      <span className={cn('rounded-full', colors.color, dotSize)} />
      {(health === 'warning' || health === 'critical') && (
        <motion.span
          className={cn('absolute rounded-full', colors.color, dotSize)}
          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </span>
  );
}
