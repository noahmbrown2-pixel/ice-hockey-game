# ZTE Full Execution Command

Zero Touch Execution for any GitHub issue with comprehensive validation and deployment.

## Usage

```
/run-zte --issue 123 [options]
```

## Options

- `--issue NUMBER` (required): GitHub issue number to execute ZTE on
- `--mode MODE`: Execution mode (production, development, test) - default: production
- `--max-retries N`: Maximum test retries - default: 5
- `--coverage-target N`: Coverage target percentage - default: 95
- `--no-pr`: Skip PR creation
- `--no-deploy`: Skip deployment
- `--dry-run`: Show what would be done without executing
- `--verbose`: Enable verbose output

## Examples

```
/run-zte --issue 123
/run-zte --issue 456 --dry-run --verbose
/run-zte --issue 789 --no-deploy --coverage-target 90
```

## What This Command Does

1. **Issue Analysis**: Fetches and analyzes GitHub issue requirements
2. **Environment Setup**: Validates and prepares execution environment
3. **Implementation & Testing**: Runs comprehensive test suite with retesting until 100% success
4. **Deployment**: Executes automated deployment pipeline with validation
5. **Integration**: Creates PR, generates reports, and prepares next phase scripts

## Workflow

This command executes the ETAC (Enhanced Tactical Agent Control) system's ZTE (Zero-Time Execution) workflow. For a visual representation of this process, see the [State Machine Diagram](../../etac-production-ready/STATE_MACHINE.md).


## Outputs

- **Execution Report**: HTML report with comprehensive results and TinyURL
- **Private Repository**: Complete implementation archive with evidence
- **Pull Request**: Detailed PR with all changes and validation results
- **Next Phase Script**: Ready-to-execute script for subsequent issues
- **Comprehensive Logs**: Detailed execution logs and metrics

## Success Criteria

- ✅ 100% test success rate achieved through automated retesting
- ✅ All deployment components validated and operational
- ✅ PR created with comprehensive description and evidence
- ✅ Next phase scripts prepared and tested
- ✅ Execution evidence archived in private repository

## Integration

This command integrates the complete ZTE Phase 4 framework including:
- Advanced unit testing with 95% coverage target
- Property-based testing for edge case discovery
- Continuous coverage monitoring
- Automated deployment pipeline
- PR management with GitHub CLI
- Next phase preparation

## Error Handling

- Automatic retry loops with intelligent failure analysis
- Automated fixes for common issues (ports, API keys, connectivity)
- Comprehensive error logging and recovery guidance
- Dry-run mode for validation without execution
- Manual intervention points with clear instructions