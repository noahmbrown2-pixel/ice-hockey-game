# Roadmap Visualization Skill

Auto-triggered skill for creating product roadmaps and timelines.

## Trigger Phrases

- "roadmap"
- "timeline"
- "gantt"
- "release plan"
- "when will we ship"

## Visualization Types

### 1. Timeline Roadmap

Best for: Executive presentations, external communication

```
    2026 Q1                    2026 Q2                    2026 Q3
    ├──────────────────────────┼──────────────────────────┼───────────
    │▓▓▓▓▓▓▓▓▓▓▓░░░            │                          │
    │ Auth System v2           │                          │
    │                          │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓        │
    │                          │ API Platform              │
    │              ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░          │
    │              Mobile App MVP                          │
    │                                    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    │                                    Analytics Dashboard
    ▼ Beta          ▼ Public Launch      ▼ Enterprise
```

### 2. Swimlane Roadmap

Best for: Team coordination, resource planning

```
┌──────────────┬────────────┬────────────┬────────────┐
│ Team/Stream  │   Now      │   Next     │   Later    │
├──────────────┼────────────┼────────────┼────────────┤
│ Platform     │ █ Auth v2  │ █ API GW   │ █ Scale    │
│              │ █ Config   │            │            │
├──────────────┼────────────┼────────────┼────────────┤
│ Product      │ █ Search   │ █ Mobile   │ █ AI Feat  │
│              │            │ █ Dash v2  │            │
├──────────────┼────────────┼────────────┼────────────┤
│ Data         │ █ Pipeline │ █ ML Infra │ █ Insights │
└──────────────┴────────────┴────────────┴────────────┘
```

### 3. Theme-Based Roadmap

Best for: Strategic communication, stakeholder alignment

```
┌─────────────────────────────────────────────────────────┐
│                    2026 Roadmap                         │
├─────────────────────────────────────────────────────────┤
│ Q1: Foundation                                          │
│   Theme: Infrastructure & Reliability                   │
│   • Auth System v2                                      │
│   • Performance Optimization                            │
│   • Security Hardening                                  │
├─────────────────────────────────────────────────────────┤
│ Q2: Growth                                              │
│   Theme: User Acquisition & Expansion                   │
│   • Mobile App Launch                                   │
│   • API Platform                                        │
│   • Partner Integrations                                │
├─────────────────────────────────────────────────────────┤
│ Q3: Intelligence                                        │
│   Theme: Data & AI Features                             │
│   • Analytics Dashboard                                 │
│   • ML Recommendations                                  │
│   • Predictive Features                                 │
└─────────────────────────────────────────────────────────┘
```

### 4. Kanban Roadmap

Best for: Continuous delivery, agile teams

```
┌────────────┬────────────┬────────────┬────────────┬────────────┐
│  Backlog   │  Planned   │ In Progress│  Testing   │  Shipped   │
├────────────┼────────────┼────────────┼────────────┼────────────┤
│ • Feature F│ • Feature D│ • Feature A│ • Feature B│ • Feature X│
│ • Feature G│ • Feature E│ • Feature C│            │ • Feature Y│
│ • Feature H│            │            │            │ • Feature Z│
│ • Feature I│            │            │            │            │
└────────────┴────────────┴────────────┴────────────┴────────────┘
```

## Status Indicators

```
▓▓▓▓ Completed/Shipped
████ In Progress
░░░░ Planned
╌╌╌╌ At Risk
     Not Started
```

## HTML Output Template

Roadmaps can be output as interactive HTML:

```html
<!-- Saved to html-output/YYYYMMDD-roadmap-{name}.html -->
<div class="roadmap-container">
  <div class="timeline-header">...</div>
  <div class="swimlanes">...</div>
  <div class="milestones">...</div>
</div>
```

Accessible at: `http://34.58.12.50:8080/{filename}`

## Dependency Mapping

Show relationships between items:
```
Auth v2 ──────blocks──────► API Gateway
    │                           │
    └───────────┬───────────────┘
                │
                ▼
          Mobile App
```
