# PNPM MONOREPO MIGRATION & FULL STACK UPDATE

**Claude VS Code Mega-Refactor Prompt**

---

## IMPORTANT CONTEXT NOTE

> ⚠️ **This prompt supersedes the previous `--legacy-peer-deps` npm instructions.**
> 
> We are intentionally migrating FROM npm TO pnpm for better dependency management,
> stricter version resolution, and true monorepo support with workspaces.

---

## CLAUDE VS CODE PROMPT

Copy the entire block below and paste into Claude VS Code:

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | MEGA-REFACTOR: PNPM MONOREPO MIGRATION
                   Full Stack Update & Route Reconciliation
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude Code - Architect Mode
BRANCH: claude/pnpm-monorepo-migration-[random-4-chars]
REPO: lxd360-ecosystem
ESTIMATED SESSIONS: 8-12 (this is a major migration)
RISK LEVEL: HIGH - Create full backup before starting

═══════════════════════════════════════════════════════════════════════════════
                         MISSION CRITICAL WARNING
═══════════════════════════════════════════════════════════════════════════════

This migration will:
1. Convert from npm to pnpm
2. Restructure into a true monorepo with workspaces
3. Update ALL dependencies to latest stable versions
4. Ensure ALL routes are connected and functional
5. Verify ALL UI component libraries are installed

BEFORE STARTING:
1. Ensure all work is committed and pushed
2. Create a backup branch: git checkout -b backup/pre-monorepo-migration
3. Push the backup: git push origin backup/pre-monorepo-migration
4. Return to main: git checkout main
5. Create migration branch: git checkout -b claude/pnpm-monorepo-migration-XXXX

═══════════════════════════════════════════════════════════════════════════════
                         MANDATORY FIRST STEPS
═══════════════════════════════════════════════════════════════════════════════

STEP 0: AUDIT CURRENT STATE

Run these commands and document the output:

# Current Node version (must be 20.x or higher for pnpm 9)
node --version

# Current npm version
npm --version

# Document current package.json dependencies
cat package.json | grep -A 1000 '"dependencies"' | head -100

# List all route files
find app -name "page.tsx" -o -name "route.ts" | sort

# Check for any existing workspaces config
cat package.json | grep -A 10 '"workspaces"'

# Count total TypeScript errors currently
npx tsc --noEmit 2>&1 | tail -5

# Count total lint errors currently  
npm run lint 2>&1 | tail -10

Document all findings before proceeding.

═══════════════════════════════════════════════════════════════════════════════
                              YOUR MISSION
═══════════════════════════════════════════════════════════════════════════════

PHASE 1: Install pnpm and Initialize Monorepo Structure
PHASE 2: Create Workspace Package Architecture  
PHASE 3: Migrate Dependencies with Version Updates
PHASE 4: Update All Frameworks to Latest Stable
PHASE 5: Reconcile and Verify All Routes
PHASE 6: Update UI Component Libraries
PHASE 7: Fix All TypeScript and Lint Errors
PHASE 8: Verify Build and Test Suite
PHASE 9: Update CI/CD for pnpm

═══════════════════════════════════════════════════════════════════════════════
                    PHASE 1: PNPM INSTALLATION & SETUP
═══════════════════════════════════════════════════════════════════════════════

# Install pnpm globally (use corepack for version management)
corepack enable
corepack prepare pnpm@latest --activate

# Verify installation
pnpm --version

# Create pnpm-workspace.yaml in repo root
# This defines the monorepo structure

Create file: pnpm-workspace.yaml
```yaml
packages:
  # Main applications
  - 'apps/*'
  # Shared packages
  - 'packages/*'
  # Internal tooling
  - 'tooling/*'
```

# Create .npmrc for pnpm configuration
Create file: .npmrc
```ini
# Hoist dependencies for compatibility
shamefully-hoist=true

# Use strict peer dependencies (unlike npm legacy-peer-deps)
strict-peer-dependencies=false
auto-install-peers=true

# Performance optimizations
prefer-frozen-lockfile=true

# Store location (optional, for CI caching)
store-dir=.pnpm-store

# Registry (default npm)
registry=https://registry.npmjs.org/
```

═══════════════════════════════════════════════════════════════════════════════
                    PHASE 2: WORKSPACE PACKAGE ARCHITECTURE
