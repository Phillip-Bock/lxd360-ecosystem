'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronRight,
  Circle,
  Clock,
  Diamond,
  GitBranch,
  Grid,
  HelpCircle,
  Image as ImageIcon,
  type LucideIcon,
  Map as MapIcon,
  Maximize2,
  MessageCircle,
  Play,
  Plus,
  Shuffle,
  Square,
  Variable,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ScenarioConfig,
  ScenarioConnection,
  ScenarioNode,
  ScenarioNodeType,
} from '@/types/blocks';
import { ScenarioNodeComponent } from './ScenarioNode';

const NODE_TYPES: {
  type: ScenarioNodeType;
  icon: LucideIcon;
  color: string;
  label: string;
  description: string;
}[] = [
  {
    type: 'start',
    icon: Play,
    color: 'var(--success)',
    label: 'Start',
    description: 'Beginning of the scenario',
  },
  {
    type: 'content',
    icon: Square,
    color: 'var(--secondary-blue)',
    label: 'Content',
    description: 'Display content to learner',
  },
  {
    type: 'decision',
    icon: Diamond,
    color: 'var(--accent-orange)',
    label: 'Decision',
    description: 'Branching choices',
  },
  {
    type: 'dialogue',
    icon: MessageCircle,
    color: 'var(--color-block-scenario)',
    label: 'Dialogue',
    description: 'Character speech',
  },
  {
    type: 'question',
    icon: HelpCircle,
    color: 'var(--accent-pink)',
    label: 'Question',
    description: 'Quiz question',
  },
  {
    type: 'condition',
    icon: GitBranch,
    color: 'var(--accent-cyan)',
    label: 'Condition',
    description: 'Conditional branch',
  },
  {
    type: 'variable',
    icon: Variable,
    color: 'var(--accent-purple)',
    label: 'Variable',
    description: 'Set/modify variable',
  },
  {
    type: 'feedback',
    icon: MessageCircle,
    color: 'var(--success)',
    label: 'Feedback',
    description: 'Show feedback',
  },
  {
    type: 'timer',
    icon: Clock,
    color: 'var(--accent-orange)',
    label: 'Timer',
    description: 'Timed response',
  },
  {
    type: 'random',
    icon: Shuffle,
    color: 'var(--accent-indigo)',
    label: 'Random',
    description: 'Random path',
  },
  {
    type: 'media',
    icon: ImageIcon,
    color: 'var(--accent-teal)',
    label: 'Media',
    description: 'Image/Video/Audio',
  },
  {
    type: 'end',
    icon: Circle,
    color: 'var(--error)',
    label: 'End',
    description: 'End of scenario',
  },
];

interface ScenarioEditorProps {
  scenario: ScenarioConfig;
  onUpdate: (updates: Partial<ScenarioConfig>) => void;
}

/**
 * ScenarioEditor - Visual node-based editor
 */
