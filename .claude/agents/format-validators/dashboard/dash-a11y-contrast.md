---
name: dash-a11y-contrast
description: WCAG AA contrast — text/bg ≥ 4.5:1
model: claude-haiku-4-5-20251001
allowed-tools: Read
team: dashboard
severity_default: P1
---

# Dashboard A11y Contrast Checker

Computes contrast ratios for the dominant color pairs in the dashboard.

## Rules

| Rule | Severity | Threshold |
|---|---|---|
| body-text-contrast | P0 | Body text vs body bg ≥ 4.5:1 (WCAG AA) |
| heading-contrast | P1 | Headings vs bg ≥ 3:1 (WCAG AA Large) |
| link-contrast | P1 | Links vs bg ≥ 3:1 (focus visible) |
| muted-text-contrast | P1 | Muted text vs bg ≥ 3:1 (warn if below, never below 2.5:1) |
| code-contrast | P1 | Code text vs code bg ≥ 4:1 |

## Computation
Use the WCAG relative luminance formula:
```
L = 0.2126 * R + 0.7152 * G + 0.0722 * B  (gamma-corrected)
ratio = (L_lighter + 0.05) / (L_darker + 0.05)
```

## Reference values (our dark theme)
| Pair | Ratio | Status |
|---|---|---|
| `#e0e0e0` on `#1a1a1a` | 14.5:1 | ✓ AAA |
| `#b0b0b0` on `#1a1a1a` | 8.3:1 | ✓ AAA |
| `#4a9eff` on `#1a1a1a` | 5.7:1 | ✓ AA |
| `#79c0ff` on `#0d1117` | 8.9:1 | ✓ AAA |

## Output

Standard validator JSON contract; violations include computed ratio.
