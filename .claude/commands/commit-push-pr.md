---
allowed-tools: Bash(git:*), Bash(gh:*), Bash(date:*), Bash(cat:*), Bash(wc:*)
description: Commit changes, push to remote, and optionally create a PR with pre-computed git context
---

# Commit, Push, and Create PR

## Pre-Computed Git Context

- **Timestamp**: !`date -u +"%Y-%m-%d %H:%M UTC"`
- **Current Branch**: !`git branch --show-current`
- **Default Branch**: !`git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main"`
- **Remote**: !`git remote get-url origin 2>/dev/null || echo "no remote configured"`
- **Ahead/Behind**: !`git rev-list --left-right --count HEAD...@{u} 2>/dev/null | awk '{print "Ahead: "$1" | Behind: "$2}' || echo "Not tracking remote"`

## Repository State

### Uncommitted Changes
!`git status --short 2>/dev/null || echo "Not a git repository"`

### Staged Changes Count
!`git diff --cached --stat 2>/dev/null | tail -1 || echo "No staged changes"`

### Recent Commits (for message style)
!`git log --oneline -5 2>/dev/null || echo "No commits yet"`

### Changed Files Summary
!`git diff --stat HEAD~1 2>/dev/null | tail -3 || echo "Unable to get diff"`

## Your Task

Based on the pre-computed context above:

1. **Review Changes**: Examine the uncommitted changes shown above
2. **Stage Files**: If files need staging, use `git add` appropriately
3. **Commit**: Create a descriptive commit message following the repository's style:
   - Format: `type(scope): description`
   - Types: feat, fix, refactor, docs, test, chore
   - End with Claude Code attribution

4. **Push**: Push to the current branch with tracking if needed:
   ```bash
   git push -u origin $(git branch --show-current)
   ```

5. **Create PR** (if requested): Use `gh pr create` with:
   - Descriptive title matching commit convention
   - Summary bullet points
   - Test plan section

## Commit Message Template

```bash
git commit -m "$(cat <<'EOF'
type(scope): Brief description of changes

- Detailed change 1
- Detailed change 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

## PR Creation Template

```bash
gh pr create --title "type(scope): Brief description" --body "$(cat <<'EOF'
## Summary
- Change 1
- Change 2

## Test Plan
- [ ] Tested locally
- [ ] Verified functionality

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## Usage Examples

### Basic commit and push
```
/commit-push-pr
```
Review changes, commit with appropriate message, and push.

### Commit specific files
```
/commit-push-pr CLAUDE.md README.md
```
Stage and commit only specified files.

### Create PR after push
```
/commit-push-pr --create-pr
```
Commit, push, and create a pull request.

### Full workflow with PR
```
/commit-push-pr --all --create-pr --base main
```
Stage all changes, commit, push, and create PR against main branch.

## Output

On success, print JSON status:
```json
{
  "status": "success",
  "commit": {
    "hash": "abc1234",
    "message": "feat(fedimint): Add payment routing"
  },
  "push": {
    "branch": "feature/payment-routing",
    "remote": "origin"
  },
  "pr": {
    "number": 123,
    "url": "https://github.com/owner/repo/pull/123"
  }
}
```
