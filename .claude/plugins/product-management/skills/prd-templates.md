# PRD Templates Skill

Auto-triggered skill for structured requirements documentation.

## Trigger Phrases

- "requirements"
- "PRD"
- "product spec"
- "feature spec"
- "requirements document"

## Template Selection

Choose template based on context:

| Scenario | Template | Use When |
|----------|----------|----------|
| Major feature | Full PRD | Cross-functional, multi-sprint effort |
| Small feature | Lean PRD | Single team, 1-2 sprints |
| Quick pitch | One-Pager | Stakeholder buy-in needed |
| Technical | RFC | Architecture decisions |

## Full PRD Template

```markdown
# PRD: {Feature Name}

## Document Info
| Field | Value |
|-------|-------|
| Author | {name} |
| Status | Draft / In Review / Approved |
| Created | {date} |
| Last Updated | {date} |

## Executive Summary
{2-3 sentence overview of what we're building and why}

## Problem Statement
### User Problem
{Detailed description of user pain point}

### Evidence
- {Data point or research finding}
- {User quote or feedback}
- {Market signal}

### Impact of Not Solving
{What happens if we don't address this}

## Goals
### Primary Goal
{Single measurable goal}

### Success Metrics
| Metric | Baseline | Target | Timeline |
|--------|----------|--------|----------|
| {KPI} | {current} | {goal} | {when} |

## Solution
### Proposed Approach
{High-level solution description}

### Key Features
1. **{Feature}**: {Description}
2. **{Feature}**: {Description}

### User Flows
{Describe main user journeys}

### Wireframes/Mockups
{Links or embedded images}

## Scope
### In Scope
- {Included item}

### Out of Scope
- {Excluded item}

### Future Considerations
- {Potential future enhancements}

## Technical Requirements
### Dependencies
- {System or service dependency}

### API Changes
- {New endpoints or modifications}

### Data Requirements
- {New data models or storage needs}

### Security & Privacy
- {Compliance and security considerations}

## Timeline
| Phase | Milestone | Target Date |
|-------|-----------|-------------|
| Design | Specs finalized | {date} |
| Dev | Feature complete | {date} |
| QA | Testing complete | {date} |
| Launch | GA release | {date} |

## Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| {risk} | H/M/L | H/M/L | {strategy} |

## Open Questions
- [ ] {Unresolved question}

## Appendix
- Research documents
- Competitive analysis
- Technical deep-dives
```

## Lean PRD Template

```markdown
# Feature: {Name}

**Owner**: {name} | **Target**: {date} | **Status**: {status}

## Problem
{One paragraph describing the user problem}

## Solution
{One paragraph describing the approach}

## Success Criteria
- [ ] {Measurable outcome}
- [ ] {Measurable outcome}

## Scope
**In**: {comma-separated list}
**Out**: {comma-separated list}

## Key Decisions
1. {Decision made and rationale}
```

## One-Pager Template

```markdown
# {Feature Name}

## The Problem
{2-3 sentences on user pain}

## The Solution
{2-3 sentences on approach}

## Why Now
{2-3 sentences on timing/priority}

## Success =
{Single metric with target}

## Ask
{What you need from stakeholders}
```
