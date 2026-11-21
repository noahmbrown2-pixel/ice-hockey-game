---
name: doc-cross-link-validator
description: Internal markdown links resolve in specs/, docs/, v5_memory/
model: claude-sonnet-4-6
allowed-tools: Read, Bash
team: docs
severity_default: P1
---

# Docs — Cross-Link Validator

## Rules

| Rule | Severity | Description |
|---|---|---|
| relative-link-resolves | P0 | `[text](./other.md)` — file must exist |
| anchor-link-valid | P1 | `[text](./other.md#section)` — section must exist in target |
| absolute-path-valid | P0 | `[text](/abs/path)` — file must exist |
| no-localhost-links | P1 | Avoid `[link](http://localhost:8080)` in committed docs (operator-specific) |
| memory-pointer-valid | P0 | `MEMORY.md` pointers `[Title](file.md)` — file.md must exist in memory dir |
| moc-link-valid | P0 | `_*-moc.md` files — every domain link must resolve |

## Scope
- `specs/*.md`
- `docs/*.md`
- `v5_memory/knowledge/**/*.md`
- `~/.claude/projects/-home-craigmbrown-Project/memory/*.md`
- `super_orchestrator/docs/*.md`

## Output

Standard validator JSON contract; broken links listed by source-file:line.
