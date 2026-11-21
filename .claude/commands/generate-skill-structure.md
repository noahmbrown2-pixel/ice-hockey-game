# Generate 4-File Skill Structure

Generate a complete 4-File Skill Structure for a new agent based on the Vibeship pattern.

**Arguments:**
- `--agent-name` (required): Name of the agent (kebab-case)
- `--role` (required): Role title for the agent
- `--description` (optional): Description of what the agent does
- `--expertise` (optional): Comma-separated list of expertise areas

## Execution Steps

1. **Parse Arguments**: Extract agent-name, role, description, and expertise from $ARGUMENTS

2. **Create Directory Structure**:
   ```bash
   mkdir -p .claude/agents/${AGENT_NAME}
   ```

3. **Generate skill.yaml**:
   Create the agent identity file with:
   - Name and description
   - Role and expertise from arguments
   - Default BLP properties (BLP-001, BLP-011, BLP-031, BLP-051)
   - Code generation patterns appropriate for the role

4. **Generate sharp-edges.yaml**:
   Create anti-patterns file with:
   - Common mistakes for the agent's domain
   - Security gotchas (user enumeration, timing attacks)
   - Performance gotchas (N+1 queries, memory leaks)
   - Testing gotchas (flaky tests, mock overuse)

5. **Generate validations.yaml**:
   Create validation rules with:
   - Code patterns (type hints, error handling)
   - Naming conventions (functions, classes, files)
   - Import validations (no star imports, correct order)

6. **Generate collaboration.yaml**:
   Create handoff protocols with:
   - Handoff rules to testing, security, documentation agents
   - Receive protocols for work from other agents
   - Escalation rules for blocked or critical issues

7. **Validate Structure**:
   Verify all 4 files were created correctly

8. **Report Success**:
   Display paths to generated files and next steps

## Template Files

### skill.yaml Template
```yaml
name: ${AGENT_NAME}
description: ${DESCRIPTION}
version: 1.0.0

identity:
  role: ${ROLE}
  expertise:
    ${EXPERTISE_LIST}
  personality: Precise, thorough, quality-focused

patterns:
  code_generation:
    - Always use type hints
    - Include comprehensive docstrings (Google-style)
    - Add error handling for edge cases
    - Generate tests alongside implementation

  best_practices:
    - Follow SOLID principles
    - Prefer composition over inheritance
    - Use dependency injection
    - Keep functions small and focused

handoffs:
  to_testing_agent:
    condition: "implementation complete"
    context: ["source_files", "test_requirements"]
  to_documentation_agent:
    condition: "code reviewed and approved"
    context: ["api_spec", "usage_examples"]

blp_properties:
  - BLP-001: Alignment - Domain-specific ${ROLE} expertise
  - BLP-011: Autonomy - Independent operation with minimal oversight
  - BLP-031: Self-Improvement - Learn from code review feedback
  - BLP-051: Self-Organization - Modular code structure
```

### sharp-edges.yaml Template
```yaml
# Sharp Edges - Anti-patterns and gotchas for ${AGENT_NAME}
version: 1.0.0
last_updated: ${DATE}

anti_patterns:
  hardcoded_values:
    description: Hardcoding configuration values
    wrong: "timeout = 30"
    correct: "timeout = settings.DEFAULT_TIMEOUT"
    severity: medium
    blp_property: BLP-001

  missing_type_hints:
    description: Functions without type annotations
    wrong: "def process(data):"
    correct: "def process(data: dict[str, Any]) -> ProcessResult:"
    severity: high
    blp_property: BLP-031

  bare_except:
    description: Catching all exceptions without specificity
    wrong: "except:"
    correct: "except ValueError as e:"
    severity: critical
    blp_property: BLP-021

  magic_numbers:
    description: Unexplained numeric literals in code
    wrong: "if attempts > 3:"
    correct: "if attempts > MAX_RETRY_ATTEMPTS:"
    severity: medium
    blp_property: BLP-001

security_gotchas:
  user_enumeration:
    description: Revealing whether user exists in error messages
    wrong: "User with id 'X' not found"
    correct: "Resource not found or access denied"
    severity: critical
    mitigation: Use generic error messages

  timing_attacks:
    description: Variable-time comparisons for secrets
    wrong: "if user_token == stored_token:"
    correct: "if secrets.compare_digest(user_token, stored_token):"
    severity: high
    mitigation: Use constant-time comparison

testing_gotchas:
  incomplete_mocking:
    description: Not mocking all external dependencies
    symptom: Tests fail intermittently
    fix: Mock all I/O operations
    severity: medium

  missing_edge_cases:
    description: Only testing happy path
    symptom: Production bugs on edge cases
    fix: Test empty, null, max, min, invalid inputs
    severity: high
```

