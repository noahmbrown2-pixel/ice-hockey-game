# Debate Status Command

Quick status check for the Enhanced Persona Debate System.

## Usage

```
/debate-status
```

## Examples

```
/debate-status
```

Simply run the command to get a quick status overview. No parameters needed.

## Output

Provides a concise overview of:
- Service status
- Active debates
- Recent activity
- System health

## Implementation

```python
import subprocess
import json
from pathlib import Path
from datetime import datetime, timedelta

def check_debate_status():
    """Quick status check for debate system"""
    
    print("🤖 Enhanced Persona Debate System Status")
    print("=" * 45)
    
    # 1. Check service status
    try:
        result = subprocess.run(
            ["systemctl", "is-active", "enhanced-debate-agent"],
            capture_output=True, text=True, timeout=2
        )
        service_active = result.stdout.strip() == "active"
        
        if service_active:
            print("✅ Service: Running")
            
            # Get uptime
            uptime_result = subprocess.run(
                ["systemctl", "show", "enhanced-debate-agent", "--property=ActiveEnterTimestamp"],
                capture_output=True, text=True
            )
            if uptime_result.returncode == 0:
                timestamp_str = uptime_result.stdout.strip().split('=')[1]
                if timestamp_str:
                    # Parse and calculate uptime
                    print(f"   Uptime: {timestamp_str}")
        else:
            print("🔴 Service: Stopped")
            print("   Run: sudo systemctl start enhanced-debate-agent")
    except Exception as e:
        print(f"⚠️ Service: Unable to check ({e})")
    
    # 2. Check for recent debates
    results_dir = Path("/home/craigmbrown/Project/strategic_platform")
    recent_files = sorted(
        results_dir.glob("debate_results_*.json"),
        key=lambda p: p.stat().st_mtime,
        reverse=True
    )[:3]
    
    if recent_files:
        print(f"\n📊 Recent Debates ({len(recent_files)}):")
        for f in recent_files:
            try:
                with open(f) as file:
                    data = json.load(file)
                mtime = datetime.fromtimestamp(f.stat().st_mtime)
                age = datetime.now() - mtime
                
                # Format age
                if age.days > 0:
                    age_str = f"{age.days}d ago"
                elif age.seconds > 3600:
                    age_str = f"{age.seconds // 3600}h ago"
                else:
                    age_str = f"{age.seconds // 60}m ago"
                
                print(f"   • {age_str}: {data.get('topic', 'Unknown')[:30]}")
                print(f"     Cost: ${data.get('total_cost', 0):.3f}, "
                      f"Consensus: {data.get('consensus_percentage', 0):.0f}%")
            except:
                pass
    else:
        print("\n📊 Recent Debates: None")
    
    # 3. Quick config check
    config_path = Path("/home/craigmbrown/Project/strategic_platform/configs/debate_agents_config.yaml")
    if config_path.exists():
        print("\n⚙️ Configuration:")
        print("   ✓ Config file present")
        print("   ✓ Default: 6 agents, $1.00 limit")
        print("   ✓ O1 models excluded")
    else:
        print("\n⚠️ Configuration: Missing config file")
    
    # 4. Quick health indicators
    print("\n🏥 Health Indicators:")
    indicators = {
        "Service": service_active,
        "Config": config_path.exists(),
        "Results Dir": results_dir.exists(),
        "Recent Activity": len(recent_files) > 0
    }
    
    all_healthy = all(indicators.values())
    for name, healthy in indicators.items():
        emoji = "✅" if healthy else "❌"
        print(f"   {emoji} {name}")
    
    # Summary
    print("\n" + "-" * 45)
    if all_healthy:
        print("✨ System ready for debates!")
        print("💡 Try: /debate 'Your topic here'")
    else:
        print("⚠️ Some components need attention")
        print("💡 Run: /debate-monitor status (for details)")

# Execute
if __name__ == "__main__":
    check_debate_status()
```

## Example Output

### Healthy System
```
🤖 Enhanced Persona Debate System Status
=============================================
✅ Service: Running
   Uptime: 2025-09-30 21:29:09 UTC

📊 Recent Debates (3):
   • 5m ago: Should AI development be regulated?
     Cost: $0.067, Consensus: 100%
   • 1h ago: Xenobots in medicine
     Cost: $0.125, Consensus: 67%
   • 3h ago: Climate change solutions
     Cost: $0.089, Consensus: 83%

⚙️ Configuration:
   ✓ Config file present
   ✓ Default: 6 agents, $1.00 limit
   ✓ O1 models excluded

🏥 Health Indicators:
   ✅ Service
   ✅ Config
   ✅ Results Dir
   ✅ Recent Activity

---------------------------------------------
✨ System ready for debates!
💡 Try: /debate 'Your topic here'
```

### Issues Detected
```
🤖 Enhanced Persona Debate System Status
=============================================
🔴 Service: Stopped
   Run: sudo systemctl start enhanced-debate-agent

📊 Recent Debates: None

⚙️ Configuration:
   ✓ Config file present
   ✓ Default: 6 agents, $1.00 limit
   ✓ O1 models excluded

🏥 Health Indicators:
   ❌ Service
   ✅ Config
   ✅ Results Dir
   ❌ Recent Activity

---------------------------------------------
⚠️ Some components need attention
💡 Run: /debate-monitor status (for details)
```

## Quick Actions

Based on status, suggests appropriate actions:

| Status | Action Suggested |
|--------|-----------------|
| Service Stopped | `sudo systemctl start enhanced-debate-agent` |
| No Config | `cp configs/debate_agents_config.yaml.example configs/debate_agents_config.yaml` |
| No Recent Activity | `/debate-quick "Test topic"` |
| All Healthy | `/debate "Your interesting topic"` |

## Integration

This command is lightweight and can be:
- Run frequently without performance impact
- Called from other scripts
- Used in monitoring dashboards
- Included in health checks

## Related Commands

- `/debate` - Start a new debate
- `/debate-monitor` - Detailed monitoring
- `/debate-history` - View past debates
- `/debate-quick` - Quick test debate