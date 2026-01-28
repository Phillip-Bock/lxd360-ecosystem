'use client';

import { AlertCircle, CheckCircle, MinusCircle, XCircle } from 'lucide-react';
import { memo } from 'react';
import { Handle, type NodeProps, Position } from 'reactflow';
import type { EndStateNodeData, OutcomeType } from '@/components/inspire-studio/branching/types';
import { cn } from '@/lib/utils';
import { BaseScenarioNode } from './base-scenario-node';

// =============================================================================
// End State Node Component
// =============================================================================

interface EndStateNodeProps extends NodeProps {
  data: EndStateNodeData & { type: 'end_state' };
}

export const EndStateNode = memo(function EndStateNode({ data, selected }: EndStateNodeProps) {
  const outcome = data.outcome ?? 'neutral';
  const { icon: OutcomeIcon, colorClass, bgClass, borderClass } = getOutcomeStyles(outcome);

  return (
    <BaseScenarioNode
      selected={selected}
      variant="terminal"
      className={cn('min-w-[140px]', borderClass)}
    >
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

      <div className="flex flex-col items-center gap-2">
        {/* Outcome Icon */}
        <div className={cn('p-2 rounded-full', bgClass)}>
          <OutcomeIcon className={cn('w-5 h-5', colorClass)} />
        </div>

        {/* Label */}
        <span className="text-sm font-medium text-white">{data.label ?? 'End'}</span>

        {/* Outcome Badge */}
        <span
          className={cn(
            'text-[10px] font-medium uppercase px-2 py-0.5 rounded-full',
            bgClass,
            colorClass,
          )}
        >
          {outcome}
        </span>

        {/* Outcome Message */}
        {data.outcomeMessage && (
          <p className="text-xs text-white/60 text-center max-w-[150px] line-clamp-2">
            {data.outcomeMessage}
          </p>
        )}

        {/* Score */}
        {data.xapiScore !== undefined && (
          <div className="text-[10px] text-white/50">
            Score: <span className="font-mono text-white/80">{data.xapiScore}%</span>
          </div>
        )}
      </div>
    </BaseScenarioNode>
  );
});

// =============================================================================
// Helper Functions
// =============================================================================

interface OutcomeStyles {
  icon: typeof CheckCircle;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

function getOutcomeStyles(outcome: OutcomeType): OutcomeStyles {
  switch (outcome) {
    case 'success':
      return {
        icon: CheckCircle,
        colorClass: 'text-green-400',
        bgClass: 'bg-green-500/20',
        borderClass: 'border-green-500/50',
      };
    case 'failure':
      return {
        icon: XCircle,
        colorClass: 'text-red-400',
        bgClass: 'bg-red-500/20',
        borderClass: 'border-red-500/50',
      };
    case 'partial':
      return {
        icon: AlertCircle,
        colorClass: 'text-yellow-400',
        bgClass: 'bg-yellow-500/20',
        borderClass: 'border-yellow-500/50',
      };
    default:
      return {
        icon: MinusCircle,
        colorClass: 'text-gray-400',
        bgClass: 'bg-gray-500/20',
        borderClass: 'border-gray-500/50',
      };
  }
}

export default EndStateNode;
