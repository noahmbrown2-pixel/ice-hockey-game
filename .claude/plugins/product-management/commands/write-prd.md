# /pm:write-prd

Generate comprehensive Product Requirements Documents.

## Usage

```
/pm:write-prd "Feature Name"
/pm:write-prd "Feature Name" --template lean
/pm:write-prd "Feature Name" --audience engineering
```

## Description

Creates structured PRDs with:
1. Problem statement and user needs
2. Proposed solution and scope
3. Success metrics and acceptance criteria
4. Technical considerations
5. Timeline and dependencies

## Options

- `--template`: PRD template type (full, lean, one-pager)
- `--audience`: Target audience (engineering, stakeholders, executive)
- `--include-research`: Pull in relevant user research
- `--notion`: Save directly to Notion database

## PRD Structure

### Full Template
```markdown
# PRD: {Feature Name}

## Overview
- **Author**: {name}
- **Created**: {date}
- **Status**: Draft | In Review | Approved
- **Target Release**: {quarter/version}

## Problem Statement
### User Problem
{What pain point are we solving?}

### Business Impact
{Why does this matter to the business?}

### Current State
{How do users solve this today?}

## Goals & Success Metrics
### Primary Goal
{Single sentence goal}

### Success Metrics
| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| {metric} | {baseline} | {goal} | {how measured} |

## User Stories
As a {user type}, I want to {action} so that {benefit}

## Proposed Solution
### High-Level Approach
{Description of the solution}

### Key Features
1. **{Feature}**: {Description}
2. **{Feature}**: {Description}

### Out of Scope
- {What we're NOT building}

## Technical Considerations
### Dependencies
- {External systems, APIs, services}

### Technical Risks
- {Potential technical challenges}

### Security & Privacy
- {Data handling, compliance requirements}

## Timeline & Milestones
| Phase | Deliverable | Date |
|-------|-------------|------|
| Design | Mockups complete | {date} |
| Development | MVP ready | {date} |
| Testing | QA complete | {date} |
| Launch | GA release | {date} |

## Open Questions
- [ ] {Question needing resolution}

## Appendix
### User Research
{Links to research documents}

### Competitive Analysis
{Links to competitor analysis}
```

## MCP Integration

- **notionApi**: Store PRD in product database
- **exa**: Research competitive features
- **pocket-pick**: Retrieve saved product insights