═══════════════════════════════════════════════════════════════════════════════

TARGET MONOREPO STRUCTURE:

lxd360-ecosystem/
├── apps/
│   ├── web/                      # Main Next.js application (lxp360.com)
│   │   ├── app/                  # App Router pages
│   │   ├── components/           # App-specific components
│   │   ├── lib/                  # App-specific utilities
│   │   ├── public/               # Static assets
│   │   ├── next.config.ts
│   │   ├── package.json          # App-specific deps
│   │   └── tsconfig.json
│   │
│   ├── studio/                   # INSPIRE Studio (if separate app)
│   │   └── ... (optional - can be route in web)
│   │
│   └── docs/                     # Documentation site (optional)
│       └── ...
│
├── packages/
│   ├── ui/                       # Shared UI components (shadcn/ui + custom)
│   │   ├── src/
│   │   │   ├── components/       # All shadcn and custom components
│   │   │   ├── hooks/            # Shared hooks
│   │   │   └── index.ts          # Barrel exports
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── config/                   # Shared configs (eslint, tsconfig, tailwind)
│   │   ├── eslint/
│   │   ├── typescript/
│   │   ├── tailwind/
│   │   └── package.json
│   │
│   ├── database/                 # Database schemas, clients, migrations
│   │   ├── src/
│   │   │   ├── firebase/         # Firebase Admin SDK setup
│   │   │   ├── firestore/        # Firestore schemas & queries
│   │   │   ├── bigquery/         # BigQuery schemas & queries
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── auth/                     # Authentication utilities
│   │   ├── src/
│   │   │   ├── firebase-auth/    # Firebase Auth wrappers
│   │   │   ├── rbac/             # Role-based access control
│   │   │   ├── middleware/       # Auth middleware
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── xapi/                     # xAPI/LRS utilities
│   │   ├── src/
│   │   │   ├── client/           # xAPI statement builder
│   │   │   ├── verbs/            # Verb vocabulary
│   │   │   ├── pipeline/         # BigQuery pipeline
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── inspire/                  # INSPIRE methodology schemas & logic
│   │   ├── src/
│   │   │   ├── schemas/          # Zod schemas
│   │   │   ├── store/            # Zustand stores
│   │   │   ├── constants/        # INSPIRE constants
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── utils/                    # Shared utilities
│       ├── src/
│       │   ├── cn.ts             # Class name utility
│       │   ├── date.ts           # Date utilities
│       │   ├── format.ts         # Formatting utilities
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── tooling/
│   ├── eslint-config/            # Shared ESLint config
│   ├── typescript-config/        # Shared TSConfig
│   └── tailwind-config/          # Shared Tailwind config
│
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── package.json                  # Root package.json (scripts only)
├── turbo.json                    # Turborepo config (optional but recommended)
├── .npmrc
└── tsconfig.json                 # Root tsconfig with references

═══════════════════════════════════════════════════════════════════════════════
                    PHASE 3: ROOT PACKAGE.JSON SETUP
═══════════════════════════════════════════════════════════════════════════════

Create the ROOT package.json (workspaces scripts only, no dependencies):

