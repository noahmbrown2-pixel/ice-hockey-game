# /data:create-viz

Create publication-quality visualizations with Python.

## Usage

```
/data:create-viz "Line chart of monthly revenue"
/data:create-viz --type bar "Sales by region"
/data:create-viz --style dark "User growth over time"
```

## Description

Generate professional visualizations using Python (matplotlib, seaborn, plotly):
1. Automatic chart type selection
2. Proper labeling and formatting
3. Color-blind friendly palettes
4. Export-ready quality

## Options

- `--type [line|bar|scatter|pie|heatmap|histogram|box]`: Force chart type
- `--style [default|dark|minimal|presentation]`: Visual style
- `--output FILE`: Save to file (PNG, SVG, HTML)
- `--interactive`: Generate Plotly interactive chart

## Chart Types

| Type | Best For |
|------|----------|
| Line | Time series, trends |
| Bar | Comparisons, categories |
| Scatter | Relationships, correlations |
| Pie | Part-of-whole (limited categories) |
| Heatmap | Matrices, correlations |
| Histogram | Distributions |
| Box | Statistical distributions |

## Examples

**Time Series**:
```
/data:create-viz "Monthly revenue trend for 2025-2026"

[Generates line chart with:
- Proper date formatting on x-axis
- Currency formatting on y-axis
- Trend line
- Annotations for significant points]
```

**Comparison**:
```
/data:create-viz --type bar "Sales by region, grouped by quarter"

[Generates grouped bar chart with:
- Clear legend
- Value labels on bars
- Sorted by total
- Color-blind friendly palette]
```

**Interactive**:
```
/data:create-viz --interactive "Customer segments by value and frequency"

[Generates Plotly scatter with:
- Hover tooltips
- Zoom/pan
- Export options
- Responsive sizing]
```

## Generated Code

When requested, shows the Python code:

```python
import matplotlib.pyplot as plt
import pandas as pd

# Data
df = pd.read_csv('sales_data.csv')
monthly = df.groupby('month')['revenue'].sum()

# Chart
fig, ax = plt.subplots(figsize=(12, 6))
ax.plot(monthly.index, monthly.values, marker='o', linewidth=2)
ax.set_xlabel('Month')
ax.set_ylabel('Revenue ($)')
ax.set_title('Monthly Revenue Trend')
ax.yaxis.set_major_formatter('${x:,.0f}')
plt.tight_layout()
plt.savefig('revenue_trend.png', dpi=300)
```

## Output Location

Charts saved to: `html-output/` with naming convention:
`YYYYMMDD-{description}-chart.{format}`
