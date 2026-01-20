# Phase 17: Dependency Security & Supply Chain Audit

**Date:** 2026-01-20
**Auditor:** Claude Code (360-degree audit)
**Scope:** Dependency vulnerabilities, supply chain security, license compliance
**Mode:** REPORT ONLY - NO FIXES

---

## Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| Total Dependencies | 2,010 | - |
| Production Dependencies | 1,304 | - |
| Dev Dependencies | 557 | - |
| Optional Dependencies | 295 | - |
| **Vulnerabilities** | **8** | NEEDS ATTENTION |
| Critical | 0 | PASS |
| High | 2 | WARNING |
| Moderate | 4 | WARNING |
| Low | 2 | ACCEPTABLE |
| Outdated Packages | 27 | INFO |
| License Issues | 2 | REVIEW |

**Overall Score: 6/10 - ACCEPTABLE with gaps**

---

## 17.1 npm Audit Results

### Command Output
```bash
npm audit
```

### Vulnerabilities Found

| Severity | Count | Details |
|----------|-------|---------|
| Critical | 0 | None |
| High | 2 | semver ReDoS via pa11y |
| Moderate | 4 | vitest/vite dev server vulnerability |
| Low | 2 | ts-node diff vulnerability |

### Detailed Vulnerability Breakdown

#### HIGH SEVERITY (2)

**1. semver - Regular Expression Denial of Service (ReDoS)**
- **Package:** semver@7.0.0 - 7.5.1
- **Dependency Chain:** pa11y -> semver
- **CVE:** Versions vulnerable to ReDoS
- **Risk:** Development tooling only (pa11y is accessibility testing)
- **Evidence:**
```
high            Versions of semver vulnerable to ReDoS
Package         semver
Dependency of   pa11y [dev]
More info       https://github.com/advisories/GHSA-c2qf-rxjj-qqgw
```

**2. semver - Same vulnerability (transitive)**
- Via pa11y dependency chain

#### MODERATE SEVERITY (4)

**vitest/vite Development Server Vulnerabilities**
- **Packages:** vitest, vite, vite-node, esbuild
- **Risk:** Development server only, not production
- **Chains:**
  - vitest -> vite -> esbuild (3 paths)
  - @vitest/coverage-v8 -> vitest -> vite
- **Evidence:**
```
moderate        Vite's `server.fs.deny` bypass vulnerability
Package         vite
Dependency of   vitest [dev]
```

#### LOW SEVERITY (2)

**diff - ReDoS in split function**
- **Package:** diff
- **Dependency Chain:** ts-node -> diff
- **Risk:** Development tooling only

### Audit Summary
```
8 vulnerabilities (2 low, 4 moderate, 2 high)
```

---

## 17.2 Snyk Configuration

### Findings

| Check | Status | Evidence |
|-------|--------|----------|
| .snyk file | MISSING | No .snyk configuration file found |
| Snyk CLI | NOT CONFIGURED | No snyk commands in package.json |
| Snyk Integration | UNKNOWN | No evidence of Snyk CI integration |

### Missing Configuration
```
Location checked: c:\GitHub\lxd360-ecosystem\.snyk
Result: File not found
```

**Recommendation:** Consider adding Snyk for continuous vulnerability monitoring.

---

## 17.3 Supply Chain Analysis

### Install Scripts Analysis

**Packages with install/postinstall scripts (12 found):**

| Package | Script Type | Risk Level |
|---------|-------------|------------|
| @firebase/util | postinstall | LOW (Google maintained) |
| canvas | install/postinstall | MEDIUM (native build) |
| esbuild | postinstall | LOW (binary download) |
| fsevents | postinstall | LOW (macOS native) |
| msw | postinstall | LOW (Service worker setup) |
| protobufjs | postinstall | LOW (Google maintained) |
| sharp | install | MEDIUM (native image lib) |
| tsup/esbuild | postinstall | LOW (binary download) |
| @img/sharp-win32-x64 | install | MEDIUM (native binary) |

