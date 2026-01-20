/**
 * =============================================================================
 * LXP360-SaaS | API Cache Utilities
 * =============================================================================
 *
 * Centralized caching for frequently accessed data.
 * Uses Next.js unstable_cache for server-side caching with tags.
 *
 * TODO(LXD-400): Implement with Firestore
 */

import { revalidateTag, unstable_cache } from 'next/cache';

// =============================================================================
// CACHE CONFIGURATION
// =============================================================================

/**
 * Cache duration presets (in seconds)
 */
export const CacheDuration = {
  /** 1 minute - for rapidly changing data */
  SHORT: 60,
  /** 5 minutes - for moderately dynamic data */
  MEDIUM: 300,
  /** 30 minutes - for semi-static data */
  LONG: 1800,
  /** 1 hour - for static content */
  VERY_LONG: 3600,
  /** 24 hours - for rarely changing data */
  DAY: 86400,
} as const;

/**
 * Cache tags for fine-grained invalidation
 */
export const CacheTags = {
  COURSES: 'courses',
  USERS: 'users',
  PROFILES: 'profiles',
  ORGANIZATIONS: 'organizations',
  CONTENT: 'content',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
} as const;

// =============================================================================
// PLACEHOLDER TYPES (until Firestore implementation)
// =============================================================================

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  duration: number;
  level: string;
  status: string;
}

interface CourseWithModules extends Course {
  modules: Array<{
    id: string;
    title: string;
    order: number;
    lessons: Array<{
      id: string;
      title: string;
      type: string;
      duration: number;
      order: number;
    }>;
  }>;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface AnalyticsSummary {
  total_users: number;
  active_users: number;
  completions: number;
  average_score: number;
}

// =============================================================================
// CACHED DATA FETCHERS (STUBS)
// =============================================================================

/**
 * Get cached published courses
 * TODO(LXD-400): Implement with Firestore
 */
export const getCachedCourses = unstable_cache(
  async (): Promise<Course[]> => {
    // Stub - will be implemented with Firestore
    return [];
  },
  ['published-courses'],
  {
    revalidate: CacheDuration.MEDIUM,
    tags: [CacheTags.COURSES],
  },
);

/**
 * Get cached course by slug
 * TODO(LXD-400): Implement with Firestore
 */
export const getCachedCourseBySlug = (slug: string): Promise<CourseWithModules | null> =>
  unstable_cache(
    async (): Promise<CourseWithModules | null> => {
      // Stub - will be implemented with Firestore
      void slug; // Acknowledge parameter
      return null;
    },
    [`course-${slug}`],
    {
      revalidate: CacheDuration.MEDIUM,
      tags: [CacheTags.COURSES, `course-${slug}`],
    },
  )();

/**
 * Get cached user profile
 * TODO(LXD-400): Implement with Firestore
 */
export const getCachedUserProfile = (userId: string): Promise<Profile | null> =>
  unstable_cache(
    async (): Promise<Profile | null> => {
      // Stub - will be implemented with Firestore
      void userId; // Acknowledge parameter
      return null;
    },
    [`profile-${userId}`],
    {
      revalidate: CacheDuration.SHORT,
      tags: [CacheTags.PROFILES, `profile-${userId}`],
    },
  )();

/**
 * Get cached organization details
 * TODO(LXD-400): Implement with Firestore
 */
export const getCachedOrganization = (orgId: string): Promise<Organization | null> =>
  unstable_cache(
    async (): Promise<Organization | null> => {
      // Stub - will be implemented with Firestore
      void orgId; // Acknowledge parameter
      return null;
    },
    [`org-${orgId}`],
    {
      revalidate: CacheDuration.LONG,
      tags: [CacheTags.ORGANIZATIONS, `org-${orgId}`],
    },
  )();

/**
 * Get cached analytics summary
 * TODO(LXD-400): Implement with Firestore/BigQuery
 */
export const getCachedAnalyticsSummary = (
  orgId: string,
  period: string = '30d',
): Promise<AnalyticsSummary | null> =>
  unstable_cache(
    async (): Promise<AnalyticsSummary | null> => {
      // Stub - will be implemented with Firestore/BigQuery
      void orgId; // Acknowledge parameter
      void period; // Acknowledge parameter
      return null;
    },
    [`analytics-${orgId}-${period}`],
    {
      revalidate: CacheDuration.MEDIUM,
      tags: [CacheTags.ANALYTICS, `analytics-${orgId}`],
    },
  )();

// =============================================================================
// CACHE INVALIDATION
// =============================================================================

/**
 * Revalidate courses cache
 * Call after creating, updating, or deleting courses
 */
export async function revalidateCourses(): Promise<void> {
  revalidateTag(CacheTags.COURSES);
}

/**
 * Revalidate specific course
 */
export async function revalidateCourse(slug: string): Promise<void> {
  revalidateTag(`course-${slug}`);
}

/**
 * Revalidate user profile cache
 * Call after profile updates
 */
export async function revalidateProfile(userId: string): Promise<void> {
  revalidateTag(`profile-${userId}`);
}

/**
 * Revalidate all profiles
 */
export async function revalidateAllProfiles(): Promise<void> {
  revalidateTag(CacheTags.PROFILES);
}

/**
 * Revalidate organization cache
 */
export async function revalidateOrganization(orgId: string): Promise<void> {
  revalidateTag(`org-${orgId}`);
}

/**
 * Revalidate analytics cache
 */
export async function revalidateAnalytics(orgId: string): Promise<void> {
  revalidateTag(`analytics-${orgId}`);
}

/**
 * Revalidate all caches of a specific tag
 */
export async function revalidateByTag(tag: keyof typeof CacheTags): Promise<void> {
  revalidateTag(CacheTags[tag]);
}

// =============================================================================
// CLIENT-SIDE CACHE HELPERS
// =============================================================================

/**
 * Simple in-memory cache for client-side use
 */
class ClientCache<T> {
  private cache = new Map<string, { data: T; expiry: number }>();

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  set(key: string, data: T, ttlMs: number = 60000): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Export singleton instance for client-side caching
 */
export const clientCache = new ClientCache<unknown>();

// =============================================================================
// CACHE UTILITIES
// =============================================================================

/**
 * Generate a cache key from parameters
 */
export function generateCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${String(params[key])}`)
    .join('&');
  return `${prefix}:${sortedParams}`;
}

/**
 * Wrapper for cached fetch with automatic revalidation
 */
export function createCachedFetcher<T>(
  fetcher: () => Promise<T>,
  keyParts: string[],
  options: {
    revalidate?: number;
    tags?: string[];
  } = {},
): () => Promise<T> {
  return unstable_cache(fetcher, keyParts, {
    revalidate: options.revalidate ?? CacheDuration.MEDIUM,
    tags: options.tags ?? [],
  });
}
