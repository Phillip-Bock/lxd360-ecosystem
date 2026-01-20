'use client';

/**
 * ScenarioCanvas - Phase 14/17
 * Visual node-based scenario editor canvas
 */

import {
  BookOpen,
  Box,
  CircleDot,
  Clock,
  Diamond,
  Dices,
  Film,
  Flag,
  Gauge,
  GitBranch,
  Grip,
  HelpCircle,
  Image as ImageIcon,
  MessageCircle,
  MessageSquare,
  Package,
  Shuffle,
  Sparkles,
  Users,
  Variable,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { ScenarioEdge, ScenarioNode, ScenarioNodeType } from '@/types/studio/scenario';

// =============================================================================
// NODE CONFIGURATIONS
// =============================================================================

export const NODE_CONFIGS: Record<
  ScenarioNodeType,
  {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    category: NodeCategory;
    color: string;
    bgColor: string;
  }
> = {
  scene: {
    label: 'Scene',
    description: 'Main content screen with backgrounds, characters, and overlays',
    icon: ImageIcon,
    category: 'content',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/50',
  },
  decision: {
    label: 'Decision',
    description: 'Present choices to the learner',
    icon: Diamond,
    category: 'content',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 border-purple-500/50',
  },
  dialogue: {
    label: 'Dialogue',
    description: 'Character speech and conversations',
    icon: MessageCircle,
    category: 'content',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10 border-cyan-500/50',
  },
  narration: {
    label: 'Narration',
    description: 'Narrator text and voiceover',
    icon: BookOpen,
    category: 'content',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10 border-indigo-500/50',
  },
  feedback: {
    label: 'Feedback',
    description: 'Show feedback or results',
    icon: MessageSquare,
    category: 'content',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 border-green-500/50',
  },
  assessment: {
    label: 'Assessment',
    description: 'Quiz questions with scoring',
    icon: HelpCircle,
    category: 'content',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/50',
  },
  branch: {
    label: 'Branch',
    description: 'Conditional routing based on variables',
    icon: GitBranch,
    category: 'logic',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 border-orange-500/50',
  },
  variable: {
    label: 'Variable',
    description: 'Set or modify variables',
    icon: Variable,
    category: 'logic',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10 border-yellow-500/50',
  },
  action: {
    label: 'Action',
    description: 'Execute actions (audio, events, etc.)',
    icon: Zap,
    category: 'logic',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10 border-pink-500/50',
  },
  random: {
    label: 'Random',
    description: 'Random branching with weights',
    icon: Dices,
    category: 'logic',
    color: 'text-fuchsia-500',
    bgColor: 'bg-fuchsia-500/10 border-fuchsia-500/50',
  },
  timer: {
    label: 'Timer',
    description: 'Start, stop, or check timers',
    icon: Clock,
    category: 'logic',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10 border-rose-500/50',
  },
  meter: {
    label: 'Meter',
    description: 'Modify meters (health, reputation, etc.)',
    icon: Gauge,
    category: 'logic',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10 border-teal-500/50',
  },
  inventory: {
    label: 'Inventory',
    description: 'Add, remove, or check inventory items',
    icon: Package,
    category: 'logic',
    color: 'text-lime-500',
    bgColor: 'bg-lime-500/10 border-lime-500/50',
  },
  'character-select': {
    label: 'Character Select',
    description: 'Let learner choose a character',
    icon: Users,
    category: 'special',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10 border-violet-500/50',
  },
  checkpoint: {
    label: 'Checkpoint',
    description: 'Save progress point',
    icon: CircleDot,
    category: 'special',
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10 border-sky-500/50',
  },
  end: {
    label: 'End',
    description: 'Scenario ending with summary',
    icon: Flag,
    category: 'special',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/50',
  },
};

export type NodeCategory = 'content' | 'logic' | 'special';

export const CATEGORY_INFO: Record<NodeCategory, { label: string; description: string }> = {
  content: { label: 'Content', description: 'Screens and content the learner sees' },
  logic: { label: 'Logic', description: 'Flow control and data operations' },
  special: { label: 'Special', description: 'Checkpoints, endings, and special nodes' },
};

// =============================================================================
// NODE COMPONENT
// =============================================================================

interface NodeComponentProps {
  node: ScenarioNode;
  isSelected: boolean;
  isStart: boolean;
  onSelect: (nodeId: string, multi?: boolean) => void;
  onDragStart: (nodeId: string, e: React.MouseEvent) => void;
  onOpenProperties: (nodeId: string) => void;
  zoom: number;
}

export function NodeComponent({
  node,
  isSelected,
  isStart,
  onSelect,
  onDragStart,
  onOpenProperties,
  zoom: _zoom,
}: NodeComponentProps) {
  const config = NODE_CONFIGS[node.type];

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(node.id, e.shiftKey);
    },
    [node.id, onSelect],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onOpenProperties(node.id);
    },
    [node.id, onOpenProperties],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        onDragStart(node.id, e);
      }
    },
    [node.id, onDragStart],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onOpenProperties(node.id);
      } else if (e.key === ' ') {
        e.preventDefault();
        onSelect(node.id, e.shiftKey);
      }
    },
    [node.id, onOpenProperties, onSelect],
  );

  return (
    <button
      type="button"
      aria-label={`${node.data.title || config.label} node. ${config.description}. ${isStart ? 'Start node.' : ''} ${isSelected ? 'Selected.' : ''} Press Enter to edit, Space to select.`}
      aria-pressed={isSelected}
      className={cn(
        'absolute flex flex-col rounded-lg border bg-card shadow-md transition-all select-none text-left',
        config.bgColor,
        isSelected && 'ring-2 ring-primary shadow-lg',
        isStart && 'ring-2 ring-emerald-500',
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        minWidth: 180,
        maxWidth: 220,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
    >
      {/* Start Badge */}
      {isStart && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
          START
        </span>
      )}

      {/* Header */}
      <span className="flex items-center gap-2 px-3 py-2 border-b border-inherit/20">
        <Grip className="h-3 w-3 text-muted-foreground cursor-grab active:cursor-grabbing" />
        <config.icon className={cn('h-4 w-4', config.color)} />
        <span className="text-sm font-medium truncate flex-1 text-foreground">
          {node.data.title || config.label}
        </span>
      </span>

      {/* Body - Node type specific preview */}
      <span className="p-3 text-xs text-muted-foreground block">
        <NodePreview node={node} />
      </span>

      {/* Output Handle */}
      <span
        className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-2 border-background cursor-crosshair hover:scale-125 transition-transform"
        title="Connect to next node"
      />

      {/* Input Handle */}
      <span
        className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-muted border-2 border-background"
        title="Input"
      />
    </button>
  );
}

