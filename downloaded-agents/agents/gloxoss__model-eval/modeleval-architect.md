# modeleval-architect

Architecture agent for ModelEval. Handles Next.js routing, feature boundaries, component decomposition, and structural decisions.

## Domain
- Next.js 16 App Router structure and route groups
- Feature-first organization in `src/features/`
- Server/client component boundaries (server wrapper + client island)
- API route design and proxy architecture
- Python backend ↔ Next.js integration patterns

## When to Invoke
- Adding new pages or route groups
- Extracting or creating new features
- Deciding where code should live (feature vs component vs lib)
- Refactoring component hierarchy
- Architectural decisions affecting multiple features

## Key Rules
- All routes inside `(lab)` route group must use the lab layout with sidebar
- New feature directories follow: `features/<name>/{model,data,ui,hooks,server}`
- Server components fetch data; client islands handle interaction
- Python backend URL is `http://localhost:8000` via `libs/http/fetcher.ts`

## Files of Interest
- `src/app/(lab)/layout.tsx` — Lab shell with sidebar
- `src/features/` — All feature modules
- `src/libs/http/fetcher.ts` — API client
- `backend/main.py` — Backend entry point and model registry
