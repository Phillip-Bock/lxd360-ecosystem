import { Storage } from '@google-cloud/storage';

// Initialize GCS client
// Uses GOOGLE_APPLICATION_CREDENTIALS env var or default credentials
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID || 'lxd-saas-dev',
});

export const TENANT_ASSETS_BUCKET = 'lxd360-tenant-assets';
export const bucket = storage.bucket(TENANT_ASSETS_BUCKET);

/**
 * Allowed file types for character uploads
 */
export const ALLOWED_MODEL_TYPES = [
  'model/gltf-binary', // .glb
  'application/octet-stream', // Generic binary (GLB often comes as this)
];

export const ALLOWED_EXTENSIONS = ['.glb'];

/**
 * Max file size: 20MB
 */
export const MAX_FILE_SIZE = 20 * 1024 * 1024;

/**
 * Generate the storage path for a tenant's character model
 */
export function getTenantModelPath(tenantId: string, personaId: string): string {
  return `${tenantId}/models/${personaId}.glb`;
}

/**
 * Generate a signed URL for uploading
 */
export async function generateUploadUrl(
  tenantId: string,
  personaId: string,
  contentType: string = 'application/octet-stream',
): Promise<{ uploadUrl: string; publicUrl: string; expiresAt: Date }> {
  const filePath = getTenantModelPath(tenantId, personaId);
  const file = bucket.file(filePath);

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const [uploadUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: expiresAt,
    contentType,
    extensionHeaders: {
      'x-goog-content-length-range': `0,${MAX_FILE_SIZE}`,
    },
  });

  const publicUrl = `https://storage.googleapis.com/${TENANT_ASSETS_BUCKET}/${filePath}`;

  return { uploadUrl, publicUrl, expiresAt };
}

/**
 * Check if a tenant has a custom character for a persona
 */
export async function checkTenantCharacterExists(
  tenantId: string,
  personaId: string,
): Promise<boolean> {
  const filePath = getTenantModelPath(tenantId, personaId);
  const file = bucket.file(filePath);
  const [exists] = await file.exists();
  return exists;
}

/**
 * Delete a tenant's custom character
 */
export async function deleteTenantCharacter(tenantId: string, personaId: string): Promise<void> {
  const filePath = getTenantModelPath(tenantId, personaId);
  const file = bucket.file(filePath);
  await file.delete({ ignoreNotFound: true });
}

/**
 * Get metadata for a tenant's custom character
 */
export async function getTenantCharacterMetadata(
  tenantId: string,
  personaId: string,
): Promise<{
  exists: boolean;
  size?: number;
  updated?: Date;
  publicUrl?: string;
}> {
  const filePath = getTenantModelPath(tenantId, personaId);
  const file = bucket.file(filePath);

  try {
    const [metadata] = await file.getMetadata();
    return {
      exists: true,
      size: parseInt(metadata.size as string, 10),
      updated: new Date(metadata.updated as string),
      publicUrl: `https://storage.googleapis.com/${TENANT_ASSETS_BUCKET}/${filePath}`,
    };
  } catch {
    return { exists: false };
  }
}

/**
 * List all custom characters for a tenant
 */
export async function listTenantCharacters(tenantId: string): Promise<
  {
    personaId: string;
    size: number;
    updated: Date;
    publicUrl: string;
  }[]
> {
  const prefix = `${tenantId}/models/`;
  const [files] = await bucket.getFiles({ prefix });

  return files.map((file) => {
    const personaId = file.name.replace(prefix, '').replace('.glb', '');
    return {
      personaId,
      size: parseInt(file.metadata.size as string, 10),
      updated: new Date(file.metadata.updated as string),
      publicUrl: `https://storage.googleapis.com/${TENANT_ASSETS_BUCKET}/${file.name}`,
    };
  });
}
