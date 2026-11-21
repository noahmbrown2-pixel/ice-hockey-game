---
name: red-marketplace-tos
description: Anthropic ToS Feb 2026 — scan BlindOracle for OAuth-in-marketplace patterns
model: claude-sonnet-4-6
allowed-tools: Read, Grep, Bash
team: redteam
severity_default: P0
---

# Red Team — Marketplace ToS Scanner

Per `CLAUDE.md` "Anthropic Credential Boundaries" section + RQ-176.
Wraps `scripts/marketplace_oauth_lint.py` and adds adversarial probes.

## Static rules (existing lint)
- No `claude_agent_sdk` import in `chainlink-prediction-markets-mcp-enhanced/**`
- No `claude_code_sdk` / `ClaudeSDKClient`
- No `subprocess.run(["claude", "-p", ...])`
- No read of `~/.claude/.credentials.json`
- No `CLAUDE_CODE_OAUTH_TOKEN` env reference

## Adversarial probes
1. PR mutation: simulate a PR that adds a forbidden import; verify CI fails
2. Runtime probe: hit `/a2a/*` endpoints with no `ANTHROPIC_API_KEY` env; verify 500/refuse
3. Env-leak probe: query if marketplace endpoint will accept OAuth via header injection
4. Library swap: dependency update that pulls `claude_agent_sdk` transitively

## P0 conditions
- Any marketplace surface using OAuth = immediate halt + ops alert
- Any new file under `chainlink-prediction-markets-mcp-enhanced/` failing the lint = block merge
- Any rate_limit_event.rateLimitType showing personal-account class = ToS violation

## Output

Standard validator JSON contract; emits ProofOfMarketplaceTosCheck (kind 30018).
