'use client';

import { Check, GitBranch, X } from 'lucide-react';
import { memo } from 'react';
import { Handle, type NodeProps, Position } from 'reactflow';
import type { Condition, LogicGateNodeData } from '@/components/inspire-studio/branching/types';
import { cn } from '@/lib/utils';
import { BaseScenarioNode } from './base-scenario-node';

// =============================================================================
// Logic Gate Node Component
// =============================================================================

interface LogicGateNodeProps extends NodeProps {
  data: LogicGateNodeData & { type: 'logic_gate' };
}

export const LogicGateNode = memo(function LogicGateNode({ data, selected }: LogicGateNodeProps) {
  const condition = data.condition;
  const hasCondition = condition !== undefined;

  return (
    <BaseScenarioNode selected={selected} variant="diamond" className="min-w-[120px]">
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

      <div className="flex flex-col items-center gap-2 p-2">
        {/* Icon */}
        <div className="p-1.5 rounded-full bg-purple-500/20">
          <GitBranch className="w-4 h-4 text-purple-400" />
        </div>

        {/* Label */}
        <span className="text-xs font-medium text-white text-center">
          {data.label ?? 'Condition'}
        </span>

        {/* Condition Display */}
        {hasCondition ? (
          <div className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-1 rounded text-center">
            {formatCondition(condition)}
          </div>
        ) : (
          <p className="text-[10px] text-white/40 italic">No condition</p>
        )}

        {/* True/False Labels */}
        <div className="flex items-center gap-6 mt-1">
          <div className="flex items-center gap-1 text-[10px] text-green-400">
            <Check className="w-3 h-3" />
            <span>True</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-red-400">
            <X className="w-3 h-3" />
            <span>False</span>
          </div>
        </div>
      </div>

      {/* True path handle (left) */}
      <Handle
        type="source"
        position={Position.Left}
        id="true-path"
        className={cn(
          'w-3 h-3 rounded-full',
          'bg-green-500 border-2 border-green-400',
          '!-left-1.5',
        )}
      />

      {/* False path handle (right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="false-path"
        className={cn('w-3 h-3 rounded-full', 'bg-red-500 border-2 border-red-400', '!-right-1.5')}
      />
    </BaseScenarioNode>
  );
});

// =============================================================================
// Helper Functions
// =============================================================================

function formatCondition(condition: Condition): string {
  const operatorMap: Record<string, string> = {
    equals: '==',
    not_equals: '!=',
    greater_than: '>',
    less_than: '<',
    greater_equal: '>=',
    less_equal: '<=',
    contains: 'contains',
    not_contains: '!contains',
  };

  const op = operatorMap[condition.operator] ?? condition.operator;
  const value =
    typeof condition.targetValue === 'string'
      ? `"${condition.targetValue}"`
      : String(condition.targetValue);

  return `${condition.variableKey} ${op} ${value}`;
}

export default LogicGateNode;
