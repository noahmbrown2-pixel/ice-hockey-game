---
name: agent-audit-for-owner
description: Audit a target agent on behalf of its owner and emit an UNCHALLENGEABLE, on-chain-verifiable audit report + a passport attestation. Use when an agent owner asks "audit my agent" or a marketplace buyer wants third-party verification of an agent. Runs assessment → Merkle-commits findings → emits ProofOfAuditReport (30105) → optionally anchors to 3 witnesses → links the proof into the agent's passport so anyone can independently verify.
allowed-tools: Bash, Read, Write, Grep, Glob
---

# Agent Audit for Owner

**Role:** You are the third-party agent auditor — you assess the target agent, Merkle-commit the findings, emit ProofOfAuditReport (30105), and link it into the agent's passport. You audit and attest only; you do not modify the audited agent.

**Output / Termination:** Return one signed audit report — `{trust_score, findings[], merkle_root, proof_id}` — and stop once the proof is emitted (and optionally anchored). Do not re-audit on the same run.

Produce an audit that **survives a hostile challenge**: every finding is committed to a Merkle
root, the report is content-hashed into a signed proof, and (optionally) the root is anchored to
Base mainnet + Sepolia + Nostr — so a third party verifies the audit without trusting the auditor.

## When to use
- An agent owner asks you to audit their agent and give them something they can show buyers.
- A marketplace buyer wants independent verification that an agent was audited.
- You need to attach an "audited + anchored" attestation to an agent passport.

## Inputs
`target_agent_id` (required) · `owner_id` (required) · `scope` (default `full`) · `anchor` (default off — anchoring spends gas).

## What it does (the orchestrator)
Run: `python3 .claude/skills/agent-audit-for-owner/audit_orchestrator.py --target <agent> --owner <owner> [--scope full] [--anchor] [--passport <path>]`

1. **Assess** — runs the security assessment (OWASP ASI checks; reuses MASSAT when available). Produces findings + a risk score.
2. **Commit** — Merkle-commits the findings (salted, keyed-HMAC leaves, count `N` bound into the root → completeness). Any single finding gets an inclusion proof.
3. **Attest** — content-hashes the report and emits **ProofOfAuditReport (kind 30105)** via `super_orchestrator/proof_emitter.py` (HMAC-signed, verifiable offline).
4. **Anchor (optional, `--anchor`)** — submits the root to the 3 witnesses via `state_anchor_cycle` and emits **ProofOfStateAnchor (30106)**. Gas-gated; off by default.
5. **Link** — writes a passport `audit_attestation` block (proof ids + merkle root + witness statuses + a verify-it-yourself recipe). If `--passport` is given, merges it into that passport JSON.
6. **Report** — writes a signed audit report JSON + an `OWNER_REPORT.md` the owner can hand to a buyer.

## Outputs
- `data/agent_audits/<target>-<ts>/report.json` — findings + risk + audit_hash + proof_id + (anchor receipt)
- `data/agent_audits/<target>-<ts>/OWNER_REPORT.md` — owner-facing summary + verify recipe
- passport `audit_attestation` block (in-place merge if `--passport` given)

## What makes it "unchallengeable"
- **Report content-hash** is in a signed 30105 proof — the auditor can't silently revise the report.
- **Findings are Merkle-committed with N bound in** — the auditor can't drop the bad findings (completeness) or fabricate one (inclusion proof fails).
- **Anchored to 3 independent witnesses** — a reviewer confirms the root on Base mainnet + Sepolia + Nostr without trusting anyone.
- **Honest tiering** — anything not externally verifiable is labeled, never overclaimed.

## Governance
- Anchoring spends mainnet gas — `--anchor` requires operator go (the orchestrator prints the estimate and stops without `--anchor-confirm`).
- The audit reports only what it can verify; the risk score + findings are reproducible by re-running the orchestrator on the same target.
- Reuses: `super_orchestrator/{merkle_anchor,proof_emitter,onchain_verifiers,state_anchor_cycle}.py`, MASSAT (`scripts/mas_security_scanner.py`).
