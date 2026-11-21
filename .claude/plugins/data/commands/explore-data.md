# /data:explore-data

Profile and explore a dataset to understand its shape, quality, and patterns.

## Usage

```
/data:explore-data sales_2026.csv
/data:explore-data --full customer_transactions
/data:explore-data --quality-focus inventory_data
```

## Description

Comprehensive data profiling that reveals:
1. Dataset structure and types
2. Statistical summaries
3. Data quality issues
4. Distribution patterns
5. Correlation insights

## Options

- `--full`: Complete profiling with all metrics
- `--quality-focus`: Emphasize data quality issues
- `--sample N`: Profile a sample of N rows
- `--correlations`: Include correlation matrix

## Output Sections

### 1. Overview
```
Dataset: sales_2026.csv
Rows: 45,231
Columns: 12
Memory: 8.4 MB
```

### 2. Column Profiles
```
| Column        | Type     | Non-Null | Unique | Sample Values        |
|---------------|----------|----------|--------|----------------------|
| order_id      | int64    | 100%     | 45,231 | 1001, 1002, 1003     |
| customer_name | string   | 98.5%    | 8,421  | "John Doe", "Jane S" |
| order_date    | datetime | 100%     | 312    | 2026-01-01, ...      |
| amount        | float64  | 99.8%    | 3,245  | 99.99, 149.50, ...   |
```

### 3. Statistical Summary
```
Numeric Columns:
| Column  | Mean    | Std     | Min  | 25%   | 50%   | 75%   | Max     |
|---------|---------|---------|------|-------|-------|-------|---------|
| amount  | 127.45  | 89.23   | 0.99 | 49.99 | 99.99 | 179.99| 4,999.99|
| qty     | 2.3     | 1.8     | 1    | 1     | 2     | 3     | 25      |
```

### 4. Data Quality Report
```
Issues Found:
- customer_name: 675 missing values (1.5%)
- email: 12 invalid formats detected
- phone: Mixed formats (US, international)
- order_date: 3 records with future dates
```

### 5. Distribution Analysis
```
Top Categories (product_type):
1. Electronics: 35.2%
2. Clothing: 28.7%
3. Home & Garden: 18.4%
4. Other: 17.7%
```

### 6. Correlations (if --correlations)
```
Strong Correlations (|r| > 0.5):
- amount ↔ quantity: 0.72
- discount ↔ promotion_active: 0.65
```

## Integration

Uses quick-data MCP for:
- Dataset loading
- Statistical computations
- Quality validation
- Visualization generation
