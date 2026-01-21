'use client';

import { temporal } from 'zundo';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Choice,
  ScenarioEdge,
  ScenarioManifest,
  ScenarioNode,
  Variable,
  VariableMutation,
  VariableValue,
} from '@/components/inspire-studio/branching/types';
import {
  createChoice,
  createDefaultScenario,
  createVariable,
} from '@/components/inspire-studio/branching/types';

// =============================================================================
// Scenario Store Types
// =============================================================================

interface ScenarioState {
  // Current scenario
  scenario: ScenarioManifest;

  // Selection state
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  selectedVariableKey: string | null;

  // Player state (for preview/play mode)
  currentNodeId: string | null;
  variableValues: Record<string, VariableValue>;
  pathHistory: string[];
  isPlaying: boolean;

  // UI state
  isDirty: boolean;
  validationIssues: Array<{ nodeId: string; type: string; message: string }>;
}

interface ScenarioActions {
  // Scenario management
  setScenario: (scenario: ScenarioManifest) => void;
  updateScenario: (updates: Partial<ScenarioManifest>) => void;
  resetScenario: () => void;

  // Node management
  addNode: (node: ScenarioNode) => void;
  updateNode: (nodeId: string, updates: Partial<ScenarioNode>) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (nodeId: string | null) => void;

  // Edge management
  addEdge: (edge: ScenarioEdge) => void;
  updateEdge: (edgeId: string, updates: Partial<ScenarioEdge>) => void;
  deleteEdge: (edgeId: string) => void;
  setSelectedEdge: (edgeId: string | null) => void;

  // Variable management
  addVariable: (variable?: Variable) => void;
  updateVariable: (key: string, updates: Partial<Variable>) => void;
  deleteVariable: (key: string) => void;
  setSelectedVariable: (key: string | null) => void;

  // Choice management (for dialogue nodes)
  addChoice: (nodeId: string, choice?: Choice) => void;
  updateChoice: (nodeId: string, choiceId: string, updates: Partial<Choice>) => void;
  deleteChoice: (nodeId: string, choiceId: string) => void;

  // Player actions
  startScenario: () => void;
  stopScenario: () => void;
  makeChoice: (choiceId: string) => void;
  advanceToNode: (nodeId: string) => void;
  applyMutations: (mutations: VariableMutation[]) => void;
  resetPlayerState: () => void;

  // Validation
  setValidationIssues: (issues: ScenarioState['validationIssues']) => void;

  // State helpers
  markDirty: () => void;
  markClean: () => void;
}

type ScenarioStore = ScenarioState & ScenarioActions;

// =============================================================================
// Initial State
// =============================================================================

const initialState: ScenarioState = {
  scenario: createDefaultScenario(),
  selectedNodeId: null,
  selectedEdgeId: null,
  selectedVariableKey: null,
  currentNodeId: null,
  variableValues: {},
  pathHistory: [],
  isPlaying: false,
  isDirty: false,
  validationIssues: [],
};

// =============================================================================
// Store Creation with Zundo (Undo/Redo)
// =============================================================================

