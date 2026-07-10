<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.4.22
- filament/filament (FILAMENT) - v3
- inertiajs/inertia-laravel (INERTIA_LARAVEL) - v2
- laravel/fortify (FORTIFY) - v1
- laravel/framework (LARAVEL) - v12
- laravel/prompts (PROMPTS) - v0
- laravel/sanctum (SANCTUM) - v4
- laravel/wayfinder (WAYFINDER) - v0
- livewire/livewire (LIVEWIRE) - v3
- laravel/boost (BOOST) - v2
- laravel/mcp (MCP) - v0
- laravel/pail (PAIL) - v1
- laravel/pint (PINT) - v1
- laravel/sail (SAIL) - v1
- pestphp/pest (PEST) - v4
- phpunit/phpunit (PHPUNIT) - v12
- @inertiajs/react (INERTIA_REACT) - v2
- react (REACT) - v19
- tailwindcss (TAILWINDCSS) - v4
- @laravel/vite-plugin-wayfinder (WAYFINDER_VITE) - v0
- eslint (ESLINT) - v9
- prettier (PRETTIER) - v3

## Skills Activation

This project has domain-specific skills available. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

- `wayfinder-development` — Activates whenever referencing backend routes in frontend components. Use when importing from @/actions or @/routes, calling Laravel routes from TypeScript, or working with Wayfinder route functions.
- `pest-testing` — Tests applications using the Pest 4 PHP framework. Activates when writing tests, creating unit or feature tests, adding assertions, testing Livewire components, browser testing, debugging test failures, working with datasets or mocking; or when the user mentions test, spec, TDD, expects, assertion, coverage, or needs to verify functionality works.
- `inertia-react-development` — Develops Inertia.js v2 React client-side applications. Activates when creating React pages, forms, or navigation; using <Link>, <Form>, useForm, or router; working with deferred props, prefetching, or polling; or when user mentions React with Inertia, React pages, React forms, or React navigation.
- `tailwindcss-development` — Styles applications using Tailwind CSS v4 utilities. Activates when adding styles, restyling components, working with gradients, spacing, layout, flex, grid, responsive design, dark mode, colors, typography, or borders; or when the user mentions CSS, styling, classes, Tailwind, restyle, hero section, cards, buttons, or any visual/UI changes.
- `fortify-development` — Laravel Fortify headless authentication backend development. Activate when implementing authentication features including login, registration, password reset, email verification, two-factor authentication (2FA/TOTP), profile updates, headless auth, authentication scaffolding, or auth guards in Laravel applications.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

- Laravel Boost is an MCP server that comes with powerful tools designed specifically for this application. Use them.