```json
{
  "name": "lxd360-ecosystem",
  "version": "0.0.0",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  },
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "lint:fix": "turbo lint:fix",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "test:e2e": "turbo test:e2e",
    "clean": "turbo clean && rm -rf node_modules",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "prepare": "husky"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.0",
    "husky": "^9.1.0",
    "lint-staged": "^15.2.0",
    "prettier": "^3.4.0",
    "turbo": "^2.3.0"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

═══════════════════════════════════════════════════════════════════════════════
                    PHASE 4: LATEST STABLE VERSION TARGETS
═══════════════════════════════════════════════════════════════════════════════

UPDATE ALL DEPENDENCIES TO THESE VERSIONS (as of January 2026):

CORE FRAMEWORK:
- next: ^15.1.0                   # Next.js 15 (App Router, RSC, Turbopack)
- react: ^19.0.0                  # React 19
- react-dom: ^19.0.0              # React DOM 19
- typescript: ^5.7.0              # TypeScript 5.7+

STYLING:
- tailwindcss: ^4.0.0             # Tailwind CSS v4 (CSS-first)
- @tailwindcss/postcss: ^4.0.0    # Tailwind PostCSS plugin v4

UI COMPONENTS (shadcn/ui ecosystem):
- @radix-ui/react-*: latest       # All Radix primitives
- class-variance-authority: ^0.7.0
- clsx: ^2.1.0
- tailwind-merge: ^2.6.0
- lucide-react: ^0.469.0

FORMS & VALIDATION:
- react-hook-form: ^7.54.0
- @hookform/resolvers: ^3.9.0
- zod: ^3.24.0

STATE MANAGEMENT:
- zustand: ^5.0.0                 # Zustand 5
- zundo: ^2.3.0                   # Undo/redo middleware

DATABASE & BACKEND:
- firebase: ^11.1.0               # Firebase JS SDK
- firebase-admin: ^13.0.0         # Firebase Admin SDK
- @google-cloud/bigquery: ^7.9.0
- @google-cloud/pubsub: ^4.9.0
- @google-cloud/storage: ^7.14.0

AI/ML:
- @google-cloud/vertexai: ^1.9.0
- @google-cloud/aiplatform: ^3.31.0

PAYMENTS & EMAIL:
- stripe: ^17.4.0
- @stripe/stripe-js: ^5.3.0
- resend: ^4.0.0
- @react-email/components: ^0.0.31

3D/XR:
- three: ^0.171.0
- @react-three/fiber: ^8.17.0
- @react-three/drei: ^9.117.0
- @react-three/xr: ^6.4.0

DATA VISUALIZATION:
- recharts: ^2.14.0
- @tanstack/react-table: ^8.20.0

UTILITIES:
- date-fns: ^4.1.0
- nanoid: ^5.0.0
- lodash-es: ^4.17.21
- @tanstack/react-query: ^5.62.0

TESTING:
- vitest: ^2.1.0
- @testing-library/react: ^16.1.0
- @playwright/test: ^1.49.0
- @vitest/coverage-v8: ^2.1.0

DEV TOOLS:
- eslint: ^9.17.0                 # ESLint 9 (flat config)
- @typescript-eslint/eslint-plugin: ^8.18.0
- @typescript-eslint/parser: ^8.18.0
- eslint-plugin-react: ^7.37.0
- eslint-plugin-react-hooks: ^5.1.0
- eslint-config-next: ^15.1.0
- prettier: ^3.4.0
- prettier-plugin-tailwindcss: ^0.6.0

MONOREPO TOOLING:
- turbo: ^2.3.0
- @changesets/cli: ^2.27.0

═══════════════════════════════════════════════════════════════════════════════
                    PHASE 5: APPS/WEB PACKAGE.JSON
═══════════════════════════════════════════════════════════════════════════════

Create apps/web/package.json:

```json
{
  "name": "@lxd360/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@lxd360/ui": "workspace:*",
    "@lxd360/database": "workspace:*",
    "@lxd360/auth": "workspace:*",
    "@lxd360/xapi": "workspace:*",
    "@lxd360/inspire": "workspace:*",
    "@lxd360/utils": "workspace:*",
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@lxd360/eslint-config": "workspace:*",
    "@lxd360/typescript-config": "workspace:*",
    "@lxd360/tailwind-config": "workspace:*",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.7.0"
  }
}
```

═══════════════════════════════════════════════════════════════════════════════
                    PHASE 6: PACKAGES/UI SETUP (shadcn/ui)
═══════════════════════════════════════════════════════════════════════════════

Create packages/ui/package.json:

```json
{
  "name": "@lxd360/ui",
  "version": "0.1.0",
  "private": true,
  "sideEffects": false,
  "exports": {
    ".": "./src/index.ts",
    "./components/*": "./src/components/*.tsx",
    "./hooks/*": "./src/hooks/*.ts"
  },
  "scripts": {
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-alert-dialog": "^1.1.0",
    "@radix-ui/react-aspect-ratio": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-checkbox": "^1.1.0",
    "@radix-ui/react-collapsible": "^1.1.0",
    "@radix-ui/react-context-menu": "^2.2.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-hover-card": "^1.1.0",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-menubar": "^1.1.0",
    "@radix-ui/react-navigation-menu": "^1.2.0",
    "@radix-ui/react-popover": "^1.1.0",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.0",
    "@radix-ui/react-scroll-area": "^1.2.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slider": "^1.2.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.0",
    "@radix-ui/react-toggle": "^1.1.0",
    "@radix-ui/react-toggle-group": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "cmdk": "^1.0.0",
    "lucide-react": "^0.469.0",
    "tailwind-merge": "^2.6.0",
    "react-day-picker": "^9.4.0",
    "sonner": "^1.7.0",
    "vaul": "^1.1.0"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@lxd360/typescript-config": "workspace:*",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.7.0"
  }
}
```

Re-run shadcn/ui initialization with pnpm after setup:

```bash
cd apps/web
pnpm dlx shadcn@latest init
```

Then add all components:

```bash
pnpm dlx shadcn@latest add --all
```

═══════════════════════════════════════════════════════════════════════════════
                    PHASE 7: ROUTE RECONCILIATION CHECKLIST
═══════════════════════════════════════════════════════════════════════════════

VERIFY ALL ROUTES FROM THE APPROVED ARCHITECTURE:

apps/web/app/
├── (auth)/                     # Authentication flows
│   ├── login/page.tsx                    ☐ Exists ☐ Connected ☐ Works
│   ├── sign-up/page.tsx                  ☐ Exists ☐ Connected ☐ Works
│   ├── forgot-password/page.tsx          ☐ Exists ☐ Connected ☐ Works
│   ├── verify-email/page.tsx             ☐ Exists ☐ Connected ☐ Works
│   └── callback/page.tsx                 ☐ Exists ☐ Connected ☐ Works
│
├── (public)/                   # Marketing & public pages
│   ├── page.tsx                          ☐ Exists ☐ Connected ☐ Works (Homepage)
│   ├── pricing/page.tsx                  ☐ Exists ☐ Connected ☐ Works
│   ├── blog/page.tsx                     ☐ Exists ☐ Connected ☐ Works
│   ├── podcast/page.tsx                  ☐ Exists ☐ Connected ☐ Works
│   ├── swag/page.tsx                     ☐ Exists ☐ Connected ☐ Works
│   ├── contact/page.tsx                  ☐ Exists ☐ Connected ☐ Works
│   ├── privacy/page.tsx                  ☐ Exists ☐ Connected ☐ Works
│   ├── terms/page.tsx                    ☐ Exists ☐ Connected ☐ Works
│   └── products/
│       ├── inspire-studio/page.tsx       ☐ Exists ☐ Connected ☐ Works
│       ├── ignite/page.tsx               ☐ Exists ☐ Connected ☐ Works
│       └── ecosystem/page.tsx            ☐ Exists ☐ Connected ☐ Works
│
├── (internal)/                 # Staff-only tools
│   └── command-center/
│       ├── dashboard/page.tsx            ☐ Exists ☐ Connected ☐ Works
│       ├── admin/
│       │   ├── users/page.tsx            ☐ Exists ☐ Connected ☐ Works
│       │   ├── roles/page.tsx            ☐ Exists ☐ Connected ☐ Works
│       │   └── tenants/page.tsx          ☐ Exists ☐ Connected ☐ Works
│       └── analytics/page.tsx            ☐ Exists ☐ Connected ☐ Works
│
├── (tenant)/                   # SaaS customer workspaces
│   ├── dashboard/page.tsx                ☐ Exists ☐ Connected ☐ Works
│   │
│   ├── inspire-studio/         # Authoring Tool
│   │   ├── dashboard/page.tsx            ☐ Exists ☐ Connected ☐ Works
│   │   ├── projects/page.tsx             ☐ Exists ☐ Connected ☐ Works
│   │   ├── inspire/                      # INSPIRE Workflow
│   │   │   └── [...encoding phases...]   ☐ Exists ☐ Connected ☐ Works
│   │   ├── course-builder/page.tsx       ☐ Exists ☐ Connected ☐ Works
│   │   ├── storyboard/
│   │   │   ├── course/page.tsx           ☐ Exists ☐ Connected ☐ Works
│   │   │   └── micro/page.tsx            ☐ Exists ☐ Connected ☐ Works
│   │   ├── media-tools/page.tsx          ☐ Exists ☐ Connected ☐ Works
│   │   └── settings/page.tsx             ☐ Exists ☐ Connected ☐ Works
│   │
│   ├── ignite/                 # Learning Platform
│   │   ├── dashboard/page.tsx            ☐ Exists ☐ Connected ☐ Works
│   │   ├── learn/
│   │   │   ├── my-learning/page.tsx      ☐ Exists ☐ Connected ☐ Works
│   │   │   ├── player/[courseId]/page.tsx ☐ Exists ☐ Connected ☐ Works
│   │   │   └── progress/page.tsx         ☐ Exists ☐ Connected ☐ Works
│   │   ├── teach/
│   │   │   ├── courses/page.tsx          ☐ Exists ☐ Connected ☐ Works
│   │   │   ├── gradebook/page.tsx        ☐ Exists ☐ Connected ☐ Works
│   │   │   └── analytics/page.tsx        ☐ Exists ☐ Connected ☐ Works
│   │   ├── manage/
│   │   │   ├── users/page.tsx            ☐ Exists ☐ Connected ☐ Works
│   │   │   ├── compliance/page.tsx       ☐ Exists ☐ Connected ☐ Works
│   │   │   └── reports/page.tsx          ☐ Exists ☐ Connected ☐ Works
│   │   └── lrs/
│   │       ├── statements/page.tsx       ☐ Exists ☐ Connected ☐ Works
│   │       ├── reports/page.tsx          ☐ Exists ☐ Connected ☐ Works
│   │       └── integrations/page.tsx     ☐ Exists ☐ Connected ☐ Works
│   │
│   └── settings/               # Tenant settings
│       ├── organization/page.tsx         ☐ Exists ☐ Connected ☐ Works
│       ├── billing/page.tsx              ☐ Exists ☐ Connected ☐ Works
│       ├── integrations/page.tsx         ☐ Exists ☐ Connected ☐ Works
│       └── branding/page.tsx             ☐ Exists ☐ Connected ☐ Works
│
└── api/                        # API routes
    ├── auth/
    │   └── [...nextauth]/route.ts        ☐ Exists ☐ Connected ☐ Works
    ├── xapi/
    │   ├── statements/route.ts           ☐ Exists ☐ Connected ☐ Works
    │   └── state/route.ts                ☐ Exists ☐ Connected ☐ Works
    ├── webhooks/
    │   └── stripe/route.ts               ☐ Exists ☐ Connected ☐ Works
    └── ai/
        ├── recommend/route.ts            ☐ Exists ☐ Connected ☐ Works
        └── explain/route.ts              ☐ Exists ☐ Connected ☐ Works

FOR EACH ROUTE:
1. Verify file exists
2. Verify imports resolve (no broken imports)
3. Verify component renders without error
4. Verify layout inheritance works
5. Verify middleware/auth gates work
6. Verify navigation links point correctly

═══════════════════════════════════════════════════════════════════════════════
                    PHASE 8: TURBO.JSON CONFIGURATION
═══════════════════════════════════════════════════════════════════════════════

Create turbo.json in repo root:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "globalEnv": [
    "NODE_ENV",
    "NEXT_PUBLIC_*",
    "FIREBASE_*",
    "GCP_*",
    "STRIPE_*"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"],
      "outputs": []
    },
    "lint:fix": {
      "dependsOn": ["^lint:fix"],
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^typecheck"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:e2e": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

═══════════════════════════════════════════════════════════════════════════════
                    PHASE 9: MIGRATION EXECUTION STEPS
═══════════════════════════════════════════════════════════════════════════════

Execute in this exact order:

STEP 1: Clean existing installation
```bash
# Remove old node_modules and lock files
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml
```

STEP 2: Create directory structure
```bash
mkdir -p apps/web
mkdir -p packages/{ui,config,database,auth,xapi,inspire,utils}
mkdir -p tooling/{eslint-config,typescript-config,tailwind-config}
```

STEP 3: Move existing app files to apps/web/
```bash
# Move all current app files to apps/web/
mv app apps/web/
mv components apps/web/
mv lib apps/web/
mv public apps/web/
mv styles apps/web/
mv next.config.* apps/web/
mv tsconfig.json apps/web/
mv tailwind.config.* apps/web/
mv postcss.config.* apps/web/
```

STEP 4: Create all package.json files
# (Use the templates provided above)

STEP 5: Install dependencies
```bash
# From repo root
pnpm install
```

STEP 6: Update imports throughout codebase
# Replace relative imports with workspace packages:
# BEFORE: import { Button } from "@/components/ui/button"
# AFTER:  import { Button } from "@lxd360/ui"

STEP 7: Run type checking
```bash
pnpm typecheck
```

STEP 8: Run linting
```bash
pnpm lint
```

STEP 9: Fix all errors
# Iterate until 0 errors

STEP 10: Test build
```bash
pnpm build
```

STEP 11: Test dev server
```bash
pnpm dev
```

STEP 12: Run test suite
```bash
pnpm test
```

═══════════════════════════════════════════════════════════════════════════════
                    PHASE 10: CI/CD UPDATES (GitHub Actions)
═══════════════════════════════════════════════════════════════════════════════

Update .github/workflows/ci.yml:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type Check
        run: pnpm typecheck

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build

  e2e:
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Build
        run: pnpm build

      - name: Run E2E Tests
        run: pnpm test:e2e
```

