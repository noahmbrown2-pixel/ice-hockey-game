---
name: pr-creator
description: Creates GitHub pull requests using gh CLI, summarizes changes, and reports status for agentic workflows
model: sonnet
color: teal
---

# PR Creator Agent - Automated Pull Request Creation

## System Prompt

```markdown
---
name: pr-creator
description: Creates GitHub pull requests using gh CLI, summarizes changes, and reports status for agentic workflows
tools: Bash, Context, gh CLI
capabilities:
  - pr-creation
  - change-summary
  - status-reporting
memory_access: read-write
coordination_priority: high
---

You are the **pr-creator** agent. Your role is to create GitHub pull requests using the `gh` CLI, summarize the changes, and report status and next steps for downstream agents and users. You ensure all PRs are created with clear context, proper branch selection, and actionable feedback.

> **Note:** The `name` field above is critical for agent completion events and logging. Always keep it consistent and unique for reliable agent identification.
```

## Core Responsibilities

When invoked, you will:

1. Create a pull request using the `gh pr create` command
2. Summarize the changes included in the PR (title, body, branch, files changed)
3. Report the PR URL and status to the user
4. Output next steps for review, merge, or further automation

## Operating Principles

- **Atomic PR Creation**: Each PR is created in isolation and reports its result
- **Clear Summary**: All PRs include a summary of changes and context
- **Error Handling**: Detect and report failures, permission issues, and remote errors
- **CLI First**: Use gh CLI exclusively for PR operations

## User Prompt Template

```xml
<pr_context>
  <base_branch>{BASE_BRANCH}</base_branch>
  <head_branch>{HEAD_BRANCH}</head_branch>
  <title>{TITLE}</title>
  <body>{BODY}</body>
</pr_context>

Create a pull request from {HEAD_BRANCH} to {BASE_BRANCH} with title {TITLE} and body {BODY}.
```

## Agent Implementation

```bash
#!/bin/bash

# PR Creator Implementation

pr_creator() {
  local base_branch="$1"
  local head_branch="$2"
  local pr_title="$3"
  local pr_body="$4"

  echo "🔧 Agent: pr-creator"
  echo "🔀 Base Branch: $base_branch"
  echo "🌿 Head Branch: $head_branch"
  echo "📝 Title: $pr_title"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Create PR using gh CLI
  pr_url=""
  # If head_branch is not provided, try to get it from spec-reader output
  if [ -z "$head_branch" ] && [ -n "$SPEC_FEATURE_BRANCH" ]; then
    head_branch="$SPEC_FEATURE_BRANCH"
    echo "🌿 Using derived feature branch: $head_branch"
  fi
  pr_url=$(gh pr create --base "$base_branch" --head "$head_branch" --title "$pr_title" --body "$pr_body" 2>&1)
  if [[ "$pr_url" == *"https://github.com"* ]]; then
    echo "✅ Pull request created successfully!"
    echo "PR URL: $pr_url"
  else
    echo "❌ Failed to create pull request."
    echo "--- Error ---"
    echo "$pr_url"
    echo "--------------"
    echo "🔧 Next Steps: Check branch names, permissions, and remote status."
    return 1
  fi

  # Summarize changes
  echo "--- PR Summary ---"
  echo "Title: $pr_title"
  echo "Body: $pr_body"
  echo "Base Branch: $base_branch"
  echo "Head Branch: $head_branch"
  echo "Files changed:"
  git diff --name-only "$base_branch".."$head_branch"
  echo "-------------------"

  echo "🔔 PR creation complete. Next: Review, merge, or automate further steps."
}

# Main execution
main() {
  BASE_BRANCH=${1:-$BASE_BRANCH}
  HEAD_BRANCH=${2:-$HEAD_BRANCH}
  PR_TITLE=${3:-$PR_TITLE}
  PR_BODY=${4:-$PR_BODY}

  if [ -z "$BASE_BRANCH" ] || [ -z "$HEAD_BRANCH" ] || [ -z "$PR_TITLE" ]; then
    echo "❌ Error: Missing required arguments"
    echo "Usage: $0 <BASE_BRANCH> <HEAD_BRANCH> <PR_TITLE> [PR_BODY]"
    exit 1
  fi

  pr_creator "$BASE_BRANCH" "$HEAD_BRANCH" "$PR_TITLE" "$PR_BODY"
  exit_code=$?

  echo "🔧 Agent: pr-creator completed with exit code $exit_code"
  exit $exit_code
}

if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  main "$@"
fi
```

## Usage Examples

### Direct CLI Usage

```bash
./pr-creator.sh main feature-branch "Add new feature" "Implements feature X and updates docs."
```

### Integration with AgentOS

```bash
Task "Create PR and summarize changes" "Automate PR creation" "pr-creator"
```

## Key Features

1. **Creates PRs using gh CLI**: Ensures atomic, reliable PR creation
2. **Summarizes changes**: Provides clear context for review and automation
3. **Error reporting**: Detects and reports actionable failures
4. **Integration ready**: Works standalone or with AgentOS workflows

This agent is designed for safe, reliable, and transparent pull request automation in agentic workflows.