## Artisan Commands

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`, `php artisan tinker --execute "..."`).
- Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.

## URLs

- Whenever you share a project URL with the user, you should use the `get-absolute-url` tool to ensure you're using the correct scheme, domain/IP, and port.

## Debugging

- Use the `database-query` tool when you only need to read from the database.
- Use the `database-schema` tool to inspect table structure before writing migrations or models.
- To execute PHP code for debugging, run `php artisan tinker --execute "your code here"` directly.
- To read configuration values, read the config files directly or run `php artisan config:show [key]`.
- To inspect routes, run `php artisan route:list` directly.
- To check environment variables, read the `.env` file directly.

## Reading Browser Logs With the `browser-logs` Tool

- You can read browser logs, errors, and exceptions using the `browser-logs` tool from Boost.
- Only recent browser logs will be useful - ignore old logs.

## Searching Documentation (Critically Important)

- Boost comes with a powerful `search-docs` tool you should use before trying other approaches when working with Laravel or Laravel ecosystem packages. This tool automatically passes a list of installed packages and their versions to the remote Boost API, so it returns only version-specific documentation for the user's circumstance. You should pass an array of packages to filter on if you know you need docs for particular packages.
- Search the documentation before making code changes to ensure we are taking the correct approach.
- Use multiple, broad, simple, topic-based queries at once. For example: `['rate limiting', 'routing rate limiting', 'routing']`. The most relevant results will be returned first.
- Do not add package names to queries; package information is already shared. For example, use `test resource table`, not `filament 4 test resource table`.

### Available Search Syntax

1. Simple Word Searches with auto-stemming - query=authentication - finds 'authenticate' and 'auth'.
2. Multiple Words (AND Logic) - query=rate limit - finds knowledge containing both "rate" AND "limit".
3. Quoted Phrases (Exact Position) - query="infinite scroll" - words must be adjacent and in that order.
4. Mixed Queries - query=middleware "rate limit" - "middleware" AND exact phrase "rate limit".
5. Multiple Queries - queries=["authentication", "middleware"] - ANY of these terms.

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.

## Constructors

- Use PHP 8 constructor property promotion in `__construct()`.
    - `public function __construct(public GitHub $github) { }`
- Do not allow empty `__construct()` methods with zero parameters unless the constructor is private.

## Type Declarations

- Always use explicit return type declarations for methods and functions.
- Use appropriate PHP type hints for method parameters.

<!-- Explicit Return Types and Method Params -->
```php
protected function isAccessible(User $user, ?string $path = null): bool
{
    ...
}
```

## Enums

- Typically, keys in an Enum should be TitleCase. For example: `FavoritePerson`, `BestLake`, `Monthly`.

## Comments

- Prefer PHPDoc blocks over inline comments. Never use comments within the code itself unless the logic is exceptionally complex.

## PHPDoc Blocks

- Add useful array shape type definitions when appropriate.

=== tests rules ===

# Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test --compact` with a specific filename or filter.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v2

- Use all Inertia features from v1 and v2. Check the documentation before making changes to ensure the correct approach.
- New features: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

## Database

- Always use proper Eloquent relationship methods with return type hints. Prefer relationship methods over raw queries or manual joins.
- Use Eloquent models and relationships before suggesting raw database queries.
- Avoid `DB::`; prefer `Model::query()`. Generate code that leverages Laravel's ORM capabilities rather than bypassing them.
- Generate code that prevents N+1 query problems by using eager loading.
- Use Laravel's query builder for very complex database operations.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

### APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## Controllers & Validation

- Always create Form Request classes for validation rather than inline validation in controllers. Include both validation rules and custom error messages.
- Check sibling Form Requests to see if the application uses array or string based validation rules.

## Authentication & Authorization

- Use Laravel's built-in authentication and authorization features (gates, policies, Sanctum, etc.).

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Queues

- Use queued jobs for time-consuming operations with the `ShouldQueue` interface.

## Configuration

- Use environment variables only in configuration files - never use the `env()` function directly outside of config files. Always use `config('app.name')`, not `env('APP_NAME')`.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== laravel/v12 rules ===

# Laravel 12

- CRITICAL: ALWAYS use `search-docs` tool for version-specific Laravel documentation and updated code examples.
- Since Laravel 11, Laravel has a new streamlined file structure which this project uses.

## Laravel 12 Structure

- In Laravel 12, middleware are no longer registered in `app/Http/Kernel.php`.
- Middleware are configured declaratively in `bootstrap/app.php` using `Application::configure()->withMiddleware()`.
- `bootstrap/app.php` is the file to register middleware, exceptions, and routing files.
- `bootstrap/providers.php` contains application specific service providers.
- The `app\Console\Kernel.php` file no longer exists; use `bootstrap/app.php` or `routes/console.php` for console configuration.
- Console commands in `app/Console/Commands/` are automatically available and do not require manual registration.

## Database

- When modifying a column, the migration must include all of the attributes that were previously defined on the column. Otherwise, they will be dropped and lost.
- Laravel 12 allows limiting eagerly loaded records natively, without external packages: `$query->latest()->limit(10);`.

### Models

- Casts can and likely should be set in a `casts()` method on a model rather than the `$casts` property. Follow existing conventions from other models.

=== wayfinder/core rules ===

# Laravel Wayfinder

Wayfinder generates TypeScript functions for Laravel routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

