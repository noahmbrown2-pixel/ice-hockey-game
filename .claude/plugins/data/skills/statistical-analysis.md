# Statistical Analysis Skill

Auto-triggered skill for statistical methods and interpretation.

## Trigger Phrases

- "is this significant"
- "correlation between"
- "regression analysis"
- "hypothesis test"
- "confidence interval"
- "trend analysis"

## Statistical Methods

### 1. Descriptive Statistics
```
Central tendency: mean, median, mode
Spread: std, variance, IQR, range
Shape: skewness, kurtosis
```

### 2. Hypothesis Testing

**Common Tests**:
| Test | Use Case | Assumptions |
|------|----------|-------------|
| t-test | Compare two means | Normal, equal variance |
| Chi-square | Category independence | Expected count ≥ 5 |
| ANOVA | Compare 3+ groups | Normal, equal variance |
| Mann-Whitney | Non-parametric 2 groups | Ordinal data |
| Kruskal-Wallis | Non-parametric 3+ groups | Ordinal data |

**Interpretation**:
- p < 0.05: Statistically significant
- p < 0.01: Highly significant
- Effect size matters more than p-value
- Report confidence intervals

### 3. Correlation

**Pearson** (linear relationship):
```
|r| < 0.3: Weak
0.3 ≤ |r| < 0.5: Moderate
0.5 ≤ |r| < 0.7: Strong
|r| ≥ 0.7: Very strong
```

**Spearman** (monotonic, ordinal data)
**Kendall** (small samples, ordinal)

### 4. Regression

**Linear Regression**:
```
y = β₀ + β₁x₁ + β₂x₂ + ... + ε

Metrics:
- R²: Variance explained
- Adjusted R²: Penalized for complexity
- RMSE: Prediction error
- p-values: Coefficient significance
```

**Assumptions**:
1. Linearity
2. Independence
3. Homoscedasticity
4. Normality of residuals

### 5. Time Series

**Trend Detection**:
- Moving averages
- Seasonal decomposition
- Growth rate calculation

**Forecasting Basics**:
- Exponential smoothing
- ARIMA concepts
- Seasonality handling

## Reporting Template

```markdown
## Statistical Analysis Results

### Test Performed
{test_name}

### Hypothesis
- H₀: {null_hypothesis}
- H₁: {alternative_hypothesis}

### Results
- Test statistic: {value}
- p-value: {p_value}
- Effect size: {effect_size}
- 95% CI: [{lower}, {upper}]

### Interpretation
{plain_language_explanation}

### Caveats
- Sample size: {n}
- Assumptions checked: {list}
```

## Common Pitfalls

1. **Multiple comparisons**: Adjust for Bonferroni
2. **Correlation ≠ causation**: Always note
3. **Overfitting**: Use train/test split
4. **p-hacking**: Pre-register hypotheses
5. **Cherry-picking**: Report all results
