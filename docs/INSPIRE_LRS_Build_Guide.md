# INSPIRE Learning Record Store (LRS) — Complete Build Guide

## Comprehensive Architecture, Implementation & Claude VS Code Prompts

**Version:** 1.0  
**Date:** January 20, 2026  
**Classification:** Internal Engineering  
**Scope:** Learning Record Store (LRS) — Data Foundation Layer

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Data Flow Architecture](#3-data-flow-architecture)
4. [xAPI Schema Specifications](#4-xapi-schema-specifications)
5. [Package Structure](#5-package-structure)
6. [GCP Infrastructure Requirements](#6-gcp-infrastructure-requirements)
7. [Firestore Schema Design](#7-firestore-schema-design)
8. [BigQuery Schema Design](#8-bigquery-schema-design)
9. [API Route Specifications](#9-api-route-specifications)
10. [Claude VS Code Prompts — Phase 1: Foundation](#10-claude-vs-code-prompts--phase-1-foundation)
11. [Claude VS Code Prompts — Phase 2: xAPI Client Package](#11-claude-vs-code-prompts--phase-2-xapi-client-package)
12. [Claude VS Code Prompts — Phase 3: API Routes](#12-claude-vs-code-prompts--phase-3-api-routes)
13. [Claude VS Code Prompts — Phase 4: Pub/Sub Pipeline](#13-claude-vs-code-prompts--phase-4-pubsub-pipeline)
14. [Claude VS Code Prompts — Phase 5: Real-Time Adaptation Layer](#14-claude-vs-code-prompts--phase-5-real-time-adaptation-layer)
15. [Claude VS Code Prompts — Phase 6: Integration Testing](#15-claude-vs-code-prompts--phase-6-integration-testing)
16. [Deployment & Verification](#16-deployment--verification)
17. [Critical Constraints & Non-Negotiables](#17-critical-constraints--non-negotiables)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Purpose

The INSPIRE Learning Record Store (LRS) is the foundational data layer for the entire INSPIRE Platform ecosystem. It serves as the single source of truth for all learning interactions, enabling:

- **Real-time adaptive learning** via Firestore + Vertex AI
- **Comprehensive analytics** via BigQuery data warehouse
- **Compliance audit trails** for EU AI Act, HIPAA, FedRAMP
- **Cross-platform data aggregation** from Studio (authoring) and Ignite (LMS)

### 1.2 Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Package Manager | npm workspaces + TurboRepo | Consistency with existing tooling, monorepo benefits |
| Repository Structure | Unified app + internal packages | Simpler deployment, shared auth/theming |
| Database | Firestore + BigQuery (no Prisma) | Native GCP integration, NoSQL flexibility |
| xAPI Ingestion | Dual-path (Firestore real-time + Pub/Sub analytics) | Sub-second adaptation + scalable analytics |
| ML Algorithms | Client + Server (source of truth) | Instant feedback + tamper resistance |
| Explanations | Gemini 2.0 Flash, pre-computed | Low latency, cost efficiency |

### 1.3 Success Criteria

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LRS SUCCESS METRICS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  ✅ Zero TypeScript errors (strict mode enabled)                            │
│  ✅ xAPI statements validated via Zod schemas                               │
│  ✅ Dual-path ingestion: Firestore (<100ms) + BigQuery (via Pub/Sub)       │
│  ✅ Server-side actor enrichment (client never trusted)                     │
│  ✅ Multi-tenant isolation at data layer                                    │
│  ✅ 7-year retention compliance for xAPI statements                         │
│  ✅ All AI decisions logged with Glass Box explanations                     │
│  ✅ Offline statement batching with sync recovery                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ARCHITECTURE OVERVIEW

### 2.1 System Context Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        INSPIRE PLATFORM CONTEXT                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │  INSPIRE Studio │    │  INSPIRE Ignite │    │  Mobile Apps    │         │
│  │  (Authoring)    │    │     (LMS)       │    │  (Future)       │         │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘         │
│           │                      │                      │                   │
│           └──────────────────────┼──────────────────────┘                   │
│                                  │                                          │
│                                  ▼                                          │
│           ┌─────────────────────────────────────────────┐                  │
│           │                                             │                  │
│           │           INSPIRE LRS                       │                  │
│           │     (Learning Record Store)                 │                  │
│           │                                             │                  │
│           │  ┌─────────────┐    ┌─────────────────┐    │                  │
│           │  │  Firestore  │    │    BigQuery     │    │                  │
│           │  │ (Real-time) │    │   (Analytics)   │    │                  │
│           │  └─────────────┘    └─────────────────┘    │                  │
│           │         │                   │              │                  │
│           │         ▼                   ▼              │                  │
│           │  ┌─────────────────────────────────────┐   │                  │
│           │  │         Vertex AI / Gemini          │   │                  │
│           │  │  (Adaptive Learning + Explanations) │   │                  │
│           │  └─────────────────────────────────────┘   │                  │
│           │                                             │                  │
│           └─────────────────────────────────────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Responsibilities

| Component | Responsibility | Technology |
|-----------|---------------|------------|
| **xapi-client** | Statement building, validation, recipes | TypeScript + Zod |
| **API Route** | Ingestion proxy, actor enrichment, routing | Next.js Route Handler |
| **Firestore** | Real-time learner state, recommendations | Firebase Firestore |
| **Pub/Sub** | Event streaming, decoupled analytics | GCP Pub/Sub |
| **Dataflow** | Transform, enrich, deduplicate | GCP Dataflow |
| **BigQuery** | Analytics warehouse, compliance storage | GCP BigQuery |
| **Vertex AI** | Prediction endpoints, model serving | GCP Vertex AI |
| **Cloud Functions** | Event triggers, state updates | Firebase Functions |

---

## 3. DATA FLOW ARCHITECTURE

### 3.1 Dual-Path Data Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DUAL-PATH DATA ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PATH 1: REAL-TIME ADAPTATION (< 500ms end-to-end)                         │
│  ══════════════════════════════════════════════════                        │
│                                                                             │
│  Client Interaction                                                         │
│       │                                                                     │
│       ▼                                                                     │
│  Next.js API Route (/api/xapi/statements)                                  │
│       │                                                                     │
│       ├──► Validate via Zod schema                                         │
│       │                                                                     │
│       ├──► Enrich with server-side actor                                   │
│       │                                                                     │
│       ├──► Write to Firestore                                              │
│       │    /tenants/{tid}/learners/{uid}/interactions/{iid}                │
│       │         │                                                           │
│       │         ▼                                                           │
│       │    Cloud Function (Firestore onCreate trigger)                     │
│       │         │                                                           │
│       │         ├──► Update mastery state (BKT calculation)                │
│       │         │                                                           │
│       │         ├──► Call Vertex AI prediction endpoint                    │
│       │         │                                                           │
│       │         └──► Write recommendation to Firestore                     │
│       │              /tenants/{tid}/learners/{uid}/activeRecommendation    │
│       │                   │                                                 │
│       │                   ▼                                                 │
│       │              Client receives via onSnapshot                        │
│       │                   │                                                 │
│       │                   ▼                                                 │
│       │              Modality Swapper / JITAI Intervention                 │
│       │                                                                     │
│       │                                                                     │
│  PATH 2: ANALYTICS PIPELINE (minutes latency acceptable)                   │
│  ═══════════════════════════════════════════════════════                   │
│       │                                                                     │
│       └──► Publish to Pub/Sub (xapi-statements topic)                      │
│                 │                                                           │
│                 ▼                                                           │
│            Dataflow Job                                                    │
│                 │                                                           │
│                 ├──► Transform to BigQuery schema                          │
│                 ├──► Deduplicate by statement ID                           │
│                 ├──► Enrich with tenant/course metadata                    │
│                 └──► Validate against xAPI 1.0.3 spec                      │
│                      │                                                      │
│                      ▼                                                      │
│            BigQuery (xapi_statements table)                                │
│                 │                                                           │
│                 ├──► Partitioned by DATE(timestamp)                        │
│                 ├──► Clustered by tenant_id, actor_id                      │
│                 └──► 7-year retention policy                               │
│                      │                                                      │
│                      ▼                                                      │
│            Analytics Dashboards / ML Training / Compliance Reports         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Latency Targets

| Path | Component | Target Latency |
|------|-----------|----------------|
| Real-time | API Route → Firestore | < 50ms |
| Real-time | Firestore → Cloud Function | < 10ms (warm) |
| Real-time | Cloud Function → Vertex AI | < 200ms |
| Real-time | Vertex AI → Firestore write | < 50ms |
| Real-time | Firestore → Client sync | < 50ms |
| Real-time | **Total end-to-end** | **< 500ms** |
| Analytics | API → Pub/Sub | < 100ms |
| Analytics | Pub/Sub → BigQuery | 1-5 minutes |

---

## 4. xAPI SCHEMA SPECIFICATIONS

### 4.1 Core xAPI Statement Schema

```typescript
// packages/xapi-client/src/schemas/statement.ts

import { z } from 'zod';

// Actor Schema (Account-based identification for multi-tenant)
export const ActorSchema = z.object({
  objectType: z.literal('Agent').default('Agent'),
  account: z.object({
    homePage: z.string().url(),  // https://lxd360.com
    name: z.string(),            // User ID within tenant
  }),
  name: z.string().optional(),   // Display name (for convenience)
});

// Verb Schema
export const VerbSchema = z.object({
  id: z.string().url(),
  display: z.record(z.string(), z.string()),  // { "en-US": "answered" }
});

// Activity Definition Schema
export const ActivityDefinitionSchema = z.object({
  type: z.string().url().optional(),
  name: z.record(z.string(), z.string()).optional(),
  description: z.record(z.string(), z.string()).optional(),
  moreInfo: z.string().url().optional(),
  interactionType: z.enum([
    'true-false',
    'choice',
    'fill-in',
    'long-fill-in',
    'matching',
    'performance',
    'sequencing',
    'likert',
    'numeric',
    'other',
  ]).optional(),
  correctResponsesPattern: z.array(z.string()).optional(),
  choices: z.array(z.object({
    id: z.string(),
    description: z.record(z.string(), z.string()),
  })).optional(),
  extensions: z.record(z.string(), z.unknown()).optional(),
});

// Object Schema (Activity)
export const ObjectSchema = z.object({
  objectType: z.literal('Activity').default('Activity'),
  id: z.string().url(),
  definition: ActivityDefinitionSchema.optional(),
});

// Result Schema
export const ResultSchema = z.object({
  score: z.object({
    scaled: z.number().min(-1).max(1).optional(),
    raw: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  success: z.boolean().optional(),
  completion: z.boolean().optional(),
  response: z.string().optional(),
  duration: z.string().optional(),  // ISO 8601 duration
  extensions: z.record(z.string(), z.unknown()).optional(),
});

// Context Schema
export const ContextSchema = z.object({
  registration: z.string().uuid().optional(),
  instructor: ActorSchema.optional(),
  team: z.object({
    objectType: z.literal('Group'),
    name: z.string().optional(),
    member: z.array(ActorSchema).optional(),
  }).optional(),
  contextActivities: z.object({
    parent: z.array(ObjectSchema).optional(),
    grouping: z.array(ObjectSchema).optional(),
    category: z.array(ObjectSchema).optional(),
    other: z.array(ObjectSchema).optional(),
  }).optional(),
  revision: z.string().optional(),
  platform: z.string().optional(),
  language: z.string().optional(),
  statement: z.object({
    objectType: z.literal('StatementRef'),
    id: z.string().uuid(),
  }).optional(),
  extensions: z.record(z.string(), z.unknown()).optional(),
});

// Full Statement Schema
export const XAPIStatementSchema = z.object({
  id: z.string().uuid().optional(),  // Generated server-side if not provided
  actor: ActorSchema,
  verb: VerbSchema,
  object: ObjectSchema,
  result: ResultSchema.optional(),
  context: ContextSchema.optional(),
  timestamp: z.string().datetime().optional(),  // Generated server-side if not provided
  stored: z.string().datetime().optional(),     // Always server-side
  authority: ActorSchema.optional(),            // Always server-side
  version: z.literal('1.0.3').default('1.0.3'),
  attachments: z.array(z.object({
    usageType: z.string().url(),
    display: z.record(z.string(), z.string()),
    description: z.record(z.string(), z.string()).optional(),
    contentType: z.string(),
    length: z.number().int(),
    sha2: z.string(),
    fileUrl: z.string().url().optional(),
  })).optional(),
});

export type XAPIStatement = z.infer<typeof XAPIStatementSchema>;
export type Actor = z.infer<typeof ActorSchema>;
export type Verb = z.infer<typeof VerbSchema>;
export type Activity = z.infer<typeof ObjectSchema>;
export type Result = z.infer<typeof ResultSchema>;
export type Context = z.infer<typeof ContextSchema>;
```

### 4.2 INSPIRE Custom Extensions

```typescript
// packages/xapi-client/src/schemas/extensions.ts

import { z } from 'zod';

// INSPIRE Extension URIs
export const INSPIRE_EXTENSIONS = {
  // Cognitive Metrics
  LATENCY: 'https://lxd360.com/xapi/extensions/latency',
  COGNITIVE_LOAD: 'https://lxd360.com/xapi/extensions/cognitive-load',
  HESITATION_COUNT: 'https://lxd360.com/xapi/extensions/hesitation-count',
  
  // Interaction Depth
  INTERACTION_DEPTH: 'https://lxd360.com/xapi/extensions/interaction-depth',
  NAVIGATION_PATH: 'https://lxd360.com/xapi/extensions/navigation-path',
  
  // Modality Tracking
  MODALITY_STATE: 'https://lxd360.com/xapi/extensions/modality-state',
  MODALITY_PREFERENCE: 'https://lxd360.com/xapi/extensions/modality-preference',
  
  // Accessibility
  A11Y_MODE: 'https://lxd360.com/xapi/extensions/accessibility-mode',
  
  // Adaptive Learning
  BKT_PRIOR: 'https://lxd360.com/xapi/extensions/bkt-prior',
  BKT_POSTERIOR: 'https://lxd360.com/xapi/extensions/bkt-posterior',
  SKILL_ID: 'https://lxd360.com/xapi/extensions/skill-id',
  
  // Content Block Metadata
  BLOCK_TYPE: 'https://lxd360.com/xapi/extensions/block-type',
  BLOCK_VERSION: 'https://lxd360.com/xapi/extensions/block-version',
  
  // Session Tracking
  SESSION_ID: 'https://lxd360.com/xapi/extensions/session-id',
  DEVICE_TYPE: 'https://lxd360.com/xapi/extensions/device-type',
} as const;

// Extension Value Schemas
export const LatencyExtensionSchema = z.number().int().min(0);  // milliseconds

export const CognitiveLoadExtensionSchema = z.object({
  intrinsic: z.number().min(0).max(10),
  extraneous: z.number().min(0).max(10),
  germane: z.number().min(0).max(10),
  total: z.number().min(0).max(10),
});

export const ModalityStateExtensionSchema = z.enum([
  'text',
  'video',
  'audio',
  'interactive',
  'simulation',
  'vr',
]);

export const AccessibilityModeExtensionSchema = z.object({
  dyslexiaFriendly: z.boolean().default(false),
  seizureSafe: z.boolean().default(false),
  highContrast: z.boolean().default(false),
  reducedMotion: z.boolean().default(false),
  screenReader: z.boolean().default(false),
});

export const BKTExtensionSchema = z.object({
  skillId: z.string(),
  pMastery: z.number().min(0).max(1),
  pLearn: z.number().min(0).max(1),
  pGuess: z.number().min(0).max(1),
  pSlip: z.number().min(0).max(1),
});
```

### 4.3 Standard Verbs Registry

```typescript
// packages/xapi-client/src/verbs.ts

export const XAPI_VERBS = {
  // ADL Standard Verbs
  ANSWERED: {
    id: 'http://adlnet.gov/expapi/verbs/answered',
    display: { 'en-US': 'answered' },
  },
  ATTEMPTED: {
    id: 'http://adlnet.gov/expapi/verbs/attempted',
    display: { 'en-US': 'attempted' },
  },
  COMPLETED: {
    id: 'http://adlnet.gov/expapi/verbs/completed',
    display: { 'en-US': 'completed' },
  },
  EXPERIENCED: {
    id: 'http://adlnet.gov/expapi/verbs/experienced',
    display: { 'en-US': 'experienced' },
  },
  FAILED: {
    id: 'http://adlnet.gov/expapi/verbs/failed',
    display: { 'en-US': 'failed' },
  },
  INITIALIZED: {
    id: 'http://adlnet.gov/expapi/verbs/initialized',
    display: { 'en-US': 'initialized' },
  },
  INTERACTED: {
    id: 'http://adlnet.gov/expapi/verbs/interacted',
    display: { 'en-US': 'interacted' },
  },
  LAUNCHED: {
    id: 'http://adlnet.gov/expapi/verbs/launched',
    display: { 'en-US': 'launched' },
  },
  MASTERED: {
    id: 'http://adlnet.gov/expapi/verbs/mastered',
    display: { 'en-US': 'mastered' },
  },
  PASSED: {
    id: 'http://adlnet.gov/expapi/verbs/passed',
    display: { 'en-US': 'passed' },
  },
  PROGRESSED: {
    id: 'http://adlnet.gov/expapi/verbs/progressed',
    display: { 'en-US': 'progressed' },
  },
  REGISTERED: {
    id: 'http://adlnet.gov/expapi/verbs/registered',
    display: { 'en-US': 'registered' },
  },
  TERMINATED: {
    id: 'http://adlnet.gov/expapi/verbs/terminated',
    display: { 'en-US': 'terminated' },
  },
  
  // INSPIRE Custom Verbs
  HESITATED: {
    id: 'https://lxd360.com/xapi/verbs/hesitated',
    display: { 'en-US': 'hesitated' },
  },
  SKIPPED: {
    id: 'https://lxd360.com/xapi/verbs/skipped',
    display: { 'en-US': 'skipped' },
  },
  REWOUND: {
    id: 'https://lxd360.com/xapi/verbs/rewound',
    display: { 'en-US': 'rewound' },
  },
  PAUSED: {
    id: 'https://lxd360.com/xapi/verbs/paused',
    display: { 'en-US': 'paused' },
  },
  RESUMED: {
    id: 'https://lxd360.com/xapi/verbs/resumed',
    display: { 'en-US': 'resumed' },
  },
  REQUESTED_HELP: {
    id: 'https://lxd360.com/xapi/verbs/requested-help',
    display: { 'en-US': 'requested help' },
  },
  OVERRODE_RECOMMENDATION: {
    id: 'https://lxd360.com/xapi/verbs/overrode-recommendation',
    display: { 'en-US': 'overrode recommendation' },
  },
} as const;
```

---

## 5. PACKAGE STRUCTURE

### 5.1 Monorepo Layout

```
root/
├── apps/
│   └── web/                              # Single Next.js 15 app
│       ├── app/
│       │   ├── (auth)/
│       │   ├── (public)/
│       │   ├── (tenant)/
│       │   │   ├── inspire-studio/       # Authoring (Phase 3)
│       │   │   └── ignite/               # LMS (Phase 2)
│       │   └── api/
│       │       └── xapi/
│       │           └── statements/
│       │               └── route.ts      # Main ingestion endpoint
│       ├── lib/
│       │   ├── firebase/
│       │   │   ├── client.ts             # Browser SDK
│       │   │   └── admin.ts              # Admin SDK (server)
│       │   └── bigquery/
│       │       └── client.ts             # BigQuery client
│       └── package.json
│
├── packages/
│   ├── xapi-client/                      # ★ LRS PHASE 2
│   │   ├── src/
│   │   │   ├── index.ts                  # Public exports
│   │   │   ├── builder.ts                # Statement builder
│   │   │   ├── validator.ts              # Schema validation
│   │   │   ├── verbs.ts                  # Verb registry
│   │   │   ├── recipes/                  # Pre-built statement templates
│   │   │   │   ├── quiz.ts
│   │   │   │   ├── video.ts
│   │   │   │   ├── navigation.ts
│   │   │   │   └── hesitation.ts
│   │   │   └── schemas/
│   │   │       ├── statement.ts          # Core xAPI schema
│   │   │       └── extensions.ts         # INSPIRE extensions
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ml/                               # ★ LRS PHASE 5
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── bkt.ts                    # Bayesian Knowledge Tracing
│   │   │   ├── sm2.ts                    # Spaced Repetition
│   │   │   ├── cognitive-load.ts         # ICL Calculator
│   │   │   └── types.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── types/                            # ★ LRS PHASE 1
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── firestore/
│   │   │   │   ├── learner.ts
│   │   │   │   ├── tenant.ts
│   │   │   │   ├── interaction.ts
│   │   │   │   └── recommendation.ts
│   │   │   └── bigquery/
│   │   │       └── xapi-statement.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── ui/                               # Existing shadcn components
│       └── ...
│
├── functions/                            # ★ LRS PHASE 5
│   ├── src/
│   │   ├── index.ts
│   │   ├── onInteractionCreated.ts       # Firestore trigger
│   │   ├── updateMasteryState.ts
│   │   └── generateRecommendation.ts
│   ├── package.json
│   └── tsconfig.json
│
├── infrastructure/                       # ★ LRS PHASE 4
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── pubsub.tf
│   │   ├── bigquery.tf
│   │   └── variables.tf
│   └── dataflow/
│       └── xapi-transform/
│           ├── main.py
│           └── requirements.txt
│
├── turbo.json
├── package.json
└── pnpm-workspace.yaml                   # npm workspaces config
```

### 5.2 Package Dependencies

```json
// package.json (root)
{
  "name": "inspire-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*",
    "functions"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.9.0"
  }
}

// packages/xapi-client/package.json
{
  "name": "@inspire/xapi-client",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "uuid": "^9.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/uuid": "^9.0.0",
    "typescript": "^5.9.0",
    "vitest": "^2.0.0"
  }
}

// packages/types/package.json
{
  "name": "@inspire/types",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.9.0"
  }
}
```

---

## 6. GCP INFRASTRUCTURE REQUIREMENTS

### 6.1 Required GCP Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **Firestore** | Real-time learner state | Native mode, multi-region |
| **Pub/Sub** | Event streaming | xapi-statements topic |
| **BigQuery** | Analytics warehouse | US multi-region dataset |
| **Dataflow** | Stream processing | Streaming job |
| **Cloud Functions** | Event triggers | Gen 2, min instances |
| **Vertex AI** | ML predictions | Online endpoints |
| **Secret Manager** | Credentials | Service account keys |

### 6.2 Pub/Sub Configuration

```hcl
# infrastructure/terraform/pubsub.tf

resource "google_pubsub_topic" "xapi_statements" {
  name = "xapi-statements"
  
  message_retention_duration = "604800s"  # 7 days
  
  labels = {
    environment = var.environment
    component   = "lrs"
  }
}

resource "google_pubsub_subscription" "xapi_to_bigquery" {
  name  = "xapi-statements-bigquery-sub"
  topic = google_pubsub_topic.xapi_statements.name
  
  ack_deadline_seconds = 60
  
  bigquery_config {
    table            = "${google_bigquery_table.xapi_statements.project}.${google_bigquery_table.xapi_statements.dataset_id}.${google_bigquery_table.xapi_statements.table_id}"
    use_topic_schema = false
    write_metadata   = true
  }
  
  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.xapi_dlq.id
    max_delivery_attempts = 5
  }
}

resource "google_pubsub_topic" "xapi_dlq" {
  name = "xapi-statements-dlq"
}
```

### 6.3 Service Account Permissions

```hcl
# infrastructure/terraform/iam.tf

resource "google_service_account" "lrs_api" {
  account_id   = "lrs-api-sa"
  display_name = "LRS API Service Account"
}

resource "google_project_iam_member" "lrs_firestore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.lrs_api.email}"
}

resource "google_project_iam_member" "lrs_pubsub" {
  project = var.project_id
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.lrs_api.email}"
}

resource "google_project_iam_member" "lrs_bigquery" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:${google_service_account.lrs_api.email}"
}
```

---

## 7. FIRESTORE SCHEMA DESIGN

### 7.1 Collection Structure

```
/tenants/{tenantId}/
├── /learners/{userId}/
│   ├── profile                           # LearnerProfile document
│   ├── /masteryStates/{skillId}/         # BKT state per skill
│   ├── /interactions/{interactionId}/    # Recent interactions (rolling window)
│   ├── /recommendations/{recId}/         # Recommendation history
│   └── activeRecommendation              # Current active recommendation
│
├── /courses/{courseId}/
│   ├── metadata                          # Course metadata
│   └── /blocks/{blockId}/                # Content blocks
│
└── /analytics/
    └── aggregates                        # Pre-computed analytics
```

### 7.2 Firestore Document Schemas

```typescript
// packages/types/src/firestore/learner.ts

import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

export const LearnerProfileSchema = z.object({
  uid: z.string(),
  tenantId: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  role: z.enum(['learner', 'mentee', 'mentor', 'instructor']),
  
  // Preferences
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    language: z.string().default('en-US'),
    accessibility: z.object({
      dyslexiaFriendly: z.boolean().default(false),
      seizureSafe: z.boolean().default(false),
      highContrast: z.boolean().default(false),
      reducedMotion: z.boolean().default(false),
    }),
    modalityPreference: z.enum(['text', 'video', 'audio', 'interactive']).optional(),
  }),
  
  // Metadata
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
  lastActiveAt: z.instanceof(Timestamp),
});

export const MasteryStateSchema = z.object({
  skillId: z.string(),
  skillName: z.string(),
  
  // BKT Parameters
  pMastery: z.number().min(0).max(1),
  pLearn: z.number().min(0).max(1).default(0.1),
  pGuess: z.number().min(0).max(1).default(0.2),
  pSlip: z.number().min(0).max(1).default(0.1),
  
  // Tracking
  opportunities: z.number().int().min(0),
  correctCount: z.number().int().min(0),
  incorrectCount: z.number().int().min(0),
  
  // SM-2 Spaced Repetition
  easinessFactor: z.number().min(1.3).default(2.5),
  interval: z.number().int().min(0).default(0),  // days
  repetitions: z.number().int().min(0).default(0),
  nextReviewDate: z.instanceof(Timestamp).optional(),
  
  // Metadata
  lastUpdated: z.instanceof(Timestamp),
  lastInteractionId: z.string().optional(),
});

export const InteractionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string(),
  learnerId: z.string(),
  
  // Activity
  activityId: z.string(),
  activityType: z.string(),
  blockId: z.string().optional(),
  blockType: z.string().optional(),
  
  // Result
  verb: z.string(),
  success: z.boolean().optional(),
  completion: z.boolean().optional(),
  scoreScaled: z.number().min(-1).max(1).optional(),
  response: z.string().optional(),
  
  // INSPIRE Extensions
  latencyMs: z.number().int().min(0).optional(),
  cognitiveLoad: z.object({
    intrinsic: z.number(),
    extraneous: z.number(),
    germane: z.number(),
    total: z.number(),
  }).optional(),
  modalityState: z.string().optional(),
  skillId: z.string().optional(),
  
  // Context
  courseId: z.string().optional(),
  lessonId: z.string().optional(),
  sessionId: z.string(),
  
  // Metadata
  timestamp: z.instanceof(Timestamp),
  xapiStatementId: z.string().uuid(),
});

export const ActiveRecommendationSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['modality', 'content', 'intervention', 'review']),
  
  // Recommendation
  targetActivityId: z.string(),
  targetActivityName: z.string(),
  suggestedModality: z.string().optional(),
  confidence: z.number().min(0).max(1),
  
  // Glass Box Explanation
  explanation: z.object({
    shortExplanation: z.string(),
    featureContributions: z.array(z.object({
      factor: z.string(),
      value: z.string(),
      weight: z.number(),
      direction: z.enum(['supports', 'opposes']),
    })),
    modelVersion: z.string(),
    generatedAt: z.instanceof(Timestamp),
  }),
  
  // Learner Override
  overrideOptions: z.object({
    canSkip: z.boolean(),
    canAdjustDifficulty: z.boolean(),
    canChangeModality: z.boolean(),
    alternatives: z.array(z.object({
      activityId: z.string(),
      activityName: z.string(),
      modality: z.string(),
    })),
  }),
  
  // Status
  status: z.enum(['active', 'accepted', 'overridden', 'expired']),
  overriddenAt: z.instanceof(Timestamp).optional(),
  overrideReason: z.string().optional(),
  
  // Metadata
  createdAt: z.instanceof(Timestamp),
  expiresAt: z.instanceof(Timestamp),
});

export type LearnerProfile = z.infer<typeof LearnerProfileSchema>;
export type MasteryState = z.infer<typeof MasteryStateSchema>;
export type Interaction = z.infer<typeof InteractionSchema>;
export type ActiveRecommendation = z.infer<typeof ActiveRecommendationSchema>;
```

### 7.3 Firestore Security Rules

```javascript
// firestore.rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isTenantMember(tenantId) {
      return isAuthenticated() && 
             request.auth.token.tenantId == tenantId;
    }
    
    function isLearnerOwner(tenantId, userId) {
      return isTenantMember(tenantId) && 
             request.auth.uid == userId;
    }
    
    function hasRole(tenantId, roles) {
      return isTenantMember(tenantId) && 
             request.auth.token.role in roles;
    }
    
    // Tenant-scoped data
    match /tenants/{tenantId} {
      allow read: if isTenantMember(tenantId);
      allow write: if hasRole(tenantId, ['org_admin', 'super_admin']);
      
      // Learner profiles and data
      match /learners/{userId} {
        allow read: if isLearnerOwner(tenantId, userId) || 
                       hasRole(tenantId, ['instructor', 'admin', 'org_admin']);
        allow write: if isLearnerOwner(tenantId, userId);
        
        match /masteryStates/{skillId} {
          allow read: if isLearnerOwner(tenantId, userId) || 
                         hasRole(tenantId, ['instructor', 'admin']);
          // Only server (Cloud Functions) can write mastery states
          allow write: if false;
        }
        
        match /interactions/{interactionId} {
          allow read: if isLearnerOwner(tenantId, userId) || 
                         hasRole(tenantId, ['instructor', 'admin']);
          // Only server (API route) can write interactions
          allow write: if false;
        }
        
        match /recommendations/{recId} {
          allow read: if isLearnerOwner(tenantId, userId);
          // Only server can write
          allow write: if false;
        }
      }
      
      // Courses
      match /courses/{courseId} {
        allow read: if isTenantMember(tenantId);
        allow write: if hasRole(tenantId, ['instructor', 'admin', 'org_admin']);
      }
    }
  }
}
```

---

## 8. BIGQUERY SCHEMA DESIGN

### 8.1 xAPI Statements Table

```sql
-- infrastructure/bigquery/schema.sql

CREATE TABLE IF NOT EXISTS `${project_id}.inspire_lrs.xapi_statements` (
  -- Statement Identity
  id STRING NOT NULL,
  
  -- Actor (denormalized for query performance)
  actor_account_home_page STRING NOT NULL,
  actor_account_name STRING NOT NULL,
  actor_name STRING,
  
  -- Verb
  verb_id STRING NOT NULL,
  verb_display STRING,
  
  -- Object (Activity)
  object_id STRING NOT NULL,
  object_type STRING,
  object_definition_type STRING,
  object_definition_name STRING,
  object_definition_interaction_type STRING,
  
  -- Result
  result_success BOOL,
  result_completion BOOL,
  result_score_scaled FLOAT64,
  result_score_raw FLOAT64,
  result_score_min FLOAT64,
  result_score_max FLOAT64,
  result_response STRING,
  result_duration STRING,
  
  -- Context
  context_registration STRING,
  context_course_id STRING,
  context_lesson_id STRING,
  context_session_id STRING,
  context_platform STRING,
  context_language STRING,
  
  -- INSPIRE Extensions (promoted for query performance)
  ext_latency_ms INT64,
  ext_cognitive_load_total FLOAT64,
  ext_cognitive_load_intrinsic FLOAT64,
  ext_cognitive_load_extraneous FLOAT64,
  ext_cognitive_load_germane FLOAT64,
  ext_modality_state STRING,
  ext_skill_id STRING,
  ext_block_type STRING,
  ext_hesitation_count INT64,
  ext_a11y_mode JSON,
  
  -- Full Statement (for compliance/replay)
  statement_json JSON NOT NULL,
  
  -- Multi-tenant
  tenant_id STRING NOT NULL,
  
  -- Timestamps
  timestamp TIMESTAMP NOT NULL,
  stored TIMESTAMP NOT NULL,
  
  -- Metadata
  api_version STRING DEFAULT '1.0.3',
  ingestion_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  source_system STRING,  -- 'ignite', 'studio', 'mobile'
)
PARTITION BY DATE(timestamp)
CLUSTER BY tenant_id, actor_account_name, verb_id
OPTIONS (
  description = 'INSPIRE LRS xAPI Statements',
  labels = [('component', 'lrs'), ('compliance', 'hipaa')],
  partition_expiration_days = 2557,  -- 7 years
  require_partition_filter = true
);
```

### 8.2 Learner Analytics Materialized View

```sql
-- Daily learner summary (materialized for dashboard performance)
CREATE MATERIALIZED VIEW `${project_id}.inspire_lrs.learner_daily_summary`
PARTITION BY date
CLUSTER BY tenant_id, learner_id
AS
SELECT
  tenant_id,
  actor_account_name AS learner_id,
  DATE(timestamp) AS date,
  
  -- Activity metrics
  COUNT(*) AS total_interactions,
  COUNT(DISTINCT object_id) AS unique_activities,
  COUNT(DISTINCT context_session_id) AS session_count,
  
  -- Performance metrics
  COUNTIF(result_success = true) AS correct_count,
  COUNTIF(result_success = false) AS incorrect_count,
  SAFE_DIVIDE(
    COUNTIF(result_success = true),
    COUNTIF(result_success IS NOT NULL)
  ) AS accuracy_rate,
  AVG(result_score_scaled) AS avg_score,
  
  -- Cognitive metrics
  AVG(ext_latency_ms) AS avg_latency_ms,
  AVG(ext_cognitive_load_total) AS avg_cognitive_load,
  
  -- Time metrics
  MIN(timestamp) AS first_activity,
  MAX(timestamp) AS last_activity,
  
FROM `${project_id}.inspire_lrs.xapi_statements`
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
GROUP BY tenant_id, learner_id, date;
```

---

## 9. API ROUTE SPECIFICATIONS

### 9.1 POST /api/xapi/statements

```typescript
// apps/web/app/api/xapi/statements/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { XAPIStatementSchema } from '@inspire/xapi-client';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { publishToTopic } from '@/lib/pubsub/client';
import { validateSession } from '@/lib/auth/session';

// Request schema (array of statements)
const RequestSchema = z.array(XAPIStatementSchema).min(1).max(100);

export async function POST(request: NextRequest) {
  try {
    // 1. Validate session
    const session = await validateSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 2. Parse and validate request body
    const body = await request.json();
    const statements = RequestSchema.parse(body);
    
    // 3. Enrich statements with server-side data
    const enrichedStatements = statements.map(stmt => ({
      ...stmt,
      id: stmt.id || uuidv4(),
      timestamp: stmt.timestamp || new Date().toISOString(),
      stored: new Date().toISOString(),
      // CRITICAL: Override actor with server-verified identity
      actor: {
        objectType: 'Agent' as const,
        account: {
          homePage: 'https://lxd360.com',
          name: session.user.uid,
        },
        name: session.user.displayName || undefined,
      },
      // Add authority (the system that stored the statement)
      authority: {
        objectType: 'Agent' as const,
        account: {
          homePage: 'https://lxd360.com',
          name: 'lrs-api',
        },
      },
    }));
    
    // 4. Get tenant ID from session
    const tenantId = session.user.tenantId;
    
    // 5. Dual-write: Firestore (real-time) + Pub/Sub (analytics)
    const { firestore } = getFirebaseAdmin();
    
    const writePromises = enrichedStatements.map(async (stmt) => {
      // Extract INSPIRE extensions for Firestore
      const interaction = extractInteraction(stmt, tenantId);
      
      // Write to Firestore (real-time path)
      const interactionRef = firestore
        .collection('tenants')
        .doc(tenantId)
        .collection('learners')
        .doc(session.user.uid)
        .collection('interactions')
        .doc(stmt.id);
      
      await interactionRef.set(interaction);
      
      // Publish to Pub/Sub (analytics path)
      await publishToTopic('xapi-statements', {
        ...stmt,
        tenant_id: tenantId,
      });
    });
    
    await Promise.all(writePromises);
    
    // 6. Return stored statement IDs
    return NextResponse.json({
      stored: enrichedStatements.length,
      ids: enrichedStatements.map(s => s.id),
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid xAPI statement', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('xAPI ingestion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper: Extract Firestore interaction from xAPI statement
function extractInteraction(stmt: any, tenantId: string) {
  const extensions = stmt.context?.extensions || {};
  
  return {
    id: stmt.id,
    tenantId,
    learnerId: stmt.actor.account.name,
    
    // Activity
    activityId: stmt.object.id,
    activityType: stmt.object.definition?.type,
    blockId: extensions['https://lxd360.com/xapi/extensions/block-id'],
    blockType: extensions['https://lxd360.com/xapi/extensions/block-type'],
    
    // Result
    verb: stmt.verb.id,
    success: stmt.result?.success,
    completion: stmt.result?.completion,
    scoreScaled: stmt.result?.score?.scaled,
    response: stmt.result?.response,
    
    // INSPIRE Extensions
    latencyMs: extensions['https://lxd360.com/xapi/extensions/latency'],
    cognitiveLoad: extensions['https://lxd360.com/xapi/extensions/cognitive-load'],
    modalityState: extensions['https://lxd360.com/xapi/extensions/modality-state'],
    skillId: extensions['https://lxd360.com/xapi/extensions/skill-id'],
    
    // Context
    courseId: stmt.context?.contextActivities?.parent?.[0]?.id,
    sessionId: extensions['https://lxd360.com/xapi/extensions/session-id'],
    
    // Metadata
    timestamp: new Date(stmt.timestamp),
    xapiStatementId: stmt.id,
  };
}
```

---

## 10. CLAUDE VS CODE PROMPTS — PHASE 1: FOUNDATION

### Phase 1A: Monorepo Setup

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | CLAUDE VS CODE AGENT ONBOARDING
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude VS Code — LRS Phase 1A
TICKET: LXD-LRS-001 — Monorepo Foundation Setup
BRANCH: claude/lrs-monorepo-foundation-XXXX

═══════════════════════════════════════════════════════════════════════════════
                         MANDATORY FIRST STEP
═══════════════════════════════════════════════════════════════════════════════

BEFORE DOING ANYTHING ELSE:

1. Read the CLAUDE.md file in the repository root
2. Confirm you understand:
   - "Nice not Twice" philosophy
   - npm only with --legacy-peer-deps
   - NEVER use --no-verify
   - Zero TypeScript errors policy

State these confirmations before proceeding.

═══════════════════════════════════════════════════════════════════════════════
                              CONTEXT
═══════════════════════════════════════════════════════════════════════════════

We are building the INSPIRE Learning Record Store (LRS) as the foundational
data layer for the entire platform. This phase establishes the monorepo
structure using npm workspaces + TurboRepo.

Current state: Single Next.js 15 app at C:\GitHub\LXP360-SaaS
Target state: Monorepo with shared packages

═══════════════════════════════════════════════════════════════════════════════
                              YOUR TASK
═══════════════════════════════════════════════════════════════════════════════

TASK 1A: Initialize Monorepo Structure

1. Create root package.json with npm workspaces configuration:
   {
     "name": "inspire-monorepo",
     "private": true,
     "workspaces": ["apps/*", "packages/*", "functions"]
   }

2. Create turbo.json with build pipeline:
   {
     "$schema": "https://turbo.build/schema.json",
     "globalDependencies": ["**/.env.*local"],
     "pipeline": {
       "build": {
         "dependsOn": ["^build"],
         "outputs": ["dist/**", ".next/**"]
       },
       "dev": {
         "cache": false,
         "persistent": true
       },
       "lint": {},
       "typecheck": {}
     }
   }

3. Restructure existing app:
   - Move current app to apps/web/
   - Update all import paths
   - Verify app still builds

4. Create package directories:
   - packages/types/
   - packages/xapi-client/
   - packages/ml/

5. Create minimal package.json for each package with:
   - Proper name (@inspire/types, @inspire/xapi-client, @inspire/ml)
   - TypeScript configuration
   - Build scripts

═══════════════════════════════════════════════════════════════════════════════
                            CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

- USE npm workspaces (NOT pnpm/yarn)
- USE TurboRepo for task orchestration
- MAINTAIN existing app functionality
- ALL packages must have strict TypeScript
- DO NOT modify any existing component logic

═══════════════════════════════════════════════════════════════════════════════
                           DELIVERABLES
═══════════════════════════════════════════════════════════════════════════════

Files to create/modify:
- [ ] /package.json (root workspace config)
- [ ] /turbo.json (TurboRepo config)
- [ ] /apps/web/package.json (moved app)
- [ ] /packages/types/package.json
- [ ] /packages/types/tsconfig.json
- [ ] /packages/types/src/index.ts
- [ ] /packages/xapi-client/package.json
- [ ] /packages/xapi-client/tsconfig.json
- [ ] /packages/xapi-client/src/index.ts
- [ ] /packages/ml/package.json
- [ ] /packages/ml/tsconfig.json
- [ ] /packages/ml/src/index.ts

Verification:
- [ ] `npm install` completes without errors
- [ ] `npm run build` builds all packages
- [ ] `npm run dev` starts the web app
- [ ] TypeScript: 0 errors

═══════════════════════════════════════════════════════════════════════════════
                         SESSION HANDOFF TEMPLATE
═══════════════════════════════════════════════════════════════════════════════

End your session with:

## Session Handoff — [Date]

### Completed Work
- [ ] Branch: `claude/lrs-monorepo-foundation-XXXX`
- [ ] Commits: [list commit hashes]
- [ ] Files: [list files created/modified]

### Status
| Item | Status | Notes |
|------|--------|-------|
| TypeScript errors | 0 | ✅ |
| npm install | Pass | ✅ |
| npm run build | Pass | ✅ |
| npm run dev | Pass | ✅ |

### Next Steps
1. Proceed to Phase 1B: Types Package

### Blockers
- [Any issues encountered]

═══════════════════════════════════════════════════════════════════════════════
```

---

### Phase 1B: Types Package

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | CLAUDE VS CODE AGENT ONBOARDING
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude VS Code — LRS Phase 1B
TICKET: LXD-LRS-002 — Shared Types Package
BRANCH: claude/lrs-types-package-XXXX

═══════════════════════════════════════════════════════════════════════════════
                         MANDATORY FIRST STEP
═══════════════════════════════════════════════════════════════════════════════

Read CLAUDE.md and confirm understanding before proceeding.

═══════════════════════════════════════════════════════════════════════════════
                              CONTEXT
═══════════════════════════════════════════════════════════════════════════════

The @inspire/types package provides shared TypeScript interfaces and Zod
schemas used across the entire platform. This is the foundation for type
safety across packages.

Prerequisites: Phase 1A complete (monorepo structure exists)

═══════════════════════════════════════════════════════════════════════════════
                              YOUR TASK
═══════════════════════════════════════════════════════════════════════════════

TASK 1B: Build the Types Package

1. Create Firestore schema types in packages/types/src/firestore/:

   a) learner.ts — LearnerProfile, MasteryState schemas
   b) tenant.ts — Tenant configuration schema
   c) interaction.ts — Interaction document schema
   d) recommendation.ts — ActiveRecommendation schema

2. Create BigQuery schema types in packages/types/src/bigquery/:

   a) xapi-statement.ts — BigQuery row schema

3. Create shared enums and constants in packages/types/src/constants/:

   a) roles.ts — ROLE_HIERARCHY, Permission types
   b) verbs.ts — xAPI verb URIs
   c) extensions.ts — INSPIRE extension URIs

4. Create barrel export in packages/types/src/index.ts

5. Configure TypeScript for package consumption:
   - Strict mode enabled
   - Declaration files generated
   - Proper module resolution

═══════════════════════════════════════════════════════════════════════════════
                         SCHEMA SPECIFICATIONS
═══════════════════════════════════════════════════════════════════════════════

LearnerProfileSchema must include:
- uid: string
- tenantId: string
- email: string (email format)
- displayName: string
- role: enum ['learner', 'mentee', 'mentor', 'instructor']
- preferences: object with theme, language, accessibility, modalityPreference
- createdAt, updatedAt, lastActiveAt: Timestamp

MasteryStateSchema must include:
- skillId, skillName: string
- BKT parameters: pMastery, pLearn, pGuess, pSlip (0-1 range)
- Tracking: opportunities, correctCount, incorrectCount (integers)
- SM-2: easinessFactor (min 1.3), interval, repetitions, nextReviewDate
- Metadata: lastUpdated, lastInteractionId

InteractionSchema must include:
- id: UUID
- tenantId, learnerId: string
- Activity: activityId, activityType, blockId, blockType
- Result: verb, success, completion, scoreScaled, response
- INSPIRE Extensions: latencyMs, cognitiveLoad, modalityState, skillId
- Context: courseId, lessonId, sessionId
- Metadata: timestamp, xapiStatementId

ActiveRecommendationSchema must include:
- id: UUID
- type: enum ['modality', 'content', 'intervention', 'review']
- Recommendation: targetActivityId, targetActivityName, suggestedModality, confidence
- Glass Box explanation object with shortExplanation, featureContributions
- Override options: canSkip, canAdjustDifficulty, canChangeModality, alternatives
- Status: enum ['active', 'accepted', 'overridden', 'expired']
- Metadata: createdAt, expiresAt

═══════════════════════════════════════════════════════════════════════════════
                            CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

- USE Zod for all schemas (runtime validation + TypeScript inference)
- EXPORT both schema and inferred type for each schema
- ALL number ranges must have explicit min/max
- ALL enums must use z.enum() not z.union()
- DO NOT use `any` type anywhere
- INCLUDE JSDoc comments for complex types

═══════════════════════════════════════════════════════════════════════════════
                           DELIVERABLES
═══════════════════════════════════════════════════════════════════════════════

Files to create:
- [ ] /packages/types/src/firestore/learner.ts
- [ ] /packages/types/src/firestore/tenant.ts
- [ ] /packages/types/src/firestore/interaction.ts
- [ ] /packages/types/src/firestore/recommendation.ts
- [ ] /packages/types/src/firestore/index.ts
- [ ] /packages/types/src/bigquery/xapi-statement.ts
- [ ] /packages/types/src/bigquery/index.ts
- [ ] /packages/types/src/constants/roles.ts
- [ ] /packages/types/src/constants/verbs.ts
- [ ] /packages/types/src/constants/extensions.ts
- [ ] /packages/types/src/constants/index.ts
- [ ] /packages/types/src/index.ts

Verification:
- [ ] `npm run build` in packages/types succeeds
- [ ] `npm run typecheck` passes with 0 errors
- [ ] Package can be imported from apps/web

═══════════════════════════════════════════════════════════════════════════════
```

---

## 11. CLAUDE VS CODE PROMPTS — PHASE 2: xAPI CLIENT PACKAGE

### Phase 2A: Core xAPI Schemas

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | CLAUDE VS CODE AGENT ONBOARDING
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude VS Code — LRS Phase 2A
TICKET: LXD-LRS-003 — xAPI Client Core Schemas
BRANCH: claude/lrs-xapi-schemas-XXXX

═══════════════════════════════════════════════════════════════════════════════
                         MANDATORY FIRST STEP
═══════════════════════════════════════════════════════════════════════════════

Read CLAUDE.md and confirm understanding before proceeding.

═══════════════════════════════════════════════════════════════════════════════
                              CONTEXT
═══════════════════════════════════════════════════════════════════════════════

The @inspire/xapi-client package is the core library for building and
validating xAPI statements. It will be used by both INSPIRE Studio
(authoring telemetry) and INSPIRE Ignite (learner interactions).

This phase creates the core xAPI 1.0.3 compliant schemas.

Prerequisites: Phase 1B complete (types package exists)

═══════════════════════════════════════════════════════════════════════════════
                              YOUR TASK
═══════════════════════════════════════════════════════════════════════════════

TASK 2A: Create xAPI Core Schemas

1. Create Actor schema (packages/xapi-client/src/schemas/actor.ts):
   - Support account-based identification (required for multi-tenant)
   - Support mbox as fallback
   - Include name (optional display name)

2. Create Verb schema (packages/xapi-client/src/schemas/verb.ts):
   - id: URL format
   - display: Record<string, string> for i18n

3. Create Object schema (packages/xapi-client/src/schemas/object.ts):
   - Activity type (primary)
   - ActivityDefinition with interactionType support
   - All 10 interaction types from xAPI spec

4. Create Result schema (packages/xapi-client/src/schemas/result.ts):
   - Score object with scaled, raw, min, max
   - success, completion booleans
   - response string
   - duration ISO 8601 format
   - extensions support

5. Create Context schema (packages/xapi-client/src/schemas/context.ts):
   - registration UUID
   - contextActivities (parent, grouping, category, other)
   - extensions support

6. Create full Statement schema (packages/xapi-client/src/schemas/statement.ts):
   - Compose all above schemas
   - Add id, timestamp, stored, authority, version
   - Export XAPIStatementSchema and XAPIStatement type

7. Create INSPIRE extensions schema (packages/xapi-client/src/schemas/extensions.ts):
   - All extension URIs as constants
   - Zod schemas for each extension value type

═══════════════════════════════════════════════════════════════════════════════
                         xAPI 1.0.3 COMPLIANCE
═══════════════════════════════════════════════════════════════════════════════

The schemas MUST comply with xAPI 1.0.3 specification:

Actor:
- objectType: "Agent" (default) or "Group"
- Exactly one IFI (account, mbox, mbox_sha1sum, openid)
- For account: homePage (URL) + name (string)

Verb:
- id: IRI (URL format)
- display: LanguageMap (at least en-US)

Object (Activity):
- objectType: "Activity" (default)
- id: IRI (URL format)
- definition: optional ActivityDefinition

Result:
- score.scaled: -1 to 1 range
- duration: ISO 8601 duration (PT1H30M)

Context:
- registration: UUID
- contextActivities arrays contain Activity objects

Statement:
- id: UUID (generated if not provided)
- timestamp: ISO 8601 datetime
- stored: ISO 8601 datetime (server-generated)
- version: "1.0.3"

═══════════════════════════════════════════════════════════════════════════════
                            CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

- FOLLOW xAPI 1.0.3 specification exactly
- USE Zod for all schemas
- EXPORT both schema and inferred type
- ALL URLs must use z.string().url()
- ALL UUIDs must use z.string().uuid()
- INCLUDE comprehensive JSDoc comments
- DO NOT deviate from spec without documenting reason

═══════════════════════════════════════════════════════════════════════════════
                           DELIVERABLES
═══════════════════════════════════════════════════════════════════════════════

Files to create:
- [ ] /packages/xapi-client/src/schemas/actor.ts
- [ ] /packages/xapi-client/src/schemas/verb.ts
- [ ] /packages/xapi-client/src/schemas/object.ts
- [ ] /packages/xapi-client/src/schemas/result.ts
- [ ] /packages/xapi-client/src/schemas/context.ts
- [ ] /packages/xapi-client/src/schemas/statement.ts
- [ ] /packages/xapi-client/src/schemas/extensions.ts
- [ ] /packages/xapi-client/src/schemas/index.ts

Tests to create:
- [ ] /packages/xapi-client/src/schemas/__tests__/statement.test.ts

Verification:
- [ ] All schemas compile without errors
- [ ] Test suite passes
- [ ] Sample valid statement validates successfully
- [ ] Sample invalid statement fails validation with clear error

═══════════════════════════════════════════════════════════════════════════════
```

---

### Phase 2B: Statement Builder

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | CLAUDE VS CODE AGENT ONBOARDING
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude VS Code — LRS Phase 2B
TICKET: LXD-LRS-004 — xAPI Statement Builder
BRANCH: claude/lrs-xapi-builder-XXXX

═══════════════════════════════════════════════════════════════════════════════
                         MANDATORY FIRST STEP
═══════════════════════════════════════════════════════════════════════════════

Read CLAUDE.md and confirm understanding before proceeding.

═══════════════════════════════════════════════════════════════════════════════
                              CONTEXT
═══════════════════════════════════════════════════════════════════════════════

The Statement Builder provides a fluent API for constructing valid xAPI
statements. It ensures type safety and schema compliance while providing
a developer-friendly interface.

Prerequisites: Phase 2A complete (xAPI schemas exist)

═══════════════════════════════════════════════════════════════════════════════
                              YOUR TASK
═══════════════════════════════════════════════════════════════════════════════

TASK 2B: Create Statement Builder

1. Create StatementBuilder class (packages/xapi-client/src/builder.ts):

```typescript
// Example usage:
const statement = new StatementBuilder(actor)
  .verb(XAPI_VERBS.ANSWERED)
  .activity('https://lxd360.com/activity/quiz-q1', {
    name: { 'en-US': 'Quiz Question 1' },
    interactionType: 'choice',
  })
  .result({
    success: true,
    score: { scaled: 0.8 },
  })
  .context({
    registration: sessionId,
    extensions: {
      [INSPIRE_EXTENSIONS.LATENCY]: 1500,
      [INSPIRE_EXTENSIONS.SKILL_ID]: 'skill-001',
    },
  })
  .build();
```

2. Implement builder methods:
   - constructor(actor: Actor) — Initialize with actor
   - verb(verb: Verb) — Set verb
   - activity(id: string, definition?: ActivityDefinition) — Set object
   - result(result: Result) — Set result
   - context(context: Context) — Set context
   - withLatency(ms: number) — Helper for hesitation tracking
   - withCognitiveLoad(load: CognitiveLoad) — Helper for ICL
   - withSkill(skillId: string) — Helper for BKT tracking
   - withSession(sessionId: string) — Helper for session context
   - build() — Validate and return statement

3. Implement validation in build():
   - Verify required fields (actor, verb, object)
   - Validate against XAPIStatementSchema
   - Generate UUID if not provided
   - Generate timestamp if not provided

4. Create Verbs registry (packages/xapi-client/src/verbs.ts):
   - All ADL standard verbs
   - INSPIRE custom verbs (hesitated, skipped, rewound, etc.)
   - Type-safe verb constants

5. Create validator utility (packages/xapi-client/src/validator.ts):
   - validateStatement(stmt: unknown): XAPIStatement
   - validateStatements(stmts: unknown[]): XAPIStatement[]
   - isValidStatement(stmt: unknown): boolean
   - Detailed error messages for validation failures

═══════════════════════════════════════════════════════════════════════════════
                            CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

- USE fluent builder pattern (method chaining)
- VALIDATE at build time, not method call time
- THROW descriptive errors on validation failure
- IMMUTABLE builder (each method returns new instance)
- DO NOT expose internal state
- INCLUDE JSDoc for all public methods

═══════════════════════════════════════════════════════════════════════════════
                           DELIVERABLES
═══════════════════════════════════════════════════════════════════════════════

Files to create:
- [ ] /packages/xapi-client/src/builder.ts
- [ ] /packages/xapi-client/src/verbs.ts
- [ ] /packages/xapi-client/src/validator.ts
- [ ] /packages/xapi-client/src/__tests__/builder.test.ts

Verification:
- [ ] Builder creates valid statements
- [ ] Builder rejects incomplete statements
- [ ] All verbs are properly typed
- [ ] Validator catches invalid statements

═══════════════════════════════════════════════════════════════════════════════
```

---

### Phase 2C: Statement Recipes

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | CLAUDE VS CODE AGENT ONBOARDING
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude VS Code — LRS Phase 2C
TICKET: LXD-LRS-005 — xAPI Statement Recipes
BRANCH: claude/lrs-xapi-recipes-XXXX

═══════════════════════════════════════════════════════════════════════════════
                         MANDATORY FIRST STEP
═══════════════════════════════════════════════════════════════════════════════

Read CLAUDE.md and confirm understanding before proceeding.

═══════════════════════════════════════════════════════════════════════════════
                              CONTEXT
═══════════════════════════════════════════════════════════════════════════════

Recipes are pre-built statement templates for common learning interactions.
They simplify instrumentation by providing one-line statement generation
for typical scenarios.

Prerequisites: Phase 2B complete (builder exists)

═══════════════════════════════════════════════════════════════════════════════
                              YOUR TASK
═══════════════════════════════════════════════════════════════════════════════

TASK 2C: Create Statement Recipes

1. Quiz Recipe (packages/xapi-client/src/recipes/quiz.ts):

```typescript
// Creates statement for quiz answer
export function createQuizAnswerStatement(params: {
  actor: Actor;
  quizId: string;
  questionId: string;
  questionText: string;
  response: string;
  correct: boolean;
  latencyMs: number;
  skillId?: string;
  sessionId: string;
}): XAPIStatement;

// Creates statement for quiz completion
export function createQuizCompletedStatement(params: {
  actor: Actor;
  quizId: string;
  quizName: string;
  scoreScaled: number;
  passed: boolean;
  duration: string;  // ISO 8601
  sessionId: string;
}): XAPIStatement;
```

2. Video Recipe (packages/xapi-client/src/recipes/video.ts):

```typescript
// Video started
export function createVideoStartedStatement(...): XAPIStatement;

// Video paused (with position)
export function createVideoPausedStatement(...): XAPIStatement;

// Video resumed
export function createVideoResumedStatement(...): XAPIStatement;

// Video completed
export function createVideoCompletedStatement(...): XAPIStatement;

// Video seeked (rewound/fast-forwarded)
export function createVideoSeekedStatement(...): XAPIStatement;
```

3. Navigation Recipe (packages/xapi-client/src/recipes/navigation.ts):

```typescript
// Page/slide viewed
export function createPageViewedStatement(...): XAPIStatement;

// Course launched
export function createCourseLaunchedStatement(...): XAPIStatement;

// Course completed
export function createCourseCompletedStatement(...): XAPIStatement;

// Lesson started
export function createLessonStartedStatement(...): XAPIStatement;

// Lesson completed
export function createLessonCompletedStatement(...): XAPIStatement;
```

4. Hesitation Recipe (packages/xapi-client/src/recipes/hesitation.ts):

```typescript
// User hesitated on interaction
export function createHesitationStatement(params: {
  actor: Actor;
  activityId: string;
  activityName: string;
  latencyMs: number;
  hesitationThresholdMs: number;
  hesitationCount: number;
  sessionId: string;
}): XAPIStatement;
```

5. Adaptive Recipe (packages/xapi-client/src/recipes/adaptive.ts):

```typescript
// Recommendation shown
export function createRecommendationShownStatement(...): XAPIStatement;

// Recommendation accepted
export function createRecommendationAcceptedStatement(...): XAPIStatement;

// Recommendation overridden
export function createRecommendationOverriddenStatement(...): XAPIStatement;

// Modality switched
export function createModalitySwitchedStatement(...): XAPIStatement;
```

═══════════════════════════════════════════════════════════════════════════════
                            CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

- USE StatementBuilder internally
- REQUIRE all necessary parameters (no optional overloads)
- INCLUDE INSPIRE extensions where appropriate
- RETURN validated XAPIStatement
- DOCUMENT all parameters with JSDoc
- INCLUDE example usage in comments

═══════════════════════════════════════════════════════════════════════════════
                           DELIVERABLES
═══════════════════════════════════════════════════════════════════════════════

Files to create:
- [ ] /packages/xapi-client/src/recipes/quiz.ts
- [ ] /packages/xapi-client/src/recipes/video.ts
- [ ] /packages/xapi-client/src/recipes/navigation.ts
- [ ] /packages/xapi-client/src/recipes/hesitation.ts
- [ ] /packages/xapi-client/src/recipes/adaptive.ts
- [ ] /packages/xapi-client/src/recipes/index.ts
- [ ] /packages/xapi-client/src/__tests__/recipes.test.ts

Update:
- [ ] /packages/xapi-client/src/index.ts (export recipes)

Verification:
- [ ] All recipes produce valid statements
- [ ] Recipes include appropriate extensions
- [ ] Test coverage for each recipe function

═══════════════════════════════════════════════════════════════════════════════
```

---

## 12. CLAUDE VS CODE PROMPTS — PHASE 3: API ROUTES

### Phase 3A: xAPI Statements Endpoint

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | CLAUDE VS CODE AGENT ONBOARDING
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude VS Code — LRS Phase 3A
TICKET: LXD-LRS-006 — xAPI Statements API Route
BRANCH: claude/lrs-api-statements-XXXX

═══════════════════════════════════════════════════════════════════════════════
                         MANDATORY FIRST STEP
═══════════════════════════════════════════════════════════════════════════════

Read CLAUDE.md and confirm understanding before proceeding.

═══════════════════════════════════════════════════════════════════════════════
                              CONTEXT
═══════════════════════════════════════════════════════════════════════════════

The /api/xapi/statements endpoint is the single ingestion point for all
xAPI statements from both INSPIRE Studio and INSPIRE Ignite. It performs
dual-write to Firestore (real-time) and Pub/Sub (analytics).

Prerequisites: Phase 2 complete (xapi-client package exists)

═══════════════════════════════════════════════════════════════════════════════
                              YOUR TASK
═══════════════════════════════════════════════════════════════════════════════

TASK 3A: Create xAPI Statements API Route

1. Create route handler (apps/web/app/api/xapi/statements/route.ts):

   POST /api/xapi/statements
   - Accept: application/json
   - Body: XAPIStatement[] (1-100 statements)
   - Response: { stored: number, ids: string[] }

2. Implement authentication:
   - Validate Firebase session cookie
   - Extract tenantId from custom claims
   - Reject unauthenticated requests with 401

3. Implement validation:
   - Parse body as JSON
   - Validate against XAPIStatementSchema array
   - Return 400 with details on validation failure

4. Implement server-side enrichment:
   - Generate UUID if not provided
   - Generate timestamp if not provided
   - Set stored timestamp (always server-generated)
   - OVERRIDE actor with server-verified identity (CRITICAL)
   - Add authority (system that stored statement)
   - Set version to "1.0.3"

5. Implement dual-write:
   a) Firestore (real-time path):
      - Extract interaction data from statement
      - Write to /tenants/{tid}/learners/{uid}/interactions/{iid}
   
   b) Pub/Sub (analytics path):
      - Publish enriched statement to xapi-statements topic
      - Include tenant_id in message attributes

6. Create helper utilities:
   - apps/web/lib/firebase/admin.ts — Firebase Admin SDK singleton
   - apps/web/lib/pubsub/client.ts — Pub/Sub client
   - apps/web/lib/auth/session.ts — Session validation

═══════════════════════════════════════════════════════════════════════════════
                         SECURITY REQUIREMENTS
═══════════════════════════════════════════════════════════════════════════════

CRITICAL: The actor field MUST be overridden server-side.

Clients can submit any actor value, but the server MUST:
1. Verify the session is valid
2. Extract the authenticated user's UID
3. Replace the actor with server-verified identity:

```typescript
actor: {
  objectType: 'Agent',
  account: {
    homePage: 'https://lxd360.com',
    name: session.user.uid,  // Server-verified UID
  },
  name: session.user.displayName,
}
```

This prevents users from submitting statements as other users.

═══════════════════════════════════════════════════════════════════════════════
                            CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

- USE Firebase Admin SDK (not client SDK) for Firestore writes
- USE @google-cloud/pubsub for Pub/Sub publishing
- VALIDATE all input before processing
- NEVER trust client-provided actor
- LOG errors with structured logging
- RETURN consistent error format

═══════════════════════════════════════════════════════════════════════════════
                           DELIVERABLES
═══════════════════════════════════════════════════════════════════════════════

Files to create:
- [ ] /apps/web/app/api/xapi/statements/route.ts
- [ ] /apps/web/lib/firebase/admin.ts
- [ ] /apps/web/lib/pubsub/client.ts
- [ ] /apps/web/lib/auth/session.ts

Environment variables to document:
- GOOGLE_APPLICATION_CREDENTIALS
- NEXT_PUBLIC_FIREBASE_* (existing)
- PUBSUB_TOPIC_XAPI_STATEMENTS

Verification:
- [ ] POST with valid statements returns 200
- [ ] POST with invalid statements returns 400
- [ ] POST without auth returns 401
- [ ] Statements appear in Firestore
- [ ] Statements appear in Pub/Sub (check via console)

═══════════════════════════════════════════════════════════════════════════════
```

---

## 13. CLAUDE VS CODE PROMPTS — PHASE 4: PUB/SUB PIPELINE

### Phase 4A: Infrastructure Setup

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | CLAUDE VS CODE AGENT ONBOARDING
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude VS Code — LRS Phase 4A
TICKET: LXD-LRS-007 — GCP Infrastructure (Terraform)
BRANCH: claude/lrs-infrastructure-XXXX

═══════════════════════════════════════════════════════════════════════════════
                         MANDATORY FIRST STEP
═══════════════════════════════════════════════════════════════════════════════

Read CLAUDE.md and confirm understanding before proceeding.

═══════════════════════════════════════════════════════════════════════════════
                              CONTEXT
═══════════════════════════════════════════════════════════════════════════════

This phase creates the GCP infrastructure for the analytics pipeline:
- Pub/Sub topics and subscriptions
- BigQuery dataset and tables
- IAM bindings for service accounts

Prerequisites: Phase 3 complete (API route exists)

GCP Project: lxd-saas-dev
Region: us-central1

═══════════════════════════════════════════════════════════════════════════════
                              YOUR TASK
═══════════════════════════════════════════════════════════════════════════════

TASK 4A: Create Terraform Infrastructure

1. Create main.tf (infrastructure/terraform/main.tf):
   - Provider configuration for google and google-beta
   - Project and region variables
   - Enable required APIs

2. Create pubsub.tf (infrastructure/terraform/pubsub.tf):
   - xapi-statements topic
   - xapi-statements-bigquery-sub (BigQuery subscription)
   - xapi-statements-dlq (dead letter queue)
   - Message retention: 7 days

3. Create bigquery.tf (infrastructure/terraform/bigquery.tf):
   - inspire_lrs dataset
   - xapi_statements table with full schema
   - Partitioning by DATE(timestamp)
   - Clustering by tenant_id, actor_account_name
   - 7-year partition expiration

4. Create iam.tf (infrastructure/terraform/iam.tf):
   - Service account for LRS API
   - Firestore user role
   - Pub/Sub publisher role
   - BigQuery data editor role

5. Create variables.tf (infrastructure/terraform/variables.tf):
   - project_id
   - region
   - environment

6. Create outputs.tf (infrastructure/terraform/outputs.tf):
   - Topic name
   - Subscription name
   - Dataset ID
   - Table ID
   - Service account email

═══════════════════════════════════════════════════════════════════════════════
                         BIGQUERY SCHEMA
═══════════════════════════════════════════════════════════════════════════════

The xapi_statements table must include:

Identity columns:
- id STRING NOT NULL
- tenant_id STRING NOT NULL

Actor columns (denormalized):
- actor_account_home_page STRING NOT NULL
- actor_account_name STRING NOT NULL
- actor_name STRING

Verb columns:
- verb_id STRING NOT NULL
- verb_display STRING

Object columns:
- object_id STRING NOT NULL
- object_type STRING
- object_definition_type STRING
- object_definition_name STRING
- object_definition_interaction_type STRING

Result columns:
- result_success BOOL
- result_completion BOOL
- result_score_scaled FLOAT64
- result_score_raw FLOAT64
- result_score_min FLOAT64
- result_score_max FLOAT64
- result_response STRING
- result_duration STRING

Context columns:
- context_registration STRING
- context_course_id STRING
- context_lesson_id STRING
- context_session_id STRING
- context_platform STRING
- context_language STRING

INSPIRE extension columns (promoted):
- ext_latency_ms INT64
- ext_cognitive_load_total FLOAT64
- ext_cognitive_load_intrinsic FLOAT64
- ext_cognitive_load_extraneous FLOAT64
- ext_cognitive_load_germane FLOAT64
- ext_modality_state STRING
- ext_skill_id STRING
- ext_block_type STRING
- ext_hesitation_count INT64
- ext_a11y_mode JSON

Full statement:
- statement_json JSON NOT NULL

Timestamps:
- timestamp TIMESTAMP NOT NULL
- stored TIMESTAMP NOT NULL
- ingestion_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP()

Metadata:
- api_version STRING DEFAULT '1.0.3'
- source_system STRING

═══════════════════════════════════════════════════════════════════════════════
                            CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

- USE Terraform 1.5+ syntax
- USE google-beta provider for BigQuery subscription
- REQUIRE partition filter on queries
- SET 7-year retention (2557 days)
- INCLUDE proper labels for cost tracking
- DOCUMENT all resources

═══════════════════════════════════════════════════════════════════════════════
                           DELIVERABLES
═══════════════════════════════════════════════════════════════════════════════

Files to create:
- [ ] /infrastructure/terraform/main.tf
- [ ] /infrastructure/terraform/pubsub.tf
- [ ] /infrastructure/terraform/bigquery.tf
- [ ] /infrastructure/terraform/iam.tf
- [ ] /infrastructure/terraform/variables.tf
- [ ] /infrastructure/terraform/outputs.tf
- [ ] /infrastructure/terraform/terraform.tfvars.example

Verification:
- [ ] `terraform init` succeeds
- [ ] `terraform plan` shows expected resources
- [ ] `terraform apply` creates resources
- [ ] BigQuery table visible in console
- [ ] Pub/Sub topic visible in console

═══════════════════════════════════════════════════════════════════════════════
```

---

## 14. CLAUDE VS CODE PROMPTS — PHASE 5: REAL-TIME ADAPTATION LAYER

### Phase 5A: Cloud Functions

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | CLAUDE VS CODE AGENT ONBOARDING
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude VS Code — LRS Phase 5A
TICKET: LXD-LRS-008 — Cloud Functions for Adaptive Learning
BRANCH: claude/lrs-cloud-functions-XXXX

═══════════════════════════════════════════════════════════════════════════════
                         MANDATORY FIRST STEP
═══════════════════════════════════════════════════════════════════════════════

Read CLAUDE.md and confirm understanding before proceeding.

═══════════════════════════════════════════════════════════════════════════════
                              CONTEXT
═══════════════════════════════════════════════════════════════════════════════

Cloud Functions trigger on Firestore writes to process interactions
and update learner mastery states. This is the real-time adaptation
layer that powers the Modality Swapper and JITAI interventions.

Prerequisites: Phase 4 complete (infrastructure exists)

═══════════════════════════════════════════════════════════════════════════════
                              YOUR TASK
═══════════════════════════════════════════════════════════════════════════════

TASK 5A: Create Cloud Functions

1. Initialize functions project (functions/):
   - TypeScript configuration
   - Firebase Functions SDK
   - Dependencies: @inspire/ml, @inspire/types

2. Create onInteractionCreated trigger (functions/src/onInteractionCreated.ts):

```typescript
export const onInteractionCreated = functions.firestore
  .document('tenants/{tenantId}/learners/{userId}/interactions/{interactionId}')
  .onCreate(async (snap, context) => {
    const { tenantId, userId, interactionId } = context.params;
    const interaction = snap.data() as Interaction;
    
    // 1. Update mastery state if skill-related
    if (interaction.skillId && interaction.success !== undefined) {
      await updateMasteryState(tenantId, userId, interaction);
    }
    
    // 2. Generate recommendation if conditions met
    await maybeGenerateRecommendation(tenantId, userId, interaction);
  });
```

3. Create updateMasteryState function (functions/src/updateMasteryState.ts):
   - Get current mastery state from Firestore
   - Initialize if not exists (use default BKT priors)
   - Calculate new mastery using BKT algorithm from @inspire/ml
   - Update SM-2 spaced repetition if applicable
   - Write updated state to Firestore

4. Create generateRecommendation function (functions/src/generateRecommendation.ts):
   - Collect recent interactions (last 10)
   - Get current mastery states
   - Call Vertex AI prediction endpoint
   - Generate Glass Box explanation via Gemini
   - Write recommendation to activeRecommendation doc

5. Create packages/ml implementation:
   - packages/ml/src/bkt.ts — BKTCalculator class
   - packages/ml/src/sm2.ts — SM2Calculator class
   - packages/ml/src/cognitive-load.ts — ICLCalculator class

═══════════════════════════════════════════════════════════════════════════════
                         BKT ALGORITHM
═══════════════════════════════════════════════════════════════════════════════

Bayesian Knowledge Tracing update formula:

Given:
- P(L_n) = Current mastery probability
- P(T) = Probability of learning per opportunity (p_learn)
- P(G) = Probability of guessing correctly (p_guess)
- P(S) = Probability of slipping when mastered (p_slip)

On correct answer:
P(L_n | correct) = P(L_n) * (1 - P(S)) / P(correct)

On incorrect answer:
P(L_n | incorrect) = P(L_n) * P(S) / P(incorrect)

Then apply learning:
P(L_{n+1}) = P(L_n | observation) + (1 - P(L_n | observation)) * P(T)

Default parameters:
- p_init = 0.3 (prior probability of mastery)
- p_learn = 0.1
- p_guess = 0.2
- p_slip = 0.1

═══════════════════════════════════════════════════════════════════════════════
                            CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

- USE Firebase Functions Gen 2
- SET minInstances: 1 to avoid cold starts
- LIMIT function execution to < 60 seconds
- HANDLE errors gracefully (don't fail silently)
- LOG all state changes for audit
- USE @inspire/ml package for algorithms

═══════════════════════════════════════════════════════════════════════════════
                           DELIVERABLES
═══════════════════════════════════════════════════════════════════════════════

Files to create:
- [ ] /functions/package.json
- [ ] /functions/tsconfig.json
- [ ] /functions/src/index.ts
- [ ] /functions/src/onInteractionCreated.ts
- [ ] /functions/src/updateMasteryState.ts
- [ ] /functions/src/generateRecommendation.ts
- [ ] /packages/ml/src/bkt.ts
- [ ] /packages/ml/src/sm2.ts
- [ ] /packages/ml/src/cognitive-load.ts
- [ ] /packages/ml/src/index.ts
- [ ] /packages/ml/src/__tests__/bkt.test.ts
- [ ] /packages/ml/src/__tests__/sm2.test.ts

Verification:
- [ ] Functions deploy successfully
- [ ] Interaction creates trigger function
- [ ] Mastery state updates correctly
- [ ] BKT calculations match expected values
- [ ] SM-2 intervals calculated correctly

═══════════════════════════════════════════════════════════════════════════════
```

---

## 15. CLAUDE VS CODE PROMPTS — PHASE 6: INTEGRATION TESTING

### Phase 6A: End-to-End Test Suite

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | CLAUDE VS CODE AGENT ONBOARDING
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude VS Code — LRS Phase 6A
TICKET: LXD-LRS-009 — Integration Testing
BRANCH: claude/lrs-integration-tests-XXXX

═══════════════════════════════════════════════════════════════════════════════
                         MANDATORY FIRST STEP
═══════════════════════════════════════════════════════════════════════════════

Read CLAUDE.md and confirm understanding before proceeding.

═══════════════════════════════════════════════════════════════════════════════
                              CONTEXT
═══════════════════════════════════════════════════════════════════════════════

This phase creates comprehensive integration tests for the LRS pipeline,
verifying end-to-end data flow from client to BigQuery.

Prerequisites: Phases 1-5 complete

═══════════════════════════════════════════════════════════════════════════════
                              YOUR TASK
═══════════════════════════════════════════════════════════════════════════════

TASK 6A: Create Integration Tests

1. Create test utilities (apps/web/tests/utils/):
   - createTestUser() — Firebase Auth test user
   - createTestTenant() — Test tenant in Firestore
   - cleanupTestData() — Remove test data after tests
   - waitForFirestore() — Poll until document exists
   - waitForBigQuery() — Poll until row exists

2. Create API tests (apps/web/tests/api/xapi.test.ts):

```typescript
describe('POST /api/xapi/statements', () => {
  it('accepts valid statement and stores in Firestore', async () => {
    const statement = createQuizAnswerStatement({...});
    const response = await fetch('/api/xapi/statements', {
      method: 'POST',
      body: JSON.stringify([statement]),
      headers: { Cookie: testSessionCookie },
    });
    
    expect(response.status).toBe(200);
    const { ids } = await response.json();
    
    // Verify Firestore
    const interaction = await waitForFirestore(
      `tenants/${testTenantId}/learners/${testUserId}/interactions/${ids[0]}`
    );
    expect(interaction.verb).toBe(statement.verb.id);
  });
  
  it('rejects invalid statement with 400', async () => {...});
  it('rejects unauthenticated request with 401', async () => {...});
  it('overrides client-provided actor', async () => {...});
  it('handles batch of 100 statements', async () => {...});
});
```

3. Create pipeline tests (apps/web/tests/integration/pipeline.test.ts):

```typescript
describe('LRS Pipeline', () => {
  it('statement flows from API to BigQuery', async () => {
    // Submit statement
    // Wait for Firestore write
    // Wait for BigQuery row (may take minutes)
    // Verify data integrity
  });
  
  it('interaction triggers mastery state update', async () => {
    // Submit skill-related interaction
    // Verify mastery state updated
    // Verify BKT calculation correct
  });
  
  it('recommendation generated for struggling learner', async () => {
    // Submit several incorrect answers
    // Verify recommendation created
    // Verify Glass Box explanation present
  });
});
```

4. Create load tests (apps/web/tests/load/statements.test.ts):
   - 100 concurrent statement submissions
   - Verify no data loss
   - Measure latency distribution

═══════════════════════════════════════════════════════════════════════════════
                            CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

- USE Vitest for unit/integration tests
- USE Playwright for E2E if needed
- CLEAN UP test data after each test
- USE unique IDs to avoid test pollution
- MOCK Vertex AI in unit tests
- USE real services in integration tests

═══════════════════════════════════════════════════════════════════════════════
                           DELIVERABLES
═══════════════════════════════════════════════════════════════════════════════

Files to create:
- [ ] /apps/web/tests/utils/firebase.ts
- [ ] /apps/web/tests/utils/bigquery.ts
- [ ] /apps/web/tests/utils/auth.ts
- [ ] /apps/web/tests/api/xapi.test.ts
- [ ] /apps/web/tests/integration/pipeline.test.ts
- [ ] /apps/web/tests/load/statements.test.ts
- [ ] /apps/web/vitest.config.ts

Verification:
- [ ] All unit tests pass
- [ ] Integration tests pass against real services
- [ ] Load test shows acceptable latency

═══════════════════════════════════════════════════════════════════════════════
```

---

## 16. DEPLOYMENT & VERIFICATION

### 16.1 Deployment Checklist

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LRS DEPLOYMENT CHECKLIST                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PRE-DEPLOYMENT                                                            │
│  ═════════════                                                             │
│  [ ] All tests passing locally                                             │
│  [ ] TypeScript: 0 errors                                                  │
│  [ ] Lint: 0 errors                                                        │
│  [ ] Environment variables documented                                      │
│  [ ] Firestore security rules reviewed                                     │
│  [ ] Service account permissions verified                                  │
│                                                                             │
│  INFRASTRUCTURE                                                            │
│  ══════════════                                                            │
│  [ ] terraform apply completed                                             │
│  [ ] Pub/Sub topic created                                                 │
│  [ ] BigQuery table created                                                │
│  [ ] Service account created with correct roles                            │
│  [ ] Firestore rules deployed                                              │
│                                                                             │
│  APPLICATION                                                               │
│  ═══════════                                                               │
│  [ ] Cloud Functions deployed                                              │
│  [ ] Next.js app deployed to Cloud Run                                     │
│  [ ] Environment variables set in Cloud Run                                │
│  [ ] Health check endpoint responding                                      │
│                                                                             │
│  VERIFICATION                                                              │
│  ════════════                                                              │
│  [ ] Submit test statement via API                                         │
│  [ ] Verify statement in Firestore                                         │
│  [ ] Verify statement in BigQuery (wait 5 min)                            │
│  [ ] Verify mastery state update triggered                                 │
│  [ ] Verify no errors in Cloud Logging                                     │
│                                                                             │
│  MONITORING                                                                │
│  ══════════                                                                │
│  [ ] Cloud Monitoring dashboard created                                    │
│  [ ] Alert policies configured                                             │
│  [ ] Error budget defined                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 16.2 Verification Commands

```bash
# 1. Test API endpoint
curl -X POST https://your-domain.com/api/xapi/statements \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -d '[{
    "actor": {"account": {"homePage": "https://lxd360.com", "name": "test"}},
    "verb": {"id": "http://adlnet.gov/expapi/verbs/answered", "display": {"en-US": "answered"}},
    "object": {"id": "https://lxd360.com/activity/test-q1"}
  }]'

# 2. Check Firestore (via Firebase Console or CLI)
firebase firestore:get tenants/TENANT_ID/learners/USER_ID/interactions/STATEMENT_ID

# 3. Check BigQuery
bq query --use_legacy_sql=false \
  'SELECT * FROM inspire_lrs.xapi_statements 
   WHERE id = "STATEMENT_ID" 
   AND DATE(timestamp) = CURRENT_DATE()'

# 4. Check Cloud Functions logs
gcloud functions logs read onInteractionCreated --limit=50

# 5. Check Pub/Sub (messages acknowledged)
gcloud pubsub subscriptions describe xapi-statements-bigquery-sub
```

---

## 17. CRITICAL CONSTRAINTS & NON-NEGOTIABLES

### 17.1 Security Requirements

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SECURITY NON-NEGOTIABLES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✅ ALWAYS override client-provided actor with server-verified identity    │
│  ✅ ALWAYS validate session before processing statements                    │
│  ✅ ALWAYS use service accounts with minimal permissions                    │
│  ✅ ALWAYS encrypt data at rest and in transit                             │
│  ✅ ALWAYS log authentication failures                                      │
│                                                                             │
│  ❌ NEVER expose service account credentials to client                      │
│  ❌ NEVER trust client-provided actor, authority, or stored fields         │
│  ❌ NEVER allow cross-tenant data access                                    │
│  ❌ NEVER store PII in statement extensions without encryption              │
│  ❌ NEVER bypass Firestore security rules                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 17.2 Data Integrity Requirements

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DATA INTEGRITY NON-NEGOTIABLES                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✅ ALWAYS validate statements against xAPI 1.0.3 schema                   │
│  ✅ ALWAYS use UUIDs for statement IDs                                      │
│  ✅ ALWAYS store full statement JSON for compliance                        │
│  ✅ ALWAYS implement dead letter queue for failed ingestion                │
│  ✅ ALWAYS partition BigQuery by date                                       │
│                                                                             │
│  ❌ NEVER modify stored statements (immutable)                              │
│  ❌ NEVER delete statements without audit trail                            │
│  ❌ NEVER skip validation for "trusted" sources                            │
│  ❌ NEVER use eventual consistency for mastery state                       │
│  ❌ NEVER exceed 7-year retention without compliance review                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 17.3 Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time (p95) | < 200ms | Cloud Monitoring |
| Firestore Write Latency | < 100ms | Cloud Monitoring |
| Pub/Sub Publish Latency | < 50ms | Cloud Monitoring |
| BigQuery Ingestion Delay | < 5 min | Custom metric |
| Cloud Function Cold Start | < 500ms | Cloud Monitoring |
| Real-time Recommendation | < 1 sec | End-to-end |

---

## APPENDIX A: PHASE SUMMARY

| Phase | Description | Est. Duration | Dependencies |
|-------|-------------|---------------|--------------|
| 1A | Monorepo Foundation | 2-4 hours | None |
| 1B | Types Package | 4-6 hours | 1A |
| 2A | xAPI Core Schemas | 4-6 hours | 1B |
| 2B | Statement Builder | 3-4 hours | 2A |
| 2C | Statement Recipes | 3-4 hours | 2B |
| 3A | API Route | 4-6 hours | 2C |
| 4A | Infrastructure | 2-4 hours | 3A |
| 5A | Cloud Functions | 6-8 hours | 4A |
| 6A | Integration Tests | 4-6 hours | 5A |

**Total Estimated Duration: 32-48 hours**

---

## APPENDIX B: ENVIRONMENT VARIABLES

```bash
# .env.local (apps/web)

# Firebase (existing)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lxd-saas-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lxd-saas-dev
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lxd-saas-dev.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=203150315202
NEXT_PUBLIC_FIREBASE_APP_ID=1:203150315202:web:...

# GCP (new for LRS)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
GCP_PROJECT_ID=lxd-saas-dev
GCP_REGION=us-central1

# Pub/Sub
PUBSUB_TOPIC_XAPI_STATEMENTS=xapi-statements

# BigQuery
BIGQUERY_DATASET_ID=inspire_lrs
BIGQUERY_TABLE_STATEMENTS=xapi_statements

# Vertex AI (Phase 5+)
VERTEX_AI_ENDPOINT_ADAPTIVE=projects/lxd-saas-dev/locations/us-central1/endpoints/...
VERTEX_AI_MODEL_BKT=...
```

---

*This document serves as the definitive build guide for the INSPIRE LRS. Execute phases in order, using the Claude VS Code prompts provided. Each phase builds on the previous — do not skip phases.*
