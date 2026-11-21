# /data:validate

QA an analysis before sharing - methodology, accuracy, and bias checks.

## Usage

```
/data:validate "my_analysis.py"
/data:validate --strict quarterly_report
/data:validate --methodology "Did we account for seasonality?"
```

## Description

Pre-delivery quality assurance for data analysis:
1. Methodology review
2. Calculation verification
3. Bias detection
4. Documentation standards
5. Reproducibility check

## Options

- `--strict`: Apply rigorous validation standards
- `--methodology`: Focus on analytical approach
- `--calculations`: Verify numeric accuracy
- `--checklist`: Output as checklist format

## Validation Categories

### 1. Methodology
- [ ] Analysis approach is appropriate for the question
- [ ] Sample size is sufficient for conclusions
- [ ] Time period selection is justified
- [ ] Comparison groups are valid

### 2. Data Quality
- [ ] Missing data handled appropriately
- [ ] Outliers identified and addressed
- [ ] Data types are correct
- [ ] Joins produce expected row counts

### 3. Calculations
- [ ] Aggregations sum correctly
- [ ] Percentages add to 100%
- [ ] Growth rates calculated consistently
- [ ] Currency/units are consistent

### 4. Statistical Validity
- [ ] Confidence intervals included where appropriate
- [ ] Statistical significance properly applied
- [ ] Correlation vs causation distinguished
- [ ] Sample bias considered

### 5. Presentation
- [ ] Charts are not misleading
- [ ] Scales start at appropriate values
- [ ] Labels are clear and accurate
- [ ] Source data is cited

## Example Output

```
/data:validate quarterly_sales_report

## Validation Report

### Summary: 3 Issues Found

#### Critical (1)
- **Row count mismatch**: Query returns 45,231 rows but report states 45,500 orders
  - Location: Page 3, "Total Orders" metric
  - Suggested fix: Re-run query with correct date range

#### Warning (1)
- **Missing confidence interval**: Conversion rate change claimed significant without statistical test
  - Location: Page 7, "Conversion improved 15%"
  - Suggested fix: Add chi-square test or note as directional

#### Info (1)
- **Chart y-axis**: Revenue chart starts at $50K, not zero
  - Location: Page 5, Monthly Revenue chart
  - Suggested fix: Either start at zero or add break indicator

### Passed Checks
- [x] Date ranges consistent across all queries
- [x] Currency formatting correct
- [x] Percentages sum correctly
- [x] Data sources documented
```

## Integration

- Reads analysis files and notebooks
- Cross-references with source data
- Outputs validation report
- Can block sharing if critical issues found
