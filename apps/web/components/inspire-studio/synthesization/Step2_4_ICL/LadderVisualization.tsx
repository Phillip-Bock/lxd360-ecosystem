'use client';

import { ArrowUp, Clock, GripVertical, Pencil, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LadderRung } from '@/schemas/inspire';
import { getComplexityColor, getProficiencyColor, sortRungsByOrder } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface LadderVisualizationProps {
  rungs: LadderRung[];
  onEdit: (rung: LadderRung) => void;
  onAdd: () => void;
  className?: string;
}

/**
 * LadderVisualization - Visual representation of the competency ladder
 * Shows rungs as connected steps from bottom to top
 */
export function LadderVisualization({ rungs, onEdit, onAdd, className }: LadderVisualizationProps) {
  const sortedRungs = sortRungsByOrder(rungs);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Competency Ladder</h4>
        <Button type="button" size="sm" variant="outline" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Add Rung
        </Button>
      </div>

      {/* Ladder Visualization */}
      {sortedRungs.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-lxd-dark-border rounded-lg">
          <p className="text-muted-foreground mb-4">No rungs defined yet.</p>
          <Button type="button" variant="outline" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Rung
          </Button>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-lxd-dark-border" />

          {/* Rungs (reversed to show bottom-up) */}
          <div className="space-y-4 flex flex-col-reverse">
            {sortedRungs.map((rung, index) => {
              const isBottom = index === 0;
              const isTop = index === sortedRungs.length - 1;

              return (
                <div key={rung.id} className="relative">
                  {/* Connection Point */}
                  <div
                    className={cn(
                      'absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2',
                      'flex items-center justify-center z-10',
                      isTop
                        ? 'bg-lxd-purple border-lxd-purple'
                        : isBottom
                          ? 'bg-lxd-cyan border-lxd-cyan'
                          : 'bg-lxd-dark-bg border-lxd-dark-border',
                    )}
                  >
                    {isTop && <ArrowUp className="h-3 w-3 text-white" />}
                    {!isTop && <span className="text-[10px] font-bold">{rung.order}</span>}
                  </div>

                  {/* Rung Card */}
                  <Card
                    className={cn(
                      'ml-12 bg-lxd-dark-surface border-lxd-dark-border',
                      'hover:border-lxd-purple/50 transition-colors cursor-pointer',
                    )}
                    onClick={() => onEdit(rung)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Drag Handle */}
                        <div className="pt-1 cursor-grab opacity-50 hover:opacity-100">
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Objective */}
                          <p className="text-sm font-medium leading-relaxed line-clamp-2">
                            {rung.objective}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {/* Complexity */}
                            <Badge
                              variant="outline"
                              className={cn('text-xs', getComplexityColor(rung.complexityLevel))}
                            >
                              {rung.complexityLevel.charAt(0).toUpperCase() +
                                rung.complexityLevel.slice(1)}
                            </Badge>

                            {/* Proficiency */}
                            <Badge
                              variant="outline"
                              className={cn('text-xs', getProficiencyColor(rung.proficiencyTarget))}
                            >
                              → {rung.proficiencyTarget}
                            </Badge>

                            {/* Action Verb */}
                            {rung.actionVerb && (
                              <Badge variant="secondary" className="text-xs capitalize">
                                {rung.actionVerb}
                              </Badge>
                            )}

                            {/* Duration */}
                            {rung.estimatedMinutes && (
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {rung.estimatedMinutes}m
                              </Badge>
                            )}

                            {/* Prerequisites Count */}
                            {rung.prerequisites.length > 0 && (
                              <Badge variant="outline" className="text-xs text-orange-400">
                                {rung.prerequisites.length} prereq
                              </Badge>
                            )}
                          </div>

                          {/* Block Types */}
                          {rung.recommendedBlockTypes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {rung.recommendedBlockTypes.slice(0, 4).map((block) => (
                                <span
                                  key={block}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-lxd-dark-bg text-muted-foreground"
                                >
                                  {block}
                                </span>
                              ))}
                              {rung.recommendedBlockTypes.length > 4 && (
                                <span className="text-[10px] text-muted-foreground">
                                  +{rung.recommendedBlockTypes.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Edit Button */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(rung);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Labels */}
          <div className="flex justify-between text-xs text-muted-foreground mt-2 ml-12">
            <span>Bottom (Start)</span>
            <span>Top (Goal)</span>
          </div>
        </div>
      )}
    </div>
  );
}