export const useScenarioStore = create<ScenarioStore>()(
  temporal(
    persist(
      (set, get) => ({
        ...initialState,

        // =====================================================================
        // Scenario Management
        // =====================================================================

        setScenario: (scenario) =>
          set({
            scenario,
            selectedNodeId: null,
            selectedEdgeId: null,
            isDirty: false,
          }),

        updateScenario: (updates) =>
          set((state) => ({
            scenario: { ...state.scenario, ...updates },
            isDirty: true,
          })),

        resetScenario: () =>
          set({
            scenario: createDefaultScenario(),
            selectedNodeId: null,
            selectedEdgeId: null,
            isDirty: false,
          }),

        // =====================================================================
        // Node Management
        // =====================================================================

        addNode: (node) =>
          set((state) => ({
            scenario: {
              ...state.scenario,
              nodes: [...state.scenario.nodes, node],
            },
            selectedNodeId: node.id,
            isDirty: true,
          })),

        updateNode: (nodeId, updates) =>
          set((state) => ({
            scenario: {
              ...state.scenario,
              nodes: state.scenario.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)),
            },
            isDirty: true,
          })),

        deleteNode: (nodeId) =>
          set((state) => ({
            scenario: {
              ...state.scenario,
              nodes: state.scenario.nodes.filter((n) => n.id !== nodeId),
              edges: state.scenario.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
              startingNodeId:
                state.scenario.startingNodeId === nodeId ? null : state.scenario.startingNodeId,
            },
            selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
            isDirty: true,
          })),

        setSelectedNode: (nodeId) =>
          set({
            selectedNodeId: nodeId,
            selectedEdgeId: null,
          }),

        // =====================================================================
        // Edge Management
        // =====================================================================

        addEdge: (edge) =>
          set((state) => ({
            scenario: {
              ...state.scenario,
              edges: [...state.scenario.edges, edge],
            },
            isDirty: true,
          })),

        updateEdge: (edgeId, updates) =>
          set((state) => ({
            scenario: {
              ...state.scenario,
              edges: state.scenario.edges.map((e) => (e.id === edgeId ? { ...e, ...updates } : e)),
            },
            isDirty: true,
          })),

        deleteEdge: (edgeId) =>
          set((state) => ({
            scenario: {
              ...state.scenario,
              edges: state.scenario.edges.filter((e) => e.id !== edgeId),
            },
            selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
            isDirty: true,
          })),

        setSelectedEdge: (edgeId) =>
          set({
            selectedEdgeId: edgeId,
            selectedNodeId: null,
          }),

        // =====================================================================
        // Variable Management
        // =====================================================================

        addVariable: (variable) =>
          set((state) => ({
            scenario: {
              ...state.scenario,
              variables: [...state.scenario.variables, variable ?? createVariable()],
            },
            isDirty: true,
          })),

        updateVariable: (key, updates) =>
          set((state) => ({
            scenario: {
              ...state.scenario,
              variables: state.scenario.variables.map((v) =>
                v.key === key ? { ...v, ...updates } : v,
              ),
            },
            isDirty: true,
          })),

        deleteVariable: (key) =>
          set((state) => ({
            scenario: {
              ...state.scenario,
              variables: state.scenario.variables.filter((v) => v.key !== key),
            },
            selectedVariableKey:
              state.selectedVariableKey === key ? null : state.selectedVariableKey,
            isDirty: true,
          })),

        setSelectedVariable: (key) => set({ selectedVariableKey: key }),

        // =====================================================================
        // Choice Management
        // =====================================================================

        addChoice: (nodeId, choice) =>
          set((state) => ({
            scenario: {
              ...state.scenario,
              nodes: state.scenario.nodes.map((n) => {
                if (n.id !== nodeId || n.type !== 'dialogue') return n;
                const data = n.data as { choices?: Choice[] };
                return {
                  ...n,
                  data: {
                    ...data,
                    choices: [...(data.choices ?? []), choice ?? createChoice()],
                  },
                };
              }),
            },
            isDirty: true,
          })),

        updateChoice: (nodeId, choiceId, updates) =>
          set((state) => ({
            scenario: {
              ...state.scenario,
              nodes: state.scenario.nodes.map((n) => {
                if (n.id !== nodeId || n.type !== 'dialogue') return n;
                const data = n.data as { choices?: Choice[] };
                return {
                  ...n,
                  data: {
                    ...data,
                    choices: (data.choices ?? []).map((c) =>
                      c.id === choiceId ? { ...c, ...updates } : c,
                    ),
                  },
                };
              }),
            },
            isDirty: true,
          })),

        deleteChoice: (nodeId, choiceId) =>
          set((state) => ({
            scenario: {
              ...state.scenario,
              nodes: state.scenario.nodes.map((n) => {
                if (n.id !== nodeId || n.type !== 'dialogue') return n;
                const data = n.data as { choices?: Choice[] };
                return {
                  ...n,
                  data: {
                    ...data,
                    choices: (data.choices ?? []).filter((c) => c.id !== choiceId),
                  },
                };
              }),
              // Also remove edges connected to this choice
              edges: state.scenario.edges.filter((e) => e.data?.choiceId !== choiceId),
            },
            isDirty: true,
          })),

        // =====================================================================
        // Player Actions
        // =====================================================================

        startScenario: () => {
          const { scenario } = get();
          const initialValues: Record<string, VariableValue> = {};
          for (const v of scenario.variables) {
            initialValues[v.key] = v.initialValue;
          }
          set({
            isPlaying: true,
            currentNodeId: scenario.startingNodeId,
            variableValues: initialValues,
            pathHistory: scenario.startingNodeId ? [scenario.startingNodeId] : [],
          });
        },

        stopScenario: () =>
          set({
            isPlaying: false,
            currentNodeId: null,
            pathHistory: [],
          }),

        makeChoice: (choiceId) => {
          const { scenario, currentNodeId, variableValues, pathHistory } = get();
          const currentNode = scenario.nodes.find((n) => n.id === currentNodeId);
          if (!currentNode || currentNode.type !== 'dialogue') return;

          const data = currentNode.data as { choices?: Choice[] };
          const choice = (data.choices ?? []).find((c) => c.id === choiceId);
          if (!choice || !choice.targetNodeId) return;

          // Apply variable mutations
          const newValues = { ...variableValues };
          for (const mutation of choice.variableMutations) {
            const currentValue = newValues[mutation.variableKey];
            switch (mutation.operation) {
              case 'set':
                newValues[mutation.variableKey] = mutation.value;
                break;
              case 'add':
                if (typeof currentValue === 'number' && typeof mutation.value === 'number') {
                  newValues[mutation.variableKey] = currentValue + mutation.value;
                }
                break;
              case 'subtract':
                if (typeof currentValue === 'number' && typeof mutation.value === 'number') {
                  newValues[mutation.variableKey] = currentValue - mutation.value;
                }
                break;
              case 'multiply':
                if (typeof currentValue === 'number' && typeof mutation.value === 'number') {
                  newValues[mutation.variableKey] = currentValue * mutation.value;
                }
                break;
              case 'toggle':
                if (typeof currentValue === 'boolean') {
                  newValues[mutation.variableKey] = !currentValue;
                }
                break;
              case 'append':
                if (typeof currentValue === 'string' && typeof mutation.value === 'string') {
                  newValues[mutation.variableKey] = currentValue + mutation.value;
                }
                break;
            }
          }

          set({
            currentNodeId: choice.targetNodeId,
            variableValues: newValues,
            pathHistory: [...pathHistory, choice.targetNodeId],
          });
        },

        advanceToNode: (nodeId) =>
          set((state) => ({
            currentNodeId: nodeId,
            pathHistory: [...state.pathHistory, nodeId],
          })),

        applyMutations: (mutations) =>
          set((state) => {
            const newValues = { ...state.variableValues };
            for (const mutation of mutations) {
              const currentValue = newValues[mutation.variableKey];
              switch (mutation.operation) {
                case 'set':
                  newValues[mutation.variableKey] = mutation.value;
                  break;
                case 'add':
                  if (typeof currentValue === 'number' && typeof mutation.value === 'number') {
                    newValues[mutation.variableKey] = currentValue + mutation.value;
                  }
                  break;
                case 'subtract':
                  if (typeof currentValue === 'number' && typeof mutation.value === 'number') {
                    newValues[mutation.variableKey] = currentValue - mutation.value;
                  }
                  break;
                case 'toggle':
                  if (typeof currentValue === 'boolean') {
                    newValues[mutation.variableKey] = !currentValue;
                  }
                  break;
              }
            }
            return { variableValues: newValues };
          }),

        resetPlayerState: () =>
          set({
            currentNodeId: null,
            variableValues: {},
            pathHistory: [],
            isPlaying: false,
          }),

        // =====================================================================
        // Validation
        // =====================================================================

        setValidationIssues: (issues) => set({ validationIssues: issues }),

        // =====================================================================
        // State Helpers
        // =====================================================================

        markDirty: () => set({ isDirty: true }),
        markClean: () => set({ isDirty: false }),
      }),
      {
        name: 'inspire-scenario-store',
        partialize: (state) => ({
          scenario: state.scenario,
        }),
      },
    ),
    {
      // Zundo config - limit history to 50 states
      limit: 50,
      partialize: (state) => ({
        scenario: state.scenario,
        selectedNodeId: state.selectedNodeId,
        selectedEdgeId: state.selectedEdgeId,
      }),
    },
  ),
);

// =============================================================================
// Selectors
// =============================================================================

export const selectScenario = (state: ScenarioStore) => state.scenario;
export const selectNodes = (state: ScenarioStore) => state.scenario.nodes;
export const selectEdges = (state: ScenarioStore) => state.scenario.edges;
export const selectVariables = (state: ScenarioStore) => state.scenario.variables;
export const selectSelectedNode = (state: ScenarioStore) =>
  state.scenario.nodes.find((n) => n.id === state.selectedNodeId);
export const selectSelectedEdge = (state: ScenarioStore) =>
  state.scenario.edges.find((e) => e.id === state.selectedEdgeId);
export const selectIsPlaying = (state: ScenarioStore) => state.isPlaying;
export const selectCurrentNode = (state: ScenarioStore) =>
  state.scenario.nodes.find((n) => n.id === state.currentNodeId);
export const selectVariableValues = (state: ScenarioStore) => state.variableValues;
