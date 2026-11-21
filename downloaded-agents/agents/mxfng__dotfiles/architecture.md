# Architecture: structure, state, TypeScript, components

Read when scaffolding a repo, designing a store, or setting up the component layer.

## Project structure

Feature-first for domain logic, layer-first for primitives - the split that scales:

```
src/
  app/        entry: main.tsx, App.tsx, providers, globals.css, styles/
  core/       heavy non-UI logic - no JSX (optional; use when a product has a real engine)
  features/   one folder per domain, each self-contained:
    <domain>/
      components/   store/   hooks/   lib/   types/   *.test.ts(x)
  shared/     cross-cutting: ui/ (Radix-wrapped primitives + variants/), hooks/, lib/,
              and self-contained subsystems each with their own barrel
  layout/     page composition (shell, panels, header/footer)
```

Conventions:
- **Stores live *in* their feature** (`features/<domain>/store/`), never a global `store/`
  dump. Pure domain logic goes in `features/<domain>/lib/` as tested pure functions, kept out
  of components.
- **Files kebab-case universally** (`use-foo.ts`, `foo-panel.tsx`) even though the exported
  symbol is PascalCase/camelCase.
- **`@/*` → `./src/*`** alias (tsconfig `paths` + Vite `tsconfigPaths`/alias). Relative imports
  only within a subsystem.
- **Barrels sparingly** - only at subsystem roots (`shared/ui/index.ts`), re-exporting values
  and `type`s. Elsewhere import concrete files; avoid barrel sprawl.
- **Shared breakpoint source**: one module of breakpoints consumed by both the Tailwind theme
  and a `useBreakpoint` hook, so JS and CSS never disagree.

## TypeScript conventions

Strict-max. The tsconfig flags he runs:

```
strict, noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch,
isolatedModules, moduleDetection: force, verbatimModuleSyntax (or erasableSyntaxOnly),
moduleResolution: bundler, target ES2022+
```

- **`type` for component props** (intersection with `React.ComponentProps<"tag">`) and for
  unions/records/aliases. **`interface` for hand-authored domain object shapes and zustand
  store state.** Consistent and idiomatic.
- **Const-object enums** instead of TS `enum` (erasable-syntax friendly):
  `const Step = { IN_PROGRESS: 0, DONE: 1 } as const; type Step = (typeof Step)[keyof typeof Step]`.
- **Discriminated unions keyed on `type`** for any state that has distinct shapes per case,
  narrowed with `state.type === "..."` - clearer and safer than optional-field grab-bags.
- **Generics for genuinely reusable abstractions** (`DataTable<T>`, a typed field/mapping
  strategy object) - not for one-off components.
- **`import type` everywhere** (verbatimModuleSyntax). **Zod validates at the boundary**, then
  `z.infer` gives the type - one source of truth for runtime + compile-time.

## State and data-flow

- **zustand, one store per feature/domain.** No single root store. Middleware stack:
  `devtools(persist(immer(...)))` - immer lets actions mutate (`state.x = ...; state.version++`),
  devtools names each store.
- **Per-value selector subscriptions** to minimize renders: `useTransportStore(s => s.isPlaying)`.
  Never destructure the whole store in a component.
- **`persist` with `partialize`** - persist only user-facing state, never runtime refs (sockets,
  engine handles, DOM nodes). Add a **`version` + `migrate()`** so persisted shapes can evolve;
  fall back to a fresh empty state on migration failure.
- **Cross-store reads via `getState()` inside actions** (not subscriptions) to avoid coupling
  render cycles.
- **Server cache via TanStack Query**: one base client, endpoints injected per domain, a
  **centralized tag enum** for invalidation, typed hooks. `enabled` gating avoids wasted
  fetches; prefer the mutation response over stale cache.

## Component patterns

- **`function Foo()` declarations, no `React.FC`.** `forwardRef` only when a ref truly needs
  forwarding (React 19 removes most needs); set `displayName` when you do.
- **Named `export { ... }` block at the bottom of every file** - components and plain TS
  modules alike (a firm house rule). No inline `export function`, no `export const Foo = () =>`,
  no default exports except lazy-route roots and data modules. Definitions read top-to-bottom;
  the public surface is one glance at the bottom.
- **Compound components** exported as sets over mega-prop components.
- **Controlled-or-uncontrolled dual API** for reusable widgets:
  `const open = controlledOpen ?? internalOpen` - a parent may or may not want to drive it.
- **Separate a control's behavior from its view** when it gets non-trivial: a thin view
  component + a `use-*` hook holding the interaction logic + a `lib/` keyboard/constants module.
  Keeps the presentational component readable and the logic testable.
- **Perf discipline**: lazy routes and lazy modals with Suspense fallbacks; granular error
  boundaries (around a risky subsystem and around the router - not one around the whole app).
  With React Compiler on, skip most manual `useMemo`/`useCallback`.
