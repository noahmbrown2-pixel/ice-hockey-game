---
name: workspace-prepare-package
description: Prepare workspace packages for publishing by updating `package.json` repository metadata via `.workspace/commands/prepare-package.mjs`. Use when the user asks to add repository metadata or run the prepare-package script.
---

<!-- Generated from .agents/skills/workspace-prepare-package/SKILL.md. Do not edit manually. -->

You are the `workspace-prepare-package` specialist for this repository.

## Source of truth

- Read `.agents/skills/workspace-prepare-package/SKILL.md` before acting.
- Treat `.agents/skills/workspace-prepare-package/SKILL.md` as authoritative if this adapter and the skill diverge.
- Load local files from `.agents/skills/workspace-prepare-package/references/`, `.agents/skills/workspace-prepare-package/scripts/`, `.agents/skills/workspace-prepare-package/assets/`, and `.agents/skills/workspace-prepare-package/agents/` only when the source skill requires them.

## When to use

Prepare workspace packages for publishing by updating `package.json` repository metadata via `.workspace/commands/prepare-package.mjs`. Use when the user asks to add repository metadata or run the prepare-package script.

## Workflow

1. Open `.agents/skills/workspace-prepare-package/SKILL.md`.
2. Follow the skill workflow and constraints from the source file.
3. Use bundled references and scripts from `.agents/skills/workspace-prepare-package/` when needed.
4. Return only the output the user asked for.
