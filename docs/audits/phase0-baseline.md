# Phase 0 Baseline — January 25, 2026

## Environment
- Node version: v24.12.0
- pnpm version: 9.15.0
- Branch: claude/gcb-cleanup-phase0

## TypeScript Status
- Total errors: 0
- Files with errors: None
- All 8 typecheck tasks passed (5 packages)

## Lint Status (Biome)
- Total errors: 0
- Total warnings: 0
- Files checked: 2,364
- Breakdown:
  - a11y: 0
  - suspicious: 0
  - correctness: 0
  - style: 0
  - performance: 0
  - security: 0

## Build Status
- Result: FAILURE (Windows symlink permission issue)
- Duration: ~73 seconds
- Compilation: SUCCESS (78/78 static pages generated)
- Failure Point: "Collecting build traces" - EPERM errors creating symlinks for standalone output

### Build Warnings (Not Errors)
1. **Deprecated Config**: `experimental.turbo` should be moved to `config.turbopack`
2. **Three.js Compatibility**: Dependencies using deprecated Three.js exports:
   - `sRGBEncoding` not exported from 'three'
   - `PlaneBufferGeometry` not exported from 'three'
   - `CylinderBufferGeometry` not exported from 'three'
   - Affected: `@react-three/drei`, `troika-three-text`, `troika-three-utils`
3. **Edge Runtime**: Warning about static generation disabled for edge runtime pages

### Build Failure Root Cause
The build compilation succeeds but fails during standalone output creation due to Windows symlink permissions (EPERM -4048). This is a Windows-specific issue requiring either:
- Developer Mode enabled on Windows
- Administrator privileges
- Or disabling standalone output in next.config

This is NOT a code quality issue.

## Test Status
- Test files: 1
- Tests run: 44
- Passed: 44
- Failed: 0
- Skipped: 0
- Duration: 883ms

## Files Generated
- typecheck-baseline.txt
- lint-baseline.txt
- build-baseline.txt

## Summary

| Metric | Value | Status |
|--------|-------|--------|
| TypeScript Errors | 0 | Pass |
| Lint Errors | 0 | Pass |
| Lint Warnings | 0 | Pass |
| Build Compilation | Success | Pass |
| Build Standalone | Fail | Windows Permission Issue |
| Tests | 44/44 | Pass |

## Recommendations for Phase 1

1. **Three.js Dependencies**: The `@react-three/drei` and `troika-*` packages are using deprecated Three.js APIs. Consider:
   - Updating to compatible versions
   - Or accepting warnings until upstream fixes

2. **Build Config**: Update `experimental.turbo` to `turbopack` in next.config.js

3. **Windows Build**: For local development, consider disabling `output: 'standalone'` in next.config.js, or enable Windows Developer Mode

## Baseline Captured By
- Agent: Claude VS Code
- Date: January 25, 2026
- CLAUDE.md Version: 16.0