// =============================================================================
// NODE PREVIEW
// =============================================================================

function NodePreview({ node }: { node: ScenarioNode }) {
  const data = node.data;

  switch (data.nodeType) {
    case 'scene':
      return (
        <div className="space-y-1">
          {data.background.type === 'image' && data.background.thumbnailUrl && (
            <div className="relative aspect-video rounded overflow-hidden bg-muted">
              <Image src={data.background.thumbnailUrl} alt="" fill className="object-cover" />
            </div>
          )}
          {data.background.type === 'video' && (
            <div className="flex items-center gap-1">
              <Film className="h-3 w-3" />
              <span>Video background</span>
            </div>
          )}
          {data.characters.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{data.characters.length} character(s)</span>
            </div>
          )}
          {data.overlays.length > 0 && (
            <div className="flex items-center gap-1">
              <Box className="h-3 w-3" />
              <span>{data.overlays.length} overlay(s)</span>
            </div>
          )}
        </div>
      );

    case 'decision':
      return (
        <div className="space-y-1">
          {data.prompt && <p className="line-clamp-2">{data.prompt}</p>}
          <div className="flex items-center gap-1">
            <Diamond className="h-3 w-3" />
            <span>{data.choices.length} choice(s)</span>
          </div>
          {data.timeLimit && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{data.timeLimit}s limit</span>
            </div>
          )}
        </div>
      );

    case 'dialogue':
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            <span>{data.lines.length} line(s)</span>
          </div>
          {data.lines[0] && <p className="line-clamp-2 italic">"{data.lines[0].text}"</p>}
        </div>
      );

    case 'narration':
      return <p className="line-clamp-3">{data.text}</p>;

    case 'feedback':
      return (
        <div className="space-y-1">
          <span
            className={cn(
              'inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium',
              data.variant === 'success' && 'bg-green-500/20 text-green-400',
              data.variant === 'error' && 'bg-red-500/20 text-red-400',
              data.variant === 'info' && 'bg-blue-500/20 text-blue-400',
              data.variant === 'tip' && 'bg-amber-500/20 text-amber-400',
            )}
          >
            {data.variant}
          </span>
          {data.message && <p className="line-clamp-2">{data.message}</p>}
        </div>
      );

    case 'assessment':
      return (
        <div className="space-y-1">
          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-400">
            {data.questionType}
          </span>
          <p className="line-clamp-2">{data.question}</p>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span>{data.points} pts</span>
          </div>
        </div>
      );

    case 'branch':
      return (
        <div className="space-y-1">
          {data.conditions.slice(0, 3).map((c) => (
            <div key={c.id} className="truncate">
              → {c.label}
            </div>
          ))}
          {data.conditions.length > 3 && (
            <div className="text-muted-foreground">+{data.conditions.length - 3} more</div>
          )}
        </div>
      );

    case 'variable':
      return (
        <div className="space-y-1 font-mono text-[10px]">
          {data.operations.slice(0, 2).map((op, i) => (
            <div key={i} className="truncate">
              {op.variableId} {op.operation} {String(op.value)}
            </div>
          ))}
        </div>
      );

    case 'random':
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Shuffle className="h-3 w-3" />
            <span>{data.branches.length} branches</span>
          </div>
        </div>
      );

    case 'timer':
      return (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className="capitalize">{data.action}</span>
          {data.duration && <span>({data.duration}s)</span>}
        </div>
      );

    case 'meter':
      return (
        <div className="flex items-center gap-1">
          <Gauge className="h-3 w-3" />
          <span className="capitalize">{data.operation}</span>
          {data.value !== undefined && <span>{data.value}</span>}
        </div>
      );

    case 'inventory':
      return (
        <div className="flex items-center gap-1">
          <Package className="h-3 w-3" />
          <span className="capitalize">{data.action}</span>
          {data.itemId && <span>{data.itemId}</span>}
        </div>
      );

    case 'checkpoint':
      return (
        <div className="flex items-center gap-1">
          <CircleDot className="h-3 w-3" />
          <span>{data.autoSave ? 'Auto-save' : 'Manual'}</span>
        </div>
      );

    case 'end':
      return (
        <div className="space-y-1">
          <span
            className={cn(
              'inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium',
              data.endType === 'success' && 'bg-green-500/20 text-green-400',
              data.endType === 'failure' && 'bg-red-500/20 text-red-400',
              data.endType === 'neutral' && 'bg-zinc-500/20 text-zinc-400',
            )}
          >
            {data.endType}
          </span>
          {data.showSummary && <div className="text-muted-foreground">Shows summary</div>}
        </div>
      );

    default:
      return <div className="text-muted-foreground">Configure node...</div>;
  }
}

