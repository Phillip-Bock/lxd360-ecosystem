# INSPIRE Ignite LMS — Complete Build Guide

## Comprehensive Architecture, Implementation & Claude VS Code Prompts

**Version:** 1.0  
**Date:** January 20, 2026  
**Classification:** Internal Engineering  
**Scope:** INSPIRE Ignite — Learning Management System (LMS/LXP)

---

## TABLE OF CONTENTS

1. Executive Summary
2. Architecture Overview
3. Route Structure & Navigation
4. Learner Dashboard
5. Course Player Architecture
6. Content Block System
7. Adaptive Learning Engine
8. Glass Box AI Integration
9. Progress & Completion Tracking
10. Instructor Views
11. Admin & Compliance Views
12. Claude VS Code Prompts — All Phases
13. Deployment & Verification
14. Critical Constraints

---

## 1. EXECUTIVE SUMMARY

### 1.1 Purpose

INSPIRE Ignite is the unified Learning Management System (LMS), Learning Experience Platform (LXP), and Learning Record Store (LRS) interface. It delivers adaptive, neuroscience-backed learning experiences while providing complete transparency through Glass Box AI.

### 1.2 Core Capabilities

| Capability | Description |
|------------|-------------|
| **Adaptive Learning** | Real-time content adaptation based on learner performance |
| **Glass Box AI** | Transparent, explainable recommendations with learner override |
| **Spaced Repetition** | SM-2 algorithm for optimal retention |
| **Cognitive Load Management** | ICL framework prevents overload |
| **Progress Tracking** | Granular xAPI instrumentation |
| **Compliance** | EU AI Act, WCAG 2.2 AA, HIPAA ready |

### 1.3 Dependencies

The LMS depends on the LRS layer being complete:
- @inspire/xapi-client (statement building)
- @inspire/types (shared schemas)
- @inspire/ml (BKT, SM-2 algorithms)
- Firestore (real-time state)
- BigQuery (analytics)
- Cloud Functions (triggers)

### 1.4 Success Criteria

- Zero TypeScript errors (strict mode enabled)
- WCAG 2.2 AA compliance on all learner-facing pages
- Course player renders all 70+ content block types
- xAPI statements emitted for all learning interactions
- Real-time mastery updates via Firestore subscription
- Glass Box explanations for all AI recommendations
- Learner override system functional
- Instructor gradebook with cohort analytics
- Admin compliance dashboard with audit export
- Mobile-responsive design (320px minimum)
- Page load < 3 seconds on 3G connection
- Lighthouse accessibility score > 95

---

## 2. ARCHITECTURE OVERVIEW

### 2.1 System Components

The Ignite LMS consists of:

**Presentation Layer:**
- Learner Dashboard (widgets, progress, recommendations)
- Course Player (content blocks, navigation, adaptive panel)
- Instructor Views (gradebook, analytics)
- Admin Views (compliance, audit, user management)

**Feature Layer:**
- xAPI Emitter (statement generation and batching)
- Adaptive Engine Client (mastery tracking, recommendations)
- Progress Tracker (real-time sync)

**Data Layer:**
- Firestore hooks (real-time subscriptions)
- Server Actions (mutations)

**Shared:**
- @inspire/ui (shadcn/ui components)
- @inspire/types (TypeScript interfaces)

### 2.2 Data Flow

1. Learner interacts with content block
2. Content block emits xAPI statement via XAPIProvider
3. Statement sent to /api/xapi/statements (dual-write)
4. Firestore updated (real-time path)
5. Cloud Function triggers mastery update
6. Vertex AI generates recommendation
7. Recommendation written to Firestore
8. Client receives via onSnapshot
9. Adaptive Panel shows intervention

---

## 3. ROUTE STRUCTURE

### 3.1 Ignite Route Map