export function ScenarioEditor({ scenario, onUpdate }: ScenarioEditorProps): React.JSX.Element {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Viewport state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Selection state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  // Connection drawing state
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // UI state
  const [showNodePalette, setShowNodePalette] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [palettePosition, setPalettePosition] = useState({ x: 0, y: 0 });

  // Get canvas position from mouse event
  const getCanvasPosition = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom,
      };
    },
    [pan.x, pan.y, zoom],
  );

  // Zoom controls
  const handleZoom = useCallback((delta: number) => {
    setZoom((prev) => {
      const newZoom = Math.max(0.25, Math.min(2, prev + delta));
      // Optionally zoom towards cursor position
      return newZoom;
    });
  }, []);

  // Handle wheel for zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        handleZoom(-e.deltaY * 0.001);
      }
    },
    [handleZoom],
  );

  // Pan controls
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Middle mouse button or space+click for panning
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
      // Left click on empty space - deselect
      if (e.button === 0 && !e.altKey && e.target === canvasRef.current) {
        setSelectedNodeId(null);
        setSelectedConnectionId(null);
      }
    },
    [pan],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pos = getCanvasPosition(e);
      setMousePosition(pos);

      if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
    },
    [isPanning, panStart, getCanvasPosition],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    if (connectingFrom) {
      setConnectingFrom(null);
    }
  }, [connectingFrom]);

  // Double-click to add node
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target !== canvasRef.current) return;
      const pos = getCanvasPosition(e);
      setPalettePosition(pos);
      setShowNodePalette(true);
    },
    [getCanvasPosition],
  );

  // Add node
  const addNode = useCallback(
    (type: ScenarioNodeType, position?: { x: number; y: number }) => {
      const pos = position || palettePosition;
      const newNode: ScenarioNode = {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        position: { x: pos.x, y: pos.y },
        data: getDefaultNodeData(type),
      };

      onUpdate({
        nodes: [...scenario.nodes, newNode],
      });
      setSelectedNodeId(newNode.id);
      setShowNodePalette(false);
    },
    [scenario.nodes, palettePosition, onUpdate],
  );

  // Update node position
  const updateNodePosition = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      // Snap to grid
      const snappedPosition = showGrid
        ? {
            x: Math.round(position.x / 20) * 20,
            y: Math.round(position.y / 20) * 20,
          }
        : position;

      onUpdate({
        nodes: scenario.nodes.map((n) =>
          n.id === nodeId ? { ...n, position: snappedPosition } : n,
        ),
      });
    },
    [scenario.nodes, showGrid, onUpdate],
  );

  // Update node data
  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<ScenarioNode['data']>) => {
      onUpdate({
        nodes: scenario.nodes.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
        ),
      });
    },
    [scenario.nodes, onUpdate],
  );

  // Delete node
  const deleteNode = useCallback(
    (nodeId: string) => {
      onUpdate({
        nodes: scenario.nodes.filter((n) => n.id !== nodeId),
        connections: scenario.connections.filter((c) => c.from !== nodeId && c.to !== nodeId),
      });
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
    },
    [scenario.nodes, scenario.connections, selectedNodeId, onUpdate],
  );

  // Start connection
  const startConnection = useCallback((nodeId: string) => {
    setConnectingFrom(nodeId);
  }, []);

  // Complete connection
  const completeConnection = useCallback(
    (toNodeId: string, optionId?: string) => {
      if (!connectingFrom || connectingFrom === toNodeId) {
        setConnectingFrom(null);
        return;
      }

      // Check if connection already exists
      const exists = scenario.connections.some(
        (c) => c.from === connectingFrom && c.to === toNodeId && c.optionId === optionId,
      );

      if (!exists) {
        const newConnection: ScenarioConnection = {
          id: `conn-${Date.now()}`,
          from: connectingFrom,
          to: toNodeId,
          optionId,
        };

        onUpdate({
          connections: [...scenario.connections, newConnection],
        });
      }

      setConnectingFrom(null);
    },
    [connectingFrom, scenario.connections, onUpdate],
  );

  // Delete connection
  const deleteConnection = useCallback(
    (connectionId: string) => {
      onUpdate({
        connections: scenario.connections.filter((c) => c.id !== connectionId),
      });
      if (selectedConnectionId === connectionId) {
        setSelectedConnectionId(null);
      }
    },
    [scenario.connections, selectedConnectionId, onUpdate],
  );

  // Get connection path between two nodes
  const getConnectionPath = useCallback((fromNode: ScenarioNode, toNode: ScenarioNode) => {
    const fromX = fromNode.position.x + 240; // Right edge of node (node width is 240)
    const fromY = fromNode.position.y + 40; // Center Y (approximate)
    const toX = toNode.position.x; // Left edge
    const toY = toNode.position.y + 40; // Center Y

    const dx = toX - fromX;
    const controlOffset = Math.min(Math.abs(dx) / 2, 100);

    return `M ${fromX} ${fromY} C ${fromX + controlOffset} ${fromY}, ${toX - controlOffset} ${toY}, ${toX} ${toY}`;
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          e.preventDefault();
          deleteNode(selectedNodeId);
        } else if (selectedConnectionId) {
          e.preventDefault();
          deleteConnection(selectedConnectionId);
        }
      }
      if (e.key === 'Escape') {
        setConnectingFrom(null);
        setShowNodePalette(false);
        setSelectedNodeId(null);
        setSelectedConnectionId(null);
      }
      if (e.key === '+' || e.key === '=') {
        handleZoom(0.1);
      }
      if (e.key === '-') {
        handleZoom(-0.1);
      }
      if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedConnectionId, deleteNode, deleteConnection, handleZoom]);

  return (
    <div className="relative h-full bg-studio-bg-dark overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        {/* Add node button */}
        <button
          type="button"
          onClick={() => {
            setPalettePosition({ x: 200, y: 200 });
            setShowNodePalette(true);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-studio-accent hover:bg-studio-accent-hover text-brand-primary rounded-lg shadow-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Node
        </button>

        {/* Zoom controls */}
        <div className="flex items-center bg-studio-bg border border-studio-surface/50 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => handleZoom(-0.1)}
            className="p-2 text-studio-text-muted hover:text-brand-primary hover:bg-studio-surface/50 transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-2 text-sm text-studio-text min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => handleZoom(0.1)}
            className="p-2 text-studio-text-muted hover:text-brand-primary hover:bg-studio-surface/50 transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* View options */}
        <button
          type="button"
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded-lg border transition-colors ${
            showGrid
              ? 'bg-studio-accent/20 border-studio-accent/50 text-studio-accent'
              : 'bg-studio-bg border-studio-surface/50 text-studio-text-muted hover:text-brand-primary'
          }`}
          aria-label="Toggle grid"
          aria-pressed={showGrid}
        >
          <Grid className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setShowMinimap(!showMinimap)}
          className={`p-2 rounded-lg border transition-colors ${
            showMinimap
              ? 'bg-studio-accent/20 border-studio-accent/50 text-studio-accent'
              : 'bg-studio-bg border-studio-surface/50 text-studio-text-muted hover:text-brand-primary'
          }`}
          aria-label="Toggle minimap"
          aria-pressed={showMinimap}
        >
          <MapIcon className="w-4 h-4" />
        </button>

        {/* Reset view */}
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-2 bg-studio-bg border border-studio-surface/50 rounded-lg text-studio-text-muted hover:text-brand-primary transition-colors"
          aria-label="Reset view"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        role="application"
        aria-label="Scenario node editor canvas. Use keyboard shortcuts: Delete to remove selected, Escape to deselect, +/- to zoom."
      >
        {/* Grid background */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(var(--color-studio-accent-rgb, 71 157 255) / 0.03 1px, transparent 1px),
                linear-gradient(90deg, var(--color-studio-accent-rgb, 71 157 255) / 0.03 1px, transparent 1px)
              `,
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`,
            }}
          />
        )}

        {/* SVG layer for connections - visual only, keyboard users use application shortcuts */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
          aria-hidden="true"
        >
          <defs>
            {/* Arrow marker */}
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-studio-text-muted)" />
            </marker>
            <marker
              id="arrowhead-selected"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-block-scenario)" />
            </marker>
          </defs>

          {/* Connections */}
          {scenario.connections.map((connection) => {
            const fromNode = scenario.nodes.find((n) => n.id === connection.from);
            const toNode = scenario.nodes.find((n) => n.id === connection.to);
            if (!fromNode || !toNode) return null;

            const isSelected = selectedConnectionId === connection.id;
            const pathD = getConnectionPath(fromNode, toNode);

            return (
              <g key={connection.id}>
                {/* Visible connection line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={
                    isSelected ? 'var(--color-block-scenario)' : 'var(--color-studio-text-muted)'
                  }
                  strokeWidth={isSelected ? 3 : 2}
                  markerEnd={isSelected ? 'url(#arrowhead-selected)' : 'url(#arrowhead)'}
                  className="transition-colors"
                />
                {/* Label */}
                {connection.label && (
                  <text
                    x={(fromNode.position.x + 240 + toNode.position.x) / 2}
                    y={(fromNode.position.y + toNode.position.y + 80) / 2 - 10}
                    className="fill-studio-text-muted text-xs"
                    textAnchor="middle"
                  >
                    {connection.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Active connection line (while dragging) */}
          {connectingFrom && (
            <path
              d={`M ${
                (scenario.nodes.find((n) => n.id === connectingFrom)?.position.x || 0) + 240
              } ${
                (scenario.nodes.find((n) => n.id === connectingFrom)?.position.y || 0) + 40
              } L ${mousePosition.x} ${mousePosition.y}`}
              stroke="var(--color-block-scenario)"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
            />
          )}
        </svg>

        {/* Connection selection layer - accessible buttons positioned over connection paths */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {scenario.connections.map((connection) => {
            const fromNode = scenario.nodes.find((n) => n.id === connection.from);
            const toNode = scenario.nodes.find((n) => n.id === connection.to);
            if (!fromNode || !toNode) return null;

            const isSelected = selectedConnectionId === connection.id;
            // Position button at the midpoint of the connection
            const midX = (fromNode.position.x + 240 + toNode.position.x) / 2;
            const midY = (fromNode.position.y + 40 + toNode.position.y + 40) / 2;

            return (
              <button
                key={`connection-btn-${connection.id}`}
                type="button"
                className={`absolute w-6 h-6 rounded-full pointer-events-auto cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[var(--color-block-scenario)] ring-2 ring-[var(--color-block-scenario)]'
                    : 'bg-transparent hover:bg-[var(--color-studio-surface)]'
                }`}
                style={{
                  left: midX - 12,
                  top: midY - 12,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedConnectionId(connection.id);
                  setSelectedNodeId(null);
                }}
                aria-label={`Select connection from ${fromNode.data.label || fromNode.type} to ${toNode.data.label || toNode.type}${isSelected ? ' (selected)' : ''}`}
                aria-pressed={isSelected}
              />
            );
          })}
        </div>

        {/* Nodes layer */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {scenario.nodes.map((node) => (
            <ScenarioNodeComponent
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              isConnecting={connectingFrom === node.id}
              onSelect={() => {
                setSelectedNodeId(node.id);
                setSelectedConnectionId(null);
              }}
              onMove={(position) => updateNodePosition(node.id, position)}
              onUpdate={(data) => updateNodeData(node.id, data)}
              onDelete={() => deleteNode(node.id)}
              onStartConnection={() => startConnection(node.id)}
              onCompleteConnection={(optionId) => completeConnection(node.id, optionId)}
              zoom={zoom}
            />
          ))}
        </div>
      </div>

      {/* Node palette */}
      <AnimatePresence>
        {showNodePalette && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-4 right-4 w-72 bg-studio-bg border border-studio-surface/50 rounded-xl shadow-xl z-30 overflow-hidden"
          >
            <div className="p-3 border-b border-studio-surface/50 flex items-center justify-between">
              <h3 className="font-medium text-brand-primary">Add Node</h3>
              <button
                type="button"
                onClick={() => setShowNodePalette(false)}
                className="text-studio-text-muted hover:text-brand-primary"
                aria-label="Close node palette"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 max-h-[400px] overflow-y-auto">
              {NODE_TYPES.map((nodeType) => (
                <button
                  type="button"
                  key={nodeType.type}
                  onClick={() => addNode(nodeType.type)}
                  className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-studio-surface/50 transition-colors text-left group"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${nodeType.color}20` }}
                  >
                    <nodeType.icon className="w-5 h-5" style={{ color: nodeType.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-brand-primary font-medium">{nodeType.label}</span>
                    <span className="block text-xs text-studio-text-muted truncate">
                      {nodeType.description}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-studio-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimap */}
      <AnimatePresence>
        {showMinimap && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bottom-4 right-4 w-48 h-32 bg-studio-bg/90 border border-studio-surface/50 rounded-lg overflow-hidden z-20"
          >
            <MinimapContent nodes={scenario.nodes} viewport={{ x: pan.x, y: pan.y, zoom }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help text */}
      <div className="absolute bottom-4 left-4 text-xs text-studio-text-muted">
        <span className="bg-studio-bg/80 px-2 py-1 rounded">
          Double-click to add node • Drag to pan • Scroll to zoom
        </span>
      </div>
    </div>
  );
}

