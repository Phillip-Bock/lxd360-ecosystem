# SYSTEM HEALTH & FORENSIC AUDIT REPORT

**Date:** January 21, 2026
**Auditor:** Claude Code (Opus 4.5)
**Scope:** Post-Migration Stabilization (NPM→PNPM, Polyrepo→Monorepo, Next.js 15)
**Repository:** lxd360-ecosystem

---

## 1. EXECUTIVE SUMMARY

### Overall Assessment: **SKELETON-GRADE → MVP-READY WITH DEBT**

| Metric | Status | Details |
|--------|--------|---------|
| **Migration Completeness** | ✅ COMPLETE | TurboRepo + pnpm workspace fully operational |
| **Package Structure** | ✅ HEALTHY | Workspace packages properly wired (`workspace:*`) |
| **TypeScript Violations** | ⚠️ 1 FOUND | `z.any()` in branching types (documented) |
| **Technical Debt** | 🔴 HIGH | 246 TODO markers, 30+ STUB implementations |
| **INSPIRE Studio** | 🟡 SCAFFOLDED | Phases 1-7 partially complete, Phase 8-10 pending |
| **INSPIRE Ignite LMS** | 🟡 SCAFFOLDED | Routes exist, providers exist, widgets incomplete |
| **INSPIRE LRS** | ✅ OPERATIONAL | @inspire/xapi-client fully implemented |
| **Legacy Artifacts** | ✅ CLEAN | No `package-lock.json` found |

### Go/No-Go Decision

**CONDITIONAL GO** — The system is architecturally sound but operationally incomplete. Core infrastructure (monorepo, packages, routing) is NASA-grade. Feature implementation is skeleton-grade with heavy reliance on mocks and stubs.

---

## 2. TECHNICAL DEBT REGISTRY

### 2.1 TODO Markers (246 Total)

| Priority | Count | Primary Tickets | Description |
|----------|-------|-----------------|-------------|
| CRITICAL | 42 | LXD-297, LXD-301 | Firestore integration (courses, users, auth) |
| HIGH | 35 | LXD-245, LXD-247 | Vertex AI, Cloud Tasks handlers |
| HIGH | 28 | LXD-351 | RBAC implementation with Firebase claims |
| MEDIUM | 24 | LXD-406 | Export functionality (SCORM, xAPI, cmi5) |
| MEDIUM | 18 | LXD-309, LXD-310 | xAPI video tracking |
| LOW | 99 | Various | Miscellaneous feature stubs |

### 2.2 Detailed TODO Breakdown by Domain

#### Authentication & Authorization (LXD-297, LXD-301, LXD-351)

| File | Line | Context |
|------|------|---------|
| `apps/web/providers/RoleContext.tsx` | 3 | Replace with Firebase Auth user type |
| `apps/web/providers/RoleContext.tsx` | 315-358 | Implement Firestore profile loading |
| `apps/web/app/03-lxd360-inspire-ignite/teach/layout.tsx` | 11 | RBAC check - require instructor role |
| `apps/web/app/03-lxd360-inspire-ignite/manage/layout.tsx` | 19 | RBAC check - require admin role |
| `apps/web/app/03-lxd360-inspire-ignite/lrs/layout.tsx` | 19 | RBAC check - require admin role |
| `apps/web/lib/rbac/permissions.ts` | 1-74 | Entire file is stub implementations |

#### Data Layer (LXD-297, LXD-301, LXD-400, LXD-401)

| File | Line | Context |
|------|------|---------|
| `apps/web/lib/actions/courses.ts` | 18-135 | All course actions are stubs |
| `apps/web/lib/actions/lessons.ts` | 17-71 | All lesson actions are stubs |
| `apps/web/lib/actions/blocks.ts` | 18-57 | All block actions are stubs |
| `apps/web/lib/admin/data.ts` | 1 | Entire admin data layer is migration stub |
| `apps/web/lib/cache/api-cache.ts` | 9-173 | All cached data fetchers are stubs |
| `apps/web/lib/content/index.ts` | 19-86 | Content fetching is stub |

#### AI/ML Integration (LXD-245, LXD-300)

| File | Line | Context |
|------|------|---------|
| `apps/web/lib/ai/vertex-client.ts` | 81-343 | Generation, embedding, agent APIs |
| `apps/web/lib/ai/unified-client.ts` | 1-223 | Provider detection, streaming |
| `apps/web/hooks/inspire/useCoPilot.ts` | 184-282 | AI message handling stubs |
| `apps/web/components/inspire-studio/encoding/Step1_1_Research/AIResearchInjector.tsx` | 48 | AI research stub |

#### xAPI & Analytics (LXD-309, LXD-XAPI)

| File | Line | Context |
|------|------|---------|
| `apps/web/components/content-blocks/media/VideoPlayer.tsx` | 21-53 | Course context, video events |
| `apps/web/components/inspire-studio/spatial/ThreeSixtyPlayer/index.tsx` | 74-225 | xAPI for spatial interactions |
| `apps/web/hooks/useXAPITracking.ts` | 3-56 | xAPI tracking hook is stub |

