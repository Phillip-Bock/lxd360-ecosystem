/**
 * GCP Cloud Storage bucket configuration
 * Multi-tenant media storage with tenant isolation via {orgId}/ prefix
 */

export const STORAGE_BUCKETS = {
  /**
   * STUDIO MEDIA - Multi-tenant course authoring assets
   * Structure: {orgId}/courses/{courseId}/[videos|images|audio|documents|scorm]/
   * Access: Private - authenticated course authors only
   */
  STUDIO: 'lxd360-studio-media',

  /**
   * IGNITE MEDIA - Multi-tenant learner content
   * Structure: {orgId}/learners/{userId}/[submissions|certificates|profile]/
   * Access: Private - authenticated learners (own data only)
   */
  IGNITE: 'lxd360-ignite-media',

  /**
   * COMPANY MEDIA - LXD360 LLC marketing assets
   * Structure: [marketing|blog|podcast|products|team]/
   * Access: Public (CDN)
   */
  COMPANY: 'lxd360-company-media',

  /**
   * SHARED MEDIA - Platform-wide assets
   * Structure: [avatars|logos|icons|placeholders|brand]/
   * Access: Public (CDN)
   */
  SHARED: 'lxd360-shared-media',
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

/**
 * Get the public URL for a file in a public bucket
 */
export function getPublicUrl(bucket: 'COMPANY' | 'SHARED', path: string): string {
  const bucketName = STORAGE_BUCKETS[bucket];
  return `https://storage.googleapis.com/${bucketName}/${path}`;
}

/**
 * Build a tenant-scoped storage path
 */
export function getTenantPath(bucket: 'STUDIO' | 'IGNITE', orgId: string, subPath: string): string {
  return `${orgId}/${subPath}`;
}

/**
 * Storage path builders for common use cases
 */
export const STORAGE_PATHS = {
  // STUDIO paths (multi-tenant)
  courseAsset: (orgId: string, courseId: string, type: string, filename: string) =>
    `${orgId}/courses/${courseId}/${type}/${filename}`,

  orgAsset: (orgId: string, filename: string) => `${orgId}/assets/${filename}`,

  tempUpload: (orgId: string, filename: string) => `tmp/${orgId}/${filename}`,

  // IGNITE paths (multi-tenant)
  learnerSubmission: (orgId: string, userId: string, filename: string) =>
    `${orgId}/learners/${userId}/submissions/${filename}`,

  learnerCertificate: (orgId: string, userId: string, filename: string) =>
    `${orgId}/learners/${userId}/certificates/${filename}`,

  learnerProfile: (orgId: string, userId: string, filename: string) =>
    `${orgId}/learners/${userId}/profile/${filename}`,

  orgBranding: (orgId: string, filename: string) => `${orgId}/branding/${filename}`,

  // COMPANY paths (single tenant - LXD360)
  marketing: (category: string, filename: string) => `marketing/${category}/${filename}`,

  blog: (postId: string, filename: string) => `blog/${postId}/${filename}`,

  podcast: (episodeId: string, filename: string) => `podcast/episodes/${episodeId}/${filename}`,

  product: (productId: string, filename: string) => `products/${productId}/${filename}`,

  // SHARED paths (platform-wide)
  avatar: (filename: string) => `avatars/${filename}`,

  defaultAvatar: (filename: string) => `avatars/defaults/${filename}`,

  logo: (filename: string) => `logos/${filename}`,

  placeholder: (filename: string) => `placeholders/${filename}`,

  brandAsset: (filename: string) => `brand/${filename}`,
} as const;
