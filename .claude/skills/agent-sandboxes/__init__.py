#!/usr/bin/env python3
"""
Agent Sandboxes Skill - E2B sandbox operations with ADW integration.

@skill_name: agent-sandboxes
@version: 1.0.0
@blp_properties: REQ-BLP-041, REQ-BLP-042, REQ-BLP-043, REQ-BLP-044, REQ-BLP-045
@compute_advantage_target: 2000x

This skill provides:
- E2B sandbox creation and management via CLI
- ADW (Automated Development Workflow) phase-based sandbox configurations
- Full-stack application scaffolding (Vue+FastAPI+SQLite)
- Playwright browser automation for UI validation
- Claude Code execution in non-TTY environments

Integration points:
- Existing ADW E2B framework at /issue-97-tac-adw-project/
- Skills framework orchestrator and registry
- ZTE SDLC agents for orchestrator/deployment workflows
"""

from pathlib import Path

# Skill metadata
__version__ = "1.0.0"
__skill_name__ = "agent-sandboxes"
__description__ = "E2B sandbox operations with ADW integration for safe code execution"

# Paths
SKILL_ROOT = Path(__file__).parent
SANDBOX_CLI_PATH = SKILL_ROOT / "sandbox_cli"
PROMPTS_PATH = SKILL_ROOT / "prompts"
ADW_INTEGRATION_PATH = SKILL_ROOT / "adw_integration"

# BLP Properties implemented
BLP_PROPERTIES = [
    "REQ-BLP-041",  # Self-replication for sandbox creation
    "REQ-BLP-042",  # Variant sandboxes for different phases
    "REQ-BLP-043",  # Scaling sandbox instances
    "REQ-BLP-044",  # Dynamic sandbox spawning
    "REQ-BLP-045",  # Cross-sandbox communication
]

# Exports
__all__ = [
    "__version__",
    "__skill_name__",
    "__description__",
    "SKILL_ROOT",
    "SANDBOX_CLI_PATH",
    "PROMPTS_PATH",
    "ADW_INTEGRATION_PATH",
    "BLP_PROPERTIES",
]
