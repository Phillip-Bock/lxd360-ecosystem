'use client';

import { Brain, Info, Zap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { ITLAOutput, NeuroPrinciple, NeuroPrincipleConfig } from '@/schemas/inspire';
import { useMissionStore } from '@/store/inspire';
import { DopamineSlider } from './dopamine-slider';
import { PrincipleSelector } from './principle-selector';
import { createDefaultPrincipleConfig } from './types';
import { WorkingMemoryGuard } from './working-memory-guard';

// ============================================================================
// COMPONENT
// ============================================================================

interface Step1_3_ITLAProps {
  className?: string;
}

/**
 * Step1_3_ITLA - INSPIRE Transformative Learning Activation
 *
 * This step configures:
 * - Neuroscience-backed learning principles
 * - Gamification intensity (Dopamine Slider)
 * - Working memory guard (cognitive load limiter)
 * - Spaced repetition settings
 *
 * Output to store:
 * - manifest.encoding.activationStrategy
 */
export function Step1_3_ITLA({ className }: Step1_3_ITLAProps) {
  const manifest = useMissionStore((state) => state.manifest);
  const updateEncodingData = useMissionStore((state) => state.updateEncodingData);

  // Get prior knowledge from personas for alignment check
  const primaryPersonaPriorKnowledge = useMemo(() => {
    const personas = manifest?.encoding?.personas ?? [];
    if (personas.length === 0) return undefined;
    return personas[0]?.priorKnowledge;
  }, [manifest?.encoding?.personas]);

  // Local state - initialize from store
  const [principles, setPrinciples] = useState<NeuroPrincipleConfig[]>(
    manifest?.encoding?.activationStrategy?.principles ?? getDefaultPrinciples(),
  );
  const [dopamineValue, setDopamineValue] = useState(
    manifest?.encoding?.activationStrategy?.dopamineSliderValue ?? 5,
  );
  const [workingMemoryLimit, setWorkingMemoryLimit] = useState(
    manifest?.encoding?.activationStrategy?.workingMemoryLimit ?? 5,
  );
  const [spacedRepetitionEnabled, setSpacedRepetitionEnabled] = useState(
    manifest?.encoding?.activationStrategy?.spacedRepetitionSchedule?.enabled ?? false,
  );

  // AI recommendations based on persona
  const aiRecommendations = useMemo((): NeuroPrinciple[] => {
    const recommendations: NeuroPrinciple[] = [];

    // Always recommend core principles
    recommendations.push('retrieval-practice', 'feedback-error-correction');

    // Add based on persona
    if (primaryPersonaPriorKnowledge) {
      if (primaryPersonaPriorKnowledge === 'none' || primaryPersonaPriorKnowledge === 'awareness') {
        recommendations.push('cognitive-load-management', 'multisensory-integration');
      }
      if (
        primaryPersonaPriorKnowledge === 'expert' ||
        primaryPersonaPriorKnowledge === 'advanced'
      ) {
        recommendations.push('metacognition-reflection', 'contextual-situated');
      }
    }

    // Always good to have spaced repetition
    recommendations.push('spaced-repetition');

    return recommendations;
  }, [primaryPersonaPriorKnowledge]);

  // Validation
  const isValid = useMemo(() => {
    const enabledPrinciples = principles.filter((p) => p.enabled);
    return enabledPrinciples.length >= 2;
  }, [principles]);

  // Sync to store
  useEffect(() => {
    if (isValid) {
      const activationStrategy: ITLAOutput = {
        principles,
        dopamineSliderValue: dopamineValue,
        workingMemoryLimit,
        aiMatchedPrinciples: aiRecommendations,
        spacedRepetitionSchedule: {
          enabled: spacedRepetitionEnabled,
          intervals: [1, 3, 7, 14, 30],
        },
      };
      updateEncodingData({ activationStrategy });
    }
  }, [
    isValid,
    principles,
    dopamineValue,
    workingMemoryLimit,
    spacedRepetitionEnabled,
    aiRecommendations,
    updateEncodingData,
  ]);

  // Apply AI recommendations
  const handleApplyAIRecommendations = useCallback(() => {
    const newPrinciples = aiRecommendations.map((id) => createDefaultPrincipleConfig(id, true, 3));

    // Merge with existing, keeping user selections
    setPrinciples((prev) => {
      const existingIds = new Set(prev.map((p) => p.principle));
      const merged = [...prev];

      for (const newPrinciple of newPrinciples) {
        if (!existingIds.has(newPrinciple.principle)) {
          merged.push(newPrinciple);
        } else {
          // Enable if already exists
          const idx = merged.findIndex((p) => p.principle === newPrinciple.principle);
          if (idx >= 0) {
            merged[idx] = { ...merged[idx], enabled: true };
          }
        }
      }

      return merged;
    });
  }, [aiRecommendations]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-lxd-purple" />
          ITLA: Activation Strategy
        </h2>
        <p className="text-muted-foreground mt-1">
          Configure neuroscience-backed learning principles to optimize knowledge retention
        </p>
      </div>

      {/* Validation Status */}
      {!isValid && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Select at least 2 neuroscience principles to activate your learning strategy.
          </AlertDescription>
        </Alert>
      )}

      {/* AI Recommendations Banner */}
      {aiRecommendations.length > 0 && (
        <div className="p-4 rounded-lg bg-lxd-purple/10 border border-lxd-purple/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-lxd-purple" />
              <div>
                <p className="font-medium">AI Recommendations Available</p>
                <p className="text-sm text-muted-foreground">
                  Based on your learner persona, we suggest {aiRecommendations.length} principles
                </p>
              </div>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-lxd-purple text-white text-sm font-medium hover:bg-lxd-purple/90 transition-colors"
              onClick={handleApplyAIRecommendations}
            >
              Apply Recommendations
            </button>
          </div>
        </div>
      )}

      {/* Principle Selector */}
      <PrincipleSelector
        selectedPrinciples={principles}
        onPrinciplesChange={setPrinciples}
        aiRecommendations={aiRecommendations}
      />

      {/* Dopamine Slider */}
      <div className="p-4 rounded-lg bg-lxd-dark-surface border border-lxd-dark-border">
        <DopamineSlider value={dopamineValue} onChange={setDopamineValue} />
      </div>

      {/* Working Memory Guard */}
      <div className="p-4 rounded-lg bg-lxd-dark-surface border border-lxd-dark-border">
        <WorkingMemoryGuard
          value={workingMemoryLimit}
          onChange={setWorkingMemoryLimit}
          priorKnowledge={primaryPersonaPriorKnowledge}
        />
      </div>

      {/* Spaced Repetition Toggle */}
      <div className="p-4 rounded-lg bg-lxd-dark-surface border border-lxd-dark-border">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">Spaced Repetition</Label>
            <p className="text-sm text-muted-foreground">
              Automatically schedule review sessions at optimal intervals (1, 3, 7, 14, 30 days)
            </p>
          </div>
          <Switch checked={spacedRepetitionEnabled} onCheckedChange={setSpacedRepetitionEnabled} />
        </div>

        {spacedRepetitionEnabled && (
          <div className="mt-4 pt-4 border-t border-lxd-dark-border">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Review schedule:</span>
              {[1, 3, 7, 14, 30].map((days) => (
                <span
                  key={days}
                  className="px-2 py-1 rounded bg-lxd-cyan/10 text-lxd-cyan text-xs font-medium"
                >
                  Day {days}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      {isValid && (
        <div className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
          <h4 className="font-medium mb-3">Activation Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Active Principles</p>
              <p className="text-2xl font-bold text-lxd-purple">
                {principles.filter((p) => p.enabled).length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Gamification Level</p>
              <p className="text-2xl font-bold text-lxd-cyan">{dopamineValue}/10</p>
            </div>
            <div>
              <p className="text-muted-foreground">Memory Guard</p>
              <p className="text-2xl font-bold text-green-500">{workingMemoryLimit} max</p>
            </div>
            <div>
              <p className="text-muted-foreground">Spaced Repetition</p>
              <p className="text-2xl font-bold text-orange-500">
                {spacedRepetitionEnabled ? 'ON' : 'OFF'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getDefaultPrinciples(): NeuroPrincipleConfig[] {
  return [
    createDefaultPrincipleConfig('retrieval-practice', true, 1),
    createDefaultPrincipleConfig('feedback-error-correction', true, 2),
    createDefaultPrincipleConfig('cognitive-load-management', true, 3),
  ];
}

export default Step1_3_ITLA;
