# Data Validation Skill

Auto-triggered skill for data quality validation and sanity checks.

## Trigger Phrases

- "validate this data"
- "sanity check"
- "is this data correct"
- "verify the numbers"
- "quality check"

## Validation Framework

### 1. Schema Validation
```
Check:
- Column names match expected
- Data types are correct
- Required columns present
- No unexpected columns
```

### 2. Value Validation

**Range Checks**:
```python
# Example validations
age: 0 <= value <= 120
percentage: 0 <= value <= 100
date: '2020-01-01' <= value <= today
```

**Format Checks**:
```
Email: valid@domain.com pattern
Phone: standardized format
Date: ISO 8601 preferred
Currency: consistent decimal places
```

**Business Rules**:
```
- Order total = sum(line items)
- End date >= start date
- Status in allowed values
- Foreign keys reference valid records
```

### 3. Completeness Validation

**Required Fields**:
- Identify mandatory columns
- Check for NULL or empty strings
- Validate default value usage

**Conditional Requirements**:
```
IF status = 'shipped' THEN tracking_number IS NOT NULL
IF payment_type = 'credit' THEN card_last_four IS NOT NULL
```

### 4. Consistency Validation

**Cross-Column Checks**:
```
- Calculated fields match source fields
- Denormalized data matches source
- Related records have matching keys
```

**Cross-Dataset Checks**:
```
- Row counts match expectations
- Totals reconcile between systems
- Reference data is current
```

### 5. Anomaly Detection

**Statistical Outliers**:
- Z-score > 3
- IQR method (Q1 - 1.5*IQR, Q3 + 1.5*IQR)
- Sudden changes in patterns

**Temporal Anomalies**:
- Missing dates in sequence
- Duplicate timestamps
- Future dates where not expected

## Validation Report Template

```markdown
## Data Validation Report

**Dataset**: {name}
**Records**: {count}
**Validated**: {timestamp}

### Summary
- ✅ Passed: {n} checks
- ⚠️ Warnings: {n} issues
- ❌ Failed: {n} critical

### Failed Checks (Critical)
1. **{check_name}**: {description}
   - Affected records: {count}
   - Example: {value}
   - Fix: {recommendation}

### Warnings
1. **{check_name}**: {description}
   - Affected: {count} ({percentage}%)

### Passed Checks
- ✅ Schema validation
- ✅ Required fields
- ✅ Data type checks
- ✅ Range validations
```

## Automated Checks

Integrate with data pipelines:
- Pre-load validation
- Post-transformation checks
- Scheduled quality monitoring
