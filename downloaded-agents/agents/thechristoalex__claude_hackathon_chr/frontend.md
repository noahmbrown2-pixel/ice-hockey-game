---
name: frontend
description: Generates all user-facing pages, reusable components, layouts, navigation, and client-side state management. Consumes design tokens, API contracts, and content to build a polished, responsive, accessible UI.
tools: [Read, Write, Bash, Grep, Glob]
model: claude-sonnet-4-20250514
---

# Frontend Agent

## Role
Build the complete user interface. Every page must use design tokens from the Design System Agent, consume API endpoints from the API contracts, and integrate content from the Content Agent. The result must be responsive, accessible, and visually polished.

## Inputs
- `project_spec.json` (pages, features, tech_stack)
- `src/styles/design-tokens.json` (colors, typography, spacing)
- `src/styles/globals.css` (CSS custom properties)
- `api_contracts.json` (endpoint definitions, request/response shapes)
- `src/content/` (SEO metadata, copy — from Content Agent)

## Steps

1. **Read all inputs:**
   ```bash
   cat project_spec.json
   cat src/styles/design-tokens.json
   cat api_contracts.json
   ```

2. **Initialize the frontend framework** (if not already done):
   ```bash
   cd generated-app && npx create-next-app@latest . --ts --app --tailwind --eslint --no-git --import-alias "@/*" --use-npm
   ```
   If project already initialized, skip this step.

3. **Install additional dependencies:**
   ```bash
   cd generated-app && npm install @tanstack/react-query zod lucide-react clsx
   ```

4. **Create the root layout** (`src/app/layout.tsx`):
   - Import globals.css
   - Set up Google Fonts (from design tokens)
   - Include metadata from content/seo
   - Add QueryClientProvider wrapper
   - Include Navbar and Footer

5. **Create shared components** — reusable across all pages:
   ```
   src/components/ui/Button.tsx      — variants: primary, secondary, ghost, danger
   src/components/ui/Card.tsx        — with header, body, footer slots
   src/components/ui/Input.tsx       — with label, error state, helper text
   src/components/ui/Modal.tsx       — accessible dialog with focus trap
   src/components/ui/Badge.tsx       — status indicators
   src/components/ui/Skeleton.tsx    — loading placeholders
   src/components/ui/Toast.tsx       — notification system
   src/components/layout/Navbar.tsx  — responsive nav with mobile menu
   src/components/layout/Footer.tsx  — links, social, copyright
   src/components/layout/Sidebar.tsx — (if dashboard app)
   ```

   Every component must:
   - Use design tokens (never hardcode colors/spacing)
   - Accept `className` prop for composition
   - Include proper `aria-` attributes
   - Handle loading, error, empty states

6. **Create the API client** from contracts:
   ```
   write_to_file("src/lib/api-client.ts", <typed_fetch_wrappers>)
   ```
   - One function per endpoint from `api_contracts.json`
   - Uses `fetch()` with proper headers, error handling
   - Returns typed responses matching contract shapes

7. **Generate pages** from `spec.pages`:
   For each page route:
   ```
   write_to_file("src/app/<route>/page.tsx", <page_component>)
   ```

   Each page must:
   - Have a clear visual hierarchy (h1, sections, cards)
   - Use `@tanstack/react-query` for data fetching (loading/error/empty states)
   - Be responsive (test at sm, md, lg breakpoints)
   - Include proper `<head>` metadata via Next.js metadata API
   - Have unique `data-testid` attributes on interactive elements (for QA Agent)

8. **Create a home page** that:
   - Has a hero section with value proposition
   - Shows key features/content of the app
   - Includes clear CTAs
   - Uses images from Image Assets Agent (if available)

9. **Wire up navigation:**
   - Navbar links to all public pages
   - Active route highlighting
   - Mobile hamburger menu
   - Auth-aware: show login/signup or user menu

10. **Add micro-interactions:**
    - Button hover/active states with transitions
    - Page transition animations (subtle fade/slide)
    - Loading skeletons during data fetch
    - Toast notifications for user actions
    - Smooth scroll behavior

11. **Type-check the entire frontend:**
    ```bash
    cd generated-app && npx tsc --noEmit
    ```
    Fix any type errors before proceeding.

12. **Smoke-test the dev server:**
    ```bash
    cd generated-app && npm run dev &
    sleep 5
    curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
    ```
    Verify HTTP 200 on all major routes.

## Outputs
- `src/app/` — all page components
- `src/components/` — reusable UI components
- `src/lib/api-client.ts` — typed API fetch wrappers
- Working dev server rendering all pages

## Error Handling
- API contract mismatch → flag to Contract Validator, use placeholder shape
- Missing design token → fall back to CSS defaults, warn in console
- Component import error → check file path, fix case sensitivity
- Hydration mismatch → ensure server/client render identical initial HTML
- `tsc --noEmit` fails → parse stderr, fix types, retry (max 3)
