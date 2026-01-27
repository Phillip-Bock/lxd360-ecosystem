/**
 * Content Types Index
 *
 * Central export point for all Content Atom TypeScript types.
 * These types define the foundational content model for the LXD360 platform.
 *
 * @module types/content
 */

// ============================================================================
// CONTENT ATOM TYPES
// ============================================================================

export type {
  /** Learning metadata for atoms */
  AtomLearningMetadata,
  /** Multi-modality resources */
  AtomModalities,
  /** Atom types (video, audio, document, etc.) */
  AtomType,
  /** Cognitive load rating (1-5) */
  CognitiveLoadRating,
  /** Consumption modality (video, audio, text, interactive) */
  ConsumptionModality,
  /** The fundamental unit of learning content */
  ContentAtom,
  /** Content lifecycle status */
  ContentStatus,
  /** ICAP engagement levels */
  EngagementLevel,
} from './atom';

// ============================================================================
// PROGRESS TYPES
// ============================================================================

export type {
  /** Learner progress through a content atom */
  AtomProgress,
  /** Learner progress through a playlist */
  PlaylistProgress,
  /** Progress completion status */
  ProgressStatus,
} from './atom';

// ============================================================================
// PLAYLIST TYPES
// ============================================================================

export type {
  /** Curated sequence of content atoms */
  Playlist,
  /** Item in a playlist with ordering metadata */
  PlaylistItem,
} from './atom';

// ============================================================================
// OFFLINE SYNC TYPES
// ============================================================================

export type {
  /** Pending state change to sync */
  OfflineQueueItem,
  /** Detected conflict during offline sync */
  SyncConflict,
} from './atom';

// ============================================================================
// TYPE GUARDS
// ============================================================================

export {
  /** Type guard for AtomProgress */
  isAtomProgress,
  /** Type guard for ContentAtom */
  isContentAtom,
} from './atom';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export {
  /** Calculate total playlist duration from atoms */
  calculatePlaylistDuration,
  /** Calculate playlist progress percentage from atom progress */
  calculatePlaylistProgress,
  /** Format duration in seconds to human-readable string */
  formatDuration,
} from './atom';
