# AGENTS — Ogmios agent registry

Navigation document for all agents in `~/.claude/agents/`.

**Role:** navigation document, not a core artefact. The semantic-router continues to read `~/.claude/hooks/semantic-triggers.json`. AGENTS.md exists for transparency, DelegationGuard nudges, and weekly reporting.

**Preservation requirement:** code-engineer, security-engineer, and test-engineer remain explicit-only. They MUST NOT be auto-discovered.

## Research and processing agents

| Agent | Model | Triggers (summary) | Recommended skills | Recommended MCP | Status |
|-------|-------|-------------------|--------------------|-----------------|--------|
| **academic-researcher** | sonnet | phd, dissertation, thesis, literature review | academic, fact-check | zotero, arxiv, kb | active |
| **chronicle-researcher** | sonnet | chronicle, opinion piece, blog post | chronicle, fact-check | exa, brightdata, searxng | active |
| **intelligence-researcher** | sonnet | geopolitics, hybrid threats, foreign affairs | intelligence-* (signal/structure/context/synthesis) | exa, searxng, brightdata, kb | active |
| **person-researcher** | sonnet | person research, who is, background, profile | person-osint, financial-osint | linkedin, exa, brightdata | active |
| **meeting-processor** | sonnet | meeting notes, action items, follow-up | obsidian-note, fact-check | obsidian | active |
| **project-processor** | sonnet | project report, status report, deliverable summary | obsidian-note, technical-writing | obsidian | active |
| **source-processor** | sonnet | readwise, zotero, source to note | obsidian-note, fact-check | obsidian, zotero, brightdata | active |
| **ml-researcher** | sonnet | ml, ai models, huggingface, machine learning | engineering, technical-writing | huggingface, context7 | active |
| **social-researcher** | sonnet | social media, bluesky, social listening | social-post, fact-check | bluesky | active |
| **ux-researcher** | sonnet | ux, design patterns, accessibility | design | exa, brightdata | active |

## Explicit-only engineering agents

These never auto-discover. Invoke by `@agent-name` or direct naming.

| Agent | Model | Trigger | Skills | MCP |
|-------|-------|---------|--------|------|
| **code-engineer** | haiku | `@code-engineer` or "code review" | engineering, security | github, context7 |
| **security-engineer** | sonnet | `@security-engineer` or "security audit" | security, engineering | github, context7 |
| **test-engineer** | sonnet | `@test-engineer` or "test coverage" | engineering | github, context7 |

## Cross-vendor agents

These shell out to non-Claude vendors via helper scripts in `~/.claude/scripts/`.

| Agent | Bridge | Role | Skills | API script |
|-------|--------|------|--------|------------|
| **gemini-researcher** | Gemini Pro 2.5 | Long-context research (large reports, paper batches) | intelligence-* | `~/.claude/scripts/call-gemini` |
| **cato-auditor** | Gemini + GPT cross-check | Cross-vendor adversarial review of text or code | fact-check, thinking-redteam | `~/.claude/scripts/call-cross-vendor` |
| **image-creator** | Gemini Nano Banana Pro / GPT-Image-1 | Images for posts, presentations, social media | (none) | `~/.claude/scripts/call-image-api` |
| **forge-coder** | GPT-5 (direct API) | Cross-vendor code producer for important code projects | engineering, security, technical-writing | `~/.claude/scripts/call-openai` |

## Orchestration rules

### When to invoke a specialist agent (auto-discovery)
- A trigger phrase matches the agent description (via semantic-router detection).
- DelegationGuard nudges toward a specialist when `general-purpose` was selected despite a matching trigger.
- The Algorithm PLAN phase at Advanced+ tier selects at least one agent from this list (when triggers match).

### When NOT to invoke a specialist
- Explicit-only agents (code-engineer, security-engineer, test-engineer) — only when named.
- Trivial tasks where main-context competence suffices.

### Cross-vendor defaults

| Situation | Default agent | Reason |
|-----------|---------------|--------|
| Large documents (long reports, paper batches) | gemini-researcher | Gemini Pro 2.5 has a 2M-token context window |
| Text or code quality review at Advanced+ | cato-auditor | Cross-vendor perspective for blind-spot detection |
| Images for public sharing | image-creator | User review before publication |
| Complex code task | forge-coder | Cross-vendor producer for production-grade code |

### Cross-vendor security policy

**cato-auditor MUST NOT be used for:**
- Sensitive operational material classified by your organisation.
- Material under non-disclosure or with regulatory constraints.
- Personal data beyond publicly available OSINT.

**image-creator:** all generated images get a human review before public use.

**Cross-vendor data flow:** every call to Gemini or OpenAI sends data to a third party. Do not enable for sensitive contexts.

## Invocation flow

```
user prompt
  ↓
prompt-processor (mode + tier classification)
  ↓
semantic-router (reads semantic-triggers.json)
  ↓
DelegationGuard (nudges toward specialist when matched)
  ↓
[user/AI selects agent]
  ↓
Task tool → agent
  ↓
agent reads its skills and MCP whitelist
  ↓
[for cross-vendor: agent shells out to call-gemini / call-cross-vendor / etc.]
  ↓
agent returns output
  ↓
PostToolUse:Task → CapabilityAudit emits a capability.invoked event
```

## Version history

- **v3.0 (2026-05-02):** initial public release. 10 research agents + 3 explicit-only engineering agents + 4 cross-vendor agents.

## Dependencies

- **semantic-triggers.json** (`~/.claude/hooks/semantic-triggers.json`) — router input for auto-discovery
- **DelegationGuard.hook.ts** — proactive nudges from `general-purpose` to specialists
- **CapabilityAudit.hook.ts** — emits capability.invoked events for the Algorithm VERIFY phase
- **Capabilities.md** (`~/.claude/system/Capabilities.md`) — closed enumeration of thinking-skills (subset of this document)
