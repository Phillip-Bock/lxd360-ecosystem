/**
 * Content Progress Zod Schemas
 *
 * Runtime validation schemas for tracking learner progress through content atoms.
 * Supports offline sync, multi-modality tracking, and spaced repetition.
 *
 * @module schemas/content/progress
 */

import { z } from 'zod';
import { ConsumptionModalitySchema } from './atom';

// ============================================================================
// PROGRESS STATUS SCHEMAS
// ============================================================================

/**
 * Progress status for tracking learner completion.
 */
export const ProgressStatusSchema = z.enum(['not_started', 'in_progress', 'completed']);
export type ProgressStatus = z.infer<typeof ProgressStatusSchema>;

/**
 * Device type for tracking consumption context.
 */
export const DeviceTypeSchema = z.enum(['desktop', 'mobile', 'tablet']);
export type DeviceType = z.infer<typeof DeviceTypeSchema>;

// ============================================================================
// ATOM PROGRESS SCHEMA
// ============================================================================

/**
 * Atom Progress — Tracks a learner's progress through a content atom.
 * Stored per-learner, per-atom for granular tracking.
 */
export const AtomProgressSchema = z.object({
  /** Unique identifier */
  id: z.string().min(1),
  /** Content atom ID */
  atom_id: z.string().min(1),
  /** Learner user ID */
  learner_id: z.string().min(1),
  /** Tenant/organization ID */
  tenant_id: z.string().min(1),

  // ─── State ───────────────────────────────────────────────────────────────────
  /** Completion status */
  status: ProgressStatusSchema,
  /** Progress percentage (0-100) */
  progress_percent: z.number().min(0).max(100),

  // ─── Modality Tracking ───────────────────────────────────────────────────────
  /** How the content was consumed */
  consumed_via: ConsumptionModalitySchema,
  /** Playback speed used */
  playback_speed: z.number().min(0.25).max(3),
  /** Was consumed in background/Podcast mode */
  background_mode: z.boolean(),
  /** Device type used */
  device_type: DeviceTypeSchema,

  // ─── Time Tracking ───────────────────────────────────────────────────────────
  /** Total time spent (seconds) */
  time_spent_seconds: z.number().nonnegative(),
  /** Last playback position (seconds) for resume */
  last_position_seconds: z.number().nonnegative(),
  /** Number of times accessed */
  access_count: z.number().int().nonnegative(),

  // ─── Completion ──────────────────────────────────────────────────────────────
  /** First access timestamp (ISO 8601) */
  first_accessed_at: z.string().datetime({ offset: true }),
  /** Last access timestamp (ISO 8601) */
  last_accessed_at: z.string().datetime({ offset: true }),
  /** Completion timestamp (ISO 8601) */
  completed_at: z.string().datetime({ offset: true }).optional(),

  // ─── Learning Science ────────────────────────────────────────────────────────
  /** BKT mastery probability after this atom */
  mastery_probability: z.number().min(0).max(1).optional(),
  /** SM-2 next review date (ISO 8601) */
  next_review_at: z.string().datetime({ offset: true }).optional(),
  /** SM-2 easiness factor */
  easiness_factor: z.number().min(1.3).optional(),
  /** SM-2 repetition count */
  repetition_count: z.number().int().nonnegative().optional(),

  // ─── Sync ────────────────────────────────────────────────────────────────────
  /** Has been synced from offline queue */
  offline_synced: z.boolean(),
  /** Last sync timestamp (ISO 8601) */
  last_sync_at: z.string().datetime({ offset: true }),
  /** Sync version for conflict resolution */
  sync_version: z.number().int().nonnegative(),
});
export type AtomProgress = z.infer<typeof AtomProgressSchema>;

/**
 * Schema for creating a new Atom Progress record.
 */
export const CreateAtomProgressSchema = AtomProgressSchema.omit({
  id: true,
  completed_at: true,
  mastery_probability: true,
  next_review_at: true,
  easiness_factor: true,
  repetition_count: true,
});
export type CreateAtomProgress = z.infer<typeof CreateAtomProgressSchema>;

/**
 * Schema for updating Atom Progress (partial update).
 */
export const UpdateAtomProgressSchema = AtomProgressSchema.partial().required({
  id: true,
  atom_id: true,
  learner_id: true,
});
export type UpdateAtomProgress = z.infer<typeof UpdateAtomProgressSchema>;

// ============================================================================
// PLAYLIST PROGRESS SCHEMA
// ============================================================================

/**
 * Playlist Progress — Tracks a learner's progress through a playlist.
 */
export const PlaylistProgressSchema = z.object({
  /** Unique identifier */
  id: z.string().min(1),
  /** Playlist ID */
  playlist_id: z.string().min(1),
  /** Learner user ID */
  learner_id: z.string().min(1),
  /** Tenant/organization ID */
  tenant_id: z.string().min(1),
  /** Completion status */
  status: ProgressStatusSchema,
  /** Progress percentage (0-100) */
  progress_percent: z.number().min(0).max(100),
  /** Completed atom IDs */
  completed_atom_ids: z.array(z.string()),
  /** Current atom ID */
  current_atom_id: z.string().optional(),
  /** Total time spent (seconds) */
  total_time_spent_seconds: z.number().nonnegative(),
  /** First access timestamp */
  first_accessed_at: z.string().datetime({ offset: true }),
  /** Last access timestamp */
  last_accessed_at: z.string().datetime({ offset: true }),
  /** Completion timestamp */
  completed_at: z.string().datetime({ offset: true }).optional(),
});
export type PlaylistProgress = z.infer<typeof PlaylistProgressSchema>;

/**
 * Schema for creating a new Playlist Progress record.
 */
export const CreatePlaylistProgressSchema = PlaylistProgressSchema.omit({
  id: true,
  completed_at: true,
});
export type CreatePlaylistProgress = z.infer<typeof CreatePlaylistProgressSchema>;

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for AtomProgress.
 */
export function isAtomProgress(value: unknown): value is AtomProgress {
  return AtomProgressSchema.safeParse(value).success;
}

/**
 * Type guard for PlaylistProgress.
 */
export function isPlaylistProgress(value: unknown): value is PlaylistProgress {
  return PlaylistProgressSchema.safeParse(value).success;
}

/**
 * Type guard for ProgressStatus.
 */
export function isProgressStatus(value: unknown): value is ProgressStatus {
  return ProgressStatusSchema.safeParse(value).success;
}
