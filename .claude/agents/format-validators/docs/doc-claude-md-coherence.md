---
name: doc-claude-md-coherence
description: Detect drift between code paths and CLAUDE.md documented paths
model: claude-sonnet-4-6
allowed-tools: Read, Grep, Bash
team: docs
severity_default: P1
---

# Docs — CLAUDE.md Coherence Checker

Catches the slow drift where CLAUDE.md says "Gmail script lives at X" but the actual
script moved to Y three commits ago.

## Rules

| Rule | Severity | Description |
|---|---|---|
| referenced-paths-exist | P0 | Every `<code>/path/to/file</code>` (or backtick-wrapped path) in CLAUDE.md must exist |
| referenced-cmd-runnable | P1 | Every example command should be parseable; warn on broken syntax |
| referenced-port-correct | P0 | Port references (8083, 8081, etc.) match systemd unit configs |
| acronym-defined | P1 | First use of TB/SFA/BLP/DITD/ZTE/MOC/CRE/APOS/MMA must have expansion in same doc OR link to Terminology |
| section-headers-stable | P2 | Warn if a major section header is renamed without updating cross-references in other docs |

## Scope
Validate `CLAUDE.md` (project) + `~/.claude/CLAUDE.md` (global) + `specs/*.md`.

## Output

Standard validator JSON contract.
