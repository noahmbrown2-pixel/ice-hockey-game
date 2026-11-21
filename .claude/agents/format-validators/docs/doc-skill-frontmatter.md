---
name: doc-skill-frontmatter
description: Validate SKILL.md frontmatter — name, description, allowed-tools
model: claude-haiku-4-5-20251001
allowed-tools: Read
team: docs
severity_default: P1
---

# Docs — Skill Frontmatter Validator

Validates `.claude/skills/*/SKILL.md` files for correct YAML frontmatter.

## Required frontmatter keys

| Key | Severity | Description |
|---|---|---|
| name | P0 | Skill identifier (lowercase, kebab-case) |
| description | P0 | One-sentence trigger description |
| allowed-tools | P1 | List of tool names; empty list OK if skill is purely informational |

## Optional but recommended
- `model` — preferred Claude model (e.g., `claude-haiku-4-5-20251001`)
- `tags` — categorization
- `version` — semver or date

## Rules

| Rule | Severity | Description |
|---|---|---|
| frontmatter-present | P0 | File starts with `---` block |
| name-matches-dir | P1 | `name:` value matches parent directory name |
| description-not-empty | P0 | Description is ≥ 20 chars |
| allowed-tools-array | P1 | If present, `allowed-tools` is a YAML list, not a string |
| no-deprecated-fields | P2 | Warn on `system_prompt:` (deprecated) and `tools:` (use `allowed-tools`) |

## Scope
- `.claude/skills/*/SKILL.md`
- `.claude/agents/format-validators/**/*.md` (this fleet — recursive validation)

## Output

Standard validator JSON contract.
