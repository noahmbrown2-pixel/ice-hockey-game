# .roo/rules-mode-validator/40-tool-usage.md
> Specific tool usage instructions and patterns for mode validation tasks.

## Core Validation Tools

### Schema Validation Tools

#### `validate_roomodes.py` - Primary Schema Validator
**Purpose:** Comprehensive validation of .roomodes YAML structure and content.

**When to use:**
- Initial validation of mode configurations
- Checking for required fields and data types
- Verifying schema compliance before deployment
- Automated validation in CI/CD pipelines

**Best practices:**
- Run after any .roomodes changes
- Use `--strict` flag for production deployments
- Review warnings even if validation passes
- Integrate with pre-commit hooks

**Example usage:**
```bash
# Basic validation
python validate_roomodes.py

# Strict validation with detailed output
python validate_roomodes.py --strict --verbose

# Validate specific mode
python validate_roomodes.py --mode issue-resolver

# Generate validation report
python validate_roomodes.py --report validation-report.json
```

**Output interpretation:**
- **PASS**: All checks passed, configuration is valid
- **WARNING**: Issues found but not blocking (review recommended)
- **FAIL**: Critical issues found, deployment blocked
- **ERROR**: Tool execution failed, investigate immediately

#### YAML Linting Tools
**Purpose:** Check YAML syntax and formatting consistency.

**When to use:**
- After manual .roomodes edits
- Before committing configuration changes
- As part of code quality checks
- When troubleshooting parsing errors

**Best practices:**
- Use consistent indentation (2 spaces)
- Quote strings containing special characters
- Align array elements properly
- Keep lines under 120 characters

**Example tools:**
```bash
# Using yamllint
yamllint .roomodes

# Using prettier for YAML
prettier --check .roomodes

# Using yaml-language-server
yaml-language-server --validate .roomodes
```

### Permission Analysis Tools

#### FileRegex Pattern Testers
**Purpose:** Test and validate fileRegex patterns against repository structure.

**When to use:**
- After creating or modifying fileRegex patterns
- Before deploying new mode configurations
- When troubleshooting permission issues
- During security audits

**Best practices:**
- Test against actual repository files
- Include both allowed and forbidden path examples
- Verify patterns don't match unintended files
- Document pattern rationale and test cases

**Example validation script:**
```javascript
const { glob } = require('glob');
const fs = require('fs');

async function testFileRegex(pattern, repoPath = '.') {
  const regex = new RegExp(pattern);
  const allFiles = await glob('**/*', {
    cwd: repoPath,
    nodir: true,
    ignore: ['node_modules/**', '.git/**']
  });

  const matched = [];
  const shouldNotMatch = [];

  for (const file of allFiles) {
    if (regex.test(file)) {
      matched.push(file);

      // Check for forbidden patterns
      if (file.includes('/auth/') || file.includes('/payment/')) {
        shouldNotMatch.push(file);
      }
    }
  }

  return {
    pattern,
    totalFiles: allFiles.length,
    matchedCount: matched.length,
    forbiddenMatches: shouldNotMatch,
    sampleMatches: matched.slice(0, 10)
  };
}

// Usage
testFileRegex('^src/(components|utils)/.*\\.ts$')
  .then(result => console.log(JSON.stringify(result, null, 2)));
```

#### Security Boundary Checkers
**Purpose:** Verify fileRegex patterns don't violate security boundaries.

**When to use:**
- After permission changes
- During security reviews
- Before production deployment
- When adding new modes

**Best practices:**
- Define forbidden patterns explicitly
- Test against comprehensive file lists
- Include nested directory checks
- Document security exceptions

**Example security validation:**
```javascript
const forbiddenPatterns = [
  /\/auth\//,
  /\/authentication\//,
  /\/payment\//,
  /\/security\//,
  /\/admin\//,
  /credentials/,
  /\.env/
];

function checkSecurityBoundaries(fileRegex, testFiles) {
  const violations = [];

  for (const file of testFiles) {
    if (fileRegex.test(file)) {
      for (const forbidden of forbiddenPatterns) {
        if (forbidden.test(file)) {
          violations.push({
            file,
            forbiddenPattern: forbidden,
            severity: 'CRITICAL'
          });
        }
      }
    }
  }

  return violations;
}
```

### Rules Directory Analysis Tools

#### Completeness Checkers
**Purpose:** Verify rules directory has all required files with sufficient content.

**When to use:**
- After creating new mode rules
- During mode development
- Before mode deployment
- As part of quality gates

**Best practices:**
- Check file existence and naming conventions
- Assess content length and structure
- Verify cross-references between files
- Ensure consistency with mode configuration

