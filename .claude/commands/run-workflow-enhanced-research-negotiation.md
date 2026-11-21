# Enhanced Research Agent Negotiation System

Execute multi-agent research with fact-checking debates, negotiation protocols, and Byzantine consensus.

## System Overview

This workflow transforms research agents into sophisticated negotiators who challenge each other's facts and positions, creating robust consensus-based research outputs.

## Arguments

- `$ARGUMENTS` - Research topic or question to investigate

## Execution Flow

### Phase 1: Agent Initialization

Initialize 6 specialized research agents with distinct roles:

1. **Evidence Gatherer** - Collects initial research from multiple sources
2. **Fact Checker** - Validates claims against authoritative sources
3. **Devil's Advocate** - Challenges assumptions and identifies weaknesses
4. **Domain Expert** - Provides specialized industry context
5. **Bias Detector** - Identifies confirmation bias and logical fallacies
6. **Synthesis Coordinator** - Builds consensus from validated findings

### Phase 2: Independent Research

Each agent conducts parallel independent research on: **$ARGUMENTS**

Use the Task tool with subagent_type="web-search-researcher" to gather initial findings for each agent role.

### Phase 3: Fact Challenge Round

Agents challenge each other's findings using structured debate:

**Challenge Protocol:**
1. Agent presents claim with sources
2. Other agents rate confidence (0-100)
3. Low-confidence claims (<70) trigger challenges
4. Challenger must provide counter-evidence or alternative sources
5. Original agent can defend or concede

**Challenge Categories:**
- Source Quality: Is the source authoritative and current?
- Methodology: Is the data collection method sound?
- Logic: Are conclusions properly supported by evidence?
- Bias: Does the finding show confirmation bias?

### Phase 4: Evidence Negotiation

Use Byzantine consensus (67% threshold) to accept or reject claims:

```
For each disputed claim:
  1. Present evidence from all sides
  2. Each agent votes: ACCEPT / REJECT / ABSTAIN
  3. Calculate consensus score
  4. If >= 67%: Claim accepted as validated fact
  5. If < 67%: Mark as disputed, include in report
```

### Phase 5: Consensus Building

The Synthesis Coordinator:
1. Collects all validated findings (67%+ consensus)
2. Organizes by theme and relevance
3. Identifies areas of agreement and disagreement
4. Creates final research synthesis

### Phase 6: V4 Memory Integration

Store debate patterns and outcomes for future optimization:
- Successful challenge patterns
- Source quality assessments
- Consensus formation strategies

Location: `/home/craigmbrown/Project/unified-communication/v4/memories/`

### Phase 7: Output Generation

Generate comprehensive research report with:
- Executive Summary (validated findings only)
- Detailed Findings (with confidence scores)
- Disputed Claims (with competing evidence)
- Source Quality Assessment
- Methodology Notes
- Agent Debate Transcript (optional)

## Integration Points

### AgentOps v2.0 Metrics
- Track 16 comprehensive metrics per agent
- Monitor negotiation rounds and outcomes
- Measure consensus formation time

### CaMel Security Integration
- 4-Layer validation for external sources
- Byzantine consensus (67% threshold)
- Anti-persuasion defenses against manipulation

### V4 Memory System
- 100% cache hit rate, 1.43ms load time
- 66 cross-references for inter-agent knowledge
- Pattern learning from previous debates

## Example Session

**Topic:** "Bitcoin Lightning Network adoption trends 2025"

**Phase 2 Output:**
- Evidence Gatherer: "5,000+ public nodes, 18,000+ channels"
- Domain Expert: "El Salvador adoption driving growth"
- Fact Checker: "Node count verified via 1ML.com"

**Phase 3 Challenges:**
- Bias Detector: "El Salvador data may be overstated - challenge"
- Devil's Advocate: "What about node churn rate?"

**Phase 4 Consensus:**
- Node count: 89% ACCEPT (validated)
- El Salvador impact: 54% ACCEPT (disputed)
- Channel growth rate: 78% ACCEPT (validated)

**Final Output:**
```
VALIDATED FINDINGS (67%+ consensus):
- Lightning Network has 5,000+ public nodes (89% confidence)
- Channel count growing 15% monthly (78% confidence)

DISPUTED FINDINGS (<67% consensus):
- El Salvador driving majority of growth (54% confidence)
  Counter-evidence: Global distribution shows wider adoption
```

## Commands to Execute

1. First, gather initial research:
```
Use Task tool with subagent_type="web-search-researcher" for topic: $ARGUMENTS
```

2. Then run fact-checking debates:
```
Use Task tool with subagent_type="enhanced-persona-debate-system" with the gathered findings
```

3. Apply Byzantine consensus and generate report:
```
Use Task tool with subagent_type="reasoning-monitor" to validate consensus formation
```

4. Store patterns in V4 memory system for future optimization.

## Success Metrics

- 95%+ research accuracy through multi-agent validation
- 67%+ Byzantine consensus threshold maintained
- Complete audit trail of all challenges and negotiations
- V4 memory integration for pattern learning
