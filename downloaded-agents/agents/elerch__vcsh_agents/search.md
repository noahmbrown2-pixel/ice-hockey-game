# Search rules

Part of cross-project rules. Routed from `~/.claude/CLAUDE.md`.

## NEVER invoke ripgrep. EVER.

**Do not run `rg` in the Bash tool.** Not for open-ended search, not for
counting matches, not for "just this one quick check", not ever. Running
ripgrep on this machine hammers the filesystem badly enough to degrade the
whole system — this is a recurring, reproducible problem, not a hunch.

**Use instead:**

- **Grep tool** (built-in) for content search. It handles regex, file
  globs, and output shaping without spawning `rg`.
- **Glob tool** (built-in) for finding files by name pattern.
- **Read tool** for reading files (with `offset`/`limit` for large ones).
- Plain `grep` via the Bash tool is acceptable when the built-in Grep
  tool can't express what you need — but prefer the built-in first.

**If you catch yourself typing `rg` in a Bash command:** stop, delete it,
use the Grep tool instead. The fact that `rg` is faster in the abstract
does NOT matter here. This machine's filesystem + ripgrep's parallelism
is a bad combination, full stop.

**This applies to every variant:** `rg`, `ripgrep`, piping through
`rg`, backgrounded `rg`, `rg --files`, etc. All banned.

**Also: never use `--follow` on any search command.** A runaway
`rg --follow` (or `find -L`, etc.) will sit there forever eating CPU.
