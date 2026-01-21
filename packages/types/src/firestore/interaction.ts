/**
 * Firestore Interaction Schema Definitions
 *
 * Interactions are extracted from xAPI statements for real-time
 * processing in Firestore. The full statement is stored in BigQuery.
 *
 * @module @inspire/types/firestore/interaction
 */

import { z } from 'zod';

// ============================================================================
// COGNITIVE LOAD
// ============================================================================

export const CognitiveLoadSchema = z.object({
  /** Intrinsic load (content complexity) 0-10 */
  intrinsic: z.number().min(0).max(10),
  /** Extraneous load (design friction) 0-10 */
  extraneous: z.number().min(0).max(10),
  /** Germane load (learning effort) 0-10 */
  germane: z.number().min(0).max(10),
  /** Total cognitive load 0-10 */
  total: z.number().min(0).max(10),
});

// ============================================================================
// INTERACTION
// ============================================================================

export const InteractionSchema = z.object({
  /** Interaction UUID */
  id: z.string().uuid(),
  /** Tenant identifier */
  tenantId: z.string(),
  /** Learner identifier */
  learnerId: z.string(),

  // Activity Information
  /** Activity IRI */
  activityId: z.string(),
  /** Activity type IRI */
  activityType: z.string().optional(),
  /** Content block ID (INSPIRE Studio) */
  blockId: z.string().optional(),
  /** Content block type */
  blockType: z.string().optional(),

  // Result Data
  /** Verb IRI */
  verb: z.string(),
  /** Whether the response was correct */
  success: z.boolean().optional(),
  /** Whether the activity was completed */
  completion: z.boolean().optional(),
  /** Scaled score (-1 to 1) */
  scoreScaled: z.number().min(-1).max(1).optional(),
  /** Learner's response text */
  response: z.string().optional(),

  // INSPIRE Cognitive Extensions
  /** Response latency in milliseconds */
  latencyMs: z.number().int().min(0).optional(),
  /** Cognitive load assessment */
  cognitiveLoad: CognitiveLoadSchema.optional(),
  /** Content modality (text, video, audio, etc.) */
  modalityState: z.string().optional(),
  /** Associated skill ID for BKT tracking */
  skillId: z.string().optional(),
  /** Hesitation count */
  hesitationCount: z.number().int().min(0).optional(),
  /** Focus loss count (tab switches) */
  focusLossCount: z.number().int().min(0).optional(),
  /** Revision count before final answer */
  revisionCount: z.number().int().min(0).optional(),

  // Context
  /** Parent course ID */
  courseId: z.string().optional(),
  /** Parent lesson ID */
  lessonId: z.string().optional(),
  /** Learning session ID */
  sessionId: z.string(),

  // Metadata
  /** Interaction timestamp */
  timestamp: z.union([z.string().datetime(), z.date()]),
  /** Reference to full xAPI statement ID */
  xapiStatementId: z.string().uuid(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CognitiveLoad = z.infer<typeof CognitiveLoadSchema>;
export type Interaction = z.infer<typeof InteractionSchema>;
