# Toc Chat Agent Guide

This repository is a small Angular CLI workspace for a personal long-form AI chat app.

## Project Shape

- `apps/web`: Angular PWA.
- `apps/api`: Fastify API.
- Package manager: pnpm workspaces.
- Styling: Tailwind CSS.
- E2E tests: Playwright.
- Current approach: plain Angular CLI workspace, not Nx.

## Repo Skills

Repo-local Codex skills live in `.codex/skills`.

- Use `toc-chat-theme-system` for UI, theme, and visual consistency work.
- Use `toc-chat-testing-strategy` when adding, changing, or reviewing tests.

## Common Commands

Run commands from the repository root:

```powershell
pnpm api
pnpm web
pnpm api:build
pnpm web:build
pnpm e2e
```

## Commit Conventions

- Use Conventional Commit style: `type(scope): concise imperative summary`.
- For Playwright/e2e-only changes, use `test(e2e): ...`.
- For docs-only changes, use `docs: ...`.

## Theme Rules

- Use `ThemeService` for `system | light | dark` theme preference.
- Use semantic CSS variables from `apps/web/src/styles.scss` for main app colors.
- Prefer Tailwind utilities for layout, spacing, typography, and local styling.
- Avoid hardcoding large sets of `dark:*` classes for main surfaces; use variables such as `--color-app-bg`, `--color-app-panel`, `--color-app-text`, and `--color-app-border`.

## Angular Guidance

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- In `effect()`, read only the signals that should trigger the effect. Wrap async work, service calls, signal writes, and other side-effect helpers in `untracked()` once the explicit dependencies have been read.
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
