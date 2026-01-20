# Phase 7: Dead Code & Unused Exports Audit Report

**Project:** LXD360 Ecosystem
**Audit Date:** 2026-01-19
**Auditor:** Claude Code
**Phase:** 7 - Dead Code & Unused Exports

---

## Executive Summary

| Metric | Count | Status |
|--------|-------|--------|
| Archive folders | 1 | 37KB |
| Total exports | 6,813 | Baseline |
| Unused components (sample) | 26 | REVIEW |
| Unused hooks | 10 | REVIEW |
| Unused lib files | 29 | REVIEW |
| Deprecated markers | 12 | ADDRESS |
| Biome lint errors | 43 | FIX |
| Empty/minimal files | 10 | REVIEW |
| Duplicate file names | 30+ | CONSOLIDATE |
| Orphan pages | 16 | REVIEW |
| Unused dependencies | 4+ | REMOVE |
| Large files (>50KB) | 4 | REVIEW |
| Git repository | N/A | NOT FOUND |

**Dead Code Score: 6/10**

---

## Step 1: Archive Folder Inventory

### Archive Folders Found

| Path | Size |
|------|------|
| ./app/01-lxd360-llc/(lxd360-llc)/_archive | 37KB |

### Archive Contents

```
_archive/
├── blog/
├── media/
├── pricing/
└── status/
```

**Assessment:** Small archive folder (37KB). Contains 4 subdirectories of archived pages.

---

## Step 2: Unused Exports Scan

### Total Exports in Codebase

**Count: 6,813 exports**

### Export Distribution (Sample)

```
app/00-lxd360-auth/login/page.tsx:3:export const dynamic = 'force-dynamic';
app/00-lxd360-auth/reset-password/page.tsx:3:export const dynamic = 'force-dynamic';
app/00-lxd360-auth/sign-up/page.tsx:3:export const dynamic = 'force-dynamic';
app/01-lxd360-llc/(lxd360-llc)/ignite/page.tsx:4:export const metadata: Metadata = {...}
app/02-lxd360-inspire-studio/(inspire-studio)/components/AssessmentModal.tsx:11:export function AssessmentModal...
app/02-lxd360-inspire-studio/(inspire-studio)/components/CourseBuilderWizard.tsx:15:export function CourseBuilderWizard()
app/api/accessibility/check/route.ts:1:export const dynamic = 'force-dynamic';
app/api/og/route.tsx:7:export const runtime = 'edge';
app/api/tts/elevenlabs/route.ts:9:export const runtime = 'nodejs';
```

**Note:** Many exports are Next.js conventions (`dynamic`, `metadata`, `runtime`).

---

## Step 3: Unused Components Check

### Potentially Unused Components (26 found)

| Component | Location |
|-----------|----------|
| AccessibleNav | components/accessibility/ |
| AccessibleVideo | components/accessibility/ |
| SkipLinks | components/accessibility/ |
| neuronaut-modal | components/ai/ |
| cursor | components/animate-ui/ |
| fireworks | components/animate-ui/ |
| hexagon | components/animate-ui/ |
| stars | components/animate-ui/ |
| cursor | components/animate-ui/ (duplicate) |
| liquid | components/animate-ui/ |
| ripple | components/animate-ui/ |
| fade | components/animate-ui/ |
| magnetic | components/animate-ui/ |
| shine | components/animate-ui/ |
| tilt | components/animate-ui/ |
| files | components/animate-ui/ |
| counting-number | components/animate-ui/ |
| morphing | components/animate-ui/ |
| rolling | components/animate-ui/ |
| rotating | components/animate-ui/ |
| shimmering | components/animate-ui/ |
| sliding-number | components/animate-ui/ |
| splitting | components/animate-ui/ |
| typing | components/animate-ui/ |
| media-player | components/ |
| BillingSettings | components/billing/ |

**Note:** Many animate-ui components may be used dynamically or conditionally.

---

## Step 4: Unused Hooks

### All Hooks (10 total - all potentially unused)

