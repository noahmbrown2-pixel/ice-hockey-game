---
description: Create a PR based on our current branch using the gh command-line tool
---

# Pull Request

Additional context from me to include in the PR: $ARGUMENTS

## Git Context

Current branch:
!`git branch --show-current`

Status:
!`git status -sb`

Default branch reference:
!`git rev-parse --abbrev-ref origin/HEAD 2>/dev/null || true`

Commits on this branch:
!`git log --pretty=format:%s origin/HEAD..HEAD 2>/dev/null || git log -n 10 --pretty=format:%s`

Diff summary:
!`git diff --stat origin/HEAD...HEAD 2>/dev/null || git diff --stat`

Existing pull request, if any:
!`gh pr view --json url,title,state --jq '"\(.state) \(.title) \(.url)"' 2>/dev/null || true`

Pull request template path, if present:
!`for f in .github/pull_request_template.md .github/PULL_REQUEST_TEMPLATE.md; do [ -f "$f" ] && printf '%s\n' "$f"; done; true`

## Instructions

Create a pull request from this branch: `gh pr create --draft --assignee=@me`.

- If there is a PR template (usually `.github/pull_request_template.md`),
  follow it.
- If there is only a single commit, use the commit message as the
  PR message. If there are multiple commits, synthesize a new one that covers
  all of the changes.
- If an existing PR is listed above, do not create a duplicate. Update it
  instead only if the current title or description is stale.

Follow the `pr-description` skill for title and description conventions.
Use the provided git context first. Do not run extra history or diff commands
unless the PR title or description is still unclear.
