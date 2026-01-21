'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Check, Eye, Type, X } from 'lucide-react';
import * as React from 'react';
import {
  type ContrastResult,
  checkContrast,
  findAccessibleColor,
  type HSL,
  parseColor,
  rgbToHsl,
} from '@/lib/branding/wcag-utils';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface ContrastValidatorProps {
  foreground: string;
  background: string;
  onSuggestFix?: (fixedColor: HSL) => void;
  showPreview?: boolean;
  showLargeText?: boolean;
  className?: string;
}

// ============================================================================
// Sub-Components
// ============================================================================

function LevelBadge({
  level,
  ratio,
}: {
  level: ContrastResult['level'];
  ratio: number;
}): React.JSX.Element {
  const config = {
    AAA: {
      color: 'text-green-400',
      bg: 'bg-green-500/20',
      border: 'border-green-500/30',
      icon: Check,
      label: 'AAA',
    },
    AA: {
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/30',
      icon: Check,
      label: 'AA',
    },
    'AA-Large': {
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/30',
      icon: AlertTriangle,
      label: 'AA Large Only',
    },
    Fail: {
      color: 'text-red-400',
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      icon: X,
      label: 'Fail',
    },
  }[level];

  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border',
        config.bg,
        config.border,
      )}
    >
      <Icon className={cn('h-4 w-4', config.color)} />
      <span className={cn('text-sm font-medium', config.color)}>{config.label}</span>
      <span className="text-xs text-muted-foreground font-mono">{ratio.toFixed(2)}:1</span>
    </div>
  );
}

function ContrastMeter({ ratio }: { ratio: number }): React.JSX.Element {
  // Map ratio to percentage (7:1 = 100%, 1:1 = 0%)
  const percentage = Math.min(((ratio - 1) / 6) * 100, 100);

  // Determine color based on ratio
  let barColor = 'bg-red-500';
  if (ratio >= 7) {
    barColor = 'bg-green-500';
  } else if (ratio >= 4.5) {
    barColor = 'bg-emerald-500';
  } else if (ratio >= 3) {
    barColor = 'bg-yellow-500';
  } else if (ratio >= 2) {
    barColor = 'bg-orange-500';
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>1:1</span>
        <span className="font-mono">{ratio.toFixed(2)}:1</span>
        <span>21:1</span>
      </div>
      <div className="relative h-2 bg-black/30 rounded-full overflow-hidden">
        {/* Threshold markers */}
        <div
          className="absolute top-0 bottom-0 w-px bg-yellow-500/50"
          style={{ left: `${((3 - 1) / 20) * 100}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-px bg-green-500/50"
          style={{ left: `${((4.5 - 1) / 20) * 100}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-px bg-green-500/50"
          style={{ left: `${((7 - 1) / 20) * 100}%` }}
        />

        {/* Progress bar */}
        <motion.div
          className={cn('absolute top-0 left-0 h-full rounded-full', barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
        <span>Fail</span>
        <span className="text-yellow-500/80">AA Large (3:1)</span>
        <span className="text-emerald-500/80">AA (4.5:1)</span>
        <span className="text-green-500/80">AAA (7:1)</span>
      </div>
    </div>
  );
}

function TextPreview({
  foreground,
  background,
  showLarge,
}: {
  foreground: string;
  background: string;
  showLarge: boolean;
}) {
  return (
    <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: background }}>
      <div className="flex items-center gap-2" style={{ color: foreground }}>
        <Eye className="h-4 w-4 opacity-60" />
        <span className="text-xs opacity-60">Live Preview</span>
      </div>

      <p className="text-sm" style={{ color: foreground }}>
        Normal text (14px) - The quick brown fox jumps over the lazy dog.
      </p>

      {showLarge && (
        <p className="text-lg font-semibold" style={{ color: foreground }}>
          Large text (18px+) - Heading Example
        </p>
      )}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="button"
          className="px-3 py-1.5 rounded-md text-sm font-medium transition-opacity hover:opacity-80"
          style={{
            backgroundColor: foreground,
            color: background,
          }}
        >
          Button
        </button>
        <span className="text-xs underline" style={{ color: foreground }}>
          Link text
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ContrastValidator({
  foreground,
  background,
  onSuggestFix,
  showPreview = true,
  showLargeText = true,
  className,
}: ContrastValidatorProps) {
  const result = React.useMemo(
    () => checkContrast(foreground, background),
    [foreground, background],
  );

  const handleSuggestFix = React.useCallback(() => {
    if (!onSuggestFix) return;

    const fgParsed = parseColor(foreground);
    if (!fgParsed) return;

    const fgHsl = rgbToHsl(fgParsed);
    const fixedColor = findAccessibleColor(fgHsl, background);
    onSuggestFix(fixedColor);
  }, [foreground, background, onSuggestFix]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with level badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Type className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Contrast Check</span>
        </div>
        <LevelBadge level={result.level} ratio={result.ratio} />
      </div>

      {/* Contrast meter */}
      <ContrastMeter ratio={result.ratio} />

      {/* Compliance indicators */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className={cn(
            'p-3 rounded-lg text-center',
            result.passesNormalText
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-red-500/10 border border-red-500/20',
          )}
        >
          <div className="flex justify-center mb-1">
            {result.passesNormalText ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <X className="h-4 w-4 text-red-400" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">Normal Text</p>
          <p className="text-[10px] text-muted-foreground/60">4.5:1 min</p>
        </div>

        <div
          className={cn(
            'p-3 rounded-lg text-center',
            result.passesLargeText
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-red-500/10 border border-red-500/20',
          )}
        >
          <div className="flex justify-center mb-1">
            {result.passesLargeText ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <X className="h-4 w-4 text-red-400" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">Large Text</p>
          <p className="text-[10px] text-muted-foreground/60">3:1 min</p>
        </div>

        <div
          className={cn(
            'p-3 rounded-lg text-center',
            result.passesUI
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-red-500/10 border border-red-500/20',
          )}
        >
          <div className="flex justify-center mb-1">
            {result.passesUI ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <X className="h-4 w-4 text-red-400" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">UI Elements</p>
          <p className="text-[10px] text-muted-foreground/60">3:1 min</p>
        </div>
      </div>

      {/* Fix suggestion */}
      {!result.passesNormalText && onSuggestFix && (
        <motion.button
          onClick={handleSuggestFix}
          className="w-full py-2 px-4 rounded-lg bg-primary-500/20 border border-primary-500/30 text-primary-400 text-sm font-medium hover:bg-primary-500/30 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Suggest Accessible Color
        </motion.button>
      )}

      {/* Live preview */}
      {showPreview && (
        <TextPreview foreground={foreground} background={background} showLarge={showLargeText} />
      )}
    </div>
  );
}
