---
name: ui-test
description: Run UI tests on web pages or local HTML dashboards using Playwright headless
arguments:
  - name: target
    description: URL or file path to test
    required: true
  - name: checks
    description: "Comma-separated checks: accessibility, links, forms, responsive, structure"
    required: false
---

# UI Test Skill

Run UI tests on web pages or local HTML dashboards using headless Playwright.

## Usage

```
/ui-test <url-or-path> [--checks accessibility,links,forms,responsive,structure]
```

## Test Types

### Accessibility
- Check heading hierarchy (h1 > h2 > h3)
- Verify images have alt text
- Check form inputs have labels
- Verify color contrast (basic check)
- Check ARIA attributes on interactive elements

### Links
- Find all links on the page
- Check for empty href attributes
- Verify link text is descriptive (not "click here")
- Check for broken anchor references

### Forms
- Verify all inputs have labels or aria-label
- Check required fields are marked
- Verify submit buttons exist
- Test form structure and grouping

### Responsive
- Test at mobile viewport (375px)
- Test at tablet viewport (768px)
- Test at desktop viewport (1024px)
- Check for horizontal overflow

### Structure
- Verify page has title
- Check meta viewport tag
- Verify semantic HTML usage
- Check for valid document structure

## Testing Local Dashboards

Test html-output dashboards using file:// protocol:

```bash
/ui-test file:///home/craigmbrown/Project/html-output/20260217-dashboard.html --checks structure,accessibility
```

## Test Report Format

Results are reported as:

```
UI Test Results: {target}
================================
Accessibility: PASS (5/5 checks)
Links: WARN (2 issues found)
Forms: PASS (3/3 checks)
Structure: PASS (4/4 checks)

Issues:
- [WARN] Link at line 45 has generic text "click here"
- [WARN] Link at line 89 has empty href
```

## Examples

```bash
# Full test suite on a URL
/ui-test https://example.com

# Test local dashboard accessibility
/ui-test file:///home/craigmbrown/Project/html-output/latest.html --checks accessibility

# Test form on a web page
/ui-test https://forms.example.com --checks forms,structure
```
