/**
 * =============================================================================
 * LXP360-SaaS | Caching Utilities
 * =============================================================================
 *
 * @fileoverview Server-side caching utilities for API responses
 *
 * @description
 * Provides caching wrappers using Next.js unstable_cache:
 * - Cache tags for invalidation
 * - Revalidation strategies
 * - Cache key generation
 *
 * =============================================================================
 */

import { unstable_cache } from 'next/cache';
import { cache } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface CacheOptions {
  /** Cache tags for revalidation */
  tags?: string[];
  /** Revalidation period in seconds */
  revalidate?: number | false;
}

// ============================================================================
// Cache Tags
// ============================================================================

/**
 * Standard cache tags for common data types
 */
export const CACHE_TAGS = {
  // User-related
  USER: 'user',
  USER_PROFILE: 'user-profile',
  USER_PREFERENCES: 'user-preferences',

  // Course-related
  COURSES: 'courses',
  COURSE_DETAIL: 'course-detail',
  COURSE_PROGRESS: 'course-progress',
  LESSONS: 'lessons',

  // Organization-related
  ORGANIZATION: 'organization',
  TEAM: 'team',
  MEMBERS: 'members',

  // System-related
  CONFIG: 'config',
  SETTINGS: 'settings',
  FEATURES: 'features',

  // Analytics
  ANALYTICS: 'analytics',
  REPORTS: 'reports',
} as const;

// ============================================================================
// Revalidation Periods
// ============================================================================

/**
 * Standard revalidation periods in seconds
 */
export const REVALIDATE = {
  /** Real-time data (no cache) */
  NONE: 0,
  /** Frequently changing data (1 minute) */
  FAST: 60,
  /** Moderately changing data (5 minutes) */
  MODERATE: 300,
  /** Slowly changing data (1 hour) */
  SLOW: 3600,
  /** Rarely changing data (1 day) */
  RARE: 86400,
  /** Static data (1 week) */
  STATIC: 604800,
} as const;

// ============================================================================
// Cache Key Generation
// ============================================================================

/**
 * Generate a cache key from parts
 */
export function createCacheKey(...parts: (string | number | undefined)[]): string {
  return parts.filter(Boolean).join(':');
}

/**
 * Generate a user-specific cache key
 */
export function userCacheKey(userId: string, ...parts: string[]): string {
  return createCacheKey('user', userId, ...parts);
}

/**
 * Generate a course-specific cache key
 */
export function courseCacheKey(courseId: string, ...parts: string[]): string {
  return createCacheKey('course', courseId, ...parts);
}

/**
 * Generate an organization-specific cache key
 */
export function orgCacheKey(orgId: string, ...parts: string[]): string {
  return createCacheKey('org', orgId, ...parts);
}

// ============================================================================
// Cached Data Fetchers
// ============================================================================

/**
 * Create a cached version of a data fetcher
 */
export function createCachedFetcher<T, Args extends unknown[]>(
  fetcher: (...args: Args) => Promise<T>,
  keyParts: string[],
  options: CacheOptions = {},
): (...args: Args) => Promise<T> {
  const { tags = [], revalidate = REVALIDATE.MODERATE } = options;

  return unstable_cache(fetcher, keyParts, {
    tags,
    revalidate,
  });
}

/**
 * React cache wrapper for deduplication within a request
 */
export function createRequestCache<T, Args extends unknown[]>(
  fetcher: (...args: Args) => Promise<T>,
): (...args: Args) => Promise<T> {
  return cache(fetcher);
}

// ============================================================================
// Example Cached Fetchers
// ============================================================================

/**
 * Example: Cached course list fetcher
 * Usage: const courses = await getCachedCourses()
 */
export const getCachedCourses = createCachedFetcher(
  async () => {
    // Replace with actual database query
    // const courses = await db.course.findMany({ where: { status: 'published' } })
    return [];
  },
  ['courses', 'list'],
  {
    tags: [CACHE_TAGS.COURSES],
    revalidate: REVALIDATE.FAST, // 1 minute
  },
);

/**
 * Example: Cached user profile fetcher
 */
export function getCachedUserProfile(userId: string) {
  return createCachedFetcher(
    async () => {
      // Replace with actual database query
      // const profile = await db.profile.findUnique({ where: { userId } })
      return null;
    },
    ['user', 'profile', userId],
    {
      tags: [CACHE_TAGS.USER_PROFILE, `user:${userId}`],
      revalidate: REVALIDATE.MODERATE, // 5 minutes
    },
  )();
}

/**
 * Example: Cached system config
 */
export const getCachedSystemConfig = createCachedFetcher(
  async () => {
    // Replace with actual config fetch
    return {
      maintenanceMode: false,
      features: {},
    };
  },
  ['system', 'config'],
  {
    tags: [CACHE_TAGS.CONFIG],
    revalidate: REVALIDATE.SLOW, // 1 hour
  },
);

// ============================================================================
// Cache Invalidation Helpers
// ============================================================================

/**
 * Get tags to invalidate for a user
 */
export function getUserInvalidationTags(userId: string): string[] {
  return [CACHE_TAGS.USER, CACHE_TAGS.USER_PROFILE, `user:${userId}`];
}

/**
 * Get tags to invalidate for a course
 */
export function getCourseInvalidationTags(courseId: string): string[] {
  return [CACHE_TAGS.COURSES, CACHE_TAGS.COURSE_DETAIL, `course:${courseId}`];
}

/**
 * Get tags to invalidate for an organization
 */
export function getOrgInvalidationTags(orgId: string): string[] {
  return [CACHE_TAGS.ORGANIZATION, CACHE_TAGS.MEMBERS, `org:${orgId}`];
}

// ============================================================================
// Exports
// ============================================================================
// Types are already exported inline above
