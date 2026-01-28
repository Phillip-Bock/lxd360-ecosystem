'use client';

import { Heart, Target } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { getMotivationLabel } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface MotivationSlidersProps {
  internalMotivation: number;
  externalMotivation: number;
  onInternalChange: (value: number) => void;
  onExternalChange: (value: number) => void;
  className?: string;
}

/**
 * MotivationSliders - Dual slider for internal/external motivation
 *
 * Internal: Personal drive, curiosity, mastery
 * External: Compliance, career advancement, rewards
 */
export function MotivationSliders({
  internalMotivation,
  externalMotivation,
  onInternalChange,
  onExternalChange,
  className,
}: MotivationSlidersProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <h4 className="font-medium">Motivation Profile</h4>

      {/* Internal Motivation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-500" />
            Internal Motivation
          </Label>
          <span className="text-sm font-medium text-lxd-cyan">
            {internalMotivation}/10 — {getMotivationLabel(internalMotivation)}
          </span>
        </div>
        <Slider
          value={[internalMotivation]}
          onValueChange={([v]) => onInternalChange(v ?? internalMotivation)}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Driven by curiosity, personal growth, and mastery of the subject
        </p>
      </div>

      {/* External Motivation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Target className="h-4 w-4 text-orange-500" />
            External Motivation
          </Label>
          <span className="text-sm font-medium text-lxd-cyan">
            {externalMotivation}/10 — {getMotivationLabel(externalMotivation)}
          </span>
        </div>
        <Slider
          value={[externalMotivation]}
          onValueChange={([v]) => onExternalChange(v ?? externalMotivation)}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Driven by compliance requirements, career advancement, or incentives
        </p>
      </div>

      {/* Motivation Balance Indicator */}
      <div className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
        <h5 className="text-sm font-medium mb-2">Motivation Balance</h5>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 bg-lxd-dark-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-orange-500 transition-all"
              style={{
                width: `${((internalMotivation + externalMotivation) / 20) * 100}%`,
              }}
            />
          </div>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {internalMotivation + externalMotivation}/20
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {getMotivationInsight(internalMotivation, externalMotivation)}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getMotivationInsight(internal: number, external: number): string {
  const total = internal + external;
  const ratio = internal / (external || 1);

  if (total <= 6) {
    return 'Low overall motivation — consider strong engagement strategies and clear value proposition.';
  }

  if (ratio > 1.5) {
    return 'Intrinsically motivated — will benefit from mastery-focused content and exploratory learning.';
  }

  if (ratio < 0.67) {
    return 'Extrinsically motivated — emphasize certifications, compliance badges, and career benefits.';
  }

  return 'Balanced motivation — combine meaningful content with clear progress tracking and recognition.';
}
