# Filesystem rules

Part of cross-project rules. Routed from `~/.claude/CLAUDE.md`.

## NEVER write to `/tmp`. Use `$(cwd)/.tmp` instead.

- **`/tmp` is off-limits for any temporary file the assistant creates.**
  Not for scratch scripts, not for redirected stdout, not for `cp`
  backups, not for "just for a second" experiments. The user's workflow
  treats `/tmp` as their own space; assistant-created files there
  pollute it across sessions and hide from `git status`.
- Use `$(cwd)/.tmp/` (a `.tmp` directory at the repository root) for
  every transient file. `mkdir -p .tmp` if it doesn't exist;
  `.gitignore` it (or rely on a project-level `.gitignore` rule that
  catches it). Files in `.tmp` show up in `ls` next to the work,
  surface in `git status` if the ignore rule is wrong, and get
  cleaned up at the end of the task with a single `rm -rf .tmp/*`.
- This applies to:
    - Bash redirections: `cmd > .tmp/out` not `cmd > /tmp/out`.
    - Test fixture scratch files.
    - `cp file /tmp/file.bak` for "I'll restore in a sec" backups —
      use `cp file .tmp/file.bak` instead.
    - Heredoc-created throwaway scripts to test a code snippet
      (`zig run /tmp/foo.zig` → `zig run .tmp/foo.zig`).
- The ONE exception: temp files created by the system / by other
  tools (mise installations, the language toolchain's own cache
  symlinks, etc.) that legitimately use `/tmp`. Don't try to redirect
  those.

## NEVER delete or modify build caches. EVER.

This applies to any language toolchain's cache directory, not just one.
Examples include `.zig-cache`, `~/.cache/zig`, `~/.cache/zls`, `.gradle`,
`target/` (Rust/Cargo), `node_modules/.cache`, etc. The reasoning below
uses Zig as the canonical example because that's where the rule was
forged, but the rule applies universally.

**This means:**

- **NEVER** run `rm -rf .zig-cache` or `rm -rf .zig-cache/*` or any variant.
- **NEVER** run `rm -rf ~/.cache/zig` or touch anything under `~/.cache/zig/`.
- **NEVER** touch `~/.cache/zls/` or any other tool cache.
- **NEVER** suggest deleting the cache as a "fix" — it is not a fix, it is
  damage. Deleting `.zig-cache` while ZLS or another `zig build` is running
  creates a corrupt state where the build runner's expected cache entry
  (`.zig-cache/o/<hash>/build`) references a path that no longer exists,
  producing the error `failed to spawn build runner .zig-cache/o/<hash>/build:
  FileNotFound`. Recovering from this on the affected machine requires
  killing every concurrent `zig` process (including ZLS) and waiting for
  filesystem state to re-stabilize — it is NOT a simple retry.
- **NEVER** touch the cache "just to force a rebuild". Modern build
  caches are content-addressed. They do not get stale in a way that
  deletion fixes. If a build result looks wrong, the bug is in the
  source, not the cache. Use `touch <some_source_file>` if you truly
  need to invalidate one file's cache line. Do not nuke the whole
  directory.
- **NEVER** suggest a "different cache directory" as a workaround without
  an explicit, specific reason and explicit user approval. Flags like
  `--cache-dir` and `--global-cache-dir` exist; they are not toys.

**If a test result seems wrong or cached incorrectly:** the answer is
ALWAYS to investigate the source code or build graph, not to delete
cache. 99% of the time the "cached wrong result" is actually a test
discovery problem, not a cache problem.

**If you find yourself typing `rm -rf` anywhere near a cache path: STOP.
Ask the user instead.**
