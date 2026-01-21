'use client';

import { z } from 'zod';

// =============================================================================
// Branching Scenario Types
// =============================================================================
// Types for the Logic-Branching Scenario Editor - visual flowchart tool for
// decision-based learning experiences.
// =============================================================================

// =============================================================================
// Variable Types
// =============================================================================

export const VariableTypeSchema = z.enum(['boolean', 'number', 'string']);
export type VariableType = z.infer<typeof VariableTypeSchema>;

export const VariableValueSchema = z.union([z.boolean(), z.number(), z.string()]);
export type VariableValue = z.infer<typeof VariableValueSchema>;

export const VariableSchema = z.object({
  key: z
    .string()
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Variable key must start with letter or underscore'),
  type: VariableTypeSchema,
  label: z.string().min(1),
  initialValue: VariableValueSchema,
  currentValue: VariableValueSchema.optional(),
  description: z.string().optional(),
});
export type Variable = z.infer<typeof VariableSchema>;

// =============================================================================
// Condition Types
// =============================================================================

export const ComparisonOperatorSchema = z.enum([
  'equals',
  'not_equals',
  'greater_than',
  'less_than',
  'greater_equal',
  'less_equal',
  'contains',
  'not_contains',
]);
export type ComparisonOperator = z.infer<typeof ComparisonOperatorSchema>;

export const ConditionSchema = z.object({
  variableKey: z.string(),
  operator: ComparisonOperatorSchema,
  targetValue: VariableValueSchema,
});
export type Condition = z.infer<typeof ConditionSchema>;

export const ConditionGroupSchema = z.object({
  logic: z.enum(['and', 'or']),
  conditions: z.array(ConditionSchema),
});
export type ConditionGroup = z.infer<typeof ConditionGroupSchema>;

// =============================================================================
// Variable Mutation Types
// =============================================================================

export const MutationOperationSchema = z.enum([
  'set',
  'add',
  'subtract',
  'multiply',
  'toggle',
  'append',
]);
export type MutationOperation = z.infer<typeof MutationOperationSchema>;

export const VariableMutationSchema = z.object({
  variableKey: z.string(),
  operation: MutationOperationSchema,
  value: VariableValueSchema,
});
export type VariableMutation = z.infer<typeof VariableMutationSchema>;

// =============================================================================
// Choice Types
// =============================================================================

export const ChoiceSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1),
  targetNodeId: z.string().nullable(),
  variableMutations: z.array(VariableMutationSchema).default([]),
  condition: ConditionSchema.optional(), // Show only if condition met
  feedbackText: z.string().optional(),
});
export type Choice = z.infer<typeof ChoiceSchema>;

// =============================================================================
// Node Types
// =============================================================================

export const ScenarioNodeTypeSchema = z.enum([
  'dialogue',
  'action',
  'logic_gate',
  'end_state',
  'start',
]);
export type ScenarioNodeType = z.infer<typeof ScenarioNodeTypeSchema>;

export const OutcomeTypeSchema = z.enum(['success', 'failure', 'neutral', 'partial']);
export type OutcomeType = z.infer<typeof OutcomeTypeSchema>;

export const DialogueNodeDataSchema = z.object({
  characterId: z.string().optional(),
  characterName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  backgroundId: z.string().optional(),
  backgroundUrl: z.string().url().optional(),
  dialogueText: z.string().default(''),
  audioSrc: z.string().url().optional(),
  choices: z.array(ChoiceSchema).default([]),
});
export type DialogueNodeData = z.infer<typeof DialogueNodeDataSchema>;

export const ActionNodeDataSchema = z.object({
  label: z.string().default('Action'),
  variableMutations: z.array(VariableMutationSchema).default([]),
  targetNodeId: z.string().nullable(),
  delay: z.number().min(0).default(0), // ms before auto-proceeding
});
export type ActionNodeData = z.infer<typeof ActionNodeDataSchema>;

