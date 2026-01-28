'use client';

import { cn } from '@/lib/utils';
import type { ComplexityLevel } from '@/schemas/inspire';
import { COMPLEXITY_LEVEL_CATALOG } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface CognitiveLoadHeatmapProps {
  distribution: Record<ComplexityLevel, number>;
  totalObjectives: number;
  className?: string;
}

/**
 * CognitiveLoadHeatmap - Visual heatmap of cognitive load distribution
 * Shows how objectives are distributed across complexity levels
 */
export function CognitiveLoadHeatmap({
  distribution,
  totalObjectives,
  className,
}: CognitiveLoadHeatmapProps) {
  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <div className={cn('space-y-4', className)}>
      <h4 className="font-medium">Cognitive Load Distribution</h4>

      <div className="grid grid-cols-6 gap-2">
        {COMPLEXITY_LEVEL_CATALOG.map((level) => {
          const count = distribution[level.value] ?? 0;
          const percentage = totalObjectives > 0 ? (count / totalObjectives) * 100 : 0;
          const intensity = count / maxCount;

          return (
            <div key={level.value} className="space-y-2">
              {/* Heatmap Cell */}
              <div
                className={cn(
                  'aspect-square rounded-lg flex items-center justify-center text-lg font-bold transition-all',
                  'border border-lxd-dark-border',
                  count === 0 && 'bg-lxd-dark-bg text-muted-foreground/30',
                )}
                style={{
                  backgroundColor:
                    count > 0
                      ? `rgba(139, 92, 246, ${0.2 + intensity * 0.6})` // lxd-purple with variable opacity
                      : undefined,
                  color: count > 0 ? 'white' : undefined,
                }}
              >
                {count}
              </div>

              {/* Label */}
              <div className="text-center">
                <p className={cn('text-xs font-medium', level.color)}>{level.label}</p>
                <p className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Bar */}
      {totalObjectives > 0 && (
        <div className="space-y-2">
          <div className="h-4 rounded-full bg-lxd-dark-bg overflow-hidden flex">
            {COMPLEXITY_LEVEL_CATALOG.map((level) => {
              const count = distribution[level.value] ?? 0;
              const percentage = (count / totalObjectives) * 100;

              if (percentage === 0) return null;

              return (
                <div
                  key={level.value}
                  className={cn('h-full transition-all', getBarColor(level.value))}
                  style={{ width: `${percentage}%` }}
                  title={`${level.label}: ${count} (${percentage.toFixed(0)}%)`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Foundation</span>
            <span>Innovation</span>
          </div>
        </div>
      )}
    </div>
  );
}

function getBarColor(level: ComplexityLevel): string {
  switch (level) {
    case 'foundation':
      return 'bg-gray-500';
    case 'application':
      return 'bg-blue-500';
    case 'adaptive':
      return 'bg-cyan-500';
    case 'strategic':
      return 'bg-purple-500';
    case 'mastery':
      return 'bg-orange-500';
    case 'innovation':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}