**Example completeness check:**
```javascript
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  '00-guardrails.md',
  '10-workflow.md',
  '20-memory-integration.md'
  // Add more as needed
];

function checkRulesCompleteness(rulesDir) {
  const issues = [];
  const existingFiles = fs.readdirSync(rulesDir);

  // Check required files exist
  for (const required of requiredFiles) {
    if (!existingFiles.includes(required)) {
      issues.push({
        type: 'missing_file',
        file: required,
        severity: 'HIGH'
      });
    }
  }

  // Check file content quality
  for (const file of existingFiles) {
    if (file.endsWith('.md')) {
      const filePath = path.join(rulesDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      if (lines.length < 10) {
        issues.push({
          type: 'insufficient_content',
          file,
          lines: lines.length,
          severity: 'MEDIUM'
        });
      }
    }
  }

  return issues;
}
```

#### Content Quality Analyzers
**Purpose:** Assess the quality and completeness of rule file content.

**When to use:**
- After writing or updating rule files
- During peer review process
- Before finalizing mode configurations
- As part of documentation audits

**Best practices:**
- Check for structured content (headings, lists)
- Verify presence of code examples
- Assess clarity of instructions
- Ensure actionable guidance

**Example quality analysis:**
```javascript
function analyzeRuleQuality(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  const metrics = {
    hasHeadings: /^#/.test(content),
    hasLists: /(\d+\.|- )/.test(content),
    hasCodeBlocks: /```/.test(content),
    wordCount: content.split(/\s+/).length,
    lineCount: content.split('\n').length,
    hasActionableLanguage: /\b(must|should|run|execute|check)\b/i.test(content)
  };

  let score = 0;
  const maxScore = 100;

  if (metrics.hasHeadings) score += 20;
  if (metrics.hasLists) score += 20;
  if (metrics.hasCodeBlocks) score += 20;
  if (metrics.hasActionableLanguage) score += 20;
  if (metrics.wordCount > 200) score += 20;

  return {
    file: path.basename(filePath),
    metrics,
    score,
    grade: score >= 80 ? 'A' : score >= 60 ? 'B' : 'C'
  };
}
```

### Functional Testing Tools

#### Mode Loading Testers
**Purpose:** Verify modes can be loaded and initialized correctly.

**When to use:**
- After configuration changes
- During integration testing
- Before production deployment
- When troubleshooting mode issues

**Best practices:**
- Test in isolated environment
- Check for error messages and warnings
- Verify tool availability
- Monitor resource usage

**Example mode loading test:**
```javascript
async function testModeLoading(modeSlug) {
  const results = {
    mode: modeSlug,
    startTime: Date.now(),
    success: false,
    errors: [],
    warnings: []
  };

  try {
    // Attempt to load mode configuration
    const config = await loadModeConfig(modeSlug);

    // Validate configuration structure
    const validation = validateModeStructure(config);
    results.warnings.push(...validation.warnings);

    // Test tool availability
    for (const tool of config.tools || []) {
      try {
        await testToolAvailability(tool);
      } catch (error) {
        results.errors.push(`Tool ${tool} unavailable: ${error.message}`);
      }
    }

    // Test file access patterns
    if (config.fileRegex) {
      const accessTest = await testFileAccess(config.fileRegex);
      if (!accessTest.success) {
        results.errors.push(`File access test failed: ${accessTest.error}`);
      }
    }

    results.success = results.errors.length === 0;
    results.duration = Date.now() - results.startTime;

  } catch (error) {
    results.errors.push(`Mode loading failed: ${error.message}`);
    results.duration = Date.now() - results.startTime;
  }

  return results;
}
```

#### Tool Availability Testers
**Purpose:** Verify all declared tools are accessible and functional.

**When to use:**
- After tool configuration changes
- During environment setup
- Before running mode operations
- When diagnosing tool-related failures

**Best practices:**
- Test with safe, minimal parameters
- Check response times and error handling
- Verify tool versions and compatibility
- Document tool dependencies

**Example tool testing:**
```javascript
async function testToolSuite(tools) {
  const results = {};

  for (const tool of tools) {
    const toolResult = {
      name: tool,
      available: false,
      functional: false,
      responseTime: null,
      error: null
    };

    const startTime = Date.now();

    try {
      // Test basic tool availability
      await invokeTool(tool, { help: true });
      toolResult.available = true;

      // Test basic functionality
      const testResult = await invokeTool(tool, { test: true });
      toolResult.functional = testResult.success;

    } catch (error) {
      toolResult.error = error.message;
    }

    toolResult.responseTime = Date.now() - startTime;
    results[tool] = toolResult;
  }

  return results;
}
```

### Reporting and Analysis Tools

#### Validation Report Generators
**Purpose:** Create comprehensive reports from validation results.

**When to use:**
- After completing validation runs
- For documentation and auditing
- To communicate issues to stakeholders
- For tracking validation trends

**Best practices:**
- Include executive summary and detailed findings
- Prioritize issues by severity and impact
- Provide actionable recommendations
- Track validation metrics over time

**Example report generation:**
```javascript
function generateValidationReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalModes: results.modes.length,
      passed: results.modes.filter(m => m.status === 'pass').length,
      failed: results.modes.filter(m => m.status === 'fail').length,
      warnings: results.modes.filter(m => m.status === 'warning').length
    },
    issues: {
      critical: [],
      high: [],
      medium: [],
      low: []
    },
    recommendations: []
  };

  // Categorize issues
  for (const mode of results.modes) {
    for (const issue of mode.issues) {
      report.issues[issue.severity].push({
        mode: mode.slug,
        ...issue
      });
    }
  }

  // Generate recommendations
  if (report.issues.critical.length > 0) {
    report.recommendations.push({
      priority: 'IMMEDIATE',
      action: 'Fix all critical issues before deployment',
      issues: report.issues.critical.length
    });
  }

  return report;
}
```

#### Trend Analysis Tools
**Purpose:** Track validation quality and issue patterns over time.

**When to use:**
- Analyzing validation history
- Identifying recurring issues
- Measuring improvement progress
- Planning validation enhancements

**Best practices:**
- Store historical validation data
- Calculate trend metrics and KPIs
- Identify systemic issues
- Track fix effectiveness

**Example trend analysis:**
```javascript
function analyzeValidationTrends(history) {
  const trends = {
    overall: {
      passRate: calculatePassRateTrend(history),
      issueReduction: calculateIssueReduction(history)
    },
    byCategory: {
      schema: analyzeCategoryTrend(history, 'schema'),
      permissions: analyzeCategoryTrend(history, 'permissions'),
      rules: analyzeCategoryTrend(history, 'rules')
    },
    recurringIssues: identifyRecurringIssues(history)
  };

  return trends;
}

