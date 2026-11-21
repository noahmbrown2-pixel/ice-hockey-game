# Market Analysis Skill

Auto-triggered skill for competitive and market landscape analysis.

## Trigger Phrases

- "market"
- "competitor"
- "positioning"
- "landscape"
- "competitive analysis"

## Analysis Frameworks

### 1. Competitive Landscape

```markdown
## Market Landscape: {Category}

### Market Size
- TAM: ${X}B (Total Addressable Market)
- SAM: ${X}M (Serviceable Addressable Market)
- SOM: ${X}M (Serviceable Obtainable Market)

### Key Players
| Company | Market Share | Positioning | Strength |
|---------|--------------|-------------|----------|
| Leader A | 35% | Enterprise | Scale |
| Leader B | 25% | SMB | Ease of use |
| Us | 5% | Mid-market | Innovation |

### Market Trends
1. {Trend}: {Impact on our strategy}
2. {Trend}: {Impact on our strategy}
```

### 2. Porter's Five Forces

```
                 Threat of
                New Entrants
                    ↓
                  [HIGH]
                    │
Bargaining    ┌─────┴─────┐    Bargaining
Power of  ←── │ Industry  │ ──→ Power of
Suppliers     │ Rivalry   │     Buyers
 [LOW]        │  [HIGH]   │     [MEDIUM]
              └─────┬─────┘
                    │
                  [LOW]
                    ↑
               Threat of
              Substitutes
```

### 3. SWOT Analysis

```markdown
## SWOT: {Competitor/Market}

┌─────────────────────┬─────────────────────┐
│     STRENGTHS       │    WEAKNESSES       │
├─────────────────────┼─────────────────────┤
│ • Strong brand      │ • Complex pricing   │
│ • Large user base   │ • Legacy tech debt  │
│ • Deep integrations │ • Slow innovation   │
├─────────────────────┼─────────────────────┤
│    OPPORTUNITIES    │      THREATS        │
├─────────────────────┼─────────────────────┤
│ • New market entry  │ • Well-funded rival │
│ • Partnership opp   │ • Market saturation │
│ • Platform shift    │ • Regulation changes│
└─────────────────────┴─────────────────────┘
```

### 4. Feature Comparison Matrix

```markdown
## Feature Comparison

| Capability | Us | Comp A | Comp B | Comp C |
|------------|:--:|:------:|:------:|:------:|
| Core Feature 1 | ✅ | ✅ | ✅ | ⚠️ |
| Core Feature 2 | ✅ | ✅ | ❌ | ✅ |
| Advanced 1 | ⚠️ | ✅ | ❌ | ❌ |
| Advanced 2 | ✅ | ⚠️ | ⚠️ | ❌ |
| Integration | ✅ | ✅ | ✅ | ⚠️ |

Legend: ✅ Full | ⚠️ Partial | ❌ None
```

### 5. Positioning Map

```
                Premium
                   │
    Specialized ───┼─── Generalist
                   │
                Budget
```

Plot competitors on 2×2 positioning maps using relevant dimensions.

## Data Sources

### Internal
- Win/loss analysis
- Customer feedback
- Sales call notes
- Support tickets

### External
- Industry reports (via exa search)
- Social sentiment (via xai-research)
- Review sites
- Press releases

## MCP Integration

- **exa**: Web research on competitors
- **xai-research**: Social media sentiment
- **notionApi**: Store competitive intelligence
- **pocket-pick**: Quick access to market data
