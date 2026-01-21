# LXD360 Ecosystem - Repository Structure

> Monorepo architecture using pnpm workspaces + Turborepo

```
lxd360-ecosystem/
│
├── .claude/                          # Claude Code configuration
│   ├── settings.json
│   ├── settings.local.json
│   └── commands/                     # Custom slash commands
│
├── .github/                          # GitHub configuration
│   ├── CODEOWNERS
│   ├── dependabot.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── SECURITY.md
│   ├── ISSUE_TEMPLATE/
│   └── workflows/                    # CI/CD workflows
│
├── .vscode/                          # VS Code settings
│   ├── mcp.json
│   └── settings.json
│
├── .husky/                           # Git hooks
├── .trunk/                           # Trunk check configuration
├── .turbo/                           # Turborepo cache
│
├── apps/
│   └── web/                          # @lxd360/web - Next.js 15 App
│       ├── app/                      # Next.js App Router
│       │   ├── 00-lxd360-auth/       # Authentication module
│       │   ├── 01-lxd360-llc/        # LLC/Company module
│       │   ├── 02-lxd360-inspire-studio/      # INSPIRE Studio
│       │   ├── 03-lxd360-inspire-ignite/      # INSPIRE Ignite (LMS)
│       │   │   ├── dashboard/
│       │   │   ├── learn/
│       │   │   ├── learner/
│       │   │   ├── lrs/              # Learning Record Store
│       │   │   │   ├── activity/
│       │   │   │   ├── analytics/
│       │   │   │   ├── dashboard/
│       │   │   │   ├── pipeline/
│       │   │   │   ├── settings/
│       │   │   │   └── statements/
│       │   │   ├── manage/
│       │   │   └── teach/
│       │   ├── 04-lxd360-inspire-cognitive/   # Cognitive Learning
│       │   ├── 05-lxd360-inspire-cortex/      # AI/ML Cortex
│       │   ├── 06-lxd360-inspire-media-center/
│       │   ├── 07-lxd360-inspire-lxd-nexus/   # Integration Hub
│       │   ├── 08-lxd360-neuro-strategy/
│       │   ├── 09-lxd360-kinetix-gear/
│       │   ├── 10-lxd360-coming-soon/
│       │   ├── 11-lxd360-maintenance/
│       │   ├── api/                  # API routes
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       │
│       ├── components/               # React Components
│       │   ├── accessibility/
│       │   ├── adaptive-learning/
│       │   ├── admin/
│       │   ├── ai/
│       │   ├── analytics/
│       │   ├── animate-ui/
│       │   ├── animations/
│       │   ├── authoring/
│       │   ├── basic-player/
│       │   ├── billing/
│       │   ├── blocks/
│       │   ├── branding/
│       │   ├── coming-soon/
│       │   ├── content-blocks/
│       │   ├── dashboard/
│       │   ├── error/
│       │   ├── examples/
│       │   ├── gdpr/
│       │   ├── icons/
│       │   ├── ignite/
│       │   ├── inspire/
│       │   │   ├── accessibility/
│       │   │   ├── assessment/
│       │   │   ├── cognitive/
│       │   │   ├── course-creation/
│       │   │   ├── tools/
│       │   │   └── wizard/
│       │   ├── inspire-ignite/
│       │   ├── inspire-studio/
│       │   ├── internal/
│       │   ├── layout/
│       │   ├── learning/
│       │   ├── library/
│       │   ├── limeplay/
│       │   ├── linear-player/
│       │   ├── lms/
│       │   ├── marketing/
│       │   ├── media-library/
│       │   ├── monitoring/
│       │   ├── motion-primitives/
│       │   ├── nexus/
│       │   ├── player/
│       │   ├── podcast/
│       │   ├── pricing/
│       │   ├── rbac/
│       │   ├── ribbon/
│       │   ├── seo/
│       │   ├── shared/
│       │   ├── status/
│       │   ├── studio/
│       │   ├── tenant/
│       │   └── ui/                   # shadcn/ui components
│       │
│       ├── hooks/                    # Custom React hooks
│       │
│       ├── lib/                      # Utilities & Services
│       │   ├── accessibility/
│       │   ├── actions/              # Server actions
│       │   ├── adaptive-learning/
│       │   ├── admin/
│       │   ├── agents/
│       │   ├── ai/
│       │   ├── analytics/
│       │   ├── assets/
│       │   ├── auth/
│       │   ├── billing/
│       │   ├── branding/
│       │   ├── cache/
│       │   ├── cloud-tasks/
│       │   ├── cognitive-load/
│       │   ├── config/
│       │   ├── constants/
│       │   ├── content/
│       │   ├── core/
│       │   ├── crm/
│       │   ├── email/
│       │   ├── errors/
│       │   ├── export/
│       │   ├── features/
│       │   ├── firebase/
│       │   ├── firestore/
│       │   ├── fonts/
│       │   ├── google/
│       │   ├── hooks/
│       │   ├── inspire/
│       │   │   ├── ai/
│       │   │   ├── config/
│       │   │   ├── constants/
│       │   │   ├── engine/
│       │   │   ├── publishing/
│       │   │   └── types/
│       │   ├── inspire-ignite/
│       │   │   ├── block-schema/
│       │   │   ├── client/
│       │   │   ├── cognitive-load/
│       │   │   ├── mastery/
│       │   │   └── types/
│       │   ├── inspire-studio/
│       │   ├── integrations/
│       │   ├── media/
│       │   ├── mock-data/
│       │   ├── monitoring/
│       │   ├── notifications/
│       │   ├── performance/
│       │   ├── pricing/
│       │   ├── publishing/
│       │   ├── rbac/
│       │   ├── seo/
│       │   ├── services/
│       │   ├── storage/
│       │   ├── stripe/
│       │   ├── studio/
│       │   ├── threejs/
│       │   ├── tts/
│       │   ├── types/
│       │   └── xapi/
│       │
│       ├── providers/                # React context providers
│       ├── public/                   # Static assets
│       ├── schemas/                  # Validation schemas
│       ├── store/                    # State management
│       ├── styles/                   # Global styles
│       ├── types/                    # TypeScript definitions
│       ├── emails/                   # Email templates
│       │
│       ├── middleware.ts
│       ├── next.config.mjs
│       ├── package.json
│       ├── postcss.config.mjs
│       ├── tsconfig.json
│       └── components.json           # shadcn/ui config
│
├── packages/                         # Shared packages
│   ├── ui/                           # @lxd360/ui - Shared UI
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── utils.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── types/                        # @lxd360/types - Shared types
│   │   ├── src/
│   │   │   ├── bigquery/
│   │   │   ├── constants/
│   │   │   ├── firestore/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ml/                           # @lxd360/ml - ML algorithms
│   │   ├── src/
│   │   │   ├── bkt/                  # Bayesian Knowledge Tracing
│   │   │   ├── sm2/                  # SM-2 Spaced Repetition
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── xapi-client/                  # @lxd360/xapi-client - LRS client
│       ├── src/
│       │   ├── builder/
│       │   ├── recipes/
│       │   ├── schemas/
│       │   ├── validator/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── docs/                             # Documentation
│   ├── ai/
│   ├── audits/
│   ├── disaster-recovery/
│   ├── evidence/
│   ├── policies/
│   └── INSPIRE_Standards_Guardrails.md
│
├── functions/                        # Cloud Functions
│   ├── process-statement/
│   └── xapi-to-bigquery/
│
├── infrastructure/                   # Infrastructure as Code
│   └── terraform/
│
├── scripts/                          # Build & utility scripts
│   ├── dns/
│   ├── security/
│   ├── adaptive-learning-test.ts
│   ├── analyze-bundle.ts
│   ├── continuity-audit.ts
│   ├── inspire-continuity-audit.ts
│   ├── seed-users.ts
│   ├── setup-cloud-tasks.sh
│   ├── validate-course-flow.ts
│   ├── verify-env.ts
│   ├── verify-marketing-routes.ts
│   ├── verify-production.ts
│   ├── wcag-audit.sh
│   └── wcag-contrast-checker.js
│
├── sql/                              # SQL/BigQuery queries
│   └── bigquery/
│
├── tests/                            # Test suites
│   ├── accessibility/
│   ├── e2e/
│   ├── integration/
│   ├── mocks/
│   ├── utils/
│   ├── global-setup.ts
│   ├── global-teardown.ts
│   └── setup.ts
│
├── terraform/                        # Root Terraform (GCP)
│   ├── backend.tf
│   ├── main.tf
│   ├── outputs.tf
│   ├── storage.tf
│   ├── terraform.tfvars
│   └── variables.tf
│
├── .env.example
├── .firebaserc
├── .gitignore
├── .lintstagedrc.js
├── .npmrc
├── biome.json                        # Linting config
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── LICENSE
├── org-policy.yaml
├── package.json                      # Root package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml               # Workspace config
├── playwright.config.ts
├── README.md
├── SECURITY.md
├── storage.rules
├── turbo.json                        # Turborepo config
└── vitest.config.mts
```

## Potential Consolidation Opportunities

### 1. Duplicate Terraform Locations
- `terraform/` (root level)
- `infrastructure/terraform/`

**Recommendation:** Consolidate into single `infrastructure/` or `terraform/` directory

### 2. Component Overlap in `apps/web/components/`
- `inspire/` vs `inspire-studio/` vs `inspire-ignite/`
- `ui/` (shadcn) - could be moved to `packages/ui`

### 3. Lib Duplication in `apps/web/lib/`
- `inspire/` vs `inspire-studio/` vs `inspire-ignite/`
- `types/` exists in both `apps/web/lib/types/` and `packages/types/`

### 4. Consider Moving to Packages
- `apps/web/lib/xapi/` → merge with `packages/xapi-client/`
- `apps/web/lib/ml/` (if exists) → `packages/ml/`
- `apps/web/components/ui/` → `packages/ui/`

### 5. Scripts & Tests
- `scripts/` at root level ✓ (correct location)
- `tests/` at root level ✓ (correct location)
