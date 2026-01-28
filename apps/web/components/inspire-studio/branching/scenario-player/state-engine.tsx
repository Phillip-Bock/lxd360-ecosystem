'use client';

import { Hash, ToggleLeft, Type } from 'lucide-react';
import type { VariableValue } from '@/components/inspire-studio/branching/types';
import { cn } from '@/lib/utils';

// =============================================================================
// State Engine Component
// =============================================================================

interface StateEngineProps {
  variableValues: Record<string, VariableValue>;
  className?: string;
}

export function StateEngine({ variableValues, className }: StateEngineProps) {
  const entries = Object.entries(variableValues);

  return (
    <div className={cn('p-4 border-b border-lxd-dark-border', className)}>
      <h4 className="text-xs font-semibold text-white/60 mb-3">Variable State</h4>

      {entries.length === 0 ? (
        <p className="text-xs text-white/30">No variables</p>
      ) : (
        <div className="space-y-2">
          {entries.map(([key, value]) => (
            <StateRow key={key} variableKey={key} value={value} />
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// State Row Component
// =============================================================================

interface StateRowProps {
  variableKey: string;
  value: VariableValue;
}

function StateRow({ variableKey, value }: StateRowProps) {
  const type = typeof value;
  const TypeIcon = getTypeIcon(type);

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={cn('p-1 rounded', getTypeColor(type))}>
        <TypeIcon className="w-3 h-3" />
      </div>
      <span className="font-mono text-white/60 flex-1 truncate">{variableKey}</span>
      <span className={cn('font-mono px-2 py-0.5 rounded', 'bg-lxd-dark-surface text-white')}>
        {formatValue(value)}
      </span>
    </div>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

function getTypeIcon(type: string) {
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

function getTypeColor(type: string): string {
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
    return value.length > 15 ? `"${value.slice(0, 15)}..."` : `"${value}"`;
  }
  return String(value);
}

export default StateEngine;
