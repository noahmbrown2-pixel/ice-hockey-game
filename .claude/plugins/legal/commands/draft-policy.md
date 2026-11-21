# /legal:draft-policy

Draft internal policies and procedures.

## Usage

```
/legal:draft-policy "Policy topic"
/legal:draft-policy "Data Privacy" --framework gdpr
/legal:draft-policy "Remote Work" --audience employees
```

## Description

Creates comprehensive internal policies:
1. Policy statement and scope
2. Definitions and key terms
3. Procedures and requirements
4. Roles and responsibilities
5. Compliance and enforcement

## Options

- `--framework`: Compliance framework (gdpr, ccpa, sox, hipaa)
- `--audience`: Target audience (employees, contractors, all)
- `--template`: Policy template to use
- `--existing`: Build on existing policy

## Output Format

```markdown
# {Policy Name} Policy

**Policy Number**: POL-{XXX}
**Effective Date**: {Date}
**Last Review**: {Date}
**Next Review**: {Date + 1 year}
**Owner**: {Department/Role}
**Approved By**: {Name/Title}

---

## 1. Purpose

This policy establishes {brief statement of what the policy covers and why}.

## 2. Scope

### 2.1 Who This Policy Applies To
This policy applies to:
- {Group 1}
- {Group 2}
- {Group 3}

### 2.2 What This Policy Covers
This policy governs:
- {Area 1}
- {Area 2}
- {Area 3}

### 2.3 Exceptions
{Any exceptions to scope, or "No exceptions without written approval from {Authority}"}

---

## 3. Definitions

| Term | Definition |
|------|------------|
| {Term 1} | {Definition} |
| {Term 2} | {Definition} |
| {Term 3} | {Definition} |

---

## 4. Policy Statement

### 4.1 General Principles
{Company} is committed to {principle statement}.

### 4.2 Requirements

#### 4.2.1 {Requirement Category 1}
{Description of requirements}
- Requirement A
- Requirement B
- Requirement C

#### 4.2.2 {Requirement Category 2}
{Description of requirements}
- Requirement A
- Requirement B

### 4.3 Prohibited Activities
The following activities are prohibited:
- {Prohibited activity 1}
- {Prohibited activity 2}
- {Prohibited activity 3}

---

## 5. Procedures

### 5.1 {Procedure 1}
**Purpose**: {Why this procedure}
**Steps**:
1. {Step 1}
2. {Step 2}
3. {Step 3}

### 5.2 {Procedure 2}
**Purpose**: {Why this procedure}
**Steps**:
1. {Step 1}
2. {Step 2}

---

## 6. Roles and Responsibilities

| Role | Responsibilities |
|------|------------------|
| {Role 1} | {List of responsibilities} |
| {Role 2} | {List of responsibilities} |
| {Role 3} | {List of responsibilities} |
| All Employees | {General responsibilities} |

---

## 7. Compliance

### 7.1 Monitoring
{How compliance will be monitored}

### 7.2 Reporting
{How to report concerns or violations}

### 7.3 Violations
Violations of this policy may result in:
- Verbal warning
- Written warning
- Suspension
- Termination
- Legal action (where applicable)

---

## 8. Related Documents

- {Related Policy 1}
- {Related Procedure 1}
- {Applicable Law/Regulation}

---

## 9. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | {Date} | {Name} | Initial release |

---

**Acknowledgment**

I have read, understood, and agree to comply with this policy.

Employee Signature: _________________
Date: _________________
```

## Policy Templates Available

- Data Privacy Policy
- Information Security Policy
- Acceptable Use Policy
- Remote Work Policy
- Code of Conduct
- Anti-Harassment Policy
- Social Media Policy
- BYOD Policy
- Expense Policy
- Travel Policy

## MCP Integration

- **notionApi**: Store and manage policies
- **pocket-pick**: Access policy templates
