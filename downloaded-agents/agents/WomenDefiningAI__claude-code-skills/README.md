# Agents

Custom subagents for Claude Code that provide specialized capabilities.

## What Are Agents?

Agents are markdown files (`.md`) that define specialized AI assistants with specific expertise, tools, and workflows. They're invoked by Claude Code's Task tool when their capabilities match the user's needs.

## Installation

Copy agent files to your Claude Code agents directory:

```bash
# Install all agents
cp agents/*.md ~/.claude/agents/

# Or install individual agents
cp agents/example-agent.md ~/.claude/agents/
```

## Available Agents

### 🎨 prompt-engineer

**Model**: opus
**Color**: pink

Expert prompt engineer specializing in crafting, reviewing, and optimizing system prompts for AI agents and language models.

**When to Use**:
- Create new system prompts for AI agents
- Review and improve existing prompts
- Add new capabilities to agent prompts
- Optimize prompt effectiveness and clarity
- Evaluate prompts for performance

**Capabilities**:
- **Analysis Phase**: Examines prompts for strengths, weaknesses, ambiguities
- **Design Principles**: Clear structure, actionable instructions, error handling
- **Enhancement Strategies**: Role-based expertise, decision frameworks, quality standards
- **Review Methodology**: Provides effectiveness scores, clarity analysis, specific improvements

**Output Format**:
- New prompts: Complete system prompt with clear sections
- Reviews: Structured feedback with scores and recommendations
- Modifications: Before/after versions with explanations

**Example Use Cases**:
```
"Review this customer service agent prompt and make it more effective"
"I need a system prompt for an agent that summarizes technical documentation"
"Add security vulnerability checking to this code review prompt"
```

---

### 🎨 ui-ux-designer

**Model**: opus
**Color**: purple

Expert UI/UX design critic and advisor who provides research-backed, opinionated feedback on interfaces.

**When to Use**:
- Need honest assessment of design decisions
- Want to avoid generic "AI slop" aesthetics
- Need evidence-based UX guidance grounded in research
- Want distinctive design direction that stands out
- Need design critique with cited sources
- Want pushback on trendy-but-ineffective patterns

**Capabilities**:
- **Research-Backed Recommendations**: Cites Nielsen Norman Group, eye-tracking studies, A/B test results, academic usability research
- **Anti-Generic Design**: Actively fights cookie-cutter SaaS aesthetics, generic layouts, and overused patterns
- **Evidence-Based Critique**: Says "no" to bad ideas with data, pushes back on trends that harm usability
- **Practical Focus**: Prioritizes what actually moves metrics (conversion, engagement, satisfaction)
- **Distinctive Solutions**: Creates designs with personality that work for users

**Philosophy**:
- Research over opinions - every recommendation backed by studies
- Distinctive over generic - fights "AI slop" aesthetics
- Evidence-based critique - explains the "why" with data
- Practical over aspirational - implementable solutions with clear ROI

**Output Format**:
- Honest, direct feedback with research citations
- Specific, actionable recommendations
- Design alternatives that balance usability and distinctiveness
- Clear explanations of principles with supporting evidence

**Example Use Cases**:
```
"Review my landing page design and provide research-backed improvements"
"Help me create a distinctive portfolio design that isn't generic SaaS"
"Critique this navigation pattern - does it actually work for users?"
"I want to redesign the dashboard - what does the research say about data visualization?"
"This feels too generic - how can I make it more distinctive while staying usable?"
```

---

## Creating Agents

Agents use YAML frontmatter with the following structure:

```markdown
---
name: agent-name
description: When to use this agent with examples
model: sonnet|opus|haiku
color: cyan|green|purple|yellow
---

# Agent Instructions

You are a [role description] with expertise in [domain].

Your primary responsibility is [main task].

## Your Workflow

1. **Step 1**: What to do first
2. **Step 2**: What comes next
3. **Step 3**: How to complete

## Guidelines

- Important principle 1
- Important principle 2
```

### Example

```markdown
---
name: test-generator
description: Generates comprehensive test suites for codebases
model: sonnet
color: green
---

You are an expert test engineer specializing in creating comprehensive test suites.

## Your Workflow

1. **Analyze Code**: Read and understand the code to test
2. **Identify Cases**: Determine edge cases and scenarios
3. **Write Tests**: Create tests with clear assertions
4. **Verify Coverage**: Ensure comprehensive coverage

## Guidelines

- Write clear test names
- Test edge cases and error conditions
- Use appropriate testing patterns
```

## Usage

Agents are automatically invoked by Claude Code when the Task tool matches their description. Users don't call them directly.

## Contributing

To contribute an agent to this collection:

1. Create your agent file following the structure above
2. Test it in your `~/.claude/agents/` directory
3. Submit via Pull Request to this repository

See the main [Contributing Guidelines](../README.md#contributing) for details.

## Learn More

- [Claude Code Agents Documentation](https://docs.claude.com/en/docs/claude-code)
- [Main Repository](../README.md)
