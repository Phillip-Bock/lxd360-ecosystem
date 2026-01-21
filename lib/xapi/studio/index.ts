// =============================================================================
// INSPIRE Studio xAPI Module
// =============================================================================
// Exports all studio-specific xAPI functionality for tracking content
// authoring activities in INSPIRE Studio.
// =============================================================================

// React Hooks
export type {
  UseBlockXAPIOptions,
  UseBlockXAPIReturn,
  UseCanvasXAPIOptions,
  UseCanvasXAPIReturn,
  UseStudioXAPIOptions,
  UseStudioXAPIReturn,
} from './hooks';
export {
  useBlockXAPI,
  useCanvasXAPI,
  useStudioXAPI,
} from './hooks';

// Statement Builders
export {
  buildAIGenerationStatement,
  buildAuditActivity,
  buildAuditStatement,
  buildBlockActivity,
  buildBlockCreatedStatement,
  buildBlockDeletedStatement,
  buildBlockEditedStatement,
  buildBlockMovedStatement,
  buildBlockResizedStatement,
  buildCanvasActivity,
  buildExportActivity,
  buildExportStatement,
  buildMissionActivity,
  buildPhaseActivity,
  buildPhaseCompletedStatement,
  buildStepActivity,
  buildStudioStatement,
} from './statement-builder';
// Types & Constants
export type {
  A11yCompliance,
  AISuggestionOutcome,
  AuthoringVerb,
  BlockActionOptions,
  ExportFormat,
  InspirePhase,
  StudioActivityType,
  StudioExtensionIRI,
  StudioExtensionKey,
  StudioStatementOptions,
} from './types';
export {
  A11yComplianceSchema,
  AISuggestionOutcomeSchema,
  AuthoringVerbSchema,
  buildStudioContextExtensions,
  ExportFormatSchema,
  getStudioVerb,
  InspirePhaseSchema,
  STUDIO_ACTIVITY_TYPES,
  STUDIO_EXTENSIONS,
  STUDIO_VERBS,
} from './types';
