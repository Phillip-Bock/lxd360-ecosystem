'use client';

import { AlertTriangle, Check, Gauge } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { getCognitiveLoadDescription } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface CognitiveLoadMeterProps {
  value: number;
  onChange: (value: number) => void;
  workingMemoryLimit?: number;
  engagementLevelRange?: { min: number; max: number };
  className?: string;
}

/**
 * CognitiveLoadMeter - Visual meter for estimated cognitive load
 */
export function CognitiveLoadMeter({
  value,
  onChange,
  workingMemoryLimit = 5,
  engagementLevelRange,
  className,
}: CognitiveLoadMeterProps) {
  const loadInfo = getCognitiveLoadDescription(value);

  // Check if within engagement level range
  const isInRange =
    !engagementLevelRange ||
    (value >= engagementLevelRange.min && value <= engagementLevelRange.max);

  // Check working memory warning
  const hasWorkingMemoryWarning = value > 7 && workingMemoryLimit <= 4;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-lxd-cyan" />
          Cognitive Load Estimate
        </Label>
        <span className="text-sm font-medium">
          <span className={loadInfo.color}>{value}/10</span>
          <span className="text-muted-foreground ml-2">— {loadInfo.label}</span>
        </span>
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v ?? value)}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />

        {/* Scale Labels */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Low (1)</span>
          <span>Moderate (5)</span>
          <span>High (10)</span>
        </div>
      </div>

      {/* Visual Meter */}
      <div className="h-4 bg-lxd-dark-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${(value / 10) * 100}%`,
            background:
              value <= 3
                ? 'linear-gradient(90deg, #22c55e, #86efac)'
                : value <= 5
                  ? 'linear-gradient(90deg, #eab308, #fde047)'
                  : value <= 7
                    ? 'linear-gradient(90deg, #f97316, #fdba74)'
                    : 'linear-gradient(90deg, #ef4444, #fca5a5)',
          }}
        />
      </div>

      <p className="text-sm text-muted-foreground">{loadInfo.description}</p>

      {/* Engagement Level Range Indicator */}
      {engagementLevelRange && (
        <div className="p-3 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Engagement Level Range:</span>
            <span className="font-medium">
              {engagementLevelRange.min} - {engagementLevelRange.max}
            </span>
          </div>
          <div className="mt-2 h-2 bg-lxd-dark-border rounded-full relative overflow-hidden">
            {/* Range indicator */}
            <div
              className="absolute h-full bg-lxd-purple/30 rounded-full"
              style={{
                left: `${(engagementLevelRange.min / 10) * 100}%`,
                width: `${((engagementLevelRange.max - engagementLevelRange.min) / 10) * 100}%`,
              }}
            />
            {/* Current value indicator */}
            <div
              className={cn(
                'absolute w-3 h-3 -top-0.5 rounded-full border-2 border-white transition-all',
                isInRange ? 'bg-green-500' : 'bg-orange-500',
              )}
              style={{ left: `calc(${(value / 10) * 100}% - 6px)` }}
            />
          </div>
        </div>
      )}

      {/* Warnings */}
      {!isInRange && engagementLevelRange && (
        <Alert variant="destructive" className="bg-orange-500/10 border-orange-500/50">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertTitle className="text-orange-500">Outside Recommended Range</AlertTitle>
          <AlertDescription className="text-orange-300/80">
            The cognitive load ({value}) is outside the typical range ({engagementLevelRange.min}-
            {engagementLevelRange.max}) for your selected engagement level. Consider adjusting.
          </AlertDescription>
        </Alert>
      )}

      {hasWorkingMemoryWarning && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-500">Working Memory Warning</AlertTitle>
          <AlertDescription className="text-red-300/80">
            High cognitive load combined with strict working memory limit may overwhelm learners.
            Consider reducing complexity or increasing the working memory guard.
          </AlertDescription>
        </Alert>
      )}

      {isInRange && !hasWorkingMemoryWarning && (
        <Alert className="bg-green-500/10 border-green-500/50">
          <Check className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-500">Cognitive Load Aligned</AlertTitle>
          <AlertDescription className="text-green-300/80">
            The cognitive load is appropriate for your engagement level and learner profile.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
