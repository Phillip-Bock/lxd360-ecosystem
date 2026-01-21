'use client';

import { ArrowRight, Zap } from 'lucide-react';
import { memo } from 'react';
import { Handle, type NodeProps, Position } from 'reactflow';
import type { ActionNodeData } from '@/components/inspire-studio/branching/types';
import { cn } from '@/lib/utils';
import { BaseScenarioNode, NodeTypeBadge } from './BaseScenarioNode';

// =============================================================================
// Action Node Component
// =============================================================================

interface ActionNodeProps extends NodeProps {
  data: ActionNodeData & { type: 'action' };
}

export const ActionNode = memo(function ActionNode({ data, selected }: ActionNodeProps) {
  const mutations = data.variableMutations ?? [];
  const hasMutations = mutations.length > 0;

  return (
    <BaseScenarioNode selected={selected} variant="rounded" className="min-w-[180px]">
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className={cn(
          'w-3 h-3 rounded-full',
          'bg-lxd-purple border-2 border-lxd-purple/80',
          '!-top-1.5',
        )}
      />

      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-orange-500/20">
              <Zap className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-sm font-medium text-white">{data.label ?? 'Action'}</span>
          </div>
          <NodeTypeBadge type="action" />
        </div>

        {/* Variable Mutations */}
        {hasMutations && (
          <div className="space-y-1">
            <p className="text-[10px] uppercase text-white/40 font-medium">Mutations</p>
            <div className="space-y-1">
              {mutations.map((mutation, index) => (
                <div
                  key={`${mutation.variableKey}-${index}`}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded',
                    'bg-orange-500/10 border border-orange-500/30',
                    'text-[11px] text-orange-300 font-mono',
                  )}
                >
                  <span>{mutation.variableKey}</span>
                  <span className="text-orange-400">{getOperationSymbol(mutation.operation)}</span>
                  <span className="text-white/70">{String(mutation.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Auto-proceed indicator */}
        {data.delay !== undefined && data.delay > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-white/50">
            <ArrowRight className="w-3 h-3" />
            <span>Auto-proceed in {data.delay}ms</span>
          </div>
        )}

        {!hasMutations && <p className="text-xs text-white/40 italic">No mutations configured</p>}
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className={cn(
          'w-3 h-3 rounded-full',
          'bg-orange-500 border-2 border-orange-400',
          '!-bottom-1.5',
        )}
      />
    </BaseScenarioNode>
  );
});

// =============================================================================
// Helper Functions
// =============================================================================

function getOperationSymbol(operation: string): string {
  switch (operation) {
    case 'set':
      return '=';
    case 'add':
      return '+=';
    case 'subtract':
      return '-=';
    case 'multiply':
      return '*=';
    case 'toggle':
      return '!';
    case 'append':
      return '+=';
    default:
      return '?';
  }
}

export default ActionNode;
