# LXD-364: Dashboard Addon Tabs & User Tabs Audit

**Date:** 2026-01-26
**Auditor:** Claude Code (LXD-364)
**Branch:** `claude/audit-dashboard-tabs-9AXFb`
**Status:** Audit Complete with Fixes Applied

---

## Executive Summary

This audit examined the Mission Control dashboard addon system as specified in ticket LXD-364. The key finding is that **there is no "tab" system** - the dashboard uses a **widget grid** architecture with persona-based visibility. All widgets currently use mock data; Firestore hooks exist but are not connected.

### Findings Summary

| Category | Status | Action Required |
|----------|--------|-----------------|
| Widget Rendering | Working | None |
| Role-Based Visibility | Working | None |
| Data Connection | Broken | Wiring needed |
| Loading States | Partial | Enhancement needed |
| Tab System | N/A | Does not exist |

---

## 1. Architecture Overview

### 1.1 Dashboard Structure

```
/ignite/dashboard (page.tsx)
    └── MissionControlDashboard.tsx (690 lines)
        ├── Header with Mission Clock
        ├── StatCards Row (4 cards)
        └── Widget Grid (persona-based)
            ├── Learner View: SkillMastery, AIRecommendations, LearningVelocity
            ├── Instructor View: JITAIAlerts, ClassAnalytics, SkillMastery
            ├── Manager View: SkillHeatmap, ComplianceGap, ROIAnalytics
            └── Admin View: SystemHealth, AuditLog, JITAIAlerts, AIRecommendations
```

### 1.2 Key Files

| File | Lines | Purpose |
|------|-------|---------|
| `components/ignite/mission-control/MissionControlDashboard.tsx` | 690 | Main dashboard component |
| `components/ignite/mission-control/types.ts` | 178 | Type definitions |
| `components/ignite/mission-control/widgets/*.tsx` | 10 files | Widget components |
| `lib/rbac/personas.ts` | 364 | 4-persona RBAC system |
| `hooks/firestore/*.ts` | 5 files | Firestore data hooks |

---

## 2. Widget Inventory

### 2.1 Implemented Widgets

| Widget | File | Props Interface | Data Source |
|--------|------|-----------------|-------------|
| StatCard | `widgets/StatCard.tsx` | `StatMetric` | Mock |
| SkillMasteryWidget | `widgets/SkillMasteryWidget.tsx` | `SkillMasteryData[]` | Mock |
| AIRecommendationsWidget | `widgets/AIRecommendationsWidget.tsx` | `recommendations[]` | Mock |
| JITAIAlertsWidget | `widgets/JITAIAlertsWidget.tsx` | `JITAIAlert[]` | Mock |
| SkillHeatmapWidget | `widgets/SkillHeatmapWidget.tsx` | `HeatmapData` | Mock |
| ComplianceGapWidget | `widgets/ComplianceGapWidget.tsx` | `ComplianceMetric[]` | Mock |
| SystemHealthWidget | `widgets/SystemHealthWidget.tsx` | `ServiceHealth[]` | Mock |
| WidgetCard | `widgets/WidgetCard.tsx` | Container component | N/A |
| ProgressRing | `widgets/ProgressRing.tsx` | Utility component | N/A |
| SkillBar | `widgets/SkillBar.tsx` | Utility component | N/A |

### 2.2 Widget Visibility by Persona

| Widget | Learner | Editor | Manager | Owner |
|--------|---------|--------|---------|-------|
| SkillMasteryWidget | Y | Y | N | N |
| AIRecommendationsWidget | Y | N | N | Y |
| JITAIAlertsWidget | N | Y | N | Y |
| SkillHeatmapWidget | N | N | Y | N |
| ComplianceGapWidget | N | N | Y | N |
| SystemHealthWidget | N | N | N | Y |
| LearningVelocityChart | Y | N | N | N |
| ClassAnalyticsContent | N | Y | N | N |
| ROIAnalyticsContent | N | N | Y | N |
| AuditLogContent | N | N | N | Y |

---

## 3. What Works

### 3.1 Role-Based View Switching (Working)

The dashboard correctly maps personas to views:

```typescript
// MissionControlDashboard.tsx:347-358
function mapPersonaToDashboardView(persona: Persona): DashboardView {
  switch (persona) {
    case 'owner': return 'admin';
    case 'editor': return 'instructor';
    case 'manager': return 'manager';
    default: return 'learner';
  }
}
```

**Verification:** Persona detection via `useSafeAuth()` hook correctly reads Firebase custom claims.

### 3.2 Widget Rendering (Working)

All widgets render correctly with their mock data. The grid layout uses responsive Tailwind classes:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 4 columns

### 3.3 Mission Clock (Working)

Real-time clock updating every second with proper cleanup.

---

## 4. What's Broken/Missing

### 4.1 All Data is Mock (Critical)

The `MissionControlDashboard.tsx` file contains 250+ lines of mock data (lines 88-341):