// =============================================================================
// EDGE COMPONENT
// =============================================================================

interface EdgeComponentProps {
  edge: ScenarioEdge;
  sourceNode: ScenarioNode;
  targetNode: ScenarioNode;
  isSelected: boolean;
  onSelect: (edgeId: string) => void;
}

export function EdgeComponent({
  edge,
  sourceNode,
  targetNode,
  isSelected,
  onSelect,
}: EdgeComponentProps) {
  const sourceX = sourceNode.position.x + 180 + 8; // node width + handle offset
  const sourceY = sourceNode.position.y + 50;
  const targetX = targetNode.position.x - 8;
  const targetY = targetNode.position.y + 50;

  const midX = (sourceX + targetX) / 2;

  const pathD = `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`;

  const handleClick = () => onSelect(edge.id);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(edge.id);
    }
  };

  const sourceLabel = sourceNode.data.title || 'source';
  const targetLabel = targetNode.data.title || 'target';
  const edgeLabel = edge.label ? ` labeled "${edge.label}"` : '';

  // SVG interactive element - using g with tabIndex for keyboard accessibility
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`Connection from ${sourceLabel} to ${targetLabel}${edgeLabel}. ${isSelected ? 'Selected.' : ''} Press Enter or Space to select.`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="cursor-pointer"
      style={{ outline: 'none' }}
    >
      {/* Hit area */}
      <path d={pathD} fill="none" stroke="transparent" strokeWidth={20} />
      {/* Visible edge */}
      <path
        d={pathD}
        fill="none"
        stroke={isSelected ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.2)'}
        strokeWidth={isSelected ? 3 : 2}
        strokeDasharray={edge.style?.type === 'dashed' ? '8 4' : undefined}
        className="transition-all"
      />
      {/* Arrow */}
      <polygon
        points={`${targetX},${targetY} ${targetX - 8},${targetY - 5} ${targetX - 8},${targetY + 5}`}
        fill={isSelected ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.2)'}
      />
      {/* Label */}
      {edge.label && (
        <text
          x={midX}
          y={(sourceY + targetY) / 2 - 10}
          textAnchor="middle"
          className="fill-muted-foreground text-[10px]"
        >
          {edge.label}
        </text>
      )}
    </g>
  );
}

