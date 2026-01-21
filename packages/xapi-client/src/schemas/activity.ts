/**
 * xAPI 1.0.3 Activity and Object Schemas
 *
 * The Object of a Statement is the "what" being acted upon.
 *
 * @module @inspire/xapi-client/schemas/activity
 */

import { z } from 'zod';
import { ActorSchema } from './actor';
import { ExtensionsSchema, LanguageMapSchema } from './primitives';

// ============================================================================
// INTERACTION TYPES
// ============================================================================

export const InteractionTypeSchema = z.enum([
  'true-false',
  'choice',
  'fill-in',
  'long-fill-in',
  'matching',
  'performance',
  'sequencing',
  'likert',
  'numeric',
  'other',
]);
export type InteractionType = z.infer<typeof InteractionTypeSchema>;

// ============================================================================
// INTERACTION COMPONENT
// ============================================================================

export const InteractionComponentSchema = z.object({
  id: z.string(),
  description: LanguageMapSchema.optional(),
});
export type InteractionComponent = z.infer<typeof InteractionComponentSchema>;

// ============================================================================
// ACTIVITY DEFINITION
// ============================================================================

export const ActivityDefinitionSchema = z.object({
  /** Activity type IRI */
  type: z.string().url().optional(),
  /** Human-readable names per language */
  name: LanguageMapSchema.optional(),
  /** Human-readable descriptions per language */
  description: LanguageMapSchema.optional(),
  /** URL with more info about the activity */
  moreInfo: z.string().url().optional(),
  /** Interaction type for questions */
  interactionType: InteractionTypeSchema.optional(),
  /** Pattern for correct responses */
  correctResponsesPattern: z.array(z.string()).optional(),
  /** Choices for choice/likert interactions */
  choices: z.array(InteractionComponentSchema).optional(),
  /** Scale items for likert interactions */
  scale: z.array(InteractionComponentSchema).optional(),
  /** Source items for matching interactions */
  source: z.array(InteractionComponentSchema).optional(),
  /** Target items for matching interactions */
  target: z.array(InteractionComponentSchema).optional(),
  /** Steps for performance interactions */
  steps: z.array(InteractionComponentSchema).optional(),
  /** Additional properties */
  extensions: ExtensionsSchema.optional(),
});
export type ActivityDefinition = z.infer<typeof ActivityDefinitionSchema>;

// ============================================================================
// ACTIVITY
// ============================================================================

export const ActivitySchema = z.object({
  objectType: z.literal('Activity').default('Activity'),
  /** Activity IRI - unique identifier */
  id: z.string().url(),
  /** Activity definition */
  definition: ActivityDefinitionSchema.optional(),
});
export type Activity = z.infer<typeof ActivitySchema>;

// ============================================================================
// STATEMENT REFERENCE
// ============================================================================

export const StatementRefSchema = z.object({
  objectType: z.literal('StatementRef'),
  /** UUID of the referenced statement */
  id: z.string().uuid(),
});
export type StatementRef = z.infer<typeof StatementRefSchema>;

// ============================================================================
// STATEMENT OBJECT
// ============================================================================

/**
 * Statement Object - can be Activity, Agent, Group, or StatementRef.
 * SubStatement is handled separately.
 */
export const StatementObjectSchema = z.union([ActivitySchema, ActorSchema, StatementRefSchema]);
export type StatementObject = z.infer<typeof StatementObjectSchema>;

// ============================================================================
// ACTIVITY TYPES
// ============================================================================

export const ACTIVITY_TYPES = {
  // ADL Activity Types
  assessment: 'http://adlnet.gov/expapi/activities/assessment',
  attempt: 'http://adlnet.gov/expapi/activities/attempt',
  course: 'http://adlnet.gov/expapi/activities/course',
  file: 'http://adlnet.gov/expapi/activities/file',
  interaction: 'http://adlnet.gov/expapi/activities/interaction',
  lesson: 'http://adlnet.gov/expapi/activities/lesson',
  link: 'http://adlnet.gov/expapi/activities/link',
  media: 'http://adlnet.gov/expapi/activities/media',
  meeting: 'http://adlnet.gov/expapi/activities/meeting',
  module: 'http://adlnet.gov/expapi/activities/module',
  objective: 'http://adlnet.gov/expapi/activities/objective',
  performance: 'http://adlnet.gov/expapi/activities/performance',
  profile: 'http://adlnet.gov/expapi/activities/profile',
  question: 'http://adlnet.gov/expapi/activities/question',
  simulation: 'http://adlnet.gov/expapi/activities/simulation',

  // cmi5 Activity Types
  block: 'https://w3id.org/xapi/cmi5/activitytype/block',

  // Video Profile Activity Types
  video: 'https://w3id.org/xapi/video/activity-type/video',
  audio: 'https://w3id.org/xapi/video/activity-type/audio',

  // INSPIRE Custom Activity Types
  contentBlock: 'https://lxd360.com/xapi/activities/content-block',
  flashcard: 'https://lxd360.com/xapi/activities/flashcard',
  probe: 'https://lxd360.com/xapi/activities/probe',
  scenario: 'https://lxd360.com/xapi/activities/scenario',
  skill: 'https://lxd360.com/xapi/activities/skill',
  reflection: 'https://lxd360.com/xapi/activities/reflection',
  quiz: 'https://lxd360.com/xapi/activities/quiz',
  hotspot: 'https://lxd360.com/xapi/activities/hotspot',
  dragAndDrop: 'https://lxd360.com/xapi/activities/drag-and-drop',
  text: 'https://lxd360.com/xapi/activities/text',
  infographic: 'https://lxd360.com/xapi/activities/infographic',
} as const;

export type ActivityTypeKey = keyof typeof ACTIVITY_TYPES;

/**
 * Get activity type IRI by key.
 */
export function getActivityType(key: ActivityTypeKey): string {
  return ACTIVITY_TYPES[key];
}
