# Claude Agents Registry
> **Location**: Agent Discovery & Configuration Layer  
> **Purpose**: Central registry of all available Claude agents  
> **Last Updated**: January 14, 2026

---

## What Is This

This is the **agent discovery hub** for the Fresh Schedules codebase. All Claude agents (AI assistants) used in this project are registered here with their invocation methods, capabilities, and documentation links.

---

## Quick Navigation

- [Available Agents](#available-agents) — Full agent catalog (18 total)
- [Agent by Purpose](#agent-by-purpose) — Agents grouped by function
- [Invocation Methods](#invocation-methods) — How to call agents
- [Setup Instructions](#setup-instructions) — Getting started
- [Hierarchy Integration](#hierarchy-integration) — Where agents fit in L0-L4

---

## Available Agents

### Discoverable Agents (With Invocations)

#### 1. UI/UX Specialist Agent ⭐

**Status**: ✅ Production-Ready  
**Directory**: `.claude/agents/ui-ux-specialist/`

**Purpose**: Professional UI/UX design review, accessibility audit, design system validation

**Invocation**:
- **@-mentions**: `@ui-ux` `@ui/ux` `@ux` `@design`
- **Slash commands**: `/ui-ux` `/design`
- **Keyboard**: `Cmd+Shift+U` (Mac) / `Ctrl+Shift+U` (Windows/Linux)

**Contexts**: Chat, PRs, issues, code review, textboxes (7 total)

**Capabilities** (13):
- Component design review, accessibility audits, color contrast, typography, responsive design, animations, form ergonomics, design system validation, mobile-first, keyboard navigation, auth UX, a11y, mobile patterns

**Config**: [AGENT.md](./ui-ux-specialist/AGENT.md) | [config.js](./ui-ux-specialist/config.js) | [Persona](../.github/prompts/ui-ux-agent.md)

**Tests**: ✅ 58/58 (100%)

---

#### 2. PR Specialist Agent

**Status**: ✅ Production-Ready
**Directory**: `.claude/agents/pr-specialist/`

**Purpose**: Full pull request lifecycle management - create, review, update, and merge PRs

**Invocation**:
- **@-mentions**: `@pr` `@pull-request` `@pr-specialist`
- **Slash commands**: `/pr` `/pull-request` `/create-pr`
- **Keyboard**: `Cmd+Shift+P` (Mac) / `Ctrl+Shift+P` (Windows/Linux)

**Capabilities**:
- PR creation with semantic titles
- PR review and status checking
- PR merging with strategy selection
- Branch management and cleanup

**Config**: [AGENT.md](./pr-specialist/AGENT.md) | [config.js](./pr-specialist/config.js)

---

#### 3. PR Conflict Resolver

**Status**: ✅ Available
**Directory**: `.claude/agents/pr-conflict-resolver.md`

**Purpose**: Handle merge conflicts, apply review feedback, merge PRs, clean up branches

**Invocation**: Agent-based (use in agent orchestration)

**Capabilities**:
- Merge conflict resolution
- Review comment implementation
- Branch cleanup & merge

**Config**: [pr-conflict-resolver.md](./pr-conflict-resolver.md)

---

### Command-Line Agents (Invokable via / commands)

These agents are designed for CLI-style invocation patterns. They are available in prompts and can be invoked through agent orchestration or explicit commands.

| # | Agent | Purpose | Prompt File | Status |
| --- | --- | --- | --- | --- |
| 1 | **Audit Agent** | Security audits, code quality checks | [`audit.prompt.md`](../.github/prompts/audit.prompt.md) | ✅ |
| 2 | **Create Implementation Plan** | Generate implementation plans for features | [`create-implementation-plan.prompt.md`](../.github/prompts/create-implementation-plan.prompt.md) | ✅ |
| 3 | **Deploy Agent** | Deployment workflows and release processes | [`deploy.prompt.md`](../.github/prompts/deploy.prompt.md) | ✅ |
| 4 | **Documentation Writer** | Technical documentation creation (Diátaxis framework) | [`documentation-writer.prompt.md`](../.github/prompts/documentation-writer.prompt.md) | ✅ |
| 5 | **Document Agent** | General documentation tasks | [`document.prompt.md`](../.github/prompts/document.prompt.md) | ✅ |
| 6 | **GitHub Copilot Starter** | Project setup and GitHub Copilot configuration | [`github-copilot-starter.prompt.md`](../.github/prompts/github-copilot-starter.prompt.md) | ✅ |
| 7 | **Implement Agent** | Code implementation and feature development | [`implement.prompt.md`](../.github/prompts/implement.prompt.md) | ✅ |
| 8 | **Iterate Agent** | Iterative improvements and refinements | [`iterate.prompt.md`](../.github/prompts/iterate.prompt.md) | ✅ |
| 9 | **Plan Agent** | Project planning and roadmap creation | [`plan.prompt.md`](../.github/prompts/plan.prompt.md) | ✅ |
| 10 | **Red Team Agent** | Security adversarial testing and edge case analysis | [`red-team.prompt.md`](../.github/prompts/red-team.prompt.md) | ✅ |
| 11 | **Review & Refactor Agent** | Code review and refactoring assistance | [`review-and-refactor.prompt.md`](../.github/prompts/review-and-refactor.prompt.md) | ✅ |
| 12 | **Review Agent** | General code review and feedback | [`review.prompt.md`](../.github/prompts/review.prompt.md) | ✅ |
| 13 | **Test Agent** | Test generation and quality assurance | [`test.prompt.md`](../.github/prompts/test.prompt.md) | ✅ |

---

## Agent by Purpose

### Design & UX
- **UI/UX Specialist** — Component design, accessibility, design systems

### Code Operations
- **Implement Agent** — Feature development and code implementation
- **Review Agent** — Code review and feedback
- **Review & Refactor Agent** — Code refactoring and improvement
- **Test Agent** — Test generation and quality assurance
- **Red Team Agent** — Security testing and edge case analysis

### Planning & Documentation
- **Plan Agent** — Project planning and roadmaps
- **Create Implementation Plan** — Feature implementation plans
- **Documentation Writer** — Technical documentation (Diátaxis framework)
- **Document Agent** — General documentation

### Deployment & Release
- **Deploy Agent** — Release management and deployment workflows
- **GitHub Copilot Starter** — Project setup and configuration

### Quality & Process
- **Audit Agent** — Security and quality audits
- **Iterate Agent** — Iterative improvements

### Git & Merge Operations
- **PR Conflict Resolver** — Merge conflict resolution and PR management

---

## Invocation Methods

### @-Mentions (Agent Discovery)

**UI/UX Specialist** is fully discoverable with @-mentions:

```
Chat:    @ui-ux review this button component
PR:      Comment: @ui-ux accessibility check
Issue:   Comment: @ux form ergonomics review
```

**Other agents** are invoked through agent orchestration or explicit command patterns.

### Slash Commands

**UI/UX Specialist** with slash commands:

```
Chat:    /ui-ux design review
         /design color system question
         
PR/Issue: /ui-ux accessibility audit
```

### Keyboard Shortcuts

Quick invocation for UI/UX Specialist:

| OS      | Shortcut      | Action              |
| ------- | ------------- | ------------------- |
| Mac     | `Cmd+Shift+U` | Insert @ui-ux       |
| Windows | `Ctrl+Shift+U` | Insert @ui-ux       |
| Linux   | `Ctrl+Shift+U` | Insert @ui-ux       |

### Autocomplete

Start typing trigger character and select from suggestions:

```
Type: @ui
Suggestions:
  • @ui-ux review
  • @ui/ux check
  • @ux quick feedback
  • @design system

Type: /des
Suggestions:
  • /design color system
  • /design typography
  • /design spacing
```

### Agent Orchestration

Command-line agents are invoked through agent orchestration system or explicit model instructions. They respond to structured requests like:

```
Use the plan agent to create a feature roadmap
Deploy using the deploy agent
Audit this code with the audit agent
Generate tests using the test agent
```

---

## Agent Roles & Responsibilities

### UI/UX Specialist Agent

**When to Use**:
- ✅ Design system validation (colors, spacing, typography)
- ✅ Accessibility audits (WCAG compliance, color contrast)
- ✅ Component design review (buttons, forms, modals, etc.)
- ✅ Auth UX feedback (login flows, password resets, etc.)
- ✅ Responsive design checks (mobile, tablet, desktop)
- ✅ Animation & micro-interaction review

**When NOT to Use**:
- ❌ General code review (use review agent)
- ❌ Performance optimization (separate focus)
- ❌ Backend API design (not UI/UX scope)
- ❌ Infrastructure/DevOps questions

**Interaction Model**:
- Provide specific component code or design decision
- Agent reviews against design system & WCAG standards
- Receives actionable feedback with examples
- No execution authority (recommendations only)

### Implement Agent

**Purpose**: Write production-ready code

**When to Use**:
- Feature development and implementation
- API endpoint creation
- Component implementation
- Database migrations
- Business logic implementation

### Review Agent

**Purpose**: Code review and feedback

**When to Use**:
- PR code review
- Implementation feedback
- Style and best practices
- Architecture feedback

### Test Agent

**Purpose**: Automated test generation

**When to Use**:
- Unit test generation
- Integration test creation
- E2E test development
- Test coverage improvement

### Audit Agent

**Purpose**: Security and quality audits

**When to Use**:
- Security vulnerability checks
- OWASP compliance audit
- Code quality assessment
- Dependency security review

### Deploy Agent

**Purpose**: Release management

**When to Use**:
- Deployment planning
- Release notes generation
- Rollout procedures
- Incident response

---

## Setup Instructions

### 1. Enable Agent Discovery

Ensure `.vscode/settings.json` has:

```json
{
  "claude.agents": {
    "enabled": true,
    "discoverable": true,
    "showAutocomplete": true
  },
  "claude.agentAutocomplete": {
    "enabled": true,
    "showSuggestions": true,
    "triggerCharacters": ["@", "/"]
  },
  "claude.mentions": {
    "enabled": true,
    "contextAware": true,
    "inPullRequests": true,
    "inIssues": true,
    "inCodeReview": true,
    "inTextBoxes": true
  }
}
```

### 2. Verify Agent Manifests

Each agent has an `AGENT.md` file with YAML frontmatter:

```yaml
---
name: "Agent Name"
description: "What this agent does"
invocations:
  mentions: ["@agent-name"]
  commands: ["/agent-name"]
contexts: ["chat", "pull-requests", "issues"]
keywords: [...]
tags: [...]
---
```

### 3. Test Discovery

In VS Code:
1. Open chat or PR comment
2. Type `@` and look for agent suggestions
3. Select from autocomplete
4. Agent loads with full capabilities

---

## Hierarchy Integration

### Where Agents Fit in L0-L4

```
L0: Canonical Governance (.github/governance/01-12)
  ├─ System rules, principles, policies
  ├─ Role definitions, approval processes
  └─ Authority hierarchy
  ↓
L1: Amendments (.github/governance/amendments/)
  ├─ Clarifications to L0
  ├─ Implementation details
  └─ Specialized protocols
  ↓
L2: Instructions (.github/instructions/)
  ├─ Agent behavior rules (01-05)
  ├─ Memory files (pattern learnings)
  └─ Domain-specific guidance
  ↓
L3: Prompts (.github/prompts/)
  ├─ Agent personas & detailed instructions
  ├─ Role definitions
  └─ Context-specific behaviors
  ↓
L4: Documentation (docs/) + Agents (.claude/agents/)
  ├─ Human-friendly guides (L4)
  ├─ Agent configurations & discovery (Agent Layer)
  └─ Operational runbooks
```

### Agent Layer Positioning

**Agent Registry (`.claude/agents/`)** sits at the **operational execution layer**:

- **Reports to**: L2 instructions + L3 prompts
- **Authority**: Governed by L0-L3 hierarchy
- **Discovery**: VS Code agent system (claude.agents.*)
- **Configuration**: YAML frontmatter + machine config (JS)

**Cross-References**:
- L3 (`.github/prompts/`) → Detailed agent persona
- L2 (`.github/instructions/`) → Agent behavior rules
- L4 (`docs/`) → Human-readable operation guides

---

## Agent Configuration Deep Dive

### AGENT.md (Discovery Manifest)

**Purpose**: Enable VS Code agent discovery system

**Location**: `.claude/agents/{agent-name}/AGENT.md`

**Structure**:
```markdown
---
[YAML Frontmatter]
  name, description, version
  invocations (mentions, commands)
  contexts (where available)
  keywords, tags
  autocomplete config
---
[Markdown Content]
  Quick reference
  Invocation table
  Links to detailed instructions
```

**Example**: [.claude/agents/ui-ux-specialist/AGENT.md](./ui-ux-specialist/AGENT.md)

### config.js (Machine Configuration)

**Purpose**: Machine-readable config for autocomplete, suggestions, integration

**Location**: `.claude/agents/{agent-name}/config.js`

**Exports**:
```javascript
module.exports.agent = {
  id: "ui-ux-specialist",
  invocations: { mentions, commands, aliases },
  contexts: { chat, pull-requests, issues, ... },
  autocomplete: { triggers, suggestions, debounce, ... },
  capabilities: [...],
  tags: [...],
  prIntegration: { templates, triggers },
  issueIntegration: { templates, triggers },
  shortcuts: { windows, mac, linux },
  settings: { ... }
}
```

**Example**: [.claude/agents/ui-ux-specialist/config.js](./ui-ux-specialist/config.js)

### Detailed Persona (Prompt File)

**Purpose**: Full agent instructions, personality, review checklists

**Location**: `.github/prompts/{agent-name}-agent.md`

**Content**:
- Agent mission & responsibilities
- Design principles & standards
- Review checklists & criteria
- Examples & patterns
- Edge cases & escalation rules

**Example**: [.github/prompts/ui-ux-agent.md](../.github/prompts/ui-ux-agent.md)

---

## Registering a New Agent

### Checklist for New Agents

- [ ] Create agent directory: `.claude/agents/{agent-name}/`
- [ ] Create `AGENT.md` with YAML frontmatter
- [ ] Create `config.js` with machine configuration
- [ ] Create/update detailed persona: `.github/prompts/{agent-name}-agent.md`
- [ ] Create `README.md` with setup & troubleshooting
- [ ] Create test suite: `scripts/test-{agent-name}-agent.js`
- [ ] Update `.vscode/settings.json` with agent config
- [ ] Run tests: Ensure 100% pass rate
- [ ] Add to this INDEX.md file
- [ ] Update `docs/INDEX.md` with reference
- [ ] Update `.github/instructions/INDEX.md` if applicable
- [ ] Create PR with full documentation

### Minimal Example

```markdown
// .claude/agents/my-agent/AGENT.md
---
name: "My Agent"
description: "..."
invocations:
  mentions: ["@my-agent"]
  commands: ["/my-agent"]
contexts: ["chat"]
keywords: ["..."]
tags: ["..."]
---

Quick reference...
```

---

## Troubleshooting

### Agent Not Appearing

**Check**:
1. `AGENT.md` exists with valid YAML frontmatter
2. `.vscode/settings.json` has `claude.agents.enabled: true`
3. Agent name matches invocation config
4. VS Code restarted after config changes

### Autocomplete Not Working

**Check**:
1. `claude.agentAutocomplete.enabled: true` in settings
2. `config.js` has autocomplete configuration
3. Trigger characters (`@`, `/`) are enabled
4. Min character count (usually 1) is met

### Agent Not in All Contexts

**Check**:
1. Context listed in `AGENT.md` frontmatter
2. `config.js` contexts match
3. `.vscode/settings.json` has context enabled
4. Integration type correctly configured

---

## Performance Notes

- **Discovery**: YAML frontmatter parsed on demand (zero latency)
- **Autocomplete**: JavaScript config loaded once, cached (~5ms)
- **Persona**: Full prompt loaded only when agent invoked (~50ms)
- **Total invocation time**: <100ms from mention to agent ready

---

## Related Documentation

- [L0-L4 Hierarchy](../.github/governance/INDEX.md) — Governance structure
- [Instructions Layer](../.github/instructions/INDEX.md) — Agent behavior rules
- [Documentation INDEX](../docs/INDEX.md) — Human-friendly guides
- [Master Directive](../.github/instructions/01_MASTER_AGENT_DIRECTIVE.instructions.md) — Core operational rules

---

## Complete Agent Catalog (12 L4a Agents)

### Design & Frontend
| # | Agent | Invocation | Purpose | Status |
| --- | --- | --- | --- | --- |
| 1 | **UI/UX Specialist** | `@ui-ux`, `@ux`, `@design` | Component design, accessibility, design systems | ✅ |

### Backend & API
| # | Agent | Invocation | Purpose | Status |
| --- | --- | --- | --- | --- |
| 2 | **Backend API Expert** | `@api`, `@backend` | API design, SDK patterns, request/response | ✅ |
| 3 | **Firebase Expert** | `@firebase` | Firebase config, rules, auth, deployments | ✅ |

### Security & DevOps
| # | Agent | Invocation | Purpose | Status |
| --- | --- | --- | --- | --- |
| 4 | **Security Red Teamer** | `@security`, `@redteam` | OWASP compliance, vulnerability testing, auth bypass | ✅ |
| 5 | **DevOps & Infrastructure** | `@devops`, `@infra` | Infrastructure, CI/CD, deployment, monitoring | ✅ |

### Testing & Quality
| # | Agent | Invocation | Purpose | Status |
| --- | --- | --- | --- | --- |
| 6 | **Test Engineer** | `@test`, `@qa` | Unit/E2E tests, coverage, test strategies | ✅ |
| 7 | **Code Review Expert** | `@review`, `@cr` | Code review, best practices, architecture | ✅ |

### Planning & Documentation
| # | Agent | Invocation | Purpose | Status |
| --- | --- | --- | --- | --- |
| 8 | **Plan Agent** | `@plan`, `@planning` | Strategic planning, roadmaps, milestones | ✅ |
| 9 | **Document Agent** | `@doc`, `@docs` | Code documentation, JSDoc, guides | ✅ |
| 10 | **Copilot Starter Agent** | `@setup`, `@copilot` | Copilot configuration, repository setup | ✅ |
| 11 | **Documentation Writer Agent** | `@writer`, `@write-docs` | Diátaxis documentation, tutorials, guides | ✅ |
| 12 | **Create Plan Agent** | `@create-plan` | Machine-readable plans, atomic tasks | ✅ |

### Git & Merge Operations
| Agent | Invocation | Purpose | Status |
| --- | --- | --- | --- |
| **PR Specialist** | `@pr`, `/pr`, `/create-pr` | Full PR lifecycle - create, review, merge, cleanup | ✅ |
| **PR Conflict Resolver** | (agent-based) | Merge conflicts, review feedback, PR cleanup | ✅ |

---

## Total Agent Ecosystem

| Category | Count | Status |
| --- | --- | --- |
| **Design & Frontend** | 1 | ✅ Active |
| **Backend & API** | 2 | ✅ Active |
| **Security & DevOps** | 2 | ✅ Active |
| **Testing & Quality** | 2 | ✅ Active |
| **Planning & Documentation** | 5 | ✅ Active |
| **Git Operations** | 2 | ✅ Active |
| **TOTAL L4a AGENTS** | **13 discoverable** | ✅ Complete |
| **TOTAL Ecosystem** | **14+ agents** | ✅ Full coverage |

---

## Last Updated

**January 16, 2026** — All 13 L4a agents completed and registered (added PR Specialist)

