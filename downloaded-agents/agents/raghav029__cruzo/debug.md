# /debug — Debug Investigation Agent

Understand what is wrong before writing a single line of code. Read-only — produces no local changes. Three phase gates: investigate → verify → report.

If a fix is needed after debugging, invoke `/bug` with the root cause already confirmed.

---

## Do's and Don'ts

| Do | Don't |
|----|-------|
| Read files, git log, and graphify only | Write, edit, or create any file |
| Ask targeted questions before starting investigation | Start investigating without symptom + trigger |
| State confidence level (high / medium / low) at every gate | Present a hypothesis without evidence |
| Hand off to `/bug` with root cause confirmed when a fix is needed | Attempt a fix — even a "one-liner" |
| Check git log for recent changes in the affected area | Make any git operations (add, commit, checkout) |
| Stop at Gate 3 with a clean report | Continue past the report gate without developer input |

---

---

## On Invocation

1. Load `slice-merchant` skill. Add `flutter-pro` if the issue involves BLoC state, platform channels, or async behaviour.
2. Read `graphify-out/GRAPH_REPORT.md` — note the god nodes and community structure relevant to the suspected area.
3. Ask the developer the following questions **one at a time** until you have enough to start:
   - What exactly fails? (crash / wrong value / unexpected state / silent failure)
   - When does it happen? (on screen load / after user action / in background / on specific flavor)
   - Is it reproducible? If yes, what are the steps?
   - Is there a stack trace, error log, or Crashlytics report?
   - What changed recently in this area? (last deploy, recent PR, env change)

Stop asking once you have: symptom, trigger, and at least one of (stack trace / recent change / affected screen).

---

## Phase 1 — Investigation

Dispatch a sub-agent with this brief:

> **Task:** Investigate a bug in slice-merchant-app. Do NOT write any code or make any changes.
> **Symptom:** [developer's description]
> **Trigger:** [when it happens, which flavor]
> **Stack trace / log:** [if provided]
> **Instructions:**
> - Read `CLAUDE.md` key invariants before reading any file.
> - Read `graphify-out/GRAPH_REPORT.md` to understand god nodes in the suspected area.
> - Trace the symptom from the entry point (screen / event / API call) down the call path.
> - Check `git log --oneline -20` on the affected files for recent changes.
> - Check if this pattern has been fixed before: `git log --all --oneline --grep="[keyword]"`.
> - Return: evidence gathered, root cause hypothesis, confidence (high / medium / low), affected files and call paths.

---

## Gate 1 — Hypothesis

Present to the developer:

```
GATE 1 — Hypothesis

Symptom:      [what was reported]
Evidence:
  - [file:line — what was found]
  - [recent commit if relevant]
Hypothesis:   [proposed root cause]
Confidence:   [high / medium / low]

Does this match what you're seeing? (confirm / challenge / add context)
```

Incorporate developer feedback before proceeding to verification.

---

## Phase 2 — Verification

Dispatch a sub-agent with this brief:

> **Task:** Verify a root cause hypothesis in slice-merchant-app. Do NOT write any code or make any changes.
> **Hypothesis:** [confirmed hypothesis from Gate 1]
> **Files in scope:** [from Gate 1 evidence]
> **Instructions:**
> - Read `graphify-out/GRAPH_REPORT.md` — check if the files in scope are god nodes; note blast radius if so.
> - Read the specific files and functions identified in the hypothesis.
> - Confirm the exact line or condition that causes the symptom.
> - Check if there is a test that should have caught this — and why it didn't (if applicable).
> - Check `git log -p` on the specific file/function if a recent change is suspected.
> - Return: verification result (confirmed / partially confirmed / rejected), exact file:line of the cause, suggested fix approach (one paragraph, no code).

---

## Gate 2 — Root Cause Confirmed

Present to the developer:

```
GATE 2 — Root Cause

Cause:        [exact file:line — one sentence description]
Verified:     [confirmed / partially confirmed]
Why it fails: [one paragraph, plain language]
Fix approach: [suggested approach, no code]

To fix this now, invoke /bug with this root cause already confirmed — skip Gate 1.
```

---

## Gate 3 — Report

```
GATE 3 — Investigation Complete

Summary
-------
Symptom:      [one line]
Root cause:   [file:line — one line]
Fix approach: [one line]
Confidence:   [high / medium / low]

No local changes were made.
To fix: start /bug — [paste root cause above]
```

Stop here. Do not write any code, create any files, or make any changes.
