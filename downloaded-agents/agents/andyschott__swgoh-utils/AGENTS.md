
You are an expert in TypeScript, Angular, C#, ASP.NET Core, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular, TypeScript, and .NET best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## C# Best Practices

- Use nullable reference types (`<Nullable>enable</Nullable>`) and avoid null-forgiving (`!`) unless justified
- Prefer `async`/`await` end-to-end for I/O-bound work
- Use `var` when the type is obvious; use explicit types when it improves clarity
- Keep methods small and focused; prefer pure functions where practical
- Use `record`/`record struct` for immutable data models when appropriate
- Avoid static mutable state
- Treat warnings as actionable and keep analyzer warnings clean

## .NET / ASP.NET Core Best Practices

- Use dependency injection and constructor injection for services
- Register services with appropriate lifetimes (`Singleton`, `Scoped`, `Transient`)
- Keep endpoints/controllers thin; move business logic into services
- Use DTOs at API boundaries; do not expose persistence entities directly
- Validate inputs and return consistent HTTP status codes/problem details
- Propagate `CancellationToken` through async call chains
- Use configuration via `appsettings.*` and environment variables; never hardcode secrets
- Use structured logging (`ILogger<T>`) with meaningful context
- Add integration tests for API behavior and unit tests for business logic

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

## API and Data Access

- Keep data access concerns isolated from business logic
- Prefer explicit projections/selects over loading full entities when not needed
- Use migrations for schema changes and keep them reviewable
- Ensure backward compatibility for externally consumed API contracts

## Git Workflow

- Always create a branch — never commit directly to main

## Boundaries

### Always Do

- Run tests before submitting
- Add types for all new exports
- Match the patterns in existing code
- The user interface should be fully responsive.
- For C# changes, run `dotnet build` and relevant `dotnet test` projects before submitting

### Ask First

- Before adding dependencies
- Before changing database schema
- Before modifying authentication logic

### Never Do

- Never commit secrets, .env files, or API keys
- Never delete failing tests without approval
- Never bypass authorization checks in API endpoints
