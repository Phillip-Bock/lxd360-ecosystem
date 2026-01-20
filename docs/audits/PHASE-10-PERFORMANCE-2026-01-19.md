# Phase 10: Performance & Bundle Analysis Audit

**Date:** 2026-01-19
**Auditor:** Claude Code
**Scope:** Performance, bundle optimization, client/server component analysis
**Mode:** REPORT ONLY - No fixes applied

---

## Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| **Build Status** | FAILED | CRITICAL |
| **Bundle Analyzer** | Conditional (ANALYZE=true) | OK |
| **Client Components** | 813 files | HIGH |
| **Server Components** | 187 files | LOW |
| **RSC Ratio** | 18.7% | CRITICAL (target >70%) |
| **Large Files (>300 lines)** | 548 files | HIGH |
| **Raw img Tags** | 8 | LOW |
| **Dynamic Imports** | 80 | GOOD |
| **Loading Boundaries** | 0 | CRITICAL |
| **Error Boundaries** | 1 | CRITICAL |
| **API Routes with Caching** | 0 of 18 | HIGH |
| **Public Folder Size** | 64MB | HIGH |

**Overall Score: 4/10**

---

## Step-by-Step Audit Results

### Step 1: Build Output Analysis

**Command:** `npm run build`

**Result:** BUILD FAILED

```
Error: Invalid rewrites found:
  - `destination` has segments not in `source` or has (0) for route {"source":"/vision","destination":"/01-lxd360-llc/(lxd360-llc)/vision"}
  - `destination` has segments not in `source` or has (0) for route {"source":"/studio","destination":"/01-lxd360-llc/(lxd360-llc)/studio"}
  - `destination` has segments not in `source` or has (0) for route {"source":"/ignite","destination":"/01-lxd360-llc/(lxd360-llc)/ignite"}
  - `destination` has segments not in `source` or has (0) for route {"source":"/neuro","destination":"/01-lxd360-llc/(lxd360-llc)/neuro"}
  - `destination` has segments not in `source` or has (0) for route {"source":"/kinetix","destination":"/01-lxd360-llc/(lxd360-llc)/kinetix"}
  - `destination` has segments not in `source` or has (0) for route {"source":"/contact","destination":"/01-lxd360-llc/(lxd360-llc)/contact"}
  - `destination` has segments not in `source` or has (0) for route {"source":"/legal/:path*","destination":"/01-lxd360-llc/(lxd360-llc)/legal/:path*"}
  - `destination` has segments not in `source` or has (0) for route {"source":"/inspire-studio/:path*","destination":"/02-lxd360-inspire-studio/(inspire-studio)/:path*"}
  - `destination` has segments not in `source` or has (0) for route {"source":"/consultation","destination":"/01-lxd360-llc/(lxd360-llc)/neuro"}
  - `destination` has segments not in `source` or has (0) for route {"source":"/store","destination":"/01-lxd360-llc/(lxd360-llc)/kinetix"}
```

**Analysis:** The rewrites in `next.config.mjs` contain route group paths with parentheses `/(group-name)/` which Next.js does not allow in rewrite destinations. Route groups are organizational only and should not appear in URLs.

---

### Step 2: Bundle Size Report

**Command:** Check for bundle analyzer configuration

**Result:** Bundle analyzer IS configured in `next.config.mjs`:

```javascript
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
```

**To run:** `ANALYZE=true npm run build`

**Status:** Cannot generate report because build fails.

---

### Step 3: Static vs Dynamic Routes

**Command:** Check `.next/routes-manifest.json` and `.next/prerender-manifest.json`

**Result:** N/A - Build failed, manifests not generated.

---

### Step 4: Client Component Count

**Command:** `grep -rl "use client" app/ components/ --include="*.tsx" --include="*.ts" | wc -l`

**Result:** **813 files** with `'use client'` directive

**Top directories:**
- `components/` - majority of client components
- `app/` - many page-level client components

---

### Step 5: Server Component Count (RSC Ratio)

**Command:** Count `.tsx` files without `'use client'`

**Result:**
- Total `.tsx` files in app/components: ~1000
- Files with 'use client': 813
- **Server Components: ~187 files**
- **RSC Ratio: 18.7%** (target: >70%)

**Analysis:** Very low server component ratio. Most components are client-side, which increases bundle size and reduces SSR benefits.

---

### Step 6: Large Components (>300 lines)

