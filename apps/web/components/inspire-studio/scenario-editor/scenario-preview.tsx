'use client';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  FileText,
  GitBranch,
  Play,
  RotateCcw,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Connection, ScenarioData } from './types';

interface ScenarioPreviewProps {
  scenario: ScenarioData;
  onExit: () => void;
}

interface HistoryEntry {
  nodeId: string;
  optionChosen?: string;
}

export function ScenarioPreview({ scenario, onExit }: ScenarioPreviewProps): React.JSX.Element {
  const startNode = useMemo(() => {
    return scenario.nodes.find((n) => n.type === 'start') || scenario.nodes[0];
  }, [scenario.nodes]);

  const [currentNodeId, setCurrentNodeId] = useState<string>(startNode?.id || '');
  const [history, setHistory] = useState<HistoryEntry[]>([{ nodeId: startNode?.id || '' }]);
  const [isComplete, setIsComplete] = useState(false);

  const currentNode = useMemo(() => {
    return scenario.nodes.find((n) => n.id === currentNodeId);
  }, [scenario.nodes, currentNodeId]);

  const getOutgoingConnections = useCallback(
    (nodeId: string, optionId?: string): Connection[] => {
      return scenario.connections.filter((c) => {
        if (c.sourceNodeId !== nodeId) return false;
        if (optionId && c.sourceHandle !== optionId) return false;
        if (!optionId && c.sourceHandle) return false;
        return true;
      });
    },
    [scenario.connections],
  );

  const navigateToNode = useCallback(
    (nodeId: string, optionChosen?: string) => {
      const targetNode = scenario.nodes.find((n) => n.id === nodeId);
      if (targetNode) {
        setCurrentNodeId(nodeId);
        setHistory((prev) => [...prev, { nodeId, optionChosen }]);
        if (targetNode.type === 'end') {
          setIsComplete(true);
        }
      }
    },
    [scenario.nodes],
  );

  const handleOptionSelect = useCallback(
    (optionId: string) => {
      const connections = getOutgoingConnections(currentNodeId, optionId);
      if (connections.length > 0) {
        const option = currentNode?.data.options?.find((o) => o.id === optionId);
        navigateToNode(connections[0].targetNodeId, option?.label);
      }
    },
    [currentNodeId, currentNode, getOutgoingConnections, navigateToNode],
  );

  const handleContinue = useCallback(() => {
    const connections = getOutgoingConnections(currentNodeId);
    if (connections.length > 0) {
      navigateToNode(connections[0].targetNodeId);
    }
  }, [currentNodeId, getOutgoingConnections, navigateToNode]);

  const handleBack = useCallback(() => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const previousEntry = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentNodeId(previousEntry.nodeId);
      setIsComplete(false);
    }
  }, [history]);

  const handleRestart = useCallback(() => {
    setCurrentNodeId(startNode?.id || '');
    setHistory([{ nodeId: startNode?.id || '' }]);
    setIsComplete(false);
  }, [startNode]);

  if (!currentNode) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-brand-page">
        <p className="text-brand-muted">No scenario to preview</p>
        <Button variant="outline" onClick={onExit} className="mt-4">
          Exit Preview
        </Button>
      </div>
    );
  }

  const outgoingConnections =
    currentNode.type === 'decision'
      ? [] // Decision nodes use options instead
      : getOutgoingConnections(currentNodeId);
  const canContinue = outgoingConnections.length > 0;

  return (
    <div className="flex flex-col h-full bg-linear-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-brand-surface border-b shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onExit}>
            <X className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{scenario.title}</h2>
            <p className="text-sm text-brand-muted">Preview Mode</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            className="flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </Button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="px-6 py-3 bg-brand-surface border-b">
        <div className="flex items-center gap-2 text-sm text-brand-muted">
          {history.map((entry, index) => {
            const node = scenario.nodes.find((n) => n.id === entry.nodeId);
            const isLast = index === history.length - 1;
            return (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <ArrowRight className="w-3 h-3" />}
                <span
                  className={cn(
                    'px-2 py-1 rounded text-xs',
                    isLast ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-brand-surface',
                  )}
                >
                  {node?.data.title || 'Unknown'}
                  {entry.optionChosen && (
                    <span className="text-brand-muted ml-1">({entry.optionChosen})</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          className={cn(
            'max-w-2xl w-full bg-brand-surface rounded-xl shadow-lg overflow-hidden',
            isComplete && 'ring-4 ring-green-200',
          )}
        >
          {/* Node Header */}
          <div
            className={cn(
              'px-6 py-4 flex items-center gap-3',
              currentNode.type === 'start' && 'bg-green-50 border-b border-green-200',
              currentNode.type === 'content' && 'bg-blue-50 border-b border-blue-200',
              currentNode.type === 'decision' && 'bg-amber-50 border-b border-amber-200',
              currentNode.type === 'end' && 'bg-red-50 border-b border-red-200',
            )}
          >
            {currentNode.type === 'start' && <Play className="w-5 h-5 text-green-600" />}
            {currentNode.type === 'content' && <FileText className="w-5 h-5 text-brand-blue" />}
            {currentNode.type === 'decision' && <GitBranch className="w-5 h-5 text-amber-600" />}
            {currentNode.type === 'end' && <CheckCircle className="w-5 h-5 text-red-600" />}
            <h3
              className={cn(
                'text-lg font-semibold',
                currentNode.type === 'start' && 'text-green-800',
                currentNode.type === 'content' && 'text-blue-800',
                currentNode.type === 'decision' && 'text-amber-800',
                currentNode.type === 'end' && 'text-red-800',
              )}
            >
              {currentNode.data.title}
            </h3>
          </div>

          {/* Node Content */}
          <div className="p-6">
            {currentNode.data.content && (
              <div className="prose prose-sm max-w-none mb-6">
                <p className="text-brand-secondary whitespace-pre-wrap">
                  {currentNode.data.content}
                </p>
              </div>
            )}

            {currentNode.data.media && (
              <div className="mb-6">
                {currentNode.data.media.type === 'image' && (
                  <Image
                    src={currentNode.data.media.url}
                    alt="Content media"
                    width={800}
                    height={450}
                    unoptimized
                    className="max-w-full h-auto rounded-lg"
                  />
                )}
                {currentNode.data.media.type === 'video' && (
                  <video
                    src={currentNode.data.media.url}
                    controls
                    className="max-w-full rounded-lg"
                  >
                    <track kind="captions" />
                  </video>
                )}
              </div>
            )}

            {/* Decision Options */}
            {currentNode.type === 'decision' && currentNode.data.options && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-brand-secondary mb-4">Choose an option:</p>
                {currentNode.data.options.map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-lg border-2 transition-all',
                      'hover:border-amber-400 hover:bg-amber-50',
                      'focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
                    )}
                  >
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* End state */}
            {currentNode.type === 'end' && (
              <div className="text-center py-4">
                <CheckCircle className="w-16 h-16 text-brand-success mx-auto mb-4" />
                <p className="text-lg font-medium text-brand-primary">Scenario Complete!</p>
                <p className="text-sm text-brand-muted mt-2">
                  You completed the scenario in {history.length} steps.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-brand-page border-t flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={history.length <= 1}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {currentNode.type !== 'decision' && currentNode.type !== 'end' && (
              <Button
                onClick={handleContinue}
                disabled={!canContinue}
                className="flex items-center gap-1"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}

            {currentNode.type === 'end' && (
              <Button onClick={handleRestart} className="flex items-center gap-1">
                <RotateCcw className="w-4 h-4" />
                Restart Scenario
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
