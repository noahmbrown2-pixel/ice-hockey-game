# Sub-Agents

Specialized AI assistants for specific tasks. Each agent runs in its own context with custom tools and model configuration.

## Available Agents

### Explore (Haiku, Read-Only)
Fast, cost-effective exploration:

- **explorer** - Codebase overview, feature scouting, pattern finding, dependency analysis

### Plan (Opus, Read-Only)
Powerful planning with multiple modes:

- **project-planner** - Multi-stage build plans for new applications (used by `/launch-app`)
- **planner** - Feature, architecture, and refactor planning

### Design (Opus, Skill-Driven)
Design direction and skill invocation:

- **designer** - UI/UX, mobile, and conversion design (invokes `/enhance-design`, `/design-system`, `/mobile-design`, `/conversion-audit`, `/style`)

### Implement (Sonnet, Full Access)
Balanced agents for code implementation:

- **feature-builder** - Full-stack feature implementation
- **test-writer** - Test file generation
- **debugger** - Bug investigation and fixes

## Usage Examples

Claude automatically delegates to agents based on the task. You can also explicitly request an agent.

### Explorer

Covers all exploration modes in one agent:

```
Explore this codebase and document the architecture
Scout the codebase for context to build a user notifications feature
What component conventions does this project use?
Analyze the dependencies in this project
```

### Planner

Feature, architecture, and refactor planning:

```
Break down the user authentication feature into tasks
Design the architecture for adding real-time collaboration
Plan a refactor to migrate from REST to GraphQL
```

### Designer

Design work applied through skills:

```
Improve the visual quality of this landing page
Optimize the checkout flow for mobile
The conversion rate is low — improve the landing page for signups
```

### Implement Agents

**feature-builder** — Full-stack features:
```
Build a user notifications feature with bell icon, dropdown, and mark-as-read
Add a dashboard page with analytics charts
```

**test-writer** — Test coverage:
```
Write tests for the authentication module
Add integration tests for the checkout API endpoints
```

**debugger** — Bug investigation:
```
Investigate why the login flow fails intermittently
This API endpoint returns 500 for certain inputs — find and fix the cause
```

## Workflows

### Feature Pipeline (explore → plan → build)

```
1. Use explorer to scout context for the feature
2. Use planner to break it into tasks
3. Use feature-builder to implement
```

### Investigation Pipeline (explore → debug → test)

```
1. Use explorer to understand the affected area
2. Use debugger to find and fix the root cause
3. Use test-writer to add regression tests
```

## Creating Custom Agents

Agents are Markdown files with YAML frontmatter:

```markdown
---
name: my-agent
description: When to use this agent
tools: Read, Grep, Glob
model: haiku
---

You are a specialist in [domain]. When invoked:
1. Understand the task
2. Execute systematically
3. Return clear results
```

### Model Selection

| Model | Cost | Speed | Best For |
|-------|------|-------|----------|
| haiku | $ | Fast | Exploration, search, simple analysis |
| sonnet | $$ | Medium | Implementation, code generation, reviews |
| opus | $$$ | Slower | Architecture, complex planning, design |

See [Agent Design Best Practices](../../docs/best-practices/agent-design.md) for details.
