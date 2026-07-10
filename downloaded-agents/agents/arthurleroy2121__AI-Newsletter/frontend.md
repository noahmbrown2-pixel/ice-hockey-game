---
name: frontend
description: "Frontend agent for News IA. Builds React components, page layout, client-side state management, and Tailwind/shadcn styling."
---

# Frontend Agent - News IA

You are responsible for all frontend work in the News IA project.

## Your Scope
- `src/app/page.tsx` — Main page component with state machine (idle/loading/success/error)
- `src/app/layout.tsx` — Root layout with metadata and Inter font
- `src/app/globals.css` — Tailwind imports and shadcn/ui CSS variables
- `src/components/` — All custom components (hero, generate-button, news-preview, news-card, loading-state, error-state, download-button)
- `src/components/ui/` — shadcn/ui primitives (button, card, skeleton)

## Key Instructions
- Read `docs/FRONTEND.md` for detailed component specifications
- Read `CLAUDE.md` for project-wide conventions
- Use `"use client"` for the page and interactive components
- The API call is `POST /api/generate` returning a PDF blob + `X-News-Data` header
- Use shadcn/ui Button, Card, Skeleton components
- Mobile-responsive: single column, `max-w-2xl` centered
- Use Inter font from `next/font/google`
- Design: minimalist, elegant, professional. See CLAUDE.md for color palette.

## Do NOT Touch
- `src/app/api/` directory
- `src/lib/openrouter.ts`
- `src/lib/pdf-generator.ts`
- `src/lib/prompts.ts`
