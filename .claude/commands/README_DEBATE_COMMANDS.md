# Enhanced Persona Debate Commands

Complete command workflows for the Enhanced Persona Debate System integrated with Claude Code.

## 🚀 Quick Start

```bash
# Check system status
/debate-status

# Run your first debate
/debate "Should AI development be regulated?"

# Quick test debate (minimal resources)
/debate-quick "Is remote work better?"

# Monitor active debates
/debate-monitor live
```

## 📚 Available Commands

### Core Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/debate` | Full multi-agent debate with all features | `/debate "Should we colonize Mars?" --agents 8` |
| `/debate-quick` | Quick 3-agent debate for rapid testing | `/debate-quick "Is coffee healthy?"` |
| `/debate-monitor` | Real-time monitoring and analytics | `/debate-monitor analytics --period week` |
| `/debate-status` | System status check | `/debate-status` |

### Command Aliases

- `/qd` - Shortcut for `/debate-quick`
- `/dm` - Shortcut for `/debate-monitor`
- `/ds` - Shortcut for `/debate-status`

## 🎯 Usage Examples

### Standard Debate
```bash
/debate "Should autonomous vehicles be mandatory by 2035?"
# Uses 6 agents, 5 rounds, $1.00 budget
```

### Customized Debate
```bash
/debate "Ethics of genetic engineering" \
  --agents 8 \
  --rounds 7 \
  --cost-limit 1.50 \
  --notify
```

### Quick Testing
```bash
/debate-quick "Is AI art real art?"
# 3 agents, 2 rounds, $0.10 budget, <1 minute
```

### Live Monitoring
```bash
/debate-monitor live
# Shows real-time debate progress
```

### Analytics Report
```bash
/debate-monitor analytics --period month
# Monthly statistics and trends
```

## ⚙️ Configuration Options

### Debate Parameters

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| `--agents` | 3-12 | 6 | Number of debate participants |
| `--rounds` | 1-10 | 5 | Maximum debate rounds |
| `--cost-limit` | 0.1-5.0 | 1.0 | Cost limit in USD |
| `--exclude-o1` | true/false | true | Exclude O1 models |
| `--enable-monitors` | true/false | true | Enable reasoning monitors |
| `--notify` | true/false | false | Send WhatsApp notification |
| `--dashboard` | true/false | true | Generate HTML dashboard |

### Monitor Actions

| Action | Description | Options |
|--------|-------------|---------|
| `live` | Real-time debate tracking | None |
| `status` | System health check | None |
| `history` | View past debates | `--last [N]` |
| `analytics` | Generate analytics report | `--period [day/week/month]` |

## 📊 Output Formats

### Terminal Output
- Colored, formatted text output
- Progress indicators
- Real-time updates
- Summary statistics

### HTML Dashboard
- Dark mode interface
- Interactive charts
- Cost breakdown
- Position timeline
- Agent persona cards
- Reasoning quality metrics

### JSON Results
- Complete debate data
- All metrics and scores
- Agent interactions
- Cost tracking details

### WhatsApp Notifications
- Debate completion alerts
- TinyURL to dashboard
- Key metrics summary
- Cost breakdown

## 🏗️ System Architecture

```
Claude Code Commands
       │
       ├── /debate ──────────► EnhancedPersonaDebateAgent
       │                               │
       ├── /debate-quick ─────► Minimal Config
       │                               │
       ├── /debate-monitor ───► Monitoring System
       │                               │
       └── /debate-status ────► Health Checks
                                       │
                              ┌────────┴────────┐
                              │                 │
                        Strategic Platform    Systemd Service
                              │                 │
                    ┌─────────┴─────┐    ┌─────┴──────┐
                    │               │    │            │
              Orchestrator    MCP Servers    Agents
```

## 🔧 Troubleshooting

