#!/usr/bin/env python3
# RQ-200: damage_control_l4.py
# Inspired by disler/pi-vs-claude-code damage-control extension
# Per design: .claude/designs/design-rq-200-bash-damage-control-l4.md §3.2
# BLP: [Alignment, Autonomy, Durability, Self-Replication]
"""L4 whitelist hook with soft (internal) and hard (marketplace) block modes.

Loaded by .claude/hooks/pre_tool_use.py. Pure function, no I/O outside YAML read.

Public API:
    apply_damage_control_l4(tool_name: str, tool_input: dict, agent_context: dict) -> dict

Returns:
    {
      "block": bool,             # True = block this tool call
      "reason": str,             # Human-readable reason (used in soft feedback)
      "mode": "soft" | "hard",   # How the caller should propagate the block
      "policy": "internal" | "marketplace",  # Which policy was applied
    }

Failure modes:
    - YAML parse error / missing file: returns {block: False, reason: "...", mode: "soft", policy: "fallback"}
      UNLESS env STRICT_DAMAGE_CONTROL=1, in which case fail-closed.
"""

import os
import re
import time
from pathlib import Path

try:
    import yaml  # PyYAML; falls back gracefully if missing
    HAVE_YAML = True
except ImportError:
    HAVE_YAML = False

RULES_FILE = Path(__file__).parent / "damage-control-rules.yaml"
CACHE_TTL_SEC = 60
STRICT = os.environ.get("STRICT_DAMAGE_CONTROL", "0") == "1"

# Module-level cache: (loaded_at_epoch, parsed_dict)
_cache: dict = {"loaded_at": 0.0, "rules": None}

PATH_TOOLS = {"Read", "Write", "Edit", "MultiEdit", "NotebookEdit"}
WRITE_TOOLS = {"Write", "Edit", "MultiEdit", "NotebookEdit"}


def _load_rules() -> dict:
    """Load YAML with 60s in-process cache. Fails open by default, closed under STRICT."""
    now = time.time()
    if _cache["rules"] is not None and (now - _cache["loaded_at"]) < CACHE_TTL_SEC:
        return _cache["rules"]
    if not HAVE_YAML:
        return {"_load_error": "PyYAML not available"}
    if not RULES_FILE.exists():
        return {"_load_error": f"rules file missing: {RULES_FILE}"}
    try:
        with RULES_FILE.open() as f:
            data = yaml.safe_load(f) or {}
        _cache["loaded_at"] = now
        _cache["rules"] = data
        return data
    except Exception as e:
        return {"_load_error": f"yaml parse error: {e}"}


def _select_policy(agent_context: dict) -> str:
    """Pick 'marketplace' if the agent is operating under a BlindOracle passport,
    else 'internal'. Inspects DELEGATION_CONTEXT-style fields if present."""
    if not isinstance(agent_context, dict):
        return "internal"
    scope = (agent_context.get("delegation_scope") or "").lower()
    if "blindoracle" in scope or "marketplace" in scope:
        return "marketplace"
    passport = (agent_context.get("delegator_passport_kind") or "").lower()
    if "marketplace" in passport or "external" in passport:
        return "marketplace"
    return "internal"


def _check_compound_shell(command: str, ops: list) -> str:
    """Return the first compound-shell op found in `command`, or '' if none."""
    for op in ops:
        if op in command:
            return op
    return ""


def _matches_any(value: str, patterns: list) -> str:
    """Return the first regex pattern in `patterns` that fullmatches `value`,
    or '' if none. Uses re.fullmatch via anchored regex semantics."""
    for pat in patterns:
        try:
            if re.fullmatch(pat, value):
                return pat
        except re.error:
            # malformed regex in YAML -- skip but log via reason in caller
            continue
    return ""


def _matches_any_search(value: str, patterns: list) -> str:
    """Return the first regex pattern in `patterns` that matches anywhere in `value`."""
    for pat in patterns:
        try:
            if re.search(pat, value):
                return pat
        except re.error:
            continue
    return ""


