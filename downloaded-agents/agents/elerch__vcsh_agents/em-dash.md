# Em-dash rules

Part of cross-project rules. Routed from `~/.claude/CLAUDE.md`.

## Em-dash usage — ASK FIRST

If you're about to write an em-dash (`—`) anywhere (code, tests, doc
comments, commit messages, AGENTS.md prose), **stop and check whether a
regular ASCII hyphen (`-`) would do.** Most of the time it would. Em-dashes
look nice in prose but they create real problems:

- **In tabular output / TUI cells**, `—` is 3 bytes / 1 display column.
  Format strings that pad by byte count (e.g. Zig's `{s:>N}`) will leave
  any column containing em-dashes 2 visual columns short per em-dash.
  This bug recurs; don't reintroduce it. If you genuinely need a
  multibyte sentinel for "no data", use a display-column-aware padder —
  or just hard-code the cell as a literal const string when the cell
  width is fixed and the dash position is static (no point computing
  what you already know). Add an alignment test that compares the
  multibyte row's display columns against an ASCII row.
- **In code identifiers and string literals**, em-dashes look fine in
  your editor and break grep on the user's machine when they're searching
  with ASCII `-`. If a future grep for "expected-return" or "as-of"
  silently misses your "expected—return" string, that's a bug surface.
- **In commit messages and prose docs**, em-dashes are an AI tell. The
  user reads commit messages and won't appreciate the codebase looking
  like it was written by ChatGPT.

**Rule of thumb:**

- Use `-` (ASCII hyphen) for: ranges (`1-5y`), compound modifiers
  (`forecast-vs-actual`), CLI flag names (`--return-backtest`), code
  identifiers, and string concatenation in tables.
- Use `—` (em-dash) only when you're displaying it to the user as a
  meaningful sentinel (e.g. "no data" cell in a table), AND you've handled
  the display-column padding correctly.
- If you find yourself reaching for `—` in prose for a parenthetical
  aside, **switch to a regular dash, comma, or parens.** Em-dashes have
  become a stylistic AI tic and the user has explicitly asked to keep
  them out unless they earn their place.

When in doubt, **ask**. A one-line "I'm about to use `—` here for X, OK?"
is much cheaper than reverting after the user notices.
