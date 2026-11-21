# iframe and cross-origin behavior in Chrome DevTools MCP

Read this when:
- `evaluate_script` returns null, throws "Cannot access frame", or behaves nothing like the visible page.
- The app is embedded (Shopify admin, Stripe Elements, Auth0 Lock, payment iframes).
- A click via UID succeeds but the resulting state lives in another frame you can't read.

## Detecting iframe context

```js
// Run via evaluate_script in the top frame.
() => ({
  topUrl: location.href,
  frames: Array.from(document.querySelectorAll('iframe')).map(f => ({
    src: f.src,
    sameOrigin: (() => {
      try { void f.contentDocument; return true; } catch { return false; }
    })(),
  })),
})
```

- `sameOrigin: false` on a frame means `evaluate_script` cannot reach into it.
- A snapshot will still enumerate the iframe's elements with UIDs — `take_snapshot` traverses across origins (it's an accessibility tree, not JS).

## What works where

| Tool | Top frame | Same-origin iframe | Cross-origin iframe |
| --- | --- | --- | --- |
| `take_snapshot` | ✅ | ✅ | ✅ |
| `take_screenshot` | ✅ | ✅ | ✅ |
| `click` / `fill` / `hover` (UID) | ✅ | ✅ | ✅ |
| `press_key` | ✅ | ✅ | ✅ |
| `evaluate_script` | ✅ | ✅ (same-origin policy permitting) | ❌ — restricted to top frame's execution context |
| `list_console_messages` | ✅ aggregates from all frames | ✅ | ✅ |
| `list_network_requests` | ✅ aggregates from all frames | ✅ | ✅ |
| `navigate_page` | ✅ navigates top frame | ❌ doesn't target sub-frames | ❌ |
| `performance_start_trace` | ✅ traces whole page | ✅ | ✅ |

## Patterns

### Read state from a cross-origin iframe

You can't. Workarounds:

1. **Use the snapshot.** The a11y tree gives you visible state — labels, values of native inputs, ARIA attributes. Often enough.
2. **Ask the embedded framework's debug surface.** E.g. Shopify App Bridge dispatches events on `window`; Stripe Elements has `.on('change', ...)` you can hook from your own (top-frame) code by adding a temporary listener.
3. **Add cross-frame messaging.** Inject a `postMessage` handler on the embedded side via your source code, listen from the top frame via `evaluate_script`.

### Interact with form fields inside a cross-origin iframe

Snapshot → find the UID of the input → `fill(uid, value)`. The MCP routes the interaction through CDP at the page level, which is not subject to JS same-origin policy.

### Detect the bug is iframe-related at all

If a user reports "clicking does nothing" and your `evaluate_script` reading of state seems fine, suspect cross-origin. Reality check:

```
take_snapshot
```

Look for `iframe` nodes whose content is also enumerated below them. If the element you care about lives inside an iframe and `evaluate_script` returned unexpected results, you're in this territory.

### Shopify embedded apps (one common case)

- Top frame: `admin.shopify.com` (or the shop domain).
- Your app: a cross-origin iframe (your tunnel URL, e.g. `*.trycloudflare.com`).
- App Bridge bridges them via `postMessage`.

Implications:
- `navigate_page` to your app URL directly works for unembedded development but skips App Bridge — Save Bars, toasts, navigation menu items won't render. Verify embedded features in the embedded context.
- To verify inside the embed: navigate to the Shopify admin route that loads your app, accept the OAuth flow if prompted, then drive your UI via UID-based tools.
- Use `list_console_messages` for both your app's logs and App Bridge errors — they aggregate.

## Quick decision tree

```
Need to read JS state?
├── In top frame → evaluate_script
├── In same-origin iframe → evaluate_script (it works)
└── In cross-origin iframe → can't directly
    ├── Is visible state enough? → take_snapshot
    ├── Need internal state? → add postMessage bridge in source
    └── Need to assert behavior? → drive UI via UID + observe outcome

Need to interact?
└── Always: take_snapshot → click/fill/hover via UID (works anywhere)

Need to observe errors?
└── list_console_messages aggregates everything
```
