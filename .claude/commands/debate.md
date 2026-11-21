# Enhanced Persona Debate Command

Execute multi-agent debates with diverse personas, reasoning monitors, and cost tracking.

> **For forced-decision debates with operator context, budget/time limits, and APOS plan generation, use `/deliberate` instead.**
> The `/deliberate` command adds: model availability probing, all-channel context gathering, Devil's Advocate + Moonshot mandatory roles, majority voting, and APOS handoff.

## Usage

```
/debate [topic] [options]
```

## Examples

### Basic Debate
```
/debate "Should AI development be regulated by international treaty?"
```

### With Custom Settings
```
/debate "Ethics of genetic engineering" --agents 8 --rounds 5 --cost-limit 0.75
```

### Quick Xenobots Debate
```
/debate xenobots "Should xenobots be used in medical applications?"
```

### AGI Safety Debate
```
/debate agi "What are the risks of artificial general intelligence?"
```

## Options

- `--agents [3-12]` - Number of debate agents (default: 6)
- `--rounds [1-10]` - Maximum debate rounds (default: 5)
- `--cost-limit [0.1-5.0]` - Cost limit in USD (default: 1.0)
- `--exclude-o1` - Exclude O1 models (default: true)
- `--enable-monitors` - Enable reasoning monitors (default: true)
- `--notify` - Send WhatsApp notification when complete (default: false)
- `--dashboard` - Generate HTML dashboard (default: true)

## Workflow Steps

1. **Parse Arguments**
   - Extract topic and options from command
   - Validate parameters against limits
   - Set defaults for missing options

2. **Initialize Debate System**
   - Create EnhancedPersonaDebateAgent instance
   - Load configuration from YAML
   - Apply command-line overrides

3. **Generate Personas**
   - Create diverse agent personas based on topic
   - Assign models (excluding O1 if specified)
   - Distribute expertise and reasoning styles

4. **Prepare Facts**
   - Load relevant facts for the topic
   - For custom topics, generate generic facts
   - Validate fact sources and confidence levels

5. **Execute Debate**
   - Run multi-round debate process
   - Track agent positions and changes
   - Monitor reasoning quality in real-time
   - Enforce cost limits

6. **Process Results**
   - Calculate consensus metrics
   - Analyze cost breakdown by model
   - Generate quality scores
   - Create position change timeline

7. **Generate Outputs**
   - Create HTML dashboard if enabled
   - Save JSON results to file
   - Send WhatsApp notification if requested
   - Display summary in terminal

## Implementation

```python
import sys
import asyncio
from datetime import datetime

sys.path.append('/home/craigmbrown/Project')
sys.path.append('/home/craigmbrown/Project/strategic_platform')

from agents.enhanced_persona_debate_system import (
    EnhancedPersonaDebateAgent,
    DebateConfig
)

async def execute_debate_command(topic: str, **options):
    """Execute debate based on command parameters"""
    
    # Create configuration
    config = DebateConfig(
        topic=topic,
        num_agents=options.get('agents', 6),
        max_rounds=options.get('rounds', 5),
        exclude_o1=options.get('exclude_o1', True),
        cost_limit=options.get('cost_limit', 1.0),
        enable_reasoning_monitors=options.get('enable_monitors', True),
        enable_whatsapp_notifications=options.get('notify', False)
    )
    
    # Initialize agent
    agent = EnhancedPersonaDebateAgent()
    
    # Execute debate
    result = await agent.execute_debate(config)
    
    if result['success']:
        print(f"✅ Debate completed successfully!")
        print(f"📊 Debate ID: {result['debate_id']}")
        print(f"💰 Total Cost: ${result['results']['cost_analysis']['total_cost']:.4f}")
        
        # Show consensus
        consensus = result['results']['consensus_analysis']
        for topic_key, data in consensus.items():
            if data['achieved']:
                print(f"🤝 Consensus: {data['percentage']:.1f}% agreement")
            else:
                print(f"🔄 No consensus after {data['rounds_required']} rounds")
        
        # Show dashboard link if generated
        if options.get('dashboard', True):
            print(f"📊 Dashboard: /home/craigmbrown/Project/html-output/{result['debate_id']}-dashboard.html")
    else:
        print(f"❌ Debate failed: {result.get('error', 'Unknown error')}")
    
    return result
```

## Output Format

### Terminal Output
```
🤖 Enhanced Persona Debate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Topic: Should AI development be regulated?
👥 Agents: 6 diverse personas
🚫 O1 Models: Excluded
💰 Budget: $1.00

🚀 Initializing debate...
✓ Personas generated
✓ Facts loaded (8 items)
✓ Reasoning monitors active

🔄 Round 1/5
  → 2 position changes
  → Consensus: 33%

🔄 Round 2/5
  → 1 position change
  → Consensus: 67%

✅ Debate Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Results:
  • Consensus: 67% (SUPPORT)
  • Total Cost: $0.2077
  • Position Changes: 3
  • Quality Score: 82%

📁 Outputs:
  • Dashboard: debate_20250930_214500_dashboard.html
  • Results: debate_20250930_214500_results.json
  • WhatsApp: ✓ Notification sent
```

### Dashboard Features
- Interactive position timeline
- Agent persona cards
- Cost breakdown charts
- Reasoning quality metrics
- Fact acceptance rates
- Model performance comparison
- Dark mode interface

## Error Handling

### Common Issues

1. **Service Not Running**
   ```
   ❌ Error: Enhanced debate agent service is not running
   💡 Fix: Run 'sudo systemctl start enhanced-debate-agent'
   ```

2. **Cost Limit Exceeded**
   ```
   ❌ Error: Cost limit of $1.00 exceeded at round 3
   💡 Result: Debate terminated early with partial results
   ```

3. **Invalid Topic**
   ```
   ❌ Error: Topic too vague or unclear
   💡 Suggestion: Provide a specific question or statement
   ```

4. **Model Unavailable**
   ```
   ⚠️ Warning: Model 'gpt-5' unavailable, using fallback
   💡 Continuing with alternative model
   ```

## Advanced Features

### Custom Fact Sets
```python
# Load custom facts from file
facts = load_facts_from_file('custom_facts.json')
config.custom_facts = facts
```

### Persona Templates
```python
# Use specific persona template
config.persona_template = 'academic_experts'
```

### Multi-Topic Debates
```python
# Run connected debates on related topics
topics = [
    "AI regulation necessity",
    "Implementation approaches",
    "International cooperation"
]
results = await agent.execute_multi_topic_debate(topics)
```

## Integration Points

- **Orchestrator CLI**: `orchestrator_cli.py debate`
- **Strategic Platform**: `agents.enhanced_persona_debate_system`
- **Claude Code Agents**: Task delegation to sub-agents
- **WhatsApp MCP**: Notification delivery
- **HTML Generator**: Dashboard creation

## Performance Notes

- Average debate duration: 2-5 minutes
- Typical cost: $0.10-0.50 per debate
- Memory usage: ~50MB per active debate
- Concurrent debates: Up to 3 recommended

## Related Commands

- `/debate-status` - Check active debates
- `/debate-monitor` - Real-time monitoring
- `/debate-history` - View past debates
- `/debate-analyze` - Deep analysis of results