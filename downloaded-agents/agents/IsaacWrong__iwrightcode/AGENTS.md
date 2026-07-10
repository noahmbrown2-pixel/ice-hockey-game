# Agent Team

This project uses a team of specialized agents managed by the main Claude session. The main session acts as a **manager** — delegating to the right agent based on context.

Agents live in `.claude/agents/`. Core project agents are at the root; specialist library agents are in subdirectories (e.g. `.claude/agents/engineering/`). All are auto-discovered by Claude Code.

## Core Project Agents

| Agent | Command | Model | When to Invoke |
|-------|---------|-------|----------------|
| Tester | `/tester` | haiku | After code changes — runs Jest, flags failures |
| Reviewer | `/reviewer` | haiku | Before every commit |
| Debugger | `/debugger` | sonnet | When user describes a bug or error |
| Scout | `/catchup` | haiku | Start of a new session or topic |
| Planner | `/planner` | sonnet | Before starting a feature or complex fix |
| Guardian | `/guardian` | haiku | Backend data integrity, Supabase queries, RLS |
| Tasks | `/tasks` | haiku | List, create, update, and close GitHub Issues |

## Specialist Library

On-demand specialists invoked by name via the Agent tool. Use these for deeper domain work beyond what core agents cover.

**Engineering**
| Agent Name | File | When to Invoke |
|------------|------|----------------|
| Database Optimizer | `engineering/engineering-database-optimizer` | Supabase query tuning, index design, slow RPC diagnosis |
| Security Engineer | `engineering/engineering-security-engineer` | Security audit, auth hardening, API threat modeling |
| Backend Architect | `engineering/engineering-backend-architect` | API design decisions, service layer patterns |
| Software Architect | `engineering/engineering-software-architect` | Major architectural decisions, refactors |
| Frontend Developer | `engineering/engineering-frontend-developer` | React/Next.js implementation, component patterns |
| Data Engineer | `engineering/engineering-data-engineer` | Upload pipeline architecture, ETL patterns |
| Git Workflow Master | `engineering/engineering-git-workflow-master` | Complex git operations, branching strategy |
| Rapid Prototyper | `engineering/engineering-rapid-prototyper` | Quick POCs, spike implementations |
| Technical Writer | `engineering/engineering-technical-writer` | Developer docs, API references, README files |

**Testing & Quality**
| Agent Name | File | When to Invoke |
|------------|------|----------------|
| Accessibility Auditor | `testing/testing-accessibility-auditor` | WCAG audit, screen reader testing, ARIA |
| API Tester | `testing/testing-api-tester` | API endpoint coverage, contract testing |
| Performance Benchmarker | `testing/testing-performance-benchmarker` | Load testing, Core Web Vitals, DB perf |
| Reality Checker | `testing/testing-reality-checker` | Pre-release quality gate — defaults to "NEEDS WORK" |

**Design**
| Agent Name | File | When to Invoke |
|------------|------|----------------|
| UX Architect | `design/design-ux-architect` | Component architecture, design system decisions |
| UX Researcher | `design/design-ux-researcher` | Usability issues, user flow analysis |
| Brand Guardian | `design/design-brand-guardian` | Brand/visual consistency across the app |
| UI Designer | `design/design-ui-designer` | Visual design, component styling, design systems |

**Product**
| Agent Name | File | When to Invoke |
|------------|------|----------------|
| Product Manager | `product/product-manager` | Product strategy, feature prioritization, roadmap |
| Feedback Synthesizer | `product/product-feedback-synthesizer` | Synthesizing user feedback into actionable issues |

**Operations**
| Agent Name | File | When to Invoke |
|------------|------|----------------|
| Legal Compliance Checker | `support/support-legal-compliance-checker` | Billing, privacy, terms, GDPR/CCPA compliance |
| Infrastructure Maintainer | `support/support-infrastructure-maintainer` | System reliability, performance ops, cost efficiency |

## Manager Delegation Rules

The main session (manager) automatically delegates based on context:

**Core agents (auto-delegated):**
1. **New session/topic** → invoke **scout** (`/catchup`) first to build context
2. **User describes a bug** → invoke **debugger**
3. **User finishes a code change** → invoke **tester** then **reviewer** before committing
4. **Before commits** → use `/commit` skill which runs **tester** → `npm run lint` → **reviewer** → commit
5. **User starts a new feature or complex fix** → invoke **planner** first to break it down
6. **Backend/data/Supabase concerns** → invoke **guardian**

**Testing & quality routing (pick by context):**
7. **Unit tests / Jest suite** → **tester** (knows the project stack)
8. **Pre-release or pre-PR quality gate** → **Reality Checker** (evidence-based, defaults to "NEEDS WORK")
9. **New API routes added** → **API Tester** (endpoint contract testing)
10. **Accessibility concern or WCAG audit** → **Accessibility Auditor** (full WCAG 2.1, screen reader)
11. **Performance regression or Core Web Vitals** → **Performance Benchmarker**

