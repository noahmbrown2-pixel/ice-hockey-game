#!/usr/bin/env python3
"""
Run Pipeline - Background daemon for enhancement processing.
"""

import sys
import argparse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from enhancement_pipeline.pipeline import EnhancementPipeline


def main():
    parser = argparse.ArgumentParser(description="Enhancement Pipeline Daemon")
    parser.add_argument(
        "--interval",
        type=int,
        default=60,
        help="Poll interval in seconds (default: 60)"
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Run once and exit"
    )

    args = parser.parse_args()

    pipeline = EnhancementPipeline()

    if args.once:
        # Process active workflows once
        from enhancement_pipeline.state.workflow_state import StateManager
        manager = StateManager()
        for state in manager.list_active():
            print(f"Processing: {state.workflow_id}")
            pipeline.run(state)
    else:
        # Run as daemon
        pipeline.run_daemon(poll_interval=args.interval)


if __name__ == "__main__":
    print("SUCCESS: run_pipeline module loaded")
    print("Usage: python run_pipeline.py [--interval 60] [--once]")
