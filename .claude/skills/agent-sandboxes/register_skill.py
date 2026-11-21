#!/usr/bin/env python3
"""
Register agent-sandboxes skill with the BLP-compliant skills framework.

@requirement: REQ-E2B-REGISTER-001
@blp_mapping: BLP-041-REPLICATE-PROD

Usage:
    python register_skill.py
"""

import sys
import asyncio
from pathlib import Path

# Add skills root to path
SKILLS_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(SKILLS_ROOT))

# Skill metadata
AGENT_SANDBOXES_METADATA = {
    "skill_name": "agent-sandboxes",
    "version": "1.0.0",
    "description": "E2B sandbox operations with ADW SDLC integration",
    "blp_properties": [
        "REQ-BLP-041",  # Self-replication for sandbox creation
        "REQ-BLP-042",  # Variant sandboxes for different phases
        "REQ-BLP-043",  # Scaling sandbox instances
        "REQ-BLP-044",  # Dynamic sandbox spawning
        "REQ-BLP-045",  # Cross-sandbox communication
    ],
    "dependencies": [
        "e2b>=1.0.0",
        "click>=8.0.0",
        "rich>=13.0.0",
        "playwright>=1.40.0",
        "python-dotenv>=1.0.0",
        "pydantic>=2.0.0",
    ],
    "integration_points": [
        "ADW phase orchestration",
        "ZTE SDLC agents",
        "Skill orchestrator",
        "Skills registry",
    ],
    "compute_advantage_target": 2000,
    "capabilities": [
        "sandbox_creation",
        "sandbox_management",
        "file_operations",
        "command_execution",
        "browser_automation",
        "claude_code_execution",
        "adw_phase_deployment",
        "full_stack_scaffolding",
    ],
    "adw_phases": [
        "adw_plan_iso",
        "adw_build_iso",
        "adw_test_iso",
        "adw_review_iso",
        "adw_document_iso",
        "adw_ship_iso",
        "adw_deploy_prod_zte",
    ],
    "zte_agent_mapping": {
        "design_agent": "adw_plan_iso",
        "implementation_agent": "adw_build_iso",
        "testing_agent": "adw_test_iso",
        "review_agent": "adw_review_iso",
        "documentation_agent": "adw_document_iso",
        "deployment_agent": "adw_deploy_prod_zte",
        "operations_agent": "adw_ship_iso",
    },
}


async def register_agent_sandboxes():
    """Register the agent-sandboxes skill with the framework."""
    try:
        from registry.skill_registry import SkillRegistry

        registry = SkillRegistry()

        # Get the skill file path
        skill_path = str(Path(__file__).parent / "__init__.py")

        # Register the skill
        skill_id = await registry.register_skill(
            skill_metadata=AGENT_SANDBOXES_METADATA,
            file_path=skill_path,
        )

        print(f"✅ Skill registered successfully!")
        print(f"   Skill ID: {skill_id}")
        print(f"   Name: {AGENT_SANDBOXES_METADATA['skill_name']}")
        print(f"   Version: {AGENT_SANDBOXES_METADATA['version']}")
        print(f"   BLP Properties: {', '.join(AGENT_SANDBOXES_METADATA['blp_properties'])}")

        return skill_id

    except ImportError as e:
        print(f"⚠️ Could not import skill registry: {e}")
        print("   The skill is installed but registry integration is optional.")
        print(f"\n   Skill Metadata:")
        for key, value in AGENT_SANDBOXES_METADATA.items():
            print(f"   - {key}: {value}")
        return None

    except Exception as e:
        print(f"❌ Error registering skill: {e}")
        return None


def get_skill_metadata():
    """Return skill metadata for programmatic access."""
    return AGENT_SANDBOXES_METADATA


if __name__ == "__main__":
    print("=== Agent Sandboxes Skill Registration ===\n")
    result = asyncio.run(register_agent_sandboxes())

    if result:
        print("\n🎉 Registration complete!")
    else:
        print("\n⚠️ Registration completed with warnings (see above)")
