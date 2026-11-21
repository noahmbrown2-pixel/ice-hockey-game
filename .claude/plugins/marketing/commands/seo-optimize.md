# /marketing:seo-optimize

Optimize content for search engines.

## Usage

```
/marketing:seo-optimize "Content to optimize"
/marketing:seo-optimize "Content" --keyword "target keyword"
/marketing:seo-optimize --url "https://page-to-analyze"
```

## Description

Provides SEO optimization for:
1. Keyword analysis and recommendations
2. Title and meta tag optimization
3. Content structure improvements
4. Internal linking suggestions
5. Technical SEO checks

## Options

- `--keyword`: Target keyword to optimize for
- `--url`: Analyze existing page
- `--competitors`: Include competitor analysis
- `--type`: Content type (blog, landing-page, product)
- `--intent`: Search intent (informational, transactional, navigational)

## Output Format

```markdown
## SEO Optimization: {Page/Topic}

### Target Keywords

**Primary Keyword**: {keyword}
- Search Volume: {monthly volume}
- Difficulty: {1-100}
- Current Ranking: {if known}

**Secondary Keywords**:
| Keyword | Volume | Difficulty | Include In |
|---------|--------|------------|------------|
| {kw} | {vol} | {diff} | Title/H2 |
| {kw} | {vol} | {diff} | Body |
| {kw} | {vol} | {diff} | Meta |

**Long-tail Opportunities**:
- {Long-tail keyword 1}
- {Long-tail keyword 2}

---

### Title Tag Optimization

**Current**: {existing title if applicable}

**Recommended**:
1. {Title option 1} ({character count})
2. {Title option 2} ({character count})

**Guidelines**:
- Include primary keyword
- 50-60 characters
- Compelling for clicks

---

### Meta Description

**Current**: {existing meta if applicable}

**Recommended**:
{Optimized meta description including keyword and CTA}
({character count}/160)

---

### Content Structure

**Recommended Heading Structure**:
```
H1: {Optimized H1 with primary keyword}
├── H2: {Section heading with secondary keyword}
│   ├── H3: {Subsection}
│   └── H3: {Subsection}
├── H2: {Section heading}
│   ├── H3: {Subsection}
│   └── H3: {Subsection}
└── H2: {Conclusion/CTA section}
```

**Word Count Recommendation**: {count} words
**Current Word Count**: {if analyzing existing}

---

### On-Page Optimization Checklist

#### Content
- [ ] Primary keyword in first 100 words
- [ ] Secondary keywords naturally distributed
- [ ] Keyword density: 1-2%
- [ ] Unique, valuable content
- [ ] Answers search intent

#### Technical
- [ ] URL contains keyword
- [ ] Image alt tags optimized
- [ ] Internal links included
- [ ] External authoritative links
- [ ] Mobile-friendly

#### User Experience
- [ ] Clear headings and structure
- [ ] Short paragraphs
- [ ] Bullet points/lists
- [ ] Visual elements
- [ ] Fast page load

---

### Internal Linking Suggestions

Link to these pages:
- [{Anchor text}]({related page}) - Relevance: High
- [{Anchor text}]({related page}) - Relevance: Medium

Link from these pages:
- {Existing page that should link to this}

---

### Competitor Analysis

| Competitor | Word Count | Keywords | Backlinks |
|------------|------------|----------|-----------|
| {URL 1} | {count} | {main kw} | {count} |
| {URL 2} | {count} | {main kw} | {count} |

**Content Gaps**:
- {Topic competitors cover that we don't}
- {Angle we could take}

---

### Action Items

| Priority | Action | Impact |
|----------|--------|--------|
| High | Update title tag | Immediate |
| High | Add primary keyword to H1 | Immediate |
| Medium | Expand content by {X} words | 1-2 weeks |
| Medium | Add internal links | 1 week |
| Low | Build backlinks | Ongoing |
```

## MCP Integration

- **exa**: Keyword research and competitor analysis
- **notionApi**: Store SEO guidelines and tracking
