# HDI Agent Communication Protocol

**Updated:** 2026-03-26
**Owner:** Huck (Build Agent)

---

## The Roster

| Name | Role | Domain |
|---|---|---|
| **Huck** | Chief of Staff + Build Agent | Chase's primary contact. Routes work to other agents, manages coordination, builds infrastructure. |
| **Delta Dawn** | Big Muddy Ecosystem | Inn, magazine, radio, records, hospitality ops |
| **Ledger** | Data & Metrics | Database, census, enrichment, pricing, analytics |
| **Chuck** | Road Manager | Touring, venues, logistics, fleet, event scheduling |
| **Rook** | Strategy | Chase-only, HDI holding company, valuations, investors |

---

## How to Reach Chase (Google Chat)

All agents can post to the HDI Agent Desk space. Chase sees these on his phone immediately.

### Quick Method (curl)

Replace YOUR_AGENT_NAME, YOUR_SUBTITLE, TITLE, and MESSAGE:

```bash
curl -s -X POST 'WEBHOOK_URL' \
  -H 'Content-Type: application/json' \
  -d '{
    "cardsV2": [{
      "cardId": "msg-ID",
      "card": {
        "header": { "title": "TITLE", "subtitle": "YOUR_AGENT_NAME — YOUR_SUBTITLE" },
        "sections": [{ "widgets": [{ "textParagraph": { "text": "MESSAGE" } }] }]
      }
    }]
  }'
```

### Agent Webhook URLs

| Agent | Webhook URL |
|---|---|
| **Huck** | `https://chat.googleapis.com/v1/spaces/AAQAjYLEHY4/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=8IoIdNWfVIHR-Uv6gpeSRhUon7dQ_tLH72G5v2EDPQk` |
| **Chuck** | `https://chat.googleapis.com/v1/spaces/AAQAjYLEHY4/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=FmMhXbLSHy7LEjbafe1AGoq9WOh9WJfTyVMYxeM9a4M` |
| **Delta Dawn** | `https://chat.googleapis.com/v1/spaces/AAQAjYLEHY4/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=avgR2zrqaaHDkJCwjTUd5FFOYvHioBEILCoZKjLOK3Y` |
| **Ledger** | `https://chat.googleapis.com/v1/spaces/AAQAjYLEHY4/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=C0vVioRl4fRCrHwX2xVP5DmVRoWzkQgvHO23QUMHHjQ` |

Use YOUR agent's webhook URL so the card shows up with your name in Google Chat.

### Code Method (if you have access to the codebase)

```typescript
import { gchat, askChase, escalate } from '@/lib/gchat';

// Send a card as your agent
await gchat({ agent: 'ledger', title: 'Census sync complete', message: '14 counties synced. 2 had stale data.' });

// Ask Chase a question (creates a thread)
await askChase('ledger', 'Should I re-enrich all 19 Natchez businesses or just the ones missing phone numbers?');

// Escalation (high = red dot, medium = yellow, low = green)
await escalate('ledger', 'Enrichment queue stuck — Google Places API returning 403', 'high');
```

---

## When to Message Chase

**DO message Chase when:**
- You need a decision that blocks your work
- You completed a major milestone
- Something failed that affects the demo or production
- You discovered data worth routing (per DATA_HANDOFF_PROMPT.md)

**DON'T message Chase when:**
- You have a question another agent can answer
- You're making routine progress (just keep working)
- You want to confirm something you can verify yourself

**Batch your questions.** If you have 3 things to ask, send ONE card with all 3, not 3 separate cards.

---

## How to Talk to Other Agents

Agents can't message each other directly in real-time. Instead:

1. **Write a handoff file** in `.claude/agents/` using the naming convention: `{FROM}_TO_{TO}_HANDOFF.md` (e.g., `LEDGER_TO_HUCK_HANDOFF.md`)
2. **Tell Chase** via Google Chat: "I wrote a handoff for Huck at .claude/agents/LEDGER_TO_HUCK_HANDOFF.md"
3. Chase pastes the instruction into the target agent's conversation

---

## How to Receive Messages FROM Chase

Chase's replies in Google Chat are stored in a Cloudflare D1 message queue. Agents can poll for pending messages:

```
GET /api/gchat/pending?agent=ledger
```

Returns pending messages addressed to you. After reading them, respond via:

```
POST /api/gchat/reply
{ "messageId": 1, "agent": "ledger", "text": "Done — all 14 counties synced." }
```

This posts your reply back into the Google Chat thread so Chase sees it on his phone.

**Note:** The bidirectional bot is registered but requires the app to be deployed for the receive endpoint to work. Until deployed, agents receive instructions via conversation (Chase pastes them).

---

## Data Routing (All Agents)

If you discover structured data about businesses, metrics, or content — don't hold it. Route it per `.claude/agents/DATA_HANDOFF_PROMPT.md`:

| Data Type | Destination |
|---|---|
| New business | `POST /api/directory/submit` |
| Metric/number | `POST /api/metrics` |
| Content for search | `POST /api/embeddings/index` |
| Can't route it | Write JSON to `/packages/database/staging/` |

---

## Rules

1. **Use your own name.** When posting to Google Chat, use your agent's webhook URL so Chase knows who's talking.
2. **Don't impersonate other agents.**
3. **Don't spam.** One card per topic. Batch related questions.
4. **Don't claim you deployed something unless you verified it.** (This means you, AG.)
5. **Route data, don't hoard it.** If you learn a number, a business name, or a fact — send it to the database.
