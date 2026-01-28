'use client';

import { AlertTriangle, Brain, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { getWorkingMemoryDescription } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface WorkingMemoryGuardProps {
  value: number;
  onChange: (value: number) => void;
  priorKnowledge?: 'none' | 'awareness' | 'basic' | 'intermediate' | 'advanced' | 'expert';
  className?: string;
}

/**
 * WorkingMemoryGuard - Cognitive load limiter
 *
 * Enforces Miller's Law (7±2) by limiting new concepts
 * introduced per content segment.
 */
export function WorkingMemoryGuard({
  value,
  onChange,
  priorKnowledge,
  className,
}: WorkingMemoryGuardProps) {
  const description = getWorkingMemoryDescription(value);

  // Get recommended limit based on prior knowledge
  const getRecommendedLimit = (): number | null => {
    if (!priorKnowledge) return null;
    switch (priorKnowledge) {
      case 'none':
      case 'awareness':
        return 3;
      case 'basic':
        return 4;
      case 'intermediate':
        return 5;
      case 'advanced':
        return 6;
      case 'expert':
        return 7;
      default:
        return 5;
    }
  };

  const recommended = getRecommendedLimit();
  const isAligned = recommended === null || value <= recommended;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-lxd-cyan" />
          Working Memory Guard
        </Label>
        <span className="text-sm font-medium">
          <span className="text-lxd-cyan">{value}</span>
          <span className="text-muted-foreground ml-1">concepts max/segment</span>
        </span>
      </div>

      <div className="space-y-3">
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v ?? value)}
          min={3}
          max={7}
          step={1}
          className="w-full"
        />

        {/* Scale Labels */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Strict (3)</span>
          <span>Standard (5)</span>
          <span>Extended (7)</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{description}</p>

      {/* Visual Chunks */}
      <div className="flex items-center justify-center gap-2 py-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all',
              i < value
                ? 'bg-lxd-cyan/20 text-lxd-cyan border-2 border-lxd-cyan'
                : 'bg-lxd-dark-bg/30 text-muted-foreground border-2 border-transparent',
            )}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Recommendation Alert */}
      {recommended !== null && !isAligned && (
        <Alert variant="destructive" className="bg-orange-500/10 border-orange-500/50">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertTitle className="text-orange-500">Potential Cognitive Overload</AlertTitle>
          <AlertDescription className="text-orange-300/80">
            Based on the learner persona&apos;s prior knowledge level ({priorKnowledge}), we
            recommend limiting to {recommended} concepts per segment. Current setting ({value}) may
            cause cognitive overload.
          </AlertDescription>
        </Alert>
      )}

      {recommended !== null && isAligned && (
        <Alert className="bg-green-500/10 border-green-500/50">
          <Check className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-500">Aligned with Persona</AlertTitle>
          <AlertDescription className="text-green-300/80">
            Working memory limit is appropriate for learners with {priorKnowledge} prior knowledge.
          </AlertDescription>
        </Alert>
      )}

      {/* Miller's Law Reference */}
      <div className="p-3 rounded-lg bg-lxd-dark-bg/30 border border-lxd-dark-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Miller&apos;s Law: </span>
          Working memory can typically hold 7±2 items. For learning, 3-5 new concepts per segment is
          optimal for retention.
        </p>
      </div>
    </div>
  );
}
