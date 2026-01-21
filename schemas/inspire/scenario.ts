/**
 * INSPIRE Scenario Schemas
 *
 * Zod schemas for the Logic-Branching Scenario Editor.
 * Provides validation for variables, conditions, nodes, and scenarios.
 *
 * @module schemas/inspire/scenario
 */

import { z } from 'zod';

// =============================================================================
// VARIABLE SCHEMAS
// =============================================================================

/**
 * Variable type options
 */
export const VariableTypeSchema = z.enum(['boolean', 'number', 'string']);
export type VariableType = z.infer<typeof VariableTypeSchema>;

/**
 * Variable value (union of all supported types)
 */
export const VariableValueSchema = z.union([z.boolean(), z.number(), z.string()]);
export type VariableValue = z.infer<typeof VariableValueSchema>;

/**
 * Variable definition
 */
export const VariableSchema = z.object({
  key: z
    .string()
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Variable key must start with letter or underscore'),
  type: VariableTypeSchema,
  label: z.string().min(1, 'Label is required'),
  initialValue: VariableValueSchema,
  currentValue: VariableValueSchema.optional(),
  description: z.string().optional(),
});
export type Variable = z.infer<typeof VariableSchema>;

// =============================================================================
// CONDITION SCHEMAS
// =============================================================================

/**
 * Comparison operators for conditions
 */
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

/**
 * Single condition
 */
export const ConditionSchema = z.object({
  variableKey: z.string().min(1, 'Variable key is required'),
  operator: ComparisonOperatorSchema,
  targetValue: VariableValueSchema,
});
export type Condition = z.infer<typeof ConditionSchema>;

/**
 * Group of conditions with logical operator
 */
export const ConditionGroupSchema = z.object({
  logic: z.enum(['and', 'or']),
  conditions: z.array(ConditionSchema).min(1, 'At least one condition is required'),
});
export type ConditionGroup = z.infer<typeof ConditionGroupSchema>;

// =============================================================================
// VARIABLE MUTATION SCHEMAS
// =============================================================================

/**
 * Mutation operation types
 */
export const MutationOperationSchema = z.enum([
  'set',
  'add',
  'subtract',
  'multiply',
  'toggle',
  'append',
]);
export type MutationOperation = z.infer<typeof MutationOperationSchema>;

/**
 * Variable mutation definition
 */
export const VariableMutationSchema = z.object({
  variableKey: z.string().min(1, 'Variable key is required'),
  operation: MutationOperationSchema,
  value: VariableValueSchema,
});
export type VariableMutation = z.infer<typeof VariableMutationSchema>;

// =============================================================================
// CHOICE SCHEMAS
// =============================================================================

/**
 * Choice definition for dialogue nodes
 */
export const ChoiceSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1, 'Choice label is required'),
  targetNodeId: z.string().nullable(),
  variableMutations: z.array(VariableMutationSchema).default([]),
  condition: ConditionSchema.optional(),
  feedbackText: z.string().optional(),
});
export type Choice = z.infer<typeof ChoiceSchema>;

// =============================================================================
// NODE SCHEMAS
// =============================================================================

/**
 * Scenario node types
 */
export const ScenarioNodeTypeSchema = z.enum([
  'dialogue',
  'action',
  'logic_gate',
  'end_state',
  'start',
]);
export type ScenarioNodeType = z.infer<typeof ScenarioNodeTypeSchema>;

/**
 * Outcome types for end state nodes
 */
export const OutcomeTypeSchema = z.enum(['success', 'failure', 'neutral', 'partial']);
export type OutcomeType = z.infer<typeof OutcomeTypeSchema>;

/**
 * Dialogue node data
 */
export const DialogueNodeDataSchema = z.object({
  type: z.literal('dialogue'),
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

/**
 * Action node data
 */
export const ActionNodeDataSchema = z.object({
  type: z.literal('action'),
  label: z.string().default('Action'),
  variableMutations: z.array(VariableMutationSchema).default([]),
  targetNodeId: z.string().nullable(),
  delay: z.number().min(0).default(0),
});
export type ActionNodeData = z.infer<typeof ActionNodeDataSchema>;

/**
 * Logic gate node data
 */
export const LogicGateNodeDataSchema = z.object({
  type: z.literal('logic_gate'),
  label: z.string().default('Condition'),
  condition: ConditionSchema.optional(),
  conditionGroup: ConditionGroupSchema.optional(),
  truePathNodeId: z.string().nullable(),
  falsePathNodeId: z.string().nullable(),
});
export type LogicGateNodeData = z.infer<typeof LogicGateNodeDataSchema>;

/**
 * End state node data
 */
export const EndStateNodeDataSchema = z.object({
  type: z.literal('end_state'),
  label: z.string().default('End'),
  outcome: OutcomeTypeSchema.default('neutral'),
  outcomeMessage: z.string().optional(),
  xapiScore: z.number().min(0).max(100).optional(),
  showSummary: z.boolean().default(true),
});
export type EndStateNodeData = z.infer<typeof EndStateNodeDataSchema>;

/**
 * Start node data
 */
export const StartNodeDataSchema = z.object({
  type: z.literal('start'),
  label: z.string().default('Start'),
  introText: z.string().optional(),
});
export type StartNodeData = z.infer<typeof StartNodeDataSchema>;

/**
 * Union of all node data types
 */
export const ScenarioNodeDataSchema = z.discriminatedUnion('type', [
  DialogueNodeDataSchema,
  ActionNodeDataSchema,
  LogicGateNodeDataSchema,
  EndStateNodeDataSchema,
  StartNodeDataSchema,
]);
export type ScenarioNodeData = z.infer<typeof ScenarioNodeDataSchema>;

/**
 * Position schema for nodes
 */
export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});
export type Position = z.infer<typeof PositionSchema>;

