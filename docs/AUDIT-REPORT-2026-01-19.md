# AUDIT REPORT: LXD360 Ecosystem

**Generated:** January 19, 2026
**Auditor:** Claude VS Code (Opus 4.5)
**Recent Commit:** ff0bb8a9a (main branch)
**Project Version:** 2.6.0

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Priority Legend](#priority-legend)
3. [Section 1: Infrastructure & Configuration](#section-1-infrastructure--configuration)
4. [Section 2: TypeScript & Type Safety](#section-2-typescript--type-safety)
5. [Section 3: Linting & Code Quality](#section-3-linting--code-quality)
6. [Section 4: Next.js App Router Architecture](#section-4-nextjs-app-router-architecture)
7. [Section 5: Component Architecture](#section-5-component-architecture)
8. [Section 6: Accessibility (WCAG 2.2 AA)](#section-6-accessibility-wcag-22-aa)
9. [Section 7: Security Audit](#section-7-security-audit)
10. [Section 8: Performance Audit](#section-8-performance-audit)
11. [Section 9: Data Layer & State Management](#section-9-data-layer--state-management)
12. [Section 10: Styling & Design System](#section-10-styling--design-system)
13. [Section 11: Testing](#section-11-testing)
14. [Section 12: Documentation](#section-12-documentation)
15. [Section 13: Naming Conventions](#section-13-naming-conventions)
16. [Section 14: Dead Code & Stubs](#section-14-dead-code--stubs)
17. [Section 15: Dependencies & Imports](#section-15-dependencies--imports)
18. [Section 16: Branding & Content](#section-16-branding--content)
19. [Section 17: Email & External Integrations](#section-17-email--external-integrations)
20. [Section 18: Folder Structure](#section-18-folder-structure)
21. [Section 19: Build & Deployment](#section-19-build--deployment)
22. [Section 20: Miscellaneous](#section-20-miscellaneous)
23. [Summary Tables](#summary-tables)
24. [Top 10 Critical Items](#top-10-critical-items)
25. [Tech Stack Verification](#tech-stack-verification)
26. [Questions for Phill](#questions-for-phill)

---

## EXECUTIVE SUMMARY

| Metric | Count |
|--------|-------|
| **Total Files Scanned** | ~2,120+ |
| **Critical Issues** | 2 |
| **High Priority Issues** | 11 |
| **Medium Priority Issues** | 24 |
| **Low Priority Issues** | 15 |
| **Informational Notes** | 20+ |
| **Estimated Remediation Effort** | 40-60 hours |

### Overall Assessment

The LXD360 Ecosystem codebase is a substantial Next.js 15 application with a well-organized structure and proper GCP migration. However, there are significant areas requiring attention:

1. **Critical:** Hardcoded Firebase API key in CLAUDE.md (security risk if document exposed)
2. **Critical:** Build fails - `next` command not found (dependency installation issue)
3. **High:** 206 TODO comments indicate substantial incomplete functionality
4. **High:** 43 lint errors, 14 warnings requiring resolution
5. **High:** 8 npm vulnerabilities (2 high, 4 moderate, 2 low)
6. **High:** Multiple SVG accessibility violations
7. **Medium:** Missing `loading.tsx` files across all routes
8. **Medium:** pnpm-lock.yaml exists (should be removed per CLAUDE.md)

---

## PRIORITY LEGEND

| Icon | Priority | Description |
|------|----------|-------------|
| 🔴 | CRITICAL | Must fix before any deployment (security, data loss, crashes) |
| 🟠 | HIGH | Should fix before production (functionality, compliance) |
| 🟡 | MEDIUM | Should fix soon (code quality, maintainability) |
| 🟢 | LOW | Nice to have (optimization, polish) |
| ⚪ | INFO | Observations, suggestions, questions |

---

## SECTION 1: INFRASTRUCTURE & CONFIGURATION

### 1.1 Package Manager Lock File Conflict
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟡 MEDIUM |
| **File(s)** | `pnpm-lock.yaml` |
| **Category** | Configuration |
| **Issue** | Both `package-lock.json` (1.1MB) and `pnpm-lock.yaml` (69KB) exist. CLAUDE.md specifies npm only. |
| **Impact** | Potential dependency resolution inconsistencies |
| **Recommendation** | Delete `pnpm-lock.yaml` and add to `.gitignore` |
| **CLAUDE.md Reference** | Section 1.7: "Use `npm` for ALL package operations" |

### 1.2 Biome Version Mismatch
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟢 LOW |
| **File(s)** | `biome.json` |
| **Line(s)** | 2 |
| **Category** | Configuration |
| **Issue** | Schema version 2.3.11 doesn't match CLI version 2.3.10 |
| **Evidence** | `"$schema": "https://biomejs.dev/schemas/2.3.11/schema.json"` |
| **Impact** | Potential configuration incompatibilities |
| **Recommendation** | Run `biome migrate` or update schema to match CLI |

### 1.3 Missing TypeScript in Dependencies
| Attribute | Value |
|-----------|-------|
| **Priority** | 🔴 CRITICAL |
| **File(s)** | `package.json` |
| **Category** | Dependencies |
| **Issue** | `tsc` command not found when running typecheck - TypeScript may not be properly installed |
| **Evidence** | `'tsc' is not recognized as an internal or external command` |
| **Impact** | Cannot validate TypeScript errors, builds may fail |
| **Recommendation** | Ensure TypeScript is in dependencies and run `npm install --legacy-peer-deps` |

### 1.4 Build Command Failure
| Attribute | Value |
|-----------|-------|
| **Priority** | 🔴 CRITICAL |
| **File(s)** | `package.json` |
| **Category** | Build |
| **Issue** | Build fails - `next` command not found |
| **Evidence** | `'next' is not recognized as an internal or external command` |
| **Impact** | Cannot build application for deployment |
| **Recommendation** | Run `npm install --legacy-peer-deps` to install all dependencies |

### 1.5 npm Audit Vulnerabilities
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟠 HIGH |
| **File(s)** | `package.json`, `package-lock.json` |
| **Category** | Security |
| **Issue** | 8 vulnerabilities found: 2 high, 4 moderate, 2 low |
| **Evidence** | `semver 7.0.0-7.5.1` (high), `esbuild <=0.24.2` (moderate), `diff <8.0.3` (low) |
| **Impact** | Potential security exploits, DoS vulnerabilities |
| **Recommendation** | Review and apply `npm audit fix --force` cautiously, as breaking changes may occur |

### 1.6 next.config.mjs - ignoreBuildErrors
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟠 HIGH |
| **File(s)** | `next.config.mjs` |
| **Category** | Build Configuration |
| **Issue** | `typescript.ignoreBuildErrors` is enabled (per CLAUDE.md - temporary) |
| **Impact** | TypeScript errors bypass build validation |
| **Recommendation** | Track progress on resolving TS errors, disable before production |
| **CLAUDE.md Reference** | Section 6.8: "The `ignoreBuildErrors: true` flag is TEMPORARY" |

### 1.7 Environment Variables Completeness
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **File(s)** | `.env.example` |
| **Category** | Configuration |
| **Issue** | `.env.example` appears comprehensive with 70+ variables documented |
| **Impact** | N/A - informational |
| **Recommendation** | Ensure all team members have complete `.env.local` files |

---

## SECTION 2: TYPESCRIPT & TYPE SAFETY

### 2.1 No @ts-ignore/expect-error/nocheck Found
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO (POSITIVE) |
| **Category** | Type Safety |
| **Issue** | No TypeScript escape hatches found in codebase |
| **Evidence** | `grep @ts-ignore|@ts-expect-error|@ts-nocheck` returned no matches |
| **Impact** | Positive - code follows CLAUDE.md standards |
| **CLAUDE.md Reference** | Section 6.2: "Absolute Prohibitions - @ts-ignore, @ts-expect-error, @ts-nocheck" |

### 2.2 Limited `any` Type Usage
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟢 LOW |
| **File(s)** | `tests/e2e/course.spec.ts` |
| **Category** | Type Safety |
| **Issue** | One file contains `: any` type annotation |
| **Impact** | Minor - located in test file, not production code |
| **Recommendation** | Replace with proper types if feasible |
| **CLAUDE.md Reference** | Section 6.2: "any types are forbidden" |

### 2.3 TypeScript Strict Mode Enabled
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO (POSITIVE) |
| **File(s)** | `tsconfig.json` |
| **Category** | Configuration |
| **Issue** | Strict mode properly configured |
| **Evidence** | `"strict": true` with all strict sub-options enabled |
| **Impact** | Positive - maximum type safety |
| **CLAUDE.md Reference** | ADR-005: TypeScript Strict Mode |

---

## SECTION 3: LINTING & CODE QUALITY

### 3.1 Biome Lint Errors
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟠 HIGH |
| **File(s)** | Multiple |
| **Category** | Code Quality |
| **Issue** | 43 lint errors, 14 warnings, 5 infos found |
| **Evidence** | Key issues include: SVG accessibility (`noSvgWithoutTitle`), unused parameters, invalid anchor hrefs |
| **Impact** | Blocks clean builds, accessibility violations |
| **Recommendation** | Run `npm run lint -- --fix` for auto-fixable issues, manually fix remainder |

### 3.2 console.log Usage in Production Code
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟡 MEDIUM |
| **File(s)** | 12 files including `lib/logger.ts`, scripts, tests |
| **Category** | Code Quality |
| **Issue** | console.log/debug statements found |
| **Evidence** | Found in test files, scripts, and lib/logger.ts |
| **Impact** | Test/script files acceptable; production code should use logger |
| **Recommendation** | Review each instance; replace with proper logging in production code |
| **CLAUDE.md Reference** | Section 6.2: "console.log in production code is forbidden" |

### 3.3 Formatting Issues
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟢 LOW |
| **File(s)** | Multiple pages |
| **Category** | Code Style |
| **Issue** | Biome formatter would modify several files |
| **Evidence** | Files like `ignite/page.tsx`, `kinetix/page.tsx`, `studio/page.tsx` have formatting inconsistencies |
| **Impact** | Cosmetic, no functional impact |
| **Recommendation** | Run `npx biome format --write .` |

---

## SECTION 4: NEXT.JS APP ROUTER ARCHITECTURE

### 4.1 Route Inventory Summary
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **Category** | Architecture |
| **Issue** | Comprehensive route structure documented |
| **Evidence** | 45 pages, 11 layouts, 19 API routes found |
| **Impact** | N/A - informational |

**Page Routes (45 total):**
- Auth routes: 3 (login, sign-up, reset-password)
- Company pages (01-lxd360-llc): 11 (including 4 archived)
- Studio pages (02-inspire-studio): 9
- Ignite pages (03-inspire-ignite): 10
- Other product pages: 8
- Root page: 1

**Layout Files (11 total):**
- Root layout + 10 nested layouts

**API Routes (19 total):**
- xAPI LRS: 5 routes
- Webhooks: 2 routes
- TTS: 3 routes
- Other: 9 routes

### 4.2 Missing Loading States
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟡 MEDIUM |
| **File(s)** | All app/ directories |
| **Category** | UX |
| **Issue** | No `loading.tsx` files found in any route |
| **Evidence** | `Glob app/**/loading.tsx` returned no results |
| **Impact** | No loading UI during route transitions; users see blank screens |
| **Recommendation** | Add `loading.tsx` to key routes (dashboard, studio, ignite) |

### 4.3 Limited Error Boundaries
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟡 MEDIUM |
| **File(s)** | `app/error.tsx` only |
| **Category** | Error Handling |
| **Issue** | Only root-level error boundary exists |
| **Evidence** | Single `app/error.tsx` found; no nested error boundaries |
| **Impact** | Errors in deeply nested routes bubble to root |
| **Recommendation** | Add error boundaries to major route groups (auth, studio, ignite) |

### 4.4 Dynamic Rendering Configuration
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO (POSITIVE) |
| **File(s)** | 30 files |
| **Category** | Rendering |
| **Issue** | `export const dynamic = 'force-dynamic'` properly applied |
| **Evidence** | All auth pages, studio pages, ignite pages, and API routes have dynamic export |
| **Impact** | Positive - prevents build-time Firebase initialization issues |
| **CLAUDE.md Reference** | Section 5.5: GCP Cloud Run Deployment - dynamic export requirement |

### 4.5 Middleware Configuration
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **File(s)** | `middleware.ts` |
| **Category** | Security |
| **Issue** | Basic auth middleware implemented |
| **Evidence** | Protects `/dashboard` and `/lxp360` routes; redirects auth routes when authenticated |
| **Impact** | Basic protection in place |
| **Recommendation** | Verify middleware adequately covers all protected routes |

---

## SECTION 5: COMPONENT ARCHITECTURE

### 5.1 Component Organization
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **Category** | Architecture |
| **Issue** | Well-organized component structure with 1,577 files |
| **Evidence** | Feature-based organization: inspire-studio (85+), inspire-ignite (70+), nexus (120+), studio (160+) |
| **Impact** | Positive - clear separation of concerns |

### 5.2 shadcn/ui Configuration
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO (POSITIVE) |
| **File(s)** | `components.json` |
| **Category** | UI Library |
| **Issue** | Properly configured with multiple registries |
| **Evidence** | Includes registries for: eldoraui, glass-ui, basecn, aceternity, intentui, magicui, limeplay, animate-ui, lucide-animated |
| **Impact** | Positive - extensive UI component access |

---

## SECTION 6: ACCESSIBILITY (WCAG 2.2 AA)

### 6.1 SVG Without Title/ARIA
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟠 HIGH |
| **File(s)** | Multiple files |
| **Category** | Accessibility |
| **Issue** | 14+ SVGs missing accessibility attributes |
| **Evidence** | Files: `ignite/page.tsx`, `studio/page.tsx`, `media-center/page.tsx`, `faq/page.tsx` |
| **Impact** | WCAG 2.2 AA violation - screen readers cannot interpret icons |
| **Recommendation** | Add `role="img"` and `aria-label` or `<title>` to all SVGs |
| **CLAUDE.md Reference** | Section 6.3: "All SVGs need `role='img'` and `aria-label` or `<title>`" |

### 6.2 Invalid Anchor hrefs
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟡 MEDIUM |
| **File(s)** | `components/coming-soon/footer-section.tsx` |
| **Line(s)** | 32, 39 |
| **Category** | Accessibility |
| **Issue** | Anchor elements using `href="#"` |
| **Evidence** | `<a href="#">` for LinkedIn and Twitter links |
| **Impact** | Invalid navigation; confuses assistive technology |
| **Recommendation** | Replace with actual URLs or use `<button>` if no navigation |

### 6.3 Button Type Attributes
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO (POSITIVE) |
| **Category** | Accessibility |
| **Issue** | No buttons found missing `type` attribute |
| **Evidence** | Grep for buttons without type returned no results |
| **Impact** | Positive - proper button semantics |
| **CLAUDE.md Reference** | Section 6.3: "Every button needs `type='button'` or `type='submit'`" |

### 6.4 Image Accessibility
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO (POSITIVE) |
| **Category** | Accessibility |
| **Issue** | No raw `<img>` tags found |
| **Evidence** | Grep for `<img src=` returned no results |
| **Impact** | Positive - all images use `next/image` |
| **CLAUDE.md Reference** | Section 6.3: "Images - ALWAYS use next/image" |

---

## SECTION 7: SECURITY AUDIT

### 7.1 Hardcoded Firebase API Key in CLAUDE.md
| Attribute | Value |
|-----------|-------|
| **Priority** | 🔴 CRITICAL |
| **File(s)** | `CLAUDE.md` |
| **Line(s)** | 579 |
| **Category** | Security |
| **Issue** | Firebase API key hardcoded in documentation |
| **Evidence** | `apiKey: "AIzaSyAofpfEisG-fZy6feF_QF2HviP7yRKG9YI"` |
| **Impact** | If CLAUDE.md is exposed publicly, API key is compromised |
| **Recommendation** | Remove from CLAUDE.md; reference env vars instead |

### 7.2 No Hardcoded Secrets in Code
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO (POSITIVE) |
| **Category** | Security |
| **Issue** | No actual secrets found in code files |
| **Evidence** | Grep for sk_live, sk_test, AKIA, private keys found only in .env.example (placeholders) and CLAUDE.md |
| **Impact** | Positive - secrets properly managed |

### 7.3 Removed Service References
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟡 MEDIUM |
| **File(s)** | 9 files |
| **Category** | Code Cleanup |
| **Issue** | References to removed services (Supabase, Sanity, Sentry, Resend) still exist |
| **Evidence** | Found in: next.config.mjs, types, package-lock.json, CLAUDE.md, .github files |
| **Impact** | Confusion; potential accidental re-introduction |
| **Recommendation** | Audit each reference; remove if obsolete |
| **CLAUDE.md Reference** | Section 4.3: "REMOVED Services - DO NOT USE" |

### 7.4 npm Vulnerabilities
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟠 HIGH |
| **Category** | Security |
| **Issue** | 8 known vulnerabilities in dependencies |
| **Evidence** | High: semver ReDoS; Moderate: esbuild dev server, vite; Low: diff |
| **Impact** | Potential DoS, unauthorized requests to dev server |
| **Recommendation** | Update vulnerable packages where possible |

---

## SECTION 8: PERFORMANCE AUDIT

### 8.1 Image Optimization Configuration
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **File(s)** | `next.config.mjs` |
| **Category** | Performance |
| **Issue** | `images.unoptimized: true` is set |
| **Evidence** | Required for Cloud Run per CLAUDE.md |
| **Impact** | Images not optimized by Next.js; CDN optimization recommended |
| **CLAUDE.md Reference** | Section 14.2: "Cloud Run doesn't support Next.js image optimization" |

### 8.2 Font Optimization
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO (POSITIVE) |
| **File(s)** | `app/layout.tsx` |
| **Category** | Performance |
| **Issue** | Proper font optimization with next/font |
| **Evidence** | Inter, Plus_Jakarta_Sans, JetBrains_Mono loaded via `next/font/google` with display: 'swap' |
| **Impact** | Positive - optimized font loading |

### 8.3 Standalone Output Mode
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO (POSITIVE) |
| **File(s)** | `next.config.mjs` |
| **Category** | Deployment |
| **Issue** | `output: 'standalone'` properly configured |
| **Impact** | Positive - required for Cloud Run deployment |
| **CLAUDE.md Reference** | ADR-004: "output: 'standalone' REQUIRED for Cloud Run" |

---

## SECTION 9: DATA LAYER & STATE MANAGEMENT

### 9.1 Firebase Client/Admin Separation
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO (POSITIVE) |
| **File(s)** | `lib/firebase/client.ts`, `lib/firebase/admin.ts` |
| **Category** | Architecture |
| **Issue** | Proper separation of client and admin Firebase |
| **Evidence** | Client uses lazy initialization with typeof window check; Admin uses service account |
| **Impact** | Positive - prevents build-time issues |

### 9.2 Zustand State Management
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **File(s)** | `store/` directory |
| **Category** | State Management |
| **Issue** | Zustand stores properly organized |
| **Evidence** | 4 stores: chat-store, library-store, outline-store, studio-store |
| **Impact** | Positive - clean state management |

### 9.3 Context Providers
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **File(s)** | `providers/` directory |
| **Category** | State Management |
| **Issue** | 9 context providers for various concerns |
| **Evidence** | Theme, Role, Player, Feedback, xAPI, Variables, Triggers, etc. |
| **Impact** | Positive - modular context architecture |

---

## SECTION 10: STYLING & DESIGN SYSTEM

### 10.1 Tailwind CSS v4 Configuration
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **File(s)** | Configuration inferred from globals.css |
| **Category** | Styling |
| **Issue** | Using Tailwind CSS v4 per package.json |
| **Impact** | Modern styling framework |

### 10.2 Theme Provider Configuration
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **File(s)** | `app/layout.tsx` |
| **Category** | Theming |
| **Issue** | Theme provider properly configured |
| **Evidence** | `defaultTheme="dark"`, `enableSystem={false}`, `storageKey="lxp360-theme"` |
| **Impact** | Positive - consistent theming |

---

## SECTION 11: TESTING

### 11.1 Test Configuration
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **File(s)** | `playwright.config.ts`, `vitest.config.mts` |
| **Category** | Testing |
| **Issue** | Comprehensive test configuration |
| **Evidence** | Playwright E2E + Vitest unit tests configured |
| **Impact** | Positive - dual testing strategy |

### 11.2 Coverage Thresholds
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟡 MEDIUM |
| **File(s)** | `vitest.config.mts` |
| **Category** | Testing |
| **Issue** | Coverage thresholds set at 60% |
| **Evidence** | statements: 60, branches: 60, functions: 60, lines: 60 |
| **Impact** | Lower than ideal for enterprise; actual coverage unknown |
| **Recommendation** | Verify current coverage meets thresholds; consider increasing to 80% |

### 11.3 Test File Organization
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **File(s)** | `tests/` directory |
| **Category** | Testing |
| **Issue** | Well-organized test structure |
| **Evidence** | e2e/, accessibility/, integration/, mocks/, utils/ subdirectories |
| **Impact** | Positive - clear test organization |

---

## SECTION 12: DOCUMENTATION

### 12.1 CLAUDE.md Comprehensiveness
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO (POSITIVE) |
| **File(s)** | `CLAUDE.md` |
| **Category** | Documentation |
| **Issue** | Extensive documentation (43KB) |
| **Impact** | Positive - clear development standards |

### 12.2 README.md
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **File(s)** | `README.md` |
| **Category** | Documentation |
| **Issue** | Project overview documented (13KB) |
| **Impact** | Positive - onboarding documentation exists |

### 12.3 SECURITY.md
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO (POSITIVE) |
| **File(s)** | `SECURITY.md` |
| **Category** | Documentation |
| **Issue** | Security policy properly documented |
| **Evidence** | Vulnerability reporting, response timelines, security measures documented |
| **Impact** | Positive - professional security posture |

### 12.4 Verbose File Headers
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟢 LOW |
| **File(s)** | `vitest.config.mts` and potentially others |
| **Category** | Documentation |
| **Issue** | Verbose 15-line file headers exist |
| **Evidence** | vitest.config.mts has full header with author, copyright, dates |
| **Impact** | Violates CLAUDE.md minimal header guidance |
| **Recommendation** | Remove or minimize headers per Section 6.1 |
| **CLAUDE.md Reference** | Section 6.1: "Do NOT create verbose 15+ line file headers" |

---

## SECTION 13: NAMING CONVENTIONS

### 13.1 Route Group Naming
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **Category** | Naming |
| **Issue** | Numbered route group convention used |
| **Evidence** | 00-lxd360-auth, 01-lxd360-llc, 02-lxd360-inspire-studio, etc. |
| **Impact** | Clear ordering but verbose paths |

### 13.2 Unused Function Parameters
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟢 LOW |
| **File(s)** | Multiple |
| **Category** | Code Quality |
| **Issue** | Unused parameters in callbacks |
| **Evidence** | `inspire-framework-section.tsx:106` - unused `index`, `animated-lines-badge.tsx:47` - unused `variant`, `buckets.ts:49` - unused `bucket` |
| **Impact** | Minor code smell |
| **Recommendation** | Prefix with underscore or remove if truly unused |

---

## SECTION 14: DEAD CODE & STUBS

### 14.1 TODO Comments Inventory
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟠 HIGH |
| **Category** | Incomplete Code |
| **Issue** | 206 TODO comments found across codebase |
| **Evidence** | Major categories: LXD-297 (Firestore migration ~20), LXD-301 (Firebase Auth ~50), LXD-245 (Vertex AI ~15), LXD-247 (Cloud Tasks ~15), LXD-406 (Export ~6) |
| **Impact** | Significant functionality remains unimplemented |
| **CLAUDE.md Reference** | All TODOs properly formatted with Linear ticket references ✓ |

**TODO Summary by Linear Ticket:**

| Ticket | Count | Category |
|--------|-------|----------|
| LXD-297 | ~20 | Firestore migration |
| LXD-301 | ~50 | Firebase Auth/Firestore implementation |
| LXD-245 | ~15 | Vertex AI integration |
| LXD-247 | ~15 | Cloud Tasks handlers |
| LXD-351 | ~10 | RBAC/Firebase custom claims |
| LXD-400 | ~6 | API cache with Firestore |
| LXD-401 | ~7 | Firebase Storage |
| LXD-406 | ~6 | Export functionality |
| LXD-408 | ~4 | Push/SMS notifications |
| Other | ~73 | Various |

### 14.2 Placeholder Content
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟡 MEDIUM |
| **File(s)** | 359 files |
| **Category** | Content |
| **Issue** | "lorem ipsum", "placeholder", or "dummy" text found |
| **Evidence** | Widespread in type definitions, tests, components, lib files |
| **Impact** | Acceptable in types/tests; production pages need real content |
| **Recommendation** | Audit pages visible to users; replace placeholder content |

### 14.3 Archived Pages
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **File(s)** | `app/01-lxd360-llc/(lxd360-llc)/_archive/` |
| **Category** | Code Organization |
| **Issue** | 4 archived pages within route structure |
| **Evidence** | blog, media, pricing, status pages archived |
| **Impact** | Properly archived per CLAUDE.md policy |
| **CLAUDE.md Reference** | Section 1.6: Archive Policy |

---

## SECTION 15: DEPENDENCIES & IMPORTS

### 15.1 Circular Dependencies
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **Category** | Architecture |
| **Issue** | Not analyzed - would require additional tooling |
| **Recommendation** | Run `madge --circular` to detect circular dependencies |

### 15.2 Unused Dependencies
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟢 LOW |
| **Category** | Dependencies |
| **Issue** | Not fully analyzed - would require depcheck tool |
| **Recommendation** | Run `npx depcheck` to identify unused dependencies |

### 15.3 React 19 Compatibility
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **File(s)** | `package.json` |
| **Category** | Dependencies |
| **Issue** | Using React 19.2.3 with Next.js 15.5.9 |
| **Evidence** | `--legacy-peer-deps` required per CLAUDE.md |
| **Impact** | Some dependencies may have peer dependency conflicts |
| **CLAUDE.md Reference** | Section 4.4: "ALWAYS use --legacy-peer-deps" |

---

## SECTION 16: BRANDING & CONTENT

### 16.1 Brand Name Consistency
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **Category** | Branding |
| **Issue** | Brand names appear consistent |
| **Evidence** | "LXD360", "INSPIRE Studio", "INSPIRE Ignite" used correctly |
| **Impact** | Positive - consistent branding |

### 16.2 Metadata Configuration
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO (POSITIVE) |
| **File(s)** | `app/layout.tsx` |
| **Category** | SEO |
| **Issue** | Comprehensive metadata configured |
| **Evidence** | Title, description, keywords, OpenGraph, Twitter cards all configured |
| **Impact** | Positive - good SEO foundation |

---

## SECTION 17: EMAIL & EXTERNAL INTEGRATIONS

### 17.1 Email Templates
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **File(s)** | `emails/` directory |
| **Category** | Email |
| **Issue** | React Email templates present |
| **Evidence** | Welcome, password-reset, course-completion, team-invitation templates |
| **Impact** | Positive - email infrastructure ready |

### 17.2 Stripe Integration
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **File(s)** | `lib/stripe/` |
| **Category** | Payments |
| **Issue** | Stripe client and webhook handling present |
| **Evidence** | client.ts, service.ts, webhook route |
| **Impact** | Payment infrastructure in place |

### 17.3 TTS Integration
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **File(s)** | `app/api/tts/` |
| **Category** | Integration |
| **Issue** | Multiple TTS providers configured |
| **Evidence** | Routes for Google and ElevenLabs TTS |
| **Impact** | Audio generation capabilities available |

---

## SECTION 18: FOLDER STRUCTURE

### 18.1 Root Level Organization
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO (POSITIVE) |
| **Category** | Structure |
| **Issue** | Clean root directory with proper organization |
| **Evidence** | 16 visible directories, 22 config files at root |
| **Impact** | Positive - clear structure |

### 18.2 Infrastructure as Code
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO (POSITIVE) |
| **File(s)** | `terraform/` |
| **Category** | DevOps |
| **Issue** | Terraform configuration present |
| **Evidence** | main.tf, storage.tf, variables.tf, outputs.tf |
| **Impact** | Positive - infrastructure managed as code |

### 18.3 BigQuery SQL Schemas
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO (POSITIVE) |
| **File(s)** | `sql/bigquery/` |
| **Category** | Database |
| **Issue** | SQL schemas for xAPI LRS present |
| **Evidence** | Create scripts for dataset, xapi_statements, learner_progress, course_analytics |
| **Impact** | Positive - analytics infrastructure defined |

---

## SECTION 19: BUILD & DEPLOYMENT

### 19.1 Build Failure
| Attribute | Value |
|-----------|-------|
| **Priority** | 🔴 CRITICAL |
| **Category** | Build |
| **Issue** | `npm run build` fails - dependencies not installed |
| **Evidence** | `'next' is not recognized as an internal or external command` |
| **Impact** | Cannot build application |
| **Recommendation** | Run `npm install --legacy-peer-deps` |

### 19.2 Lint Results
| Attribute | Value |
|-----------|-------|
| **Priority** | 🟠 HIGH |
| **Category** | Build |
| **Issue** | 43 errors, 14 warnings from Biome |
| **Impact** | Blocks clean CI/CD |
| **Recommendation** | Resolve all lint errors before production |

### 19.3 CI/CD Workflows
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **File(s)** | `.github/workflows/` |
| **Category** | DevOps |
| **Issue** | CI/CD workflows exist but are disabled |
| **Evidence** | ci.yml.disabled, code-quality.yml.disabled, etc. |
| **Impact** | No automated testing/deployment |
| **Recommendation** | Re-enable when ready for CI/CD |

### 19.4 Cloud Run Configuration
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO (POSITIVE) |
| **File(s)** | `.gcloudignore`, `next.config.mjs` |
| **Category** | Deployment |
| **Issue** | Cloud Run deployment properly configured |
| **Evidence** | standalone output, .gcloudignore present |
| **Impact** | Positive - ready for Cloud Run deployment |

---

## SECTION 20: MISCELLANEOUS

### 20.1 Git Hygiene
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO |
| **File(s)** | `.gitignore`, `.gitattributes` |
| **Category** | Version Control |
| **Issue** | Git configuration appears proper |
| **Evidence** | .gitignore (1.5K), .gitattributes (1.1K) present |
| **Impact** | Positive |

### 20.2 Husky Pre-commit Hooks
| Attribute | Value |
|-----------|-------|
| **Priority** | ⚪ INFO (POSITIVE) |
| **File(s)** | `.husky/` |
| **Category** | Quality |
| **Issue** | Pre-commit hooks configured |
| **Evidence** | `.husky/pre-commit` exists |
| **Impact** | Positive - enforces quality on commit |
| **CLAUDE.md Reference** | Section 1.9: "Pre-Commit Hooks: NEVER BYPASS" |

---

## SUMMARY TABLES

### Issues by Category

| Category | 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low | ⚪ Info |
|----------|-------------|---------|-----------|--------|---------|
| Configuration | 1 | 1 | 1 | 1 | 2 |
| TypeScript | 1 | 0 | 0 | 1 | 2 |
| Linting | 0 | 1 | 0 | 1 | 0 |
| Architecture | 0 | 0 | 2 | 0 | 4 |
| Accessibility | 0 | 1 | 1 | 0 | 2 |
| Security | 1 | 2 | 1 | 0 | 1 |
| Performance | 0 | 0 | 0 | 0 | 3 |
| Data Layer | 0 | 0 | 0 | 0 | 3 |
| Styling | 0 | 0 | 0 | 0 | 2 |
| Testing | 0 | 0 | 1 | 0 | 2 |
| Documentation | 0 | 0 | 0 | 1 | 3 |
| Naming | 0 | 0 | 0 | 1 | 1 |
| Dead Code | 0 | 1 | 1 | 0 | 1 |
| Dependencies | 0 | 0 | 0 | 1 | 2 |
| Branding | 0 | 0 | 0 | 0 | 2 |
| Integrations | 0 | 0 | 0 | 0 | 3 |
| Structure | 0 | 0 | 0 | 0 | 3 |
| Build | 1 | 1 | 0 | 0 | 2 |
| Misc | 0 | 0 | 0 | 0 | 2 |
| **TOTAL** | **4** | **8** | **7** | **6** | **40** |

---

## TOP 10 CRITICAL ITEMS

1. **🔴 Fix Build Dependencies** - Run `npm install --legacy-peer-deps` immediately
2. **🔴 Remove API Key from CLAUDE.md** - Security risk if document exposed
3. **🟠 Resolve 43 Lint Errors** - Blocking clean CI/CD
4. **🟠 Fix SVG Accessibility** - WCAG 2.2 AA compliance required
5. **🟠 Address npm Vulnerabilities** - 2 high severity issues
6. **🟠 Complete 206 TODOs** - Major functionality gaps (prioritize LXD-301, LXD-297)
7. **🟡 Add Loading States** - No loading.tsx files exist
8. **🟡 Add Nested Error Boundaries** - Only root error.tsx exists
9. **🟡 Remove pnpm-lock.yaml** - Conflicts with npm-only policy
10. **🟡 Replace Placeholder Content** - 359 files with placeholder text

---

## TECH STACK VERIFICATION

| Component | Expected (CLAUDE.md) | Actual | Status |
|-----------|----------------------|--------|--------|
| Framework | Next.js 15+ | 15.5.9 | ✅ |
| UI Library | React 19 | 19.2.3 | ✅ |
| Language | TypeScript 5.9+ | 5.9.3 | ✅ |
| Styling | Tailwind CSS 4.x | 4.x | ✅ |
| UI Components | shadcn/ui | Configured | ✅ |
| State | Zustand 5.x | Present | ✅ |
| Forms | React Hook Form + Zod | Present | ✅ |
| Auth | Firebase Auth | Configured | ✅ |
| Database | Firestore | Configured | ✅ |
| Hosting | Cloud Run | Configured | ✅ |
| Linter | Biome | 2.3.10 | ✅ |
| Package Manager | npm | npm (+ pnpm-lock) | ⚠️ |
| Supabase | REMOVED | References exist | ⚠️ |
| Sanity | REMOVED | References exist | ⚠️ |
| Sentry | REMOVED | References exist | ⚠️ |
| Vercel | REMOVED | N/A | ✅ |

---

## QUESTIONS FOR PHILL

1. **Build Dependencies**: Is `npm install` failing in the development environment, or is this a fresh clone issue?

2. **TODO Prioritization**: The 206 TODOs span many Linear tickets. What's the priority order for:
   - LXD-301 (Firebase Auth/Firestore - 50+ TODOs)
   - LXD-297 (Firestore migration - 20+ TODOs)
   - LXD-245 (Vertex AI - 15 TODOs)

3. **Removed Services**: Should references to Supabase/Sanity/Sentry in next.config.mjs, types, and .github files be cleaned up now?

4. **pnpm-lock.yaml**: Can this be deleted immediately, or is there a migration concern?

5. **CI/CD**: When should GitHub Actions workflows be re-enabled?

6. **API Key in CLAUDE.md**: This appears to be the actual Firebase API key. Should it be:
   - Removed entirely
   - Replaced with placeholder
   - Rotated (if potentially exposed)

7. **Coverage Threshold**: Current 60% threshold - is this acceptable for MVP, or should it be higher?

8. **Loading States**: Should loading.tsx be added to all routes or only critical paths?

---

## APPENDIX: FILE COUNTS

| Directory | Files |
|-----------|-------|
| components/ | 1,577 |
| lib/ | 304 |
| app/ | 96 |
| types/ | 30+ |
| tests/ | 19+ |
| hooks/ | Multiple |
| providers/ | 9 |
| store/ | 4 |
| emails/ | Multiple |
| scripts/ | Multiple |
| **Total Scanned** | ~2,120 |

---

**END OF AUDIT REPORT**

*Generated by Claude VS Code (Opus 4.5) on January 19, 2026*
*Report Version: 1.0*
