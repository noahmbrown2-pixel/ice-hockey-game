---
name: security-audit
description: Run a MASSAT security audit against any multi-agent system, assessing OWASP ASI01-ASI10 threats with compliance mapping
arguments:
  - name: target_path
    description: "Path to the target system to audit (default: current project directory)"
    required: false
  - name: scope
    description: "Audit scope: full, quick, or targeted (default: full)"
    required: false
  - name: categories
    description: "Comma-separated ASI categories to assess (e.g. ASI01,ASI03)"
    required: false
  - name: flags
    description: "Optional flags: --skip-redteam --with-debate --mint-nft"
    required: false
---

# MASSAT Security Audit

Run a comprehensive Multi-Agent System Security Assessment against the target system, covering all OWASP ASI01-ASI10 threat categories with compliance mapping to OWASP, NIST AI RMF, ISO 42001, CSA AICM, and MAESTRO frameworks.

## Usage

```
/security-audit [target_path] [--scope full|quick|targeted] [--categories ASI01,ASI03] [--skip-redteam] [--with-debate] [--mint-nft]
```

## Default Behavior

If no arguments are provided, runs a **full** audit of the current project directory (`/home/craigmbrown/Project`).

## Instructions

Execute the following steps in order:

### Step 1: Load Configuration

Read the security audit profiles configuration:
- Read `configs/security_audit_profiles.json` for risk scoring thresholds, ASI category definitions, and discovery patterns
- Read `configs/security_audit_schedules.json` for schedule context (informational only)

### Step 2: Determine Audit Parameters

Parse the arguments to configure the audit:

- **target_path**: Default to `/home/craigmbrown/Project` if not specified
- **scope**: Default to `full`. Options:
  - `full` - All phases: discovery, vulnerability, compliance, red team simulation, report
  - `quick` - Fast: discovery + vulnerability + report only
  - `targeted` - Focused: discovery + vulnerability + compliance + report (specific categories only)
- **categories**: Default to all ASI01-ASI10. If specified, only assess those categories.
- **--skip-redteam**: Skip the red team simulation phase
- **--with-debate**: After audit, trigger a multi-agent security debate via the Enhanced Persona Debate System
- **--mint-nft**: After audit, mint an on-chain NFT of the results via `scripts/security_audit_nft_minter.py`

### Step 3: Run the Security Scanner

Execute the SFA scanner programmatically:

```bash
python3 scripts/mas_security_scanner.py --target <target_path> --scope <scope> [--categories <categories>] [--notify] [--verbose]
```

Alternatively, if finer-grained control is needed, use the Task tool to launch the security-orchestrator agent:

```
Launch the security-orchestrator agent at .claude/agents/security-team/security-orchestrator.md with:
- Target: <target_path>
- Scope: <scope>
- Categories: <categories>
- Skip phases: <skip_phases>
```

### Step 4: Review Results

After the audit completes:

1. Read the generated `report.json` from the audit directory
2. Read the `executive_summary.md` for a quick overview
3. Present the key findings to the user:
   - Overall risk score (X/10)
   - Number of critical, high, medium, low findings
   - Top 3 most urgent remediation actions
   - Compliance coverage percentages

### Step 5: Output Dashboard Path

Report the path to the generated HTML dashboard:

```
Dashboard: security-audits/<audit-id>/dashboard.html
HTML Copy: html-output/YYYYMMDD-security-audit-<target>.html
Audit Dir: security-audits/<audit-id>/
```

### Step 6: Send Notifications (if applicable)

If `--notify` was included or scope is `full`:

```bash
python3 scripts/execution_toolkit.py notify --message "MASSAT Audit Complete: <risk_score>/10 - <audit_id>" --channels whatsapp,email
```

### Step 7: Optional - Debate and NFT

If `--with-debate` was specified:
- Trigger the debate-trigger-agent at `.claude/agents/security-team/debate-trigger-agent.md`
- Include audit findings as debate input

If `--mint-nft` was specified:
- Run `python3 scripts/security_audit_nft_minter.py --audit-dir <audit_dir>`
- Report the NFT transaction hash and IPFS CID

## Scopes Reference

| Scope | Phases | Estimated Time | Estimated Cost |
|-------|--------|----------------|----------------|
| quick | Discovery + Vulnerability + Report | ~3 min | ~$0.50 |
| targeted | Discovery + Vulnerability + Compliance + Report | ~5 min | ~$1.50 |
| full | All phases including Red Team | ~10 min | ~$3.00 |

## ASI Categories Reference

| ID | Category |
|----|----------|
| ASI01 | Agent Goal Hijacking |
| ASI02 | Tool Misuse and Exploitation |
| ASI03 | Identity and Privilege Abuse |
| ASI04 | Agentic Supply Chain Vulnerabilities |
| ASI05 | Unexpected Code Execution |
| ASI06 | Memory and Context Poisoning |
| ASI07 | Insecure Inter-Agent Communication |
| ASI08 | Cascading Failures |
| ASI09 | Human-Agent Trust Exploitation |
| ASI10 | Rogue Agents |

## Examples

```bash
# Full audit of ETAC system (default)
/security-audit

# Quick scan only
/security-audit . --scope quick

# Assess only prompt injection and memory poisoning
/security-audit . --scope targeted --categories ASI01,ASI06

# Full audit with debate and on-chain record
/security-audit . --scope full --with-debate --mint-nft

# Audit a different system
/security-audit /path/to/other/system --scope full
```
