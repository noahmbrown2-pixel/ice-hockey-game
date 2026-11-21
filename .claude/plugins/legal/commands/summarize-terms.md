# /legal:summarize-terms

Summarize legal documents in plain language.

## Usage

```
/legal:summarize-terms "Legal document text"
/legal:summarize-terms "Document" --audience business
/legal:summarize-terms "Terms of Service" --key-points
```

## Description

Translates legal language into:
1. Plain English summaries
2. Key points extraction
3. Obligation identification
4. Rights clarification
5. Risk highlighting

## Options

- `--audience`: Summary style (business, technical, executive, consumer)
- `--key-points`: Extract key points only
- `--obligations`: Focus on obligations
- `--length`: Summary length (brief, standard, detailed)

## Output Format

```markdown
## Document Summary

### Document Type: {Type}
**Parties**: {Who's involved}
**Effective**: {Date}
**Plain Language Grade**: {Readability score}

---

### TL;DR (One Paragraph)
{2-3 sentence summary of the entire document in plain language}

---

### What This Document Does
{Plain language explanation of the document's purpose}

---

### Key Terms Explained

| Legal Term | What It Actually Means |
|------------|------------------------|
| "{Legal jargon}" | {Plain explanation} |
| "{Legal jargon}" | {Plain explanation} |
| "{Legal jargon}" | {Plain explanation} |

---

### Your Rights

✅ **You Can**:
- {Right 1 in plain language}
- {Right 2 in plain language}
- {Right 3 in plain language}

---

### Your Obligations

📋 **You Must**:
- {Obligation 1 in plain language}
- {Obligation 2 in plain language}
- {Obligation 3 in plain language}

---

### Their Rights

The other party can:
- {Their right 1}
- {Their right 2}

---

### Their Obligations

They must:
- {Their obligation 1}
- {Their obligation 2}

---

### Important Dates & Deadlines

| Event | When | What Happens |
|-------|------|--------------|
| {Event 1} | {Date/Trigger} | {Consequence} |
| {Event 2} | {Date/Trigger} | {Consequence} |

---

### What Could Go Wrong

⚠️ **Watch Out For**:
1. **{Issue}**: {Plain explanation of risk}
2. **{Issue}**: {Plain explanation of risk}

---

### Money Matters

| Item | Amount/Terms |
|------|--------------|
| Payment | {Details} |
| Penalties | {Details} |
| Refunds | {Details} |

---

### How to Get Out

**Termination Options**:
- {How you can end this}
- {Consequences of ending}
- {Notice requirements}

---

### Questions to Ask

Before signing, consider asking:
1. {Clarifying question}
2. {Negotiation opportunity}

---

### Summary Table

| Aspect | Summary |
|--------|---------|
| What you're agreeing to | {Brief} |
| Main benefit to you | {Brief} |
| Main risk to you | {Brief} |
| Key obligation | {Brief} |
| How long it lasts | {Brief} |
| How to end it | {Brief} |

---

*This summary is for informational purposes. The original document remains legally binding.*
```

## Readability Metrics

The summarizer aims for:
- Flesch-Kincaid Grade Level: 8-10
- Short sentences (< 20 words average)
- Common words over legal jargon
- Active voice

## MCP Integration

- **notionApi**: Store summaries with source documents
- **pocket-pick**: Access glossary of legal terms
