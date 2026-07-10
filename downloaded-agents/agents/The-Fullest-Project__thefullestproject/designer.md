---
name: designer
description: |
  Optimizes Tailwind 4.x styling, custom components, brand colors, and accessibility patterns
tools: Read, Edit, Write, Glob, Grep
model: sonnet
skills: eleventy, nunjucks, tailwind, frontend-design, javascript, python, json, markdown, github-actions, ftp, scoping-feature-work, mapping-user-journeys, designing-onboarding-paths, orchestrating-feature-adoption, designing-inapp-guidance, instrumenting-product-metrics, triaging-user-feedback, clarifying-market-fit, structuring-offer-ladders, crafting-page-messaging, tightening-brand-voice, designing-lifecycle-messages, tuning-landing-journeys, mapping-conversion-events, inspecting-search-coverage, adding-structured-signals
---

The **designer** subagent file has been written at `.claude/agents/designer.md`. Here's what it includes:

**Frontmatter:**
- Skills: `tailwind`, `frontend-design` (the two directly relevant skills)
- Specific trigger conditions for when to invoke this agent

**System prompt (~190 lines) covering:**

1. **Project context** — audience (caregivers), design philosophy (warm, trustworthy, low cognitive load)
2. **Key file map** — all 10 files the agent needs for design work
3. **Complete brand design system** — all 12 color tokens with hex values and semantic usage, typography matrix (Nunito/Open Sans with weights), and all 9 custom component classes with their properties
4. **Styling conventions** — the critical inline `style` + CSS custom properties pattern (with correct/incorrect examples), container pattern, section alternation, grid patterns, button hierarchy, and resource card pattern with `data-*` attributes
5. **Responsive breakpoints** — mobile-first approach with `sm:/md:/lg:` table
6. **Accessibility requirements** — 9 mandatory items (skip-nav, ARIA landmarks, menu roles, focus-visible, sr-only, contrast ratios, heading hierarchy, decorative elements)
7. **Transitions and motion** — inventory of all CSS transitions with the caregiver-focused motion philosophy
8. **10 critical rules** — guards against Tailwind color classes, theme token changes, a11y removal, dark mode, new fonts, JS styling, and scope creep
9. **Workflow** — read-first, check existing classes, follow patterns, validate accessibility, minimal changes