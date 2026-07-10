# Template Compliance Validation

**Version**: 1.0
**Status**: ACTIVE
**Last Updated**: 2026-02-12

This reference document defines the template compliance validation logic for the agent-generator. It covers BLOCK logic for missing/malformed required sections, WARNING logic for missing optional sections, emergency bypass handling, and validation report format.

---

## Overview

Template compliance validation ensures all generated agents conform to the canonical agent template structure before the Write() operation proceeds. Validation rules derive from the canonical template file, not hardcoded values.

**Validation Flow:**
```
Generate Agent Content → Template Compliance Validation → Write() Operation
                              ↓
                         If BLOCK: Halt Write(), offer auto-fix
                         If WARNING: Proceed Write(), display warnings
                         If PASS: Proceed Write()
```

---

## Required Sections Validation (AC#1, AC#2)

### Extracting Required Sections from Canonical Template

Before validation, read the canonical template and extract the list of required sections:

```
Read(file_path=".claude/agents/agent-generator/references/canonical-agent-template.md")

# Extract Section 1-10 headings - these are the 10 required sections:
required_sections = [
  "Section 1: YAML Frontmatter",
  "Section 2: Title",
  "Section 3: Purpose",
  "Section 4: When Invoked",
  "Section 5: Input/Output Specification",
  "Section 6: Constraints and Boundaries",
  "Section 7: Workflow",
  "Section 8: Success Criteria",
  "Section 9: Output Format",
  "Section 10: Examples"
]
```

### Validation Before Write() Operation

Template compliance validation occurs AFTER agent content is generated and BEFORE the Write() operation:

```
FOR each generated_agent:
  # Step 1: Extract sections from generated content
  found_sections = extract_h2_headings(generated_content)

  # Step 2: Check each required section
  missing_required = []
  FOR section in required_sections:
    section_heading = extract_heading_name(section)  # e.g., "Purpose", "Workflow"
    IF section_heading NOT IN found_sections:
      missing_required.append(section_heading)

  # Step 3: Determine result
  IF len(missing_required) > 0:
    result = TEMPLATE_COMPLIANCE_FAILED
    halt_write_operation()
    display_block_message(missing_required)
    offer_auto_fix()
  ELSE:
    proceed_with_write()
```

---

## BLOCK Logic for Missing Required Sections (AC#2)

### TEMPLATE_COMPLIANCE_FAILED Status

When one or more required sections are missing, validation returns `TEMPLATE_COMPLIANCE_FAILED` status:

```
status: TEMPLATE_COMPLIANCE_FAILED
action: BLOCK
write_halted: true
```

### Halt Write() Operation

When a required section is missing, the Write() operation is halted:

```
IF validation_result == TEMPLATE_COMPLIANCE_FAILED:
  # Write() operation is NOT executed
  # Agent file is NOT written to disk
  halt_write_operation()
  display_block_result()
```

### List Missing Section Names in BLOCK Result

The BLOCK result must list each missing section by exact heading name:

```
BLOCK Result Format:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Template Compliance: BLOCK
  Status: TEMPLATE_COMPLIANCE_FAILED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Missing Required Sections:
  1. Purpose - [section name]
  2. Workflow - [section name]
  3. Success Criteria - [section name]

Write() operation halted. Agent file NOT written.
```

### Remediation Message Per Missing Section

Each missing section includes a remediation message describing expected content:

```
Missing Required Sections with Remediation:

1. Purpose
   Expected: 2-5 sentences describing agent domain expertise and primary function
   Remediation: Add "## Purpose" section with agent specialization description

2. Workflow
   Expected: Numbered steps with tool invocation patterns
   Remediation: Add "## Workflow" section with at least 3 numbered steps

3. Success Criteria
   Expected: Markdown checklist with measurable items
   Remediation: Add "## Success Criteria" section with at least 4 checklist items
```

### Auto-Fix Option via AskUserQuestion

After displaying the BLOCK result, offer auto-fix via AskUserQuestion:

