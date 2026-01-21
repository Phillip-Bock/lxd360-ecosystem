# GIT HOUSEKEEPING & BRANCH CLEANUP

**Claude VS Code Prompt — Repository Synchronization**

---

## CLAUDE VS CODE PROMPT

Copy the entire block below and paste into Claude VS Code:

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | GIT HOUSEKEEPING & SYNC
                    Branch Cleanup, Merge & Push to Origin
═══════════════════════════════════════════════════════════════════════════════

REPO: https://github.com/Phillip-Bock/lxd360-ecosystem
LOCAL PATH: C:\GitHub\lxd360-ecosystem (adjust if different)

═══════════════════════════════════════════════════════════════════════════════
                         MISSION OBJECTIVE
═══════════════════════════════════════════════════════════════════════════════

1. Audit all local and remote branches
2. Commit any uncommitted work
3. Merge all feature branches into main (or flag conflicts)
4. Delete merged branches (local and remote)
5. Ensure main is current and pushed to origin
6. Clean up stale references
7. Verify final state

═══════════════════════════════════════════════════════════════════════════════
                    STEP 1: AUDIT CURRENT STATE
═══════════════════════════════════════════════════════════════════════════════

# Navigate to repository
cd C:\GitHub\lxd360-ecosystem

# Check current branch and status
git status

# Fetch all remote changes (don't merge yet)
git fetch --all --prune

# List ALL branches (local and remote)
echo "=== LOCAL BRANCHES ==="
git branch -v

echo ""
echo "=== REMOTE BRANCHES ==="
git branch -r -v

echo ""
echo "=== ALL BRANCHES WITH TRACKING ==="
git branch -vv

# Check for uncommitted changes
git status --porcelain

# Document findings before proceeding
echo ""
echo "=== BRANCHES MERGED INTO MAIN ==="
git branch --merged main

echo ""
echo "=== BRANCHES NOT MERGED INTO MAIN ==="
git branch --no-merged main

═══════════════════════════════════════════════════════════════════════════════
                    STEP 2: STASH OR COMMIT UNCOMMITTED WORK
═══════════════════════════════════════════════════════════════════════════════

# If there are uncommitted changes, either commit or stash:

# OPTION A: Commit changes (if work is complete)
git add -A
git commit -m "chore: save work in progress before branch cleanup"

# OPTION B: Stash changes (if work is incomplete)
git stash push -m "WIP: stashed for branch cleanup $(date +%Y-%m-%d)"

# Verify clean working directory
git status

═══════════════════════════════════════════════════════════════════════════════
                    STEP 3: SWITCH TO MAIN & UPDATE
═══════════════════════════════════════════════════════════════════════════════

# Switch to main branch
git checkout main

# Pull latest from origin
git pull origin main

# Verify main is up to date with origin
git log --oneline -5
git status

═══════════════════════════════════════════════════════════════════════════════
                    STEP 4: MERGE FEATURE BRANCHES INTO MAIN
═══════════════════════════════════════════════════════════════════════════════

# For each feature branch, merge into main
# IMPORTANT: Review each branch before merging!

# List branches to merge (excluding main, develop, backup branches)
git branch | grep -v "main" | grep -v "develop" | grep -v "backup"

# For each branch, merge using this pattern:
# (Replace BRANCH_NAME with actual branch name)

# ------- MERGE TEMPLATE -------
# git merge BRANCH_NAME --no-ff -m "merge: BRANCH_NAME into main"
# -------------------------------

# If there are conflicts:
# 1. Resolve conflicts in affected files
# 2. git add <resolved-files>
# 3. git commit -m "merge: resolved conflicts from BRANCH_NAME"

# EXAMPLE: Merge a Claude feature branch
# git merge claude/feature-name-xxxx --no-ff -m "merge: claude/feature-name-xxxx into main"

# After each successful merge, verify:
git log --oneline -3

═══════════════════════════════════════════════════════════════════════════════
                    STEP 5: DELETE MERGED LOCAL BRANCHES
═══════════════════════════════════════════════════════════════════════════════

# First, list branches that are safe to delete (already merged)
git branch --merged main | grep -v "main" | grep -v "develop"

# Delete merged local branches one by one:
# git branch -d BRANCH_NAME

# OR delete all merged branches at once (CAREFUL - review first!):
# git branch --merged main | grep -v "main" | grep -v "develop" | xargs git branch -d

# For branches that aren't merged but should be deleted anyway:
# git branch -D BRANCH_NAME  # Force delete (CAREFUL!)

═══════════════════════════════════════════════════════════════════════════════
                    STEP 6: DELETE REMOTE BRANCHES
═══════════════════════════════════════════════════════════════════════════════

# List remote branches
git branch -r

# Delete remote branches that are no longer needed:
# git push origin --delete BRANCH_NAME

# EXAMPLE:
# git push origin --delete claude/old-feature-xxxx
# git push origin --delete feature/completed-work

# Prune stale remote-tracking references
git remote prune origin

# Verify remote branches
git branch -r

═══════════════════════════════════════════════════════════════════════════════
                    STEP 7: PUSH MAIN TO ORIGIN
═══════════════════════════════════════════════════════════════════════════════

# Ensure we're on main
git checkout main

# Push main to origin
git push origin main