/**
 * Scenario node (compatible with ReactFlow)
 */
export const ScenarioNodeSchema = z.object({
  id: z.string().uuid(),
  type: ScenarioNodeTypeSchema,
  position: PositionSchema,
  data: z.record(z.unknown()), // ReactFlow requires flexibility here
});
export type ScenarioNode = z.infer<typeof ScenarioNodeSchema>;

// =============================================================================
// EDGE SCHEMAS
// =============================================================================

/**
 * Edge types
 */
export const ScenarioEdgeTypeSchema = z.enum([
  'default',
  'choice',
  'true_path',
  'false_path',
  'auto',
]);
export type ScenarioEdgeType = z.infer<typeof ScenarioEdgeTypeSchema>;

/**
 * Scenario edge (compatible with ReactFlow)
 */
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
// SCENARIO MANIFEST SCHEMA
// =============================================================================

/**
 * Scenario metadata
 */
export const ScenarioMetadataSchema = z.object({
  author: z.string().optional(),
  version: z.string().default('1.0.0'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  tags: z.array(z.string()).default([]),
});
export type ScenarioMetadata = z.infer<typeof ScenarioMetadataSchema>;

/**
 * Complete scenario manifest
 */
export const ScenarioManifestSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  variables: z.array(VariableSchema).default([]),
  nodes: z.array(ScenarioNodeSchema).default([]),
  edges: z.array(ScenarioEdgeSchema).default([]),
  startingNodeId: z.string().nullable(),
  metadata: ScenarioMetadataSchema.optional(),
});
export type ScenarioManifest = z.infer<typeof ScenarioManifestSchema>;

// =============================================================================
// VALIDATION TYPES
// =============================================================================

/**
 * Validation issue severity
 */
export const ValidationSeveritySchema = z.enum(['error', 'warning', 'info']);
export type ValidationSeverity = z.infer<typeof ValidationSeveritySchema>;

/**
 * Validation issue
 */
export const ValidationIssueSchema = z.object({
  nodeId: z.string(),
  type: ValidationSeveritySchema,
  message: z.string(),
  suggestion: z.string().optional(),
});
export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;

/**
 * Path analysis result
 */
export const PathAnalysisSchema = z.object({
  paths: z.array(z.array(z.string())),
  deadEnds: z.array(z.string()),
  loops: z.array(z.array(z.string())),
  unreachable: z.array(z.string()),
});
export type PathAnalysis = z.infer<typeof PathAnalysisSchema>;

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Check if value is a valid scenario manifest
 */
export function isScenarioManifest(value: unknown): value is ScenarioManifest {
  return ScenarioManifestSchema.safeParse(value).success;
}

/**
 * Check if value is a valid variable
 */
export function isVariable(value: unknown): value is Variable {
  return VariableSchema.safeParse(value).success;
}

/**
 * Check if value is a valid condition
 */
export function isCondition(value: unknown): value is Condition {
  return ConditionSchema.safeParse(value).success;
}

/**
 * Check if value is a valid choice
 */
export function isChoice(value: unknown): value is Choice {
  return ChoiceSchema.safeParse(value).success;
}

// =============================================================================
// XAPI CONSTANTS FOR BRANCHING
// =============================================================================

/**
 * xAPI verbs for branching scenarios
 */
export const BRANCHING_XAPI_VERBS = {
  initialized: {
    id: 'http://adlnet.gov/expapi/verbs/initialized',
    display: { 'en-US': 'initialized' },
  },
  chose: {
    id: 'https://inspire.lxd360.com/xapi/verbs/chose',
    display: { 'en-US': 'chose' },
  },
  evaluated: {
    id: 'https://inspire.lxd360.com/xapi/verbs/evaluated',
    display: { 'en-US': 'evaluated' },
  },
  completed: {
    id: 'http://adlnet.gov/expapi/verbs/completed',
    display: { 'en-US': 'completed' },
  },
  experienced: {
    id: 'http://adlnet.gov/expapi/verbs/experienced',
    display: { 'en-US': 'experienced' },
  },
  progressed: {
    id: 'http://adlnet.gov/expapi/verbs/progressed',
    display: { 'en-US': 'progressed' },
  },
} as const;

/**
 * xAPI extensions for branching scenarios
 */
export const BRANCHING_XAPI_EXTENSIONS = {
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
