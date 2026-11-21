# /pm:roadmap

Create and visualize product roadmaps.

## Usage

```
/pm:roadmap
/pm:roadmap --timeframe "Q1-Q2 2026"
/pm:roadmap --view timeline
/pm:roadmap --project "Platform Modernization"
```

## Description

Generates visual roadmaps showing:
1. Feature timeline across quarters/months
2. Dependencies between items
3. Team/resource allocation
4. Milestone markers
5. Current progress indicators

## Options

- `--timeframe`: Time period to display
- `--view`: Visualization type (timeline, kanban, swimlane)
- `--project`: Filter to specific project
- `--team`: Filter by team ownership
- `--format`: Output format (html, notion, markdown)

## Roadmap Views

### Timeline View (Default)
```
        Q1 2026           Q2 2026           Q3 2026
    Jan   Feb   Mar   Apr   May   Jun   Jul   Aug   Sep
    ─────────────────────────────────────────────────────
    ████████████░░░░░░                              Auth v2
              ░░░░░████████████                     API Gateway
                        ████████████████████████    Platform v3
    ▼ Milestone: Beta Launch
                              ▼ Milestone: GA
```

### Swimlane View (by Team)
```
┌─────────────┬──────────────┬──────────────┬──────────────┐
│   Team      │     Q1       │      Q2      │      Q3      │
├─────────────┼──────────────┼──────────────┼──────────────┤
│ Platform    │ ███ Auth v2  │ ██████ API   │ ████ Scale   │
│ Frontend    │ ██ Dashboard │ ████ Mobile  │              │
│ Data        │              │ ██ Pipeline  │ ████ ML      │
└─────────────┴──────────────┴──────────────┴──────────────┘
```

### Kanban View
```
┌───────────────┬───────────────┬───────────────┬───────────────┐
│    Backlog    │   Planned     │  In Progress  │   Shipped     │
├───────────────┼───────────────┼───────────────┼───────────────┤
│ • Feature E   │ • Feature C   │ • Feature A   │ • Feature X   │
│ • Feature F   │ • Feature D   │ • Feature B   │ • Feature Y   │
└───────────────┴───────────────┴───────────────┴───────────────┘
```

## Output Format

```markdown
## Product Roadmap - 2026

### Current Quarter: Q1 2026
**Theme**: Foundation & Infrastructure

#### In Progress
- **Auth System v2** (60% complete)
  - Team: Platform
  - Target: Feb 28
  - Dependencies: None

- **Dashboard Redesign** (40% complete)
  - Team: Frontend
  - Target: Mar 15
  - Dependencies: Design system update

#### Upcoming (Q2)
- **API Gateway**
- **Mobile App MVP**

### Milestones
- ✅ Jan 15: Design system v2 shipped
- ⏳ Feb 28: Auth v2 beta
- ◯ Mar 31: Q1 feature freeze

### Dependencies
Auth v2 ──blocks──> API Gateway
Design System ──blocks──> Dashboard
```

## HTML Output

Saves interactive roadmap to:
```
html-output/YYYYMMDD-roadmap-{project}.html
```

## MCP Integration

- **notionApi**: Sync with product databases
- **pocket-pick**: Store roadmap configuration
