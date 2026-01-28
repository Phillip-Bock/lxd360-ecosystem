'use client';

import { ChevronRight, Circle, Flag } from 'lucide-react';
import type { ScenarioNode } from '@/components/inspire-studio/branching/types';
import { cn } from '@/lib/utils';

// =============================================================================
// Outcome Tracker Component
// =============================================================================

interface OutcomeTrackerProps {
  pathHistory: string[];
  nodes: ScenarioNode[];
  className?: string;
}

export function OutcomeTracker({ pathHistory, nodes, className }: OutcomeTrackerProps) {
  return (
    <div className={cn('p-4', className)}>
      <h4 className="text-xs font-semibold text-white/60 mb-3">
        Path History ({pathHistory.length} steps)
      </h4>

      {pathHistory.length === 0 ? (
        <p className="text-xs text-white/30">No path yet</p>
      ) : (
        <div className="space-y-1">
          {pathHistory.map((nodeId, index) => {
            const node = nodes.find((n) => n.id === nodeId);
            const isLast = index === pathHistory.length - 1;
            const isEndState = node?.type === 'end_state';

            return (
              <PathStep
                key={`${nodeId}-${index}`}
                label={getNodeLabel(node)}
                type={node?.type ?? 'unknown'}
                isLast={isLast}
                isEndState={isEndState}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Path Step Component
// =============================================================================

interface PathStepProps {
  label: string;
  type: string;
  isLast: boolean;
  isEndState: boolean;
}

function PathStep({ label, type, isLast, isEndState }: PathStepProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Step Indicator */}
      <div
        className={cn(
          'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center',
          isEndState
            ? 'bg-green-500/20 text-green-400'
            : isLast
              ? 'bg-lxd-cyan/20 text-lxd-cyan'
              : 'bg-lxd-dark-surface text-white/40',
        )}
      >
        {isEndState ? (
          <Flag className="w-3 h-3" />
        ) : (
          <Circle className={cn('w-2 h-2', isLast && 'fill-current')} />
        )}
      </div>

      {/* Node Info */}
      <div className="flex-1 min-w-0 flex items-center gap-1">
        <span className={cn('truncate', isLast ? 'text-white font-medium' : 'text-white/60')}>
          {label}
        </span>
        <span className={cn('text-[10px] px-1 rounded', getTypeColor(type))}>
          {type.replace('_', ' ')}
        </span>
      </div>

      {/* Arrow (if not last) */}
      {!isLast && <ChevronRight className="w-3 h-3 text-white/20" />}
    </div>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

function getNodeLabel(node: ScenarioNode | undefined): string {
  if (!node) return 'Unknown';

  const data = node.data as Record<string, unknown>;

  // Try to get a meaningful label
  if (data.label && typeof data.label === 'string') {
    return data.label;
  }

  if (data.characterName && typeof data.characterName === 'string') {
    return data.characterName;
  }

  if (data.dialogueText && typeof data.dialogueText === 'string') {
    const text = data.dialogueText;
    return text.length > 20 ? `${text.slice(0, 20)}...` : text;
  }

  // Fallback to type
  return node.type.replace('_', ' ');
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'start':
      return 'bg-green-500/20 text-green-400';
    case 'dialogue':
      return 'bg-blue-500/20 text-blue-400';
    case 'action':
      return 'bg-orange-500/20 text-orange-400';
    case 'logic_gate':
      return 'bg-purple-500/20 text-purple-400';
    case 'end_state':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
}

export default OutcomeTracker;
