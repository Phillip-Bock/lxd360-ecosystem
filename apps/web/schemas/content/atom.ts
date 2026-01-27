/**
 * Content Atom Zod Schemas
 *
 * Runtime validation schemas for Content Atoms — the fundamental unit of learning content.
 * These schemas match the TypeScript interfaces in types/content/atom.ts.
 *
 * @module schemas/content/atom
 */

import { z } from 'zod';

// ============================================================================
// ATOM TYPE SCHEMAS
// ============================================================================

/**
 * Atom types supported in the system.
 */
export const AtomTypeSchema = z.enum([
  'video',
  'audio',
  'document',
  'quiz',
  'interactive',
  'scorm',
  'roleplay',
  'simulation',
  'article',
]);
export type AtomType = z.infer<typeof AtomTypeSchema>;

/**
 * Engagement levels based on Chi & Wylie's ICAP Framework.
 */
export const EngagementLevelSchema = z.enum(['passive', 'active', 'constructive', 'interactive']);
export type EngagementLevel = z.infer<typeof EngagementLevelSchema>;

/**
 * Consumption modality for tracking how content is consumed.
 */
export const ConsumptionModalitySchema = z.enum(['video', 'audio', 'text', 'interactive']);
export type ConsumptionModality = z.infer<typeof ConsumptionModalitySchema>;

/**
 * Content status lifecycle.
 */
export const ContentStatusSchema = z.enum(['draft', 'review', 'published', 'archived']);
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

/**
 * Cognitive load rating (1-5).
 */
export const CognitiveLoadRatingSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);
export type CognitiveLoadRating = z.infer<typeof CognitiveLoadRatingSchema>;

// ============================================================================
// MODALITY SUPPORT SCHEMAS
// ============================================================================

/**
 * Modality resources for a content atom.
 * Enables consumption via video, audio, or text based on learner preference.
 */
export const AtomModalitiesSchema = z.object({
  /** Primary video URL (MP4, HLS, etc.) */
  video_url: z.string().url().optional(),
  /** Extracted audio track for Podcast Mode */
  audio_url: z.string().url().optional(),
  /** VTT/SRT transcript file URL */
  transcript_url: z.string().url().optional(),
  /** Plain text transcript for search/RAG */
  transcript_text: z.string().optional(),
  /** PDF/slides document URL */
  document_url: z.string().url().optional(),
  /** Thumbnail/poster image URL */
  thumbnail_url: z.string().url().optional(),
});
export type AtomModalities = z.infer<typeof AtomModalitiesSchema>;

// ============================================================================
// LEARNING SCIENCE METADATA SCHEMAS
// ============================================================================

/**
 * Learning science metadata for a content atom.
 */
export const AtomLearningMetadataSchema = z.object({
  /** Cognitive load rating (1=low, 5=high) */
  cognitive_load: CognitiveLoadRatingSchema,
  /** ICAP engagement level */
  engagement_level: EngagementLevelSchema,
  /** Skill taxonomy IDs this atom teaches */
  skill_ids: z.array(z.string()),
  /** Prerequisite atom IDs */
  prerequisite_atom_ids: z.array(z.string()),
  /** Estimated mastery probability after completion */
  expected_mastery_delta: z.number().min(0).max(1),
  /** Recommended review interval (days) for SM-2 */
  review_interval_days: z.number().positive().optional(),
});
export type AtomLearningMetadata = z.infer<typeof AtomLearningMetadataSchema>;

// ============================================================================
// CONTENT ATOM SCHEMA (Core)
// ============================================================================

/**
 * Content Atom — The fundamental unit of learning content.
 * Atoms are assembled into playlists/courses but can stand alone.
 */
export const ContentAtomSchema = z.object({
  /** Unique identifier (Firestore document ID) */
  id: z.string().min(1),
  /** Tenant/organization ID for multi-tenancy */
  tenant_id: z.string().min(1),

  // ─── Metadata ────────────────────────────────────────────────────────────────
  /** Human-readable title */
  title: z.string().min(1).max(200),
  /** Description for search/display */
  description: z.string().max(2000),
  /** Content type */
  type: AtomTypeSchema,
  /** Duration in seconds */
  duration_seconds: z.number().nonnegative(),

  // ─── Multi-Modality Support ──────────────────────────────────────────────────
  /** Available modalities (video, audio, text, etc.) */
  modalities: AtomModalitiesSchema,
  /** Primary modality for this atom */
  primary_modality: ConsumptionModalitySchema,

  // ─── AI/Search ───────────────────────────────────────────────────────────────
  /** Vector embedding for RAG semantic search */
  vector_embedding: z.array(z.number()).optional(),
  /** Searchable tags */
  tags: z.array(z.string()),
  /** Full-text search keywords */
  keywords: z.array(z.string()),

  // ─── Learning Science ────────────────────────────────────────────────────────
  /** Learning metadata for adaptive delivery */
  learning_metadata: AtomLearningMetadataSchema,

  // ─── xAPI Integration ────────────────────────────────────────────────────────
  /** xAPI Activity IRI for this atom */
  xapi_activity_id: z.string().url(),
  /** xAPI Activity Type IRI */
  xapi_activity_type: z.string().url(),

  // ─── Timestamps ──────────────────────────────────────────────────────────────
  /** Creation timestamp (ISO 8601) */
  created_at: z.string().datetime({ offset: true }),
  /** Last update timestamp (ISO 8601) */
  updated_at: z.string().datetime({ offset: true }),
  /** Publication timestamp (ISO 8601) */
  published_at: z.string().datetime({ offset: true }).optional(),

  // ─── Status ──────────────────────────────────────────────────────────────────
  /** Content lifecycle status */
  status: ContentStatusSchema,
  /** Version number for change tracking */
  version: z.number().int().positive(),
  /** Created by user ID */
  created_by: z.string().min(1),
  /** Last updated by user ID */
  updated_by: z.string().min(1),
});
export type ContentAtom = z.infer<typeof ContentAtomSchema>;

/**
 * Schema for creating a new Content Atom (without auto-generated fields).
 */
export const CreateContentAtomSchema = ContentAtomSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  published_at: true,
  version: true,
});
export type CreateContentAtom = z.infer<typeof CreateContentAtomSchema>;

/**
 * Schema for updating a Content Atom (all fields optional except id).
 */
export const UpdateContentAtomSchema = ContentAtomSchema.partial().required({
  id: true,
});
export type UpdateContentAtom = z.infer<typeof UpdateContentAtomSchema>;

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for ContentAtom.
 */
export function isContentAtom(value: unknown): value is ContentAtom {
  return ContentAtomSchema.safeParse(value).success;
}

/**
 * Type guard for AtomType.
 */
export function isAtomType(value: unknown): value is AtomType {
  return AtomTypeSchema.safeParse(value).success;
}

/**
 * Type guard for ContentStatus.
 */
export function isContentStatus(value: unknown): value is ContentStatus {
  return ContentStatusSchema.safeParse(value).success;
}
