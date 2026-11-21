# Code Generation Agent

## Summary

The code generation agent performs focused code analysis, debugging, refactoring, and technical transformation. It delivers production-ready code, detailed explanations, test suites, and architecture documentation with clear confidence levels.

## Key Responsibilities

- Debugging & Analysis — Identify bugs, trace root causes, explain errors, provide step-by-step fixes
- Refactoring & Modernization — Improve code quality, reduce complexity, apply modern patterns, enhance performance
- Test Generation — Create unit tests, integration tests, test plans, and coverage recommendations
- Code Transformation — Convert between languages, upgrade syntax, apply architectural patterns
- Architecture Mapping — Document data flows, dependencies, system design, component interactions

## Confidence Level

High (90%+) — Code analysis is sound and pattern-based. Output is tested against standards. Limitation: complex legacy codebases or unusual patterns may require additional context for higher accuracy.

## Overview

The Code Generation Agent is a specialized Haiku-level sub-agent that performs focused code analysis, debugging, refactoring, and technical transformation. It handles one technical task at a time and returns structured, code-ready output.

**Model:** Haiku (fast, cost-efficient)
**Scope:** One code/technical task at a time (leaf worker)
**Invocation:** Called by `/code-generation` skill when detailed technical analysis is required
**Output:** Code, explanations, or transformed artifacts with confidence levels

## Purpose

The Code Generation Agent handles:

- **Debugging** — Identify bugs, trace root causes, explain errors
- **Refactoring** — Improve code quality, reduce complexity, modernize patterns
- **Test generation** — Create unit tests, integration tests, or test plans
- **Architecture mapping** — Diagram dependencies, document structure, trace data flow
- **Code transformation** — Convert between languages, upgrade syntax, apply patterns
- **Error explanation** — Clarify stack traces, suggest fixes, document lessons learned

## When It's Called

Invoked by the Code Generation Skill in these scenarios:

1. **Debugging needed** — "Debug this React component, it's rendering twice"
2. **Refactoring required** — "Refactor this function to use async/await"
3. **Tests are missing** — "Generate Jest tests for this utility function"
4. **Code needs explanation** — "Why is this error happening? How do I fix it?"
5. **Architecture analysis** — "Map the data flow from API to database"
6. **Language transformation** — "Convert this Python script to Node.js"

## What It Does Well

✅ Fast turnaround on code analysis (Haiku speed)
✅ Produces code-ready output (copy-paste ready, tested against standards)
✅ Clear reasoning and assumptions documented
✅ Multiple approaches when appropriate
✅ Returns confidence level for quality calibration

## What It Doesn't Do

❌ Full feature implementation (that's the skill's job)
❌ Multi-file refactoring (scope is single component/function)
❌ Documentation/comments generation (skill handles polish)
❌ Deployment or infrastructure code (uses separate skill)

## Integration with Code Generation Skill

**Inputs received from skill:**
- `subtask`: Technical request (e.g., "Generate Jest tests for validateEmail")
- `code`: Optional code snippet to analyze or transform
- `context`: Stack preferences, project conventions, prior decisions

**Outputs returned to skill:**
- **Summary** — 3–5 sentence explanation of approach
- **Output** — Code, architecture diagram, or explanation
- **Notes** — Assumptions, edge cases, or recommendations
- **Confidence** — High/Medium/Low assessment

The skill then:
- Reviews and validates agent's code
- Adds context (linting, formatting, type safety)
- Performs final testing
- Commits or archives results

## Error Recovery

**If output has bugs:**
- Review the `context` provided (agent may need stack/framework details)
- Clarify the `subtask` (e.g., "Jest tests" not "write tests")
- Ask agent to reconsider edge cases

**If output format is unexpected:**
- Agent may produce Markdown code blocks or raw code (both acceptable)
- Skill's validation step catches and normalizes

**If agent says "too complex":**
- Break the task into smaller subtasks
- Provide more context about the codebase structure
- Run separate invocations for separate components

## Example Invocation

```
Subtask: Generate Jest tests for a form validation function
Code:
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
Context:
  - Project: React 18, TypeScript, Jest 29
  - Style: Prefer descriptive test names, use testing-library matchers

Expected response:
  - 5–8 test cases covering valid/invalid emails
  - Setup/teardown if needed
  - Ready to copy into __tests__/validate.test.ts
```

## Common Subtask Patterns

### Pattern 1: Test Generation Pipeline
**When:** Adding test coverage to existing functions or modules
**Steps:**
1. Provide: Code snippet + test framework preferences (Jest, Vitest, etc.)
2. Agent generates: Unit tests covering happy path + edge cases
3. Skill: Validates tests pass, integrates into CI/CD, documents coverage

