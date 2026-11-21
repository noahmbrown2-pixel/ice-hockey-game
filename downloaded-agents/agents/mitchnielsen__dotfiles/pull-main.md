---
description: Pull in changes from the main branch
---

Use `git pull origin main` to bring in changes from the main branch.

DO NOT use `--rebase`. I want this to be a merge commit so I can see it in the
git history and revert if needed.

Address any merge conflicts that might arise. If you're unsure of how to
resolve them, then stop and ask me. Regenerate lockfiles with package manager
tools instead of hand-editing.
