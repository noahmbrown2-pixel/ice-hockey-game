# A/B Testing Skill

Auto-triggered skill for experimentation and optimization.

## Trigger Phrases

- "A/B test"
- "experiment"
- "test variations"
- "optimize"
- "split test"

## Testing Framework

### Test Hierarchy (Impact Priority)

```
High Impact Tests
├── 1. Value Proposition
├── 2. Call-to-Action
├── 3. Headlines/Subject Lines
├── 4. Pricing/Offers
└── 5. Page Layout

Medium Impact Tests
├── 6. Images/Visuals
├── 7. Copy Length
├── 8. Form Fields
└── 9. Social Proof Placement

Lower Impact Tests
├── 10. Button Colors
├── 11. Font Choices
└── 12. Minor Copy Changes
```

### Test Design Template

```markdown
## A/B Test Plan: {Test Name}

### Hypothesis
If we {change}, then {metric} will {increase/decrease} by {amount}
because {reasoning}.

### Test Details
| Field | Value |
|-------|-------|
| Test Name | {name} |
| Owner | {name} |
| Start Date | {date} |
| End Date | {date} |
| Traffic Split | 50/50 |
| Sample Size Needed | {calculated} |

### Variations

**Control (A)**:
{Description of current version}

**Treatment (B)**:
{Description of changed version}

**Screenshot/Mockup**:
[Include visuals]

### Primary Metric
{Main success metric}

### Secondary Metrics
- {Metric 2}
- {Metric 3}

### Guardrail Metrics
{Metrics that shouldn't be negatively impacted}

### Minimum Detectable Effect
{X}% change in {metric}

### Expected Duration
{X} days/weeks based on traffic and MDE
```

## Statistical Significance

### Sample Size Calculator

```
Required Sample = 2 × (Zα + Zβ)² × p(1-p) / MDE²

Where:
- Zα = 1.96 (95% confidence)
- Zβ = 0.84 (80% power)
- p = baseline conversion rate
- MDE = minimum detectable effect
```

### Rule of Thumb
- Need ~1,000 conversions per variation minimum
- Run for at least 1-2 full business cycles
- Don't peek early (or use sequential testing)

### Significance Levels
- 95% confidence = Statistically significant
- 90% confidence = Directionally significant
- <90% = Inconclusive

## Common Tests by Channel

### Email Tests
| Element | Control | Treatment |
|---------|---------|-----------|
| Subject | Short question | Benefit statement |
| From | Company name | Person name |
| CTA | "Learn More" | "Get Started" |
| Length | Short | Long |

### Landing Page Tests
| Element | Control | Treatment |
|---------|---------|-----------|
| Headline | Feature-focused | Benefit-focused |
| Hero | Image | Video |
| Form | Long | Short |
| CTA | Above fold | Below fold |

### Ad Tests
| Element | Control | Treatment |
|---------|---------|-----------|
| Headline | Question | Statement |
| Image | Product | Person |
| CTA | Generic | Specific |
| Copy | Long | Short |

## Results Documentation

```markdown
## Test Results: {Test Name}

### Summary
| Metric | Control | Treatment | Lift | Confidence |
|--------|---------|-----------|------|------------|
| {Primary} | {X}% | {Y}% | {+/-Z}% | {X}% |
| {Secondary} | {X}% | {Y}% | {+/-Z}% | {X}% |

### Winner: {Control/Treatment/Inconclusive}

### Statistical Validity
- Sample size: {n} per variation
- Duration: {X} days
- Confidence level: {X}%

### Key Insights
1. {What we learned}
2. {What we learned}

### Recommended Actions
- {What to implement}
- {Follow-up tests}

### Next Test
{What to test based on learnings}
```

## Testing Pitfalls to Avoid

1. **Stopping too early** - Wait for significance
2. **Testing too many things** - One variable per test
3. **Ignoring segments** - Check for segment differences
4. **No hypothesis** - Always have one
5. **Not documenting** - Record everything
