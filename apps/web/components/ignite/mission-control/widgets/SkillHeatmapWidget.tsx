'use client';

import { Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HeatmapCell, HeatmapData } from '../types';
import { WidgetCard } from './WidgetCard';

export interface SkillHeatmapWidgetProps {
  /** Heatmap data from God View analytics */
  data: HeatmapData;
  /** Loading state */
  isLoading?: boolean;
  /** Callback when cell is clicked */
  onCellClick?: (cell: HeatmapCell) => void;
  /** Additional class names */
  className?: string;
}

const statusColors = {
  critical: { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400' },
  at_risk: { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400' },
  moderate: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/40', text: 'text-cyan-400' },
  strong: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400' },
};

function getStatus(value: number): HeatmapCell['status'] {
  if (value < 0.3) return 'critical';
  if (value < 0.5) return 'at_risk';
  if (value < 0.7) return 'moderate';
  return 'strong';
}

/**
 * SkillHeatmapWidget - Department × Skill gap visualization
 *
 * Powered by Phase 8C God View Analytics
 *
 * Features:
 * - Department vs skill matrix
 * - Color-coded competency levels
 * - Click to drill down
 * - Risk identification
 */
export function SkillHeatmapWidget({
  data,
  isLoading = false,
  onCellClick,
  className,
}: SkillHeatmapWidgetProps) {
  const { departments, skills, cells } = data;

  // Create a map for quick cell lookup
  const cellMap = new Map<string, HeatmapCell>();
  for (const cell of cells) {
    cellMap.set(`${cell.departmentId}-${cell.skillId}`, cell);
  }

  return (
    <WidgetCard
      title="Skill Gap Heatmap"
      subtitle="Department × Skill matrix (God View)"
      icon={<Grid3X3 className="h-4 w-4 text-emerald-400" />}
      accentColor="success"
      size="full"
      isLoading={isLoading}
      className={className}
    >
      {departments.length === 0 || skills.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No heatmap data available</p>
      ) : (
        <>
          {/* Grid */}
          <div
            className="grid gap-1 text-xs"
            style={{
              gridTemplateColumns: `100px repeat(${skills.length}, minmax(60px, 1fr))`,
            }}
          >
            {/* Header row */}
            <div />
            {skills.map((skill) => (
              <div
                key={skill}
                className="text-center text-muted-foreground font-medium py-1 truncate"
                title={skill}
              >
                {skill}
              </div>
            ))}

            {/* Data rows */}
            {departments.map((dept) => (
              <>
                <div
                  key={`label-${dept}`}
                  className="flex items-center text-muted-foreground font-medium truncate"
                  title={dept}
                >
                  {dept}
                </div>
                {skills.map((skill) => {
                  const cell = cellMap.get(`${dept}-${skill}`);
                  const value = cell?.value ?? 0;
                  const status = cell?.status ?? getStatus(value);
                  const colors = statusColors[status];

                  return (
                    <button
                      key={`${dept}-${skill}`}
                      type="button"
                      onClick={() => cell && onCellClick?.(cell)}
                      className={cn(
                        'p-2 rounded border transition-all',
                        'hover:scale-105 hover:z-10',
                        colors.bg,
                        colors.border,
                        'cursor-pointer',
                      )}
                      title={`${dept} - ${skill}: ${Math.round(value * 100)}%`}
                    >
                      <span className={cn('font-mono font-semibold', colors.text)}>
                        {Math.round(value * 100)}
                      </span>
                    </button>
                  );
                })}
              </>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4 pt-3 border-t border-border/50">
            {[
              { label: 'Critical', status: 'critical' as const },
              { label: 'At Risk', status: 'at_risk' as const },
              { label: 'Moderate', status: 'moderate' as const },
              { label: 'Strong', status: 'strong' as const },
            ].map(({ label, status }) => (
              <div key={status} className="flex items-center gap-1.5">
                <div
                  className={cn(
                    'h-3 w-3 rounded border',
                    statusColors[status].bg,
                    statusColors[status].border,
                  )}
                />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </WidgetCard>
  );
}