- IMPORTANT: Activate `wayfinder-development` skill whenever referencing backend routes in frontend components.
- Invokable Controllers: `import StorePost from '@/actions/.../StorePostController'; StorePost()`.
- Parameter Binding: Detects route keys (`{post:slug}`) — `show({ slug: "my-post" })`.
- Query Merging: `show(1, { mergeQuery: { page: 2, sort: null } })` merges with current URL, `null` removes params.
- Inertia: Use `.form()` with `<Form>` component or `form.submit(store())` with useForm.

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== pest/core rules ===

## Pest

- This project uses Pest for testing. Create tests: `php artisan make:test --pest {name}`.
- Run tests: `php artisan test --compact` or filter: `php artisan test --compact --filter=testName`.
- Do NOT delete tests without approval.
- CRITICAL: ALWAYS use `search-docs` tool for version-specific Pest documentation and updated code examples.
- IMPORTANT: Activate `pest-testing` every time you're working with a Pest or testing-related task.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

=== tailwindcss/core rules ===

# Tailwind CSS

- Always use existing Tailwind conventions; check project patterns before adding new ones.
- IMPORTANT: Always use `search-docs` tool for version-specific Tailwind CSS documentation and updated code examples. Never rely on training data.
- IMPORTANT: Activate `tailwindcss-development` every time you're working with a Tailwind CSS or styling-related task.

=== laravel/fortify rules ===

# Laravel Fortify

- Fortify is a headless authentication backend that provides authentication routes and controllers for Laravel applications.
- IMPORTANT: Always use the `search-docs` tool for detailed Laravel Fortify patterns and documentation.
- IMPORTANT: Activate `developing-with-fortify` skill when working with Fortify authentication features.

=== spatie/laravel-activitylog rules ===

# spatie/laravel-activitylog

Activity logging package for Laravel. Logs model events and manual activities to a database table.

## Key Concepts

- **Activity**: An Eloquent model (`Spatie\Activitylog\Models\Activity`) storing log entries with subject, causer, event, attribute_changes, and properties.
- **Subject**: The model being acted upon (polymorphic `subject_type`/`subject_id`).
- **Causer**: The model that caused the action, typically the authenticated user (polymorphic `causer_type`/`causer_id`).
- **LogOptions**: Fluent configuration object returned by `getActivitylogOptions()` on models using the `LogsActivity` trait.
- **ActivityEvent**: Enum with cases `Created`, `Updated`, `Deleted`, `Restored`.
- **`attribute_changes`** column: stores `{"attributes": {...}, "old": {...}}` for tracked model changes.
- **`properties`** column: stores custom user data set via `withProperties()`.

## Traits

### `LogsActivity`

Add to models to automatically log create/update/delete events. Optionally implement `getActivitylogOptions()` to configure which attributes to track (defaults to logging events without attribute changes).

```php
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Article extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}
```

### `CausesActivity`

Add to user/causer models. Provides `activitiesAsCauser()` relationship.

### `HasActivity`

Combines `LogsActivity` and `CausesActivity`. Provides `activities()`, `activitiesAsSubject()`, and `activitiesAsCauser()`.

## Manual Logging

```php
activity()
    ->performedOn($article)
    ->causedBy($user)
    ->event(ActivityEvent::Updated)
    ->withProperties(['key' => 'value'])
    ->log('Article was updated');
```

## LogOptions Methods

| Method | Description |
|--------|-------------|
| `logFillable()` | Log all fillable attributes |
| `logAll()` | Log all attributes |
| `logOnly(array)` | Log specific attributes |
| `logExcept(array)` | Exclude attributes |
| `logOnlyDirty()` | Only log changed attributes |
| `dontLogEmptyChanges()` | Skip logging when no tracked attributes changed |
| `dontLogIfAttributesChangedOnly(array)` | Ignore updates that only change these attributes |
| `useLogName(string)` | Set custom log name |
| `setDescriptionForEvent(Closure)` | Custom description per event |
| `useAttributeRawValues(array)` | Store raw (uncast) values |

## Querying Activities

