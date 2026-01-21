'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import * as React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface NeumorphicKnobProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const SIZES = {
  sm: { knob: 48, indicator: 6 },
  md: { knob: 64, indicator: 8 },
  lg: { knob: 80, indicator: 10 },
};

// ============================================================================
// Component
// ============================================================================

export function NeumorphicKnob({
  value,
  min = 0,
  max = 100,
  onChange,
  size = 'md',
  label,
  className,
}: NeumorphicKnobProps): React.JSX.Element {
  const knobRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const { knob: knobSize, indicator: indicatorSize } = SIZES[size];

  // Convert value to rotation (0-270 degrees)
  const rotation = ((value - min) / (max - min)) * 270 - 135;

  const motionRotation = useMotionValue(rotation);
  const scale = useTransform(motionRotation, [-135, 135], [1, 1]);

  // Handle drag interaction
  const handlePointerDown = (e: React.PointerEvent): void => {
    e.preventDefault();
    setIsDragging(true);

    const handlePointerMove = (moveEvent: PointerEvent): void => {
      if (!knobRef.current) return;

      const rect = knobRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const angle =
        Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI);

      // Convert angle to value
      let normalizedAngle = angle + 135;
      if (normalizedAngle < 0) normalizedAngle += 360;
      if (normalizedAngle > 270) normalizedAngle = normalizedAngle > 315 ? 0 : 270;

      const newValue = min + (normalizedAngle / 270) * (max - min);
      onChange(Math.round(Math.max(min, Math.min(max, newValue))));
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  React.useEffect(() => {
    motionRotation.set(rotation);
  }, [rotation, motionRotation]);

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {/* Knob container */}
      <div className="relative" style={{ width: knobSize + 16, height: knobSize + 16 }}>
        {/* Track marks */}
        <svg aria-hidden="true" className="absolute inset-0 -rotate-[135deg]" viewBox="0 0 100 100">
          {Array.from({ length: 11 }).map((_, i) => {
            const angle = i * 27 * (Math.PI / 180);
            const x1 = 50 + 42 * Math.cos(angle);
            const y1 = 50 + 42 * Math.sin(angle);
            const x2 = 50 + 46 * Math.cos(angle);
            const y2 = 50 + 46 * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-muted-foreground/30"
              />
            );
          })}
        </svg>

        {/* Knob */}
        <motion.div
          ref={knobRef}
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-grab select-none',
            'bg-linear-to-br from-[hsl(0,0%,22%)] to-[hsl(0,0%,12%)]',
            'shadow-[8px_8px_16px_hsl(0,0%,5%),-4px_-4px_12px_hsl(0,0%,25%)]',
            isDragging && 'cursor-grabbing',
          )}
          style={{
            width: knobSize,
            height: knobSize,
            rotate: rotation,
            scale,
          }}
          onPointerDown={handlePointerDown}
          whileTap={{ scale: 0.98 }}
        >
          {/* Inner ring */}
          <div className="absolute inset-2 rounded-full bg-linear-to-br from-[hsl(0,0%,18%)] to-[hsl(0,0%,8%)] shadow-inner" />

          {/* Indicator */}
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_10px_hsl(217,91%,60%)]"
            style={{
              width: indicatorSize,
              height: indicatorSize,
            }}
          />
        </motion.div>
      </div>

      {/* Value display */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-lg font-mono font-semibold text-foreground tabular-nums">
          {value}
        </span>
        {label && (
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        )}
      </div>
    </div>
  );
}
