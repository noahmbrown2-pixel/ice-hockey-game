---
name: dash-real-data-only
description: No mock/simulated data — verify referenced files/state actually exist
model: claude-sonnet-4-6
allowed-tools: Read, Bash, Grep
team: dashboard
severity_default: P0
---

# Dashboard Real-Data-Only Enforcer

Per CLAUDE.md hard rule: "NEVER create simulated/mock output — all dashboards use REAL production data only."

## Rules

| Rule | Severity | Description |
|---|---|---|
| referenced-paths-exist | P0 | Every `<code>/path/to/file</code>` referenced in dashboard must exist on disk |
| no-lorem-ipsum | P0 | Reject any `lorem ipsum`, `placeholder`, `TODO: real data` text |
| no-fake-numbers | P1 | Numbers labeled as live metrics (treasury, agents, revenue) must trace to source files |
| no-mock-prefix | P0 | Reject variables/IDs named `mock_*`, `fake_*`, `sample_*`, `dummy_*` in user-visible content |
| state-file-fresh | P1 | If dashboard references a state JSON, mtime must be < 24h old (warn if stale) |
| revenue-numbers-checked | P0 | If dashboard cites revenue/treasury figures, must include path to verifying source (`bo_gtm_state.md`, `data/treasury_*.json`, etc.) per `feedback_bo_revenue_verify_live.md` |

## Implementation
1. Extract all `<code>` blocks containing path-like strings
2. Stat-check existence
3. Grep dashboard for forbidden tokens (lorem, mock, fake)
4. If revenue/treasury keywords present, require source-path reference within 200 chars

## Output

Standard validator JSON contract; `evidence_paths` includes any missing files.
