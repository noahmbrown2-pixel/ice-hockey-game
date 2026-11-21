# Git rules

Part of cross-project rules. Routed from `~/.claude/CLAUDE.md`.

## NEVER run destructive git operations without explicit permission.

- No `git reset --hard`, `git clean -fdx`, `git push --force`, `git checkout .`
  on files with uncommitted work, unless the user asks for that specific
  operation by name.

## NEVER run `git stash`. EVER.

- **`git stash` is banned outright.** Not `git stash push`, not `git stash --keep-index`,
  not `git stash pop`, not `git stash apply`, not even read-only `git stash list`.
  No variant. No "just to test something." No "I'll pop it right back."
- The reason: `git stash pop` can conflict on overlapping lines and leave
  unresolved conflict markers in the working tree. The recovery requires
  hand-resolving the markers, which trashes whatever curated index state
  the user had in flight. This has bitten the user before and it's bitten
  them again because of me. The rule is absolute now.
- If you think you need `git stash` to verify something (e.g. "does the
  staged-only state build cleanly in isolation?"), the answer is: **don't
  verify it that way.** Either:
    - Read `git diff --cached` and reason about whether the staged hunks
      are coherent on their own, OR
    - Ask the user to verify after they commit, OR
    - If verification is critical, ask the user to do the stash themselves
      with their tools — but recommend against it because of this rule.
- **There is no exception clause for `git stash`.** Not even "the user
  said it's OK this once" — the previous "one-time exception" for git
  staging operations is what led to the stash incident. Direct exceptions
  for `git add -p` / `git restore --staged` for staging-management remain
  permitted with explicit user approval, but `git stash` is permanently
  off-limits regardless of consent.

## NEVER run `git add`, `git commit`, or `git push`. EVER.

- **The user commits. You do not.** Do not stage files. Do not create commits.
  Do not amend commits. Do not push. Do not suggest running these commands
  yourself "to save a step". This includes `git add -p`, `git add .`,
  `git add <file>`, `git commit -m ...`, `git commit --amend`, `git push`,
  and any `gh pr create` that would auto-stage or auto-commit.
- If you are tempted to run any of these because "the work is done and it
  seems logical to commit" — STOP. The user has a review-and-commit workflow.
  Your job ends at a clean working tree with the changes ready to review.
- The ONLY exception is when the user says, verbatim in the current turn,
  "commit this" / "make a commit" / "push it" / similar direct imperative.
  Do not extrapolate from earlier intent, a plan that mentioned milestones,
  or any indirect signal. If in doubt, ask — don't commit.
- When a milestone plan says "STOP POINT — user reviews and commits": you
  stop. You do not commit. You do not prepare a commit. You hand off the
  working tree and wait.
