'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { ServiceHealth } from '@/lib/monitoring/types';
import { cn } from '@/lib/utils';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  health?: ServiceHealth;
  hoverable?: boolean;
  onClick?: () => void;
}

const healthGlowColors: Record<ServiceHealth, string> = {
  healthy: 'rgba(16, 185, 129, 0.5)',
  warning: 'rgba(245, 158, 11, 0.5)',
  critical: 'rgba(239, 68, 68, 0.5)',
  unknown: 'rgba(107, 114, 128, 0.5)',
};

const healthBorderColors: Record<ServiceHealth, string> = {
  healthy: 'border-emerald-500/30',
  warning: 'border-amber-500/30',
  critical: 'border-brand-error/30',
  unknown: 'border-gray-500/30',
};

const healthGradients: Record<ServiceHealth, string> = {
  healthy: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
  warning: 'from-amber-500/10 via-amber-500/5 to-transparent',
  critical: 'from-red-500/10 via-red-500/5 to-transparent',
  unknown: 'from-gray-500/10 via-gray-500/5 to-transparent',
};

export function GlowCard({
  children,
  className,
  glowColor,
  health = 'healthy',
  hoverable = false,
  onClick,
}: GlowCardProps) {
  const computedGlowColor = glowColor || healthGlowColors[health];

  return (
    <motion.div
      className={cn(
        'relative rounded-xl border bg-black/40 backdrop-blur-xl overflow-hidden',
        healthBorderColors[health],
        hoverable && 'cursor-pointer transition-all duration-300 hover:scale-[1.02]',
        className,
      )}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        boxShadow: `0 0 40px ${computedGlowColor}, inset 0 1px 0 rgba(255,255,255,0.1)`,
      }}
    >
      {/* Gradient overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-linear-to-br pointer-events-none',
          healthGradients[health],
        )}
      />

      {/* Animated border glow */}
      <div
        className="absolute inset-0 rounded-xl opacity-50 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${computedGlowColor} 0%, transparent 50%, ${computedGlowColor} 100%)`,
          filter: 'blur(1px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
        }}
      />
    </motion.div>
  );
}

export function GlowCardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-b border-brand-subtle flex items-center justify-between',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function GlowCardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

export function GlowCardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        'text-sm font-medium text-brand-primary/80 uppercase tracking-wider',
        className,
      )}
    >
      {children}
    </h3>
  );
}
