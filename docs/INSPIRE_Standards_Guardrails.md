# INSPIRE ENGINEERING CONSTITUTION & GUARDRAILS

**Version:** 2.0 (The "NASA-Grade" Standard)
**Effective Date:** January 2026
**Classification:** INTERNAL ENGINEERING DIRECTIVE
**Enforcement:** ZERO TOLERANCE

---

## 1. THE PRIME DIRECTIVES

1.  **Nice Not Twice:** Do it right the first time. We do not ship "temporary fixes" or "technical debt tickets." We build for Mars.
2.  **Zero Error Policy:** The build pipeline (`pnpm build`) must pass with **0 TypeScript errors** and **0 Lint warnings**. No exceptions.
3.  **The Golden Thread:** Data integrity is paramount. Types shared between Studio, LMS, and LRS must live in `@inspire/types`. Never duplicate interfaces locally.
4.  **Accessibility is Non-Negotiable:** WCAG 2.1 AA is the floor, not the ceiling. Every component must be navigable via keyboard and screen reader from Day 1.

---

## 2. MONOREPO ARCHITECTURE

We utilize a **TurboRepo** powered Monorepo with **pnpm workspaces**.

### 2.1 Directory Structure
```text
lxd360-ecosystem/
├── apps/
│   ├── web/                 # The Unified Platform (Next.js 15)
│   │   ├── app/(tenant)/    # Multi-tenant Saas Routes
│   │   │   ├── inspire/     # Studio (Authoring)
│   │   │   └── ignite/      # LMS (Learner Experience)
│   │   └── api/             # LRS Ingestion Endpoints
├── packages/
│   ├── ui/                  # Shared Shadcn Component Library
│   ├── types/               # The "Golden Thread" (Shared Zod Schemas)
│   ├── xapi-client/         # LRS Telemetry Builder
│   └── ml/                  # AI & Adaptive Logic (BKT, SM-2)
└── docs/                    # The Source of Truth
2.2 Package Management
ALLOWED: pnpm (Performance & Strictness)

FORBIDDEN: npm, yarn, bun

COMMANDS:

Install: pnpm install

Add Dependency: pnpm add <pkg> --filter <workspace>

Build: pnpm build

3. CODING STANDARDS
3.1 Strict TypeScript
NO any: The use of any is grounds for immediate PR rejection. Use unknown if absolutely necessary, but prefer strict Zod schemas.

NO @ts-ignore: If the types don't match, fix the types. Do not silence the compiler.

Shared Types: If a type is used in more than one file, it belongs in packages/types.

3.2 Component Architecture (The "Smart Block" Pattern)
We do not build 100 separate components. We build Configurable Suites.

Wrong: HeadingBlock.tsx, ParagraphBlock.tsx, QuoteBlock.tsx

Right: SmartText.tsx (Accepts variant="heading" | "paragraph" | "quote")

3.3 State Management
Global State: Use Zustand.

Server State: Use React Query (via trpc or direct actions).

Form State: Use React Hook Form + Zod.

FORBIDDEN: Redux, Context API for complex state, "Prop Drilling" (max 2 levels).

4. SECURITY & DATA INTEGRITY
4.1 The "Glass Box" AI Rule
Every AI decision (recommendation, grade, feedback) must generate a Trace Log.

Requirement: When Vertex AI suggests a move, record the prompt, confidence_score, and rationale in Firestore.

User Interface: The user must always be able to click "Why did I see this?" (The Glass Box).

4.2 Multi-Tenant Isolation
Firestore Rules: All writes must be scoped to tenants/{tenantId}.

Validation: Every API route must verify the tenantId in the session cookie before processing data.

4.3 xAPI Telemetry
Format: xAPI 1.0.3 Spec.

Enforcement: All interactions must use the StatementBuilder from @inspire/xapi-client. Manual JSON construction is forbidden to prevent dirty data.

5. GIT & DEPLOYMENT WORKFLOW
5.1 Commit Protocol
Format: Conventional Commits (feat:, fix:, chore:, refactor:).

Pre-Commit Hooks: Husky will run pnpm typecheck and pnpm lint.

Bypass Rule: NEVER use --no-verify. If you cannot commit, your code is broken. Fix it.

5.2 Branching Strategy
main: Production-ready code. Auto-deploys to Production.

develop: Integration branch. Auto-deploys to Staging.

feat/name: Feature branches.

claude/name: Branches created by AI agents.

6. AI AGENT PROTOCOLS (For Claude/Gemini)
When acting as an autonomous developer, you MUST:

Read the Docs First: Before writing code, ingest docs/INSPIRE_Studio_Phased_Build_Instructions.md.

Files over Assumptions: Do not assume a file exists. Check the file tree.

Golden Thread Check: Before creating a new type, check packages/types to see if it already exists.

Incremental Safety: When refactoring, verify the build (pnpm build) after every major change. Do not write 50 files and then check if they compile.

FAILURE TO ADHERE TO THESE STANDARDS WILL RESULT IN CODE REJECTION. We are building the future of adaptive learning. Excellence is our baseline.