═══════════════════════════════════════════════════════════════════════════════
                              CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

CRITICAL RULES:

1. ONLY use pnpm commands from this point forward:
   - pnpm install (NOT npm install)
   - pnpm add <package> (NOT npm install <package>)
   - pnpm remove <package> (NOT npm uninstall)
   - pnpm dlx <command> (NOT npx)

2. ALL workspace packages must be referenced as:
   - "workspace:*" (for internal packages)
   - NOT file:../path or relative paths

3. ALL imports from shared packages must use package names:
   - import { x } from "@lxd360/ui"
   - NOT import { x } from "../../packages/ui/src"

4. NEVER commit node_modules (already in .gitignore)

5. ALWAYS commit pnpm-lock.yaml

6. TypeScript errors: 0
7. Lint errors: 0
8. Build must succeed
9. All tests must pass

═══════════════════════════════════════════════════════════════════════════════
                             DELIVERABLES
═══════════════════════════════════════════════════════════════════════════════

- [ ] Branch: claude/pnpm-monorepo-migration-XXXX
- [ ] pnpm installed and configured
- [ ] pnpm-workspace.yaml created
- [ ] turbo.json configured
- [ ] All packages created with package.json
- [ ] All dependencies at latest stable versions
- [ ] All code moved to apps/web/
- [ ] All imports updated to workspace packages
- [ ] shadcn/ui re-initialized in monorepo
- [ ] All routes verified and working
- [ ] TypeScript: 0 errors
- [ ] Lint: 0 errors
- [ ] Build: SUCCESS
- [ ] Dev server: WORKS
- [ ] Tests: PASSING
- [ ] CI/CD updated for pnpm
- [ ] Documentation updated

