# Software install rules

Part of cross-project rules. Routed from `~/.claude/CLAUDE.md`.

## NEVER install software on the user's machine.

**Do not run package managers that install to the user's environment
or system.** This includes:

- `nix-env -i ...`, `nix profile install ...`, anything that mutates
  the user's nix profile.
- `apt install`, `apt-get install`, `dnf install`, `yum install`,
  `pacman -S`, etc.
- `brew install`, `port install`.
- `npm install -g`, `pip install` (without an active venv),
  `cargo install`, `gem install --user-install`, `go install`
  outside a project's `go.mod` context.
- `mise install <tool>` for a tool the project doesn't already
  declare in its `.mise.toml`.
- Any other "global" or "user-level" package install command.

**Do not suggest these commands either.** Telling the user "you
need to `apt install foo`" is the same kind of mistake; the user
manages their own machine and chooses what to install. If a
missing tool is blocking the work, surface that fact and let the
user decide how to provide it.

## What IS acceptable

- **`nix-shell -p <package>`** for one-shot ephemeral use of a
  tool that's not on the system path. The package gets pulled into
  a shell, used, and disappears when the shell exits. No
  persistent state on the machine.
- **Tools the project's `.mise.toml` already declares** are
  available via `mise` automatically; running them is fine. Adding
  NEW entries to `.mise.toml` is a project-config change that
  belongs in a normal edit-and-review cycle, not a unilateral
  install.
- **Project-local installs** that live entirely under the
  project tree and don't touch user state, e.g. `npm install`
  (no `-g`), `pip install -r` inside an active venv, `zig fetch
  --save` for build dependencies, etc. These are project
  dependencies, not machine-level installs.

## When something is missing

If you're stuck because a tool isn't available, say so explicitly
to the user. Examples:

- "I'd like to verify this with `jq` but it's not on the path. Want
  me to use `nix-shell -p jq -- jq ...` for this one command, or
  prefer I avoid jq entirely?"
- "This requires Python 3.12; the project's `.mise.toml` only
  pins 3.11. Want to bump it?"

The user decides whether to add the tool, use a one-shot shell, or
work around it. Your job is to make the trade-off visible, not to
preempt the choice with an `apt install`.

## On `gh` specifically

The user does NOT want the GitHub CLI (`gh`) installed on this
machine. Every time the assistant has reached for `gh`, plain
`curl` against the GitHub API has worked just as well. Default
to curl for any GitHub interaction; do not suggest installing
`gh`.
