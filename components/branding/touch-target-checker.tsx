'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Check, Maximize2, Pointer, Smartphone, X } from 'lucide-react';
import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { validateTouchTarget, WCAG_TOUCH_TARGET } from '@/lib/branding/wcag-utils';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface TouchTargetCheckerProps {
  initialWidth?: number;
  initialHeight?: number;
  onSizeChange?: (width: number, height: number) => void;
  enhanced?: boolean;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function TouchTargetChecker({
  initialWidth = 40,
  initialHeight = 40,
  onSizeChange,
  enhanced = false,
  className,
}: TouchTargetCheckerProps): React.JSX.Element {
  const [width, setWidth] = React.useState(initialWidth);
  const [height, setHeight] = React.useState(initialHeight);
  const [isEnhanced, setIsEnhanced] = React.useState(enhanced);

  const result = validateTouchTarget(width, height, isEnhanced);
  const minSize = isEnhanced ? WCAG_TOUCH_TARGET.ENHANCED : WCAG_TOUCH_TARGET.MINIMUM;

  const handleWidthChange = React.useCallback(
    (value: number[]) => {
      const newWidth = value[0];
      setWidth(newWidth);
      onSizeChange?.(newWidth, height);
    },
    [height, onSizeChange],
  );

  const handleHeightChange = React.useCallback(
    (value: number[]) => {
      const newHeight = value[0];
      setHeight(newHeight);
      onSizeChange?.(width, newHeight);
    },
    [width, onSizeChange],
  );

  const StatusIcon = result.passes ? Check : width >= 24 && height >= 24 ? AlertTriangle : X;
  const statusColor = result.passes
    ? 'text-green-400'
    : width >= 24 && height >= 24
      ? 'text-yellow-400'
      : 'text-red-400';
  const statusBg = result.passes
    ? 'bg-green-500/20 border-green-500/30'
    : width >= 24 && height >= 24
      ? 'bg-yellow-500/20 border-yellow-500/30'
      : 'bg-red-500/20 border-red-500/30';

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-linear-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
          <Pointer className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Touch Target Checker</h3>
          <p className="text-sm text-muted-foreground">WCAG 2.2 Success Criterion 2.5.8</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
        <button
          type="button"
          onClick={() => setIsEnhanced(false)}
          className={cn(
            'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
            !isEnhanced
              ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <Smartphone className="h-4 w-4" />
            Minimum (24px)
          </div>
        </button>
        <button
          type="button"
          onClick={() => setIsEnhanced(true)}
          className={cn(
            'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
            isEnhanced
              ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <Maximize2 className="h-4 w-4" />
            Enhanced (44px)
          </div>
        </button>
      </div>

      {/* Visual comparison */}
      <div className="flex items-center justify-center gap-8 p-8 rounded-xl bg-white/5 border border-white/10">
        {/* Current size target */}
        <div className="flex flex-col items-center gap-3">
          <motion.div
            className={cn(
              'rounded-lg border-2 flex items-center justify-center transition-colors',
              result.passes ? 'border-green-500 bg-green-500/20' : 'border-red-500 bg-red-500/20',
            )}
            animate={{
              width: Math.max(width, 16),
              height: Math.max(height, 16),
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <span className="text-[10px] font-mono text-foreground">
              {width}×{height}
            </span>
          </motion.div>
          <span className="text-xs text-muted-foreground">Your Target</span>
        </div>

        {/* Reference size */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center"
            style={{ width: minSize, height: minSize }}
          >
            <span className="text-[10px] font-mono text-muted-foreground">
              {minSize}×{minSize}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {isEnhanced ? 'Enhanced' : 'Minimum'} Size
          </span>
        </div>
      </div>

      {/* Size controls */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Width</Label>
            <span className="text-sm font-mono text-foreground">{width}px</span>
          </div>
          <Slider value={[width]} min={8} max={80} step={1} onValueChange={handleWidthChange} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Height</Label>
            <span className="text-sm font-mono text-foreground">{height}px</span>
          </div>
          <Slider value={[height]} min={8} max={80} step={1} onValueChange={handleHeightChange} />
        </div>
      </div>

      {/* Status indicator */}
      <div className={cn('p-4 rounded-lg border', statusBg)}>
        <div className="flex items-start gap-3">
          <StatusIcon className={cn('h-5 w-5 shrink-0 mt-0.5', statusColor)} />
          <div>
            <p className={cn('text-sm font-medium', statusColor)}>
              {result.passes
                ? `Passes ${isEnhanced ? 'Enhanced' : 'Minimum'} Requirements`
                : width >= 24 && height >= 24
                  ? 'Meets Minimum, Below Enhanced'
                  : 'Fails Touch Target Requirements'}
            </p>
            {!result.passes && result.recommendation && (
              <p className="text-xs text-muted-foreground mt-1">{result.recommendation}</p>
            )}
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <h4 className="text-sm font-medium text-blue-400 mb-2">WCAG 2.2 Guidelines</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Minimum target size: 24×24 CSS pixels (Level AA)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Enhanced target size: 44×44 CSS pixels (Level AAA)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Sufficient spacing between targets also counts</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
