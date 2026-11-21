# Execute Approved Plans Command

On-demand execution of approved plans with team oversight.

## Usage

```
/execute-approved-plans [options]
```

## Options

- `--list` - List all pending plans by category
- `--review <category>` - Review plans in a specific category
- `--approve <plan_name>` - Approve a plan for execution
- `--archive <plan_name>` - Archive a stale/implemented plan
- `--execute-approved` - Execute all approved plans
- `--execute-category <category>` - Execute all plans in a category
- `--dry-run` - Preview execution without running

## Categories

- `agent_systems` (11 plans) - Agent persona, nano-agent, capability registry
- `security` (2 plans) - CaMel Layer 5, secrets vault
- `research` (5 plans) - LLM efficiency, meta-learning, lifelog
- `integrations` (10 plans) - GitHub Actions, Discord, Groq migration
- `workflows` (4 plans) - Scheduled engine, templates, approval system
- `monitoring` (3 plans) - Distributed tracing, anomaly detection, SLA
- `optimization` (6 plans) - Response caching, batch processing, prompts

## Implementation

```python
import json
from pathlib import Path

REVIEW_FILE = Path("/home/craigmbrown/Project/plan_operationalization/pending_plans_review.json")
PLANS_DIR = Path("/home/craigmbrown/Project/plans")

def list_pending():
    """List all pending plans by category."""
    data = json.load(open(REVIEW_FILE))
    for cat, info in data['categories'].items():
        print(f"\n{cat.upper()} ({info['count']} plans) - Priority: {info['priority']}")
        print(f"  Recommendation: {info['recommendation']}")
        for plan in info['plans']:
            status = "⏳" if plan['status'] == 'pending_review' else "✅"
            print(f"  {status} {plan['name']} ({plan['age_days']}d old)")

def approve_plan(plan_name):
    """Mark a plan as approved for execution."""
    data = json.load(open(REVIEW_FILE))
    for cat in data['categories'].values():
        for plan in cat['plans']:
            if plan['name'] == plan_name:
                plan['status'] = 'approved'
                json.dump(data, open(REVIEW_FILE, 'w'), indent=2)
                print(f"✅ Approved: {plan_name}")
                return
    print(f"❌ Plan not found: {plan_name}")

def archive_plan(plan_name):
    """Archive a stale or implemented plan."""
    data = json.load(open(REVIEW_FILE))
    for cat in data['categories'].values():
        for plan in cat['plans']:
            if plan['name'] == plan_name:
                plan['status'] = 'archived'
                json.dump(data, open(REVIEW_FILE, 'w'), indent=2)
                print(f"📦 Archived: {plan_name}")
                return
    print(f"❌ Plan not found: {plan_name}")

def execute_approved():
    """Execute all approved plans using Gemini CLI."""
    import subprocess

    data = json.load(open(REVIEW_FILE))
    approved = []

    for cat in data['categories'].values():
        for plan in cat['plans']:
            if plan['status'] == 'approved':
                approved.append(plan['name'])

    if not approved:
        print("No approved plans to execute")
        return

    print(f"Executing {len(approved)} approved plans...")
    for plan_name in approved:
        plan_path = PLANS_DIR / plan_name
        if plan_path.exists():
            print(f"🚀 Executing: {plan_name}")
            # Execute with Gemini CLI
            subprocess.run(["/usr/bin/gemini", str(plan_path)], timeout=1800)
        else:
            print(f"⚠️ Plan file not found: {plan_path}")
```

## Workflow

1. **List pending plans**: `/execute-approved-plans --list`
2. **Review by category**: `/execute-approved-plans --review security`
3. **Approve valuable plans**: `/execute-approved-plans --approve batch-03-plan-014-secrets-vault-integration.json`
4. **Archive stale plans**: `/execute-approved-plans --archive system_architecture-ai-agent-slack-integration-with-rostr-id-20251226.json`
5. **Execute approved**: `/execute-approved-plans --execute-approved`

## Team Assignment

This workflow is managed by the **Research Pipeline Team** (`research-001`):
- Research Lead reviews research and agent plans
- Data Analyst reviews optimization and monitoring plans
- Intelligence Gatherer reviews integration plans

## BLP Properties

- **Alignment (BLP-001-010)**: Plans aligned with project goals
- **Autonomy (BLP-011-020)**: Team-managed execution
- **Self-Improvement (BLP-031-040)**: Learning from execution results

## Related Files

- Review file: `/home/craigmbrown/Project/plan_operationalization/pending_plans_review.json`
- Plans directory: `/home/craigmbrown/Project/plans/`
- Execution state: `/home/craigmbrown/Project/plan_operationalization/parallel_execution_state.json`