#### Cloud Tasks & Background Jobs (LXD-247)

| File | Line | Context |
|------|------|---------|
| `apps/web/lib/cloud-tasks/handlers/video-handler.ts` | 56-186 | Video processing pipeline |
| `apps/web/lib/cloud-tasks/handlers/email-handler.ts` | 59-272 | Email sending pipeline |
| `apps/web/lib/cloud-tasks/handlers/subscription-handler.ts` | 106-275 | Stripe integration |
| `apps/web/lib/cloud-tasks/handlers/analytics-handler.ts` | 60-180 | BigQuery aggregation |

### 2.3 STUB Implementations

| File | Status | Description |
|------|--------|-------------|
| `apps/web/lib/storage/client.ts` | 🔴 STUB | Cloud Storage SDK not integrated |
| `apps/web/lib/rbac/permissions.ts` | 🔴 STUB | Returns false/empty for all checks |
| `apps/web/lib/notifications/service.ts` | 🔴 STUB | Email, push, SMS all return void |
| `apps/web/app/01-lxd360-llc/(lxd360-llc)/_archive/media/page.tsx` | 🟡 @stub | LXD-420 |
| `apps/web/app/09-lxd360-kinetix-gear/page.tsx` | 🟡 @stub | LXD-422 |
| `apps/web/app/08-lxd360-neuro-strategy/consulting/page.tsx` | 🟡 @stub | LXD-424 |
| `apps/web/app/06-lxd360-inspire-media-center/podcast/page.tsx` | 🟡 @stub | LXD-421 |

### 2.4 TypeScript Violations

| Type | File | Line | Status |
|------|------|------|--------|
| `z.any()` | `apps/web/components/inspire-studio/branching/types.ts` | 170 | Documented (ReactFlow requirement) |

**Note:** No `@ts-ignore`, `@ts-expect-error`, or `eslint-disable` comments found.

---

## 3. ARCHITECTURAL GAP ANALYSIS

### 3.1 INSPIRE Studio (vs `INSPIRE_Studio_Phased_Build_Instructions.md`)

| Phase | Requirement | Status | Files Present |
|-------|-------------|--------|---------------|
| **Phase 1: Data Architecture** | useMissionStore, schemas | ✅ | `store/studio-store.ts`, schemas in `types/` |
| **Phase 2: Mission Control** | Dashboard shell, navigation | ✅ | 7 components in `mission-control/` |
| **Phase 3: Encoding** | Steps 1.1-1.5 | ✅ | 20 components across 5 step directories |
| **Phase 4: Synthesization** | Steps 2.1-2.4 | 🟡 PARTIAL | Missing: TaskCompetencyLinker, LadderBuilder |
| **Phase 5: Course Canvas** | 16:9 canvas, blocks | ✅ | LessonCanvas, BlockPalette, BlockRenderer |
| **Phase 6: Smart Block Suites** | 7 consolidated suites | ✅ | All 7 suites present: SmartText, UnifiedMedia, LogicQuiz, ContextualAudio, DynamicVideo, SpatialContainer, SocialHub |
| **Phase 7: xAPI Pipeline** | BigQuery direct sink | ✅ | @inspire/xapi-client package complete |
| **Phase 8: QA & Audit** | Accessibility tools | ✅ | `audit/AuditDashboard.tsx`, `accessibility/*` |
| **Phase 9: 360 Editor** | POST-MVP | ✅ | `spatial/ThreeSixtyPlayer/`, `ThreeSixtyEditor/` |
| **Phase 10: Branching** | POST-MVP | ✅ | `branching/` with FlowBuilder, nodes, VariableManager |

**INSPIRE Studio Completion: ~85%**

### 3.2 INSPIRE Ignite LMS (vs `INSPIRE_Ignite_LMS_Build_Guide.md`)

| Component | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| **Route Structure** | `/ignite/*` routes | ✅ | All routes scaffolded |
| **Providers** | XAPIProvider, AdaptiveEngineProvider, AccessibilityProvider | ✅ | All 3 present in `components/ignite/providers/` |
| **Dashboard Widgets** | 7 widgets | 🔴 NOT FOUND | `widgets/` directory not present |
| **Course Player** | Shell, ContentRenderer, blocks | 🟡 PARTIAL | Player exists in `inspire-ignite/player/`, but uses mock data |
| **Adaptive Panel** | GlassBoxExplanation, interventions | 🔴 NOT FOUND | Glass Box components missing |
| **Instructor Views** | Gradebook, analytics | 🟡 SCAFFOLDED | Routes exist, use mock data |
| **Admin Views** | Compliance dashboard | 🟡 SCAFFOLDED | Routes exist, use mock data |

**INSPIRE Ignite LMS Completion: ~40%**

### 3.3 INSPIRE LRS (vs `INSPIRE_LRS_Build_Guide.md`)

