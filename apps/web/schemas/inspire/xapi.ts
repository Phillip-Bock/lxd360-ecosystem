/**
 * INSPIRE xAPI Schema Extensions
 *
 * Custom xAPI schemas for INSPIRE Studio that extend the base xAPI 1.0.3 spec.
 * These are used for authoring-time statement configuration.
 *
 * @module schemas/inspire/xapi
 */

import { z } from 'zod';

// ============================================================================
// XAPI VERB SCHEMA
// ============================================================================

export const XAPIVerbSchema = z.object({
  /** Verb IRI */
  id: z.string().url(),
  /** Display text by language */
  display: z.record(z.string(), z.string()),
});
export type XAPIVerb = z.infer<typeof XAPIVerbSchema>;

// ============================================================================
// XAPI ACTOR SCHEMA
// ============================================================================

export const XAPIActorSchema = z.object({
  /** Object type */
  objectType: z.literal('Agent').default('Agent'),
  /** Actor name */
  name: z.string().optional(),
  /** Mailto IRI for email */
  mbox: z.string().startsWith('mailto:').optional(),
  /** SHA1 hash of mailto */
  mbox_sha1sum: z.string().optional(),
  /** OpenID */
  openid: z.string().url().optional(),
  /** Account */
  account: z
    .object({
      homePage: z.string().url(),
      name: z.string(),
    })
    .optional(),
});
export type XAPIActor = z.infer<typeof XAPIActorSchema>;

// ============================================================================
// XAPI OBJECT (ACTIVITY) SCHEMA
// ============================================================================

export const XAPIActivityDefinitionSchema = z.object({
  /** Activity type IRI */
  type: z.string().url().optional(),
  /** Name by language */
  name: z.record(z.string(), z.string()).optional(),
  /** Description by language */
  description: z.record(z.string(), z.string()).optional(),
  /** More info URL */
  moreInfo: z.string().url().optional(),
  /** Interaction type (for assessment) */
  interactionType: z
    .enum([
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
    ])
    .optional(),
  /** Correct response pattern */
  correctResponsesPattern: z.array(z.string()).optional(),
  /** Choices for interaction */
  choices: z
    .array(
      z.object({
        id: z.string(),
        description: z.record(z.string(), z.string()),
      }),
    )
    .optional(),
  /** Extensions */
  extensions: z.record(z.string(), z.unknown()).optional(),
});
export type XAPIActivityDefinition = z.infer<typeof XAPIActivityDefinitionSchema>;

export const XAPIObjectSchema = z.object({
  /** Object type */
  objectType: z.literal('Activity').default('Activity'),
  /** Activity IRI */
  id: z.string().url(),
  /** Activity definition */
  definition: XAPIActivityDefinitionSchema.optional(),
});
export type XAPIObject = z.infer<typeof XAPIObjectSchema>;

// ============================================================================
// XAPI RESULT SCHEMA
// ============================================================================

export const XAPIScoreSchema = z.object({
  /** Scaled score (-1 to 1) */
  scaled: z.number().min(-1).max(1).optional(),
  /** Raw score */
  raw: z.number().optional(),
  /** Minimum possible */
  min: z.number().optional(),
  /** Maximum possible */
  max: z.number().optional(),
});
export type XAPIScore = z.infer<typeof XAPIScoreSchema>;

export const XAPIResultSchema = z.object({
  /** Score */
  score: XAPIScoreSchema.optional(),
  /** Success */
  success: z.boolean().optional(),
  /** Completion */
  completion: z.boolean().optional(),
  /** Response */
  response: z.string().optional(),
  /** Duration (ISO 8601 duration) */
  duration: z.string().optional(),
  /** Extensions */
  extensions: z.record(z.string(), z.unknown()).optional(),
});
export type XAPIResult = z.infer<typeof XAPIResultSchema>;

// ============================================================================
// XAPI CONTEXT SCHEMA
// ============================================================================

export const XAPIContextActivitiesSchema = z.object({
  /** Parent activities */
  parent: z.array(XAPIObjectSchema).optional(),
  /** Grouping activities */
  grouping: z.array(XAPIObjectSchema).optional(),
  /** Category activities */
  category: z.array(XAPIObjectSchema).optional(),
  /** Other activities */
  other: z.array(XAPIObjectSchema).optional(),
});
export type XAPIContextActivities = z.infer<typeof XAPIContextActivitiesSchema>;

