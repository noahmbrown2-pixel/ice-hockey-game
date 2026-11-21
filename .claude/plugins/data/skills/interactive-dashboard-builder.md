# Interactive Dashboard Builder Skill

Auto-triggered skill for creating self-contained HTML dashboards.

## Trigger Phrases

- "build a dashboard"
- "create an interactive report"
- "dashboard with filters"
- "report builder"
- "executive dashboard"

## Dashboard Architecture

### Component Structure
```
Dashboard
├── Header
│   ├── Title
│   ├── Date range selector
│   └── Global filters
├── KPI Section
│   └── Metric cards (4-6)
├── Charts Section
│   ├── Primary chart
│   ├── Secondary charts
│   └── Supporting visualizations
├── Data Table
│   └── Sortable, filterable grid
└── Footer
    ├── Last updated
    └── Export buttons
```

### Technology Stack
```html
<!-- No external dependencies - all inline -->
<style>/* Embedded CSS */</style>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>/* Vanilla JS for interactivity */</script>
```

## Design Patterns

### 1. KPI Cards
```html
<div class="kpi-card">
  <div class="kpi-value">$1.2M</div>
  <div class="kpi-label">Revenue</div>
  <div class="kpi-trend positive">↑ 15%</div>
</div>
```

### 2. Responsive Grid
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}
```

### 3. Filter Controls
```html
<select id="region-filter" onchange="updateCharts()">
  <option value="all">All Regions</option>
  <option value="north">North</option>
  <option value="south">South</option>
</select>
```

### 4. Chart Configuration
```javascript
const chartConfig = {
  type: 'line',
  data: {
    labels: months,
    datasets: [{
      label: 'Revenue',
      data: values,
      borderColor: '#4a9eff',
      tension: 0.1
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  }
};
```

## Dashboard Templates

### Executive
- Clean, minimal design
- 4 key KPIs prominently displayed
- Single trend chart
- High-level summary only

### Operational
- More detailed metrics
- Real-time indicators
- Alert thresholds
- Action items section

### Analytical
- Multiple chart types
- Cross-filtering capability
- Drill-down navigation
- Export options

## Style Guidelines

### Color Palette (Dark Mode)
```css
:root {
  --bg-primary: #1a1a1a;
  --bg-card: #2d2d2d;
  --text-primary: #e0e0e0;
  --accent: #4a9eff;
  --positive: #4caf50;
  --negative: #f44336;
}
```

### Responsive Breakpoints
```css
/* Mobile first */
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

## Output Location

Dashboards saved to:
```
html-output/YYYYMMDD-{name}-dashboard.html
```

Accessible at:
```
http://34.58.12.50:8080/{filename}
```
