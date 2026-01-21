'use client';

import { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  type Connection,
  Controls,
  type Edge,
  type EdgeChange,
  MiniMap,
  type Node,
  type NodeChange,
  Panel,
  type ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type {
  ScenarioEdge,
  ScenarioNode,
  ScenarioNodeType,
} from '@/components/inspire-studio/branching/types';
import {
  createActionNode,
  createDialogueNode,
  createEndStateNode,
  createLogicGateNode,
} from '@/components/inspire-studio/branching/types';
import { cn } from '@/lib/utils';
import { useScenarioStore } from '@/store/inspire/useScenarioStore';
import { ActionNode } from '../nodes/ActionNode';
import { DialogueNode } from '../nodes/DialogueNode';
import { EndStateNode } from '../nodes/EndStateNode';
import { LogicGateNode } from '../nodes/LogicGateNode';
import { StartNode } from '../nodes/StartNode';
import { NodeToolbox } from './NodeToolbox';

// =============================================================================
// Node Types Registry
// =============================================================================

const nodeTypes = {
  start: StartNode,
  dialogue: DialogueNode,
  action: ActionNode,
  logic_gate: LogicGateNode,
  end_state: EndStateNode,
};

// =============================================================================
// FlowBuilder Component
// =============================================================================

interface FlowBuilderProps {
  className?: string;
  readOnly?: boolean;
}

export function FlowBuilder({ className, readOnly = false }: FlowBuilderProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Store state
  const scenario = useScenarioStore((state) => state.scenario);
  const addNode = useScenarioStore((state) => state.addNode);
  const updateNode = useScenarioStore((state) => state.updateNode);
  const deleteNode = useScenarioStore((state) => state.deleteNode);
  const addEdgeToStore = useScenarioStore((state) => state.addEdge);
  const deleteEdge = useScenarioStore((state) => state.deleteEdge);
  const setSelectedNode = useScenarioStore((state) => state.setSelectedNode);
  const setSelectedEdge = useScenarioStore((state) => state.setSelectedEdge);

  // Convert store nodes/edges to ReactFlow format
  const nodes: Node[] = scenario.nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data,
    selected: useScenarioStore.getState().selectedNodeId === node.id,
  }));

  const edges: Edge[] = scenario.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: edge.type ?? 'default',
    label: edge.label,
    data: edge.data,
    selected: useScenarioStore.getState().selectedEdgeId === edge.id,
    animated: edge.type === 'true_path' || edge.type === 'false_path',
    style: getEdgeStyle(edge.type),
    labelStyle: { fill: '#fff', fontWeight: 500 },
    labelBgStyle: { fill: '#1a1a2e', fillOpacity: 0.9 },
    labelBgPadding: [8, 4] as [number, number],
    labelBgBorderRadius: 4,
  }));

  // Handle node changes (position, selection, deletion)
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (readOnly) return;

      for (const change of changes) {
        if (change.type === 'position' && change.position) {
          updateNode(change.id, { position: change.position });
        } else if (change.type === 'select') {
          if (change.selected) {
            setSelectedNode(change.id);
          }
        } else if (change.type === 'remove') {
          deleteNode(change.id);
        }
      }
    },
    [readOnly, updateNode, setSelectedNode, deleteNode],
  );

  // Handle edge changes
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (readOnly) return;

      for (const change of changes) {
        if (change.type === 'select') {
          if (change.selected) {
            setSelectedEdge(change.id);
          }
        } else if (change.type === 'remove') {
          deleteEdge(change.id);
        }
      }
    },
    [readOnly, setSelectedEdge, deleteEdge],
  );

  // Handle new connections
  const onConnect = useCallback(
    (connection: Connection) => {
      if (readOnly || !connection.source || !connection.target) return;

      const newEdge: ScenarioEdge = {
        id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
        type: 'default',
      };

      addEdgeToStore(newEdge);
    },
    [readOnly, addEdgeToStore],
  );

  // Handle drag over for drop zone
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle node drop from toolbox
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (readOnly || !reactFlowInstance || !reactFlowWrapper.current) return;

      const nodeType = event.dataTransfer.getData('application/reactflow') as ScenarioNodeType;
      if (!nodeType) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      let newNode: ScenarioNode;
      switch (nodeType) {
        case 'dialogue':
          newNode = createDialogueNode(position);
          break;
        case 'action':
          newNode = createActionNode(position);
          break;
        case 'logic_gate':
          newNode = createLogicGateNode(position);
          break;
        case 'end_state':
          newNode = createEndStateNode(position);
          break;
        default:
          return;
      }

      addNode(newNode);
    },
    [readOnly, reactFlowInstance, addNode],
  );

  // Handle pane click to deselect
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge]);

  return (
    <div ref={reactFlowWrapper} className={cn('w-full h-full bg-lxd-dark-bg', className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        deleteKeyCode={readOnly ? null : 'Delete'}
        proOptions={{ hideAttribution: true }}
        className="bg-lxd-dark-bg"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#333" />
        <Controls
          showInteractive={!readOnly}
          className="bg-lxd-dark-surface border-lxd-dark-border"
        />
        <MiniMap
          nodeStrokeColor={(node) => getNodeColor(node.type as ScenarioNodeType)}
          nodeColor={(node) => getNodeColor(node.type as ScenarioNodeType)}
          className="bg-lxd-dark-surface border-lxd-dark-border"
        />
        {!readOnly && (
          <Panel position="top-left" className="m-4">
            <NodeToolbox />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

function getEdgeStyle(type?: string): React.CSSProperties {
  switch (type) {
    case 'true_path':
      return { stroke: '#22c55e', strokeWidth: 2 };
    case 'false_path':
      return { stroke: '#ef4444', strokeWidth: 2 };
    case 'choice':
      return { stroke: '#00ced1', strokeWidth: 2 };
    default:
      return { stroke: '#666', strokeWidth: 1.5 };
  }
}

function getNodeColor(type: ScenarioNodeType): string {
  switch (type) {
    case 'start':
      return '#22c55e';
    case 'dialogue':
      return '#3b82f6';
    case 'action':
      return '#f97316';
    case 'logic_gate':
      return '#8b5cf6';
    case 'end_state':
      return '#ef4444';
    default:
      return '#666';
  }
}

export default FlowBuilder;