export const LogicGateNodeDataSchema = z.object({
  label: z.string().default('Condition'),
  condition: ConditionSchema.optional(),
  conditionGroup: ConditionGroupSchema.optional(),
  truePathNodeId: z.string().nullable(),
  falsePathNodeId: z.string().nullable(),
});
export type LogicGateNodeData = z.infer<typeof LogicGateNodeDataSchema>;

export const EndStateNodeDataSchema = z.object({
  label: z.string().default('End'),
  outcome: OutcomeTypeSchema.default('neutral'),
  outcomeMessage: z.string().optional(),
  xapiScore: z.number().min(0).max(100).optional(),
  showSummary: z.boolean().default(true),
});
export type EndStateNodeData = z.infer<typeof EndStateNodeDataSchema>;

export const StartNodeDataSchema = z.object({
  label: z.string().default('Start'),
  introText: z.string().optional(),
});
export type StartNodeData = z.infer<typeof StartNodeDataSchema>;

export const ScenarioNodeDataSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('dialogue'), ...DialogueNodeDataSchema.shape }),
  z.object({ type: z.literal('action'), ...ActionNodeDataSchema.shape }),
  z.object({ type: z.literal('logic_gate'), ...LogicGateNodeDataSchema.shape }),
  z.object({ type: z.literal('end_state'), ...EndStateNodeDataSchema.shape }),
  z.object({ type: z.literal('start'), ...StartNodeDataSchema.shape }),
]);

export const ScenarioNodeSchema = z.object({
  id: z.string().uuid(),
  type: ScenarioNodeTypeSchema,
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.any(), // ReactFlow requires any for data
});
export type ScenarioNode = z.infer<typeof ScenarioNodeSchema>;

// =============================================================================
// Edge Types
// =============================================================================

export const ScenarioEdgeTypeSchema = z.enum([
  'default',
  'choice',
  'true_path',
  'false_path',
  'auto',
]);
export type ScenarioEdgeType = z.infer<typeof ScenarioEdgeTypeSchema>;

export const ScenarioEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  type: ScenarioEdgeTypeSchema.optional(),
  label: z.string().optional(),
  data: z
    .object({
      choiceId: z.string().optional(),
      isConditional: z.boolean().optional(),
    })
    .optional(),
});
export type ScenarioEdge = z.infer<typeof ScenarioEdgeSchema>;

// =============================================================================
// Scenario Manifest
// =============================================================================

export const ScenarioManifestSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  variables: z.array(VariableSchema).default([]),
  nodes: z.array(ScenarioNodeSchema).default([]),
  edges: z.array(ScenarioEdgeSchema).default([]),
  startingNodeId: z.string().nullable(),
  metadata: z
    .object({
      author: z.string().optional(),
      version: z.string().default('1.0.0'),
      createdAt: z.string().optional(),
      updatedAt: z.string().optional(),
      tags: z.array(z.string()).default([]),
    })
    .optional(),
});
export type ScenarioManifest = z.infer<typeof ScenarioManifestSchema>;

// =============================================================================
// xAPI Verbs for Branching
// =============================================================================

export const BRANCHING_VERBS = {
  initialized: 'http://adlnet.gov/expapi/verbs/initialized',
  chose: 'https://inspire.lxd360.com/xapi/verbs/chose',
  evaluated: 'https://inspire.lxd360.com/xapi/verbs/evaluated',
  completed: 'http://adlnet.gov/expapi/verbs/completed',
  experienced: 'http://adlnet.gov/expapi/verbs/experienced',
  progressed: 'http://adlnet.gov/expapi/verbs/progressed',
} as const;

