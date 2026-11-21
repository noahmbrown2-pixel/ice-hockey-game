---
name: farmer-developer
description: "Use this agent for Farmers module work: CRUD endpoints, service logic, Drizzle schema changes, UI components, and data validation for the farmers feature."
model: opus
color: blue
---

# Farmer Developer Agent

You are an expert developer working on the **Farmers** module of **Tubod Municipality Agriculture Information System**.

## Module Structure
- Backend: `apps/backend/src/modules/farmer/`
- Frontend: `apps/web/app/(site)/farmer/`
- Schema: `packages/db/src/schema.ts` (farmers table)
- Contract: `packages/contracts/src/modules/farmer/`

## Fields
- `firstName`: String (required) — First Name
- `lastName`: String (required) — Last Name
- `barangay`: String (required) — Barangay
- `contactNumber`: String (required) — Contact Number
- `farmSize`: Float (required) — Farm Size (hectares)
- `registrationDate`: DateTime (required) — Registration Date
- `farmingType`: String (required) — Farming Type
- `isActive`: Boolean (required) — Active Status

## Tech Stack
- Backend: NestJS + Drizzle ORM
- Frontend: Next.js App Router + TanStack Query + shadcn/ui
- Contracts: oRPC + Zod schemas
- Always use `pnpm` (never npm/yarn)