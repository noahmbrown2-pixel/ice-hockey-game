---
paths:
  - "v5_memory/**"
  - "scripts/v5_*"
---

# V5 Knowledge Graph Rules

## 6-Tier Memory Hierarchy

| Tier | Source | Loaded |
|------|--------|--------|
| 1 | Project `CLAUDE.md` | Always |
| 2 | `.claude/rules/` | Path-matched |
| 3 | `~/.claude/CLAUDE.md` | Always |
| 4 | `CLAUDE.local.md` | Always |
| 5 | Auto Memory (`~/.claude/projects/.../memory/`) | Always (MEMORY.md) |
| 6 | V5 Knowledge Graph (`v5_memory/`) | On-demand via @imports |

## Capture Pipeline

All channels MUST use the canonical capture function:
```python
from scripts.v5_capture_adapters import capture_to_inbox
capture_to_inbox(channel="research", content=data, metadata={...})
```

**Never write directly to knowledge dirs** -- always go through `capture_to_inbox()`.

### 13 Capture Channels

lifelog, research, email, github, whatsapp, calendar, nostr, comedy, crypto, blindoracle, hooks, agents, manual

## 6R Processing Pipeline

`Reduce -> Reflect -> Reweave -> Verify -> Write -> Process`

- Queue runner: `scripts/v5_queue_runner.py` (processes inbox with priority ordering)
- Items land in `v5_memory/ops/queue/inbox/` then get processed to knowledge dirs

## Domain MOCs (7)

Located in `v5_memory/knowledge/domains/`:
- `_agents-moc.md`, `_research-moc.md`, `_crypto-moc.md`, `_comedy-moc.md`
- `_blindoracle-moc.md`, `_infrastructure-moc.md`, `_personal-moc.md`

## Note Format Requirements

All notes require YAML frontmatter with `_schema:`:
```yaml
_schema:
  type: claim|insight|reference|decision
  created: 2026-03-03
  confidence: high|medium|low
  source: channel-name
  tags: [tag1, tag2]
```

Wiki-links use `[[slug-name]]` format for cross-referencing.

## Key Constraints

- All channels MUST use `capture_to_inbox()` -- never bypass the 6R pipeline
- Invalid channel names cause silent drops -- use only the 13 listed channels
- Queue runner processes by priority: high > medium > low
- MOCs are auto-updated by the queue runner -- do not manually edit MOC link lists
