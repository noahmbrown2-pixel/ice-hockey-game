# AGENTS.md — StockAdvisor Pro AI Integration

> AI capabilities, agent design, prompt engineering, LLM configuration, and failure handling.

---

## Table of Contents

1. [AI Overview](#1-ai-overview)
2. [Agent Architecture](#2-agent-architecture)
3. [The AI Advisor Agent](#3-the-ai-advisor-agent)
4. [Prompt Engineering](#4-prompt-engineering)
5. [Configuration](#5-configuration)
6. [Failure & Fallback Handling](#6-failure--fallback-handling)
7. [Extending the AI Layer](#7-extending-the-ai-layer)

---

## 1. AI Overview

StockAdvisor Pro integrates a **local, privacy-preserving Large Language Model (LLM)** via [Ollama](https://ollama.com) to generate contextual investment summaries. No data is sent to any external cloud AI service — the model runs entirely on the user's local machine.

The AI layer is implemented as a dedicated **Service module** (`services/ai_service.py`), fully decoupled from both the MVC Model and Controller layers.

---

## 2. Agent Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      AI AGENT PIPELINE                           │
│                                                                  │
│  ┌──────────────┐     ┌─────────────────┐     ┌─────────────┐  │
│  │ Stock Data   │────▶│  Prompt Builder  │────▶│ Ollama LLM  │  │
│  │ (dict input) │     │  _build_prompt() │     │ llama3 model│  │
│  └──────────────┘     └─────────────────┘     └──────┬──────┘  │
│                                                        │         │
│  ┌─────────────────────────────────────────────────── │ ──────┐ │
│  │  Response Processor                                 ▼       │ │
│  │  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐│ │
│  │  │  HTTP Error  │     │ Empty/Invalid│     │    Success   ││ │
│  │  │  Timeout     │     │  Response    │     │   Summary    ││ │
│  │  │  ConnError   │     │              │     │   (str)      ││ │
│  │  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘│ │
│  └─────────┼────────────────────┼────────────────────┼─────────┘ │
│            ▼                    ▼                     ▼           │
│     ┌─────────────────────────────────────────────────────────┐  │
│     │           Fallback Message (user-friendly string)        │  │
│     └─────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. The AI Advisor Agent

### Role

The **AI Advisor Agent** is a stateless, single-turn agent that:

1. **Perceives** the environment via a structured stock data dictionary (price, score, returns, etc.)
2. **Reasons** using the LLM (Llama 3) constrained by a carefully engineered prompt
3. **Acts** by returning a 2-sentence investment commentary string

This follows the **Perception → Reasoning → Action** loop found in classical agent architectures.

### Boundaries

| Capability | Status |
|---|---|
| Multi-turn conversation | ❌ Stateless — each request is independent |
| Tool use / web search | ❌ Grounded in provided data only |
| Memory across sessions | ❌ No persistent state |
| Real-time market awareness | ❌ Grounded in provided snapshot |
| Investment advice | ❌ Explicitly prohibited in prompt |
| Pattern recognition from data | ✅ Core capability |
| Contextual narrative generation | ✅ Core capability |

---

## 4. Prompt Engineering

### Prompt Design Goals

- **Grounded**: The model must base its response *exclusively* on the provided numerical data, preventing hallucination of prices or events.
- **Concise**: Capped at 60 words to keep the UI summary readable.
- **Disclaimer-free**: The LLM is explicitly instructed not to add "this is not financial advice" boilerplate (handled by the app-level footer instead).
- **Structured input**: Data is formatted as labelled key-value pairs for reliable LLM parsing.

### Prompt Template

```
You are an expert financial advisor. Based ONLY on the following
real-time market data, write a concise, 2-sentence investment summary
for {company_name} ({ticker}).

Current Price : ${price}
52-Week High  : ${week52_high}
52-Week Low   : ${week52_low}
1-Year Return : {year_change_pct}%
Day Change    : {change_pct}%
Algorithm Score: {score}/100
Signal        : {signal}

Keep your response under 60 words. Do not add disclaimers.
```

### Design Decisions

| Decision | Rationale |
|---|---|
| "Based ONLY on the following data" | Prevents fabrication of news events or external context |
| Labelled key-value format | More reliable than prose descriptions for LLM parsing |
| 60-word cap | Enforces UI-friendly brevity without truncation |
| Include `Algorithm Score` | Lets the LLM calibrate optimism/pessimism to match the rule-engine signal |
| Include both `Signal` and raw metrics | Gives the LLM context for *why* the score was assigned |

---

## 5. Configuration

All AI settings are controlled via environment variables, loaded from `.env`:

```ini
# Ollama server URL (default: local)
OLLAMA_BASE_URL=http://localhost:11434

# Model to use — must be pulled with `ollama pull <model>`
OLLAMA_MODEL=llama3

# Request timeout in seconds (keep low to not block page render)
OLLAMA_TIMEOUT=5
```

### Switching Models

To use a different model (e.g. `mistral`, `phi3`, `gemma3`):

```bash
ollama pull mistral
```

Then update `.env`:
```
OLLAMA_MODEL=mistral
```

No code changes required — the model name is read at runtime.

### Remote Ollama

To use a remote Ollama instance (e.g. on a GPU server):

```
OLLAMA_BASE_URL=http://192.168.1.100:11434
```

---

## 6. Failure & Fallback Handling

`generate_ai_summary()` handles each failure mode independently with a specific log level:

| Failure | Log level | User experience |
|---|---|---|
| `ConnectionError` (Ollama not running) | `INFO` | Fallback message shown |
| `Timeout` (slow GPU / large model) | `WARNING` | Fallback message shown |
| `HTTPError` (model not pulled, bad request) | `WARNING` | Fallback message shown |
| Empty response string | `WARNING` | Fallback message shown |
| Unexpected JSON structure | `WARNING` | Fallback message shown |

**Fallback message displayed to user:**
> "AI insights are currently unavailable. Start the local Ollama server and ensure the 'llama3' model is pulled to enable this feature."

### Why not cache AI summaries?

AI summaries intentionally bypass the stock data cache (which has a 5-minute TTL). Since LLM inference is slow (1–5 s), caching AI results is a natural next step — but doing so correctly requires a separate key-space and a longer TTL (e.g. 30 minutes). This is listed as a future enhancement.

---

## 7. Extending the AI Layer

The `services/` package is designed for extensibility. To add a new AI capability:

1. Create `services/news_service.py` (or similar)
2. Follow the same pattern: accept plain Python types, return plain Python types, handle all exceptions internally
3. Import and call from the relevant Controller
4. Document in this file

### Potential Future AI Agents

| Agent | Input | Output | Technology |
|---|---|---|---|
| **News Sentiment Agent** | Ticker + recent headlines | Sentiment score + summary | Ollama / Tavily |
| **Portfolio Optimiser** | List of stocks + weights | Optimal allocation | scipy + LLM explanation |
| **Price Alert Agent** | Ticker + target price | Email / push notification | Background scheduler |
| **Report Generator** | Full watchlist data | PDF investment report | Weasyprint + LLM prose |

---

## LLM Setup Reference

```bash
# 1. Install Ollama
#    macOS:   brew install ollama
#    Linux:   curl -fsSL https://ollama.com/install.sh | sh
#    Windows: download from https://ollama.com/download

# 2. Start the Ollama daemon
ollama serve

# 3. Pull the model (downloads ~4 GB for llama3)
ollama pull llama3

# 4. Verify the endpoint is live
curl http://localhost:11434/api/tags

# 5. Test a prompt manually
curl -s http://localhost:11434/api/generate \
  -d '{"model":"llama3","prompt":"Say hello.","stream":false}' \
  | python3 -m json.tool
```

---

*The AI layer is completely optional. The application runs fully without it.*
