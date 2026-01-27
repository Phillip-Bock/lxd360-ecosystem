/**
 * Content Atom Firestore Helpers
 *
 * CRUD operations and queries for Content Atoms, Playlists, and Progress records.
 * Built on top of the generic firestore-client utilities.
 *
 * @module lib/firebase/content
 */

import type { QueryConstraint } from 'firebase/firestore';
import type {
  AtomProgress,
  ContentAtom,
  Playlist,
  PlaylistProgress,
} from '../../types/content/atom';
import {
  createDocument,
  deleteDocumentById,
  type FirestoreListResult,
  type FirestorePaginatedResult,
  type FirestoreResult,
  filters,
  getDocumentById,
  getDocumentsList,
  getDocumentsPaginated,
  sort,
  updateDocumentById,
} from './firestore-client';

// ============================================================================
// COLLECTION NAMES
// ============================================================================

/** Collection name for content atoms */
export const ATOMS_COLLECTION = 'content_atoms';

/** Collection name for playlists */
export const PLAYLISTS_COLLECTION = 'playlists';

/** Collection name for atom progress records */
export const ATOM_PROGRESS_COLLECTION = 'atom_progress';

/** Collection name for playlist progress records */
export const PLAYLIST_PROGRESS_COLLECTION = 'playlist_progress';

// ============================================================================
// CONTENT ATOM OPERATIONS
// ============================================================================

/**
 * Get a content atom by ID.
 *
 * @example
 * ```typescript
 * const { data, error } = await getAtomById('atom-123');
 * if (data) {
 *   // Use data.title, data.type
 * }
 * ```
 */
export async function getAtomById(atomId: string): Promise<FirestoreResult<ContentAtom>> {
  return getDocumentById<ContentAtom>(ATOMS_COLLECTION, atomId);
}

/**
 * Get all content atoms for a tenant.
 *
 * @example
 * ```typescript
 * const { data, error } = await getAtomsByTenant('tenant-123');
 * // data.length contains the count of atoms
 * ```
 */
export async function getAtomsByTenant(
  tenantId: string,
  additionalConstraints: QueryConstraint[] = [],
): Promise<FirestoreListResult<ContentAtom>> {
  return getDocumentsList<ContentAtom>(ATOMS_COLLECTION, [
    filters.eq('tenant_id', tenantId),
    ...additionalConstraints,
  ]);
}

/**
 * Get published content atoms for a tenant.
 *
 * @example
 * ```typescript
 * const { data } = await getPublishedAtoms('tenant-123');
 * ```
 */
export async function getPublishedAtoms(
  tenantId: string,
): Promise<FirestoreListResult<ContentAtom>> {
  return getDocumentsList<ContentAtom>(ATOMS_COLLECTION, [
    filters.eq('tenant_id', tenantId),
    filters.eq('status', 'published'),
    sort('updated_at', 'desc'),
  ]);
}

/**
 * Get content atoms by type.
 *
 * @example
 * ```typescript
 * const { data } = await getAtomsByType('tenant-123', 'video');
 * ```
 */
export async function getAtomsByType(
  tenantId: string,
  atomType: ContentAtom['type'],
): Promise<FirestoreListResult<ContentAtom>> {
  return getDocumentsList<ContentAtom>(ATOMS_COLLECTION, [
    filters.eq('tenant_id', tenantId),
    filters.eq('type', atomType),
    sort('updated_at', 'desc'),
  ]);
}

/**
 * Get paginated content atoms for a tenant.
 *
 * @example
 * ```typescript
 * const { data, hasMore, lastDoc } = await getAtomsPaginated('tenant-123', 20);
 * ```
 */
export async function getAtomsPaginated(
  tenantId: string,
  pageSize: number = 20,
  lastDocument?: Parameters<typeof getDocumentsPaginated>[3],
): Promise<FirestorePaginatedResult<ContentAtom>> {
  return getDocumentsPaginated<ContentAtom>(
    ATOMS_COLLECTION,
    [filters.eq('tenant_id', tenantId), sort('updated_at', 'desc')],
    pageSize,
    lastDocument,
  );
}

/**
 * Create a new content atom.
 *
 * @example
 * ```typescript
 * const { data, error } = await createAtom({
 *   tenant_id: 'tenant-123',
 *   title: 'Introduction Video',
 *   type: 'video',
 *   // ... other fields
 * });
 * ```
 */
export async function createAtom(
  atomData: Omit<ContentAtom, 'id' | 'created_at' | 'updated_at'>,
): Promise<FirestoreResult<ContentAtom>> {
  return createDocument(
    ATOMS_COLLECTION,
    atomData as Record<string, unknown>,
  ) as unknown as Promise<FirestoreResult<ContentAtom>>;
}

/**
 * Update a content atom.
 *
 * @example
 * ```typescript
 * const { data, error } = await updateAtom('atom-123', {
 *   title: 'Updated Title',
 *   status: 'published',
 * });
 * ```
 */
export async function updateAtom(
  atomId: string,
  updates: Partial<ContentAtom>,
): Promise<FirestoreResult<ContentAtom>> {
  return updateDocumentById<ContentAtom>(ATOMS_COLLECTION, atomId, updates);
}

