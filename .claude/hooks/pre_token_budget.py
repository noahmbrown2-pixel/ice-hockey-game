#!/usr/bin/env python3
"""Pre-Token-Budget Hook — Citizen-Dev Controls Cat 2.

@REQ-ID: RQ-228 P0-β Task 2.2 | BLP: [Autonomy, Durability, Self-Improvement]
@BLPs: BLP-014 resource_management, BLP-024 data_integrity, BLP-033 efficiency_optimization,
       BLP-039 cost_reduction, BLP-053 resource_reallocation

Pre-flight token + cost estimator for Bash commands invoking LLM CLIs.
Detects `claude -p`, `curl ... openai.com`, `curl ... anthropic.com`, `nano-agent`,
estimates prompt+completion tokens, computes projected $ cost, compares vs
running daily total in budget_tracking.db.

OPERATOR DECISION (2026-05-17): warn-only, no hard cap on day 1.
The hook logs projected cost to .claude/token_budget_log.jsonl and emits a
warn-mode alert when projected > $50/day, but NEVER BLOCKS. Cat 11
override-governance daemon promotes to block-mode only after 14d data warrants.

Per .claude/rules/infrastructure/hooks-observability.md:
- Must NEVER block (we return PASS even in over-budget case during warn-only)
- Fail silently on errors
- < 50ms startup (no heavy ML imports)

To wire: add to .claude/settings.json under hooks.PreToolUse with matcher Bash.
"""
from __future__ import annotations

import json
import os
import re
import sqlite3
import sys
from datetime import datetime, timezone, date
from pathlib import Path

PROJECT_ROOT = Path("/home/craigmbrown/Project")
TOKEN_LOG = PROJECT_ROOT / ".claude" / "token_budget_log.jsonl"
BUDGET_DB = PROJECT_ROOT / "data" / "budget_tracking.db"

# Operator decision 2026-05-17: warn-only default. No block. Env override possible.
WARN_THRESHOLD_USD = float(os.environ.get("TB_TOKEN_DAILY_WARN_USD", "50.0"))
HARD_CAP_USD = float(os.environ.get("TB_TOKEN_DAILY_CAP_USD", "0"))  # 0 = disabled
MODE = os.environ.get("TB_TOKEN_BUDGET_MODE", "warn")  # warn | enrich | block

# Approx cost per 1K tokens (input/output averaged) — refresh periodically
MODEL_COSTS_USD_PER_1K = {
    "claude-opus-4-7": 0.045,
    "claude-sonnet-4-6": 0.009,
    "claude-haiku-4-5": 0.0018,
    "gpt-5-pro": 0.040,
    "gpt-5": 0.010,
    "gpt-5-mini": 0.0015,
    "deepseek-v4-pro": 0.0008,
    "deepseek-v4-flash": 0.0003,
    "grok-4": 0.018,
    "default": 0.010,
}

