import {
  deleteObject,
  getDownloadURL,
  ref,
  type UploadMetadata,
  uploadBytes,
} from 'firebase/storage';
import { requireStorage } from '@/lib/firebase/client';
import {
  createDocument,
  type DocumentData,
  type DocumentSnapshot,
  deleteDocumentById,
  type FirestoreListResult,
  type FirestorePaginatedResult,
  type FirestoreResult,
  filters,
  getDocumentById,
  getDocumentsList,
  getDocumentsPaginated,
  limitTo,
  type QueryConstraint,
  sort,
  updateDocumentById,
} from '@/lib/firebase/firestore-client';
import {
  getAssetTypeFromMimeType,
  type MediaAsset,
  type MediaAssetMetadata,
  type MediaAssetStatus,
  type MediaAssetType,
  type MediaFilters,
  type MediaSortOptions,
} from '@/lib/media/types';

// =============================================================================
// Constants
// =============================================================================

/**
 * Get the media collection path for a tenant
 */
function getMediaCollectionPath(tenantId: string): string {
  return `tenants/${tenantId}/media`;
}

// =============================================================================
// Types
// =============================================================================

/**
 * Input for creating a new media asset
 */
export interface CreateMediaInput {
  tenantId: string;
  uploadedBy: string;
  file: File;
  folderId?: string | null;
  altText?: string | null;
  description?: string | null;
  tags?: string[];
  collections?: string[];
}

/**
 * Input for creating a media asset record (without file upload)
 */
export interface CreateMediaRecordInput {
  tenantId: string;
  uploadedBy: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  assetType: MediaAssetType;
  storagePath: string;
  publicUrl?: string | null;
  thumbnailUrl?: string | null;
  folderId?: string | null;
  altText?: string | null;
  description?: string | null;
  tags?: string[];
  collections?: string[];
  metadata?: MediaAssetMetadata;
  blurhash?: string | null;
}

/**
 * Input for updating a media asset
 */
export interface UpdateMediaInput {
  folderId?: string | null;
  altText?: string | null;
  description?: string | null;
  tags?: string[];
  collections?: string[];
  metadata?: Partial<MediaAssetMetadata>;
}

/**
 * Options for listing media
 */
export interface ListMediaOptions {
  filters?: MediaFilters;
  sort?: MediaSortOptions;
  pageSize?: number;
  lastDocument?: DocumentSnapshot<DocumentData> | null;
}

// =============================================================================
// Storage Operations
// =============================================================================

/**
 * Generate a unique storage path for a media file
 */
function generateStoragePath(
  tenantId: string,
  assetType: MediaAssetType,
  filename: string,
): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const ext = filename.split('.').pop() || '';
  const safeFilename = `${timestamp}_${random}.${ext}`;

  return `${tenantId}/${assetType}/${year}/${month}/${safeFilename}`;
}

/**
 * Upload a file to Firebase Storage
 */
