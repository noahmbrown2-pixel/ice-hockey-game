# /pm:prioritize

Score and rank features using prioritization frameworks.

## Usage

```
/pm:prioritize "Feature list or Notion database"
/pm:prioritize --framework rice
/pm:prioritize --framework moscow --project "Q1 Features"
```

## Description

Applies structured prioritization to feature lists:
1. Scores each feature on framework criteria
2. Calculates composite scores
3. Generates ranked list with justifications
4. Identifies quick wins and strategic bets

## Options

- `--framework`: Prioritization framework (rice, moscow, ice, kano, value-effort)
- `--project`: Filter to specific project
- `--weights`: Custom weighting for criteria
- `--export`: Export format (notion, csv, markdown)

## Frameworks

### RICE (Default)
```
RICE Score = (Reach × Impact × Confidence) / Effort

- Reach: How many users affected per quarter
- Impact: 3=Massive, 2=High, 1=Medium, 0.5=Low, 0.25=Minimal
- Confidence: 100%=High, 80%=Medium, 50%=Low
- Effort: Person-months required
```

### MoSCoW
```
Must Have: Critical for release
Should Have: Important but not vital
Could Have: Nice to have
Won't Have: Out of scope for now
```

### ICE
```
ICE Score = Impact × Confidence × Ease

All scored 1-10
```

### Value vs Effort Matrix
```
        High Value
            │
   Quick    │   Strategic
   Wins     │   Initiatives
────────────┼────────────
   Fill-ins │   Time
            │   Sinks
            │
        Low Value
   Low Effort ──── High Effort
```

## Output Format

```markdown
## Feature Prioritization - {Date}

### Framework: RICE

### Ranked Features

| Rank | Feature | Reach | Impact | Confidence | Effort | RICE Score |
|------|---------|-------|--------|------------|--------|------------|
| 1 | {Feature A} | 5000 | 3 | 80% | 2 | 6000 |
| 2 | {Feature B} | 2000 | 2 | 100% | 1 | 4000 |

### Quick Wins (High Score, Low Effort)
1. **{Feature}**: {justification}

### Strategic Bets (High Score, High Effort)
1. **{Feature}**: {justification}

### Recommendations
- Prioritize {Feature A} for immediate development
- Consider deferring {Feature X} due to low confidence
```

## MCP Integration

- **notionApi**: Read features from database, update priorities
- **pocket-pick**: Store prioritization criteria and weights
