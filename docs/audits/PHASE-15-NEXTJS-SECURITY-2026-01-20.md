# Phase 15: Next.js Security Architecture Audit

**Date:** 2026-01-20
**Auditor:** Claude Code (Automated)
**Scope:** Next.js 15 security patterns, active CVEs, CSRF protection
**Status:** COMPLETED

---

## Executive Summary

| Category | Score | Status |
|----------|-------|--------|
| Overall Security | **5/10** | NEEDS IMPROVEMENT |
| CVE Exposure | MEDIUM | Active vulnerabilities need mitigation |
| CSRF Protection | PARTIAL | Relies on Next.js defaults, no custom implementation |
| Rate Limiting | PARTIAL | AI endpoints only, auth unprotected |

---

## Phase 15.1: Version & Patch Verification

### Current Versions (package.json)

| Package | Version | Security Status |
|---------|---------|-----------------|
| next | 15.5.9 | ⚠️ VERIFY CVE patches |
| react | ^19.2.3 | ✅ Patched (React2Shell fixed) |
| react-dom | ^19.2.3 | ✅ Patched |

### Evidence

```json
// package.json lines 66-68
"next": "15.5.9",
"react": "^19.2.3",
"react-dom": "^19.2.3",
```

### CVE Status

| CVE | Description | Status |
|-----|-------------|--------|
| CVE-2025-29927 | Middleware bypass via x-middleware-subrequest | ⚠️ VERIFY Next.js 15.5.9 includes patch |
| CVE-2025-55182 | React2Shell async boundary | ✅ Fixed in React 19.2.3 |

---

## Phase 15.2: Data Access Layer (DAL) Architecture

### Assessment: NOT IMPLEMENTED

**Required Files:**
| File | Status | Issue |
|------|--------|-------|
| lib/dal.ts | ❌ MISSING | No centralized Data Access Layer |
| lib/dto.ts | ❌ MISSING | No Data Transfer Object patterns |

### Evidence

```bash
# Glob search for DAL files
Glob pattern: **/lib/dal*.ts
Result: No files found

Glob pattern: **/lib/dto*.ts
Result: No files found
```

### Current Implementation

**Firebase Client (lib/firebase/client.ts:1-4):**
```typescript
'use client';  // Correctly marked as client component
import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';
// Exports: auth, db, storage
```

### Findings

| Issue | Severity | File | Line |
|-------|----------|------|------|
| No DAL pattern | HIGH | N/A | - |
| Direct Firestore access from components | MEDIUM | Multiple | - |
| No centralized auth verification layer | HIGH | N/A | - |

---

## Phase 15.3: Server Actions Security

### Files Analyzed

| File | Lines | Zod | Auth | Status |
|------|-------|-----|------|--------|
| lib/actions/courses.ts | 214 | ✅ | ❌ | NEEDS AUTH |
| lib/actions/lessons.ts | 96 | ❌ | ❌ | CRITICAL |
| lib/actions/blocks.ts | 84 | ❌ | ❌ | CRITICAL |
| lib/actions/waitlist.ts | 46 | ✅ | N/A | CLIENT IMPORT |

### Critical Findings

**1. waitlist.ts - Client Firebase import in Server Action:**
```typescript
// lib/actions/waitlist.ts:1-3
"use server"
import { db } from "@/lib/firebase/client"  // ❌ WRONG - importing client-side Firebase
import { collection, addDoc, query, where, getDocs } from "firebase/firestore"
```
**Issue:** Server actions should use `firebase-admin`, not client SDK.

**2. courses.ts - No Auth Verification:**
```typescript
// lib/actions/courses.ts - Has Zod validation but no auth()
'use server';
const createCourseSchema = z.object({ ... });
export async function createCourse(data: CreateCourseInput) {
  // ❌ No auth verification before database operation
  const validationResult = createCourseSchema.safeParse(normalizedData);
  // Proceeds to write without checking user permissions
}
```

**3. lessons.ts - No Validation:**
```typescript
// lib/actions/lessons.ts - No Zod, no auth
'use server';
export async function createLesson(data) {  // ❌ Untyped, no validation
  // Direct database write
}
```

