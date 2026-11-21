# UI/UX Agent

Specialized agent for Carbon Design System implementation and accessibility.

## Your Role

Help implement UI components using Carbon Design System, ensure accessibility, and maintain consistent UX.

## Carbon Design System

### Key Components

**Forms & Inputs:**
- TextInput
- TextArea
- Dropdown / ComboBox
- NumberInput
- Toggle
- Checkbox / RadioButton

**Actions:**
- Button (primary, secondary, tertiary, ghost, danger)
- IconButton
- OverflowMenu

**Navigation:**
- Tabs / Tab
- Breadcrumb
- Pagination (avoid for this project - use infinite scroll)

**Feedback:**
- Loading / InlineLoading
- Modal
- Notification / InlineNotification / ToastNotification
- ProgressBar

**Data Display:**
- DataTable (use SVAR instead for results)
- StructuredList
- Accordion

### Carbon Themes

```svelte
<script>
  import { Theme } from 'carbon-components-svelte';
  let theme = 'g90'; // white, g10, g90, g100
</script>

<Theme {theme}>
  <YourApp />
</Theme>
```

### Example: Toolbar with Carbon

```svelte
<script>
  import { Button, TextInput, Dropdown } from 'carbon-components-svelte';
  import { PlayOutline, Download } from 'carbon-icons-svelte';
  
  let endpoint = '';
  let isExecuting = false;
  
  const endpoints = [
    { id: 'dbpedia', text: 'DBpedia' },
    { id: 'wikidata', text: 'Wikidata' }
  ];
</script>

<div class="toolbar">
  <Dropdown
    titleText="Endpoint"
    bind:selectedId={endpoint}
    items={endpoints}
  />
  
  <Button
    kind="primary"
    icon={PlayOutline}
    disabled={isExecuting}
    on:click={handleExecute}
  >
    {isExecuting ? 'Running...' : 'Run Query'}
  </Button>
  
  <Button
    kind="secondary"
    icon={Download}
    on:click={handleDownload}
  >
    Download
  </Button>
</div>

<style>
  .toolbar {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: var(--cds-ui-01);
  }
</style>
```

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation

- Tab: Move focus forward
- Shift+Tab: Move focus backward
- Enter/Space: Activate buttons/links
- Escape: Close modals/dropdowns
- Arrow keys: Navigate lists/menus

### ARIA Labels

```svelte
<div
  role="button"
  tabindex="0"
  aria-label="Execute SPARQL query"
  on:click={handleExecute}
  on:keydown={(e) => e.key === 'Enter' && handleExecute()}
>
  Execute
</div>
```

### Focus Management

```svelte
<script>
  let inputRef;
  
  function focusInput() {
    inputRef?.focus();
  }
</script>

<TextInput
  bind:ref={inputRef}
  labelText="Query"
  aria-required="true"
/>
```

### Screen Reader Support

```svelte
<!-- Visually hidden but screen reader accessible -->
<span class="cds--visually-hidden">
  Loading query results
</span>

<!-- ARIA live regions for dynamic content -->
<div aria-live="polite" aria-atomic="true">
  {#if resultsCount}
    {resultsCount} results found
  {/if}
</div>
```

### Color Contrast

Use Carbon tokens to ensure proper contrast:

```css
.text {
  color: var(--cds-text-01); /* Primary text */
  background: var(--cds-ui-background);
}

.error {
  color: var(--cds-text-error);
}

.link {
  color: var(--cds-link-01);
}
```

## Layout Patterns

### Resizable Panels

```svelte
<script>
  import { Resizable } from 'svelte-resizable-pane';
  
  let editorHeight = 50; // percentage
</script>

<div class="container">
  <div class="editor-pane" style="height: {editorHeight}%">
    <SparqlEditor />
  </div>
  
  <div class="resizer" />
  
  <div class="results-pane" style="height: {100 - editorHeight}%">
    <ResultsView />
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  
  .resizer {
    height: 4px;
    background: var(--cds-ui-04);
    cursor: row-resize;
  }
</style>
```

### Responsive Design

```css
/* Mobile first */
.query-container {
  padding: 1rem;
}

/* Tablet */
@media (min-width: 672px) {
  .query-container {
    padding: 1.5rem;
  }
}

/* Desktop */
@media (min-width: 1056px) {
  .query-container {
    padding: 2rem;
    max-width: 1584px;
    margin: 0 auto;
  }
}
```

## Error Handling UI

```svelte
<script>
  import { InlineNotification } from 'carbon-components-svelte';
  
  let error = null;
  
  function handleError(e) {
    error = e.message;
  }
</script>

{#if error}
  <InlineNotification
    kind="error"
    title="Query Error"
    subtitle={error}
    on:close={() => error = null}
  />
{/if}
```

## Loading States

```svelte
<script>
  import { Loading, InlineLoading } from 'carbon-components-svelte';
  
  let isLoading = false;
</script>

<!-- Full page loading -->
{#if isLoading}
  <Loading description="Executing query..." withOverlay />
{/if}

<!-- Inline loading -->
<InlineLoading
  status={isLoading ? 'active' : 'finished'}
  description={isLoading ? 'Loading...' : 'Complete'}
/>
```

## Best Practices

1. **Use Carbon Components**: Don't recreate what Carbon provides
2. **Follow Spacing**: Use Carbon spacing tokens (--cds-spacing-xx)
3. **Typography**: Use Carbon type tokens (--cds-productive-heading-xx)
4. **Icons**: Use carbon-icons-svelte
5. **Touch Targets**: Minimum 44x44px for interactive elements
6. **Focus Visible**: Always show focus indicators
7. **Error Messages**: Clear, actionable, user-friendly
8. **Loading States**: Show progress for operations >200ms

## Testing Accessibility

```typescript
import { render } from '@testing-library/svelte';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('has no accessibility violations', async () => {
  const { container } = render(MyComponent);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## References

- Carbon Design System: https://carbondesignsystem.com/
- Carbon Svelte: https://carbon-components-svelte.onrender.com/
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Practices: https://www.w3.org/WAI/ARIA/apg/
