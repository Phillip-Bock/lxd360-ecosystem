# Complete Command

**Run this as FINAL step before reporting task complete.**

## Pre-Completion Checklist

### 1. Build Verification
```bash
npm run build
```
- [ ] Build: PASS (no errors)
- [ ] Static pages generated successfully

### 2. TypeScript Verification
```bash
npx tsc --noEmit
```
- [ ] TypeScript errors: 0

### 3. Lint Verification
```bash
npm run lint
```
- [ ] Lint errors: 0
- [ ] Lint warnings: 0

### 4. Audit Verification
- [ ] Ran `/project:audit` command
- [ ] All audit issues resolved

### 5. Scope Verification
- [ ] All files modified are listed
- [ ] No unintended changes to other files
- [ ] Changes match the requested task scope

### 6. Context Verification
- [ ] Changes don't break other parts of the codebase
- [ ] No tunnel vision - considered broader impact
- [ ] If unsure about impact, flagged for review

## Report Format

```markdown
## Task Complete Report

**Task:** [brief description]
**Branch:** [branch name]
**Commit:** [commit hash]

### Verification Results
| Check | Result |
|-------|--------|
| Build | ✅ PASS |
| TypeScript | ✅ 0 errors |
| Lint | ✅ 0 errors, 0 warnings |
| Audit | ✅ PASS |

### Files Modified
| File | Change Type |
|------|-------------|
| path/to/file.tsx | Modified |

### Issues Found Outside Scope
[List any issues discovered that weren't part of the task]

**Status:** ✅ COMPLETE - Ready for review
```

## Rules

1. **All checks must pass** - no exceptions
2. **Do not say "complete" until verified** - run the actual commands
3. **Report issues found outside scope** - don't ignore them
4. **Wait for approval** - COMPLETE status requires human confirmation

$ARGUMENTS
