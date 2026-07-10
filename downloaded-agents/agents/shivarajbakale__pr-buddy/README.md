# Claude Agents for pr-buddy

This directory contains specialized Claude Code agents that provide expert assistance for specific domains.

## Available Agents

### mcp-server-expert

**Name:** `mcp-server-expert`

**Purpose:** Expert agent for creating, debugging, and optimizing Model Context Protocol (MCP) servers using TypeScript.

**When to Use:**
- Building new MCP servers from scratch
- Implementing tools, resources, or prompts
- Setting up transport layers (HTTP, WebSocket, stdio)
- Handling session management (stateful vs stateless)
- Implementing OAuth authentication
- Optimizing performance (debouncing, caching)
- Debugging MCP-related issues
- Security hardening (DNS rebinding protection, CORS)
- Writing tests for MCP servers

**Expertise Includes:**
- Complete MCP architecture and protocol understanding
- All transport types (Streamable HTTP, SSE, WebSocket, stdio)
- Dynamic tool management (enable/disable/update/remove)
- Advanced features (LLM sampling, user elicitation, resource links)
- Context-aware completions
- Session management patterns
- Security best practices
- Performance optimization
- Error handling and debugging
- Testing strategies
- Deployment considerations
- Common pitfalls and solutions

**Example Usage:**

```
# Invoke the agent directly
@mcp-server-expert How do I implement a stateful MCP server with session management?

# Or let Claude Code automatically route to it
I need to create an MCP server that exposes GitHub operations as tools
```

---

### atlassian-cli-expert

**Name:** `atlassian-cli-expert`

**Purpose:** Expert agent for Atlassian CLI (acli) operations including Jira work item management, project operations, user administration, authentication, and automation.

**When to Use:**
- Managing Jira work items (create, edit, search, transition, assign)
- Administering Jira projects (create, update, archive, delete)
- User management (activate, deactivate, delete users)
- Bulk operations on Jira items
- Automating Jira workflows
- Integrating acli into scripts and CI/CD pipelines
- Working with Jira filters and dashboards
- JQL query construction and optimization
- Troubleshooting acli commands

**Expertise Includes:**
- Complete acli command reference and usage
- Authentication methods (OAuth, API tokens, admin auth)
- Jira work item operations (CRUD, transitions, assignments)
- Project management (lifecycle, configuration)
- Bulk operations and automation patterns
- JQL (Jira Query Language) expertise
- Filter and dashboard management
- Output parsing (JSON, CSV) and integration
- Security best practices (token management, least privilege)
- Performance optimization (pagination, parallel operations)
- CI/CD integration patterns
- Migration and data transformation
- Error handling and resilience
- Scripting and automation recipes

**Example Usage:**

```
# Invoke the agent directly
@atlassian-cli-expert How do I bulk assign all unassigned items in a project?

# Or let Claude Code automatically route to it
I need to create 50 Jira tasks from a CSV file using acli

# Complex automation
Show me how to automate transitioning all approved items to Done using acli
```

## How to Use Agents

### Method 1: Explicit Invocation
Type `@` followed by the agent name in your message:
```
@mcp-server-expert <your question>
```

### Method 2: Natural Language
Claude Code will automatically route your request to the appropriate agent based on the context:
```
I need help implementing an MCP tool with user input elicitation
```

### Method 3: Via Command
Use the `/agents` command to see available agents and invoke them interactively.

## Agent Architecture

Each agent is defined in a Markdown file with YAML frontmatter:

```markdown
---
name: agent-name
description: When this agent should be used
tools: Read, Write, Edit, Glob, Grep, Bash
model: sonnet
---

# Agent System Prompt
(Detailed instructions and knowledge base)
```

## Creating New Agents

1. Create a new `.md` file in this directory
2. Add YAML frontmatter with `name`, `description`, `tools`, and `model`
3. Write a comprehensive system prompt with:
   - Domain expertise
   - Best practices
   - Code examples
   - Common patterns
   - Pitfalls to avoid
   - Approach guidelines

## Best Practices

- Use descriptive names (kebab-case)
- Write clear descriptions that explain when to invoke the agent
- Specify only necessary tools (or omit to inherit all)
- Include comprehensive examples in the system prompt
- Document trade-offs and alternatives
- Provide production-ready code patterns
- Include security considerations
- Add testing guidance

## Notes

- Project agents (`.claude/agents/`) override user-level agents (`~/.claude/agents/`)
- Agents with the same name will be deduplicated (project takes precedence)
- The `model` field is optional and defaults to the main conversation model
- Tools list is optional - omit to inherit all available tools
