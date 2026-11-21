# Testing Agent

Specialized agent for creating and managing tests for the SPARQL Query UI project.

## Testing Stack

- Unit/Integration: Vitest or Jest
- E2E: Playwright or Cypress
- Testing Library: @testing-library/svelte
- Coverage Target: >80%

## Test Types

### Unit Tests
Test pure functions and isolated logic. Focus on services, utils, and stores.

### Component Tests
Test Svelte components with @testing-library/svelte.

### Integration Tests
Test workflows across multiple components and services.

### E2E Tests
Test full user journeys with Playwright.

## Example Unit Test

```typescript
import { describe, it, expect } from 'vitest';
import { parseSparqlJSON } from './parser';

describe('parseSparqlJSON', () => {
  it('parses SELECT results', () => {
    const json = {
      head: { vars: ['s'] },
      results: { bindings: [{ s: { type: 'uri', value: 'http://ex.org/r' } }] }
    };
    const result = parseSparqlJSON(json);
    expect(result.columns).toEqual(['s']);
    expect(result.rows).toHaveLength(1);
  });
});
```

## Mocking Fetch

```typescript
import { vi } from 'vitest';
global.fetch = vi.fn();

const mockResponse = {
  ok: true,
  json: async () => ({ head: { vars: [] }, results: { bindings: [] } })
};
(global.fetch as any).mockResolvedValue(mockResponse);
```

## Best Practices

1. Arrange-Act-Assert structure
2. Test behavior not implementation
3. Mock external dependencies
4. Clear descriptive test names
5. Test edge cases and errors
6. Keep tests fast (<100ms for unit)

## Svelte 5 Component Testing Patterns

### Testing Components with Context and Props

**CRITICAL: Svelte 5 components that need both context and props require test wrapper components**

When testing components that:
1. Use `getContext()` to access stores (e.g., `getServiceDescriptionStore()`)
2. Accept props via `$props`

**❌ PROBLEM: StoreProvider's children snippet doesn't pass props**

```typescript
// ❌ WRONG: Props don't get passed to child component
function renderWithStore(props) {
  return render(StoreProvider, {
    props: {
      initialEndpoint: props.endpoint,
      children: MyComponent as any,  // MyComponent won't receive props!
      ...props  // These props don't pass through!
    },
  });
}
```

**✅ SOLUTION: Create test wrapper components**

```typescript
// 1. Create wrapper component: tests/integration/helpers/MyComponentTestWrapper.svelte
<script lang="ts">
  import MyComponent from '../../../src/lib/components/MyComponent.svelte';
  import StoreProvider from '../../../src/lib/components/StoreProvider.svelte';

  interface Props {
    currentEndpoint: string | null;
    onCallback?: (data: string) => void;
  }

  let { currentEndpoint, onCallback }: Props = $props();
</script>

<StoreProvider initialEndpoint={currentEndpoint || ''}>
  {#snippet children()}
    <MyComponent {currentEndpoint} {onCallback} />
  {/snippet}
</StoreProvider>

// 2. Use wrapper in tests
import MyComponentTestWrapper from './helpers/MyComponentTestWrapper.svelte';

function renderWithStore(props = {}) {
  return render(MyComponentTestWrapper, {
    props: {
      currentEndpoint: props.endpoint ?? 'https://example.com/sparql',
      onCallback: props.onCallback,
    },
  });
}
```

### Avoiding "Multiple Elements" Errors

When components are wrapped, text may appear multiple times in the DOM:

```typescript
// ❌ FAILS: "Found multiple elements with text..."
await waitFor(() => {
  expect(screen.queryByText(/extension functions/i)).toBeInTheDocument();
});

// ✅ FIX: Use container queries for uniqueness
const { container } = renderWithStore();
await waitFor(() => {
  const header = container.querySelector('.my-component h3');
  expect(header?.textContent).toMatch(/extension functions/i);
});
```

### userEvent Special Characters

```typescript
// ❌ FAILS: Brackets are keyboard shortcuts in userEvent
await user.type(searchInput, 'test:*?[]');
// Error: Expected key descriptor but found "]"

// ✅ FIX: Remove brackets or use different approach
await user.type(searchInput, 'test:*?');
// Or manually set value:
fireEvent.input(searchInput, { target: { value: 'test:*?[]' } });
```

### Test Wrapper Pattern Summary

**Architecture:**
```
StoreProvider > TestWrapper > ActualComponent
     ↓              ↓              ↓
  Provides      Receives      Receives
  Context        Props         Props
                   +             +
               Forwards      Uses Context
```

**When to Use:**
- Component uses `getContext()` AND accepts props
- Component needs store reactivity in tests
- Testing components within larger component hierarchies

**Benefits:**
- Proper store context provision
- Correct prop passing
- Realistic component behavior
- Matches production usage

## References

- Vitest: https://vitest.dev/
- Testing Library: https://testing-library.com/
- Playwright: https://playwright.dev/
