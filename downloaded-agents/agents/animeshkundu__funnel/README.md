# Claude Agents Configuration

This directory contains configurations specific to Claude AI agents working in this C repository.

## Purpose

This directory provides:

- Claude-specific agent configurations
- Custom instructions for Claude agents
- Specialized tools and workflows for Claude-based assistance

## Directory Structure

```
agents/
├── README.md              # This file
├── code-assistant.md      # Code assistance agent
└── debugger.md            # Debugging assistant agent
```

## Agent Overview

| Agent | File | Primary Focus |
|-------|------|---------------|
| **Code Assistant** | `code-assistant.md` | Writing C code, autotools, project conventions |
| **Debugger** | `debugger.md` | GDB debugging, core dumps, network issues |

## Quick Reference

### Code Assistant Agent
- Help write C code following project conventions
- Assist with autotools configuration (configure.in, Makefile.am)
- Network programming assistance
- Memory management guidance
- Error handling patterns

### Debugger Agent
- Guide debugging with GDB
- Analyze core dumps
- SSL/TLS debugging
- Network debugging with tcpdump/Wireshark
- Memory debugging with Valgrind

## Global Instructions

All Claude agents MUST follow the instructions in:

| Resource | Location | Priority |
|----------|----------|----------|
| Root Instructions | `/claude.md` | Highest |
| Agent Protocols | `docs/agent-instructions/` | High |
| This Directory | `.claude/agents/` | Normal |

## Agent Selection Guide

| Task | Recommended Agent |
|------|-------------------|
| Write new C code | Code Assistant |
| Fix compilation errors | Code Assistant |
| Configure build system | Code Assistant |
| Debug segfault | Debugger |
| Analyze core dump | Debugger |
| Network connectivity issues | Debugger |
| SSL handshake failures | Debugger |
| Memory leak investigation | Debugger |

## Usage Notes

### Code Assistant
Best used for:
- Implementing new features
- Refactoring existing code
- Understanding codebase patterns
- Build system configuration

### Debugger
Best used for:
- Investigating crashes
- Performance issues
- Network problems
- Memory corruption

## Integration with Other Agents

These Claude agents complement the GitHub agents:

| Claude Agent | Collaborates With |
|--------------|-------------------|
| Code Assistant | Code Review, Testing |
| Debugger | Security, Testing |

## Relationship to Other Configuration

| File/Directory | Scope | Priority |
|----------------|-------|----------|
| `/claude.md` | Global Claude instructions | Highest |
| `/.github/copilot-instructions.md` | GitHub Copilot | Separate |
| `/docs/agent-instructions/` | All AI agents | High |
| `/.claude/agents/` | Claude-specific | Normal |
| `/.github/agents/` | GitHub agents | Normal |

## Related Documentation

- `docs/agent-instructions/` - Universal agent protocols
- `.github/agents/` - GitHub agent configurations
- `docs/specs/` - Technical specifications
- `docs/adrs/` - Architecture Decision Records
