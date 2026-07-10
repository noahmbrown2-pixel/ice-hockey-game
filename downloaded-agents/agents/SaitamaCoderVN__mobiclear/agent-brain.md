---
name: agent-brain
description: AI Agent pipeline — context engine, intent detection, prompt engine, action planner, Telegram adapter, services, security
isolation: worktree
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

You are building the AI Agent Core — this is THE PRODUCT being sold to Tasco. Read CLAUDE.md at the project root first.

## Scope

**YOU OWN** (create + modify):
- `backend/app/agent/` — entire directory
- `backend/app/adapters/` — entire directory
- `backend/app/services/` — entire directory
- `backend/app/security/` — entire directory

**IMPORT ONLY** (do not modify):
- `backend/app/models/` — import User, Booking, WashStation, etc.
- `backend/app/config.py` — import settings
- `backend/app/database.py` — import get_session

**DO NOT TOUCH**: `backend/app/main.py`, `backend/app/api/`, `frontend/`, `data/`

## Tasks

### 1. Vietnamese Preprocessor (`agent/vietnamese_preprocessor.py`)
- Slang/abbreviation map (50+ entries): "bn tien"→"bao nhiêu tiền", "dc ko"→"được không", "ok dat di"→"ok đặt đi", "mai 3h"→"ngày mai 3 giờ", "k"→"không", "r"→"rồi", etc.
- Normalize text before sending to intent detector
- Handle no-diacritics Vietnamese

### 2. Context Engine (`agent/context_engine.py`)
- `async build_context(user_id, message=None)` → ContextObject
- Merges: user profile + last 5 VETC events + last wash date + conversation history + weather at user's last known location + nearby stations (within 5km of last VETC event)
- ContextObject is a Pydantic model with all fields typed

### 3. Intent Detector (`agent/intent_detector.py`)
- Uses OpenAI function calling (tools) for structured classification
- Intents: `booking`, `pricing`, `complaint`, `status_check`, `chitchat`, `cancel`, `reschedule`, `loyalty`, `proactive_outreach`
- Returns: `IntentResult(intent: str, confidence: float, entities: dict)`
- Entities extracted: station_name, time, service_type, etc.

### 4. Prompt Engine (`agent/prompt_engine.py`)
- Template registry: maps intent → template class
- Each template receives context + intent → returns formatted OpenAI messages list
- ALL templates must apply Vietnamese Personalization Rules from CLAUDE.md
- Templates in `agent/templates/`:
  - `proactive_booking.py` — for VETC-triggered outreach (MOST IMPORTANT for demo)
  - `customer_service.py` — general Q&A
  - `pricing.py` — price inquiries with savings framing
  - `booking_flow.py` — guided booking conversation

### 5. Action Planner (`agent/action_planner.py`)
- Parse OpenAI response (text + tool_calls)
- Map to concrete actions:
  - `send_message(channel, user_id, text, buttons)` → calls messaging adapter
  - `create_booking(user_id, station_id, time, service)` → calls booking adapter
  - `search_stations(lat, lng, radius)` → returns nearby available stations
  - `escalate(user_id, reason)` → flag for human agent
- Returns list of `ActionResult` objects

### 6. Agent Orchestrator (`agent/core.py`)
```python
class AgentCore:
    async def process_message(self, channel: str, user_id: str, message: str) -> AgentResponse:
        """Full pipeline: preprocess → context → intent → prompt → LLM → action"""

    async def handle_vetc_event(self, event: VETCEvent) -> AgentResponse:
        """Proactive trigger: check proximity + conditions → maybe send message"""

    async def handle_weather_trigger(self, area_lat: float, area_lng: float) -> list[AgentResponse]:
        """Batch: find all users near area after rain stops → send personalized messages"""
```

### 7. Adapters
- `adapters/base_messaging.py` — Abstract base class with `send_text()`, `send_buttons()`, `send_image()`
- `adapters/telegram_adapter.py` — Implements base using python-telegram-bot: send messages, inline keyboards, photos
- `adapters/zalo_adapter.py` — STUB: implements base interface with `raise NotImplementedError("Zalo OA deferred")`. This ensures the adapter interface exists for future plug-in.
- `adapters/booking_adapter.py` — Create/cancel/reschedule bookings in DB
- `adapters/weather_adapter.py` — OpenWeatherMap API: get current weather by lat/lng

### 8. Services
- `services/vetc_service.py` — Process VETC event: find nearby stations, calculate ETA, check if user should be notified
- `services/feature_store.py` — In-memory cache (Python dict + TTL) for demo. Compute features from Supabase queries: days_since_wash, travel_frequency, segment. Upgrade to Upstash Redis for production.
- `services/search_service.py` — Exa API: semantic search for knowledge base (FAQ, services, policies)

### 9. Security
- `security/audit_logger.py` — Log all AI decisions to Supabase table `audit_logs` (input, output, confidence, actions, latency)
- `security/rate_limiter.py` — In-memory counter (dict with TTL) for demo: max 3 proactive/user/day, 1/user/hour, respect quiet hours 21-07. Upgrade to Upstash Redis for production.
- `security/consent_manager.py` — Check/update user `consent_proactive` field in Supabase

## OpenAI Usage

- Default: `gpt-4o-mini` (cheap, fast, good enough for 90% of cases)
- Upgrade to `gpt-4o` for: complex complaints, ambiguous intents with confidence < 0.7, fleet management
- Embeddings: `text-embedding-3-small` (1536 dim) for Exa search queries
- Temperature: 0.7 for conversational, 0.3 for decision-making
- Always use `tools` parameter for structured action extraction

## Verification

```python
# Test the pipeline standalone
from app.agent.core import AgentCore
agent = AgentCore()

# Test 1: Vietnamese informal message
result = await agent.process_message("telegram", "user123", "bn tien rua xe")
assert result.intent == "pricing"
assert "đ" in result.response_text  # contains price in VND

# Test 2: Proactive trigger
from app.models.vetc_event import VETCEvent
event = VETCEvent(vetc_id="VETC-001", location_lat=10.789, location_lng=106.721, ...)
result = await agent.handle_vetc_event(event)
assert result.action_type in ["send_message", "no_action"]
```

When done: commit, push, create PR targeting main.
