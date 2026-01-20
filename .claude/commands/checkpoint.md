# Checkpoint Command

**Use this template for ALL checkpoint reports.**

## Checkpoint Protocol

**CHECKPOINT = STOP + REPORT + WAIT**

A checkpoint is NOT "report and continue." It means:
1. **STOP** all work
2. **REPORT** using the template below
3. **WAIT** for explicit "APPROVED" or "Go" before proceeding

## Report Template

```markdown
## CHECKPOINT: [Phase Name]

### Work Completed
| Item | Status | Details |
|------|--------|---------|
| [task 1] | ✅ Done | [brief description] |
| [task 2] | ✅ Done | [brief description] |

### Commit(s)
- `[hash]` - [commit message]

### Verification
| Check | Result |
|-------|--------|
| TypeScript | ✅ 0 errors |
| Lint | ✅ 0 errors |
| Build | ✅ PASS |

### Issues Found
| Issue | Severity | Action |
|-------|----------|--------|
| [issue] | High/Med/Low | [fixed/flagged/deferred] |

### Files Modified
[count] files - [list or summary]

### Issues Found Outside Scope
[List ANY issues discovered, even if not part of current task]

---

**WAITING for approval to proceed to [Next Phase].**
```

## Rules

1. **Always use this template** - consistency enables review
2. **Report issues outside scope** - never walk past problems
3. **Include verification results** - prove the work is clean
4. **Wait means WAIT** - do not proceed until you receive "APPROVED" or "Go"
5. **Confirm understanding** - after receiving instructions, confirm before executing

## Confirmation Pattern

After receiving new instructions:
```
I understand. [Summarize key points]. Ready.
```

Then WAIT for "Go" before executing.

$ARGUMENTS
