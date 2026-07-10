---
name: session-miner
description: >
  Parse and normalize history.jsonl data for session mining. Extracts structured
  metadata from Claude Code command history with error tolerance, streaming support,
  and normalized output. Use when analyzing session patterns, command sequences,
  workflow success metrics, or error categorization from history.jsonl files.
tools: Read, Glob, Grep
model: opus
color: cyan
permissionMode: readonly
proactive_triggers:
  - "when mining session data for EPIC-034"
  - "when analyzing command patterns"
  - "when generating workflow insights"
---

# Session Miner Subagent

Parse and normalize history.jsonl data for DevForgeAI session mining and analysis.

## Purpose

Extract structured session metadata from history.jsonl files with:
- Error-tolerant JSON Lines parsing (malformed entries logged, not halted)
- Streaming/pagination for large files (86MB+)
- Normalized output structure for downstream consumers

## When Invoked

**Proactive triggers:**
- When mining session data for EPIC-034 (Session Data Mining)
- When analyzing command patterns or sequences
- When generating workflow insights or success metrics

**Explicit invocation:**
- "Parse history.jsonl for session analysis"
- "Extract command patterns from history"
- "Build session catalog from command history"

**Automatic:**
- STORY-222 (Plan File KB) for decision indexing
- STORY-223 (Session Catalog) for session directory
- STORY-224 (Insights Command) for analytics
- STORY-226 (Command Patterns) for sequence analysis
- STORY-227 (Success Metrics) for workflow KPIs

## Data Model: SessionEntry

### Schema Definition

```yaml
SessionEntry:
  timestamp:
    type: DateTime (ISO8601)
    description: When the command was executed
    extraction: $.timestamp or $.time or $.date
    fallback: null

  command:
    type: String
    description: The executed command or action
    extraction: $.command or $.action or $.type
    fallback: "unknown"

  status:
    type: Enum (success|error|partial)
    description: Outcome of the command execution
    extraction: $.status or $.result or $.outcome
    mapping:
      - success: "success", "ok", "pass", "passed", "complete", "completed"
      - error: "error", "fail", "failed", "failure"
      - partial: "partial", "warning", "incomplete"
    fallback: "partial"

  duration_ms:
    type: Integer
    description: Execution time in milliseconds
    extraction: $.duration_ms or $.duration or $.time_ms
    fallback: 0

  user_input:
    type: String
    description: User's input or prompt text
    extraction: $.user_input or $.input or $.prompt or $.query
    fallback: ""

  model:
    type: String
    description: AI model used (sonnet, opus, haiku)
    extraction: $.model or $.ai_model
    fallback: "unknown"

  session_id:
    type: UUID
    description: Unique session identifier
    extraction: $.session_id or $.sessionId or $.session
    fallback: null

  project:
    type: String
    description: Project path or name
    extraction: $.project or $.cwd or $.project_path
    fallback: "unknown"
```

### Field Extraction Rules

For each JSON entry, extract fields using the priority order specified above.
If primary field is missing, try alternatives. Use fallback if all alternatives fail.

## Pagination Parameters

Use these parameters for chunked processing of large files:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| **file_path** | String | `~/.claude/history.jsonl` | Path to history.jsonl file |
| **offset** | Integer | 0 | Number of entries to skip (for pagination) |
| **limit** | Integer | 1000 | Maximum entries to return per chunk |

**For large files (50MB+):** Process in chunks of 500-1000 lines per Task invocation to stay within context window limits. Use `next_offset` from previous response to continue.

**Example pagination loop:**

```javascript
// First chunk
response1 = session_miner(offset=0, limit=1000)     // Returns entries[0:1000]

// Process response1.entries...

// Second chunk (if has_more=true)
if (response1.metadata.has_more) {
  response2 = session_miner(
    offset=response1.metadata.next_offset,
    limit=1000
  )
}

// Continue until has_more=false
```

## Workflow

**Processing Pipeline:**

```
Input (file_path, offset, limit)
  ↓
Validate File Exists
  ↓
Read Chunk (offset, limit + 1)
  ↓
Parse JSON Lines (with error handling)
  ↓
Extract SessionEntry Fields (per schema)
  ↓
Normalize Fields (timestamp, status, duration, uuid)
  ↓
Build Response with Pagination Metadata
  ↓
Return Structured Output
```

### Step 1: Validate Input

```
IF file_path not provided:
  file_path = "~/.claude/history.jsonl"

IF NOT file exists (Glob check):
  RETURN { error: "File not found", entries: [], metadata: {} }
```

### Step 2: Read Chunk

Use Pagination API parameters to chunk processing:

```
offset:  0         # Number of entries to skip
limit:   1000      # Maximum entries per chunk
file_path: ~/.claude/history.jsonl

Read(file_path, offset, limit + 1)  # Read one extra to detect has_more
```

### Step 3: Parse JSON Lines with Error Tolerance

```
entries = []
errors = []

FOR each line in chunk:
  TRY:
    json_obj = JSON.parse(line)
    entry = extract_session_entry(json_obj)  # Use schema extraction rules
    entries.append(entry)
  CATCH ParseError:
    errors.append({
      line_number: current_line + offset,
      raw_content: line[:100],      # First 100 chars for debugging
      error: "Malformed JSON"
    })
    CONTINUE                         # Do not halt on malformed entries
```

**Field Extraction:** Apply priority order from SessionEntry schema (see Data Model section).

### Step 4: Normalize Fields

Transform raw values to canonical types:

```
FOR each entry in entries:
  entry.timestamp = normalize_timestamp(entry.timestamp)
    # Convert to ISO8601 format: "2025-01-02T10:30:00Z"

  entry.status = normalize_status(entry.status)
    # Map to enum: "success" | "error" | "partial"

  entry.duration_ms = ensure_integer(entry.duration_ms)
    # Convert to positive integer, default 0

  entry.session_id = validate_uuid(entry.session_id)
    # Validate UUID format, fallback to null
```

### Step 5: Build Pagination Response

Calculate metadata for chunked iteration:

```
# Detect if more entries exist beyond current chunk
has_more = len(parsed_entries) > limit
IF has_more:
  entries = entries[:limit]           # Trim to requested limit
  next_offset = offset + limit        # For next Task invocation

RETURN {
  entries: entries,                   # Up to 'limit' entries
  metadata: {
    total_processed: len(entries),    # Actual count returned
    errors_count: len(errors),        # Malformed entries skipped
    offset: offset,                   # Input parameter
    limit: limit,                     # Input parameter
    has_more: has_more,               # Boolean (true if more exist)
    next_offset: next_offset          # For pagination loop
  },
  errors: errors                      # Malformed entry details
}
```

