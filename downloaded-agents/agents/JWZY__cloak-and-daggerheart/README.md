# Multi-Agent System

Talk to **@orchestrator only**. It delegates work to specialized subagents automatically.

## Quick Start

**Claude automatically takes the @orchestrator role** when you open this project (configured in CLAUDE.md).

Just start talking:

- "Add a dark mode toggle"
- "Fix the bug where HP doesn't save"
- "What's the current status?"
- "Redesign the level-up flow"

The orchestrator will:
1. Break down your request
2. Spawn the right subagents (@frontend, @ux)
3. Collect their work
4. Report back to you

## How It Works

```
You → @orchestrator → spawns → @frontend (designs + builds in code)
                    → spawns → @ux (reasons through flows)

     ← summarizes results ←
```

## Zero-Vector Design

This project follows a zero-vector design approach — no separate design phase, no Figma-to-code handoffs, no translation layer.

- **@frontend is a designer-developer.** It makes visual design decisions while writing code. There is no separate creative agent.
- **@ux is a thinking partner.** It reasons through flows and makes decisions, not formal spec documents.
- **Figma is a napkin sketch.** If referenced, it's inspiration — not a contract to match pixel-for-pixel.
- **The code is the design.** Components are designed, built, and polished in a single pass.

## Subagents

| Agent | Role | Spawned For |
|-------|------|-------------|
| **@frontend** | Designer-Developer | Design + code, bugs, tests, visual polish |
| **@ux** | UX Thinking Partner | Complex flows, interaction decisions, UX critique |
| **@tester** | QA | Edge cases, E2E tests, break things |
| **@repo** | Repo Manager | Git commits, build verification |

## Context Files

Work is tracked in `.claude/agents/context/`:

| File | Purpose |
|------|---------|
| `current-sprint.md` | Active tasks and status |
| `handoffs.md` | Agent outputs and decisions |
| `decisions.md` | Architecture/design decisions |
| `backlog.md` | Future work |

## Example Session

```
You: "Add a button to export character as JSON"

Orchestrator: "I'll get that done. Spawning @frontend..."

[spawns @frontend — designs where the button goes, builds it, polishes it]

Orchestrator: "Done! Added export button to Notes tab.
              Files changed:
              - src/hand/panels/NotesPanel.tsx
              - src/core/character/export.ts

              Tests pass. Want me to do anything else?"
```

## Tips

- **Be specific** — "Add dark mode" is better than "make it look better"
- **Ask for status** — "What's in progress?" to see current work
- **Complex features** — The orchestrator will use @ux to think through the flow before @frontend builds
- **Simple features** — @frontend handles design + code in one shot

## Direct Agent Access (Advanced)

If you ever need to bypass the orchestrator and work with an agent directly:

```
Read .claude/agents/frontend.md and take that role
```

But normally, just stick with the orchestrator.