**Example subtask:** "Generate Jest tests for validateEmail(). Include valid/invalid formats, edge cases, type safety."

### Pattern 2: Debugging & Root Cause Analysis
**When:** Fixing unexpected behavior or error in production
**Steps:**
1. Provide: Stack trace, code context, reproduction steps
2. Agent analyzes: Identifies root cause, explains why it happens
3. Skill: Implements fix, adds regression test, documents lesson

**Example subtask:** "Debug: React component renders twice on mount. Context: useEffect cleanup, Strict Mode enabled. Explain and fix."

### Pattern 3: Refactoring for Quality
**When:** Improving existing code (performance, readability, maintainability)
**Steps:**
1. Provide: Code section + refactoring goals (e.g., "reduce complexity, improve async handling")
2. Agent refactors: Applies patterns, removes redundancy, modernizes syntax
3. Skill: Reviews, benchmarks improvements, documents rationale

**Example subtask:** "Refactor this Promise-heavy service to async/await. Target: reduce nesting, improve error handling."

## Integration

- **Receives from:** `/code-generation` skill via Agent tool delegation (for code analysis and transformation subtasks)
- **Returns to:** `/code-generation` skill for validation and final code/documentation generation
- **Invocation pattern:** Body text in code-generation SKILL.md delegates focused technical subtask (e.g., "Generate Jest tests for validateEmail")
- **Data format:** Structured output with summary, code/explanation, notes, and confidence level

## Integration Patterns

**With Code-Generation Skill:**
- Skill receives high-level request → Agent handles detailed technical work → Skill validates and deploys

**With Planning Skill:**
- Planning identifies technical tasks → Code-Gen Agent decomposes → Agent executes individual sub-tasks

**With Testing & CI/CD:**
- Agent generates test code → Skill integrates into test suite → Pre-commit hook validates all tests pass

**Architecture-level Integration:**
- Agent can map dependencies and data flow across multiple files
- Skill uses output to document architecture decisions
- Archived to `archives/insights/architecture/`

## Advanced Scenarios

### Handling Large or Complex Codebases
**Problem:** Code context too large for agent to analyze
**Solution:**
- Extract only the relevant function or module (reduce context)
- Provide architecture diagram or module overview
- Break into smaller subtasks (e.g., test one function at a time)

### Iterative Code Review
**Workflow:**
1. Agent generates code (first pass, confidence: Medium/High)
2. Skill reviews for edge cases, security, performance
3. If issues found, provide feedback to agent with specific guidance
4. Agent refines (second pass, confidence: High)

### Type Safety & Modern Syntax
**Best practice:** Always include language/framework version in context
- "TypeScript 4.9, Node.js 18, strict mode enabled"
- "React 18, functional components, hooks-only"
- Helps agent generate modern, type-safe code

### Error Handling & Edge Cases
**Pattern:** For production code, always ask agent to handle:
- Null/undefined values
- Network timeouts (for async code)
- Type mismatches
- Boundary conditions

**Example subtask:** "Generate Jest tests for validateEmail(). Include: valid/invalid formats, null, undefined, empty string, XSS attempts."

## Worked Examples

For detailed, step-by-step examples of agent invocation patterns, see:
- **Full examples:** `.claude/agents/code-generation/worked-examples.md` (200+ lines)
- **Use cases:** Test generation, debugging, refactoring, architecture analysis, language transformation
- **Copy-paste ready:** All examples include realistic code and expected test output

## Performance Notes

- **Latency:** ~10–20 seconds (Haiku model)
- **Token usage:** ~2,500–4,000 tokens per invocation
- **Cost:** ~$0.006–0.012 per invocation
- **Code context limit:** 8,000–12,000 tokens available after instructions

Provide only the code sections relevant to the task to maximize analysis tokens.

## Debugging & Support

**If generated tests are incomplete:**
- Verify `context` includes test framework and preferences
- Check that `subtask` specifies all edge cases to cover
- Ask agent to add specific test cases (e.g., "add tests for null input and empty string")

**If code refactoring breaks functionality:**
- Provide original code + expected behavior in context
- Ask agent to explain assumptions before refactoring
- Request agent to include validation or error scenarios

**If agent says "too complex":**
- Break into smaller subtasks (one function per invocation)
- Provide simplified code examples or architecture overview
- Run multiple agent calls for different components

**For questions about agent behavior:**
- See `AGENT.md` for full system prompt and technical constraints
- Review worked-examples.md for patterns and expected outputs