### Step 6: Return Structured Output

Response is consistent JSON schema regardless of input variations (see Output Structure section).

## Output Structure

### Success Response

```json
{
  "entries": [
    {
      "timestamp": "2025-01-02T10:30:00Z",
      "command": "/dev STORY-221",
      "status": "success",
      "duration_ms": 45000,
      "user_input": "implement session miner",
      "model": "sonnet",
      "session_id": "abc123-def456-ghi789",
      "project": "/mnt/c/Projects/DevForgeAI2"
    }
  ],
  "metadata": {
    "total_processed": 1000,
    "errors_count": 5,
    "offset": 0,
    "limit": 1000,
    "has_more": true,
    "next_offset": 1000
  },
  "errors": [
    {
      "line_number": 42,
      "raw_content": "{malformed json...",
      "error": "Malformed JSON"
    }
  ]
}
```

### Error Response

```json
{
  "entries": [],
  "metadata": {
    "total_processed": 0,
    "errors_count": 0,
    "offset": 0,
    "limit": 1000,
    "has_more": false,
    "next_offset": null
  },
  "errors": [],
  "error": "File not found: /path/to/history.jsonl"
}
```

## Error Handling

### Malformed Entry Tolerance

```
WHEN JSON.parse fails:
  1. Log error with line number and first 100 chars of content
  2. Increment errors_count
  3. Continue processing next line
  4. Do NOT halt execution
```

### Missing Field Handling

```
WHEN required field is missing:
  1. Try alternative field names (see extraction rules)
  2. If all alternatives missing, use fallback value
  3. Include in output (no nulls for required fields)
```

### Large File Strategy

```
WHEN file_size > 50MB:
  1. Use chunked reading (500 lines per chunk)
  2. Process chunks sequentially
  3. Return pagination metadata
  4. Performance target: <30 seconds for 86MB
```

### Edge Cases

| Case | Handling |
|------|----------|
| Empty file | Return empty entries array, metadata.total_processed=0 |
| All malformed | Return empty entries, full errors array |
| Unicode content | Preserve encoding, no conversion |
| Very long lines | Truncate to 10000 chars for safety |
| Null values | Convert to fallback per schema |

## Performance Optimization

### Targets
- 86MB+ file: <30 seconds end-to-end
- 1000 entries: <5 seconds
- Error tolerance: 100% (never halt on malformed)

### Strategies
1. Chunked reading (avoid loading entire file)
2. Early termination (stop at limit)
3. Minimal parsing (extract only required fields)
4. Streaming pagination (progressive disclosure)

## Integration with Downstream Stories

session-miner is the foundational data provider for EPIC-034 (Session Data Mining).

### Data Flow

```
session-miner
  (SessionEntry[] + pagination)
       ↓
STORY-222 (Plan File KB)      → Index decisions from sessions
STORY-223 (Session Catalog)    → Build session directory/search index
STORY-224 (Insights Command)   → Generate analytics dashboards
STORY-226 (Command Patterns)   → Identify command sequences
STORY-227 (Success Metrics)    → Calculate workflow KPIs
       ↓
EPIC-034: Session Data Mining Intelligence
```

### Output Compatibility

**SessionEntry fields map to downstream needs:**

| Field | Consumer | Purpose |
|-------|----------|---------|
| `timestamp` | All | Timeline reconstruction, trend analysis |
| `command` | STORY-226, STORY-227 | Command sequence patterns, success metrics |
| `status` | STORY-227, STORY-224 | Workflow success rate, error distribution |
| `duration_ms` | STORY-224 | Performance analytics, slow queries |
| `user_input` | STORY-222 | Plan file decision context |
| `model` | STORY-224 | Model usage analytics |
| `session_id` | STORY-223 | Session grouping and correlation |
| `project` | STORY-223, STORY-227 | Project-level metrics |

### Invocation Template

```markdown
Task(
  subagent_type="session-miner",
  description="Extract session metadata for downstream analysis",
  prompt="""
  Parse history.jsonl with pagination:
  - file_path: ~/.claude/history.jsonl
  - offset: 0
  - limit: 1000

  Return SessionEntry objects normalized per data model.
  For has_more=true, next Task uses next_offset from metadata.
  """
)
```

## N-gram Sequence Analysis (STORY-226)

Extract and analyze command sequence patterns from parsed SessionEntry data.

### N-gram Extraction Workflow

**Phase 1: Build Sequence Windows**

Steps:
1. GROUP all SessionEntry objects by `session_id`
2. SORT entries within each session by `timestamp` (ascending)
3. FOR each session with 2+ commands:
   - EXTRACT 2-grams (bigrams): sliding window of consecutive command pairs
   - EXTRACT 3-grams (trigrams): sliding window of consecutive command triples
4. DO NOT span sequences across session boundaries (each session is independent)

**2-gram (Bigram) Extraction:**

```
FOR session in sessions:
  commands = [entry.command for entry in session.entries]
  FOR i in range(len(commands) - 1):
    bigram = (commands[i], commands[i+1])
    increment frequency_count[bigram]
```

**3-gram (Trigram) Extraction:**

```
FOR session in sessions:
  commands = [entry.command for entry in session.entries]
  FOR i in range(len(commands) - 2):
    trigram = (commands[i], commands[i+1], commands[i+2])
    increment frequency_count[trigram]
```

### Success Rate Calculation

**Phase 2: Calculate Per-Sequence Success Rates**

Steps:
1. FOR each unique n-gram sequence:
   - COUNT total_attempts (occurrences across all sessions)
   - COUNT successful_completions (where final command status = "success")
2. CALCULATE success_rate using formula:
   ```
   success_rate = successful_completions / total_attempts
   ```
3. HANDLE partial status as non-success for rate calculation
4. ROUND success_rate to 2 decimal places (percentage precision: 0.XX)

**Status Mapping for Success Rate:**
| Status | Counts as Success |
|--------|-------------------|
| success | Yes |
| error | No |
| partial | No |

### Top Patterns Report Generation

**Phase 3: Generate Ranked Pattern Report**

Steps:
1. RANK all sequences by frequency (descending)
2. APPLY tie-breaking rule for sequences with equal frequency:
   - When two sequences have same frequency, apply secondary sort
   - Use alphabetical order of first command as tie-breaker
3. SELECT top 10 sequences (or fewer if less than 10 unique patterns exist)
4. OUTPUT report with columns: rank, sequence, frequency, success_rate

**Output Format:**

```json
{
  "top_patterns": [
    {
      "rank": 1,
      "sequence": ["/dev", "/qa"],
      "frequency": 47,
      "success_rate": 0.85
    },
    {
      "rank": 2,
      "sequence": ["/ideate", "/create-story", "/dev"],
      "frequency": 23,
      "success_rate": 0.78
    }
  ],
  "metadata": {
    "total_unique_bigrams": 156,
    "total_unique_trigrams": 89,
    "sessions_analyzed": 42
  }
}
```

