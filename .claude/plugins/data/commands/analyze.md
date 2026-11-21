# /data:analyze

Answer data questions from quick lookups to full analyses.

## Usage

```
/data:analyze "What were our top 10 customers last quarter?"
/data:analyze --dataset sales_data.csv "Show monthly trends"
/data:analyze --deep "Identify factors affecting churn"
```

## Description

Intelligent data analysis that:
1. Understands natural language questions
2. Generates appropriate queries
3. Executes analysis
4. Returns formatted insights

## Options

- `--dataset FILE`: Specify data source (CSV, JSON, or database table)
- `--deep`: Perform comprehensive analysis with multiple angles
- `--explain`: Show reasoning and methodology
- `--format [table|chart|summary]`: Output format preference

## Workflow

### 1. Question Understanding
- Parse natural language query
- Identify metrics, dimensions, filters
- Determine analysis type needed

### 2. Data Access
- Use quick-data MCP for loaded datasets
- Execute SQL if database connected
- Load file if path provided

### 3. Analysis Execution
- Run appropriate computations
- Generate summary statistics
- Identify patterns and outliers

### 4. Result Formatting
- Create tables for detailed data
- Generate charts for trends
- Write narrative summaries

## Examples

**Simple Lookup**:
```
/data:analyze "How many users signed up last week?"

Result: 1,247 new users (up 12% from previous week)
```

**Trend Analysis**:
```
/data:analyze "Show revenue trend by month"

| Month    | Revenue   | Growth |
|----------|-----------|--------|
| Jan 2026 | $124,500  | -      |
| Feb 2026 | $138,200  | +11%   |
```

**Deep Analysis**:
```
/data:analyze --deep "What drives customer retention?"

## Retention Analysis

### Key Factors (by importance)
1. Product usage frequency (R² = 0.72)
2. Support ticket resolution time (R² = 0.58)
3. Feature adoption breadth (R² = 0.45)

### Recommendations
- Focus on onboarding to drive early usage
- Prioritize support response times under 4 hours
```

## MCP Integration

Uses `quick-data` MCP server for:
- Dataset loading and management
- Query execution
- Statistical computations
- Chart generation
