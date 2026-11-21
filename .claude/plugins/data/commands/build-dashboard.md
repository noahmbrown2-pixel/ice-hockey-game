# /data:build-dashboard

Build interactive HTML dashboards with filters and charts.

## Usage

```
/data:build-dashboard "Sales performance dashboard"
/data:build-dashboard --template executive "Q1 metrics overview"
/data:build-dashboard --filters region,date "Regional performance"
```

## Description

Generate self-contained HTML dashboards with:
1. Multiple chart types
2. Interactive filters
3. Responsive design
4. Dark/light mode support
5. Export capabilities

## Options

- `--template [executive|operational|analytical]`: Dashboard style
- `--filters FIELDS`: Add filter controls for specified fields
- `--theme [dark|light|auto]`: Color theme
- `--refresh`: Add auto-refresh capability

## Dashboard Templates

### Executive
- High-level KPIs with sparklines
- Summary metrics
- Trend indicators
- Clean, minimal design

### Operational
- Real-time metrics
- Status indicators
- Alert thresholds
- Detailed tables

### Analytical
- Multiple chart types
- Cross-filtering
- Drill-down capability
- Statistical summaries

## Generated Components

```html
Dashboard Structure:
├── Header (title, date range, filters)
├── KPI Cards (4-6 key metrics)
├── Main Charts (2-3 visualizations)
├── Data Table (sortable, searchable)
└── Footer (last updated, export buttons)
```

## Example Output

```
/data:build-dashboard "Sales Dashboard Q1 2026"

Generated: html-output/20260204-sales-dashboard-q1.html

Dashboard includes:
- Total Revenue: $1.2M (+15% QoQ)
- New Customers: 847
- Avg Order Value: $142
- Conversion Rate: 3.2%

Charts:
1. Revenue by Month (line)
2. Sales by Region (bar)
3. Product Mix (pie)
4. Top 10 Customers (table)

Filters:
- Date Range: Jan 1 - Mar 31, 2026
- Region: All | North | South | East | West
- Product Category: All | Electronics | Clothing | Home
```

## Technology Stack

- **Chart.js**: Responsive charts
- **HTML/CSS**: Semantic, accessible markup
- **Vanilla JS**: No framework dependencies
- **CSS Grid**: Responsive layout

## Integration

- Data from quick-data MCP
- Auto-saved to html-output/
- Viewable at local server (if running)