| Hook | File |
|------|------|
| useClickOutside | hooks/useClickOutside.ts |
| useClickOutside | hooks/useClickOutside.tsx (duplicate) |
| use-controlled-state | hooks/use-controlled-state.tsx |
| use-is-in-view | hooks/use-is-in-view.tsx |
| use-local-storage | hooks/use-local-storage.ts |
| use-mobile | hooks/use-mobile.ts |
| use-rbac | hooks/use-rbac.ts |
| use-toast | hooks/use-toast.ts |
| useXAPITracking | hooks/useXAPITracking.ts |
| use-xr-session | hooks/use-xr-session.ts |

**Note:** Hooks may be imported via barrel files or used in components not scanned.

---

## Step 5: Unused Lib Files

### Potentially Unused Library Files (29)

| File | Category |
|------|----------|
| color-utils | lib/accessibility/ |
| focus-management | lib/accessibility/ |
| blocks | lib/admin/ |
| courses | lib/admin/ |
| courses.types | lib/admin/ |
| lessons | lib/admin/ |
| waitlist | lib/admin/ |
| bkt | lib/adaptive-learning/ |
| cognitive-load | lib/adaptive-learning/ |
| hooks | lib/adaptive-learning/ |
| service | lib/adaptive-learning/ |
| data | lib/admin/ |
| error-logger | lib/admin/ |
| gcp-metrics | lib/admin/ |
| stripe-metrics | lib/admin/ |
| types | lib/admin/ |
| demo-orchestrator | lib/ai/ |
| designer-agent | lib/ai/ |
| learner-agent | lib/ai/ |
| types | lib/ai/ |
| xapi-generator | lib/ai/ |
| cost-tracker | lib/ai/ |
| gemini-client | lib/ai/ |
| google-cloud-ai | lib/ai/ |
| learning | lib/ai/ |
| rate-limiter | lib/ai/ |
| token-counter | lib/ai/ |
| types | lib/ai/ |
| unified-client | lib/ai/ |
| vertex-client | lib/ai/ |

---

## Step 6: Deprecated Code Markers

### Deprecated Items Found (12)

| File | Line | Content |
|------|------|---------|
| app/api/tenants/route.ts | 4 | `'X-API-Deprecation': 'This endpoint is deprecated. Use /api/v1/tenants'` |
| app/api/users/route.ts | 4 | `'X-API-Deprecation': 'This endpoint is deprecated. Use /api/v1/users'` |
| app/api/xapi/route.ts | 4 | `'X-API-Deprecation': 'This endpoint is deprecated. Use /api/v1/xapi'` |
| components/studio/video-scenario/index.ts | 16 | `// Legacy export (deprecated)` |
| lib/admin/error-logger.ts | 78 | Error handling check for deprecated |
| lib/storage/utils.ts | 341 | `@deprecated Use Cloud Storage URLs instead` |
| lib/stripe/config.ts | 34 | `@deprecated Use getStripe() function instead` |
| lib/xapi/lrs-client.ts | 666 | `@deprecated Use createLRSClient with TrackingConfig` |
| lib/xapi/lrs-client.ts | 806 | `@deprecated Use initializeTrackingClient instead` |
| providers/xapi-provider.tsx | 341 | `// LRS Configuration (legacy - deprecated)` |
| providers/xapi-provider.tsx | 342 | `/** @deprecated Use trackingConfig instead */` |
| types/domain.ts | 60 | `// LEGACY ROLES (deprecated, kept for backwards compatibility)` |

---

## Step 7: Unreachable Code

### Analysis

No significant unreachable code patterns detected. Most `return` and `throw` statements are followed by valid code (new functions, closing braces, etc.).

---

## Step 8 & 9: Biome Lint Results

### Summary

```
Checked 2120 files in 506ms
Found 43 errors
Found 14 warnings
Found 4 infos
```

### Error Categories

| Category | Issue |
|----------|-------|
| Import organization | Imports need reordering |
| Math.pow | Should use ** operator |
| Other lint issues | Various code style issues |

**Recommendation:** Run `npm run lint:fix` to auto-fix most issues.

---

## Step 10: Empty/Minimal Files

### Files Under 50 Characters (10)

