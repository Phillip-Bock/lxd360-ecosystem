/**
 * xAPI 1.0.3 Context Schemas
 *
 * Context provides additional information about the Statement.
 *
 * @module @inspire/xapi-client/schemas/context
 */

import { z } from 'zod';
import { ActivitySchema, StatementRefSchema } from './activity';
import { ActorSchema, GroupSchema } from './actor';
import { ExtensionsSchema } from './primitives';

// ============================================================================
// CONTEXT ACTIVITIES
// ============================================================================

export const ContextActivitiesSchema = z.object({
  /** Parent activities - direct parents of the activity */
  parent: z.array(ActivitySchema).optional(),
  /** Grouping activities - related activities grouped together */
  grouping: z.array(ActivitySchema).optional(),
  /** Category activities - used for tagging/categorization */
  category: z.array(ActivitySchema).optional(),
  /** Other activities - any other related activities */
  other: z.array(ActivitySchema).optional(),
});
export type ContextActivities = z.infer<typeof ContextActivitiesSchema>;

// ============================================================================
// CONTEXT
// ============================================================================

export const ContextSchema = z.object({
  /** Registration UUID - groups statements about a single registration */
  registration: z.string().uuid().optional(),
  /** Instructor for this activity */
  instructor: ActorSchema.optional(),
  /** Team the learner is part of */
  team: GroupSchema.optional(),
  /** Related activities */
  contextActivities: ContextActivitiesSchema.optional(),
  /** Revision of the activity */
  revision: z.string().optional(),
  /** Platform identifier */
  platform: z.string().optional(),
  /** Language code (RFC 5646) */
  language: z.string().optional(),
  /** Another statement that contextualizes this one */
  statement: StatementRefSchema.optional(),
  /** Additional context data */
  extensions: ExtensionsSchema.optional(),
});
export type Context = z.infer<typeof ContextSchema>;