### Service Not Running
```bash
# Check service
sudo systemctl status enhanced-debate-agent

# Start service
sudo systemctl start enhanced-debate-agent

# View logs
sudo journalctl -u enhanced-debate-agent -f
```

### Cost Limit Issues
```bash
# Use quick mode for testing
/debate-quick "test topic"

# Or increase limit
/debate "topic" --cost-limit 2.0
```

### No Consensus Reached
```bash
# Allow more rounds
/debate "topic" --rounds 10

# Or use more agents
/debate "topic" --agents 9
```

## 📈 Best Practices

### Topic Selection
- **Good**: Specific questions with clear positions
- **Better**: "Should AI development be regulated?"
- **Best**: "Should international treaties govern AI development by 2030?"

### Agent Configuration
- **3-4 agents**: Quick consensus, less diversity
- **5-7 agents**: Balanced debates (recommended)
- **8-12 agents**: Complex topics, higher cost

### Cost Management
- Start with `/debate-quick` for new topics
- Use `--cost-limit` to control spending
- Monitor with `/debate-monitor analytics`

### Performance Optimization
- Exclude monitors for speed: `--enable-monitors false`
- Reduce rounds for quick results: `--rounds 2`
- Use cached personas when available

## 🔗 Integration

### With Claude Code Agents
```python
# Delegate to debate system
Task("debate-agent-coordinator", "Analyze controversy on: {topic}")
```

### With Strategic Platform
```python
from agents.enhanced_persona_debate_system import EnhancedPersonaDebateAgent
agent = EnhancedPersonaDebateAgent()
```

### With Orchestrator CLI
```bash
python orchestrator_cli.py debate --topic "Your topic"
```

### With MCP Servers
- **just-prompt**: Multi-model execution
- **whatsapp-mcp**: Notifications
- **agent-metrics**: Cost tracking

## 📚 Advanced Features

### Batch Debates
```python
topics = ["Topic 1", "Topic 2", "Topic 3"]
for topic in topics:
    /debate-quick {topic}
```

### Scheduled Debates
```bash
# Add to crontab
0 9 * * * /debate "Daily AI news analysis"
```

### Custom Personas
```python
# Use specific expertise pools
config.expertise_pool = "medical_experts"
```

### Historical Analysis
```bash
# Compare debates over time
/debate-monitor history --last 50
```

## 🎯 Command Cheatsheet

```bash
# Quick Reference
/debate-status                    # Check system
/debate "topic"                   # Standard debate
/debate-quick "topic"             # Quick test
/debate-monitor live              # Watch debates
/debate-monitor analytics         # View stats

# With Options
/debate "topic" --agents 8 --notify
/debate-quick "topic"
/debate-monitor history --last 20
/debate-monitor analytics --period week

# Troubleshooting
sudo systemctl status enhanced-debate-agent
sudo journalctl -u enhanced-debate-agent -f
python test_debate_commands.py
```

## 📝 Notes

- All commands integrate with the Enhanced Persona Debate System
- Service must be running: `enhanced-debate-agent.service`
- Configuration: `/home/craigmbrown/Project/strategic_platform/configs/debate_agents_config.yaml`
- Results saved to: `/home/craigmbrown/Project/strategic_platform/debate_results_*.json`
- Dashboards: `/home/craigmbrown/Project/html-output/`

## 🚦 Status Indicators

- 🟢 **Active**: System running, ready for debates
- 🟡 **Busy**: Debate in progress
- 🔴 **Stopped**: Service not running
- ⚠️ **Warning**: Configuration issue or limit reached
- ✅ **Success**: Debate completed
- ❌ **Error**: Debate failed

## 📞 Support

For issues or questions:
1. Check status: `/debate-status`
2. View logs: `sudo journalctl -u enhanced-debate-agent -f`
3. Run tests: `python test_debate_commands.py`
4. Review docs: This README and individual command docs

---

**Version**: 1.0.0  
**Last Updated**: 2025-09-30  
**Author**: Enhanced Persona Debate System Integration