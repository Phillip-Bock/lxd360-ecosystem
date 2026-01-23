import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

/** @type {import('next').NextConfig} */
const baseConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },

  transpilePackages: ['@tanstack/react-table', '@tanstack/table-core'],

  images: {
    unoptimized: process.env.NEXT_PUBLIC_CLOUD_RUN === 'true',
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'date-fns',
      'lodash',
      '@tanstack/react-query',
      'framer-motion',
    ],
    turbo: {
      rules: {},
    },
  },

  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  async rewrites() {
    return [
      { source: '/favicon.ico', destination: '/icon.svg' },
      { source: '/login', destination: '/00-lxd360-auth/login' },
      { source: '/sign-up', destination: '/00-lxd360-auth/sign-up' },
      { source: '/reset-password', destination: '/00-lxd360-auth/reset-password' },
      { source: '/callback/:path*', destination: '/00-lxd360-auth/callback/:path*' },
      { source: '/vision', destination: '/01-lxd360-llc/vision' },
      { source: '/studio', destination: '/01-lxd360-llc/studio' },
      { source: '/ignite', destination: '/01-lxd360-llc/ignite' },
      { source: '/neuro', destination: '/01-lxd360-llc/neuro' },
      { source: '/kinetix', destination: '/01-lxd360-llc/kinetix' },
      { source: '/contact', destination: '/01-lxd360-llc/contact' },
      { source: '/legal/:path*', destination: '/01-lxd360-llc/legal/:path*' },
      { source: '/inspire-studio', destination: '/02-lxd360-inspire-studio' },
      { source: '/inspire-studio/:path*', destination: '/02-lxd360-inspire-studio/:path*' },
      { source: '/ignite/dashboard/:path*', destination: '/03-lxd360-inspire-ignite/dashboard/:path*' },
      { source: '/ignite/learn/:path*', destination: '/03-lxd360-inspire-ignite/learner/:path*' },
      { source: '/ignite/manage/:path*', destination: '/03-lxd360-inspire-ignite/manage/:path*' },
      { source: '/cognitive/:path*', destination: '/04-lxd360-inspire-cognitive/:path*' },
      { source: '/cortex', destination: '/05-lxd360-inspire-cortex' },
      { source: '/cortex/:path*', destination: '/05-lxd360-inspire-cortex/:path*' },
      { source: '/media', destination: '/06-lxd360-inspire-media-center' },
      { source: '/media/:path*', destination: '/06-lxd360-inspire-media-center/:path*' },
      { source: '/nexus', destination: '/07-lxd360-inspire-lxd-nexus' },
      { source: '/nexus/:path*', destination: '/07-lxd360-inspire-lxd-nexus/:path*' },
      { source: '/consultation', destination: '/01-lxd360-llc/neuro' },
      { source: '/store', destination: '/01-lxd360-llc/kinetix' },
      { source: '/coming-soon', destination: '/10-lxd360-coming-soon' },
      { source: '/status', destination: '/11-lxd360-maintenance' },
      { source: '/faq', destination: '/11-lxd360-maintenance/faq' },
      { source: '/maintenance/:path*', destination: '/11-lxd360-maintenance/:path*' },
    ];
  },

  async redirects() {
    return [
      { source: '/dashboard/system-admin', destination: '/dashboard/super-admin', permanent: true },
      { source: '/dashboard/system-admin/:path*', destination: '/dashboard/super-admin/:path*', permanent: true },
      { source: '/dashboard/tenant-admin', destination: '/dashboard/organization-admin', permanent: true },
      { source: '/dashboard/tenant-admin/:path*', destination: '/dashboard/organization-admin/:path*', permanent: true },
      { source: '/dashboard/manager', destination: '/dashboard/program-admin', permanent: true },
      { source: '/dashboard/manager/:path*', destination: '/dashboard/program-admin/:path*', permanent: true },
      { source: '/dashboard/inspire-studio', destination: '/inspire-studio', permanent: true },
      { source: '/dashboard/inspire-studio/:path*', destination: '/inspire-studio/:path*', permanent: true },
      { source: '/inspire-studio-app', destination: '/inspire-studio', permanent: true },
      { source: '/inspire-studio-app/:path*', destination: '/inspire-studio/:path*', permanent: true },
      { source: '/dashboard/lxp360', destination: '/lxp360', permanent: true },
      { source: '/dashboard/lxp360/:path*', destination: '/lxp360/:path*', permanent: true },
      { source: '/dashboard/lxd/author', destination: '/inspire-studio/course-builder', permanent: true },
      { source: '/dashboard/lxd/encoding', destination: '/inspire-studio/developer-tools', permanent: true },
      { source: '/dashboard/lxd/synthesization', destination: '/inspire-studio/developer-tools', permanent: true },
      { source: '/dashboard/lxd/assimilation', destination: '/inspire-studio/developer-tools', permanent: true },
      { source: '/dashboard/lxd/storyboard/course', destination: '/inspire-studio/storyboard', permanent: true },
      { source: '/dashboard/lxd/lesson', destination: '/inspire-studio/course-builder', permanent: true },
      { source: '/dashboard/lxd/player-editor', destination: '/inspire-studio/course-builder', permanent: true },
      { source: '/dashboard/lxd', destination: '/inspire-studio', permanent: true },
      { source: '/dashboard/lxd/:path*', destination: '/inspire-studio/:path*', permanent: true },
      { source: '/dashboard/internal-learner', destination: '/lxp360/learner', permanent: true },
      { source: '/dashboard/internal-learner/:path*', destination: '/lxp360/learner/:path*', permanent: true },
      { source: '/dashboard/internal-instructor', destination: '/lxp360/instructor', permanent: true },
      { source: '/dashboard/internal-instructor/:path*', destination: '/lxp360/instructor/:path*', permanent: true },
      { source: '/dashboard/internal-lms-admin', destination: '/lxp360/lms-admin', permanent: true },
      { source: '/dashboard/internal-lms-admin/:path*', destination: '/lxp360/lms-admin/:path*', permanent: true },
      { source: '/dashboard/internal-designer', destination: '/inspire-studio', permanent: true },
      { source: '/dashboard/internal-designer/:path*', destination: '/inspire-studio/:path*', permanent: true },
      { source: '/waitlist', destination: '/vip', permanent: true },
      { source: '/dashboard/client-admin', destination: '/admin', permanent: true },
      { source: '/dashboard/client-admin/:path*', destination: '/admin/:path*', permanent: true },
      { source: '/client-admin', destination: '/admin', permanent: true },
      { source: '/client-admin/:path*', destination: '/admin/:path*', permanent: true },
      { source: '/signin', destination: '/login', permanent: true },
      { source: '/signup', destination: '/sign-up', permanent: true },
      { source: '/register', destination: '/sign-up', permanent: true },
      { source: '/about', destination: '/vision', permanent: true },
      { source: '/solutions/:path+', destination: '/consultation', permanent: false },
      { source: '/industries/:path*', destination: '/consultation', permanent: false },
      { source: '/services', destination: '/consultation', permanent: true },
      { source: '/products/inspire-studio', destination: '/inspire-studio', permanent: true },
      { source: '/products/lxp360', destination: '/lxp360', permanent: true },
      { source: '/products/lxd-ecosystem', destination: '/lxd-ecosystem', permanent: true },
      { source: '/community', destination: '/nexus', permanent: true },
      { source: '/community/:path*', destination: '/nexus/:path*', permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*.(ico|jpg|jpeg|png|gif|webp|avif|svg)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*.(woff|woff2|ttf|otf|eot)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*.(js|css)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/((?!studio).*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseio.com https://*.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebase.google.com wss://*.firebaseio.com https://api.stripe.com https://firestore.googleapis.com",
              "frame-src 'self' https://*.firebaseapp.com https://*.stripe.com https://js.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  if (isDev) {
    return baseConfig;
  }

  return {
    ...baseConfig,
    webpack: (config, { isServer }) => {
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
  };
};
