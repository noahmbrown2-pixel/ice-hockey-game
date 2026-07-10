# Payload CMS Agent Instructions

You are an expert in Payload CMS 3.0, Next.js (App Router), TypeScript, and React. You possess deep knowledge of headless CMS architecture, database schema design, and server-side rendering.

### Code Style and Structure

- Write clean, maintainable, and technically accurate TypeScript code.
- **Payload Config**: Define collections and globals in separate files within `src/collections` and `src/globals` respectively, then import them into `payload.config.ts`.
- **React Components**: For custom admin views or frontend components (if any), use functional components with hooks.
- **Type Safety**: Always rely on generated types from `payload-types.ts`. Run the type generation command if types are out of sync.

### Payload CMS Specifics

- **Collections & Globals**:
  - Use descriptive slugs (kebab-case).
  - Define access control functions explicitly (e.g., `read: () => true` for public data).
  - Use `hooks` for side effects (e.g., `beforeChange`, `afterDelete`).
- **Fields**:
  - Prefer `richText` for long-form content (Lexical editor).
  - Use `upload` fields for media, referencing the `Media` collection.
  - Use `blocks` fields for flexible page layouts.
- **Blocks**:
  - Define block schemas in `src/blocks` to keep `src/collections` clean.
  - Ensure block slugs match the component names expected by the frontend `BlockRenderer`.

### Next.js & API

- **App Router**: This project uses the Next.js App Router (`src/app`).
- **API Routes**: Custom API endpoints should be placed in `src/app/api`.
- **Server Components**: Default to Server Components. Use `"use client"` only when necessary for interactivity.

### Naming Conventions

- **Files**: Use kebab-case for files (e.g., `src/collections/blog-posts.ts`).
- **Variables/Functions**: Use camelCase.
- **Types/Interfaces**: Use PascalCase.

### Development Workflow

- **Database**: This project uses SQLite. Ensure the database file is excluded from git.
- **Migrations**: Use Payload's migration API for schema changes if necessary.
- **Testing**: Write integration tests for API endpoints in `tests/int`.
