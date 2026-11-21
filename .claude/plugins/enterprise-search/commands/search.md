# /enterprise-search:search

Search across all connected sources simultaneously with filter support.

## Usage

```
/enterprise-search:search "What's the status of Project Aurora?"
/enterprise-search:search from:craig about:budget after:2026-01-01
/enterprise-search:search "API documentation" in:notion,pocket-pick
```

## Description

Unified search that:
1. Queries all available sources in parallel
2. Translates filters to source-native syntax
3. Deduplicates and ranks results
4. Synthesizes coherent answers with attribution

## Filter Syntax

| Filter | Description | Example |
|--------|-------------|---------|
| `from:` | Author/sender | `from:craig` |
| `in:` | Source(s) | `in:notion,exa` |
| `after:` | Date minimum | `after:2026-01-01` |
| `before:` | Date maximum | `before:2026-02-01` |
| `type:` | Content type | `type:document,message` |

## Available Sources

| Source | Content | Connector |
|--------|---------|-----------|
| Notion | Pages, databases | notionApi |
| Web | General search | exa |
| Pocket Pick | Stored data | pocket-pick |
| X/Twitter | Posts, research | xai-research |
| Sessions | Chat history | Local files |

## Examples

**Simple Search**:
```
/enterprise-search:search "onboarding process"

## Results (12 found)

### Notion (5 results)
1. **Employee Onboarding Checklist** - Updated Jan 15
   _Comprehensive checklist for new hire onboarding..._

2. **Onboarding FAQ** - Updated Dec 10
   _Common questions and answers about the process..._

### Sessions (4 results)
1. **Session 2026-01-20**: Discussed automation of onboarding
2. **Session 2026-01-08**: Reviewed onboarding metrics

### Web (3 results)
1. **Industry Best Practices for Remote Onboarding**
   _Source: hbr.org_
```

**Filtered Search**:
```
/enterprise-search:search from:craig about:budget after:2026-01-01 in:notion

## Results (3 found)

### Notion
1. **Q1 2026 Budget Planning** - Jan 5
   _Budget allocation discussions and decisions..._
   Author: Craig Brown

2. **Budget Review Meeting Notes** - Jan 12
   _Quarterly review of department budgets..._
   Author: Craig Brown
```

## Synthesis

Results are synthesized into coherent answers:

```markdown
## Answer

Based on searching across Notion, sessions, and web sources:

The **Project Aurora status** is:
- Currently in Phase 2 (Development)
- On track for March delivery
- 3 open blockers identified in Jan 25 review

### Sources
1. [Notion: Project Aurora Tracker](notion://...)
2. [Session 2026-01-25: Weekly Standup]
3. [Notion: Q1 Roadmap]
```

## MCP Integration

- **notionApi**: Database and page search
- **exa**: Web search with semantic understanding
- **pocket-pick**: Key-value lookups
- **xai-research**: X/Twitter and Grokopedia
