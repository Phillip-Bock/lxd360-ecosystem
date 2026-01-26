// =============================================================================
// CONTENT ATOM TYPES — Fundamental Unit of Learning Content
// =============================================================================
// Supports multi-modality (video, audio, text, interactive)
// Enables Podcast Mode, offline sync, and JIT (Just-In-Time) delivery
// =============================================================================

/**
 * Atom types supported in the system.
 * These are the fundamental content primitives that can be assembled into courses.
 */
export type AtomType =
  | 'video'
  | 'audio'
  | 'document'
  | 'quiz'
  | 'interactive'
  | 'scorm'
  | 'roleplay'
  | 'simulation'
  | 'article';

/**
 * Engagement levels based on Chi & Wylie's ICAP Framework.
 * Used to categorize cognitive engagement required for each atom.
 */
export type EngagementLevel =
  | 'passive' // Watching/listening without interaction
  | 'active' // Manipulating content (clicking, selecting)
  | 'constructive' // Producing new outputs (notes, summaries)
  | 'interactive'; // Dialogue with peers or AI

/**
 * Consumption modality for tracking how content is consumed.
 */
export type ConsumptionModality = 'video' | 'audio' | 'text' | 'interactive';

/**
 * Content status lifecycle.
 */
export type ContentStatus = 'draft' | 'review' | 'published' | 'archived';

/**
 * Progress status for tracking learner completion.
 */
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

// =============================================================================
// MULTI-MODALITY SUPPORT (Podcast Mode)
// =============================================================================

/**
 * Modality resources for a content atom.
 * Enables consumption via video, audio, or text based on learner preference.
 */
export interface AtomModalities {
  /** Primary video URL (MP4, HLS, etc.) */
  video_url?: string;
  /** Extracted audio track for Podcast Mode */
  audio_url?: string;
  /** VTT/SRT transcript file URL */
  transcript_url?: string;
  /** Plain text transcript for search/RAG */
  transcript_text?: string;
  /** PDF/slides document URL */
  document_url?: string;
  /** Thumbnail/poster image URL */
  thumbnail_url?: string;
}

// =============================================================================
// LEARNING SCIENCE METADATA
// =============================================================================

/**
 * Cognitive load rating (1-5) based on ICL Framework.
 * Used for adaptive pacing and workload management.
 */
export type CognitiveLoadRating = 1 | 2 | 3 | 4 | 5;

/**
 * Learning science metadata for a content atom.
 */
export interface AtomLearningMetadata {
  /** Cognitive load rating (1=low, 5=high) */
  cognitive_load: CognitiveLoadRating;
  /** ICAP engagement level */
  engagement_level: EngagementLevel;
  /** Skill taxonomy IDs this atom teaches */
  skill_ids: string[];
  /** Prerequisite atom IDs */
  prerequisite_atom_ids: string[];
  /** Estimated mastery probability after completion */
  expected_mastery_delta: number;
  /** Recommended review interval (days) for SM-2 */
  review_interval_days?: number;
}

// =============================================================================
// CONTENT ATOM (Core Type)
// =============================================================================

/**
 * Content Atom — The fundamental unit of learning content.
 * Atoms are assembled into playlists/courses but can stand alone.
 */
export interface ContentAtom {
  /** Unique identifier (Firestore document ID) */
  id: string;
  /** Tenant/organization ID for multi-tenancy */
  tenant_id: string;

  // ─── Metadata ────────────────────────────────────────────────────────────────
  /** Human-readable title */
  title: string;
  /** Description for search/display */
  description: string;
  /** Content type */
  type: AtomType;
  /** Duration in seconds */
  duration_seconds: number;

  // ─── Multi-Modality Support ──────────────────────────────────────────────────
  /** Available modalities (video, audio, text, etc.) */
  modalities: AtomModalities;
  /** Primary modality for this atom */
  primary_modality: ConsumptionModality;

  // ─── AI/Search ───────────────────────────────────────────────────────────────
  /** Vector embedding for RAG semantic search */
  vector_embedding?: number[];
  /** Searchable tags */
  tags: string[];
  /** Full-text search keywords */
  keywords: string[];

