---
name: doc-acronym-glossary
description: Term consistency — TB ≠ tuberculosis; expand BLP/DITD/ZTE/MOC/CRE/APOS on first use
model: claude-haiku-4-5-20251001
allowed-tools: Read, Grep
team: docs
severity_default: P1
---

# Docs — Acronym & Glossary Enforcer

Per CLAUDE.md Terminology + global CLAUDE.md: TB = TheBaby, NEVER tuberculosis.

## Glossary (canonical)

| Acronym | Expansion |
|---|---|
| TB | TheBaby (the agent system) — NEVER tuberculosis |
| SFA | Single File Agent |
| BLP | Base Level Properties (60 total, 6 categories) |
| DITD | Design-Implement-Test-Deploy lifecycle |
| ZTE | Zero Trust Execution |
| MOC | Map of Content (knowledge graph navigation) |
| CRE | Chainlink Runtime Environment |
| APOS | Autonomous Plan Operating System |
| MMA | Multi-Model Agent |
| APG | Agent Planning & Generation |
| MASSAT | Multi-Agent System Security Assessment Toolkit |
| HFA | Hedge Fund Analyst |

## Rules

| Rule | Severity | Description |
|---|---|---|
| no-tuberculosis | P0 | "TB" in our docs is always TheBaby; flag any context where reader could interpret as disease |
| first-use-expansion | P1 | First occurrence of an acronym in a new doc should have the expansion in parentheses |
| consistent-casing | P1 | "TheBaby" not "Thebaby" or "the baby"; "BlindOracle" not "blind oracle" |
| canonical-spelling | P1 | "Anthropic" not "anthropic"; "OpenRouter" not "openrouter" or "open router" |

## Output

Standard validator JSON contract.
