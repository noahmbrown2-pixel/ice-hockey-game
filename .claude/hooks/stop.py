#!/usr/bin/env python3
"""Stop hook — logs session completion. Called when Claude Code stops.

RQ-215 (2026-05-14): emits `terminalSequence` JSON field (CC 2.1.141+) so
cron/daemon-spawned sessions can surface their completion via window-title
and bell without a controlling terminal. Respects WhatsApp P0-only rule —
this is the lightweight visibility surface for everything below P0.
"""
import json
import os
import sys
from datetime import datetime, timezone


def _build_terminal_sequence(session_id: str, stop_reason: str) -> str:
    """RQ-215: build OSC-0 (window title) sequence.

    Uses xterm OSC-0 escape: ESC ]0; <title> BEL — universally supported
    by tmux, screen, gnome-terminal, iTerm2, and Windows Terminal.
    """
    short_sid = (session_id or "session")[:8]
    label = "OK" if stop_reason in ("user", "completed", "unknown") else "ERR"
    title = f"TB:{label}:{short_sid}"
    # \x1b]0;TITLE\x07 — OSC 0 + BEL
    return f"\x1b]0;{title}\x07"


def main():
    try:
        data = json.load(sys.stdin) if not sys.stdin.isatty() else {}
    except Exception:
        data = {}

    timestamp = datetime.now(timezone.utc).isoformat()
    stop_reason = data.get("stop_reason", "unknown")
    session_id = data.get("session_id", "unknown")

    response = {
        "timestamp": timestamp,
        "stop_reason": stop_reason,
    }

    # RQ-215: emit terminalSequence only when CC 2.1.141+ feature is supported.
    # The flag CC_HOOK_TERMINAL_SEQUENCE=1 in env gates this — set by the
    # super_orchestrator-daemon.service tier-a-live.conf override.
    if os.environ.get("CC_HOOK_TERMINAL_SEQUENCE") == "1":
        response["terminalSequence"] = _build_terminal_sequence(session_id, stop_reason)

    # Linguistic-AI-agent-anatomy gap #2 (2026-05-15): memory curation pass.
    # Propose-only, throttled to 1/24h, fail-silent. <50ms on ~150 files.
    # Disable with MEMORY_PRUNER_ENABLED=0.
    if os.environ.get("MEMORY_PRUNER_ENABLED", "1") == "1":
        try:
            from memory_pruner import maybe_run as _prune_maybe_run  # type: ignore
            _prune_result = _prune_maybe_run()
            if _prune_result.get("ran") and _prune_result.get("stale_count", 0) > 0:
                response["memory_prune_proposal"] = {
                    "stale_count": _prune_result["stale_count"],
                }
        except Exception:
            pass  # never block on memory pruning

    print(json.dumps(response))


if __name__ == "__main__":
    main()
