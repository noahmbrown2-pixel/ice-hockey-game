# Agent Delegation Identity Rules

## How Delegation Works (RQ-132)
When any agent spawns a subagent via the Agent tool or Task tool, the `pre_tool_use.py` hook automatically:
1. Injects a `DELEGATION_CONTEXT` block into the subagent's prompt
2. Emits a `ProofOfDelegation` (kind 30014) to `data/delegation_proofs.json`
3. Signs the proof with HMAC-SHA256

## What Subagents Receive
Every subagent receives a `DELEGATION_CONTEXT` block in its prompt containing:
- `parent_session_id`: The session that spawned this agent
- `delegator_passport_hash`: SHA-256 hash linking to the parent's passport
- `delegation_timestamp`: When delegation occurred
- `delegation_kind`: 30014 (ProofOfDelegation)
- `delegation_canary`: RQ-249 canary token (CNRY-DELEGATION-…) — embedded for silent-leak detection

## Canary Token Embedding (RQ-249)

Each DELEGATION_CONTEXT block carries a unique canary token (`CNRY-DELEGATION-<ULID>-<HMAC8>`)
minted at injection time by `pre_tool_use.py::_mint_delegation_canary()`. The token is:

- Registered in `data/canary_registry.json` alongside the proof envelope
- Stored in the ProofOfDelegation record's `canary_token` field (envelope, NOT public summary)
- Watched by `scripts/canary_leak_monitor.py` and the pre-send hook for unexpected surfacing

If a canary ever appears in an outbound artifact (email, WhatsApp, PR body, HTML output, egress
proxy log), it proves an unauthorized read of the delegation context occurred. Agents MUST NOT:
- Copy DELEGATION_CONTEXT content verbatim into output
- Include the canary token in any response to a user or downstream system
- Strip the canary line (the regex-based monitor depends on the format)

Canaries are SAFE to log internally — they are public-by-design honeypots. The point is
detecting them, not hiding them. They become loud only when found in the wrong place.

## Rules for Agents

### When Spawning Subagents
- The delegation context is injected AUTOMATICALLY — agents do not need to do anything special
- Do NOT strip or modify DELEGATION_CONTEXT blocks from prompts
- Do NOT forge delegation contexts manually

### When Acting as a Subagent
- If you see a DELEGATION_CONTEXT block in your prompt, you are operating under delegated authority
- Honor the scope of delegation — do not exceed what the parent agent authorized
- Your actions are cryptographically linked to your parent's identity

### For BlindOracle Marketplace Agents
- External agents MUST have valid ERC-8004 passports to receive delegations
- Delegation proofs are required for billing attribution — "who pays when the subagent breaks things"
- Revoked agents cannot receive new delegations

### Proof Verification
- Delegation proofs are stored in `data/delegation_proofs.json` (append-only JSONL)
- Each proof contains: delegator, delegate, timestamp, signature, passport_hash
- Proofs can be verified against the ProofDB (15 proof kinds)

## Key Files
- Hook: `.claude/hooks/pre_tool_use.py` (delegation injection + proof emission + canary mint)
- Proofs: `data/delegation_proofs.json` (append-only JSONL log)
- Canary manager: `scripts/canary_token_manager.py` (RQ-249, mint/verify/register/scan)
- Canary monitor: `scripts/canary_leak_monitor.py` (RQ-249, cron 5min)
- Canary registry: `data/canary_registry.json` (append-only)
- Canary leak ledger: `data/canary_leak_events.jsonl` (append-only)
- Canary key: `~/.config/blindoracle/canary_key` (separate from HMAC delegation key)
- Onboarding: `chainlink-prediction-markets-mcp-enhanced/services/onboarding/agent_onboarding.py` (revoke())
- Passports: `chainlink-prediction-markets-mcp-enhanced/scripts/bo_passport_generator.py`

## Coding Guidelines
See `.claude/rules/karpathy-coding-guidelines.md` for general coding behavior (think before coding, simplicity first, surgical changes, goal-driven execution).
