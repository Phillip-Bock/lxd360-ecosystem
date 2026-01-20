import type { MetadataRoute } from 'next';

// ============================================================================
// Configuration
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lxd360.com';

// ============================================================================
// Static Pages
// ============================================================================

const STATIC_PAGES: Array<{
  url: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  // Home
  { url: '', changeFrequency: 'weekly', priority: 1.0 },

  // Platform pages
  { url: '/platform', changeFrequency: 'weekly', priority: 0.9 },
  { url: '/platform/inspire', changeFrequency: 'weekly', priority: 0.8 },
  { url: '/platform/analytics', changeFrequency: 'weekly', priority: 0.8 },
  { url: '/platform/integrations', changeFrequency: 'weekly', priority: 0.8 },
  { url: '/features', changeFrequency: 'weekly', priority: 0.9 },

  // Products
  { url: '/product-lxp360', changeFrequency: 'weekly', priority: 0.9 },
  { url: '/product-inspire-studio', changeFrequency: 'weekly', priority: 0.9 },
  { url: '/nexus', changeFrequency: 'weekly', priority: 0.9 },

  // Pricing
  { url: '/pricing', changeFrequency: 'weekly', priority: 0.9 },

  // Industry pages
  { url: '/industries/healthcare', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/industries/aerospace', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/industries/manufacturing', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/industries/defense', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/industries/enterprise', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/industries/government', changeFrequency: 'monthly', priority: 0.8 },

  // Use cases
  { url: '/use-cases', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/use-cases/employee-onboarding', changeFrequency: 'monthly', priority: 0.7 },

  // Compliance & Security
  { url: '/compliance', changeFrequency: 'weekly', priority: 0.9 },
  { url: '/security', changeFrequency: 'monthly', priority: 0.8 },

  // Resources
  { url: '/resources', changeFrequency: 'weekly', priority: 0.7 },
  { url: '/resources/case-studies', changeFrequency: 'weekly', priority: 0.7 },
  { url: '/resources/webinars', changeFrequency: 'weekly', priority: 0.6 },
  { url: '/blog', changeFrequency: 'daily', priority: 0.7 },
  { url: '/support', changeFrequency: 'monthly', priority: 0.6 },
  { url: '/help', changeFrequency: 'weekly', priority: 0.5 },

  // Contact & Demo
  { url: '/demo', changeFrequency: 'monthly', priority: 0.9 },
  { url: '/free-trial', changeFrequency: 'monthly', priority: 0.9 },
  { url: '/contact', changeFrequency: 'monthly', priority: 0.7 },

  // Company
  { url: '/vision', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/solutions', changeFrequency: 'weekly', priority: 0.8 },
  { url: '/media', changeFrequency: 'weekly', priority: 0.7 },
  { url: '/status', changeFrequency: 'weekly', priority: 0.5 },

  // VIP
  { url: '/vip', changeFrequency: 'monthly', priority: 0.7 },

  // Auth pages
  { url: '/auth/login', changeFrequency: 'monthly', priority: 0.5 },
  { url: '/auth/sign-up', changeFrequency: 'monthly', priority: 0.6 },

  // Legal
  { url: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { url: '/terms', changeFrequency: 'yearly', priority: 0.3 },

  // Courses catalog
  { url: '/courses', changeFrequency: 'daily', priority: 0.9 },
];

// ============================================================================
// Dynamic Data Fetching
// ============================================================================

/**
 * Fetch published courses for sitemap
 * Data: Firestore integration pending
 */
async function getPublishedCourses(): Promise<Array<{ slug: string; updatedAt: Date }>> {
  // Data: Firestore integration pending
  return [];
}

/**
 * Fetch blog posts for sitemap
 * Data: Firestore integration pending
 */
async function getBlogPosts(): Promise<Array<{ slug: string; updatedAt: Date }>> {
  // Data: Firestore integration pending
  return [];
}

// ============================================================================
// Sitemap Generator
// ============================================================================

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  // Static pages
  const staticUrls: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${SITE_URL}${page.url}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Dynamic course pages
  const courses = await getPublishedCourses();
  const courseUrls: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${SITE_URL}/courses/${course.slug}`,
    lastModified: course.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic blog posts
  const posts = await getBlogPosts();
  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticUrls, ...courseUrls, ...postUrls];
}