/**
 * Delete a content atom.
 *
 * @example
 * ```typescript
 * const { error } = await deleteAtom('atom-123');
 * // Handle success/error
 * ```
 */
export async function deleteAtom(atomId: string): Promise<{ error: Error | null }> {
  return deleteDocumentById(ATOMS_COLLECTION, atomId);
}

// ============================================================================
// PLAYLIST OPERATIONS
// ============================================================================

/**
 * Get a playlist by ID.
 *
 * @example
 * ```typescript
 * const { data, error } = await getPlaylistById('playlist-123');
 * ```
 */
export async function getPlaylistById(playlistId: string): Promise<FirestoreResult<Playlist>> {
  return getDocumentById<Playlist>(PLAYLISTS_COLLECTION, playlistId);
}

/**
 * Get all playlists for a tenant.
 *
 * @example
 * ```typescript
 * const { data } = await getPlaylistsByTenant('tenant-123');
 * ```
 */
export async function getPlaylistsByTenant(
  tenantId: string,
  additionalConstraints: QueryConstraint[] = [],
): Promise<FirestoreListResult<Playlist>> {
  return getDocumentsList<Playlist>(PLAYLISTS_COLLECTION, [
    filters.eq('tenant_id', tenantId),
    sort('updated_at', 'desc'),
    ...additionalConstraints,
  ]);
}

/**
 * Get published playlists for a tenant.
 *
 * @example
 * ```typescript
 * const { data } = await getPublishedPlaylists('tenant-123');
 * ```
 */
export async function getPublishedPlaylists(
  tenantId: string,
): Promise<FirestoreListResult<Playlist>> {
  return getDocumentsList<Playlist>(PLAYLISTS_COLLECTION, [
    filters.eq('tenant_id', tenantId),
    filters.eq('status', 'published'),
    sort('updated_at', 'desc'),
  ]);
}

/**
 * Create a new playlist.
 *
 * @example
 * ```typescript
 * const { data, error } = await createPlaylist({
 *   tenant_id: 'tenant-123',
 *   title: 'Onboarding Course',
 *   items: [],
 *   // ... other fields
 * });
 * ```
 */
export async function createPlaylist(
  playlistData: Omit<Playlist, 'id' | 'created_at' | 'updated_at'>,
): Promise<FirestoreResult<Playlist>> {
  return createDocument(
    PLAYLISTS_COLLECTION,
    playlistData as Record<string, unknown>,
  ) as unknown as Promise<FirestoreResult<Playlist>>;
}

/**
 * Update a playlist.
 *
 * @example
 * ```typescript
 * const { data, error } = await updatePlaylist('playlist-123', {
 *   title: 'Updated Playlist Title',
 * });
 * ```
 */
export async function updatePlaylist(
  playlistId: string,
  updates: Partial<Playlist>,
): Promise<FirestoreResult<Playlist>> {
  return updateDocumentById<Playlist>(PLAYLISTS_COLLECTION, playlistId, updates);
}

/**
 * Delete a playlist.
 *
 * @example
 * ```typescript
 * const { error } = await deletePlaylist('playlist-123');
 * ```
 */
export async function deletePlaylist(playlistId: string): Promise<{ error: Error | null }> {
  return deleteDocumentById(PLAYLISTS_COLLECTION, playlistId);
}

// ============================================================================
// ATOM PROGRESS OPERATIONS
// ============================================================================

/**
 * Get atom progress by ID.
 *
 * @example
 * ```typescript
 * const { data } = await getAtomProgressById('progress-123');
 * ```
 */
export async function getAtomProgressById(
  progressId: string,
): Promise<FirestoreResult<AtomProgress>> {
  return getDocumentById<AtomProgress>(ATOM_PROGRESS_COLLECTION, progressId);
}

/**
 * Get atom progress for a learner and atom.
 *
 * @example
 * ```typescript
 * const { data } = await getAtomProgressForLearner('learner-123', 'atom-456');
 * if (data.length > 0) {
 *   // Access data[0].progress_percent
 * }
 * ```
 */
export async function getAtomProgressForLearner(
  learnerId: string,
  atomId: string,
): Promise<FirestoreListResult<AtomProgress>> {
  return getDocumentsList<AtomProgress>(ATOM_PROGRESS_COLLECTION, [
    filters.eq('learner_id', learnerId),
    filters.eq('atom_id', atomId),
  ]);
}

/**
 * Get all atom progress for a learner in a tenant.
 *
 * @example
 * ```typescript
 * const { data } = await getAllLearnerProgress('tenant-123', 'learner-456');
 * ```
 */
export async function getAllLearnerProgress(
  tenantId: string,
  learnerId: string,
): Promise<FirestoreListResult<AtomProgress>> {
  return getDocumentsList<AtomProgress>(ATOM_PROGRESS_COLLECTION, [
    filters.eq('tenant_id', tenantId),
    filters.eq('learner_id', learnerId),
    sort('last_accessed_at', 'desc'),
  ]);
}

