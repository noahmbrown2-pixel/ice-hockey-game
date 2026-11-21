# 1M Context Codebase Analysis

Run a multi-pass codebase analysis using Opus 4.6's 1M context window.

## Usage
```
/analyze-codebase              # Interactive - choose a pass
/analyze-codebase list         # Show all passes with token estimates
/analyze-codebase 1            # Run Pass 1 (Core Scripts & Services)
/analyze-codebase 1-3          # Run Passes 1 through 3 sequentially
/analyze-codebase consolidate  # Generate consolidation dashboard from all findings
```

## Instructions

When invoked, follow this workflow:

### Step 1: Parse Arguments
- `$ARGUMENTS` determines which pass(es) to run
- If empty or "list", run: `python3 scripts/codebase_analyzer.py --list`
- If a number (1-11), run that specific pass
- If a range (e.g. "1-3"), run those passes sequentially
- If "consolidate", gather all `analysis_bundles/pass_*_findings.md` files and generate dashboard

### Step 2: Rate Limit Check
Run `python3 scripts/codebase_analyzer.py --rate-check` before starting.
If peak hours, warn the user and suggest waiting for off-peak (2x bonus).

### Step 3: For Each Pass
1. **Dry run first**: `python3 scripts/codebase_analyzer.py --pass N --dry-run`
   - Review file count and token estimate
   - If over budget, adjust (skip test files, data files, etc.)

2. **Generate bundle**: `python3 scripts/codebase_analyzer.py --pass N`
   - Bundle is written to `analysis_bundles/pass_NN_name.txt`

3. **Read and analyze the bundle**:
   - Use the Read tool to load `analysis_bundles/pass_NN_name.txt`
   - Analyze for: dead code, duplication, security issues, consolidation opportunities, pattern violations
   - Focus areas are defined per pass in the script

4. **Record findings**:
   - Generate findings template: `python3 scripts/codebase_analyzer.py --pass N --findings-template`
   - Fill in the template with actual findings
   - Save to `analysis_bundles/pass_NN_findings.md`

5. **Notify**: Send WhatsApp notification per completed pass with finding counts

### Step 4: Consolidation (after all passes)
1. Read all `analysis_bundles/pass_*_findings.md` files
2. Cross-reference findings across passes
3. Prioritize: P0 (critical/security) > P1 (important) > P2 (moderate) > P3 (low)
4. Generate HTML dashboard at `html-output/YYYYMMDD-codebase-analysis.html`
5. Cross-reference with roadmap queue at `specs/plan-competitive-analysis-roadmap-queue.md`

### Pass Reference

| Pass | Name | Focus |
|---|---|---|
| 1 | Core Scripts & Services | Dead code, duplication, utilities |
| 2 | Agent Fleet | Redundancy, SFA compliance, BLP |
| 3 | BlindOracle / Chainlink | Prediction markets, CRE, proofs |
| 4 | Communication Stack | Unification, routing, notifications |
| 5 | InterCabal Platform | Debate, comedy, architecture |
| 6 | APOS & Execution | DITD pipeline, ZTE, plan lifecycle |
| 7 | Observability & Monitoring | 4 overlapping systems consolidation |
| 8 | MCP Servers & Tools | Server patterns, cost tracking |
| 9 | Commerce & Marketplace | Commerce integration, revenue |
| 10 | Legacy & Consolidation | Dead projects, consolidation wins |
| 11 | GCP VM Code | Website quality, deployment config |

### Scheduling Guidance
- **Conservative**: 2 passes/day (5-6 day sprint)
- **Aggressive**: 4-5 passes/day
- **Best window**: 05:00-12:00 UTC (off-peak 2x bonus)
- **Avoid**: Running during APOS nightly execution (03:00-04:00 UTC)

### Analysis Checklist Per Pass
For each file/module analyzed, check:
- [ ] Dead code (unused functions, imports, unreachable branches)
- [ ] Code duplication (similar logic in multiple places)
- [ ] Security issues (hardcoded secrets, unsafe deserialization, injection)
- [ ] Error handling (bare except, swallowed errors, missing retries)
- [ ] Type safety (missing type hints, Any overuse)
- [ ] Pattern violations (not following SFA, MCP wrapper, or BLP patterns)
- [ ] Consolidation opportunities (merge similar modules)
- [ ] Documentation gaps (missing docstrings on public APIs)
- [ ] Test coverage gaps (untested critical paths)
- [ ] Performance (N+1 queries, unnecessary file I/O, blocking calls)
