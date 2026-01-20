/**
 * =============================================================================
 * LXP360-SaaS | Configuration
 * =============================================================================
 *
 * @fileoverview Next.js configuration for the LXD360 platform
 *
 * @description
 * This file contains all Next.js configuration including build optimizations,
 * image handling, rewrites, and redirects for legacy routes. Legacy dashboard
 * routes are redirected to the new RBAC-based structure.
 *
 * @author       LXD360 Development Team
 * @copyright    2024 LXD360 LLC. All rights reserved.
 * @license      Proprietary - See LICENSE file
 *
 * @created      2024-01-01
 * @modified     2026-01-11
 * @version      3.1.0 - GCP Migration Complete
 *
 * @see          https://nextjs.org/docs/app/api-reference/next-config-js
 *
 * =============================================================================
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript - temporarily ignore build errors (inherited from MAIN)
  // TODO(LXD-400): Fix all TypeScript errors and set to false
  typescript: {
    ignoreBuildErrors: true,
  },

  // Build performance optimizations
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  // Transpile ESM packages that have module format issues
  transpilePackages: ['@tanstack/react-table', '@tanstack/table-core'],

  // =========================================================================
  // Image Optimization
  // =========================================================================
  images: {
    // Disable image optimization for Cloud Run (requires separate image optimization service)
    unoptimized: process.env.NEXT_PUBLIC_CLOUD_RUN === 'true',
    formats: ['image/avif', 'image/webp'],
    // Remote image patterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimize the size
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // =========================================================================
  // Experimental Features for Performance
  // =========================================================================
  experimental: {
    // Optimize package imports for smaller bundles
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'date-fns',
      'lodash',
      '@tanstack/react-query',
      'framer-motion',
    ],
  },

  // =========================================================================
  // Webpack Configuration
  // =========================================================================
  webpack: (config, { isServer }) => {
    // Bundle analyzer (conditional)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
          openAnalyzer: false,
        }),
      );
    }
    return config;
  },

  // =========================================================================
  // Output Configuration
  // =========================================================================
  // Required for Cloud Run deployment (GCP migration)
  output: 'standalone',

  // =========================================================================
  // Compression (handled by Cloud Run/hosting)
  // =========================================================================
  compress: true,

  // =========================================================================
  // Powered By Header (security - hide Next.js signature)
  // =========================================================================
  poweredByHeader: false,

  // =========================================================================
  // Generate ETags for caching
  // =========================================================================
  generateEtags: true,
  async rewrites() {
    return [
      // =========================================================================
      // Favicon
      // =========================================================================
      {
        source: '/favicon.ico',
        destination: '/icon.svg',
      },
      // =========================================================================
      // LXD360 Ecosystem URL Rewrites (numbered folders → clean URLs)
      // =========================================================================
      // Auth
      {
        source: '/login',
        destination: '/00-lxd360-auth/login',
      },
      {
        source: '/sign-up',
        destination: '/00-lxd360-auth/sign-up',
      },
      {
        source: '/reset-password',
        destination: '/00-lxd360-auth/reset-password',
      },
      {
        source: '/callback/:path*',
        destination: '/00-lxd360-auth/callback/:path*',
      },
      // LLC Company Pages
      {
        source: '/vision',
        destination: '/01-lxd360-llc/(lxd360-llc)/vision',
      },
      {
        source: '/studio',
        destination: '/01-lxd360-llc/(lxd360-llc)/studio',
      },
      {
        source: '/ignite',
        destination: '/01-lxd360-llc/(lxd360-llc)/ignite',
      },
      {
        source: '/neuro',
        destination: '/01-lxd360-llc/(lxd360-llc)/neuro',
      },
      {
        source: '/kinetix',
        destination: '/01-lxd360-llc/(lxd360-llc)/kinetix',
      },
      {
        source: '/contact',
        destination: '/01-lxd360-llc/(lxd360-llc)/contact',
      },
      {
        source: '/legal/:path*',
        destination: '/01-lxd360-llc/(lxd360-llc)/legal/:path*',
      },
      // INSPIRE Studio App
      {
        source: '/inspire-studio/:path*',
        destination: '/02-lxd360-inspire-studio/(inspire-studio)/:path*',
      },
      // INSPIRE Ignite App (LMS)
      {
        source: '/ignite/dashboard/:path*',
        destination: '/03-lxd360-inspire-ignite/dashboard/:path*',
      },
      {
        source: '/ignite/learn/:path*',
        destination: '/03-lxd360-inspire-ignite/learner/:path*',
      },
      {
        source: '/ignite/manage/:path*',
        destination: '/03-lxd360-inspire-ignite/manage/:path*',
      },
      // INSPIRE Cognitive (LRS)
      {
        source: '/cognitive/:path*',
        destination: '/04-lxd360-inspire-cognitive/:path*',
      },
      // INSPIRE Cortex (Blog)
      {
        source: '/cortex',
        destination: '/05-lxd360-inspire-cortex',
      },
      {
        source: '/cortex/:path*',
        destination: '/05-lxd360-inspire-cortex/:path*',
      },
      // INSPIRE Media Center
      {
        source: '/media',
        destination: '/06-lxd360-inspire-media-center',
      },
      {
        source: '/media/:path*',
        destination: '/06-lxd360-inspire-media-center/:path*',
      },
      // LXD Nexus (Community)
      {
        source: '/nexus',
        destination: '/07-lxd360-inspire-lxd-nexus',
      },
      {
        source: '/nexus/:path*',
        destination: '/07-lxd360-inspire-lxd-nexus/:path*',
      },
      // Consulting alias
      {
        source: '/consultation',
        destination: '/01-lxd360-llc/(lxd360-llc)/neuro',
      },
      // Store alias
      {
        source: '/store',
        destination: '/01-lxd360-llc/(lxd360-llc)/kinetix',
      },
      // Coming Soon
      {
        source: '/coming-soon',
        destination: '/10-lxd360-coming-soon',
      },
      // Maintenance & FAQ
      {
        source: '/status',
        destination: '/11-lxd360-maintenance',
      },
      {
        source: '/faq',
        destination: '/11-lxd360-maintenance/faq',
      },
      {
        source: '/maintenance/:path*',
        destination: '/11-lxd360-maintenance/:path*',
      },
    ];
  },
  async redirects() {
    return [
      // Legacy dashboard routes
      {
        source: '/dashboard/system-admin',
        destination: '/dashboard/super-admin',
        permanent: true,
      },
      {
        source: '/dashboard/system-admin/:path*',
        destination: '/dashboard/super-admin/:path*',
        permanent: true,
      },
      {
        source: '/dashboard/tenant-admin',
        destination: '/dashboard/organization-admin',
        permanent: true,
      },
      {
        source: '/dashboard/tenant-admin/:path*',
        destination: '/dashboard/organization-admin/:path*',
        permanent: true,
      },
      {
        source: '/dashboard/manager',
        destination: '/dashboard/program-admin',
        permanent: true,
      },
      {
        source: '/dashboard/manager/:path*',
        destination: '/dashboard/program-admin/:path*',
        permanent: true,
      },
      // Product routes moved to (tenant) route group
      {
        source: '/dashboard/inspire-studio',
        destination: '/inspire-studio',
        permanent: true,
      },
      {
        source: '/dashboard/inspire-studio/:path*',
        destination: '/inspire-studio/:path*',
        permanent: true,
      },
      // Legacy inspire-studio-app to inspire-studio
      {
        source: '/inspire-studio-app',
        destination: '/inspire-studio',
        permanent: true,
      },
      {
        source: '/inspire-studio-app/:path*',
        destination: '/inspire-studio/:path*',
        permanent: true,
      },
      {
        source: '/dashboard/lxp360',
        destination: '/lxp360',
        permanent: true,
      },
      {
        source: '/dashboard/lxp360/:path*',
        destination: '/lxp360/:path*',
        permanent: true,
      },
      // LXD to INSPIRE Studio rename (legacy) - Specific route mappings first
      {
        source: '/dashboard/lxd/author',
        destination: '/inspire-studio/course-builder',
        permanent: true,
      },
      {
        source: '/dashboard/lxd/encoding',
        destination: '/inspire-studio/developer-tools',
        permanent: true,
      },
      {
        source: '/dashboard/lxd/synthesization',
        destination: '/inspire-studio/developer-tools',
        permanent: true,
      },
      {
        source: '/dashboard/lxd/assimilation',
        destination: '/inspire-studio/developer-tools',
        permanent: true,
      },
      {
        source: '/dashboard/lxd/storyboard/course',
        destination: '/inspire-studio/storyboard',
        permanent: true,
      },
      {
        source: '/dashboard/lxd/lesson',
        destination: '/inspire-studio/course-builder',
        permanent: true,
      },
      {
        source: '/dashboard/lxd/player-editor',
        destination: '/inspire-studio/course-builder',
        permanent: true,
      },
      // LXD to INSPIRE Studio (generic fallback)
      {
        source: '/dashboard/lxd',
        destination: '/inspire-studio',
        permanent: true,
      },
      {
        source: '/dashboard/lxd/:path*',
        destination: '/inspire-studio/:path*',
        permanent: true,
      },
      // Legacy internal roles
      {
        source: '/dashboard/internal-learner',
        destination: '/lxp360/learner',
        permanent: true,
      },
      {
        source: '/dashboard/internal-learner/:path*',
        destination: '/lxp360/learner/:path*',
        permanent: true,
      },
      {
        source: '/dashboard/internal-instructor',
        destination: '/lxp360/instructor',
        permanent: true,
      },
      {
        source: '/dashboard/internal-instructor/:path*',
        destination: '/lxp360/instructor/:path*',
        permanent: true,
      },
      {
        source: '/dashboard/internal-lms-admin',
        destination: '/lxp360/lms-admin',
        permanent: true,
      },
      {
        source: '/dashboard/internal-lms-admin/:path*',
        destination: '/lxp360/lms-admin/:path*',
        permanent: true,
      },
      {
        source: '/dashboard/internal-designer',
        destination: '/inspire-studio',
        permanent: true,
      },
      {
        source: '/dashboard/internal-designer/:path*',
        destination: '/inspire-studio/:path*',
        permanent: true,
      },
      // Note: /inspire-studio and /lxp360 are now tenant routes
      // Public product pages are at /products/inspire-studio and /products/lxp360
      // Legacy /waitlist to /vip
      {
        source: '/waitlist',
        destination: '/vip',
        permanent: true,
      },
      // Legacy client admin to tenant admin route
      {
        source: '/dashboard/client-admin',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/dashboard/client-admin/:path*',
        destination: '/admin/:path*',
        permanent: true,
      },
      // client-admin to admin redirect
      {
        source: '/client-admin',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/client-admin/:path*',
        destination: '/admin/:path*',
        permanent: true,
      },
      // Legacy auth routes
      {
        source: '/signin',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/auth/sign-up',
        permanent: true,
      },
      // Employee login shortcut
      {
        source: '/employee-login',
        destination: '/auth/employee-login',
        permanent: false,
      },
      // About to Vision rename
      {
        source: '/about',
        destination: '/vision',
        permanent: true,
      },
      // Solutions sub-routes - redirect to consultation (industry pages pending)
      // Note: Using :path+ to match one or more segments, so /solutions itself is NOT redirected
      {
        source: '/solutions/:path+',
        destination: '/consultation',
        permanent: false, // Not permanent - industry pages may be added later
      },
      {
        source: '/industries/:path*',
        destination: '/consultation',
        permanent: false, // Not permanent - industry pages may be added later
      },
      // =======================================================================
      // New URL structure redirects (2025-12 restructure)
      // =======================================================================
      // Old dashboard routes → platform
      {
        source: '/dashboard',
        destination: '/app/lxp360',
        permanent: true,
      },
      {
        source: '/dashboard/:path*',
        destination: '/app/:path*',
        permanent: true,
      },
      // Ensure /admin goes to /internal/admin
      {
        source: '/admin',
        destination: '/internal/admin',
        permanent: true,
      },
      {
        source: '/admin/:path*',
        destination: '/internal/admin/:path*',
        permanent: true,
      },
      // Command center redirect
      {
        source: '/command-center',
        destination: '/internal/command-center',
        permanent: true,
      },
      {
        source: '/command-center/:path*',
        destination: '/internal/command-center/:path*',
        permanent: true,
      },
      // Old auth routes - redirect to existing auth pages
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      // NOTE: /auth/login page EXISTS - do NOT redirect it away
      {
        source: '/register',
        destination: '/auth/sign-up',
        permanent: true,
      },
      // Old marketing routes
      {
        source: '/services',
        destination: '/consultation',
        permanent: true,
      },
      // Product routes without /products prefix
      {
        source: '/products/inspire-studio',
        destination: '/inspire-studio',
        permanent: true,
      },
      {
        source: '/products/lxp360',
        destination: '/lxp360',
        permanent: true,
      },
      {
        source: '/products/lxd-ecosystem',
        destination: '/lxd-ecosystem',
        permanent: true,
      },
      // Community redirect
      {
        source: '/community',
        destination: '/nexus',
        permanent: true,
      },
      {
        source: '/community/:path*',
        destination: '/nexus/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      // =========================================================================
      // Static Asset Caching Headers
      // =========================================================================
      {
        // Immutable assets (with hash in filename)
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // Static files in public folder
        source: '/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // Images - cache for 1 year
        source: '/:path*.(ico|jpg|jpeg|png|gif|webp|avif|svg)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // Fonts - cache for 1 year
        source: '/:path*.(woff|woff2|ttf|otf|eot)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // JS/CSS bundles (already versioned by Next.js)
        source: '/:path*.(js|css)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      // =========================================================================
      // Security Headers
      // =========================================================================
      {
        // Global security headers for all routes EXCEPT /studio (which needs iframe embedding)
        source: '/((?!studio).*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
