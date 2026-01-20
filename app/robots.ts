import type { MetadataRoute } from 'next';

// ============================================================================
// Configuration
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lxd360.com';

// ============================================================================
// Robots Generator
// ============================================================================

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all search engine bots
        userAgent: '*',
        allow: ['/'],
        disallow: [
          // Admin routes
          '/admin/',
          '/dashboard/',
          '/super-admin/',
          '/program-admin/',
          '/organization-admin/',
          '/client-admin/',

          // API routes
          '/api/',

          // Auth routes (no need to index)
          '/auth/callback',
          '/auth/confirm',
          '/auth/reset-password',
          '/auth/verify',

          // Internal product areas (require login)
          '/lxp360/',
          '/inspire-studio/',
          '/inspire-studio-app/',

          // Nexus authenticated routes
          '/nexus/dashboard',
          '/nexus/feed',
          '/nexus/messages',
          '/nexus/admin',
          '/nexus/sessions',

          // System routes
          '/studio/', // CMS Studio (legacy)
          '/_next/',
          '/monitoring', // Monitoring routes
          '/wiki/', // Internal wiki

          // Search and filter pages (avoid duplicate content)
          '/search',

          // Checkout and internal flows
          '/checkout/',

          // Private files
          '/private/',
        ],
      },
      {
        // Specific rules for GPTBot (OpenAI)
        userAgent: 'GPTBot',
        disallow: ['/'], // Opt out of AI training
      },
      {
        // Specific rules for CCBot (Common Crawl - used for AI training)
        userAgent: 'CCBot',
        disallow: ['/'], // Opt out of AI training
      },
      {
        // Specific rules for ChatGPT-User
        userAgent: 'ChatGPT-User',
        disallow: ['/'], // Opt out of ChatGPT browsing
      },
      {
        // Specific rules for Google-Extended (Bard AI training)
        userAgent: 'Google-Extended',
        disallow: ['/'], // Opt out of Google AI training
      },
      {
        // Anthropic's Claude crawler
        userAgent: 'anthropic-ai',
        disallow: ['/'], // Opt out of Anthropic AI training
      },
      {
        // Bytespider (ByteDance/TikTok)
        userAgent: 'Bytespider',
        disallow: ['/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
