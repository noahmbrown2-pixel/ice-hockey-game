# Claude Subagents

This directory contains specialized AI subagents for a project, following the [Claude Code sub-agents specification](https://docs.claude.com/en/docs/claude-code/sub-agents).
and as talked about in [Claude Agents & Subagents: The Complete Guide to Specialized AI Workflows](https://vibecodingconsultant.com/blog/claude-agents-subagents-guide/)

## Available Subagents

### 🔧 refactor-clean
**Purpose**: Expert code refactoring and cleanup specialist
**Use Case**: Automatically clean up, optimize, and improve code quality
**Tools**: Read, Edit, Grep, Glob, Bash
**When to Use**: After writing code, before commits, when code quality issues are detected

### 👀 code-reviewer
**Purpose**: Expert code review specialist for quality, security, and maintainability
**Use Case**: Proactively review code for best practices and potential issues
**Tools**: Read, Grep, Glob, Bash
**When to Use**: Immediately after writing or modifying code, before pull requests

### 🐛 debugger
**Purpose**: Debugging specialist for errors, test failures, and unexpected behavior
**Use Case**: Systematic problem-solving and root cause analysis
**Tools**: Read, Edit, Bash, Grep, Glob
**When to Use**: When encountering any errors, test failures, or unexpected behavior

### 🧪 test-runner
**Purpose**: Test automation expert for running tests and fixing failures
**Use Case**: Automatically detect and run appropriate tests when code changes
**Tools**: Read, Edit, Bash, Grep, Glob
**When to Use**: After code changes, before commits, when tests are failing

### 📊 data-scientist
**Purpose**: Data analysis expert for API monitoring metrics and analytics
**Use Case**: Analyze performance data, generate reports, optimize database queries
**Tools**: Bash, Read, Write, Grep, Glob
**When to Use**: For data analysis tasks, performance monitoring, business intelligence

## Usage

### Automatic Delegation
Claude Code will automatically delegate tasks to appropriate subagents based on:
- Task description and context
- Subagent descriptions and capabilities
- Current project state and needs

### Explicit Invocation
You can explicitly request specific subagents:

```bash
# Use the refactor-clean subagent
> Use the refactor-clean subagent to clean up this messy function

# Have the code-reviewer check recent changes
> Use the code-reviewer subagent to review my recent commits

# Ask the debugger to investigate an error
> Use the debugger subagent to investigate this API error

# Run tests with the test-runner
> Use the test-runner subagent to run tests and fix any failures

# Analyze performance data
> Use the data-scientist subagent to analyze our API performance metrics
```

### Managing Subagents

Use the `/agents` command to:
- View all available subagents
- Create new subagents
- Edit existing subagents
- Manage tool permissions
- Delete unused subagents

```bash
/agents
```

## Subagent Configuration

Each subagent is defined in a Markdown file with YAML frontmatter:

```markdown
---
name: subagent-name
description: When this subagent should be invoked
tools: tool1, tool2, tool3  # Optional - inherits all tools if omitted
model: sonnet  # Optional - specify model or 'inherit'
---

Your subagent's system prompt goes here...
```

### Configuration Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier using lowercase letters and hyphens |
| `description` | Yes | Natural language description of the subagent's purpose |
| `tools` | No | Comma-separated list of specific tools. If omitted, inherits all tools |
| `model` | No | Model to use (sonnet, opus, haiku, or 'inherit'). Defaults to configured subagent model |

## Best Practices

### For Subagent Creation
1. **Start with Claude-generated agents**: Generate initial subagents with Claude, then customize
2. **Design focused subagents**: Single, clear responsibilities rather than trying to do everything
3. **Write detailed prompts**: Include specific instructions, examples, and constraints
4. **Limit tool access**: Only grant tools necessary for the subagent's purpose
5. **Version control**: Check project subagents into version control for team collaboration

### For Effective Usage
1. **Use proactive language**: Include "use PROACTIVELY" or "MUST BE USED" in descriptions
2. **Be specific**: Mention subagents by name when you want explicit invocation
3. **Chain subagents**: For complex workflows, chain multiple subagents together
4. **Monitor performance**: Track which subagents are most effective for your workflow

## File Locations

- **Project subagents**: `.claude/agents/` (available in current project)
- **User subagents**: `~/.claude/agents/` (available across all projects)

Project-level subagents take precedence over user-level subagents when names conflict.

## Integration with Status Pager

These subagents are specifically designed for the Status Pager project and understand:

- **API Monitoring**: Service health, response times, error rates
- **Database Schema**: PostgreSQL tables and relationships
- **Infrastructure**: AWS ECS, RDS, CloudFront deployment
- **Codebase Structure**: TypeScript, React, Node.js architecture
- **Business Logic**: Status pages, integrations, user management

## Contributing

To add new subagents:

1. Create a new `.md` file in `.claude/agents/`
2. Follow the YAML frontmatter format
3. Write a detailed system prompt
4. Test the subagent with various scenarios
5. Update this README with the new subagent information

## Related Documentation

- [Claude Code Sub-agents Documentation](https://docs.claude.com/en/docs/claude-code/sub-agents)
- [Status Pager Development Guidelines](../README.md)
- [Claude Code Tools Reference](https://docs.claude.com/en/docs/claude-code/tools)
