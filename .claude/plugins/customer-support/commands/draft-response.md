# /support:draft-response

Generate empathetic, solution-focused responses to support tickets.

## Usage

```
/support:draft-response "Ticket content"
/support:draft-response "Ticket content" --tone professional
/support:draft-response "Ticket content" --include-kb
```

## Description

Creates draft responses that:
1. Acknowledge the customer's issue with empathy
2. Provide clear solution steps
3. Include relevant KB article links
4. Maintain appropriate tone for sentiment
5. Offer next steps and follow-up

## Options

- `--tone`: Response tone (empathetic, professional, friendly, formal)
- `--include-kb`: Include knowledge base links
- `--follow-up`: Include follow-up questions
- `--template`: Use specific response template
- `--language`: Target language for response

## Response Framework

### HEART Method
- **H**ear: Acknowledge the issue
- **E**mpathize: Show understanding
- **A**pologize: When appropriate
- **R**esolve: Provide solution
- **T**hank: Close positively

## Output Format

```markdown
## Draft Response

**Detected Sentiment**: {sentiment level}
**Recommended Tone**: {tone}
**Category**: {issue category}

---

### Response Draft

Hi {Customer Name},

{Empathy statement based on sentiment}

{Solution/Answer}

{Step-by-step instructions if applicable}
1. {Step 1}
2. {Step 2}
3. {Step 3}

{KB link if relevant}
For more details, you can also check out: [Article Title]({link})

{Follow-up question or confirmation request}
Let me know if this resolves your issue or if you need any additional help.

{Closing}
Best regards,
{Agent Name}

---

### Alternative Responses

**More Formal Version:**
{Alternative wording}

**If Issue Persists:**
{Escalation-ready response}

### Internal Notes
- Related tickets: {links}
- Known issue: {Yes/No}
- Engineering ticket: {link if applicable}
```

## Tone Guidelines

### For Frustrated Customers (High Sentiment)
```
✅ "I completely understand how frustrating this must be..."
✅ "I sincerely apologize for the inconvenience..."
✅ "Let me prioritize getting this resolved for you..."

❌ "As per our policy..."
❌ "Unfortunately..."
❌ "You should have..."
```

### For Technical Issues
```
✅ Clear numbered steps
✅ Screenshots when helpful
✅ Expected outcomes for each step
✅ Fallback if solution doesn't work
```

### For Billing Issues
```
✅ Specific amounts and dates
✅ Clear next steps
✅ Timeline for resolution
✅ Confirmation of any credits/refunds
```

## MCP Integration

- **notionApi**: Access KB articles and templates
- **pocket-pick**: Retrieve common responses
- **whatsapp**: Send responses via WhatsApp if needed
