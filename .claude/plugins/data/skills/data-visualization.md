# Data Visualization Skill

Auto-triggered skill for chart selection and visualization best practices.

## Trigger Phrases

- "create a chart"
- "visualize this"
- "plot"
- "graph"
- "show me a histogram"
- "scatter plot of"

## Chart Selection Guide

| Data Type | Goal | Recommended Chart |
|-----------|------|-------------------|
| Time series | Show trend | Line chart |
| Categories | Compare values | Bar chart |
| Distribution | Show spread | Histogram, Box plot |
| Relationship | Correlation | Scatter plot |
| Part of whole | Composition | Pie (≤6), Stacked bar |
| Two variables | Compare | Scatter, Heatmap |
| Geographic | Location data | Map, Choropleth |

## Design Principles

### 1. Clarity
- Clear, descriptive titles
- Labeled axes with units
- Legend only when needed
- Remove chart junk

### 2. Accuracy
- Start y-axis at zero (usually)
- Consistent scales across panels
- Avoid 3D effects
- Use appropriate aspect ratio

### 3. Accessibility
- Color-blind friendly palettes
- Sufficient contrast
- Alternative text for images
- Data tables as backup

### 4. Aesthetics
- Consistent color scheme
- Appropriate whitespace
- Professional fonts
- Dark mode support

## Color Palettes

**Sequential** (low to high): Blues, Greens, Oranges
**Diverging** (negative to positive): RdBu, PiYG
**Categorical** (distinct groups): Set2, Tab10
**Color-blind safe**: viridis, cividis

## Python Code Patterns

```python
# Standard setup
import matplotlib.pyplot as plt
import seaborn as sns

# Configure style
plt.style.use('seaborn-v0_8-whitegrid')
fig, ax = plt.subplots(figsize=(10, 6))

# Common formatting
ax.set_title('Title', fontsize=14, fontweight='bold')
ax.set_xlabel('X Label')
ax.set_ylabel('Y Label')
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)

# Save with quality
plt.tight_layout()
plt.savefig('chart.png', dpi=300, bbox_inches='tight')
```

## Common Mistakes to Avoid

1. **Misleading axes**: Non-zero baselines without indication
2. **Chart overload**: Too many elements
3. **Wrong chart type**: Pie charts with many categories
4. **Poor color choices**: Red/green for color-blind users
5. **Missing context**: No comparison baseline
