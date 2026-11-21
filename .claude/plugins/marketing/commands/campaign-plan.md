# /marketing:campaign-plan

Create structured marketing campaign plans.

## Usage

```
/marketing:campaign-plan "Campaign goal/product"
/marketing:campaign-plan "Launch" --budget 50000 --duration "3 months"
/marketing:campaign-plan "Brand awareness" --channels "social,email,content"
```

## Description

Generates comprehensive campaign plans:
1. Campaign objectives and KPIs
2. Target audience definition
3. Channel strategy and mix
4. Content and creative requirements
5. Timeline and milestones
6. Budget allocation

## Options

- `--budget`: Total campaign budget
- `--duration`: Campaign length
- `--channels`: Specific channels to include
- `--objective`: Primary goal (awareness, leads, sales, retention)
- `--template`: Plan template (launch, awareness, demand-gen, event)

## Output Format

```markdown
# Campaign Plan: {Campaign Name}

## Executive Summary
**Objective**: {Primary goal}
**Duration**: {Start - End}
**Budget**: ${amount}
**Target**: {Primary metric target}

---

## Campaign Objectives

### Primary Objective
{Specific, measurable goal}

### Key Performance Indicators
| KPI | Target | Measurement |
|-----|--------|-------------|
| {KPI 1} | {target} | {how measured} |
| {KPI 2} | {target} | {how measured} |
| {KPI 3} | {target} | {how measured} |

---

## Target Audience

### Primary Segment
**Demographics**: {age, location, job title}
**Psychographics**: {interests, values, behaviors}
**Pain Points**: {what they struggle with}
**Motivations**: {what drives them}

### Buyer Persona
**Name**: {Persona name}
**Role**: {Job title}
**Goals**: {What they're trying to achieve}
**Challenges**: {Obstacles they face}
**Preferred Channels**: {Where they spend time}

---

## Channel Strategy

### Channel Mix
| Channel | Role | Budget % | KPI |
|---------|------|----------|-----|
| Paid Social | Awareness | 30% | Reach, CPM |
| Content | Education | 25% | Traffic, Engagement |
| Email | Nurture | 15% | Opens, Clicks |
| Paid Search | Capture | 20% | CTR, CPC |
| Events | Relationship | 10% | Leads |

### Channel Details

#### Paid Social
- **Platforms**: {Facebook, Instagram, LinkedIn}
- **Formats**: {carousel, video, stories}
- **Targeting**: {audience criteria}
- **Budget**: ${amount}

#### Content Marketing
- **Types**: {blog, video, whitepaper}
- **Topics**: {content themes}
- **Frequency**: {publishing cadence}

#### Email Marketing
- **Sequence**: {number of emails}
- **Triggers**: {automation triggers}
- **Segmentation**: {how lists divided}

---

## Creative Requirements

### Assets Needed
| Asset | Specs | Quantity | Due Date |
|-------|-------|----------|----------|
| Banner ads | 300x250, 728x90 | 4 each | {date} |
| Social images | 1200x628 | 8 | {date} |
| Video | 30s, 60s | 2 | {date} |
| Landing page | Responsive | 1 | {date} |

### Messaging Framework
**Key Message**: {Core campaign message}
**Supporting Messages**:
1. {Message theme 1}
2. {Message theme 2}
3. {Message theme 3}

---

## Timeline

### Phase 1: Pre-Launch ({dates})
- [ ] Finalize creative brief
- [ ] Develop assets
- [ ] Set up tracking
- [ ] Build landing pages

### Phase 2: Launch ({dates})
- [ ] Activate paid media
- [ ] Send announcement email
- [ ] Publish launch content

### Phase 3: Optimization ({dates})
- [ ] Weekly performance reviews
- [ ] A/B testing iterations
- [ ] Budget reallocation

### Phase 4: Wrap-up ({dates})
- [ ] Final performance report
- [ ] Learnings documentation
- [ ] Archive assets

---

## Budget Allocation

| Category | Amount | % of Total |
|----------|--------|------------|
| Paid Media | ${X} | 50% |
| Creative Production | ${X} | 20% |
| Content Development | ${X} | 15% |
| Tools/Tech | ${X} | 10% |
| Contingency | ${X} | 5% |
| **Total** | **${X}** | **100%** |

---

## Success Metrics & Reporting

### Reporting Cadence
- Daily: {metrics}
- Weekly: {metrics + review}
- Monthly: {full analysis}
- End of Campaign: {comprehensive report}

### Attribution Model
{How success will be attributed}
```

## MCP Integration

- **notionApi**: Store campaign plans and track progress
- **exa**: Research competitor campaigns
- **pocket-pick**: Access brand assets and guidelines