export async function uploadToStorage(
  file: File,
  storagePath: string,
  metadata?: UploadMetadata,
): Promise<{ url: string; error: Error | null }> {
  try {
    const storage = requireStorage();
    const storageRef = ref(storage, storagePath);

    const uploadMetadata: UploadMetadata = {
      contentType: file.type,
      ...metadata,
    };

    await uploadBytes(storageRef, file, uploadMetadata);
    const url = await getDownloadURL(storageRef);

    return { url, error: null };
  } catch (error) {
    return { url: '', error: error as Error };
  }
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFromStorage(storagePath: string): Promise<{ error: Error | null }> {
  try {
    const storage = requireStorage();
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

// =============================================================================
// CRUD Operations
// =============================================================================

/**
 * Create a media asset record in Firestore
 *
 * @example
 * ```typescript
 * const { data, error } = await createMediaRecord({
 *   tenantId: 'tenant-123',
 *   uploadedBy: 'user-456',
 *   filename: 'image.jpg',
 *   originalFilename: 'My Image.jpg',
 *   fileSize: 1024000,
 *   mimeType: 'image/jpeg',
 *   assetType: 'image',
 *   storagePath: 'tenant-123/image/2026/01/image.jpg',
 *   publicUrl: 'https://storage.googleapis.com/...',
 * });
 * ```
 */
export async function createMediaRecord(
  input: CreateMediaRecordInput,
): Promise<FirestoreResult<MediaAsset>> {
  const collectionPath = getMediaCollectionPath(input.tenantId);

  const mediaData: Omit<MediaAsset, 'id' | 'created_at' | 'updated_at'> = {
    tenant_id: input.tenantId,
    folder_id: input.folderId ?? null,
    uploaded_by: input.uploadedBy,
    filename: input.filename,
    original_filename: input.originalFilename,
    file_size: input.fileSize,
    mime_type: input.mimeType,
    asset_type: input.assetType,
    status: 'ready' as MediaAssetStatus,
    storage_path: input.storagePath,
    public_url: input.publicUrl ?? null,
    thumbnail_url: input.thumbnailUrl ?? null,
    metadata: input.metadata ?? {},
    blurhash: input.blurhash ?? null,
    alt_text: input.altText ?? null,
    description: input.description ?? null,
    tags: input.tags ?? [],
    collections: input.collections ?? [],
    usage_count: 0,
    last_used_at: null,
  };

  return createDocument(collectionPath, mediaData) as unknown as Promise<
    FirestoreResult<MediaAsset>
  >;
}

/**
 * Create a media asset with file upload
 *
 * @example
 * ```typescript
 * const { data, error } = await createMedia({
 *   tenantId: 'tenant-123',
 *   uploadedBy: 'user-456',
 *   file: fileObject,
 *   altText: 'A beautiful sunset',
 *   tags: ['sunset', 'nature'],
 * });
 * ```
 */
export async function createMedia(input: CreateMediaInput): Promise<FirestoreResult<MediaAsset>> {
  const { tenantId, uploadedBy, file, folderId, altText, description, tags, collections } = input;

  // Determine asset type
  const assetType = getAssetTypeFromMimeType(file.type);
  if (!assetType) {
    return {
      data: null,
      error: new Error(`Unsupported file type: ${file.type}`),
    };
  }

  // Generate storage path
  const storagePath = generateStoragePath(tenantId, assetType, file.name);

  // Upload to storage
  const { url, error: uploadError } = await uploadToStorage(file, storagePath);
  if (uploadError) {
    return { data: null, error: uploadError };
  }

  // Create Firestore record
  return createMediaRecord({
    tenantId,
    uploadedBy,
    filename: storagePath.split('/').pop() || file.name,
    originalFilename: file.name,
    fileSize: file.size,
    mimeType: file.type,
    assetType,
    storagePath,
    publicUrl: url,
    folderId,
    altText,
    description,
    tags,
    collections,
  });
}

/**
 * Get a single media asset by ID
 *
 * @example
 * ```typescript
 * const { data: media, error } = await getMedia('tenant-123', 'media-456');
 * if (media) {
 *   console.log(media.filename);
 * }
 * ```
 */
export async function getMedia(
  tenantId: string,
  mediaId: string,
): Promise<FirestoreResult<MediaAsset>> {
  const collectionPath = getMediaCollectionPath(tenantId);
  return getDocumentById<MediaAsset>(collectionPath, mediaId);
}

/**
 * List media assets for a tenant with optional filtering
 *
 * @example
 * ```typescript
 * const { data: media, error } = await listMedia('tenant-123', {
 *   filters: { type: 'image', status: 'ready' },
 *   sort: { field: 'created_at', direction: 'desc' },
 * });
 * ```
 */
export async function listMedia(
  tenantId: string,
  options: ListMediaOptions = {},
): Promise<FirestoreListResult<MediaAsset>> {
  const collectionPath = getMediaCollectionPath(tenantId);
  const constraints = buildMediaConstraints(options.filters, options.sort);

  return getDocumentsList<MediaAsset>(collectionPath, constraints);
}

/**
 * List media assets with pagination
 *
 * @example
 * ```typescript
 * const { data, hasMore, lastDoc } = await listMediaPaginated('tenant-123', {
 *   filters: { type: 'image' },
 *   pageSize: 20,
 * });
 *
 * // Get next page
 * const nextPage = await listMediaPaginated('tenant-123', {
 *   filters: { type: 'image' },
 *   pageSize: 20,
 *   lastDocument: lastDoc,
 * });
 * ```
 */
export async function listMediaPaginated(
  tenantId: string,
  options: ListMediaOptions = {},
): Promise<FirestorePaginatedResult<MediaAsset>> {
  const collectionPath = getMediaCollectionPath(tenantId);
  const constraints = buildMediaConstraints(options.filters, options.sort);

  return getDocumentsPaginated<MediaAsset>(
    collectionPath,
    constraints,
    options.pageSize ?? 20,
    options.lastDocument,
  );
}

/**
 * Search media by filename or tags
 *
 * @example
 * ```typescript
 * const { data, error } = await searchMedia('tenant-123', 'sunset', 10);
 * ```
 */
export async function searchMedia(
  tenantId: string,
  searchTerm: string,
  maxResults: number = 20,
): Promise<FirestoreListResult<MediaAsset>> {
  const collectionPath = getMediaCollectionPath(tenantId);

  // Firestore prefix search
  const endTerm =
    searchTerm.slice(0, -1) + String.fromCharCode(searchTerm.charCodeAt(searchTerm.length - 1) + 1);

  return getDocumentsList<MediaAsset>(collectionPath, [
    filters.gte('original_filename', searchTerm),
    filters.lt('original_filename', endTerm),
    filters.eq('status', 'ready'),
    limitTo(maxResults),
  ]);
}

/**
 * Get media by folder
 *
 * @example
 * ```typescript
 * const { data, error } = await getMediaByFolder('tenant-123', 'folder-789');
 * ```
 */
export async function getMediaByFolder(
  tenantId: string,
  folderId: string | null,
): Promise<FirestoreListResult<MediaAsset>> {
  const collectionPath = getMediaCollectionPath(tenantId);

  return getDocumentsList<MediaAsset>(collectionPath, [
    filters.eq('folder_id', folderId),
    filters.eq('status', 'ready'),
    sort('created_at', 'desc'),
  ]);
}

/**
 * Get media by tags
 *
 * @example
 * ```typescript
 * const { data, error } = await getMediaByTags('tenant-123', ['nature', 'sunset']);
 * ```
 */
export async function getMediaByTag(
  tenantId: string,
  tag: string,
): Promise<FirestoreListResult<MediaAsset>> {
  const collectionPath = getMediaCollectionPath(tenantId);

  return getDocumentsList<MediaAsset>(collectionPath, [
    filters.contains('tags', tag),
    filters.eq('status', 'ready'),
    sort('created_at', 'desc'),
  ]);
}

/**
 * Update media metadata
 *
 * @example
 * ```typescript
 * const { data, error } = await updateMedia('tenant-123', 'media-456', {
 *   altText: 'Updated alt text',
 *   tags: ['updated', 'tags'],
 * });
 * ```
 */
export async function updateMedia(
  tenantId: string,
  mediaId: string,
  updates: UpdateMediaInput,
): Promise<FirestoreResult<MediaAsset>> {
  const collectionPath = getMediaCollectionPath(tenantId);

  const updateData: Record<string, unknown> = {};

  if (updates.folderId !== undefined) {
    updateData.folder_id = updates.folderId;
  }

  if (updates.altText !== undefined) {
    updateData.alt_text = updates.altText;
  }

  if (updates.description !== undefined) {
    updateData.description = updates.description;
  }

  if (updates.tags !== undefined) {
    updateData.tags = updates.tags;
  }

  if (updates.collections !== undefined) {
    updateData.collections = updates.collections;
  }

  if (updates.metadata !== undefined) {
    updateData.metadata = updates.metadata;
  }

  return updateDocumentById(collectionPath, mediaId, updateData) as unknown as Promise<
    FirestoreResult<MediaAsset>
  >;
}

/**
 * Update media status
 */
export async function updateMediaStatus(
  tenantId: string,
  mediaId: string,
  status: MediaAssetStatus,
): Promise<FirestoreResult<MediaAsset>> {
  const collectionPath = getMediaCollectionPath(tenantId);

  return updateDocumentById(collectionPath, mediaId, {
    status,
  }) as unknown as Promise<FirestoreResult<MediaAsset>>;
}

/**
 * Increment usage count for a media asset
 */
export async function incrementMediaUsage(
  tenantId: string,
  mediaId: string,
): Promise<FirestoreResult<MediaAsset>> {
  const { data: media, error } = await getMedia(tenantId, mediaId);

  if (error || !media) {
    return { data: null, error: error ?? new Error('Media not found') };
  }

  const collectionPath = getMediaCollectionPath(tenantId);

  return updateDocumentById(collectionPath, mediaId, {
    usage_count: media.usage_count + 1,
    last_used_at: new Date().toISOString(),
  }) as unknown as Promise<FirestoreResult<MediaAsset>>;
}

/**
 * Soft delete a media asset (sets status to 'archived')
 *
 * @example
 * ```typescript
 * const { data, error } = await softDeleteMedia('tenant-123', 'media-456');
 * if (!error) {
 *   console.log('Media archived');
 * }
 * ```
 */
export async function softDeleteMedia(
  tenantId: string,
  mediaId: string,
): Promise<FirestoreResult<MediaAsset>> {
  return updateMediaStatus(tenantId, mediaId, 'archived');
}

/**
 * Restore a soft-deleted media asset
 *
 * @example
 * ```typescript
 * const { data, error } = await restoreMedia('tenant-123', 'media-456');
 * ```
 */
export async function restoreMedia(
  tenantId: string,
  mediaId: string,
): Promise<FirestoreResult<MediaAsset>> {
  return updateMediaStatus(tenantId, mediaId, 'ready');
}

/**
 * Hard delete a media asset (removes from Firestore and Storage)
 *
 * @example
 * ```typescript
 * const { error } = await hardDeleteMedia('tenant-123', 'media-456');
 * if (!error) {
 *   console.log('Media permanently deleted');
 * }
 * ```
 */
export async function hardDeleteMedia(
  tenantId: string,
  mediaId: string,
): Promise<{ error: Error | null }> {
  // Get media to find storage path
  const { data: media, error: getError } = await getMedia(tenantId, mediaId);
  if (getError || !media) {
    return { error: getError ?? new Error('Media not found') };
  }

  // Delete from storage
  const { error: storageError } = await deleteFromStorage(media.storage_path);
  if (storageError) {
    // Log but continue with Firestore deletion
    console.error('Failed to delete from storage:', storageError);
  }

  // Delete thumbnail if exists
  if (media.thumbnail_url) {
    const thumbnailPath = `${media.storage_path.replace(/\.[^.]+$/, '')}_thumb.webp`;
    await deleteFromStorage(thumbnailPath);
  }

  // Delete from Firestore
  const collectionPath = getMediaCollectionPath(tenantId);
  return deleteDocumentById(collectionPath, mediaId);
}

/**
 * Get archived (soft-deleted) media for a tenant
 */
export async function getArchivedMedia(tenantId: string): Promise<FirestoreListResult<MediaAsset>> {
  const collectionPath = getMediaCollectionPath(tenantId);

  return getDocumentsList<MediaAsset>(collectionPath, [
    filters.eq('status', 'archived'),
    sort('updated_at', 'desc'),
  ]);
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Build Firestore query constraints from filters and sort options
 */
function buildMediaConstraints(
  mediaFilters?: MediaFilters,
  sortOptions?: MediaSortOptions,
): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];

  // Exclude archived by default
  if (!mediaFilters?.status) {
    constraints.push(filters.neq('status', 'archived'));
  }

  if (mediaFilters) {
    // Type filter
    if (mediaFilters.type) {
      if (Array.isArray(mediaFilters.type)) {
        constraints.push(filters.inArray('asset_type', mediaFilters.type));
      } else {
        constraints.push(filters.eq('asset_type', mediaFilters.type));
      }
    }

    // Status filter
    if (mediaFilters.status) {
      constraints.push(filters.eq('status', mediaFilters.status));
    }

    // Folder filter
    if (mediaFilters.folderId !== undefined) {
      constraints.push(filters.eq('folder_id', mediaFilters.folderId));
    }

    // Collection filter
    if (mediaFilters.collectionId) {
      constraints.push(filters.contains('collections', mediaFilters.collectionId));
    }

    // Tags filter
    if (mediaFilters.tags && mediaFilters.tags.length > 0) {
      // Firestore only supports single array-contains, so filter by first tag
      constraints.push(filters.contains('tags', mediaFilters.tags[0]));
    }

    // Date range filter
    if (mediaFilters.dateRange) {
      constraints.push(filters.gte('created_at', mediaFilters.dateRange.start));
      constraints.push(filters.lte('created_at', mediaFilters.dateRange.end));
    }

    // Size range filter
    if (mediaFilters.sizeRange) {
      if (mediaFilters.sizeRange.min !== undefined) {
        constraints.push(filters.gte('file_size', mediaFilters.sizeRange.min));
      }
      if (mediaFilters.sizeRange.max !== undefined) {
        constraints.push(filters.lte('file_size', mediaFilters.sizeRange.max));
      }
    }

    // Uploaded by filter
    if (mediaFilters.uploadedBy) {
      constraints.push(filters.eq('uploaded_by', mediaFilters.uploadedBy));
    }
  }

  // Apply sort
  if (sortOptions) {
    constraints.push(sort(sortOptions.field, sortOptions.direction));
  } else {
    constraints.push(sort('created_at', 'desc'));
  }

  return constraints;
}

/**
 * Batch update multiple media assets
 */
export async function batchUpdateMedia(
  tenantId: string,
  mediaIds: string[],
  updates: UpdateMediaInput,
): Promise<{ successful: string[]; failed: Array<{ id: string; error: string }> }> {
  const successful: string[] = [];
  const failed: Array<{ id: string; error: string }> = [];

  await Promise.all(
    mediaIds.map(async (mediaId) => {
      const { error } = await updateMedia(tenantId, mediaId, updates);
      if (error) {
        failed.push({ id: mediaId, error: error.message });
      } else {
        successful.push(mediaId);
      }
    }),
  );

  return { successful, failed };
}

/**
 * Batch soft delete multiple media assets
 */
export async function batchSoftDeleteMedia(
  tenantId: string,
  mediaIds: string[],
): Promise<{ successful: string[]; failed: Array<{ id: string; error: string }> }> {
  const successful: string[] = [];
  const failed: Array<{ id: string; error: string }> = [];

  await Promise.all(
    mediaIds.map(async (mediaId) => {
      const { error } = await softDeleteMedia(tenantId, mediaId);
      if (error) {
        failed.push({ id: mediaId, error: error.message });
      } else {
        successful.push(mediaId);
      }
    }),
  );

  return { successful, failed };
}

/**
 * Move media to a different folder
 */
export async function moveMediaToFolder(
  tenantId: string,
  mediaIds: string[],
  folderId: string | null,
): Promise<{ successful: string[]; failed: Array<{ id: string; error: string }> }> {
  return batchUpdateMedia(tenantId, mediaIds, { folderId });
}

/**
 * Add tags to media assets
 */
export async function addTagsToMedia(
  tenantId: string,
  mediaId: string,
  newTags: string[],
): Promise<FirestoreResult<MediaAsset>> {
  const { data: media, error } = await getMedia(tenantId, mediaId);

  if (error || !media) {
    return { data: null, error: error ?? new Error('Media not found') };
  }

  const existingTags = media.tags || [];
  const uniqueTags = [...new Set([...existingTags, ...newTags])];

  return updateMedia(tenantId, mediaId, { tags: uniqueTags });
}

/**
 * Remove tags from media assets
 */
export async function removeTagsFromMedia(
  tenantId: string,
  mediaId: string,
  tagsToRemove: string[],
): Promise<FirestoreResult<MediaAsset>> {
  const { data: media, error } = await getMedia(tenantId, mediaId);

  if (error || !media) {
    return { data: null, error: error ?? new Error('Media not found') };
  }

  const remainingTags = (media.tags || []).filter((tag) => !tagsToRemove.includes(tag));

  return updateMedia(tenantId, mediaId, { tags: remainingTags });
}
