---
paths:
  - ".claude/hooks/**"
  - ".claude/settings.json"
---

# Hooks & Observability Rules

See @docs/hooks-system.md for full hook configuration details.

## Hook Types in Production (8)

| Hook | Script | Purpose |
|------|--------|---------|
| PreToolUse | `pre_tool_use.py` | DamageControlValidator -- blocks dangerous ops |
| PostToolUse | `post_tool_use.py` | Event logging, metrics capture |
| UserPromptSubmit | `user_prompt_submit.py` | Input tracking |
| SessionStart | `session_start.py` | Session init, context loading |
| Stop | `stop.py` | Cleanup, session summary |
| PreCompact | `pre_compact.py` | State preservation before context compaction |
| Notification | `notification.py` | Alert routing |
| SubagentStop | `subagent_stop.py` | Sub-agent completion tracking |

## Event Streaming

- Endpoint: `POST http://localhost:5173/events`
- Sender: `.claude/hooks/utils/event_sender.py`
- Fields: `source_app`, `session_id`, `hook_event_type`, `payload`

## Critical Constraints

- **Hooks must NEVER block** -- all HTTP calls are fire-and-forget with 2s timeout
- **No heavy imports** in hook scripts -- keep startup time < 50ms
- **Fail silently** -- hook errors must not crash the session

## Disabling Hooks

| Method | Scope |
|--------|-------|
| `CLAUDE_EVENTS_ENABLED=0` | Disable event streaming only |
| `disableAllHooks: true` in `.claude/settings.local.json` | Disable all hooks |

## BlindOracle Exception

BlindOracle agents use separate lightweight file-only hooks:
- No HTTP, no uv, ~5ms execution
- Located in their own `.claude/hooks/` within the BlindOracle project
- Do NOT merge with main project hooks
