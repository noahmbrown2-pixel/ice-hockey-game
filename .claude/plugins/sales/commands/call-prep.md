# /sales:call-prep

Prepare comprehensive briefings for sales calls.

## Usage

```
/sales:call-prep "Company Name"
/sales:call-prep "Company Name" --contact "John Smith"
/sales:call-prep "Company Name" --stage discovery
```

## Description

Creates detailed call preparation briefs:
1. Company overview and recent news
2. Attendee backgrounds and roles
3. Potential pain points and opportunities
4. Competitive landscape
5. Suggested talking points and questions

## Options

- `--contact`: Specific contact to research
- `--stage`: Sales stage (discovery, demo, negotiation, close)
- `--previous`: Include previous interaction notes
- `--competitive`: Include competitor intel
- `--time`: Call duration to optimize agenda

## Output Format

```markdown
# Call Prep: {Company Name}
**Date**: {scheduled date}
**Duration**: {time}
**Stage**: {sales stage}

---

## Company Snapshot
| Field | Value |
|-------|-------|
| Industry | {industry} |
| Size | {employee count} |
| Revenue | {estimated/known} |
| Founded | {year} |
| HQ | {location} |

### Recent News
- {Date}: {Headline with relevance}
- {Date}: {Headline with relevance}

### Business Context
{2-3 sentences on current business situation}

---

## Attendees

### {Name} - {Title}
**Background**: {professional summary}
**LinkedIn**: {link}
**Key Interests**: {based on activity}
**Communication Style**: {inferred from profile}
**Potential Concerns**: {role-based concerns}

---

## Discovery Questions

### Business Situation
1. "What's driving your interest in {category} right now?"
2. "How does this initiative fit into your broader strategy?"
3. "What does success look like for this project?"

### Pain Points
1. "What challenges are you experiencing with {current solution}?"
2. "How is this impacting your team's productivity?"
3. "What have you tried before to address this?"

### Decision Process
1. "Who else is involved in evaluating solutions?"
2. "What's your timeline for making a decision?"
3. "What criteria are most important to you?"

---

## Talking Points

### Value Proposition (for this account)
- {Tailored benefit 1}
- {Tailored benefit 2}
- {Tailored benefit 3}

### Proof Points
- {Relevant case study}
- {Industry-specific metric}

### Competitive Differentiation
vs {Competitor}: {Key differentiator}

---

## Potential Objections

| Objection | Response |
|-----------|----------|
| "{Likely objection}" | {Suggested response} |
| "{Likely objection}" | {Suggested response} |

---

## Action Items

### Pre-Call
- [ ] Review {specific document}
- [ ] Prepare {demo/materials}

### Post-Call
- [ ] Send follow-up email within 24h
- [ ] Update CRM with notes
- [ ] Schedule next meeting
```

## MCP Integration

- **exa**: Company research and news
- **xai-research**: Social media activity
- **notionApi**: Previous interaction history
- **pocket-pick**: Saved account intelligence
