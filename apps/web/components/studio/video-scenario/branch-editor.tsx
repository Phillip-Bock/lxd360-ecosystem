'use client';

/**
 * BranchEditor - Phase 14
 * React Flow based branching video scenario editor
 */

import {
  CircleDot,
  Copy,
  Diamond,
  Film,
  Flag,
  GitBranch,
  Grip,
  LayoutGrid,
  Play,
  Plus,
  Save,
  Settings,
  Trash2,
  Undo2,
  Variable,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type {
  ScenarioVariable,
  VideoEdge,
  VideoNode,
  VideoNodeType,
  VideoScenario,
} from '@/types/studio/video-scenario';

// =============================================================================
// TYPES
// =============================================================================

interface BranchEditorProps {
  /** Initial scenario data */
  scenario?: VideoScenario;
  /** On scenario change */
  onChange?: (scenario: VideoScenario) => void;
  /** On save */
  onSave?: (scenario: VideoScenario) => void;
  /** On preview */
  onPreview?: (startNodeId?: string) => void;
}

interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  selectedNodes: string[];
  selectedEdges: string[];
}

// =============================================================================
// NODE COMPONENTS
// =============================================================================

interface NodeProps {
  node: VideoNode;
  isSelected: boolean;
  onSelect: (nodeId: string, multi?: boolean) => void;
  onDragStart: (nodeId: string, event: React.MouseEvent) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
  onEdit: (nodeId: string) => void;
}

function ScenarioNode({
  node,
  isSelected,
  onSelect,
  onDragStart,
  onDelete,
  onDuplicate,
  onEdit,
}: NodeProps) {
  const nodeConfig = NODE_CONFIGS[node.type];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onEdit(node.id);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      e.stopPropagation();
      onDelete(node.id);
    }
  };

  return (
    <div
      role="option"
      tabIndex={0}
      aria-label={`${nodeConfig.label}: ${getNodeTitle(node)}. Press Enter to edit, Delete to remove.`}
      aria-selected={isSelected}
      className={cn(
        'absolute flex flex-col rounded-lg border bg-card shadow-md cursor-pointer transition-all',
        isSelected && 'ring-2 ring-primary',
        nodeConfig.className,
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        minWidth: 180,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id, e.shiftKey);
      }}
      onDoubleClick={() => onEdit(node.id)}
      onKeyDown={handleKeyDown}
      onMouseDown={(e) => {
        if (e.button === 0 && !e.shiftKey) {
          onDragStart(node.id, e);
        }
      }}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-t-lg border-b',
          nodeConfig.headerClassName,
        )}
      >
        <Grip className="h-3 w-3 text-muted-foreground cursor-grab" />
        <nodeConfig.icon className="h-4 w-4" />
        <span className="text-sm font-medium truncate flex-1">{getNodeTitle(node)}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Settings className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(node.id)}>Edit Node</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(node.id)}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(node.id)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Body */}
      <div className="p-3">
        {node.type === 'video' || node.type === 'decision' ? (
          <VideoNodeBody node={node} />
        ) : node.type === 'branch' ? (
          <BranchNodeBody node={node} />
        ) : node.type === 'end' ? (
          <EndNodeBody node={node} />
        ) : node.type === 'variable' ? (
          <VariableNodeBody node={node} />
        ) : node.type === 'checkpoint' ? (
          <CheckpointNodeBody node={node} />
        ) : null}
      </div>

      {/* Connection Handles */}
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-2 border-background cursor-crosshair" />
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-muted border-2 border-background" />
    </div>
  );
}

