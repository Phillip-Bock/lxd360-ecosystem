/**
 * Content Schemas Index
 *
 * Central export point for all Content Atom Zod schemas.
 * All types are inferred from schemas (z.infer<typeof Schema>).
 *
 * @module schemas/content
 */

// ============================================================================
// ATOM SCHEMAS
// ============================================================================

export {
  type AtomLearningMetadata,
  AtomLearningMetadataSchema,
  type AtomModalities,
  AtomModalitiesSchema,
  type AtomType,
  AtomTypeSchema,
  type CognitiveLoadRating,
  CognitiveLoadRatingSchema,
  type ConsumptionModality,
  ConsumptionModalitySchema,
  type ContentAtom,
  ContentAtomSchema,
  type ContentStatus,
  ContentStatusSchema,
  type CreateContentAtom,
  CreateContentAtomSchema,
  type EngagementLevel,
  EngagementLevelSchema,
  isAtomType,
  isContentAtom,
  isContentStatus,
  type UpdateContentAtom,
  UpdateContentAtomSchema,
} from './atom';

// ============================================================================
// PROGRESS SCHEMAS
// ============================================================================

export {
  type AtomProgress,
  AtomProgressSchema,
  type CreateAtomProgress,
  CreateAtomProgressSchema,
  type CreatePlaylistProgress,
  CreatePlaylistProgressSchema,
  type DeviceType,
  DeviceTypeSchema,
  isAtomProgress,
  isPlaylistProgress,
  isProgressStatus,
  type PlaylistProgress,
  PlaylistProgressSchema,
  type ProgressStatus,
  ProgressStatusSchema,
  type UpdateAtomProgress,
  UpdateAtomProgressSchema,
} from './progress';

// ============================================================================
// PLAYLIST SCHEMAS
// ============================================================================

export {
  type AtomReference,
  AtomReferenceSchema,
  type CompletionCriteriaType,
  CompletionCriteriaTypeSchema,
  type CreatePlaylist,
  CreatePlaylistSchema,
  isAtomReference,
  isPlaylist,
  isPlaylistItem,
  type Playlist,
  type PlaylistItem,
  PlaylistItemSchema,
  PlaylistSchema,
  type UnlockCondition,
  UnlockConditionSchema,
  type UpdatePlaylist,
  UpdatePlaylistSchema,
} from './playlist';
