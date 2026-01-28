'use client';

import { Brain, Check, Info, Target } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ICDTOutput, ObjectiveDemand } from '@/schemas/inspire';
import { useMissionStore } from '@/store/inspire';
import { CognitiveLoadHeatmap } from './cognitive-load-heatmap';
import { ObjectiveList } from './objective-list';
import {
  calculateAverageComplexity,
  calculateCognitiveLoadDistribution,
  getDomainCoverage,
  LEARNING_DOMAIN_CATALOG,
} from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface Step2_2_ICDTProps {
  className?: string;
}

/**
 * Step2_2_ICDT - INSPIRE Cognitive Demand Taxonomy
 *
 * This step captures:
 * - Learning objectives
 * - Complexity levels (6-tier ICDT scale)
 * - Learning domains (Bloom's + extended)
 * - Action verbs (Bloom's Taxonomy)
 * - Cognitive load weighting
 *
 * Output to store:
 * - manifest.synthesization.cognitiveDemand
 */
export function Step2_2_ICDT({ className }: Step2_2_ICDTProps) {
  const manifest = useMissionStore((state) => state.manifest);
  const updateSynthesizationData = useMissionStore((state) => state.updateSynthesizationData);

  // Local state
  const [objectives, setObjectives] = useState<ObjectiveDemand[]>(
    manifest?.synthesization?.cognitiveDemand?.objectives ?? [],
  );

  // Validation
  const isValid = useMemo(() => objectives.length >= 1, [objectives]);

  // Calculate metrics
  const cognitiveLoadDistribution = useMemo(
    () => calculateCognitiveLoadDistribution(objectives),
    [objectives],
  );
  const domainCoverage = useMemo(() => getDomainCoverage(objectives), [objectives]);
  const averageComplexity = useMemo(() => calculateAverageComplexity(objectives), [objectives]);

  // Sync to store
  useEffect(() => {
    if (isValid) {
      const cognitiveDemand: ICDTOutput = {
        objectives,
        cognitiveLoadDistribution,
        domainCoverage,
        averageComplexity,
      };

      updateSynthesizationData({ cognitiveDemand });
    }
  }, [
    isValid,
    objectives,
    cognitiveLoadDistribution,
    domainCoverage,
    averageComplexity,
    updateSynthesizationData,
  ]);

  // Handle objectives change
  const handleObjectivesChange = useCallback((newObjectives: ObjectiveDemand[]) => {
    setObjectives(newObjectives);
  }, []);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-lxd-purple" />
          ICDT: Cognitive Demand Taxonomy
        </h2>
        <p className="text-muted-foreground mt-1">
          Define learning objectives and tag their cognitive demand characteristics
        </p>
      </div>

      {/* Validation Status */}
      {!isValid && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Add at least one learning objective to proceed. Objectives define what learners will be
            able to do after training.
          </AlertDescription>
        </Alert>
      )}

      {/* Objective List */}
      <div className="p-4 rounded-lg bg-lxd-dark-surface border border-lxd-dark-border">
        <ObjectiveList objectives={objectives} onObjectivesChange={handleObjectivesChange} />
      </div>

      {/* Cognitive Load Heatmap */}
      {objectives.length > 0 && (
        <div className="p-4 rounded-lg bg-lxd-dark-surface border border-lxd-dark-border">
          <CognitiveLoadHeatmap
            distribution={cognitiveLoadDistribution}
            totalObjectives={objectives.length}
          />
        </div>
      )}

      {/* Domain Coverage */}
      {objectives.length > 0 && (
        <div className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-lxd-cyan" />
              Domain Coverage
            </h4>
            <Badge variant="outline">
              {domainCoverage.length} of {LEARNING_DOMAIN_CATALOG.length} domains
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {LEARNING_DOMAIN_CATALOG.map((domain) => {
              const isCovered = domainCoverage.includes(domain.value);
              return (
                <Badge
                  key={domain.value}
                  variant={isCovered ? 'default' : 'outline'}
                  className={cn(
                    'transition-all',
                    isCovered
                      ? 'bg-green-500/20 text-green-400 border-green-500/50'
                      : 'text-muted-foreground opacity-50',
                  )}
                >
                  {isCovered && <Check className="h-3 w-3 mr-1" />}
                  {domain.label}
                </Badge>
              );
            })}
          </div>
          {domainCoverage.length < 3 && (
            <p className="text-xs text-muted-foreground mt-3">
              Consider covering at least 3 learning domains for comprehensive skill development.
            </p>
          )}
        </div>
      )}

      {/* Summary */}
      {isValid && (
        <div className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
          <h4 className="font-medium mb-3">Cognitive Demand Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Objectives</p>
              <p className="text-2xl font-bold text-lxd-purple">{objectives.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Complexity</p>
              <p className="text-2xl font-bold text-lxd-cyan">{averageComplexity.toFixed(1)}/6</p>
            </div>
            <div>
              <p className="text-muted-foreground">Domains Covered</p>
              <p className="text-2xl font-bold text-green-500">{domainCoverage.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Highest Level</p>
              <p className="text-2xl font-bold text-orange-500">{getHighestLevel(objectives)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to get highest complexity level
function getHighestLevel(objectives: ObjectiveDemand[]): string {
  const levelOrder = [
    'foundation',
    'application',
    'adaptive',
    'strategic',
    'mastery',
    'innovation',
  ];
  let highestIndex = -1;

  for (const obj of objectives) {
    const index = levelOrder.indexOf(obj.complexityLevel);
    if (index > highestIndex) {
      highestIndex = index;
    }
  }

  if (highestIndex === -1) return 'N/A';
  return levelOrder[highestIndex].charAt(0).toUpperCase() + levelOrder[highestIndex].slice(1, 3);
}

export default Step2_2_ICDT;
