# Phase 5: Routes & Architecture Audit Report

**Project:** LXD360 Ecosystem
**Audit Date:** 2026-01-19
**Auditor:** Claude Code
**Phase:** 5 of 5 - Routes & Architecture

---

## Executive Summary

| Metric | Count | Notes |
|--------|-------|-------|
| Total Pages | 45 | page.tsx files |
| Total Layouts | 11 | layout.tsx files |
| Total API Routes | 18 | route.ts files |
| Client Components | 1,320 | 'use client' directive |
| Server Actions | 5 | 'use server' directive |
| Missing Metadata | 28 | 62% of pages |
| Loading Files | 0 | ⚠️ None found |
| Error Boundaries | 2 | error.tsx + global-error.tsx |
| Route Groups | 12 | Numbered prefix convention |
| Dynamic Routes | 1 | [queue] only |

**Architecture Score: 7/10**

---

## Step 1: App Directory Structure

### Directory Count
**Total Directories:** 78

### Route Group Hierarchy
```
app/
├── 00-lxd360-auth/              # Authentication
│   ├── callback/
│   ├── login/
│   ├── reset-password/
│   └── sign-up/
├── 01-lxd360-llc/               # Company/Marketing
│   └── (lxd360-llc)/
│       ├── _archive/
│       ├── contact/
│       ├── ignite/
│       ├── kinetix/
│       ├── legal/
│       ├── neuro/
│       ├── products/
│       ├── studio/
│       └── vision/
├── 02-lxd360-inspire-studio/    # Course Authoring
│   └── (inspire-studio)/
│       ├── ai-micro-learning/
│       ├── ai-studio/
│       ├── components/
│       ├── course-builder/
│       ├── inspire/
│       ├── lesson/
│       ├── projects/
│       ├── review/
│       └── settings/
├── 03-lxd360-inspire-ignite/    # LMS/Learner
│   ├── dashboard/
│   ├── learner/
│   │   └── player/
│   └── manage/
│       └── organization-admin/
├── 04-lxd360-inspire-cognitive/ # (Empty)
├── 05-lxd360-inspire-cortex/    # Analytics
├── 06-lxd360-inspire-media-center/
│   └── podcast/
├── 07-lxd360-inspire-lxd-nexus/ # Social/Community
├── 08-lxd360-neuro-strategy/    # Consulting
│   └── consulting/
├── 09-lxd360-kinetix-gear/      # Store
├── 10-lxd360-coming-soon/       # Placeholder
├── 11-lxd360-maintenance/       # Maintenance
│   └── faq/
└── api/                         # API Routes
```

---

## Step 2: Route Group Inventory

### Top-Level Route Folders
| Folder | Purpose | Has Layout |
|--------|---------|------------|
| 00-lxd360-auth | Authentication | ✅ |
| 01-lxd360-llc | Company/Marketing | ✅ |
| 02-lxd360-inspire-studio | Course Authoring | ✅ |
| 03-lxd360-inspire-ignite | LMS/Learner | ✅ |
| 04-lxd360-inspire-cognitive | Cognitive Tools | ❌ |
| 05-lxd360-inspire-cortex | Analytics | ✅ |
| 06-lxd360-inspire-media-center | Media Hub | ✅ |
| 07-lxd360-inspire-lxd-nexus | Community | ✅ |
| 08-lxd360-neuro-strategy | Consulting | ✅ |
| 09-lxd360-kinetix-gear | Store | ❌ |
| 10-lxd360-coming-soon | Placeholder | ❌ |
| 11-lxd360-maintenance | Maintenance | ✅ |
| api | API Routes | N/A |

### Parenthetical Route Groups (Standard Next.js)
| Group | Location |
|-------|----------|
| (lxd360-llc) | app/01-lxd360-llc/ |
| (inspire-studio) | app/02-lxd360-inspire-studio/ |

**⚠️ Non-Standard Convention:** Uses numbered prefixes instead of standard parenthetical groups.

---

## Step 3: page.tsx Inventory

### Total Pages: 45

### By Route Group
| Group | Pages | Files |
|-------|-------|-------|
| 00-lxd360-auth | 3 | login, reset-password, sign-up |
| 01-lxd360-llc | 13 | home, contact, legal, products, etc. |
| 02-lxd360-inspire-studio | 9 | studio tools, settings, etc. |
| 03-lxd360-inspire-ignite | 10 | dashboard, learner, admin |
| 04-lxd360-inspire-cognitive | 0 | (empty) |
| 05-lxd360-inspire-cortex | 1 | analytics |
| 06-lxd360-inspire-media-center | 2 | hub, podcast |
| 07-lxd360-inspire-lxd-nexus | 1 | community |
| 08-lxd360-neuro-strategy | 1 | consulting |
| 09-lxd360-kinetix-gear | 1 | store |
| 10-lxd360-coming-soon | 0 | (empty) |
| 11-lxd360-maintenance | 2 | main, faq |
| Root | 1 | app/page.tsx |

