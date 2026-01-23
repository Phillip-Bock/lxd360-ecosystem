/**
 * INSPIRE Asset Library - Firebase Storage Integration
 *
 * Handles file uploads to Firebase Storage with tenant isolation.
 *
 * @module lib/assets/storage
 */

import {
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { getFirebaseDb, getFirebaseStorage } from '@/lib/firebase/client';
import {
  type AssetCategory,
  getAssetCategory,
  getExtensionFromMime,
  isAllowedMimeType,
  isWithinSizeLimit,
} from './mimeTypes';

// =============================================================================
// Types
// =============================================================================

export interface AssetMetadata {
  id: string;
  tenantId: string;
  fileName: string;
  originalFileName: string;
  mimeType: string;
  category: AssetCategory;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  url: string;
  thumbnailUrl?: string;
  altText?: string;
  tags: string[];
  dominantColors?: string[];
  aiProcessed: boolean;
  uploadedBy: string;
  uploadedAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number; // 0-100
  state: 'running' | 'paused' | 'success' | 'error' | 'canceled';
}

export interface UploadResult {
  asset: AssetMetadata;
  storagePath: string;
}

// =============================================================================
// Storage Path Helpers
// =============================================================================

/**
 * Generate storage path for tenant uploads
 * Format: tenants/{tenantId}/uploads/{year}/{month}/{filename}
 */
function getStoragePath(tenantId: string, fileName: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `tenants/${tenantId}/uploads/${year}/${month}/${fileName}`;
}

/**
 * Generate unique filename with timestamp
 */
function generateUniqueFileName(originalName: string, mimeType: string): string {
  const extension = getExtensionFromMime(mimeType) ?? '';
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_');
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${baseName}_${timestamp}_${random}${extension}`;
}

// =============================================================================
// Upload Functions
// =============================================================================

/**
 * Upload a file to Firebase Storage
 */
export async function uploadAsset(
  file: File | Blob,
  tenantId: string,
  userId: string,
  originalFileName: string,
  options?: {
    altText?: string;
    tags?: string[];
    width?: number;
    height?: number;
    onProgress?: (progress: UploadProgress) => void;
  },
): Promise<UploadResult> {
  const mimeType = file instanceof File ? file.type : 'application/octet-stream';

  // Validate MIME type
  if (!isAllowedMimeType(mimeType)) {
    throw new Error(`File type not allowed: ${mimeType}`);
  }

  // Validate file size
  if (!isWithinSizeLimit(mimeType, file.size)) {
    throw new Error('File exceeds size limit');
  }

  const category = getAssetCategory(mimeType);
  if (!category) {
    throw new Error('Unable to determine asset category');
  }

  // Generate unique filename and path
  const fileName = generateUniqueFileName(originalFileName, mimeType);
  const storagePath = getStoragePath(tenantId, fileName);
  const db = getFirebaseDb();
  const storage = getFirebaseStorage();
  const assetId = doc(collection(db, 'temp')).id; // Generate unique ID

  // Create storage reference
  const storageRef = ref(storage, storagePath);

  // Upload file
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: mimeType,
    customMetadata: {
      tenantId,
      assetId,
      uploadedBy: userId,
    },
  });

  // Handle progress
  if (options?.onProgress) {
    uploadTask.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      options.onProgress?.({
        bytesTransferred: snapshot.bytesTransferred,
        totalBytes: snapshot.totalBytes,
        progress,
        state: snapshot.state as UploadProgress['state'],
      });
    });
  }

  // Wait for upload to complete
  await uploadTask;

  // Get download URL
  const url = await getDownloadURL(storageRef);

  // Create asset metadata
  const assetMetadata: AssetMetadata = {
    id: assetId,
    tenantId,
    fileName,
    originalFileName,
    mimeType,
    category,
    size: file.size,
    width: options?.width,
    height: options?.height,
    url,
    altText: options?.altText ?? '',
    tags: options?.tags ?? [],
    aiProcessed: false,
    uploadedBy: userId,
    uploadedAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  // Save metadata to Firestore
  const assetRef = doc(db, 'tenants', tenantId, 'assets', assetId);
  await setDoc(assetRef, assetMetadata);

  return {
    asset: assetMetadata,
    storagePath,
  };
}

/**
 * Delete an asset from storage and Firestore
 */
export async function deleteAsset(
  tenantId: string,
  assetId: string,
  storagePath: string,
): Promise<void> {
  const db = getFirebaseDb();
  const storage = getFirebaseStorage();
  // Delete from Storage
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);

  // Delete from Firestore
  const assetRef = doc(db, 'tenants', tenantId, 'assets', assetId);
  await deleteDoc(assetRef);
}

/**
 * Update asset metadata
 */
export async function updateAssetMetadata(
  tenantId: string,
  assetId: string,
  updates: Partial<Pick<AssetMetadata, 'altText' | 'tags' | 'aiProcessed' | 'dominantColors'>>,
): Promise<void> {
  const db = getFirebaseDb();
  const assetRef = doc(db, 'tenants', tenantId, 'assets', assetId);
  await setDoc(
    assetRef,
    {
      ...updates,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

// =============================================================================
// Export
// =============================================================================

export { getStoragePath, generateUniqueFileName };
