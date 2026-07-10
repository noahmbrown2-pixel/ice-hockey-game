---
name: spec-interviewing
description: Creates comprehensive specifications through deep technical interviews. Use when asked to create a spec, define requirements, interview for a config, or refine an existing specification document.
---

# Specification Interviewing

Conducts structured technical interviews to produce comprehensive specification documents.

## Modes

### Mode 1: Create from Scratch
When no existing spec is provided, begin with context gathering then interview.

### Mode 2: Refine Existing Spec
When a spec file is provided, read it first, identify gaps/ambiguities, then interview to clarify and expand.

## Interview Process

### Phase 1: Context Gathering
1. **Read existing files** in the relevant directory to understand current state
2. **Identify the domain** (config, architecture, feature, API, etc.)
3. **Note apparent decisions** already made vs. open questions

### Phase 2: Structured Interview

Conduct 20-40 questions organized by concern area. Each area should have 3-6 questions that progressively drill deeper.

#### Question Patterns to Use

**Philosophy/Mental Model Questions**
Start each concern area with high-level framing:
- "How do you think about X's role relative to Y?"
- "What's your cognitive model for how X should behave?"
- "When X and Y conflict, which wins?"

**Tradeoff Questions**
Surface non-obvious tensions:
- "X gives you A but costs B. Y gives you C but costs D. Which tradeoff do you prefer?"
- "The conventional approach is X, but given your stated preference for Y, should we do Z instead?"

**Contradiction Reconciliation**
When answers seem to conflict:
- "You mentioned wanting X, but also Y. Let me offer three ways to reconcile..."
- "Earlier you said X. This seems to tension with Y. Which takes priority?"

**Concrete Scenario Questions**
Disambiguate vague requirements:
- "Imagine you're doing X and Y happens. What should occur?"
- "When you open the tool and Z is the state, what do you expect to see?"

**Option Presentation**
For decisions with distinct implementation paths:
```
Option A: [Name] - [Description]. Tradeoff: [X]
Option B: [Name] - [Description]. Tradeoff: [Y]  
Option C: [Name] - [Description]. Tradeoff: [Z]
```

**Stack-Specific Questions**
Tailor to the user's stated stack/context:
- "Given you're using X, do you need Y integration?"
- "For your X workflow, should Z be automatic or manual?"

**Feature Inclusion/Exclusion**
Confirm minimalism boundaries:
- "Is X something you actively use, or aspirational?"
- "Would removing X break your workflow or just be inconvenient?"

### Phase 3: Synthesis

After all questions answered, write the spec document.

## Spec Document Structure

Use this structure (adapt section names to domain):

```markdown
# [Thing] Specification

[One-line summary of what this spec defines]

## Philosophy

- **[Principle 1]**: [Explanation]
- **[Principle 2]**: [Explanation]
- **[Principle 3]**: [Explanation]

---

## [Concern Area 1]

### [Sub-topic]
- [Specific decision]
- [Specific decision]

### [Sub-topic]
| Column | Column |
|--------|--------|
| Data   | Data   |

---

## [Concern Area 2]
...

---

## Non-Goals

- [Thing explicitly not in scope]
- [Thing explicitly not in scope]
```

### Key Elements

1. **Philosophy section**: 3-5 guiding principles that inform all decisions
2. **Concern areas**: Organized by functional domain, not by implementation
3. **Tables**: Use for keybindings, tool mappings, option comparisons
4. **Explicit decisions**: Every ambiguous point resolved to a concrete choice
5. **Non-goals**: Explicitly state what's out of scope to prevent scope creep

## Interview Behavior

### Do
- Ask all questions for a concern area before moving to the next
- Number questions for easy reference
- Offer explicit options when there are distinct paths
- Probe the "why" behind preferences
- Circle back when new information contradicts earlier answers
- Continue until you have enough detail to write a complete spec

### Don't
- Accept vague answers—follow up with scenarios
- Skip areas because they seem obvious
- Make assumptions without confirming
- Stop the interview prematurely
- Write the spec until all areas are covered

## Example Interview Opening

### From Scratch
> I'll help you create a specification for [X] through a structured interview. I'll ask detailed questions across several areas to understand your requirements precisely.
>
> First, let me read any existing configuration/code to understand current state...
>
> [After reading]
>
> I'll organize the interview into these areas: [list areas]. Let's start with [first area].
>
> **[Area 1]: Questions 1-5**
>
> 1. [Philosophy question about this area]
> 2. [Tradeoff question]
> ...

### Refining Existing Spec
> I've read the existing spec at [path]. I'll interview you to clarify ambiguities and fill gaps I've identified.
>
> **Gaps/Ambiguities Found:**
> - [Gap 1]
> - [Gap 2]
>
> **Areas to Explore:**
> - [Area needing clarification]
>
> Let's start with [first gap].
>
> 1. [Clarifying question]
> ...

## Completion

After writing the spec:
1. Present the full document for review
2. Ask if any sections need adjustment
3. Write to the specified file path
4. Summarize key decisions made
