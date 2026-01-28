'use client';

import { Plus, Trash2, X } from 'lucide-react';
import type {
  ComparisonOperator,
  Condition,
  ConditionGroup,
  Variable,
  VariableValue,
} from '@/components/inspire-studio/branching/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// =============================================================================
// Condition Builder Component
// =============================================================================

interface ConditionBuilderProps {
  condition?: Condition;
  conditionGroup?: ConditionGroup;
  variables: Variable[];
  onChange: (condition?: Condition, conditionGroup?: ConditionGroup) => void;
  readOnly?: boolean;
  className?: string;
}

export function ConditionBuilder({
  condition,
  conditionGroup,
  variables,
  onChange,
  readOnly = false,
  className,
}: ConditionBuilderProps) {
  const hasAnyCondition = condition || conditionGroup;

  // Handle single condition change
  const handleConditionChange = (updates: Partial<Condition>) => {
    if (!condition) {
      // Create new condition
      onChange(
        {
          variableKey: updates.variableKey ?? '',
          operator: updates.operator ?? 'equals',
          targetValue: updates.targetValue ?? '',
        },
        undefined,
      );
    } else {
      onChange({ ...condition, ...updates }, undefined);
    }
  };

  // Handle group condition change
  const handleGroupChange = (index: number, updates: Partial<Condition>) => {
    if (!conditionGroup) return;
    const newConditions = [...conditionGroup.conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    onChange(undefined, { ...conditionGroup, conditions: newConditions });
  };

  // Add condition to group
  const handleAddToGroup = () => {
    if (!conditionGroup) {
      // Convert single condition to group
      const newGroup: ConditionGroup = {
        logic: 'and',
        conditions: condition
          ? [condition, { variableKey: '', operator: 'equals', targetValue: '' }]
          : [{ variableKey: '', operator: 'equals', targetValue: '' }],
      };
      onChange(undefined, newGroup);
    } else {
      onChange(undefined, {
        ...conditionGroup,
        conditions: [
          ...conditionGroup.conditions,
          { variableKey: '', operator: 'equals', targetValue: '' },
        ],
      });
    }
  };

  // Remove condition from group
  const handleRemoveFromGroup = (index: number) => {
    if (!conditionGroup) return;
    const newConditions = conditionGroup.conditions.filter((_, i) => i !== index);
    if (newConditions.length <= 1) {
      // Convert back to single condition
      onChange(newConditions[0], undefined);
    } else {
      onChange(undefined, { ...conditionGroup, conditions: newConditions });
    }
  };

  // Clear all conditions
  const handleClear = () => {
    onChange(undefined, undefined);
  };

  // Toggle group logic
  const handleLogicToggle = (logic: 'and' | 'or') => {
    if (!conditionGroup) return;
    onChange(undefined, { ...conditionGroup, logic });
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label className="text-xs text-white/60">Condition</Label>
        {hasAnyCondition && !readOnly && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleClear}
            className="h-6 px-2 text-xs text-red-400 hover:text-red-300"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* No Condition State */}
      {!hasAnyCondition && (
        <div className="text-center py-4 bg-lxd-dark-surface rounded-lg border border-dashed border-lxd-dark-border">
          <p className="text-xs text-white/40 mb-2">No condition set</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleConditionChange({})}
            disabled={readOnly}
            className="h-7 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Condition
          </Button>
        </div>
      )}

      {/* Single Condition */}
      {condition && !conditionGroup && (
        <ConditionRow
          condition={condition}
          variables={variables}
          onChange={handleConditionChange}
          readOnly={readOnly}
        />
      )}

      {/* Condition Group */}
      {conditionGroup && (
        <div className="space-y-2">
          {/* Logic Toggle */}
          <div className="flex items-center gap-2 p-2 bg-lxd-dark-surface rounded-lg">
            <span className="text-xs text-white/60">Match:</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleLogicToggle('and')}
                disabled={readOnly}
                className={cn(
                  'px-2 py-1 text-xs rounded transition-colors',
                  conditionGroup.logic === 'and'
                    ? 'bg-lxd-cyan text-white'
                    : 'bg-lxd-dark-bg text-white/60 hover:text-white',
                )}
              >
                ALL (AND)
              </button>
              <button
                type="button"
                onClick={() => handleLogicToggle('or')}
                disabled={readOnly}
                className={cn(
                  'px-2 py-1 text-xs rounded transition-colors',
                  conditionGroup.logic === 'or'
                    ? 'bg-lxd-cyan text-white'
                    : 'bg-lxd-dark-bg text-white/60 hover:text-white',
                )}
              >
                ANY (OR)
              </button>
            </div>
          </div>

          {/* Conditions */}
          {conditionGroup.conditions.map((cond, index) => (
            <div key={index} className="relative">
              <ConditionRow
                condition={cond}
                variables={variables}
                onChange={(updates) => handleGroupChange(index, updates)}
                readOnly={readOnly}
              />
              {!readOnly && conditionGroup.conditions.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveFromGroup(index)}
                  className="absolute -right-2 -top-2 p-1 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add More Button */}
      {hasAnyCondition && !readOnly && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddToGroup}
          className="w-full h-7 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add {conditionGroup ? 'Another' : 'AND/OR'} Condition
        </Button>
      )}
    </div>
  );
}

// =============================================================================
// Condition Row Component
// =============================================================================

interface ConditionRowProps {
  condition: Condition;
  variables: Variable[];
  onChange: (updates: Partial<Condition>) => void;
  readOnly?: boolean;
}

function ConditionRow({ condition, variables, onChange, readOnly }: ConditionRowProps) {
  const selectedVariable = variables.find((v) => v.key === condition.variableKey);

  const handleValueChange = (value: string) => {
    let parsed: VariableValue;
    if (selectedVariable?.type === 'boolean') {
      parsed = value === 'true';
    } else if (selectedVariable?.type === 'number') {
      parsed = Number(value) || 0;
    } else {
      parsed = value;
    }
    onChange({ targetValue: parsed });
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-lxd-dark-surface rounded-lg border border-lxd-dark-border">
      {/* Variable Select */}
      <Select
        value={condition.variableKey}
        onValueChange={(v) => onChange({ variableKey: v })}
        disabled={readOnly}
      >
        <SelectTrigger className="h-7 text-xs bg-lxd-dark-bg flex-1">
          <SelectValue placeholder="Variable" />
        </SelectTrigger>
        <SelectContent>
          {variables.map((v) => (
            <SelectItem key={v.key} value={v.key}>
              {v.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Operator Select */}
      <Select
        value={condition.operator}
        onValueChange={(v) => onChange({ operator: v as ComparisonOperator })}
        disabled={readOnly}
      >
        <SelectTrigger className="h-7 text-xs bg-lxd-dark-bg w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="equals">=</SelectItem>
          <SelectItem value="not_equals">≠</SelectItem>
          <SelectItem value="greater_than">&gt;</SelectItem>
          <SelectItem value="less_than">&lt;</SelectItem>
          <SelectItem value="greater_equal">≥</SelectItem>
          <SelectItem value="less_equal">≤</SelectItem>
          <SelectItem value="contains">contains</SelectItem>
          <SelectItem value="not_contains">!contains</SelectItem>
        </SelectContent>
      </Select>

      {/* Value Input */}
      {selectedVariable?.type === 'boolean' ? (
        <Select
          value={String(condition.targetValue)}
          onValueChange={handleValueChange}
          disabled={readOnly}
        >
          <SelectTrigger className="h-7 text-xs bg-lxd-dark-bg w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">true</SelectItem>
            <SelectItem value="false">false</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <Input
          type={selectedVariable?.type === 'number' ? 'number' : 'text'}
          value={String(condition.targetValue)}
          onChange={(e) => handleValueChange(e.target.value)}
          disabled={readOnly}
          className="h-7 text-xs bg-lxd-dark-bg w-24"
          placeholder="Value"
        />
      )}
    </div>
  );
}

export default ConditionBuilder;
