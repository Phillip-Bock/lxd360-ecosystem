'use client';

import { GripVertical, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ObjectiveDemand } from '@/schemas/inspire';
import { ObjectiveEditor } from './ObjectiveEditor';
import {
  COMPLEXITY_LEVEL_CATALOG,
  getBloomCategory,
  getLearningDomainOption,
  getVerbLabel,
} from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface ObjectiveListProps {
  objectives: ObjectiveDemand[];
  onObjectivesChange: (objectives: ObjectiveDemand[]) => void;
  className?: string;
}

/**
 * ObjectiveList - Displays and manages learning objectives
 */
export function ObjectiveList({ objectives, onObjectivesChange, className }: ObjectiveListProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<ObjectiveDemand | undefined>();

  const handleAdd = () => {
    setEditingObjective(undefined);
    setEditorOpen(true);
  };

  const handleEdit = (objective: ObjectiveDemand) => {
    setEditingObjective(objective);
    setEditorOpen(true);
  };

  const handleSave = (objective: ObjectiveDemand) => {
    if (editingObjective) {
      // Update existing
      onObjectivesChange(objectives.map((o) => (o.id === objective.id ? objective : o)));
    } else {
      // Add new
      onObjectivesChange([...objectives, objective]);
    }
  };

  const handleDelete = () => {
    if (editingObjective) {
      onObjectivesChange(objectives.filter((o) => o.id !== editingObjective.id));
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Learning Objectives</h4>
        <Button type="button" size="sm" variant="outline" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Add Objective
        </Button>
      </div>

      {/* Objectives List */}
      {objectives.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-lxd-dark-border rounded-lg">
          <p className="text-muted-foreground mb-4">No learning objectives defined yet.</p>
          <Button type="button" variant="outline" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Objective
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {objectives.map((objective, index) => {
            const complexityLevel = COMPLEXITY_LEVEL_CATALOG.find(
              (c) => c.value === objective.complexityLevel,
            );
            const verbCategory = objective.actionVerb
              ? getBloomCategory(objective.actionVerb)
              : undefined;

            return (
              <Card
                key={objective.id}
                className="bg-lxd-dark-surface border-lxd-dark-border hover:border-lxd-purple/50 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Drag Handle (visual only for now) */}
                    <div className="pt-1">
                      <GripVertical className="h-5 w-5 text-muted-foreground/50" />
                    </div>

                    {/* Order Number */}
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                        complexityLevel?.color,
                        'bg-lxd-dark-bg border border-lxd-dark-border',
                      )}
                    >
                      {index + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Objective Text */}
                      <p className="text-sm font-medium leading-relaxed">
                        {objective.objectiveText}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {/* Complexity Level */}
                        {complexityLevel && (
                          <Badge variant="outline" className={cn('text-xs', complexityLevel.color)}>
                            L{complexityLevel.level}: {complexityLevel.label}
                          </Badge>
                        )}

                        {/* Verb */}
                        {objective.actionVerb && (
                          <Badge
                            variant="outline"
                            className={cn('text-xs', verbCategory?.color ?? 'text-gray-400')}
                          >
                            {getVerbLabel(objective.actionVerb)}
                          </Badge>
                        )}

                        {/* Domains */}
                        {objective.domains.slice(0, 3).map((domain) => {
                          const domainOption = getLearningDomainOption(domain);
                          return (
                            <Badge
                              key={domain}
                              variant="secondary"
                              className={cn('text-xs', domainOption?.color)}
                            >
                              {domainOption?.label ?? domain}
                            </Badge>
                          );
                        })}
                        {objective.domains.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{objective.domains.length - 3}
                          </Badge>
                        )}

                        {/* Cognitive Load Weight */}
                        {objective.cognitiveLoadWeight > 1 && (
                          <Badge variant="outline" className="text-xs text-orange-400">
                            {objective.cognitiveLoadWeight}x load
                          </Badge>
                        )}
                      </div>

                      {/* Notes */}
                      {objective.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          {objective.notes}
                        </p>
                      )}
                    </div>

                    {/* Edit Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(objective)}
                      className="shrink-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Editor Dialog */}
      <ObjectiveEditor
        objective={editingObjective}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={handleSave}
        onDelete={editingObjective ? handleDelete : undefined}
      />
    </div>
  );
}
