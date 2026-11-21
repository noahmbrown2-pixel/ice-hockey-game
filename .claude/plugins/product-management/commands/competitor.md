# /pm:competitor

Analyze competitor products and market positioning.

## Usage

```
/pm:competitor "Competitor Name"
/pm:competitor --compare "Our Product" vs "Competitor A, Competitor B"
/pm:competitor --feature "Authentication" --landscape
```

## Description

Performs competitive analysis:
1. Feature comparison matrices
2. Pricing analysis
3. Positioning maps
4. Strengths/weaknesses assessment
5. Market share insights

## Options

- `--compare`: Compare multiple products
- `--feature`: Focus on specific feature area
- `--landscape`: Full market landscape view
- `--pricing`: Focus on pricing comparison
- `--deep-dive`: Comprehensive single competitor analysis

## Output Formats

### Feature Comparison Matrix
```markdown
## Feature Comparison: {Category}

| Feature | Our Product | Competitor A | Competitor B |
|---------|-------------|--------------|--------------|
| SSO | ✅ Full | ✅ Full | ⚠️ Limited |
| API | ✅ REST + GraphQL | ✅ REST | ❌ None |
| Mobile | ⚠️ In Progress | ✅ Native | ✅ Web only |
| Pricing | $$ | $$$ | $ |

### Legend
✅ Full support | ⚠️ Partial/Limited | ❌ Not available
```

### Positioning Map
```
                    Enterprise Focus
                          │
         Competitor A     │     Our Product
              ●           │          ●
                          │
    ──────────────────────┼──────────────────────
    Simple                │              Feature-Rich
                          │
              ●           │          ●
         Competitor C     │     Competitor B
                          │
                    SMB Focus
```

### SWOT Analysis
```markdown
## Competitor Analysis: {Name}

### Strengths
- Strong brand recognition
- Extensive integration ecosystem
- Large customer base

### Weaknesses
- Complex pricing
- Slow feature velocity
- Limited customization

### Opportunities (for us)
- Underserved mid-market segment
- Modern API-first approach
- Better developer experience

### Threats
- May acquire smaller competitors
- Deep pockets for feature development
- Established enterprise relationships
```

### Pricing Comparison
```markdown
## Pricing Analysis

| Tier | Our Product | Competitor A | Competitor B |
|------|-------------|--------------|--------------|
| Free | ✅ 3 users | ✅ 2 users | ❌ None |
| Pro | $15/user/mo | $20/user/mo | $12/user/mo |
| Enterprise | Custom | $35/user/mo | Custom |

### Value Analysis
- Best for small teams: Competitor B
- Best for mid-market: Our Product
- Best for enterprise: Competitor A
```

## MCP Integration

- **exa**: Web research on competitors
- **xai-research**: Social sentiment analysis
- **notionApi**: Store competitive intelligence
- **pocket-pick**: Quick access to competitor data
