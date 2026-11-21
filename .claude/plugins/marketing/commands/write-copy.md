# /marketing:write-copy

Generate marketing copy for various channels and purposes.

## Usage

```
/marketing:write-copy "Product/topic description"
/marketing:write-copy "Product" --type landing-page
/marketing:write-copy "Product" --tone professional --length short
```

## Description

Creates compelling marketing copy:
1. Headlines and taglines
2. Landing page copy
3. Ad copy (various formats)
4. Product descriptions
5. Email subject lines

## Options

- `--type`: Copy type (headline, landing-page, ad, product-desc, email)
- `--tone`: Voice (professional, casual, bold, friendly, technical)
- `--length`: Length (short, medium, long)
- `--audience`: Target audience
- `--cta`: Call-to-action focus

## Output Format

```markdown
## Marketing Copy: {Product/Topic}

### Headlines (Multiple Options)

**Option 1 (Benefit-focused)**:
{Headline}

**Option 2 (Problem-focused)**:
{Headline}

**Option 3 (Curiosity-driven)**:
{Headline}

---

### Tagline Options
1. "{Tagline}" - {Why it works}
2. "{Tagline}" - {Why it works}

---

### Landing Page Copy

**Hero Section**:
# {Headline}
{Subheadline - 1-2 sentences expanding on promise}

[CTA Button: {CTA text}]

**Problem Section**:
{2-3 sentences acknowledging the pain point}

**Solution Section**:
{How your product solves it}

**Benefits (3 key points)**:
1. **{Benefit}**: {Supporting detail}
2. **{Benefit}**: {Supporting detail}
3. **{Benefit}**: {Supporting detail}

**Social Proof**:
"{Testimonial or stat}"

**CTA Section**:
{Closing headline}
{Final value proposition}
[CTA Button: {CTA text}]

---

### Ad Copy Variations

**Google Ads (90 char)**:
Headline 1: {text}
Headline 2: {text}
Description: {text}

**Facebook/Instagram**:
{Ad copy with emoji optional}

Learn more →

**LinkedIn**:
{Professional tone copy}

---

### Email Subject Lines
1. {Subject line} - {Open rate prediction}
2. {Subject line} - {Open rate prediction}
3. {Subject line} - {Open rate prediction}
```

## Copywriting Formulas Applied

### AIDA
- **A**ttention: Grab with headline
- **I**nterest: Build with benefits
- **D**esire: Create with proof
- **A**ction: Drive with CTA

### PAS
- **P**roblem: Identify pain
- **A**gitate: Amplify impact
- **S**olve: Present solution

## MCP Integration

- **exa**: Research competitor copy and trends
- **notionApi**: Store copy variations
- **pocket-pick**: Access brand guidelines
