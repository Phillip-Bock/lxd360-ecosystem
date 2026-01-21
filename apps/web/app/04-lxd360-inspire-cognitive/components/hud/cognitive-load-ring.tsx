// ============================================================================
// INSPIRE IGNITE — Cognitive Load Ring Component
// Location: app/04-lxd360-inspire-cognitive/components/hud/cognitive-load-ring.tsx
// Version: 1.0.0
// ============================================================================

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';

// ----------------------------------------------------------------------------
// TYPE DEFINITIONS
// ----------------------------------------------------------------------------

export interface CognitiveLoadRingProps {
  /** Current cognitive load (1-10) */
  load: number;
  /** Size in pixels */
  size?: number;
  /** Show numeric value */
  showValue?: boolean;
  /** Animation enabled */
  animate?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ----------------------------------------------------------------------------
// COMPONENT
// ----------------------------------------------------------------------------

export function CognitiveLoadRing({
  load,
  size = 120,
  showValue = true,
  animate = true,
  className,
}: CognitiveLoadRingProps) {
  // Normalize load to 0-1 for calculations
  const normalizedLoad = Math.max(0, Math.min(10, load)) / 10;

  // Calculate ring properties
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - normalizedLoad);

  // Determine color based on load level
  const getColor = useCallback((value: number) => {
    if (value <= 0.4) return { stroke: '#22C55E', glow: '#22C55E40' }; // Green - optimal
    if (value <= 0.6) return { stroke: '#F59E0B', glow: '#F59E0B40' }; // Yellow - moderate
    if (value <= 0.8) return { stroke: '#F97316', glow: '#F9731640' }; // Orange - high
    return { stroke: '#EF4444', glow: '#EF444440' }; // Red - overload
  }, []);

  const colors = getColor(normalizedLoad);

  // Pulsing animation for high load
  const shouldPulse = normalizedLoad > 0.7;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="meter"
      aria-valuenow={load}
      aria-valuemin={0}
      aria-valuemax={10}
      aria-label={`Cognitive load: ${load.toFixed(1)} out of 10`}
    >
      {/* Background ring */}
      <svg width={size} height={size} className="absolute transform -rotate-90" aria-hidden="true">
        <title>Background ring</title>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-800"
        />
      </svg>

      {/* Progress ring */}
      <motion.svg
        width={size}
        height={size}
        className="absolute transform -rotate-90"
        aria-hidden="true"
        initial={false}
        animate={
          shouldPulse && animate
            ? {
                filter: [
                  'drop-shadow(0 0 8px transparent)',
                  `drop-shadow(0 0 8px ${colors.glow})`,
                  'drop-shadow(0 0 8px transparent)',
                ],
              }
            : {}
        }
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: animate ? 0.8 : 0, ease: 'easeOut' }}
        />
      </motion.svg>

      {/* Center content */}
      {showValue && (
        <div className="absolute flex flex-col items-center justify-center">
          <motion.span
            key={load}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold"
            style={{ color: colors.stroke }}
          >
            {load.toFixed(1)}
          </motion.span>
          <span className="text-xs text-gray-500 dark:text-gray-400">/ 10</span>
        </div>
      )}

      {/* Warning indicator */}
      <AnimatePresence>
        {normalizedLoad > 0.8 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-1 -right-1"
          >
            <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CognitiveLoadRing;
