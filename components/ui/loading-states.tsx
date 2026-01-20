'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// PageLoader - Full Page Spinner
// =============================================================================

export interface PageLoaderProps {
  message?: string;
  className?: string;
}

export function PageLoader({ message = 'Loading...', className }: PageLoaderProps) {
  return (
    <output
      aria-busy="true"
      aria-live="polite"
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center',
        'bg-background/80 backdrop-blur-xs',
        className,
      )}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-12 h-12 text-primary" aria-hidden="true" />
        </motion.div>
        <p className="text-muted-foreground text-sm font-medium">{message}</p>
        <span className="sr-only">{message}</span>
      </motion.div>
    </output>
  );
}

// =============================================================================
// InlineLoader - Inline Spinner with Text
// =============================================================================

export interface InlineLoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function InlineLoader({ text = 'Loading...', size = 'md', className }: InlineLoaderProps) {
  return (
    <output
      aria-busy="true"
      aria-live="polite"
      className={cn('inline-flex items-center gap-2', className)}
    >
      <Loader2
        className={cn('animate-spin text-muted-foreground', sizeMap[size])}
        aria-hidden="true"
      />
      <span className={cn('text-muted-foreground', textSizeMap[size])}>{text}</span>
      <span className="sr-only">{text}</span>
    </output>
  );
}

// =============================================================================
// ButtonLoader - Button Loading State
// =============================================================================

export interface ButtonLoaderProps {
  className?: string;
}

export function ButtonLoader({ className }: ButtonLoaderProps) {
  return <Loader2 className={cn('w-4 h-4 animate-spin', className)} aria-hidden="true" />;
}

// =============================================================================
// Shimmer - Shimmer Effect Component
// =============================================================================

export interface ShimmerProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

const roundedMap = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export function Shimmer({ className, width, height, rounded = 'md' }: ShimmerProps) {
  return (
    <output
      aria-busy="true"
      aria-label="Loading"
      className={cn('relative overflow-hidden bg-muted block', roundedMap[rounded], className)}
      style={{ width, height }}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full"
        animate={{ translateX: ['0%', '200%'] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        }}
      />
      <span className="sr-only">Loading</span>
    </output>
  );
}

// =============================================================================
// ShimmerGroup - Pre-built shimmer patterns
// =============================================================================

export function ShimmerCard() {
  return (
    <output className="space-y-4 p-4 border rounded-lg block" aria-busy="true">
      <Shimmer className="h-40 w-full" />
      <div className="space-y-2">
        <Shimmer className="h-4 w-3/4" />
        <Shimmer className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2">
        <Shimmer className="h-8 w-20" rounded="full" />
        <Shimmer className="h-8 w-20" rounded="full" />
      </div>
      <span className="sr-only">Loading content</span>
    </output>
  );
}

export function ShimmerList({ items = 3 }: { items?: number }) {
  return (
    <output className="space-y-3 block" aria-busy="true">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
          <Shimmer className="h-10 w-10" rounded="full" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-4 w-1/3" />
            <Shimmer className="h-3 w-2/3" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading list</span>
    </output>
  );
}

export function ShimmerTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <output className="border rounded-lg overflow-hidden block" aria-busy="true">
      {/* Header */}
      <div className="flex gap-4 p-4 bg-muted/50 border-b">
        {Array.from({ length: cols }).map((_, i) => (
          <Shimmer key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b last:border-b-0">
          {Array.from({ length: cols }).map((_, j) => (
            <Shimmer key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
      <span className="sr-only">Loading table</span>
    </output>
  );
}

// =============================================================================
// DotLoader - Animated Dots
// =============================================================================

export interface DotLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const dotSizeMap = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-3 h-3',
};

export function DotLoader({ size = 'md', className }: DotLoaderProps) {
  return (
    <output
      aria-busy="true"
      aria-label="Loading"
      className={cn('flex items-center gap-1', className)}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={cn('rounded-full bg-primary', dotSizeMap[size])}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
          }}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">Loading</span>
    </output>
  );
}

// =============================================================================
// ProgressLoader - Progress Bar with Percentage
// =============================================================================

export interface ProgressLoaderProps {
  progress: number; // 0-100
  showPercentage?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const progressHeightMap = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressLoader({
  progress,
  showPercentage = true,
  label,
  size = 'md',
  className,
}: ProgressLoaderProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || `Loading ${clampedProgress}%`}
      className={cn('w-full', className)}
    >
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-muted-foreground">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-foreground">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', progressHeightMap[size])}>
        <motion.div
          className={cn('h-full bg-primary rounded-full', progressHeightMap[size])}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// =============================================================================
// IndeterminateProgress - Indeterminate Progress Bar
// =============================================================================

export interface IndeterminateProgressProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function IndeterminateProgress({
  label,
  size = 'md',
  className,
}: IndeterminateProgressProps) {
  return (
    <div
      role="progressbar"
      aria-busy="true"
      aria-label={label || 'Loading'}
      className={cn('w-full', className)}
    >
      {label && <span className="block text-sm text-muted-foreground mb-1.5">{label}</span>}
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', progressHeightMap[size])}>
        <motion.div
          className={cn('h-full bg-primary rounded-full', progressHeightMap[size])}
          style={{ width: '30%' }}
          animate={{
            x: ['-100%', '400%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
      <span className="sr-only">{label || 'Loading'}</span>
    </div>
  );
}

// =============================================================================
// SpinnerOverlay - Spinner with overlay for containers
// =============================================================================

export interface SpinnerOverlayProps {
  message?: string;
  className?: string;
}

export function SpinnerOverlay({ message, className }: SpinnerOverlayProps) {
  return (
    <output
      aria-busy="true"
      aria-live="polite"
      className={cn(
        'absolute inset-0 z-10 flex flex-col items-center justify-center',
        'bg-background/60 backdrop-blur-xs',
        className,
      )}
    >
      <Loader2 className="w-8 h-8 text-primary animate-spin" aria-hidden="true" />
      {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
      <span className="sr-only">{message || 'Loading'}</span>
    </output>
  );
}

// =============================================================================
// Exports
// =============================================================================

const LoadingStates = {
  PageLoader,
  InlineLoader,
  ButtonLoader,
  Shimmer,
  ShimmerCard,
  ShimmerList,
  ShimmerTable,
  DotLoader,
  ProgressLoader,
  IndeterminateProgress,
  SpinnerOverlay,
};

export default LoadingStates;