| File | Lines | Chars |
|------|-------|-------|
| components/inspire-ignite/player/store/index.ts | 1 | 28 |
| components/lms/navigation/index.ts | 1 | 37 |
| components/studio/lesson-editor/ai-toolbar/index.ts | 1 | 45 |
| components/studio/lesson-editor/preview/index.ts | 1 | 42 |
| components/studio/lesson-editor/token-counter/index.ts | 1 | 42 |
| components/studio/lesson-editor/variables/index.ts | 1 | 46 |
| components/tenant/lxp360/navigation/index.ts | 1 | 37 |
| lib/inspire-ignite/block-schema/index.ts | 2 | 41 |
| lib/inspire-ignite/types/index.ts | 1 | 20 |
| types/firestore/index.ts | 1 | 19 |

**Assessment:** These are barrel files (re-exports). Normal pattern for module organization.

---

## Step 11: Duplicate File Names

### Most Duplicated File Names

| Filename | Count | Concern |
|----------|-------|---------|
| index.ts | 187 | Normal (barrel files) |
| page.tsx | 41 | Normal (Next.js pages) |
| types.ts | 33 | Normal (type definitions) |
| route.ts | 19 | Normal (API routes) |
| layout.tsx | 11 | Normal (Next.js layouts) |
| **VideoPlayer.tsx** | **4** | **CONSOLIDATE** |
| utils.ts | 4 | May need review |
| service.ts | 4 | May need review |
| hooks.ts | 4 | May need review |
| data.ts | 4 | May need review |
| client.ts | 4 | May need review |
| **StatCard.tsx** | **3** | **CONSOLIDATE** |
| ProgressRing.tsx | 3 | May need review |
| ProgressBar.tsx | 3 | May need review |
| LessonSidebar.tsx | 3 | May need review |
| CognitiveMeter.tsx | 3 | May need review |
| button.tsx | 3 | May need review |

### VideoPlayer.tsx Locations (4 copies)

```
./components/content-blocks/media/VideoPlayer.tsx
./components/inspire-ignite/player/learner/VideoPlayer.tsx
./components/lms/player/VideoPlayer.tsx
./components/tenant/lxp360/player/VideoPlayer.tsx
```

### StatCard.tsx Locations (3 copies)

```
./components/dashboard/templates/StatCard.tsx
./components/lms/cards/StatCard.tsx
./components/tenant/lxp360/cards/StatCard.tsx
```

**Recommendation:** Consolidate duplicate components into shared locations.

---

## Step 12: Orphan Pages

### Pages Without Internal Links (16)

| Page Directory |
|----------------|
| (inspire-studio) |
| (lxd360-llc) |
| 03-lxd360-inspire-ignite |
| 05-lxd360-inspire-cortex |
| 06-lxd360-inspire-media-center |
| 07-lxd360-inspire-lxd-nexus |
| 09-lxd360-kinetix-gear |
| 11-lxd360-maintenance |
| ai-micro-learning |
| blog |
| branding |
| consulting |
| ignite |
| kinetix |
| lesson |
| neuro |

**Note:** Route groups (parentheses) are expected to not have direct links. Some pages may be accessed via external links or direct URL navigation.

---

## Step 13: Unused Dependencies

### Dependency Usage Check (Sample)

| Dependency | Imports | Status |
|------------|---------|--------|
| @dnd-kit/core | 7 | ✅ Used |
| @getbrevo/brevo | 2 | ✅ Used |
| @photo-sphere-viewer/core | 0 | ⚠️ UNUSED |
| recharts | 10 | ✅ Used |
| zustand | 14 | ✅ Used |
| zod | 12 | ✅ Used |
| uuid | 7 | ✅ Used |
| three | 10 | ✅ Used |
| stripe | 13 | ✅ Used |
| @react-pdf/renderer | 0 | ⚠️ UNUSED |
| @tanstack/react-table | 0 | ⚠️ UNUSED |
| lottie-react | 0 | ⚠️ UNUSED |
| react-markdown | 1 | ✅ Used |
| cmdk | 1 | ✅ Used |

### Potentially Unused Dependencies

