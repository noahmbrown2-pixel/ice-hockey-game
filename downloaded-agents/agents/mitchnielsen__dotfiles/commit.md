---
description: Commit our changes in version control
---

# Commit

Additional context from me to include in the commit message: $ARGUMENTS

## Git Context

Current branch:
!`git branch --show-current`

Status:
!`git status --short`

Recent commit subjects for style reference:
!`git log -n 20 --pretty=format:%s`

Staged diff summary:
!`git diff --cached --stat`

Unstaged diff summary:
!`git diff --stat`

## Instructions

Inspect the provided status and diffs, stage the intended files, and create
one commit. If it is unclear whether a file should be included, ask before
committing.

If `pre-commit` hooks fail, fix or re-add the files changed by hooks and
commit again. Never use `--no-verify`.

## Commit message

Follow the `commit-message` skill for formatting conventions.
Use the recent commit subjects above for style and scope. Do not run extra
history commands unless the scope is still unclear.
