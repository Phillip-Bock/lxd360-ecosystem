export * from './types';

import type {
  AboutPage,
  ContentImage,
  Course,
  CourseListItem,
  FooterData,
  HomePage,
  SiteSettings,
} from './types';

// ============================================================================
// Image URL Builder (stub - returns placeholder or direct URL)
// ============================================================================

/**
 * Generate image URL from content image object
 * TODO(LXD-401): Replace with Firebase Storage URL generation
 */
export function urlFor(image: ContentImage | undefined): {
  width: (w: number) => { height: (h: number) => { url: () => string } };
  url: () => string;
} {
  const imageUrl = image?.asset?.url || '/placeholder.jpg';

  return {
    width: (_w: number) => ({
      height: (_h: number) => ({
        url: () => imageUrl,
      }),
    }),
    url: () => imageUrl,
  };
}

// ============================================================================
// Data Fetching Stubs
// TODO(LXD-401): Replace with Firestore queries
// ============================================================================

/**
 * Get home page content
 */
export async function getHomePage(): Promise<HomePage | null> {
  // TODO(LXD-401): Fetch from Firestore
  return null;
}

/**
 * Get site settings
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  // TODO(LXD-401): Fetch from Firestore
  return null;
}

/**
 * Get footer data
 */
export async function getFooter(): Promise<FooterData | null> {
  // TODO(LXD-401): Fetch from Firestore
  return null;
}

/**
 * Get about page content
 */
export async function getAboutPage(): Promise<AboutPage | null> {
  // TODO(LXD-401): Fetch from Firestore
  return null;
}

/**
 * Get all published courses
 */
export async function getAllCourses(): Promise<CourseListItem[]> {
  // TODO(LXD-401): Fetch from Firestore
  return [];
}

/**
 * Get course by slug
 */
export async function getCourseBySlug(_slug: string): Promise<Course | null> {
  // TODO(LXD-401): Fetch from Firestore
  return null;
}
