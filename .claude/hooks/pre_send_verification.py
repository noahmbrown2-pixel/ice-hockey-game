#!/usr/bin/env python3
"""RQ-220 Pre-Send Verification Hook.

@REQ-ID: RQ-220 | BLP: [Alignment, Durability]

PreToolUse hook on outbound-shaped Bash commands. Runs deterministic
rule-corpus checks against the about-to-execute artifact:
  - bare-gmail From (no display name) → IDENTITY
  - unfilled {{placeholder}} in body → RENDERING
  - "dry-run" intent but real recipient → BLAST-RADIUS
  - recipient is operator's own email but subject suggests external → INTENT

This is phase 1: deterministic, static, fast (<100ms). Phase 2 will add
parallel LLM critic subagents for the harder intent/blast-radius cases.

Exit codes (CC hook convention as of 2026-05-19, pi-vs-cc damage-control-continue port):
  0 — PASS; allow the tool call
  2 — BLOCK + SURFACE; block the tool call AND surface stderr to the agent
       (the agent reads the structured fix instructions and self-corrects)
  1 — LEGACY BLOCK; abort the agent's turn with user-visible error
       (retained when PRE_SEND_LEGACY_EXIT=1 is set for emergency fallback)

The "block-with-feedback" mode (default, exit 2) is the Pi-style
damage-control-continue pattern: instead of killing the agent's turn,
return a structured violation message that the model reads and acts on.

The hook reads the tool-call payload from $CLAUDE_TOOL_INPUT (JSON) and
writes verdicts to stderr + the verification log.

To wire: add to .claude/settings.json under hooks.PreToolUse with matcher
matching Bash send patterns + Write to sensitive paths.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


PROJECT_ROOT = Path("/home/craigmbrown/Project")
VERIFICATION_LOG = PROJECT_ROOT / ".claude" / "verification_log.jsonl"
RULE_CORPUS = PROJECT_ROOT / "data" / "verification_rule_corpus.jsonl"


# --- Deterministic checks ---------------------------------------------------

def check_bare_gmail_from(payload_str: str) -> Optional[dict]:
    """Identity critic: From field must have a display name.

    @REQ-ID: RQ-220 — catches the Jesse Pollak bare-gmail incident.
    """
    # Look for the From pattern in either bash arg or rendered HTML
    # Bad: --from babyproject418@gmail.com (no display name)
    # Bad: From: babyproject418@gmail.com  (rendered without display name)
    # Good: --from "Craig Brown — BlindOracle <babyproject418@gmail.com>"
    bare_pattern = re.compile(
        r"(?:--from|^From:|<strong>From:</strong>)\s+"
        r"([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b",
        re.IGNORECASE | re.MULTILINE,
    )
    for m in bare_pattern.finditer(payload_str):
        email = m.group(1)
        # If the chunk preceding the @ doesn't contain a quoted name, flag
        start = max(0, m.start() - 50)
        context = payload_str[start:m.start()]
        if '"' not in context and "&lt;" not in context:
            return {
                "verdict": "FAIL",
                "critic": "identity-critic",
                "rule": "bare_gmail_no_display_name",
                "evidence": "From field uses " + email + " without display name",
                "fix": 'Use format: "Craig Brown — BlindOracle" <' + email + '>',
            }
    return None


def check_unfilled_placeholder(payload_str: str) -> Optional[dict]:
    """Rendering critic: {{placeholder}} leaking into outbound body.

    @REQ-ID: RQ-220 — catches the templated-email-sent-with-raw-placeholder pattern.
    """
    # Most placeholders use {{...}} or ${...}; flag if found in args
    placeholder_re = re.compile(r"\{\{[^}]+\}\}|\$\{[A-Z_][A-Z0-9_]*\}")
    matches = placeholder_re.findall(payload_str)
    if matches:
        return {
            "verdict": "FAIL",
            "critic": "rendering-critic",
            "rule": "unfilled_placeholder",
            "evidence": "Unfilled placeholders in payload: " + str(matches[:5]),
            "fix": "Replace placeholders before send (sed 's/{{key}}/value/' or render template)",
        }
    return None


def check_suppressed_subject(payload_str: str) -> Optional[dict]:
    """Intent critic: subject contains decision-verbs that should not trigger replies.

    @REQ-ID: RQ-220 — codifies feedback_suppress_decision_verb_replies.md.
    Subjects like "REJECT", "DEFER", "Hold", "AUTO-APPROVED" should not be
    auto-replied to. Operator already has cron filters; this catches manual sends.
    """
    suppressed = re.compile(
        r"--subject\s+\"[^\"]*\b(REJECT|DEFER|Hold|AUTO-APPROVED|AUTOAPPROVED)\b",
        re.IGNORECASE,
    )
    if suppressed.search(payload_str):
        return {
            "verdict": "FAIL",
            "critic": "intent-critic",
            "rule": "suppressed_subject_keyword",
            "evidence": "Subject contains decision verb that should not trigger a send",
            "fix": "Use a status-update channel (operator brief, dashboard) instead",
        }
    return None


def check_dry_run_leakage(payload_str: str, conversation_context: str = "") -> Optional[dict]:
    """Blast-radius critic: real recipient detected in a dry-run codepath.

    @REQ-ID: RQ-220 — codifies the dry-run-sent-real-email incident.
    Heuristic: if the recent conversation contains "dry-run" / "test" / "verify"
    AND the command is sending to a known production recipient, flag.
    """
    if not conversation_context:
        return None
    is_dry_run_context = bool(re.search(
        r"\bdry[- ]?run\b|\bverification\b|\btest send\b",
        conversation_context, re.IGNORECASE,
    ))
    if not is_dry_run_context:
        return None
    # Check if --to points at a real production recipient (any @ that's not test/example/localhost)
    to_match = re.search(r"--to\s+\"?([\w._%+-]+@[\w.-]+\.[A-Za-z]{2,})\"?", payload_str)
    if to_match:
        recipient = to_match.group(1)
        # Test-recipient indicators:
        #   - domain in test/example/localhost
        #   - local-part contains +drytest tag (e.g. craigmbrown+drytest@gmail.com)
        is_test_recipient = (
            re.search(r"@(example\.com|test\.(com|org)|localhost)", recipient, re.IGNORECASE)
            or re.search(r"\+drytest@", recipient, re.IGNORECASE)
            or re.search(r"\+test@", recipient, re.IGNORECASE)
        )
        if not is_test_recipient:
            return {
                "verdict": "FAIL",
                "critic": "blast-radius-critic",
                "rule": "dry_run_real_recipient",
                "evidence": "Dry-run context detected but --to is real recipient " + recipient,
                "fix": "Route to <op>+drytest@gmail.com or skip --send during dry-run",
            }
    return None


def check_external_external_send_uses_correct_channel(payload_str: str) -> Optional[dict]:
    """Identity critic: external cold emails must use babyproject418, not craigmbrown.

    @REQ-ID: RQ-220 — codifies feedback_outbound_email_config.md.
    """
    # If --to has an external recipient AND --from is craigmbrown@gmail.com → flag
    to_match = re.search(r"--to\s+\"?([\w._%+-]+@[\w.-]+\.[A-Za-z]{2,})\"?", payload_str)
    from_match = re.search(r"--from\s+\"?([\w._%+-]+@[\w.-]+\.[A-Za-z]{2,})\"?", payload_str)
    if not to_match or not from_match:
        return None
    to_email = to_match.group(1).lower()
    from_email = from_match.group(1).lower()
    is_external_to = not re.search(
        r"@(craigmbrown\.com|gmail\.com)", to_email
    ) or "babyproject" in to_email
    is_op_personal_from = from_email == "craigmbrown@gmail.com"
    if is_external_to and is_op_personal_from:
        return {
            "verdict": "FAIL",
            "critic": "identity-critic",
            "rule": "external_send_from_personal",
            "evidence": "External recipient " + to_email + " from operator's personal "
                        + from_email,
            "fix": "Use --from babyproject418@gmail.com for external cold/outbound",
        }
    return None


# --- Soft-warning checks (do NOT block; just log + stderr) -----------------

# BO-only Anthropic key (rotated 2026-05-16); see feedback_anthropic_key_bo_only.md
_BO_ONLY_ANTHROPIC_PREFIX = "sk-ant-api03-LPBR"

# Paths where the BO-only key IS allowed (whitelist; everything else triggers warning)
_BO_PRODUCTION_PATH_PATTERNS = [
    r"chainlink-prediction-markets-mcp-enhanced/",
    r"/blindoracle/",
    r"/bo-production/",
]


def check_bo_bench_freshness(payload_str: str) -> Optional[dict]:
    """WARN: outbound send by an agent without a recent passing BO-bench trial.

    @REQ-EVAL-W5 | Layer 2 enforcement, enrich mode (logs only, never blocks).

    Cheap fast-path: extract agent identity from the bash command (script path)
    and check data/bo_bench/results.jsonl for a passing trial in last 24h.
    If no passing trial exists for the agent's bench tasks → emit WARN finding.

    Hook constraint: <50ms total. File reads are fine (small jsonl).
    """
    try:
        # Map bash command shapes to agent identifiers in tasks.jsonl
        agent = None
        if re.search(r"send_whatsapp_message", payload_str):
            agent = "whatsapp_manager"
        elif re.search(r"gmail_manager\.py\s+send\b.*babyproject418|--from\s+babyproject418", payload_str):
            agent = "babyproject418_email_sender"
        elif re.search(r"tb_command_daemon", payload_str):
            agent = "tb_command_daemon"
        if agent is None:
            return None  # Not a wired agent — silent pass (don't false-positive on every gh/curl)
        from scripts.bo_bench.enforcement import check_agent_bench_freshness
        verdict = check_agent_bench_freshness(agent, max_age_hours=24)
        if verdict["verdict"] == "OK":
            return None
        return {
            "verdict": "WARN",
            "critic": "bo-bench-freshness",
            "rule": "bo_bench_freshness_gate",
            "evidence": f"Agent '{agent}' has no passing bench trial in last 24h "
                        f"(verdict_class={verdict['verdict_class']})",
            "fix": "Run `python3 scripts/bo_bench/runner.py --tags <agent_tag>` to refresh; "
                   "or add a bench task targeting this agent to data/bo_bench/tasks.jsonl",
        }
    except Exception:
        # Hook MUST never crash — fail silently per .claude/rules/infrastructure/hooks-observability.md
        return None


def check_direct_outbound_bypasses_proxy(payload_str: str) -> Optional[dict]:
    """Egress proxy: direct outbound HTTP call that bypasses the centralized proxy.

    @REQ-ID: RQ-233b — warn mode initially per override_governance.md Cat 11.
    Fires when a Bash command contains a direct HTTP call to an external host
    rather than routing through the egress proxy at localhost:EGRESS_PROXY_PORT.

    Promotion path: warn → block after ≥5 catches + 0 false positives in 14d.
    Mode is read from data/rule_state.json at runtime.
    """
    mode = _get_rule_mode("egress_proxy_bypass", default="warn")
    if mode == "enrich":
        return None  # silent pass in enrich mode

    proxy_port = os.environ.get("EGRESS_PROXY_PORT", "8087")
    proxy_endpoints = [
        f"localhost:{proxy_port}",
        f"127.0.0.1:{proxy_port}",
        f"0.0.0.0:{proxy_port}",
    ]

    # Patterns that indicate a direct outbound HTTP call to an external host
    # (not localhost / 127.0.0.1 / 0.0.0.0 which are local services)
    direct_external_patterns = [
        # curl / wget to external URLs (skip loopback addresses)
        r"\bcurl\b[^|;]*https?://(?!localhost[:/\s]|127\.|0\.0\.0\.0)",
        r"\bwget\b[^|;]*https?://(?!localhost[:/\s]|127\.|0\.0\.0\.0)",
        # Python one-liners with requests/httpx calling external hosts
        r'requests\.(get|post|put|patch|delete)\s*\(\s*["\']https?://(?!localhost|127\.|0\.0\.0\.0)',
        r'httpx\.(get|post|put|patch|delete)\s*\(\s*["\']https?://(?!localhost|127\.|0\.0\.0\.0)',
    ]

    is_direct_external = any(re.search(p, payload_str) for p in direct_external_patterns)
    if not is_direct_external:
        return None

    # Allow if already routing via the egress proxy
    is_via_proxy = any(ep in payload_str for ep in proxy_endpoints)
    if is_via_proxy:
        return None

    return {
        "verdict": "WARN",
        "critic": "egress-proxy",
        "rule": "egress_proxy_bypass",
        "mode": mode,
        "evidence": "Direct outbound HTTP call detected — not routed through egress proxy",
        "fix": (
            f"Route via egress proxy: POST http://localhost:{proxy_port}/proxy "
            '\'{"tenant":"default","method":"GET","url":"<destination>","headers":{}}\' '
            "— see scripts/egress_proxy/proxy_server.py (RQ-233b)"
        ),
    }


def check_bo_only_anthropic_key_leakage(payload_str: str) -> Optional[dict]:
    """WARN: BO-only Anthropic key landing in a non-BO destination.

    Soft warning (does not block). Detects writes/edits that would persist the
    rotated `sk-ant-api03-LPBR...` key to anywhere outside the BO production
    whitelist. Codifies the hard rule from feedback_anthropic_key_bo_only.md.
    """
    if _BO_ONLY_ANTHROPIC_PREFIX not in payload_str:
        return None
    # Allow when destination path looks like BO production
    for pat in _BO_PRODUCTION_PATH_PATTERNS:
        if re.search(pat, payload_str):
            return None
    # Suppress when this is the key being revoked/replaced (presence in an
    # Edit's old_string means we're removing it)
    if re.search(r'old_string.*' + re.escape(_BO_ONLY_ANTHROPIC_PREFIX), payload_str):
        return None
    return {
        "verdict": "WARN",
        "critic": "key-scope-critic",
        "rule": "bo_only_anthropic_key_non_bo_destination",
        "evidence": "Payload contains BO-only key prefix " + _BO_ONLY_ANTHROPIC_PREFIX
                    + " but destination is not a BO production path",
        "fix": "Use a separate general-purpose Anthropic key for non-BO usage; "
               "see ~/.claude/projects/.../memory/feedback_anthropic_key_bo_only.md",
    }


# --- RQ-249 Canary leak detection -----------------------------------------

def check_canary_token_in_outbound(payload_str: str) -> Optional[dict]:
    """Canary-leak critic (RQ-249): block outbound containing a non-TEST canary token.

    Canary tokens (format CNRY-<CHANNEL>-<ULID>-<HMAC8>) are silent telemetry —
    they MUST never leave their issuing channel. If one appears in an outbound
    email / PR body / WhatsApp message / curl POST, an unauthorized context read
    occurred. Records the leak to data/canary_leak_events.jsonl regardless of
    verdict.

    Returns a FAIL finding if a non-TEST canary is detected; None otherwise.
    Wrapped in try/except — hook must NEVER crash (hooks-observability.md).
    """
    try:
        scripts_dir = str(PROJECT_ROOT / "scripts")
        if scripts_dir not in sys.path:
            sys.path.insert(0, scripts_dir)
        from canary_leak_monitor import check_canary_in_outbound  # type: ignore
        return check_canary_in_outbound(payload_str)
    except Exception as e:
        sys.stderr.write(f"[rq249-canary] check failed silently: {e}\n")
        return None


# --- Hook entry -------------------------------------------------------------

CHECKS = [
    check_bare_gmail_from,
    check_unfilled_placeholder,
    check_suppressed_subject,
    check_external_external_send_uses_correct_channel,
    check_canary_token_in_outbound,  # RQ-249 — block on canary leak to outbound
    # check_dry_run_leakage requires conversation_context; invoked separately
]

# Soft-warning checks: logged + stderr but never block
WARN_CHECKS = [
    check_bo_only_anthropic_key_leakage,
    check_bo_bench_freshness,   # REQ-EVAL-W5 — enrich mode per data/rule_state.json
    check_direct_outbound_bypasses_proxy,  # RQ-233b — warn mode; promote to block after catch-rate
]


def is_outbound_command(command: str) -> bool:
    """Match commands that look like outbound sends.

    @REQ-ID: RQ-220 — hook matcher logic; conservative (only obvious sends).
    """
    patterns = [
        r"gmail_manager\.py\s+send\b",
        r"unified_email_responder\.py\s+(?:reply|send)\b",
        r"\bgh\s+pr\s+create\b",
        r"\bgh\s+issue\s+create\b",
        r"send_whatsapp_message",
        r"send_message\(",
        r"\bcurl\b.*\b-X\s*POST\b",
    ]
    return any(re.search(p, command) for p in patterns)


def append_log(record: dict) -> None:
    """Append to .claude/verification_log.jsonl (audit trail)."""
    VERIFICATION_LOG.parent.mkdir(parents=True, exist_ok=True)
    with open(VERIFICATION_LOG, "a") as f:
        f.write(json.dumps(record, default=str) + "\n")


def run_checks(payload_str: str, conversation_context: str = "") -> list:
    """Run all enabled checks; return list of FAIL findings (empty = pass)."""
    findings = []
    for check in CHECKS:
        result = check(payload_str)
        if result:
            findings.append(result)
    dry_run = check_dry_run_leakage(payload_str, conversation_context)
    if dry_run:
        findings.append(dry_run)
    return findings


def run_warn_checks(payload_str: str) -> list:
    """Run soft-warning checks. Findings get logged + stderr but never block."""
    warnings = []
    for check in WARN_CHECKS:
        result = check(payload_str)
        if result:
            warnings.append(result)
    # RQ-228 Cat 1/3/4 critic dispatch — all run in warn-friendly mode by default.
    # Each critic is try/except-guarded so a failure cannot crash the hook.
    warnings.extend(run_rq228_critics(payload_str))
    return warnings


def _get_rule_mode(rule_id: str, default: str = "enrich") -> str:
    """Look up current mode for a rule from data/rule_state.json (Cat 11)."""
    try:
        rs_path = PROJECT_ROOT / "data" / "rule_state.json"
        if not rs_path.exists():
            return default
        state = json.loads(rs_path.read_text())
        return state.get("rules", {}).get(rule_id, {}).get("current_mode", default)
    except Exception:
        return default


def _extract_body(payload_str: str) -> str:
    """Best-effort body extraction from outbound payloads.

    Handles: gh pr/issue create --body '...', gmail_manager send --body '...',
    unified_email_responder reply --body '...', WhatsApp --message '...'.
    """
    # Look for `--body 'XXX'` or `--body "XXX"` or `--message 'XXX'`
    for flag in ("--body", "--message", "--text"):
        m = re.search(rf"{re.escape(flag)}[\s=]+(['\"])(.*?)\1(?:\s|$)", payload_str, re.DOTALL)
        if m:
            return m.group(2)
        # Unquoted (rare but possible)
        m = re.search(rf"{re.escape(flag)}[\s=]+([^\s'\"][^\n]*)", payload_str)
        if m:
            return m.group(1)
    return ""


def _extract_recipient(payload_str: str) -> str:
    """Best-effort recipient extraction (email addr or phone)."""
    for flag in ("--to", "--recipient"):
        m = re.search(rf"{re.escape(flag)}[\s=]+(['\"]?)([^'\"\s]+)\1", payload_str)
        if m:
            return m.group(2)
    return ""


def _maybe_critic_peer_consult(rule_id: str, evidence: str, asker: str) -> str:
    """RQ-232 Integration #4: ask peer critics for a second opinion.

    Opt-in via CRITIC_PEER_CONSULT=1. Default off so we ship safely;
    flip on after watching critic_dialogue.jsonl for false-positive rate.

    Returns a short summary string for inclusion in the finding's evidence,
    or empty string when off / on failure. NEVER raises.
    """
    if os.environ.get("CRITIC_PEER_CONSULT") != "1":
        return ""
    try:
        from critic_pool import ask_peers_for_second_opinion, summarize_peer_responses
        question = f"Saw rule_id={rule_id}. Evidence: {evidence[:200]}. Concur?"
        results = ask_peers_for_second_opinion(asker, question, timeout=3)
        return summarize_peer_responses(results)
    except Exception as e:
        sys.stderr.write(f"[rq232-critic-peer] consult failed silently: {e}\n")
        return ""


def run_rq228_critics(payload_str: str) -> list:
    """RQ-228 Cat 1/3/4 critic dispatch — PII scan + cardinality + cohort bleed.

    All critics run in the mode set by data/rule_state.json (Cat 11 governance).
    Defaults per operator decision 2026-05-17:
      - pii_outbound_scan: enrich  (suggestions, never block)
      - aggregation_truth: enrich  (suggestions, never block)
      - cohort_bleed:      warn   (log + alert, never block)

    RQ-232 Integration #4: when CRITIC_PEER_CONSULT=1, each critic that
    fires also consults the other 3 send-critics via coms and attaches a
    `peer_dialogue` field to the finding. Logged to data/critic_dialogue.jsonl.

    Each critic is try/except-guarded — a failure logs to stderr but never
    blocks the send. Per hooks-observability.md: hooks must NEVER block.
    """
    findings = []
    body = _extract_body(payload_str)
    if not body:
        return findings
    recipient = _extract_recipient(payload_str)
    scripts_dir = str(PROJECT_ROOT / "scripts")
    if scripts_dir not in sys.path:
        sys.path.insert(0, scripts_dir)

    # Cat 1 — PII scan
    try:
        from pii_scanner import evaluate_pii_check
        mode = _get_rule_mode("pii_outbound_scan", default="enrich")
        result = evaluate_pii_check(body, context={"source": "pre_send_verification"}, mode=mode)
        if result.get("findings"):
            finding = {
                "type": "pii_outbound_scan",
                "verdict": result["verdict"],
                "mode": mode,
                "count": len(result["findings"]),
                "details": result["findings"][:5],  # cap to first 5
            }
            peer = _maybe_critic_peer_consult("pii_outbound_scan",
                                              str(result["findings"][:2]), "identity-critic")
            if peer:
                finding["peer_dialogue"] = peer
            findings.append(finding)
    except Exception as e:
        sys.stderr.write(f"[rq228-critic] pii_scanner failed silently: {e}\n")

    # Cat 4 — Cohort bleed (needs recipient)
    if recipient:
        try:
            from cohort_bleed_detector import evaluate as cohort_eval
            mode = _get_rule_mode("cohort_bleed", default="warn")
            result = cohort_eval(body, recipient, mode=mode)
            if result.get("findings"):
                findings.append({
                    "type": "cohort_bleed",
                    "verdict": result["verdict"],
                    "mode": mode,
                    "recipient_cohort": result.get("recipient_cohort"),
                    "count": result["count"],
                    "details": result["findings"][:3],
                })
        except Exception as e:
            sys.stderr.write(f"[rq228-critic] cohort_bleed_detector failed silently: {e}\n")

    # Cat 3 — Aggregation truth
    try:
        from aggregation_truth_critic import audit_body
        mode = _get_rule_mode("aggregation_truth", default="enrich")
        result = audit_body(body, mode=mode)
        if result.get("count", 0) > 0:
            findings.append({
                "type": "aggregation_truth",
                "verdict": result["verdict"],
                "mode": mode,
                "count": result["count"],
                "details": result["findings"][:3],
            })
    except Exception as e:
        sys.stderr.write(f"[rq228-critic] aggregation_truth_critic failed silently: {e}\n")

    return findings


def main():
    parser = argparse.ArgumentParser(description="RQ-220 pre-send verification hook")
    parser.add_argument("--payload", default="", help="Tool call payload (string)")
    parser.add_argument("--payload-file", help="Read payload from file")
    parser.add_argument("--conversation-context", default="",
                        help="Recent conversation text (for blast-radius heuristic)")
    parser.add_argument("--override", action="store_true",
                        help="Skip enforcement (logs but does not block)")
    parser.add_argument("--check-outbound-shape", action="store_true",
                        help="Exit 0 if command does NOT match outbound shape (skip verification)")
    args = parser.parse_args()

    payload = args.payload
    if args.payload_file:
        payload = Path(args.payload_file).read_text()

    if args.check_outbound_shape and not is_outbound_command(payload):
        return 0  # not an outbound shape; skip

    findings = run_checks(payload, args.conversation_context)
    warnings = run_warn_checks(payload)

    record = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "payload_chars": len(payload),
        "findings_count": len(findings),
        "findings": findings,
        "warnings_count": len(warnings),
        "warnings": warnings,
        "override": args.override,
        "verdict": "PASS" if not findings else ("OVERRIDE_PASS" if args.override else "BLOCKED"),
    }
    append_log(record)

    if warnings:
        print(json.dumps({"verdict": "WARN", "warnings": warnings},
                         indent=2), file=sys.stderr)
    if findings:
        # Block-with-feedback mode (default): exit 2 → CC surfaces stderr to
        # the agent so it can self-correct. The legacy exit-1-aborts behavior
        # is preserved behind PRE_SEND_LEGACY_EXIT=1 for emergency fallback.
        # Port of pi-vs-claude-code's damage-control-continue pattern.
        agent_feedback = {
            "verdict": record["verdict"],
            "mode": "block-with-feedback",
            "instruction_to_agent": (
                "The tool call was blocked by pre_send_verification. "
                "Read each finding's `fix` field below, apply the correction, "
                "and retry the tool call. Do NOT bypass with --override unless "
                "the operator has explicitly confirmed the verdict is wrong."
            ),
            "findings": findings,
        }
        print(json.dumps(agent_feedback, indent=2), file=sys.stderr)
        if args.override:
            return 0
        if os.environ.get("PRE_SEND_LEGACY_EXIT") == "1":
            return 1  # legacy: user-visible abort
        return 2  # default: block + surface stderr to model (CC convention)
    return 0


if __name__ == "__main__":
    sys.exit(main())