**4. blocks.ts - No Validation:**
```typescript
// lib/actions/blocks.ts - No Zod, no auth
'use server';
export async function createBlock(data) {  // ❌ Untyped, no validation
  // Direct database write
}
```

---

## Phase 15.4: Component Boundary Security

### Environment Variable Exposure Check

```bash
Grep pattern: typeof window|NODE_ENV|process\.env\.NEXT_PUBLIC
Found in components: Only NODE_ENV checks
```

### Findings

| Pattern | Files Found | Risk |
|---------|-------------|------|
| `NODE_ENV` checks | Multiple | LOW - Expected |
| `NEXT_PUBLIC_*` exposure | Expected | LOW - Public vars |
| Private env in client | None found | ✅ OK |

---

## Phase 15.5: Middleware Security (CVE-2025-29927)

### middleware.ts Analysis

**File:** [middleware.ts](middleware.ts) (83 lines)

```typescript
// middleware.ts:39-64
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = !!authToken;

  // Protected routes - redirect to login if not authenticated
  if (isProtectedRoute(pathname)) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}
```

### Security Assessment

| Check | Status | Evidence |
|-------|--------|----------|
| x-middleware-subrequest manipulation | ✅ None detected | No header manipulation found |
| Defense-in-depth | ❌ MISSING | Middleware-only auth check |
| Token validation | ⚠️ WEAK | Cookie presence only, no JWT validation |

### Vulnerability Analysis

**CVE-2025-29927 Mitigation:**
- No explicit `x-middleware-subrequest` handling found
- Next.js 15.5.9 should include the patch, but verification needed

**Defense-in-Depth Gap:**
- Protected routes rely solely on middleware cookie check
- No server-side auth verification in page components
- No API route auth middleware

---

## Phase 15.6: Security Headers Audit

### next.config.mjs Headers (lines ~610-624)

```javascript
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
],
```

### Headers Assessment

| Header | Configured | Value | Status |
|--------|-----------|-------|--------|
| X-Frame-Options | ✅ | DENY | GOOD |
| X-Content-Type-Options | ✅ | nosniff | GOOD |
| X-XSS-Protection | ✅ | 1; mode=block | GOOD |
| Strict-Transport-Security | ✅ | max-age=31536000... | GOOD |
| Referrer-Policy | ✅ | strict-origin-when-cross-origin | GOOD |
| Permissions-Policy | ✅ | Restrictive | GOOD |
| Content-Security-Policy | ❌ | NOT CONFIGURED | CRITICAL MISSING |

---

## Phase 15.7: Rate Limiting & CSRF

### Rate Limiting Analysis

**AI Rate Limiting (lib/ai/rate-limiter.ts):**
```typescript
const DEFAULT_RATE_LIMITS: Record<AIProvider, AIRateLimitConfig> = {
  openai: { requestsPerMinute: 60, tokensPerMinute: 90000, tokensPerDay: 1000000 },
  anthropic: { requestsPerMinute: 50, tokensPerMinute: 100000, tokensPerDay: 1000000 },
  google: { requestsPerMinute: 60, tokensPerMinute: 1000000 },
  gemini: { requestsPerMinute: 60, tokensPerMinute: 1000000 },
};
```
**Status:** ✅ AI endpoints protected

**Auth Endpoint Rate Limiting:**
```bash
Grep pattern: rateLimit|rate-limit|rateLimiter
Result in app/: Only found in settings page (UI reference)
```
**Status:** ❌ NOT IMPLEMENTED for authentication endpoints

### CSRF Protection Analysis

**Custom CSRF Implementation:**
```bash
Grep pattern: csrf|CSRF|csrfToken|_csrf
Result: Only in node_modules (Next.js internal)
```
**Status:** ❌ No custom CSRF implementation

**Next.js Built-in CSRF:**
- Server Actions use built-in CSRF protection (Origin header check)
- No `allowedOrigins` configuration found in next.config.mjs
- Relies entirely on Next.js defaults

**Webhook Signature Verification:**
| Webhook | Signature Verification | Status |
|---------|----------------------|--------|
| Stripe | ✅ HMAC-SHA256 | SECURE |
| Auth | ✅ HMAC-SHA256 | SECURE |