### Complete Page List
```
app/page.tsx
app/00-lxd360-auth/login/page.tsx
app/00-lxd360-auth/reset-password/page.tsx
app/00-lxd360-auth/sign-up/page.tsx
app/01-lxd360-llc/(lxd360-llc)/page.tsx
app/01-lxd360-llc/(lxd360-llc)/contact/page.tsx
app/01-lxd360-llc/(lxd360-llc)/ignite/page.tsx
app/01-lxd360-llc/(lxd360-llc)/kinetix/page.tsx
app/01-lxd360-llc/(lxd360-llc)/legal/page.tsx
app/01-lxd360-llc/(lxd360-llc)/neuro/page.tsx
app/01-lxd360-llc/(lxd360-llc)/products/ignite/page.tsx
app/01-lxd360-llc/(lxd360-llc)/products/inspire-studio/page.tsx
app/01-lxd360-llc/(lxd360-llc)/studio/page.tsx
app/01-lxd360-llc/(lxd360-llc)/vision/page.tsx
app/01-lxd360-llc/(lxd360-llc)/_archive/blog/page.tsx
app/01-lxd360-llc/(lxd360-llc)/_archive/media/page.tsx
app/01-lxd360-llc/(lxd360-llc)/_archive/pricing/page.tsx
app/01-lxd360-llc/(lxd360-llc)/_archive/status/page.tsx
app/02-lxd360-inspire-studio/(inspire-studio)/page.tsx
app/02-lxd360-inspire-studio/(inspire-studio)/ai-micro-learning/page.tsx
app/02-lxd360-inspire-studio/(inspire-studio)/ai-studio/page.tsx
app/02-lxd360-inspire-studio/(inspire-studio)/course-builder/page.tsx
app/02-lxd360-inspire-studio/(inspire-studio)/inspire/page.tsx
app/02-lxd360-inspire-studio/(inspire-studio)/lesson/page.tsx
app/02-lxd360-inspire-studio/(inspire-studio)/projects/page.tsx
app/02-lxd360-inspire-studio/(inspire-studio)/review/page.tsx
app/02-lxd360-inspire-studio/(inspire-studio)/settings/page.tsx
app/03-lxd360-inspire-ignite/page.tsx
app/03-lxd360-inspire-ignite/dashboard/page.tsx
app/03-lxd360-inspire-ignite/learner/page.tsx
app/03-lxd360-inspire-ignite/learner/player/page.tsx
app/03-lxd360-inspire-ignite/manage/organization-admin/page.tsx
app/03-lxd360-inspire-ignite/manage/organization-admin/billing/page.tsx
app/03-lxd360-inspire-ignite/manage/organization-admin/branding/page.tsx
app/03-lxd360-inspire-ignite/manage/organization-admin/reports/page.tsx
app/03-lxd360-inspire-ignite/manage/organization-admin/settings/page.tsx
app/03-lxd360-inspire-ignite/manage/organization-admin/users/page.tsx
app/05-lxd360-inspire-cortex/page.tsx
app/06-lxd360-inspire-media-center/page.tsx
app/06-lxd360-inspire-media-center/podcast/page.tsx
app/07-lxd360-inspire-lxd-nexus/page.tsx
app/08-lxd360-neuro-strategy/consulting/page.tsx
app/09-lxd360-kinetix-gear/page.tsx
app/11-lxd360-maintenance/page.tsx
app/11-lxd360-maintenance/faq/page.tsx
```

---

## Step 4: layout.tsx Inventory

### Total Layouts: 11

| Layout | Purpose |
|--------|---------|
| app/layout.tsx | Root layout |
| app/00-lxd360-auth/layout.tsx | Auth layout |
| app/01-lxd360-llc/(lxd360-llc)/layout.tsx | Marketing layout |
| app/02-lxd360-inspire-studio/(inspire-studio)/layout.tsx | Studio layout |
| app/03-lxd360-inspire-ignite/layout.tsx | Ignite layout |
| app/03-lxd360-inspire-ignite/learner/layout.tsx | Learner nested layout |
| app/05-lxd360-inspire-cortex/layout.tsx | Cortex layout |
| app/06-lxd360-inspire-media-center/layout.tsx | Media layout |
| app/07-lxd360-inspire-lxd-nexus/layout.tsx | Nexus layout |
| app/08-lxd360-neuro-strategy/layout.tsx | Neuro layout |
| app/11-lxd360-maintenance/layout.tsx | Maintenance layout |

