'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Connection, TempConnection } from './Connection';
import { ScenarioNode } from './ScenarioNode';
import type {
  CanvasState,
  Connection as ConnectionType,
  Position,
  ScenarioNode as ScenarioNodeType,
} from './types';
import { NODE_DIMENSIONS } from './types';

interface ScenarioCanvasProps {
  nodes: ScenarioNodeType[];
  connections: ConnectionType[];
  canvasState: CanvasState;
  onCanvasStateChange: (state: Partial<CanvasState>) => void;
  onNodeMove: (nodeId: string, position: Position) => void;
  onNodeSelect: (nodeId: string | null) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodeEdit: (nodeId: string) => void;
  onConnectionCreate: (sourceId: string, targetId: string, sourceHandle?: string) => void;
  onConnectionSelect: (connectionId: string | null) => void;
  onConnectionDelete: (connectionId: string) => void;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_SENSITIVITY = 0.001;
const GRID_SIZE = 20;

export function ScenarioCanvas({
  nodes,
  connections,
  canvasState,
  onCanvasStateChange,
  onNodeMove,
  onNodeSelect,
  onNodeDelete,
  onNodeEdit,
  onConnectionCreate,
  onConnectionSelect,
  onConnectionDelete,
}: ScenarioCanvasProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [tempConnectionEnd, setTempConnectionEnd] = useState<Position | null>(null);

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent): void => {
      e.preventDefault();

      const newZoom = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, canvasState.zoom - e.deltaY * ZOOM_SENSITIVITY),
      );

      // Zoom towards cursor position
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomRatio = newZoom / canvasState.zoom;
        const newPanX = mouseX - (mouseX - canvasState.pan.x) * zoomRatio;
        const newPanY = mouseY - (mouseY - canvasState.pan.y) * zoomRatio;

        onCanvasStateChange({
          zoom: newZoom,
          pan: { x: newPanX, y: newPanY },
        });
      } else {
        onCanvasStateChange({ zoom: newZoom });
      }
    },
    [canvasState.zoom, canvasState.pan, onCanvasStateChange],
  );

  // Handle pan start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent): void => {
      // Middle mouse button or space+left click for panning
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - canvasState.pan.x, y: e.clientY - canvasState.pan.y });
      } else if (e.button === 0) {
        // Left click on empty space - deselect
        onNodeSelect(null);
        onConnectionSelect(null);
      }
    },
    [canvasState.pan, onNodeSelect, onConnectionSelect],
  );

  // Handle pan and drag move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent): void => {
      if (isPanning) {
        onCanvasStateChange({
          pan: {
            x: e.clientX - panStart.x,
            y: e.clientY - panStart.y,
          },
        });
      } else if (draggedNodeId) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const x = (e.clientX - rect.left - canvasState.pan.x) / canvasState.zoom - dragOffset.x;
          const y = (e.clientY - rect.top - canvasState.pan.y) / canvasState.zoom - dragOffset.y;

          // Snap to grid
          const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
          const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;

          onNodeMove(draggedNodeId, { x: snappedX, y: snappedY });
        }
      } else if (canvasState.isConnecting && canvasState.connectingFromNode) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setTempConnectionEnd({
            x: (e.clientX - rect.left - canvasState.pan.x) / canvasState.zoom,
            y: (e.clientY - rect.top - canvasState.pan.y) / canvasState.zoom,
          });
        }
      }
    },
    [isPanning, panStart, draggedNodeId, dragOffset, canvasState, onCanvasStateChange, onNodeMove],
  );

  // Handle pan and drag end
  const handleMouseUp = useCallback((): void => {
    setIsPanning(false);
    setDraggedNodeId(null);
    if (canvasState.isConnecting) {
      onCanvasStateChange({
        isConnecting: false,
        connectingFromNode: null,
        connectingFromHandle: null,
      });
      setTempConnectionEnd(null);
    }
  }, [canvasState.isConnecting, onCanvasStateChange]);

  // Node drag start handler
  const handleNodeDragStart = useCallback(
    (nodeId: string, e: React.MouseEvent): void => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = (e.clientX - rect.left - canvasState.pan.x) / canvasState.zoom;
        const mouseY = (e.clientY - rect.top - canvasState.pan.y) / canvasState.zoom;
        setDragOffset({
          x: mouseX - node.position.x,
          y: mouseY - node.position.y,
        });
        setDraggedNodeId(nodeId);
      }
    },
    [nodes, canvasState.pan, canvasState.zoom],
  );

  // Connection start handler
  const handleStartConnection = useCallback(
    (nodeId: string, handle?: string): void => {
      onCanvasStateChange({
        isConnecting: true,
        connectingFromNode: nodeId,
        connectingFromHandle: handle || null,
      });
    },
    [onCanvasStateChange],
  );

  // Connection complete handler
  const handleCompleteConnection = useCallback(
    (targetNodeId: string): void => {
      if (canvasState.connectingFromNode && canvasState.connectingFromNode !== targetNodeId) {
        onConnectionCreate(
          canvasState.connectingFromNode,
          targetNodeId,
          canvasState.connectingFromHandle || undefined,
        );
      }
      onCanvasStateChange({
        isConnecting: false,
        connectingFromNode: null,
        connectingFromHandle: null,
      });
      setTempConnectionEnd(null);
    },
    [
      canvasState.connectingFromNode,
      canvasState.connectingFromHandle,
      onConnectionCreate,
      onCanvasStateChange,
    ],
  );

  // Get connection endpoints
  const getConnectionEndpoints = useCallback(
    (connection: ConnectionType): { start: Position; end: Position } | null => {
      const sourceNode = nodes.find((n) => n.id === connection.sourceNodeId);
      const targetNode = nodes.find((n) => n.id === connection.targetNodeId);

      if (!sourceNode || !targetNode) return null;

      const sourceDims = NODE_DIMENSIONS[sourceNode.type];
      const targetDims = NODE_DIMENSIONS[targetNode.type];

      // Source output is at bottom center (or specific option for decision nodes)
      let startY = sourceNode.position.y + sourceDims.height;
      if (sourceNode.type === 'decision' && connection.sourceHandle) {
        // Calculate position based on option index
        const optionIndex =
          sourceNode.data.options?.findIndex((o) => o.id === connection.sourceHandle) ?? 0;
        const optionHeight = 24; // Approximate height per option
        const headerHeight = 40; // Approximate header height
        const baseOffset = 50; // Offset from top
        startY =
          sourceNode.position.y + baseOffset + headerHeight + optionIndex * optionHeight + 10;
      }

      return {
        start: {
          x: sourceNode.position.x + sourceDims.width / 2,
          y: startY,
        },
        end: {
          x: targetNode.position.x + targetDims.width / 2,
          y: targetNode.position.y,
        },
      };
    },
    [nodes],
  );

  // Get temp connection start point
  const getTempConnectionStart = useCallback((): Position | null => {
    if (!canvasState.connectingFromNode) return null;

    const sourceNode = nodes.find((n) => n.id === canvasState.connectingFromNode);
    if (!sourceNode) return null;

    const sourceDims = NODE_DIMENSIONS[sourceNode.type];

    let startY = sourceNode.position.y + sourceDims.height;
    if (sourceNode.type === 'decision' && canvasState.connectingFromHandle) {
      const optionIndex =
        sourceNode.data.options?.findIndex((o) => o.id === canvasState.connectingFromHandle) ?? 0;
      const optionHeight = 24;
      const headerHeight = 40;
      const baseOffset = 50;
      startY = sourceNode.position.y + baseOffset + headerHeight + optionIndex * optionHeight + 10;
    }

    return {
      x: sourceNode.position.x + sourceDims.width / 2,
      y: startY,
    };
  }, [canvasState.connectingFromNode, canvasState.connectingFromHandle, nodes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (canvasState.selectedNodeId) {
          const node = nodes.find((n) => n.id === canvasState.selectedNodeId);
          if (node && node.type !== 'start') {
            onNodeDelete(canvasState.selectedNodeId);
          }
        } else if (canvasState.selectedConnectionId) {
          onConnectionDelete(canvasState.selectedConnectionId);
        }
      } else if (e.key === 'Escape') {
        onNodeSelect(null);
        onConnectionSelect(null);
        if (canvasState.isConnecting) {
          onCanvasStateChange({
            isConnecting: false,
            connectingFromNode: null,
            connectingFromHandle: null,
          });
          setTempConnectionEnd(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return (): void => window.removeEventListener('keydown', handleKeyDown);
  }, [
    canvasState,
    nodes,
    onNodeDelete,
    onConnectionDelete,
    onNodeSelect,
    onConnectionSelect,
    onCanvasStateChange,
  ]);

  const tempStart = getTempConnectionStart();

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-hidden bg-brand-page',
        isPanning && 'cursor-grabbing',
        canvasState.isConnecting && 'cursor-crosshair',
      )}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      role="application"
      aria-label="Scenario canvas editor"
    >
      {/* Grid background */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle, #d1d5db 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE * canvasState.zoom}px ${GRID_SIZE * canvasState.zoom}px`,
          backgroundPosition: `${canvasState.pan.x}px ${canvasState.pan.y}px`,
        }}
      />

      {/* Canvas content */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${canvasState.pan.x}px, ${canvasState.pan.y}px) scale(${canvasState.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Connections SVG layer */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          {connections.map((connection) => {
            const endpoints = getConnectionEndpoints(connection);
            if (!endpoints) return null;

            return (
              <Connection
                key={connection.id}
                id={connection.id}
                start={endpoints.start}
                end={endpoints.end}
                isSelected={canvasState.selectedConnectionId === connection.id}
                label={connection.label}
                onSelect={onConnectionSelect}
                onDelete={onConnectionDelete}
              />
            );
          })}

          {/* Temporary connection while dragging */}
          {canvasState.isConnecting && tempStart && tempConnectionEnd && (
            <TempConnection start={tempStart} end={tempConnectionEnd} />
          )}
        </svg>

        {/* Nodes layer */}
        {nodes.map((node) => (
          <ScenarioNode
            key={node.id}
            node={node}
            isSelected={canvasState.selectedNodeId === node.id}
            isConnecting={canvasState.isConnecting}
            onSelect={onNodeSelect}
            onDelete={onNodeDelete}
            onStartConnection={handleStartConnection}
            onCompleteConnection={handleCompleteConnection}
            onDragStart={handleNodeDragStart}
            onEdit={onNodeEdit}
            zoom={canvasState.zoom}
          />
        ))}
      </div>
    </div>
  );
}
