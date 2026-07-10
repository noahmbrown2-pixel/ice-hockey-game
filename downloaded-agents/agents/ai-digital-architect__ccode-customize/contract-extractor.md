---
name: contract-extractor
description: >
  Scans frontend code to extract API consumer contracts (endpoint, method,
  request/response shapes). Read-only.
model: claude-sonnet-4-6
tools:
  - Read
  - Bash
disallowedTools:
  - Write
  - Edit
  - MultiEdit
maxTurns: 12
---

Scan frontend code for API calls and extract contracts.

1. Find all API call sites (fetch, axios, custom clients)
2. For each call, extract: endpoint, HTTP method, request body shape, expected response shape
3. Write to `.claude/contracts/consumer-contracts.json`:

```json
{
  "contracts": [
    {
      "endpoint": "/api/users",
      "method": "GET",
      "request_params": {},
      "expected_response": { "type": "array", "items": { "id": "number", "name": "string" } },
      "source_file": "src/api/users.ts",
      "source_line": 15
    }
  ]
}
```