```
app/(tenant)/ignite/
├── page.tsx                          # Redirect to dashboard
├── layout.tsx                        # Shell with sidebar + header
├── dashboard/page.tsx                # Learner dashboard
├── learn/
│   ├── page.tsx                      # Learning home
│   ├── my-learning/page.tsx          # Assigned courses
│   ├── catalog/page.tsx              # Course browser
│   ├── player/[courseId]/[lessonId]/page.tsx  # Course player
│   ├── progress/page.tsx             # Progress overview
│   └── achievements/page.tsx         # Badges, certificates
├── teach/                            # RBAC: instructor+
│   ├── page.tsx                      # Instructor dashboard
│   ├── courses/page.tsx              # My courses
│   ├── gradebook/page.tsx            # Gradebook
│   └── analytics/page.tsx            # Teaching analytics
├── manage/                           # RBAC: admin+
│   ├── page.tsx                      # Admin dashboard
│   ├── users/page.tsx                # User management
│   ├── compliance/page.tsx           # Compliance dashboard
│   └── reports/page.tsx              # Admin reports
└── lrs/                              # RBAC: admin+
    ├── page.tsx                      # LRS dashboard
    ├── statements/page.tsx           # Statement browser
    └── reports/page.tsx              # LRS reports
```

---

## 4. LEARNER DASHBOARD

### 4.1 Dashboard Widgets

| Widget | Description |
|--------|-------------|
| **Continue Learning** | Last accessed course with progress |
| **Progress Overview** | Overall completion ring, stats |
| **My Learning** | Assigned courses horizontal scroll |
| **Recommendations** | AI suggestions with Glass Box |
| **Due Dates** | Upcoming deadlines |
| **Achievements** | Recent badges |
| **Leaderboard** | Top learners by points |

### 4.2 Recommendations Widget Features

- Shows active AI recommendation
- Short Glass Box explanation
- Actions: Accept, Tell me more, Not now
- Alternative options
- Full explanation dialog
- xAPI emission on all interactions

---

## 5. COURSE PLAYER

### 5.1 Player Layout

- Header: Course title, progress bar, exit button
- Sidebar: Lesson outline, mastery tracker
- Main: Content blocks, navigation
- Bottom: Adaptive panel (slide-up interventions)

### 5.2 Key Components

| Component | Purpose |
|-----------|---------|
| CoursePlayerShell | Layout wrapper |
| LessonOutline | Navigation sidebar |
| ContentRenderer | Block type dispatcher |
| BlockNavigation | Previous/Next controls |
| ProgressTracker | Real-time progress sync |
| MasteryTracker | Skill mastery display |
| AdaptivePanel | AI intervention UI |

### 5.3 Content Blocks (Priority 1)

1. **Text Blocks:** Paragraph, Heading, Callout
2. **Media Blocks:** Image, Video, Audio
3. **Interactive:** Quiz, Drag-Drop, Flashcard
4. **Layout:** Tabs, Accordion

---

## 6. ADAPTIVE LEARNING ENGINE

### 6.1 Client Architecture

The AdaptiveEngineProvider:
- Subscribes to Firestore learner document
- Tracks masteryStates (Map<skillId, MasteryState>)
- Tracks activeRecommendation
- Provides getMastery(skillId) method
- Provides calculateLocalMastery() for optimistic UI
- Provides getSkillsNeedingReview() for SM-2

### 6.2 Intervention Triggers

Show intervention when:
- Cognitive load > 7 (out of 10)
- Hesitation count > 2 on current block
- 2+ incorrect quiz answers in a row
- Manual "Help" button clicked

Cooldown rules:
- After dismissal: 5 minute cooldown
- After acceptance: No cooldown
- After 3 dismissals: 30 minute cooldown

---

## 7. GLASS BOX AI

### 7.1 Explanation Components

| Component | Purpose |
|-----------|---------|
| GlassBoxExplanation | Full explanation view |
| GlassBoxMini | Compact inline version |
| OverrideDialog | Multi-step override flow |

