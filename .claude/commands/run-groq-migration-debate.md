# Groq Migration Debate Command

Execute the Groq migration multi-agent debate using the integrated framework.

## Usage

```
/run-groq-migration-debate [options]
```

## Options

- `--output-dir [path]` - Directory to save HTML/JSON reports (default: `/home/craigmbrown/Project/html-output`)
- `--notify` - Send WhatsApp notification on completion (default: false)

## Workflow Steps

1.  **Initialize System**: Imports the refactored `groq_migration_debate.py` script.
2.  **Execute Main**: Calls the `main()` function from the script.
3.  **Run Debate**: The script initializes `EnhancedDebateSystem`, generates specific personas and facts for the Groq debate, and runs the simulation.
4.  **Generate Outputs**: The script saves the JSON results and a simplified HTML dashboard to the specified output directory.
5.  **Display Summary**: A summary of the debate outcome is printed to the terminal.

## Implementation

```python
import sys
import subprocess
from pathlib import Path

def execute_groq_migration_debate_command(**options):
    """
    Executes the Groq migration debate script.
    """
    script_path = "/home/craigmbrown/Project/groq_migration_debate.py"
    
    print("="*80)
    print("🚀 EXECUTING GROQ MIGRATION DEBATE SCRIPT")
    print(f"Script: {script_path}")
    print("="*80)

    try:
        # Using subprocess to run the script as a separate process
        # This ensures it runs with its own context and dependencies
        process = subprocess.run(
            [sys.executable, script_path],
            capture_output=True,
            text=True,
            check=True,
            cwd="/home/craigmbrown/Project"
        )
        
        print("\n✅ DEBATE SCRIPT EXECUTED SUCCESSFULLY")
        print("-" * 80)
        print("SCRIPT OUTPUT:")
        print(process.stdout)
        print("-" * 80)
        
        if process.stderr:
            print("\n⚠️ SCRIPT STDERR:")
            print(process.stderr)

    except subprocess.CalledProcessError as e:
        print(f"\n❌ ERROR: Debate script failed with exit code {e.returncode}")
        print("-" * 80)
        print("STDOUT:")
        print(e.stdout)
        print("\nSTDERR:")
        print(e.stderr)
        print("-" * 80)
    except FileNotFoundError:
        print(f"❌ ERROR: Script not found at {script_path}")

# Example of how to call this (in a real scenario, this would be triggered by the command parser)
# execute_groq_migration_debate_command()
```

## Related Files 

-   `groq_migration_debate.py`: The main script that runs the debate.
-   `enhanced_persona_debate_system.py`: The core debate framework.
-   `tests/test_groq_migration_debate_integration.py`: Integration tests.
