# /marketing:email-sequence

Create email marketing sequences for various objectives.

## Usage

```
/marketing:email-sequence "Objective description"
/marketing:email-sequence "Onboarding" --emails 5 --cadence weekly
/marketing:email-sequence "Sales nurture" --persona "Enterprise CTO"
```

## Description

Generates complete email sequences:
1. Welcome/onboarding flows
2. Nurture campaigns
3. Sales sequences
4. Re-engagement campaigns
5. Product launch announcements

## Options

- `--emails`: Number of emails in sequence
- `--cadence`: Timing (daily, weekly, custom)
- `--persona`: Target recipient
- `--type`: Sequence type (welcome, nurture, sales, win-back, launch)
- `--cta`: Primary call-to-action

## Output Format

```markdown
## Email Sequence: {Sequence Name}

### Sequence Overview
**Objective**: {Goal}
**Target Audience**: {Persona}
**Total Emails**: {count}
**Duration**: {total time span}
**Primary CTA**: {action}

### Sequence Flow
```
Day 0: Email 1 (Welcome)
   ↓
Day 3: Email 2 (Value)
   ↓
Day 7: Email 3 (Education)
   ↓
Day 14: Email 4 (Social Proof)
   ↓
Day 21: Email 5 (CTA)
```

---

## Email 1: {Email Name}
**Send**: Day 0 (Immediately / Trigger: {event})
**Objective**: {What this email achieves}

### Subject Line Options
1. {Subject line A}
2. {Subject line B}
3. {Subject line C}

### Preview Text
{Preview text that appears after subject}

### Email Body

Hi {First Name},

{Opening - 1-2 sentences connecting to trigger/context}

{Main content - value proposition or information}

{Key points or bullet list if applicable}
• {Point 1}
• {Point 2}
• {Point 3}

{Transition to CTA}

[{CTA Button Text}]({link})

{Sign-off}
{Sender Name}

### Metrics to Track
- Open rate target: {%}
- Click rate target: {%}
- Primary goal: {specific action}

---

## Email 2: {Email Name}
**Send**: Day 3
**Objective**: {What this email achieves}

[... Same structure for each email ...]

---

## Sequence Metrics

### Target Metrics
| Email | Open Rate | Click Rate | Conversion |
|-------|-----------|------------|------------|
| Email 1 | 40%+ | 10%+ | N/A |
| Email 2 | 35%+ | 8%+ | 2%+ |
| Email 3 | 30%+ | 7%+ | 3%+ |
| Email 4 | 28%+ | 6%+ | 4%+ |
| Email 5 | 25%+ | 8%+ | 5%+ |

### Exit Conditions
- Converts (goal achieved)
- Unsubscribes
- Marks as spam
- Completes sequence

### A/B Testing Recommendations
- Test subject lines on Email 1
- Test CTA copy on Email 3
- Test send times across sequence

---

## Automation Rules

### Entry Triggers
- {Trigger 1}: {criteria}
- {Trigger 2}: {criteria}

### Exit Triggers
- {Action that removes from sequence}

### Branch Logic
```
If {condition}:
  → Send alternative Email 3
Else:
  → Continue sequence
```
```

## Email Best Practices Applied

### Subject Lines
- Under 50 characters
- Personalization when relevant
- Urgency/curiosity when appropriate
- A/B test variations

### Body Copy
- Mobile-optimized (short paragraphs)
- Single clear CTA
- Scannable formatting
- Value-first approach

## MCP Integration

- **notionApi**: Store email templates
- **pocket-pick**: Access brand voice and templates