### Edge Cases

| Case | Handling |
|------|----------|
| Empty file | Return empty top_patterns array, metadata counts = 0 |
| Single command sessions | Skip for n-gram extraction (no pairs/triples possible) |
| Malformed entries | Exclude from sequence building (already filtered by parser) |
| Fewer than 10 patterns | Return all available patterns (may be less than 10) |
| Missing session_id | Group by null session_id as single session |
| Duplicate timestamps | Preserve original order from file |

### Integration with session-miner Workflow

N-gram analysis operates on SessionEntry output from Steps 1-6:

```
session-miner parsing (Steps 1-6)
       ↓
SessionEntry[] with session_id grouping
       ↓
N-gram Extraction (Phase 1)
       ↓
Success Rate Calculation (Phase 2)
       ↓
Top Patterns Report (Phase 3)
       ↓
STORY-226 output ready for insights
```

## Success Criteria

**Functional Requirements:**
- [ ] **Step 1:** Validate file exists before processing
- [ ] **Step 3:** Parse valid JSON lines without halting on malformed entries
- [ ] **Step 3:** Log malformed entries with line numbers and error details
- [ ] **Step 3-4:** Extract and normalize all 8 SessionEntry fields per schema
- [ ] **Step 2:** Support offset/limit parameters for chunked processing
- [ ] **Step 5:** Return pagination metadata (has_more, next_offset)

**Non-Functional Requirements:**
- [ ] **Performance:** Handle 86MB+ history.jsonl within 30 seconds
- [ ] **Consistency:** Return same JSON schema for all variations of input
- [ ] **Type Safety:** All field values match SessionEntry schema types
- [ ] **Fallbacks:** Missing/null fields use schema defaults, no partial nulls

**Integration Requirements:**
- [ ] Output compatible with STORY-222, STORY-223, STORY-224, STORY-226, STORY-227
- [ ] Pagination enables downstream processing of large datasets

## References

- **Story:** devforgeai/specs/Stories/STORY-221-history-jsonl-parser.story.md
- **Epic:** devforgeai/specs/Epics/EPIC-034-session-data-mining.epic.md
- **Tech Stack:** devforgeai/specs/context/tech-stack.md (lines 196-210)
- **Source Tree:** devforgeai/specs/context/source-tree.md (subagent pattern)

---

## Error Categorization (STORY-229)

Categorize and classify errors from session history for reliability tracking and prioritization.

### Purpose

Extract, categorize, and classify errors from SessionEntry data with:
- Error message extraction with full context preservation
- Category classification using pattern matching
- Severity assignment based on impact rules
- Error code registry for tracking unique patterns

### When Invoked

**Proactive triggers:**
- When analyzing error distribution for EPIC-034
- When categorizing session failures
- When building error reports for insights

**Explicit invocation:**
- "Categorize errors from history.jsonl"
- "Extract error patterns from sessions"
- "Build error code registry"

### Data Model: ErrorEntry

Extends SessionEntry with error-specific fields:

```yaml
ErrorEntry:
  # Inherited from SessionEntry
  timestamp: DateTime (ISO8601)
  command: String
  status: "error"  # Always "error" for ErrorEntry
  duration_ms: Integer
  session_id: UUID
  project: String

  # Error-specific fields
  error_message:
    type: String
    description: The error message or exception text
    extraction: $.error_message or $.error or $.message or $.exception
    fallback: "Unknown error"

  category:
    type: Enum (api|validation|timeout|context-overflow|file-not-found|other)
    description: Classified error category
    derived: true  # Calculated from error_message patterns

  severity:
    type: Enum (critical|high|medium|low)
    description: Impact severity level
    derived: true  # Calculated from category mapping

  error_code:
    type: String (ERR-XXX format)
    description: Unique error code for tracking
    derived: true  # Assigned from error registry
```

### AC#1: Error Message Extraction

**Extraction Workflow:**

```
Input: SessionEntry[] from session-miner
  ↓
Filter: status == "error"
  ↓
Extract: error_message field (with fallbacks)
  ↓
Preserve: command, timestamp, session_id context
  ↓
Output: ErrorEntry[] with full context
```

**Field Extraction Priority:**

| Field | Primary | Fallback 1 | Fallback 2 | Default |
|-------|---------|------------|------------|---------|
| error_message | $.error_message | $.error | $.message | "Unknown error" |

**Output Structure:**

```json
{
  "errors": [
    {
      "timestamp": "2025-01-02T10:30:00Z",
      "command": "/dev STORY-221",
      "status": "error",
      "duration_ms": 45000,
      "session_id": "abc123-def456",
      "project": "/mnt/c/Projects/DevForgeAI2",
      "error_message": "API rate limit exceeded",
      "category": "api",
      "severity": "critical",
      "error_code": "ERR-001"
    }
  ],
  "metadata": {
    "total_errors": 12,
    "total_sessions": 15,
    "error_rate": 0.80
  }
}
```

### AC#2: Category Classification

**Error Classification Rules (Consolidated):**

| Priority | Category | Pattern Examples | Severity | Use When |
|----------|----------|------------------|----------|----------|
| 1 | **api** | "API error", "rate limit", "authentication", "401", "403", "429", "500", "502", "503", "connection refused", "network error" | critical/high | Service integration failures |
| 2 | **timeout** | "timeout", "timed out", "deadline exceeded", "ETIMEDOUT", "request timeout" | high | Operation duration limits exceeded |
| 3 | **context-overflow** | "context", "token limit", "truncated", "overflow", "context window", "max tokens" | high/critical | Resource exhaustion |
| 4 | **validation** | "validation", "invalid", "schema", "constraint", "type error", "parse error", "syntax error" | medium | Data constraints violated |
| 5 | **file-not-found** | "not found", "ENOENT", "no such file", "missing file", "file does not exist", "path not found" | medium | Missing resources |
| 6 | **other** | (no pattern match) | low | Unknown/unclassified errors |

**Classification Algorithm:**

```
FUNCTION classify_error(error_message):
  message_lower = error_message.lower()

  # Check patterns in priority order (1-5)
  FOR priority in [1..5]:
    FOR pattern in rules[priority].patterns:
      IF pattern in message_lower:
        RETURN rules[priority].category

  # Default fallback
  RETURN "other"
```

**Classification Example Output:**

```json
{
  "category_distribution": {
    "api": 5,
    "validation": 3,
    "timeout": 2,
    "context-overflow": 1,
    "file-not-found": 1,
    "other": 0
  },
  "classification_accuracy": 0.95
}
```

