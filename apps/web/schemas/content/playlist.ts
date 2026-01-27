/**
 * Content Playlist Zod Schemas
 *
 * Runtime validation schemas for Playlists — curated sequences of content atoms.
 * Playlists can be courses, learning paths, or ad-hoc collections.
 *
 * @module schemas/content/playlist
 */

import { z } from 'zod';
import { ContentStatusSchema } from './atom';

// ============================================================================
// PLAYLIST ITEM SCHEMAS
// ============================================================================

/**
 * Unlock condition for playlist items.
 */
export const UnlockConditionSchema = z.enum(['none', 'previous_completed', 'time_delay']);
export type UnlockCondition = z.infer<typeof UnlockConditionSchema>;

/**
 * Playlist Item — An atom in a playlist with ordering metadata.
 */
export const PlaylistItemSchema = z.object({
  /** Content atom ID */
  atom_id: z.string().min(1),
  /** Order in playlist (0-indexed) */
  order: z.number().int().nonnegative(),
  /** Is this item required for completion? */
  is_required: z.boolean(),
  /** Unlock condition (e.g., previous item completion) */
  unlock_condition: UnlockConditionSchema.optional(),
  /** Time delay in minutes (if unlock_condition is 'time_delay') */
  unlock_delay_minutes: z.number().int().nonnegative().optional(),
});
export type PlaylistItem = z.infer<typeof PlaylistItemSchema>;

// ============================================================================
// COMPLETION CRITERIA SCHEMAS
// ============================================================================

/**
 * Completion criteria type.
 */
export const CompletionCriteriaTypeSchema = z.enum(['all_required', 'percentage', 'any_one']);
export type CompletionCriteriaType = z.infer<typeof CompletionCriteriaTypeSchema>;

// ============================================================================
// PLAYLIST SCHEMA
// ============================================================================

/**
 * Playlist — A curated sequence of content atoms.
 * Playlists can be courses, learning paths, or ad-hoc collections.
 */
export const PlaylistSchema = z.object({
  /** Unique identifier */
  id: z.string().min(1),
  /** Tenant/organization ID */
  tenant_id: z.string().min(1),
  /** Playlist title */
  title: z.string().min(1).max(200),
  /** Description */
  description: z.string().max(2000),
  /** Thumbnail URL */
  thumbnail_url: z.string().url().optional(),
  /** Ordered list of atoms */
  items: z.array(PlaylistItemSchema),
  /** Total duration in seconds (computed) */
  total_duration_seconds: z.number().nonnegative(),
  /** Total atom count */
  atom_count: z.number().int().nonnegative(),
  /** Completion criteria */
  completion_criteria: CompletionCriteriaTypeSchema,
  /** Completion threshold (percentage if criteria is 'percentage') */
  completion_threshold: z.number().min(0).max(100).optional(),
  /** Status */
  status: ContentStatusSchema,
  /** Timestamps */
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
  published_at: z.string().datetime({ offset: true }).optional(),
  /** Created by user ID */
  created_by: z.string().min(1),
});
export type Playlist = z.infer<typeof PlaylistSchema>;

/**
 * Schema for creating a new Playlist.
 */
export const CreatePlaylistSchema = PlaylistSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  published_at: true,
  total_duration_seconds: true,
  atom_count: true,
}).extend({
  /** Items can be empty on creation */
  items: z.array(PlaylistItemSchema).default([]),
});
export type CreatePlaylist = z.infer<typeof CreatePlaylistSchema>;

/**
 * Schema for updating a Playlist (partial update).
 */
export const UpdatePlaylistSchema = PlaylistSchema.partial().required({
  id: true,
});
export type UpdatePlaylist = z.infer<typeof UpdatePlaylistSchema>;

// ============================================================================
// ATOM REFERENCE SCHEMA (Lightweight)
// ============================================================================

/**
 * Atom Reference — Lightweight reference to a content atom.
 * Used in playlists and other contexts where full atom data isn't needed.
 */
export const AtomReferenceSchema = z.object({
  /** Content atom ID */
  id: z.string().min(1),
  /** Atom title (denormalized for display) */
  title: z.string(),
  /** Atom type */
  type: z.string(),
  /** Duration in seconds */
  duration_seconds: z.number().nonnegative(),
  /** Thumbnail URL */
  thumbnail_url: z.string().url().optional(),
});
export type AtomReference = z.infer<typeof AtomReferenceSchema>;

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for Playlist.
 */
export function isPlaylist(value: unknown): value is Playlist {
  return PlaylistSchema.safeParse(value).success;
}

/**
 * Type guard for PlaylistItem.
 */
export function isPlaylistItem(value: unknown): value is PlaylistItem {
  return PlaylistItemSchema.safeParse(value).success;
}

/**
 * Type guard for AtomReference.
 */
export function isAtomReference(value: unknown): value is AtomReference {
  return AtomReferenceSchema.safeParse(value).success;
}
