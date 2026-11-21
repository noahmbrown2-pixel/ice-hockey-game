# Claude Code AI Agents

## Available Agents

### Code Quality
- **code-reviewer**: Expert code review focusing on best practices, performance, and maintainability
- **code-simplifier**: Refactor complex code into clean, simple solutions
- **bug-detector**: Identify bugs, code smells, and potential issues

### Security
- **security-reviewer**: Comprehensive security analysis (OWASP Top 10, CVE scanning)
- **security**: Basic security checks and vulnerability detection

### Testing
- **test-engineer**: Comprehensive testing strategies (unit, integration, E2E)
- **test-writer**: Generate test cases and improve coverage

### Architecture
- **tech-lead**: System design, architecture decisions, and scalability
- **database-expert**: Database optimization, indexing, and query performance
- **devops-engineer**: CI/CD, infrastructure as code, and deployment

### User Experience
- **ux-reviewer**: Accessibility (WCAG 2.1), usability, and UX improvements
- **ui-designer**: Component design, styling, and responsive layouts

### Documentation
- **docs-writer**: Generate comprehensive documentation and guides

## Quick Reference

| Agent | Primary Use Case | Key Strengths |
|-------|------------------|---------------|
| @code-reviewer | PR reviews | Best practices, SOLID principles |
| @code-simplifier | Refactoring | Reduce complexity, improve readability |
| @security-reviewer | Security audit | OWASP, vulnerability detection |
| @test-engineer | Test creation | Coverage, edge cases |
| @tech-lead | Architecture | System design, scalability |
| @database-expert | DB optimization | Query tuning, indexing |
| @ux-reviewer | UX audit | Accessibility, mobile |
| @devops-engineer | Infrastructure | CI/CD, monitoring |

## Usage Tips

1. **Be specific**: Provide context and code snippets
2. **Combine agents**: Use multiple agents for comprehensive review
3. **Iterative improvement**: Apply suggestions incrementally
4. **Project context**: Agents understand UnimogCommunityHub specifics

## Example Workflows

### Complete Code Review
```
1. @code-reviewer - Check for bugs and best practices
2. @security-reviewer - Identify vulnerabilities
3. @test-engineer - Suggest test cases
4. @code-simplifier - Refactor if needed
```

### Performance Optimization
```
1. @database-expert - Optimize queries
2. @tech-lead - Review architecture
3. @devops-engineer - Infrastructure scaling
```

### UI/UX Improvement
```
1. @ux-reviewer - Accessibility audit
2. @ui-designer - Component improvements
3. @test-engineer - E2E test scenarios
```
