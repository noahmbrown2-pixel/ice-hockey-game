# /sales:objection-handler

Generate responses to common sales objections.

## Usage

```
/sales:objection-handler
/sales:objection-handler "It's too expensive"
/sales:objection-handler --category pricing
/sales:objection-handler --persona "CTO"
```

## Description

Provides battle-tested responses to objections:
1. Categorizes objection type
2. Provides multiple response approaches
3. Includes proof points and data
4. Suggests follow-up questions
5. Offers alternative angles

## Options

- `--category`: Filter by objection type (pricing, timing, competition, authority, need)
- `--persona`: Tailor response to specific persona
- `--style`: Response style (consultative, assertive, empathetic)
- `--add`: Add custom objection to library

## Objection Categories

### Pricing Objections
- "It's too expensive"
- "We don't have budget"
- "Competitor is cheaper"
- "ROI isn't clear"

### Timing Objections
- "Not the right time"
- "We're busy with other priorities"
- "Call back next quarter"
- "We just implemented something else"

### Competition Objections
- "We're happy with current solution"
- "Competitor has feature X"
- "You're too new/small"
- "Industry leader is safer choice"

### Authority Objections
- "I need to check with my team"
- "This isn't my decision"
- "Need executive approval"

### Need Objections
- "We don't have this problem"
- "Our current process works fine"
- "This isn't a priority"

## Output Format

```markdown
# Objection Handler: "{Objection}"

## Objection Analysis
**Category**: {Pricing/Timing/Competition/Authority/Need}
**Underlying Concern**: {What they're really worried about}
**Typical Personas**: {Who usually raises this}

---

## Response Strategies

### 1. Acknowledge & Explore
**Approach**: Validate concern, dig deeper

> "I appreciate you sharing that. Can you help me understand what you're
> comparing us to? I want to make sure I'm addressing the right concern."

**Follow-up Questions**:
- "What would make the investment worthwhile for you?"
- "How are you measuring the cost of the current situation?"

---

### 2. Reframe Value
**Approach**: Shift from cost to value/ROI

> "You're right that there's an investment involved. Our customers typically
> see {X% improvement/Y savings} within {timeframe}. For example, {Company}
> reduced their {metric} by {amount}, which paid for the solution in {time}."

**Proof Points**:
- {Customer A}: {specific result}
- {Customer B}: {specific result}
- Industry average ROI: {percentage}

---

### 3. Challenge Status Quo
**Approach**: Highlight cost of inaction

> "I understand budget is a concern. What's the cost of continuing with the
> current approach? Our customers were spending {X hours/$ amount} before,
> which often exceeds the investment in our solution."

**Cost of Inaction Points**:
- Productivity loss: {quantified}
- Opportunity cost: {quantified}
- Risk exposure: {quantified}

---

### 4. Creative Solutions
**Approach**: Offer alternatives to address concern

> "Let me see if there's a way to make this work. We have options like:
> - Starting with a smaller scope
> - Phased implementation
> - Pilot program to prove value
> Would any of these help?"

**Alternatives to Offer**:
- Smaller initial scope
- Different payment terms
- Pilot/POC program
- Professional services support

---

## Persona-Specific Variations

### For CFO
Focus on: ROI, risk mitigation, total cost of ownership
> "I understand you need to justify every investment. Let me share our
> TCO analysis and how it compares to alternatives..."

### For CTO
Focus on: Technical value, integration costs, team productivity
> "Beyond the license cost, consider the engineering time savings..."

### For End User
Focus on: Day-to-day impact, ease of use, support
> "What would it mean for your daily work if you could..."

---

## What NOT to Do
- Don't immediately offer a discount
- Don't get defensive
- Don't skip the discovery
- Don't accept the objection at face value
```

## MCP Integration

- **pocket-pick**: Store custom objection responses
- **notionApi**: Track effective responses in sales playbook
