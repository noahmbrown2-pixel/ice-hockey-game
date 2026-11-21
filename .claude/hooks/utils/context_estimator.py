#!/usr/bin/env python3
"""
Context Estimator - Token and context percentage estimation for Continuous-Claude-v2.

Provides utilities to estimate token counts and context usage percentages
for proactive context management and warnings.

Part of Continuous-Claude-v2 Integration (December 2025)
"""

import json
import os
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime

# Configuration
DEFAULT_MAX_CONTEXT = 200000  # Claude's typical context window
TOKENS_PER_CHAR_ESTIMATE = 0.25  # Conservative estimate (1 token ~ 4 chars)
TOKENS_PER_WORD_ESTIMATE = 1.3  # Alternative word-based estimate

# Session data location
SESSION_DATA_DIR = Path("/home/craigmbrown/Project/.claude/data/sessions")


def estimate_tokens(text: str, method: str = "char") -> int:
    """
    Estimate token count from text.

    Args:
        text: Input text to estimate tokens for
        method: Estimation method - "char" (default) or "word"

    Returns:
        Estimated token count
    """
    if not text:
        return 0

    if method == "word":
        words = len(text.split())
        return int(words * TOKENS_PER_WORD_ESTIMATE)
    else:  # char method (default, more conservative)
        return int(len(text) * TOKENS_PER_CHAR_ESTIMATE)


def get_session_token_count(session_id: str) -> int:
    """
    Get estimated token count for a session's accumulated prompts.

    Args:
        session_id: Session identifier

    Returns:
        Estimated total tokens for the session
    """
    session_file = SESSION_DATA_DIR / f"{session_id}.json"

    if not session_file.exists():
        return 0

    try:
        with open(session_file, 'r') as f:
            session_data = json.load(f)

        total_chars = 0
        prompts = session_data.get("prompts", [])

        for prompt in prompts:
            if isinstance(prompt, str):
                total_chars += len(prompt)
            elif isinstance(prompt, dict):
                total_chars += len(str(prompt))

        return estimate_tokens(str(total_chars), method="char")
    except (json.JSONDecodeError, IOError):
        return 0


def calculate_context_percentage(
    tokens: int,
    max_context: int = DEFAULT_MAX_CONTEXT
) -> float:
    """
    Calculate context usage as a percentage.

    Args:
        tokens: Current token count
        max_context: Maximum context window size

    Returns:
        Context usage percentage (0.0 to 100.0+)
    """
    if max_context <= 0:
        return 0.0

    return (tokens / max_context) * 100.0


def get_context_state(session_id: str) -> Dict[str, Any]:
    """
    Get complete context state for a session.

    Args:
        session_id: Session identifier

    Returns:
        Dictionary with token count, percentage, and metadata
    """
    tokens = get_session_token_count(session_id)
    percentage = calculate_context_percentage(tokens)

    return {
        "session_id": session_id,
        "estimated_tokens": tokens,
        "context_percentage": round(percentage, 2),
        "max_context": DEFAULT_MAX_CONTEXT,
        "timestamp": datetime.now().isoformat(),
        "estimation_method": "char",
        "tokens_per_char": TOKENS_PER_CHAR_ESTIMATE
    }


def estimate_from_transcript(transcript_path: str) -> Dict[str, Any]:
    """
    Estimate context usage from a transcript file.

    Args:
        transcript_path: Path to JSONL transcript file

    Returns:
        Dictionary with estimation results
    """
    path = Path(transcript_path)
    if not path.exists():
        return {
            "error": "Transcript not found",
            "estimated_tokens": 0,
            "context_percentage": 0.0
        }

    try:
        total_chars = 0
        message_count = 0

        with open(path, 'r') as f:
            for line in f:
                if line.strip():
                    total_chars += len(line)
                    message_count += 1

        tokens = estimate_tokens("x" * total_chars)  # Use char count
        percentage = calculate_context_percentage(tokens)

        return {
            "transcript_path": str(path),
            "message_count": message_count,
            "total_chars": total_chars,
            "estimated_tokens": tokens,
            "context_percentage": round(percentage, 2),
            "max_context": DEFAULT_MAX_CONTEXT
        }
    except IOError as e:
        return {
            "error": str(e),
            "estimated_tokens": 0,
            "context_percentage": 0.0
        }


def self_test() -> bool:
    """Run self-test to verify functionality."""
    print("Running context_estimator self-test...")

    # Test 1: Token estimation
    test_text = "Hello, this is a test string for token estimation."
    tokens = estimate_tokens(test_text)
    assert tokens > 0, "Token estimation should return positive value"
    print(f"  [PASS] Token estimation: '{test_text[:30]}...' -> {tokens} tokens")

    # Test 2: Word-based estimation
    word_tokens = estimate_tokens(test_text, method="word")
    assert word_tokens > 0, "Word estimation should return positive value"
    print(f"  [PASS] Word estimation: {word_tokens} tokens")

    # Test 3: Context percentage calculation
    percentage = calculate_context_percentage(50000, 200000)
    assert percentage == 25.0, f"Expected 25.0%, got {percentage}%"
    print(f"  [PASS] Context percentage: 50000/200000 = {percentage}%")

    # Test 4: Edge cases
    assert estimate_tokens("") == 0, "Empty string should return 0"
    assert calculate_context_percentage(0) == 0.0, "Zero tokens should be 0%"
    print("  [PASS] Edge cases handled correctly")

    # Test 5: Context state retrieval (may return 0 if no session exists)
    state = get_context_state("test-session-nonexistent")
    assert "estimated_tokens" in state, "State should include estimated_tokens"
    assert "context_percentage" in state, "State should include context_percentage"
    print(f"  [PASS] Context state structure: {list(state.keys())}")

    print("\n[SUCCESS] All context_estimator tests passed!")
    return True


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Context Estimator for Continuous-Claude-v2")
    parser.add_argument("--test", action="store_true", help="Run self-test")
    parser.add_argument("--estimate", type=str, help="Estimate tokens for given text")
    parser.add_argument("--session", type=str, help="Get context state for session ID")
    parser.add_argument("--transcript", type=str, help="Estimate from transcript file")

    args = parser.parse_args()

    if args.test:
        self_test()
    elif args.estimate:
        tokens = estimate_tokens(args.estimate)
        pct = calculate_context_percentage(tokens)
        print(f"Text: {args.estimate[:50]}{'...' if len(args.estimate) > 50 else ''}")
        print(f"Estimated tokens: {tokens}")
        print(f"Context percentage: {pct:.2f}%")
    elif args.session:
        state = get_context_state(args.session)
        print(json.dumps(state, indent=2))
    elif args.transcript:
        result = estimate_from_transcript(args.transcript)
        print(json.dumps(result, indent=2))
    else:
        parser.print_help()
