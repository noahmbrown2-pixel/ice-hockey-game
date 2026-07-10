# Claude Code Agents

This directory contains specialized agents (subagents) for complex AEM Edge Delivery Services development tasks. Agents are autonomous Claude instances with dedicated expertise, skills, and tool permissions.

## What Are Agents?

Agents are specialized versions of Claude configured for specific complex tasks. They have:

- **Dedicated System Prompts**: Focused expertise and guidance
- **Specific Skills**: Access to relevant skill sets
- **Tool Permissions**: Allowed tools for their domain
- **Optimized Context**: Appropriate context window size
- **Auto-Activation**: Can trigger based on prompt patterns

## Available Agents

### Block Developer (`block-developer`)

**Purpose:** Comprehensive block development from content modeling through testing

**Expertise:**
- Content-driven development methodology
- Author-friendly content model design
- Block decoration patterns
- Responsive CSS implementation
- Testing and validation

**When to Use:**
- Creating new blocks from scratch
- Major block refactoring
- Complex block implementations
- Complete development workflows

**Skills:** content-driven-development, building-blocks, content-modeling, testing-blocks, block-collection-and-party

**Auto-activates on:** "create a block", "new block", "build a block", "implement block"

### Content Modeler (`content-modeler`)

**Purpose:** Designing author-friendly content models and structures

**Expertise:**
- Author experience optimization
- Content structure design
- Canonical patterns
- Variant design
- Metadata configuration

**When to Use:**
- Designing new content models
- Refactoring content structures
- Improving authoring experience
- Content architecture decisions

**Skills:** content-modeling, content-driven-development, block-collection-and-party

**Auto-activates on:** "content model", "authoring structure", "design content"

### Testing Specialist (`testing-specialist`)

**Purpose:** Comprehensive testing and quality assurance

**Expertise:**
- Unit testing strategies
- Browser testing (Playwright/Puppeteer)
- Code quality and linting
- Performance validation
- Accessibility testing
- PR preparation

**When to Use:**
- Implementing test suites
- Validating changes before PR
- Performance optimization
- Quality assurance workflows
- Testing strategy decisions

**Skills:** testing-blocks, content-driven-development, building-blocks

**Auto-activates on:** "test the block", "validate changes", "PR ready", "quality check"

### Documentation Expert (`docs-expert`)

**Purpose:** Finding documentation, examples, and reference implementations

**Expertise:**
- aem.live documentation search
- Block Collection discovery
- Block Party exploration
- Reference implementation finding
- Best practices guidance

**When to Use:**
- Need AEM documentation
- Looking for example blocks
- Finding reference implementations
- Learning platform features
- Troubleshooting issues

**Skills:** docs-search, block-collection-and-party

**Auto-activates on:** "how does AEM", "find example", "reference implementation"

## Using Agents

### Automatic Activation

Agents auto-activate based on prompt patterns. Just describe your task naturally:

```
"Create a new blog post card block"
→ Auto-activates Block Developer agent

"How do I implement lazy loading in AEM?"
→ Auto-activates Documentation Expert agent

"Design a content model for a product carousel"
→ Auto-activates Content Modeler agent
```

### Manual Delegation

You can explicitly delegate to an agent:

```
@block-developer Create a hero block with video background
@content-modeler Design the content structure for a pricing table
@testing-specialist Validate my changes are PR-ready
@docs-expert Find examples of fragment loading
```

### Agent Collaboration

Agents can work together on complex tasks:

```
"Build a complete testimonial carousel block"

1. Content Modeler designs the content structure
2. Block Developer implements the code
3. Testing Specialist validates the implementation
```

## Agent Configuration

Agents are configured as **Markdown files with YAML frontmatter** following the [Claude Code subagents format](https://code.claude.com/docs/en/sub-agents#file-format):

```markdown
---
name: agent-name
description: What this agent does and when to use it. Use proactively when...
tools: Read, Write, Edit, Grep, Bash  # Optional - inherits all if omitted
model: inherit  # Can be 'sonnet', 'opus', 'haiku', or 'inherit'
---

# Agent Name

Your agent's system prompt goes here in Markdown format.

## Responsibilities
- Responsibility 1
- Responsibility 2

## Workflow
1. Step 1
2. Step 2

[Additional sections as needed]
```

**Key Configuration Fields:**
- `name` (required): Unique identifier using lowercase and hyphens
- `description` (required): When and how this agent should be used
- `tools` (optional): Comma-separated list of allowed tools; inherits all if omitted
- `model` (optional): Model to use; defaults to sonnet, use 'inherit' for main conversation's model

## When to Use Agents vs Skills

**Use Agents when:**
- Task is complex and multi-step
- Need specialized expertise
- Task spans multiple concerns
- Want autonomous handling of complete workflow

**Use Skills directly when:**
- Task is specific and focused
- Following a known process
- You want to maintain control
- Task is part of larger workflow you're orchestrating

## Creating Custom Agents

To create a new agent:

1. Create `{agent-name}.md` in `.claude/agents/`
2. Add YAML frontmatter with name, description, tools (optional), model (optional)
3. Write focused system prompt in Markdown format
4. Include responsibilities, workflow, and guidance
5. Test agent with various prompts

**Tip:** Use the `/agents` command in Claude Code to create agents interactively!

See [Claude Code Subagents Documentation](https://code.claude.com/docs/en/sub-agents) for detailed guidance.

## Agent Best Practices

**System Prompts:**
- Focus on specific expertise
- Define clear responsibilities
- Include key principles and workflow
- Reference available skills
- Specify deliverables

**Skills Selection:**
- Include only relevant skills
- Mark primary skills clearly
- Consider skill dependencies
- Keep skill count focused

**Tool Permissions:**
- Grant minimum necessary tools
- Consider agent's scope
- Balance capability vs safety
- Read-only agents need fewer tools

**Auto-Activation:**
- Use specific patterns
- Avoid overly broad matches
- Test pattern matching
- Consider overlap with other agents

## Troubleshooting

### Agent not activating
- Check pattern matches your prompt
- Try explicit delegation with `@agent-name`
- Verify agent is in `.claude/agents/`
- Check JSON syntax is valid

### Wrong agent activating
- Patterns may be too broad
- Refine auto-activation patterns
- Use explicit delegation
- Consider agent priority/order

### Agent missing skills
- Verify skill names in skills array
- Check skills exist in `.claude/skills/`
- Review skill dependencies
- Ensure skill SKILL.md is valid

## Configuration

Agents are configured in `.clauderc`:

```json
{
  "agents": {
    "enabled": true,
    "directory": ".claude/agents"
  }
}
```

## Related Documentation

- [Agents Guide](https://code.claude.com/docs/en/sub-agents)
- [Skills Documentation](../skills/README.md)
- [Hooks Documentation](../hooks/README.md)

