'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  GitBranch,
  Layers,
  Maximize2,
  Minimize2,
  Play,
  Settings,
  Variable,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import type { ScenarioBlockContent, ScenarioConfig } from '@/types/blocks';
import type { BlockComponentProps } from '../block-renderer';
import { ScenarioAnalytics } from './scenario-analytics';
import { ScenarioEditor } from './scenario-editor';
import { ScenarioPreview } from './scenario-preview';

/**
 * ScenarioBlock - Container for branching scenarios
 */
export function ScenarioBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<ScenarioBlockContent>): React.JSX.Element {
  const content = block.content as ScenarioBlockContent;
  const [mode, setMode] = useState<'edit' | 'preview' | 'analytics'>('edit');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVariables, setShowVariables] = useState(false);

  // Initialize scenario config
  const scenario: ScenarioConfig = useMemo(() => {
    return (
      content.scenario || {
        nodes: [
          {
            id: 'start-node',
            type: 'start',
            position: { x: 100, y: 100 },
            data: { label: 'Start' },
          },
        ],
        connections: [],
        variables: [],
        settings: {
          allowRestart: true,
          showProgress: true,
          trackAnalytics: true,
          autoSave: true,
          enableTimer: false,
        },
      }
    );
  }, [content.scenario]);

  // Stats
  const stats = useMemo(() => {
    const nodeCount = scenario.nodes.length;
    const connectionCount = scenario.connections.length;
    const decisionCount = scenario.nodes.filter((n) => n.type === 'decision').length;
    const endCount = scenario.nodes.filter((n) => n.type === 'end').length;
    return { nodeCount, connectionCount, decisionCount, endCount };
  }, [scenario]);

  // Handle scenario update
  const handleScenarioUpdate = (updates: Partial<ScenarioConfig>): void => {
    onUpdate({
      content: {
        ...content,
        scenario: {
          ...scenario,
          ...updates,
        },
      },
    });
  };

  // Container class based on fullscreen
  const containerClass = isFullscreen ? 'fixed inset-0 z-50 bg-studio-bg-dark' : 'relative';

  // Preview mode for learners
  if (!isEditing) {
    return (
      <ScenarioPreview
        scenario={scenario}
        title={content.title}
        description={content.description}
        onComplete={() => {}}
      />
    );
  }

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-studio-bg border-b border-studio-surface/50">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-(--color-block-scenario) to-purple-600 flex items-center justify-center shadow-lg shadow-(--color-block-scenario)/20">
            <GitBranch className="w-5 h-5 text-brand-primary" />
          </div>

          {/* Title */}
          <div>
            <input
              type="text"
              value={content.title || 'Branching Scenario'}
              onChange={(e) => onUpdate({ content: { ...content, title: e.target.value } })}
              className="bg-transparent text-lg font-semibold text-brand-primary outline-hidden border-b border-transparent focus:border-(--color-block-scenario) transition-colors"
              placeholder="Scenario Title"
            />
            <div className="flex items-center gap-3 mt-1 text-xs text-studio-text-muted">
              <span>{stats.nodeCount} nodes</span>
              <span className="w-1 h-1 rounded-full bg-studio-text-muted" />
              <span>{stats.connectionCount} connections</span>
              <span className="w-1 h-1 rounded-full bg-studio-text-muted" />
              <span>{stats.decisionCount} decisions</span>
              <span className="w-1 h-1 rounded-full bg-studio-text-muted" />
              <span>{stats.endCount} endings</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Mode switcher */}
          <div className="flex items-center bg-studio-surface/30 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                mode === 'edit'
                  ? 'bg-(--color-block-scenario) text-brand-primary'
                  : 'text-studio-text-muted hover:text-brand-primary'
              }`}
            >
              <Layers className="w-4 h-4" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                mode === 'preview'
                  ? 'bg-(--color-block-scenario) text-brand-primary'
                  : 'text-studio-text-muted hover:text-brand-primary'
              }`}
            >
              <Play className="w-4 h-4" />
              Preview
            </button>
            <button
              type="button"
              onClick={() => setMode('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                mode === 'analytics'
                  ? 'bg-(--color-block-scenario) text-brand-primary'
                  : 'text-studio-text-muted hover:text-brand-primary'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          </div>

          {/* Variables panel toggle */}
          <button
            type="button"
            onClick={() => setShowVariables(!showVariables)}
            className={`p-2 rounded-lg transition-colors ${
              showVariables
                ? 'bg-(--color-block-scenario)/20 text-(--color-block-scenario)'
                : 'text-studio-text-muted hover:text-brand-primary hover:bg-studio-surface/50'
            }`}
            title="Variables"
          >
            <Variable className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button
            type="button"
            className="p-2 text-studio-text-muted hover:text-brand-primary hover:bg-studio-surface/50 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-studio-text-muted hover:text-brand-primary hover:bg-studio-surface/50 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className={`flex ${isFullscreen ? 'h-[calc(100vh-60px)]' : 'h-[600px]'}`}>
        {/* Editor / Preview / Analytics */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {mode === 'edit' && (
              <motion.div
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <ScenarioEditor scenario={scenario} onUpdate={handleScenarioUpdate} />
              </motion.div>
            )}
            {mode === 'preview' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <ScenarioPreview
                  scenario={scenario}
                  title={content.title}
                  description={content.description}
                  onComplete={() => {}}
                  onRestart={() => {}}
                />
              </motion.div>
            )}
            {mode === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <ScenarioAnalytics config={scenario} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Variables panel */}
        <AnimatePresence>
          {showVariables && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-studio-bg border-l border-studio-surface/50 overflow-hidden"
            >
              <VariablesPanel
                variables={scenario.variables}
                onUpdate={(variables) => handleScenarioUpdate({ variables })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Variables panel component
 */
function VariablesPanel({
  variables,
  onUpdate,
}: {
  variables: ScenarioConfig['variables'];
  onUpdate: (variables: ScenarioConfig['variables']) => void;
}): React.JSX.Element {
  const [newVarName, setNewVarName] = useState('');
  const [newVarType, setNewVarType] = useState<'string' | 'number' | 'boolean'>('string');

  const addVariable = (): void => {
    if (!newVarName.trim()) return;

    const defaultValue = newVarType === 'number' ? 0 : newVarType === 'boolean' ? false : '';

    onUpdate([
      ...variables,
      {
        id: `var-${Date.now()}`,
        name: newVarName,
        type: newVarType,
        defaultValue,
      },
    ]);
    setNewVarName('');
  };

  const deleteVariable = (id: string): void => {
    onUpdate(variables.filter((v) => v.id !== id));
  };

  const updateVariable = (id: string, updates: Partial<(typeof variables)[0]>): void => {
    onUpdate(variables.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-studio-surface/50">
        <h3 className="font-medium text-brand-primary">Variables</h3>
        <p className="text-xs text-studio-text-muted mt-1">Track learner progress and decisions</p>
      </div>

      {/* Variable list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {variables.map((variable) => (
          <div
            key={variable.id}
            className="p-3 bg-studio-bg-dark rounded-lg border border-studio-surface/30"
          >
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={variable.name}
                onChange={(e) => updateVariable(variable.id, { name: e.target.value })}
                className="bg-transparent text-brand-primary font-medium outline-hidden flex-1"
              />
              <button
                type="button"
                onClick={() => deleteVariable(variable.id)}
                className="text-studio-text-muted hover:text-brand-error transition-colors"
              >
                &times;
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`
                text-xs px-2 py-0.5 rounded
                ${
                  variable.type === 'string'
                    ? 'bg-brand-primary/20 text-brand-cyan'
                    : variable.type === 'number'
                      ? 'bg-brand-success/20 text-brand-success'
                      : 'bg-brand-warning/20 text-brand-warning'
                }
              `}
              >
                {variable.type}
              </span>
              <span className="text-xs text-studio-text-muted">
                = {JSON.stringify(variable.defaultValue)}
              </span>
            </div>
          </div>
        ))}

        {variables.length === 0 && (
          <div className="text-center py-8 text-studio-text-muted">
            <Variable className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No variables yet</p>
            <p className="text-xs mt-1">Add variables to track learner choices</p>
          </div>
        )}
      </div>

      {/* Add new variable */}
      <div className="p-3 border-t border-studio-surface/50">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newVarName}
            onChange={(e) => setNewVarName(e.target.value)}
            placeholder="Variable name"
            className="flex-1 px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm placeholder:text-studio-text-muted outline-hidden focus:border-(--color-block-scenario)/50"
            onKeyDown={(e) => e.key === 'Enter' && addVariable()}
          />
          <select
            value={newVarType}
            onChange={(e) => setNewVarType(e.target.value as 'string' | 'number' | 'boolean')}
            className="px-2 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary text-sm outline-hidden"
          >
            <option value="string">Text</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
          </select>
        </div>
        <button
          type="button"
          onClick={addVariable}
          className="w-full py-2 bg-(--color-block-scenario)/20 hover:bg-(--color-block-scenario)/30 text-(--color-block-scenario) rounded-lg text-sm transition-colors"
        >
          Add Variable
        </button>
      </div>
    </div>
  );
}

export default ScenarioBlock;