```typescript
// Lines 91-129: getMock* functions
const getLearnerStats = (): StatMetric[] => [/* mock */];
const getInstructorStats = (): StatMetric[] => [/* mock */];
const getManagerStats = (): StatMetric[] => [/* mock */];
const getAdminStats = (): StatMetric[] => [/* mock */];

// Lines 131-341: Additional mock data generators
const getMockSkillMasteryData = (): SkillMasteryData[] => [/* mock */];
const getMockJITAIAlerts = (): JITAIAlert[] => [/* mock */];
const getMockHeatmapData = (): HeatmapData => {/* mock */};
const getMockComplianceMetrics = (): ComplianceMetric[] => [/* mock */];
const getMockServiceHealth = (): ServiceHealth[] => [/* mock */];
```

**Impact:** Dashboard shows fake data, not actual tenant/user metrics.

### 4.2 No Dashboard Data Hook

Unlike other features that have Firestore hooks (`useLearners`, `useEnrollments`), there is no `useDashboardStats` hook.

**Required Metrics:**
- Course counts by status (draft, published, archived)
- Learner enrollment counts
- Completion rates
- Compliance metrics (from LRS/xAPI)
- System health (from GCP monitoring APIs)

### 4.3 Loading States Missing

Widgets show mock data immediately - no loading skeletons or states for async data fetching.

### 4.4 "Tab System" Does Not Exist

The ticket mentions "tabs" but the dashboard uses a widget grid, not tabs. There is no:
- Tab navigation component
- Tab state management
- User-configurable tab ordering
- Addon tab system

The only "tabs" in the codebase are:
1. `components/animate-ui/components/animate/tabs.tsx` - Generic animated tab UI
2. `components/inspire-studio/blocks/interactive/TabsBlock.tsx` - Course content tabs

---

## 5. Available Firestore Services (Not Connected)

### 5.1 Services Ready for Integration

| Service | File | Key Functions |
|---------|------|---------------|
| Courses | `lib/firestore/services/courses.ts` | `getCoursesByOrg()`, `searchCourses()` |
| Learners | `lib/firestore/services/learners.ts` | `getLearners()`, `getLearnersByStatus()` |
| Enrollments | `lib/firestore/services/enrollments.ts` | `getCourseEnrollments()`, `getInProgressEnrollments()` |
| Achievements | `lib/firestore/services/achievements.ts` | `getLearnerAchievements()` |

### 5.2 Hooks Ready for Integration

| Hook | File | Status |
|------|------|--------|
| `useLearners` | `hooks/firestore/use-learners.ts` | Ready |
| `useEnrollments` | `hooks/firestore/use-enrollments.ts` | Ready |
| `useAchievements` | `hooks/firestore/use-achievements.ts` | Ready |
| `useOrganization` | `hooks/firestore/use-organization.ts` | Ready |

---

## 6. Recommendations

### 6.1 Immediate Actions (This PR)

1. **Create `useDashboardStats` Hook** - Aggregate metrics from existing services
2. **Wire Dashboard to Real Data** - Replace mock functions with hook calls
3. **Add Loading States** - Skeleton placeholders while data loads
4. **Add Error Boundaries** - Handle Firestore errors gracefully

### 6.2 Future Enhancements

1. **Widget Customization** - Allow users to enable/disable widgets
2. **Real-time Updates** - Use Firestore listeners for live data
3. **Caching Strategy** - Cache dashboard metrics for performance
4. **System Health API** - Create endpoint to fetch GCP service health

---

## 7. Files Modified in This Audit

| File | Action | Reason |
|------|--------|--------|
| `hooks/firestore/use-dashboard-stats.ts` | Created | Dashboard metrics hook |
| `components/ignite/mission-control/MissionControlDashboard.tsx` | Modified | Wire to real data |
| `docs/audits/LXD-364-DASHBOARD-TABS-AUDIT-2026-01-26.md` | Created | This document |

---

## 8. Validation

```bash
pnpm lint      # Must pass
pnpm typecheck # Must pass
pnpm build     # Must succeed
```

---

## Appendix A: Mock Data to Replace

### Learner Stats (from mock → real)
- `Courses Active` → `useLearnerEnrollments(userId, 'in_progress').length`
- `Skills Mastered` → Query from xAPI LRS
- `Learning Streak` → Calculate from xAPI activity timestamps
- `Rank` → Leaderboard query (future feature)

### Instructor Stats (from mock → real)
- `Active Courses` → `getCoursesByInstructor(orgId, userId).filter(c => c.status === 'published').length`
- `Total Students` → Sum of enrollment counts across courses
- `Avg Completion` → Average of `course.completionRate` values
- `Pending Reviews` → Future: submissions requiring review

### Manager Stats (from mock → real)
- `Team Members` → `useLearners().learners.length`
- `Compliance` → Compliance courses completion rate
- `At Risk` → Learners below threshold
- `ROI Score` → BigQuery analytics (future)

### Admin Stats (from mock → real)
- `Active Users` → Firestore users collection count
- `Uptime` → GCP Cloud Monitoring API
- `API/min` → GCP Cloud Monitoring API
- `Tenants` → Tenants collection count
