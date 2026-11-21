# Quick Debate Command

Run a fast, lightweight debate with minimal configuration for rapid testing or exploration.

## Usage

```
/debate-quick [topic]
```

## Examples

### Super Quick Test
```
/debate-quick "Is remote work better than office work?"
```

### Quick AI Ethics Check
```
/debate-quick "Should AI have rights?"
```

## Configuration

Optimized for speed and low cost:
- **Agents**: 3 (minimum viable debate)
- **Rounds**: 2 (quick consensus check)
- **Models**: Cost-effective tier only
- **Cost Limit**: $0.10
- **Monitors**: Disabled for speed
- **Dashboard**: Simplified version

## Workflow

```python
import sys
import asyncio
from datetime import datetime

sys.path.append('/home/craigmbrown/Project/strategic_platform')
from agents.enhanced_persona_debate_system import DebateConfig, EnhancedPersonaDebateAgent

async def quick_debate(topic: str):
    """Execute a quick lightweight debate"""
    
    print(f"⚡ Quick Debate: {topic[:50]}...")
    
    # Minimal configuration for speed
    config = DebateConfig(
        topic=topic,
        num_agents=3,  # Minimum for meaningful debate
        max_rounds=2,  # Just 2 rounds
        exclude_o1=True,
        cost_limit=0.10,  # Very low cost limit
        enable_reasoning_monitors=False,  # Skip for speed
        enable_whatsapp_notifications=False
    )
    
    # Use singleton agent for efficiency
    agent = EnhancedPersonaDebateAgent("quick-debate-agent")
    
    # Execute with timeout
    try:
        result = await asyncio.wait_for(
            agent.execute_debate(config),
            timeout=60.0  # 1 minute timeout
        )
        
        if result['success']:
            # Ultra-compact output
            consensus = result['results']['consensus_analysis']
            cost = result['results']['cost_analysis']['total_cost']
            
            print(f"✅ Quick Result:")
            print(f"  • Consensus: {list(consensus.values())[0]['percentage']:.0f}%")
            print(f"  • Cost: ${cost:.3f}")
            print(f"  • Time: <60s")
            
            # One-line summary
            positions = result['results'].get('debate_results', {}).get('final_positions', {})
            if positions:
                majority = max(positions.items(), key=lambda x: x[1])
                print(f"  • Majority: {majority[0]} ({majority[1]}/3 agents)")
        else:
            print(f"❌ Failed: {result.get('error', 'Unknown')[:50]}")
            
    except asyncio.TimeoutError:
        print("⏱️ Timeout: Debate took too long")
    except Exception as e:
        print(f"❌ Error: {str(e)[:50]}")
```

## Output Format

Super minimal for quick scanning:

```
⚡ Quick Debate: Is remote work better?...
✅ Quick Result:
  • Consensus: 67%
  • Cost: $0.018
  • Time: <60s
  • Majority: SUPPORT (2/3 agents)
```

## Use Cases

1. **Rapid Prototyping**
   - Test debate topics quickly
   - Validate question framing
   - Check if topic generates controversy

2. **Cost-Conscious Testing**
   - Stay under $0.10 per debate
   - Use only efficient models
   - Minimal token usage

3. **Real-Time Decisions**
   - Get quick AI perspective
   - Simple yes/no questions
   - Binary choice evaluation

4. **Bulk Analysis**
   - Run many quick debates
   - Survey multiple topics
   - Identify interesting areas

## Shortcuts

### Even Quicker
```
/qd "Topic"  # Alias for debate-quick
```

### Batch Mode
```
/debate-quick-batch topics.txt
```

### Stream Mode
```
/debate-quick --stream "Topic"  # Show live updates
```

## Limitations

- Only 3 agents (minimum diversity)
- Maximum 2 rounds (may not reach consensus)
- No reasoning monitors (less quality control)
- Simplified personas (less depth)
- Basic facts only (no deep research)

## Performance

- **Duration**: 15-45 seconds typical
- **Cost**: $0.01-0.05 average
- **Memory**: <20MB
- **CPU**: Minimal impact
- **Network**: 1-3 API calls

## Error Recovery

Fails fast with clear messages:

```
⚡ Quick Debate: [Topic]...
❌ Failed: Service unavailable
💡 Try: /debate (full version) or wait 30s
```

## Related Commands

- `/debate` - Full debate with all features
- `/debate-test` - Test debate configuration
- `/debate-validate` - Validate topic viability