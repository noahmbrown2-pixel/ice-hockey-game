# Prioritization Frameworks Skill

Auto-triggered skill for feature and initiative prioritization.

## Trigger Phrases

- "prioritize"
- "RICE"
- "MoSCoW"
- "ranking"
- "score features"
- "what should we build first"

## Framework Selection Guide

| Framework | Best For | Complexity |
|-----------|----------|------------|
| RICE | Data-driven teams, quantifiable impact | Medium |
| ICE | Quick prioritization, limited data | Low |
| MoSCoW | Release planning, stakeholder alignment | Low |
| Value/Effort | Visual communication, workshops | Low |
| WSJF | SAFe environments, flow optimization | High |
| Kano | Customer satisfaction focus | Medium |

## RICE Framework

### Formula
```
RICE Score = (Reach × Impact × Confidence) / Effort
```

### Scoring Guidelines

**Reach** (users per quarter):
- Count actual users affected
- Use data from similar features
- Be conservative if uncertain

**Impact** (score):
- 3 = Massive (transformative)
- 2 = High (significant improvement)
- 1 = Medium (noticeable improvement)
- 0.5 = Low (minor improvement)
- 0.25 = Minimal (barely noticeable)

**Confidence** (percentage):
- 100% = High (have data, tested similar)
- 80% = Medium (some evidence, reasonable assumptions)
- 50% = Low (gut feel, limited data)

**Effort** (person-months):
- Include all work: dev, design, QA, PM
- Round up for unknowns

### Example Calculation
```
Feature: Advanced Search
- Reach: 5,000 users/quarter
- Impact: 2 (High)
- Confidence: 80%
- Effort: 2 person-months

RICE = (5000 × 2 × 0.8) / 2 = 4,000
```

## ICE Framework

### Formula
```
ICE Score = Impact × Confidence × Ease
```

All factors scored 1-10:
- **Impact**: How much will this move the needle?
- **Confidence**: How sure are we about estimates?
- **Ease**: How easy is implementation?

## MoSCoW Method

### Categories
```
Must Have (M)
├── Critical for release
├── System won't work without it
└── Legal/compliance requirements

Should Have (S)
├── Important but not critical
├── Workarounds exist
└── High business value

Could Have (C)
├── Nice to have
├── Enhances UX
└── Low risk to exclude

Won't Have (W)
├── Out of scope for now
├── Future consideration
└── Explicitly excluded
```

### Allocation Rule
- Must Have: ≤60% of effort
- Should Have: ~20% of effort
- Could Have: ~20% of effort

## Value vs Effort Matrix

### Quadrants
```
        High Value
            │
   Quick    │   Strategic
   Wins     │   Initiatives
   (DO NOW) │   (PLAN CAREFULLY)
────────────┼────────────────────
   Fill-ins │   Time Sinks
   (IF TIME)│   (AVOID)
            │
        Low Value
   Low Effort ───── High Effort
```

### Scoring
- Value: 1-5 (business impact)
- Effort: 1-5 (implementation cost)
- Plot on 2D matrix

## WSJF (Weighted Shortest Job First)

### Formula
```
WSJF = Cost of Delay / Job Duration

Cost of Delay = User Value + Time Criticality + Risk Reduction
```

Use for continuous flow prioritization.

## Kano Model

### Categories
- **Must-Be**: Expected, dissatisfaction if missing
- **One-Dimensional**: Satisfaction proportional to fulfillment
- **Attractive**: Delighters, unexpected features
- **Indifferent**: No impact on satisfaction
- **Reverse**: Can cause dissatisfaction

### Survey Question Pairs
1. "If feature present, how do you feel?"
2. "If feature absent, how do you feel?"