```
AskUserQuestion(questions=[{
  question: "Template compliance validation failed. How should I proceed?",
  header: "Auto-Fix",
  options: [
    {label: "Apply auto-fixes", description: "Generate placeholder content for missing sections"},
    {label: "Show issues first", description: "Display detailed validation report before deciding"},
    {label: "Cancel generation", description: "Abort agent generation without writing file"}
  ],
  multiSelect: false
}])
```

### BLOCK Applies to Required Sections Only

**Critical Rule:** BLOCK status applies ONLY when required sections are missing or malformed. Optional sections NEVER trigger BLOCK.

```
Required sections → Missing → BLOCK
Optional sections → Missing → WARNING (not BLOCK)
```

---

## WARNING Logic for Missing Optional Sections (AC#3)

### Write() Proceeds Despite Missing Optional Sections

When optional sections are missing, the Write() operation proceeds with warnings:

```
IF has_all_required_sections AND missing_optional_sections:
  result = PASS_WITH_WARNINGS
  proceed_with_write()  # Write() NOT halted
  display_warnings(missing_optional_sections)
```

### Category Detection

Detect agent category to determine which optional sections apply:

**Four Agent Categories:**

| Category | Detection Keywords | Optional Sections |
|----------|-------------------|-------------------|
| **Validator** | validate, check, enforce, compliance, verify | Validation Rules, Severity Classification, Pass/Fail Criteria |
| **Implementor** | implement, generate, create, write, build | Implementation Patterns, Code Generation Rules, Test Requirements |
| **Analyzer** | analyze, examine, score, metrics, assess | Analysis Metrics, Scoring Rubrics, Threshold Definitions |
| **Formatter** | format, display, transform, report, interpret | Output Templates, Data Transformation Rules, Display Modes |

**Category Detection Logic:**

```
function detect_category(agent_content):
  description = extract_description(agent_content)
  purpose = extract_purpose_section(agent_content)
  combined_text = description + " " + purpose

  categories = []

  IF contains_any(combined_text, ["validate", "check", "enforce", "compliance", "verify"]):
    categories.append("Validator")

  IF contains_any(combined_text, ["implement", "generate", "create", "write", "build"]):
    categories.append("Implementor")

  IF contains_any(combined_text, ["analyze", "examine", "score", "metrics", "assess"]):
    categories.append("Analyzer")

  IF contains_any(combined_text, ["format", "display", "transform", "report", "interpret"]):
    categories.append("Formatter")

  RETURN categories  # May return multiple categories
```

### PASS WITH WARNINGS Status

When all required sections present but optional sections missing:

```
status: PASS WITH WARNINGS
action: PROCEED
write_executed: true
warnings: [list of missing optional sections]
```

### Identify Category Specific Optional Sections

For each optional section, detect if it applies to the agent's category and identify missing ones. After detecting category, identify and list which category specific optional sections are absent:

```
FOR detected_category in categories:
  expected_optional = get_optional_sections(detected_category)
  missing_optional = []
  FOR section in expected_optional:
    IF section NOT IN found_sections:
      missing_optional.append({
        section: section,
        category: detected_category,
        suggestion: get_suggestion(section)
      })

  IF len(missing_optional) > 0:
    display_warning(category, missing_optional)
```

---

## BLOCK Logic for Malformed Sections (AC#4)

### Empty Section Body Detection

A section is malformed if its body is empty (no content after heading):

```
function detect_empty_section_body(content, section_heading):
  # Find section start
  section_start = find_heading(content, section_heading)
  IF section_start == -1:
    RETURN false  # Section not found (handled separately)

  # Find next section or end of file
  next_section = find_next_h2(content, section_start + 1)
  section_body = content[section_start:next_section].strip()

  # Check if body is empty (only heading, no content)
  lines = section_body.split("\n")
  IF len(lines) <= 1:
    RETURN true  # Empty body detected

  # Check if only whitespace
  body_text = "\n".join(lines[1:]).strip()
  IF len(body_text) < 10:
    RETURN true  # Effectively empty

  RETURN false
```

