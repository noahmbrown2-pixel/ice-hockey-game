# MCP Playbook — Enhanced Data Researcher

Use MCP to generate **decision-grade** evidence with minimal tokens, high recall, and clear traceability.

## When to Use What
- **API/library exactness** → Ref (URL known) or Context7 (versioned library context)
- **Open web / time-sensitive** → Exa first (enumerate links), then Perplexity (synthesize)
- **No external data needed** → Skip MCP; cite local artifacts

## Outputs (always)
- **Claims** → `project/<projectId>/sections/<section>/claims-<topic>.json`
- **Evidence** → under `project/<projectId>/evidence/research/(ref|context7|exa|perplexity)/<topic>/*`
- Include URL(s), access timestamp (UTC), confidence, and short rationale.

## Query Templates

### Ref (ref-tools)
**Search docs**
```json
{
  "tool": "ref_search_documentation",
  "args": { "query": "NextAuth v5 credentials provider session events", "top_k": 5 },
  "expected_artifact": "project/<projectId>/evidence/research/ref/nextauth/session-events.md"
}
Read specific page

json
Copy
Edit
{
  "tool": "ref_read_url",
  "args": { "url": "https://next-auth.js.org/configuration/events" },
  "expected_artifact": "project/<projectId>/evidence/research/ref/nextauth/events.md"
}
Context7 (Upstash)
json
Copy
Edit
{
  "tool": "context7_inject",
  "args": {
    "library": "nestjs",
    "version": "10.x",
    "topics": ["cache interceptor", "testing module", "request-scoped providers"]
  },
  "expected_artifact": "project/<projectId>/evidence/research/context7/nestjs@10.x.md"
}
Exa Search
json
Copy
Edit
{
  "tool": "web_search_exa",
  "args": {
    "query": "PostgreSQL partitioning performance 2025 production guidance",
    "freshness": "180d",
    "site_filters": ["postgresql.org", "aws.amazon.com", "neon.tech", "crunchydata.com"]
  },
  "expected_artifact": "project/<projectId>/evidence/research/exa/pg-partitioning/results.json"
}
Optional crawl of a chosen URL

json
Copy
Edit
{
  "tool": "crawling",
  "args": { "url": "https://www.postgresql.org/docs/current/ddl-partitioning.html" },
  "expected_artifact": "project/<projectId>/evidence/research/exa/pg-partitioning/partitioning-docs.md"
}
Perplexity Ask (Sonar)
json
Copy
Edit
{
  "tool": "perplexity_ask",
  "args": {
    "messages": [
      { "role": "system", "content": "Cite sources inline with URLs; avoid speculation." },
      { "role": "user", "content": "Summarize current recommendations (≤180d) for PostgreSQL range partitioning for time-series, using these sources: <urls from Exa>." }
    ]
  },
  "expected_artifact": "project/<projectId>/evidence/research/perplexity/pg-partitioning.md"
}
Claim JSON (example)
json
Copy
Edit
{
  "id": "pg-partitioning-001",
  "claim": "Time-based partitions should roughly align with query windows (e.g., monthly).",
  "evidence": [
    { "type": "url", "ref": "https://www.postgresql.org/docs/current/ddl-partitioning.html" },
    { "type": "md", "ref": "project/<projectId>/evidence/research/exa/pg-partitioning/partitioning-docs.md" }
  ],
  "confidence": 0.9,
  "timestamp": "2025-08-23T14:00:00Z"
}
Logging
Append MCP usage to:

pgsql
Copy
Edit
project/<projectId>/control/mcp-usage.log.jsonl