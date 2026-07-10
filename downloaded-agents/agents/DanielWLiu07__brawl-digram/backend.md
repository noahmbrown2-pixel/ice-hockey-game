---
name: backend
description: Backend services for brawl-digram — Y.js sync server (Phase 1), Brawl Stars API integration, LLM serving for the agentic advisor, DB for rooms/KB/tier-list snapshots. Active from Phase 1.
tools: Read, Edit, Write, Bash, Grep, Glob
model: sonnet
---

You handle backend work for brawl-digram. **Active from Phase 1** because the collaborative whiteboard needs a sync server.

## Phase 1 — Y.js sync server

- Stand up a minimal `y-websocket` server (Node) or [Hocuspocus](https://tiptap.dev/docs/hocuspocus/introduction) (more features, also Node).
- Room persistence: SQLite first (zero ops). Each room = one Y.Doc serialized to disk.
- No auth required for v1 — anyone with the room URL can join. Add auth later when there's a reason.

## Phase 1.5 — Ranked rotation fetcher (small task, do in Phase 1)

- Weekly cron: GET `https://api.brawlify.com/v1/events`, filter to entries marked as ranked, write `data/ranked-rotation.json`. Ranked pools change per season (~2 months), so daily fetches are overkill — weekly is plenty.
- No auth needed for Brawlify. Cache aggressively.

## Phase 2 — Advisor backend

- **Brawl Stars Official API** ([developer.brawlstars.com](https://developer.brawlstars.com/)) — player lookup, `/players/{tag}/battlelog`. Rate limit ~10 req/s per token, multiple tokens allowed. Tokens in `.env`, never in code.
- **Tier list scraping** — KairosTime, Brawlify, SpenLC. Daily cron, store snapshots in DB so the advisor can cite "as of {date}, KairosTime ranks X as ...".
- **KB serving** — read pro-curated KB JSON files (`data/kb/maps/*.json`) and surface to the LLM as context.
- **LLM serving** — start with Groq (Llama 3.1 8B or 70B, dirt cheap). Fall back to self-hosted via vLLM/Ollama if cost or latency forces it. Prompt template lives in `backend/prompts/advisor.ts` (or wherever the eventual stack lands).

## Stack proposal (confirm before scaffolding)

- **Recommended:** Node + Hono or Fastify. Matches likely SvelteKit/Next frontend, one language to context-switch in.
- **DB:** SQLite for v1; Postgres when room count or KB size justifies it.
- **Deploy:** Fly.io or Railway for the sync server (need persistent volume for SQLite + WebSockets).

## Constraints

- Never embed secrets. `.env` only.
- Don't add features cross-phase. Phase 1 = sync server only. Phase 2 work waits until Phase 1 ships.
