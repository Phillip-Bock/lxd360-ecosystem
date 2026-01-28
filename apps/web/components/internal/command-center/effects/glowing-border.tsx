'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/core/utils';

interface GlowingBorderProps {
  children: ReactNode;
  className?: string;
  color?: 'cyan' | 'green' | 'blue' | 'purple' | 'amber' | 'red';
  intensity?: 'low' | 'medium' | 'high';
}

export function GlowingBorder({
  children,
  className,
  color = 'cyan',
  intensity = 'medium',
}: GlowingBorderProps) {
  const glowColors = {
    cyan: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] border-brand-accent/30',
    green: 'hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] border-brand-success/30',
    blue: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] border-brand-primary/30',
    purple: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] border-brand-secondary/30',
    amber: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] border-amber-500/30',
    red: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] border-brand-error/30',
  };

  const intensityClasses = {
    low: 'hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]',
    medium: '',
    high: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]',
  };

  return (
    <div
      className={cn(
        'border rounded-xl transition-all duration-300',
        glowColors[color],
        intensityClasses[intensity],
        className,
      )}
    >
      {children}
    </div>
  );
}
