'use client';

import { ChevronDown, ChevronRight, Hash, ToggleLeft, Trash2, Type } from 'lucide-react';
import { useState } from 'react';
import type {
  Variable,
  VariableType,
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
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// =============================================================================
// Variable Editor Component
// =============================================================================

interface VariableEditorProps {
  variable: Variable;
  isSelected: boolean;
  readOnly?: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<Variable>) => void;
  onDelete: () => void;
}

export function VariableEditor({
  variable,
  isSelected,
  readOnly = false,
  onSelect,
  onChange,
  onDelete,
}: VariableEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const TypeIcon = getTypeIcon(variable.type);

  const handleTypeChange = (newType: VariableType) => {
    const defaults: Record<VariableType, VariableValue> = {
      boolean: false,
      number: 0,
      string: '',
    };
    onChange({
      type: newType,
      initialValue: defaults[newType],
    });
  };

  const handleValueChange = (value: string) => {
    let parsed: VariableValue;
    switch (variable.type) {
      case 'boolean':
        parsed = value === 'true';
        break;
      case 'number':
        parsed = Number(value) || 0;
        break;
      default:
        parsed = value;
    }
    onChange({ initialValue: parsed });
  };

  return (
    <div
      className={cn(
        'rounded-lg border transition-all duration-200',
        isSelected
          ? 'border-lxd-cyan bg-lxd-cyan/5'
          : 'border-lxd-dark-border bg-lxd-dark-surface hover:border-lxd-dark-border/80',
      )}
    >
      {/* Header Row */}
      {/* biome-ignore lint/a11y/useSemanticElements: Expandable header with nested button requires div */}
      <div
        role="button"
        tabIndex={0}
        className="flex items-center gap-2 p-3 cursor-pointer"
        onClick={() => {
          onSelect();
          setIsExpanded(!isExpanded);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        {/* Expand/Collapse */}
        <button
          type="button"
          className="text-white/50 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Type Icon */}
        <div className={cn('p-1 rounded', getTypeColor(variable.type))}>
          <TypeIcon className="w-3 h-3" />
        </div>

        {/* Key & Label */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{variable.label}</p>
          <p className="text-[10px] font-mono text-white/40 truncate">{variable.key}</p>
        </div>

        {/* Current Value Preview */}
        <span className="text-xs font-mono text-white/60 bg-lxd-dark-bg px-2 py-0.5 rounded">
          {formatValue(variable.initialValue)}
        </span>
      </div>

      {/* Expanded Editor */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-lxd-dark-border pt-3">
          {/* Key */}
          <div className="space-y-1">
            <Label htmlFor={`key-${variable.key}`} className="text-xs text-white/60">
              Key (identifier)
            </Label>
            <Input
              id={`key-${variable.key}`}
              value={variable.key}
              onChange={(e) => onChange({ key: e.target.value })}
              disabled={readOnly}
              className="h-8 text-xs font-mono bg-lxd-dark-bg"
              placeholder="variable_name"
            />
          </div>

          {/* Label */}
          <div className="space-y-1">
            <Label htmlFor={`label-${variable.key}`} className="text-xs text-white/60">
              Display Label
            </Label>
            <Input
              id={`label-${variable.key}`}
              value={variable.label}
              onChange={(e) => onChange({ label: e.target.value })}
              disabled={readOnly}
              className="h-8 text-xs bg-lxd-dark-bg"
              placeholder="My Variable"
            />
          </div>

          {/* Type */}
          <div className="space-y-1">
            <Label className="text-xs text-white/60">Type</Label>
            <Select
              value={variable.type}
              onValueChange={(v) => handleTypeChange(v as VariableType)}
              disabled={readOnly}
            >
              <SelectTrigger className="h-8 text-xs bg-lxd-dark-bg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="boolean">Boolean (true/false)</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="string">String (text)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Initial Value */}
          <div className="space-y-1">
            <Label htmlFor={`value-${variable.key}`} className="text-xs text-white/60">
              Initial Value
            </Label>
            {variable.type === 'boolean' ? (
              <div className="flex items-center gap-2">
                <Switch
                  id={`value-${variable.key}`}
                  checked={variable.initialValue === true}
                  onCheckedChange={(checked) => onChange({ initialValue: checked })}
                  disabled={readOnly}
                />
                <span className="text-xs text-white/60">
                  {variable.initialValue ? 'true' : 'false'}
                </span>
              </div>
            ) : (
              <Input
                id={`value-${variable.key}`}
                type={variable.type === 'number' ? 'number' : 'text'}
                value={String(variable.initialValue)}
                onChange={(e) => handleValueChange(e.target.value)}
                disabled={readOnly}
                className="h-8 text-xs font-mono bg-lxd-dark-bg"
              />
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor={`desc-${variable.key}`} className="text-xs text-white/60">
              Description (optional)
            </Label>
            <Input
              id={`desc-${variable.key}`}
              value={variable.description ?? ''}
              onChange={(e) => onChange({ description: e.target.value })}
              disabled={readOnly}
              className="h-8 text-xs bg-lxd-dark-bg"
              placeholder="What this variable tracks..."
            />
          </div>

          {/* Delete Button */}
          {!readOnly && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="w-full h-8 text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete Variable
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

function getTypeIcon(type: VariableType) {
  switch (type) {
    case 'boolean':
      return ToggleLeft;
    case 'number':
      return Hash;
    case 'string':
      return Type;
    default:
      return Type;
  }
}

function getTypeColor(type: VariableType): string {
  switch (type) {
    case 'boolean':
      return 'bg-purple-500/20 text-purple-400';
    case 'number':
      return 'bg-blue-500/20 text-blue-400';
    case 'string':
      return 'bg-green-500/20 text-green-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
}

function formatValue(value: VariableValue): string {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'string') {
    return value.length > 10 ? `"${value.slice(0, 10)}..."` : `"${value}"`;
  }
  return String(value);
}

export default VariableEditor;