### 7.2 EU AI Act Compliance

Every recommendation includes:
- Feature contributions with weights
- Model version and timestamp
- Transparency notice
- Override capability

---

## 8. INSTRUCTOR VIEWS

### 8.1 Gradebook Features

- Table of all learners
- Progress per course
- "At Risk" detection
- Filters: course, date, status
- Export: CSV, Excel

### 8.2 At Risk Detection

A learner is "At Risk" if:
- Progress < 25% and enrolled > 14 days
- No activity in last 7 days
- Failed same assessment 3+ times
- Mastery declined > 20%

---

## 9. ADMIN VIEWS

### 9.1 Compliance Dashboard

- Status cards: EU AI Act, WCAG, HIPAA, GDPR
- Active alerts
- Audit log
- Export functionality

### 9.2 Audit Event Types

- ai.recommendation
- ai.override
- data.access
- data.export
- auth.login
- compliance.check
- user.role_change

---

## 10. CLAUDE VS CODE PROMPTS

### Phase 1A: Route Structure

**TICKET:** LXD-IGN-001
**BRANCH:** claude/ignite-routes-XXXX

**TASK:** Create Ignite route structure

1. Create routes under app/(tenant)/ignite/
2. Create layout.tsx with session validation
3. Create navigation components (sidebar, header)
4. Implement RBAC route protection

