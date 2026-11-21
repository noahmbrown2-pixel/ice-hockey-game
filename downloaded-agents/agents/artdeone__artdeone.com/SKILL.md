---
name: art-de-one-website-style
description: >
  Design style guide for the ART de ONE website. Use this skill whenever
  building, styling, or modifying any UI component, page, section, or layout
  for this website — including buttons, cards, navbars, icons, typography,
  spacing, dark/light mode theming, blog, and backend tasks. Always consult
  this skill before writing any CSS, Tailwind, or component code, even if the
  user does not explicitly ask for it. This skill overrides any generic
  "modern" or "beautiful" design assumptions that conflict with these rules.
---

# ART de ONE — Website Design System

## Core Philosophy

Clean and minimal. Every element earns its place. No decorative noise.
No AI-looking layouts. Study how real humans design real websites before
applying any pattern. Both dark and light modes must feel intentional,
calm, and uncluttered.

---

## 1. Color Palette

### Brand Colors
| Role      | Hex       | Usage                              |
|-----------|-----------|------------------------------------|
| Primary   | `#a7e169` | Buttons, active states, highlights |
| Secondary | `#ed2939` | Button hover, accents, alerts      |

### Light Mode
| Role               | Hex       | Notes                                                   |
|--------------------|-----------|---------------------------------------------------------|
| Background (main)  | `#ffffff`  | Primary page background                                |
| Background (alt)   | `#e8e8e8` | Alternate sections — must visually separate sections   |
| Text               | Dark neutrals | Sufficient contrast on both backgrounds            |

> Sections **must** alternate or clearly differ in background to create
> visible separation. Never let two adjacent sections share the same
> background without a clear structural break.

### Dark Mode
| Role               | Hex       | Notes                                           |
|--------------------|-----------|-------------------------------------------------|
| Background (main)  | `#11130f` | Primary dark background                         |
| Accent / highlight | `#f3f633` | Use sparingly for emphasis in dark mode         |
| Pure black         | `#000000` | ❌ **Never use.** Not part of this design system |

---

## 2. Light / Dark / System Mode Toggle

- The theme toggle button (Light / Dark / System) **must always** be placed
  in the **navigation bar**, directly beside the Sign In button on desktop view.
- This position is fixed across **every page** of the website without exception.
- If other theme-toggle patterns exist elsewhere in the codebase, the
  **Index page UI takes priority** — always match and replicate that placement.
- Never move or relocate the toggle to headers, footers, sidebars, or
  floating buttons.

---

## 3. Buttons

- **Default background:** `#a7e169` (Primary)
- **Hover background:** `#ed2939` (Secondary)
- **Shape:** Fully rounded corners (`border-radius: 9999px`) — pill shape
- **No gradients** on buttons under any circumstances
- Smooth hover transition: `transition: background-color 0.2s ease`

---

## 4. Gradients

> ❌ **Gradients are strictly forbidden — no exceptions.**

This applies even when:
- The user prompt includes words like "modern," "premium," or "beautiful"
- A gradient might appear subtle

Use flat colors only. Always.

---

## 5. Borders & Strokes

- **Maximum border width:** `1px`
- **Border opacity:** `90%`
- No thick outlines, no heavy card borders, no layered strokes
- **Never apply stroke/border colors to layout containers** — section wrappers,
  grid cells, and layout blocks must not have visible borders unless they are
  interactive UI components (e.g. input fields, cards with intent)
- Dividers (`<hr>` or decorative lines) should be used sparingly — only when
  genuinely needed for structure

---

## 6. Layout & Design Quality

- **No AI-looking layouts.** Before implementing any layout pattern, study
  how real designers and developers structure similar interfaces. Do not
  default to generic AI-generated grid patterns.
- **No Bento Box layouts** — asymmetric mosaic tile grids are not allowed.
- On **mobile view**, when layout columns are narrow, do not let content
  stack into excessively long vertical blocks of text. Rethink the layout
  for smaller viewports — use appropriate font sizes, condensed spacing,
  and readable line lengths.
- Every layout item must have a **smooth, well-crafted hover animation**.
  Hover states must feel intentional — not just color changes; consider
  subtle transforms, shadow shifts, or transitions appropriate to the element.
