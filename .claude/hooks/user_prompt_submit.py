#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "python-dotenv",
# ]
# ///

import argparse
import json
import os
import sys
from pathlib import Path
from datetime import datetime

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass  # dotenv is optional

# Continuous-Claude-v2 Integration (December 2025)
# Context monitoring for threshold warnings
sys.path.insert(0, str(Path(__file__).parent))
try:
    from context_monitor import (
        check_threshold_warnings,
        get_context_percentage,
        format_warning_for_output,
        update_statusline_data
    )
    CONTEXT_MONITOR_AVAILABLE = True
except ImportError:
    CONTEXT_MONITOR_AVAILABLE = False


def log_user_prompt(session_id, input_data):
    """Log user prompt to logs directory."""
    # Ensure logs directory exists
    log_dir = Path("logs")
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / "user_prompt_submit.json"

    # Read existing log data or initialize empty list
    if log_file.exists():
        with open(log_file, "r") as f:
            try:
                log_data = json.load(f)
            except (json.JSONDecodeError, ValueError):
                log_data = []
    else:
        log_data = []

    # Append the entire input data
    log_data.append(input_data)

    # Write back to file with formatting
    with open(log_file, "w") as f:
        json.dump(log_data, f, indent=2)


def manage_session_data(session_id, prompt, name_agent=False):
    """Manage session data in the new JSON structure."""
    import subprocess

    # Ensure sessions directory exists
    sessions_dir = Path(".claude/data/sessions")
    sessions_dir.mkdir(parents=True, exist_ok=True)

    # Load or create session file
    session_file = sessions_dir / f"{session_id}.json"

    if session_file.exists():
        try:
            with open(session_file, "r") as f:
                session_data = json.load(f)
        except (json.JSONDecodeError, ValueError):
            session_data = {"session_id": session_id, "prompts": []}
    else:
        session_data = {"session_id": session_id, "prompts": []}

    # Add the new prompt
    session_data["prompts"].append(prompt)

    # Generate agent name if requested and not already present
    if name_agent and "agent_name" not in session_data:
        # Try Anthropic first (preferred)
        try:
            result = subprocess.run(
                ["uv", "run", ".claude/hooks/utils/llm/anth.py", "--agent-name"],
                capture_output=True,
                text=True,
                timeout=10,
            )

            if result.returncode == 0 and result.stdout.strip():
                agent_name = result.stdout.strip()
                # Validate the name
                if len(agent_name.split()) == 1 and agent_name.isalnum():
                    session_data["agent_name"] = agent_name
                else:
                    raise Exception("Invalid name from Anthropic")
        except Exception:
            # Fall back to Ollama if Anthropic fails
            try:
                result = subprocess.run(
                    ["uv", "run", ".claude/hooks/utils/llm/ollama.py", "--agent-name"],
                    capture_output=True,
                    text=True,
                    timeout=10,  # Shorter timeout for local Ollama
                )

                if result.returncode == 0 and result.stdout.strip():
                    agent_name = result.stdout.strip()
                    # Check if it's a valid name (not an error message)
                    if len(agent_name.split()) == 1 and agent_name.isalnum():
                        session_data["agent_name"] = agent_name
            except Exception:
                # If both fail, don't block the prompt
                pass

    # Save the updated session data
    try:
        with open(session_file, "w") as f:
            json.dump(session_data, f, indent=2)
    except Exception:
        # Silently fail if we can't write the file
        pass


def validate_prompt(prompt):
    """
    Validate the user prompt for security or policy violations.
    Returns tuple (is_valid, reason).
    """
    # Example validation rules (customize as needed)
    blocked_patterns = [
        # Add any patterns you want to block
        # Example: ('rm -rf /', 'Dangerous command detected'),
    ]

    prompt_lower = prompt.lower()

    for pattern, reason in blocked_patterns:
        if pattern.lower() in prompt_lower:
            return False, reason

    return True, None


def check_context_warnings(session_id, prompt):
    """
    Check context usage and display warnings at thresholds.
    Continuous-Claude-v2 Integration (December 2025)

    Args:
        session_id: Current session identifier
        prompt: Current prompt text (for token estimation)

    Returns:
        List of warnings if any thresholds exceeded
    """
    if not CONTEXT_MONITOR_AVAILABLE:
        return []

    try:
        # Get current context percentage
        percentage = get_context_percentage(session_id)

        # Check for threshold warnings
        warnings = check_threshold_warnings(percentage, session_id)

        # Update StatusLine data
        update_statusline_data(session_id)

        # Output warnings to stderr (visible to user but doesn't block)
        if warnings:
            warning_output = format_warning_for_output(warnings)
            if warning_output:
                print(warning_output, file=sys.stderr)

        return warnings
    except Exception:
        # Don't let context monitoring errors block prompts
        return []


def main():
    try:
        # Parse command line arguments
        parser = argparse.ArgumentParser()
        parser.add_argument(
            "--validate", action="store_true", help="Enable prompt validation"
        )
        parser.add_argument(
            "--log-only",
            action="store_true",
            help="Only log prompts, no validation or blocking",
        )
        parser.add_argument(
            "--store-last-prompt",
            action="store_true",
            help="Store the last prompt for status line display",
        )
        parser.add_argument(
            "--name-agent",
            action="store_true",
            help="Generate an agent name for the session",
        )
        parser.add_argument(
            "--check-context",
            action="store_true",
            help="Check context usage and display warnings at 70/80/90% thresholds (Continuous-Claude-v2)",
        )
        args = parser.parse_args()

        # Read JSON input from stdin
        input_data = json.loads(sys.stdin.read())

        # Extract session_id and prompt
        session_id = input_data.get("session_id", "unknown")
        prompt = input_data.get("prompt", "")

        # Log the user prompt
        log_user_prompt(session_id, input_data)

        # Manage session data with JSON structure
        if args.store_last_prompt or args.name_agent:
            manage_session_data(session_id, prompt, name_agent=args.name_agent)

        # Continuous-Claude-v2: Check context warnings (70/80/90% thresholds)
        # Warnings are output to stderr and don't block processing
        # Enable with --check-context flag or always when not in log-only mode
        if args.check_context or (not args.log_only and CONTEXT_MONITOR_AVAILABLE):
            check_context_warnings(session_id, prompt)

        # Validate prompt if requested and not in log-only mode
        if args.validate and not args.log_only:
            is_valid, reason = validate_prompt(prompt)
            if not is_valid:
                # Exit code 2 blocks the prompt with error message
                print(f"Prompt blocked: {reason}", file=sys.stderr)
                sys.exit(2)

        # Add context information (optional)
        # You can print additional context that will be added to the prompt
        # Example: print(f"Current time: {datetime.now()}")

        # Success - prompt will be processed
        sys.exit(0)

    except json.JSONDecodeError:
        # Handle JSON decode errors gracefully
        sys.exit(0)
    except Exception:
        # Handle any other errors gracefully
        sys.exit(0)


if __name__ == "__main__":
    main()
