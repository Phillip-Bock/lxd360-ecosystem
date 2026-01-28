'use client';

import {
  Download,
  Eye,
  FileText,
  Flag,
  GitBranch,
  Maximize2,
  Redo,
  Save,
  Trash2,
  Undo,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { NodeEditModal } from './node-edit-modal';
import { ScenarioCanvas } from './scenario-canvas';
import { ScenarioPreview } from './scenario-preview';
import type {
  CanvasState,
  Connection,
  NodeType,
  Position,
  ScenarioData,
  ScenarioNode,
} from './types';

interface ScenarioEditorProps {
  initialData?: ScenarioData;
  onSave?: (data: ScenarioData) => void;
  onClose?: () => void;
}

const DEFAULT_SCENARIO: ScenarioData = {
  id: 'new-scenario',
  title: 'New Scenario',
  nodes: [
    {
      id: 'start-1',
      type: 'start',
      position: { x: 100, y: 100 },
      data: { title: 'Start' },
    },
  ],
  connections: [],
  startNodeId: 'start-1',
};

let nodeIdCounter = 1;

function generateNodeId(): string {
  return `node-${Date.now()}-${nodeIdCounter++}`;
}

function generateConnectionId(): string {
  return `conn-${Date.now()}-${nodeIdCounter++}`;
}

export function ScenarioEditor({ initialData, onSave }: ScenarioEditorProps): React.JSX.Element {
  const [scenario, setScenario] = useState<ScenarioData>(initialData || DEFAULT_SCENARIO);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    zoom: 1,
    pan: { x: 0, y: 0 },
    selectedNodeId: null,
    selectedConnectionId: null,
    isConnecting: false,
    connectingFromNode: null,
    connectingFromHandle: null,
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [history, setHistory] = useState<ScenarioData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Save to history
  const saveToHistory = useCallback(
    (newScenario: ScenarioData) => {
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), newScenario]);
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex],
  );

  // Undo/Redo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setScenario(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setScenario(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Add new node
  const handleAddNode = useCallback(
    (type: NodeType) => {
      const newNode: ScenarioNode = {
        id: generateNodeId(),
        type,
        position: {
          x: -canvasState.pan.x / canvasState.zoom + 200,
          y: -canvasState.pan.y / canvasState.zoom + 200,
        },
        data: {
          title:
            type === 'start'
              ? 'Start'
              : type === 'end'
                ? 'End'
                : type === 'decision'
                  ? 'Decision Point'
                  : 'Content Block',
          options:
            type === 'decision'
              ? [
                  { id: 'opt-1', label: 'Option A' },
                  { id: 'opt-2', label: 'Option B' },
                ]
              : undefined,
        },
      };

      const newScenario = {
        ...scenario,
        nodes: [...scenario.nodes, newNode],
      };
      setScenario(newScenario);
      saveToHistory(newScenario);
      setCanvasState((prev) => ({ ...prev, selectedNodeId: newNode.id }));
    },
    [scenario, canvasState.pan, canvasState.zoom, saveToHistory],
  );

  // Move node
  const handleNodeMove = useCallback((nodeId: string, position: Position) => {
    setScenario((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) => (node.id === nodeId ? { ...node, position } : node)),
    }));
  }, []);

  // Select node
  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setCanvasState((prev) => ({
      ...prev,
      selectedNodeId: nodeId,
      selectedConnectionId: nodeId ? null : prev.selectedConnectionId,
    }));
  }, []);

  // Delete node
  const handleNodeDelete = useCallback(
    (nodeId: string) => {
      const newScenario = {
        ...scenario,
        nodes: scenario.nodes.filter((n) => n.id !== nodeId),
        connections: scenario.connections.filter(
          (c) => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId,
        ),
      };
      setScenario(newScenario);
      saveToHistory(newScenario);
      setCanvasState((prev) => ({
        ...prev,
        selectedNodeId: prev.selectedNodeId === nodeId ? null : prev.selectedNodeId,
      }));
    },
    [scenario, saveToHistory],
  );

  // Edit node
  const handleNodeEdit = useCallback((nodeId: string) => {
    setEditingNodeId(nodeId);
  }, []);

  // Save node edits
  const handleNodeSave = useCallback(
    (nodeId: string, data: ScenarioNode['data']) => {
      const newScenario = {
        ...scenario,
        nodes: scenario.nodes.map((node) => (node.id === nodeId ? { ...node, data } : node)),
      };
      setScenario(newScenario);
      saveToHistory(newScenario);
      setEditingNodeId(null);
    },
    [scenario, saveToHistory],
  );

  // Create connection
  const handleConnectionCreate = useCallback(
    (sourceId: string, targetId: string, sourceHandle?: string) => {
      // Check if connection already exists
      const exists = scenario.connections.some(
        (c) =>
          c.sourceNodeId === sourceId &&
          c.targetNodeId === targetId &&
          ((!c.sourceHandle && !sourceHandle) || c.sourceHandle === sourceHandle),
      );
      if (exists) return;

      const newConnection: Connection = {
        id: generateConnectionId(),
        sourceNodeId: sourceId,
        targetNodeId: targetId,
        sourceHandle,
      };

      const newScenario = {
        ...scenario,
        connections: [...scenario.connections, newConnection],
      };
      setScenario(newScenario);
      saveToHistory(newScenario);
    },
    [scenario, saveToHistory],
  );

  // Select connection
  const handleConnectionSelect = useCallback((connectionId: string | null) => {
    setCanvasState((prev) => ({
      ...prev,
      selectedConnectionId: connectionId,
      selectedNodeId: connectionId ? null : prev.selectedNodeId,
    }));
  }, []);

  // Delete connection
  const handleConnectionDelete = useCallback(
    (connectionId: string) => {
      const newScenario = {
        ...scenario,
        connections: scenario.connections.filter((c) => c.id !== connectionId),
      };
      setScenario(newScenario);
      saveToHistory(newScenario);
      setCanvasState((prev) => ({
        ...prev,
        selectedConnectionId:
          prev.selectedConnectionId === connectionId ? null : prev.selectedConnectionId,
      }));
    },
    [scenario, saveToHistory],
  );

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setCanvasState((prev) => ({
      ...prev,
      zoom: Math.min(2, prev.zoom + 0.1),
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setCanvasState((prev) => ({
      ...prev,
      zoom: Math.max(0.25, prev.zoom - 0.1),
    }));
  }, []);

  const handleZoomReset = useCallback(() => {
    setCanvasState((prev) => ({
      ...prev,
      zoom: 1,
      pan: { x: 0, y: 0 },
    }));
  }, []);

  // Save scenario
  const handleSave = useCallback(() => {
    onSave?.(scenario);
  }, [scenario, onSave]);

  // Export/Import
  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(scenario, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenario.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [scenario]);

  const editingNode = editingNodeId ? scenario.nodes.find((n) => n.id === editingNodeId) : null;

  if (isPreviewMode) {
    return <ScenarioPreview scenario={scenario} onExit={() => setIsPreviewMode(false)} />;
  }

  return (
    <div className="flex flex-col h-full bg-brand-surface">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-brand-page">
        <div className="flex items-center gap-2">
          {/* Add Node Buttons */}
          <div className="flex items-center gap-1 px-2 py-1 bg-brand-surface rounded-lg border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddNode('content')}
              className="flex items-center gap-1"
            >
              <FileText className="w-4 h-4 text-brand-blue" />
              <span className="text-xs">Content</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddNode('decision')}
              className="flex items-center gap-1"
            >
              <GitBranch className="w-4 h-4 text-amber-500" />
              <span className="text-xs">Decision</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddNode('end')}
              className="flex items-center gap-1"
            >
              <Flag className="w-4 h-4 text-brand-error" />
              <span className="text-xs">End</span>
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* History Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Delete Selected */}
          {(canvasState.selectedNodeId || canvasState.selectedConnectionId) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (canvasState.selectedNodeId) {
                  const node = scenario.nodes.find((n) => n.id === canvasState.selectedNodeId);
                  if (node && node.type !== 'start') {
                    handleNodeDelete(canvasState.selectedNodeId);
                  }
                } else if (canvasState.selectedConnectionId) {
                  handleConnectionDelete(canvasState.selectedConnectionId);
                }
              }}
              className="text-brand-error hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 px-2 py-1 bg-brand-surface rounded-lg border">
            <Button variant="ghost" size="sm" onClick={handleZoomOut} title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium w-12 text-center">
              {Math.round(canvasState.zoom * 100)}%
            </span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn} title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleZoomReset} title="Reset View">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleExport} title="Export">
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewMode(true)}
              className="flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button size="sm" onClick={handleSave} className="flex items-center gap-1">
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <ScenarioCanvas
          nodes={scenario.nodes}
          connections={scenario.connections}
          canvasState={canvasState}
          onCanvasStateChange={(changes) => setCanvasState((prev) => ({ ...prev, ...changes }))}
          onNodeMove={handleNodeMove}
          onNodeSelect={handleNodeSelect}
          onNodeDelete={handleNodeDelete}
          onNodeEdit={handleNodeEdit}
          onConnectionCreate={handleConnectionCreate}
          onConnectionSelect={handleConnectionSelect}
          onConnectionDelete={handleConnectionDelete}
        />

        {/* Help Text */}
        <div className="absolute bottom-4 left-4 text-xs text-brand-muted bg-brand-surface/80 px-3 py-2 rounded-lg border">
          <p>
            <strong>Pan:</strong> Alt+Drag or Middle Mouse
          </p>
          <p>
            <strong>Zoom:</strong> Scroll wheel
          </p>
          <p>
            <strong>Connect:</strong> Drag from handles
          </p>
          <p>
            <strong>Delete:</strong> Select + Delete key
          </p>
        </div>
      </div>

      {/* Node Edit Modal */}
      {editingNode && (
        <NodeEditModal
          node={editingNode}
          onSave={(data) => handleNodeSave(editingNode.id, data)}
          onClose={() => setEditingNodeId(null)}
        />
      )}
    </div>
  );
}
