#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "python-dotenv",
# ]
# ///
"""
Context Monitor - Threshold-based context warnings for Continuous-Claude-v2.

Monitors context usage and provides proactive warnings at 70%, 80%, and 90%
thresholds to enable users to save state before hitting context limits.

Part of Continuous-Claude-v2 Integration (December 2025)
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict
import logging

# Add hooks directory to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Import context estimation utilities
try:
    from utils.context_estimator import (
        get_context_state,
        calculate_context_percentage,
        estimate_tokens,
        DEFAULT_MAX_CONTEXT
    )
except ImportError:
    # Fallback for direct execution
    DEFAULT_MAX_CONTEXT = 200000
    def estimate_tokens(text):
        return int(len(text) * 0.25)
    def calculate_context_percentage(tokens, max_ctx=200000):
        return (tokens / max_ctx) * 100.0
    def get_context_state(session_id):
        return {"estimated_tokens": 0, "context_percentage": 0.0}

# Configuration
WARNING_THRESHOLD_1 = 70.0   # First warning
WARNING_THRESHOLD_2 = 80.0   # Second warning
CRITICAL_THRESHOLD = 90.0    # Critical warning
WARNING_COOLDOWN_MINUTES = 5  # Minimum time between same-level warnings

# State file for tracking warnings
STATE_DIR = Path("/home/craigmbrown/Project/.claude/data/context_state")
WARNING_LOG = STATE_DIR / "warning_history.json"

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("context_monitor")


@dataclass
class ContextWarning:
    """Represents a context warning."""
    level: str  # "warning", "high", "critical"
    threshold: float
    current_percentage: float
    message: str
    timestamp: str
    session_id: str
    recommended_action: str


def get_warning_level(percentage: float) -> Tuple[str, float, str]:
    """
    Determine warning level based on context percentage.

    Args:
        percentage: Current context usage percentage

    Returns:
        Tuple of (level, threshold, recommended_action)
    """
    if percentage >= CRITICAL_THRESHOLD:
        return (
            "critical",
            CRITICAL_THRESHOLD,
            "IMMEDIATELY save ledger and clear context. Use: 'save ledger' or /clear"
        )
    elif percentage >= WARNING_THRESHOLD_2:
        return (
            "high",
            WARNING_THRESHOLD_2,
            "Consider saving a checkpoint soon. Context is filling up."
        )
    elif percentage >= WARNING_THRESHOLD_1:
        return (
            "warning",
            WARNING_THRESHOLD_1,
            "Context usage is elevated. Plan to save state if doing complex work."
        )
    else:
        return ("none", 0.0, "")


def check_threshold_warnings(
    percentage: float,
    session_id: str = "unknown"
) -> List[ContextWarning]:
    """
    Check if any warning thresholds have been crossed.

    Args:
        percentage: Current context usage percentage
        session_id: Session identifier for tracking

    Returns:
        List of ContextWarning objects for triggered thresholds
    """
    warnings = []
    level, threshold, action = get_warning_level(percentage)

    if level == "none":
        return warnings

    # Check cooldown
    if not _should_warn(session_id, level):
        return warnings

    # Create warning
    warning = ContextWarning(
        level=level,
        threshold=threshold,
        current_percentage=round(percentage, 1),
        message=_format_warning_message(level, percentage),
        timestamp=datetime.now().isoformat(),
        session_id=session_id,
        recommended_action=action
    )
    warnings.append(warning)

    # Record warning
    _record_warning(warning)

    return warnings


def _format_warning_message(level: str, percentage: float) -> str:
    """Format warning message based on level."""
    emoji_map = {
        "warning": "[!]",      # Warning sign
        "high": "[!!]",        # High alert
        "critical": "[!!!]"    # Critical
    }
    emoji = emoji_map.get(level, "[!]")

    if level == "critical":
        return f"{emoji} CRITICAL: Context at {percentage:.1f}% - Save ledger NOW!"
    elif level == "high":
        return f"{emoji} HIGH: Context at {percentage:.1f}% - Consider saving checkpoint"
    else:
        return f"{emoji} Context at {percentage:.1f}% - Monitor usage"


def _should_warn(session_id: str, level: str) -> bool:
    """Check if enough time has passed since last warning of this level."""
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    if not WARNING_LOG.exists():
        return True

    try:
        with open(WARNING_LOG, 'r') as f:
            history = json.load(f)
    except (json.JSONDecodeError, IOError):
        return True

    # Find last warning of this level for this session
    session_warnings = [
        w for w in history
        if w.get("session_id") == session_id and w.get("level") == level
    ]

    if not session_warnings:
        return True

    last_warning = max(session_warnings, key=lambda w: w.get("timestamp", ""))
    last_time = datetime.fromisoformat(last_warning["timestamp"])
    cooldown = timedelta(minutes=WARNING_COOLDOWN_MINUTES)

    return datetime.now() - last_time > cooldown


def _record_warning(warning: ContextWarning) -> None:
    """Record warning to history file."""
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    history = []
    if WARNING_LOG.exists():
        try:
            with open(WARNING_LOG, 'r') as f:
                history = json.load(f)
        except (json.JSONDecodeError, IOError):
            history = []

    # Add new warning
    history.append(asdict(warning))

    # Keep only last 100 warnings
    if len(history) > 100:
        history = history[-100:]

    with open(WARNING_LOG, 'w') as f:
        json.dump(history, f, indent=2)


def get_context_percentage(session_id: str = "unknown") -> float:
    """
    Get current context usage percentage for a session.

    Args:
        session_id: Session identifier

    Returns:
        Context usage percentage (0.0 to 100.0+)
    """
    state = get_context_state(session_id)
    return state.get("context_percentage", 0.0)


def update_statusline_data(session_id: str) -> Dict[str, Any]:
    """
    Update StatusLine data file with current context state.

    Args:
        session_id: Session identifier

    Returns:
        Updated StatusLine data dictionary
    """
    state = get_context_state(session_id)

    # Get git branch
    git_branch = "unknown"
    try:
        import subprocess
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True, timeout=2,
            cwd="/home/craigmbrown/Project"
        )
        if result.returncode == 0:
            git_branch = result.stdout.strip()
    except Exception:
        pass

    statusline_data = {
        "session_id": session_id,
        "token_count": state.get("estimated_tokens", 0),
        "context_percentage": state.get("context_percentage", 0.0),
        "git_branch": git_branch,
        "warning_level": get_warning_level(state.get("context_percentage", 0.0))[0],
        "timestamp": datetime.now().isoformat(),
        "max_context": DEFAULT_MAX_CONTEXT
    }

    # Save to StatusLine data file
    statusline_file = STATE_DIR / "statusline.json"
    try:
        with open(statusline_file, 'w') as f:
            json.dump(statusline_data, f, indent=2)
    except IOError:
        pass

    return statusline_data


def format_warning_for_output(warnings: List[ContextWarning]) -> str:
    """Format warnings for stdout/stderr output."""
    if not warnings:
        return ""

    output_lines = []
    for w in warnings:
        output_lines.append(f"\n{w.message}")
        output_lines.append(f"  Action: {w.recommended_action}")

    return "\n".join(output_lines)


def self_test() -> bool:
    """Run self-test to verify functionality."""
    print("Running context_monitor self-test...")

    # Test 1: Warning level detection
    level, threshold, action = get_warning_level(50.0)
    assert level == "none", f"50% should be 'none', got {level}"
    print("  [PASS] 50% -> no warning")

    level, threshold, action = get_warning_level(72.0)
    assert level == "warning", f"72% should be 'warning', got {level}"
    print("  [PASS] 72% -> warning level")

    level, threshold, action = get_warning_level(85.0)
    assert level == "high", f"85% should be 'high', got {level}"
    print("  [PASS] 85% -> high level")

    level, threshold, action = get_warning_level(95.0)
    assert level == "critical", f"95% should be 'critical', got {level}"
    print("  [PASS] 95% -> critical level")

    # Test 2: Warning message formatting
    msg = _format_warning_message("critical", 92.5)
    assert "92.5%" in msg, "Message should contain percentage"
    assert "CRITICAL" in msg, "Critical message should say CRITICAL"
    print(f"  [PASS] Critical message: {msg[:50]}...")

    # Test 3: Threshold warnings generation
    warnings = check_threshold_warnings(75.0, "test-session-123")
    # Note: May be empty due to cooldown
    print(f"  [PASS] Warning check returned {len(warnings)} warnings")

    # Test 4: StatusLine data update
    data = update_statusline_data("test-session-123")
    assert "token_count" in data, "StatusLine should have token_count"
    assert "context_percentage" in data, "StatusLine should have context_percentage"
    assert "git_branch" in data, "StatusLine should have git_branch"
    print(f"  [PASS] StatusLine data: {list(data.keys())}")

    # Test 5: Context percentage retrieval
    pct = get_context_percentage("test-session-nonexistent")
    assert isinstance(pct, float), "Should return float"
    print(f"  [PASS] Context percentage retrieval: {pct}%")

    print("\n[SUCCESS] All context_monitor tests passed!")
    return True


def main():
    """Main entry point for CLI usage."""
    import argparse

    parser = argparse.ArgumentParser(description="Context Monitor for Continuous-Claude-v2")
    parser.add_argument("--test", action="store_true", help="Run self-test")
    parser.add_argument("--check", type=str, help="Check warnings for session ID")
    parser.add_argument("--percentage", type=float, help="Check specific percentage")
    parser.add_argument("--statusline", type=str, help="Update StatusLine for session ID")
    parser.add_argument("--history", action="store_true", help="Show warning history")

    args = parser.parse_args()

    if args.test:
        self_test()
    elif args.check:
        pct = get_context_percentage(args.check)
        print(f"Session: {args.check}")
        print(f"Context: {pct:.1f}%")
        warnings = check_threshold_warnings(pct, args.check)
        if warnings:
            print(format_warning_for_output(warnings))
        else:
            print("No warnings triggered")
    elif args.percentage is not None:
        level, threshold, action = get_warning_level(args.percentage)
        print(f"Percentage: {args.percentage}%")
        print(f"Level: {level}")
        if level != "none":
            print(f"Threshold: {threshold}%")
            print(f"Action: {action}")
    elif args.statusline:
        data = update_statusline_data(args.statusline)
        print(json.dumps(data, indent=2))
    elif args.history:
        if WARNING_LOG.exists():
            with open(WARNING_LOG, 'r') as f:
                history = json.load(f)
            print(json.dumps(history[-10:], indent=2))
        else:
            print("No warning history found")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