### Evidence

**Stripe Webhook (api/webhooks/stripe/route.ts:54-56):**
```typescript
const stripe = getStripe();
event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

**Auth Webhook (api/webhooks/auth/route.ts:80-96):**
```typescript
function verifyWebhookSignature(payload: string, signature: string | null, secret: string): boolean {
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
```

---

## Critical Security Findings Summary

### HIGH Severity

| # | Issue | File | Remediation |
|---|-------|------|-------------|
| 1 | No DAL pattern | N/A | Implement lib/dal.ts with auth checks |
| 2 | Server action uses client Firebase | lib/actions/waitlist.ts:2 | Use firebase-admin |
| 3 | No auth in server actions | lib/actions/courses.ts | Add auth verification |
| 4 | No auth in server actions | lib/actions/lessons.ts | Add auth + Zod |
| 5 | No auth in server actions | lib/actions/blocks.ts | Add auth + Zod |
| 6 | Missing CSP header | next.config.mjs | Add Content-Security-Policy |

### MEDIUM Severity

| # | Issue | File | Remediation |
|---|-------|------|-------------|
| 1 | No auth rate limiting | N/A | Add rate limiting to auth endpoints |
| 2 | Middleware-only auth | middleware.ts | Add defense-in-depth |
| 3 | Cookie-only auth check | middleware.ts | Validate JWT/session |

### LOW Severity

| # | Issue | File | Remediation |
|---|-------|------|-------------|
| 1 | No custom CSRF | N/A | Consider explicit CSRF for critical ops |
| 2 | Verify CVE patches | package.json | Confirm Next.js 15.5.9 includes CVE-2025-29927 fix |

---

## Recommended Security Architecture

### Required DAL Pattern (lib/dal.ts)

```typescript
// Recommended implementation
import 'server-only';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function verifySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('firebase-auth-token')?.value;
  if (!token) return null;

  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}

export async function getCourse(courseId: string) {
  const session = await verifySession();
  if (!session) throw new Error('Unauthorized');

  // Check RBAC permissions
  // Then fetch data
}
```

### Server Actions Pattern

```typescript
'use server';
import { verifySession } from '@/lib/dal';
import { hasPermission } from '@/lib/rbac/roles';

export async function createCourse(data: CreateCourseInput) {
  const session = await verifySession();
  if (!session) throw new Error('Unauthorized');

  if (!hasPermission(session.claims, 'write:courses')) {
    throw new Error('Forbidden');
  }

  // Validate with Zod
  // Then proceed
}
```

---

## Compliance Impact

| Standard | Impact | Notes |
|----------|--------|-------|
| SOC 2 | ⚠️ CC6.1 | Access control gaps in server actions |
| FedRAMP | ⚠️ AC-3 | Authorization enforcement missing |
| OWASP | ⚠️ A01:2021 | Broken Access Control |
| PCI-DSS | ⚠️ 7.1 | Access restricted to need-to-know |

---

## Phase Score: 5/10

| Component | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Framework Versions | 7/10 | 15% | 1.05 |
| DAL Architecture | 2/10 | 20% | 0.40 |
| Server Actions Security | 3/10 | 20% | 0.60 |
| Component Boundaries | 7/10 | 10% | 0.70 |
| Middleware Security | 5/10 | 15% | 0.75 |
| Security Headers | 7/10 | 10% | 0.70 |
| Rate Limiting & CSRF | 5/10 | 10% | 0.50 |
| **TOTAL** | | | **4.70/10** |

**Rounded Score: 5/10 - NEEDS IMPROVEMENT**

---

## Next Steps

1. **URGENT:** Implement Data Access Layer (lib/dal.ts)
2. **URGENT:** Add auth verification to all server actions
3. **URGENT:** Add Content-Security-Policy header
4. **HIGH:** Implement rate limiting for auth endpoints
5. **HIGH:** Add defense-in-depth auth checks in pages
6. **MEDIUM:** Verify Next.js 15.5.9 includes CVE-2025-29927 patch
7. **LOW:** Consider explicit CSRF tokens for critical operations

---

*Report generated by Claude Code automated audit system*
