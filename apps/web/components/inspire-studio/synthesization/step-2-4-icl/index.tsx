'use client';

import { AlertTriangle, Check, Clock, Info, Layers3, Target } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ICLOutput, LadderRung } from '@/schemas/inspire';
import { useMissionStore } from '@/store/inspire';
import { LadderVisualization } from './ladder-visualization';
import { RungEditor } from './rung-editor';
import { buildPrerequisiteMap, calculateTotalDuration, getNextOrder, identifyGaps } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface Step2_4_ICLProps {
  className?: string;
}

/**
 * Step2_4_ICL - INSPIRE Competency Ladder
 *
 * This step captures:
 * - Ladder rungs (learning objectives in sequence)
 * - Prerequisites between rungs
 * - Block type recommendations
 * - Duration estimates
 *
 * Output to store:
 * - manifest.synthesization.competencyLadder
 */
export function Step2_4_ICL({ className }: Step2_4_ICLProps) {
  const manifest = useMissionStore((state) => state.manifest);
  const updateSynthesizationData = useMissionStore((state) => state.updateSynthesizationData);

  // Local state
  const [rungs, setRungs] = useState<LadderRung[]>(
    manifest?.synthesization?.competencyLadder?.rungs ?? [],
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRung, setEditingRung] = useState<LadderRung | undefined>();

  // Validation
  const isValid = useMemo(() => rungs.length >= 1, [rungs]);

  // Calculate metrics
  const totalDuration = useMemo(() => calculateTotalDuration(rungs), [rungs]);
  const prerequisiteMap = useMemo(() => buildPrerequisiteMap(rungs), [rungs]);
  const gaps = useMemo(() => identifyGaps(rungs), [rungs]);

  // Sync to store
  useEffect(() => {
    if (isValid) {
      const competencyLadder: ICLOutput = {
        rungs,
        prerequisiteMap,
        identifiedGaps: gaps,
        smartOptimized: true,
        totalEstimatedMinutes: totalDuration > 0 ? totalDuration : undefined,
      };

      updateSynthesizationData({ competencyLadder });
    }
  }, [isValid, rungs, prerequisiteMap, gaps, totalDuration, updateSynthesizationData]);

  // Handlers
  const handleAdd = useCallback(() => {
    setEditingRung(undefined);
    setEditorOpen(true);
  }, []);

  const handleEdit = useCallback((rung: LadderRung) => {
    setEditingRung(rung);
    setEditorOpen(true);
  }, []);

  const handleSave = useCallback((rung: LadderRung) => {
    setRungs((prev) => {
      const exists = prev.find((r) => r.id === rung.id);
      if (exists) {
        return prev.map((r) => (r.id === rung.id ? rung : r));
      }
      return [...prev, rung];
    });
  }, []);

  const handleDelete = useCallback(() => {
    if (editingRung) {
      setRungs((prev) => prev.filter((r) => r.id !== editingRung.id));
    }
  }, [editingRung]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Layers3 className="h-5 w-5 text-lxd-purple" />
          ICL: Competency Ladder
        </h2>
        <p className="text-muted-foreground mt-1">
          Build the learning sequence by defining objective rungs from foundation to mastery
        </p>
      </div>

      {/* Validation Status */}
      {!isValid && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Add at least one rung to build your competency ladder. Each rung represents a learning
            milestone.
          </AlertDescription>
        </Alert>
      )}

      {/* Gaps Warning */}
      {gaps.length > 0 && (
        <Alert variant="destructive" className="bg-orange-500/10 border-orange-500/50">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-300">
            {gaps.length} prerequisite gap{gaps.length > 1 ? 's' : ''} detected. Some rungs
            reference prerequisites that don&apos;t exist.
          </AlertDescription>
        </Alert>
      )}

      {/* Ladder Visualization */}
      <div className="p-4 rounded-lg bg-lxd-dark-surface border border-lxd-dark-border">
        <LadderVisualization rungs={rungs} onEdit={handleEdit} onAdd={handleAdd} />
      </div>

      {/* Quick Stats */}
      {rungs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Layers3 className="h-4 w-4" />
              <span className="text-xs">Total Rungs</span>
            </div>
            <p className="text-2xl font-bold text-lxd-purple">{rungs.length}</p>
          </div>

          <div className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Est. Duration</span>
            </div>
            <p className="text-2xl font-bold text-lxd-cyan">
              {totalDuration > 0 ? `${totalDuration}m` : '—'}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              <span className="text-xs">Prerequisites</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {Object.values(prerequisiteMap).flat().length}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              {gaps.length === 0 ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
              <span className="text-xs">Gaps</span>
            </div>
            <p
              className={cn(
                'text-2xl font-bold',
                gaps.length === 0 ? 'text-green-500' : 'text-orange-500',
              )}
            >
              {gaps.length}
            </p>
          </div>
        </div>
      )}

      {/* Complexity Distribution */}
      {rungs.length > 0 && (
        <div className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
          <h4 className="font-medium mb-3">Complexity Distribution</h4>
          <div className="flex flex-wrap gap-2">
            {['foundation', 'application', 'adaptive', 'strategic', 'mastery', 'innovation'].map(
              (level) => {
                const count = rungs.filter((r) => r.complexityLevel === level).length;
                return (
                  <Badge
                    key={level}
                    variant={count > 0 ? 'default' : 'outline'}
                    className={cn(
                      count > 0
                        ? 'bg-lxd-purple/20 text-lxd-purple'
                        : 'text-muted-foreground opacity-50',
                    )}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}: {count}
                  </Badge>
                );
              },
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      {isValid && (
        <div className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
          <h4 className="font-medium mb-3">Ladder Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Rungs</p>
              <p className="text-lg font-bold text-lxd-purple">{rungs.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Duration</p>
              <p className="text-lg font-bold text-lxd-cyan">
                {totalDuration > 0 ? `${totalDuration} min` : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Prerequisites</p>
              <p className="text-lg font-bold text-foreground">
                {Object.values(prerequisiteMap).flat().length} links
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p
                className={cn(
                  'text-lg font-bold',
                  gaps.length === 0 ? 'text-green-500' : 'text-orange-500',
                )}
              >
                {gaps.length === 0 ? 'Valid' : `${gaps.length} gaps`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rung Editor */}
      <RungEditor
        rung={editingRung}
        existingRungs={rungs}
        order={getNextOrder(rungs)}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={handleSave}
        onDelete={editingRung ? handleDelete : undefined}
      />
    </div>
  );
}

export default Step2_4_ICL;
