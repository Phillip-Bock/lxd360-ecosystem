# CLAUDE.md — LXD360 Ecosystem Development Standards

**Version:** 16.0  
**Last Updated:** January 23, 2026  
**Classification:** Technical Specification — Investor / Compliance Ready  
**Company:** LXD360, LLC (SDVOSB)  
**Platform Status:** ✅ 100% GCP | TurboRepo Monorepo

---

## ⚠️ GUARDRAIL SYSTEM ACTIVE

**Claude Code instances: The `.claude/` folder contains enforced standards.**

- `.claude/settings.json` — Hooks that block forbidden patterns
- `.claude/commands/audit.md` — Use `/project:audit` before completing tasks
- `.claude/commands/complete.md` — Use `/project:complete` for final verification

**CHECKPOINT = STOP + REPORT + WAIT for "APPROVED" or "Go"**

---

> **CRITICAL:** This document is the single source of truth for ALL Claude instances working on the LXD360 Ecosystem. Read this file COMPLETELY before writing ANY code.

---

## Table of Contents

1. [Session Initialization Protocol](#1-session-initialization-protocol)
2. [Project Identity & Products](#2-project-identity--products)
3. [Architecture Overview](#3-architecture-overview)
4. [Tech Stack Specification](#4-tech-stack-specification)
5. [Monorepo Structure](#5-monorepo-structure)
6. [GCP Configuration](#6-gcp-configuration)
7. [Code Quality Standards](#7-code-quality-standards)
8. [Database & Security Standards](#8-database--security-standards)
9. [RBAC System (4 Personas)](#9-rbac-system-4-personas)
10. [xAPI & Learning Analytics](#10-xapi--learning-analytics)
11. [Design System & Branding](#11-design-system--branding)
12. [Accessibility & Compliance](#12-accessibility--compliance)
13. [Multi-Claude Coordination](#13-multi-claude-coordination)
14. [Git Workflow](#14-git-workflow)
15. [Current Development Focus](#15-current-development-focus)

---

## 1. Session Initialization Protocol

### 1.1 Mandatory Confirmation

**Every Claude instance MUST confirm before ANY work:**

```
✅ "I have read CLAUDE.md v16 in full"
✅ "I understand the current task scope"
✅ "I will run validation (lint + typecheck + build) before ANY commit"
✅ "I will NOT use eslint-disable, @ts-ignore, or `any` type"
✅ "I will use `pnpm` (NOT npm/yarn/bun) for all package commands"
✅ "I will NEVER use `git commit --no-verify` to bypass hooks"
✅ "I understand 'Nice not Twice' — zero errors is the target"
✅ "CHECKPOINT = STOP + REPORT + WAIT — I will not proceed without approval"
```

### 1.2 "Nice not Twice" Philosophy

**Core Principle:** Do it right the first time. Don't create debt, don't defer quality.

- Zero TypeScript errors is the TARGET, not aspirational
- Zero lint warnings is the TARGET, not optional
- Zero accessibility violations is the TARGET
- Fix issues when found, don't create tickets to defer them

### 1.3 Package Manager: pnpm ONLY

```bash
# ✅ CORRECT
pnpm install
pnpm run build
pnpm run lint
pnpm add <package> --filter @lxd360/web

# ❌ WRONG
npm install
yarn add
bun install
```

### 1.4 Linter: Biome (NOT ESLint)

This project uses **Biome** for linting, NOT ESLint.

- Configuration: `biome.json`
- Run: `pnpm lint`
- DO NOT add `.eslintrc` files or `eslint-disable` comments

---

## 2. Project Identity & Products

### 2.1 Company Information

| Field | Value |
|-------|-------|
| **Company** | LXD360, LLC |
| **Type** | Service-Disabled Veteran-Owned Small Business (SDVOSB) |
| **CEO/Founder** | Phill Bock, PhD |
| **Domain** | Neuroscience-backed learning experience design |
| **Framework** | INSPIRE™ Methodology |

### 2.2 Product Suite

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LXD360 PRODUCT ECOSYSTEM                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      INSPIRE STUDIO                                  │   │
│  │                    (Authoring Tool)                                  │   │
│  │                                                                      │   │
│  │  • AI-Powered Course Builder (INSPIRE Methodology)                  │   │
│  │  • Standard Course Builder (ADDIE/SAM compatible)                   │   │
│  │  • 70+ Content Block Types                                          │   │
│  │  • SCORM 1.2/2004, xAPI, cmi5 Export                               │   │
│  │  • Neuro-naut AI Design Assistant                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      INSPIRE IGNITE                                  │   │
│  │              (LMS + LXP + LRS Unified Platform)                      │   │
│  │                                                                      │   │
│  │  • Adaptive Learning Engine (BKT + SM-2)                            │   │
│  │  • Glass Box AI (Explainable Recommendations)                       │   │
│  │  • Skill Mastery Tracking                                           │   │
│  │  • Compliance Dashboard                                             │   │
│  │  • LRS with xAPI 1.0.3                                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  USER PERSONAS:                                                            │
│  • Owner: Full access + Billing + User Management                         │
│  • Editor: Authoring Tool + Course Management (no billing)                │
│  • Manager: LXP/LMS dashboards, reports, grading (no authoring)          │
│  • Learner: Content consumption only                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Primary Markets

- Healthcare (HIPAA compliant)
- Aerospace & Defense (FedRAMP pathway)
- Manufacturing
- Financial Services
- Government (Section 508)

---

## 3. Architecture Overview

### 3.1 GCP Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                              │
│  Cloud Run (Next.js 15) → Cloud CDN → Global Edge                           │
└───────────────────────┬─────────────────────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────────────────────┐
│                        BACKEND                                               │
│  Firebase Auth (Authentication + SSO)                                        │
│  Firestore (NoSQL Database - Multi-tenant)                                   │
│  Cloud Storage (Media Assets)                                                │
│  Secret Manager (Credentials)                                                │
└───────────────────────┬─────────────────────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────────────────────┐
│                   INTELLIGENCE LAYER                                         │
│  Vertex AI (Gemini Pro) → Content Generation & Recommendations               │
│  BigQuery → xAPI Learning Record Store & Analytics                           │
│  Cloud Pub/Sub → Real-time Event Streaming                                   │
│  Cloud Functions → xAPI Statement Processing                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Key Architecture Decisions

| Decision | Technology | Rationale |
|----------|------------|-----------|
| Database | Firestore | Auto-scaling, security rules, real-time |
| Auth | Firebase Auth | Enterprise SSO, GCP native |
| Hosting | Cloud Run | Serverless containers, FedRAMP path |
| Analytics | BigQuery | Petabyte scale for xAPI |
| AI/ML | Vertex AI | Native GCP, Gemini integration |

---

## 4. Tech Stack Specification

### 4.1 Production Stack (Locked)

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js | 15.5.9 |
| **UI Library** | React | 19.2.3 |
| **Language** | TypeScript | 5.9.3 (strict mode) |
| **Styling** | Tailwind CSS | 4.1.18 |
| **Components** | shadcn/ui + Radix | Latest |
| **Build** | TurboRepo | 2.7.5 |
| **Linting** | Biome | Latest |
| **State** | Zustand | 5.0.10 |
| **Forms** | React Hook Form + Zod | Latest |
| **Auth** | Firebase Auth | 12.x |
| **Database** | Firestore | Latest |
| **Payments** | Stripe | 20.x |
| **Email** | Brevo | Latest |
| **3D/XR** | Three.js + R3F | 8.x |
| **Testing** | Vitest + Playwright | Latest |

### 4.2 REMOVED Services (DO NOT USE)

| Service | Replacement |
|---------|-------------|
| Supabase | Firebase + Firestore |
| Sanity | Firestore |
| Vercel | Cloud Run |
| Sentry | Cloud Logging |
| Resend | Brevo |

```typescript
// ❌ FORBIDDEN IMPORTS - Will break build
import { createClient } from '@supabase/supabase-js'
import { ... } from '@sanity/client'
import * as Sentry from '@sentry/nextjs'
import { ... } from 'resend'
```

---

## 5. Monorepo Structure

### 5.1 Directory Layout

```
lxd360-ecosystem/
├── .claude/                   # Claude Code guardrails
│   ├── settings.json          # Hooks and permissions
│   └── commands/              # Custom slash commands
│
├── apps/
│   └── web/                   # @lxd360/web - Next.js 15 App
│       ├── app/               # Next.js App Router
│       │   ├── (auth)/        # Auth routes
│       │   ├── (marketing)/   # Public pages
│       │   ├── (tenant)/      # Multi-tenant routes
│       │   │   ├── ignite/    # INSPIRE Ignite (flat structure)
│       │   │   │   ├── dashboard/
│       │   │   │   ├── courses/
│       │   │   │   ├── learners/
│       │   │   │   ├── analytics/
│       │   │   │   ├── gradebook/
│       │   │   │   ├── settings/
│       │   │   │   └── learn/     # Learner-only section
│       │   │   └── inspire/   # INSPIRE Studio (Authoring)
│       │   │       ├── projects/
│       │   │       ├── course-builder/
│       │   │       └── ai-studio/
│       │   └── api/           # API routes
│       ├── components/        # React components
│       │   ├── ignite/        # Ignite-specific components
│       │   │   └── dashboard/ # Dashboard widgets
│       │   ├── studio/        # Studio-specific components
│       │   └── ui/            # shadcn/ui components
│       ├── lib/               # Utilities and services
│       │   ├── firebase/      # Firebase client & admin
│       │   ├── rbac/          # 4-persona access control
│       │   ├── xapi/          # xAPI client
│       │   ├── design-tokens.ts
│       │   └── brand.ts
│       └── types/             # TypeScript types
│
├── packages/
│   ├── ui/                    # @lxd360/ui - Shared utilities
│   ├── types/                 # @inspire/types - Firestore schemas
│   ├── xapi-client/           # @inspire/xapi-client - xAPI validation
│   └── ml/                    # @inspire/ml - BKT & SM-2 algorithms
│
├── functions/                 # Cloud Functions
│   └── process-statement/     # xAPI statement processor
│
├── terraform/                 # Infrastructure as Code
│
├── pnpm-workspace.yaml        # pnpm workspace config
├── turbo.json                 # TurboRepo config
├── biome.json                 # Linter config
└── CLAUDE.md                  # This file
```

### 5.2 Workspace Packages

| Package | Purpose |
|---------|---------|
| `@lxd360/web` | Main Next.js application |
| `@lxd360/ui` | Shared UI utilities (cn, etc.) |
| `@inspire/types` | Zod schemas for Firestore & BigQuery |
| `@inspire/xapi-client` | xAPI 1.0.3 statement validation |
| `@inspire/ml` | BKT + SM-2 learning algorithms |

### 5.3 Build Commands

```bash
# Development
pnpm dev                     # Start Next.js dev server

# Build
pnpm build                   # Build all packages + app
pnpm build:web               # Build web app only
pnpm build:packages          # Build packages only

# Validation
pnpm lint                    # Biome lint
pnpm typecheck               # TypeScript check

# Testing
pnpm test                    # Run tests
pnpm test:e2e                # E2E tests
```

---

## 6. GCP Configuration

### 6.1 Project Details

| Field | Value |
|-------|-------|
| Project ID | `lxd-saas-dev` |
| Region | `us-central1` |
| Firebase Project | `lxd-saas-dev` |

### 6.2 Required Environment Variables

```bash
# Firebase (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# GCP (Server-side)
GOOGLE_CLOUD_PROJECT=lxd-saas-dev
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Application
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_ENV=development
```

### 6.3 Cloud Run Deployment

```bash
gcloud run deploy lxd360-app \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --project lxd-saas-dev
```

---

## 7. Code Quality Standards

### 7.1 Absolute Prohibitions (Zero Tolerance)

```typescript
// ❌ FORBIDDEN — Instant rejection

// @ts-ignore / @ts-expect-error / @ts-nocheck
// eslint-disable (Biome doesn't use these anyway)

// any types
const data: any = something;       // ❌
const value = something as any;    // ❌

// Commented-out code
// const oldFunction = () => { }   // ❌ Delete it

// console.log in production
console.log('debug');              // ❌

// TODO without ticket
// TODO: Fix later                 // ❌
// TODO(LXD-XXX): Fix later       // ✅

// Raw img tags
<img src="/photo.jpg" />           // ❌ Use next/image

// Git hook bypass
git commit --no-verify             // ❌ NEVER
```

### 7.2 Mandatory Patterns

```typescript
// ✅ Images - ALWAYS next/image
import Image from 'next/image';
<Image src="/photo.jpg" alt="Description" width={800} height={600} />

// ✅ Buttons - ALWAYS type attribute
<button type="button" onClick={handleClick}>Click</button>
<button type="submit">Submit</button>

// ✅ SVGs - ALWAYS accessibility
<svg viewBox="0 0 24 24" role="img" aria-label="Settings">
  <title>Settings</title>
  ...
</svg>

// ✅ Client/Server directives - ALWAYS explicit
'use client'  // Top of client components
'use server'  // Top of server actions

// ✅ Explicit return types
function calculate(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### 7.3 Validation Gate

```bash
# Every commit MUST pass:
pnpm lint       # Zero errors
pnpm typecheck  # Zero errors
pnpm build      # Must succeed
```

---

## 8. Database & Security Standards

### 8.1 Firestore Structure

```
users/{userId}                    # User profiles
  └── preferences/
  
tenants/{tenantId}                # Multi-tenant orgs
  ├── courses/{courseId}
  ├── enrollments/{enrollmentId}
  ├── members/{userId}
  └── settings/

xapi_statements/{statementId}     # Learning records
```

### 8.2 Security Rules Pattern

```javascript
// Users can only access their own data
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

// Tenant data scoped by membership
match /tenants/{tenantId} {
  allow read: if request.auth != null && 
    exists(/databases/$(database)/documents/tenants/$(tenantId)/members/$(request.auth.uid));
}
```

---

## 9. RBAC System (4 Personas)

### 9.1 The 4 Personas (Canonical)

| Persona | Description | Access Level |
|---------|-------------|--------------|
| **Owner** | The Author/Designer who owns the tenant | Everything + Billing + User Management |
| **Editor** | Contractor who builds courses | Dashboard, Courses, Authoring Tool (no billing) |
| **Manager** | Client Lead who manages learners | Dashboard, Analytics, Learners, Gradebook (no authoring) |
| **Learner** | End user consuming content | `/ignite/learn/*` only |

### 9.2 Persona Access Map

```typescript
// lib/rbac/personas.ts
export type Persona = 'owner' | 'editor' | 'manager' | 'learner';

export const PERSONA_CONFIG = {
  owner: {
    label: 'Owner',
    level: 100,
    routes: ['dashboard', 'courses', 'learners', 'analytics', 'gradebook', 'authoring', 'settings', 'billing'],
  },
  editor: {
    label: 'Editor',
    level: 75,
    routes: ['dashboard', 'courses', 'authoring'],
  },
  manager: {
    label: 'Manager',
    level: 50,
    routes: ['dashboard', 'learners', 'analytics', 'gradebook'],
  },
  learner: {
    label: 'Learner',
    level: 25,
    routes: ['learn'],
  },
} as const;
```

### 9.3 Route Access by Persona

| Route | Learner | Manager | Editor | Owner |
|-------|---------|---------|--------|-------|
| `/ignite/learn/*` | ✅ | ✅ | ✅ | ✅ |
| `/ignite/dashboard` | ❌ | ✅ | ✅ | ✅ |
| `/ignite/courses` | ❌ | ❌ | ✅ | ✅ |
| `/ignite/learners` | ❌ | ✅ | ❌ | ✅ |
| `/ignite/analytics` | ❌ | ✅ | ❌ | ✅ |
| `/ignite/gradebook` | ❌ | ✅ | ❌ | ✅ |
| `/ignite/settings` | ❌ | ❌ | ❌ | ✅ |
| `/ignite/billing` | ❌ | ❌ | ❌ | ✅ |
| `/inspire/*` (Authoring) | ❌ | ❌ | ✅ | ✅ |

### 9.4 Why 4 Personas (Not 11 Roles)

The previous 11-role hierarchy was enterprise over-engineering. The 4-persona model:

- Maps directly to real user journeys
- Simplifies RBAC logic
- Eliminates terminology confusion ("Instructor" → Owner/Editor/Manager)
- Reduces codebase complexity

---

## 10. xAPI & Learning Analytics

### 10.1 xAPI Implementation

The `@inspire/xapi-client` package provides:

- **Statement Builder** — Fluent API for creating xAPI statements
- **Validator** — Zod schemas for xAPI 1.0.3 compliance
- **Recipes** — Pre-built statement templates:
  - Assessment answers
  - Content block interactions
  - Modality swaps
  - Skill mastery updates

### 10.2 Learning Algorithms

The `@inspire/ml` package provides:

- **BKT (Bayesian Knowledge Tracing)** — Skill mastery estimation
- **SM-2 (Spaced Repetition)** — Review scheduling with BKT integration

### 10.3 xAPI Pipeline

```
User Interaction → xAPI Statement → Pub/Sub → Cloud Function → BigQuery
                                                    ↓
                                              Firestore (real-time)
```

---

## 11. Design System & Branding

### 11.1 Brand Colors (from globals.css)

```css
/* Primary Brand */
--color-lxd-primary: #0072f5;
--color-lxd-primary-dark: #001d3d;
--color-lxd-secondary: #019ef3;

/* Semantic */
--color-lxd-success: #237406;
--color-lxd-caution: #b58e21;
--color-lxd-warning: #a75d20;
--color-lxd-error: #cd0a0a;

/* Neural Accents */
--color-neural-cyan: #00d4ff;
--color-neural-purple: #8b5cf6;

/* Gradient */
--gradient-neural: linear-gradient(135deg, #0072f5, #019ef3);
```

### 11.2 Typography

```css
--font-family-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
--font-family-mono: "JetBrains Mono", ui-monospace, monospace;
```

### 11.3 Usage in Components

```tsx
// Using CSS variables with Tailwind
<div className="bg-[var(--color-lxd-primary)]" />
<div className="text-[var(--color-lxd-success)]" />

// Card with glow effect
<Card className="hover:shadow-[0_0_20px_rgba(0,114,245,0.15)]" />
```

### 11.4 Icon Libraries

- **Primary:** Lucide React (`lucide-react`)
- **Dashboard Animations:** animate-ui (`@animate-ui/icons`)

---

## 12. Accessibility & Compliance

### 12.1 WCAG 2.2 AA Requirements

| Requirement | Implementation |
|-------------|----------------|
| Color Contrast | Minimum 4.5:1 text, 3:1 large |
| Keyboard Navigation | All interactive elements focusable |
| Screen Reader | Semantic HTML, ARIA labels |
| Focus Indicators | Visible focus rings |
| Motion | `prefers-reduced-motion` support |

### 12.2 Mandatory Accessibility Patterns

```tsx
// ✅ Every button has type
<button type="button">Click</button>

// ✅ Every image has alt
<Image src="/photo.jpg" alt="Team meeting" />

// ✅ Every SVG has accessibility
<svg role="img" aria-label="Chart">
  <title>Revenue Chart</title>
</svg>

// ✅ Every form input has label
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### 12.3 Compliance Targets

- **FedRAMP Ready** — GCP services are FedRAMP authorized
- **WCAG 2.2 AA** — Accessibility-first design
- **HIPAA** — Healthcare data handling
- **Section 508** — Federal accessibility

---

## 13. Multi-Claude Coordination

### 13.1 Instance Assignments

| Instance | Role | Tasks |
|----------|------|-------|
| **Desktop Claude** | Orchestrator | Project management, high-level coordination |
| **VS Code Claude** | Deep Development | Component building, refactoring |
| **Browser Claude** | Heavy Generation | Documentation, schemas, artifacts |
| **Claude Code** | Parallel Workers | Isolated features on branches |

### 13.2 Branch Naming Convention

```
claude/[feature-area]-[brief-description]-[random-4-chars]

Examples:
- claude/strategic-reset-rbac-a7x3
- claude/xapi-pipeline-bigquery-k9m2
- claude/scorm-uploader-jszip-p4jz
```

### 13.3 Session Handoff Template

```markdown
## Session Handoff — [Date]

### Completed Work
- [ ] Branch: `claude/feature-xxxx`
- [ ] Files: List of created/modified files

### Validation Status
| Check | Result |
|-------|--------|
| TypeScript | ✅ 0 errors |
| Lint | ✅ 0 errors |
| Build | ✅ Success |

### Next Steps
1. [Specific next action]

### Blockers
- [Any blocking issues]
```

---

## 14. Git Workflow

### 14.1 Branch Strategy

```
main (production)
  └── develop (staging)
        └── feature/* (new features)
        └── claude/* (AI-assisted work)
```

### 14.2 Commit Message Format

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
```

### 14.3 Pre-Commit Hooks (NEVER BYPASS)

```bash
# ❌ FORBIDDEN
git commit --no-verify
git commit -n

# ✅ If hooks fail, FIX THE ISSUES
pnpm lint --fix
pnpm typecheck
```

---

## 15. Current Development Focus

### 15.1 Active Work: Strategic Reset

**Mission:** Flatten route structure, implement 4-persona RBAC, connect real Firebase user data.

| Task | Status | Notes |
|------|--------|-------|
| Route flattening | 🔄 Active | `/ignite/teach/*` → `/ignite/*` |
| 4-persona RBAC | 🔄 Active | Replacing 11-role hierarchy |
| AppSidebar refactor | 🔄 Active | Real user data + persona badge |
| "Instructor" removal | 📋 Queued | Replace with Owner/Editor/Manager |

### 15.2 Route Structure (Target)

```
/ignite/
├── dashboard      ← Main command center (all admin personas)
├── courses        ← Course management (Owner, Editor)
├── learners       ← Learner management (Owner, Manager)
├── analytics      ← Reports & metrics (Owner, Manager)
├── gradebook      ← Grading (Owner, Manager)
├── settings       ← Tenant settings (Owner only)
├── billing        ← Subscription management (Owner only)
└── learn/         ← Learner-only section
    └── [courseId] ← Course player

/inspire/          ← Authoring Tool (Owner, Editor)
├── projects/
├── course-builder/
└── ai-studio/
```

### 15.3 Key Files

```
apps/web/lib/rbac/personas.ts              ← 4-persona definitions
apps/web/components/ignite/dashboard/
├── AppSidebar.tsx                         ← Main navigation (RBAC filtered)
├── Stats04.tsx                            ← Stats widgets
├── CoursesTable.tsx                       ← Course list
└── AiChatWidget.tsx                       ← AI assistant
apps/web/app/(tenant)/ignite/layout.tsx    ← Master layout
apps/web/app/(tenant)/ignite/dashboard/    ← Dashboard page
```

### 15.4 Upcoming Phases

1. **Phase 1:** Strategic Reset (current) — flatten routes, 4-persona RBAC
2. **Phase 2:** Learner Dashboard — `/ignite/learn/*` experience
3. **Phase 3:** Authoring Tool integration — link `/inspire/*` to persona access
4. **Phase 4:** xAPI Pipeline completion

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 16.0 | 2026-01-23 | Strategic Reset: 4-persona RBAC (Owner/Editor/Manager/Learner), route flattening, removed 11-role over-engineering |
| 15.0 | 2026-01-21 | TurboRepo monorepo refactor |
| 14.0 | 2026-01-21 | pnpm migration |
| 13.0 | 2026-01-20 | INSPIRE LRS packages |

---

**END OF DOCUMENT**

*This document is the single source of truth for all development on the LXD360 Ecosystem. Violations require full rework. No exceptions.*
