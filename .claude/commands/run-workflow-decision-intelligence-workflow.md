# Decision Intelligence Workflow with Debate Integration (RQ-027)

Run the DI workflow: analyze a decision context, check stakes, optionally trigger a multi-model debate, apply consensus feedback, and persist the result with full provenance.

## Usage

```
/run-workflow-decision-intelligence-workflow
/run-workflow-decision-intelligence-workflow --context "Should we migrate to Kubernetes?"
/run-workflow-decision-intelligence-workflow --file di_persistence/state/pending_decision.json
```

## Arguments
- `$ARGUMENTS` — Optional: decision context as JSON string, `--file <path>`, or free-text question. If omitted, reads latest from `di_persistence/state/`.

## Implementation

```python
import sys, os, json, glob
from datetime import datetime
from pathlib import Path

sys.path.insert(0, os.path.expanduser("~/Project"))

args = "$ARGUMENTS".strip()

# --- Load or create DecisionContext ---
from scripts.decision_debate_bridge import (
    DecisionDebateBridge, DecisionContext, DebateFramework,
    AnalyticalInsight, DecisionModelOutput, DebateInformedDecision,
)

context = None

# Mode 1: JSON file path
if args.startswith("--file "):
    fpath = args.replace("--file ", "").strip()
    with open(fpath) as f:
        data = json.load(f)
    context = DecisionContext(**data)
    print(f"Loaded context from {fpath}")

# Mode 2: Latest from di_persistence/state/
elif not args or args == "--latest":
    state_dir = Path("di_persistence/state")
    if state_dir.exists():
        files = sorted(state_dir.glob("*.jsonl"), key=os.path.getmtime, reverse=True)
        if files:
            with open(files[0]) as f:
                lines = f.readlines()
                if lines:
                    data = json.loads(lines[-1])
                    if "data" in data:
                        data = data["data"]
                    context = DecisionContext(**data)
                    print(f"Loaded latest context from {files[0]}")

# Mode 3: Free-text question -> create context
if context is None:
    question = args if args and not args.startswith("--") else "Strategic decision requiring analysis"
    context = DecisionContext(
        title=question[:80],
        description=question,
        options=["Proceed", "Defer", "Needs more analysis"],
        criteria=["ROI", "Risk", "Effort", "Dependencies"],
        stakes=0.75,
    )
    print(f"Created context from prompt: {question[:60]}...")

# --- Run the bridge ---
bridge = DecisionDebateBridge(
    DebateFramework(),
    persistence_path="di_persistence/decision_debate_linkage.jsonl",
)

print()
print("=" * 60)
print(f"DECISION: {context.title}")
print(f"Stakes: {context.stakes:.2f} | Threshold: {bridge.stakes_threshold}")
print(f"Options: {', '.join(context.options)}")
print(f"Criteria: {', '.join(context.criteria)}")
print("=" * 60)

# Check trigger
should_debate = bridge.should_trigger_debate(context)
print(f"\nDebate trigger: {'YES' if should_debate else 'NO (below threshold)'}")

if should_debate:
    # Generate question
    question = bridge.decision_to_debate_question(context)
    print(f"\nDebate question ({len(question)} chars):")
    for line in question.split("\n")[:6]:
        print(f"  {line}")

    # Inject evidence
    evidence = bridge.inject_evidence(context)
    print(f"\nEvidence items: {len(evidence)}")
    for i, e in enumerate(evidence[:5]):
        print(f"  [{i+1}] {e[:100]}")

    # Run debate
    result = bridge.debate_decision(context)

    print(f"\n{'=' * 60}")
    print("DEBATE RESULT")
    print(f"{'=' * 60}")
    print(f"  Consensus:           {result.consensus_score:.2f}")
    if context.current_decision_model_output:
        print(f"  Original confidence: {context.current_decision_model_output.confidence:.2f}")
    print(f"  Final confidence:    {result.final_decision_confidence:.2f}")
    print(f"  Confidence delta:    {result.confidence_modifier:+.4f}")
    print(f"  Recommendation:      {result.final_decision_recommendation}")
    print(f"  Session ID:          {result.debate_session_id}")
    print(f"  Provenance:          {result.provenance_link}")

    action = "PROCEED" if (result.final_decision_confidence or 0) > 0.7 else "RECONSIDER"
    print(f"\n  ACTION: {action}")

else:
    print(f"\nSkipping debate (stakes {context.stakes:.2f} < {bridge.stakes_threshold})")
    if context.current_decision_model_output:
        print(f"Using raw DI output: {context.current_decision_model_output.recommended_option} (confidence {context.current_decision_model_output.confidence:.2f})")
    print("ACTION: PROCEED (low stakes, no debate needed)")

print(f"\nPersistence: di_persistence/decision_debate_linkage.jsonl")
print(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
```
