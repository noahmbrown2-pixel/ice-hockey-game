# /support:kb-search

Search knowledge base for relevant articles.

## Usage

```
/support:kb-search "Search query"
/support:kb-search "How do I reset password" --category account
/support:kb-search "Error 500" --type troubleshooting
```

## Description

Searches internal knowledge base to:
1. Find relevant help articles
2. Surface troubleshooting guides
3. Locate policy documents
4. Identify related articles

## Options

- `--category`: Filter by category
- `--type`: Article type (how-to, troubleshooting, policy, faq)
- `--recent`: Prioritize recently updated
- `--internal`: Include internal-only articles
- `--format`: Output format (links, summary, full)

## Output Format

```markdown
## KB Search Results: "{query}"

### Top Matches

#### 1. {Article Title}
**Category**: {category}
**Last Updated**: {date}
**Relevance**: {score}%
**Link**: {url}

**Summary**:
{2-3 sentence summary}

**Key Points**:
- {Relevant point from article}
- {Relevant point from article}

---

#### 2. {Article Title}
**Category**: {category}
**Last Updated**: {date}
**Relevance**: {score}%
**Link**: {url}

**Summary**:
{2-3 sentence summary}

---

### Related Articles
- [{Title}]({link}) - {brief description}
- [{Title}]({link}) - {brief description}

### No Direct Match?
If these don't address the customer's issue:
- [ ] Consider creating a new KB article
- [ ] Escalate if this is a known gap
- [ ] Check internal wiki for undocumented solutions

### Customer-Shareable Links
Ready to paste into response:
- [Article 1 Title](public-url)
- [Article 2 Title](public-url)
```

## Search Tips

### Query Optimization
- Use specific error messages
- Include product names
- Try alternative terms

### Category Filters
| Category | Content Type |
|----------|--------------|
| Getting Started | Onboarding, setup |
| Account | Billing, settings, security |
| Features | How-to guides |
| Troubleshooting | Error resolution |
| API | Developer documentation |
| Policy | Terms, privacy, compliance |

## Gap Detection

When search returns no results:
```markdown
### Knowledge Gap Detected

**Query**: "{search query}"
**Suggested Action**: Create article covering:
- {Topic 1}
- {Topic 2}

**Ticket Reference**: {current ticket ID}
**Request KB Update**: [Submit Request]({link})
```

## MCP Integration

- **notionApi**: Search KB pages and databases
- **pocket-pick**: Cache frequently accessed articles