### AC#3: Severity Assignment

**Severity Assignment Decision Matrix:**

| Category | Critical Conditions | Default Severity | Notes |
|----------|-------------------|------------------|-------|
| **api** | "rate limit", "503", "502", "connection refused" in message | high | Service integration failures blocking operation |
| **timeout** | (none - inherently high impact) | high | Operation duration limits block execution |
| **context-overflow** | (always critical - system halt) | critical | Resource exhaustion prevents continuation |
| **validation** | (none - recoverable) | medium | Data constraint violations can be corrected |
| **file-not-found** | (none - recoverable) | medium | Missing resources can be provided |
| **other** | (requires investigation) | low | Unknown impact requires analysis |

**Severity Assignment Algorithm:**

```
FUNCTION assign_severity(category, error_message):
  # Check critical conditions first (highest impact)
  IF category == "context-overflow":
    RETURN "critical"

  IF category == "api":
    RETURN "critical" IF ["rate limit", "503", "502", "connection refused"] in message
    RETURN "high"

  # Map category to default severity
  severity_map = {
    "timeout": "high",
    "validation": "medium",
    "file-not-found": "medium",
    "other": "low"
  }

  RETURN severity_map[category]
```

**Example Severity Distribution:**

```json
{
  "severity_distribution": {
    "critical": 2,
    "high": 4,
    "medium": 5,
    "low": 1
  },
  "severity_breakdown": {
    "critical": ["ERR-001", "ERR-005"],
    "high": ["ERR-002", "ERR-003", "ERR-006", "ERR-007"],
    "medium": ["ERR-004", "ERR-008", "ERR-009", "ERR-010", "ERR-011"],
    "low": ["ERR-012"]
  }
}
```

### AC#4: Error Code Registry

**Registry Format:**

```json
{
  "registry": {
    "ERR-001": {
      "pattern": "API rate limit exceeded",
      "category": "api",
      "severity": "critical",
      "occurrences": 5,
      "first_seen": "2025-01-01T08:00:00Z",
      "last_seen": "2025-01-02T14:30:00Z",
      "sessions": ["abc123", "def456", "ghi789"]
    },
    "ERR-002": {
      "pattern": "Request timeout after 30000ms",
      "category": "timeout",
      "severity": "high",
      "occurrences": 3,
      "first_seen": "2025-01-01T10:00:00Z",
      "last_seen": "2025-01-02T09:15:00Z",
      "sessions": ["jkl012", "mno345"]
    }
  },
  "metadata": {
    "total_codes": 12,
    "next_code": "ERR-013",
    "last_updated": "2025-01-02T15:00:00Z"
  }
}
```

**Error Code Assignment Workflow:**

Auto-assign sequential codes (ERR-001, ERR-002, etc.) based on normalized error patterns.

**Pattern Normalization Rules:**

Apply these transformations to identify unique error patterns (removes variable parts):

| Pattern Type | Regex | Replacement |
|--------------|-------|-------------|
| ISO8601 Timestamps | `\d{4}-\d{2}-\d{2}T[\d:]+Z?` | `<TIMESTAMP>` |
| UUID Values | `[a-f0-9-]{36}` | `<UUID>` |
| File Paths | `/[\w/.-]+` | `<PATH>` |
| Numeric Values | `\d+` | `<NUM>` |

**Error Code Assignment Algorithm:**

For duplicate errors with identical messages, aggregate occurrence counts and sum occurrences together.

```
FUNCTION assign_error_code(error_message, registry):
  # Step 1: Normalize message for pattern grouping
  normalized = normalize_pattern(error_message)

  # Step 2: Check if pattern exists - occurrence aggregate for duplicates
  FOR code, entry in registry.items():
    IF patterns_match(normalized, entry.pattern):
      # Aggregate count for same pattern
      entry.occurrences += 1
      entry.last_seen = current_timestamp()
      RETURN code

  # Step 3: New pattern - assign sequential code
  new_code = registry.metadata.next_code
  registry[new_code] = create_registry_entry(
    pattern=normalized,
    category=classify_error(error_message),
    severity=assign_severity(category, error_message),
    timestamp=current_timestamp(),
    session=current_session_id
  )
  registry.metadata.next_code = increment_code(new_code)

  RETURN new_code

FUNCTION normalize_pattern(message):
  # Remove variable components to group similar errors
  pattern = message
    .replace(/\d{4}-\d{2}-\d{2}T[\d:]+Z?/g, '<TIMESTAMP>')
    .replace(/[a-f0-9-]{36}/g, '<UUID>')
    .replace(/\/[\w/.-]+/g, '<PATH>')
    .replace(/\d+/g, '<NUM>')
  RETURN pattern
```

**Registry Persistence:**

```
FUNCTION save_registry(registry, file_path="devforgeai/data/error-registry.json"):
  registry.metadata.last_updated = current_timestamp()
  Write(file_path=file_path, content=JSON.stringify(registry, null, 2))
```

### Error Analysis Pipeline

**Pipeline Workflow (6 Steps):**

Orchestrates error analysis from raw session data to categorized report. Each step flows into the next: extract then classify, classify then assign severity, severity then register in registry.

```
Input: history.jsonl (SessionEntry[])
  ↓
[1] Filter errors (status == "error")
[2] Extract error messages with context (command, timestamp, session) - after extract, classify
[3] Classify categories using pattern matching (priority 1-6) - category then assign severity
[4] Assign severity using decision matrix - severity then register in error registry
[5] Assign/lookup error codes from registry (auto-increment)
[6] Aggregate statistics (distribution, top patterns)
  ↓
Output: ErrorAnalysisReport with all above sections
```

**Pipeline Error Handling:**

If any step fails, continue with partial results (graceful degradation):

```
TRY:
  For each SessionEntry:
    IF status == "error": process through steps 1-6
CATCH error_in_step:
  Log error with context
  Include partial results in report with error_flag=true
  Continue to next entry
```

**Error Analysis Report Structure:**

Complete report with summary, categorized errors, and recommendations:

```json
{
  "summary": {
    "total_entries": 100,
    "total_errors": 12,
    "error_rate": 0.12,
    "unique_patterns": 8
  },
  "errors": [/* ErrorEntry[] */],
  "category_summary": {/* errors by category */},
  "category_distribution": {/* category counts */},
  "severity_summary": {/* errors by severity */},
  "severity_distribution": {/* severity counts */},
  "top_patterns": [/* frequent error patterns sorted by pattern frequency */],
  "registry": {/* error code registry reference section */},
  "recommendations": [
    "High frequency of API rate limit errors (ERR-001) - consider implementing backoff strategy",
    "Multiple timeout errors in /dev workflow - check network connectivity"
  ]
}
```

