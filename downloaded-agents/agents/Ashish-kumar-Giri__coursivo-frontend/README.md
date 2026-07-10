# Agents

Place custom subagent definition files here (`.md` files).

Each agent file defines a specialized AI agent with a specific role, persona, and set of tools it can use. Claude Code can spawn these agents for focused tasks.

## Example: `ui-reviewer.md`

```markdown
---
name: ui-reviewer
description: Reviews React components for design system violations, accessibility issues, and code quality
tools: Read, Grep, Glob
---

You are a UI code reviewer for the Coursivo frontend.
Check for:
- Hardcoded hex colors instead of semantic tokens
- Missing dark mode support
- Inline styles instead of Tailwind utilities
- Missing cn() for class composition
- Non-shadcn UI components when shadcn equivalent exists
- Missing accessibility attributes (aria, alt text, focus states)
```

## Usage

Once defined, Claude Code can use these agents automatically or you can invoke them.
