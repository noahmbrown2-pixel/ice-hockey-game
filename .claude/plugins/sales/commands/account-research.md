# /sales:account-research

Research company and key stakeholders comprehensively.

## Usage

```
/sales:account-research "Company Name"
/sales:account-research "Company Name" --deep
/sales:account-research "Company Name" --focus technology
```

## Description

Performs comprehensive account research:
1. Company background and financials
2. Leadership team profiles
3. Technology stack analysis
4. Recent news and announcements
5. Competitive landscape
6. Potential use cases

## Options

- `--deep`: Extended research with more sources
- `--focus`: Research focus area (technology, leadership, financials, news)
- `--save`: Save to account database
- `--format`: Output format (brief, standard, comprehensive)

## Output Format

```markdown
# Account Research: {Company Name}

## Executive Summary
{3-4 sentence overview of the company and opportunity}

---

## Company Overview

### Basic Information
| Field | Value |
|-------|-------|
| Legal Name | {name} |
| Website | {url} |
| Industry | {industry} |
| Sub-industry | {sub-industry} |
| Founded | {year} |
| Headquarters | {city, country} |

### Size & Scale
| Metric | Value | Source |
|--------|-------|--------|
| Employees | {count} | LinkedIn |
| Revenue | {amount} | {source} |
| Funding | {total raised} | Crunchbase |
| Valuation | {if known} | {source} |

### Business Model
- **Primary Revenue**: {description}
- **Customer Base**: {B2B/B2C/Both}
- **Key Markets**: {geographies}

---

## Leadership Team

### Executive Team
| Name | Title | Background | LinkedIn |
|------|-------|------------|----------|
| {name} | CEO | {1-line background} | {link} |
| {name} | CTO | {1-line background} | {link} |
| {name} | CFO | {1-line background} | {link} |

### Key Decision Makers for {Our Solution}
- **{Name}**: {Title} - {Why they matter}
- **{Name}**: {Title} - {Why they matter}

---

## Technology Landscape

### Known Tech Stack
- **Infrastructure**: {AWS/GCP/Azure/etc}
- **CRM**: {Salesforce/HubSpot/etc}
- **Data**: {tools}
- **Dev Tools**: {tools}

### Signals
- {Technology signal with implication}
- {Job posting indicating tech direction}

---

## Recent Developments

### News & Announcements
| Date | Headline | Relevance |
|------|----------|-----------|
| {date} | {headline} | {why it matters} |
| {date} | {headline} | {why it matters} |

### Press Releases
- {Recent significant announcement}

### Social Activity
- {Relevant executive posts or company activity}

---

## Competitive Landscape

### Current Vendors (in our space)
- {Vendor}: {Evidence/source}

### Competitive Positioning
| Competitor | Relationship | Threat Level |
|------------|--------------|--------------|
| {name} | Current vendor | High |
| {name} | Evaluating | Medium |

---

## Opportunity Analysis

### Potential Pain Points
1. {Pain point with evidence}
2. {Pain point with evidence}

### Use Cases
1. **{Use Case}**: {How we solve it}
2. **{Use Case}**: {How we solve it}

### Buying Triggers
- {Recent event that might drive purchase}
- {Business change creating need}

### Estimated Deal Size
- **Initial**: ${range}
- **Expansion**: ${range}
- **Timeline**: {estimated decision timeframe}

---

## Recommended Approach

### Entry Point
{Suggested first contact and message}

### Value Proposition
{Tailored value prop for this account}

### Next Steps
1. {Specific action}
2. {Specific action}
```

## MCP Integration

- **exa**: Web research, company information
- **xai-research**: Social media and news
- **notionApi**: Store research in CRM database
- **pocket-pick**: Cache frequently accessed accounts
