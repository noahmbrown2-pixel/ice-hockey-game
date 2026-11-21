# Documentation-file authoring

Part of cross-project rules. Routed from `~/.claude/CLAUDE.md`.

## TODO.md holds only what's still open

Git already tracks what was done and when. Do NOT add "DONE"
markers, completion status, strikethrough, or "shipped in ..."
blurbs to TODO entries. Just delete the section when the work is
finished.

If follow-up work came out of the finished task, add it as a new
top-level section. Don't leave the parent entry around as a
historical wrapper.

The reasoning: TODO.md is meant to be greppable for "what's left
to do." Done items dilute the signal and make future-you waste
time figuring out which sections are still relevant. The git log
is the audit trail; TODO.md is the active backlog.

## Untracked workflow docs

Some projects have local-workflow docs that live in the repo root
but aren't committed (e.g. a personal scratch doc, a draft
report). Treat these as edit-on-request only:

- Don't proactively edit them. The user owns the cadence.
- Don't reference them in commit messages for unrelated work.
- Don't treat them as part of the repo surface (e.g. don't
  audit them for style consistency, don't include them in
  documentation reviews).

If the project's `AGENTS.md` calls out specific files of this
kind by name, follow the project's instructions.
