# DataGrid Agent

Specialized agent for SVAR Svelte DataGrid v2 integration.

## Role

Help integrate SVAR Svelte DataGrid v2 for displaying SPARQL query results with high performance.

## Key Responsibilities

1. Configure DataGrid for SPARQL results
2. Implement virtual scrolling for large datasets
3. Set up infinite loading with chunked data fetching
4. Configure columns (sorting, filtering, resizing)
5. Apply Carbon Design System theming
6. Optimize performance for 10,000+ rows

## Installation

```
npm install wx-svelte-grid
```

## Basic Grid Setup

Import: `import { Grid } from 'wx-svelte-grid';`

Columns need: id, header, flexgrow, sort, resizable properties
Data needs: array of objects with matching column ids

## Features to Implement

- Virtual scrolling (automatic)
- Column sorting (click headers)
- Column filtering (optional toggle)
- Column resizing (drag edges)
- Column reordering (drag headers)
- Custom cell templates for IRIs
- Infinite scroll with lazy loading
- Theme matching with Carbon CSS variables

## Performance Tips

- Load data in 1000-row chunks
- Use virtual scrolling
- Debounce filter operations
- Cache expensive computations
- Limit initial render to 100k rows max

## References

- https://svar.dev/svelte/datagrid/
- https://github.com/revolist/svelte-datagrid
