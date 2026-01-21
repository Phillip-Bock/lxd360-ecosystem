'use client';

import { ArrowRight, Check, Info, Layers, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ICPFOutput, ProficiencyLevel, ScaffoldingConfig } from '@/schemas/inspire';
import { useMissionStore } from '@/store/inspire';
import { ProficiencySelector } from './ProficiencySelector';
import { ScaffoldingConfigurator } from './ScaffoldingConfigurator';
import {
  calculateNeuroReadinessScore,
  generateScaffoldingConfig,
  getLevelGap,
  getMilestoneTemplate,
  PROFICIENCY_LEVEL_CATALOG,
} from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface Step2_3_ICPFProps {
  className?: string;
}

/**
 * Step2_3_ICPF - INSPIRE Capability Progression Framework
 *
 * This step configures:
 * - Starting proficiency level (from persona)
 * - Target proficiency level
 * - Scaffolding configuration per level
 * - Milestone definitions
 *
 * Output to store:
 * - manifest.synthesization.capabilityProgression
 */
export function Step2_3_ICPF({ className }: Step2_3_ICPFProps) {
  const manifest = useMissionStore((state) => state.manifest);
  const updateSynthesizationData = useMissionStore((state) => state.updateSynthesizationData);

  // Get persona's prior knowledge level as starting point
  const personaPriorKnowledge = manifest?.encoding?.personas?.[0]?.priorKnowledge ?? 'novice';

  // Map prior knowledge to proficiency level
  const defaultStartingLevel = useMemo((): ProficiencyLevel => {
    switch (personaPriorKnowledge) {
      case 'novice':
        return 'aware';
      case 'intermediate':
        return 'apply';
      case 'advanced':
        return 'adapt';
      case 'expert':
        return 'integrate';
      default:
        return 'aware';
    }
  }, [personaPriorKnowledge]);

  // Local state
  const [startingLevel, setStartingLevel] = useState<ProficiencyLevel>(
    manifest?.synthesization?.capabilityProgression?.startingProficiency ?? defaultStartingLevel,
  );
  const [targetLevel, setTargetLevel] = useState<ProficiencyLevel>(
    manifest?.synthesization?.capabilityProgression?.targetProficiency ?? 'apply',
  );
  const [scaffolding, setScaffolding] = useState<ScaffoldingConfig[]>(
    manifest?.synthesization?.capabilityProgression?.scaffolding ?? [],
  );

  // Calculate metrics
  const levelGap = useMemo(
    () => getLevelGap(startingLevel, targetLevel),
    [startingLevel, targetLevel],
  );
  const neuroReadinessScore = useMemo(
    () => calculateNeuroReadinessScore(scaffolding, targetLevel),
    [scaffolding, targetLevel],
  );

  // Generate milestones
  const milestones = useMemo(() => {
    const startIndex = PROFICIENCY_LEVEL_CATALOG.findIndex((p) => p.value === startingLevel);
    const targetIndex = PROFICIENCY_LEVEL_CATALOG.findIndex((p) => p.value === targetLevel);

    const result: { level: ProficiencyLevel; milestone: string; celebration: string }[] = [];
    for (let i = startIndex; i <= targetIndex; i++) {
      const level = PROFICIENCY_LEVEL_CATALOG[i].value;
      const template = getMilestoneTemplate(level);
      result.push({ level, ...template });
    }
    return result;
  }, [startingLevel, targetLevel]);

  // Validation
  const isValid = useMemo(() => {
    return levelGap >= 0 && scaffolding.length > 0;
  }, [levelGap, scaffolding.length]);

  // Auto-generate scaffolding when levels change
  useEffect(() => {
    if (levelGap >= 0) {
      const newScaffolding = generateScaffoldingConfig(startingLevel, targetLevel);
      setScaffolding(newScaffolding);
    }
  }, [startingLevel, targetLevel, levelGap]);

  // Sync to store
  useEffect(() => {
    if (isValid) {
      const capabilityProgression: ICPFOutput = {
        targetProficiency: targetLevel,
        startingProficiency: startingLevel,
        scaffolding,
        domainBenchmarks: [],
        neuroReadinessScore,
        milestones,
      };

      updateSynthesizationData({ capabilityProgression });
    }
  }, [
    isValid,
    targetLevel,
    startingLevel,
    scaffolding,
    neuroReadinessScore,
    milestones,
    updateSynthesizationData,
  ]);

  // Handle scaffolding change
  const handleScaffoldingChange = useCallback((newScaffolding: ScaffoldingConfig[]) => {
    setScaffolding(newScaffolding);
  }, []);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Layers className="h-5 w-5 text-lxd-purple" />
          ICPF: Capability Progression Framework
        </h2>
        <p className="text-muted-foreground mt-1">
          Define the proficiency journey and configure scaffolding for each level
        </p>
      </div>

      {/* Validation Status */}
      {levelGap < 0 && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Target proficiency must be equal to or higher than starting proficiency.
          </AlertDescription>
        </Alert>
      )}

      {/* Proficiency Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProficiencySelector
          label="Starting Proficiency"
          description="Based on learner persona's prior knowledge"
          value={startingLevel}
          onChange={setStartingLevel}
          variant="start"
        />
        <ProficiencySelector
          label="Target Proficiency"
          description="Goal for this learning experience"
          value={targetLevel}
          onChange={setTargetLevel}
          minLevel={startingLevel}
          variant="target"
        />
      </div>

      {/* Journey Overview */}
      {levelGap >= 0 && (
        <div className="p-4 rounded-lg bg-lxd-dark-surface border border-lxd-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-lxd-cyan" />
              Learning Journey
            </h4>
            <Badge variant="outline">
              {levelGap === 0
                ? 'Reinforcement'
                : `${levelGap} level${levelGap > 1 ? 's' : ''} to progress`}
            </Badge>
          </div>

          {/* Journey Visualization */}
          <div className="flex items-center gap-2 overflow-x-auto py-2">
            {milestones.map((milestone, index) => {
              const levelOption = PROFICIENCY_LEVEL_CATALOG.find(
                (p) => p.value === milestone.level,
              );
              const isStart = index === 0;
              const isTarget = index === milestones.length - 1;

              return (
                <div key={milestone.level} className="flex items-center">
                  {/* Level Badge */}
                  <div
                    className={cn(
                      'flex flex-col items-center p-3 rounded-lg transition-all min-w-[100px]',
                      isStart && 'bg-lxd-cyan/10 border border-lxd-cyan/30',
                      isTarget && 'bg-lxd-purple/10 border border-lxd-purple/30',
                      !isStart && !isTarget && 'bg-lxd-dark-bg border border-lxd-dark-border',
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mb-1',
                        isStart && 'bg-lxd-cyan text-white',
                        isTarget && 'bg-lxd-purple text-white',
                        !isStart &&
                          !isTarget &&
                          'bg-lxd-dark-surface border border-lxd-dark-border',
                      )}
                    >
                      {levelOption?.level}
                    </div>
                    <span className={cn('text-xs font-medium', levelOption?.color)}>
                      {levelOption?.label}
                    </span>
                    {isStart && <span className="text-[10px] text-lxd-cyan">START</span>}
                    {isTarget && <span className="text-[10px] text-lxd-purple">TARGET</span>}
                  </div>

                  {/* Arrow */}
                  {index < milestones.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground mx-1 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scaffolding Configurator */}
      {levelGap >= 0 && (
        <div className="p-4 rounded-lg bg-lxd-dark-surface border border-lxd-dark-border">
          <ScaffoldingConfigurator scaffolding={scaffolding} onChange={handleScaffoldingChange} />
        </div>
      )}

      {/* Neuro Readiness Score */}
      {isValid && (
        <div className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Neuro-Readiness Score</h4>
            <div className="flex items-center gap-2">
              {neuroReadinessScore >= 70 && <Check className="h-4 w-4 text-green-500" />}
              <Badge
                variant={neuroReadinessScore >= 70 ? 'default' : 'outline'}
                className={cn(neuroReadinessScore >= 70 && 'bg-green-500/20 text-green-400')}
              >
                {neuroReadinessScore}%
              </Badge>
            </div>
          </div>

          {/* Score Bar */}
          <div className="h-3 bg-lxd-dark-border rounded-full overflow-hidden mb-3">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                neuroReadinessScore >= 70 && 'bg-green-500',
                neuroReadinessScore >= 40 && neuroReadinessScore < 70 && 'bg-yellow-500',
                neuroReadinessScore < 40 && 'bg-red-500',
              )}
              style={{ width: `${neuroReadinessScore}%` }}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            {neuroReadinessScore >= 70
              ? 'Scaffolding is well-configured for optimal cognitive support.'
              : neuroReadinessScore >= 40
                ? 'Consider adjusting hint visibility progression for smoother transitions.'
                : 'Review scaffolding configuration to ensure proper cognitive support.'}
          </p>
        </div>
      )}

      {/* Summary */}
      {isValid && (
        <div className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
          <h4 className="font-medium mb-3">Progression Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Starting Level</p>
              <p className="text-lg font-bold text-lxd-cyan capitalize">{startingLevel}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Target Level</p>
              <p className="text-lg font-bold text-lxd-purple capitalize">{targetLevel}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Levels to Progress</p>
              <p className="text-2xl font-bold text-foreground">{levelGap}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Neuro Score</p>
              <p
                className={cn(
                  'text-2xl font-bold',
                  neuroReadinessScore >= 70 ? 'text-green-500' : 'text-yellow-500',
                )}
              >
                {neuroReadinessScore}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Step2_3_ICPF;
