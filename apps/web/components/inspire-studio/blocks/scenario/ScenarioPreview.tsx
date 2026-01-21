'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Clock,
  HelpCircle,
  History,
  MessageCircle,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useXAPITracking } from '@/hooks/useXAPITracking';
import { safeInnerHtml } from '@/lib/sanitize';
import type {
  ScenarioVariable as BaseScenarioVariable,
  DecisionOption,
  ScenarioConfig,
  ScenarioNode,
} from '@/types/blocks';

interface ScenarioVariable extends BaseScenarioVariable {
  value: unknown;
}

interface ScenarioPreviewProps {
  scenario: ScenarioConfig;
  title?: string;
  description?: string;
  onComplete?: (result: ScenarioResult) => void;
  onVariableChange?: (variables: Record<string, ScenarioVariable>) => void;
  onRestart?: () => void;
}

interface ScenarioResult {
  completed: boolean;
  endType?: 'complete' | 'fail' | 'partial' | 'restart' | 'redirect';
  score: number;
  maxScore: number;
  pathTaken: string[];
  decisions: DecisionRecord[];
  timeSpent: number;
  variables: Record<string, ScenarioVariable>;
}

interface DecisionRecord {
  nodeId: string;
  nodeTitle: string;
  optionSelected: string;
  timestamp: number;
}

/**
 * ScenarioPreview - Interactive scenario walkthrough
 */
