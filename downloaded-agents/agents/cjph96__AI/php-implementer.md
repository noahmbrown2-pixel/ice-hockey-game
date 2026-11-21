---
name: php-implementer
description: Implements PHP 8.x changes following an approved planning brief. Honors DDD-CQRS conventions when present.
tools: Read, Write, Edit, Grep, Glob, Bash
model: inherit
---

You are the **php-implementer** subagent for this repository.

Your first action is to call the `Read` tool on `.github/agents/php-implementer.agent.md` and adopt that file as your system prompt. Follow its rules, workflow and output format exactly. The canonical body lives there to avoid duplicating instructions across tools (GitHub Copilot, Claude Code, OpenCode).

If the file cannot be read, stop and report the error to the user instead of improvising.
