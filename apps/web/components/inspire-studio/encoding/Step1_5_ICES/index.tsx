'use client';

import { Activity, AlertTriangle, Check, Info } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { EngagementLevel, ICESOutput } from '@/schemas/inspire';
import { useMissionStore } from '@/store/inspire';
import { CognitiveLoadMeter } from './CognitiveLoadMeter';
import { EngagementSpectrum } from './EngagementSpectrum';
import {
  getEngagementLevelOption,
  getRecommendedBlockTypes,
  validateModalityAlignment,
} from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface Step1_5_ICESProps {
  className?: string;
}

/**
 * Step1_5_ICES - INSPIRE Cognitive Engagement Spectrum
 *
 * This step configures:
 * - Target engagement level (passive → immersive)
 * - Cognitive load estimation
 * - Stress simulation settings (for immersive)
 * - Block type recommendations
 *
 * Output to store:
 * - manifest.encoding.engagementLevel
 */
export function Step1_5_ICES({ className }: Step1_5_ICESProps) {
  const manifest = useMissionStore((state) => state.manifest);
  const updateEncodingData = useMissionStore((state) => state.updateEncodingData);

  // Get related data from previous steps
  const workingMemoryLimit = manifest?.encoding?.activationStrategy?.workingMemoryLimit ?? 5;
  const primaryModality = manifest?.encoding?.modalityPlan?.primaryModality;

  // Local state
  const [engagementLevel, setEngagementLevel] = useState<EngagementLevel | undefined>(
    manifest?.encoding?.engagementLevel?.targetLevel,
  );
  const [cognitiveLoad, setCognitiveLoad] = useState(
    manifest?.encoding?.engagementLevel?.cognitiveLoadEstimate ?? 5,
  );
  const [stressEnabled, setStressEnabled] = useState(
    manifest?.encoding?.engagementLevel?.stressConfig?.enabled ?? false,
  );
  const [stressIntensity, setStressIntensity] = useState(
    manifest?.encoding?.engagementLevel?.stressConfig?.intensity ?? 5,
  );

  // Get selected level details
  const selectedLevel = useMemo(
    () => (engagementLevel ? getEngagementLevelOption(engagementLevel) : undefined),
    [engagementLevel],
  );

  // Validate modality alignment
  const modalityAlignment = useMemo(
    () =>
      engagementLevel
        ? validateModalityAlignment(engagementLevel, primaryModality)
        : { valid: true, message: '' },
    [engagementLevel, primaryModality],
  );

  // Get recommended block types
  const recommendedBlocks = useMemo(
    () => (engagementLevel ? getRecommendedBlockTypes(engagementLevel) : []),
    [engagementLevel],
  );

  // Validation
  const isValid = useMemo(() => !!engagementLevel, [engagementLevel]);

  // Working memory warning
  const workingMemoryWarning = useMemo(() => {
    return cognitiveLoad > 7 && workingMemoryLimit <= 4;
  }, [cognitiveLoad, workingMemoryLimit]);

  // Update cognitive load when engagement level changes
  useEffect(() => {
    if (selectedLevel) {
      const midpoint = Math.round(
        (selectedLevel.cognitiveLoadRange.min + selectedLevel.cognitiveLoadRange.max) / 2,
      );
      setCognitiveLoad(midpoint);
    }
  }, [selectedLevel]);

  // Sync to store
  useEffect(() => {
    if (isValid && engagementLevel) {
      const engagementConfig: ICESOutput = {
        targetLevel: engagementLevel,
        cognitiveLoadEstimate: cognitiveLoad,
        stressConfig:
          engagementLevel === 'immersive'
            ? {
                enabled: stressEnabled,
                intensity: stressIntensity,
                type: 'realism',
              }
            : undefined,
        workingMemoryWarning,
        modalityAlignmentValid: modalityAlignment.valid,
        recommendedBlockTypes: recommendedBlocks,
      };

      updateEncodingData({ engagementLevel: engagementConfig });
    }
  }, [
    isValid,
    engagementLevel,
    cognitiveLoad,
    stressEnabled,
    stressIntensity,
    workingMemoryWarning,
    modalityAlignment.valid,
    recommendedBlocks,
    updateEncodingData,
  ]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-lxd-purple" />
          ICES: Engagement Spectrum
        </h2>
        <p className="text-muted-foreground mt-1">
          Define the target engagement level to optimize cognitive challenge and learner interaction
        </p>
      </div>

      {/* Validation Status */}
      {!isValid && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Select an engagement level to complete the Encoding phase configuration.
          </AlertDescription>
        </Alert>
      )}

      {/* Engagement Spectrum Selector */}
      <div className="p-4 rounded-lg bg-lxd-dark-surface border border-lxd-dark-border">
        <EngagementSpectrum value={engagementLevel} onChange={setEngagementLevel} />
      </div>

      {/* Cognitive Load Meter */}
      {selectedLevel && (
        <div className="p-4 rounded-lg bg-lxd-dark-surface border border-lxd-dark-border">
          <CognitiveLoadMeter
            value={cognitiveLoad}
            onChange={setCognitiveLoad}
            workingMemoryLimit={workingMemoryLimit}
            engagementLevelRange={selectedLevel.cognitiveLoadRange}
          />
        </div>
      )}

      {/* Stress Simulation (Immersive Only) */}
      {engagementLevel === 'immersive' && (
        <div className="p-4 rounded-lg bg-lxd-dark-surface border border-lxd-dark-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Stress Simulation</Label>
              <p className="text-sm text-muted-foreground">
                Add realistic pressure and consequences for high-stakes training
              </p>
            </div>
            <Switch checked={stressEnabled} onCheckedChange={setStressEnabled} />
          </div>

          {stressEnabled && (
            <div className="pt-4 border-t border-lxd-dark-border space-y-3">
              <div className="flex items-center justify-between">
                <Label>Stress Intensity</Label>
                <span className="text-sm font-medium text-lxd-cyan">{stressIntensity}/10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={stressIntensity}
                onChange={(e) => setStressIntensity(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mild pressure</span>
                <span>High stakes</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modality Alignment Check */}
      {engagementLevel && (
        <Alert
          className={cn(
            modalityAlignment.valid
              ? 'bg-green-500/10 border-green-500/50'
              : 'bg-orange-500/10 border-orange-500/50',
          )}
        >
          {modalityAlignment.valid ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          )}
          <AlertTitle className={modalityAlignment.valid ? 'text-green-500' : 'text-orange-500'}>
            Modality Alignment
          </AlertTitle>
          <AlertDescription
            className={modalityAlignment.valid ? 'text-green-300/80' : 'text-orange-300/80'}
          >
            {modalityAlignment.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Recommended Block Types */}
      {recommendedBlocks.length > 0 && (
        <div className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
          <h4 className="font-medium mb-3">Recommended Block Types</h4>
          <div className="flex flex-wrap gap-2">
            {recommendedBlocks.map((block) => (
              <Badge key={block} variant="secondary">
                {block}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            These interaction types align best with your selected engagement level
          </p>
        </div>
      )}

      {/* Summary */}
      {isValid && (
        <div className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
          <h4 className="font-medium mb-3">Engagement Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Level</p>
              <p className="text-lg font-bold text-lxd-purple capitalize">{engagementLevel}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Cognitive Load</p>
              <p className="text-lg font-bold text-lxd-cyan">{cognitiveLoad}/10</p>
            </div>
            <div>
              <p className="text-muted-foreground">Modality Aligned</p>
              <p
                className={cn(
                  'text-lg font-bold',
                  modalityAlignment.valid ? 'text-green-500' : 'text-orange-500',
                )}
              >
                {modalityAlignment.valid ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Stress Mode</p>
              <p className="text-lg font-bold text-foreground">
                {engagementLevel === 'immersive' && stressEnabled ? 'Active' : 'Off'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Step1_5_ICES;