```php
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Enums\ActivityEvent;

Activity::forEvent(ActivityEvent::Created)->get();
Activity::causedBy($user)->get();
Activity::forSubject($article)->get();
Activity::inLog('orders')->get();
```

## Setting the causer

Override the causer for a block of code:

```php
use Spatie\Activitylog\Facades\Activity;

Activity::defaultCauser($admin, function () {
    // all activities here are caused by $admin
});

// or set globally for the rest of the request
Activity::defaultCauser($admin);
```

## Disabling Logging

```php
activity()->withoutLogging(function () {
    // no activities logged here
});
```

## Accessing Changes and Properties

```php
$activity = Activity::latest()->first();

// Tracked model changes (set automatically by LogsActivity)
$activity->attribute_changes; // Collection: {"attributes": {...}, "old": {...}}

// Custom user data (set via withProperties)
$activity->properties; // Collection
$activity->getProperty('key'); // single value
```

## Custom Activity Model

Set `activity_model` in `config/activitylog.php` to a class that extends `Model` and implements `Spatie\Activitylog\Contracts\Activity`. Use a custom model for custom table names or database connections.

## Customizing Actions

The package uses action classes (`LogActivityAction`, `CleanActivityLogAction`) that can be extended and swapped via config:

```php
// config/activitylog.php
'actions' => [
    'log_activity' => \App\Actions\CustomLogActivityAction::class,
    'clean_log' => \App\Actions\CustomCleanAction::class,
],
```

Custom action classes must extend the originals. Override protected methods (`save()`, `beforeActivityLogged()`, `resolveDescription()`, etc.) to customize behavior.

## Configuration

Key config options in `config/activitylog.php`:
- `enabled`: Master on/off switch (env: `ACTIVITYLOG_ENABLED`)
- `clean_after_days`: Days to keep records for `activitylog:clean` command
- `default_log_name`: Default log name (string)
- `default_auth_driver`: Auth driver for causer resolution
- `include_soft_deleted_subjects`: Include soft-deleted subjects
- `activity_model`: Custom Activity model class
- `default_except_attributes`: Globally excluded attributes
- `actions.log_activity`: Action class for logging activities
- `actions.clean_log`: Action class for cleaning old activities

</laravel-boost-guidelines>

---

## Agent Core Rules

Rules berikut bersifat **non-negotiable** dan harus diikuti di setiap sesi kerja pada proyek ini.

---

## 1. Response Language: Bahasa Indonesia (MANDATORY)

### Strict Rules

- **ALWAYS** respond in Bahasa Indonesia for ALL communications — no exceptions.
- This applies to: explanations, clarification questions, error messages, suggestions, technical discussions, commit message descriptions, debugging explanations, and every other form of communication with the user.
- **NEVER** switch to English or any other language unless the user explicitly requests it.
- If unsure, default to Bahasa Indonesia.

### Exceptions (Remain in English)

The following elements should remain in English as they are part of programming conventions:

- Variable names, function names, class names, and code identifiers.
- Programming syntax and language-specific keywords.
- Library, package, framework, and tool names.
- Git commit messages (optional — follow user preference).
- Technical configuration file contents (package.json, tsconfig.json, etc.).

### Example

```
✅ Correct:
"Saya akan membuat komponen React untuk halaman login. Pertama, mari kita install dependency yang dibutuhkan..."

❌ Wrong:
"I'll create a React component for the login page. First, let's install the required dependencies..."
```

### Code Comments

- All inline code comments MUST be written in **Bahasa Indonesia**.
- JSDoc/TSDoc: descriptions in Bahasa Indonesia, type annotations remain in English.

```typescript
/**
 * Mengambil data pengguna berdasarkan ID.
 * Mengembalikan null jika pengguna tidak ditemukan.
 *
 * @param userId - ID unik pengguna
 * @returns Data pengguna atau null
 */
async function fetchUserData(userId: string): Promise<User | null> {
  // Validasi input sebelum melakukan query ke database
  if (!userId) return null;

  // Ambil data dari database
  const user = await db.users.findUnique({ where: { id: userId } });
  return user;
}
```

