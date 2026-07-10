# Lint discipline

Part of cross-project rules. Routed from `~/.claude/CLAUDE.md`.

## There are no "pre-existing" warnings

**Lint warnings get fixed, period.** Do NOT excuse a warning by
saying it was "pre-existing in the file" or "inherited from a
copy" or "the same style as elsewhere." That's how lint debt
accumulates to the point where the deny-warnings flag on the
pre-commit hook becomes a tripwire that everyone routes around.

The rule:

1. **Before any commit, run the linter on every file you touched
   in the change.** If the linter reports any warnings on those
   files, fix them in that change. There is no "I didn't
   introduce it, not my problem." Once you've touched the file,
   the warnings are yours.

2. **If you find pre-existing warnings in a file you didn't
   intend to touch** (e.g. you ran the linter across the whole
   tree for a sanity check), fix them in a SEPARATE commit and
   call that out to the user explicitly so they can keep the
   commits clean. Do not silently bundle drive-by lint fixes
   into a feature commit; the diff becomes harder to review and
   the lint-debt origin gets buried.

3. **Never report a lint result by saying "0 errors, N warnings,
   but they're all pre-existing."** Either:
   - Fix the warnings in this change (preferred when N is small
     or the file is yours), OR
   - Report "0 errors, 0 warnings on the files I touched. The
     wider tree has N warnings I haven't addressed in this
     change; flagging for follow-up." Only after you've
     confirmed by file that none of the wider-tree warnings
     are in files you modified.

The deny-warnings flag is on the pre-commit hook (when projects
have one) for a reason: every warning is a real signal that the
codebase asked the linter to flag and someone hasn't dealt with.
Treat them as errors at write-time, not as background noise to
ignore.

## Project-specific warning kinds

Linter-specific guidance (which warning codes mean what, and the
right fix per code) lives in the project's `AGENTS.md`. The rule
above is the discipline; the catalog is per-project.
