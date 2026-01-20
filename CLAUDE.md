# CLAUDE.md — LXP360-SaaS Development Standards

**Version:** 12.0  
**Last Updated:** January 11, 2026  
**Classification:** Technical Specification — Investor / Compliance Ready  
**Company:** LXD360, LLC (SDVOSB)  
**Migration Status:** ✅ COMPLETE - 100% GCP

---

## ⚠️ GUARDRAIL SYSTEM ACTIVE

**Claude Code instances: The `.claude/` folder contains enforced standards.**

- `.claude/settings.json` — Hooks that block forbidden patterns
- `.claude/commands/audit.md` — Use `/project:audit` before completing tasks
- `.claude/commands/complete.md` — Use `/project:complete` for final verification
- `.claude/commands/checkpoint.md` — Use for checkpoint reports

**CHECKPOINT = STOP + REPORT + WAIT for "APPROVED" or "Go"**

Checkpoints are NOT "report and continue." They require explicit approval before proceeding.

---

> **CRITICAL:** This document is the single source of truth for ALL Claude instances working on LXP360-SaaS. Read this file COMPLETELY before writing ANY code.

---

## Table of Contents

1. [Session Initialization Protocol](#1-session-initialization-protocol)
2. [Project Identity](#2-project-identity)
3. [Architecture Decision Records](#3-architecture-decision-records)
4. [Tech Stack Specification](#4-tech-stack-specification)
5. [GCP Configuration](#5-gcp-configuration)
6. [Code Quality Standards](#6-code-quality-standards)
7. [Database & Security Standards](#7-database--security-standards)
8. [API & Integration Patterns](#8-api--integration-patterns)
9. [Framework-Specific Patterns](#9-framework-specific-patterns)
10. [Testing & Quality Assurance](#10-testing--quality-assurance)
11. [Accessibility & Compliance](#11-accessibility--compliance)
12. [Multi-Claude Coordination](#12-multi-claude-coordination)
13. [Git Workflow & Version Control](#13-git-workflow--version-control)
14. [Performance Standards](#14-performance-standards)
15. [Session Protocols](#15-session-protocols)
16. [Appendix: Decision Log](#appendix-decision-log)

---

## 1. Session Initialization Protocol

### 1.1 Mandatory Confirmation

**Every Claude instance MUST confirm before ANY work:**

```
✅ "I have read CLAUDE.md v12 in full"
✅ "I understand the current task scope"
✅ "I will run validation (lint + typecheck + build) before ANY commit"
✅ "I will NOT use eslint-disable, @ts-ignore, or `any` type"
✅ "I will NOT develop tunnel vision—context matters beyond immediate task"
✅ "I will NOT import removed services (Supabase, Sanity, Sentry, Resend, Vercel)"
✅ "If delegating to sub-agents, I will inject these rules into their context"
✅ "I will use `npm` (NOT pnpm/yarn/bun) for all package commands"
✅ "I will NEVER use `git commit --no-verify` or `-n` to bypass hooks"
✅ "I will ARCHIVE deprecated files, never delete from history"
✅ "I understand 'Nice not Twice' — zero errors is the target, not aspirational"
✅ "CHECKPOINT = STOP + REPORT + WAIT — I will not proceed without explicit approval"
✅ "I will confirm understanding before executing instructions"
```

### 1.2 Anti-Tunnel-Vision Principle

**Claude instances MUST maintain awareness of:**
- How changes affect other parts of the codebase
- Whether changes break existing patterns or conventions
- If the "fix" creates worse problems elsewhere
- Business context—what the feature is ultimately trying to achieve
- The GCP migration is COMPLETE—do not introduce old service dependencies

**If unclear:** Ask Phill before implementing. A question is better than a broken system.

### 1.3 Checkpoint Protocol

**CHECKPOINT = STOP + REPORT + WAIT**

A checkpoint is NOT "report and continue." It requires:
1. **STOP** — Cease all work
2. **REPORT** — Provide structured checkpoint report
3. **WAIT** — Do not proceed until you receive explicit "APPROVED" or "Go"

**Checkpoint Report Template:**
```markdown
## CHECKPOINT: [Phase Name]

### Work Completed
| Item | Status | Details |

### Commit(s)
- `[hash]` - [message]

### Verification
| Check | Result |
| TypeScript | ✅ 0 errors |
| Lint | ✅ 0 errors |

### Issues Found Outside Scope
[List ANY issues discovered]

**WAITING for approval to proceed to [Next Phase].**
```

**After receiving new instructions:**
```
I understand. [Summarize key points]. Ready.
```
Then WAIT for "Go" before executing.

### 1.4 The Great Agent Disaster (December 2024)

**What happened:** Parallel agents were given broad scope to "fix ESLint errors." Errors increased from 1,951 → 2,134 because agents added `eslint-disable` comments instead of fixing actual issues.

**Prevention rules (now codified):**
- File-level scope for all agent tasks (never directory-level)
- Mandatory validation between agent tasks
- Primary agent reviews ALL sub-agent work before ANY commit
- Immediate rollback if error count increases

### 1.5 "Nice not Twice" Philosophy

**Core Principle:** Do it right the first time. Don't create debt, don't defer quality.

> "Would NASA introduce foreign matter into space? No. And we don't deploy debris to production."

**What this means:**
- Zero TypeScript errors is the TARGET, not aspirational
- Zero lint warnings is the TARGET, not optional
- Zero accessibility violations is the TARGET, not "improvements for later"
- Fix issues when found, don't create tickets to defer them
- "Slow is smooth, smooth is fast" — foundation before features

**What this does NOT mean:**
- Don't bypass checks to ship faster
- Don't create tickets to excuse shortcuts
- Don't call quality issues "improvements" to justify skipping them
- Don't use `--no-verify` to avoid fixing problems

### 1.6 Archive Policy (Never Delete)

**Rule:** Archive deprecated code, never delete it from history.

**Why:**
- Compliance audits need historical context
- Easier rollback if needed
- Professional practice for enterprise software

**Archive Location:**
```
C:\GitHub\_archived_LXP360\     # OUTSIDE the repo
```

**NOT inside the repo** — archived code inside the repo contaminates TypeScript/lint metrics.

**Process:**
1. Move files to archive location (outside repo)
2. Git will see them as deleted (that's correct)
3. Commit the deletion with descriptive message
4. Archive folder preserves history for compliance

### 1.7 Package Manager: npm ONLY

**Use `npm` for ALL package operations. NOT pnpm, yarn, or bun.**

```powershell
# ✅ CORRECT
npm install --legacy-peer-deps
npm run build
npm run lint

# ❌ WRONG
pnpm install
yarn add
bun install
```

**Why:**
- Consistent lockfile (package-lock.json)
- Cloud Run compatibility
- Team standardization

### 1.8 Linter: Biome (NOT ESLint)

**This project uses Biome for linting, NOT ESLint.**

- ESLint config files have been removed
- Biome configuration is in `biome.json`
- Run with: `npm run lint` (which calls Biome)

**DO NOT:**
- Add `.eslintrc` files
- Add `eslint-disable` comments (they do nothing)
- Reference ESLint in any way

### 1.9 Pre-Commit Hooks: NEVER BYPASS

**NEVER use `git commit --no-verify` or `git commit -n`.**

Pre-commit hooks (via Husky) exist to catch:
- TypeScript errors
- Lint violations
- Accessibility issues
- Forbidden patterns (`any`, `@ts-ignore`, `console.log`)

**If hooks fail, FIX THE ISSUES.**

**DO NOT:**
- Bypass with `--no-verify` or `-n`
- Create tickets to "fix later"
- Call issues "improvements" to justify skipping
- Claim it's a "one time" exception

**If you believe hooks should be bypassed:**
1. STOP
2. Report the exact errors to Phill
3. Wait for explicit approval (answer will almost always be "no")
4. If approved, document why in the commit message

**Hooks are the airlock.** Bypassing them introduces debris into the codebase.

---

## 2. Project Identity

| Field | Value |
|-------|-------|
| **Product** | LXP360-SaaS |
| **Company** | LXD360, LLC (Service-Disabled Veteran-Owned Small Business) |
| **Framework** | INSPIRE™ (Integrative, Neuroscience-informed, Strategic, Personalized, Immersive, Results-focused, Evolutionary) |
| **Primary Markets** | Healthcare, Aerospace, Defense, Manufacturing, Financial Services |
| **Compliance Targets** | FedRAMP Ready, SOC 2 Type II, WCAG 2.2 AA, HIPAA, GDPR |

### 2.1 Repository Location

```bash
# Windows (Primary Development)
C:\GitHub\LXP360-SaaS

# ALWAYS use full paths in ALL commands
cd C:\GitHub\LXP360-SaaS  # ✅ Correct
cd ../src                  # ❌ Never assume current directory
```

### 2.2 Project Structure (Single Next.js App — NOT a Monorepo)

**This is a single Next.js application, NOT a monorepo.**

There is no `packages/`, `apps/`, or workspace structure. The `.turbo` folder is build cache only.

```
LXP360-SaaS/
├── .claude/               # Claude Code guardrails (enforced)
│   ├── settings.json      # Hooks and permissions
│   └── commands/          # Custom slash commands
├── app/                   # Next.js App Router
│   ├── (auth)/            # Auth routes (login, signup, etc.)
│   ├── (internal)/        # Internal admin routes
│   ├── (public)/          # Public marketing pages
│   ├── (tenant)/          # Multi-tenant app routes
│   └── api/               # API routes
├── components/            # Shared React components
├── lib/                   # Utilities and services
│   ├── firebase/          # Firebase client & admin
│   ├── stripe/            # Stripe integration
│   └── xapi/              # xAPI/LRS integration
├── hooks/                 # Custom React hooks
├── providers/             # React context providers
├── types/                 # TypeScript type definitions
├── public/                # Static assets
├── .claude/               # Claude Code configuration
└── CLAUDE.md              # This file (source of truth)
```

**Route Group Naming Convention:**
- `(auth)` — Authentication flows
- `(public)` — Marketing/public pages
- `(tenant)` — Multi-tenant protected routes
- `(internal)` — Admin/command center
- `(ecosystem)` — Product ecosystem pages

**⚠️ AUDIT NEEDED:** Route structure has inconsistencies (e.g., `(ecosystem)/eco/` vs `(public)/(products)/lxd-ecosystem/`). Full route audit scheduled.

---

## 3. Architecture Decision Records

### ADR-001: Google Cloud Platform (Full Stack)

**Status:** Adopted (January 2026)  
**Context:** Need enterprise-grade infrastructure with FedRAMP compliance path for government contracts. Previous Supabase/Vercel stack did not meet federal requirements.

**Decision:** Migrate to 100% GCP stack.

**Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  Cloud Run (Next.js) → Cloud CDN → Global Edge              │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                        BACKEND                               │
│  Firebase Auth (Authentication + SSO)                       │
│  Firestore (NoSQL Database - Multi-tenant)                  │
│  Cloud Storage (Media Assets)                               │
│  Secret Manager (Credentials)                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   INTELLIGENCE LAYER                         │
│  Vertex AI (Gemini Pro) → Content Generation                │
│  BigQuery → xAPI Learning Record Store                      │
│  Cloud Pub/Sub → Real-time Event Streaming                  │
│  Looker Studio → Analytics Dashboards                       │
└─────────────────────────────────────────────────────────────┘
```

**Rationale:**
- FedRAMP High authorized services
- Native Vertex AI integration for AI-first platform
- Firestore scales automatically with security rules
- Single vendor simplifies compliance audits
- Cloud Run provides serverless containers with autoscaling

---

### ADR-002: Firebase Auth (NOT Supabase)

**Status:** Adopted  
**Context:** Enterprise authentication with SSO support required for government and healthcare clients.

**Decision:** Firebase Auth over Supabase Auth.

**Rationale:**
- Native GCP integration
- SAML/OIDC support for enterprise SSO
- Identity Platform upgrade path for advanced features
- FedRAMP compliant infrastructure

**Implementation:**
```typescript
// Client-side - lib/firebase/client.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
```

```typescript
// Server-side - lib/firebase/admin.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const app = getApps().length === 0
  ? initializeApp({
      credential: cert({
        projectId: process.env.GOOGLE_CLOUD_PROJECT,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  : getApps()[0];

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
```

---

### ADR-003: Firestore (NOT PostgreSQL/Supabase)

**Status:** Adopted  
**Context:** Need scalable NoSQL database with real-time capabilities and security rules for multi-tenant architecture.

**Decision:** Firestore over Supabase PostgreSQL.

**Rationale:**
- Automatic scaling (no connection pooling issues)
- Real-time subscriptions built-in
- Security rules for client-side data access
- Native GCP integration
- Offline support for mobile apps

**Collections Structure:**
```
users/                    # User profiles
organizations/            # Multi-tenant orgs
  {orgId}/courses/       # Nested courses per org
  {orgId}/members/       # Org membership
xapi_statements/         # Learning records (LRS)
waitlist/                # Email signups
subscriptions/           # Stripe subscription data
```

---

### ADR-004: Next.js 15 + React 19 (App Router)

**Status:** Adopted  
**Context:** Need server-side rendering for SEO, streaming for performance, and React Server Components for reduced bundle size.

**Decision:** Next.js with App Router on Cloud Run.

**Critical Configuration (next.config.mjs):**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // ⚠️ REQUIRED for Cloud Run
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,  // Cloud Run doesn't support Next.js image optimization
  },
}
export default nextConfig;
```

**Breaking Changes (v15):**
```typescript
// params and searchParams are now Promises
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const { q } = await searchParams;
  const cookieStore = await cookies();
  return <div>{slug}</div>;
}
```

---

### ADR-005: TypeScript 5.9+ Strict Mode

**Status:** Adopted  
**Context:** Enterprise applications require maximum type safety to prevent runtime errors in regulated industries.

**Decision:** TypeScript with ALL strict options enabled.

**tsconfig.json (Mandatory):**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

### ADR-006: Cloud Run (NOT Vercel)

**Status:** Adopted  
**Context:** Need containerized deployment with FedRAMP compliance path.

**Decision:** Cloud Run over Vercel.

**Deploy Command:**
```powershell
cd C:\GitHub\LXP360-SaaS
gcloud run deploy lxd360-app `
  --source . `
  --region us-central1 `
  --allow-unauthenticated `
  --port 3000 `
  --project lxd-saas-dev
```

---

## 4. Tech Stack Specification

### 4.1 Production Stack (Locked - January 2026)

| Layer | Technology | Version | Status |
|-------|------------|---------|--------|
| **Hosting** | Cloud Run | - | ✅ Ready |
| **Auth** | Firebase Auth | 11.x | ✅ Configured |
| **Database** | Firestore | - | ✅ Configured |
| **Storage** | Cloud Storage | - | ✅ Ready |
| **Analytics** | BigQuery + Looker | - | ✅ Ready |
| **AI/ML** | Vertex AI + Gemini | - | ✅ Ready |
| **Secrets** | Secret Manager | - | ✅ Ready |
| **Background Jobs** | Cloud Tasks + Pub/Sub | - | ✅ GCP Native |

### 4.2 Application Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 15.5.9 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | 5.9.3 |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui + Radix | Latest |
| Icons | lucide-react | 0.555.0 |
| State | Zustand | 5.x |
| Forms | React Hook Form + Zod | Latest |
| Payments | Stripe | 20.x |
| 3D/XR | Three.js + R3F | 8.x |
| Testing | Vitest + Playwright | Latest |

### 4.3 REMOVED Services (DO NOT USE)

| Service | Status | Replacement |
|---------|--------|-------------|
| Supabase | ❌ REMOVED | Firebase + Firestore |
| Sanity | ❌ REMOVED | Firestore |
| Vercel | ❌ REMOVED | Cloud Run |
| Sentry | ❌ REMOVED | Cloud Logging |
| Doppler | ❌ REMOVED | Secret Manager |
| Resend | ❌ REMOVED | TBD (not needed for launch) |

```typescript
// ❌ FORBIDDEN IMPORTS - Will break build
import { createClient } from '@supabase/supabase-js'  // REMOVED
import { ... } from '@sanity/client'                   // REMOVED
import * as Sentry from '@sentry/nextjs'               // REMOVED
import { ... } from 'resend'                           // REMOVED
```

### 4.4 Critical Installation Command

```bash
# ALWAYS use --legacy-peer-deps due to React 19 dependency conflicts
# Use npm ONLY — not pnpm, yarn, or bun
npm install --legacy-peer-deps
```

---

## 5. GCP Configuration

### 5.1 Project Details

```
Project ID: lxd-saas-dev
Project Name: lxd-saas-dev
Region: us-central1
```

### 5.2 Firebase Web App Config

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyAofpfEisG-fZy6feF_QF2HviP7yRKG9YI",
  authDomain: "lxd-saas-dev-644bf.firebaseapp.com",
  projectId: "lxd-saas-dev-644bf",
  storageBucket: "lxd-saas-dev-644bf.firebasestorage.app",
  messagingSenderId: "266906655404",
  appId: "1:266906655404:web:c1900e3d823c5417c31d09",
  measurementId: "G-3BGJ0WWTBM",
};
```

### 5.3 Required Environment Variables

```bash
# Firebase (Client-side - NEXT_PUBLIC_)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

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
NEXT_PUBLIC_APP_ENV=development|production
```

### 5.4 GCP CLI Commands

```powershell
# Auth
gcloud auth login
gcloud config set project lxd-saas-dev

# Cloud Run Deploy
gcloud run deploy lxd360-app --source . --region us-central1

# View Logs
gcloud run services logs read lxd360-app --region us-central1

# Firebase
firebase login
firebase deploy --only firestore:rules

# Secrets
gcloud secrets create NAME --data-file=file.txt
gcloud run services update SERVICE --set-secrets=VAR=NAME:latest
```
### 5.5 GCP Deployment

```GCP Cloud Run Deployment
# AuthGuidelines
GCP Cloud Run Deployment (Next.js + Firebase + Supabase)
Critical Concept: Build Time vs Runtime

⚠️ FUNDAMENTAL DIFFERENCE FROM VERCEL
Cloud Run builds containers WITHOUT access to Secret Manager or runtime environment variables.
Any code that executes during build (including static page generation) cannot access secrets.
This is fundamentally different from Vercel, which provides environment variables at both build and runtime.

The Golden Rule
Every page that uses Firebase Auth, Supabase client, cookies(), headers(), or any runtime secrets MUST have:
typescript// At the TOP of the page.tsx file (NOT in layout.tsx with 'use client')
export const dynamic = 'force-dynamic';
Why This Matters

Next.js attempts to prerender pages at build time (Static Site Generation)
If a page imports Firebase Auth, Firebase initializes during build
Firebase needs API keys, but secrets aren't available at build time
Build fails with auth/invalid-api-key error

File Structure Rules
app/
├── (public)/                    # ✅ Can be static - no auth
│   ├── page.tsx                 # Landing page
│   └── pricing/page.tsx
├── (auth)/                      # 🚨 NEEDS dynamic export on PAGES
│   ├── layout.tsx               # Has 'use client' - NO dynamic here
│   ├── login/page.tsx           # ✅ Add: export const dynamic = 'force-dynamic'
│   └── signup/page.tsx          # ✅ Add: export const dynamic = 'force-dynamic'
├── (tenant)/                    # 🚨 NEEDS dynamic export on ALL PAGES
│   ├── layout.tsx               # Has 'use client' - NO dynamic here
│   ├── dashboard/page.tsx       # ✅ Add: export const dynamic = 'force-dynamic'
│   └── admin/***/page.tsx       # ✅ Add to EVERY page.tsx
Common Mistakes to Avoid
❌ Wrong✅ CorrectAdding dynamic export to layout.tsx with 'use client'Add dynamic export to each page.tsxUsing NEXT_PUBLIC_* for Firebase configUse server-side env vars, pass via propsHardcoding any API keysUse Secret ManagerAssuming build has access to secretsForce dynamic rendering for auth pages
Pre-Deployment Checklist
bash# 1. Verify build succeeds locally
npm run build

# 2. Check all auth pages have dynamic export
grep -r "export const dynamic" app/(tenant) app/(auth)

# 3. Verify no NEXT_PUBLIC_ used for secrets
grep -r "NEXT_PUBLIC_FIREBASE" app/

# 4. Ensure secrets exist
gcloud secrets list

# 5. Verify IAM permissions
gcloud projects get-iam-policy PROJECT_ID \
  --filter="bindings.members:*-compute@developer.gserviceaccount.com"
Deployment Command Template
bashgcloud run deploy lxd360-app \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="FIREBASE_API_KEY=FIREBASE_API_KEY:latest" \
  --set-secrets="FIREBASE_AUTH_DOMAIN=FIREBASE_AUTH_DOMAIN:latest" \
  --set-secrets="FIREBASE_PROJECT_ID=FIREBASE_PROJECT_ID:latest" \
  --set-secrets="FIREBASE_STORAGE_BUCKET=FIREBASE_STORAGE_BUCKET:latest" \
  --set-secrets="FIREBASE_MESSAGING_SENDER_ID=FIREBASE_MESSAGING_SENDER_ID:latest" \
  --set-secrets="FIREBASE_APP_ID=FIREBASE_APP_ID:latest" \
  --set-secrets="SUPABASE_URL=SUPABASE_URL:latest" \
  --set-secrets="SUPABASE_ANON_KEY=SUPABASE_ANON_KEY:latest" \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10
Troubleshooting Quick Reference
ErrorCauseSolutionauth/invalid-api-key during buildFirebase init at build timeAdd export const dynamic = 'force-dynamic' to pageNEXT_PUBLIC_* undefined at runtimeBuild-time inliningUse server-side env vars insteadPermission denied for secretsMissing IAM roleGrant secretmanager.secretAccessor to service accountBuild hangsLarge dependenciesCheck memory allocation, use .gcloudignore
Required Secrets in Secret Manager
Secret NamePurposeFIREBASE_API_KEYFirebase AuthFIREBASE_AUTH_DOMAINFirebase AuthFIREBASE_PROJECT_IDFirebase AuthFIREBASE_STORAGE_BUCKETFirebase StorageFIREBASE_MESSAGING_SENDER_IDFirebase Cloud MessagingFIREBASE_APP_IDFirebase AppSUPABASE_URLSupabase clientSUPABASE_ANON_KEYSupabase public operationsSUPABASE_SERVICE_ROLE_KEYSupabase admin operations
Before Every Deployment

☐ Run npm run build locally - must succeed
☐ Verify all (tenant) and (auth) pages have dynamic export
☐ Check no Firebase config uses NEXT_PUBLIC_* prefix
☐ Confirm all secrets exist in Secret Manager
☐ Verify service account has secretmanager.secretAccessor role


Remember: When a Cloud Run build fails, check the build logs for the exact failing page path. The solution is almost always adding export const dynamic = 'force-dynamic' to that page.
---

## 6. Code Quality Standards

### 6.1 File Headers (Minimal or None)

**Do NOT create verbose 15+ line file headers.** They add noise, not value.

```typescript
// ❌ WRONG — Verbose header (DO NOT USE)
/**
 * =============================================================================
 * LXP360-SaaS | Some Component
 * =============================================================================
 * Description that just repeats the filename...
 *
 * @author       LXD360 Development Team
 * @copyright    2024 LXD360 LLC. All rights reserved.
 * @license      Proprietary
 * @created      2024-11-29
 * @modified     2024-12-05
 * @version      2.0.0
 * =============================================================================
 */

// ✅ CORRECT — No header, or single-line if needed
// LXD360 - Course catalog with Firestore integration

// ✅ ALSO CORRECT — Brief JSDoc for public APIs only
/**
 * Fetches courses for an organization from Firestore.
 */
export async function getCourses(orgId: string): Promise<Course[]> {
```

**Rules:**
- Copyright and license info is in the LICENSE file (don't duplicate)
- `@author`, `@created`, `@modified` dates go stale immediately (don't use)
- If you need a comment, make it one line explaining PURPOSE, not metadata
- JSDoc is fine for public API functions (brief, focused on usage)

### 6.2 Absolute Prohibitions (Zero Tolerance)

```typescript
// ❌ FORBIDDEN — Instant rejection, full rework required

// ESLint disables (we use Biome, but these are still forbidden)
// eslint-disable-next-line
/* eslint-disable */

// TypeScript escapes
// @ts-ignore
// @ts-expect-error
// @ts-nocheck

// any types
const data: any = something;
const value = something as any;

// Commented-out code (delete it—Git history exists)
// const oldFunction = () => { ... }

// TODO without Linear ticket
// TODO: Fix this later  ❌
// TODO(LXD-XXX): Fix this  ✅

// console.log in production code
console.log('debug');  // ❌ Use console.error for actual errors

// Raw img tags
<img src="/photo.jpg" />  // ❌ Use next/image

// Git hook bypass
git commit --no-verify  // ❌ NEVER
git commit -n           // ❌ NEVER
```

### 6.3 Mandatory Patterns

**Images — ALWAYS use next/image:**
```typescript
// ✅ CORRECT
import Image from 'next/image';
<Image src="/photo.jpg" alt="Photo" width={800} height={600} />
```

**Client/Server Directives — ALWAYS explicit:**
```typescript
'use client'  // At top of client components
'use server'  // At top of server actions
```

**Error Handling — ALWAYS handle:**
```typescript
// ✅ CORRECT
try {
  const docRef = await addDoc(collection(db, 'users'), data);
} catch (error) {
  console.error('Failed to create user:', error);
  throw new Error('User creation failed');
}
```

**Type Definitions — Explicit returns:**
```typescript
// ✅ CORRECT — Explicit types
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

**Buttons — ALWAYS have type attribute:**
```typescript
// ✅ CORRECT
<button type="button" onClick={handleClick}>Click me</button>
<button type="submit">Submit</button>

// ❌ WRONG — Missing type
<button onClick={handleClick}>Click me</button>
```

**SVGs — ALWAYS have accessibility:**
```typescript
// ✅ CORRECT
<svg viewBox="0 0 24 24" role="img" aria-label="Settings icon">
  <title>Settings</title>
  ...
</svg>

// ❌ WRONG — Missing accessibility
<svg viewBox="0 0 24 24">...</svg>
```

### 6.4 Input Validation (Zod)

```typescript
import { z } from 'zod';

const createCourseSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  description: z.string().optional(),
  organizationId: z.string().min(1, 'Organization required'),
});

// Use in API route
export async function POST(request: Request) {
  const body = await request.json();
  const result = createCourseSchema.safeParse(body);
  
  if (!result.success) {
    return Response.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 }
    );
  }
  
  const { title, description, organizationId } = result.data;
  // ...
}
```

### 6.5 TODO/FIXME Convention

```typescript
// ✅ CORRECT - Has Linear ticket
// TODO(LXD-301): Implement with Firestore
// FIXME(LXD-302): Handle edge case for empty results
// HACK(LXD-303): Temporary workaround until API v2

// ❌ WRONG - No ticket
// TODO: Fix this later
// FIXME: Something's broken
```

### 6.6 Clean Stub Pattern

```typescript
import { adminDb } from '@/lib/firebase/admin';

// TODO(LXD-301): Implement with Firestore
export async function syncSubscriptionFromStripe(
  subscriptionId: string
): Promise<void> {
  // Stub - will be implemented in Phase 3B
  return;
}
```

### 6.7 Validation Gate (Pre-Commit)

```bash
# Every commit MUST pass ALL THREE:
npm run lint        # Must pass
npm run typecheck   # Must pass  
npm run build       # Must pass
```

**Rollback immediately if:**
- Error count increases
- `eslint-disable` added
- `@ts-ignore` added
- `any` type used
- Build fails
- Removed service imported

### 6.8 Zero Errors Target

**Targets (not aspirational — mandatory for deploy):**

| Check | Target | Notes |
|-------|--------|-------|
| TypeScript | 0 errors | Track in Linear |
| Lint Errors | 0 errors | Track in Linear |
| Lint Warnings | 0 warnings | Track in Linear |
| Build | PASS | Must pass |

**The `ignoreBuildErrors: true` flag in next.config.mjs is TEMPORARY.**

It exists only because we inherited 914 TypeScript errors from incomplete migration. It will be set to `false` before production deploy.

**Do not use this flag as permission to introduce new errors.**

### 6.9 Verification Scope (No Narrow-Scope Cheating)

**When verifying work, use the SAME scope as the original analysis.**

```bash
# ❌ WRONG — Narrowing scope to hide issues
# Original found 210 hits, "verification" shows 0 by excluding files
grep -r "supabase" --include="*.ts" .   # Missing .md, .json files

# ✅ CORRECT — Same scope as original
grep -ri "supabase" --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json" . | grep -v node_modules | grep -v .next
```

**Rules:**
- Final verification grep MUST match initial analysis scope
- Report counts INCLUDING acceptable exceptions (CHANGELOG, CLAUDE.md)
- Don't report "0 hits" by excluding where the hits are
- If you found 200 issues initially, explain where ALL 200 went

### 6.10 Root Directory Cleanliness

**The repo root should contain ONLY:**
- Configuration files (next.config.mjs, tsconfig.json, etc.)
- Package files (package.json, package-lock.json)
- Documentation (README.md, CLAUDE.md)
- Git files (.gitignore, .gitattributes)
- Required directories (app/, components/, lib/, etc.)

**Should NOT contain:**
- Legacy config files from removed tools
- Random scripts or test files
- Backup folders
- Anything that doesn't serve active development

**Audit regularly:**
```powershell
Get-ChildItem C:\GitHub\LXP360-SaaS -File | Select-Object Name
```

---

## 7. Database & Security Standards

### 7.1 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Organization members can access org data
    match /organizations/{orgId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid));
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid)).data.role == 'admin';
    }
    
    // xAPI statements - authenticated users only
    match /xapi_statements/{statementId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 7.2 Multi-Tenant Data Architecture

```typescript
// All tenant-scoped data uses organization subcollections
const courseRef = doc(db, 'organizations', orgId, 'courses', courseId);

// Or includes organizationId field for querying
const q = query(
  collection(db, 'xapi_statements'),
  where('organizationId', '==', orgId),
  where('actorId', '==', userId)
);
```

### 7.3 Admin SDK Rules (Server-Side Only)

```typescript
// ⚠️ Admin SDK bypasses security rules - use only in:
// - API routes
// - Server actions
// - Background jobs

// ❌ NEVER in client components
import { adminDb } from '@/lib/firebase/admin';  // Server only!
```

---

## 8. API & Integration Patterns

### 8.1 Standardized API Response

```typescript
// types/api.ts
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    timestamp: string;
  };
}

// Helper
export function apiResponse<T>(data: T): Response {
  return Response.json({
    success: true,
    data,
    meta: { timestamp: new Date().toISOString() }
  });
}

export function apiError(code: string, message: string, status: number): Response {
  return Response.json({
    success: false,
    error: { code, message },
    meta: { timestamp: new Date().toISOString() }
  }, { status });
}
```

### 8.2 xAPI Statement Pattern

```typescript
interface XAPIStatement {
  actor: { objectType: 'Agent'; mbox: string; name: string };
  verb: { id: string; display: { 'en-US': string } };
  object: {
    objectType: 'Activity';
    id: string;
    definition: { name: { 'en-US': string }; type: string };
  };
  timestamp: string;
}

// Store in Firestore, batch to BigQuery
await addDoc(collection(db, 'xapi_statements'), {
  ...statement,
  organizationId,
  createdAt: serverTimestamp(),
});
```

---

## 9. Framework-Specific Patterns

### 9.1 React 19 Changes

```typescript
// forwardRef deprecated - ref is just a prop now
// ❌ OLD
const Input = React.forwardRef<HTMLInputElement, Props>((props, ref) => ...);

// ✅ NEW
const Input = ({ ref, ...props }: Props & { ref?: React.Ref<HTMLInputElement> }) => ...;

// useFormState renamed to useActionState
// ❌ OLD
import { useFormState } from "react-dom";

// ✅ NEW
import { useActionState } from "react";
```

### 9.2 Tailwind CSS v4 Changes

| Old (v3) | New (v4) |
|----------|----------|
| `bg-gradient-to-r` | `bg-linear-to-r` |
| `shadow-sm` | `shadow-xs` |
| `shadow` | `shadow-sm` |
| `blur-sm` | `blur-xs` |
| `rounded-sm` | `rounded-xs` |
| `outline-none` | `outline-hidden` |
| `ring` | `ring-3` |
| `bg-opacity-50` | `bg-black/50` |

### 9.3 Brand Colors

```css
:root {
  --color-primary: #0072f5;
  --color-neural-cyan: #00d4ff;
  --color-neural-purple: #8b5cf6;
  --color-success: #00C853;
  --color-warning: #FF9800;
  --color-error: #F44336;
  --color-background: #000000;
}
```

---

## 10. Testing & Quality Assurance

### 10.1 Testing Strategy

| Type | Tool | Target |
|------|------|--------|
| Unit | Vitest | 80% business logic |
| E2E | Playwright | Auth, payments, learning |
| Accessibility | axe-core | Zero violations |

### 10.2 Critical Test Paths

- Authentication flow (signup, login, logout, password reset)
- Stripe payment flow (subscription, webhook handling)
- Course enrollment and completion
- xAPI statement generation

---

## 11. Accessibility & Compliance

### 11.1 WCAG 2.2 AA Requirements

| Requirement | Implementation |
|-------------|----------------|
| Color Contrast | Minimum 4.5:1 text, 3:1 large |
| Keyboard Navigation | All interactive elements focusable |
| Screen Reader | Semantic HTML, ARIA labels |
| Focus Indicators | Visible focus rings |
| Motion | `prefers-reduced-motion` support |

### 11.2 Accessibility is NOT Optional

**Our target markets require accessibility:**
- Healthcare: Section 508, HIPAA
- Government: Section 508, FedRAMP
- Defense: ITAR, Section 508
- Enterprise: ADA compliance

**Every button needs `type="button"` or `type="submit"`.**
**Every SVG needs `role="img"` and `aria-label` or `<title>`.**
**Every image needs meaningful `alt` text.**

These are not "improvements for later" — they are requirements.

### 11.3 Compliance Targets

- **FedRAMP Ready** - Built on GCP FedRAMP High services
- **SOC 2 Type II** - Planned certification pathway
- **WCAG 2.2 AA** - Accessibility-first design
- **HIPAA** - Healthcare data handling ready
- **GDPR** - EU data privacy compliant

---

## 12. Multi-Claude Coordination

### 12.1 Instance Assignments

| Instance | Role | Tasks |
|----------|------|-------|
| **Desktop** | Heavy backend | Git, gcloud CLI, deploys |
| **VS Code** | Deep analysis | Audits, fixes, refactors |
| **Browser** | Max resources | Docs, schemas, generation |

### 12.2 VS Code Instance Prompt Prefix

**MANDATORY for every VS Code task:**

```
BEFORE STARTING: Read C:\GitHub\LXP360-SaaS\CLAUDE.md thoroughly.
Follow strictly. Ask if conflicted.
```

### 12.3 Orchestrator Responsibilities

When deploying tasks to other Claude instances:

1. **Include Standards in Every Prompt**
   - Reference CLAUDE.md v11 explicitly
   - Include specific rules relevant to the task
   - State expected output format

2. **Verify Adherence**
   - Review work from deployed agents before accepting
   - Check for standards violations
   - Send corrections immediately if violations found

3. **Prompt Template for Deployed Agents**
   ```
   TASK: [Description]
   
   STANDARDS (from CLAUDE.md v11):
   - No commented-out code
   - No TODO without Linear ticket (LXD-XXX)
   - No `any` types
   - No imports from removed services (Supabase, Sanity, etc.)
   - No `--no-verify` commits
   - All buttons need type="button" or type="submit"
   - All SVGs need aria-label and title
   - Build must pass
   
   EXPECTED OUTPUT:
   - [Specific deliverables]
   - Report: files created/modified, build status
   ```

4. **Correction Protocol**
   - If agent violates standards, STOP immediately
   - Send specific correction with correct example
   - Have them fix ALL violations before continuing

### 12.4 Branch Naming

```
claude/[feature-area]-[brief-description]-[random-id]
```

Examples:
- `claude/auth-firebase-setup-a7x3`
- `claude/firestore-security-rules-k9m2`

---

## 13. Git Workflow & Version Control

### 13.1 Branch Strategy

```
main (production)
  └── develop (staging)
        └── feature/* (new features)
        └── fix/* (bug fixes)
        └── claude/* (AI-assisted work)
```

### 13.2 Safety Backups

**BEFORE major operations:**
```bash
git stash
git checkout -b backup/before-[operation]-$(date +%Y%m%d)
git checkout -b claude/[feature]-[random]
```

### 13.3 Commit Message Format

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
```

### 13.4 Pre-Commit Hook Bypass (NEVER)

**See Section 1.8 — NEVER use `--no-verify`.**

If you think you need to bypass hooks, you're wrong. Fix the issues instead.

---

## 14. Performance Standards

### 14.1 Core Web Vitals Targets

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |

### 14.2 Cloud Run Gotchas

| Issue | Cause | Fix |
|-------|-------|-----|
| Container won't start | Missing `output: 'standalone'` | Add to next.config.mjs |
| Port binding fails | Wrong port | Use `--port 3000` |
| Cold starts slow | Large bundle | Enable min-instances=1 |
| Image optimization fails | Not supported | Set `images.unoptimized: true` |

---

## 15. Session Protocols

### 15.1 Session Summary Template

```markdown
## Session Summary

### Completed
- [x] Task 1
- [x] Task 2

### Files Created
- `path/to/file.tsx` - Description

### Files Modified  
- `path/to/file.tsx` - What changed

### Validation Status
- Lint: ✅ PASS / ❌ FAIL
- TypeCheck: ✅ PASS / ❌ FAIL
- Build: ✅ PASS / ❌ FAIL

### Next Steps
1. Recommended next task
```

### 15.2 Handoff Requirements

Every session must end with:
1. **Committed work** - Branch name, commit hashes
2. **Completion status** - What's done vs. in-progress
3. **Validation results** - lint, typecheck, build
4. **Next priorities** - Clear handoff for next session
5. **Blockers** - Any decisions needed

---

## Appendix: Decision Log

| Date | Decision | Rationale | ADR |
|------|----------|-----------|-----|
| 2026-01 | GCP Full Stack | FedRAMP compliance | ADR-001 |
| 2026-01 | Firebase Auth | Enterprise SSO | ADR-002 |
| 2026-01 | Firestore | Scalable NoSQL | ADR-003 |
| 2026-01 | Next.js 15 | App Router + RSC | ADR-004 |
| 2026-01 | TypeScript strict | Enterprise safety | ADR-005 |
| 2026-01 | Cloud Run | FedRAMP containers | ADR-006 |
| 2026-01 | Remove Supabase | GCP consolidation | — |
| 2026-01 | Remove Sanity | Firestore CMS | — |
| 2026-01 | Remove Vercel | Cloud Run deploy | — |
| 2026-01 | "Nice not Twice" | Zero tolerance for shortcuts | — |
| 2026-01 | Never --no-verify | Hooks are the airlock | — |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 11.0 | 2026-01-09 | Claude + Phill | "Nice not Twice" philosophy, --no-verify prohibition, archive policy, npm only, Biome linter, a11y requirements |
| 10.0 | 2026-01-09 | Claude + Phill | Investor/compliance-ready + GCP migration complete |
| 8.0 | 2026-01-09 | Claude + Phill | GCP migration, removed Supabase |
| 5.0 | 2025-12 | Claude + Phill | Post-Agent-Disaster rules |
| 1.0 | 2025 | Phill | Initial standards |

---

**END OF DOCUMENT**

*This document is the single source of truth for all development on LXP360-SaaS. Violations require full rework. No exceptions.*