### Communication Tone

- Explain every technical decision in Bahasa Indonesia.
- If a breaking change or deprecation is found, inform the user in Bahasa Indonesia with alternative solutions.
- When suggesting architectural changes, provide clear reasoning in Bahasa Indonesia.
- Error messages directed at the user must be in Bahasa Indonesia.
- Internal technical logs may remain in English.

---

## 2. Mandatory Use of Context7 MCP

### Strict Rules

- **ALWAYS** use Context7 MCP to fetch current documentation before writing any code that involves external libraries, frameworks, or tools.
- This applies to **all** of the following situations:
  - Using libraries/frameworks already present in the project.
  - Adding new libraries/frameworks to the project.
  - Upgrading or migrating library versions.
  - Writing code that depends on any external library API.
  - Fixing bugs related to library usage.
  - Configuring build tools, bundlers, or dev tooling.

### How to Use

Append `use context7` to every internal prompt when documentation reference is needed. Context7 will automatically fetch up-to-date, version-specific documentation from official sources.

### Required Workflow

```
1. User requests a feature/change involving the tech stack
2. MANDATORY: Use Context7 to fetch current documentation
3. Verify that APIs, methods, and patterns match the current version
4. Only then write/modify code based on accurate documentation
5. If there is a conflict between internal knowledge and Context7, ALWAYS PRIORITIZE Context7 results
```

### Situations Requiring Context7

| Situation | Context7 Action |
|---|---|
| Creating a new React component | Check React docs for the project's installed version |
| Setting up Next.js routing | Check App Router vs Pages Router for the installed Next.js version |
| Configuring Tailwind CSS | Check config syntax for the current Tailwind version |
| Querying database with Prisma | Check Prisma Client API for the installed version |
| Adding Express middleware | Check current Express middleware patterns |
| Setting up authentication | Check docs for the auth library in use (NextAuth, Clerk, etc.) |
| Third-party API integration | Check the latest SDK/library wrapper version |
| Configuring Vite/Webpack/Turbopack | Check bundler docs for current configuration API |

### Prohibited Actions

```
❌ Writing code based on training data without Context7 verification
❌ Assuming an API or method is still valid without checking current docs
❌ Skipping Context7 because you believe you already "know" a library
❌ Using patterns or syntax that may have been deprecated
```

---

## 3. Context7 MCP Configuration

### Setup via CLI (Recommended)

```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest
```

### Setup via Remote HTTP

```bash
claude mcp add --transport http context7 https://mcp.context7.com/mcp
```

### Manual Setup (claude_desktop_config.json or .mcp.json)

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

### Setup with API Key (Higher Rate Limits)

Get a free API key at [context7.com/dashboard](https://context7.com/dashboard).

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest", "--api-key", "YOUR_API_KEY"]
    }
  }
}
```

### Verify Connection

```bash
claude mcp list
```

Ensure the output shows `context7` with `✓ Connected` status.

---

## 4. Mandatory Coding Principles

The following coding principles **MUST** be applied in every piece of code that is written, modified, or reviewed. The goal is to produce software that is maintainable, scalable, readable, and minimizes technical debt for long-term collaboration.

### SOLID Principles (Object-Oriented Design)

- **Single Responsibility (SRP)**: A class or module should have one, and only one, reason to change. If a class handles more than one responsibility, split it into separate classes.

```typescript
// ❌ Wrong: One class handling multiple responsibilities
class UserService {
  createUser() { /* ... */ }
  sendEmail() { /* ... */ }
  generateReport() { /* ... */ }
}

// ✅ Correct: Each class has a single responsibility
class UserService {
  createUser() { /* ... */ }
}
class EmailService {
  sendEmail() { /* ... */ }
}
class ReportService {
  generateReport() { /* ... */ }
}
```

- **Open/Closed (OCP)**: Software entities should be open for extension but closed for modification. Use abstractions so new features can be added without altering existing code.

- **Liskov Substitution (LSP)**: Subtypes must be substitutable for their base types without altering program correctness. Every derived class must fulfill the contract of its parent class.

- **Interface Segregation (ISP)**: Clients should not be forced to depend on methods they do not use. Split large interfaces into smaller, focused ones.

```typescript
// ❌ Wrong: Interface is too broad
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
}

