# /legal:clause-library

Access and manage standard contract clauses.

## Usage

```
/legal:clause-library "Search term"
/legal:clause-library --category indemnification
/legal:clause-library --add "New clause" --category "limitation"
```

## Description

Provides access to:
1. Standard clause templates
2. Clause variations by risk level
3. Negotiation alternatives
4. Usage guidance

## Options

- `--category`: Filter by clause category
- `--position`: Our position (vendor, customer, neutral)
- `--risk`: Risk tolerance (conservative, moderate, aggressive)
- `--add`: Add new clause to library
- `--compare`: Compare clause variations

## Clause Categories

```
Clause Library
├── General
│   ├── Definitions
│   ├── Term & Termination
│   ├── Assignment
│   ├── Notices
│   ├── Severability
│   ├── Entire Agreement
│   └── Amendment
│
├── Risk Allocation
│   ├── Limitation of Liability
│   ├── Indemnification
│   ├── Warranty
│   ├── Disclaimer
│   └── Insurance
│
├── Compliance
│   ├── Confidentiality
│   ├── Data Protection
│   ├── Audit Rights
│   ├── Regulatory Compliance
│   └── Anti-Corruption
│
├── IP & Technology
│   ├── IP Ownership
│   ├── License Grants
│   ├── Work Product
│   └── Open Source
│
└── Commercial
    ├── Payment Terms
    ├── Price Adjustment
    ├── Service Levels
    └── Acceptance
```

## Output Format

```markdown
## Clause Library: {Category}

### {Clause Name}

#### Standard Version (Neutral)
```
{Standard clause text}
```

#### Vendor-Favorable Version
```
{Clause text favoring vendor}
```
**Key Differences**: {What changed and why}

#### Customer-Favorable Version
```
{Clause text favoring customer}
```
**Key Differences**: {What changed and why}

---

### Usage Guidance

**When to Use**: {Circumstances}

**Negotiation Tips**:
- {Tip 1}
- {Tip 2}

**Common Issues**:
- {Issue and how to address}

**Related Clauses**: {Links to related clauses}

---

### Variations by Risk Level

| Risk Level | Key Features |
|------------|--------------|
| Conservative | {Protective features} |
| Moderate | {Balanced features} |
| Aggressive | {Favorable features} |

---

### Examples in Context

**SaaS Agreement**:
```
{How this clause typically appears in SaaS}
```

**Services Agreement**:
```
{How this clause typically appears in services}
```
```

## Sample Clauses

### Limitation of Liability

**Standard (Mutual)**:
```
NEITHER PARTY SHALL BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, REGARDLESS OF
THE CAUSE OF ACTION OR WHETHER SUCH PARTY HAS BEEN ADVISED
OF THE POSSIBILITY OF SUCH DAMAGES.

EXCEPT FOR [CARVE-OUTS], EACH PARTY'S TOTAL LIABILITY SHALL
NOT EXCEED THE AMOUNTS PAID OR PAYABLE UNDER THIS AGREEMENT
IN THE [12] MONTHS PRECEDING THE CLAIM.
```

**Carve-Outs to Consider**:
- Indemnification obligations
- Breach of confidentiality
- IP infringement
- Gross negligence / willful misconduct
- Violations of law

### Indemnification

**Vendor Indemnity (IP)**:
```
Vendor shall defend, indemnify, and hold harmless Customer
from and against any third-party claim alleging that the
Service infringes such third party's intellectual property
rights, and shall pay any damages finally awarded or
settlement amounts agreed to.
```

## MCP Integration

- **notionApi**: Store and manage clause library
- **pocket-pick**: Quick access to frequently used clauses
