# /marketing:social-post

Draft social media posts optimized for each platform.

## Usage

```
/marketing:social-post "Topic or announcement"
/marketing:social-post "Product launch" --platform linkedin
/marketing:social-post "Blog post URL" --all-platforms
```

## Description

Creates platform-optimized social posts:
1. Platform-specific formatting
2. Appropriate hashtags
3. Emoji usage (optional)
4. CTA integration
5. Multiple variations

## Options

- `--platform`: Specific platform (twitter, linkedin, facebook, instagram)
- `--all-platforms`: Generate for all platforms
- `--tone`: Voice (professional, casual, bold)
- `--hashtags`: Include hashtags (yes/no/minimal)
- `--emoji`: Include emojis (yes/no/minimal)

## Platform Specifications

| Platform | Max Length | Hashtags | Best Practices |
|----------|------------|----------|----------------|
| X/Twitter | 280 chars | 2-3 | Concise, engaging, thread for longer |
| LinkedIn | 3,000 chars | 3-5 | Professional, storytelling, insights |
| Facebook | 63,206 chars | 1-2 | Conversational, visual focus |
| Instagram | 2,200 chars | 10-30 | Visual-first, story in caption |

## Output Format

```markdown
## Social Posts: {Topic}

---

### X/Twitter

**Post 1 (Announcement)**:
{Tweet text}

#hashtag1 #hashtag2

**Post 2 (Question/Engagement)**:
{Tweet text}

**Thread Option**:
1/ {First tweet - hook}

2/ {Second tweet - context}

3/ {Third tweet - value}

4/ {Fourth tweet - CTA}

---

### LinkedIn

**Post**:
{Opening hook - 1-2 lines that appear before "see more"}

{Main content - 3-5 paragraphs}

{Bullet points if applicable}
• Point 1
• Point 2
• Point 3

{CTA}

#hashtag1 #hashtag2 #hashtag3

---

### Facebook

**Post**:
{Conversational opening}

{Main message}

{CTA with link}

🔗 {Link}

---

### Instagram

**Caption**:
{Hook - first line most important}

{Story or value content}

{CTA}

.
.
.

{Hashtag block - 15-20 relevant hashtags}

---

### Platform-Specific Tips

**X/Twitter**:
- Best times: 8-10 AM, 12 PM, 4-6 PM
- Use polls for engagement
- Tag relevant accounts

**LinkedIn**:
- Best times: Tue-Thu, 7-8 AM
- First line is crucial (before "see more")
- Professional but personal

**Facebook**:
- Best times: 1-4 PM
- Visual content performs best
- Encourage comments

**Instagram**:
- Best times: 11 AM - 1 PM, 7-9 PM
- First hashtag can be in caption
- Stories for ephemeral content
```

## Content Calendar Integration

Posts can be scheduled via content calendar skill.

## MCP Integration

- **xai-research**: Research trending hashtags and topics
- **notionApi**: Store post library
- **pocket-pick**: Access brand voice guidelines
