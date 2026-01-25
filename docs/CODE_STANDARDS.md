# CODE_STANDARDS.md — LXD360 Engineering Governance

**Version:** 1.0
**Effective Date:** January 25, 2026
**Classification:** Mandatory Compliance
**Approved By:** Principal Code Auditor

---

> **This document is the absolute source of truth for all development on the LXD360 Ecosystem.**
> Violations require immediate remediation. No exceptions without Principal approval.

---

## Table of Contents

1. [Type Safety Standards](#1-type-safety-standards)
2. [Linter Compliance](#2-linter-compliance)
3. [Code Quality Rules](#3-code-quality-rules)
4. [Interface & Type Definitions](#4-interface--type-definitions)
5. [Security Standards](#5-security-standards)
6. [Exception Request Process](#6-exception-request-process)

---

## 1. Type Safety Standards

### 1.1 Forbidden Patterns

The following patterns are **BANNED** without Principal approval:

```typescript
// ❌ FORBIDDEN - The `any` type
const data: any = something;
function process(input: any): any { }
const value = something as any;

// ❌ FORBIDDEN - Type assertions to bypass safety
const user = data as unknown as User;
(window as any).customProperty = value;

// ❌ FORBIDDEN - Implicit any
function process(data) { }  // Missing type annotation
const items = [];           // Inferred as any[]
```

### 1.2 Required Patterns

```typescript
// ✅ REQUIRED - Use `unknown` for truly unknown types
const data: unknown = parseJson(input);
if (isUser(data)) {
  // Now safely typed as User
}

// ✅ REQUIRED - Define explicit interfaces
interface ApiResponse {
  data: User[];
  meta: PaginationMeta;
}

// ✅ REQUIRED - Use type guards for runtime checks
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value;
}

// ✅ REQUIRED - Initialize arrays with explicit types
const items: User[] = [];
const map = new Map<string, User>();
```

### 1.3 Approved Exceptions

The `any` type is permitted ONLY in:

1. **Third-party library type declarations** (`.d.ts` files)
2. **Migration shims** (temporary, with ticket reference)
3. **Test mocks** (test files only)

Each exception MUST include:
- A `biome-ignore` comment with justification
- A TODO with ticket reference for removal

---

## 2. Linter Compliance

### 2.1 Biome Configuration

This project uses **Biome** for linting. Configuration: `biome.json`

### 2.2 Forbidden Suppressions

The following are **BANNED** without Principal approval:

```typescript
// ❌ FORBIDDEN
// biome-ignore lint/suspicious/noExplicitAny
// eslint-disable
// eslint-disable-next-line
// @ts-ignore
// @ts-expect-error
// @ts-nocheck
```

### 2.3 Approved Suppression Categories

Suppressions are permitted for these specific scenarios:

| Rule | Permitted Scenario | Required Justification |
|------|--------------------|------------------------|
| `lint/a11y/useSemanticElements` | ContentEditable rich text fields | "contentEditable requires div with role='textbox'" |
| `lint/correctness/useExhaustiveDependencies` | Intentional effect triggers | Must explain WHY deps are excluded |
| `lint/performance/noImgElement` | Framer Motion animations | "motion.img required for layout animations" |

### 2.4 Suppression Format

All suppressions MUST follow this format:

```typescript
// biome-ignore lint/rule-category/ruleName: [REQUIRED JUSTIFICATION]
```

**Bad Examples:**
```typescript
// biome-ignore lint/suspicious/noExplicitAny  ❌ No justification
// biome-ignore lint/a11y/useSemanticElements: fix later  ❌ Not a valid reason
```

**Good Example:**
```typescript
// biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text editing
```

---

## 3. Code Quality Rules

### 3.1 TODO/FIXME Requirements

All TODO comments MUST include a ticket reference:

```typescript
// ❌ FORBIDDEN
// TODO: Fix this later
// FIXME: Handle edge case

// ✅ REQUIRED
// TODO(LXD-301): Implement Firestore query for user lookup
// FIXME(LXD-405): Handle network timeout edge case
```

### 3.2 Commented-Out Code

Commented-out code is **BANNED**. Delete it.

```typescript
// ❌ FORBIDDEN
// const oldImplementation = () => {
//   return legacyProcess(data);
// };

// ✅ Use version control instead
// Git preserves history - delete dead code
```

### 3.3 Console Statements

Console statements in production code are **BANNED**.

```typescript
// ❌ FORBIDDEN in src/
console.log('debug');
console.warn('something happened');

// ✅ REQUIRED - Use the logger
import { logger } from '@/lib/logger';
logger.debug('Processing request', { requestId });
logger.warn('Retry attempt', { attempt: 3 });
```

### 3.4 Magic Numbers/Strings

Hardcoded values are **BANNED**.

```typescript
// ❌ FORBIDDEN
if (role === 'admin') { }
if (retries > 3) { }
const timeout = 5000;

// ✅ REQUIRED - Use constants
import { ROLES, RETRY_CONFIG } from '@/lib/constants';
if (role === ROLES.ADMIN) { }
if (retries > RETRY_CONFIG.MAX_ATTEMPTS) { }
const timeout = RETRY_CONFIG.TIMEOUT_MS;
```

---

## 4. Interface & Type Definitions

### 4.1 Component Props

Inline prop types are **BANNED**. Use named interfaces.

```typescript
// ❌ FORBIDDEN - Inline prop types
function UserCard({ name, email, avatar }: { name: string; email: string; avatar?: string }) { }

// ✅ REQUIRED - Named interface
interface UserCardProps {
  name: string;
  email: string;
  avatar?: string;
}

function UserCard({ name, email, avatar }: UserCardProps) { }
```

### 4.2 Interface Naming

- Props: `{ComponentName}Props`
- State: `{ComponentName}State`
- API Response: `{Endpoint}Response`
- API Request: `{Endpoint}Request`

```typescript
// ✅ Consistent naming
interface UserCardProps { }
interface UserListState { }
interface GetUsersResponse { }
interface CreateUserRequest { }
```

### 4.3 Export Requirements

Types used across files MUST be exported from a central location:

```
types/
├── api/           # API request/response types
├── components/    # Component prop types (if shared)
├── models/        # Domain model types
└── index.ts       # Re-exports
```

---

## 5. Security Standards

### 5.1 Secrets & Credentials

Hardcoded secrets are **ABSOLUTELY FORBIDDEN**.

```typescript
// ❌ CRITICAL VIOLATION
const API_KEY = 'sk-live-abc123';
const DB_PASSWORD = 'supersecret';

// ✅ REQUIRED - Use environment variables
const API_KEY = process.env.STRIPE_SECRET_KEY;
const DB_PASSWORD = process.env.DATABASE_PASSWORD;
```

### 5.2 Environment Variables

- Server-side secrets: `process.env.SECRET_NAME`
- Client-side public values: `process.env.NEXT_PUBLIC_*`

**NEVER** prefix secrets with `NEXT_PUBLIC_`.

### 5.3 Input Validation

All external input MUST be validated:

```typescript
// ✅ REQUIRED - Zod validation for API routes
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export async function POST(request: Request) {
  const body = await request.json();
  const validated = CreateUserSchema.parse(body);
  // ...
}
```

---

## 6. Exception Request Process

### 6.1 When Exceptions Are Needed

If you believe a standard cannot be followed, you MUST:

1. **Document the technical reason** (not "it's easier")
2. **Propose an alternative** if possible
3. **Request approval** before implementing

### 6.2 Exception Request Format

Create a GitHub issue with:

```markdown
## Exception Request

**Standard:** [Which rule needs exception]
**File(s):** [Affected file paths]
**Reason:** [Technical justification]
**Alternative Considered:** [What else was tried]
**Scope:** [Temporary with ticket / Permanent]
**Approval Needed By:** [Date]
```

### 6.3 Approval Authority

| Exception Type | Approver |
|----------------|----------|
| `any` type usage | Principal Engineer |
| Linter suppression | Tech Lead |
| Security exception | Security Lead + CTO |

---

## Enforcement

### Pre-Commit Hooks

All commits are validated by:
- `pnpm lint` (Biome)
- `pnpm typecheck` (TypeScript)
- `pnpm build` (Next.js)

### CI Pipeline

Pull requests are blocked if:
- TypeScript errors > 0
- Lint errors > 0
- Build fails

### Code Review Checklist

Reviewers MUST verify:
- [ ] No new `any` types without exception
- [ ] No new linter suppressions without justification
- [ ] All TODOs have ticket references
- [ ] No hardcoded secrets or magic values
- [ ] Props use named interfaces

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-25 | Initial governance document |

---

**END OF DOCUMENT**

*Compliance is mandatory. Quality is non-negotiable.*