function VideoNodeBody({ node }: { node: VideoNode }) {
  const data = node.data;
  if (data.nodeType !== 'video' && data.nodeType !== 'decision') return null;

  return (
    <div className="space-y-2">
      {data.thumbnailUrl && (
        <div className="relative aspect-video rounded overflow-hidden bg-muted">
          <Image src={data.thumbnailUrl} alt={data.title} fill className="object-cover" />
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
            {formatDuration(data.duration)}
          </div>
        </div>
      )}
      {data.decisionPoint && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Diamond className="h-3 w-3" />
          {data.decisionPoint.choices.length} choices at{' '}
          {formatDuration(data.decisionPoint.timestamp)}
        </div>
      )}
    </div>
  );
}

function BranchNodeBody({ node }: { node: VideoNode }) {
  const data = node.data;
  if (data.nodeType !== 'branch') return null;

  return (
    <div className="space-y-1">
      {data.conditions.slice(0, 3).map((condition) => (
        <div key={condition.id} className="text-xs text-muted-foreground truncate">
          → {condition.label}
        </div>
      ))}
      {data.conditions.length > 3 && (
        <div className="text-xs text-muted-foreground">+{data.conditions.length - 3} more</div>
      )}
    </div>
  );
}

function EndNodeBody({ node }: { node: VideoNode }) {
  const data = node.data;
  if (data.nodeType !== 'end') return null;

  return (
    <div className="text-xs">
      <span
        className={cn(
          'px-2 py-0.5 rounded',
          data.type === 'success' && 'bg-green-500/20 text-green-500',
          data.type === 'failure' && 'bg-red-500/20 text-red-500',
          data.type === 'neutral' && 'bg-zinc-500/20 text-zinc-500',
        )}
      >
        {data.type}
      </span>
    </div>
  );
}

function VariableNodeBody({ node }: { node: VideoNode }) {
  const data = node.data;
  if (data.nodeType !== 'variable') return null;

  return (
    <div className="space-y-1">
      {data.operations.slice(0, 2).map((op, i) => (
        <div key={i} className="text-xs text-muted-foreground font-mono">
          {op.variableId} {op.operation} {String(op.value)}
        </div>
      ))}
    </div>
  );
}

function CheckpointNodeBody({ node }: { node: VideoNode }) {
  const data = node.data;
  if (data.nodeType !== 'checkpoint') return null;

  return (
    <div className="text-xs text-muted-foreground">
      {data.autoSave ? 'Auto-save' : 'Manual save'}
    </div>
  );
}

// =============================================================================
// NODE CONFIGURATIONS
// =============================================================================

const NODE_CONFIGS: Record<
  VideoNodeType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    className: string;
    headerClassName: string;
  }
