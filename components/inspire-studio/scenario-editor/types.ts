// ScenarioEditor Types

export type NodeType = 'start' | 'content' | 'decision' | 'end';

export interface Position {
  x: number;
  y: number;
}

export interface ScenarioNode {
  id: string;
  type: NodeType;
  position: Position;
  data: NodeData;
}

export interface NodeData {
  title: string;
  content?: string;
  options?: DecisionOption[];
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
  };
}

export interface DecisionOption {
  id: string;
  label: string;
  targetNodeId?: string;
}

export interface Connection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle?: string; // For decision nodes, specifies which option
  label?: string;
}

export interface ScenarioData {
  id: string;
  title: string;
  description?: string;
  nodes: ScenarioNode[];
  connections: Connection[];
  startNodeId?: string;
}

export interface CanvasState {
  zoom: number;
  pan: Position;
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  isConnecting: boolean;
  connectingFromNode: string | null;
  connectingFromHandle: string | null;
}

export const NODE_DIMENSIONS = {
  start: { width: 120, height: 60 },
  content: { width: 200, height: 100 },
  decision: { width: 200, height: 140 },
  end: { width: 120, height: 60 },
} as const;

export const NODE_COLORS = {
  start: {
    bg: 'bg-green-100',
    border: 'border-green-500',
    text: 'text-green-800',
    handle: 'bg-green-500',
  },
  content: {
    bg: 'bg-blue-100',
    border: 'border-blue-500',
    text: 'text-blue-800',
    handle: 'bg-blue-500',
  },
  decision: {
    bg: 'bg-amber-100',
    border: 'border-amber-500',
    text: 'text-amber-800',
    handle: 'bg-amber-500',
  },
  end: {
    bg: 'bg-red-100',
    border: 'border-red-500',
    text: 'text-red-800',
    handle: 'bg-red-500',
  },
} as const;
