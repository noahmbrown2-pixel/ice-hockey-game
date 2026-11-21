#!/usr/bin/env python3
"""memory_pruner — propose-only stale-topic-file scanner.

Called from stop.py at most once per 24h via marker file. Fast (<50ms on
~150 files), non-blocking, fail-silent per .claude/rules/infrastructure/
hooks-observability.md.

Reads:  $MEMORY_ROOT/*.md
Writes: $MEMORY_ROOT/memory_prune_proposal.md  (only when stale files exist)
Marker: $MEMORY_ROOT/.last_prune_scan          (epoch seconds, throttles to 1/24h)

Operator decides whether to act on the proposal — this module NEVER
deletes or moves files. Per article "agent owns its working memory
through curation" — implements the CURATE side without auto-mutation.

Adopted from linguistic-AI-agent-anatomy gap analysis 2026-05-15.
"""
from __future__ import annotations

import os
import time
from pathlib import Path

MEMORY_ROOT = Path(os.environ.get(
    "SUPER_ORCHESTRATOR_MEMORY_ROOT",
    "/home/craigmbrown/.claude/projects/-home-craigmbrown-Project/memory",
))
MARKER_FILE = MEMORY_ROOT / ".last_prune_scan"
PROPOSAL_FILE = MEMORY_ROOT / "memory_prune_proposal.md"
STALE_DAYS = int(os.environ.get("MEMORY_PRUNER_STALE_DAYS", "30"))
THROTTLE_SECONDS = 86400  # 24h
# Files protected from the proposal (always-needed index/manifest files)
PROTECTED = {"MEMORY.md", "memory_prune_proposal.md"}


def _should_run() -> bool:
    """True when marker is missing or older than THROTTLE_SECONDS."""
    try:
        last = MARKER_FILE.stat().st_mtime
    except OSError:
        return True
    return (time.time() - last) >= THROTTLE_SECONDS


def _touch_marker() -> None:
    try:
        MARKER_FILE.write_text(str(int(time.time())), encoding="utf-8")
    except OSError:
        pass


def _scan_stale() -> list[tuple[str, int]]:
    """Return [(filename, days_since_mtime), ...] for *.md files older than STALE_DAYS."""
    out: list[tuple[str, int]] = []
    now = time.time()
    cutoff = STALE_DAYS * 86400
    try:
        for entry in MEMORY_ROOT.iterdir():
            if not entry.is_file() or entry.suffix != ".md":
                continue
            if entry.name in PROTECTED:
                continue
            age = now - entry.stat().st_mtime
            if age >= cutoff:
                out.append((entry.name, int(age // 86400)))
    except OSError:
        return []
    out.sort(key=lambda x: -x[1])  # oldest first
    return out


def _write_proposal(stale: list[tuple[str, int]]) -> None:
    """Render the propose-only consolidation report. NEVER deletes anything."""
    ts = time.strftime("%Y-%m-%d %H:%M UTC", time.gmtime())
    lines = [
        "# Memory Prune Proposal",
        f"_auto-generated {ts} by `.claude/hooks/memory_pruner.py` — propose-only, no auto-delete_",
        "",
        f"Found **{len(stale)} topic files** unread for ≥{STALE_DAYS} days. ",
        "Operator review required. To act: archive (preferred) or delete and ",
        "update `MEMORY.md` index entries.",
        "",
        "## Stale topic files (oldest first)",
        "",
        "| File | Days since mtime |",
        "|---|---|",
    ]
    for name, days in stale[:50]:  # cap render at top 50
        lines.append(f"| `{name}` | {days} |")
    if len(stale) > 50:
        lines.append(f"| _… {len(stale) - 50} more …_ | |")
    lines.extend([
        "",
        "## Recommended action",
        "",
        "1. Open each file. If still load-bearing → `touch` it to bump mtime.",
        "2. If superseded by a newer topic file → archive to `auto-memory-archive/`.",
        "3. If obsolete → delete AND remove the corresponding index line in `MEMORY.md`.",
        "",
        f"Throttle: this scan runs at most once per {THROTTLE_SECONDS // 3600}h. ",
        f"Override with `MEMORY_PRUNER_STALE_DAYS=<n>` env var.",
        "",
        "_Linguistic-AI-agent-anatomy gap #2 — memory curation. RQ-anatomy-pruner._",
    ])
    try:
        PROPOSAL_FILE.write_text("\n".join(lines), encoding="utf-8")
    except OSError:
        pass


def maybe_run() -> dict:
    """Entry point for stop.py. Returns a small status dict for telemetry."""
    if not _should_run():
        return {"ran": False, "reason": "throttled"}
    stale = _scan_stale()
    if stale:
        _write_proposal(stale)
    elif PROPOSAL_FILE.exists():
        # Nothing stale anymore — leave the prior proposal as historical record;
        # don't auto-rewrite to empty. Operator can delete it when reviewed.
        pass
    _touch_marker()
    return {"ran": True, "stale_count": len(stale)}


if __name__ == "__main__":
    # CLI: --force ignores the marker, --dry-run prints without writing
    import sys
    force = "--force" in sys.argv
    dry = "--dry-run" in sys.argv
    if force:
        try:
            MARKER_FILE.unlink()
        except OSError:
            pass
    if dry:
        stale = _scan_stale()
        print(f"Would propose: {len(stale)} stale files (>{STALE_DAYS}d)")
        for name, days in stale[:20]:
            print(f"  {days:>5}d  {name}")
        if len(stale) > 20:
            print(f"  … {len(stale) - 20} more …")
    else:
        result = maybe_run()
        print(result)
