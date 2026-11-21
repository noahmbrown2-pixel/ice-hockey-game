---
allowed-tools: Bash(git status:*), Bash(git branch:*), Bash(gh api:*), Bash(cat:*), Bash(date:*), Bash(python3:*)
description: Convert plan to GitHub issue and queue in DITD execution framework with approval bypass
---

# Plan to DITD Execution Queue

## Pre-Computed Context

- **Timestamp**: !`date -u +"%Y%m%d%H%M%S"`
- **Current Branch**: !`git branch --show-current`
- **Git Status**: !`git status --short`
- **Repo Remote**: !`git remote get-url origin 2>/dev/null || echo "no remote"`
- **Plan Files Available**: !`ls -la *.md 2>/dev/null | head -10 || echo "no plan files in current dir"`
- **APOS Queue Status**: !`cat /home/craigmbrown/Project/plan_operationalization/pending_approvals.json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Total: {len(d.get(\"approvals\",{}))} | Approved: {sum(1 for v in d.get(\"approvals\",{}).values() if v.get(\"state\")==\"fully_approved\")}');" 2>/dev/null || echo "Queue not available"`

## Your Task

Take the plan content from the current plan mode session (or a specified plan file) and:

1. **Create GitHub Issue** using `gh api` (bypasses rate limits):
   - Extract title from plan header
   - Format requirements table with REQ-* IDs
   - Include BLP property coverage
   - Add implementation status
   - Add labels: `enhancement`, `ditd`

2. **Add to APOS Queue** (`pending_approvals.json`):
   - Generate request ID: `APOS-{timestamp}-{plan_name_slug}`
   - Set state: `fully_approved` (approval bypass)
   - Set `whatsapp_approved: true`, `email_approved: true`
   - Set `response_channel: "manual_bypass_approval"`
   - Include plan_data with requirements, BLP coverage, files

3. **Add to DITD Execution State** (`execution_state.json`):
   - Add execution entry with GitHub issue number
   - Set phase based on plan content (design/implement/test/deploy/operations)
   - Track DITD lifecycle status

4. **Generate Output**:
   - Print SUCCESS JSON with issue number, request ID, queue status
   - Optionally send WhatsApp notification

## GitHub Issue Template

```markdown
# {Plan Title}

## Overview
{Extract from plan summary}

## Requirements
| REQ-ID | Description | BLP Category | Status |
|--------|-------------|--------------|--------|
{Generate from plan requirements}

## Implementation Files
{List files to create/modify}

## Expected Performance
{Extract metrics from plan}

## DITD Lifecycle
- Design: {status}
- Implement: {status}
- Test: {status}
- Deploy: {status}
- Operations: {status}

## Location
{Project path}

---
Generated with Claude Code
```

## Usage Examples

```
/plan-to-ditd
```
Uses current plan mode content

```
/plan-to-ditd path/to/plan.md
```
Loads specific plan file

```
/plan-to-ditd --skip-whatsapp
```
Skip WhatsApp notification

## Queue File Locations

- **APOS Queue**: `/home/craigmbrown/Project/plan_operationalization/pending_approvals.json`
- **Execution State**: `/home/craigmbrown/Project/plan_operationalization/execution_state.json`
- **GitHub Repo**: `craigmbrown/ETAC-System`

## Required Output Format

```json
{
  "status": "success",
  "github_issue": {
    "number": 1001,
    "url": "https://github.com/craigmbrown/ETAC-System/issues/1001"
  },
  "apos_queue": {
    "request_id": "APOS-20260103-plan-name",
    "state": "fully_approved"
  },
  "ditd_status": {
    "phase": "implement",
    "design": "complete",
    "implement": "in_progress"
  }
}
```