### Missing Layouts (Inherits Parent)
- 04-lxd360-inspire-cognitive
- 09-lxd360-kinetix-gear
- 10-lxd360-coming-soon

---

## Step 5: Loading & Error Files

### Loading Files
```
TOTAL: 0 ⚠️
```
**No loading.tsx files found.** Consider adding for better UX during page transitions.

### Error Files
| File | Purpose |
|------|---------|
| app/error.tsx | Route-level error boundary |
| app/global-error.tsx | Root error boundary |

### Not Found
| File | Purpose |
|------|---------|
| app/not-found.tsx | 404 page |

---

## Step 6: API Routes

### Total API Routes: 18

### By Category
| Category | Count | Routes |
|----------|-------|--------|
| Accessibility | 1 | check |
| Demo | 2 | run, scenarios |
| Dev | 1 | email-preview |
| Monitoring | 1 | root |
| Tasks | 1 | [queue] (dynamic) |
| Tenants | 1 | root |
| TTS | 3 | root, elevenlabs, google |
| Users | 1 | root |
| Webhooks | 2 | auth, stripe |
| xAPI | 5 | root, state, statements, activities/profile, agents/profile |

### Complete Route List
```
app/api/accessibility/check/route.ts
app/api/demo/run/route.ts
app/api/demo/scenarios/route.ts
app/api/dev/email-preview/route.ts
app/api/monitoring/route.ts
app/api/tasks/[queue]/route.ts
app/api/tenants/route.ts
app/api/tts/route.ts
app/api/tts/elevenlabs/route.ts
app/api/tts/google/route.ts
app/api/users/route.ts
app/api/webhooks/auth/route.ts
app/api/webhooks/stripe/route.ts
app/api/xapi/route.ts
app/api/xapi/activities/profile/route.ts
app/api/xapi/agents/profile/route.ts
app/api/xapi/state/route.ts
app/api/xapi/statements/route.ts
```

---

## Step 7: Dynamic Routes

### Total Dynamic Routes: 1

| Route | Pattern | Purpose |
|-------|---------|---------|
| app/api/tasks/[queue]/route.ts | [queue] | Dynamic task queue |

**⚠️ Limited Dynamic Segments:**
- No [courseId], [lessonId], [userId] routes
- Most routes are static paths
- May need dynamic routes for content URLs

---

## Step 8: Parallel & Private Folders

### Parallel Routes (@)
```
TOTAL: 0
```
No parallel route slots found.

### Private Folders (_)
| Folder | Purpose |
|--------|---------|
| app/01-lxd360-llc/(lxd360-llc)/_archive | Archived pages |

**Contents of _archive:**
- blog/page.tsx
- media/page.tsx
- pricing/page.tsx
- status/page.tsx

---

## Step 9: Components Directory

### Total Component Folders: 47
### Total Component Files: 1,432

### Top-Level Categories
| Category | Description |
|----------|-------------|
| accessibility | A11y utilities |
| adaptive-learning | AI learning |
| admin | Admin panels |
| ai | AI components |
| analytics | Charts/stats |
| animate-ui | Animations |
| authoring | Content creation |
| basic-player | Simple player |
| billing | Payment UI |
| blocks | Content blocks |
| branding | Theme/brand |
| coming-soon | Placeholder |
| content-blocks | Rich content |
| dashboard | Dashboard UI |
| error | Error UI |
| gdpr | Privacy/consent |
| icons | Icon library |
| inspire | INSPIRE framework |
| inspire-ignite | LMS components |
| inspire-studio | Authoring tools |
| internal | Internal admin |
| layout | Layout components |
| learning | Learning UI |
| library | Media library |
| limeplay | Video player |
| linear-player | Linear player |
| lms | LMS core |
| marketing | Marketing pages |
| media-library | Media browser |
| monitoring | Monitoring UI |
| motion-primitives | Animations |
| nexus | Community UI |
| player | Course player |
| podcast | Podcast UI |
| pricing | Pricing UI |
| rbac | Role-based access |
| ribbon | Toolbar ribbon |
| seo | SEO components |
| shared | Shared utilities |
| status | Status pages |
| studio | Studio tools |
| tenant | Multi-tenant |
| ui | shadcn/ui base |

---

## Step 10: Lib Directory

