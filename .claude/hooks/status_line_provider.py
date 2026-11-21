#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "python-dotenv",
# ]
# ///
"""
StatusLine Provider - Real-time context indicators for Continuous-Claude-v2.

Provides StatusLine data showing:
- Token count (estimated)
- Context percentage
- Git branch
- Warning level

This integrates with Claude Code's status line display to provide
real-time context awareness during conversations.

Part of Continuous-Claude-v2 Integration (December 2025)
"""

import json
import os
import sys
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional

# Add hooks directory to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Import context utilities
try:
    from utils.context_estimator import (
        get_context_state,
        calculate_context_percentage,
        DEFAULT_MAX_CONTEXT
    )
    from context_monitor import get_warning_level, update_statusline_data
    CONTEXT_UTILS_AVAILABLE = True
except ImportError:
    CONTEXT_UTILS_AVAILABLE = False
    DEFAULT_MAX_CONTEXT = 200000

# Configuration
STATE_DIR = Path("/home/craigmbrown/Project/.claude/data/context_state")
STATUSLINE_FILE = STATE_DIR / "statusline.json"
PROJECT_ROOT = Path("/home/craigmbrown/Project")


def get_git_branch() -> str:
    """Get current git branch name."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True,
            text=True,
            timeout=2,
            cwd=PROJECT_ROOT
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except Exception:
        pass
    return "unknown"


def get_git_status_summary() -> str:
    """Get brief git status (modified/staged counts)."""
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True,
            text=True,
            timeout=5,
            cwd=PROJECT_ROOT
        )
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n') if result.stdout.strip() else []
            modified = sum(1 for l in lines if l.startswith(' M') or l.startswith('M '))
            staged = sum(1 for l in lines if l.startswith('A ') or l.startswith('M '))
            untracked = sum(1 for l in lines if l.startswith('??'))

            parts = []
            if modified:
                parts.append(f"{modified}M")
            if staged:
                parts.append(f"{staged}S")
            if untracked:
                parts.append(f"{untracked}?")
            return "+".join(parts) if parts else "clean"
    except Exception:
        pass
    return ""


def get_statusline_data(session_id: str = "unknown") -> Dict[str, Any]:
    """
    Get complete StatusLine data for display.

    Args:
        session_id: Session identifier

    Returns:
        Dict with StatusLine data
    """
    # Get context state
    if CONTEXT_UTILS_AVAILABLE:
        context_state = get_context_state(session_id)
        token_count = context_state.get("estimated_tokens", 0)
        context_pct = context_state.get("context_percentage", 0.0)
        warning_level, _, _ = get_warning_level(context_pct)
    else:
        token_count = 0
        context_pct = 0.0
        warning_level = "none"

    # Get git info
    git_branch = get_git_branch()
    git_status = get_git_status_summary()

    # Build StatusLine data
    data = {
        "session_id": session_id,
        "timestamp": datetime.now().isoformat(),
        "context": {
            "token_count": token_count,
            "percentage": round(context_pct, 1),
            "max_tokens": DEFAULT_MAX_CONTEXT,
            "warning_level": warning_level
        },
        "git": {
            "branch": git_branch,
            "status": git_status
        },
        "display": format_statusline_display(token_count, context_pct, git_branch, warning_level)
    }

    return data


def format_statusline_display(
    token_count: int,
    context_pct: float,
    git_branch: str,
    warning_level: str
) -> str:
    """
    Format StatusLine data for display.

    Args:
        token_count: Estimated token count
        context_pct: Context usage percentage
        git_branch: Current git branch
        warning_level: Warning level (none/warning/high/critical)

    Returns:
        Formatted StatusLine string
    """
    # Warning indicators
    warning_indicators = {
        "none": "",
        "warning": " [!]",
        "high": " [!!]",
        "critical": " [!!!]"
    }

    # Format token count with K suffix for readability
    if token_count >= 1000:
        token_str = f"{token_count/1000:.1f}K"
    else:
        token_str = str(token_count)

    # Build display string
    warning_ind = warning_indicators.get(warning_level, "")
    display = f"[{token_str} | {context_pct:.0f}%{warning_ind}] {git_branch}"

    return display


def save_statusline_data(data: Dict[str, Any]) -> Path:
    """
    Save StatusLine data to file.

    Args:
        data: StatusLine data dict

    Returns:
        Path to saved file
    """
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    with open(STATUSLINE_FILE, 'w') as f:
        json.dump(data, f, indent=2)

    return STATUSLINE_FILE


def load_statusline_data() -> Optional[Dict[str, Any]]:
    """
    Load most recent StatusLine data from file.

    Returns:
        StatusLine data if available
    """
    if STATUSLINE_FILE.exists():
        try:
            with open(STATUSLINE_FILE, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    return None


def update_and_get_statusline(session_id: str = "unknown") -> Dict[str, Any]:
    """
    Update StatusLine data and return it.

    Args:
        session_id: Session identifier

    Returns:
        Updated StatusLine data
    """
    data = get_statusline_data(session_id)
    save_statusline_data(data)
    return data


def self_test() -> bool:
    """Run self-test to verify functionality."""
    print("Running status_line_provider self-test...")

    # Test 1: Git branch retrieval
    branch = get_git_branch()
    assert branch, "Git branch should not be empty"
    print(f"  [PASS] Git branch: {branch}")

    # Test 2: Git status summary
    status = get_git_status_summary()
    print(f"  [PASS] Git status: {status if status else 'clean'}")

    # Test 3: StatusLine data generation
    data = get_statusline_data("test-session-sl")
    assert "context" in data, "Should have context section"
    assert "git" in data, "Should have git section"
    assert "display" in data, "Should have display string"
    print(f"  [PASS] StatusLine data: {list(data.keys())}")

    # Test 4: Display formatting
    display = format_statusline_display(45000, 22.5, "main", "none")
    assert "45.0K" in display, "Should format token count with K"
    assert "22%" in display or "23%" in display, "Should show percentage"
    assert "main" in display, "Should show branch"
    print(f"  [PASS] Display format: {display}")

    # Test 5: Warning level display
    display_warn = format_statusline_display(150000, 75.0, "feature/test", "warning")
    assert "[!]" in display_warn, "Should show warning indicator"
    print(f"  [PASS] Warning display: {display_warn}")

    display_crit = format_statusline_display(190000, 95.0, "main", "critical")
    assert "[!!!]" in display_crit, "Should show critical indicator"
    print(f"  [PASS] Critical display: {display_crit}")

    # Test 6: Save and load
    saved_path = save_statusline_data(data)
    assert saved_path.exists(), "StatusLine file should exist"
    loaded = load_statusline_data()
    assert loaded is not None, "Should load saved data"
    assert loaded["session_id"] == data["session_id"], "Session ID should match"
    print(f"  [PASS] Save/Load: {saved_path.name}")

    # Test 7: Update and get
    updated = update_and_get_statusline("test-session-update")
    assert updated["session_id"] == "test-session-update", "Should update session ID"
    print(f"  [PASS] Update and get: session_id={updated['session_id']}")

    print("\n[SUCCESS] All status_line_provider tests passed!")
    return True


def main():
    """Main entry point for CLI usage."""
    import argparse

    parser = argparse.ArgumentParser(description="StatusLine Provider for Continuous-Claude-v2")
    parser.add_argument("--test", action="store_true", help="Run self-test")
    parser.add_argument("--get", type=str, metavar="SESSION_ID", help="Get StatusLine data for session")
    parser.add_argument("--display", type=str, metavar="SESSION_ID", help="Get display string only")
    parser.add_argument("--update", type=str, metavar="SESSION_ID", help="Update and get StatusLine data")
    parser.add_argument("--json", action="store_true", help="Output as JSON")

    args = parser.parse_args()

    if args.test:
        self_test()
    elif args.get:
        data = get_statusline_data(args.get)
        if args.json:
            print(json.dumps(data, indent=2))
        else:
            print(f"Session: {data['session_id']}")
            print(f"Context: {data['context']['token_count']} tokens ({data['context']['percentage']}%)")
            print(f"Warning: {data['context']['warning_level']}")
            print(f"Git: {data['git']['branch']} ({data['git']['status']})")
            print(f"Display: {data['display']}")
    elif args.display:
        data = get_statusline_data(args.display)
        print(data['display'])
    elif args.update:
        data = update_and_get_statusline(args.update)
        if args.json:
            print(json.dumps(data, indent=2))
        else:
            print(data['display'])
    else:
        # Default: show current StatusLine
        loaded = load_statusline_data()
        if loaded:
            print(loaded['display'])
        else:
            print("[0 | 0%] " + get_git_branch())


if __name__ == "__main__":
    main()