/**
 * Minimap content
 */
function MinimapContent({
  nodes,
  viewport,
}: {
  nodes: ScenarioNode[];
  viewport: { x: number; y: number; zoom: number };
}) {
  // Calculate bounds
  const bounds = useMemo(() => {
    if (nodes.length === 0) return { minX: 0, maxX: 800, minY: 0, maxY: 600 };

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    nodes.forEach((node) => {
      minX = Math.min(minX, node.position.x);
      maxX = Math.max(maxX, node.position.x + 240);
      minY = Math.min(minY, node.position.y);
      maxY = Math.max(maxY, node.position.y + 80);
    });

    const padding = 100;
    return {
      minX: minX - padding,
      maxX: maxX + padding,
      minY: minY - padding,
      maxY: maxY + padding,
    };
  }, [nodes]);

  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const scale = Math.min(192 / width, 128 / height);

  return (
    <svg className="w-full h-full" aria-hidden="true">
      {/* Nodes */}
      {nodes.map((node) => {
        const x = (node.position.x - bounds.minX) * scale;
        const y = (node.position.y - bounds.minY) * scale;
        const nodeColor =
          NODE_TYPES.find((t) => t.type === node.type)?.color || 'var(--color-studio-text-muted)';

        return (
          <rect
            key={node.id}
            x={x}
            y={y}
            width={240 * scale}
            height={60 * scale}
            rx={4 * scale}
            fill={nodeColor}
            opacity={0.6}
          />
        );
      })}

      {/* Viewport indicator */}
      <rect
        x={(-viewport.x / viewport.zoom - bounds.minX) * scale}
        y={(-viewport.y / viewport.zoom - bounds.minY) * scale}
        width={(800 / viewport.zoom) * scale}
        height={(600 / viewport.zoom) * scale}
        fill="none"
        stroke="var(--color-block-scenario)"
        strokeWidth={2}
        opacity={0.8}
      />
    </svg>
  );
}

