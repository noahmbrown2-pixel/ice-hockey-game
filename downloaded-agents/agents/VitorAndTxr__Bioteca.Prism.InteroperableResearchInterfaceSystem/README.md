# Claude Code Custom Agents

This directory contains custom agent definitions for the PRISM/IRIS project. Agents are specialized AI assistants that can be invoked to perform specific tasks autonomously.

## Available Agents

### 1. Agent Architect (`agent-architect.md`)
**Purpose**: Design multi-agent systems, create agent configurations, optimize task delegation, and structure agent orchestration.

**Use when**:
- Creating new agents
- Optimizing agent workflows
- Designing complex multi-agent systems

### 2. Web Search Specialist (`web-search-specialist.md`)
**Purpose**: Perform targeted web searches based on specific prompts and research queries. Optimizes search strategies, filters results, and synthesizes information from multiple sources.

**Use when**:
- Researching technical documentation
- Finding current information beyond AI knowledge cutoff
- Comparing libraries, frameworks, or tools
- Investigating best practices
- Verifying facts from authoritative sources

### 3. Screen Design Validator (`screen-design-validator.md`)
**Purpose**: Validates screen implementation against Figma designs, fixes discrepancies, and ensures design fidelity using Playwright and Figma REST API scripts.

**Use when**:
- Validating UI implementation matches Figma design
- Fixing visual discrepancies (colors, spacing, typography)
- Ensuring design fidelity before release
- Comparing multiple screen states with design frames
- Automated design-to-code validation workflows

## How to Use Agents

### Basic Invocation

```typescript
Task({
  subagent_type: "web-search-specialist",
  model: "haiku", // or "sonnet" for complex tasks
  description: "Short description (3-5 words)",
  prompt: `
    Detailed task description for the agent.

    Include:
    - Specific requirements
    - Constraints or preferences
    - Expected output format
  `
})
```

### Example: Web Search Agent

```typescript
// Research a technical topic
Task({
  subagent_type: "web-search-specialist",
  model: "haiku",
  description: "Research React Native auth libraries",
  prompt: `
    Find and compare the top 3 authentication libraries for React Native in 2025.

    Requirements:
    - Actively maintained (commits in last 3 months)
    - Security considerations
    - Documentation quality
    - Include npm download stats

    Return: Comparison table with pros/cons and recommendation
  `
})
```

### Example: Agent Architect

```typescript
// Design a new agent
Task({
  subagent_type: "agent-architect",
  model: "sonnet",
  description: "Design API testing agent",
  prompt: `
    Create an agent for automated API endpoint testing.

    Context:
    - PRISM backend uses 4-phase handshake authentication
    - Need to test 20+ REST endpoints
    - Should validate response schemas

    Design agent with appropriate tools and workflow
  `
})
```

### Example: Screen Design Validator

```typescript
// Validate screen implementation against Figma design
Task({
  subagent_type: "screen-design-validator",
  model: "sonnet",
  description: "Validate Connections screen design",
  prompt: `
    Validate the Node Connections screen implementation against Figma designs.

    Figma frames to validate:
    - 6804-13512 (Main connections list)
    - 6804-13591 (Connection details)
    - 6910-3543 (Add connection form)
    - 6998-800 (Connection states)

    Screen path: /node-connections
    Target files: apps/desktop/src/screens/NodeConnections/

    Workflow:
    1. Create temp folder for screenshots
    2. Extract Figma frame screenshots
    3. Navigate to Connections menu using Playwright
    4. Compare implementation with design
    5. Fix all discrepancies
    6. Clean up temp files

    Ensure design fidelity >= 95%.
  `
})
```

## Model Selection Guidelines

- **haiku**: Fast, cost-efficient for straightforward tasks (searches, simple analysis)
- **sonnet**: Balanced performance for most tasks (default)
- **opus**: Most capable, use for complex reasoning or critical tasks

## Agent Design Principles

1. **Single Responsibility**: Each agent should have a clear, focused purpose
2. **Autonomous Execution**: Agents work independently and return final results
3. **Stateless**: Each invocation is independent (no conversation history)
4. **Tool-Specific**: Agents have access to specific tool subsets
5. **Clear Prompts**: Provide detailed task descriptions with expected outputs

## Creating New Agents

### File Structure

```markdown
# Agent Name

## Agent Type: `agent-type-kebab-case`

## Description
Brief overview of agent purpose (1-2 sentences)

## Purpose
When to use this agent (bullet list)

## Capabilities
Tools available and key features

## Usage Examples
3-5 concrete examples with code

## Best Practices
Do's and don'ts

## Limitations
Known constraints

## Integration
How it fits with PRISM/IRIS
```

### Agent Metadata

Each agent file should include:
- Agent type identifier (kebab-case)
- Clear description and purpose
- Tool access list
- Usage examples
- Best practices
- Version and maintainer info

## Project-Specific Agents

### PRISM/IRIS Context

Agents in this project should be aware of:
- **Monorepo Structure**: Mobile (React Native) + Desktop (Electron)
- **Tech Stack**: TypeScript strict mode, Heroicons, React
- **Domain**: Biomedical research, Bluetooth communication, authentication
- **Documentation**: English only, structured in `/docs`

### Common Use Cases

1. **Web Research**: Technical documentation, library comparisons, best practices
2. **Code Generation**: Component creation, API integration, test writing
3. **Analysis**: Codebase exploration, security audits, performance optimization
4. **Testing**: Automated testing, validation, integration tests
5. **Documentation**: API docs, architecture diagrams, user guides

## Best Practices

### ✅ Do

- Provide specific, detailed prompts
- Include context about the codebase
- Specify expected output format
- Use appropriate model for task complexity
- Let agents work autonomously

### ❌ Don't

- Use agents for simple tasks (use direct tools instead)
- Provide vague or ambiguous prompts
- Expect agents to maintain conversation state
- Use opus model unnecessarily (cost/performance)
- Interrupt agent execution

## Troubleshooting

### Agent Not Found
Ensure the agent file exists in `.claude/agents/` and follows naming conventions.

### Poor Results
- Make prompts more specific
- Add more context about the task
- Try a more capable model (haiku → sonnet → opus)
- Break complex tasks into smaller agent invocations

### Token Limits
- Use haiku for simple tasks
- Summarize context in prompts
- Break large tasks into smaller chunks

## Future Agents (Planned)

- **API Testing Specialist**: Automated endpoint testing with schema validation
- **Documentation Generator**: Auto-generate docs from code
- **Security Auditor**: Scan code for vulnerabilities
- **Performance Analyzer**: Profile and optimize code
- **Migration Assistant**: Guide framework/library upgrades

## Resources

- **Claude Code Documentation**: https://code.claude.com/docs
- **Task Tool Reference**: See main Claude Code docs for `Task` tool usage
- **Agent Best Practices**: https://code.claude.com/docs/agents

---

**Last Updated**: November 14, 2025
**Project**: PRISM/IRIS (Interoperable Research Interface System)
**Maintainer**: PRISM Development Team
