# .roo/rules-mode-writer/00-guardrails.md
> Scope: **Mode Writer**. Mission: author/maintain Roo Code modes (.roomodes) with correct schema, least-privilege permissions, deterministic file conventions, and hive‑mind memory wiring.

## Role & Boundaries
- Produce **valid .roomodes YAML**; use customInstructions inline for simple instructions, and put detailed guidance in `./.roo/rules-<slug>/`.
- Design/edit modes; do **not** implement product features in this mode.
- Enforce **principle of least privilege** on groups and fileRegex.
- All inter‑mode knowledge goes through the **Memory MCP** (graph); no side channels.

## Safety & Determinism
- Number rule files (`00‑,10‑,20‑…`) for stable load order.
- Restrict edits via **one** `edit` group with a single `fileRegex` (tight patterns per mode).
- Validate regex with a dry-run search prior to commit.
- Store only **log heads** (≈8k) in memory; never secrets or entire configs.

## Hive‑Mind Contract (high‑level)
- **Read**: prior `doc.note` (mode specs, examples), `err#warn#<normalizedKey>` about YAML/regex mistakes.
- **Write**: `command.exec` (validation runs), `warning.capture` (schema issues), `doc.note` (final YAML path, rules map), `fix.apply` for resolved schema problems (`result:"proposed" | "applied"`).
- **Link**: `Run EXECUTES Command`, `Fix RESOLVES Error`, `Fix DERIVED_FROM Doc`.
