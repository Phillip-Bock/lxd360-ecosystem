'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/core/utils';
import { PulsingDot } from '../effects/PulsingDot';
import { BigNumber } from '../metrics/BigNumber';
import { TrendIndicator } from '../metrics/TrendIndicator';

interface MetricCardProps {
  label: string;
  value: number;
  change?: number;
  icon: LucideIcon;
  color: 'cyan' | 'green' | 'blue' | 'purple' | 'amber';
  prefix?: string;
  suffix?: string;
  subtitle?: string;
  live?: boolean;
  className?: string;
}

export function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  color,
  prefix = '',
  suffix = '',
  subtitle,
  live = false,
  className,
}: MetricCardProps) {
  const colorClasses = {
    cyan: {
      gradient: 'from-cyan-500/20 to-cyan-600/5',
      border: 'border-brand-accent/30 hover:border-brand-accent/50',
      glow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]',
      text: 'text-brand-cyan',
    },
    green: {
      gradient: 'from-green-500/20 to-green-600/5',
      border: 'border-brand-success/30 hover:border-brand-success/50',
      glow: 'hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]',
      text: 'text-brand-success',
    },
    blue: {
      gradient: 'from-blue-500/20 to-blue-600/5',
      border: 'border-brand-primary/30 hover:border-brand-primary/50',
      glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]',
      text: 'text-brand-cyan',
    },
    purple: {
      gradient: 'from-purple-500/20 to-purple-600/5',
      border: 'border-brand-secondary/30 hover:border-brand-secondary/50',
      glow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]',
      text: 'text-brand-purple',
    },
    amber: {
      gradient: 'from-amber-500/20 to-amber-600/5',
      border: 'border-amber-500/30 hover:border-amber-500/50',
      glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]',
      text: 'text-brand-warning',
    },
  };

  const styles = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'relative p-4 rounded-xl bg-linear-to-br border backdrop-blur-xs overflow-hidden transition-all duration-300',
        styles.gradient,
        styles.border,
        styles.glow,
        className,
      )}
    >
      {/* Glow effect */}
      <div
        className={cn(
          'absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30',
          `bg-${color}-500`,
        )}
        style={{
          background:
            color === 'cyan'
              ? 'rgba(6, 182, 212, 0.3)'
              : color === 'green'
                ? 'rgba(34, 197, 94, 0.3)'
                : color === 'blue'
                  ? 'rgba(59, 130, 246, 0.3)'
                  : color === 'purple'
                    ? 'rgba(168, 85, 247, 0.3)'
                    : 'rgba(245, 158, 11, 0.3)',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
            {label}
          </span>
          <div className="flex items-center gap-2">
            {live && (
              <div className="flex items-center gap-1">
                <PulsingDot status="nominal" size="sm" />
                <span className="text-xs text-brand-success font-medium">LIVE</span>
              </div>
            )}
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex items-end gap-2">
          <BigNumber value={value} prefix={prefix} suffix={suffix} />
          {change !== undefined && <TrendIndicator value={change} />}
        </div>

        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