  // ─── Learning Science ────────────────────────────────────────────────────────
  /** Learning metadata for adaptive delivery */
  learning_metadata: AtomLearningMetadata;

  // ─── xAPI Integration ────────────────────────────────────────────────────────
  /** xAPI Activity IRI for this atom */
  xapi_activity_id: string;
  /** xAPI Activity Type IRI */
  xapi_activity_type: string;

  // ─── Timestamps ──────────────────────────────────────────────────────────────
  /** Creation timestamp (ISO 8601) */
  created_at: string;
  /** Last update timestamp (ISO 8601) */
  updated_at: string;
  /** Publication timestamp (ISO 8601) */
  published_at?: string;

  // ─── Status ──────────────────────────────────────────────────────────────────
  /** Content lifecycle status */
  status: ContentStatus;
  /** Version number for change tracking */
  version: number;
  /** Created by user ID */
  created_by: string;
  /** Last updated by user ID */
  updated_by: string;
}

// =============================================================================
// ATOM PROGRESS (Learner State)
// =============================================================================

/**
 * Atom Progress — Tracks a learner's progress through a content atom.
 * Stored per-learner, per-atom for granular tracking.
 */
export interface AtomProgress {
  /** Unique identifier */
  id: string;
  /** Content atom ID */
  atom_id: string;
  /** Learner user ID */
  learner_id: string;
  /** Tenant/organization ID */
  tenant_id: string;

  // ─── State ───────────────────────────────────────────────────────────────────
  /** Completion status */
  status: ProgressStatus;
  /** Progress percentage (0-100) */
  progress_percent: number;

  // ─── Modality Tracking ───────────────────────────────────────────────────────
  /** How the content was consumed */
  consumed_via: ConsumptionModality;
  /** Playback speed used */
  playback_speed: number;
  /** Was consumed in background/Podcast mode */
  background_mode: boolean;
  /** Device type used */
  device_type: 'desktop' | 'mobile' | 'tablet';

  // ─── Time Tracking ───────────────────────────────────────────────────────────
  /** Total time spent (seconds) */
  time_spent_seconds: number;
  /** Last playback position (seconds) for resume */
  last_position_seconds: number;
  /** Number of times accessed */
  access_count: number;

  // ─── Completion ──────────────────────────────────────────────────────────────
  /** First access timestamp (ISO 8601) */
  first_accessed_at: string;
  /** Last access timestamp (ISO 8601) */
  last_accessed_at: string;
  /** Completion timestamp (ISO 8601) */
  completed_at?: string;

  // ─── Learning Science ────────────────────────────────────────────────────────
  /** BKT mastery probability after this atom */
  mastery_probability?: number;
  /** SM-2 next review date (ISO 8601) */
  next_review_at?: string;
  /** SM-2 easiness factor */
  easiness_factor?: number;
  /** SM-2 repetition count */
  repetition_count?: number;

  // ─── Sync ────────────────────────────────────────────────────────────────────
  /** Has been synced from offline queue */
  offline_synced: boolean;
  /** Last sync timestamp (ISO 8601) */
  last_sync_at: string;
  /** Sync version for conflict resolution */
  sync_version: number;
}

// =============================================================================
// PLAYLIST (Assembled Atoms)
// =============================================================================

/**
 * Playlist Item — An atom in a playlist with ordering metadata.
 */
export interface PlaylistItem {
  /** Content atom ID */
  atom_id: string;
  /** Order in playlist (0-indexed) */
  order: number;
  /** Is this item required for completion? */
  is_required: boolean;
  /** Unlock condition (e.g., previous item completion) */
  unlock_condition?: 'none' | 'previous_completed' | 'time_delay';
  /** Time delay in minutes (if unlock_condition is 'time_delay') */
  unlock_delay_minutes?: number;
}

/**
 * Playlist — A curated sequence of content atoms.
 * Playlists can be courses, learning paths, or ad-hoc collections.
 */