### validations.yaml Template
```yaml
# Validations - Code quality standards for ${AGENT_NAME}
version: 1.0.0

code_patterns:
  type_hints:
    pattern: "def\\s+\\w+\\([^)]*\\)\\s*->"
    required: true
    message: "All functions must have return type annotations"

  docstrings:
    pattern: '"""[^"]+"""'
    required: true
    message: "All public functions must have docstrings"

  error_handling:
    pattern: "try:|except\\s+\\w+"
    context: "I/O operations"
    message: "Wrap I/O operations in try-except blocks"

naming_conventions:
  functions:
    pattern: "^[a-z][a-z0-9_]*$"
    style: snake_case
    examples: ["process_data", "validate_input", "get_user_by_id"]

  classes:
    pattern: "^[A-Z][a-zA-Z0-9]*$"
    style: PascalCase
    examples: ["UserService", "DataProcessor", "ValidationError"]

  constants:
    pattern: "^[A-Z][A-Z0-9_]*$"
    style: UPPER_SNAKE_CASE
    examples: ["MAX_RETRIES", "DEFAULT_TIMEOUT", "API_VERSION"]

import_validations:
  no_star_imports:
    pattern: "from\\s+\\w+\\s+import\\s+\\*"
    allowed: false
    message: "Star imports are not allowed"

  standard_library_first:
    order: ["stdlib", "third_party", "local"]
    message: "Imports should be ordered: stdlib, third-party, local"
```

### collaboration.yaml Template
```yaml
# Collaboration - Handoff protocols for ${AGENT_NAME}
version: 1.0.0

handoff_protocols:
  to_testing_agent:
    trigger: "code implementation complete"
    required_context:
      - source_files: List of files created/modified
      - test_requirements: What to test
      - edge_cases: Known edge cases to cover
    format: |
      ## Handoff to Testing Agent
      Files: {source_files}
      Test coverage target: 90%+
      Priority edge cases: {edge_cases}

  to_security_agent:
    trigger: "authentication or authorization code"
    required_context:
      - security_sensitive_files: Files with security implications
      - auth_flow: Description of authentication flow
      - data_sensitivity: Classification of data handled
    escalation: true

  to_documentation_agent:
    trigger: "API or public interface created"
    required_context:
      - api_spec: OpenAPI or similar spec
      - usage_examples: Example code snippets
      - breaking_changes: Any breaking changes

receive_protocols:
  from_design_agent:
    expected_context:
      - requirements: Functional requirements
      - architecture: High-level architecture decisions
      - constraints: Technical constraints
    acknowledgment: required

  from_review_agent:
    expected_context:
      - feedback: Code review comments
      - severity: critical|major|minor|suggestion
      - line_references: Specific code locations
    action: address_all_critical

escalation_rules:
  blocked:
    condition: "Cannot proceed due to missing information"
    action: "Escalate to human with specific questions"
    timeout_minutes: 30

  critical_security:
    condition: "Security vulnerability detected"
    action: "Immediately notify security team"
    priority: P0

metrics:
  handoff_latency_ms:
    target: 1000
    alert_threshold: 5000
  context_preservation_score:
    target: 0.95
    measurement: "Fraction of context successfully transferred"
```

## Example Invocation

```bash
/project:generate-skill-structure --agent-name data-analyst --role "Senior Data Analyst" --expertise "Python,pandas,SQL,visualization"
```

## Output

Creates:
```
.claude/agents/data-analyst/
├── skill.yaml
├── sharp-edges.yaml
├── validations.yaml
└── collaboration.yaml
```

## Integration with Golden Agents

After generating, the skill structure can be deployed using:
```bash
python ETAC-System/scripts/deploy_golden_agents.py --source .claude/agents/${AGENT_NAME} --target golden-agent-ops/agents/
```
