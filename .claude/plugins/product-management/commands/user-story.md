# /pm:user-story

Generate user stories from requirements or feature descriptions.

## Usage

```
/pm:user-story "Feature description"
/pm:user-story --from-prd "PRD document or link"
/pm:user-story --persona "Power User" "Feature description"
```

## Description

Creates well-structured user stories:
1. Standard format (As a... I want... So that...)
2. Acceptance criteria
3. Story points estimation
4. Dependencies and blockers
5. Testing scenarios

## Options

- `--from-prd`: Extract stories from existing PRD
- `--persona`: Specify user persona
- `--detailed`: Include full acceptance criteria
- `--epic`: Group into epic structure
- `--notion`: Save to Notion database

## Output Format

### Standard Story
```markdown
## User Story: {Title}

**Story ID**: US-{number}
**Epic**: {Epic Name}
**Priority**: High | Medium | Low
**Points**: {estimate}

### Story
As a **{user type}**,
I want to **{action/goal}**,
So that **{benefit/value}**.

### Acceptance Criteria
- [ ] Given {context}, when {action}, then {expected result}
- [ ] Given {context}, when {action}, then {expected result}
- [ ] Given {context}, when {action}, then {expected result}

### Technical Notes
- {Implementation considerations}
- {API changes needed}
- {Database changes}

### Dependencies
- Blocked by: {other stories/tasks}
- Blocks: {dependent stories}

### Test Scenarios
1. **Happy Path**: {description}
2. **Edge Case**: {description}
3. **Error Case**: {description}
```

### Epic Structure
```markdown
## Epic: {Epic Name}

### Description
{High-level description of the epic}

### User Stories

#### US-001: {Story Title}
As a {user}, I want to {goal}, so that {benefit}
**Points**: 3 | **Priority**: High

#### US-002: {Story Title}
As a {user}, I want to {goal}, so that {benefit}
**Points**: 5 | **Priority**: High

#### US-003: {Story Title}
As a {user}, I want to {goal}, so that {benefit}
**Points**: 2 | **Priority**: Medium

### Total Points: 10
### Estimated Sprints: 2
```

## Persona-Based Stories

When `--persona` is specified, stories reflect persona characteristics:

```markdown
## Persona: Power User

### Characteristics
- Technical proficiency: High
- Usage frequency: Daily
- Primary goals: Efficiency, automation
- Pain points: Repetitive tasks, lack of shortcuts

### Stories for Power User

#### US-101: Keyboard Shortcuts
As a **power user**,
I want to **use keyboard shortcuts for common actions**,
So that **I can work faster without using the mouse**.

#### US-102: Bulk Operations
As a **power user**,
I want to **perform bulk operations on multiple items**,
So that **I can manage large datasets efficiently**.
```

## MCP Integration

- **notionApi**: Create stories in backlog database
- **pocket-pick**: Retrieve persona definitions
