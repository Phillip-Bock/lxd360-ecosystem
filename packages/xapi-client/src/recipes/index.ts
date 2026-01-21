/**
 * Statement Recipes Exports
 *
 * Pre-built statement patterns for common learning scenarios.
 *
 * @module @inspire/xapi-client/recipes
 */

export {
  type AssessmentAnswerInput,
  createAssessmentAnswerStatement,
  type MasteryLevel,
} from './assessment-recipe';

export {
  type ContentBlockInteractionInput,
  type ContentBlockVerb,
  createContentBlockStatement,
  type DepthLevel,
} from './content-block-recipe';

export {
  createSkillMasteryStatement,
  type SkillMasteryInput,
} from './mastery-recipe';

export {
  createModalitySwapStatement,
  type ModalitySwapInput,
} from './modality-recipe';

export {
  createProbeStatement,
  type IntelligentProbeInput,
} from './probe-recipe';
