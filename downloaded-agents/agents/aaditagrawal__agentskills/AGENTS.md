# AGENTS.md

Guidelines for AI agents working in this repository.

## Repository Overview

This repository contains **Agent Skills** for AI agents following the [Agent Skills specification](https://agentskills.io/specification.md). Skills install to `.agents/skills/` (the cross-agent standard). This repo also serves as a **Claude Code plugin marketplace** via `.claude-plugin/marketplace.json`.

- **Name**: Agent Skills
- **GitHub**: [aaditagrawal/agentskills](https://github.com/aaditagrawal/agentskills)
- **Creator**: Aadit Agrawal
- **License**: MIT

## Repository Structure

```
agentskills/
├── .claude-plugin/
│   └── marketplace.json   # Claude Code plugin marketplace manifest
├── skills/
│   └── skill-name/
│       └── SKILL.md       # Required skill file
├── AGENTS.md
├── LICENSE
└── README.md
```

## Build / Lint / Test Commands

**Skills** are content-only (no build step). Verify manually:
- YAML frontmatter is valid
- `name` field matches directory name exactly
- `name` is 1-64 chars, lowercase alphanumeric and hyphens only
- `description` is 1-1024 characters
- `SKILL.md` is under 500 lines

## Agent Skills Specification

Skills follow the [Agent Skills spec](https://agentskills.io/specification.md).

### Required Frontmatter

```yaml
---
name: skill-name
description: What this skill does and when to use it. Include trigger phrases.
metadata:
  version: x.y.z
---
```

### Frontmatter Field Constraints

| Field         | Required | Constraints                                                      |
|---------------|----------|------------------------------------------------------------------|
| `name`        | Yes      | 1-64 chars, lowercase `a-z`, numbers, hyphens. Must match dir.   |
| `description` | Yes      | 1-1024 chars. Describe what it does and when to use it.          |
| `license`     | No       | License name (default: MIT)                                      |
| `metadata`    | No       | Key-value pairs (author, version, etc.)                          |

### Name Field Rules

- Lowercase letters, numbers, and hyphens only
- Cannot start or end with hyphen
- No consecutive hyphens (`--`)
- Must match parent directory name exactly

### Optional Skill Directories

```
skills/skill-name/
├── SKILL.md        # Required - main instructions (<500 lines)
├── references/     # Optional - detailed docs loaded on demand
├── scripts/        # Optional - executable code
└── assets/         # Optional - templates, data files
```

## Writing Style Guidelines

### Structure

- Keep `SKILL.md` under 500 lines (move details to `references/`)
- Use H2 (`##`) for main sections, H3 (`###`) for subsections
- Use bullet points and numbered lists liberally
- Short paragraphs (2-4 sentences max)

### Tone

- Direct and instructional
- Second person ("You are an expert...")
- Professional but approachable

### Description Field Best Practices

The `description` is critical for skill discovery. Include:
1. What the skill does
2. When to use it (trigger phrases)
3. Related skills for scope boundaries

## Git Workflow

### Branch Naming

- New skills: `feature/skill-name`
- Improvements: `fix/skill-name-description`
- Documentation: `docs/description`

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat: add skill-name skill`
- `fix: improve clarity in no-slop`
- `docs: update README`

## Skill Categories

### Code Quality
- **no-useeffect** - React useEffect ban with proper primitive alternatives

### Writing Standards
- **no-slop** - Non-negotiable rules for AI-generated content quality
- **ai-taste** - Framework for developing taste and curation with AI

### Web
- **md-site** - Render `.md` files as HTML that still looks like raw markdown (community.vercel.com/live.md style)

### DevRel / AI integrations
- **openrouter-expert** - Build, debug, and integrate against OpenRouter; anchor every answer to live docs (llms.txt) and the live `/api/v1/models` API
