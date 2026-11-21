---
name: source-indexer
description: Build a comprehensive source-index.json by walking the current repo tree. Invoke after lib-cloner completes. Writes stages/02_research_harvest/output/source-index.json and evaluation/research/compiled/source-index.json. This feeds stage 03 (semantic cartography).
---

# source-indexer

Walk the full repo tree and produce a fresh source-index.json listing every meaningful artifact.

## Scope

READ: all of `/Volumes/PixelTable/VW_iTWIN_Bridge/meta/` (excluding .git/, node_modules/, .venv/)
WRITE: `stages/02_research_harvest/output/source-index.json`, `evaluation/research/compiled/source-index.json`
FORBIDDEN: modifying source files

## Job

1. Walk the tree, collecting:
   - All contracts YAML files (`contracts/*.yaml`)
   - All schema JSON files (`schemas/*.json`)
   - All examples JSON files (`examples/*.json`)
   - All scripts Python files (`scripts/*.py`, `scripts/*.sh`)
   - All lib repo roots and their READMEs (`lib/*/README.md`)
   - All stage CONTEXT.md files (`stages/*/CONTEXT.md`)
   - Key evaluation artifacts (`evaluation/research/compiled/`, `evaluation/tool-health/status.json`)
2. For each lib repo, record:
   - name, path, has_readme, has_package_json, has_pyproject
3. Emit `source-index.json`

## Output Schema

```json
{
  "schema_version": "1.0.0",
  "packet_type": "source_index",
  "status": "fresh",
  "generated_at": "<iso>",
  "sources": {
    "contracts": ["contracts/agent-role-contract.yaml", ...],
    "schemas": ["schemas/*.json", ...],
    "examples": ["examples/*.valid.json", ...],
    "scripts": ["scripts/*.py", ...],
    "stage_contexts": ["stages/01_inbox_intake/CONTEXT.md", ...]
  },
  "lib_repos": [
    {
      "name": "pi-vs-claude-code",
      "path": "lib/pi-vs-claude-code",
      "has_readme": true,
      "has_package_json": true,
      "has_pyproject": false,
      "installed": true,
      "capability_id": "pi-vs-claude-code"
    }
  ],
  "totals": {
    "contracts": 31,
    "schemas": 0,
    "examples": 0,
    "lib_repos": 10
  }
}
```

## Hard Rules

- Use relative paths from the repo root in all path fields
- Skip: `.git/`, `node_modules/`, `__pycache__/`, `.venv/`, `.DS_Store`
- Write identical content to BOTH output paths
