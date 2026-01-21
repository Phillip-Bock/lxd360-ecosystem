'use client';

import { AlertTriangle, Check, Info, Layers } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ILMIOutput, ModalitySelection, ModalityType } from '@/schemas/inspire';
import { useMissionStore } from '@/store/inspire';
import { ModalitySelector } from './ModalitySelector';
import { ModalityWheel } from './ModalityWheel';
import { calculateDualCodingScore, getRecommendedInteractions, MODALITY_CATALOG } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface Step1_4_ILMIProps {
  className?: string;
}

/**
 * Step1_4_ILMI - INSPIRE Learning Modality Integrator
 *
 * This step configures:
 * - Primary learning modality
 * - Secondary modality for dual coding
 * - Modality balance visualization
 * - Dual coding validation
 *
 * Output to store:
 * - manifest.encoding.modalityPlan
 */
export function Step1_4_ILMI({ className }: Step1_4_ILMIProps) {
  const manifest = useMissionStore((state) => state.manifest);
  const updateEncodingData = useMissionStore((state) => state.updateEncodingData);

  // Local state
  const [primaryModality, setPrimaryModality] = useState<ModalityType | undefined>(
    manifest?.encoding?.modalityPlan?.primaryModality,
  );
  const [secondaryModality, setSecondaryModality] = useState<ModalityType | undefined>(
    manifest?.encoding?.modalityPlan?.secondaryModality,
  );
  const [modalityWeights, setModalityWeights] = useState<Record<ModalityType, number>>(
    getInitialWeights(manifest?.encoding?.modalityPlan?.modalities),
  );

  // Calculate dual coding score
  const dualCodingResult = useMemo(
    () => calculateDualCodingScore(primaryModality, secondaryModality),
    [primaryModality, secondaryModality],
  );

  // Get recommended interactions
  const recommendedInteractions = useMemo(
    () => getRecommendedInteractions(primaryModality, secondaryModality),
    [primaryModality, secondaryModality],
  );

  // Get recommended secondary modalities based on primary
  const recommendedSecondary = useMemo((): ModalityType[] => {
    if (!primaryModality) return [];
    const primary = MODALITY_CATALOG.find((m) => m.id === primaryModality);
    return primary?.dualCodingPairs ?? [];
  }, [primaryModality]);

  // Validation
  const isValid = useMemo(() => {
    return !!primaryModality && !!secondaryModality;
  }, [primaryModality, secondaryModality]);

  // Update weights when modalities change
  useEffect(() => {
    if (primaryModality) {
      setModalityWeights((prev) => ({
        ...prev,
        [primaryModality]: 60,
      }));
    }
    if (secondaryModality) {
      setModalityWeights((prev) => ({
        ...prev,
        [secondaryModality]: 30,
      }));
    }
  }, [primaryModality, secondaryModality]);

  // Sync to store
  useEffect(() => {
    if (isValid && primaryModality && secondaryModality) {
      const modalities: ModalitySelection[] = MODALITY_CATALOG.map((m) => ({
        type: m.id,
        isPrimary: m.id === primaryModality,
        isSecondary: m.id === secondaryModality,
        weight: modalityWeights[m.id] || 0,
      }));

      const modalityPlan: ILMIOutput = {
        primaryModality,
        secondaryModality,
        modalities,
        dualCodingScore: dualCodingResult.score,
        dualCodingValid: dualCodingResult.valid,
        balanceWheel: {
          visual: modalityWeights.visual || 0,
          auditory: modalityWeights.auditory || 0,
          textual: modalityWeights.textual || 0,
          kinesthetic: modalityWeights.kinesthetic || 0,
        },
        recommendedInteractions,
      };

      updateEncodingData({ modalityPlan });
    }
  }, [
    isValid,
    primaryModality,
    secondaryModality,
    modalityWeights,
    dualCodingResult,
    recommendedInteractions,
    updateEncodingData,
  ]);

  // Handle modality click from wheel
  const handleWheelClick = useCallback(
    (modality: ModalityType) => {
      if (!primaryModality) {
        setPrimaryModality(modality);
      } else if (modality === primaryModality) {
        // Clicking primary again deselects it
        setPrimaryModality(undefined);
        setSecondaryModality(undefined);
      } else if (modality === secondaryModality) {
        // Clicking secondary deselects it
        setSecondaryModality(undefined);
      } else {
        setSecondaryModality(modality);
      }
    },
    [primaryModality, secondaryModality],
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Layers className="h-5 w-5 text-lxd-purple" />
          ILMI: Modality Integrator
        </h2>
        <p className="text-muted-foreground mt-1">
          Select learning modalities to leverage dual coding theory for enhanced retention
        </p>
      </div>

      {/* Validation Status */}
      {!isValid && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Select both a primary and secondary modality to enable dual coding benefits.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Modality Selectors */}
        <div className="space-y-6">
          {/* Primary Modality */}
          <ModalitySelector
            label="Primary Modality"
            description="The dominant learning channel for your content"
            value={primaryModality}
            onChange={setPrimaryModality}
            variant="primary"
          />

          {/* Secondary Modality */}
          <ModalitySelector
            label="Secondary Modality"
            description="Complementary channel for dual coding (enhances retention)"
            value={secondaryModality}
            onChange={setSecondaryModality}
            excludeModality={primaryModality}
            recommendedModalities={recommendedSecondary}
            variant="secondary"
          />
        </div>

        {/* Right: Wheel Visualization */}
        <div className="flex flex-col items-center justify-center">
          <ModalityWheel
            weights={modalityWeights}
            primaryModality={primaryModality}
            secondaryModality={secondaryModality}
            onModalityClick={handleWheelClick}
          />
        </div>
      </div>

      {/* Dual Coding Score */}
      <div className="p-4 rounded-lg bg-lxd-dark-surface border border-lxd-dark-border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Dual Coding Validation</h4>
          <div className="flex items-center gap-2">
            {dualCodingResult.valid ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
            <Badge
              variant={dualCodingResult.valid ? 'default' : 'outline'}
              className={cn(dualCodingResult.valid && 'bg-green-500/20 text-green-400')}
            >
              {dualCodingResult.score}% Score
            </Badge>
          </div>
        </div>

        {/* Score Bar */}
        <div className="h-3 bg-lxd-dark-border rounded-full overflow-hidden mb-3">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              dualCodingResult.score >= 85 && 'bg-green-500',
              dualCodingResult.score >= 50 && dualCodingResult.score < 85 && 'bg-yellow-500',
              dualCodingResult.score < 50 && 'bg-orange-500',
            )}
            style={{ width: `${dualCodingResult.score}%` }}
          />
        </div>

        <p className="text-sm text-muted-foreground">{dualCodingResult.recommendation}</p>

        {/* Paivio Reference */}
        <div className="mt-3 pt-3 border-t border-lxd-dark-border">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Dual Coding Theory: </span>
            Combining visual and verbal information creates multiple memory pathways, improving
            recall by up to 89% (Paivio, 1986).
          </p>
        </div>
      </div>

      {/* Recommended Interactions */}
      {recommendedInteractions.length > 0 && (
        <div className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
          <h4 className="font-medium mb-3">Recommended Interaction Types</h4>
          <div className="flex flex-wrap gap-2">
            {recommendedInteractions.map((interaction) => (
              <Badge key={interaction} variant="secondary">
                {interaction}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {isValid && (
        <div className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
          <h4 className="font-medium mb-3">Modality Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Primary</p>
              <p className="text-lg font-bold text-lxd-purple capitalize">
                {primaryModality?.replace('-', ' ')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Secondary</p>
              <p className="text-lg font-bold text-lxd-cyan capitalize">
                {secondaryModality?.replace('-', ' ')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Dual Coding</p>
              <p
                className={cn(
                  'text-lg font-bold',
                  dualCodingResult.valid ? 'text-green-500' : 'text-orange-500',
                )}
              >
                {dualCodingResult.valid ? 'Valid' : 'Weak'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Score</p>
              <p className="text-lg font-bold text-foreground">{dualCodingResult.score}%</p>
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

function getInitialWeights(modalities?: ModalitySelection[]): Record<ModalityType, number> {
  const weights: Record<ModalityType, number> = {
    visual: 0,
    auditory: 0,
    textual: 0,
    kinesthetic: 0,
    'social-async': 0,
    gamified: 0,
    reflective: 0,
    'contextual-situated': 0,
  };

  if (modalities) {
    for (const m of modalities) {
      weights[m.type] = m.weight;
    }
  }

  return weights;
}

export default Step1_4_ILMI;
