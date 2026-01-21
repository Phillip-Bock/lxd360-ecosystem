'use client';

import { FileText, Flag, GitBranch, GripVertical, Play, Settings, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { NodeType, ScenarioNode as ScenarioNodeType } from './types';
import { NODE_COLORS, NODE_DIMENSIONS } from './types';

interface ScenarioNodeProps {
  node: ScenarioNodeType;
  isSelected: boolean;
  isConnecting: boolean;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onStartConnection: (nodeId: string, handle?: string) => void;
  onCompleteConnection: (nodeId: string) => void;
  onDragStart: (nodeId: string, e: React.MouseEvent) => void;
  onEdit: (nodeId: string) => void;
  zoom: number;
}

const NodeIcons: Record<NodeType, React.ComponentType<{ className?: string }>> = {
  start: Play,
  content: FileText,
  decision: GitBranch,
  end: Flag,
};

const NodeLabels: Record<NodeType, string> = {
  start: 'Start',
  content: 'Content',
  decision: 'Decision',
  end: 'End',
};

export const ScenarioNode = memo(function ScenarioNode({
  node,
  isSelected,
  isConnecting,
  onSelect,
  onDelete,
  onStartConnection,
  onCompleteConnection,
  onDragStart,
  onEdit,
}: ScenarioNodeProps): React.JSX.Element {
  const colors = NODE_COLORS[node.type];
  const dimensions = NODE_DIMENSIONS[node.type];
  const Icon = NodeIcons[node.type];

  const handleMouseDown = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onSelect(node.id);
    if (e.button === 0 && !e.shiftKey) {
      onDragStart(node.id, e);
    }
  };

  const handleConnectionStart = (e: React.MouseEvent, handle?: string): void => {
    e.stopPropagation();
    onStartConnection(node.id, handle);
  };

  const handleConnectionEnd = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (isConnecting) {
      onCompleteConnection(node.id);
    }
  };

  return (
    <div
      role="option"
      aria-label={`${NodeLabels[node.type]} node: ${node.data.title || 'Untitled'}`}
      aria-selected={isSelected}
      tabIndex={0}
      className={cn(
        'absolute cursor-move select-none',
        'rounded-lg border-2 shadow-md transition-shadow',
        colors.bg,
        colors.border,
        isSelected && 'ring-2 ring-offset-2 ring-brand-primary shadow-lg',
        isConnecting && 'cursor-crosshair',
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: dimensions.width,
        minHeight: dimensions.height,
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleConnectionEnd}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(node.id);
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          if (node.type !== 'start') {
            e.preventDefault();
            onDelete(node.id);
          }
        }
      }}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 border-b',
          colors.border,
          'bg-brand-surface/50 rounded-t-md',
        )}
      >
        <GripVertical className="w-4 h-4 text-brand-muted cursor-grab" />
        <Icon className={cn('w-4 h-4', colors.text)} />
        <span className={cn('text-xs font-semibold flex-1', colors.text)}>
          {NodeLabels[node.type]}
        </span>
        {isSelected && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(node.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title="Edit"
            >
              <Settings className="w-3 h-3 text-brand-muted" />
            </button>
            {node.type !== 'start' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node.id);
                }}
                className="p-1 hover:bg-red-100 rounded"
                title="Delete"
              >
                <Trash2 className="w-3 h-3 text-brand-error" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-sm font-medium text-brand-primary truncate">
          {node.data.title || 'Untitled'}
        </p>
        {node.data.content && (
          <p className="text-xs text-brand-muted mt-1 line-clamp-2">{node.data.content}</p>
        )}

        {/* Decision options */}
        {node.type === 'decision' && node.data.options && (
          <div className="mt-2 space-y-1">
            {node.data.options.map((option, index) => (
              <div
                key={option.id}
                className="flex items-center justify-between text-xs bg-brand-surface/60 px-2 py-1 rounded"
              >
                <span className="truncate flex-1">{option.label || `Option ${index + 1}`}</span>
                {/* Output handle for each option */}
                <button
                  type="button"
                  aria-label={`Create connection from ${option.label || `Option ${index + 1}`}`}
                  className={cn(
                    'w-3 h-3 rounded-full cursor-crosshair',
                    colors.handle,
                    'hover:scale-125 transition-transform',
                  )}
                  onMouseDown={(e) => handleConnectionStart(e, option.id)}
                  title="Drag to connect"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Handle (top) - not for start nodes */}
      {node.type !== 'start' && (
        <button
          type="button"
          aria-label={`Connect to ${node.data.title || 'this node'}`}
          className={cn(
            'absolute -top-2 left-1/2 -translate-x-1/2',
            'w-4 h-4 rounded-full border-2 border-white',
            colors.handle,
            'cursor-crosshair hover:scale-125 transition-transform',
            isConnecting && 'animate-pulse',
          )}
          onMouseUp={handleConnectionEnd}
          title="Drop connection here"
        />
      )}

      {/* Output Handle (bottom) - not for end or decision nodes (decision has per-option handles) */}
      {node.type !== 'end' && node.type !== 'decision' && (
        <button
          type="button"
          aria-label={`Create connection from ${node.data.title || 'this node'}`}
          className={cn(
            'absolute -bottom-2 left-1/2 -translate-x-1/2',
            'w-4 h-4 rounded-full border-2 border-white',
            colors.handle,
            'cursor-crosshair hover:scale-125 transition-transform',
          )}
          onMouseDown={handleConnectionStart}
          title="Drag to connect"
        />
      )}
    </div>
  );
});
