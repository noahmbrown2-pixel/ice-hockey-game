# /marketing:persona-create

Create detailed buyer personas for marketing targeting.

## Usage

```
/marketing:persona-create "Target audience description"
/marketing:persona-create "Enterprise IT buyers" --industry tech
/marketing:persona-create --from-data "Customer data source"
```

## Description

Generates comprehensive buyer personas:
1. Demographics and firmographics
2. Goals and challenges
3. Buying behavior
4. Content preferences
5. Channel preferences

## Options

- `--industry`: Target industry
- `--from-data`: Generate from customer data
- `--b2b`: B2B focused persona
- `--b2c`: B2C focused persona
- `--count`: Number of personas to create

## Output Format

```markdown
## Buyer Persona: {Persona Name}

### Quick Overview
**Name**: {Persona Name} (e.g., "Technical Tom", "Marketing Maria")
**Role**: {Job Title}
**Company Size**: {Employee range}
**Industry**: {Industry/Industries}
**Age Range**: {Age bracket}

---

### Demographics & Background

**Education**: {Highest degree, field}
**Career Path**: {Typical progression}
**Reports To**: {Superior's role}
**Team Size**: {Direct reports}
**Income Range**: {If relevant}

**Day in the Life**:
{Brief description of typical workday}

---

### Professional Profile

**Responsibilities**:
- {Key responsibility 1}
- {Key responsibility 2}
- {Key responsibility 3}

**Success Metrics**:
- {How they're measured 1}
- {How they're measured 2}

**Tools They Use**:
- {Tool category}: {Specific tools}
- {Tool category}: {Specific tools}

---

### Goals & Challenges

**Primary Goals**:
1. {Professional goal with context}
2. {Professional goal with context}
3. {Professional goal with context}

**Key Challenges**:
1. **{Challenge}**: {Impact on their work}
2. **{Challenge}**: {Impact on their work}
3. **{Challenge}**: {Impact on their work}

**Frustrations**:
- "{Quote expressing frustration}"
- "{Quote expressing frustration}"

---

### Buying Behavior

**Role in Purchase Decision**:
{Decision Maker / Influencer / User / Gatekeeper}

**Research Process**:
1. {How they discover solutions}
2. {How they evaluate options}
3. {What convinces them}

**Decision Criteria** (Ranked):
1. {Most important factor}
2. {Second factor}
3. {Third factor}

**Budget Authority**: {Yes/No/Partial}
**Typical Purchase Timeline**: {Duration}

**Objections**:
- {Likely objection 1}
- {Likely objection 2}

---

### Content & Channel Preferences

**Preferred Content Types**:
| Content Type | Interest Level |
|--------------|----------------|
| Case studies | High |
| How-to guides | High |
| Webinars | Medium |
| White papers | Medium |
| Social posts | Low |

**Information Sources**:
- {Where they go for industry info}
- {Publications they read}
- {Events they attend}

**Social Media Presence**:
- LinkedIn: {Active/Passive/None}
- Twitter: {Active/Passive/None}
- Other: {Platforms}

**Best Times to Reach**:
- Email: {day/time}
- Calls: {day/time}

---

### Messaging Framework

**Key Messages That Resonate**:
1. "{Message that addresses their pain}"
2. "{Message that speaks to their goals}"
3. "{Message about outcomes}"

**Value Proposition for This Persona**:
{Tailored value prop}

**Words That Resonate**: {List of effective terms}
**Words to Avoid**: {Terms that don't work}

---

### Example Quotes

> "{Quote representing their mindset about work}"

> "{Quote about their challenges}"

> "{Quote about what they value in solutions}"

---

### How to Identify This Persona

**LinkedIn Signals**:
- Job titles: {variations}
- Keywords in profile: {terms}
- Group memberships: {relevant groups}

**Behavioral Signals**:
- {Action that indicates this persona}
- {Content engagement pattern}

---

### Persona Summary Card

| Attribute | Value |
|-----------|-------|
| Name | {Persona Name} |
| Role | {Title} |
| Company Size | {Range} |
| Key Goal | {Primary goal} |
| Key Challenge | {Primary pain} |
| Preferred Channel | {Best channel} |
| Content Preference | {Top content type} |
| Decision Role | {Role in purchase} |
```

## MCP Integration

- **notionApi**: Store personas in database
- **exa**: Research industry trends and roles
- **pocket-pick**: Access existing customer data
