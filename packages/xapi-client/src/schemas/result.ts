/**
 * xAPI 1.0.3 Result Schemas
 *
 * Result describes the outcome of a Statement.
 *
 * @module @inspire/xapi-client/schemas/result
 */

import { z } from 'zod';
import { DurationSchema, ExtensionsSchema } from './primitives';

// ============================================================================
// SCORE
// ============================================================================

export const ScoreSchema = z
  .object({
    /** Score value between -1 and 1 (normalized) */
    scaled: z.number().min(-1).max(1).optional(),
    /** Raw score */
    raw: z.number().optional(),
    /** Minimum possible score */
    min: z.number().optional(),
    /** Maximum possible score */
    max: z.number().optional(),
  })
  .refine(
    (score) => {
      if (score.raw !== undefined && score.min !== undefined) {
        return score.raw >= score.min;
      }
      return true;
    },
    { message: 'raw MUST be >= min' },
  )
  .refine(
    (score) => {
      if (score.raw !== undefined && score.max !== undefined) {
        return score.raw <= score.max;
      }
      return true;
    },
    { message: 'raw MUST be <= max' },
  )
  .refine(
    (score) => {
      if (score.min !== undefined && score.max !== undefined) {
        return score.min < score.max;
      }
      return true;
    },
    { message: 'min MUST be < max' },
  );
export type Score = z.infer<typeof ScoreSchema>;

// ============================================================================
// RESULT
// ============================================================================

export const ResultSchema = z.object({
  /** Score for the activity */
  score: ScoreSchema.optional(),
  /** Whether the attempt was successful */
  success: z.boolean().optional(),
  /** Whether the activity was completed */
  completion: z.boolean().optional(),
  /** Learner's response */
  response: z.string().optional(),
  /** Duration in ISO 8601 format */
  duration: DurationSchema.optional(),
  /** Additional result data */
  extensions: ExtensionsSchema.optional(),
});
export type Result = z.infer<typeof ResultSchema>;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Format seconds to ISO 8601 duration.
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) {
    throw new Error('Duration cannot be negative');
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let duration = 'PT';
  if (hours > 0) duration += `${hours}H`;
  if (minutes > 0) duration += `${minutes}M`;
  if (secs > 0 || duration === 'PT') duration += `${secs.toFixed(2)}S`;

  return duration;
}

/**
 * Parse ISO 8601 duration to seconds.
 */
export function parseDuration(duration: string): number {
  const match = duration.match(
    /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/,
  );

  if (!match) {
    throw new Error(`Invalid ISO 8601 duration: ${duration}`);
  }

  const years = Number.parseInt(match[1] ?? '0', 10);
  const months = Number.parseInt(match[2] ?? '0', 10);
  const weeks = Number.parseInt(match[3] ?? '0', 10);
  const days = Number.parseInt(match[4] ?? '0', 10);
  const hours = Number.parseInt(match[5] ?? '0', 10);
  const minutes = Number.parseInt(match[6] ?? '0', 10);
  const seconds = Number.parseFloat(match[7] ?? '0');

  return (
    years * 365 * 24 * 3600 +
    months * 30 * 24 * 3600 +
    weeks * 7 * 24 * 3600 +
    days * 24 * 3600 +
    hours * 3600 +
    minutes * 60 +
    seconds
  );
}
