# AI Agent Trap Defense Enforcement (RQ-173 + RQ-248)

## Mandate
ALL external-facing agents MUST route ingested web content through CaMel **two-layer** content trap scanning:

| Layer | Script | Method | Catches |
|---|---|---|---|
| **L1 — Regex** | `scripts/content_trap_scanner.py` | Pattern matching (<100ms) | Known direct patterns: "ignore previous instructions", system-tag spoofing, shell injection, CSS hidden text, zero-width chars |
| **L2 — LLM** | `scripts/tool_output_classifier.py` | Haiku classifier (~200ms) | Paraphrased injections, novel multi-step attacks, role-hijack framing, fake safety tests, indirect exfiltration |

L2 starts in **enrich mode** (logs but never blocks); promotes to `warn` → `block` per `.claude/rules/override_governance.md` (≥5 catches + 0 FP + dwell time). L1 is always-block for known patterns.

No opt-out without explicit security exemption documented in the agent's manifest.

## What "External-Facing" Means
Any agent that:
- Fetches web content (WebFetch, WebSearch, browse, firecrawl)
- Processes user-provided URLs or documents
- Ingests content from external APIs (RSS, social media, email attachments)
- Operates in the BlindOracle marketplace receiving external agent inputs
- Accepts delegated tasks from agents outside the TheBaby fleet

## Required Integration Points

### For Web-Fetching Agents
Content trap scanning is enforced automatically via `pre_tool_use.py` hook on WebFetch/WebSearch tool calls. Agents do NOT need to call the scanner manually — the hook does it.

### For Marketplace Agents (BlindOracle)
Import and call `security_guards.validate_agent_input()` which includes trap scanning:
```python
from chainlink_prediction_markets_mcp_enhanced.core.security_guards import validate_agent_input
result = validate_agent_input(agent_name, input_data)
if not result["valid"]:
    # Reject or quarantine
```

### For MCP Server Inputs
MCP servers that accept external data MUST validate through the content trap scanner before processing:
```python
from scripts.content_trap_scanner import ContentTrapScanner
scanner = ContentTrapScanner()
scan = scanner.quick_scan(content)
if scan["recommendation"] == "block":
    raise SecurityError(f"Content trap detected: {scan['findings']}")
```

## Memory Write Protection
All writes to v5_memory knowledge stores are audited daily by `scripts/memory_forensics_auditor.py` (cron 04:00 UTC). Memory writes from external sources require provenance tracking via `capture_to_inbox()` — direct writes to knowledge dirs are already blocked by v5 rules.

## Exemptions
The following agent types are exempt from content trap scanning (internal-only, no external input):
- Calendar agents (SFA token only, no web content)
- Notification delivery agents (outbound only)
- CC-Monitor health check agents (read internal state only)

To request an exemption for a new agent, add it to this list with justification.

## Proof Requirements
- Content trap scan results are logged to `data/content_trap_scans.jsonl`
- Memory integrity audits produce `ProofOfMemoryIntegrity` (kind 30015) in ProofDB
- MASSAT audits now include trap defense assessment in ASI categories

## Key Files
- L1 scanner: `scripts/content_trap_scanner.py` (CaMel L1 regex sub-module, RQ-173)
- L2 classifier: `scripts/tool_output_classifier.py` (CaMel L2 LLM classifier, RQ-248)
- L2 scan log: `data/tool_output_scans.jsonl` (append-only, mirrors content_trap_scans.jsonl)
- L2 rule state: `data/tool_output_classifier_rule_state.json` (enrich→warn→block lifecycle)
- Auditor: `scripts/memory_forensics_auditor.py` (CaMel L4 integration)
- Guards: `chainlink-prediction-markets-mcp-enhanced/core/security_guards.py`
- Hook (L1, pre-tool): `.claude/hooks/pre_tool_use.py` (blocks before tool call)
- Hook (L2, post-tool): `.claude/hooks/post_tool_use.py` (classifies after tool returns)
- MASSAT: `scripts/mas_security_scanner.py` (trap categories added)

## Reference
Based on DeepMind "AI Agent Traps" framework (Franklin et al., 2026, SSRN #6372438).
Dashboard: `html-output/20260407-ai-agent-traps-defense-specification.html`