═══════════════════════════════════════════════════════════════════════════════
                          SESSION HANDOFF TEMPLATE
═══════════════════════════════════════════════════════════════════════════════

## Session Handoff — [Date]

### Migration Progress
| Phase | Status | Notes |
|-------|--------|-------|
| 1. pnpm Setup | ☐/✅ | |
| 2. Workspace Structure | ☐/✅ | |
| 3. Dependencies | ☐/✅ | |
| 4. Version Updates | ☐/✅ | |
| 5. Route Reconciliation | ☐/✅ | |
| 6. UI Components | ☐/✅ | |
| 7. Error Fixes | ☐/✅ | |
| 8. Build Verification | ☐/✅ | |
| 9. CI/CD Updates | ☐/✅ | |

### Current Status
- TypeScript errors: [count]
- Lint errors: [count]
- Build status: [passing/failing]
- Test status: [passing/failing]

### Completed Work
- [ ] Files created/modified
- [ ] Commits made

### Next Steps
1. [Specific next action]
2. [Specific next action]

### Blockers
- [Any blocking issues]

═══════════════════════════════════════════════════════════════════════════════
```

---

## POST-MIGRATION NOTES

After successful migration:

1. **Update all documentation** to reference pnpm commands
2. **Update CLAUDE.md** to reflect new monorepo structure
3. **Update Linear tickets** and project instructions
4. **Inform any team members** of the package manager change
5. **Update any deployment scripts** (Cloud Run, etc.)

### Quick Reference Commands (Post-Migration)

```bash
# Install all dependencies
pnpm install

# Add a dependency to a specific workspace
pnpm add <package> --filter @lxd360/web

# Add a dev dependency to root
pnpm add -D <package> -w

# Run command in specific workspace
pnpm --filter @lxd360/web dev

# Run command in all workspaces
pnpm -r run build

# Update all dependencies
pnpm update -r

# Check for outdated packages
pnpm outdated -r
```
