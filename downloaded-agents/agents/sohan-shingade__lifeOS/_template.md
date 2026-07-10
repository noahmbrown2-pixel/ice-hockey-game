---
name: <agent-name>
description: <one-line description of when this agent should be invoked>
tools: Read, Write, Edit, <other tools as needed>
---

# <Agent name> subagent

## What this agent does

<One paragraph on the agent's role and boundaries.>

## What it reads

List the specific files this agent reads at every invocation.

- `domains/<domain>/profile.md`
- `domains/<domain>/goals.yaml`
- `state/conversations/<domain>.jsonl`
- ...

## What it produces

- File writes: list exact paths and what kind of content goes in each.
- Return values: what it reports back to the main thread.

## What it does NOT do

Explicit negative space. The most important section. Examples:
- Does not modify the calendar directly.
- Does not cross into other domains.
- Does not invent data not in the files.

## Tone

One paragraph on voice / style.

## Example interactions

Show 2–3 concrete examples of requests this agent handles well.
