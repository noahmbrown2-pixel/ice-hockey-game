### Step 1.5: Conditional Treelint Field Validation

**Purpose:** When stories reference Treelint output fields, cross-reference field names against the canonical schema to prevent typos. Non-Treelint stories skip this validation entirely with zero additional overhead.

#### Treelint Keyword Detection

**Keywords to detect (case-insensitive, AST uses word boundary \bAST\b):**
- `treelint`
- `AST` (word boundary: `\bAST\b` to avoid matching LAST, CAST, BLAST)
- `dependency graph`
- `function signatures`
- `syntax tree`
- `code search`

**Detection Logic:**
```python
# Check if feature description contains Treelint-related keywords
treelint_keywords = [
    "treelint",
    r"\bAST\b",  # Word boundary to avoid false matches
    "dependency graph",
    "function signatures",
    "syntax tree",
    "code search"
]

contains_treelint = any(
    re.search(keyword, feature_description, re.IGNORECASE)
    for keyword in treelint_keywords
)

IF contains_treelint == False:
    # Skip Treelint validation entirely - zero overhead for non-Treelint stories
    GOTO Step 2 (Generate User Story)
```

#### Schema Loading (Conditional)

**If Treelint keywords detected, load canonical field definitions:**
```
Read(file_path=".claude/agents/references/treelint-search-patterns.md")
```

**Canonical Field Set** (extracted from treelint-search-patterns.md Output Format section):
```python
# Source: .claude/agents/references/treelint-search-patterns.md
# Sections: "JSON Output Parsing Examples" (Examples 1-3, lines 106-183)
# Last verified: 2026-02-10
canonical_fields = {
    "results", "type", "name", "file", "lines", "start", "end",
    "signature", "body", "count", "query", "members", "methods",
    "properties", "class_methods", "bases", "files", "path",
    "rank", "score", "references", "complexity", "total_files", "returned"
}
```

#### Field Cross-Reference Check

**Scan feature description for field references and compare against canonical set:**
```python
# Extract potential field references from feature description
# Extraction heuristic: Match backtick-wrapped identifiers (e.g., `results`)
# or dot-notation paths (e.g., `results[].name`, `members.methods`)
# Pattern: r'`(\w+(?:\[\])?(?:\.\w+)*)`' or similar regex
referenced_fields = extract_field_references(feature_description)

FOR each field in referenced_fields:
    IF field not in canonical_fields:
        # Find closest match using string similarity
        closest_match = find_closest_match(field, canonical_fields)

        # Emit non-blocking warning - generation continues
        WARNING: Story references Treelint field '{field}' which does not match canonical schema. Closest match: '{closest_match}'

    ELSE:
        # Valid field - silent pass (no output)
        pass
```

**Behavior:**
- Each field mismatch produces an individual WARNING line
- Warnings are non-blocking (generation continues after all warnings emitted)
- Valid field references pass silently (no output when field matches canonical set)