// =============================================================================
// MAIN CANVAS
// =============================================================================

interface ScenarioCanvasProps {
  nodes: ScenarioNode[];
  edges: ScenarioEdge[];
  startNodeId: string;
  selectedNodes: string[];
  selectedEdges: string[];
  zoom: number;
  panX: number;
  panY: number;
  onNodeSelect: (nodeId: string, multi?: boolean) => void;
  onEdgeSelect: (edgeId: string) => void;
  onNodeMove: (nodeId: string, position: { x: number; y: number }) => void;
  onOpenProperties: (nodeId: string) => void;
  onCanvasClick: () => void;
  onPan: (dx: number, dy: number) => void;
}

export function ScenarioCanvas({
  nodes,
  edges,
  startNodeId,
  selectedNodes,
  selectedEdges,
  zoom,
  panX,
  panY,
  onNodeSelect,
  onEdgeSelect,
  onNodeMove,
  onOpenProperties,
  onCanvasClick,
  onPan,
}: ScenarioCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    nodeId: string;
    startX: number;
    startY: number;
    nodeStartX: number;
    nodeStartY: number;
  } | null>(null);
  const panRef = useRef<{
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);

  const handleDragStart = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      dragRef.current = {
        nodeId,
        startX: e.clientX,
        startY: e.clientY,
        nodeStartX: node.position.x,
        nodeStartY: node.position.y,
      };
    },
    [nodes],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Middle mouse button or space + click for panning
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        panRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          startPanX: panX,
          startPanY: panY,
        };
        e.preventDefault();
      }
    },
    [panX, panY],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Node dragging
      if (dragRef.current) {
        const dx = (e.clientX - dragRef.current.startX) / zoom;
        const dy = (e.clientY - dragRef.current.startY) / zoom;

        onNodeMove(dragRef.current.nodeId, {
          x: dragRef.current.nodeStartX + dx,
          y: dragRef.current.nodeStartY + dy,
        });
      }

      // Canvas panning
      if (panRef.current) {
        const dx = e.clientX - panRef.current.startX;
        const dy = e.clientY - panRef.current.startY;
        onPan(panRef.current.startPanX + dx, panRef.current.startPanY + dy);
      }
    },
    [zoom, onNodeMove, onPan],
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
    panRef.current = null;
  }, []);

  const handleCanvasKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Escape to deselect all
      if (e.key === 'Escape') {
        e.preventDefault();
        onCanvasClick();
      }
    },
    [onCanvasClick],
  );

  return (
    <div
      ref={canvasRef}
      role="application"
      aria-label={`Scenario canvas with ${nodes.length} nodes and ${edges.length} connections. Use Tab to navigate nodes, Escape to deselect. Current zoom: ${Math.round(zoom * 100)}%.`}
      className="relative flex-1 overflow-hidden bg-zinc-950"
      style={{
        backgroundImage: `
          radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px),
          radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px, 20px 20px',
        backgroundPosition: `${panX}px ${panY}px, ${panX}px ${panY}px`,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={onCanvasClick}
      onKeyDown={handleCanvasKeyDown}
    >
      {/* Edges SVG Layer */}
      <svg
        className="absolute inset-0 pointer-events-none"
        role="img"
        aria-label="Node connections diagram showing flow between scenario nodes"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <title>Scenario node connections</title>
        <g className="pointer-events-auto">
          {edges.map((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            return (
              <EdgeComponent
                key={edge.id}
                edge={edge}
                sourceNode={sourceNode}
                targetNode={targetNode}
                isSelected={selectedEdges.includes(edge.id)}
                onSelect={onEdgeSelect}
              />
            );
          })}
        </g>
      </svg>

      {/* Nodes Layer */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {nodes.map((node) => (
          <NodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNodes.includes(node.id)}
            isStart={node.id === startNodeId}
            onSelect={onNodeSelect}
            onDragStart={handleDragStart}
            onOpenProperties={onOpenProperties}
            zoom={zoom}
          />
        ))}
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-muted-foreground">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}

export default ScenarioCanvas;