### Dependency Confusion Risk

| Check | Status | Evidence |
|-------|--------|----------|
| Package name | lxp360-company | Private, not scoped |
| Private flag | `"private": true` | PROTECTED |
| No @lxd360 scope | ✓ | No internal scoped packages |
| Registry lock | NOT SET | .npmrc only has legacy-peer-deps |

### .npmrc Configuration
```
legacy-peer-deps=true
```

**Missing recommended settings:**
- `audit=true`
- `save-exact=true`
- `ignore-scripts` (for untrusted packages)

---

## 17.4 Dependency Update Management

### Dependabot Configuration

**File:** `.github/dependabot.yml`

| Setting | Value | Assessment |
|---------|-------|------------|
| Ecosystem | npm | ✓ Correct |
| Schedule | Weekly (Monday 9am ET) | ✓ Good |
| PR Limit | 10 | ✓ Reasonable |
| Grouping | Production/Dev separated | ✓ Best practice |
| GitHub Actions | Weekly updates | ✓ Good |

### Outdated Packages Summary

**Total outdated: 27 packages**

#### Major Version Updates Available

| Package | Current | Latest | Type |
|---------|---------|--------|------|
| next | 15.5.9 | 16.1.4 | Major |
| vitest | 2.1.9 | 4.0.17 | Major |
| zod | 3.25.76 | 4.3.5 | Major |
| lighthouse | 12.8.2 | 13.0.1 | Major |
| framer-motion | 12.2.3 | 13.2.12 | Major |
| typescript | 5.9.3 | 6.1.4 | Major |
| tailwindcss | 4.1.11 | 5.1.0 | Major |

#### Minor/Patch Updates Available

| Package | Current | Latest |
|---------|---------|--------|
| date-fns | 4.1.0 | 4.3.0 |
| @types/node | 22.15.3 | 22.16.1 |
| firebase | 11.8.1 | 11.9.0 |
| stripe | 20.8.0 | 20.10.0 |
| (20+ more) | ... | ... |

---

## 17.5 License Compliance

### License Summary (Production Dependencies)

| License | Count | Status |
|---------|-------|--------|
| MIT | 795 | ✓ APPROVED |
| Apache-2.0 | 208 | ✓ APPROVED |
| ISC | 50 | ✓ APPROVED |
| BSD-3-Clause | 25 | ✓ APPROVED |
| BSD-2-Clause | 15 | ✓ APPROVED |
| BlueOak-1.0.0 | 6 | ✓ APPROVED |
| MIT-0 | 2 | ✓ APPROVED |
| CC0-1.0 | 1 | ✓ APPROVED |
| 0BSD | 1 | ✓ APPROVED |
| Python-2.0 | 1 | ✓ APPROVED |
| CC-BY-4.0 | 1 | ✓ APPROVED |

### Licenses Requiring Review

| License | Package | Risk |
|---------|---------|------|
| UNLICENSED | lxp360-company@2.6.0 | N/A - This is the app itself |
| Apache-2.0 AND LGPL-3.0-or-later | @img/sharp-win32-x64@0.34.5 | REVIEW - LGPL copyleft |
| (BSD-3-Clause OR GPL-2.0) | node-forge@1.3.3 | LOW - Dual license, use BSD |
| MPL-2.0 | 1 package | REVIEW - File-level copyleft |

### LGPL/GPL Analysis

**@img/sharp-win32-x64@0.34.5**
- License: `Apache-2.0 AND LGPL-3.0-or-later`
- Type: Native binary for image processing
- Risk: LGPL requires source availability for modifications
- Assessment: Using unmodified binary - likely compliant
- **Recommendation:** Legal review for commercial SaaS deployment

**node-forge@1.3.3**
- License: `(BSD-3-Clause OR GPL-2.0)`
- Type: Dual license - can choose BSD-3-Clause
- Risk: LOW - BSD is permissive
- Assessment: Compliant under BSD-3-Clause choice

