# OKR Tracking Skill

Auto-triggered skill for Objectives and Key Results management.

## Trigger Phrases

- "OKR"
- "objectives"
- "key results"
- "goals"
- "quarterly objectives"

## OKR Framework

### Structure
```
Objective (O)
├── Key Result 1 (KR1): {measurable outcome}
├── Key Result 2 (KR2): {measurable outcome}
└── Key Result 3 (KR3): {measurable outcome}
```

### Objective Guidelines
- Qualitative and inspirational
- Time-bound (usually quarterly)
- Ambitious but achievable
- Aligned with company strategy

### Key Result Guidelines
- Quantitative and measurable
- Outcome-focused (not output)
- 3-5 per objective
- Binary or % achievable

## OKR Templates

### Company-Level OKR
```markdown
## Company OKRs - Q1 2026

### O1: Establish market leadership in {category}
| KR | Target | Current | Status |
|----|--------|---------|--------|
| KR1: Achieve $X ARR | $500K | $320K | 🟡 64% |
| KR2: Reach X users | 10,000 | 7,500 | 🟡 75% |
| KR3: NPS score of X | 50 | 48 | 🟢 96% |

### O2: Build world-class engineering culture
| KR | Target | Current | Status |
|----|--------|---------|--------|
| KR1: Deploy X times/week | 10 | 12 | 🟢 120% |
| KR2: Test coverage X% | 80% | 72% | 🟡 90% |
| KR3: Incident MTTR < X hrs | 4h | 3h | 🟢 133% |
```

### Team-Level OKR
```markdown
## Team OKRs - Q1 2026
**Team**: Product Engineering

### O1: Deliver exceptional user experience
- **KR1**: Reduce page load time to <2s (Current: 3.2s → Target: 2s)
- **KR2**: Achieve 95% mobile accessibility score
- **KR3**: Zero P0 bugs in production

### O2: Accelerate feature velocity
- **KR1**: Ship 5 major features (Current: 2/5)
- **KR2**: Reduce sprint spillover to <10%
- **KR3**: Complete 3 tech debt items per sprint
```

## Progress Tracking

### Status Indicators
```
🟢 On Track (70-100%+ of target)
🟡 At Risk (40-69% of target)
🔴 Off Track (<40% of target)
⚪ Not Started
```

### Weekly Check-in Format
```markdown
## OKR Check-in - Week of {Date}

### Progress Summary
| Objective | Overall | Confidence |
|-----------|---------|------------|
| O1 | 68% | High |
| O2 | 45% | Medium |
| O3 | 82% | High |

### Key Updates
- **O1/KR2**: Completed milestone X, on track for target
- **O2/KR1**: Blocked by dependency, mitigation in place

### Risks & Blockers
- {Risk}: {Mitigation plan}

### Focus for Next Week
1. {Priority action}
2. {Priority action}
```

### Quarterly Review Format
```markdown
## Q1 2026 OKR Review

### Summary
- Objectives achieved: 2/3
- Overall score: 72%
- Stretch targets hit: 1

### Objective Details

#### O1: {Objective} - Score: 85% 🟢
| KR | Target | Actual | Score |
|----|--------|--------|-------|
| KR1 | X | Y | 90% |
| KR2 | X | Y | 80% |
| KR3 | X | Y | 85% |

**Learnings**: {What we learned}
**Carry-forward**: {What continues to Q2}

### Retrospective
- **What worked**: {success factors}
- **What didn't**: {challenges}
- **Improvements**: {changes for next quarter}
```

## Scoring Guidelines

### Google-Style Scoring
- 0.0-0.3: Failure (didn't really get started)
- 0.4-0.6: Progress but fell short
- 0.7-0.9: Hit target (sweet spot)
- 1.0: Achieved 100% (maybe not ambitious enough)

### Recommended Targets
- Aim for 70% achievement on stretch OKRs
- 100% achievement suggests OKRs weren't ambitious enough
- Below 40% suggests poor scoping or major blockers

## MCP Integration

- **notionApi**: Store and track OKRs in databases
- **pocket-pick**: Quick access to current OKRs
