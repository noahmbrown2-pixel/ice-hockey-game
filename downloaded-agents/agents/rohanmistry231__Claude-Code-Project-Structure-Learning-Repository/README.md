# `.claude/agents/` — Sub-Agents

Sub-agents are **specialist Claude instances** that the main Claude agent can spawn
to handle a focused, isolated task.

Think of them like calling in a specialist consultant: the main Claude is a generalist
handling your conversation, and it can call a sub-agent that has one narrow job and
does it very thoroughly.

---

## How Sub-Agents Work

```
You: "do a security audit before we deploy"
              ↓
Main Claude decides this needs the security-reviewer agent
              ↓
Main Claude spawns security-reviewer as a sub-process
              ↓
security-reviewer reads the codebase with its own focused checklist
              ↓
security-reviewer returns a structured report to main Claude
              ↓
Main Claude presents the findings to you
```

The sub-agent runs **independently** — it has its own context, its own instructions,
and its own output format. It does not share the main conversation's context.

---

## What Goes in an Agent File

An agent file is a Markdown file in `.claude/agents/` that defines:

```markdown
# Agent: <Name>

## Description
What this agent does and what it specialises in.

## When to Use
When should the main Claude spawn this agent?

## Agent Instructions
The detailed, step-by-step checklist the agent follows.

## Output Format
The exact structure the agent must use in its response.
```

---

## The `security-reviewer` Agent (This Project)

**File:** `.claude/agents/security-reviewer.md`

This agent performs a dedicated security audit with five checklists:

| Checklist | What it looks for |
|-----------|-----------------|
| Auth & Authorization | Routes missing token verification, ownership checks |
| Input Validation | SQL injection via string interpolation, unsafe file uploads |
| Sensitive Data Exposure | Passwords in responses, secrets in logs, raw error messages |
| Configuration | Hardcoded secrets, `allow_origins: ["*"]`, debug mode on |
| Rate Limiting | Missing rate limits on public endpoints, no pagination cap |

**Output example:**
```
## Security Review — Blog API

### CRITICAL (exploit risk — fix before deploy)
- [SQL INJECTION] services/post_service.py:42 — f-string used in raw query.
  Replace with parameterized query.

### HIGH (significant risk — fix soon)
- [MISSING AUTH] routes/comments.py:15 — DELETE /comments/{id} has no auth check.

### Summary
1 critical, 1 high, 0 medium issues found.
Recommendation: BLOCK DEPLOY
```

---

## Sub-Agents vs Skills vs Commands

| | Skills | Commands | Sub-Agents |
|---|--------|---------|-----------|
| **Who runs it** | Main Claude | Main Claude | Separate Claude instance |
| **Context** | Shares main chat | Shares main chat | Isolated, own context |
| **Best for** | Code review, writing | Workflows (`/deploy`) | Deep specialist analysis |
| **Output** | Inline in chat | Inline in chat | Report returned to main |
| **When to use** | Any time | You type `/command` | Main Claude decides |

**Use a sub-agent when:**
- The task requires long, focused, uninterrupted analysis
- You want to keep the main chat context clean
- The task is a specialist job (security, performance, accessibility)
- The task could be parallelised (e.g. review frontend and backend simultaneously)

**Use a skill instead when:**
- The task is quick (< 5 min of work)
- You want to see the thinking inline in the chat
- The task doesn't need isolation from the main context

---

## Creating Your Own Agent

1. Create a `.md` file in `.claude/agents/`:
   ```
   .claude/agents/performance-reviewer.md
   .claude/agents/accessibility-checker.md
   .claude/agents/db-migration-planner.md
   ```

2. Write the `## Agent Instructions` section as a **thorough checklist**.
   This is the most important part — be specific, not generic.

3. Define a clear `## Output Format` with headers and sections.
   The agent's output is returned as text, so structure helps the main Claude
   parse and present it clearly.

4. In `## When to Use`, write conditions that tell the main Claude when to
   spawn this agent automatically vs waiting for the user to ask.

---

## Multiple Agents at Once

The main Claude can spawn multiple sub-agents in parallel.

Example: before a major release, Claude could simultaneously spawn:
- `security-reviewer` → security audit
- `performance-reviewer` → check for slow queries
- `testing` skill → verify test coverage

All three run at the same time, then main Claude combines the results
into a single "release readiness report."