**Design routing (use specialists for deeper work):**
12. **Component architecture or design system decision** → **UX Architect**
13. **User flow or usability concern** → **UX Researcher**
14. **Brand/visual consistency** → **Brand Guardian**

**Other specialists (invoke on explicit need):**
15. **Slow queries, index issues, RPC performance** → **Database Optimizer**
16. **Security concern, auth review, new public API** → **Security Engineer**
17. **Major architectural decision** → **Software Architect** alongside **Planner**
18. **Compliance question (billing, data, GDPR)** → **Legal Compliance Checker**

## Agent Handoff Format

When delegating to an agent, the manager passes a structured handoff. **For specialist library agents, always include the project workflow block** — they are generic agents and won't know the project conventions otherwise.

```
## Handoff
**Goal**: [what needs to be done]
**Changed files**: [list of files modified in this session, if any]
**Relevant context**: [1-2 sentences of background]
**Specific ask**: [exact question or task for the agent]

## Project Workflow (required for all agents)
**Memory**: Read your persistent memory at `.agent-reports/memory/agent_<your-name>.md` before starting (use underscores, lowercase — e.g. `agent_ux_architect.md`). Update it at the end of your session with new patterns or decisions learned. Memory is for **reusable patterns and decisions**, not session logs, issue lists, or audit findings — those belong in reports only. Keep memory under 150 lines. Never store secrets, API keys, or PII in memory files.

**Session context**: Read `.agent-reports/scout/session-context.md` if it exists.

**Issues**: For every issue you find, create a GitHub Issue:
  gh issue create --title "<title>" --body "<body>" \
    --label "agent:<your-name>,priority:<critical|high|medium|low>,area:<frontend|backend|data|auth|billing|accessibility|testing>"

Before creating, check for duplicates:
  gh issue list --search "<keywords>"

**Reports**: Flag issues — do NOT auto-fix. Write a report to `.agent-reports/<agent-name>/YYYY-MM-DD_<description>.md`.
```

This keeps agent input consistent and token-efficient.

## Agent Behavior

All agents — core and specialist — follow these rules in this project:

- **Flag, don't fix**: Agents explain issues and suggest fixes but do NOT auto-apply changes
- **GitHub Issues**: Every finding becomes a GitHub Issue with `agent:*`, `priority:*`, `area:*` labels (see workflow block above)
- **Duplicate check first**: Always run `gh issue list --search "<keywords>"` before creating a new issue
- **Reports**: Write to `.agent-reports/<agent-name>/YYYY-MM-DD_<description>.md`
- **Session context**: Read `.agent-reports/scout/session-context.md` for project state before starting
- **Token efficiency**: Haiku for most agents; sonnet only for agents needing deep reasoning (debugger, planner)
- User can manually invoke any agent anytime via its slash command

## GitHub Issues Integration

Agents auto-create GitHub Issues when they find problems. Every issue gets:
- An `agent:<name>` label (who found it)
- A `priority:<level>` label (critical/high/medium/low)
- An `area:<name>` label (frontend/backend/data/auth/billing/accessibility/testing)

Agents check for duplicates before creating. Scout pulls open issues during `/catchup`.

Use `/tasks` to list, create, close, or search issues from the CLI.

### Issue Closing Convention

This project uses a `feature/* → dev → main` branching strategy. GitHub auto-close only fires when a PR merges into the **default branch** (`main`). To ensure issues close at the right time:

**Put `Closes #N` in the dev→main PR description**, not in individual commit messages. This guarantees auto-close fires only when code actually lands in `main`.

```
## Summary
- Fix auth error copy on reset-password page
- ...

Closes #451
```

Multiple issues: `Closes #383, #388, #401`

**Do not** put `Closes #N` in commit messages on feature or fix branches — those commits move through `dev` first and will trigger premature auto-close.

Do not close issues manually unless the fix was already merged to `main` without a reference.

### Issue Closing Rules

When a fix is verified (tests pass, code reviewed, change committed):
- **`priority:low` and `priority:medium`** → auto-close with a comment linking the commit. No confirmation needed.
- **`priority:high` and `priority:critical`** → always ask the user to confirm before closing.

## Reports & Memory

- **Reports**: `.agent-reports/<agent>/YYYY-MM-DD_<description>.md` (tracked in git, auto-cleaned weekly)
- **Session context**: `.agent-reports/scout/session-context.md` (overwritten each session by scout)
- **Agent memory**: `.agent-reports/memory/agent_<name>.md` (tracked in git, syncs across devices, reviewed weekly)
- **Weekly cleanup**: `/housekeeping` skill prunes reports >7 days old and flags stale memories
- **Sensitive data**: Never store secrets, API keys, or PII in agent reports or memory files
