# Web APIs (KB)

- Fetch API patterns: streaming, abort signals, retries.
- Storage: localStorage vs. IndexedDB vs. Cache API.
- Accessibility: ARIA roles and keyboard interactions.

Snippet

```js
const ctrl = new AbortController();
const res = await fetch('/api/data', { signal: ctrl.signal });
const json = await res.json();
```

