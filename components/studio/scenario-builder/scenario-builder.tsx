'use client';

/**
 * ScenarioBuilder - Phase 14/17
 * Full-scale branching scenario editor
 */

import {
  ChevronDown,
  Copy,
  Download,
  Gauge,
  LayoutGrid,
  Maximize2,
  Play,
  Plus,
  Redo2,
  Save,
  Trash2,
  Undo2,
  Users,
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type {
  Scenario,
  ScenarioEdge,
  ScenarioNode,
  ScenarioNodeData,
  ScenarioNodeType,
} from '@/types/studio/scenario';
import { NodeProperties } from './node-properties';
import { CATEGORY_INFO, NODE_CONFIGS, type NodeCategory, ScenarioCanvas } from './scenario-canvas';

// =============================================================================
// TYPES
// =============================================================================

interface ScenarioBuilderProps {
  /** Initial scenario data */
  scenario?: Scenario;
  /** On scenario change */
  onChange?: (scenario: Scenario) => void;
  /** On save */
  onSave?: (scenario: Scenario) => void;
  /** On preview */
  onPreview?: (startNodeId?: string) => void;
  /** On export */
  onExport?: (format: string) => void;
}

interface EditorState {
  selectedNodes: string[];
  selectedEdges: string[];
  zoom: number;
  panX: number;
  panY: number;
  showMinimap: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
}

interface HistoryEntry {
  nodes: ScenarioNode[];
  edges: ScenarioEdge[];
  timestamp: number;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateId(prefix = 'node'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createDefaultNodeData(type: ScenarioNodeType): ScenarioNodeData {
  switch (type) {
    case 'scene':
      return {
        nodeType: 'scene',
        title: 'Scene',
        background: { type: 'color', color: '#1a1a2e' },
        characters: [],
        overlays: [],
        autoAdvance: false,
      };
    case 'decision':
      return {
        nodeType: 'decision',
        title: 'Decision',
        promptPosition: 'bottom',
        choices: [],
        layout: { type: 'buttons', alignment: 'vertical', position: 'bottom' },
        randomizeOrder: false,
        allowMultiple: false,
        showFeedback: 'immediate',
      };
    case 'dialogue':
      return {
        nodeType: 'dialogue',
        title: 'Dialogue',
        characterId: '',
        lines: [],
        textboxStyle: 'bottom',
        typewriterEffect: true,
        autoAdvance: false,
      };
    case 'narration':
      return {
        nodeType: 'narration',
        title: 'Narration',
        text: '',
        style: 'overlay',
        position: 'center',
        autoAdvance: true,
      };
    case 'feedback':
      return {
        nodeType: 'feedback',
        title: 'Feedback',
        variant: 'info',
        message: '',
        autoAdvance: true,
      };
    case 'assessment':
      return {
        nodeType: 'assessment',
        title: 'Assessment',
        questionType: 'multiple-choice',
        question: '',
        options: [],
        points: 10,
        partialCredit: false,
        maxAttempts: 1,
        showCorrectOnFail: true,
        correctTargetId: '',
        incorrectTargetId: '',
      };
    case 'branch':
      return {
        nodeType: 'branch',
        title: 'Branch',
        conditions: [],
        defaultTargetId: '',
      };
    case 'variable':
      return {
        nodeType: 'variable',
        title: 'Set Variable',
        operations: [],
        targetNodeId: '',
      };
    case 'action':
      return {
        nodeType: 'action',
        title: 'Action',
        actions: [],
        targetNodeId: '',
      };
    case 'random':
      return {
        nodeType: 'random',
        title: 'Random',
        branches: [],
        preventRepeat: true,
      };
    case 'timer':
      return {
        nodeType: 'timer',
        title: 'Timer',
        timerId: '',
        action: 'start',
        targetNodeId: '',
      };
    case 'meter':
      return {
        nodeType: 'meter',
        title: 'Meter',
        meterId: '',
        operation: 'add',
        targetNodeId: '',
      };
    case 'inventory':
      return {
        nodeType: 'inventory',
        title: 'Inventory',
        action: 'add',
        targetNodeId: '',
      };
    case 'character-select':
      return {
        nodeType: 'character-select',
        title: 'Character Select',
        prompt: 'Choose your character',
        characters: [],
        variableToSet: '',
        targetNodeId: '',
      };
    case 'checkpoint':
      return {
        nodeType: 'checkpoint',
        title: 'Checkpoint',
        checkpointId: generateId('checkpoint'),
        saveState: true,
        autoSave: true,
        targetNodeId: '',
      };
    case 'end':
      return {
        nodeType: 'end',
        title: 'End',
        endType: 'neutral',
        showSummary: true,
      };
  }
}

function createDefaultScenario(): Scenario {
  const startNodeId = generateId('scene');
  return {
    id: generateId('scenario'),
    title: 'Untitled Scenario',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [
      {
        id: startNodeId,
        type: 'scene',
        position: { x: 100, y: 200 },
        data: {
          nodeType: 'scene',
          title: 'Start',
          background: { type: 'color', color: '#1a1a2e' },
          characters: [],
          overlays: [],
          autoAdvance: false,
        },
      },
    ],
    edges: [],
    startNodeId,
    characters: [],
    variables: [],
    meters: [],
    inventoryItems: [],
    achievements: [],
    timers: [],
    flags: [],
    settings: {
      allowSkip: false,
      allowRewind: true,
      allowSave: true,
      autoSave: true,
      showProgress: true,
      showTimer: false,
      showMeters: true,
      showInventory: true,
      defaultMusicVolume: 0.5,
      defaultSfxVolume: 0.7,
      defaultVoiceVolume: 1,
      language: 'en',
      accessibility: {
        showCaptions: true,
        captionsLanguage: 'en',
        audioDescriptions: false,
        highContrast: false,
        reducedMotion: false,
        largeText: false,
        keyboardNavigation: true,
        screenReaderOptimized: false,
      },
    },
  };
}

// =============================================================================
// NODE PALETTE COMPONENT
// =============================================================================

interface NodePaletteProps {
  onAddNode: (type: ScenarioNodeType) => void;
}

function NodePalette({ onAddNode }: NodePaletteProps) {
  const categories = useMemo(() => {
    const grouped: Record<NodeCategory, ScenarioNodeType[]> = {
      content: [],
      logic: [],
      special: [],
    };

    for (const [type, config] of Object.entries(NODE_CONFIGS)) {
      grouped[config.category].push(type as ScenarioNodeType);
    }

    return grouped;
  }, []);

  return (
    <div className="w-64 border-r bg-card overflow-y-auto">
      <div className="p-3 border-b">
        <h3 className="font-medium text-sm">Node Palette</h3>
        <p className="text-xs text-muted-foreground mt-1">Drag or click to add nodes</p>
      </div>

      <div className="p-2 space-y-4">
        {(Object.keys(categories) as NodeCategory[]).map((category) => (
          <div key={category}>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-2">
              {CATEGORY_INFO[category].label}
            </h4>
            <div className="space-y-1">
              {categories[category].map((type) => {
                const config = NODE_CONFIGS[type];
                return (
                  <button
                    key={type}
                    type="button"
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm',
                      'hover:bg-muted/50 transition-colors',
                    )}
                    onClick={() => onAddNode(type)}
                  >
                    <config.icon className={cn('h-4 w-4', config.color)} />
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// TOOLBAR COMPONENT
// =============================================================================

interface ToolbarProps {
  scenario: Scenario;
  editorState: EditorState;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onFitView: () => void;
  onToggleGrid: () => void;
  onToggleMinimap: () => void;
  onSave: () => void;
  onPreview: () => void;
  onExport: (format: string) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  selectedCount: number;
}

function Toolbar({
  scenario: _scenario,
  editorState,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitView,
  onToggleGrid,
  onToggleMinimap: _onToggleMinimap,
  onSave,
  onPreview,
  onExport,
  onDeleteSelected,
  onDuplicateSelected,
  selectedCount,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 px-2 py-1.5 border-b bg-card">
      {/* File Operations */}
      <Button variant="ghost" size="sm" onClick={onSave}>
        <Save className="h-4 w-4 mr-1" />
        Save
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onExport('json')}>Export as JSON</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport('scorm')}>Export as SCORM</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport('xapi')}>Export as xAPI</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-5 bg-border mx-1" />

      {/* History */}
      <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo}>
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo}>
        <Redo2 className="h-4 w-4" />
      </Button>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Selection Actions */}
      {selectedCount > 0 && (
        <>
          <Button variant="ghost" size="sm" onClick={onDuplicateSelected}>
            <Copy className="h-4 w-4 mr-1" />
            Duplicate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeleteSelected}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          <span className="text-xs text-muted-foreground px-2">{selectedCount} selected</span>
          <div className="w-px h-5 bg-border mx-1" />
        </>
      )}

      {/* View Controls */}
      <Button variant="ghost" size="icon" onClick={onZoomOut}>
        <ZoomOut className="h-4 w-4" />
      </Button>
      <button
        type="button"
        className="px-2 py-1 text-xs hover:bg-muted rounded"
        onClick={onZoomReset}
      >
        {Math.round(editorState.zoom * 100)}%
      </button>
      <Button variant="ghost" size="icon" onClick={onZoomIn}>
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onFitView}>
        <Maximize2 className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleGrid}
        className={editorState.showGrid ? 'bg-muted' : ''}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>

      <div className="flex-1" />

      {/* Preview */}
      <Button variant="outline" size="sm" onClick={onPreview}>
        <Play className="h-4 w-4 mr-1" />
        Preview
      </Button>
    </div>
  );
}

// =============================================================================
// DATA PANEL (Variables, Meters, Characters, etc.)
// =============================================================================

interface DataPanelProps {
  scenario: Scenario;
  onChange: (updates: Partial<Scenario>) => void;
}

function DataPanel({ scenario, onChange }: DataPanelProps) {
  const addVariable = () => {
    onChange({
      variables: [
        ...scenario.variables,
        {
          id: generateId('var'),
          name: `variable${scenario.variables.length + 1}`,
          type: 'number',
          defaultValue: 0,
        },
      ],
    });
  };

  const addMeter = () => {
    onChange({
      meters: [
        ...scenario.meters,
        {
          id: generateId('meter'),
          name: `Meter ${scenario.meters.length + 1}`,
          min: 0,
          max: 100,
          defaultValue: 50,
          showInHUD: true,
        },
      ],
    });
  };

  const addCharacter = () => {
    onChange({
      characters: [
        ...scenario.characters,
        {
          id: generateId('char'),
          name: `Character ${scenario.characters.length + 1}`,
          expressions: [],
        },
      ],
    });
  };

  return (
    <div className="w-64 border-l bg-card overflow-y-auto">
      <Tabs defaultValue="variables">
        <TabsList className="w-full grid grid-cols-3 p-1 mx-2 mt-2">
          <TabsTrigger value="variables" className="text-xs">
            Vars
          </TabsTrigger>
          <TabsTrigger value="meters" className="text-xs">
            Meters
          </TabsTrigger>
          <TabsTrigger value="characters" className="text-xs">
            Chars
          </TabsTrigger>
        </TabsList>

        <TabsContent value="variables" className="p-2 space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-medium">Variables</span>
            <Button variant="ghost" size="sm" className="h-6" onClick={addVariable}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          {scenario.variables.map((v) => (
            <div key={v.id} className="px-2 py-1 rounded bg-muted/50 text-xs">
              <span className="font-mono">{v.name}</span>
              <span className="text-muted-foreground ml-2">
                ({v.type}: {String(v.defaultValue)})
              </span>
            </div>
          ))}
          {scenario.variables.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No variables defined</p>
          )}
        </TabsContent>

        <TabsContent value="meters" className="p-2 space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-medium">Meters</span>
            <Button variant="ghost" size="sm" className="h-6" onClick={addMeter}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          {scenario.meters.map((m) => (
            <div key={m.id} className="px-2 py-1 rounded bg-muted/50 text-xs">
              <div className="flex items-center gap-2">
                <Gauge className="h-3 w-3" />
                <span>{m.name}</span>
              </div>
              <div className="text-muted-foreground">
                {m.min} - {m.max} (default: {m.defaultValue})
              </div>
            </div>
          ))}
          {scenario.meters.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No meters defined</p>
          )}
        </TabsContent>

        <TabsContent value="characters" className="p-2 space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-medium">Characters</span>
            <Button variant="ghost" size="sm" className="h-6" onClick={addCharacter}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          {scenario.characters.map((c) => (
            <div
              key={c.id}
              className="px-2 py-1 rounded bg-muted/50 text-xs flex items-center gap-2"
            >
              {c.avatarUrl ? (
                <Image src={c.avatarUrl} alt="" width={24} height={24} className="rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <Users className="h-3 w-3" />
                </div>
              )}
              <span>{c.name}</span>
            </div>
          ))}
          {scenario.characters.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No characters defined</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ScenarioBuilder({
  scenario: initialScenario,
  onChange,
  onSave,
  onPreview,
  onExport,
}: ScenarioBuilderProps) {
  // State
  const [scenario, setScenario] = useState<Scenario>(initialScenario || createDefaultScenario());
  const [editorState, setEditorState] = useState<EditorState>({
    selectedNodes: [],
    selectedEdges: [],
    zoom: 1,
    panX: 50,
    panY: 50,
    showMinimap: false,
    showGrid: true,
    snapToGrid: true,
  });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [propertiesNodeId, setPropertiesNodeId] = useState<string | null>(null);

  // Computed
  const selectedNode = useMemo(() => {
    if (propertiesNodeId) {
      return scenario.nodes.find((n) => n.id === propertiesNodeId) || null;
    }
    return null;
  }, [propertiesNodeId, scenario.nodes]);

  // Save to history
  const saveToHistory = useCallback(() => {
    const entry: HistoryEntry = {
      nodes: JSON.parse(JSON.stringify(scenario.nodes)),
      edges: JSON.parse(JSON.stringify(scenario.edges)),
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, entry].slice(-50); // Keep last 50 entries
    });
    setHistoryIndex((prev) => prev + 1);
  }, [scenario.nodes, scenario.edges, historyIndex]);

  // Update scenario
  const updateScenario = useCallback(
    (updates: Partial<Scenario>) => {
      setScenario((prev) => {
        const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };
        onChange?.(updated);
        return updated;
      });
    },
    [onChange],
  );

  // Node operations
  const handleAddNode = useCallback(
    (type: ScenarioNodeType) => {
      saveToHistory();

      const newNode: ScenarioNode = {
        id: generateId(type),
        type,
        position: {
          x: 200 + scenario.nodes.length * 30,
          y: 200 + scenario.nodes.length * 30,
        },
        data: createDefaultNodeData(type),
      };

      updateScenario({ nodes: [...scenario.nodes, newNode] });
      setEditorState((prev) => ({ ...prev, selectedNodes: [newNode.id] }));
    },
    [scenario.nodes, saveToHistory, updateScenario],
  );

  const handleNodeMove = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      updateScenario({
        nodes: scenario.nodes.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                position: editorState.snapToGrid
                  ? { x: Math.round(position.x / 20) * 20, y: Math.round(position.y / 20) * 20 }
                  : position,
              }
            : n,
        ),
      });
    },
    [scenario.nodes, editorState.snapToGrid, updateScenario],
  );

  const handleNodeSelect = useCallback((nodeId: string, multi?: boolean) => {
    setEditorState((prev) => ({
      ...prev,
      selectedNodes: multi
        ? prev.selectedNodes.includes(nodeId)
          ? prev.selectedNodes.filter((id) => id !== nodeId)
          : [...prev.selectedNodes, nodeId]
        : [nodeId],
      selectedEdges: [],
    }));
  }, []);

  const handleNodeChange = useCallback(
    (node: ScenarioNode) => {
      updateScenario({
        nodes: scenario.nodes.map((n) => (n.id === node.id ? node : n)),
      });
    },
    [scenario.nodes, updateScenario],
  );

  const handleDeleteSelected = useCallback(() => {
    saveToHistory();
    const nodeIds = new Set(editorState.selectedNodes);
    const edgeIds = new Set(editorState.selectedEdges);

    updateScenario({
      nodes: scenario.nodes.filter((n) => !nodeIds.has(n.id)),
      edges: scenario.edges.filter(
        (e) => !edgeIds.has(e.id) && !nodeIds.has(e.source) && !nodeIds.has(e.target),
      ),
    });

    setEditorState((prev) => ({
      ...prev,
      selectedNodes: [],
      selectedEdges: [],
    }));
  }, [scenario.nodes, scenario.edges, editorState, saveToHistory, updateScenario]);

  const handleDuplicateSelected = useCallback(() => {
    saveToHistory();

    const newNodes: ScenarioNode[] = [];
    const idMap = new Map<string, string>();

    for (const nodeId of editorState.selectedNodes) {
      const node = scenario.nodes.find((n) => n.id === nodeId);
      if (!node) continue;

      const newId = generateId(node.type);
      idMap.set(nodeId, newId);

      newNodes.push({
        ...JSON.parse(JSON.stringify(node)),
        id: newId,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
      });
    }

    updateScenario({ nodes: [...scenario.nodes, ...newNodes] });
    setEditorState((prev) => ({
      ...prev,
      selectedNodes: newNodes.map((n) => n.id),
    }));
  }, [scenario.nodes, editorState.selectedNodes, saveToHistory, updateScenario]);

  // Edge operations
  const handleEdgeSelect = useCallback((edgeId: string) => {
    setEditorState((prev) => ({
      ...prev,
      selectedEdges: [edgeId],
      selectedNodes: [],
    }));
  }, []);

  // History
  const handleUndo = useCallback(() => {
    if (historyIndex < 0) return;

    const entry = history[historyIndex];
    if (!entry) return;

    updateScenario({
      nodes: entry.nodes,
      edges: entry.edges,
    });
    setHistoryIndex((prev) => prev - 1);
  }, [history, historyIndex, updateScenario]);

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;

    const entry = history[historyIndex + 1];
    if (!entry) return;

    updateScenario({
      nodes: entry.nodes,
      edges: entry.edges,
    });
    setHistoryIndex((prev) => prev + 1);
  }, [history, historyIndex, updateScenario]);

  // View controls
  const handleZoomIn = useCallback(() => {
    setEditorState((prev) => ({
      ...prev,
      zoom: Math.min(2, prev.zoom + 0.25),
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setEditorState((prev) => ({
      ...prev,
      zoom: Math.max(0.25, prev.zoom - 0.25),
    }));
  }, []);

  const handleZoomReset = useCallback(() => {
    setEditorState((prev) => ({ ...prev, zoom: 1 }));
  }, []);

  const handleFitView = useCallback(() => {
    // Calculate bounds and fit
    if (scenario.nodes.length === 0) return;

    const bounds = scenario.nodes.reduce(
      (acc, node) => ({
        minX: Math.min(acc.minX, node.position.x),
        minY: Math.min(acc.minY, node.position.y),
        maxX: Math.max(acc.maxX, node.position.x + 200),
        maxY: Math.max(acc.maxY, node.position.y + 100),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
    );

    setEditorState((prev) => ({
      ...prev,
      panX: -bounds.minX + 50,
      panY: -bounds.minY + 50,
      zoom: 1,
    }));
  }, [scenario.nodes]);

  const handlePan = useCallback((x: number, y: number) => {
    setEditorState((prev) => ({ ...prev, panX: x, panY: y }));
  }, []);

  const handleCanvasClick = useCallback(() => {
    setEditorState((prev) => ({
      ...prev,
      selectedNodes: [],
      selectedEdges: [],
    }));
    setPropertiesNodeId(null);
  }, []);

  // Save
  const handleSave = useCallback(() => {
    onSave?.(scenario);
  }, [scenario, onSave]);

  // Preview
  const handlePreview = useCallback(() => {
    onPreview?.(scenario.startNodeId);
  }, [scenario.startNodeId, onPreview]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <Toolbar
        scenario={scenario}
        editorState={editorState}
        canUndo={historyIndex >= 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onFitView={handleFitView}
        onToggleGrid={() => setEditorState((prev) => ({ ...prev, showGrid: !prev.showGrid }))}
        onToggleMinimap={() =>
          setEditorState((prev) => ({ ...prev, showMinimap: !prev.showMinimap }))
        }
        onSave={handleSave}
        onPreview={handlePreview}
        onExport={(format) => onExport?.(format)}
        onDeleteSelected={handleDeleteSelected}
        onDuplicateSelected={handleDuplicateSelected}
        selectedCount={editorState.selectedNodes.length + editorState.selectedEdges.length}
      />

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Node Palette */}
        <NodePalette onAddNode={handleAddNode} />

        {/* Canvas */}
        <ScenarioCanvas
          nodes={scenario.nodes}
          edges={scenario.edges}
          startNodeId={scenario.startNodeId}
          selectedNodes={editorState.selectedNodes}
          selectedEdges={editorState.selectedEdges}
          zoom={editorState.zoom}
          panX={editorState.panX}
          panY={editorState.panY}
          onNodeSelect={handleNodeSelect}
          onEdgeSelect={handleEdgeSelect}
          onNodeMove={handleNodeMove}
          onOpenProperties={setPropertiesNodeId}
          onCanvasClick={handleCanvasClick}
          onPan={handlePan}
        />

        {/* Right Panel - Properties or Data */}
        {selectedNode ? (
          <NodeProperties
            node={selectedNode}
            characters={scenario.characters}
            variables={scenario.variables}
            meters={scenario.meters}
            inventoryItems={scenario.inventoryItems}
            allNodes={scenario.nodes}
            onChange={handleNodeChange}
            onClose={() => setPropertiesNodeId(null)}
          />
        ) : (
          <DataPanel scenario={scenario} onChange={updateScenario} />
        )}
      </div>
    </div>
  );
}

export default ScenarioBuilder;
