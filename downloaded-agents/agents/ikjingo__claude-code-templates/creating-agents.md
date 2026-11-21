# Creating Agents

This guide explains how to create specialized sub-agents for Claude Code.

## What is an Agent?

An agent is a specialized Claude instance with:
- Focused expertise in a specific domain
- Limited tool access (for safety and efficiency)
- Custom instructions and output format
- Independent context from main conversation

## Agent Structure

Each agent is a markdown file in `.claude/agents/`:

```markdown
---
name: my-agent
description: Brief description (shown in Task tool)
tools: Read, Write, Edit, Bash
model: sonnet
---

# My Agent

[Instructions and guidelines]
```

## Creating a Basic Agent

### Step 1: Create the Agent File

```bash
touch .claude/agents/my-agent.md
```

### Step 2: Write the Agent Definition

```markdown
---
name: my-agent
description: Specialized agent for [purpose]
tools: Read, Write, Edit
model: sonnet
---

# My Agent

You are a specialized agent focused on [domain/task].

## Focus Areas

- Area 1: [Description]
- Area 2: [Description]
- Area 3: [Description]

## Approach

1. First, [step 1]
2. Then, [step 2]
3. Finally, [step 3]

## Output Format

Provide results in the following format:

### Summary
[Brief summary]

### Details
[Detailed findings]

### Recommendations
[Actionable recommendations]

## Guidelines

### Do
- ✅ [Recommendation 1]
- ✅ [Recommendation 2]

### Don't
- ❌ [Anti-pattern 1]
- ❌ [Anti-pattern 2]
```

## Frontmatter Reference

### Required Fields

| Field | Description |
|-------|-------------|
| `name` | Agent identifier (must match filename) |
| `description` | Brief description shown in Task tool |
| `tools` | Comma-separated list of allowed tools |

### Optional Fields

| Field | Default | Description |
|-------|---------|-------------|
| `model` | `sonnet` | Model to use (haiku/sonnet/opus) |

### Available Tools

| Tool | Description |
|------|-------------|
| `Read` | Read files |
| `Write` | Create/overwrite files |
| `Edit` | Edit existing files |
| `Bash` | Execute shell commands |
| `Grep` | Search file contents |
| `Glob` | Search file patterns |
| `TodoWrite` | Manage task lists |
| `WebFetch` | Fetch web content |
| `WebSearch` | Search the web |

## Model Selection Guide

| Model | Cost | Speed | Use Case |
|-------|------|-------|----------|
| `haiku` | Low | Fast | Simple tasks, quick lookups |
| `sonnet` | Medium | Medium | Most development tasks |
| `opus` | High | Slow | Complex analysis, deep reasoning |

## Agent Examples

### Code Reviewer Agent

```markdown
---
name: code-reviewer
description: Reviews code for quality, security, and best practices
tools: Read, Write, Edit, Bash, Grep
model: sonnet
---

# Code Reviewer

You are an expert code reviewer focused on quality, security, and maintainability.

## Focus Areas

- Code Quality: Readability, simplicity, DRY principles
- Security: OWASP top 10, secrets, injection vulnerabilities
- Performance: N+1 queries, memory leaks, algorithmic complexity
- Testing: Coverage, edge cases, test quality

## Approach

1. Identify the scope of changes (git diff)
2. Analyze each changed file
3. Check for security issues first
4. Review code quality and patterns
5. Suggest improvements with priority

## Output Format

### 🔴 Critical Issues
[Must fix before merge]

### 🟡 Suggestions
[Recommended improvements]

### 🟢 Good Practices
[Positive observations]

## Guidelines

### Do
- ✅ Focus on the diff, not entire files
- ✅ Provide specific, actionable feedback
- ✅ Include code examples for suggestions
- ✅ Prioritize issues by severity

### Don't
- ❌ Nitpick style issues (leave for linters)
- ❌ Suggest refactoring unrelated code
- ❌ Be harsh or unconstructive
```

### API Designer Agent

```markdown
---
name: api-designer
description: Designs RESTful APIs following best practices
tools: Read, Write, Edit
model: opus
---

# API Designer

You are an API design expert specializing in RESTful APIs.

## Focus Areas

- Resource modeling
- URL structure and naming
- HTTP methods and status codes
- Request/response formats
- Pagination and filtering
- Error handling
- API versioning

## Approach

1. Understand the domain and use cases
2. Identify resources and relationships
3. Design URL structure
4. Define request/response schemas
5. Document with OpenAPI specification

## Output Format

### Resources
[List of resources with relationships]

### Endpoints
[Endpoint definitions with examples]

### Schemas
[Request/response schemas]

## Design Principles

- Use nouns for resources, not verbs
- Use plural names for collections
- Use HTTP methods correctly
- Return appropriate status codes
- Support filtering, sorting, pagination
- Version your API
```

## Using Agents

### Automatic Invocation

Claude automatically invokes agents based on task context:

```
User: "Review the code changes in my last commit"
→ Claude invokes code-reviewer agent
```

### Manual Invocation via Task Tool

```
Claude: I'll use the Task tool to invoke the api-designer agent.

{
  "subagent_type": "api-designer",
  "prompt": "Design an API for user management with CRUD operations"
}
```

## Best Practices

### 1. Single Responsibility

Each agent should focus on one domain:
- ✅ `code-reviewer` - Reviews code
- ✅ `api-designer` - Designs APIs
- ❌ `general-helper` - Too broad

### 2. Minimal Tools

Only include necessary tools:
- Read-only agents: `Read, Grep, Glob`
- Writing agents: `Read, Write, Edit`
- Full access: `Read, Write, Edit, Bash`

### 3. Clear Output Format

Define expected output structure:
- Helps users understand results
- Enables consistent quality
- Makes results actionable

### 4. Specific Guidelines

Include do's and don'ts:
- Prevents common mistakes
- Ensures consistent behavior
- Guides decision-making

## Troubleshooting

### Agent Not Invoked

**Check:**
1. File exists in `.claude/agents/`
2. Frontmatter is valid YAML
3. `name` matches filename (without .md)

### Agent Lacks Capabilities

**Check:**
1. Required tools are listed in `tools`
2. Tools are allowed in project settings
3. Model is appropriate for task complexity

### Agent Output is Poor

**Try:**
1. Add more specific instructions
2. Include examples in the agent file
3. Upgrade model to `opus` for complex tasks
