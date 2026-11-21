# Agent Dispatch Guide

Sol reads this file at session start. It defines which specialist handles each type of work,
how to invoke them via the `Agent` tool, and which can run in parallel.

---

## Dispatch Table

| Specialist | Trigger | Model | Can parallelize with |
|---|---|---|---|
| **Maya** | Any `frontend/src/` change — components, styles, i18n | `sonnet` | Elias, Kiran |
| **Elias** | Any `backend/` change — models, views, services, migrations | `sonnet` | Maya, Kiran |
| **Blythe** | After every implementation task; final gate before commit | `sonnet` | Nobody — runs last |
| **Kiran** | SODA/Geoclient data pipeline, Gemini API calls, ai_logic.py | `sonnet` | Maya, Elias |
| **Juno** | UX audit requests; any new UI feature before shipping | `sonnet` | Elias, Kiran |
| **Aris** | Post-sprint memory/docs sync; knowledge base updates | `sonnet` | Nobody — runs last |

---

## Invocation Pattern

```
Agent(
    description="[Specialist] — [task in 5 words]",
    subagent_type="general-purpose",
    model="sonnet",          # or "opus" for complex multi-file reasoning
    prompt="""
[Paste full contents of the specialist's .claude/agents/*.md file here]

---

## Your Task

[Specific task description with file paths, line numbers, and any
context the agent needs. Include what NOT to change.]
"""
)
```

**Rule:** Always include the full specialist definition file in the prompt —
the agent has no memory of previous sessions and needs its persona briefed each time.

---

## Parallelization Rules

- Maya + Elias can always run in parallel (different file trees)
- Maya + Kiran can run in parallel if Kiran is research-only
- Elias + Kiran can run in parallel if they touch different files
- Blythe runs AFTER all implementation agents complete
- Aris runs AFTER Blythe confirms clean
- Juno runs BEFORE or AFTER implementation — never during

---

## When to use `opus`

Default to `sonnet`. Use `opus` only when the task requires:
- Architecting a new service from scratch
- Multi-file refactors spanning backend + frontend
- Complex domain reasoning (e.g., redesigning the consensus algorithm)

---

## Knowledge Base (Two-Hop Protocol)

Before delegating implementation work, check the relevant map:

| Domain | Map file |
|---|---|
| Django 6.0 | `.knowledge_base/django_6_0_map.md` |
| React 19 | `.knowledge_base/react_19_map.md` |
| NYC APIs | `.knowledge_base/nyc_api_map.md` |
| AI / Gemini | `.knowledge_base/ai_intelligence_map.md` |
| Dev tools / uv | `.knowledge_base/dev_tools_map.md` |

Include the relevant leaf-file contents in the specialist's task prompt.
