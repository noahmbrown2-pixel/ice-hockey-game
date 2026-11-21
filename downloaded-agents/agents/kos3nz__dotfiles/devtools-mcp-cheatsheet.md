# Chrome DevTools MCP cheatsheet

Read this when you start using the skill in a fresh session, or when you're unsure which tool fits.

## Page lifecycle

| Tool | Use when |
| --- | --- |
| `list_pages` | First thing — see if a tab already exists. |
| `new_page(url)` | Need a fresh tab. Pass `background: true` to avoid stealing focus. |
| `select_page(pageIdx)` | Multiple tabs open and you need to act on a specific one. |
| `navigate_page(type, url?)` | Go to URL, reload, back, forward. Use `ignoreCache: true` after editing JS/CSS. |
| `close_page` | Cleanup, rarely needed mid-session. |
| `resize_page(width, height)` | Simulate viewport. Useful for responsive bugs. |
| `emulate(...)` | Throttling, device emulation. Rarely needed; use when reproducing perf reports. |

## Observation

| Tool | Use when |
| --- | --- |
| `take_snapshot` | **Default.** Get the a11y tree with UIDs. Cheap, text-based, machine-checkable. |
| `take_screenshot` | When the issue is visual (alignment, color, missing image) or for user-facing artifacts. |
| `list_console_messages` | Always check after page load and after risky interactions. |
| `get_console_message(idx)` | Drill into a specific log when stack trace matters. |
| `list_network_requests` | Spot failed (4xx/5xx) or pending requests. |
| `get_network_request(url)` | Headers, payload, response body for one request. |
| `evaluate_script(fn)` | Read JS state. **Top-frame only** for cross-origin sites — see `iframe-cross-origin.md`. |

## Interaction

All interaction tools take a `uid` from the most recent `take_snapshot`. UIDs are not stable across snapshots — re-snapshot after anything that mutates the DOM.

| Tool | Use when |
| --- | --- |
| `click(uid)` | Buttons, links, checkboxes. |
| `fill(uid, value)` | Text inputs, textareas. |
| `fill_form(fields)` | Batch fill multiple inputs at once. |
| `hover(uid)` | Trigger hover states, tooltips, popovers. |
| `drag(from, to)` | Drag-and-drop interfaces. |
| `press_key(key)` | Tab navigation, Esc to close modals, Enter to submit. |
| `upload_file(uid, path)` | File input testing. |
| `handle_dialog(action)` | When `confirm()` / `prompt()` pops. |
| `wait_for(text?, uid?)` | Block until something appears. Use sparingly — over-waiting masks slowness bugs. |

## Performance

| Tool | Use when |
| --- | --- |
| `performance_start_trace(reload, autoStop)` | Capture a load trace. `reload: true` re-loads to capture full lifecycle. |
| `performance_stop_trace` | Only when `autoStop: false`. |
| `performance_analyze_insight(name)` | Drill into a specific insight from the trace summary. Common: `LCPBreakdown`, `CLSCulprits`, `INPBreakdown`, `RenderBlocking`, `DocumentLatency`. |

Do not run a trace for every iteration. Use it when the user asks about perf, or when you have a specific symptom (slow load, jank, layout shift).

## Misc

| Tool | Use when |
| --- | --- |
| `lighthouse_audit` | Comprehensive audit. Heavier than a trace; use when asked for a full report. |
| `take_heapsnapshot` | Memory leak investigation. Rarely needed. |

## Common patterns

### Reliable click

```
1. take_snapshot
2. find target uid in result
3. click(uid)
4. wait_for(text: "expected state change") OR take_snapshot to confirm
```

### Form submission

```
1. take_snapshot
2. fill_form({ field1: value1, field2: value2 })   # or individual fill calls
3. click(submit_uid)
4. wait_for(text: "success" or new URL via navigate observation)
5. list_console_messages    # check for validation errors
6. list_network_requests    # confirm POST succeeded
```

### Check for layout shift after a code change

```
1. navigate_page(reload, ignoreCache: true)
2. performance_start_trace(reload: true)
3. read trace summary for CLS value
4. if CLS > threshold: performance_analyze_insight("CLSCulprits")
```

### Inspect React/Vue/Svelte state

Top-frame only:

```js
evaluate_script(() => {
  // React DevTools hook
  const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  // Vue
  const app = document.querySelector('#app').__vue_app__;
  // Svelte
  // Use component instance refs you've exposed for debugging.
  return { /* whatever JSON-serializable shape */ };
})
```

If the framework state lives inside a cross-origin iframe, you can't reach it from here — see `iframe-cross-origin.md`.

### Capture the "before" state of a bug

When reproducing a user-reported bug, before each step:

```
take_snapshot (saves UID/state)
take_screenshot (visual record)
list_console_messages (baseline)
```

Then act, then re-capture. The diff is your evidence.
