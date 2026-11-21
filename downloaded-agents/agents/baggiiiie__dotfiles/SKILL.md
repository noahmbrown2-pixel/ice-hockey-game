---
name: code-simplification
description: Systematically simplifies codebases by questioning assumptions and eliminating unnecessary complexity. Use when reviewing, refactoring, or optimizing code.
---

# Code Simplification

A methodology for systematically reducing code complexity by questioning every piece of functionality.

## Core Principle

**For every piece of code, ask: "Is this necessary? What happens if we remove it?"**

Most complexity comes from solving problems that don't need solving, or solving them in overly general ways.

## The Simplification Loop

1. **Identify** a piece of functionality
2. **Question** why it exists
3. **Challenge** whether it's needed
4. **Remove or simplify** if the justification is weak
5. **Repeat** - each removal may reveal more opportunities

## Key Questions

### Existence Questions
- "Why does this exist?"
- "What problem does this solve?"
- "What breaks if we remove this?"
- "Is this solving a real problem or a hypothetical one?"

### Necessity Questions
- "Does this need to happen here, or can something else handle it?"
- "Does this need to happen now, or can it be deferred?"
- "Does this need to happen at all?"

### Redundancy Questions
- "Is this duplicated elsewhere?"
- "Can existing code already handle this case?"
- "Are we checking the same condition multiple times?"

## Common Simplification Patterns

### 1. Remove Defensive Code for Non-Problems

**Before**: Watch parent directory to detect file recreation
**Question**: "When would this actually happen?"
**Answer**: Only when file is deleted and recreated - but periodic sweep catches this
**After**: Remove parent directory watching

### 2. Eliminate Work During Inactive States

**Before**: Poll every 30s, check if active, return early if not
**Question**: "Why wake up just to do nothing?"
**After**: Sleep until next active period

### 3. Stop Reloading Unchanging State

**Before**: Reload config from disk every sweep
**Question**: "How often does config actually change?"
**After**: Reload only on explicit signal (SIGHUP) or state transitions

### 4. Log State Changes, Not Operations

**Before**: Log "Locked: X" every time lock is applied
**Question**: "Does this log add value?"
**After**: Check if already locked, only log when actually changing state

### 5. Deduplicate by Extracting Helpers

**Before**: Same unlock loop in gracefulShutdown() and deactivate()
**Question**: "Why is this duplicated?"
**After**: Extract unlockAll() helper

### 6. Challenge Edge Case Handling

**Before**: Complex logic to handle file deletion during watch
**Question**: "How often does this happen? What's the fallback?"
**After**: If periodic sweep handles it anyway, remove the special case

## Red Flags to Look For

| Red Flag | Question to Ask |
|----------|-----------------|
| Code that checks a condition and returns early | "Why are we even here?" |
| Multiple places doing similar things | "Can we extract this?" |
| Watching/polling when nothing should happen | "Can we sleep instead?" |
| Reloading state that rarely changes | "Can we reload on-demand?" |
| Logging that produces noise | "Is this a state change?" |
| Handling edge cases the happy path covers | "What if we remove this?" |

## Process

1. **Start with a question** from the user or your own observation
2. **Trace the justification** - why does this code exist?
3. **Find the fallback** - what else handles this case?
4. **Propose removal** - suggest removing and explain why it's safe
5. **Implement** - make the change
6. **Recurse** - look for newly exposed simplification opportunities