# If main has been force-pushed or rebased (rare), use:
# git push origin main --force-with-lease

# Verify push succeeded
git log --oneline origin/main -5

═══════════════════════════════════════════════════════════════════════════════
                    STEP 8: FINAL CLEANUP & VERIFICATION
═══════════════════════════════════════════════════════════════════════════════

# Run garbage collection to clean up
git gc --prune=now

# Verify final state
echo "=== FINAL STATE ==="
echo ""
echo "Current branch:"
git branch --show-current

echo ""
echo "Status:"
git status

echo ""
echo "Local branches:"
git branch -v

echo ""
echo "Remote branches:"
git branch -r

echo ""
echo "Recent commits on main:"
git log --oneline -10

echo ""
echo "Sync status with origin:"
git log --oneline origin/main..main  # Commits on main not on origin
git log --oneline main..origin/main  # Commits on origin not on main

═══════════════════════════════════════════════════════════════════════════════
                    AUTOMATED SCRIPT (USE WITH CAUTION)
═══════════════════════════════════════════════════════════════════════════════

# If you want to automate the cleanup, here's a script.
# REVIEW CAREFULLY before running - this deletes branches!

#!/bin/bash
set -e

REPO_PATH="C:\GitHub\lxd360-ecosystem"
cd "$REPO_PATH"

echo "🔍 Fetching all remote changes..."
git fetch --all --prune

echo "📋 Current status:"
git status

echo "💾 Stashing any uncommitted changes..."
git stash push -m "Auto-stash before cleanup $(date +%Y-%m-%d-%H%M%S)" 2>/dev/null || echo "Nothing to stash"

echo "🔀 Switching to main..."
git checkout main

echo "⬇️ Pulling latest main..."
git pull origin main

echo "🗑️ Deleting merged local branches..."
git branch --merged main | grep -v "main" | grep -v "develop" | grep -v "\*" | xargs -r git branch -d

echo "🧹 Pruning stale remote references..."
git remote prune origin

echo "⬆️ Pushing main to origin..."
git push origin main

echo "🧼 Running garbage collection..."
git gc --prune=now

echo ""
echo "✅ CLEANUP COMPLETE"
echo ""
git branch -v
git status

═══════════════════════════════════════════════════════════════════════════════
                    CONFLICT RESOLUTION GUIDE
═══════════════════════════════════════════════════════════════════════════════

If you encounter merge conflicts:

1. Identify conflicted files:
   git status

2. Open each conflicted file and look for conflict markers:
   <<<<<<< HEAD
   (current branch content)
   =======
   (incoming branch content)
   >>>>>>> branch-name

3. Edit the file to resolve (keep desired code, remove markers)

4. Stage resolved files:
   git add <filename>

5. Complete the merge:
   git commit -m "merge: resolved conflicts from BRANCH_NAME"

6. If you want to abort the merge:
   git merge --abort

═══════════════════════════════════════════════════════════════════════════════
                    SAFETY RULES
═══════════════════════════════════════════════════════════════════════════════

✅ ALWAYS fetch before merging
✅ ALWAYS review branch contents before deleting
✅ ALWAYS keep backup branches until verified
✅ ALWAYS use --no-ff for merge history visibility
✅ ALWAYS verify push succeeded

❌ NEVER force push to main without team agreement
❌ NEVER delete branches without verifying they're merged
❌ NEVER skip conflict resolution
❌ NEVER run automated deletion without review

═══════════════════════════════════════════════════════════════════════════════
                    DELIVERABLES CHECKLIST
═══════════════════════════════════════════════════════════════════════════════

- [ ] All uncommitted work saved (committed or stashed)
- [ ] All feature branches reviewed
- [ ] All applicable branches merged into main
- [ ] All merged local branches deleted
- [ ] All stale remote branches deleted
- [ ] Main is up to date
- [ ] Main pushed to origin
- [ ] Git garbage collection run
- [ ] Final state verified

═══════════════════════════════════════════════════════════════════════════════
                    SESSION HANDOFF
═══════════════════════════════════════════════════════════════════════════════

## Git Housekeeping — [Date]

### Branches Merged
| Branch | Status | Notes |
|--------|--------|-------|
| example/branch-1 | ✅ Merged | Clean merge |
| example/branch-2 | ⚠️ Conflicts | Resolved X files |
| example/branch-3 | ❌ Skipped | Needs review |

### Branches Deleted
- Local: [list]
- Remote: [list]

### Final State
- Current branch: main
- Local branches remaining: [count]
- Remote branches remaining: [count]
- Main synced with origin: ✅/❌

### Notes
- [Any issues encountered]
- [Any branches intentionally kept]

═══════════════════════════════════════════════════════════════════════════════
```

---

## QUICK REFERENCE COMMANDS

```bash
# One-liner: Fetch, checkout main, pull, push
git fetch --all && git checkout main && git pull origin main && git push origin main

# Delete all merged local branches except main/develop
git branch --merged main | grep -Ev "(^\*|main|develop)" | xargs -r git branch -d

# Delete a specific remote branch
git push origin --delete branch-name

# See what would be deleted (dry run)
git branch --merged main | grep -Ev "(^\*|main|develop)"

# Force sync local main with remote (DESTRUCTIVE - use carefully)
git checkout main && git fetch origin && git reset --hard origin/main
```
