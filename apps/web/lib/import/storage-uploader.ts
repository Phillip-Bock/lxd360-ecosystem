/**
 * Storage Uploader for Course Packages
 *
 * Uploads course ZIP files and PDFs to Firebase Storage.
 * Extracts ZIP contents and uploads individual files for web delivery.
 */

import type { Storage } from 'firebase-admin/storage';
import type JSZip from 'jszip';
import type { UploadResult } from './types';

/**
 * MIME type mapping for common file extensions
 */
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.htm': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.swf': 'application/x-shockwave-flash',
  '.zip': 'application/zip',
};

/**
 * Get MIME type from file extension
 */
function getMimeType(filename: string): string {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Upload a course package to Firebase Storage
 *
 * For ZIP files: extracts contents and uploads individual files
 * For PDFs: uploads directly
 *
 * Storage structure: gs://bucket/{tenantId}/{courseId}/
 */
export async function uploadCoursePackage(
  storage: Storage,
  fileBuffer: Buffer,
  filename: string,
  tenantId: string,
  courseId: string,
  JSZipClass: typeof JSZip,
): Promise<UploadResult> {
  const bucket = storage.bucket();
  const storagePath = `courses/${tenantId}/${courseId}`;

  // Check if this is a PDF
  if (filename.toLowerCase().endsWith('.pdf')) {
    return uploadPdf(bucket, fileBuffer, filename, storagePath);
  }

  // Handle ZIP files
  return uploadZipContents(bucket, fileBuffer, storagePath, JSZipClass);
}

/**
 * Upload a PDF file directly
 */
async function uploadPdf(
  bucket: ReturnType<Storage['bucket']>,
  fileBuffer: Buffer,
  filename: string,
  storagePath: string,
): Promise<UploadResult> {
  const pdfPath = `${storagePath}/${filename}`;
  const file = bucket.file(pdfPath);

  await file.save(fileBuffer, {
    contentType: 'application/pdf',
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });

  // Note: Public access is managed at bucket level via IAM (uniform bucket-level access)
  const storageUrl = `https://storage.googleapis.com/${bucket.name}/${pdfPath}`;

  return {
    storagePath: pdfPath,
    storageUrl,
    fileSize: fileBuffer.length,
  };
}

/**
 * Extract and upload ZIP contents
 */
async function uploadZipContents(
  bucket: ReturnType<Storage['bucket']>,
  fileBuffer: Buffer,
  storagePath: string,
  JSZipClass: typeof JSZip,
): Promise<UploadResult> {
  const zip = await JSZipClass.loadAsync(fileBuffer);
  const fileNames = Object.keys(zip.files);

  let totalSize = 0;
  const uploadPromises: Promise<void>[] = [];

  // Find the root directory (if files are nested)
  const rootPrefix = findRootPrefix(fileNames);

  for (const fileName of fileNames) {
    const file = zip.files[fileName];

    // Skip directories
    if (file.dir) continue;

    // Remove root prefix if present
    let relativePath = fileName;
    if (rootPrefix && fileName.startsWith(rootPrefix)) {
      relativePath = fileName.substring(rootPrefix.length);
    }

    // Skip empty paths
    if (!relativePath) continue;

    const uploadPath = `${storagePath}/${relativePath}`;
    const mimeType = getMimeType(relativePath);

    const uploadPromise = (async () => {
      const content = await file.async('nodebuffer');
      totalSize += content.length;

      const bucketFile = bucket.file(uploadPath);
      await bucketFile.save(content, {
        contentType: mimeType,
        metadata: {
          cacheControl: getCacheControl(mimeType),
        },
      });

      // Note: Public access is managed at bucket level via IAM (uniform bucket-level access)
    })();

    uploadPromises.push(uploadPromise);
  }

  // Upload files in batches to avoid overwhelming the API
  const batchSize = 10;
  for (let i = 0; i < uploadPromises.length; i += batchSize) {
    const batch = uploadPromises.slice(i, i + batchSize);
    await Promise.all(batch);
  }

  const storageUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

  return {
    storagePath,
    storageUrl,
    fileSize: totalSize,
  };
}

/**
 * Find common root prefix in file paths
 * If all files are in a single directory, return that directory name
 */
function findRootPrefix(fileNames: string[]): string {
  if (fileNames.length === 0) return '';

  // Filter out directories
  const files = fileNames.filter((f) => !f.endsWith('/'));
  if (files.length === 0) return '';

  // Check if all files share a common root directory
  const firstParts = files[0].split('/');
  if (firstParts.length < 2) return '';

  const potentialRoot = `${firstParts[0]}/`;

  // Check if all files start with this root
  const allMatch = files.every((f) => f.startsWith(potentialRoot));

  return allMatch ? potentialRoot : '';
}

/**
 * Get appropriate cache control header based on content type
 */
function getCacheControl(mimeType: string): string {
  // Static assets can be cached for a year
  if (
    mimeType.startsWith('image/') ||
    mimeType.startsWith('font/') ||
    mimeType === 'application/javascript' ||
    mimeType === 'text/css'
  ) {
    return 'public, max-age=31536000, immutable';
  }

  // HTML files should be revalidated
  if (mimeType === 'text/html') {
    return 'public, max-age=0, must-revalidate';
  }

  // Default caching
  return 'public, max-age=86400';
}

/**
 * Upload a single file to storage
 */
export async function uploadSingleFile(
  storage: Storage,
  fileBuffer: Buffer,
  storagePath: string,
  mimeType: string,
): Promise<UploadResult> {
  const bucket = storage.bucket();
  const file = bucket.file(storagePath);

  await file.save(fileBuffer, {
    contentType: mimeType,
    metadata: {
      cacheControl: getCacheControl(mimeType),
    },
  });

  // Note: Public access is managed at bucket level via IAM (uniform bucket-level access)
  const storageUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

  return {
    storagePath,
    storageUrl,
    fileSize: fileBuffer.length,
  };
}

/**
 * Delete course content from storage
 */
export async function deleteCourseContent(storage: Storage, storagePath: string): Promise<void> {
  const bucket = storage.bucket();

  // Delete all files under this path
  const [files] = await bucket.getFiles({ prefix: storagePath });

  if (files.length > 0) {
    const deletePromises = files.map((file) => file.delete());
    await Promise.all(deletePromises);
  }
}