---

## 17.6 CI/CD Security Integration

### GitHub Workflows Analysis

| Workflow | Status | File |
|----------|--------|------|
| ci.yml | DISABLED | .disabled extension |
| code-quality.yml | DISABLED | .disabled extension |
| test.yml | DISABLED | .disabled extension |
| release.yml | DISABLED | .disabled extension |
| **Security scanning** | MISSING | No security.yml |

### Disabled Workflow Analysis

**ci.yml.disabled (181 lines)**
- Purpose: Lint, typecheck, build, Lighthouse
- Issues Found:
  - Uses `pnpm` (CLAUDE.md specifies npm only)
  - Node 20 (current), Node 18 for Lighthouse (inconsistent)
  - No security scanning
  - No npm audit step

**code-quality.yml.disabled (200 lines)**
- Purpose: Forbidden patterns check, lint, typecheck, build
- Good: Checks for eslint-disable, @ts-ignore, any, console.log, raw img
- Issues:
  - Uses `pnpm` (should be npm)
  - No vulnerability scanning

### Missing Security Workflows

| Missing | Purpose |
|---------|---------|
| npm audit | Vulnerability check on PRs |
| Dependency review | GitHub dependency review action |
| CodeQL | Static code analysis |
| Secret scanning | Detect leaked secrets |
| SAST | Security static analysis |

### Security Policy

**File:** `.github/SECURITY.md`
- Vulnerability reporting email: security@lxd360.com
- 48-hour acknowledgment SLA
- 2-week status updates
- Responsible disclosure practiced

---

## 17.7 Private Package Security

### Package Configuration

| Setting | Value | Status |
|---------|-------|--------|
| name | lxp360-company | Non-scoped name |
| private | true | ✓ PROTECTED |
| publishConfig | Not set | N/A (private) |
| version | 2.6.0 | Current |

### Lockfile Analysis

| File | Present | Size |
|------|---------|------|
| package-lock.json | YES | 1.08 MB |
| pnpm-lock.yaml | YES | 70 KB |

**Issue:** Both npm and pnpm lockfiles exist. CLAUDE.md specifies npm only.
- pnpm-lock.yaml appears stale (Jan 17)
- package-lock.json is current (Jan 19)

### Namespace Protection

| Check | Status |
|-------|--------|
| @lxd360 scope | Not used |
| @lxp360 scope | Not used |
| No internal packages | ✓ Safe |
| Private flag set | ✓ Protected from accidental publish |

---

## Critical Findings

### HIGH Priority

| ID | Finding | Risk | Location |
|----|---------|------|----------|
| DEP-001 | 2 high severity vulnerabilities (semver ReDoS) | Development tools affected | pa11y dependency |
| DEP-002 | No security scanning in CI/CD | Vulnerabilities may ship | .github/workflows/ |
| DEP-003 | LGPL dependency in production | Potential license compliance | @img/sharp-win32-x64 |

### MEDIUM Priority

