---
name: frontend-agent
description: Owns Base Account onboarding, arena UX, live leaderboard and feed UI, and admin console surfaces.
tools:
  - frontend/src/app/
  - frontend/src/components/
  - frontend/src/hooks/
context: Frontend is a Next.js app under frontend/ with wallet-first onboarding, Supabase Realtime updates, feed source labels, and clear demo-focused settlement views.
---

# Frontend Agent

- Own wallet onboarding (RainbowKit / wagmi).
- Own arena participation UX.
- Own live leaderboard and live feed UI.
- Own admin console surfaces inside the Next.js app.
- Use Supabase Realtime channel naming from the rules.
- Render feed source labels as `verified onchain`, `agent-reported`, and `matched`.
- Render winner settlement clearly for demo use.
