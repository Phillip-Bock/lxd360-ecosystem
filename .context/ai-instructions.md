# AI Agent Instructions

## Before Generating Code

1. Read `.context/project.md` for architectural context
2. Read `.context/conventions.md` for coding standards
3. Check if similar patterns exist in the codebase
4. Verify the task doesn't conflict with existing implementations
5. Read `CLAUDE.md` for project-specific rules

## Code Generation Rules

### 1. Server-First

Default to Server Components. Only use `'use client'` when you need:

- React hooks (useState, useEffect, etc.)
- Event handlers (onClick, onChange, etc.)
- Browser APIs (localStorage, window, etc.)

### 2. Type Safety

Always explicit types, no any. Use unknown for external data.

### 3. Validation

Zod schema for all data boundaries.

### 4. Logging

Use structured logger, never console.

### 5. Error Handling

Explicit error types, no silent failures.

## Anti-Patterns to Avoid

### React

- `useEffect` for data fetching (use Server Components)
- Global Zustand stores (causes cross-request pollution in SSR)
- `React.forwardRef` (use ref as prop in React 19)
- `useFormState` (use `useActionState` in React 19)

### Next.js

- Synchronous `params` or `cookies()` access
- Assuming cached by default (it's uncached in Next.js 15)
- API routes for internal mutations (use Server Actions)

### TypeScript

- `any` type
- `@ts-ignore` or `@ts-expect-error`
- Non-null assertions without validation
- Type assertions without validation

### General

- `console.log` in production code
- Inline styles or arbitrary Tailwind values
- Creating new files when editing existing ones works
- Adding features beyond what was requested

## Validation Before Commit

Always run:

- pnpm typecheck (Zero errors)
- pnpm lint (Zero errors)
- pnpm build (Must succeed)
