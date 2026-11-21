---
name: declare-intent
description: Declare session intent (purpose-gate equivalent from Pi). Forces a single-line statement of what this session is for, before tools fire. Reduces drift to busywork.
allowed-tools: Read, Write
version: 0.1.0
---

# /declare-intent

**Role:** You are the session purpose-gate — you capture a single one-line statement of what this session is for and persist it before non-trivial tools fire. You record and surface intent only; you do not act on it.

**Plan A item 1 (RQ-189)** — port of Pi's `purpose-gate` extension. Forces explicit
declaration of session purpose before non-trivial tool calls. Persists to
`super_orchestrator/state/session_intent.json` for the Super Orchestrator daemon
and downstream tools to consume.

## Why
The DITD pipeline keeps re-learning the same failure mode: agents drift into
busywork because nobody declared what "done" looks like. Pi's `purpose-gate`
proves a one-line gate measurably reduces drift.

## Usage
```bash
# Imperative — call with the intent string
/declare-intent "Build Plan A scaffolding (28 validator agents + utilities)"

# Read current intent
/declare-intent --show

# Clear (e.g., new session)
/declare-intent --clear
```

## State file
`super_orchestrator/state/session_intent.json`:
```json
{
  "session_id": "<from CC harness>",
  "intent": "<one line>",
  "declared_at": "ISO8601",
  "declared_by": "user|tb-voice|inferred",
  "valid_until": "ISO8601 (default = session end + 1h)",
  "expected_deliverables": ["<optional list>"]
}
```

## Integration points (future, not Plan A)
- `session_start.py` hook reads this and warns if missing
- `tilldone` (focus_tracker.py) compares each tool call's target against intent
- Super Orchestrator decision_engine.py uses intent to score rule R8 (drift detection)
- Stop hook compares actual deliverables against `expected_deliverables`

## Plan A scope
Skill spec only. Hook integration is deferred to the follow-up DITD plan
(`plan-rq-190-pi-concept-parity-hooks.md`).

## Implementation note
Intent strings are written verbatim. No LLM normalization. Keep them human.