/**
 * Create or update atom progress record.
 *
 * @example
 * ```typescript
 * const { data, error } = await upsertAtomProgress({
 *   atom_id: 'atom-123',
 *   learner_id: 'learner-456',
 *   tenant_id: 'tenant-789',
 *   status: 'in_progress',
 *   progress_percent: 50,
 *   // ... other fields
 * });
 * ```
 */
export async function upsertAtomProgress(
  progressData: Omit<AtomProgress, 'id'>,
): Promise<FirestoreResult<AtomProgress>> {
  // Check for existing progress
  const existing = await getAtomProgressForLearner(progressData.learner_id, progressData.atom_id);

  if (existing.data.length > 0) {
    const existingProgress = existing.data[0];
    return updateDocumentById<AtomProgress>(
      ATOM_PROGRESS_COLLECTION,
      existingProgress.id,
      progressData,
    );
  }

  return createDocument(
    ATOM_PROGRESS_COLLECTION,
    progressData as Record<string, unknown>,
  ) as unknown as Promise<FirestoreResult<AtomProgress>>;
}

/**
 * Update atom progress.
 *
 * @example
 * ```typescript
 * const { data, error } = await updateAtomProgress('progress-123', {
 *   progress_percent: 75,
 *   last_position_seconds: 180,
 * });
 * ```
 */
export async function updateAtomProgress(
  progressId: string,
  updates: Partial<AtomProgress>,
): Promise<FirestoreResult<AtomProgress>> {
  return updateDocumentById<AtomProgress>(ATOM_PROGRESS_COLLECTION, progressId, updates);
}

// ============================================================================
// PLAYLIST PROGRESS OPERATIONS
// ============================================================================

/**
 * Get playlist progress by ID.
 *
 * @example
 * ```typescript
 * const { data } = await getPlaylistProgressById('progress-123');
 * ```
 */
export async function getPlaylistProgressById(
  progressId: string,
): Promise<FirestoreResult<PlaylistProgress>> {
  return getDocumentById<PlaylistProgress>(PLAYLIST_PROGRESS_COLLECTION, progressId);
}

/**
 * Get playlist progress for a learner and playlist.
 *
 * @example
 * ```typescript
 * const { data } = await getPlaylistProgressForLearner('learner-123', 'playlist-456');
 * ```
 */
export async function getPlaylistProgressForLearner(
  learnerId: string,
  playlistId: string,
): Promise<FirestoreListResult<PlaylistProgress>> {
  return getDocumentsList<PlaylistProgress>(PLAYLIST_PROGRESS_COLLECTION, [
    filters.eq('learner_id', learnerId),
    filters.eq('playlist_id', playlistId),
  ]);
}

/**
 * Get all playlist progress for a learner in a tenant.
 *
 * @example
 * ```typescript
 * const { data } = await getAllLearnerPlaylistProgress('tenant-123', 'learner-456');
 * ```
 */
export async function getAllLearnerPlaylistProgress(
  tenantId: string,
  learnerId: string,
): Promise<FirestoreListResult<PlaylistProgress>> {
  return getDocumentsList<PlaylistProgress>(PLAYLIST_PROGRESS_COLLECTION, [
    filters.eq('tenant_id', tenantId),
    filters.eq('learner_id', learnerId),
    sort('last_accessed_at', 'desc'),
  ]);
}

/**
 * Create or update playlist progress record.
 *
 * @example
 * ```typescript
 * const { data, error } = await upsertPlaylistProgress({
 *   playlist_id: 'playlist-123',
 *   learner_id: 'learner-456',
 *   tenant_id: 'tenant-789',
 *   status: 'in_progress',
 *   progress_percent: 25,
 *   completed_atom_ids: ['atom-1'],
 *   // ... other fields
 * });
 * ```
 */
export async function upsertPlaylistProgress(
  progressData: Omit<PlaylistProgress, 'id'>,
): Promise<FirestoreResult<PlaylistProgress>> {
  // Check for existing progress
  const existing = await getPlaylistProgressForLearner(
    progressData.learner_id,
    progressData.playlist_id,
  );

  if (existing.data.length > 0) {
    const existingProgress = existing.data[0];
    return updateDocumentById<PlaylistProgress>(
      PLAYLIST_PROGRESS_COLLECTION,
      existingProgress.id,
      progressData,
    );
  }

  return createDocument(
    PLAYLIST_PROGRESS_COLLECTION,
    progressData as Record<string, unknown>,
  ) as unknown as Promise<FirestoreResult<PlaylistProgress>>;
}

/**
 * Update playlist progress.
 *
 * @example
 * ```typescript
 * const { data, error } = await updatePlaylistProgress('progress-123', {
 *   progress_percent: 50,
 *   completed_atom_ids: ['atom-1', 'atom-2'],
 * });
 * ```
 */
export async function updatePlaylistProgress(
  progressId: string,
  updates: Partial<PlaylistProgress>,
): Promise<FirestoreResult<PlaylistProgress>> {
  return updateDocumentById<PlaylistProgress>(PLAYLIST_PROGRESS_COLLECTION, progressId, updates);
}
