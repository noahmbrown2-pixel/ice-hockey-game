# Company Research Skill

Auto-triggered skill for gathering company intelligence.

## Trigger Phrases

- "research company"
- "company background"
- "about this company"
- "tell me about"

## Research Framework

### Quick Research (Default)
```markdown
## {Company Name} - Quick Overview

**Industry**: {industry}
**Size**: {employee count}
**Revenue**: {estimate}
**HQ**: {location}
**Founded**: {year}

### What They Do
{1-2 sentence description}

### Recent News
- {Most relevant recent headline}

### Key Contact Suggestions
- {Title}: {typical decision maker}
```

### Standard Research
```markdown
## {Company Name} - Research Brief

### Company Profile
| Field | Value |
|-------|-------|
| Website | {url} |
| Industry | {industry} |
| Sub-sector | {sub-sector} |
| Founded | {year} |
| Headquarters | {location} |
| Employees | {count} |
| Revenue | {amount} |

### Business Overview
{Paragraph describing what they do, how they make money, who they serve}

### Recent Developments
| Date | Event | Relevance |
|------|-------|-----------|
| {date} | {event} | {why it matters} |

### Technology Signals
- {Tech they use/hire for}

### Leadership
- **CEO**: {name}
- **CTO**: {name}
- **Relevant VP**: {name}

### Opportunity Indicators
- {Signal that suggests need for our solution}
```

## Data Sources

### Primary (via exa)
- Company website
- News articles
- Press releases
- Industry reports

### Secondary (via xai-research)
- Executive social posts
- Company social accounts
- Industry discussions

### Stored (via pocket-pick/notionApi)
- Previous research
- Interaction history
- Account notes

## Research Depth Levels

| Level | Time | Sources | Use Case |
|-------|------|---------|----------|
| Quick | 30s | 2-3 | Pre-cold call |
| Standard | 2min | 5-10 | Meeting prep |
| Deep | 5min | 15+ | Strategic account |

## Accuracy Notes

- Revenue estimates may vary ±30%
- Employee counts from LinkedIn
- Always verify critical data before presentation
