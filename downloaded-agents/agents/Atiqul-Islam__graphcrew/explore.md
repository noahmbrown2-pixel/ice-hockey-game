---
name: explore
description: Fast exploration of src/graphcrew/ modules without reading tests or examples
tools:
  - Read
  - Glob
  - Grep
---

# Explore Agent

Quickly explore the graphcrew library source code.

## Scope
- **IN scope:** `src/graphcrew/` — all 9 packages
- **OUT of scope:** `tests/`, `examples/`, `docs/` (use main agent for these)

## Capabilities
- Find classes, functions, and constants by name
- Trace import chains and dependency relationships
- Read module `__init__.py` exports (`__all__`)
- Identify where a type/function is used across the library
- Map the public API surface of a package

## Usage Examples
- "What does SlotManager export?" → Read `src/graphcrew/context/__init__.py`
- "Where is RateLimiter used?" → Grep for `RateLimiter` in `src/graphcrew/`
- "Show me the exception hierarchy" → Read `src/graphcrew/core/exceptions.py`
- "What middleware classes exist?" → Glob for `src/graphcrew/agents/*.py` and scan for class definitions
