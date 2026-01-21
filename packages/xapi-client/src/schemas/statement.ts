/**
 * xAPI 1.0.3 Statement Schema
 *
 * The Statement is the core data structure of xAPI.
 *
 * @module @inspire/xapi-client/schemas/statement
 */

import { z } from 'zod';
import { StatementObjectSchema } from './activity';
import { ActorSchema } from './actor';
import { AttachmentSchema } from './attachment';
import { ContextSchema } from './context';
import { ResultSchema } from './result';
import { VerbSchema } from './verb';

// ============================================================================
// STATEMENT
// ============================================================================

/**
 * xAPI Statement - the core data structure.
 *
 * A Statement describes an action performed by an Actor on an Object.
 */
export const StatementSchema = z.object({
  /** Statement UUID */
  id: z.string().uuid().optional(),
  /** Who performed the action */
  actor: ActorSchema,
  /** The action performed */
  verb: VerbSchema,
  /** What was acted upon */
  object: StatementObjectSchema,
  /** Outcome of the action */
  result: ResultSchema.optional(),
  /** Additional context */
  context: ContextSchema.optional(),
  /** When the action occurred */
  timestamp: z.string().datetime({ offset: true }).optional(),
  /** When the LRS stored the statement */
  stored: z.string().datetime({ offset: true }).optional(),
  /** Who asserted this statement */
  authority: ActorSchema.optional(),
  /** xAPI version */
  version: z.string().default('1.0.3'),
  /** Attached files */
  attachments: z.array(AttachmentSchema).optional(),
});
export type Statement = z.infer<typeof StatementSchema>;

// ============================================================================
// STATEMENT BATCH
// ============================================================================

/**
 * Batch of statements for bulk submission.
 */
export const StatementBatchSchema = z.array(StatementSchema).min(1).max(100);
export type StatementBatch = z.infer<typeof StatementBatchSchema>;

// ============================================================================
// STATEMENT RESULT (from query)
// ============================================================================

export const StatementResultSchema = z.object({
  /** Array of statements */
  statements: z.array(StatementSchema),
  /** URL to fetch more results */
  more: z.string().optional(),
});
export type StatementResult = z.infer<typeof StatementResultSchema>;

// ============================================================================
// VOIDING STATEMENT
// ============================================================================

/**
 * Void statement - used to mark another statement as voided.
 */
export const VoidingStatementSchema = StatementSchema.extend({
  verb: z.object({
    id: z.literal('http://adlnet.gov/expapi/verbs/voided'),
    display: z.object({ 'en-US': z.literal('voided') }).optional(),
  }),
  object: z.object({
    objectType: z.literal('StatementRef'),
    id: z.string().uuid(),
  }),
});
export type VoidingStatement = z.infer<typeof VoidingStatementSchema>;
