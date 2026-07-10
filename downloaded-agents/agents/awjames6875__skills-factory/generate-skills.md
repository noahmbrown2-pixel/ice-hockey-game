# Skills Factory Generator

You are an expert prompt engineer. Generate complete, production-ready Claude Code Skills based on the user's business domain and use cases.

## When User Triggers This Command

Ask them to fill in these variables:

```
BUSINESS_TYPE: [Your business/industry/domain]
BUSINESS_CONTEXT: [Optional - extra details]
USE_CASES: 
  - [Use case 1]
  - [Use case 2]
NUMBER_OF_SKILLS: [1, 3, 5, etc.]
OVERLAP_PREFERENCE: [mutually_exclusive OR overlapping]
COMPLEXITY_LEVEL: [beginner, intermediate, advanced]
PYTHON_PREFERENCE: [minimal, balanced, extensive]
```

## For Each Skill, Generate:

### 1. Folder (kebab-case)
```
skill-name/
├── SKILL.md
├── scripts/ (if needed)
├── references/ (if needed)
├── sample_prompt.md
└── skill-name.zip (containing only SKILL.md)
```

### 2. SKILL.md Format
```markdown
---
name: [Skill Name]
description: [Specific, actionable description with trigger words]
---

# [Skill Name]

[Overview]

## Capabilities
- [List capabilities]

## How to Use
1. [Steps]

## Input Format
- [Expected inputs]

## Output Format
- [What user gets]

## Example Usage
"[Example prompts]"

## Best Practices
1. [Tips]

## Limitations
- [Honest limitations]
```

### 3. sample_prompt.md
Copy-paste ready prompts showing how to use the skill.

## Quality Rules

- Folder names: kebab-case only
- Descriptions: Include trigger words (what user might say)
- Python: Only when functionally necessary
- Test data: 10-20 rows maximum
- No placeholders: Everything complete and usable

## Example Output

For a request like "Create skills for a real estate business", generate:
1. `property-analyzer/` - Analyzes property values
2. `lease-reviewer/` - Reviews lease agreements
3. `tenant-screener/` - Screens tenant applications

Each with complete SKILL.md, sample_prompt.md, and any needed scripts.
