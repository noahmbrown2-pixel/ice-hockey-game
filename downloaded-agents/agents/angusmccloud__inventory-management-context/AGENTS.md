# Debug Mode Rules

This file provides guidance for Debug mode when troubleshooting issues in this project.

## Logging Standards

- Use **CloudWatch** for all structured logging
- Include correlation IDs in all log entries for request tracing
- Log levels: ERROR for failures, WARN for recoverable issues, INFO for key events
- Never log sensitive data (secrets, PII, tokens)

## Lambda Debugging

- **Cold start issues**: Check bundle size, minimize dependencies, use tree-shaking
- Check Lambda timeout settings (default 3s may be insufficient)
- Verify IAM permissions - least-privilege may be too restrictive
- Use X-Ray tracing for distributed debugging across services
- Check memory allocation - insufficient memory causes slow execution

## DynamoDB Debugging

- **Avoid table scans** - they are expensive and slow
- Check GSI/LSI configuration for query patterns
- Verify partition key design for hot partition issues
- Use Query over Scan whenever possible
- Check provisioned capacity vs on-demand mode for throttling

## Environment Variables

- Verify all required env vars are set in Lambda configuration
- Check for typos in variable names (case-sensitive)
- Secrets must come from Secrets Manager or Parameter Store
- Local debugging requires `.env.local` file (never committed)

## Common Issues

- **CORS errors**: Check API Gateway and Next.js middleware configuration
- **Timeout errors**: Increase Lambda timeout, check for blocking operations
- **Permission denied**: Review IAM role policies attached to Lambda
- **Module not found**: Check package.json dependencies and bundling

## Agent Context Synchronization

When adding shared context that should apply to all AI agents:

1. **Edit the shared source**: `.specify/memory/agent-shared-context.md`
2. **Run the sync script**: `.specify/scripts/bash/sync-agent-contexts.sh`

This ensures Cursor, Roo Code, and GitHub Copilot all receive the same guidelines.

**Quick Reference**: See `.specify/AGENT-SYNC-QUICK-REFERENCE.md`
**Full Documentation**: See `.specify/docs/agent-context-sync.md`