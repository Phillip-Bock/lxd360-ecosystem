'use client';

import { Bug, Pause, Play, RotateCcw, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ActionNodeData,
  Condition,
  DialogueNodeData,
  EndStateNodeData,
  LogicGateNodeData,
  OutcomeType,
  ScenarioNode,
  VariableValue,
} from '@/components/inspire-studio/branching/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useScenarioStore } from '@/store/inspire/useScenarioStore';
import { useBranchingXAPI } from '../hooks/useBranchingXAPI';
import { ChoicePresenter } from './choice-presenter';
import { OutcomeTracker } from './outcome-tracker';
import { StateEngine } from './state-engine';

// =============================================================================
// Scenario Player Component
// =============================================================================

interface ScenarioPlayerProps {
  className?: string;
  debug?: boolean;
  onComplete?: (outcome: OutcomeType, duration: number) => void;
}

export function ScenarioPlayer({ className, debug = false, onComplete }: ScenarioPlayerProps) {
  const startTimeRef = useRef<number>(0);
  const [showDebug, setShowDebug] = useState(debug);

  // Store state
  const scenario = useScenarioStore((state) => state.scenario);
  const currentNodeId = useScenarioStore((state) => state.currentNodeId);
  const variableValues = useScenarioStore((state) => state.variableValues);
  const pathHistory = useScenarioStore((state) => state.pathHistory);
  const isPlaying = useScenarioStore((state) => state.isPlaying);
  const startScenario = useScenarioStore((state) => state.startScenario);
  const stopScenario = useScenarioStore((state) => state.stopScenario);
  const makeChoice = useScenarioStore((state) => state.makeChoice);
  const advanceToNode = useScenarioStore((state) => state.advanceToNode);
  const applyMutations = useScenarioStore((state) => state.applyMutations);
  const resetPlayerState = useScenarioStore((state) => state.resetPlayerState);

  // xAPI tracking
  const { trackScenarioStart, trackChoice, trackLogicEvaluation, trackScenarioComplete } =
    useBranchingXAPI(scenario.id);

  // Get current node
  const currentNode = scenario.nodes.find((n) => n.id === currentNodeId);

  // Handle scenario start
  const handleStart = useCallback(() => {
    startTimeRef.current = Date.now();
    startScenario();
    trackScenarioStart();
  }, [startScenario, trackScenarioStart]);

  // Handle stop/pause
  const handleStop = useCallback(() => {
    stopScenario();
  }, [stopScenario]);

  // Handle reset
  const handleReset = useCallback(() => {
    resetPlayerState();
    startTimeRef.current = 0;
  }, [resetPlayerState]);

  // Handle choice selection
  const handleChoice = useCallback(
    (
      choiceId: string,
      choiceLabel: string,
      mutations: Array<{ variableKey: string; operation: string; value: VariableValue }>,
    ) => {
      if (!currentNodeId) return;

      trackChoice(currentNodeId, choiceId, choiceLabel, mutations);
      makeChoice(choiceId);
    },
    [currentNodeId, trackChoice, makeChoice],
  );

  // Process action nodes automatically
  useEffect(() => {
    if (!isPlaying || !currentNode || currentNode.type !== 'action') return;

    const data = currentNode.data as ActionNodeData & { type: 'action' };
    const delay = data.delay ?? 0;

    const timer = setTimeout(() => {
      // Apply mutations
      if (data.variableMutations?.length) {
        applyMutations(data.variableMutations);
      }

      // Advance to next node
      if (data.targetNodeId) {
        advanceToNode(data.targetNodeId);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentNode, applyMutations, advanceToNode]);

  // Process logic gate nodes automatically
  useEffect(() => {
    if (!isPlaying || !currentNode || currentNode.type !== 'logic_gate') return;

    const data = currentNode.data as LogicGateNodeData & { type: 'logic_gate' };
    const condition = data.condition;

    if (!condition) return;

    // Evaluate condition
    const result = evaluateCondition(condition, variableValues);
    const nextNodeId = result ? data.truePathNodeId : data.falsePathNodeId;

    trackLogicEvaluation(currentNode.id, condition, result, nextNodeId ?? '');

    if (nextNodeId) {
      // Small delay for visual feedback
      const timer = setTimeout(() => {
        advanceToNode(nextNodeId);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentNode, variableValues, trackLogicEvaluation, advanceToNode]);

  // Handle end state
  useEffect(() => {
    if (!isPlaying || !currentNode || currentNode.type !== 'end_state') return;

    const data = currentNode.data as EndStateNodeData & { type: 'end_state' };
    const duration = Date.now() - startTimeRef.current;

    trackScenarioComplete(data.outcome ?? 'neutral', pathHistory, variableValues, duration);

    onComplete?.(data.outcome ?? 'neutral', duration);
  }, [isPlaying, currentNode, pathHistory, variableValues, trackScenarioComplete, onComplete]);

  return (
    <div className={cn('flex flex-col h-full bg-lxd-dark-bg', className)}>
      {/* Control Bar */}
      <div className="flex items-center justify-between p-4 border-b border-lxd-dark-border">
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <Button type="button" size="sm" onClick={handleStart} className="gap-1">
              <Play className="w-4 h-4" />
              Play
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleStop}
              className="gap-1"
            >
              <Pause className="w-4 h-4" />
              Pause
            </Button>
          )}
          <Button type="button" size="sm" variant="ghost" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setShowDebug(!showDebug)}
          className={cn('gap-1', showDebug && 'text-lxd-cyan')}
        >
          <Bug className="w-4 h-4" />
          Debug
        </Button>
      </div>

      {/* Main Player Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Player View */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {!isPlaying && !currentNode && (
            <div className="text-center">
              <p className="text-lg font-medium text-white mb-2">{scenario.title}</p>
              <p className="text-sm text-white/50 mb-4">
                {scenario.description ?? 'Click Play to start the scenario'}
              </p>
              <Button type="button" onClick={handleStart} className="gap-2">
                <Play className="w-4 h-4" />
                Start Scenario
              </Button>
            </div>
          )}

          {isPlaying && currentNode && (
            <NodeRenderer
              node={currentNode}
              variableValues={variableValues}
              onChoice={handleChoice}
            />
          )}
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className="w-80 border-l border-lxd-dark-border overflow-y-auto">
            <div className="p-4 border-b border-lxd-dark-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Debug Info</h3>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowDebug(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* State Engine */}
            <StateEngine variableValues={variableValues} />

            {/* Outcome Tracker */}
            <OutcomeTracker pathHistory={pathHistory} nodes={scenario.nodes} />
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Node Renderer
// =============================================================================

interface NodeRendererProps {
  node: ScenarioNode;
  variableValues: Record<string, VariableValue>;
  onChoice: (
    choiceId: string,
    label: string,
    mutations: Array<{ variableKey: string; operation: string; value: VariableValue }>,
  ) => void;
}

function NodeRenderer({ node, variableValues, onChoice }: NodeRendererProps) {
  switch (node.type) {
    case 'start':
      return (
        <div className="text-center animate-fade-in">
          <p className="text-lg text-white">
            {(node.data as { introText?: string }).introText ?? 'Scenario starting...'}
          </p>
        </div>
      );

    case 'dialogue': {
      const dialogueData = node.data as DialogueNodeData & { type: 'dialogue' };
      return (
        <div className="w-full max-w-2xl animate-fade-in">
          {/* Character & Dialogue */}
          <div className="bg-lxd-dark-surface rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4 mb-4">
              {dialogueData.avatarUrl ? (
                <Image
                  src={dialogueData.avatarUrl}
                  alt={dialogueData.characterName ?? 'Character'}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-lxd-cyan/20 flex items-center justify-center">
                  <span className="text-2xl text-lxd-cyan">
                    {(dialogueData.characterName ?? 'C')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-lxd-cyan mb-1">
                  {dialogueData.characterName ?? 'Character'}
                </p>
                <p className="text-white leading-relaxed">{dialogueData.dialogueText}</p>
              </div>
            </div>
          </div>

          {/* Choices */}
          <ChoicePresenter
            choices={dialogueData.choices ?? []}
            variableValues={variableValues}
            onChoice={onChoice}
          />
        </div>
      );
    }

    case 'action':
      return (
        <div className="text-center animate-pulse">
          <p className="text-sm text-white/50">Processing...</p>
        </div>
      );

    case 'logic_gate':
      return (
        <div className="text-center animate-pulse">
          <p className="text-sm text-white/50">Evaluating condition...</p>
        </div>
      );

    case 'end_state': {
      const endData = node.data as EndStateNodeData & { type: 'end_state' };
      return (
        <div className="text-center animate-fade-in">
          <div
            className={cn(
              'inline-flex items-center justify-center w-20 h-20 rounded-full mb-4',
              endData.outcome === 'success' && 'bg-green-500/20',
              endData.outcome === 'failure' && 'bg-red-500/20',
              endData.outcome === 'partial' && 'bg-yellow-500/20',
              endData.outcome === 'neutral' && 'bg-gray-500/20',
            )}
          >
            <span className="text-4xl">
              {endData.outcome === 'success' && '🎉'}
              {endData.outcome === 'failure' && '😔'}
              {endData.outcome === 'partial' && '🤔'}
              {endData.outcome === 'neutral' && '✓'}
            </span>
          </div>
          <p className="text-xl font-semibold text-white mb-2">
            {endData.label ?? 'Scenario Complete'}
          </p>
          <p className="text-white/60">{endData.outcomeMessage ?? `Outcome: ${endData.outcome}`}</p>
          {endData.xapiScore !== undefined && (
            <p className="text-lxd-cyan font-mono mt-2">Score: {endData.xapiScore}%</p>
          )}
        </div>
      );
    }

    default:
      return <p className="text-white/50">Unknown node type</p>;
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

function evaluateCondition(condition: Condition, values: Record<string, VariableValue>): boolean {
  const value = values[condition.variableKey];
  const target = condition.targetValue;

  switch (condition.operator) {
    case 'equals':
      return value === target;
    case 'not_equals':
      return value !== target;
    case 'greater_than':
      return typeof value === 'number' && typeof target === 'number' && value > target;
    case 'less_than':
      return typeof value === 'number' && typeof target === 'number' && value < target;
    case 'greater_equal':
      return typeof value === 'number' && typeof target === 'number' && value >= target;
    case 'less_equal':
      return typeof value === 'number' && typeof target === 'number' && value <= target;
    case 'contains':
      return typeof value === 'string' && typeof target === 'string' && value.includes(target);
    case 'not_contains':
      return typeof value === 'string' && typeof target === 'string' && !value.includes(target);
    default:
      return false;
  }
}

export default ScenarioPlayer;