**DELIVERABLES:**
- All route pages (dashboard, learn/*, teach/*, manage/*, lrs/*)
- components/ignite/navigation/sidebar.tsx
- components/ignite/navigation/header.tsx

---

### Phase 1B: Context Providers

**TICKET:** LXD-IGN-002
**BRANCH:** claude/ignite-providers-XXXX

**TASK:** Create React context providers

1. XAPIProvider - Statement emission and batching
2. AdaptiveEngineProvider - Real-time mastery tracking
3. AccessibilityProvider - A11y settings

**XAPI BATCHING:**
- Queue statements in memory
- Flush when: 5 statements OR 10 seconds OR navigation
- Offline: Store in IndexedDB, sync when online

**DELIVERABLES:**
- components/ignite/providers/xapi.tsx
- components/ignite/providers/adaptive-engine.tsx
- components/ignite/providers/accessibility.tsx
- hooks/ignite/use-xapi.ts
- hooks/ignite/use-adaptive-engine.ts

---

### Phase 2A: Dashboard Widgets

**TICKET:** LXD-IGN-003
**BRANCH:** claude/ignite-dashboard-widgets-XXXX

**TASK:** Build learner dashboard widgets

1. ContinueLearningWidget - Last course, progress, continue button
2. ProgressOverviewWidget - Overall progress ring, stats
3. MyLearningWidget - Assigned courses list
4. RecommendationsWidget - AI suggestions with Glass Box
5. UpcomingDueDatesWidget - Due date list
6. AchievementsWidget - Recent badges
7. LeaderboardWidget - Top learners

**WIDGET PATTERN:**
- Fetch own data via custom hook
- Handle loading/error/empty states
- Use Card component container
- Include aria labels
- Emit xAPI for interactions

**DELIVERABLES:**
- components/ignite/widgets/*.tsx (all 7 widgets)
- hooks/ignite/use-*.ts (data hooks)
- Update dashboard/page.tsx

---

### Phase 3A: Player Shell

**TICKET:** LXD-IGN-004
**BRANCH:** claude/ignite-player-shell-XXXX

**TASK:** Build course player infrastructure

1. CoursePlayerShell - Full-screen layout
2. LessonOutline - Collapsible sidebar with progress
3. BlockNavigation - Previous/Next with keyboard
4. ProgressTracker - Real-time Firestore sync
5. MasteryTracker - Skill mastery display
6. ExitDialog - Confirmation with xAPI emission

**PLAYER STATE:**
- course, currentLesson, currentBlockIndex
- sessionId, sessionStartTime
- Navigation methods: goToBlock, nextBlock, previousBlock

**XAPI EVENTS:**
- "initialized" on player load
- "progressed" on block change
- "terminated" or "suspended" on exit

**DELIVERABLES:**
- components/ignite/player/shell.tsx
- components/ignite/player/lesson-outline.tsx
- components/ignite/player/block-navigation.tsx
- components/ignite/player/progress-tracker.tsx
- components/ignite/player/player-context.tsx

---

### Phase 3B: Content Blocks

**TICKET:** LXD-IGN-005
**BRANCH:** claude/ignite-content-blocks-XXXX

**TASK:** Implement core content block components

**PRIORITY 1 BLOCKS:**

1. TextBlock - Paragraph, rich text
2. HeadingBlock - h1-h6
3. CalloutBlock - Info, warning, success, error
4. ImageBlock - With zoom, alt text
5. VideoBlock - YouTube, Vimeo, hosted; chapters, captions
6. AudioBlock - With transcript
7. QuizBlock - Multiple choice, true/false, fill-blank
8. DragDropBlock - Reorder, categorize, match
9. FlashcardBlock - Flip cards, SM-2 integration
10. TabsBlock - Horizontal tabs
11. AccordionBlock - Expandable sections

**BLOCK PROPS:**
- block: ContentBlock
- onInteraction: (data) => void
- onComplete: (result) => void

**VIDEO REQUIREMENTS:**
- Support YouTube, Vimeo, Wistia, hosted
- Chapter markers, captions
- xAPI: started, paused, resumed, seeked, completed
- Completion at 90% viewed

**QUIZ REQUIREMENTS:**
- Configurable max attempts
- Immediate or delayed feedback
- BKT integration if skillId provided
- Show mastery change after answer

**DELIVERABLES:**
- components/ignite/player/content-renderer.tsx
- components/ignite/player/blocks/*.tsx (11 blocks)
- hooks/ignite/use-video-player.ts
- hooks/ignite/use-quiz-state.ts

---

### Phase 4A: Adaptive Panel

**TICKET:** LXD-IGN-006
**BRANCH:** claude/ignite-adaptive-panel-XXXX

**TASK:** Build adaptive learning UI components

1. AdaptivePanel - Slide-up intervention panel
2. GlassBoxExplanation - Full explanation view
3. GlassBoxMini - Compact inline version
4. OverrideDialog - Multi-step override flow
5. CognitiveLoadIndicator - Visual load indicator

**INTERVENTION TRIGGERS:**
- Cognitive load > 7
- Hesitation count > 2
- 2+ incorrect answers
- Manual help button

**COOLDOWN:**
- After dismissal: 5 minutes
- After acceptance: None
- After 3 dismissals: 30 minutes

**DELIVERABLES:**
- components/ignite/player/adaptive-panel.tsx
- components/ignite/glass-box/explanation.tsx
- components/ignite/glass-box/mini.tsx
- components/ignite/glass-box/override-dialog.tsx
- hooks/ignite/use-interventions.ts
- hooks/ignite/use-recommendation-override.ts

---

### Phase 5A: Instructor Views

**TICKET:** LXD-IGN-007
**BRANCH:** claude/ignite-gradebook-XXXX

**TASK:** Build instructor gradebook and analytics

1. GradebookPage - Table of learners
2. GradebookTable - Sortable, paginated
3. GradebookFilters - Course, date, status
4. ExportGradebook - CSV/Excel export
5. LearnerDetailPage - Individual learner view
6. CourseAnalyticsPage - Course performance

**AT RISK DETECTION:**
- Progress < 25% after 14 days
- No activity in 7 days
- 3+ failed attempts
- Mastery dropped > 20%

**DELIVERABLES:**
- app/(tenant)/ignite/teach/gradebook/page.tsx
- app/(tenant)/ignite/teach/learners/[learnerId]/page.tsx
- components/ignite/instructor/gradebook-table.tsx
- components/ignite/instructor/gradebook-filters.tsx
- lib/actions/instructor.ts

---

### Phase 6A: Admin & Compliance

**TICKET:** LXD-IGN-008
**BRANCH:** claude/ignite-admin-compliance-XXXX

**TASK:** Build admin and compliance views

1. ComplianceDashboard - Status cards, alerts
2. AuditLogTable - Searchable events
3. UserManagementPage - User CRUD
4. StatementBrowser - xAPI query interface

**AUDIT EVENTS TO LOG:**
- ai.recommendation
- ai.override
- data.access/export
- auth.login/logout
- user.role_change

**DELIVERABLES:**
- app/(tenant)/ignite/manage/compliance/page.tsx
- app/(tenant)/ignite/manage/users/page.tsx
- app/(tenant)/ignite/lrs/statements/page.tsx
- components/ignite/admin/*.tsx
- lib/actions/admin.ts
- lib/actions/compliance.ts

---

### Phase 7A: Integration & Polish

**TICKET:** LXD-IGN-009
**BRANCH:** claude/ignite-integration-XXXX

**TASK:** Integration testing and polish

1. E2E tests for critical flows
2. Performance optimization
3. Accessibility audit (axe-core)
4. Error boundaries and loading states
5. Mobile responsiveness
6. Documentation

**E2E TEST SCENARIOS:**

Learner Journey:
- Login, view dashboard
- Continue learning, complete lesson
- Answer quiz, receive recommendation
- Override recommendation
- Complete course, view certificate

Instructor Flow:
- View gradebook, filter, export
- View learner detail

**DELIVERABLES:**
- tests/e2e/ignite/*.spec.ts
- Loading/error states for all routes
- docs/ignite/*.md

---

## 11. DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All E2E tests passing
- [ ] TypeScript: 0 errors
- [ ] Lint: 0 errors
- [ ] Accessibility: 0 violations
- [ ] Lighthouse > 90

### Feature Verification
- [ ] Dashboard widgets load
- [ ] Course player works
- [ ] xAPI statements emit
- [ ] Progress saves
- [ ] Recommendations appear
- [ ] Instructor gradebook works
- [ ] Admin dashboard works

### RBAC Verification
- [ ] Learner cannot access /teach/*
- [ ] Instructor cannot access /manage/*
- [ ] Unauthenticated redirects to login

---

## 12. CRITICAL CONSTRAINTS

### Accessibility
- ALL images have alt text
- ALL buttons have type attribute
- ALL inputs have labels
- ALL elements keyboard accessible
- Color contrast 4.5:1 minimum
- Videos have captions
- Respect prefers-reduced-motion

### xAPI
- EMIT "initialized" on start
- EMIT "experienced" on content views
- EMIT "answered" on quizzes
- EMIT "completed" on finish
- INCLUDE latency for hesitation
- INCLUDE cognitive load extension
- NEVER trust client actor

### Performance
- First Contentful Paint < 1.8s
- Largest Contentful Paint < 2.5s
- Time to Interactive < 3.8s
- Cumulative Layout Shift < 0.1

---

## PHASE SUMMARY

| Phase | Description | Est. Duration |
|-------|-------------|---------------|
| 1A | Route Structure | 4-6 hours |
| 1B | Context Providers | 4-6 hours |
| 2A | Dashboard Widgets | 8-10 hours |
| 3A | Player Shell | 6-8 hours |
| 3B | Content Blocks | 12-16 hours |
| 4A | Adaptive Panel | 6-8 hours |
| 5A | Instructor Views | 8-10 hours |
| 6A | Admin & Compliance | 8-10 hours |
| 7A | Integration & Polish | 8-10 hours |

**Total Estimated Duration: 64-84 hours**

---

*Execute phases in order. Each phase builds on the previous. Do not skip phases.*
