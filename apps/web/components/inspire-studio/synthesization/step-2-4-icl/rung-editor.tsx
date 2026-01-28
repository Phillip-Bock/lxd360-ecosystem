'use client';

import { AlertTriangle, Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { BloomVerb, ComplexityLevel, LadderRung, ProficiencyLevel } from '@/schemas/inspire';
import {
  BLOCK_TYPE_CATALOG,
  getRecommendedBlockTypes,
  type RungFormData,
  validateSMARTObjective,
} from './types';

// Bloom categories for verb selection
const BLOOM_CATEGORIES = [
  {
    name: 'Remember',
    verbs: ['define', 'identify', 'list', 'name', 'recall', 'recognize', 'state'],
  },
  {
    name: 'Understand',
    verbs: ['classify', 'describe', 'discuss', 'explain', 'interpret', 'paraphrase', 'summarize'],
  },
  {
    name: 'Apply',
    verbs: ['apply', 'demonstrate', 'execute', 'implement', 'operate', 'solve', 'use'],
  },
  {
    name: 'Analyze',
    verbs: ['analyze', 'compare', 'contrast', 'differentiate', 'examine', 'organize', 'relate'],
  },
  {
    name: 'Evaluate',
    verbs: ['appraise', 'assess', 'critique', 'evaluate', 'judge', 'justify', 'validate'],
  },
  {
    name: 'Create',
    verbs: ['compose', 'construct', 'create', 'design', 'develop', 'formulate', 'produce'],
  },
];

const COMPLEXITY_OPTIONS: { value: ComplexityLevel; label: string }[] = [
  { value: 'foundation', label: 'L1: Foundation' },
  { value: 'application', label: 'L2: Application' },
  { value: 'adaptive', label: 'L3: Adaptive' },
  { value: 'strategic', label: 'L4: Strategic' },
  { value: 'mastery', label: 'L5: Mastery' },
  { value: 'innovation', label: 'L6: Innovation' },
];

const PROFICIENCY_OPTIONS: { value: ProficiencyLevel; label: string }[] = [
  { value: 'aware', label: 'Aware' },
  { value: 'comprehend', label: 'Comprehend' },
  { value: 'apply', label: 'Apply' },
  { value: 'adapt', label: 'Adapt' },
  { value: 'integrate', label: 'Integrate' },
  { value: 'elevate', label: 'Elevate' },
];

// ============================================================================
// COMPONENT
// ============================================================================

interface RungEditorProps {
  rung?: LadderRung;
  existingRungs: LadderRung[];
  order: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (rung: LadderRung) => void;
  onDelete?: () => void;
}

/**
 * RungEditor - Dialog for creating/editing ladder rungs
 */
export function RungEditor({
  rung,
  existingRungs,
  order,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: RungEditorProps) {
  const isEditing = !!rung;

  const [formData, setFormData] = useState<RungFormData>({
    objective: rung?.objective ?? '',
    actionVerb: rung?.actionVerb,
    complexityLevel: rung?.complexityLevel ?? 'foundation',
    proficiencyTarget: rung?.proficiencyTarget ?? 'aware',
    taskIds: rung?.taskIds ?? [],
    prerequisites: rung?.prerequisites ?? [],
    recommendedBlockTypes: rung?.recommendedBlockTypes ?? [],
    estimatedMinutes: rung?.estimatedMinutes,
  });

  // SMART validation
  const smartValidation = useMemo(
    () => validateSMARTObjective(formData.objective),
    [formData.objective],
  );

  // Recommended block types based on complexity
  const suggestedBlocks = useMemo(
    () => getRecommendedBlockTypes(formData.complexityLevel),
    [formData.complexityLevel],
  );

  const handleSave = useCallback(() => {
    if (!formData.objective.trim()) return;

    const saved: LadderRung = {
      id: rung?.id ?? uuidv4(),
      order: rung?.order ?? order,
      objective: formData.objective.trim(),
      actionVerb: formData.actionVerb,
      complexityLevel: formData.complexityLevel,
      proficiencyTarget: formData.proficiencyTarget,
      taskIds: formData.taskIds,
      prerequisites: formData.prerequisites,
      recommendedBlockTypes:
        formData.recommendedBlockTypes.length > 0
          ? formData.recommendedBlockTypes
          : suggestedBlocks,
      estimatedMinutes: formData.estimatedMinutes,
    };

    onSave(saved);
    onOpenChange(false);
  }, [formData, rung, order, suggestedBlocks, onSave, onOpenChange]);

  const toggleBlockType = (blockType: string) => {
    setFormData((prev) => ({
      ...prev,
      recommendedBlockTypes: prev.recommendedBlockTypes.includes(blockType)
        ? prev.recommendedBlockTypes.filter((b) => b !== blockType)
        : [...prev.recommendedBlockTypes, blockType],
    }));
  };

  const togglePrerequisite = (rungId: string) => {
    setFormData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.includes(rungId)
        ? prev.prerequisites.filter((p) => p !== rungId)
        : [...prev.prerequisites, rungId],
    }));
  };

  const isValid = formData.objective.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-lxd-dark-surface border-lxd-dark-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Pencil className="h-5 w-5 text-lxd-cyan" />
                Edit Rung #{rung.order}
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-lxd-purple" />
                Add Rung #{order}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Define a learning objective rung on the competency ladder.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Objective Text */}
          <div className="space-y-2">
            <Label htmlFor="objective">Learning Objective (SMART Goal)</Label>
            <Textarea
              id="objective"
              placeholder="e.g., Identify the five key safety protocols when handling hazardous materials..."
              value={formData.objective}
              onChange={(e) => setFormData((prev) => ({ ...prev, objective: e.target.value }))}
              className="bg-lxd-dark-bg border-lxd-dark-border min-h-[80px]"
            />
            {/* SMART Validation Feedback */}
            {formData.objective.length > 0 && (
              <div
                className={cn(
                  'p-2 rounded text-xs',
                  smartValidation.isValid
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-orange-500/10 text-orange-400',
                )}
              >
                {smartValidation.isValid ? (
                  <div className="flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    SMART objective criteria met
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Suggestions for improvement:
                    </div>
                    <ul className="list-disc list-inside pl-2">
                      {smartValidation.feedback.map((fb, i) => (
                        <li key={i}>{fb}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Verb */}
          <div className="space-y-2">
            <Label>Action Verb (Bloom&apos;s Taxonomy)</Label>
            <Select
              value={formData.actionVerb}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, actionVerb: v as BloomVerb }))
              }
            >
              <SelectTrigger className="bg-lxd-dark-bg border-lxd-dark-border">
                <SelectValue placeholder="Select an action verb..." />
              </SelectTrigger>
              <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border max-h-60">
                {BLOOM_CATEGORIES.map((cat) => (
                  <SelectGroup key={cat.name}>
                    <SelectLabel className="text-xs">{cat.name}</SelectLabel>
                    {cat.verbs.map((verb) => (
                      <SelectItem key={verb} value={verb} className="pl-6 capitalize">
                        {verb}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Complexity & Proficiency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ICDT Complexity Level</Label>
              <Select
                value={formData.complexityLevel}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, complexityLevel: v as ComplexityLevel }))
                }
              >
                <SelectTrigger className="bg-lxd-dark-bg border-lxd-dark-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
                  {COMPLEXITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>ICPF Proficiency Target</Label>
              <Select
                value={formData.proficiencyTarget}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, proficiencyTarget: v as ProficiencyLevel }))
                }
              >
                <SelectTrigger className="bg-lxd-dark-bg border-lxd-dark-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
                  {PROFICIENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Prerequisites */}
          {existingRungs.filter((r) => r.id !== rung?.id).length > 0 && (
            <div className="space-y-2">
              <Label>Prerequisites</Label>
              <div className="flex flex-wrap gap-2">
                {existingRungs
                  .filter((r) => r.id !== rung?.id)
                  .map((r) => {
                    const isSelected = formData.prerequisites.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => togglePrerequisite(r.id)}
                        className="focus:outline-none"
                      >
                        <Badge
                          variant={isSelected ? 'default' : 'outline'}
                          className={cn(
                            'cursor-pointer transition-all',
                            isSelected && 'bg-lxd-purple/20 text-lxd-purple border-lxd-purple',
                          )}
                        >
                          Rung #{r.order}
                        </Badge>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Recommended Block Types */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Recommended Block Types</Label>
              <span className="text-xs text-muted-foreground">
                Suggested based on complexity level
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {BLOCK_TYPE_CATALOG.map((block) => {
                const isSelected = formData.recommendedBlockTypes.includes(block.value);
                const isSuggested = suggestedBlocks.includes(block.value);

                return (
                  <button
                    key={block.value}
                    type="button"
                    onClick={() => toggleBlockType(block.value)}
                    className="focus:outline-none"
                  >
                    <Badge
                      variant={isSelected ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-all',
                        isSelected && 'bg-lxd-cyan/20 text-lxd-cyan border-lxd-cyan',
                        !isSelected && isSuggested && 'border-lxd-cyan/50',
                      )}
                    >
                      {block.label}
                      {isSuggested && !isSelected && (
                        <span className="ml-1 text-[10px] text-lxd-cyan">★</span>
                      )}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Estimated Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Estimated Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min={0}
              placeholder="e.g., 15"
              value={formData.estimatedMinutes ?? ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  estimatedMinutes: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="bg-lxd-dark-bg border-lxd-dark-border w-32"
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
              {isEditing ? 'Save Changes' : 'Add Rung'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
