/**
 * INSPIRE Studio - Logic-Branching Scenario Editor
 *
 * Visual flowchart editor for creating decision-based learning experiences.
 * Supports dialogue nodes, action nodes, logic gates, and end states with
 * variable management and xAPI tracking.
 *
 * @module components/inspire-studio/branching
 */

// =============================================================================
// Types & Schemas
// =============================================================================

export type {
  ActionNodeData,
  Choice,
  ComparisonOperator,
  Condition,
  ConditionGroup,
  DialogueNodeData,
  EndStateNodeData,
  FlowBuilderProps,
  LogicGateNodeData,
  MutationOperation,
  OutcomeType,
  PathAnalysis,
  ScenarioEdge,
  ScenarioEdgeType,
  ScenarioManifest,
  ScenarioNode,
  ScenarioNodeType,
  ScenarioPlayerProps,
  StartNodeData,
  ValidationIssue,
  Variable,
  VariableManagerProps,
  VariableMutation,
  VariableType,
  VariableValue,
} from './types';

export {
  ActionNodeDataSchema,
  BRANCHING_EXTENSIONS,
  BRANCHING_VERBS,
  ChoiceSchema,
  ComparisonOperatorSchema,
  ConditionGroupSchema,
  ConditionSchema,
  createActionNode,
  createChoice,
  createDefaultScenario,
  createDialogueNode,
  createEndStateNode,
  createLogicGateNode,
  createVariable,
  DialogueNodeDataSchema,
  EndStateNodeDataSchema,
  LogicGateNodeDataSchema,
  MutationOperationSchema,
  OutcomeTypeSchema,
  ScenarioEdgeSchema,
  ScenarioEdgeTypeSchema,
  ScenarioManifestSchema,
  ScenarioNodeSchema,
  ScenarioNodeTypeSchema,
  StartNodeDataSchema,
  VariableMutationSchema,
  VariableSchema,
  VariableTypeSchema,
  VariableValueSchema,
} from './types';

// =============================================================================
// Flow Builder Components
// =============================================================================

export { default as FlowBuilderComponent, FlowBuilder } from './flow-builder';
export { NodeToolbox } from './flow-builder/node-toolbox';

// =============================================================================
// Node Components
// =============================================================================

export { ActionNode } from './nodes/action-node';
export { BaseScenarioNode, HandleDot, NodeTypeBadge } from './nodes/base-scenario-node';
export { DialogueNode } from './nodes/dialogue-node';
export { EndStateNode } from './nodes/end-state-node';
export { LogicGateNode } from './nodes/logic-gate-node';
export { StartNode } from './nodes/start-node';

// =============================================================================
// Variable Manager Components
// =============================================================================

export { VariableManager } from './variable-manager';
export { ConditionBuilder } from './variable-manager/condition-builder';
export { VariableDebugger } from './variable-manager/variable-debugger';
export { VariableEditor } from './variable-manager/variable-editor';

// =============================================================================
// Dead End Validator Components
// =============================================================================

export {
  analyzeScenarioPaths,
  DeadEndValidator,
  TrapDetector,
} from './dead-end-validator';
export { getScenarioOutcomes, isDeadEnd } from './dead-end-validator/path-analyzer';

// =============================================================================
// Scenario Player Components
// =============================================================================

export { ScenarioPlayer } from './scenario-player';
export { ChoicePresenter } from './scenario-player/choice-presenter';
export { OutcomeTracker } from './scenario-player/outcome-tracker';
export { StateEngine } from './scenario-player/state-engine';

// =============================================================================
// Hooks
// =============================================================================

export { useBranchingXAPI } from './hooks/useBranchingXAPI';
