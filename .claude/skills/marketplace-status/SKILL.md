---
name: marketplace-status
description: One-command read-only status of BlindOracle in the agent economy — where it's listed (live vs stale), where to buy it, the canonical SKU count (with grain hierarchy), and discovery/trust-layer pointers. Use whenever the operator asks "where is BO listed?", "where can people buy BO?", "how many SKUs do we have?", or wants a marketplace presence health check.
allowed-tools: Read, Bash, Grep, Glob
version: 1.0.0
---

# /marketplace-status

**Role:** You are the marketplace-status reporter — you run the read-only checks below and emit ONE structured status report covering the three pillars (external listings, discovery/SDK/trust, SKU catalog). You report only; you do not edit listings, mutate the registry, submit to platforms, or send anything. End by printing the report and stopping.

This skill consolidates a previously-fragmented picture (NEAR + agentic.market + MCP directories + Moltbook + the SKU catalog) into one command. It also pins the **canonical SKU count** so the recurring 14/15/16 drift stops.

## Output shape

Emit a report with exactly these four sections, in order:

1. **Where to buy BO** — live external sell channels + their state
2. **Listing health** — which directory listings are live / stale / not-indexed / draft
3. **Canonical SKU count** — the number to cite, with the grain hierarchy + any mismatches
4. **Discovery / trust layer** — the pointers buyers and agents use

---

## Section 1 — Where to buy BO (external sell channels)

Known live SELL channels (verify each before claiming "live"):

| Channel | What | Verify |
|---|---|---|
| **market.near.ai** | BlindOracle listing — first external sell channel (handle `blindoracle`, "Unchallengeable AI Agent Security Audit" 49 USDC) | check listing memory `near_market_blindoracle_listing_live.md` |
| **agentic.market** | x402 buyer/seller; needs `x402Version:2` + endpoint (now satisfied) | `scripts/agentic_market_buy.py`; indexing prereq met |
| **x402 endpoint** | `https://api.craigmbrown.com/v1/reputation/blindoracle` | `curl -s --max-time 6 -A "Mozilla/5.0" <url>` (Cloudflare 403s default UA) |
| **Moltbook** | Daily posting via submolt API (NOT `/u/` surface) | posting daily per memory |

```bash
# MCP-directory listings tracker (5 platforms; mostly draft) — entries live under the "platforms" key
python3 -c "import json; d=json.load(open('configs/marketplace_listings.json')); rows=d['platforms'] if isinstance(d,dict) else d; \
rows=list(rows.values()) if isinstance(rows,dict) else rows; \
print('\n'.join(f\"  {(x.get('platform') or x.get('name') or '?'):28} | {str(x.get('status')):8} | {x.get('listing_url') or x.get('url','')}\" for x in rows))"
```

## Section 2 — Listing health

```bash
# RQ-152 monitor — verifies live listing URLs resolve (read-only)
python3 scripts/marketplace_listing_monitor.py --once --dry-run
```

Known state (confirm, don't assume — these drift):
- **STALE** (description from the abandoned 0★ `blindoracle-docs` repo): **Smithery, mcp.so, PulseMCP** → need repoint to current repo.
- **NOT INDEXED**: **Glama** (was reportedly fixed 2026-05-25 — re-verify).
- **DRAFT**: the 5 platforms in `configs/marketplace_listings.json` (AI Agent Store, AI Agents Directory, Metaschool, mcp.so, Claude Code Plugin Marketplace).
- **EMPTY tracker**: `data/proof_marketplace_listings.json` is 0 bytes — don't rely on it.

## Section 3 — Canonical SKU count  ⭐ (the anti-drift section)

**Cite 15.** The buyer-facing SKU catalog is **15** — source of truth = `agent-services.json` `service_count`. Do NOT cite 16 (stale), 41, or 61 (wrong grain).

Grain hierarchy (run to refresh):

```bash
# (a) curated buyer catalog — THE canonical SKU count
python3 -c "import json; d=json.load(open('craigmbrown-website/public/api/agent-services.json')); print('CANONICAL buyer SKUs:', d['service_count'], '(schema', d.get('schema_version'), ')')"

# (b) full registry grain (NOT SKUs — includes private/restricted/test/demo/dupes)
python3 -c "import json; c=json.load(open('chainlink-prediction-markets-mcp-enhanced/data/capability_registry.json'))['capabilities']; c=c if isinstance(c,list) else list(c.values()); \
from collections import Counter; print('registry total:', len(c), '| visibility:', dict(Counter(str(x.get('marketplace_visibility')).lower() for x in c)))"

# (c) integrity check — catalog SKUs that are NOT public in the registry (should be empty)
python3 -c "import json; cat=[s['id'] for s in json.load(open('craigmbrown-website/public/api/agent-services.json'))['services']]; \
caps=json.load(open('chainlink-prediction-markets-mcp-enhanced/data/capability_registry.json'))['capabilities']; caps=caps if isinstance(caps,list) else list(caps.values()); \
pub={x['capability_id'] for x in caps if str(x.get('marketplace_visibility')).lower()=='public'}; \
print('VISIBILITY MISMATCH (catalog-public but registry-not-public):', [c for c in cat if c not in pub] or 'none')"
```

| Grain | Count (2026-05-26) | Meaning | Cite as SKUs? |
|---|---|---|---|
| Whole fleet | 61 | every registered capability | ❌ |
| Registry `public` | 41 | polluted with test/demo/`sales.`/`startup.` dupes | ❌ |
| **Buyer catalog** | **15** | curated, priced, customer-facing | ✅ |
| Wired-to-execute | ~14 | actually runs in `job_executor.py` | internal |

**Known mismatch to surface:** `procurement.renewal-watchdog` + `procurement.crypto-ap` are public in the catalog but restricted/private in the registry. Report it; do not silently fix it.

Cross-check a claimed count with the `/verify-count` skill before putting it in any outbound artifact.

## Section 4 — Discovery / trust layer (the mature pillar)

```bash
python3 -c "import json; d=json.load(open('craigmbrown-website/public/api/agent-services.json')); \
print('discovery:', json.dumps(d.get('discovery'),indent=1)); print('trust proof_kinds:', d.get('trust_layer',{}).get('proof_kinds')); \
print('payment protocols:', d.get('payment',{}).get('protocols'))"
```

Pointers: `/.well-known/agent-services.json`, `/api/a2a/`, `mcp/server-card.json`, `agent-trust-leaderboard.json`; ERC-8004 passports + ProofOfDelegation (30014) + `agent-audit-for-owner` → ProofOfAuditReport (30105); SDK `blindoracle-marketplace-client` v0.2.0 (public).

## Termination

After printing the four sections, STOP. Do not propose or execute edits unless the operator explicitly asks. If a count is being put into an outbound artifact, hand off to `/verify-count`.

## Related
- `/gtm-audit` — broader GTM staged-vs-shipped audit (this skill is the marketplace-presence slice)
- `/verify-count`, `/canonical-count` — count integrity (Section 3 defers to these for outbound claims)
- `scripts/marketplace_listing_monitor.py` (RQ-152) — the underlying listing verifier
