#!/usr/bin/env npx tsx
/**
 * Marketing Route Verification Script
 *
 * Scans the marketing pages and compares them against navigation/footer links
 * to identify broken routes.
 *
 * Usage: npx tsx scripts/verify-marketing-routes.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT_DIR = path.join(__dirname, '..');
const MARKETING_DIR = path.join(ROOT_DIR, 'app', '(marketing)');

// Critical marketing pages that must exist
const CRITICAL_PAGES = [
  { route: '/', path: 'app/(marketing)/page.tsx', description: 'Home page' },
  {
    route: '/compliance',
    path: 'app/(marketing)/compliance/page.tsx',
    description: 'Compliance page',
  },
  { route: '/security', path: 'app/(marketing)/security/page.tsx', description: 'Security page' },
  {
    route: '/platform',
    path: 'app/(marketing)/platform/page.tsx',
    description: 'Platform overview',
  },
  { route: '/resources', path: 'app/(marketing)/resources/page.tsx', description: 'Resources hub' },
  { route: '/support', path: 'app/(marketing)/support/page.tsx', description: 'Support page' },
  {
    route: '/industries/healthcare',
    path: 'app/(marketing)/industries/healthcare/page.tsx',
    description: 'Healthcare industry',
  },
  {
    route: '/industries/aerospace',
    path: 'app/(marketing)/industries/aerospace/page.tsx',
    description: 'Aerospace industry',
  },
  { route: '/pricing', path: 'app/(marketing)/pricing/page.tsx', description: 'Pricing page' },
  { route: '/demo', path: 'app/(marketing)/demo/page.tsx', description: 'Demo request' },
  { route: '/contact', path: 'app/(marketing)/contact/page.tsx', description: 'Contact page' },
];

// Links from marketing-nav.tsx
const NAV_LINKS = [
  '/platform',
  '/platform/inspire',
  '/platform/analytics',
  '/solutions/healthcare',
  '/solutions/aerospace',
  '/solutions/manufacturing',
  '/pricing',
  '/resources',
  '/auth/login',
  '/demo',
  '/solutions',
];

// Links from marketing-footer.tsx
const FOOTER_LINKS = [
  '/platform',
  '/platform/inspire',
  '/platform/analytics',
  '/platform/integrations',
  '/solutions/healthcare',
  '/solutions/aerospace',
  '/solutions/manufacturing',
  '/solutions/enterprise',
  '/docs',
  '/resources/case-studies',
  '/blog',
  '/resources/webinars',
  '/vision',
  '/careers',
  '/contact',
  '/partners',
  '/privacy',
  '/terms',
  '/security',
];

// Combine all routes to check
const ALL_ROUTES = [...new Set([...NAV_LINKS, ...FOOTER_LINKS])];

interface RouteStatus {
  route: string;
  status: 'exists' | 'missing' | 'redirect';
  pagePath?: string;
  note?: string;
}

function findPageForRoute(route: string): string | null {
  // Marketing routes
  const marketingPath = path.join(ROOT_DIR, 'app', '(marketing)', route.slice(1), 'page.tsx');
  if (fs.existsSync(marketingPath)) return marketingPath;

  // Auth routes
  if (route.startsWith('/auth/')) {
    const authPath = path.join(ROOT_DIR, 'app', '(auth)', route.slice(1), 'page.tsx');
    if (fs.existsSync(authPath)) return authPath;
  }

  // Solutions might map to industries
  if (route.startsWith('/solutions/')) {
    const industry = route.replace('/solutions/', '');
    const industryPath = path.join(
      ROOT_DIR,
      'app',
      '(marketing)',
      'industries',
      industry,
      'page.tsx',
    );
    if (fs.existsSync(industryPath)) return industryPath;
  }

  // Check (lxd360llc) route group
  const llcPath = path.join(ROOT_DIR, 'app', '(lxd360llc)', route.slice(1), 'page.tsx');
  if (fs.existsSync(llcPath)) return llcPath;

  return null;
}

function getAllMarketingPages(): string[] {
  const pages: string[] = [];

  function scanDir(dir: string) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name === 'page.tsx') {
        pages.push(fullPath);
      }
    }
  }

  scanDir(MARKETING_DIR);
  return pages;
}

function getRouteFromPath(pagePath: string): string {
  const relative = path.relative(path.join(ROOT_DIR, 'app', '(marketing)'), pagePath);
  const route = `/${path.dirname(relative).replace(/\\/g, '/')}`;
  return route === '/.' ? '/' : route;
}

function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('              MARKETING ROUTE VERIFICATION REPORT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. List all existing marketing pages
  console.log('📁 EXISTING MARKETING PAGES');
  console.log('───────────────────────────────────────────────────────────────');
  const existingPages = getAllMarketingPages();
  existingPages.forEach((page) => {
    const route = getRouteFromPath(page);
    console.log(`  ✅ ${route.padEnd(30)} → ${path.relative(ROOT_DIR, page)}`);
  });
  console.log(`\n  Total: ${existingPages.length} pages\n`);

  // 2. Check critical pages
  console.log('🎯 CRITICAL PAGE STATUS');
  console.log('───────────────────────────────────────────────────────────────');
  let criticalMissing = 0;
  let criticalExisting = 0;

  CRITICAL_PAGES.forEach(({ route, path: pagePath, description }) => {
    const fullPath = path.join(ROOT_DIR, pagePath);
    const exists = fs.existsSync(fullPath);
    if (exists) {
      console.log(`  ✅ ${route.padEnd(30)} ${description}`);
      criticalExisting++;
    } else {
      console.log(`  ❌ ${route.padEnd(30)} ${description} (MISSING)`);
      criticalMissing++;
    }
  });
  console.log(
    `\n  Critical: ${criticalExisting}/${CRITICAL_PAGES.length} exist, ${criticalMissing} missing\n`,
  );

  // 3. Check navigation links
  console.log('🔗 NAVIGATION LINK STATUS');
  console.log('───────────────────────────────────────────────────────────────');
  const navResults: RouteStatus[] = [];

  NAV_LINKS.forEach((route) => {
    const pagePath = findPageForRoute(route);
    if (pagePath) {
      navResults.push({ route, status: 'exists', pagePath });
      console.log(`  ✅ ${route.padEnd(30)} → ${path.relative(ROOT_DIR, pagePath)}`);
    } else {
      navResults.push({ route, status: 'missing' });
      console.log(`  ❌ ${route.padEnd(30)} BROKEN LINK`);
    }
  });

  const navWorking = navResults.filter((r) => r.status === 'exists').length;
  const navBroken = navResults.filter((r) => r.status === 'missing').length;
  console.log(`\n  Navigation: ${navWorking}/${NAV_LINKS.length} working, ${navBroken} broken\n`);

  // 4. Check footer links
  console.log('📄 FOOTER LINK STATUS');
  console.log('───────────────────────────────────────────────────────────────');
  const footerResults: RouteStatus[] = [];

  FOOTER_LINKS.forEach((route) => {
    const pagePath = findPageForRoute(route);
    if (pagePath) {
      footerResults.push({ route, status: 'exists', pagePath });
      console.log(`  ✅ ${route.padEnd(30)} → ${path.relative(ROOT_DIR, pagePath)}`);
    } else {
      footerResults.push({ route, status: 'missing' });
      console.log(`  ❌ ${route.padEnd(30)} BROKEN LINK`);
    }
  });

  const footerWorking = footerResults.filter((r) => r.status === 'exists').length;
  const footerBroken = footerResults.filter((r) => r.status === 'missing').length;
  console.log(
    `\n  Footer: ${footerWorking}/${FOOTER_LINKS.length} working, ${footerBroken} broken\n`,
  );

  // 5. Summary
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                          SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');

  const allBroken = [
    ...new Set([
      ...navResults.filter((r) => r.status === 'missing').map((r) => r.route),
      ...footerResults.filter((r) => r.status === 'missing').map((r) => r.route),
    ]),
  ];

  const allWorking = [
    ...new Set([
      ...navResults.filter((r) => r.status === 'exists').map((r) => r.route),
      ...footerResults.filter((r) => r.status === 'exists').map((r) => r.route),
    ]),
  ];

  console.log('\n  ✅ WORKING ROUTES:');
  allWorking.sort().forEach((route) => console.log(`     ${route}`));

  console.log('\n  ❌ BROKEN ROUTES (need pages created):');
  allBroken.sort().forEach((route) => console.log(`     ${route}`));

  console.log('\n───────────────────────────────────────────────────────────────');
  console.log(`  Total routes checked: ${ALL_ROUTES.length}`);
  console.log(`  Working: ${allWorking.length}`);
  console.log(`  Broken: ${allBroken.length}`);
  console.log(`  Health: ${((allWorking.length / ALL_ROUTES.length) * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Exit with error code if there are broken routes
  if (allBroken.length > 0) {
    process.exit(1);
  }
}

main();
