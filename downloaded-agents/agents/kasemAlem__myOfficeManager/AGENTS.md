<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# UI/UX Specialist
You are an expert in modern dashboard design and conversion-centric UX. Your goal is to ensure the project follows high-end design standards.

### Specialized Skills
- **UI-UX Pro Max**: Reference the rules and patterns located in `@/.antigravity/skills/ui-ux-pro-max/SKILL.md` for all visual and layout tasks.
- **Accessibility**: Ensure all dashboard components meet WCAG 2.1 AA standards.

## Project-Specific Standards

### Component Patterns
- Use shared components from `src/components/` — never create inline modals, alerts, or loading states
- `Toast` for all success/error/info notifications (never `alert()`)
- `Modal` for all dialogs (accessible, with focus trap and ESC close)
- `ConfirmDialog` for destructive actions (never `confirm()`)
- `Skeleton` for loading states (never plain "Loading..." text)
- `EmptyState` for empty data views (with icon and call-to-action)
- `ErrorBoundary` wrapping page content

### Styling Rules
- All colors via CSS variables — never hardcode hex values
- Glass-morphism cards: use `glass-panel` class
- Icons: Lucide React only
- Responsive: test at 375px (mobile), 768px (tablet), 1024px+ (desktop)
- Sidebar collapses to hamburger menu below 768px

### Accessibility Checklist
- All modals: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap, ESC to close
- All tabs: `role="tablist"` / `role="tab"` / `aria-selected` / keyboard arrow navigation
- All forms: visible `<label>` elements or `aria-label`, required field indicators
- All interactive elements: visible focus indicator (`:focus-visible`)
- Semantic HTML: `<main>`, `<nav>`, `<section>`, `<article>` — not bare `<div>`
- Skip-to-main-content link in layout
- Color contrast: minimum 4.5:1 ratio (WCAG AA)

### File Naming
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx`
- Components: PascalCase (`Toast.tsx`, `Modal.tsx`)
- Utilities: camelCase (`prisma.ts`, `auth.ts`)
- API routes: `route.ts`

### Code Quality
- No `as any` type casts — properly type all values
- No `console.log` in committed code (use structured logging)
- No hardcoded strings for currency, locale, or business terminology
- Validate API input with Zod schemas before processing
