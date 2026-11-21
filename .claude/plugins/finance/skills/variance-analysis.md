# Variance Analysis Skill

Auto-triggered skill for budget vs actual analysis.

## Trigger Phrases

- "variance"
- "budget vs actual"
- "over budget"
- "under budget"

## Variance Framework

### Variance Types

| Type | Formula | Meaning |
|------|---------|---------|
| Favorable Revenue | Actual > Budget | More revenue than planned |
| Unfavorable Revenue | Actual < Budget | Less revenue than planned |
| Favorable Expense | Actual < Budget | Spent less than planned |
| Unfavorable Expense | Actual > Budget | Spent more than planned |

### Significance Thresholds

| Variance % | Classification | Action |
|------------|----------------|--------|
| <5% | Immaterial | Monitor |
| 5-10% | Notable | Investigate |
| 10-20% | Significant | Explain & Plan |
| >20% | Critical | Immediate Action |

### Analysis Template

```markdown
## Variance Analysis: {Period}

### Summary
| Category | Budget | Actual | Var $ | Var % | Status |
|----------|--------|--------|-------|-------|--------|
| Revenue | $X | $X | $X | {%} | 🟢/🔴 |
| COGS | $X | $X | $X | {%} | 🟢/🔴 |
| Gross Profit | $X | $X | $X | {%} | 🟢/🔴 |
| OpEx | $X | $X | $X | {%} | 🟢/🔴 |
| Net Income | $X | $X | $X | {%} | 🟢/🔴 |

### Significant Variances

#### Revenue Variance: ${X} ({Y}%) - {Favorable/Unfavorable}
**Root Cause**: {Primary reason}
**Contributing Factors**:
- {Factor 1}: ${impact}
- {Factor 2}: ${impact}

**Price Variance**: {volume held constant}
**Volume Variance**: {price held constant}

**Corrective Action**: {If unfavorable}

---

#### {Category} Variance: ${X} ({Y}%) - {Favorable/Unfavorable}
**Root Cause**: {Primary reason}
**Contributing Factors**:
- {Factor 1}: ${impact}

**Permanent or Timing?**: {Assessment}
**Corrective Action**: {If needed}
```

### Decomposition Methods

**Price/Volume Analysis**:
```
Total Variance = Price Variance + Volume Variance

Price Variance = (Actual Price - Budget Price) × Actual Volume
Volume Variance = (Actual Volume - Budget Volume) × Budget Price
```

**Mix Analysis**:
```
For multi-product revenue:
Mix Variance = impact of selling different product proportions
```

### Waterfall Chart Concept

```
Budget:       $100,000  ████████████████████
Price impact:   +5,000  ██
Volume impact:  -8,000       ████
Other:          +2,000  █
─────────────────────────────────────────────
Actual:        $99,000  ███████████████████▌
```

### YTD vs Monthly View

Always analyze both:
- **Monthly**: Timing differences, anomalies
- **YTD**: True performance trend, normalizes timing

### Forecasting Impact

```markdown
### Forecast Implications

| Item | Original Forecast | Revised | Change |
|------|-------------------|---------|--------|
| Full Year Revenue | $X | $X | {+/-}% |
| Full Year Expense | $X | $X | {+/-}% |

**Reforecast Needed**: Yes/No
**Key Assumptions Changed**: {List}
```