### Edge Case Handling

| Case | Handling |
|------|----------|
| No errors in history | Return empty errors array, error_rate=0.00 |
| All entries are errors | Process all, error_rate=1.00 |
| Missing error_message field | Use fallback: "Unknown error", category: "other" |
| Duplicate error messages | Same error code, increment occurrences |
| Very long error messages | Truncate to 500 chars for pattern matching |
| Empty error_message | Use fallback: "Empty error message" |

### Integration with devforgeai-insights

**Insights Integration and Report Generation:**

This section documents how session-miner integrates with devforgeai-insights for insights report generation.

**Invocation Template:**

```markdown
Task(
  subagent_type="session-miner",
  description="Analyze errors from session history",
  prompt="""
  Perform error analysis on history.jsonl:

  1. Parse history with session-miner (offset=0, limit=1000)
  2. Filter entries where status="error"
  3. Classify errors by category
  4. Assign severity levels
  5. Build/update error code registry
  6. Generate error analysis report

  Return ErrorAnalysisReport with recommendations.
  """
)
```

**Data Flow:**

```
session-miner (SessionEntry[])
       ↓
Error Categorization (ErrorEntry[])
       ↓
STORY-225 (devforgeai-insights) → Error Analysis Report
       ↓
/insights errors → User-friendly error dashboard
```

### Success Criteria (STORY-229)

