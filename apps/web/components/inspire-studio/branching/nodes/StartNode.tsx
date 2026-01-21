'use client';

import { Play } from 'lucide-react';
import { memo } from 'react';
import { Handle, type NodeProps, Position } from 'reactflow';
import type { StartNodeData } from '@/components/inspire-studio/branching/types';
import { cn } from '@/lib/utils';
import { BaseScenarioNode } from './BaseScenarioNode';

// =============================================================================
// Start Node Component
// =============================================================================

interface StartNodeProps extends NodeProps {
  data: StartNodeData & { type: 'start' };
}

export const StartNode = memo(function StartNode({ data, selected }: StartNodeProps) {
  return (
    <BaseScenarioNode selected={selected} variant="terminal" className="min-w-[120px]">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-green-500/20">
            <Play className="w-4 h-4 text-green-400" />
          </div>
          <span className="text-sm font-medium text-white">{data.label ?? 'Start'}</span>
        </div>
        {data.introText && (
          <p className="text-xs text-white/60 text-center max-w-[150px] truncate">
            {data.introText}
          </p>
        )}
      </div>
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className={cn(
          'w-3 h-3 rounded-full',
          'bg-green-500 border-2 border-green-400',
          '!-bottom-1.5',
        )}
      />
    </BaseScenarioNode>
  );
});

export default StartNode;