### Wrong Heading Level Detection

Sections must use correct heading level (## for main sections):

```
function detect_wrong_heading_level(content):
  malformed = []

  FOR section in required_sections:
    section_name = extract_heading_name(section)

    # Check for wrong heading level
    IF content contains "### {section_name}" OR content contains "# {section_name}":
      IF NOT content contains "## {section_name}":
        malformed.append({
          section: section_name,
          error: "wrong heading level",
          found: detect_actual_level(content, section_name),
          expected: "## (H2)"
        })

  RETURN malformed
```

### Invalid Frontmatter Detection

Validate YAML frontmatter fields against schema:

```
function detect_invalid_frontmatter(content):
  frontmatter = extract_yaml_frontmatter(content)
  errors = []

  # Required fields
  required_fields = ["name", "description", "tools", "model"]
  FOR field in required_fields:
    IF field NOT IN frontmatter:
      errors.append({
        field: field,
        error: "missing required field",
        allowed_values: get_allowed_values(field)
      })

  # Type validation
  IF "tools" IN frontmatter AND NOT is_array(frontmatter.tools):
    errors.append({
      field: "tools",
      error: "invalid type - expected array",
      found: type(frontmatter.tools)
    })

  # Enum validation
  IF "model" IN frontmatter AND frontmatter.model NOT IN ["opus", "sonnet", "haiku", "inherit"]:
    errors.append({
      field: "model",
      error: "invalid value",
      found: frontmatter.model,
      allowed_values: ["opus", "sonnet", "haiku", "inherit"]
    })

  RETURN errors
```

### Correction Guidance for Malformed Sections

Provide specific correction guidance for each malformation type:

```
Malformed Section Guidance:

1. Empty Section Body
   Section: Purpose
   Error: Empty section body detected
   Minimum Content: At least 2 sentences describing agent domain expertise
   Correction: Add descriptive content to the ## Purpose section

2. Wrong Heading Level
   Section: Workflow
   Error: Found "### Workflow" (H3), expected "## Workflow" (H2)
   Correction: Change "### Workflow" to "## Workflow"

3. Invalid Frontmatter
   Field: model
   Error: Invalid value "gpt-4" - not in allowed values
   Allowed Values: opus, sonnet, haiku, inherit
   Correction: Change "model: gpt-4" to "model: opus"
```

---

## Emergency Bypass: Skip-Validation Directive (AC#5)

### Skip-Validation Directive

Operators can bypass template compliance validation using the skip-validation directive:

```
# In generation request:
skip_validation: true
```

### 10-Character Minimum Justification

When skip-validation is requested, prompt for justification:

```
AskUserQuestion(questions=[{
  question: "Template validation bypass requested. Please provide justification (minimum 10 characters):",
  header: "Bypass Justification",
  options: [
    {label: "Emergency hotfix", description: "Urgent fix that cannot wait for template compliance"},
    {label: "Legacy compatibility", description: "Agent must match legacy format"},
    {label: "Custom format", description: "Agent intentionally uses non-standard format"}
  ],
  multiSelect: false
}])

# Validate justification length
IF len(justification) < 10:
  Display: "Justification must be at least 10 characters. Please provide more detail."
  RETRY prompt
```

### Deviation Record in Agent File

When bypass is approved, log a deviation record in the generated agent file:

```yaml
# DEVIATION RECORD
# This agent was generated with template validation bypassed
deviation:
  bypass_date: "2026-02-12T10:30:00Z"
  justification: "Emergency hotfix for production issue"
  bypassed_checks: ["required_sections", "frontmatter_validation", "section_format"]
  operator: "user"
```

### Warning Observation Captured

Log a warning-severity observation when bypass occurs:

```yaml
observations:
  - category: warning
    note: "Template validation bypassed for agent generation"
    severity: high
    files: ["{agent_file_path}"]
```

### DEVIATION Banner in Summary Report

When bypass is used, include a DEVIATION banner in the summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚠️  DEVIATION: Template validation was bypassed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Bypass Date: 2026-02-12T10:30:00Z
  Justification: Emergency hotfix for production issue
  Bypassed Checks: required_sections, frontmatter_validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Mode Scoping (AC#6)

### Validation Triggers for Generation Modes Only

Template compliance validation triggers ONLY for these generation modes where new agents are created or existing agents are updated:

| Mode | Triggers Validation | Description |
|------|---------------------|-------------|
| **Single** | Yes | Creating a new single agent - validation triggers before Write() |
| **Batch** | Yes | Creating multiple new agents - validation triggers for each |
| **Regenerate** | Yes | Updating/regenerating an existing agent - validation triggers on update |

**Mode scoping logic:** IF mode is Single, Batch, or Regenerate, THEN trigger template compliance validation. This conditional logic ensures validation only runs when creating or updating agents.

### Validation NOT Triggered on Read/List Operations

Validation does NOT trigger when:
- Loading existing agents for reference (read operation, no write)
- Listing agents via Glob results (list operation, no write)
- Reading agent content for analysis (read operation, no write)

These read/list operations do not invoke Write() and therefore bypass validation entirely.

### Legacy Agents Unaffected

**Legacy agents created before the canonical template continue to function without modification.**

### Not Retroactive

Template compliance validation is **not retroactive**:
- Existing agents are not automatically validated
- No bulk validation of existing agent fleet
- Validation applies only at creation/update time

---

## Validation Report Format (AC#7)

### Section-by-Section Status Table

The validation report includes a section-by-section status table with columns Section Name | Status | Details:

```
| Section Name                    | Status | Details                     |
|---------------------------------|--------|-----------------------------|
| YAML Frontmatter                | PASS   | All 4 required fields valid |
| Title                           | PASS   | Matches name field          |
| Purpose                         | PASS   | 3 sentences found           |
| When Invoked                    | PASS   | All 3 subsections present   |
| Input/Output Specification      | FAIL   | Section missing             |
| Constraints and Boundaries      | WARN   | Only 2 constraints (min 3)  |
| Workflow                        | PASS   | 4 steps defined             |
| Success Criteria                | PASS   | 5 checklist items           |
| Output Format                   | PASS   | Example provided            |
| Examples                        | N/A    | Optional for this category  |
```

### PASS/FAIL/WARN/N-A Statuses

| Status | Meaning | Color |
|--------|---------|-------|
| **PASS** | Section present and well-formed | Green |
| **FAIL** | Required section missing or malformed | Red |
| **WARN** | Optional section missing or suboptimal | Yellow |
| **N/A** | Section not applicable for this category | Gray |

### Frontmatter Validation in Report

Include frontmatter field validation in the report:

```
Frontmatter Validation:
  ✓ name: "code-reviewer" (valid kebab-case)
  ✓ description: 45 words (valid 20-200 range)
  ✓ tools: [Read, Grep, Glob] (valid array)
  ✓ model: "opus" (valid enum)
  ○ color: not specified (optional, default: green)
  ○ version: not specified (optional)
```

### Summary Line with Counts

Include overall summary line with counts:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Summary: 8 PASS | 1 FAIL | 1 WARN | 0 N/A
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Final Verdict

The report concludes with one of three final verdicts:

| Final Verdict | Condition | Write() Action |
|---------------|-----------|----------------|
| **PASS** | All required sections present and valid | Proceed |
| **PASS WITH WARNINGS** | Required sections valid, optional sections missing | Proceed with warnings |
| **BLOCK** | Required sections missing or malformed | Halt |

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Final Verdict: BLOCK

  Reason: 1 required section missing (Input/Output Specification)
  Action: Write() operation halted

  Next Steps:
    1. Add missing section with required content
    2. Re-run template compliance validation
    3. Or use --skip-validation with justification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## References

- `canonical-agent-template.md` - Defines the 10 required sections, 4 categories, and frontmatter schema
- `validation-workflow.md` - Existing 12-check validation (preserved, template compliance is additive)
- `frontmatter-specification.md` - YAML field validation rules
- STORY-389 - Source story for this implementation