1. **@photo-sphere-viewer/core** - No imports found
2. **@react-pdf/renderer** - No imports found
3. **@tanstack/react-table** - No imports found
4. **lottie-react** - No imports found

**Recommendation:** Verify these packages aren't dynamically imported before removing.

---

## Step 14: Large Files

### Files Over 50KB (4)

| File | Size |
|------|------|
| types/blocks.ts | 58KB |
| lib/inspire/types/inspire-types.ts | 57KB |
| lib/inspire/engine/inspire-framework.ts | 55KB |
| lib/inspire/types/wizard-config.ts | 54KB |

**Assessment:** These are type definition and configuration files. Size is reasonable for comprehensive type systems.

---

## Step 15: Stale Branches

### Git Repository Status

```
fatal: not a git repository (or any of the parent directories): .git
```

**Status:** Not a git repository. Unable to check for stale branches.

**Recommendation:** Verify on the source repository.

---

## Summary

### Code Cleanup Priorities

#### HIGH Priority

| Task | Count | Effort |
|------|-------|--------|
| Fix Biome lint errors | 43 | Low |
| Address deprecated code | 12 | Medium |
| Remove unused dependencies | 4 | Low |
| Consolidate duplicate components | 4+ | Medium |

#### MEDIUM Priority

| Task | Count | Effort |
|------|-------|--------|
| Review unused hooks | 10 | Low |
| Review unused lib files | 29 | Medium |
| Review orphan pages | 16 | Low |

#### LOW Priority

| Task | Count | Effort |
|------|-------|--------|
| Review unused components | 26 | Medium |
| Review empty files | 10 | Low |

### Estimated Cleanup Impact

| Action | Files Affected | Size Reduction |
|--------|---------------|----------------|
| Remove unused deps | package.json | ~500KB node_modules |
| Consolidate VideoPlayer | 4 → 1 | ~3 files |
| Consolidate StatCard | 3 → 1 | ~2 files |
| Remove unused hooks | 10 | ~10 files |
| Fix deprecated code | 12 | 0 (refactor) |

---

## Metrics Summary

| Metric | Count | Target | Status |
|--------|-------|--------|--------|
| Archive folders | 1 (37KB) | Minimal | ✅ GOOD |
| Unused components | 26 | 0 | REVIEW |
| Unused hooks | 10 | 0 | REVIEW |
| Unused lib files | 29 | 0 | REVIEW |
| Deprecated markers | 12 | 0 | ADDRESS |
| Biome lint errors | 43 | 0 | FIX |
| Empty/minimal files | 10 | Expected | ✅ OK |
| Duplicate components | 30+ | Minimize | CONSOLIDATE |
| Orphan pages | 16 | Verify | REVIEW |
| Unused dependencies | 4 | 0 | REMOVE |
| Large files (>50KB) | 4 | Minimal | ✅ OK |
| Git repository | N/A | Present | ⚠️ MISSING |

---

## Recommendations

### Immediate Actions

1. **Run Biome fix:**
   ```bash
   npm run lint:fix
   ```

2. **Remove unused dependencies:**
   ```bash
   npm uninstall @photo-sphere-viewer/core @react-pdf/renderer @tanstack/react-table lottie-react
   ```
   *(Verify not dynamically imported first)*

3. **Consolidate duplicate components:**
   - Create shared VideoPlayer in `components/shared/`
   - Create shared StatCard in `components/shared/`
   - Update imports across codebase

### Medium-Term Actions

4. **Review and remove deprecated code:**
   - Create API v1 routes
   - Remove deprecated API headers
   - Update LRS client usage

5. **Review unused hooks directory:**
   - Verify usage patterns
   - Delete confirmed unused hooks

6. **Add internal links to orphan pages:**
   - Ensure all pages are navigable
   - Add to navigation menus

### Long-Term Actions

7. **Audit unused lib files:**
   - Document purpose of each file
   - Remove confirmed dead code
   - Consolidate similar functionality

8. **Initialize git repository:**
   - This appears to be a fresh copy without git
   - Initialize or clone from source

---

**Report Generated:** 2026-01-19
**Tool:** Claude Code Dead Code Audit
**Files Analyzed:** 2,120+ source files