function calculatePassRateTrend(history) {
  return history.map(run => ({
    date: run.timestamp,
    passRate: (run.passed / run.total) * 100
  }));
}
```

## Integration with CI/CD

### Pre-commit Hooks
**Purpose:** Run validation checks before code commits.

**When to use:**
- Preventing invalid configurations from being committed
- Enforcing quality standards early
- Providing immediate feedback to developers

**Best practices:**
- Make hooks fast to avoid developer frustration
- Allow bypassing for urgent fixes
- Provide clear error messages and fix instructions

**Example pre-commit hook:**
```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔍 Running mode validation..."

# Run validation
python validate_roomodes.py --quick

if [ $? -ne 0 ]; then
  echo "❌ Validation failed. Please fix issues before committing."
  echo "Run 'python validate_roomodes.py --verbose' for details."
  exit 1
fi

echo "✅ Validation passed"
exit 0
```

### CI Pipeline Integration
**Purpose:** Include validation in automated build and deployment pipelines.

**When to use:**
- Automated quality gates
- Deployment verification
- Regression prevention
- Continuous monitoring

**Best practices:**
- Fail builds on critical issues
- Generate artifacts for review
- Notify stakeholders of issues
- Track validation metrics

**Example CI configuration:**
```yaml
# .github/workflows/validate-modes.yml
name: Validate Modes

on:
  push:
    paths:
      - '.roomodes'
      - '.roo/rules/**'
  pull_request:
    paths:
      - '.roomodes'
      - '.roo/rules/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'

      - name: Install dependencies
        run: pip install -r requirements-validation.txt

      - name: Run validation
        run: python validate_roomodes.py --strict --report report.json

      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: validation-report
          path: report.json

      - name: Fail on critical issues
        run: |
          if jq '.summary.failed > 0' report.json; then
            echo "❌ Critical validation failures found"
            exit 1
          fi
```

## Memory Integration Patterns

### Validation Error Logging
**Purpose:** Track validation issues for learning and improvement.

**When to use:**
- After validation failures
- When discovering new issue patterns
- For tracking fix effectiveness
- During continuous improvement

**Memory integration:**
```javascript
// Log validation failure
error.capture({
  kind: "ValidationFailure",
  message: "Schema validation failed: missing required field",
  detector: "validate_roomodes.py",
  normalizedKey: "schema-validation-failed",
  context: {
    mode: modeSlug,
    field: "roleDefinition",
    validationRunId: runId
  }
})

// Log successful validation
fix.apply({
  strategy: "schema-correction",
  changes: ["Added missing required fields to mode configuration"],
  result: "applied",
  context: {
    mode: modeSlug,
    validationRunId: runId
  }
})
```

### Pattern Learning
**Purpose:** Build knowledge base of validation issues and solutions.

**When to use:**
- After resolving validation issues
- When discovering new validation patterns
- For improving automated fixes
- During validation tool enhancement

**Memory integration:**
```javascript
// Record validation pattern
doc.note({
  url: "https://github.com/org/repo/blob/main/.roomodes",
  title: "Mode Configuration Schema Requirements",
  site: "GitHub Repository",
  author: "Mode Validator",
  accessed_at: new Date().toISOString(),
  excerpt: "All modes must have slug, name, roleDefinition, whenToUse, and groups fields",
  context: {
    validationPattern: "required-fields-check",
    discoveredIn: modeSlug
  }
})