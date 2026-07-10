---
description: |
  Primary agent for mediapp entire application. Handles all features across
  packages/web (React 19 + Tailwind v4) and packages/api (Bun + Elysia + Drizzle).
  ALWAYS load the `link` skill from `.claude/skills/link/` for full-stack monorepo patterns.
mode: primary
tools:
  skill: true
---

# MediApp - Main Application Agent

Primary agent for the complete mediapp application. This agent manages the entire monorepo including frontend, backend, and cross-package features.

**CRITICAL:** Upon starting any task, load the `link` skill:

```
skill({ name: "link" })
```

This skill is located at `.claude/skills/link/` and provides:

- Full-stack workflow patterns
- Monorepo commands reference
- API and Web quick references
- Cross-package type sharing
- Critical rules for both packages

## Stack Overview

| Layer    | Technology                  | Location                     |
| -------- | --------------------------- | ---------------------------- |
| Frontend | React 19 + React Router 7   | `packages/web`               |
| Styling  | Tailwind CSS v4 + shadcn/ui | `packages/web/src/index.css` |
| Backend  | Bun + Elysia                | `packages/api`               |
| Database | Drizzle ORM + PostgreSQL    | `packages/api/src/db`        |
| Auth     | Better Auth                 | Both packages                |

## Critical Rules

### Language & Theme

- **User-facing text**: Spanish (buttons, forms, messages)
- **Technical docs**: English (code, comments, README)
- **Theme**: Always use CSS variables (`bg-background`, `text-foreground`)

### Path Aliases

```typescript
// ALWAYS use @/ alias in web
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// NEVER relative paths
import { Button } from "../../../components/ui/button"; // WRONG
```

### Database Schema

- **Tables are SINGULAR**: `profile`, `asset`, `socialLink`
- **NEVER use plural names**: `profiles`, `assets` (WRONG)
- **Access relations via name**:
  ```typescript
  // CORRECT: click.socialLink.platform
  // WRONG: click.platform
  ```

## Monorepo Structure

```
mediapp/
├── packages/
│   ├── web/          # React 19 + Vite (port 5176)
│   └── api/          # Bun + Elysia (port 5300)
├── .claude/
│   ├── agent/        # Agent definitions
│   └── skills/       # Skill definitions (link skill here)
├── docs/
│   ├── modules/      # Module briefs (01-13)
│   └── global-prd.md # Product requirements
└── bunfig.toml       # Bun workspaces
```

## Key Documentation

### Module Briefs (MVP Scope)

| Module             | Feature                     |
| ------------------ | --------------------------- |
| 01-auth-onboarding | Authentication & onboarding |
| 02-public-profile  | Public profile pages        |
| 03-themes          | Theme customization         |
| 04-features        | Feature management          |
| 05-qr-card         | QR code & digital card      |
| 06-dashboard       | Dashboard analytics         |
| 07-settings        | User settings               |
| ...                | Additional modules          |

### Database Tables

- **user**: Better Auth authentication
- **profile**: Wellness professional info
- **socialLink**: Orderable social media links
- **healthSurvey**: Visitor survey responses
- **analytics**: Views and clicks tracking
- **asset**: File uploads (avatars, images)

## Development Commands

```bash
# Monorepo (from root)
bun run dev              # Both packages in parallel
bun install              # Install all dependencies
bun run lint             # Lint entire monorepo

# Web only
bun --filter @wellness-link/web dev    # Port 5176
cd packages/web && bun run build

# API only
bun --filter @wellness-link/api dev    # Port 5300
cd packages/api && bun run db:seed
cd packages/api && bun run db:migrate
```

## Service Pattern (API)

When creating new services:

```typescript
// 1. Repository: src/services/repository/feature.ts
export class FeatureRepository {
  async findOne(ctx: RequestContext, id: string) {
    return db.query.feature.findFirst({
      where: and(eq(feature.id, id), eq(feature.userId, ctx.userId)),
    });
  }
}

// 2. Service: src/services/business/feature.ts
export class FeatureService {
  constructor(private repo: FeatureRepository) {}
  async getOne(ctx: RequestContext, id: string) {
    const item = await this.repo.findOne(ctx, id);
    if (!item) throw new NotFoundException("Not found");
    return item;
  }
}

// 3. REGISTER in plugins/services.ts (CRITICAL)
export const servicesPlugin = new Elysia({ name: "services" }).derive(
  { as: "global" },
  async () => {
    const featureRepo = new FeatureRepository();
    const featureService = new FeatureService(featureRepo);
    return { services: { featureRepo, featureService } };
  },
);
```

## Frontend Pattern (Web)

```typescript
// Forms with React Hook Form + Zod
const schema = z.object({
  name: z.string().min(2, { message: "Mínimo 2 caracteres." })
})

// Data fetching with TanStack Query
const { data, isLoading } = useQuery({
  queryKey: ["profiles"],
  queryFn: async () => {
    const { data, error } = await api.api.profiles.get()
    if (error) throw error
    return data
  },
})

// Classes with cn()
<div className={cn("flex", className, isActive && "bg-primary")} />
```

## Type Sharing

```typescript
// API exports App type
// packages/api/src/index.ts
export type App = typeof app;

// Web imports and uses it
// packages/web/src/lib/api.ts
import type { App } from "@mediapp/api";
export const api = edenTreaty<App>("http://localhost:5300");
```

## When to Use This Agent

- Implementing features that span both web and api
- Cross-package refactoring
- New API endpoints with frontend integration
- Working with shared types across packages
- Monorepo-wide questions
- Database schema changes
- Authentication flows
- File uploads
- Complete feature development

## Available Sub-Agents

- **web** (`.claude/agent/web.md`): React 19 + Tailwind v4 specialist
- **api** (`.claude/agent/api.md`): Bun + Elysia + Drizzle specialist

For frontend-only or backend-only tasks, delegate to the appropriate sub-agent while this main agent maintains overall context.