### Total Lib Files: 304
### Total Lib Directories: 48

### Module Categories
| Module | Purpose |
|--------|---------|
| accessibility | A11y utilities |
| actions | Server actions |
| adaptive-learning | BKT algorithm |
| admin | Admin services |
| agents | AI agents |
| ai | Gemini/Vertex AI |
| analytics | BigQuery |
| auth | Authentication |
| billing | Stripe billing |
| branding | Theming |
| cache | API caching |
| cloud-tasks | GCP Tasks |
| cognitive-load | Load calc |
| config | App config |
| constants | Constants |
| content | Content utils |
| core | Core utilities |
| crm | CRM integration |
| email | Brevo email |
| errors | Error handling |
| export | Export utils |
| features | Feature flags |
| firebase | Firebase SDK |
| firestore | Firestore utils |
| fonts | Font loading |
| google | Google APIs |
| hooks | React hooks |
| inspire | INSPIRE engine |
| inspire-ignite | LMS engine |
| inspire-studio | Authoring |
| integrations | Third-party |
| media | Media utils |
| mock-data | Mock data |
| monitoring | Monitoring |
| notifications | Notifications |
| performance | Perf utils |
| pricing | Pricing logic |
| publishing | SCORM/xAPI |
| rbac | Permissions |
| seo | SEO utils |
| services | Services |
| storage | GCS storage |
| stripe | Stripe SDK |
| studio | Studio logic |
| threejs | 3D utilities |
| tts | Text-to-speech |
| types | TypeScript types |
| xapi | xAPI/LRS |

---

## Step 11: Server Actions

### Total Server Actions: 5

| File | Line | Purpose |
|------|------|---------|
| lib/actions/blocks.ts | 1 | Block mutations |
| lib/actions/courses.ts | 1 | Course mutations |
| lib/actions/lessons.ts | 1 | Lesson mutations |
| lib/actions/waitlist.ts | 1 | Waitlist signup |
| lib/rbac/permissions.ts | 3 | Permission checks |

---

## Step 12: Client Components

### Total Client Components: 1,320

### Distribution
| Location | Approximate Count |
|----------|-------------------|
| components/ | ~1,295 |
| app/ pages | ~25 |

**Note:** High client component count is typical for interactive learning platforms.

---

## Step 13: Metadata Check

### Pages Missing Metadata: 28 of 45 (62%)

### Missing Metadata Files
```
app/page.tsx
app/00-lxd360-auth/login/page.tsx
app/00-lxd360-auth/reset-password/page.tsx
app/00-lxd360-auth/sign-up/page.tsx
app/01-lxd360-llc/(lxd360-llc)/page.tsx
app/01-lxd360-llc/(lxd360-llc)/contact/page.tsx
app/01-lxd360-llc/(lxd360-llc)/legal/page.tsx
app/01-lxd360-llc/(lxd360-llc)/neuro/page.tsx
app/01-lxd360-llc/(lxd360-llc)/products/ignite/page.tsx
app/01-lxd360-llc/(lxd360-llc)/products/inspire-studio/page.tsx
app/01-lxd360-llc/(lxd360-llc)/_archive/media/page.tsx
app/01-lxd360-llc/(lxd360-llc)/_archive/pricing/page.tsx
app/02-lxd360-inspire-studio/(inspire-studio)/page.tsx
app/02-lxd360-inspire-studio/(inspire-studio)/ai-micro-learning/page.tsx
app/02-lxd360-inspire-studio/(inspire-studio)/ai-studio/page.tsx
app/02-lxd360-inspire-studio/(inspire-studio)/course-builder/page.tsx
app/02-lxd360-inspire-studio/(inspire-studio)/inspire/page.tsx
app/02-lxd360-inspire-studio/(inspire-studio)/lesson/page.tsx
app/02-lxd360-inspire-studio/(inspire-studio)/projects/page.tsx
app/02-lxd360-inspire-studio/(inspire-studio)/review/page.tsx
app/02-lxd360-inspire-studio/(inspire-studio)/settings/page.tsx
app/03-lxd360-inspire-ignite/page.tsx
app/03-lxd360-inspire-ignite/dashboard/page.tsx
app/03-lxd360-inspire-ignite/learner/page.tsx
app/03-lxd360-inspire-ignite/learner/player/page.tsx
app/06-lxd360-inspire-media-center/podcast/page.tsx
app/08-lxd360-neuro-strategy/consulting/page.tsx
app/09-lxd360-kinetix-gear/page.tsx
```

**Note:** Many pages use 'use client' directive which prevents static metadata export.
Metadata should be set via parent layouts or generateMetadata().