# Token estimator: ~4 chars per token rule of thumb (no tiktoken import → fast)
def estimate_tokens(text: str) -> int:
    if not text:
        return 0
    return max(1, len(text) // 4)


def detect_llm_call(command: str) -> dict | None:
    """Return {model, prompt_size_chars} if command invokes an LLM, else None."""
    if not command:
        return None
    cmd_lower = command.lower()

    # Pattern 1: claude -p '...prompt...'
    m = re.search(r"\bclaude\s+(?:-[a-z]+\s+|--\S+(?:[=\s]\S+)?\s+)*-p\s+(['\"]?)(.+?)\1\s*$", command, re.DOTALL)
    if m:
        return {
            "tool": "claude_cli",
            "model": _extract_model_from_args(command) or "claude-sonnet-4-6",
            "prompt_size_chars": len(m.group(2)),
        }
    # Simpler fallback: just look for `claude -p`
    if re.search(r"\bclaude\b.*\s-p\b", command):
        return {
            "tool": "claude_cli",
            "model": _extract_model_from_args(command) or "claude-sonnet-4-6",
            "prompt_size_chars": max(len(command) - 20, 1),  # rough
        }
    # Pattern 2: nano-agent / debate / deliberation invocation
    if any(p in cmd_lower for p in ["nano-agent", "nano_agent", "enhanced_deliberation"]):
        return {
            "tool": "nano_agent",
            "model": "default",
            "prompt_size_chars": min(len(command), 8000),  # rough proxy
        }
    # Pattern 3: curl to LLM provider
    for provider, pattern in [
        ("anthropic", "api.anthropic.com"),
        ("openai", "api.openai.com"),
        ("venice", "api.venice.ai"),
        ("grok", "api.x.ai"),
    ]:
        if pattern in cmd_lower:
            return {
                "tool": f"curl_{provider}",
                "model": "default",
                "prompt_size_chars": min(len(command), 4000),
            }
    return None


def _extract_model_from_args(command: str) -> str | None:
    m = re.search(r"--model[\s=]+(\S+)", command)
    if m:
        return m.group(1).strip("'\"")
    if "opus" in command.lower():
        return "claude-opus-4-7"
    if "haiku" in command.lower():
        return "claude-haiku-4-5"
    if "sonnet" in command.lower():
        return "claude-sonnet-4-6"
    return None


def get_daily_running_total() -> float:
    """Return today's spend from budget_tracking.db, or 0 on failure."""
    if not BUDGET_DB.exists():
        return 0.0
    try:
        today = date.today().isoformat()
        with sqlite3.connect(BUDGET_DB, timeout=2.0) as conn:
            # Best-effort: try the most common table layouts
            for query in [
                "SELECT COALESCE(SUM(cost_usd),0) FROM budget_log WHERE date(ts)=?",
                "SELECT COALESCE(SUM(amount_usd),0) FROM spend WHERE date(timestamp)=?",
                "SELECT COALESCE(SUM(cost),0) FROM agent_spend WHERE date(created)=?",
            ]:
                try:
                    cur = conn.execute(query, (today,))
                    row = cur.fetchone()
                    if row and row[0] is not None:
                        return float(row[0])
                except sqlite3.OperationalError:
                    continue
    except Exception:
        pass
    return 0.0


def estimate_cost_usd(model: str, prompt_chars: int, completion_chars: int = 4000) -> float:
    """Estimate $ cost for an LLM call."""
    rate = MODEL_COSTS_USD_PER_1K.get(model, MODEL_COSTS_USD_PER_1K["default"])
    total_tokens = estimate_tokens(str(prompt_chars * "x")) + estimate_tokens(str(completion_chars * "x"))
    # Simpler: just use char-based estimate
    total_tokens = (prompt_chars + completion_chars) // 4
    return (total_tokens / 1000.0) * rate


def append_log(record: dict) -> None:
    """Append to .claude/token_budget_log.jsonl — never raises."""
    try:
        TOKEN_LOG.parent.mkdir(parents=True, exist_ok=True)
        with open(TOKEN_LOG, "a") as f:
            f.write(json.dumps(record) + "\n")
    except Exception:
        pass


def evaluate(command: str, mode: str = MODE) -> dict:
    """Return {verdict, ...details}.

    verdict ∈ {PASS, WARN, BLOCK}
    Default mode=warn (operator decision 2026-05-17) — never blocks.
    """
    detected = detect_llm_call(command)
    if not detected:
        return {"verdict": "PASS", "reason": "no_llm_call_detected", "mode": mode}

    prompt_chars = detected["prompt_size_chars"]
    cost = estimate_cost_usd(detected["model"], prompt_chars)
    running_total = get_daily_running_total()
    projected = running_total + cost

    record = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "tool": detected["tool"],
        "model": detected["model"],
        "prompt_chars": prompt_chars,
        "estimated_cost_usd": round(cost, 4),
        "running_total_usd": round(running_total, 4),
        "projected_total_usd": round(projected, 4),
        "warn_threshold_usd": WARN_THRESHOLD_USD,
        "hard_cap_usd": HARD_CAP_USD,
        "mode": mode,
    }

    # Operator decision: warn-only on day 1
    if mode == "block" and HARD_CAP_USD > 0 and projected > HARD_CAP_USD:
        record["verdict"] = "BLOCK"
        record["reason"] = "projected_exceeds_hard_cap"
    elif projected > WARN_THRESHOLD_USD:
        record["verdict"] = "WARN"
        record["reason"] = "projected_exceeds_warn_threshold"
    else:
        record["verdict"] = "PASS"
        record["reason"] = "under_threshold"

    append_log(record)
    return record


def main() -> int:
    """Entry point for hook invocation."""
    # Hook reads tool input from CLAUDE_TOOL_INPUT or argv
    raw_input_str = os.environ.get("CLAUDE_TOOL_INPUT", "")
    if not raw_input_str and len(sys.argv) > 1:
        raw_input_str = " ".join(sys.argv[1:])

    # Extract command from JSON payload if available
    command = raw_input_str
    try:
        payload = json.loads(raw_input_str)
        if isinstance(payload, dict):
            command = payload.get("command") or payload.get("tool_input", {}).get("command") or raw_input_str
    except (json.JSONDecodeError, TypeError):
        pass

    result = evaluate(command)

    # Per operator decision + hooks-observability rules, NEVER BLOCK in warn mode.
    # Emit verdict to stderr for visibility but exit 0 (PASS) regardless in warn mode.
    if result.get("verdict") == "WARN":
        sys.stderr.write(
            f"[token_budget] WARN: projected ${result['projected_total_usd']} "
            f"> ${result['warn_threshold_usd']} threshold "
            f"(model={result['model']}, est=${result['estimated_cost_usd']}). "
            f"Cat 2 hook is warn-only per operator decision 2026-05-17.\n"
        )
        return 0
    if result.get("verdict") == "BLOCK":
        sys.stderr.write(
            f"[token_budget] BLOCK: projected ${result['projected_total_usd']} "
            f"> hard cap ${result['hard_cap_usd']}\n"
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
