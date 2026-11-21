# Nano-Agent Benchmark (.claude command)

Execute the 13-level nano-agent benchmark system directly from Claude Code.

## Syntax
```
/nano-benchmark [action] [options]
```

## Actions

### run
Run the complete 13-level benchmark test suite.

**Options:**
- `--input <file>` - MD file with test case specification
- `--test-case "<description>"` - Direct test case description  
- `--levels <list>` - Comma-separated levels (e.g., 8,9,10)
- `--output <dir>` - Output directory for results
- `--dry-run` - Show what would be executed
- `--verbose` - Enable detailed logging

**Examples:**
```
/nano-benchmark run --test-case "E-commerce platform with microservices"
/nano-benchmark run --input my_test.md --levels 8,9,10
/nano-benchmark run --dry-run --verbose
```

### dashboard
Generate comprehensive HTML dashboard from existing results.

**Options:**
- `--session <id>` - Session ID to generate dashboard for
- `--output <dir>` - Output directory

**Example:**
```
/nano-benchmark dashboard --session real_integrated_20250830_131320
```

### status
Show system status, dependencies, and recent sessions.

**Example:**
```
/nano-benchmark status
```

### list-cases
List available test case templates and built-in cases.

**Options:**
- `--format <type>` - Output format: table, json, yaml (default: table)

**Example:**
```
/nano-benchmark list-cases --format json
```

### init-case
Create a new test case template from predefined patterns.

**Options:**
- `--template <type>` - Template type: research, security, architecture, implementation
- `--output <file>` - Output file path (optional)

**Examples:**
```
/nano-benchmark init-case "Healthcare Management System" --template security
/nano-benchmark init-case "IoT Platform" --template architecture --output /path/to/iot_test.md
```

### config
Manage CLI configuration settings.

**Sub-commands:**
- `show` - Display current configuration
- `set <key> <value>` - Set configuration value

**Examples:**
```
/nano-benchmark config show
/nano-benchmark config set output_directory /custom/output/path
/nano-benchmark config set verbose_logging true
```

### learn
Show learning analytics and usage patterns.

**Options:**
- `--usage-stats` - Show usage statistics
- `--success-patterns` - Analyze success patterns

**Example:**
```
/nano-benchmark learn --usage-stats --success-patterns
```

## Test Case MD File Format

When using `--input`, the MD file should follow this structure:

```markdown
# Test Case Title

## Description  
Brief description of the system to build and test.

## Requirements
### Functional Requirements
- Core functionality requirement 1
- Core functionality requirement 2

### Non-Functional Requirements  
- Performance requirements
- Security requirements

## Constraints
- Technical constraints
- Business constraints
- Timeline constraints

## Success Criteria
### Level 8 (Research)
- [ ] Market analysis completed
- [ ] Technology stack recommendations

### Level 9 (Architecture)
- [ ] System architecture designed
- [ ] Scalability strategy outlined

### Level 10-13 (Implementation → Business Value)
- [ ] Implementation completed
- [ ] Testing passed
- [ ] Deployment successful  
- [ ] ROI targets achieved

## Context
Additional background information.
```

## Configuration Options

Available configuration keys:
- `output_directory` - Default output directory for results
- `default_levels` - Default levels to run [8,8.5,9,10,11,12,13]
- `enable_mcp_tools` - Enable MCP tool integration (true/false)
- `enable_agentops` - Enable AgentOps tracing (true/false)
- `verbose_logging` - Enable verbose output (true/false)
- `auto_generate_dashboard` - Auto-generate dashboard after tests (true/false)
- `learning_enabled` - Enable usage learning and analytics (true/false)
- `max_concurrent_agents` - Maximum concurrent agent processes
- `timeout_minutes` - Test execution timeout

## Output Structure

The CLI generates:
- **Test Results**: JSON files with execution results
- **HTML Dashboard**: Interactive multi-level dashboard with drill-down
- **Session Data**: Complete agent execution traces and file flows
- **Learning Data**: Usage analytics for pattern recognition

## Integration with Claude Code

This command integrates seamlessly with Claude Code workflows:

1. **Input Processing**: Reads MD files from your project
2. **Real Tool Integration**: Uses actual MCP tools and TheBaby_Agents
3. **Result Generation**: Creates HTML dashboards in your output directory
4. **Learning System**: Tracks usage patterns for optimization

## Examples

**Quick test with default case:**
```
/nano-benchmark run
```

**Custom test case:**
```  
/nano-benchmark run --test-case "Real-time analytics platform with streaming data processing"
```

**Partial testing:**
```
/nano-benchmark run --levels 8,9,10 --verbose
```

**From MD file:**
```
/nano-benchmark run --input specs/new_system.md --output /tmp/results
```

**Check system:**
```
/nano-benchmark status
```

**Create new test template:**
```
/nano-benchmark init-case "Blockchain DeFi Platform" --template security
```