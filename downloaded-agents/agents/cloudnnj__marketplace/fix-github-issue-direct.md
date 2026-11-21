---
title: "Fix GitHub Issue (Direct)"
description: "Direct GitHub issue fixing without interactive clarification - assumes issue is clear"
category: "Bug Fixing"
tags: [github, issue, bugfix, automated, pr-creation]
version: "1.0"
examples:
  - "/fix-github-issue-direct 42"
  - "/fix-github-issue-direct 123"
---

# Fix GitHub Issue (Direct)

You are an expert developer fixing GitHub Issue #$ARGUMENTS

**Note**: This command assumes the issue is clear. For issues that may need clarification, use `/fix-github-issue` instead.

### Pre-Flight Checks

1. **Fetch Full Issue Details**
   Run this command to get complete issue context:
   ```bash
   gh issue view $ARGUMENTS --json title,body,labels,comments,assignees
   ```

2. **Check for Existing Work**
   - Search for existing PRs: `gh pr list --search "Fixes #$ARGUMENTS" --state all`
   - Search for existing branches: `git branch -r | grep -i "issue-$ARGUMENTS\|$ARGUMENTS"`
   - If PR exists and is open, update it instead of creating new one
   - If PR was closed without merge, understand why before proceeding

### Workflow Instructions

1. **Version Control (Mandatory)**
   - Ensure you're on the latest main: `git fetch origin && git checkout main && git pull`
   - Create branch: `git checkout -b auto-fix/issue-$ARGUMENTS-<short-description>`
   - Use kebab-case for the short description (e.g., `auto-fix/issue-42-fix-login-error`)
   - Do **not** commit directly to the main branch

2. **Investigation**
   - Summon @agent-root-cause-analyzer to analyze the issue
   - Read any files, error messages, or stack traces mentioned in the issue
   - Check issue comments for additional context or reproduction steps
   - Understand the full scope before making changes

3. **Implementation**
   - Write the minimal code required to fix the issue
   - Follow existing project patterns (reference CLAUDE.md)
   - Ensure the code compiles/lints: `npm run lint` or equivalent
   - Do not introduce unrelated changes or refactoring

4. **Testing & Validation**
   - Create or update unit tests to cover the fix
   - Tests should:
     - Reproduce the original bug (would fail without fix)
     - Verify the fix works correctly
   - Work with @agent-test-engineer for proper coverage
   - Run the full test suite: `npm test`
   - Ensure ALL tests pass before proceeding

5. **Commit Changes**
   - Stage your changes: `git add -A`
   - Commit with a descriptive message following conventional commits:
     ```
     fix: <short description>

     <longer description if needed>

     Fixes #$ARGUMENTS

     🤖 Generated with [Claude Code](https://claude.com/claude-code)

     Co-Authored-By: Claude <noreply@anthropic.com>
     ```

6. **Push and Create Pull Request**
   - Push branch: `git push -u origin HEAD`
   - Create PR:
     ```bash
     gh pr create \
       --title "fix: <concise description of the fix>" \
       --body "## Summary

     <1-2 sentence description of what was fixed and how>

     ## Issue

     Fixes #$ARGUMENTS

     ## Changes

     - <bullet point list of changes made>

     ## Testing

     - <how the fix was tested>
     - <any new tests added>

     ## Checklist

     - [x] Code follows project conventions
     - [x] Tests pass locally
     - [x] No unrelated changes included

     ---
     🤖 Generated with [Claude Code](https://claude.com/claude-code)"
     ```

7. **Comment on Issue**
   - Post a summary comment on the issue:
     ```bash
     gh issue comment $ARGUMENTS --body "## 🔧 Fix Attempted

     **Root Cause:** <brief explanation of what was causing the issue>

     **Solution:** <brief explanation of the fix>

     **Pull Request:** #<PR_NUMBER>

     The fix is ready for review. Once the PR is approved and merged, this issue will be automatically closed.

     ---
     🤖 *Automated fix by Claude Code*"
     ```

### Error Handling

If you encounter issues that prevent a fix:

1. **Cannot Reproduce**
   - Comment asking for more details
   - Add label: `gh issue edit $ARGUMENTS --add-label "needs-more-info"`

2. **Too Complex / Risky**
   - Comment explaining the complexity
   - Add label: `gh issue edit $ARGUMENTS --add-label "needs-human-review"`
   - Suggest an approach for a human developer

3. **Requires Breaking Changes**
   - Comment explaining the situation
   - Add label: `gh issue edit $ARGUMENTS --add-label "needs-human-review"`
   - Do NOT proceed with breaking changes

4. **Tests Fail**
   - If existing tests fail (not related to your fix), comment and add `gh issue edit $ARGUMENTS --add-label "needs-human-review"`
   - If your fix causes test failures, debug and resolve before creating PR

5. **Missing Dependencies/Access**
   - Comment explaining what's needed
   - Add label: `gh issue edit $ARGUMENTS --add-label "needs-human-review"`

### Label Reference

Use these labels to communicate status:

| Label | Command | When to Use |
|-------|---------|-------------|
| `auto-fix` | `gh issue edit $ARGUMENTS --add-label "auto-fix"` | Triggers the auto-fix workflow (usually set externally) |
| `dont-fix` | `gh issue edit $ARGUMENTS --add-label "dont-fix"` | Exclude issue from auto-fix queue |
| `fix-attempted` | `gh issue edit $ARGUMENTS --add-label "fix-attempted"` | After creating a PR (set by workflow) |
| `needs-human-review` | `gh issue edit $ARGUMENTS --add-label "needs-human-review"` | Issue is too complex or risky for auto-fix |
| `needs-more-info` | `gh issue edit $ARGUMENTS --add-label "needs-more-info"` | Cannot reproduce, need more details |
| `needs-clarification` | `gh issue edit $ARGUMENTS --add-label "needs-clarification"` | Claude asked questions, waiting for user response |
| `awaiting-response` | `gh issue edit $ARGUMENTS --add-label "awaiting-response"` | Processing user's clarification response |

### Interactive Workflow

For a more interactive experience where Claude asks clarifying questions before attempting fixes, use the `/fix-github-issue` command instead. This is the default behavior for the auto-fix GitHub workflow.

### Important Notes

- **Minimal Changes**: Only fix what's reported. Avoid scope creep.
- **No Force Push**: Never use `git push --force`
- **Respect .gitignore**: Don't commit ignored files
- **Security**: Don't commit secrets, credentials, or sensitive data
- **Existing Patterns**: Match the codebase style, don't introduce new patterns

