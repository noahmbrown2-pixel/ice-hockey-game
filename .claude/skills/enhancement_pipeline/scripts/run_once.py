#!/usr/bin/env python3
"""
Run Once - Single execution of the enhancement pipeline.
"""

import sys
import argparse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from enhancement_pipeline.pipeline import EnhancementPipeline


def main():
    parser = argparse.ArgumentParser(description="Run Enhancement Pipeline Once")
    parser.add_argument("--title", required=True, help="Enhancement title")
    parser.add_argument("--description", default="", help="Description")
    parser.add_argument(
        "--intent",
        choices=["/feature", "/bug", "/chore", "/enhancement"],
        default="/feature",
        help="Intent type"
    )
    parser.add_argument(
        "--priority",
        choices=["low", "medium", "high"],
        default="medium",
        help="Priority level"
    )
    parser.add_argument("--source", default="cli", help="Request source")

    args = parser.parse_args()

    pipeline = EnhancementPipeline()

    # Start workflow
    state = pipeline.start_workflow(
        source=args.source,
        source_id=f"cli-{args.title[:20].replace(' ', '-')}",
        title=args.title,
        description=args.description,
        intent=args.intent,
        priority=args.priority
    )

    print(f"Created workflow: {state.workflow_id}")
    print(f"Initial stage: {state.stage.value}")

    # Run pipeline
    final_state = pipeline.run(state)

    print(f"\nFinal stage: {final_state.stage.value}")
    if final_state.github_issue_number:
        print(f"GitHub Issue: #{final_state.github_issue_number}")
    if final_state.pr_url:
        print(f"PR URL: {final_state.pr_url}")
    if final_state.error_message:
        print(f"Error: {final_state.error_message}")


if __name__ == "__main__":
    print("SUCCESS: run_once module loaded")
    print("Usage: python run_once.py --title 'Enhancement title' [--intent /feature]")
