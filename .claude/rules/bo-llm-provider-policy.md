# BlindOracle LLM Provider Policy

**Adopted 2026-05-25 (operator directive).** Applies to ALL BlindOracle (BO)
production / customer-facing operations — anything that fulfils an external
request or runs as part of the paid marketplace.

## The rule

1. **Per-SKU provider chain** (cost-matched):
   - **Cheap/fast SKUs lead with GROQ** (`groq → anthropic(haiku) → gemini`) — cheapest.
   - **Analytical/paid SKUs lead with the Anthropic paid API** (`anthropic(sonnet) → openai → gemini → grok`).
   - Env: `BO_LLM_CHEAP_CHAIN`, `BO_LLM_PAID_CHAIN`.
2. **Anthropic = the paid API key** (`ANTHROPIC_API_KEY`, `sk-ant-…`), never Opus by default.
3. **NEVER the Max-plan subscription** (`claude` CLI / OAuth). A personal Max plan
   must not fulfil paid external-customer work (cost attribution + Anthropic ToS).
4. **BO controls wrap EVERY provider** (the value a raw third-party API can't give):
   - **Input** content-trap scan on the buyer's task (CaMel L1 / RQ-173) before dispatch.
   - **Output** content-trap scan on each model's response in `llm_router`; a flagged
     output is rejected and the chain falls through to the next provider.
   - **Trust envelope** on every deliverable: `content_sha256`, `content_scanned`,
     `scanner`, `powered_by:BlindOracle` — so a non-Claude result still carries BO's
     integrity + provenance stamp.
   - tier gate (public only), circuit breaker, daily spend cap also apply.

This refines two existing memories:
- `feedback_anthropic_key_bo_only` — the `sk-ant-…` key is reserved for BO. This
  policy is the sanctioned BO use of it.
- `feedback_use_opus_not_api` ("Opus via Max, not API") — applies to **internal /
  dev** work only. It does **NOT** apply to BO production, which is API-only.

## Reference implementation (use this, don't hand-roll)

`chainlink-prediction-markets-mcp-enhanced/services/marketplace/llm_router.py`
```python
from services.marketplace import llm_router
ok, output, provider = llm_router.call(prompt, timeout=120)
# provider e.g. "anthropic-api:claude-opus-4-7" or a non-Claude fallback name
```
- Reads keys from the root `.env` **file** directly (the x402 gateway strips
  `ANTHROPIC_API_KEY` from its env via `no-anthropic.conf` so its own logic stays
  credential-free; the router re-supplies the key only for sanctioned LLM calls).
- Env overrides: `BO_LLM_ANTHROPIC_MODEL` (default `claude-opus-4-7`),
  `BO_LLM_FALLBACKS` (default `openai,gemini,grok,groq,venice`),
  `BO_LLM_<PROVIDER>_MODEL`, `BO_LLM_MAX_TOKENS`.

## Where it's wired

- ✅ A2A SKU executor (`services/marketplace/job_executor.py::_run_llm`) — the 10
  LLM-backed marketplace SKUs now route through `llm_router`. The 4 deterministic
  SKUs make no LLM call.

## Migration backlog (BO code still on Max / `claude -p` — convert to llm_router)

Any BO production script that shells `claude -p`, `claude --print`, or relies on
Max-plan OAuth must migrate to `llm_router.call()`. Audit with:
```bash
grep -rlE "claude -p|claude --print|env.pop\(.ANTHROPIC_API_KEY" \
  chainlink-prediction-markets-mcp-enhanced/ scripts/ | grep -iv test
```
Internal-only tooling (dev, non-customer-facing) may keep using Max.

## Model tiering — do NOT default to Opus

Opus 4.7 is overkill (and priciest) for these tasks; on a $0.02 SKU its API cost
can exceed the sale price. **Default is per-SKU, off Opus:**

| Tier | Model | SKUs |
|---|---|---|
| Fast/cheap | `claude-haiku-4-5-20251001` | news-scanner, sentiment, crypto-market, youtube ($0.02–$0.03) |
| Analytical/decision | `claude-sonnet-4-6` | deep-research, invest-plays, due-diligence, deliberation, council, vendor-vetting |
| Premium | (opt-in only) | none by default — set via env if a SKU needs it |

Map lives in `job_executor.py::_SKU_MODELS`; resolved by `_sku_model(cid)`.
Overrides: `BO_LLM_DEFAULT_MODEL`, `BO_LLM_SKU_<capability_id_underscored>`
(e.g. `BO_LLM_SKU_procurement_vendor_vetting=claude-opus-4-7`), or
`BO_LLM_ANTHROPIC_MODEL` for a global default. Both Haiku 4.5 + Sonnet 4.6
validated live via the API.

## Cost note

API billing is real per-call now (not Max flat-rate). The executor keeps a
daily spend cap (`A2A_LLM_DAILY_USD_CAP`, default $5) + per-call estimate
(`A2A_LLM_COST_PER_CALL`). Cheaper fallbacks (Groq, Gemini Flash) can also lead
the chain via `BO_LLM_FALLBACKS` if you want to minimize Claude spend entirely.

## Coding Guidelines
See `.claude/rules/karpathy-coding-guidelines.md` for general coding behavior (think before coding, simplicity first, surgical changes, goal-driven execution).
