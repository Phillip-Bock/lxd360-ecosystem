'use client';

import type {
  ScenarioEdge,
  ScenarioManifest,
  ScenarioNode,
} from '@/components/inspire-studio/branching/types';

// =============================================================================
// Path Analysis Types
// =============================================================================

export interface PathAnalysis {
  /** All valid paths from start to end states */
  paths: string[][];
  /** Nodes with no outgoing edges (not end states) */
  deadEnds: string[];
  /** Detected circular paths */
  loops: string[][];
  /** Nodes not reachable from start */
  unreachable: string[];
}

// =============================================================================
// Path Analyzer Algorithm
// =============================================================================

/**
 * Analyzes a scenario for dead ends, loops, and unreachable nodes.
 * Uses depth-first traversal with cycle detection.
 */
export function analyzeScenarioPaths(scenario: ScenarioManifest): PathAnalysis {
  const { nodes, edges, startingNodeId } = scenario;

  // Build adjacency list for graph traversal
  const adjacency = buildAdjacencyList(nodes, edges);

  // Find all paths using DFS
  const paths: string[][] = [];
  const loops: string[][] = [];
  const visited = new Set<string>();
  const pathStack: string[] = [];

  // DFS traversal function
  function dfs(nodeId: string) {
    // Check for loops
    if (pathStack.includes(nodeId)) {
      const loopStart = pathStack.indexOf(nodeId);
      const loop = [...pathStack.slice(loopStart), nodeId];
      loops.push(loop);
      return;
    }

    visited.add(nodeId);
    pathStack.push(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    const neighbors = adjacency.get(nodeId) ?? [];

    // If this is an end state or has no outgoing edges, record the path
    if (node?.type === 'end_state' || neighbors.length === 0) {
      paths.push([...pathStack]);
    } else {
      // Continue traversal
      for (const neighbor of neighbors) {
        dfs(neighbor);
      }
    }

    pathStack.pop();
  }

  // Start traversal from starting node
  if (startingNodeId) {
    dfs(startingNodeId);
  }

  // Find dead ends (non-end-state nodes with no outgoing edges)
  const deadEnds = nodes
    .filter((node) => {
      if (node.type === 'end_state') return false;
      if (node.type === 'start') return false;
      const outgoing = adjacency.get(node.id) ?? [];
      return outgoing.length === 0;
    })
    .map((node) => node.id);

  // Find unreachable nodes
  const unreachable = nodes
    .filter((node) => {
      if (node.id === startingNodeId) return false;
      return !visited.has(node.id);
    })
    .map((node) => node.id);

  // Deduplicate loops
  const uniqueLoops = deduplicateLoops(loops);

  return {
    paths,
    deadEnds,
    loops: uniqueLoops,
    unreachable,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Builds an adjacency list from nodes and edges.
 */
function buildAdjacencyList(nodes: ScenarioNode[], edges: ScenarioEdge[]): Map<string, string[]> {
  const adjacency = new Map<string, string[]>();

  // Initialize all nodes
  for (const node of nodes) {
    adjacency.set(node.id, []);
  }

  // Add edges
  for (const edge of edges) {
    const neighbors = adjacency.get(edge.source) ?? [];
    if (!neighbors.includes(edge.target)) {
      neighbors.push(edge.target);
      adjacency.set(edge.source, neighbors);
    }
  }

  // Add implicit edges from dialogue choices
  for (const node of nodes) {
    if (node.type === 'dialogue' && node.data?.choices) {
      const choices = node.data.choices as Array<{ targetNodeId: string | null }>;
      const neighbors = adjacency.get(node.id) ?? [];
      for (const choice of choices) {
        if (choice.targetNodeId && !neighbors.includes(choice.targetNodeId)) {
          neighbors.push(choice.targetNodeId);
        }
      }
      adjacency.set(node.id, neighbors);
    }

    // Add implicit edges from action nodes
    if (node.type === 'action' && node.data?.targetNodeId) {
      const neighbors = adjacency.get(node.id) ?? [];
      const targetId = node.data.targetNodeId as string;
      if (!neighbors.includes(targetId)) {
        neighbors.push(targetId);
        adjacency.set(node.id, neighbors);
      }
    }

    // Add implicit edges from logic gate nodes
    if (node.type === 'logic_gate') {
      const neighbors = adjacency.get(node.id) ?? [];
      const truePath = node.data?.truePathNodeId as string | null;
      const falsePath = node.data?.falsePathNodeId as string | null;
      if (truePath && !neighbors.includes(truePath)) {
        neighbors.push(truePath);
      }
      if (falsePath && !neighbors.includes(falsePath)) {
        neighbors.push(falsePath);
      }
      adjacency.set(node.id, neighbors);
    }
  }

  return adjacency;
}

/**
 * Removes duplicate loops (same nodes, different starting point).
 */
function deduplicateLoops(loops: string[][]): string[][] {
  const seen = new Set<string>();
  const unique: string[][] = [];

  for (const loop of loops) {
    // Normalize loop by sorting and creating a key
    const normalized = [...loop].sort().join(',');
    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(loop);
    }
  }

  return unique;
}

/**
 * Checks if a specific node is a dead end.
 */
export function isDeadEnd(nodeId: string, scenario: ScenarioManifest): boolean {
  const node = scenario.nodes.find((n) => n.id === nodeId);
  if (!node || node.type === 'end_state') return false;

  const hasOutgoingEdge = scenario.edges.some((e) => e.source === nodeId);
  if (hasOutgoingEdge) return false;

  // Check for implicit connections
  if (node.type === 'dialogue' && node.data?.choices) {
    const choices = node.data.choices as Array<{ targetNodeId: string | null }>;
    return !choices.some((c) => c.targetNodeId);
  }

  if (node.type === 'action' && node.data?.targetNodeId) {
    return false;
  }

  if (node.type === 'logic_gate') {
    return !node.data?.truePathNodeId && !node.data?.falsePathNodeId;
  }

  return true;
}

/**
 * Gets all possible outcomes from a scenario.
 */
export function getScenarioOutcomes(
  scenario: ScenarioManifest,
): Array<{ nodeId: string; outcome: string; reachable: boolean }> {
  const analysis = analyzeScenarioPaths(scenario);

  return scenario.nodes
    .filter((node) => node.type === 'end_state')
    .map((node) => ({
      nodeId: node.id,
      outcome: (node.data?.outcome as string) ?? 'neutral',
      reachable: !analysis.unreachable.includes(node.id),
    }));
}

export default analyzeScenarioPaths;
