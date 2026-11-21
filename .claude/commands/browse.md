---
name: browse
description: Quick browser automation - navigate, scrape, screenshot, or fill forms on any URL
arguments:
  - name: url
    description: The URL to browse
    required: true
  - name: action
    description: "Action to perform: screenshot, scrape, fill, test (default: scrape)"
    required: false
  - name: account
    description: "Google account for auth: craigmbrown or babyproject418"
    required: false
---

# Browse Skill

Quick browser automation for any URL using Playwright MCP (headless mode).

## Usage

```
/browse <url> [--action screenshot|scrape|fill|test] [--account craigmbrown|babyproject418]
```

## Environment

This runs on a headless GCP VM. All browser operations use headless Chromium via Playwright MCP.

## Actions

### Scrape (default)
Navigate to the URL and extract page content using accessibility tree.

1. Use `browser_navigate` to load the URL
2. Use `browser_snapshot` to get the accessibility tree
3. Extract relevant text, links, and structured data
4. Return formatted results

### Screenshot
Navigate and capture a headless screenshot.

1. Use `browser_navigate` to load the URL
2. Use `browser_screenshot` to capture the page
3. Save to `html-output/` with descriptive filename
4. Report the file path

### Fill
Navigate and fill form fields.

1. Use `browser_navigate` to load the URL
2. Use `browser_snapshot` to identify form fields
3. Use `browser_type` and `browser_click` to fill and submit
4. Capture result after submission

### Test
Run basic accessibility and structure checks.

1. Use `browser_navigate` to load the URL
2. Use `browser_snapshot` to get accessibility tree
3. Check for: page title, heading structure, form labels, link text
4. Report issues found

## Google Account Authentication

For Google services, specify an account:

```
/browse https://mail.google.com --account babyproject418
```

Before browsing authenticated Google pages:
1. Run: `python3 scripts/browser_auth_manager.py --account babyproject418 --export-state`
2. Use the generated storageState with Playwright browser context

**Default account**: babyproject418@gmail.com (automated operations)
**Secondary**: craigmbrown@gmail.com (personal, explicit opt-in)

## Long-Running Tasks

For tasks taking >30 seconds, use fork-terminal:
```
/fork-terminal use grok to scrape https://example.com and save results
```

## Examples

```bash
# Scrape a page
/browse https://example.com

# Take a screenshot
/browse https://news.ycombinator.com --action screenshot

# Fill a form
/browse https://forms.google.com/d/xxx --action fill

# Test a dashboard
/browse file:///home/craigmbrown/Project/html-output/latest.html --action test

# Access Gmail web UI
/browse https://mail.google.com --account babyproject418
```

## Xvfb Fallback

If a tool requires $DISPLAY (rare), use Xvfb:
```bash
Xvfb :99 -screen 0 1024x768x24 &
export DISPLAY=:99
# ... then run the browser tool
kill %1  # cleanup
```
