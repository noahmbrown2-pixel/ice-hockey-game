GitHub CLI (gh) Reference
Technical reference for automation and integration with the GitHub CLI.

Invocation Patterns

### Repo Targeting

Always specify the repository explicitly with --repo <owner>/<repo> to ensure
commands work regardless of the current working directory (CWD):

```bash
gh pr view 42 --repo owner/repo
```

### Structured Output (JSON + jq)

For scripting, avoid parsing plain text. Use --json combined with --jq for precise data extraction:

```bash
gh pr view 42 --repo owner/repo --json number,url,title,headRefName \
 --jq '{number, url, title, branch: .headRefName}'
```

────────────────────────────────────────────────────────────────────────────────

REST API Operations (gh api)

Use gh api for direct endpoint access or when high-level commands are insufficient.

### Read (GET)

```bash
gh api repos/owner/repo/pulls/42
```

### Write (POST/PATCH/DELETE)

│ ⚠️ CRITICAL: MANDATORY HUMAN CONFIRMATION
│ All operations that modify, create, or delete data (Write, POST, PATCH, DELETE)
|  strictly require explicit manual approval before execution. No
│ data alteration will proceed without human verification.

```bash
# Add labels
gh api repos/owner/repo/issues/42/labels -f "labels[]=bug" --method POST

# Set milestone
gh api repos/owner/repo/issues/42 -f milestone=7 --method PATCH
```

────────────────────────────────────────────────────────────────────────────────

GraphQL API

Use GraphQL for complex data needs that would require multiple REST calls or for metadata not exposed in standard commands.

### Why use GraphQL?

1. Efficiency: Fetch multiple resources in a single request.
2. Precision: Define exact fields to reduce payload size.

### Query Example (Read)

```bash
gh api graphql -f query='
 query($name: String!, $owner: String!) {
   repository(name: $name, owner: $owner) {
     pullRequest(number: 42) {
       reviews(last: 10) {
         nodes { author { login } state }
       }
     }
   }
 }' -f name='repo' -f owner='owner'
```

Note: Mutations (data changes) via GraphQL always trigger a mandatory prompt for explicit manual confirmation before execution.

────────────────────────────────────────────────────────────────────────────────

Known Gotchas & Limits

### 1. gh pr checks Parsing

Output is tab-separated (TSV), not space-separated. Be aware that check names often contain
internal spaces, which can complicate parsing if the
tab delimiter is not strictly observed.

### 2. Rate Limiting

Authenticated users are capped at 5,000 requests per hour.
- Polling: Use 60-90 second intervals minimum to avoid exhaustion.
- Monitoring: Check your remaining quota with gh api rate_limit.

