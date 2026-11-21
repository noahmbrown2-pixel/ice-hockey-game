# Reasoning Templates for Sequential Thinking MCP

Use `mcp__sequentialthinking__sequentialthinking` tool with these templates for structured reasoning.

## Budget Guidelines

| Task Complexity | Max Thoughts | Example |
|-----------------|--------------|---------|
| Simple | 5-8 | Quick decision, single option |
| Medium | 8-12 | Trade-off analysis, 2-3 options |
| Complex | 12-15 | Architecture decision, many factors |

---

## Architecture Decision Template

**When**: Choosing between architectural patterns, frameworks, or approaches.

```
Thought 1: State the problem and constraints clearly
- What are we trying to achieve?
- What constraints must we respect? (budget, time, team skills, existing stack)

Thought 2: Identify candidate approaches (2-3 max)
- Option A: [name] - brief description
- Option B: [name] - brief description
- Option C: [name] - brief description

Thought 3: Evaluate Option A against NFRs
- Performance: [assessment]
- Security: [assessment]
- Maintainability: [assessment]
- Cost: [assessment]

Thought 4: Evaluate Option B against NFRs
[Same structure as above]

Thought 5: Evaluate Option C against NFRs
[Same structure as above]

Thought 6: Check for hidden assumptions
- What are we assuming about the environment?
- What could change that would invalidate our choice?
- Are there dependencies we haven't considered?

Thought 7: Select and justify
- Recommended: [Option X]
- Primary reason: [key differentiator]
- Trade-offs accepted: [what we're giving up]
- Conditions for revisiting: [when to reconsider]
```

---

## Debugging Template

**When**: Investigating a bug, test failure, or unexpected behavior.

```
Thought 1: Reproduce the symptom
- What is the observed behavior?
- What is the expected behavior?
- Steps to reproduce: [1, 2, 3...]

Thought 2: Form initial hypothesis
- Based on the symptom, what are 2-3 possible causes?
- Hypothesis A: [description]
- Hypothesis B: [description]

Thought 3: Design experiment for Hypothesis A
- What would confirm or refute this hypothesis?
- Test: [specific action]
- Expected result if true: [X]
- Expected result if false: [Y]

Thought 4: Execute experiment and observe
- Result: [what happened]
- Conclusion: [confirms/refutes hypothesis]

Thought 5: (if needed) Test Hypothesis B
[Same structure as Thought 3-4]

Thought 6: Identify root cause
- The root cause is: [precise description]
- Evidence: [what confirmed this]
- Related areas that might be affected: [list]

Thought 7: Propose fix
- Fix: [specific code/config change]
- Why this works: [explanation]
- Risk of regression: [assessment]
- How to verify: [test plan]
```

---

## Error Escalation Template

**When**: Deciding how to handle an error or when to escalate.

```
Thought 1: Classify the error
- Error message: [exact text]
- Category: BUILD | TEST | RUNTIME | LOGIC | INFRASTRUCTURE
- Severity: LOW | MEDIUM | HIGH | CRITICAL

Thought 2: Check known solutions
- Query Memory MCP: memory.search_nodes({ label: "LessonLearned" })
- Similar errors found: [yes/no]
- Previous solutions: [list if any]

Thought 3: Assess one-shot fix potential
- Can this be fixed with a simple change? [yes/no]
- Confidence level: [0-100%]
- If yes, proposed fix: [description]

Thought 4: Attempt fix (if confidence > 70%)
- Applied change: [what was done]
- Result: [success/failure]

Thought 5: Escalation decision
- If fix succeeded: DONE
- If fix failed OR confidence < 70%:
  - Route to: troubleshooter (Level 1) | debugger (Level 2) | stuck (Level 3)
  - Reason: [why this escalation level]
  - Context to pass: [summary for next agent]
```

---

## Research Synthesis Template

**When**: Combining findings from multiple sources into actionable recommendations.

```
Thought 1: List all sources reviewed
- Source 1: [name, type, date]
- Source 2: [name, type, date]
- Source N: [name, type, date]

Thought 2: Identify key findings
- Finding 1: [fact] (Source: X)
- Finding 2: [fact] (Source: Y)
- Finding N: [fact] (Source: Z)

Thought 3: Check for conflicts
- Conflict found: [yes/no]
- If yes: [description of conflicting information]
- Resolution: [how to resolve OR escalate to stuck]

Thought 4: Assess confidence
- High confidence facts: [list]
- Medium confidence facts: [list]
- Uncertain/needs verification: [list]

Thought 5: Synthesize recommendations
- Primary recommendation: [actionable statement]
- Supporting evidence: [list of facts]
- Risks/unknowns: [list]
- Next steps: [what the architect/coder should do]
```

---

## Logic Validation Template

**When**: Validating a proposed solution before implementation.

```
Thought 1: State the proposal being validated
- Summary: [1-2 sentences]
- Author/source: [agent or human]
- Scope: [what parts of system affected]

Thought 2: Decompose into logical steps
- Step 1: [action] → [expected outcome]
- Step 2: [action] → [expected outcome]
- Step N: [action] → [expected outcome]

Thought 3: Identify assumptions
- Assumption 1: [statement] - validated? [yes/no/need to check]
- Assumption 2: [statement] - validated? [yes/no/need to check]

Thought 4: Check for edge cases
- Edge case 1: [scenario] - handled? [yes/no]
- Edge case 2: [scenario] - handled? [yes/no]
- Missing cases: [list]

Thought 5: Query past decisions
- Similar decisions in Memory: [list]
- Lessons learned applicable: [list]
- Warnings from past: [list]

Thought 6: Calculate confidence score
- Assumptions validated: [X/Y]
- Edge cases handled: [X/Y]
- Past lessons incorporated: [yes/no]
- Overall confidence: [0-100%]

Thought 7: Final recommendation
- If confidence >= 70%: PROCEED with notes
- If confidence < 70%: REVISE or ESCALATE
- Required changes before proceeding: [list]
```

---

## Usage with Sequential Thinking MCP

```javascript
// Example invocation
mcp__sequentialthinking__sequentialthinking({
  thought: "Thought 1: State the problem - We need to choose between REST and GraphQL for our API...",
  nextThoughtNeeded: true,
  thoughtNumber: 1,
  totalThoughts: 7  // Estimate, can adjust
})

// Continue with subsequent thoughts
mcp__sequentialthinking__sequentialthinking({
  thought: "Thought 2: Identify candidates - Option A: REST with OpenAPI...",
  nextThoughtNeeded: true,
  thoughtNumber: 2,
  totalThoughts: 7
})

// Can revise previous thoughts if needed
mcp__sequentialthinking__sequentialthinking({
  thought: "Revising Thought 2: Adding Option C that was initially overlooked...",
  nextThoughtNeeded: true,
  thoughtNumber: 3,
  totalThoughts: 8,  // Adjusted up
  isRevision: true,
  revisesThought: 2
})

// Final thought
mcp__sequentialthinking__sequentialthinking({
  thought: "Thought 8: Final recommendation - Choose GraphQL because...",
  nextThoughtNeeded: false,
  thoughtNumber: 8,
  totalThoughts: 8
})
```
