# Audit Command

**Run this BEFORE marking any task complete.**

## Required Checks

Audit ALL files you touched in this session for:

### 1. Forbidden Patterns
- [ ] `TODO` or `FIXME` comments (not allowed - fix it or remove it)
- [ ] `@ts-ignore` or `@ts-nocheck` (never allowed)
- [ ] `eslint-disable` comments (never allowed)
- [ ] `biome-ignore` without documented justification in the comment
- [ ] `any` type usage (use `unknown` or proper types)

### 2. Removed Services
- [ ] Imports from: `@supabase/*`, `@sanity/*`, `@sentry/*`, `resend`, `@vercel/*`
- [ ] Comments referencing Supabase, Sanity, Sentry, Resend, Vercel, Doppler as active services
- [ ] Environment variables: `SUPABASE_*`, `SANITY_*`, `SENTRY_*`, `RESEND_*`, `VERCEL_*`, `DOPPLER_*`

### 3. Code Quality
- [ ] Missing error handling (try/catch where needed)
- [ ] Console.log statements (remove or use proper logger)
- [ ] Hardcoded values that should be constants or env vars
- [ ] Missing TypeScript types on function parameters/returns

### 4. File Standards
- [ ] Verbose file headers (15+ lines) - replace with single line or none
- [ ] Missing `'use client'` directive on client components
- [ ] Incorrect import paths (should use `@/` aliases)

## Report Format

```markdown
## Audit Report

**Files Touched:** [count]
**Issues Found:** [count]

| File | Issue | Action Taken |
|------|-------|--------------|
| path/to/file.tsx | Found TODO comment | Removed |

**Audit Result:** ✅ PASS / ❌ FAIL (list blockers)
```

## Rules

1. **Report ALL findings** - even outside your immediate task scope
2. **Fix issues when found** - don't create tickets to defer
3. **If you can't fix it** - report it explicitly and explain why
4. **Zero is the target** - not "acceptable number of issues"

$ARGUMENTS