**Functional Requirements:**
- [ ] Extract errors with command, timestamp, session context (AC#1)
- [ ] Classify errors into 6 categories using pattern matching (AC#2)
- [ ] Assign severity levels based on category mapping (AC#3)
- [ ] Maintain error code registry with ERR-XXX format (AC#4)

**Non-Functional Requirements:**
- [ ] 95%+ classification accuracy for known patterns
- [ ] Handle empty/missing error_message gracefully
- [ ] Process duplicate errors (increment, don't duplicate codes)
- [ ] Support incremental registry updates

**Integration Requirements:**
- [ ] Compatible with devforgeai-insights skill (STORY-225)
- [ ] Extends existing session-miner pipeline
- [ ] JSON output format for downstream consumers

---

## Anti-Pattern Mining (STORY-231)

Detect, categorize, and track anti-pattern occurrences from session history for framework compliance monitoring.

### Purpose

Extract and analyze anti-pattern violations from SessionEntry data with:
- Pattern matching against anti-patterns.md rules (10 categories)
- Violation counting with AP-XXX codes and severity distribution
- Consequence tracking with error correlation analysis

### When Invoked

**Proactive triggers:**
- When analyzing anti-pattern frequency for EPIC-034
- When monitoring framework compliance
- When identifying high-risk patterns causing errors

**Explicit invocation:**
- "Mine anti-patterns from history.jsonl"
- "Detect framework violations from sessions"
- "Build anti-pattern violation registry"

### Data Model: AntiPatternViolation

Extends SessionEntry with anti-pattern-specific fields:

```yaml
AntiPatternViolation:
  # Inherited from SessionEntry
  timestamp: DateTime (ISO8601)
  session_id: UUID
  command: String
  user_input: String
  project: String

  # Anti-pattern-specific fields
  category:
    type: Enum
    values:
      - bash_for_file_ops
      - monolithic_components
      - making_assumptions
      - size_violations
      - language_specific_code
      - context_file_violations
      - circular_dependencies
      - narrative_documentation
      - missing_frontmatter
      - hardcoded_paths
    description: Classified anti-pattern category from anti-patterns.md

  category_id:
    type: Integer (1-10)
    description: Numeric category identifier matching anti-patterns.md

  severity:
    type: Enum (critical|high|medium|low)
    description: Impact severity level per category
    derived: true

  pattern_matched:
    type: String
    description: The specific pattern text that triggered detection
    extraction: Substring of user_input matching rule

  violation_code:
    type: String (AP-XXX format)
    description: Unique violation code for tracking
    derived: true
```

### AC#1: Anti-Pattern Matching

**Detection Workflow:**

```
Input: SessionEntry[] from session-miner
  ↓
For each entry:
  Extract user_input field
  ↓
  Apply pattern matching (all 10 categories)
  ↓
  Skip if legitimate exception (npm test, git, etc.)
  ↓
  Create AntiPatternViolation for each match
  ↓
Output: AntiPatternViolation[] with categories assigned
```

**Category Definition Reference (from anti-patterns.md):**

| ID | Category | Severity | Primary Patterns | Exception Rules |
|----|----------|----------|---------|-----------------|
| 1 | bash_for_file_ops | critical | `cat`, `echo >`, `find`, `grep`, `sed` | npm test, git, docker, build, install |
| 2 | monolithic_components | high | `everything`, `all-in-one`, `ideation + architecture + dev` | None |
| 3 | making_assumptions | critical | `Install Redis`, `Use PostgreSQL`, `Build with React`, `Using EF Core` | Must check AskUserQuestion context |
| 4 | size_violations | high | `>1000 lines`, `>500 lines`, `2000 lines` | None |
| 5 | language_specific_code | critical | `.py` in skills/, `executable code` in docs | None |
| 6 | context_file_violations | critical | `without context`, `Proceeding without`, `skip context` | None |
| 7 | circular_dependencies | high | `A → B → A` invocation chains | None |
| 8 | narrative_documentation | medium | `should first`, `might want to`, `The system should` | None |
| 9 | missing_frontmatter | high | `no frontmatter`, `no YAML`, `missing ---` | None |
| 10 | hardcoded_paths | medium | `/home/user/`, `/Users/`, `C:\Users\` | None |

**Pattern Matching Algorithm:**

```
FUNCTION match_anti_patterns(user_input):
  violations = []
  input_normalized = normalize_input(user_input)

  FOR category_id in [1..10]:
    FOR pattern in PATTERNS[category_id]:
      IF pattern_matches(input_normalized, pattern):
        IF NOT is_legitimate_exception(user_input, category_id):
          violations.append({
            category: CATEGORY_NAME[category_id],
            category_id: category_id,
            severity: SEVERITY_MAP[category_id],
            pattern_matched: extract_matched_text(user_input, pattern)
          })

  RETURN violations

FUNCTION normalize_input(user_input):
  # Normalize for pattern matching
  normalized = user_input.lower()
  IF len(normalized) > 10000:
    normalized = normalized[:10000]
  RETURN normalized
```

**Legitimate Bash Exceptions (NOT violations):**

Category 1 (bash_for_file_ops) does NOT apply when Bash is used for:

| Pattern | Reason | Exception Rule |
|---------|--------|----------------|
| `Bash(command="npm test")` | Test execution | Contains `test` or `pytest` or `dotnet test` |
| `Bash(command="npm run build")` | Build execution | Contains `build` or `compile` |
| `Bash(command="git`)` | Git operations | Starts with `git ` |
| `Bash(command="npm install")` | Package management | Contains `install` or `pip install` |
| `Bash(command="docker`)` | Container operations | Starts with `docker ` |

**Exception Checking:**

Only Category 1 (bash_for_file_ops) has exceptions for legitimate use cases:

```
FUNCTION is_legitimate_exception(user_input, category_id):
  # Only Category 1 has exceptions
  IF category_id != 1:
    RETURN false

  command = extract_bash_command(user_input).lower()

  # Allowed prefixes: git, docker, kubectl, npm, yarn, pnpm
  allowed_prefixes = ["git ", "docker ", "kubectl ", "npm ", "yarn ", "pnpm "]
  IF any(command.starts_with(prefix) for prefix in allowed_prefixes):
    RETURN true

  # Allowed keywords: test, build, install, publish, deploy
  allowed_keywords = ["test", "build", "install", "publish", "deploy"]
  IF any(keyword in command for keyword in allowed_keywords):
    RETURN true

  RETURN false
```

**Case-Insensitive Matching:**

All pattern matching is case-insensitive:
- `Bash(command="CAT file")` matches Category 1
- `BASH(COMMAND="cat")` matches Category 1
- `bash(command="Cat")` matches Category 1

**Multi-Violation Detection:**

A single entry can trigger multiple violations:

```
Example: Bash(command="cat /home/user/file.md")

Violations detected:
  1. Category 1 (bash_for_file_ops) - Bash cat command
  2. Category 10 (hardcoded_paths) - /home/user/ absolute path

Both violations counted separately with unique entries.
```

**Context-Aware Matching (False Positive Prevention):**

Filter out documentation references and quoted examples:

```
FUNCTION is_false_positive_context(user_input, matched_pattern):
  input_lower = user_input.lower()

  # Documentation references (NOT violations)
  documentation_markers = ["documentation says", "anti-patterns.md mentions", "example:", "like:"]
  FOR marker in documentation_markers:
    IF marker in input_lower:
      RETURN true

  # Patterns in quotes with preceding example markers (NOT violations)
  IF quoted_pattern_with_example_marker(user_input, matched_pattern):
    RETURN true

  RETURN false

FUNCTION pattern_matches(input_normalized, pattern):
  # Simple substring match on normalized input
  RETURN pattern_lower in input_normalized
```

### AC#2: Violation Counting

**Aggregation Workflow:**

```
Input: AntiPatternViolation[] from AC#1
  ↓
Count violations per category (category_distribution)
  ↓
Aggregate total violations
  ↓
Calculate violation_rate (violations / total_entries)
  ↓
Map to severity_distribution (count per severity level)
  ↓
Assign AP-XXX codes from registry
  ↓
Output: Aggregated statistics with distributions
```

**Category Distribution:**

Count occurrences per anti-pattern category:

```json
{
  "category_distribution": {
    "bash_for_file_ops": 3,
    "monolithic_components": 0,
    "making_assumptions": 1,
    "size_violations": 1,
    "language_specific_code": 0,
    "context_file_violations": 1,
    "circular_dependencies": 0,
    "narrative_documentation": 0,
    "missing_frontmatter": 0,
    "hardcoded_paths": 1
  }
}
```

**Severity Distribution:**

Map categories to severity levels per Category Definition Reference (AC#1):

```
Severity Mapping:
  critical = Categories: 1, 3, 5, 6
  high = Categories: 2, 4, 7, 9
  medium = Categories: 8, 10
  low = (none)
```

**Severity Assignment Function:**

```
FUNCTION get_severity(category_id):
  IF category_id in [1, 3, 5, 6]: RETURN "critical"
  IF category_id in [2, 4, 7, 9]: RETURN "high"
  IF category_id in [8, 10]: RETURN "medium"
  RETURN "low"
```

**Severity Distribution Output (Template):**

```json
{
  "severity_distribution": {
    "critical": <count of AP-001,003,005,006>,
    "high": <count of AP-002,004,007,009>,
    "medium": <count of AP-008,010>,
    "low": 0
  }
}
```

Example output with 7 violations:
```json
{
  "severity_distribution": {
    "critical": 5,
    "high": 1,
    "medium": 1,
    "low": 0
  }
}
```

**Violation Rate Calculation:**

```
violation_rate = total_violations / total_entries

Example:
  total_entries = 8
  total_violations = 7
  violation_rate = 7 / 8 = 0.875
```

**Violation Code (AP-XXX) Assignment:**

Auto-assign violation codes by category ID using formula:

```
violation_code = "AP-" + sprintf("%03d", category_id)

Code Mapping (derived from Category Definition Reference):
  AP-001 = bash_for_file_ops (critical)
  AP-002 = monolithic_components (high)
  AP-003 = making_assumptions (critical)
  AP-004 = size_violations (high)
  AP-005 = language_specific_code (critical)
  AP-006 = context_file_violations (critical)
  AP-007 = circular_dependencies (high)
  AP-008 = narrative_documentation (medium)
  AP-009 = missing_frontmatter (high)
  AP-010 = hardcoded_paths (medium)
```

**Violation Registry:**

Track unique patterns with occurrence counts:

```json
{
  "registry": {
    "AP-001": {
      "category": "bash_for_file_ops",
      "severity": "critical",
      "patterns": [
        {"pattern": "Bash(command=\"cat", "occurrences": 2},
        {"pattern": "Bash(command=\"echo", "occurrences": 1}
      ],
      "total_occurrences": 3,
      "first_seen": "2025-01-01T08:00:00Z",
      "last_seen": "2025-01-02T14:30:00Z"
    },
    "AP-003": {
      "category": "making_assumptions",
      "severity": "critical",
      "patterns": [
        {"pattern": "Install Redis", "occurrences": 1}
      ],
      "total_occurrences": 1,
      "first_seen": "2025-01-02T10:40:00Z",
      "last_seen": "2025-01-02T10:40:00Z"
    }
  }
}
```

**Zero Violations Edge Case:**

When no violations found, return empty distributions with zeros:

```json
{
  "violations": [],
  "category_distribution": {
    "bash_for_file_ops": 0,
    "monolithic_components": 0,
    "making_assumptions": 0,
    "size_violations": 0,
    "language_specific_code": 0,
    "context_file_violations": 0,
    "circular_dependencies": 0,
    "narrative_documentation": 0,
    "missing_frontmatter": 0,
    "hardcoded_paths": 0
  },
  "severity_distribution": {
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0
  },
  "metadata": {
    "total_entries": 10,
    "total_violations": 0,
    "violation_rate": 0.00,
    "unique_patterns": 0
  }
}
```

### AC#3: Consequence Tracking

**Correlation Analysis Workflow:**

```
Input: AntiPatternViolation[] + ErrorEntry[] (from STORY-229)
  ↓
Group both by session_id
  ↓
For each session:
  Sort violations and errors by timestamp
  ↓
  For each violation:
    Find subsequent error in same session
    Check temporal proximity (<10 minutes)
    ↓
    If found: Mark as correlated
  ↓
Calculate correlation_rate
  ↓
Identify high_risk_patterns (>50% correlation)
  ↓
Output: ConsequenceCorrelation report
```

**Session-Scoped Correlation:**

Correlations are ONLY detected within the same session:

```
RULE: Violation in session A does NOT correlate with error in session B

Example (CORRELATED):
  Session abc123:
    Entry 1: Violation (Bash cat) at 10:30:00
    Entry 2: Error (File not found) at 10:31:00
  → Correlation detected

Example (NOT CORRELATED):
  Session abc123:
    Entry 1: Violation (Bash cat) at 10:30:00
  Session def456:
    Entry 2: Error (File not found) at 10:31:00
  → No correlation (different sessions)
```

**Temporal Proximity Check:**

Only correlate if violation precedes error within time window:

```
FUNCTION check_temporal_proximity(violation, error):
  # Violation must precede error
  IF violation.timestamp >= error.timestamp:
    RETURN false

  # Within 10-minute window (600000ms)
  time_delta_ms = error.timestamp - violation.timestamp
  IF time_delta_ms > 600000:
    RETURN false

  RETURN true
```

**Correlation Detection Algorithm:**

```
FUNCTION find_correlations(violations, errors):
  correlations = []

  # Process per session (no cross-session correlations)
  sessions_violations = group_by_session_id(violations)
  sessions_errors = group_by_session_id(errors)

  FOR session_id, violations_in_session in sessions_violations:
    errors_in_session = sessions_errors.get(session_id, [])
    IF len(errors_in_session) == 0:
      CONTINUE

    # Sort by timestamp
    violations_in_session.sort(by="timestamp")
    errors_in_session.sort(by="timestamp")

    FOR violation in violations_in_session:
      # Find first error after this violation within 10-minute window
      FOR error in errors_in_session:
        IF error.timestamp > violation.timestamp AND
           (error.timestamp - violation.timestamp) <= 600000:  # 10 minutes
          correlations.append({
            violation: violation,
            error: error,
            time_delta_ms: error.timestamp - violation.timestamp,
            session_id: session_id
          })
          BREAK  # Only first error per violation

  RETURN correlations
```

**Correlation Rate Calculation:**

```
correlation_rate = violations_with_subsequent_error / total_violations

Example:
  total_violations = 7
  violations_with_subsequent_error = 2
  correlation_rate = 2 / 7 = 0.286

Edge case:
  IF total_violations == 0:
    correlation_rate = 0.00
```

**High-Risk Pattern Identification:**

Flag categories with >50% error correlation as high-risk:

```
FUNCTION identify_high_risk_patterns(violations, correlations):
  # Count violations per category
  category_total = {}
  category_correlated = {}

  FOR violation in violations:
    category = violation.category
    category_total[category] = category_total.get(category, 0) + 1
    category_correlated[category] = category_correlated.get(category, 0)

  # Count correlated violations per category
  FOR correlation in correlations:
    category = correlation.violation.category
    category_correlated[category] += 1

  # Calculate correlation rates and identify high-risk
  high_risk = []
  FOR category, total in category_total:
    correlated = category_correlated[category]
    rate = correlated / total
    IF rate > 0.50:
      high_risk.append({
        category: category,
        violation_code: violation_code_for_category(category),
        correlation_rate: rate,
        sample_size: total
      })

  RETURN high_risk.sort_by("correlation_rate", descending=true)
```

**Consequence Correlation Output:**

```json
{
  "consequence_correlation": {
    "total_violations": 7,
    "total_violations_with_errors": 2,
    "correlation_rate": 0.286,
    "correlated_violations": [
      {
        "violation": {
          "timestamp": "2025-01-02T10:30:00Z",
          "category": "bash_for_file_ops",
          "pattern_matched": "Bash(command=\"cat"
        },
        "error": {
          "timestamp": "2025-01-02T10:31:00Z",
          "message": "File not found: story.md",
          "category": "file-not-found"
        },
        "time_delta_ms": 60000,
        "session_id": "abc123-def456"
      },
      {
        "violation": {
          "timestamp": "2025-01-02T10:50:00Z",
          "category": "context_file_violations",
          "pattern_matched": "Proceeding without context"
        },
        "error": {
          "timestamp": "2025-01-02T10:50:30Z",
          "message": "Context file not found",
          "category": "validation"
        },
        "time_delta_ms": 30000,
        "session_id": "mno345-pqr678"
      }
    ],
    "uncorrelated_violations": [
      {
        "timestamp": "2025-01-02T10:35:00Z",
        "category": "bash_for_file_ops",
        "pattern_matched": "Bash(command=\"echo",
        "session_id": "ghi789-jkl012"
      }
    ],
    "high_risk_patterns": [
      {
        "category": "context_file_violations",
        "violation_code": "AP-006",
        "correlation_rate": 1.00,
        "sample_size": 1,
        "recommendation": "Context file violations have 100% error correlation - always validate context"
      },
      {
        "category": "bash_for_file_ops",
        "violation_code": "AP-001",
        "correlation_rate": 0.33,
        "sample_size": 3,
        "recommendation": "Below 50% threshold - monitor but not flagged as high-risk"
      }
    ]
  }
}
```

### Anti-Pattern Analysis Pipeline

**Complete Workflow (7 Steps):**

```
Input: SessionEntry[] from history.jsonl
  ↓
[1] Filter entries with user_input field
[2] Apply anti-pattern matching rules (AC#1 - 10 categories)
[3] Aggregate violation counts and codes (AC#2)
[4] Load error entries (from STORY-229 ErrorEntry[])
[5] Correlate violations with errors (AC#3 - session-scoped)
[6] Identify high-risk patterns (>50% correlation)
[7] Generate AntiPatternAnalysisReport
  ↓
Output: Violations, distributions, correlations, registry
```

**Graceful Error Handling:**

Continue with partial results on errors:

```
FOR each SessionEntry:
  TRY:
    violations = match_anti_patterns(entry.user_input)
    process violations through steps 2-6
  CATCH error:
    Log error with context
    Include partial results in report
    Continue to next entry
```

### Output Structure

**Complete Anti-Pattern Analysis Report:**

```json
{
  "violations": [
    {
      "timestamp": "2025-01-02T10:30:00Z",
      "session_id": "abc123-def456",
      "command": "/dev STORY-100",
      "user_input": "Bash(command=\"cat story.md\")",
      "category": "bash_for_file_ops",
      "category_id": 1,
      "severity": "critical",
      "pattern_matched": "Bash(command=\"cat",
      "violation_code": "AP-001"
    }
  ],
  "category_distribution": {
    "bash_for_file_ops": 3,
    "monolithic_components": 0,
    "making_assumptions": 1,
    "size_violations": 1,
    "language_specific_code": 0,
    "context_file_violations": 1,
    "circular_dependencies": 0,
    "narrative_documentation": 0,
    "missing_frontmatter": 0,
    "hardcoded_paths": 1
  },
  "severity_distribution": {
    "critical": 5,
    "high": 1,
    "medium": 1,
    "low": 0
  },
  "metadata": {
    "total_entries": 8,
    "total_violations": 7,
    "violation_rate": 0.875,
    "unique_patterns": 6
  },
  "consequence_correlation": {
    "total_violations_with_errors": 2,
    "correlation_rate": 0.286,
    "high_risk_patterns": [
      {
        "category": "context_file_violations",
        "violation_code": "AP-006",
        "correlation_rate": 1.00
      }
    ]
  },
  "registry": {
    "AP-001": {
      "category": "bash_for_file_ops",
      "severity": "critical",
      "total_occurrences": 3,
      "first_seen": "2025-01-02T10:30:00Z",
      "last_seen": "2025-01-02T10:45:00Z"
    },
    "AP-003": {
      "category": "making_assumptions",
      "severity": "critical",
      "total_occurrences": 1,
      "first_seen": "2025-01-02T10:40:00Z",
      "last_seen": "2025-01-02T10:40:00Z"
    },
    "AP-004": {
      "category": "size_violations",
      "severity": "high",
      "total_occurrences": 1,
      "first_seen": "2025-01-02T11:05:00Z",
      "last_seen": "2025-01-02T11:05:00Z"
    },
    "AP-006": {
      "category": "context_file_violations",
      "severity": "critical",
      "total_occurrences": 1,
      "first_seen": "2025-01-02T10:50:00Z",
      "last_seen": "2025-01-02T10:50:00Z"
    },
    "AP-010": {
      "category": "hardcoded_paths",
      "severity": "medium",
      "total_occurrences": 1,
      "first_seen": "2025-01-02T11:00:00Z",
      "last_seen": "2025-01-02T11:00:00Z"
    }
  }
}
```

### Edge Case Handling

| Case | Handling |
|------|----------|
| Empty session file | Return empty violations array, totals at 0 |
| All entries have violations | Process all, violation_rate approaches 1.00 |
| No errors in session | correlation_rate = 0.00, empty high_risk_patterns |
| Legitimate Bash usage | Apply exception rules, NOT flagged as violation |
| Multiple violations per entry | Each violation counted separately |
| Very long user_input (>10000) | Truncate before pattern matching |
| Unicode content | Preserve encoding, case-insensitive matching |
| Bash in quotes (documentation) | Context-aware matching, NOT flagged |
| Missing user_input field | Skip entry for anti-pattern analysis |

### Integration with STORY-229 Error Categorization

**Data Flow:**

```
session-miner (SessionEntry[])
       ↓
STORY-229 Error Categorization (ErrorEntry[])
       ↓
STORY-231 Anti-Pattern Mining (AntiPatternViolation[])
       ↓
Consequence Correlation (correlate violations with errors)
       ↓
Combined Analysis Report for devforgeai-insights
```

**Integration Points:**

1. **ErrorEntry Reuse:** Anti-pattern correlation uses ErrorEntry from STORY-229
2. **Session Grouping:** Both features use same session_id grouping logic
3. **Timestamp Alignment:** Same ISO8601 timestamp format for correlation
4. **Combined Reporting:** Anti-pattern report references error categories

**Invocation Template:**

```markdown
Task(
  subagent_type="session-miner",
  description="Analyze anti-patterns from session history",
  prompt="""
  Perform anti-pattern analysis on history.jsonl:

  1. Parse history with session-miner (offset=0, limit=1000)
  2. Apply anti-pattern matching rules (10 categories)
  3. Aggregate violation counts and codes
  4. Load error entries (STORY-229)
  5. Correlate violations with subsequent errors
  6. Identify high-risk patterns (>50% correlation)
  7. Generate anti-pattern analysis report

  Return AntiPatternAnalysisReport with recommendations.
  """
)
```

### Core Helper Functions (Shared Reference)

These functions are referenced throughout algorithms above:

```
FUNCTION group_by_session_id(entries):
  # Partition entries into groups by session_id
  # Entries with null session_id grouped together
  RETURN Map<session_id, Entry[]>

FUNCTION extract_bash_command(user_input):
  # Extract command text from Bash(command="...") pattern
  # Returns lowercase command text
  RETURN command_string

FUNCTION extract_matched_text(user_input, pattern):
  # Return substring of user_input that matched pattern
  RETURN matched_substring

FUNCTION violation_code_for_category(category_name):
  # Map category name to AP-XXX code
  # Use CATEGORY_ID mapping from Category Definition Reference
  RETURN "AP-" + sprintf("%03d", category_id)
```

### Success Criteria (STORY-231)

**Functional Requirements:**
- [ ] Match all 10 anti-pattern categories from Category Definition Reference (AC#1)
- [ ] Apply legitimate Bash exceptions (npm test, git, docker, build, install)
- [ ] Count violations per category with category_distribution (AC#2)
- [ ] Assign AP-XXX codes using formula from Violation Code Assignment
- [ ] Calculate violation_rate and severity_distribution
- [ ] Correlate violations with subsequent errors within 10-minute window (AC#3)
- [ ] Identify high-risk patterns with >50% error correlation rate
- [ ] Session-scoped correlation (no cross-session correlations)

**Non-Functional Requirements:**
- [ ] Case-insensitive pattern matching (normalize_input function)
- [ ] Handle multiple violations per entry (all matched patterns counted)
- [ ] Truncate inputs >10000 chars for performance
- [ ] Context-aware matching (avoid false positives in documentation)
- [ ] Preserve Unicode content in pattern matching
- [ ] Graceful error handling (continue on partial failures)

**Integration Requirements:**
- [ ] Reuse ErrorEntry from STORY-229 for correlation
- [ ] Use same session_id grouping logic as error categorization
- [ ] Compatible JSON output format for downstream consumers
- [ ] Extends session-miner pipeline without modifying core
