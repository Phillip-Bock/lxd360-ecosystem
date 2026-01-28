'use client';

import {
  AlertCircle,
  Circle,
  Clock,
  Diamond,
  GitBranch,
  HelpCircle,
  Image as ImageIcon,
  type LucideIcon,
  MessageCircle,
  Play,
  Plus,
  Settings,
  Shuffle,
  Square,
  Trash2,
  Variable,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { stripHtml } from '@/lib/sanitize';
import type { DecisionOption, ScenarioNode, ScenarioNodeType } from '@/types/blocks';

const NODE_CONFIG: Record<
  ScenarioNodeType,
  {
    icon: LucideIcon;
    color: string;
    minOutputs: number;
    maxInputs: number;
  }
> = {
  start: { icon: Play, color: 'var(--success)', minOutputs: 1, maxInputs: 0 },
  end: { icon: Circle, color: 'var(--error)', minOutputs: 0, maxInputs: Infinity },
  content: { icon: Square, color: 'var(--info)', minOutputs: 1, maxInputs: Infinity },
  decision: { icon: Diamond, color: 'var(--warning)', minOutputs: 2, maxInputs: Infinity },
  dialogue: {
    icon: MessageCircle,
    color: 'var(--color-block-scenario)',
    minOutputs: 1,
    maxInputs: Infinity,
  },
  question: { icon: HelpCircle, color: 'var(--accent-pink)', minOutputs: 2, maxInputs: Infinity },
  condition: { icon: GitBranch, color: 'var(--accent-cyan)', minOutputs: 2, maxInputs: Infinity },
  variable: { icon: Variable, color: 'var(--accent-purple)', minOutputs: 1, maxInputs: Infinity },
  feedback: { icon: MessageCircle, color: 'var(--success)', minOutputs: 1, maxInputs: Infinity },
  timer: { icon: Clock, color: 'var(--accent-orange)', minOutputs: 2, maxInputs: Infinity },
  random: { icon: Shuffle, color: 'var(--accent-indigo)', minOutputs: 2, maxInputs: Infinity },
  media: { icon: ImageIcon, color: 'var(--accent-teal)', minOutputs: 1, maxInputs: Infinity },
  custom: { icon: Square, color: 'var(--studio-text-muted)', minOutputs: 1, maxInputs: Infinity },
};

interface ScenarioNodeProps {
  node: ScenarioNode;
  isSelected: boolean;
  isConnecting: boolean;
  onSelect: () => void;
  onMove: (position: { x: number; y: number }) => void;
  onUpdate: (data: Partial<ScenarioNode['data']>) => void;
  onDelete: () => void;
  onStartConnection: () => void;
  onCompleteConnection: (optionId?: string) => void;
  zoom: number;
}

/**
 * ScenarioNodeComponent - Individual node in the scenario editor
 */
export function ScenarioNodeComponent({
  node,
  isSelected,
  isConnecting,
  onSelect,
  onMove,
  onUpdate,
  onDelete,
  onStartConnection,
  onCompleteConnection,
  zoom,
}: ScenarioNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);

  const config = NODE_CONFIG[node.type] || NODE_CONFIG.content;
  const Icon = config.icon;

  // Handle drag start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();

      setIsDragging(true);
      setDragStart({
        x: e.clientX / zoom - node.position.x,
        y: e.clientY / zoom - node.position.y,
      });
      onSelect();
    },
    [node.position, zoom, onSelect],
  );

  // Global drag handling
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      onMove({
        x: e.clientX / zoom - dragStart.x,
        y: e.clientY / zoom - dragStart.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, zoom, onMove]);

  return (
    <article
      ref={nodeRef}
      aria-label={`Scenario node: ${node.data.title || node.data.label || node.type}. ${isSelected ? 'Selected.' : ''} Double-click to edit.`}
      className={`
        absolute w-60 rounded-xl overflow-hidden select-none
        transition-shadow duration-200 bg-studio-bg
        ${isSelected ? 'ring-2 ring-(--color-block-scenario) shadow-lg shadow-(--color-block-scenario)/20' : ''}
        ${isDragging ? 'cursor-grabbing z-50' : 'cursor-grab'}
      `}
      style={{
        left: node.position.x,
        top: node.position.y,
        border: `2px solid ${config.color}40`,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ backgroundColor: `${config.color}20` }}
      >
        <Icon className="w-4 h-4" style={{ color: config.color }} />

        {/* Title - editable */}
        {isEditing ? (
          <input
            type="text"
            value={node.data.title || node.data.label || ''}
            onChange={(e) => onUpdate({ title: e.target.value, label: e.target.value })}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            className="flex-1 bg-transparent text-brand-primary text-sm font-medium outline-hidden"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 text-sm font-medium text-brand-primary truncate">
            {node.data.title || node.data.label || node.type}
          </span>
        )}

        {/* Actions */}
        {isSelected && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1 text-studio-text-muted hover:text-brand-primary transition-colors"
              title="Edit"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 text-studio-text-muted hover:text-brand-error transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Content preview based on node type */}
      <div className="px-3 py-2 min-h-[40px]">
        <NodeContentPreview node={node} onUpdate={onUpdate} isEditing={isEditing} />
      </div>

      {/* Input connector (left side) */}
      {config.maxInputs > 0 && (
        <button
          type="button"
          className={`
            absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2
            w-4 h-4 rounded-full border-2 transition-all z-10
            ${
              isConnecting
                ? 'bg-[var(--color-block-scenario)] border-[var(--color-block-scenario)] scale-125'
                : 'bg-studio-bg border-studio-text-muted hover:border-[var(--color-block-scenario)] hover:bg-[var(--color-block-scenario)]'
            }
          `}
          onClick={(e) => {
            e.stopPropagation();
            onCompleteConnection();
          }}
          title="Connect here"
        />
      )}

      {/* Output connector (right side) - for single output nodes */}
      {node.type !== 'decision' && config.minOutputs > 0 && (
        <button
          type="button"
          className={`
            absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2
            w-4 h-4 rounded-full border-2 transition-all z-10
            bg-studio-bg border-studio-text-muted hover:border-[var(--color-block-scenario)] hover:bg-[var(--color-block-scenario)]
          `}
          onClick={(e) => {
            e.stopPropagation();
            onStartConnection();
          }}
          title="Drag to connect"
        />
      )}

      {/* Decision options with individual connectors */}
      {node.type === 'decision' && node.data.options && (
        <div className="absolute -right-2 top-full mt-1 space-y-1">
          {(node.data.options as DecisionOption[]).map((option) => (
            <div key={option.id} className="flex items-center gap-2">
              <span className="text-xs text-studio-text-muted max-w-[80px] truncate text-right">
                {option.text}
              </span>
              <button
                type="button"
                className="w-3 h-3 rounded-full border-2 transition-colors"
                style={{
                  borderColor: config.color,
                  backgroundColor: 'transparent',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onStartConnection();
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = config.color;
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                }}
                title={`Connect "${option.text}"`}
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

/**
 * Node content preview component
 */
function NodeContentPreview({
  node,
  onUpdate,
  isEditing,
}: {
  node: ScenarioNode;
  onUpdate: (data: Partial<ScenarioNode['data']>) => void;
  isEditing: boolean;
}) {
  switch (node.type) {
    case 'start':
      return <div className="text-xs text-studio-text-muted">Scenario begins here</div>;

    case 'end':
      return (
        <div className="flex items-center gap-2">
          <span
            className={`
            text-xs px-2 py-0.5 rounded
            ${
              node.data.endType === 'complete'
                ? 'bg-brand-success/20 text-brand-success'
                : node.data.endType === 'fail'
                  ? 'bg-brand-error/20 text-brand-error'
                  : 'bg-brand-warning/20 text-brand-warning'
            }
          `}
          >
            {node.data.endType || 'complete'}
          </span>
          {node.data.score !== undefined && (
            <span className="text-xs text-studio-text-muted">{node.data.score} pts</span>
          )}
        </div>
      );

    case 'content':
      // Use safe stripHtml function instead of regex for XSS prevention
      return (
        <div className="text-xs text-studio-text-muted line-clamp-2">
          {stripHtml(node.data.content || '').substring(0, 100) || 'No content'}
        </div>
      );

    case 'decision':
      return (
        <div className="space-y-1">
          {isEditing ? (
            <div className="space-y-2">
              {((node.data.options as DecisionOption[]) || []).map((option, index) => (
                <div key={option.id} className="flex items-center gap-2">
                  <span className="text-xs text-studio-text-muted w-4">{index + 1}.</span>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => {
                      const newOptions = [...(node.data.options as DecisionOption[])];
                      newOptions[index] = { ...option, text: e.target.value };
                      onUpdate({ options: newOptions });
                    }}
                    className="flex-1 text-xs bg-transparent text-brand-primary outline-hidden border-b border-studio-surface"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const newOptions = [
                    ...((node.data.options as DecisionOption[]) || []),
                    { id: `opt-${Date.now()}`, text: 'New option', targetNodeId: undefined },
                  ];
                  onUpdate({ options: newOptions });
                }}
                className="flex items-center gap-1 text-xs text-[var(--color-block-scenario)] hover:text-[var(--accent-purple-dark)]"
              >
                <Plus className="w-3 h-3" />
                Add option
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-brand-primary">{node.data.title}</p>
              <p className="text-[10px] text-studio-text-muted">
                {node.data.options?.length || 0} options
              </p>
            </>
          )}
        </div>
      );

    case 'dialogue':
      return (
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-[var(--color-block-scenario)]/20 shrink-0 flex items-center justify-center">
            <MessageCircle className="w-3 h-3 text-[var(--color-block-scenario)]" />
          </div>
          <p className="text-xs text-studio-text-muted line-clamp-2">
            {node.data.text || 'Character dialogue...'}
          </p>
        </div>
      );

    case 'question':
      return (
        <div className="space-y-1">
          <p className="text-xs text-brand-primary line-clamp-1">
            {typeof node.data.question === 'string'
              ? node.data.question
              : node.data.question?.question || 'Question?'}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-studio-text-muted">
              {node.data.options?.length || 0} answers
            </span>
            <span className="text-[10px] text-[var(--color-block-scenario)]">
              {node.data.points || 0} pts
            </span>
          </div>
        </div>
      );

    case 'condition':
      return (
        <div className="text-xs text-studio-text-muted">
          {node.data.conditions?.length || 0} conditions
        </div>
      );

    case 'variable':
      return (
        <div className="flex items-center gap-1 text-xs font-mono">
          <span className="text-[var(--accent-purple)]">{node.data.variable || 'var'}</span>
          <span className="text-studio-text-muted">
            {node.data.operation === 'set'
              ? '='
              : node.data.operation === 'increment'
                ? '+='
                : node.data.operation === 'decrement'
                  ? '-='
                  : '!'}
          </span>
          <span className="text-brand-primary">{JSON.stringify(node.data.value) || '?'}</span>
        </div>
      );

    case 'feedback':
      return (
        <div className="flex items-center gap-2">
          <AlertCircle
            className={`w-4 h-4 ${
              node.data.feedbackType === 'success'
                ? 'text-brand-success'
                : node.data.feedbackType === 'warning'
                  ? 'text-brand-warning'
                  : node.data.feedbackType === 'error'
                    ? 'text-brand-error'
                    : 'text-brand-cyan'
            }`}
          />
          <span className="text-xs text-studio-text-muted truncate">
            {node.data.title || 'Feedback'}
          </span>
        </div>
      );

    case 'timer':
      return (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--accent-orange)]" />
          <span className="text-xs text-brand-primary">{node.data.duration || 30}s</span>
          <span className="text-[10px] text-studio-text-muted">timeout</span>
        </div>
      );

    case 'random':
      return (
        <div className="text-xs text-studio-text-muted">
          {node.data.paths?.length || 2} random paths
        </div>
      );

    case 'media':
      return (
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[var(--accent-teal)]" />
          <span className="text-xs text-studio-text-muted">{node.data.mediaType || 'image'}</span>
        </div>
      );

    default:
      return null;
  }
}

export default ScenarioNodeComponent;
