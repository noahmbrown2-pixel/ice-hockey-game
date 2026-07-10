# Claude Code Agents

This directory contains specialized agents for the repright development workflow. Each agent follows Anthropic's best practices with clear responsibilities and appropriate model selection.

## Available Agents

### 🏗️ code-architect (Opus)

**Purpose:** Feature planning and design
**When to use:** Before implementing new features or designing data models
**Tools:** Read, Grep, Glob

Designs feature implementations following repright's architecture. Outputs structured plans with data models, file structure, schemas, and implementation order.

### 👁️ code-reviewer (Opus)

**Purpose:** Pattern compliance validation
**When to use:** After implementing features or when reviewing changes
**Tools:** Read, Grep, Glob

Reviews code for compliance with repright's patterns. Reports violations with file:line references without fixing issues.

### ✂️ code-simplifier (Opus)

**Purpose:** Over-engineering detection
**When to use:** Before finalizing features to identify unnecessary complexity
**Tools:** Read, Grep, Glob

Identifies over-engineering and unnecessary complexity. Flags abstractions, dead code, and feature creep with simpler alternatives.

### ✅ build-validator (Haiku)

**Purpose:** CI validation (build/lint/format)
**When to use:** Before commits or when verifying build health
**Tools:** Bash, Read, Glob

Validates that repright passes all quality checks. Runs build, lint, and format checks in parallel and reports results without fixing issues.

### 🐛 debug (Sonnet)

**Purpose:** Error tracing and diagnosis
**When to use:** When encountering runtime errors or unexpected behavior
**Tools:** Read, Grep, Glob, Bash

Systematically traces and diagnoses errors. Identifies root causes and proposes minimal fixes following repright's error handling patterns.

### 🐰 coderabbit-tasks (Haiku)

**Purpose:** Code review feedback collection
**When to use:** When you want to get CodeRabbit review feedback and track fixes
**Tools:** Bash, Read, Write

Runs CodeRabbit review and captures all feedback items as trackable tasks in plans/prd.json. Each task gets `"completed": false` for progress tracking.

## Usage

Invoke agents using the Task tool with the `subagent_type` parameter:

```typescript
Task((subagent_type = 'code-architect'), (prompt = 'Design workout tracking feature'));
```

See [CLAUDE.md](../../CLAUDE.md#subagent-workflow) for the complete workflow and when to use each agent.

## Agent Structure

All agents follow this YAML frontmatter + instruction format:

```yaml
---
name: agent-name
description: Brief description for when to use this agent
tools: Tool,List,Here
model: opus|sonnet|haiku
---
<instructions>
What the agent does
</instructions>

<context>
Domain knowledge needed
</context>

<examples>
Real code examples
</examples>

<task>
Step-by-step approach
</task>

<output_format>
Expected output structure
</output_format>
```

## Model Selection

- **Opus:** Complex architectural decisions (code-architect, code-reviewer, code-simplifier)
- **Sonnet:** Code analysis and debugging (debug)
- **Haiku:** Fast validation tasks (build-validator, coderabbit-tasks)