> = {
  video: {
    label: 'Video Segment',
    icon: Film,
    className: 'border-blue-500/50',
    headerClassName: 'bg-blue-500/10',
  },
  decision: {
    label: 'Decision Point',
    icon: Diamond,
    className: 'border-purple-500/50',
    headerClassName: 'bg-purple-500/10',
  },
  branch: {
    label: 'Branch',
    icon: GitBranch,
    className: 'border-orange-500/50',
    headerClassName: 'bg-orange-500/10',
  },
  end: {
    label: 'End',
    icon: Flag,
    className: 'border-green-500/50',
    headerClassName: 'bg-green-500/10',
  },
  checkpoint: {
    label: 'Checkpoint',
    icon: CircleDot,
    className: 'border-cyan-500/50',
    headerClassName: 'bg-cyan-500/10',
  },
  variable: {
    label: 'Set Variable',
    icon: Variable,
    className: 'border-yellow-500/50',
    headerClassName: 'bg-yellow-500/10',
  },
  condition: {
    label: 'Condition',
    icon: GitBranch,
    className: 'border-pink-500/50',
    headerClassName: 'bg-pink-500/10',
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getNodeTitle(node: VideoNode): string {
  return node.data.title || NODE_CONFIGS[node.type].label;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function generateId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// =============================================================================
// CANVAS COMPONENT
// =============================================================================

interface CanvasProps {
  nodes: VideoNode[];
  edges: VideoEdge[];
  state: CanvasState;
  onStateChange: (state: CanvasState) => void;
  onNodeMove: (nodeId: string, position: { x: number; y: number }) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodeDuplicate: (nodeId: string) => void;
  onNodeEdit: (nodeId: string) => void;
  onEdgeCreate: (sourceId: string, targetId: string) => void;
  onEdgeDelete: (edgeId: string) => void;
}

function Canvas({
  nodes,
  edges,
  state,
  onStateChange,
  onNodeMove,
  onNodeDelete,
  onNodeDuplicate,
  onNodeEdit,
}: CanvasProps) {
  const [dragging, setDragging] = useState<{
    nodeId: string;
    startX: number;
    startY: number;
    nodeStartX: number;
    nodeStartY: number;
  } | null>(null);

  const handleSelect = useCallback(
    (nodeId: string, multi?: boolean) => {
      onStateChange({
        ...state,
        selectedNodes: multi
          ? state.selectedNodes.includes(nodeId)
            ? state.selectedNodes.filter((id) => id !== nodeId)
            : [...state.selectedNodes, nodeId]
          : [nodeId],
      });
    },
    [state, onStateChange],
  );

  const handleDragStart = useCallback(
    (nodeId: string, event: React.MouseEvent) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      setDragging({
        nodeId,
        startX: event.clientX,
        startY: event.clientY,
        nodeStartX: node.position.x,
        nodeStartY: node.position.y,
      });
    },
    [nodes],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!dragging) return;

      const dx = (event.clientX - dragging.startX) / state.zoom;
      const dy = (event.clientY - dragging.startY) / state.zoom;

      onNodeMove(dragging.nodeId, {
        x: dragging.nodeStartX + dx,
        y: dragging.nodeStartY + dy,
      });
    },
    [dragging, state.zoom, onNodeMove],
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleCanvasClick = useCallback(() => {
    onStateChange({
      ...state,
      selectedNodes: [],
      selectedEdges: [],
    });
  }, [state, onStateChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onStateChange({
          ...state,
          selectedNodes: [],
          selectedEdges: [],
        });
      }
    },
    [state, onStateChange],
  );

  return (
    <div
      role="application"
      aria-label="Video scenario editor canvas. Click to deselect nodes, press Escape to clear selection."
      className="relative flex-1 overflow-hidden bg-zinc-950 bg-[radial-gradient(circle,_rgba(255,255,255,0.05)_1px,_transparent_1px)] bg-[length:20px_20px]"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      onKeyDown={handleKeyDown}
    >
      {/* Edges SVG layer */}
      <svg
        role="img"
        aria-label={`Connection graph with ${edges.length} edge${edges.length !== 1 ? 's' : ''} connecting scenario nodes`}
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `scale(${state.zoom}) translate(${state.panX}px, ${state.panY}px)`,
        }}
      >
        <title>Scenario node connections</title>
        {edges.map((edge) => {
          const sourceNode = nodes.find((n) => n.id === edge.source);
          const targetNode = nodes.find((n) => n.id === edge.target);
          if (!sourceNode || !targetNode) return null;

          const sourceX = sourceNode.position.x + 180;
          const sourceY = sourceNode.position.y + 50;
          const targetX = targetNode.position.x;
          const targetY = targetNode.position.y + 50;

          const midX = (sourceX + targetX) / 2;

          return (
            <g key={edge.id}>
              <path
                d={`M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`}
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={2}
              />
              {/* Arrow */}
              <polygon
                points={`${targetX},${targetY} ${targetX - 8},${targetY - 4} ${targetX - 8},${targetY + 4}`}
                fill="rgba(255,255,255,0.2)"
              />
            </g>
          );
        })}
      </svg>

      {/* Nodes layer */}
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${state.zoom}) translate(${state.panX}px, ${state.panY}px)`,
          transformOrigin: '0 0',
        }}
      >
        {nodes.map((node) => (
          <ScenarioNode
            key={node.id}
            node={node}
            isSelected={state.selectedNodes.includes(node.id)}
            onSelect={handleSelect}
            onDragStart={handleDragStart}
            onDelete={onNodeDelete}
            onDuplicate={onNodeDuplicate}
            onEdit={onNodeEdit}
          />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// PROPERTIES PANEL
// =============================================================================

interface PropertiesPanelProps {
  selectedNode: VideoNode | null;
  variables: ScenarioVariable[];
  onChange: (node: VideoNode) => void;
  onVariablesChange: (variables: ScenarioVariable[]) => void;
}

function PropertiesPanel({
  selectedNode,
  variables,
  onChange,
  onVariablesChange: _onVariablesChange,
}: PropertiesPanelProps) {
  if (!selectedNode) {
    return (
      <div className="w-80 border-l bg-card p-4">
        <p className="text-sm text-muted-foreground text-center mt-8">
          Select a node to edit its properties
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 border-l bg-card overflow-y-auto">
      <div className="p-4 border-b">
        <h3 className="font-medium">{NODE_CONFIGS[selectedNode.type].label}</h3>
        <p className="text-xs text-muted-foreground mt-1">ID: {selectedNode.id}</p>
      </div>

      <Tabs defaultValue="general" className="p-4">
        <TabsList className="w-full">
          <TabsTrigger value="general" className="flex-1">
            General
          </TabsTrigger>
          <TabsTrigger value="content" className="flex-1">
            Content
          </TabsTrigger>
          <TabsTrigger value="logic" className="flex-1">
            Logic
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={selectedNode.data.title || ''}
              onChange={(e) =>
                onChange({
                  ...selectedNode,
                  data: { ...selectedNode.data, title: e.target.value },
                })
              }
              placeholder="Node title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>X Position</Label>
              <Input
                type="number"
                value={selectedNode.position.x}
                onChange={(e) =>
                  onChange({
                    ...selectedNode,
                    position: {
                      ...selectedNode.position,
                      x: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Y Position</Label>
              <Input
                type="number"
                value={selectedNode.position.y}
                onChange={(e) =>
                  onChange({
                    ...selectedNode,
                    position: {
                      ...selectedNode.position,
                      y: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4 mt-4">
          {(selectedNode.type === 'video' || selectedNode.type === 'decision') && (
            <VideoNodeContent node={selectedNode} onChange={onChange} />
          )}
          {selectedNode.type === 'end' && (
            <EndNodeContent node={selectedNode} onChange={onChange} />
          )}
          {selectedNode.type === 'variable' && (
            <VariableNodeContent node={selectedNode} variables={variables} onChange={onChange} />
          )}
        </TabsContent>

        <TabsContent value="logic" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">Configure branching logic and conditions</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VideoNodeContent({
  node,
  onChange,
}: {
  node: VideoNode;
  onChange: (node: VideoNode) => void;
}) {
  const data = node.data;
  if (data.nodeType !== 'video' && data.nodeType !== 'decision') return null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Video URL</Label>
        <Input
          value={data.videoUrl || ''}
          onChange={(e) =>
            onChange({
              ...node,
              data: { ...data, videoUrl: e.target.value },
            })
          }
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label>Thumbnail URL</Label>
        <Input
          value={data.thumbnailUrl || ''}
          onChange={(e) =>
            onChange({
              ...node,
              data: { ...data, thumbnailUrl: e.target.value },
            })
          }
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Time (s)</Label>
          <Input
            type="number"
            value={data.startTime || 0}
            onChange={(e) =>
              onChange({
                ...node,
                data: { ...data, startTime: parseFloat(e.target.value) || 0 },
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>End Time (s)</Label>
          <Input
            type="number"
            value={data.endTime || data.duration || 0}
            onChange={(e) =>
              onChange({
                ...node,
                data: { ...data, endTime: parseFloat(e.target.value) || 0 },
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

function EndNodeContent({
  node,
  onChange,
}: {
  node: VideoNode;
  onChange: (node: VideoNode) => void;
}) {
  const data = node.data;
  if (data.nodeType !== 'end') return null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>End Type</Label>
        <div className="flex gap-2">
          {(['success', 'failure', 'neutral'] as const).map((type) => (
            <Button
              key={type}
              variant={data.type === type ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                onChange({
                  ...node,
                  data: { ...data, type },
                })
              }
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Message</Label>
        <Input
          value={data.message || ''}
          onChange={(e) =>
            onChange({
              ...node,
              data: { ...data, message: e.target.value },
            })
          }
          placeholder="Completion message"
        />
      </div>
    </div>
  );
}

function VariableNodeContent({
  node,
  variables,
  onChange: _onChange,
}: {
  node: VideoNode;
  variables: ScenarioVariable[];
  onChange: (node: VideoNode) => void;
}) {
  const data = node.data;
  if (data.nodeType !== 'variable') return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Operations</Label>
        <Button variant="ghost" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {data.operations.map((op, index) => (
        <div key={index} className="p-3 border rounded-lg space-y-2">
          <select className="w-full p-2 rounded border bg-background text-sm">
            {variables.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <select className="flex-1 p-2 rounded border bg-background text-sm">
              <option value="set">Set to</option>
              <option value="add">Add</option>
              <option value="subtract">Subtract</option>
              <option value="toggle">Toggle</option>
            </select>
            <Input className="flex-1" value={String(op.value)} placeholder="Value" />
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BranchEditor({
  scenario: initialScenario,
  onChange: _onChange,
  onSave,
  onPreview,
}: BranchEditorProps) {
  // State
  const [nodes, setNodes] = useState<VideoNode[]>(initialScenario?.nodes || []);
  const [edges, setEdges] = useState<VideoEdge[]>(initialScenario?.edges || []);
  const [variables, setVariables] = useState<ScenarioVariable[]>(initialScenario?.variables || []);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    zoom: 1,
    panX: 0,
    panY: 0,
    selectedNodes: [],
    selectedEdges: [],
  });

  const selectedNode = useMemo(() => {
    if (canvasState.selectedNodes.length !== 1) return null;
    return nodes.find((n) => n.id === canvasState.selectedNodes[0]) || null;
  }, [canvasState.selectedNodes, nodes]);

  // Handlers
  const handleAddNode = useCallback(
    (type: VideoNodeType) => {
      const newNode: VideoNode = {
        id: generateId(),
        type,
        position: { x: 100 + nodes.length * 50, y: 100 + nodes.length * 50 },
        data: createDefaultNodeData(type),
      };
      setNodes((prev) => [...prev, newNode]);
    },
    [nodes.length],
  );

  const handleNodeMove = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, position } : n)));
  }, []);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, []);

  const handleNodeDuplicate = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const newNode: VideoNode = {
        ...node,
        id: generateId(),
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50,
        },
      };
      setNodes((prev) => [...prev, newNode]);
    },
    [nodes],
  );

  const handleNodeEdit = useCallback((nodeId: string) => {
    setCanvasState((prev) => ({
      ...prev,
      selectedNodes: [nodeId],
    }));
  }, []);

  const handleNodeChange = useCallback((updatedNode: VideoNode) => {
    setNodes((prev) => prev.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
  }, []);

  const handleEdgeCreate = useCallback(
    (sourceId: string, targetId: string) => {
      const edgeId = `edge_${sourceId}_${targetId}`;
      if (edges.some((e) => e.id === edgeId)) return;

      setEdges((prev) => [...prev, { id: edgeId, source: sourceId, target: targetId }]);
    },
    [edges],
  );

  const handleEdgeDelete = useCallback((edgeId: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
  }, []);

  const handleSave = useCallback(() => {
    const scenario: VideoScenario = {
      id: initialScenario?.id || generateId(),
      title: initialScenario?.title || 'Untitled Scenario',
      version: (initialScenario?.version || 0) + 1,
      createdAt: initialScenario?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes,
      edges,
      startNodeId: nodes[0]?.id || '',
      variables,
      characters: initialScenario?.characters || [],
      settings: initialScenario?.settings || {
        allowSkip: false,
        allowRewind: true,
        allowPause: true,
        showProgress: true,
        showTimer: false,
        language: 'en',
        accessibility: {
          showCaptions: true,
          captionsLanguage: 'en',
          audioDescriptions: false,
          highContrast: false,
          reducedMotion: false,
          keyboardNavigation: true,
        },
      },
    };
    onSave?.(scenario);
  }, [nodes, edges, variables, initialScenario, onSave]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-card">
        {/* Add Node Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Node
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {Object.entries(NODE_CONFIGS).map(([type, config]) => (
              <DropdownMenuItem key={type} onClick={() => handleAddNode(type as VideoNodeType)}>
                <config.icon className="h-4 w-4 mr-2" />
                {config.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-4 w-px bg-border" />

        {/* Zoom Controls */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setCanvasState((prev) => ({
              ...prev,
              zoom: Math.max(0.25, prev.zoom - 0.25),
            }))
          }
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm w-12 text-center">{Math.round(canvasState.zoom * 100)}%</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setCanvasState((prev) => ({
              ...prev,
              zoom: Math.min(2, prev.zoom + 0.25),
            }))
          }
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCanvasState((prev) => ({ ...prev, panX: 0, panY: 0, zoom: 1 }))}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        {/* Actions */}
        <Button variant="ghost" size="sm">
          <Undo2 className="h-4 w-4 mr-2" />
          Undo
        </Button>

        <Button variant="outline" size="sm" onClick={() => onPreview?.()}>
          <Play className="h-4 w-4 mr-2" />
          Preview
        </Button>

        <Button size="sm" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <Canvas
          nodes={nodes}
          edges={edges}
          state={canvasState}
          onStateChange={setCanvasState}
          onNodeMove={handleNodeMove}
          onNodeDelete={handleNodeDelete}
          onNodeDuplicate={handleNodeDuplicate}
          onNodeEdit={handleNodeEdit}
          onEdgeCreate={handleEdgeCreate}
          onEdgeDelete={handleEdgeDelete}
        />

        {/* Properties Panel */}
        <PropertiesPanel
          selectedNode={selectedNode}
          variables={variables}
          onChange={handleNodeChange}
          onVariablesChange={setVariables}
        />
      </div>
    </div>
  );
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function createDefaultNodeData(type: VideoNodeType): VideoNode['data'] {
  switch (type) {
    case 'video':
      return {
        nodeType: 'video',
        title: 'Video Segment',
        videoUrl: '',
        duration: 0,
        autoAdvance: true,
      };
    case 'decision':
      return {
        nodeType: 'decision',
        title: 'Decision Point',
        videoUrl: '',
        duration: 0,
        autoAdvance: false,
        decisionPoint: {
          id: generateId(),
          timestamp: 0,
          pauseVideo: true,
          choices: [],
        },
      };
    case 'branch':
      return {
        nodeType: 'branch',
        title: 'Branch',
        conditions: [],
        defaultTargetId: '',
      };
    case 'end':
      return {
        nodeType: 'end',
        title: 'End',
        type: 'neutral',
        showResults: true,
      };
    case 'checkpoint':
      return {
        nodeType: 'checkpoint',
        title: 'Checkpoint',
        saveState: true,
        autoSave: true,
      };
    case 'variable':
      return {
        nodeType: 'variable',
        title: 'Set Variable',
        operations: [],
      };
    default:
      return {
        nodeType: 'video',
        title: 'Node',
        videoUrl: '',
        duration: 0,
        autoAdvance: true,
      };
  }
}

export default BranchEditor;
