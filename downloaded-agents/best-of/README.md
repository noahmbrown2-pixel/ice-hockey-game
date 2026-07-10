# Best-of — 10 standout agents

Curated from **11,929 downloaded public agent files** (10,372 distinct after
content-dedup). Selected for genuine craft — clear role, real workflow, output
format, and guardrails — not just length. "×N" = number of repos that ship a
near-identical copy (a community-adoption signal).

> ⚠️ **Still untrusted third-party data.** These are the *best-written* agents,
> not vetted-safe ones. Read each before copying into a live `.claude/agents/`.

| # | Agent | Source repo | Why it made the cut |
|---|---|---|---|
| 1 | `deep-code-reviewer` | `marlomgirardi/.config` | 4-phase review (context→analysis→questioning→verdict), "never approve code you don't understand," precise verdict format, full memory system. |
| 2 | `chaos-qa` | `ThePalaceProject/ios-core` | Adversarial iOS simulator QA. Every finding needs log evidence ("no hallucinated bugs"), hard budget discipline, real dogfood-retro lessons baked in. |
| 3 | `secops-architecture-reviewer` | `Pokokpisang/ifyp-OVS-Dual-SIEM-Centralized` | Principal-level "review before you build." Rigid 8-section output, read-only by default, disciplined security gating (SOAR simulation-first, AI advisory-only). |
| 4 | `hr-pro` ×9 | `andy-austin/quipu` | Best non-eng agent. Compliance-aware HR: legal disclaimer, asks jurisdiction first, bias-mitigated templates, refuses non-compliant asks. |
| 5 | `wrds-query-orchestrator` | `Alexander-M-Dickerson/ai-asset-pricing` | Deepest domain agent. Orchestrates financial-database SQL (CRSP/Compustat/OptionMetrics/TAQ) with real linking tables + specialist delegation. |
| 6 | `nexus` | `ryan0122/a11ypros` | Polished GitHub orchestrator. Intent-classification table, session context memory, strict handoff contract, confirm-before-mutation. |
| 7 | `kotlin-build-resolver` ×6 | `adzcsx2/my-claude-code-setting` | Tight & surgical. Prompt-injection defense header, error→cause→fix table, verify-after-every-fix, explicit stop conditions. |
| 8 | `testing-expert` ×5 | `BartekFo/my-dev-setup` | Comprehensive JS/TS testing. 6 problem categories with before/after code, minimal→better→complete tiers, decision trees. |
| 9 | `agent-creator` | `martinkup/symfony-profiler-optimization-advisor-bundle` | Best meta-agent — builds other agents. Single-responsibility enforcement, model-selection guide, PASS/FAIL quality gates. |
| 10 | `operator` ×4 | `TheWayWithin/aimpactscanner-mvp` (AGENT-11) | Thorough DevOps with strong safety: document-trust boundary, separation-of-duties (no Write/Edit), tested-rollback checklist. |

## Honorable mentions
- `tdd-orchestrator` ×8 (`wshobson/agents` lineage) — encyclopedic TDD, but all breadth, little enforced workflow.
- `codebase-pattern-finder` ×5 (`replicatedhq`, HumanLayer lineage) — clean "find examples like X" with a solid output format.

## Pattern worth noting
The highest-*quality* files are almost all unique (×1), hand-crafted for a
specific codebase; the most-*copied* ones come from a few famous public
collections. Bespoke domain depth beat generic breadth.

Regenerate the ranking anytime: `python ../analyze.py`