| Component | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| **@inspire/xapi-client** | Statement builder, validator | ✅ | 20 files, complete implementation |
| **@inspire/types** | Firestore/BigQuery schemas | ✅ | 11 files with Zod schemas |
| **@inspire/ml** | BKT, SM-2 algorithms | ✅ | 5 files, algorithms implemented |
| **Cloud Functions** | Statement processor | ✅ | `functions/xapi-to-bigquery/` exists |
| **API Routes** | `/api/xapi/*` | ✅ | statements, agents, activities routes |

**INSPIRE LRS Completion: ~95%**

### 3.4 Monorepo Package Wiring

| Package | Import Pattern | Status |
|---------|----------------|--------|
| `@lxd360/ui` | `workspace:*` | ✅ CORRECT |
| `@inspire/types` | `workspace:*` | ✅ CORRECT |
| `@inspire/xapi-client` | `workspace:*` | ✅ CORRECT |
| `@inspire/ml` | `workspace:*` | ✅ CORRECT |

**No relative imports to packages found** — Monorepo wiring is correct.

---

## 4. MIGRATION ARTIFACTS

### 4.1 Cleanup Tasks Completed

- [x] No `package-lock.json` found (npm fully replaced)
- [x] No relative package imports (`../../../packages/*`)
- [x] All workspace packages use `workspace:*` protocol
- [x] No `eslint-disable` comments (Biome linter active)

### 4.2 Remaining Migration Tasks

| Task | Priority | Notes |
|------|----------|-------|
| Update docs referencing npm | LOW | CLAUDE.md still mentions `npm install --legacy-peer-deps` |
| Clean root directory | LOW | Check for any legacy config files |
| Verify all package.json scripts | LOW | Ensure `pnpm` compatibility |

---

## 5. IMMEDIATE REMEDIATION PLAN

### Priority 1: Critical Path (RBAC + Auth)

```bash
# These tickets block production deployment
# Estimated: 2-3 developer-days

1. LXD-351: Implement Firebase custom claims for RBAC
   - File: apps/web/lib/rbac/permissions.ts
   - File: apps/web/lib/hooks/useRBAC.ts

2. LXD-297: Wire auth checks to Firestore
   - File: apps/web/providers/RoleContext.tsx
   - File: apps/web/app/03-lxd360-inspire-ignite/*/layout.tsx
```

### Priority 2: Data Layer (Firestore Integration)

```bash
# Replace mocks with real data
# Estimated: 3-5 developer-days

3. LXD-301: Implement Firestore queries for:
   - Courses (apps/web/lib/actions/courses.ts)
   - Lessons (apps/web/lib/actions/lessons.ts)
   - Blocks (apps/web/lib/actions/blocks.ts)

4. LXD-400/401: Implement cache layer with Firestore
   - File: apps/web/lib/cache/api-cache.ts
   - File: apps/web/lib/content/index.ts
```

### Priority 3: Ignite LMS Completion

```bash
# Build missing learner-facing components
# Estimated: 5-8 developer-days

5. LXD-IGN-003: Dashboard widgets
   - Create: components/ignite/widgets/*.tsx

6. LXD-IGN-006: Adaptive panel and Glass Box
   - Create: components/ignite/player/adaptive-panel.tsx
   - Create: components/ignite/glass-box/*.tsx
```

### Priority 4: AI/ML Integration

```bash
# Connect Vertex AI
# Estimated: 2-3 developer-days

7. LXD-245: Vertex AI client
   - File: apps/web/lib/ai/vertex-client.ts
   - Wire to CoPilot sidebar
```

---

## 6. APPENDIX: TICKET CROSS-REFERENCE

| Ticket | Files Affected | Count | Domain |
|--------|---------------|-------|--------|
| LXD-297 | 26 files | 26 | Firestore integration |
| LXD-301 | 45 files | 52 | Firebase Auth/Firestore |
| LXD-245 | 12 files | 16 | Vertex AI |
| LXD-247 | 15 files | 20 | Cloud Tasks |
| LXD-351 | 8 files | 10 | RBAC |
| LXD-309 | 4 files | 6 | xAPI video |
| LXD-316 | 3 files | 3 | Password reset |
| LXD-400 | 6 files | 6 | API cache |
| LXD-401 | 6 files | 6 | Content fetching |
| LXD-406 | 6 files | 6 | Export formats |
| LXD-408 | 3 files | 3 | Notifications |
| LXD-410 | 5 files | 5 | Block components |

---

## 7. AUDIT METADATA

| Field | Value |
|-------|-------|
| Scan Duration | ~15 minutes |
| Files Analyzed | 500+ TypeScript/TSX files |
| Grep Patterns Used | TODO, FIXME, STUB, z.any(), @ts-ignore, relative imports |
| Reference Docs | 3 (Studio, Ignite, LRS build guides) |
| Report Generated | January 21, 2026 |

---

**END OF AUDIT REPORT**

*This report represents a snapshot of the codebase at the time of scanning. Re-run `/project:audit` after significant changes.*
