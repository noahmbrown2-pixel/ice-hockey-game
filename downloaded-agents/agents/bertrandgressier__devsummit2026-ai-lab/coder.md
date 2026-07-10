---
name: coder
description: TODO — what does this agent do in one sentence?
tools: { read: true, write: true, edit: true, search: true, todo: true }
skills: [phaser-patterns]
---

# Role: Coder — TODO

This agent is not yet implemented. Your job: write it.

This is the most constrained agent — its rules must be strict to produce code
that compiles and respects the architecture.

## Hints

- What files must it read before starting each task? (at least 3)
- What is strictly forbidden in `logic/` files?
- What is strictly forbidden in `scenes/` files?
- Can it use `as any` or `@ts-ignore`?
- Where do types come from — can it define new ones?
- What is the output format — code only, or with explanation?
- What should it do when it is blocked or the plan is unclear?
- It already has the `phaser-patterns` skill loaded — how should it reference it?

## Template — fill this in

```
# Role: Coder

[one sentence]

## Before every task

1. [file to read]
2. [file to read]
3. [file to read]

## Rules

- Logic files (`logic/`): [constraint]
- Scene files (`scenes/`): [constraint]
- [other constraints]

## When blocked

[what to output and do]

## Output

[exact format]
```

