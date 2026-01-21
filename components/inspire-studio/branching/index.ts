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

export { default as FlowBuilderComponent, FlowBuilder } from './FlowBuilder';
export { NodeToolbox } from './FlowBuilder/NodeToolbox';

// =============================================================================
// Node Components
// =============================================================================

export { ActionNode } from './nodes/ActionNode';
export { BaseScenarioNode, HandleDot, NodeTypeBadge } from './nodes/BaseScenarioNode';
export { DialogueNode } from './nodes/DialogueNode';
export { EndStateNode } from './nodes/EndStateNode';
export { LogicGateNode } from './nodes/LogicGateNode';
export { StartNode } from './nodes/StartNode';

// =============================================================================
// Variable Manager Components
// =============================================================================

export { VariableManager } from './VariableManager';
export { ConditionBuilder } from './VariableManager/ConditionBuilder';
export { VariableDebugger } from './VariableManager/VariableDebugger';
export { VariableEditor } from './VariableManager/VariableEditor';

// =============================================================================
// Dead End Validator Components
// =============================================================================

export {
  analyzeScenarioPaths,
  DeadEndValidator,
  TrapDetector,
} from './DeadEndValidator';
export { getScenarioOutcomes, isDeadEnd } from './DeadEndValidator/PathAnalyzer';

// =============================================================================
// Scenario Player Components
// =============================================================================

export { ScenarioPlayer } from './ScenarioPlayer';
export { ChoicePresenter } from './ScenarioPlayer/ChoicePresenter';
export { OutcomeTracker } from './ScenarioPlayer/OutcomeTracker';
export { StateEngine } from './ScenarioPlayer/StateEngine';

// =============================================================================
// Hooks
// =============================================================================

export { useBranchingXAPI } from './hooks/useBranchingXAPI';
