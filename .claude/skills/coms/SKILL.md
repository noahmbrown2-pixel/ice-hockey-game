---
name: coms
description: Peer-to-peer flat agent messaging — port of Pi's coms extension. Four tools (list/send/get/await) for bidirectional agent-to-agent dialogue. Use when two agents need to negotiate or exchange context without an orchestrator.
allowed-tools: Bash, Read
version: 0.1.0
---

# /coms — Peer-to-Peer Agent Comms

**Role:** You are a peer in flat agent-to-agent comms — you exchange signed messages with another agent as an equal (list / send / get / await), with no orchestrator. You message and negotiate only; you do not delegate or spawn child agents.

**Output:** Each exchange returns a `{msg_id, from, to, body, hmac}` record; reply with one message per turn.

**RQ-232** — port of `disler/pi-vs-claude-code/extensions/coms.ts` (51K TS → 300 lines Python). Flat agent-to-agent messaging on the same machine. No orchestrator, no parent/child. Two agents talk as equals.

## When to use
- Two agents need to **negotiate** before settling (e.g., BO marketplace pricing).
- A prod-side agent needs to **answer a dev-side question** without leaking PII (redact at the boundary).
- **Heterogeneous models** (Opus + Grok + Gemini) want to talk directly, not via orchestrator round-trips.
- Anything where the hierarchical Task-tool pattern loses signal because results have to climb back through layers.

## Four tools

| CLI | What it does |
|---|---|
| `coms list` | List registered peers + their inbox depth |
| `coms send --to NAME --prompt "..."` | Send a prompt; returns `msg_id` immediately |
| `coms get --msg-id ID` | Non-blocking poll: `pending` / `complete` / `error` |
| `coms await --msg-id ID --timeout 1800` | Block until reply or timeout |

Plus admin: `register`, `inbox`, `listen`, `reply`.

## Quick start (two-terminal demo)

```bash
# Terminal 1 — register a responder + start listening
python3 scripts/coms.py register --name planner --purpose "Plans work"
python3 scripts/coms.py listen --name planner --max-iter 100

# Terminal 2 — peer sends a question and awaits the reply
python3 scripts/coms.py register --name coder --purpose "Writes code"
MSG=$(python3 scripts/coms.py send --to planner \
        --prompt "What modules need touching for auth refactor?" \
        --sender coder | jq -r .msg_id)
python3 scripts/coms.py await --msg-id "$MSG" --timeout 300
```

## Storage layout
`$COMS_ROOT` (default `~/.thebaby/coms/`):
- `agents/<name>.json` — registry (name, model, purpose, color, pid, **shadow**)
- `inbox/<name>.jsonl` — fcntl-locked incoming queue
- `replies/<msg_id>.json` — reply correlation file
- `audit.jsonl` — append-only audit of every send + reply

## Observability (Patch A + B, 2026-05-19)

**Shadow observer peers** (Patch B): register with `--shadow` to get CC'd on every send.
```bash
python3 scripts/coms.py register --name fleet-observer --purpose "spy" --shadow
python3 scripts/coms.py listen --name fleet-observer  # passive — no replies written
```
Shadow inbox messages carry `shadow_copy: true` + `shadow_of: <original_msg_id>`. `serve_loop` auto-skips `write_reply` for them so they don't collide with the real recipient's reply.

**Live watch** (Patch B): tail audit.jsonl with pretty-print + filters:
```bash
python3 scripts/coms.py watch              # tail-f from EOF
python3 scripts/coms.py watch --from-start # full history
python3 scripts/coms.py watch --event send --from bob
python3 scripts/coms.py watch --json       # raw JSON for piping
```

**Full-body audit** (Patch A): set `COMS_AUDIT_FULL_BODY=1` to include prompt + response bodies in `audit.jsonl` (default metadata-only for PII safety).

## Hooks into existing rails
- Every `coms_send` writes to `audit.jsonl` — same shape as our action ledgers.
- Naturally extensible to emit a `ProofOfDelegation` (kind 30014) per send so the existing HMAC proof rail covers peer messaging too.
- Receiver-side `listen` uses the `claude -p` OAuth-fallback pattern from `session_20260501_claude_cli_invoke_fix.md` (strips non-`sk-` `ANTHROPIC_API_KEY` so CLI uses OAuth).

## Tests
`tests/test_coms.py` — 10 tests covering register/list/send/get/await/inbox-pop/audit/round-trip/CLI.

## Not yet implemented
- Networked variant (Pi's `coms-net`). Needs an HTTP+SSE hub. Track as RQ-233.
- Auto-emit of `ProofOfDelegation` on every send. Track as RQ-234.
- Live TUI widget showing peer pool. Out of scope until CC supports above-input widgets.
