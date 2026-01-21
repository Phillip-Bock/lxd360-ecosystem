'use client';

import { User } from 'lucide-react';
import Image from 'next/image';
import { memo } from 'react';
import { Handle, type NodeProps, Position } from 'reactflow';
import type { DialogueNodeData } from '@/components/inspire-studio/branching/types';
import { cn } from '@/lib/utils';
import { BaseScenarioNode, NodeTypeBadge } from './BaseScenarioNode';

// =============================================================================
// Dialogue Node Component
// =============================================================================

interface DialogueNodeProps extends NodeProps {
  data: DialogueNodeData & { type: 'dialogue' };
}

export const DialogueNode = memo(function DialogueNode({ data, selected }: DialogueNodeProps) {
  const choices = data.choices ?? [];
  const hasChoices = choices.length > 0;

  return (
    <BaseScenarioNode
      selected={selected}
      variant="rectangle"
      className="min-w-[200px] max-w-[300px]"
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

      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {data.avatarUrl ? (
              <Image
                src={data.avatarUrl}
                alt={data.characterName ?? 'Character'}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="p-1.5 rounded-full bg-blue-500/20">
                <User className="w-4 h-4 text-blue-400" />
              </div>
            )}
            <span className="text-sm font-medium text-white">
              {data.characterName ?? 'Character'}
            </span>
          </div>
          <NodeTypeBadge type="dialogue" />
        </div>

        {/* Dialogue Text */}
        <div className="p-2 rounded bg-lxd-dark-bg/50 border border-lxd-dark-border">
          <p className="text-xs text-white/80 line-clamp-3">
            {data.dialogueText || 'Enter dialogue text...'}
          </p>
        </div>

        {/* Choices */}
        {hasChoices && (
          <div className="space-y-1">
            <p className="text-[10px] uppercase text-white/40 font-medium">
              Choices ({choices.length})
            </p>
            <div className="space-y-1">
              {choices.map((choice, index) => (
                <div
                  key={choice.id}
                  className={cn(
                    'relative flex items-center gap-2 px-2 py-1.5 rounded',
                    'bg-lxd-cyan/10 border border-lxd-cyan/30',
                    'text-xs text-lxd-cyan',
                  )}
                >
                  <span className="font-medium">{index + 1}.</span>
                  <span className="truncate flex-1">{choice.label}</span>
                  {/* Choice output handle */}
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`choice-${choice.id}`}
                    className={cn(
                      'w-2.5 h-2.5 rounded-full',
                      'bg-lxd-cyan border-2 border-lxd-cyan/80',
                      '!right-[-6px]',
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Default output if no choices */}
        {!hasChoices && (
          <Handle
            type="source"
            position={Position.Bottom}
            id="output"
            className={cn(
              'w-3 h-3 rounded-full',
              'bg-lxd-cyan border-2 border-lxd-cyan/80',
              '!-bottom-1.5',
            )}
          />
        )}
      </div>
    </BaseScenarioNode>
  );
});

export default DialogueNode;