export const BRANCHING_EXTENSIONS = {
  nodeId: 'https://inspire.lxd360.com/xapi/extensions/nodeId',
  choiceId: 'https://inspire.lxd360.com/xapi/extensions/choiceId',
  choiceLabel: 'https://inspire.lxd360.com/xapi/extensions/choiceLabel',
  variablesMutated: 'https://inspire.lxd360.com/xapi/extensions/variablesMutated',
  condition: 'https://inspire.lxd360.com/xapi/extensions/condition',
  conditionResult: 'https://inspire.lxd360.com/xapi/extensions/conditionResult',
  pathTaken: 'https://inspire.lxd360.com/xapi/extensions/pathTaken',
  finalVariableState: 'https://inspire.lxd360.com/xapi/extensions/finalVariableState',
  outcome: 'https://inspire.lxd360.com/xapi/extensions/outcome',
} as const;

// =============================================================================
// Validation Results
// =============================================================================

export interface ValidationIssue {
  nodeId: string;
  type: 'error' | 'warning';
  message: string;
  suggestion?: string;
}

export interface PathAnalysis {
  paths: string[][]; // Array of node ID sequences
  deadEnds: string[]; // Node IDs with no outgoing edges
  loops: string[][]; // Detected loops
  unreachable: string[]; // Nodes not reachable from start
}

// =============================================================================
// Component Props
// =============================================================================

export interface FlowBuilderProps {
  scenario: ScenarioManifest;
  onChange: (scenario: ScenarioManifest) => void;
  onSave?: () => void;
  readOnly?: boolean;
  className?: string;
}

export interface ScenarioPlayerProps {
  scenario: ScenarioManifest;
  onComplete?: (outcome: OutcomeType, duration: number) => void;
  onChoice?: (nodeId: string, choiceId: string) => void;
  debug?: boolean;
  className?: string;
}

export interface VariableManagerProps {
  variables: Variable[];
  onChange: (variables: Variable[]) => void;
  liveValues?: Record<string, VariableValue>;
  readOnly?: boolean;
  className?: string;
}

// =============================================================================
// Factory Functions
// =============================================================================

export function createDefaultScenario(): ScenarioManifest {
  const startId = crypto.randomUUID();
  return {
    id: crypto.randomUUID(),
    title: 'New Scenario',
    variables: [],
    nodes: [
      {
        id: startId,
        type: 'start',
        position: { x: 250, y: 50 },
        data: { type: 'start', label: 'Start' },
      },
    ],
    edges: [],
    startingNodeId: startId,
    metadata: {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      tags: [],
    },
  };
}

export function createDialogueNode(position: { x: number; y: number }): ScenarioNode {
  return {
    id: crypto.randomUUID(),
    type: 'dialogue',
    position,
    data: {
      type: 'dialogue',
      dialogueText: '',
      choices: [],
    },
  };
}

export function createActionNode(position: { x: number; y: number }): ScenarioNode {
  return {
    id: crypto.randomUUID(),
    type: 'action',
    position,
    data: {
      type: 'action',
      label: 'Action',
      variableMutations: [],
      targetNodeId: null,
      delay: 0,
    },
  };
}

export function createLogicGateNode(position: { x: number; y: number }): ScenarioNode {
  return {
    id: crypto.randomUUID(),
    type: 'logic_gate',
    position,
    data: {
      type: 'logic_gate',
      label: 'Condition',
      truePathNodeId: null,
      falsePathNodeId: null,
    },
  };
}

export function createEndStateNode(position: { x: number; y: number }): ScenarioNode {
  return {
    id: crypto.randomUUID(),
    type: 'end_state',
    position,
    data: {
      type: 'end_state',
      label: 'End',
      outcome: 'neutral',
      showSummary: true,
    },
  };
}

export function createChoice(): Choice {
  return {
    id: crypto.randomUUID(),
    label: 'New Choice',
    targetNodeId: null,
    variableMutations: [],
  };
}

export function createVariable(type: VariableType = 'number'): Variable {
  const defaults: Record<VariableType, VariableValue> = {
    boolean: false,
    number: 0,
    string: '',
  };
  return {
    key: `var_${Date.now()}`,
    type,
    label: 'New Variable',
    initialValue: defaults[type],
  };
}
