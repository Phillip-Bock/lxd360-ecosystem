'use client';

import { AlertTriangle, Lightbulb } from 'lucide-react';
import { useMemo } from 'react';
import type { ScenarioManifest } from '@/components/inspire-studio/branching/types';
import { cn } from '@/lib/utils';
import { isDeadEnd } from './path-analyzer';

// =============================================================================
// Trap Detector Component
// =============================================================================

interface TrapDetectorProps {
  scenario: ScenarioManifest;
  nodeId: string;
  className?: string;
}

/**
 * Displays trap detection warnings for a specific node.
 * Shows contextual fixes and suggestions.
 */
export function TrapDetector({ scenario, nodeId, className }: TrapDetectorProps) {
  const analysis = useMemo(() => analyzeNodeTraps(scenario, nodeId), [scenario, nodeId]);

  if (!analysis.hasTraps) return null;

  return (
    <div className={cn('p-3 rounded-lg', 'bg-red-500/10 border border-red-500/30', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        <span className="text-sm font-medium text-red-400">Trap Detected</span>
      </div>

      {/* Issues */}
      <div className="space-y-2">
        {analysis.issues.map((issue, index) => (
          <div key={index} className="text-xs text-white/70">
            {issue.message}
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-red-500/20">
          <div className="flex items-center gap-1 mb-1">
            <Lightbulb className="w-3 h-3 text-yellow-400" />
            <span className="text-xs font-medium text-yellow-400">Suggestions</span>
          </div>
          <ul className="space-y-1">
            {analysis.suggestions.map((suggestion, index) => (
              <li key={index} className="text-xs text-white/50 flex items-start gap-1">
                <span className="text-yellow-400">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Trap Analysis
// =============================================================================

interface TrapAnalysis {
  hasTraps: boolean;
  issues: Array<{ type: string; message: string }>;
  suggestions: string[];
}

function analyzeNodeTraps(scenario: ScenarioManifest, nodeId: string): TrapAnalysis {
  const node = scenario.nodes.find((n) => n.id === nodeId);
  if (!node) {
    return { hasTraps: false, issues: [], suggestions: [] };
  }

  const issues: Array<{ type: string; message: string }> = [];
  const suggestions: string[] = [];

  // Check for dead end
  if (isDeadEnd(nodeId, scenario)) {
    issues.push({
      type: 'dead_end',
      message: 'This node has no exit path. Players will be stuck here.',
    });

    if (node.type === 'dialogue') {
      suggestions.push('Add at least one choice with a connected target node');
      suggestions.push("Or mark this as an End State if it's an intentional ending");
    } else if (node.type === 'action') {
      suggestions.push('Connect this action to the next node');
    } else if (node.type === 'logic_gate') {
      suggestions.push('Connect both True and False paths to other nodes');
    }
  }

  // Check dialogue node specific issues
  if (node.type === 'dialogue') {
    const choices = (node.data?.choices ?? []) as Array<{
      id: string;
      targetNodeId: string | null;
    }>;

    // No choices defined
    if (choices.length === 0) {
      issues.push({
        type: 'no_choices',
        message: 'Dialogue has no choices. Add choices or connect to next node.',
      });
      suggestions.push('Add choices for the player to respond');
    }

    // Choices without targets
    const unconnectedChoices = choices.filter((c) => !c.targetNodeId);
    if (unconnectedChoices.length > 0) {
      issues.push({
        type: 'unconnected_choices',
        message: `${unconnectedChoices.length} choice(s) have no target node.`,
      });
      suggestions.push('Connect all choices to their destination nodes');
    }
  }

  // Check logic gate specific issues
  if (node.type === 'logic_gate') {
    const truePath = node.data?.truePathNodeId as string | null;
    const falsePath = node.data?.falsePathNodeId as string | null;
    const condition = node.data?.condition;

    if (!condition) {
      issues.push({
        type: 'no_condition',
        message: 'Logic gate has no condition defined.',
      });
      suggestions.push('Add a condition to evaluate');
    }

    if (!truePath) {
      issues.push({
        type: 'no_true_path',
        message: 'True path is not connected.',
      });
    }

    if (!falsePath) {
      issues.push({
        type: 'no_false_path',
        message: 'False path is not connected.',
      });
    }
  }

  // Check for self-referencing (infinite loop)
  const outgoingEdges = scenario.edges.filter((e) => e.source === nodeId);
  const selfReference = outgoingEdges.some((e) => e.target === nodeId);
  if (selfReference) {
    issues.push({
      type: 'self_reference',
      message: 'Node connects to itself, causing an infinite loop.',
    });
    suggestions.push('Remove the self-referencing connection');
  }

  return {
    hasTraps: issues.length > 0,
    issues,
    suggestions,
  };
}

export default TrapDetector;
