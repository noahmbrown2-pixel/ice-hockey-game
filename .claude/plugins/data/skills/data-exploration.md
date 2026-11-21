# Data Exploration Skill

Auto-triggered skill for data profiling and quality assessment.

## Trigger Phrases

- "explore this data"
- "what's in this dataset"
- "data quality check"
- "describe the data"
- "profile the columns"
- "data overview"

## Exploration Framework

### 1. First Look
```
Shape: rows × columns
Types: numeric, categorical, datetime, text
Memory: size in MB
```

### 2. Column Analysis

**Numeric Columns**:
- Count, mean, std, min, max
- Quartiles (25%, 50%, 75%)
- Skewness, kurtosis
- Histogram shape

**Categorical Columns**:
- Unique values count
- Top 5 categories with %
- Missing rate
- Cardinality classification

**Datetime Columns**:
- Date range (min to max)
- Gaps in sequence
- Day/month/year distributions
- Time zone considerations

### 3. Quality Checks

**Completeness**:
- Missing value rates per column
- Pattern of missingness (random vs systematic)
- Imputation recommendations

**Validity**:
- Values within expected ranges
- Format consistency (emails, phones, dates)
- Referential integrity

**Uniqueness**:
- Duplicate detection
- Key column uniqueness verification
- Near-duplicate fuzzy matching

**Consistency**:
- Cross-column logic checks
- Unit consistency
- Naming standardization

### 4. Pattern Discovery

**Distributions**:
- Normal, skewed, bimodal
- Outlier identification (IQR method)
- Clustering tendencies

**Relationships**:
- Correlation matrix for numerics
- Categorical associations (chi-square)
- Time-based patterns

## Output Template

```markdown
## Data Profile: {dataset_name}

### Overview
- **Rows**: {n_rows:,}
- **Columns**: {n_cols}
- **Memory**: {memory_mb} MB

### Column Summary
| Column | Type | Non-Null % | Unique | Notes |
|--------|------|------------|--------|-------|
| ... | ... | ... | ... | ... |

### Quality Issues
1. {issue_description}
2. {issue_description}

### Key Insights
- {insight_1}
- {insight_2}
```
