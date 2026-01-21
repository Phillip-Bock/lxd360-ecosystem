'use client';

import { type HTMLMotionProps, motion } from 'framer-motion';
import * as React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glow' | 'holographic' | 'neumorphic';
  glowColor?: string;
  children: React.ReactNode;
}

// ============================================================================
// Component
// ============================================================================

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', glowColor, children, ...props }, ref) => {
    const variants = {
      default: 'glass-card',
      glow: 'glass-card animate-glow-pulse',
      holographic: 'glass-card cyber-border',
      neumorphic: 'neumorphic',
    };

    return (
      <motion.div
        ref={ref}
        className={cn('relative overflow-hidden p-6', variants[variant], className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        style={glowColor ? { boxShadow: `0 0 30px ${glowColor}` } : undefined}
        {...props}
      >
        {/* Inner highlight */}
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  },
);

GlassCard.displayName = 'GlassCard';