// ✅ Correct: Small and focused interfaces
interface Workable {
  work(): void;
}
interface Feedable {
  eat(): void;
}
```

- **Dependency Inversion (DIP)**: Depend on abstractions (interfaces), not concrete implementations. High-level modules must not depend directly on low-level modules.

```typescript
// ❌ Wrong: Direct dependency on concrete implementation
class OrderService {
  private mysqlDb = new MySQLDatabase();
}

// ✅ Correct: Depends on an abstraction
class OrderService {
  constructor(private db: DatabaseInterface) {}
}
```

### Clean Code & Design Principles

- **DRY (Don't Repeat Yourself)**: Avoid duplication of logic. If the same code exists in two or more places, extract it into a reusable function or module.

- **KISS (Keep It Simple, Stupid)**: Avoid unnecessary complexity. Prioritize readability and simplicity. A simple working solution beats a complex "elegant" one.

- **YAGNI (You Ain't Gonna Need It)**: Do not add functionality until it is actually needed. Do not write code for hypothetical future requirements.

- **Clean Code / Readability**: Use meaningful variable and function names, consistent formatting, and simple logic. Code should be self-documenting.

- **Abstraction**: Hide internal complexity and only expose necessary interfaces. Abstraction layers help isolate changes and reduce coupling.

### Best Practices for Implementation

- **Test-Driven Development (TDD)**: Write tests before implementing code. Follow RED-GREEN-REFACTOR strictly.

- **Continuous Refactoring**: Regularly improve code structure without changing behavior. Boy Scout Rule: leave code better than you found it.

- **Code Reviews**: Utilize peer reviews to maintain code quality, standards, and consistency.

- **Security by Design**: Validate all input, sanitize data, and manage dependencies regularly. Security is a foundation, not an afterthought.

```
Basic security checklist:
- Validate and sanitize all user input
- Use parameterized queries (prevent SQL injection)
- Never hardcode secrets or credentials in source code
- Update dependencies regularly for security patches
- Apply the principle of least privilege
```

### Agent Enforcement Table

| Principle | How the Agent Applies It |
|---|---|
| SRP | Every function/class/module handles only one responsibility |
| OCP | Use patterns that allow extension without modification |
| LSP | Ensure inheritance and polymorphism are correctly applied |
| ISP | Create small, focused interfaces |
| DIP | Inject dependencies through constructors or parameters |
| DRY | Identify and eliminate code duplication |
| KISS | Choose the simplest solution that fulfills the requirement |
| YAGNI | Only implement what is requested — nothing more |
| TDD | Write tests before implementation — always |
| Security | Always validate input and follow security best practices |

---

## 5. Additional Rules

### Code Quality

- Always follow best practices from official documentation (fetched via Context7).
- Use TypeScript if the project already uses TypeScript.
- Add adequate error handling in all code paths.
- Write clean, readable, and well-documented code.

### Error Handling

- Error messages shown to users should be descriptive and in Bahasa Indonesia.
- Internal technical logs may use English conventions.
- When debugging, explain the process and findings in Bahasa Indonesia.

---

## Quick Reference

| Rule | Application |
|---|---|
| Response language | **Always Bahasa Indonesia** |
| Code language | English (variables, functions, syntax) |
| Code comments | Bahasa Indonesia |
| Context7 | Mandatory for every tech stack reference |
| Documentation priority | Context7 > internal/training knowledge |
| Coding principles | SOLID, DRY, KISS, YAGNI — always enforced |
| Testing | TDD: RED-GREEN-REFACTOR — no code before tests |
| Debugging | systematic-debugging + verification-before-completion |
| Security | Security by design — validate input, sanitize data |
| Refactoring | Continuous improvement — Boy Scout Rule |
| Communication with user | **Always in Bahasa Indonesia** |
