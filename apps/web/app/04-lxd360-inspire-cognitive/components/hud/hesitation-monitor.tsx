// ============================================================================
// INSPIRE IGNITE — Hesitation Monitor Component
// Location: app/04-lxd360-inspire-cognitive/components/hud/hesitation-monitor.tsx
// Version: 1.0.0
// ============================================================================

'use client';

import { motion } from 'framer-motion';
import { Brain, Pause, Play, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { FluencyZone } from '@/lib/xapi/cognitive-utils';

// ----------------------------------------------------------------------------
// TYPE DEFINITIONS
// ----------------------------------------------------------------------------

export interface HesitationMonitorProps {
  /** Current hesitation in milliseconds */
  hesitationMs: number;
  /** Fluency zone classification */
  fluencyZone: FluencyZone;
  /** Whether tracking is active */
  isActive: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ----------------------------------------------------------------------------
// COMPONENT
// ----------------------------------------------------------------------------

export function HesitationMonitor({
  hesitationMs,
  fluencyZone,
  isActive,
  compact = false,
  className,
}: HesitationMonitorProps) {
  const [displayTime, setDisplayTime] = useState(0);

  // Animate time counter
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setDisplayTime((prev) => prev + 100);
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  // Reset on hesitation change
  useEffect(() => {
    setDisplayTime(hesitationMs);
  }, [hesitationMs]);

  // Zone styling
  const zoneStyles = useMemo(
    () => ({
      too_fast: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        border: 'border-blue-400',
        text: 'text-blue-700 dark:text-blue-300',
        icon: Zap,
        label: 'Too Fast',
        description: 'Slow down and think',
      },
      fluency: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        border: 'border-green-400',
        text: 'text-green-700 dark:text-green-300',
        icon: Play,
        label: 'Fluent',
        description: 'Great pace!',
      },
      thinking: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        border: 'border-yellow-400',
        text: 'text-yellow-700 dark:text-yellow-300',
        icon: Brain,
        label: 'Thinking',
        description: 'Processing...',
      },
      struggle: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        border: 'border-red-400',
        text: 'text-red-700 dark:text-red-300',
        icon: Pause,
        label: 'Struggling',
        description: 'Need help?',
      },
    }),
    [],
  );

  const style = zoneStyles[fluencyZone];
  const Icon = style.icon;

  // Format time display
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (compact) {
    return (
      <motion.div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border',
          style.bg,
          style.border,
          className,
        )}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        aria-live="polite"
        aria-label={`Response time: ${formatTime(displayTime)}. Status: ${style.label}`}
      >
        <Icon className={cn('h-4 w-4', style.text)} aria-hidden="true" />
        <span className={cn('text-sm font-medium', style.text)}>{formatTime(displayTime)}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn('p-4 rounded-lg border-2', style.bg, style.border, className)}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      aria-live="polite"
      role="status"
    >
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-full', fluencyZone === 'struggle' ? 'animate-pulse' : '')}>
          <Icon className={cn('h-6 w-6', style.text)} aria-hidden="true" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={cn('font-semibold', style.text)}>{style.label}</span>
            <span className={cn('text-lg font-mono', style.text)}>{formatTime(displayTime)}</span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{style.description}</p>

          {/* Progress bar showing time relative to thresholds */}
          <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full',
                fluencyZone === 'too_fast'
                  ? 'bg-blue-500'
                  : fluencyZone === 'fluency'
                    ? 'bg-green-500'
                    : fluencyZone === 'thinking'
                      ? 'bg-yellow-500'
                      : 'bg-red-500',
              )}
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (displayTime / 30000) * 100)}%`,
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default HesitationMonitor;