/**
 * Get default node data based on type
 */
function getDefaultNodeData(type: ScenarioNodeType): ScenarioNode['data'] {
  switch (type) {
    case 'start':
      return { label: 'Start' };
    case 'end':
      return { label: 'End', endType: 'complete' };
    case 'content':
      return {
        title: 'Content',
        content: '<p>Add your content here...</p>',
      };
    case 'decision':
      return {
        title: 'What do you do?',
        options: [
          { id: 'opt-1', text: 'Option A' },
          { id: 'opt-2', text: 'Option B' },
        ],
      };
    case 'dialogue':
      return {
        characterId: undefined,
        text: 'Character dialogue...',
        emotion: 'neutral',
      };
    case 'question':
      return {
        question: 'Your question here?',
        options: [
          { id: 'a', text: 'Answer A', points: 10 },
          { id: 'b', text: 'Answer B', points: 0 },
        ],
        points: 10,
      };
    case 'feedback':
      return {
        title: 'Feedback',
        content: '<p>Feedback content...</p>',
        feedbackType: 'info',
      };
    case 'variable':
      return {
        variable: '',
        operation: 'set',
        value: '',
      };
    case 'condition':
      return {
        conditions: [
          { id: 'cond-1', variable: '', operator: 'equals', value: '', targetNodeId: '' },
        ],
      };
    case 'timer':
      return {
        duration: 30,
        showTimer: true,
      };
    case 'random':
      return {
        paths: [
          { id: 'path-1', weight: 50, targetNodeId: '' },
          { id: 'path-2', weight: 50, targetNodeId: '' },
        ],
      };
    case 'media':
      return {
        mediaType: 'image',
        src: '',
      };
    default:
      return {};
  }
}

export default ScenarioEditor;