export const XAPIContextSchema = z.object({
  /** Registration UUID */
  registration: z.string().uuid().optional(),
  /** Instructor */
  instructor: XAPIActorSchema.optional(),
  /** Team */
  team: z
    .object({
      objectType: z.literal('Group'),
      name: z.string().optional(),
      member: z.array(XAPIActorSchema).optional(),
    })
    .optional(),
  /** Context activities */
  contextActivities: XAPIContextActivitiesSchema.optional(),
  /** Revision */
  revision: z.string().optional(),
  /** Platform */
  platform: z.string().optional(),
  /** Language */
  language: z.string().optional(),
  /** Statement reference */
  statement: z
    .object({
      objectType: z.literal('StatementRef'),
      id: z.string().uuid(),
    })
    .optional(),
  /** Extensions */
  extensions: z.record(z.string(), z.unknown()).optional(),
});
export type XAPIContext = z.infer<typeof XAPIContextSchema>;

// ============================================================================
// INSPIRE STATEMENT TEMPLATE
// ============================================================================

/**
 * Template for pre-configuring xAPI statements in the authoring environment.
 * Used by blocks to define their tracking behavior.
 */
export const INSPIREStatementTemplateSchema = z.object({
  /** Template ID */
  id: z.string().uuid(),
  /** Template name */
  name: z.string().min(1),
  /** Description */
  description: z.string().optional(),
  /** Verb configuration */
  verb: XAPIVerbSchema,
  /** Object template */
  objectTemplate: z.object({
    /** Object type IRI */
    type: z.string().url().optional(),
    /** Name template (supports {{variables}}) */
    nameTemplate: z.string().optional(),
    /** Description template */
    descriptionTemplate: z.string().optional(),
    /** Interaction type */
    interactionType: z.string().optional(),
  }),
  /** Result template */
  resultTemplate: z
    .object({
      /** Include score */
      includeScore: z.boolean().default(false),
      /** Include success */
      includeSuccess: z.boolean().default(false),
      /** Include completion */
      includeCompletion: z.boolean().default(false),
      /** Include duration */
      includeDuration: z.boolean().default(false),
    })
    .optional(),
  /** Context template */
  contextTemplate: z
    .object({
      /** Include registration */
      includeRegistration: z.boolean().default(true),
      /** Include platform */
      includePlatform: z.boolean().default(true),
      /** Custom extensions to include */
      customExtensions: z.array(z.string()).default([]),
    })
    .optional(),
  /** INSPIRE extensions */
  inspireExtensions: z
    .object({
      /** Include latency tracking */
      trackLatency: z.boolean().default(false),
      /** Include cognitive load */
      trackCognitiveLoad: z.boolean().default(false),
      /** Include hesitation count */
      trackHesitation: z.boolean().default(false),
      /** Include functional state */
      trackFunctionalState: z.boolean().default(false),
      /** Include modality */
      trackModality: z.boolean().default(false),
      /** Include encoding phase */
      trackEncodingPhase: z.boolean().default(false),
    })
    .optional(),
});
export type INSPIREStatementTemplate = z.infer<typeof INSPIREStatementTemplateSchema>;

// ============================================================================
// FULL XAPI STATEMENT SCHEMA
// ============================================================================

export const XAPIStatementSchema = z.object({
  /** Statement UUID */
  id: z.string().uuid().optional(),
  /** Actor */
  actor: XAPIActorSchema,
  /** Verb */
  verb: XAPIVerbSchema,
  /** Object */
  object: XAPIObjectSchema,
  /** Result */
  result: XAPIResultSchema.optional(),
  /** Context */
  context: XAPIContextSchema.optional(),
  /** Timestamp */
  timestamp: z.string().datetime({ offset: true }).optional(),
  /** Stored timestamp (set by LRS) */
  stored: z.string().datetime({ offset: true }).optional(),
  /** Authority */
  authority: XAPIActorSchema.optional(),
  /** Version */
  version: z.string().default('1.0.3'),
});
export type XAPIStatement = z.infer<typeof XAPIStatementSchema>;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isXAPIStatement(value: unknown): value is XAPIStatement {
  return XAPIStatementSchema.safeParse(value).success;
}

export function isXAPIVerb(value: unknown): value is XAPIVerb {
  return XAPIVerbSchema.safeParse(value).success;
}

export function isINSPIREStatementTemplate(value: unknown): value is INSPIREStatementTemplate {
  return INSPIREStatementTemplateSchema.safeParse(value).success;
}
