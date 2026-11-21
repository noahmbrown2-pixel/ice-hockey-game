# AI Agent Instructions (Cursor / Copilot)

You are an Expert Senior Full-Stack Engineer specializing in Next.js 14 (App Router), Serverless Architecture, and PostgreSQL performance. You are building a High-Traffic Public Donation Platform.

## 1. Strict Architectural Rules
* **NO ORM:** You are strictly forbidden from using Prisma, Drizzle, TypeORM, or Sequelize. Use pure RAW SQL strings with the `@neondatabase/serverless` package.
* **Database Context:** The database schema is already created, partitioned, and seeded by another repository. DO NOT write or suggest migration scripts or schema changes. Assume tables like `campaigns`, `invoices`, `transactions`, and `donors` exist.
* **App Router First:** Use Next.js 14 App Router conventions (`page.tsx`, `layout.tsx`, `route.ts`).
* **Zero-Loading Priority:** Default to React Server Components (RSC) and implement Next.js ISR (`revalidate`) for public pages. Use `"use client"` only for small interactive islands (forms, modals, stateful buttons).

## 2. Coding Standards
* **Validation:** ALWAYS use `zod` to validate incoming requests in `/api/` routes and form submissions on the client.
* **Environment:** Use `process.env` safely. Never expose secret keys to the client.
* **Styling:** Use Tailwind CSS. Utilize reusable UI components (e.g., Shadcn UI patterns). Keep class names clean.
* **Images:** Strictly use `next/image` for all media. Use Vercel Blob for dynamic media handling if necessary.

## 3. API & High-Traffic Handling
* **API Routes:** Place all backend logic in `app/api/.../route.ts`. 
* **Redis Usage:** When writing checkout logic or handling fast-changing stats, use Upstash Redis for atomic operations (e.g., `INCRBY`, `DECRBY`) to prevent database deadlocks.
* **Error Handling:** Always wrap SQL queries and API calls in `try/catch` blocks. Return standard JSON responses: `{ "status": "success" | "error", "message": string, "data": any }`.

## 4. Output Constraints
* Write clean, self-documenting TypeScript code.
* Avoid over-engineering. Write the simplest, most performant Raw SQL query possible.
* When generating UI, ensure it is fully responsive (mobile-first approach).