def apply_damage_control_l4(tool_name: str, tool_input: dict, agent_context: dict) -> dict:
    """Main entrypoint. See module docstring."""
    if not isinstance(tool_input, dict):
        tool_input = {}

    rules = _load_rules()

    # Fail-open / fail-closed switch
    if "_load_error" in rules:
        if STRICT:
            return {
                "block": True,
                "reason": f"[DAMAGE_CONTROL] STRICT mode: rules load failed -- {rules['_load_error']}",
                "mode": "hard",
                "policy": "fallback",
            }
        return {
            "block": False,
            "reason": f"[DAMAGE_CONTROL] WARNING: rules load failed (fail-open) -- {rules['_load_error']}",
            "mode": "soft",
            "policy": "fallback",
        }

    policy_name = _select_policy(agent_context or {})
    policy = (rules.get("policies") or {}).get(policy_name) or {}
    if not policy:
        # Unknown policy -- fail-open with warning unless STRICT
        if STRICT:
            return {
                "block": True,
                "reason": f"[DAMAGE_CONTROL] STRICT mode: policy '{policy_name}' missing",
                "mode": "hard",
                "policy": policy_name,
            }
        return {
            "block": False,
            "reason": f"[DAMAGE_CONTROL] policy '{policy_name}' missing -- defaulting to allow",
            "mode": "soft",
            "policy": policy_name,
        }

    block_mode = policy.get("block_mode", "soft")

    # RQ-201 L5: MCP-tool gating check. When tool_name matches the
    # harness's mcp__<server>__<tool> shape AND policy declares an
    # allowedMcpTools whitelist, hard-block any tool not in the list.
    # The whitelist entries are "<server>__<tool>" (we strip mcp__).
    if tool_name.startswith("mcp__") and "allowedMcpTools" in policy:
        stripped = tool_name[len("mcp__"):]  # "<server>__<tool>"
        allowed_mcp = policy.get("allowedMcpTools") or []
        if stripped not in allowed_mcp:
            return {
                "block": True,
                "reason": (
                    f"[DAMAGE_CONTROL] MCP tool '{tool_name}' is not in "
                    f"allowedMcpTools for policy '{policy_name}'. "
                    f"Per RQ-201 L5, marketplace agents may only invoke "
                    f"the 3 canonical narrow tools."
                ),
                "mode": "hard",
                "policy": policy_name,
            }
        return {
            "block": False,
            "reason": f"[DAMAGE_CONTROL] mcp tool '{stripped}' allowed by allowedMcpTools",
            "mode": block_mode,
            "policy": policy_name,
        }

    # Bash check
    if tool_name == "Bash":
        cmd = (tool_input.get("command") or "").strip()
        if not cmd:
            return {"block": False, "reason": "", "mode": block_mode, "policy": policy_name}

        # 1. Whitelist FIRST -- pinned exact shapes get short-circuited through.
        #    This is critical for cases like `python3 -c "import ast; ast.parse(...)"`
        #    where the `;` is a Python statement separator inside a quoted string,
        #    NOT a shell separator. Only the explicitly-pinned shape is allowed;
        #    any other `python -c` invocation falls through to the compound-op /
        #    not-in-allowlist checks below and is blocked.
        allow = policy.get("bashAllowList") or []
        match = _matches_any(cmd, allow)
        if match:
            return {
                "block": False,
                "reason": f"[DAMAGE_CONTROL] allowed by '{match}'",
                "mode": block_mode,
                "policy": policy_name,
            }

        # 2. Compound shell ops pre-reject (disler rule).
        #    Sorted longest-first so e.g. '$((' matches before '$(' and '<<' before '<'.
        compound_ops = sorted(policy.get("compoundShellOps") or [], key=len, reverse=True)
        op = _check_compound_shell(cmd, compound_ops)
        if op:
            return {
                "block": True,
                "reason": (
                    f"[DAMAGE_CONTROL] command contains compound shell op '{op}' "
                    f"which is not permitted under policy '{policy_name}'. "
                    "DO NOT retry with a similar command -- choose a different approach "
                    "(e.g., split into separate Bash calls, or use a Python tool instead)."
                ),
                "mode": block_mode,
                "policy": policy_name,
            }

        # 3. Not in allowlist and not a compound op -> block as unrecognized
        return {
            "block": True,
            "reason": (
                f"[DAMAGE_CONTROL] command '{cmd[:80]}{'...' if len(cmd) > 80 else ''}' "
                f"is not in bashAllowList for policy '{policy_name}'. "
                "DO NOT retry this command -- if you need this capability, "
                "use the available file tools (Read/Write/Edit) or ask the operator."
            ),
            "mode": block_mode,
            "policy": policy_name,
        }

    # Path-based checks for file tools
    if tool_name in PATH_TOOLS:
        path = tool_input.get("file_path") or ""

        # zeroAccessPaths -- block read AND write
        zap = _matches_any_search(path, policy.get("zeroAccessPaths") or [])
        if zap:
            return {
                "block": True,
                "reason": (
                    f"[DAMAGE_CONTROL] path '{path}' is in zeroAccessPaths "
                    f"(matched '{zap}') -- access denied under policy '{policy_name}'."
                ),
                "mode": block_mode,
                "policy": policy_name,
            }

        # readOnlyPaths -- block writes/edits only
        if tool_name in WRITE_TOOLS:
            rop = _matches_any_search(path, policy.get("readOnlyPaths") or [])
            if rop:
                return {
                    "block": True,
                    "reason": (
                        f"[DAMAGE_CONTROL] path '{path}' is read-only "
                        f"(matched '{rop}') -- write/edit denied under policy '{policy_name}'."
                    ),
                    "mode": block_mode,
                    "policy": policy_name,
                }

        # readOnlyPaths for READ tool: under marketplace policy, "read-only" means
        # "may NOT read these paths" (the entire FS is readOnly except ./target/).
        # Under internal policy, readOnly means "may read but not write" (writes
        # already handled above; reads pass through). So the marketplace-style
        # blanket-readOnly check applies only when block_mode=hard.
        if tool_name == "Read" and block_mode == "hard":
            rop = _matches_any(path, policy.get("readOnlyPaths") or [])
            if rop:
                return {
                    "block": True,
                    "reason": (
                        f"[DAMAGE_CONTROL] path '{path}' is outside the marketplace "
                        f"sandbox (matched readOnlyPaths '{rop}') -- read denied."
                    ),
                    "mode": block_mode,
                    "policy": policy_name,
                }

        return {"block": False, "reason": "", "mode": block_mode, "policy": policy_name}

    # Other tools (Grep, Glob, WebFetch, Task, etc.) -- not gated by L4 yet
    return {"block": False, "reason": "", "mode": block_mode, "policy": policy_name}


def reset_cache() -> None:
    """Force reload on next call. Useful for tests."""
    _cache["loaded_at"] = 0.0
    _cache["rules"] = None


if __name__ == "__main__":
    # CLI smoke test
    import json
    import sys

    if len(sys.argv) < 3:
        print("usage: damage_control_l4.py <tool_name> '<json_input>' [<json_agent_context>]")
        sys.exit(2)
    tn = sys.argv[1]
    ti = json.loads(sys.argv[2])
    ac = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
    result = apply_damage_control_l4(tn, ti, ac)
    print(json.dumps(result, indent=2))
    sys.exit(2 if result["block"] and result["mode"] == "hard" else 0)