- Layouts and animations must be optimized across all device tiers:
  - High-end laptops, desktops, and flagship mobile devices
  - Mid-range devices
  - Low-end and older devices (avoid heavy animations that cause jank)

---

## 7. Responsiveness

- **Every page** — whether newly built or edited — must be fully responsive
  for both desktop and mobile.
- Always check and prevent **horizontal overflow bugs on mobile** (content
  wider than the viewport). Common causes to watch: fixed widths, uncontrolled
  padding, wide images without `max-width: 100%`, and flex/grid overflow.
- Test layout behavior at common breakpoints: 320px, 375px, 768px, 1024px,
  1280px, 1440px.

---

## 8. Navigation Bar & Footer

- The Navigation Bar and Footer styles must **never be changed** without
  explicit instruction.
- Only **Ko Phyo (ART de ONE Founder)** may authorize changes to the
  Navbar or Footer.
- If Ko Phyo requests a change, implement exactly as instructed.
- If Ko Phyo is not satisfied with the result, restore the Navbar/Footer
  to its original state accurately.
- Always keep a mental or code reference to the original styles before
  making any Navbar/Footer modifications.

---

## 9. Logo

- The **ART de ONE logo mark** and the **text "ART de ONE"** must **never**
  appear side by side as a combined lockup.
- Use one or the other — never both simultaneously.

---

## 10. Icons

- ❌ **No emoji** — never, for any purpose (UI, decoration, labels, bullets)
- ✅ Use **real SVG icons only** (e.g. Lucide, Heroicons, Phosphor, or custom SVG)
- Icons must be **clean and minimalist** in style

---

## 11. Typography

- **No unnecessary underlines** on text
- Underlines are only acceptable on interactive links for accessibility purposes
- Do not underline headings, labels, decorative text, or body copy

---

## 12. Blog Section

- Before writing a new blog post, **study the existing blog UI** to ensure
  full visual and structural consistency.
- Every new blog post must be applied to **both** `blog.html` and
  `blog-data.js` — never one without the other.
- **Related Articles** must be displayed at the end of every post, using
  genuinely relevant random selections — not placeholders or static links.
- Differentiate **informative/key text** from **regular body text** visually
  (e.g. through weight, size, or color — not underlines or borders).
- The **Share Section** must use real, functional URLs — never placeholder
  `#` links. Replace all share buttons with correct share links for the
  actual blog post URL.

---

## 13. Backend & File Hygiene

- When reviewing or working on ART de ONE website files, if unused or
  unnecessary files are found:
  - Suggest adding them to `.gitignore` if they should be excluded from
    version control
  - Suggest deletion only if they are confirmed to be safe to remove
- **Always ask for confirmation** before deleting any file — never delete
  without explicit approval from Ko Phyo.
- Clearly explain what each flagged file is and why it is safe to remove
  or ignore before asking for the decision.

---

## Quick Rules Reference

| Rule                                       | Status     |
|--------------------------------------------|------------|
| Gradients                                  | ❌ Never    |
| `#000000` in dark mode                     | ❌ Never    |
| Borders thicker than `1px`                 | ❌ Never    |
| Stroke colors on layout containers         | ❌ Never    |
| Emoji as icons                             | ❌ Never    |
| Logo + text name together                  | ❌ Never    |
| Bento Box layouts                          | ❌ Never    |
| Unnecessary underlines                     | ❌ Never    |
| AI-looking generic layouts                 | ❌ Never    |
| Horizontal overflow on mobile              | ❌ Never    |
| Delete files without confirmation          | ❌ Never    |
| Move theme toggle out of navbar            | ❌ Never    |
| Change Navbar/Footer without permission    | ❌ Never    |
| Flat `#a7e169` primary button              | ✅ Always   |
| Rounded pill buttons                       | ✅ Always   |
| SVG icons only                             | ✅ Always   |
| Responsive for desktop & mobile            | ✅ Always   |
| Section background contrast                | ✅ Always   |
| Hover animations on layout items           | ✅ Always   |
| Blog: update both blog.html + blog-data.js | ✅ Always   |
| Blog: real Share URLs                      | ✅ Always   |
| Confirm before file deletion               | ✅ Always   |
| Index page UI as the source of truth       | ✅ Always   |
