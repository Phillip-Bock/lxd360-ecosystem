# INSPIRE ENGINEERING CONSTITUTION & GUARDRAILS

**Version:** 3.0 (Titanium Standard)
**Effective Date:** January 2026
**Enforcement:** AUTOMATIC REJECTION of non-compliant code.

---

## 1. THE PRIME DIRECTIVES (NON-NEGOTIABLE)

1. **Nice Not Twice:** Do it right the first time. Zero "temporary fixes".
2. **Zero Debris Policy:**
   * **NO** `eslint-disable` or `ts-ignore` comments. If it errors, fix the code.
   * **NO** verbose file headers (e.g., "Author: ...", "Date: ..."). Git tracks this.
   * **NO** "chatty" comments (e.g., `// Importing React`). Only explain *complex business logic*.
   * **NO** commented-out code blocks. Delete them.
3. **The Golden Thread:** Data integrity is paramount. Shared types live in `@inspire/types`.
4. **Accessibility is Law:** Every interactive element must have `aria-label`, `role`, or `title`.

---

## 2. CODING STANDARDS (STRICT)

### 2.1 TypeScript Hygiene

* **FORBIDDEN:** `any`. Use `unknown` or strict Zod schemas.
* **FORBIDDEN:** Non-null assertions (`!`). Handle the null case.
* **REQUIRED:** Return types on all exported functions.

### 2.2 Commenting Rules

* **BAD:** `// This function calculates the total` (Noise)
* **BAD:** `/* ======================= HEADER ================= */` (Noise)
* **GOOD:** `// Uses BKT algorithm to predict mastery probability` (Context)

### 2.3 Component Architecture

* **Pattern:** "Smart Block". Do not build 100 separate components. Build configurable suites.
* **State:** Zustand for global, React Query for server, local `useRef` for high-frequency inputs (to prevent re-renders).

---

## 3. MONOREPO & ARCHITECTURE

* **Package Manager:** `pnpm` ONLY.
* **Structure:**
  * `apps/web`: Next.js 15 App (The Platform)
  * `packages/types`: Shared Zod Schemas (The Truth)
  * `packages/ui`: Shared Shadcn Components
* **Routing:** Use Route Groups `(tenant)`, `(auth)` to keep URLs clean.

---

## 4. SECURITY & AI PROTOCOLS

1. **The "Glass Box":** Every AI recommendation must log a Trace (rationale + confidence).
2. **Multi-Tenant:** All Firestore writes MUST be scoped to `tenants/{tenantId}`.
3. **Secrets:** NEVER use `NEXT_PUBLIC_` for sensitive keys. Use server-side env vars.

---

## 5. WORKFLOW PROTOCOLS

**Every prompt execution must begin with:**

> "Reading INSPIRE_Standards_Guardrails.md... Acknowledged."

**If a build error occurs:**

1. **STOP.** Do not add `// @ts-ignore`.
2. Analyze the root cause.
3. Fix the type definition or the logic.

**Failure to follow these rules is a critical failure of the agent task.**