---

## Step 14: Middleware Analysis

### middleware.ts (84 lines)

#### Configuration
```typescript
const PROTECTED_ROUTES = ['/dashboard', '/lxp360'];
const AUTH_ROUTES = ['/auth/login', '/auth/sign-up', '/auth/signin'];
const AUTH_COOKIE_NAME = 'firebase-auth-token';
```

#### Matcher Pattern
```typescript
'/((?!_next/static|_next/image|favicon.ico|api/|.*.(?:svg|png|jpg|jpeg|gif|webp|json|ico)$).*)'
```

### ⚠️ Critical Issue: Route Mismatch

**Middleware AUTH_ROUTES:**
- /auth/login
- /auth/sign-up
- /auth/signin

**Actual App Routes:**
- /00-lxd360-auth/login
- /00-lxd360-auth/sign-up

**The middleware routes don't match the actual app structure!**

---

## Step 15: Route Compliance Check

### Expected vs Actual

| Expected (Standard) | Actual (Project) |
|---------------------|------------------|
| (auth) | 00-lxd360-auth |
| (public) | 01-lxd360-llc |
| (internal) | N/A |
| (tenant) | 03-lxd360-inspire-ignite |
| (ecosystem) | 02-11 folders |
| api | api ✅ |

### Compliance Status: ⚠️ NON-STANDARD

The project uses a numbered prefix convention:
- `00-` through `11-` prefixes
- Creates actual URL paths with numbers
- Non-standard for Next.js projects

### URL Implications
| Folder | Generated URL |
|--------|---------------|
| 00-lxd360-auth/login | /00-lxd360-auth/login |
| 01-lxd360-llc/(lxd360-llc)/contact | /01-lxd360-llc/contact |
| 02-lxd360-inspire-studio/(inspire-studio)/lesson | /02-lxd360-inspire-studio/lesson |

---

## Summary & Recommendations

### ✅ Strengths
1. **Comprehensive component library** - 1,432 components
2. **Good separation of concerns** - Clear module structure in lib/
3. **Server actions present** - Proper Next.js 15 patterns
4. **Error boundaries** - Both route and global error handling
5. **404 handling** - Custom not-found page

### ⚠️ Areas for Improvement

#### Critical
1. **Middleware route mismatch** - AUTH_ROUTES don't match actual paths
   - Middleware: `/auth/login`
   - Actual: `/00-lxd360-auth/login`

2. **Non-standard route structure** - Numbered prefixes create ugly URLs
   - Consider using parenthetical groups: `(auth)`, `(marketing)`, etc.

#### High Priority
3. **Missing loading states** - No loading.tsx files
   - Add Suspense boundaries for better UX

4. **Metadata coverage** - 62% of pages missing metadata
   - Add metadata to layouts or use generateMetadata()

5. **Limited dynamic routes** - Only 1 dynamic segment
   - Consider [courseId], [lessonId], etc. for content URLs

#### Medium Priority
6. **Empty route groups** - 04-inspire-cognitive has no pages
7. **Missing layouts** - 3 route groups without custom layouts
8. **Archived pages in app/** - Should be fully removed or moved

### Recommended Route Structure
```
app/
├── (auth)/            # Auth (no URL segment)
│   ├── login/
│   ├── signup/
│   └── reset-password/
├── (marketing)/       # Marketing (no URL segment)
│   ├── page.tsx       # Home
│   ├── about/
│   ├── contact/
│   └── products/
├── (platform)/        # Platform (no URL segment)
│   ├── dashboard/
│   ├── courses/
│   │   └── [courseId]/
│   ├── studio/
│   └── settings/
├── (admin)/           # Admin (no URL segment)
│   └── manage/
└── api/               # API routes
```

---

## Metrics Summary

| Metric | Count | Status |
|--------|-------|--------|
| Total Pages | 45 | |
| Total Layouts | 11 | |
| Total API Routes | 18 | |
| Component Files | 1,432 | |
| Lib Files | 304 | |
| Client Components | 1,320 | |
| Server Actions | 5 | |
| Missing Metadata | 28 | ⚠️ 62% |
| Loading Files | 0 | ⚠️ Missing |
| Error Boundaries | 2 | ✅ |
| Dynamic Routes | 1 | ⚠️ Limited |
| Route Groups | 12 | ⚠️ Non-standard |

---

**Architecture Score: 7/10**

Good foundation but needs route structure cleanup and middleware alignment.

---

**Report Generated:** 2026-01-19
**Tool:** Claude Code Architecture Audit
**Framework:** Next.js 15 App Router
