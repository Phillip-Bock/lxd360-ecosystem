/**
 * =============================================================================
 * LXP360-SaaS | SEO Metadata Utilities
 * =============================================================================
 *
 * @fileoverview Utilities for generating SEO-optimized metadata
 *
 * @description
 * Provides helpers for generating consistent, SEO-optimized metadata:
 * - Page-specific metadata generation
 * - Default metadata template
 * - OpenGraph image generation
 * - Twitter card metadata
 * - Canonical URL generation
 *
 * =============================================================================
 */

import type { Metadata } from 'next';

// ============================================================================
// Types
// ============================================================================

export interface PageMetadataOptions {
  /** Page title (will be templated with site name) */
  title: string;
  /** Page description (150-160 characters recommended) */
  description: string;
  /** Page keywords (optional, less important for SEO now) */
  keywords?: string[];
  /** Canonical URL path (e.g., '/courses/react-basics') */
  path?: string;
  /** OpenGraph image URL or path */
  ogImage?: string;
  /** Whether to index this page */
  noIndex?: boolean;
  /** Whether to follow links on this page */
  noFollow?: boolean;
  /** Page type for OpenGraph */
  type?: 'website' | 'article' | 'profile' | 'product';
  /** Article-specific metadata */
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  /** Custom OpenGraph metadata */
  openGraph?: Partial<Metadata['openGraph']>;
  /** Custom Twitter metadata */
  twitter?: Partial<Metadata['twitter']>;
}

export interface CourseMetadataOptions {
  /** Course title */
  title: string;
  /** Course description */
  description: string;
  /** Course slug for URL */
  slug: string;
  /** Course thumbnail image */
  image?: string;
  /** Course instructor */
  instructor?: string;
  /** Course duration (e.g., '4 hours') */
  duration?: string;
  /** Course level (Beginner, Intermediate, Advanced) */
  level?: string;
  /** Course category */
  category?: string;
  /** Course price (for product schema) */
  price?: {
    amount: number;
    currency: string;
  };
  /** Course rating */
  rating?: {
    value: number;
    count: number;
  };
}

// ============================================================================
// Constants
// ============================================================================

const SITE_NAME = 'LXD360';
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lxd360.com';
const DEFAULT_OG_IMAGE = '/og-default.png';
const TWITTER_HANDLE = '@LXD360';

const DEFAULT_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'LXD360 - Neuroscience-Informed Learning Experience Platform',
    template: '%s | LXD360',
  },
  description:
    "Transform workforce development with LXD360's unified learning ecosystem. AI-powered content creation, INSPIRE™ framework, and verifiable ROI analytics.",
  keywords: [
    'LMS',
    'LXP',
    'learning experience platform',
    'AI learning',
    'corporate training',
    'neuroscience learning',
    'adaptive learning',
    'learning analytics',
  ],
  authors: [{ name: 'LXD360' }],
  creator: 'LXD360',
  publisher: 'LXD360',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: SITE_NAME,
    title: 'LXD360 - Neuroscience-Informed Learning Experience Platform',
    description:
      'Unify your LMS, LXP, and authoring tools. AI-powered learning with the INSPIRE™ framework.',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'LXD360 Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: 'LXD360 - Neuroscience-Informed Learning Platform',
    description:
      'AI-powered learning ecosystem with VR/AR, adaptive pathways, and transparent analytics.',
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate canonical URL from path
 */
export function getCanonicalUrl(path?: string): string {
  if (!path) return SITE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

/**
 * Generate full OpenGraph image URL
 */
export function getOgImageUrl(image?: string): string {
  if (!image) return `${SITE_URL}${DEFAULT_OG_IMAGE}`;
  if (image.startsWith('http')) return image;
  return `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`;
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateDescription(text: string, maxLength = 160): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3).trim()}...`;
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Generate metadata for a page
 */
export function generatePageMetadata(options: PageMetadataOptions): Metadata {
  const {
    title,
    description,
    keywords,
    path,
    ogImage,
    noIndex = false,
    noFollow = false,
    type = 'website',
    article,
    openGraph: customOpenGraph,
    twitter: customTwitter,
  } = options;

  const canonical = getCanonicalUrl(path);
  const ogImageUrl = getOgImageUrl(ogImage);
  const truncatedDescription = truncateDescription(description);

  // Build base openGraph object
  const baseOpenGraph = {
    type,
    title,
    description: truncatedDescription,
    url: canonical,
    siteName: SITE_NAME,
    locale: 'en_US',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
    // Add article-specific properties if applicable
    ...(article && type === 'article'
      ? {
          publishedTime: article.publishedTime,
          modifiedTime: article.modifiedTime,
          authors: article.author ? [article.author] : undefined,
          section: article.section,
          tags: article.tags,
        }
      : {}),
  };

  // Merge with custom openGraph
  const finalOpenGraph = {
    ...baseOpenGraph,
    ...customOpenGraph,
  } as Metadata['openGraph'];

  const metadata: Metadata = {
    title,
    description: truncatedDescription,
    keywords: keywords?.join(', '),
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical,
    },
    openGraph: finalOpenGraph,
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title,
      description: truncatedDescription,
      images: [ogImageUrl],
      ...customTwitter,
    },
  };

  return metadata;
}

/**
 * Generate metadata for a course page
 */
export function generateCourseMetadata(options: CourseMetadataOptions): Metadata {
  const { title, description, slug, image, instructor, duration, level, category } = options;

  const keywords = [
    title,
    category,
    level,
    'online course',
    'learning',
    'training',
    'LXD360',
  ].filter(Boolean) as string[];

  return generatePageMetadata({
    title: `${title} - Online Course`,
    description:
      `${description} ${duration ? `Duration: ${duration}.` : ''} ${level ? `Level: ${level}.` : ''} ${instructor ? `Taught by ${instructor}.` : ''}`.trim(),
    keywords,
    path: `/courses/${slug}`,
    ogImage: image,
    type: 'website',
  });
}

/**
 * Merge metadata with defaults
 */
export function mergeMetadata(customMetadata: Partial<Metadata>): Metadata {
  return {
    ...DEFAULT_METADATA,
    ...customMetadata,
    openGraph: {
      ...DEFAULT_METADATA.openGraph,
      ...(customMetadata.openGraph || {}),
    },
    twitter: {
      ...DEFAULT_METADATA.twitter,
      ...(customMetadata.twitter || {}),
    },
  };
}

/**
 * Get default metadata (for root layout)
 */
export function getDefaultMetadata(): Metadata {
  return DEFAULT_METADATA;
}

// ============================================================================
// Exports
// ============================================================================

export { DEFAULT_METADATA, SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE, TWITTER_HANDLE };
