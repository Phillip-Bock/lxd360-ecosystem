'use client';

import { Activity, Hash, RotateCcw, ToggleLeft, Type } from 'lucide-react';
import type {
  Variable,
  VariableType,
  VariableValue,
} from '@/components/inspire-studio/branching/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useScenarioStore } from '@/store/inspire/useScenarioStore';

// =============================================================================
// Variable Debugger Component
// =============================================================================

interface VariableDebuggerProps {
  variables: Variable[];
  liveValues?: Record<string, VariableValue>;
  className?: string;
}

export function VariableDebugger({ variables, liveValues, className }: VariableDebuggerProps) {
  const resetPlayerState = useScenarioStore((state) => state.resetPlayerState);
  const startScenario = useScenarioStore((state) => state.startScenario);
  const isPlaying = useScenarioStore((state) => state.isPlaying);

  const handleReset = () => {
    resetPlayerState();
    startScenario();
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Debug Header */}
      <div className="flex items-center justify-between p-4 border-b border-lxd-dark-border">
        <div className="flex items-center gap-2">
          <Activity
            className={cn('w-4 h-4', isPlaying ? 'text-green-400 animate-pulse' : 'text-white/40')}
          />
          <span className="text-xs text-white/60">
            {isPlaying ? 'Live Values' : 'Preview Mode'}
          </span>
        </div>
        {isPlaying && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="h-6 px-2 text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Variable List */}
      <div className="flex-1 overflow-y-auto p-4">
        {variables.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-white/50">No variables to debug</p>
            <p className="text-xs text-white/30 mt-1">Add variables in the Design tab</p>
          </div>
        ) : (
          <div className="space-y-2">
            {variables.map((variable) => {
              const currentValue = liveValues?.[variable.key] ?? variable.initialValue;
              const hasChanged = liveValues && liveValues[variable.key] !== variable.initialValue;

              return (
                <DebugRow
                  key={variable.key}
                  variable={variable}
                  currentValue={currentValue}
                  hasChanged={hasChanged}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-3 border-t border-lxd-dark-border bg-lxd-dark-surface/50">
        <div className="flex items-center gap-4 text-[10px] text-white/40">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>Changed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-lxd-dark-border" />
            <span>Initial</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Debug Row Component
// =============================================================================

interface DebugRowProps {
  variable: Variable;
  currentValue: VariableValue;
  hasChanged?: boolean;
}

function DebugRow({ variable, currentValue, hasChanged }: DebugRowProps) {
  const TypeIcon = getTypeIcon(variable.type);

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-2 rounded-lg',
        'bg-lxd-dark-surface border',
        hasChanged ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-lxd-dark-border',
      )}
    >
      {/* Type Icon */}
      <div className={cn('p-1 rounded', getTypeColor(variable.type))}>
        <TypeIcon className="w-3 h-3" />
      </div>

      {/* Label & Key */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white truncate">{variable.label}</p>
        <p className="text-[10px] font-mono text-white/40 truncate">{variable.key}</p>
      </div>

      {/* Current Value */}
      <div className="flex flex-col items-end gap-0.5">
        <span
          className={cn(
            'text-sm font-mono px-2 py-0.5 rounded',
            hasChanged ? 'bg-yellow-500/20 text-yellow-300' : 'bg-lxd-dark-bg text-white/80',
          )}
        >
          {formatValue(currentValue, variable.type)}
        </span>
        {hasChanged && (
          <span className="text-[10px] text-white/30">
            was: {formatValue(variable.initialValue, variable.type)}
          </span>
        )}
      </div>

      {/* Change Indicator */}
      {hasChanged && <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />}
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

function formatValue(value: VariableValue, type: VariableType): string {
  if (type === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (type === 'string') {
    const str = String(value);
    return str.length > 15 ? `"${str.slice(0, 15)}..."` : `"${str}"`;
  }
  return String(value);
}

export default VariableDebugger;