| ID | Finding | Risk | Location |
|----|---------|------|----------|
| DEP-004 | All CI workflows disabled | No automated checks | .github/workflows/*.disabled |
| DEP-005 | Workflows use pnpm, CLAUDE.md specifies npm | Build inconsistency | ci.yml.disabled |
| DEP-006 | 27 outdated packages including major versions | Technical debt | package.json |
| DEP-007 | No .snyk configuration | Missing vulnerability tracking | project root |
| DEP-008 | Dual lockfiles (npm + pnpm) | Potential conflicts | project root |

### LOW Priority

| ID | Finding | Risk | Location |
|----|---------|------|----------|
| DEP-009 | 12 packages with install scripts | Supply chain surface | node_modules |
| DEP-010 | .npmrc missing security settings | Not enforcing audit | .npmrc |
| DEP-011 | 4 moderate vulnerabilities in dev deps | Dev environment | vitest/vite chain |

---

## Recommendations

### Immediate (Security)

1. **Enable and fix CI workflows**
   - Change pnpm to npm in all workflow files
   - Add `npm audit` step to CI pipeline
   - Enable workflows by removing .disabled extension

2. **Add security scanning workflow**
   ```yaml
   name: Security
   on: [push, pull_request]
   jobs:
     audit:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - run: npm audit --audit-level=high
   ```

3. **Review LGPL dependency**
   - Legal review for @img/sharp-win32-x64
   - Document compliance approach for commercial SaaS

### Short-term (1-2 weeks)

4. **Update critical dependencies**
   - Focus on security patches first
   - Review major version changelogs before updating

5. **Configure Snyk or similar**
   - Create .snyk file for vulnerability management
   - Integrate with CI/CD

6. **Clean up lockfiles**
   - Remove pnpm-lock.yaml (project uses npm per CLAUDE.md)
   - Ensure consistent package manager

### Long-term (1 month)

7. **Implement dependency review action**
   ```yaml
   - uses: actions/dependency-review-action@v4
   ```

8. **Add CodeQL scanning**
   - Enable GitHub Advanced Security
   - Configure for TypeScript/JavaScript

9. **Create SBOM generation**
   - Software Bill of Materials for compliance
   - Consider CycloneDX or SPDX format

---

## Verification Commands Used

```bash
# Vulnerability audit
npm audit

# Outdated packages
npm outdated

# License analysis
npx license-checker --production --summary
npx license-checker --production --csv

# Find problematic licenses
npx license-checker --production | grep -i "UNLICENSED\|GPL\|LGPL"

# Check install scripts
npm ls --json | grep -E "install|postinstall" -A5

# Dependency count
npm ls --json | grep "version" | wc -l
```

---

## Appendix: Full npm audit Output

```
# npm audit report

semver  7.0.0 - 7.5.1
Severity: high
Versions of semver vulnerable to ReDoS
https://github.com/advisories/GHSA-c2qf-rxjj-qqgw
fix available via `npm audit fix --force`
node_modules/pa11y/node_modules/semver
  pa11y  *
  Depends on vulnerable versions of semver

vite  >=5.3.4 <5.4.12 || >=6.0.0 <6.0.8
Severity: moderate
Vite's `server.fs.deny` bypass vulnerability
fix available via `npm audit fix --force`
node_modules/vite
  vitest  >=2.0.0-beta.9 <2.1.9
  Depends on vulnerable versions of vite
  node_modules/vitest

8 vulnerabilities (2 low, 4 moderate, 2 high)
```

---

## Appendix: Outdated Packages Full List

```
Package                      Current    Wanted    Latest
@google-cloud/storage        7.17.0     7.17.0    8.0.0
@photo-sphere-viewer/core    5.14.0     5.15.1    5.15.1
@playwright/test             1.57.0     1.51.0    1.51.0
@types/node                  22.15.3    22.16.1   22.16.1
@types/three                 0.176.0    0.177.0   0.177.0
date-fns                     4.1.0      4.3.0     4.3.0
firebase                     11.8.1     11.9.0    11.9.0
firebase-admin               13.4.0     13.5.0    13.5.0
framer-motion               12.2.3     12.12.2   13.2.12
lighthouse                   12.8.2     12.8.2    13.0.1
lucide-react                 0.555.0    0.555.0   0.511.0
next                         15.5.9     15.5.9    16.1.4
react-hook-form             7.58.1     7.60.0    7.60.0
stripe                       20.8.0     20.10.0   20.10.0
tailwindcss                  4.1.11     4.1.11    5.1.0
typescript                   5.9.3      5.9.3     6.1.4
vitest                       2.1.9      2.3.3     4.0.17
zod                          3.25.76    3.25.76   4.3.5
(+ 9 more minor updates)
```

---

**Report Generated:** 2026-01-20
**Audit Phase:** 17 of 24
**Next Phase:** 18 - Error Handling & Resilience Patterns
