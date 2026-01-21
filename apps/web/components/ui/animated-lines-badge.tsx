'use client';

import { motion } from 'framer-motion';
import type React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedLinesBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'purple' | 'blue';
  className?: string;
}

// Shimmer text component - white to light purple to dark blue gradient
function ShimmerText({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      className="inline-block bg-clip-text text-transparent"
      style={{
        backgroundImage: `linear-gradient(
          90deg,
          #fff 0%,
          #fff 30%,
          #e9d5ff 40%,
          #c084fc 47%,
          #3b82f6 53%,
          #1e40af 60%,
          #fff 70%,
          #fff 100%
        )`,
        backgroundSize: '200% 100%',
      }}
      animate={{
        backgroundPosition: ['100% 0%', '-100% 0%'],
      }}
      transition={{
        duration: 2.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'linear',
      }}
    >
      {children}
    </motion.span>
  );
}

export function AnimatedLinesBadge({ children, className }: AnimatedLinesBadgeProps) {
  // Note: variant prop available for future style variations
  // Blue-focused neon colors
  const lineColors = [
    '#0ea5e9', // sky-500
    '#06b6d4', // cyan-500
    '#3b82f6', // blue-500
    '#0284c7', // sky-600
    '#22d3ee', // cyan-400
  ];

  const lines = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: i * 30, // Spread lines evenly around the badge
    delay: i * 0.15,
    color: lineColors[i % lineColors.length],
  }));

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      {/* Animated lines shooting out */}
      <div className="absolute inset-0 flex items-center justify-center">
        {lines.map((line) => (
          <motion.div
            key={line.id}
            className="absolute h-[2px] origin-left"
            style={{
              rotate: `${line.angle}deg`,
              background: `linear-gradient(90deg, ${line.color}, transparent)`,
              boxShadow: `0 0 8px ${line.color}`,
            }}
            initial={{ width: 0, opacity: 0, x: 0 }}
            animate={{
              width: [0, 60, 80, 0],
              opacity: [0, 1, 0.8, 0],
              x: [20, 40, 60, 80],
            }}
            transition={{
              duration: 2.5,
              delay: line.delay,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 1,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Enhanced neon glow behind badge - multiple layers */}
      <div className="absolute -inset-2 rounded-full bg-blue-500/30 blur-xl" />
      <div className="absolute -inset-1 rounded-full bg-cyan-400/20 blur-lg" />

      {/* Animated pulse glow */}
      <motion.div
        className="absolute -inset-3 rounded-full bg-blue-400/20 blur-2xl"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />

      {/* Badge */}
      <span
        className={cn(
          'relative z-10 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-widest',
          'border-blue-400/50 bg-black/90 backdrop-blur-sm',
          'shadow-[0_0_20px_rgba(59,130,246,0.5),0_0_40px_rgba(6,182,212,0.3),inset_0_0_20px_rgba(59,130,246,0.1)]',
        )}
      >
        {/* Inner glow dot */}
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-linear-to-r from-blue-400 to-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        </span>
        {/* Purple shimmer text */}
        <ShimmerText>{children}</ShimmerText>
      </span>
    </div>
  );
}
