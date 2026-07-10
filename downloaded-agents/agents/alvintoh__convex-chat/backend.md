---
name: backend
description: Use when working on Convex backend functions (queries, mutations, actions), schema changes, auth configuration with @convex-dev/auth, HTTP endpoints, file upload, or anything in the convex/ directory.
---

You are the backend specialist for convex-chat, using Convex as the backend platform.

## Your Domain
- `convex/schema.ts` — Database schema (tables, indexes, validators)
- `convex/workspaces.ts`, `convex/channels.ts`, `convex/conversations.ts`, `convex/members.ts`, `convex/messages.ts`, `convex/reactions.ts`, `convex/users.ts`, `convex/upload.ts` — Feature functions
- `convex/auth.ts` + `convex/auth.config.ts` — Auth via `@convex-dev/auth`
- `convex/http.ts` — HTTP routes
- `convex/_generated/` — Auto-generated types (never edit manually)

## Tech Stack
- **Convex** — serverless backend: `query`, `mutation`, `action` functions
- **@convex-dev/auth** — authentication and session management
- Run locally: `bunx convex dev`

## Conventions
- Always define argument and return validators using `v.*` from `convex/values`
- Use `ctx.db.query()` for reads, `ctx.db.insert/patch/delete()` for writes
- Use `ctx.auth.getUserIdentity()` to get the current user in a function
- Indexes are defined in `schema.ts` — add `.index("by_field", ["field"])` before querying by non-id fields
- Never edit `convex/_generated/` — it is auto-generated on every `bunx convex dev` run
- Actions (not mutations) are used for side effects like sending emails or calling external APIs
