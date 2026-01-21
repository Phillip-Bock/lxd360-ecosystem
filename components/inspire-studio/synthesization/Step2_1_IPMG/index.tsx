'use client';

import { Grid3X3, Info } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { IPMGOutput, JobTask } from '@/schemas/inspire';
import { useMissionStore } from '@/store/inspire';
import { TaskGrid } from './TaskGrid';
import { CRITICALITY_OPTIONS, calculatePriorityScore } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface Step2_1_IPMGProps {
  className?: string;
}

/**
 * Step2_1_IPMG - INSPIRE Performance Mapping Grid
 *
 * This step captures:
 * - Job tasks from task analysis
 * - Task frequency and criticality
 * - Task hierarchy (parent/child)
 * - Performance criteria
 *
 * Output to store:
 * - manifest.synthesization.performanceMapping
 */
export function Step2_1_IPMG({ className }: Step2_1_IPMGProps) {
  const manifest = useMissionStore((state) => state.manifest);
  const updateSynthesizationData = useMissionStore((state) => state.updateSynthesizationData);

  // Local state
  const [tasks, setTasks] = useState<JobTask[]>(
    manifest?.synthesization?.performanceMapping?.tasks ?? [],
  );

  // Derive industry from encoding phase
  const industry = manifest?.encoding?.industryAnalysis?.industry;

  // Validation
  const isValid = useMemo(() => tasks.length >= 1, [tasks]);

  // Calculate stats
  const stats = useMemo(() => {
    const critical = tasks.filter((t) => t.criticality === 'both').length;
    const highStakes = tasks.filter((t) => t.criticality === 'high-stakes').length;
    const highFreq = tasks.filter((t) => t.criticality === 'high-frequency').length;
    const avgPriority =
      tasks.length > 0
        ? Math.round(tasks.reduce((sum, t) => sum + calculatePriorityScore(t), 0) / tasks.length)
        : 0;

    return { critical, highStakes, highFreq, avgPriority };
  }, [tasks]);

  // Sync to store
  useEffect(() => {
    if (isValid) {
      const performanceMapping: IPMGOutput = {
        tasks,
        taskCompetencyLinks: [],
        performanceCriteria: [],
        fallbackMatrixUsed: false,
        industryBaseline: industry,
      };

      updateSynthesizationData({ performanceMapping });
    }
  }, [isValid, tasks, industry, updateSynthesizationData]);

  // Handle tasks change
  const handleTasksChange = useCallback((newTasks: JobTask[]) => {
    setTasks(newTasks);
  }, []);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-lxd-purple" />
          IPMG: Performance Mapping Grid
        </h2>
        <p className="text-muted-foreground mt-1">
          Map job tasks to identify training priorities based on frequency and criticality
        </p>
      </div>

      {/* Validation Status */}
      {!isValid && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Add at least one job task to proceed. Tasks help INSPIRE identify what skills need
            training.
          </AlertDescription>
        </Alert>
      )}

      {/* Task Grid */}
      <TaskGrid tasks={tasks} onTasksChange={handleTasksChange} />

      {/* Priority Matrix Legend */}
      <div className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
        <h4 className="font-medium mb-3">Priority Matrix</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Criticality Levels</p>
            <div className="space-y-1">
              {CRITICALITY_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className={cn('text-xs', opt.color)}>
                    {opt.label}
                  </Badge>
                  <span className="text-muted-foreground text-xs">{opt.description}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Priority Score</p>
            <p className="text-sm text-muted-foreground">
              Score = Frequency × Criticality. Higher scores indicate tasks that should be
              prioritized in training.
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                20+
              </span>
              <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                12+
              </span>
              <span className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold">
                6+
              </span>
              <span className="w-6 h-6 rounded-full bg-gray-500/20 text-gray-400 flex items-center justify-center font-bold">
                &lt;6
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {tasks.length > 0 && (
        <div className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
          <h4 className="font-medium mb-3">Task Analysis Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold text-lxd-purple">{tasks.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Critical (Both)</p>
              <p className="text-2xl font-bold text-red-500">{stats.critical}</p>
            </div>
            <div>
              <p className="text-muted-foreground">High Stakes</p>
              <p className="text-2xl font-bold text-orange-500">{stats.highStakes}</p>
            </div>
            <div>
              <p className="text-muted-foreground">High Frequency</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.highFreq}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Priority</p>
              <p className="text-2xl font-bold text-lxd-cyan">{stats.avgPriority}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Step2_1_IPMG;
