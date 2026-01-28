'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ObjectiveDemand } from '@/schemas/inspire';
import { ComplexitySelector } from './complexity-selector';
import { DomainSelector } from './domain-selector';
import type { ObjectiveFormData } from './types';
import { VerbSelector } from './verb-selector';

// ============================================================================
// COMPONENT
// ============================================================================

interface ObjectiveEditorProps {
  objective?: ObjectiveDemand;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (objective: ObjectiveDemand) => void;
  onDelete?: () => void;
}

/**
 * ObjectiveEditor - Dialog for creating/editing learning objectives
 */
export function ObjectiveEditor({
  objective,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: ObjectiveEditorProps) {
  const isEditing = !!objective;

  const [formData, setFormData] = useState<ObjectiveFormData>({
    objectiveText: objective?.objectiveText ?? '',
    complexityLevel: objective?.complexityLevel ?? 'foundation',
    domains: objective?.domains ?? [],
    actionVerb: objective?.actionVerb,
    cognitiveLoadWeight: objective?.cognitiveLoadWeight ?? 1,
    notes: objective?.notes,
  });

  const handleSave = useCallback(() => {
    if (!formData.objectiveText.trim()) return;

    const saved: ObjectiveDemand = {
      id: objective?.id ?? uuidv4(),
      objectiveText: formData.objectiveText.trim(),
      complexityLevel: formData.complexityLevel,
      domains: formData.domains,
      actionVerb: formData.actionVerb,
      cognitiveLoadWeight: formData.cognitiveLoadWeight,
      notes: formData.notes?.trim() || undefined,
    };

    onSave(saved);
    onOpenChange(false);
  }, [formData, objective?.id, onSave, onOpenChange]);

  const isValid = formData.objectiveText.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-lxd-dark-surface border-lxd-dark-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Pencil className="h-5 w-5 text-lxd-cyan" />
                Edit Learning Objective
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-lxd-purple" />
                Add Learning Objective
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Define a learning objective with its cognitive demand characteristics.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Objective Text */}
          <div className="space-y-2">
            <Label htmlFor="objectiveText">Learning Objective</Label>
            <Textarea
              id="objectiveText"
              placeholder="Enter the learning objective (e.g., 'Learners will be able to identify the five key components of...')"
              value={formData.objectiveText}
              onChange={(e) => setFormData((prev) => ({ ...prev, objectiveText: e.target.value }))}
              className="bg-lxd-dark-bg border-lxd-dark-border min-h-[80px]"
            />
          </div>

          {/* Verb Selector */}
          <VerbSelector
            value={formData.actionVerb}
            onChange={(verb) => setFormData((prev) => ({ ...prev, actionVerb: verb }))}
          />

          {/* Complexity Level */}
          <ComplexitySelector
            value={formData.complexityLevel}
            onChange={(level) => setFormData((prev) => ({ ...prev, complexityLevel: level }))}
          />

          {/* Learning Domains */}
          <DomainSelector
            value={formData.domains}
            onChange={(domains) => setFormData((prev) => ({ ...prev, domains }))}
          />

          {/* Cognitive Load Weight */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Cognitive Load Weight</Label>
              <span className="text-sm font-medium text-lxd-cyan">
                {formData.cognitiveLoadWeight}x
              </span>
            </div>
            <Slider
              value={[formData.cognitiveLoadWeight]}
              onValueChange={([v]) => setFormData((prev) => ({ ...prev, cognitiveLoadWeight: v }))}
              min={1}
              max={3}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Standard (1x)</span>
              <span>Heavy (2x)</span>
              <span>Intensive (3x)</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Additional notes about this objective..."
              value={formData.notes ?? ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value || undefined }))
              }
              className="bg-lxd-dark-bg border-lxd-dark-border"
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          {isEditing && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={() => {
                onDelete();
                onOpenChange(false);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-lxd-dark-border"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!isValid}
              className={cn(!isValid && 'opacity-50 cursor-not-allowed')}
            >
              {isEditing ? 'Save Changes' : 'Add Objective'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