export function ScenarioPreview({
  scenario,
  title,
  description,
  onComplete,
  onVariableChange,
  onRestart,
}: ScenarioPreviewProps) {
  // State
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [variables, setVariables] = useState<Record<string, ScenarioVariable>>({});
  const [pathHistory, setPathHistory] = useState<string[]>([]);
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [endResult, setEndResult] = useState<ScenarioResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [timerValue, setTimerValue] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);

  // xAPI tracking for scenario interactions
  const { emitLaunched, emitScenarioChoice, emitCompleted, isActive } = useXAPITracking({
    activityId: `scenario-${scenario.nodes[0]?.id || 'unknown'}`,
    activityName: title || 'Scenario',
    activityType: 'scenario',
    activityDescription: description,
  });

  // Get current node
  const currentNode = useMemo(() => {
    if (!currentNodeId) return null;
    return scenario.nodes.find((n) => n.id === currentNodeId) || null;
  }, [currentNodeId, scenario.nodes]);

  // Get start node
  const startNode = useMemo(() => {
    return scenario.nodes.find((n) => n.type === 'start');
  }, [scenario.nodes]);

  // Initialize variables from scenario
  useEffect(() => {
    const initialVars: Record<string, ScenarioVariable> = {};
    scenario.variables?.forEach((v) => {
      initialVars[v.name] = {
        ...v,
        value: v.defaultValue,
      };
    });
    setVariables(initialVars);
  }, [scenario.variables]);

  // Calculate max possible score
  const calculateMaxScore = useCallback(() => {
    let maxScore = 0;
    scenario.nodes.forEach((node) => {
      if (node.type === 'end' && node.data.score) {
        maxScore = Math.max(maxScore, node.data.score);
      }
      if (
        node.type === 'question' &&
        node.data.question &&
        typeof node.data.question === 'object'
      ) {
        maxScore += node.data.question.points || 0;
      }
    });
    return maxScore;
  }, [scenario.nodes]);

  // Navigate to a node
  const navigateToNode = useCallback(
    (nodeId: string) => {
      const node = scenario.nodes.find((n) => n.id === nodeId);
      if (!node) return;

      setCurrentNodeId(nodeId);
      setPathHistory((prev) => [...prev, nodeId]);

      // Handle node-specific logic
      switch (node.type) {
        case 'timer':
          // Start timer
          setTimerValue(node.data.duration || 30);
          setTimerActive(true);
          break;

        case 'variable':
          // Update variable
          if (node.data.variable) {
            const variableName = node.data.variable;
            setVariables((prev) => {
              const current = prev[variableName];
              let newValue = node.data.value;

              if (current) {
                switch (node.data.operation) {
                  case 'increment':
                    newValue = (current.value as number) + ((node.data.value as number) || 1);
                    break;
                  case 'decrement':
                    newValue = (current.value as number) - ((node.data.value as number) || 1);
                    break;
                  case 'toggle':
                    newValue = !current.value;
                    break;
                }
              }

              const updated = {
                ...prev,
                [variableName]: {
                  ...current,
                  value: newValue,
                },
              };

              onVariableChange?.(updated);
              return updated;
            });

            // Auto-advance after variable update
            const connection = scenario.connections.find((c) => c.from === nodeId);
            if (connection) {
              setTimeout(() => navigateToNode(connection.to), 500);
            }
          }
          break;

        case 'random': {
          // Random path selection
          const paths = scenario.connections.filter((c) => c.from === nodeId);
          if (paths.length > 0) {
            const randomPath = paths[Math.floor(Math.random() * paths.length)];
            setTimeout(() => navigateToNode(randomPath.to), 500);
          }
          break;
        }

        case 'condition': {
          // Evaluate condition
          const conditions = node.data.conditions || [];
          let matchedPath: string | null = null;

          for (const condition of conditions) {
            const variable = variables[condition.variable];
            if (!variable) continue;

            let matches = false;
            switch (condition.operator) {
              case 'equals':
                matches = variable.value === condition.value;
                break;
              case 'notEquals':
                matches = variable.value !== condition.value;
                break;
              case 'greaterThan':
                matches = (variable.value as number) > (condition.value as number);
                break;
              case 'lessThan':
                matches = (variable.value as number) < (condition.value as number);
                break;
              case 'contains':
                matches = String(variable.value).includes(String(condition.value));
                break;
            }

            if (matches) {
              const condConnection = scenario.connections.find(
                (c) => c.from === nodeId && c.optionId === condition.id,
              );
              if (condConnection) {
                matchedPath = condConnection.to;
                break;
              }
            }
          }

          // Fallback to else path
          if (!matchedPath) {
            const elseConnection = scenario.connections.find(
              (c) => c.from === nodeId && c.label === 'else',
            );
            if (elseConnection) {
              matchedPath = elseConnection.to;
            }
          }

          if (matchedPath) {
            setTimeout(() => navigateToNode(matchedPath), 500);
          }
          break;
        }

        case 'end': {
          // Handle end node
          const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
          const finalScore = score + (node.data.score || 0);
          const maxScore = calculateMaxScore();
          const result: ScenarioResult = {
            completed: true,
            endType: node.data.endType || 'complete',
            score: finalScore,
            maxScore,
            pathTaken: pathHistory,
            decisions,
            timeSpent,
            variables,
          };

          setScore((prev) => prev + (node.data.score || 0));
          setIsComplete(true);
          setEndResult(result);
          onComplete?.(result);

          // Emit xAPI completion
          if (isActive) {
            const percentage = maxScore > 0 ? Math.round((finalScore / maxScore) * 100) : 100;
            const passed = node.data.endType === 'complete';
            emitCompleted({
              duration: timeSpent,
              success: passed,
              score: percentage,
            });
          }
          break;
        }
      }
    },
    [
      scenario.nodes,
      scenario.connections,
      variables,
      pathHistory,
      decisions,
      score,
      startTime,
      onVariableChange,
      onComplete,
      calculateMaxScore,
      isActive,
      emitCompleted,
    ],
  );

  // Handle timer expiration
  const handleTimerExpired = useCallback(() => {
    if (!currentNode) return;

    // Find timeout connection
    const timeoutConnection = scenario.connections.find(
      (c) => c.from === currentNode.id && c.label === 'timeout',
    );

    if (timeoutConnection) {
      navigateToNode(timeoutConnection.to);
    }
  }, [currentNode, scenario.connections, navigateToNode]);

  // Start the scenario with xAPI tracking
  const handleStart = useCallback(() => {
    if (!startNode) return;

    setStartTime(Date.now());
    setCurrentNodeId(startNode.id);
    setPathHistory([startNode.id]);
    setScore(0);
    setDecisions([]);
    setIsComplete(false);
    setEndResult(null);

    // Emit launched xAPI statement
    if (isActive) {
      emitLaunched();
    }
  }, [startNode, isActive, emitLaunched]);

  // Reset the scenario
  const handleReset = useCallback(() => {
    setCurrentNodeId(null);
    setPathHistory([]);
    setDecisions([]);
    setScore(0);
    setStartTime(null);
    setIsComplete(false);
    setEndResult(null);
    setTimerValue(null);
    setTimerActive(false);

    // Reset variables
    const initialVars: Record<string, ScenarioVariable> = {};
    scenario.variables?.forEach((v) => {
      initialVars[v.name] = {
        ...v,
        value: v.defaultValue,
      };
    });
    setVariables(initialVars);
    onRestart?.();
  }, [scenario.variables, onRestart]);

  // Timer effect
  useEffect(() => {
    if (!timerActive || timerValue === null) return;

    const interval = setInterval(() => {
      setTimerValue((prev) => {
        if (prev === null || prev <= 0) {
          setTimerActive(false);
          // Handle timer expiration - go to timeout path
          handleTimerExpired();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timerValue, handleTimerExpired]);

  // Handle option selection with xAPI tracking
  const handleSelectOption = useCallback(
    (option: DecisionOption, nodeTitle: string) => {
      if (!currentNode) return;

      // Stop unknown active timer
      setTimerActive(false);
      setTimerValue(null);

      // Record decision
      setDecisions((prev) => [
        ...prev,
        {
          nodeId: currentNode.id,
          nodeTitle,
          optionSelected: option.text,
          timestamp: Date.now(),
        },
      ]);

      // Add points if applicable
      const pointsToAdd = option.points;
      if (pointsToAdd !== undefined) {
        setScore((prev) => prev + pointsToAdd);
      }

      // Emit xAPI scenario choice
      if (isActive) {
        const targetNodeId =
          option.targetNodeId ||
          scenario.connections.find((c) => c.from === currentNode.id && c.optionId === option.id)
            ?.to ||
          'unknown';

        emitScenarioChoice({
          choiceId: option.id,
          choiceText: option.text,
          branchId: targetNodeId,
          isOptimal: option.points ? option.points > 0 : undefined,
        });
      }

      // Navigate to target
      if (option.targetNodeId) {
        navigateToNode(option.targetNodeId);
      } else {
        // Find connection by option ID
        const connection = scenario.connections.find(
          (c) => c.from === currentNode.id && c.optionId === option.id,
        );
        if (connection) {
          navigateToNode(connection.to);
        }
      }
    },
    [currentNode, scenario.connections, navigateToNode, isActive, emitScenarioChoice],
  );

  // Handle continue (single path)
  const handleContinue = useCallback(() => {
    if (!currentNode) return;

    const connection = scenario.connections.find((c) => c.from === currentNode.id);
    if (connection) {
      navigateToNode(connection.to);
    }
  }, [currentNode, scenario.connections, navigateToNode]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render start screen
  if (!currentNodeId && !isComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-linear-to-br from-accent-purple to-studio-accent flex items-center justify-center">
            <Play className="w-10 h-10 text-brand-primary" />
          </div>
          <h2 className="text-2xl font-bold text-brand-primary mb-2">{title || 'Scenario'}</h2>
          {description && <p className="text-studio-text mb-6">{description}</p>}
          <button
            type="button"
            onClick={handleStart}
            disabled={!startNode}
            className="px-8 py-3 bg-accent-purple hover:bg-accent-purple-dark disabled:bg-gray-500 text-brand-primary rounded-xl font-medium transition-colors"
          >
            Start Scenario
          </button>
          {!startNode && (
            <p className="mt-4 text-sm text-brand-error">No start node found in scenario</p>
          )}
        </div>
      </div>
    );
  }

  // Render completion screen
  if (isComplete && endResult) {
    const percentage =
      endResult.maxScore > 0 ? Math.round((endResult.score / endResult.maxScore) * 100) : 100;

    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md"
        >
          <div
            className={`
            w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center
            ${
              endResult.endType === 'complete'
                ? 'bg-brand-success'
                : endResult.endType === 'fail'
                  ? 'bg-brand-error'
                  : 'bg-brand-warning'
            }
          `}
          >
            {endResult.endType === 'complete' ? (
              <CheckCircle className="w-10 h-10 text-brand-primary" />
            ) : endResult.endType === 'fail' ? (
              <XCircle className="w-10 h-10 text-brand-primary" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-brand-primary" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-brand-primary mb-2">
            {endResult.endType === 'complete'
              ? 'Scenario Complete!'
              : endResult.endType === 'fail'
                ? 'Scenario Failed'
                : 'Scenario Ended'}
          </h2>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 my-6 text-left">
            <div className="bg-studio-bg p-4 rounded-lg">
              <p className="text-xs text-studio-text-muted uppercase tracking-wider">Score</p>
              <p className="text-2xl font-bold text-brand-primary">{endResult.score}</p>
              <p className="text-sm text-studio-text-muted">of {endResult.maxScore} possible</p>
            </div>
            <div className="bg-studio-bg p-4 rounded-lg">
              <p className="text-xs text-studio-text-muted uppercase tracking-wider">Percentage</p>
              <p className="text-2xl font-bold text-brand-primary">{percentage}%</p>
              <div className="mt-1 h-1.5 bg-studio-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-purple rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            <div className="bg-studio-bg p-4 rounded-lg">
              <p className="text-xs text-studio-text-muted uppercase tracking-wider">Time Spent</p>
              <p className="text-2xl font-bold text-brand-primary">
                {formatTime(endResult.timeSpent)}
              </p>
            </div>
            <div className="bg-studio-bg p-4 rounded-lg">
              <p className="text-xs text-studio-text-muted uppercase tracking-wider">Decisions</p>
              <p className="text-2xl font-bold text-brand-primary">{endResult.decisions.length}</p>
            </div>
          </div>

          {/* Decision history */}
          {endResult.decisions.length > 0 && (
            <div className="mb-6 text-left">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-sm text-studio-text-muted hover:text-brand-primary transition-colors"
              >
                <History className="w-4 h-4" />
                View Decision History
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-90' : ''}`}
                />
              </button>

              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 space-y-2 max-h-48 overflow-y-auto"
                  >
                    {endResult.decisions.map((decision, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-studio-surface flex items-center justify-center text-xs text-studio-text-muted shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-brand-primary">{decision.nodeTitle}</p>
                          <p className="text-studio-text-muted">→ {decision.optionSelected}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-8 py-3 bg-studio-surface hover:bg-studio-surface/80 text-brand-primary rounded-xl font-medium transition-colors mx-auto"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  // Render current node
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-studio-surface/30">
        <div className="flex items-center gap-4">
          <span className="text-sm text-studio-text-muted">Step {pathHistory.length}</span>
          {score > 0 && (
            <span className="text-sm text-accent-purple font-medium">Score: {score}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {timerActive && timerValue !== null && (
            <div className="flex items-center gap-1 px-3 py-1 bg-brand-warning/20 rounded-lg">
              <Clock className="w-4 h-4 text-brand-warning" />
              <span className="text-brand-warning font-mono">{formatTime(timerValue)}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 text-studio-text-muted hover:text-brand-primary transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-2 text-studio-text-muted hover:text-brand-primary transition-colors"
            title="Restart"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {currentNode && (
            <motion.div
              key={currentNode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              {/* Node content based on type */}
              {renderNodeContent(currentNode, handleSelectOption, handleContinue)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Variables panel (debug) */}
      {Object.keys(variables).length > 0 && (
        <div className="px-4 py-2 border-t border-studio-surface/30 bg-studio-bg/50">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-studio-text-muted">Variables:</span>
            {Object.entries(variables).map(([name, variable]) => (
              <span key={name} className="text-studio-text">
                <span className="text-accent-purple">{name}</span>: {JSON.stringify(variable.value)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Render node content based on type
 */
function renderNodeContent(
  node: ScenarioNode,
  onSelectOption: (option: DecisionOption, title: string) => void,
  onContinue: () => void,
) {
  switch (node.type) {
    case 'start':
      return (
        <div className="text-center">
          <p className="text-lg text-studio-text mb-8">
            {node.data.content || 'Beginning scenario...'}
          </p>
          <button
            type="button"
            onClick={onContinue}
            className="flex items-center gap-2 px-6 py-3 bg-accent-purple hover:bg-accent-purple-dark text-brand-primary rounded-xl font-medium transition-colors mx-auto"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      );

    case 'content':
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-brand-primary">
            {node.data.title || 'Information'}
          </h3>
          <div
            className="prose prose-invert max-w-none text-studio-text"
            {...safeInnerHtml(node.data.content || '', 'rich')}
          />
          <button
            type="button"
            onClick={onContinue}
            className="flex items-center gap-2 px-6 py-3 bg-studio-accent hover:bg-studio-accent-hover text-brand-primary rounded-xl font-medium transition-colors"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      );

    case 'decision':
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-brand-primary">
            {node.data.title || 'Make a Choice'}
          </h3>
          {node.data.content && <p className="text-studio-text">{node.data.content}</p>}
          <div className="space-y-3">
            {((node.data.options as DecisionOption[]) || []).map((option, index) => (
              <motion.button
                key={option.id}
                onClick={() => onSelectOption(option, node.data.title || 'Decision')}
                className="w-full p-4 text-left bg-studio-bg border border-studio-surface/50 rounded-xl hover:border-accent-purple/50 hover:bg-accent-purple/5 transition-all group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-studio-surface flex items-center justify-center text-studio-text-muted group-hover:bg-accent-purple group-hover:text-brand-primary transition-colors">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-brand-primary group-hover:text-brand-primary transition-colors">
                    {option.text}
                  </span>
                  <ArrowRight className="w-5 h-5 text-studio-text-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      );

    case 'dialogue':
      return (
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6 text-accent-purple" />
            </div>
            <div className="flex-1">
              {node.data.characterId && (
                <p className="text-sm font-medium text-accent-purple mb-1">
                  {node.data.characterId}
                </p>
              )}
              <div className="bg-studio-bg border border-studio-surface/50 rounded-xl p-4">
                <p className="text-studio-text">{node.data.text || 'Character dialogue...'}</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="flex items-center gap-2 px-6 py-3 bg-studio-accent hover:bg-studio-accent-hover text-brand-primary rounded-xl font-medium transition-colors ml-16"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      );

    case 'question': {
      const questionData = node.data.question;
      const questionText =
        typeof questionData === 'object' && questionData ? questionData.question : 'Question?';
      const questionPoints =
        typeof questionData === 'object' && questionData ? questionData.points : undefined;

      return (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-pink-500">
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Question</span>
            {questionPoints && <span className="ml-auto text-sm">{questionPoints} pts</span>}
          </div>
          <h3 className="text-xl font-semibold text-brand-primary">{questionText}</h3>
          <div className="space-y-3">
            {((node.data.options as DecisionOption[]) || []).map((option, index) => (
              <motion.button
                key={option.id}
                onClick={() => onSelectOption(option, questionText)}
                className="w-full p-4 text-left bg-studio-bg border border-studio-surface/50 rounded-xl hover:border-pink-500/50 hover:bg-pink-500/5 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-studio-surface flex items-center justify-center text-studio-text-muted">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-studio-text">{option.text}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      );
    }

    case 'feedback': {
      const feedbackColors = {
        success: {
          bg: 'bg-brand-success/10',
          border: 'border-brand-success/30',
          text: 'text-brand-success',
          icon: CheckCircle,
        },
        warning: {
          bg: 'bg-brand-warning/10',
          border: 'border-amber-500/30',
          text: 'text-brand-warning',
          icon: AlertTriangle,
        },
        error: {
          bg: 'bg-brand-error/10',
          border: 'border-brand-error/30',
          text: 'text-brand-error',
          icon: XCircle,
        },
        info: {
          bg: 'bg-brand-primary/10',
          border: 'border-brand-primary/30',
          text: 'text-brand-cyan',
          icon: MessageCircle,
        },
      };
      const feedbackType = (node.data.feedbackType as keyof typeof feedbackColors) || 'info';
      const colors = feedbackColors[feedbackType];
      const FeedbackIcon = colors.icon;

      return (
        <div className="space-y-6">
          <div className={`p-6 rounded-xl ${colors.bg} border ${colors.border}`}>
            <div className="flex items-start gap-4">
              <FeedbackIcon className={`w-6 h-6 ${colors.text} shrink-0`} />
              <div>
                <h4 className={`font-medium ${colors.text} mb-2`}>
                  {node.data.title || 'Feedback'}
                </h4>
                <p className="text-studio-text">
                  {node.data.content || node.data.text || 'Feedback message'}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="flex items-center gap-2 px-6 py-3 bg-studio-accent hover:bg-studio-accent-hover text-brand-primary rounded-xl font-medium transition-colors"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      );
    }

    case 'timer':
      return (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-brand-warning/20 flex items-center justify-center">
            <Clock className="w-10 h-10 text-brand-warning" />
          </div>
          <h3 className="text-xl font-semibold text-brand-primary">
            {node.data.title || 'Time Limit'}
          </h3>
          <p className="text-studio-text">
            You have{' '}
            <span className="text-brand-warning font-bold">{node.data.duration || 30}</span> seconds
            to make your next decision.
          </p>
          <button
            type="button"
            onClick={onContinue}
            className="flex items-center gap-2 px-6 py-3 bg-brand-warning hover:bg-amber-600 text-brand-primary rounded-xl font-medium transition-colors mx-auto"
          >
            Start Timer
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      );

    case 'media':
      return (
        <div className="space-y-6">
          {node.data.title && (
            <h3 className="text-xl font-semibold text-brand-primary">{node.data.title}</h3>
          )}
          <div className="aspect-video bg-studio-bg rounded-xl overflow-hidden">
            {node.data.mediaType === 'image' && node.data.src && (
              <Image
                src={node.data.src}
                alt=""
                width={800}
                height={450}
                unoptimized
                className="w-full h-full object-contain"
              />
            )}
            {node.data.mediaType === 'video' && node.data.src && (
              <video src={node.data.src} controls className="w-full h-full">
                <track kind="captions" srcLang="en" label="English captions" />
              </video>
            )}
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="flex items-center gap-2 px-6 py-3 bg-studio-accent hover:bg-studio-accent-hover text-brand-primary rounded-xl font-medium transition-colors"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      );

    default:
      return (
        <div className="text-center space-y-4">
          <p className="text-studio-text">
            {node.data.content || node.data.label || 'Processing...'}
          </p>
          <button
            type="button"
            onClick={onContinue}
            className="flex items-center gap-2 px-6 py-3 bg-studio-accent hover:bg-studio-accent-hover text-brand-primary rounded-xl font-medium transition-colors mx-auto"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      );
  }
}

export default ScenarioPreview;