export interface Playlist {
  /** Unique identifier */
  id: string;
  /** Tenant/organization ID */
  tenant_id: string;
  /** Playlist title */
  title: string;
  /** Description */
  description: string;
  /** Thumbnail URL */
  thumbnail_url?: string;
  /** Ordered list of atoms */
  items: PlaylistItem[];
  /** Total duration in seconds (computed) */
  total_duration_seconds: number;
  /** Total atom count */
  atom_count: number;
  /** Completion criteria */
  completion_criteria: 'all_required' | 'percentage' | 'any_one';
  /** Completion threshold (percentage if criteria is 'percentage') */
  completion_threshold?: number;
  /** Status */
  status: ContentStatus;
  /** Timestamps */
  created_at: string;
  updated_at: string;
  published_at?: string;
  /** Created by user ID */
  created_by: string;
}

/**
 * Playlist Progress — Tracks a learner's progress through a playlist.
 */
export interface PlaylistProgress {
  /** Unique identifier */
  id: string;
  /** Playlist ID */
  playlist_id: string;
  /** Learner user ID */
  learner_id: string;
  /** Tenant/organization ID */
  tenant_id: string;
  /** Completion status */
  status: ProgressStatus;
  /** Progress percentage (0-100) */
  progress_percent: number;
  /** Completed atom IDs */
  completed_atom_ids: string[];
  /** Current atom ID */
  current_atom_id?: string;
  /** Total time spent (seconds) */
  total_time_spent_seconds: number;
  /** First access timestamp */
  first_accessed_at: string;
  /** Last access timestamp */
  last_accessed_at: string;
  /** Completion timestamp */
  completed_at?: string;
}

// =============================================================================
// OFFLINE SYNC TYPES
// =============================================================================

/**
 * Offline Queue Item — Pending state change to sync.
 */
export interface OfflineQueueItem {
  /** Unique identifier */
  id: string;
  /** Queue item type */
  type: 'progress_update' | 'xapi_statement';
  /** Payload data */
  payload: AtomProgress | Record<string, unknown>;
  /** Priority level */
  priority: 'high' | 'normal' | 'low';
  /** Created timestamp (ISO 8601) */
  created_at: string;
  /** Retry count */
  retry_count: number;
  /** Last retry timestamp */
  last_retry_at?: string;
  /** Error message if failed */
  error_message?: string;
}

/**
 * Sync Conflict — Detected conflict during offline sync.
 */
export interface SyncConflict {
  /** Conflicting entity ID */
  entity_id: string;
  /** Entity type */
  entity_type: 'atom_progress' | 'playlist_progress';
  /** Local version */
  local_version: number;
  /** Server version */
  server_version: number;
  /** Local data */
  local_data: AtomProgress | PlaylistProgress;
  /** Server data */
  server_data: AtomProgress | PlaylistProgress;
  /** Suggested resolution strategy */
  resolution_strategy: 'server_wins' | 'local_wins' | 'merge';
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard for ContentAtom.
 */
export function isContentAtom(obj: unknown): obj is ContentAtom {
  return (
    typeof obj === 'object' && obj !== null && 'id' in obj && 'type' in obj && 'modalities' in obj
  );
}

/**
 * Type guard for AtomProgress.
 */
export function isAtomProgress(obj: unknown): obj is AtomProgress {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'atom_id' in obj &&
    'learner_id' in obj &&
    'status' in obj
  );
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate total playlist duration from atoms.
 */
export function calculatePlaylistDuration(atoms: ContentAtom[]): number {
  return atoms.reduce((total, atom) => total + atom.duration_seconds, 0);
}

/**
 * Format duration in seconds to human-readable string.
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Calculate playlist progress percentage from atom progress.
 */
export function calculatePlaylistProgress(
  playlist: Playlist,
  atomProgressMap: Map<string, AtomProgress>,
): number {
  const requiredItems = playlist.items.filter((item) => item.is_required);
  if (requiredItems.length === 0) return 0;

  const completedCount = requiredItems.filter((item) => {
    const progress = atomProgressMap.get(item.atom_id);
    return progress?.status === 'completed';
  }).length;

  return Math.round((completedCount / requiredItems.length) * 100);
}
