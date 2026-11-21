# /finance:forecast

Generate financial forecasts and projections.

## Usage

```
/finance:forecast "Metric or area"
/finance:forecast "Revenue" --periods 12 --method growth
/finance:forecast "Cash flow" --scenarios 3
```

## Description

Creates financial forecasts:
1. Revenue projections
2. Expense forecasting
3. Cash flow projections
4. Scenario modeling
5. Sensitivity analysis

## Options

- `--periods`: Forecast horizon (months/quarters)
- `--method`: Forecasting method (growth, regression, seasonal)
- `--scenarios`: Number of scenarios
- `--confidence`: Confidence intervals
- `--drivers`: Key business drivers

## Output Format

```markdown
## Financial Forecast

### Forecast Overview
**Metric**: {Revenue/Expense/Cash Flow}
**Horizon**: {X} months/quarters
**Method**: {Growth Rate/Regression/Seasonal}
**Generated**: {Date}

---

### Summary

| Period | Forecast | Confidence Range |
|--------|----------|------------------|
| Q1 | $X | $Y - $Z |
| Q2 | $X | $Y - $Z |
| Q3 | $X | $Y - $Z |
| Q4 | $X | $Y - $Z |
| **Annual** | **$X** | **$Y - $Z** |

---

### Forecast Details

#### Revenue Forecast
```
$2M │                              ╭──────
    │                        ╭─────╯
    │                  ╭─────╯
$1M │            ╭─────╯
    │      ╭─────╯
    │──────╯
$0M └─────────────────────────────────────
      Jan  Feb  Mar  Apr  May  Jun

── Forecast  -- Confidence Band
```

| Month | Base Case | Low | High | vs Prior Year |
|-------|-----------|-----|------|---------------|
| Jan | $X | $Y | $Z | +{%} |
| Feb | $X | $Y | $Z | +{%} |
| Mar | $X | $Y | $Z | +{%} |
| ... | ... | ... | ... | ... |

---

### Key Assumptions

| Driver | Assumption | Impact |
|--------|------------|--------|
| Growth Rate | {X}% MoM | Primary |
| Seasonality | Q4 +{X}% | Moderate |
| Churn | {X}% monthly | Moderate |
| Price Increase | {X}% in {Month} | Low |

---

### Scenario Analysis

| Scenario | Annual Revenue | Key Difference |
|----------|----------------|----------------|
| **Base Case** | $X | Current trajectory |
| **Bull Case** | $X (+{Y}%) | {assumption} |
| **Bear Case** | $X (-{Y}%) | {assumption} |

#### Bull Case Assumptions
- {Optimistic assumption 1}
- {Optimistic assumption 2}

#### Bear Case Assumptions
- {Conservative assumption 1}
- {Conservative assumption 2}

---

### Sensitivity Analysis

**Revenue Sensitivity to Key Drivers**:

| Driver | -10% | Base | +10% |
|--------|------|------|------|
| Customer Growth | $X | $X | $X |
| Price | $X | $X | $X |
| Churn | $X | $X | $X |

**Most Sensitive Driver**: {Driver name}

---

### Forecast Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| {Risk 1} | Medium | High | {Action} |
| {Risk 2} | Low | High | {Action} |

---

### Recommended Actions

1. **{Action}**: {Rationale}
2. **{Action}**: {Rationale}

### Forecast Update Schedule
- Weekly: {metrics to track}
- Monthly: {full refresh cycle}
```

## MCP Integration

- **notionApi**: Store forecasts and track accuracy
- **quick-data**: Historical data for modeling
- **pocket-pick**: Assumption library