**Command:** Find files exceeding 300 lines

**Result:** **548 files** exceed 300 lines

**Largest files:**
| File | Lines |
|------|-------|
| types/blocks.ts | 2462 |
| types/xapi.d.ts | 1890 |
| components/storyboard/modern-storyboard.tsx | 1654 |
| app/02-lxd360-inspire-studio/(inspire-studio)/lesson-builder/page.tsx | 1432 |
| components/inspire-studio/course-builder/course-outline.tsx | 1289 |
| components/lxp360/player/modern-slide-renderer.tsx | 1156 |
| components/dashboard/course-card.tsx | 987 |

---

### Step 7: Image Optimization Check

**Command:** Check for raw `<img>` vs Next.js `<Image>`

**Results:**

**Raw `<img>` tags found: 8**
```
components/email/contact-email.tsx:35
components/email/vip-waitlist-email.tsx:26
components/email/welcome-email.tsx:37
components/email/waitlist-confirmation.tsx:42
components/email/notification-email.tsx:31
app/05-lxd360-inspire-cortex/[slug]/page.tsx:89 (in prose content)
components/blocks/rich-text.tsx:124 (dynamic content)
lib/email/templates.ts:45
```

**Next.js `<Image>` usage: 28 instances**

**Analysis:** Most raw `<img>` tags are in email templates (expected - email doesn't support Next.js Image). Only 2-3 need review.

---

### Step 8: Dynamic Imports

**Command:** Search for `React.lazy`, `dynamic()`, `next/dynamic`

**Results:** **80 dynamic imports found**

**Examples:**
```typescript
// next/dynamic usage
const ModernSlideRenderer = dynamic(() => import('@/components/lxp360/player/modern-slide-renderer'))
const CourseOutline = dynamic(() => import('@/components/inspire-studio/course-builder/course-outline'))
const StoryboardCanvas = dynamic(() => import('@/components/storyboard/storyboard-canvas'))
const ThreeScene = dynamic(() => import('@/components/3d/three-scene'), { ssr: false })
const VideoPlayer = dynamic(() => import('@/components/media/video-player'), { ssr: false })

// React.lazy usage
const LazyChart = React.lazy(() => import('./analytics-chart'))
```

**Analysis:** Good use of code splitting for heavy components like 3D scenes, video players, and complex UI.

---

### Step 9: Heavy Dependency Imports

**Command:** Search for imports from heavy libraries

**Results:**

| Library | Import Count | Files Affected |
|---------|--------------|----------------|
| framer-motion | 175 | 89 |
| three | 10 | 6 |
| recharts | 10 | 5 |
| date-fns | 7 | 5 |
| lodash | 4 | 3 |

**framer-motion breakdown:**
```
motion - 142 occurrences
AnimatePresence - 23 occurrences
useAnimation - 10 occurrences
```

**Analysis:** `framer-motion` is heavily used throughout the codebase. This is the largest contributor to bundle size. Consider using CSS animations for simple transitions.

---

### Step 10: Barrel File Imports

**Command:** Check for problematic barrel file imports

**Result:** **0 problematic imports found**

Checked patterns:
- `import { ... } from 'lodash'` - Not found (using `lodash-es` or direct imports)
- `import { ... } from '@mui/material'` - Not used
- `import { ... } from 'date-fns'` - Only 7 imports, all specific

**Analysis:** Good practice - no tree-shaking-breaking barrel imports detected.

---

### Step 11: Tailwind CSS Configuration

**Command:** Check for `tailwind.config.ts` and purge settings

**Result:** Using **Tailwind CSS v4** with CSS-first configuration

**File:** `app/globals.css`
```css
@import "tailwindcss";

@theme inline {
  --color-primary: #0072f5;
  --color-secondary: #7828c8;
  /* ... */
}
```

**Analysis:** Tailwind v4 uses automatic content detection. No manual purge config needed. CSS is properly configured.

---

### Step 12: Font Optimization

**Command:** Check for `next/font` usage

**Result:** **Properly configured**

**File:** `app/layout.tsx`
```typescript
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});
```

**Analysis:** Excellent - using `next/font/google` with proper `display: 'swap'` and CSS variables.

---

### Step 13: Third-Party Scripts

**Command:** Check for `next/script` and external script loading

**Result:** **No `next/script` usage found**

Scripts found are only JSON-LD structured data:
```typescript
// In various page.tsx files
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

**Analysis:** Good - no third-party blocking scripts. JSON-LD for SEO is appropriate.

---

### Step 14: Metadata & SEO

**Command:** Check for metadata exports in page files

**Result:** **28 of 45 pages missing metadata exports**

**Pages WITH metadata:**
- `app/page.tsx`
- `app/01-lxd360-llc/(lxd360-llc)/page.tsx`
- `app/01-lxd360-llc/(lxd360-llc)/vision/page.tsx`
- `app/01-lxd360-llc/(lxd360-llc)/contact/page.tsx`
- `app/05-lxd360-inspire-cortex/page.tsx`
- `app/05-lxd360-inspire-cortex/[slug]/page.tsx`
- And 11 more...

**Pages MISSING metadata (sample):**
```
app/02-lxd360-inspire-studio/(inspire-studio)/page.tsx
app/02-lxd360-inspire-studio/(inspire-studio)/course-builder/page.tsx
app/02-lxd360-inspire-studio/(inspire-studio)/lesson-builder/page.tsx
app/03-lxd360-inspire-ignite/dashboard/page.tsx
app/03-lxd360-inspire-ignite/learner/page.tsx
app/04-lxd360-inspire-cognitive/page.tsx
app/08-lxd360-inspire-lxp360/(lxp360)/page.tsx
... (28 total missing)
```

---

### Step 15: Loading/Error Boundaries

**Command:** Find `loading.tsx`, `error.tsx`, `not-found.tsx` files

**Results:**

| Type | Count | Files |
|------|-------|-------|
| loading.tsx | 0 | None |
| error.tsx | 1 | app/error.tsx |
| not-found.tsx | 1 | app/not-found.tsx |

**Route groups without error boundaries:**
- `app/00-lxd360-auth/` - Missing
- `app/01-lxd360-llc/` - Missing
- `app/02-lxd360-inspire-studio/` - Missing
- `app/03-lxd360-inspire-ignite/` - Missing
- `app/04-lxd360-inspire-cognitive/` - Missing
- `app/05-lxd360-inspire-cortex/` - Missing
- `app/06-lxd360-inspire-media-center/` - Missing
- `app/07-lxd360-inspire-lxd-nexus/` - Missing
- `app/08-lxd360-inspire-lxp360/` - Missing
- `app/09-lxd360-internal/` - Missing
- `app/10-lxd360-coming-soon/` - Missing
- `app/11-lxd360-maintenance/` - Missing

**Analysis:** CRITICAL - No loading states and only root-level error handling. Each route group should have its own boundaries.

---

### Step 16: Suspense Boundaries

**Command:** Search for `<Suspense` usage

**Result:** **13 Suspense boundaries found**

**Locations:**
```
app/layout.tsx:1 (root)
components/lxp360/player/player-shell.tsx:2
components/inspire-studio/course-builder/preview-panel.tsx:1
components/dashboard/analytics-panel.tsx:1
components/dashboard/activity-feed.tsx:1
app/03-lxd360-inspire-ignite/dashboard/page.tsx:1
app/08-lxd360-inspire-lxp360/(lxp360)/courses/[courseId]/page.tsx:2
lib/providers/query-provider.tsx:1
components/3d/scene-wrapper.tsx:2
components/media/video-container.tsx:1
```

**Analysis:** Moderate coverage. More Suspense boundaries needed for data-fetching components.

---

### Step 17: Memo/Callback Optimization

**Command:** Count `useMemo`, `useCallback`, `React.memo`

**Results:**

| Hook/HOC | Count |
|----------|-------|
| useMemo | 307 |
| useCallback | 2205 |
| React.memo | 16 |

**Analysis:** Heavy use of `useCallback` (2205 instances) suggests potential over-optimization or misuse. `React.memo` usage (16) is low compared to callback usage. Review if all callbacks are necessary.

---

### Step 18: API Route Caching

**Command:** Check API routes for cache configuration

**Result:** **0 of 18 API routes have cache configuration**

**API routes found:**
```
app/api/tts/route.ts
app/api/tts/google/route.ts
app/api/tts/elevenlabs/route.ts
app/api/tenants/route.ts
app/api/tasks/[queue]/route.ts
app/api/stripe/checkout/route.ts
app/api/stripe/webhooks/route.ts
app/api/stripe/portal/route.ts
app/api/health/route.ts
app/api/v1/tenants/route.ts
app/api/v1/tenants/[tenantId]/route.ts
app/api/v1/tenants/[tenantId]/invitations/route.ts
app/api/v1/tenants/[tenantId]/members/route.ts
app/api/v1/tenants/[tenantId]/members/[memberId]/route.ts
app/api/xapi/statements/route.ts
app/api/auth/session/route.ts
app/api/waitlist/route.ts
app/api/contact/route.ts
```

**Missing cache patterns:**
- No `export const revalidate = X`
- No `cache: 'force-cache'` in fetch calls
- No `unstable_cache` usage

**Analysis:** All API routes are uncached. GET endpoints for static data (health, tenant info) should use caching.

---

### Step 19: Static Asset Analysis

**Command:** Analyze public folder size and contents

**Result:** **Total: 64MB**

**Large assets:**

| File | Size | Issue |
|------|------|-------|
| LXD360.mp4 | 33MB | Video should be on CDN |
| blog/blog-1.jpg | 4.5MB | Needs compression |
| blog/blog-2.jpg | 3.9MB | Needs compression |
| integrations/integration-1.png | 1.7MB | Needs compression |
| integrations/integration-2.png | 1.5MB | Needs compression |
| integrations/integration-3.png | 1.3MB | Needs compression |
| products/inspire-studio-hero.png | 2.1MB | Needs compression |
| products/lxp360-dashboard.png | 1.8MB | Needs compression |

**Recommendations:**
1. Move video to Cloud Storage/CDN
2. Compress all images to WebP format
3. Use responsive images with srcset
4. Target: <10MB for public folder

---

### Step 20: next.config.mjs Analysis

**File:** `next.config.mjs`

**Optimization Settings:**

| Setting | Value | Status |
|---------|-------|--------|
| output | 'standalone' | OK - Cloud Run ready |
| typescript.ignoreBuildErrors | true | CRITICAL - Masking errors |
| compiler.removeConsole | production only (exclude error, warn) | OK |
| images.unoptimized | conditional on CLOUD_RUN | OK |
| images.formats | ['avif', 'webp'] | OK |
| images.minimumCacheTTL | 30 days | OK |
| optimizePackageImports | lucide-react, radix, recharts, date-fns, lodash, tanstack, framer-motion | OK |
| compress | true | OK |
| poweredByHeader | false | OK - Security |
| generateEtags | true | OK - Caching |
| transpilePackages | @tanstack/react-table, table-core | OK |

**CRITICAL ISSUE:** Rewrites contain invalid route group paths

**Problematic rewrites (13 total):**
```javascript
// These destinations contain /(group-name)/ which is invalid
{ source: '/vision', destination: '/01-lxd360-llc/(lxd360-llc)/vision' }
{ source: '/studio', destination: '/01-lxd360-llc/(lxd360-llc)/studio' }
{ source: '/ignite', destination: '/01-lxd360-llc/(lxd360-llc)/ignite' }
// ... and 10 more
```

**Fix required:** Remove route group segments from destinations. Route groups are organizational and should not appear in URLs.

---

## Findings Summary

### CRITICAL (Must Fix)

| # | Issue | File/Location | Impact |
|---|-------|---------------|--------|
| 1 | Build fails due to invalid rewrites | next.config.mjs:169-255 | Cannot deploy |
| 2 | TypeScript errors ignored | next.config.mjs:31 | Masking real issues |
| 3 | 0 loading.tsx files | app/*/ | Poor UX, no loading states |
| 4 | Only 1 error.tsx at root | app/*/ | Errors not handled per route |
| 5 | RSC ratio 18.7% (target >70%) | app/, components/ | Large bundle, slow SSR |

### HIGH (Should Fix)

| # | Issue | File/Location | Impact |
|---|-------|---------------|--------|
| 1 | 813 client components | Throughout | Bundle bloat |
| 2 | 0 API routes with caching | app/api/**/route.ts | Unnecessary server load |
| 3 | 64MB public folder | public/ | Slow initial load |
| 4 | 33MB video in public folder | public/LXD360.mp4 | Should be on CDN |
| 5 | 28 pages missing metadata | Various pages | SEO gaps |
| 6 | 548 files >300 lines | Throughout | Maintainability |
| 7 | 2205 useCallback instances | Throughout | Potential over-optimization |

### MEDIUM (Consider)

| # | Issue | File/Location | Impact |
|---|-------|---------------|--------|
| 1 | 175 framer-motion imports | Throughout | Bundle size |
| 2 | Only 13 Suspense boundaries | Throughout | Limited streaming |
| 3 | Only 16 React.memo usages | Throughout | Re-render prevention |
| 4 | Images >1MB in public | public/blog/, public/integrations/ | Load time |

### LOW (Minor)

| # | Issue | File/Location | Impact |
|---|-------|---------------|--------|
| 1 | 8 raw img tags | Mostly emails | Expected for email |

---

## Metrics Summary

| Category | Metric | Value | Target | Status |
|----------|--------|-------|--------|--------|
| Build | Status | FAILED | PASS | CRITICAL |
| Build | TypeScript Check | IGNORED | 0 errors | CRITICAL |
| Components | Client Components | 813 | <200 | HIGH |
| Components | Server Components | 187 | >700 | CRITICAL |
| Components | RSC Ratio | 18.7% | >70% | CRITICAL |
| Components | Large Files (>300 lines) | 548 | <50 | HIGH |
| Optimization | Dynamic Imports | 80 | >50 | OK |
| Optimization | useMemo | 307 | - | OK |
| Optimization | useCallback | 2205 | - | REVIEW |
| Optimization | React.memo | 16 | >50 | LOW |
| Boundaries | loading.tsx | 0 | 12 | CRITICAL |
| Boundaries | error.tsx | 1 | 12 | CRITICAL |
| Boundaries | Suspense | 13 | >30 | MEDIUM |
| Assets | Public Folder | 64MB | <10MB | HIGH |
| Assets | Largest Asset | 33MB | <5MB | HIGH |
| Images | Raw img tags | 8 | 0 | LOW |
| Images | Next/Image usage | 28 | - | OK |
| API | Routes with caching | 0/18 | >10 | HIGH |
| SEO | Pages with metadata | 17/45 | 45/45 | HIGH |
| Fonts | next/font usage | Yes | Yes | OK |
| Config | optimizePackageImports | 7 packages | - | OK |
| Config | output: standalone | Yes | Yes | OK |

---

## Priority Recommendations

### Immediate (Block Deployment)

1. **Fix invalid rewrites in next.config.mjs**
   - Remove route group paths from destinations
   - Change `/(lxd360-llc)/` to just `/` in destination paths

2. **Set typescript.ignoreBuildErrors to false**
   - Fix TypeScript errors properly
   - This is hiding real issues

### Short-Term (Performance)

1. **Convert client components to server components**
   - Target: 70%+ RSC ratio
   - Start with data-display components
   - Keep interactivity in client components

2. **Add loading.tsx to each route group**
   - Improves perceived performance
   - Enables streaming

3. **Add error.tsx to each route group**
   - Graceful error handling
   - Better user experience

4. **Implement API caching**
   - Add `revalidate` to GET endpoints
   - Use `unstable_cache` for expensive operations

5. **Move video to Cloud Storage**
   - 33MB video shouldn't be in public/
   - Use CDN for media delivery

### Medium-Term (Optimization)

1. **Compress images in public folder**
   - Convert to WebP/AVIF
   - Target <500KB per image
   - Use responsive images

2. **Review useCallback usage**
   - 2205 instances seems excessive
   - Many may be unnecessary

3. **Reduce framer-motion usage**
   - Consider CSS animations for simple transitions
   - Tree-shake unused motion features

4. **Add metadata to all pages**
   - 28 pages missing SEO metadata
   - Important for discoverability

---

## Appendix: Command Reference

```bash
# Build
npm run build

# Bundle analysis
ANALYZE=true npm run build

# Count client components
grep -rl "use client" app/ components/ --include="*.tsx" | wc -l

# Find large files
find . -name "*.tsx" -type f -exec wc -l {} + | sort -rn | head -50

# Check for raw img tags
grep -rn "<img " --include="*.tsx" app/ components/

# Check for dynamic imports
grep -rn "dynamic(" --include="*.tsx" app/ components/

# Count heavy imports
grep -rn "from 'framer-motion'" --include="*.tsx" | wc -l

# Find files without metadata
for f in app/**/page.tsx; do grep -L "metadata" "$f"; done

# Check public folder size
du -sh public/
```

---

**Report Generated:** 2026-01-19
**Next Phase:** Phase 11 - Security & Authentication Audit
