# agent-system-status - Real-time Service Status Monitor

Checks the actual status of all ETAC system services, MCP servers, and monitoring components.

## Usage

```bash
# Check system status
/status

# The command will show:
# 1. WhatsApp integration status
# 2. Lifelog Manager status  
# 3. Notion integration status
# 4. MCP server status
# 5. Overall system health
# 6. Recommendations for any issues
```

## Implementation

python3 /home/craigmbrown/Project/agent-system-status.py


## Original Command Content

## AgentOps Integration Details v2.0
- **Command Name:** {command_name}
- **Tracking Status:** Active with centralized wrapper
- **Metrics Collection:** 16 comprehensive metrics enabled
- **Session Management:** Automatic with hooks
- **Version:** 2.0.0

For execution tracking, this command will automatically:
1. Execute pre-request hooks for environment validation
2. Generate unique session ID with centralized wrapper
3. Track 16 comprehensive metrics throughout execution
4. Execute post-request hooks for result analysis
5. Archive complete execution details with audit trails

## AgentOps Features v2.0

- **Centralized Wrapper**: Eliminates code duplication across commands
- **Pre/Post Hooks**: Comprehensive request validation and analysis
- **16 Metrics**: Complete performance, cost, and efficiency tracking
- **Automatic Instrumentation**: Decorator-based hook injection
- **Enhanced Archive**: Structured data with audit trails and indexing
- **Real-time Monitoring**: Live system health and performance tracking

## Next Steps

After command execution:
1. Check AgentOps dashboard for detailed traces
2. Review archived metrics in `/agent_archive/command_metrics/`
3. Monitor performance and cost trends
4. Use insights for optimization
