#!/usr/bin/env python3
"""
Unified Phase Configurations - ADW phases + Full-stack templates.

@requirement: REQ-E2B-PHASE-CONFIG-001
@blp_mapping: BLP-041-REPLICATE-PROD, BLP-051-SELF-ORGANIZE-DEPLOY

Merges:
- ADW SDLC phases (from adw_e2b_integration_framework.py)
- Full-stack templates (from disler's agent-sandbox-skill)
- Browser testing configurations
"""

from typing import Dict, Any, List, Optional

# Requirement registry for traceability
PHASE_REQUIREMENT_REGISTRY = {
    "REQ-E2B-INTEGRATE-A1B2C3D4": {
        "description": "Deploy E2B sessions for ADW planning and prototyping phases",
        "blp_mapping": "BLP-041-REPLICATE-PROD",
        "phases": ["adw_plan_iso"],
    },
    "REQ-E2B-INTEGRATE-E5F6G7H8": {
        "description": "Deploy E2B development and testing environments",
        "blp_mapping": "BLP-051-SELF-ORGANIZE-DEPLOY",
        "phases": ["adw_build_iso", "adw_test_iso", "adw_review_iso"],
    },
    "REQ-E2B-INTEGRATE-I9J0K1L2": {
        "description": "Deploy E2B documentation, shipping and production environments",
        "blp_mapping": "BLP-031-SELF-IMPROVE",
        "phases": ["adw_document_iso", "adw_ship_iso", "adw_deploy_prod_zte"],
    },
    "REQ-E2B-FULLSTACK-001": {
        "description": "Full-stack Vue+FastAPI+SQLite sandbox templates",
        "blp_mapping": "BLP-043-SCALE-SANDBOX",
        "phases": ["full_stack_vue_fastapi", "full_stack_standard", "full_stack_heavy"],
    },
    "REQ-E2B-BROWSER-001": {
        "description": "Browser automation and testing sandboxes",
        "blp_mapping": "BLP-044-DYNAMIC-SPAWN",
        "phases": ["browser_testing", "browser_validation"],
    },
}


# Unified phase configurations
UNIFIED_PHASE_CONFIGS: Dict[str, Dict[str, Any]] = {
    # ==============================================
    # ADW SDLC Phases (from adw_e2b_integration_framework.py)
    # ==============================================
    "adw_plan_iso": {
        "template": "base",
        "purpose": "Planning and prototyping sandbox",
        "tools": ["git", "nodejs", "python3", "claude-cli"],
        "timeout_minutes": 30,
        "requirements": ["REQ-E2B-INTEGRATE-A1B2C3D4"],
        "workspace": "~/planning-workspace",
        "description": "E2B sandbox for ADW planning phase with prototyping capabilities",
        "phase_type": "adw",
    },
    "adw_build_iso": {
        "template": "base",
        "purpose": "Full development environment",
        "tools": ["git", "nodejs", "python3", "claude-cli", "docker", "gcc", "make"],
        "timeout_minutes": 60,
        "requirements": ["REQ-E2B-INTEGRATE-E5F6G7H8"],
        "workspace": "~/build-workspace",
        "description": "E2B development sandbox with complete build toolchain",
        "phase_type": "adw",
    },
    "adw_test_iso": {
        "template": "base",
        "purpose": "Isolated testing environment",
        "tools": ["git", "nodejs", "python3", "claude-cli", "pytest", "jest", "selenium"],
        "timeout_minutes": 45,
        "requirements": ["REQ-E2B-INTEGRATE-E5F6G7H8"],
        "workspace": "~/test-workspace",
        "description": "E2B testing sandbox with testing frameworks and browsers",
        "phase_type": "adw",
    },
    "adw_review_iso": {
        "template": "base",
        "purpose": "Collaborative review environment",
        "tools": ["git", "nodejs", "python3", "claude-cli", "code-server"],
        "timeout_minutes": 30,
        "requirements": ["REQ-E2B-INTEGRATE-E5F6G7H8"],
        "workspace": "~/review-workspace",
        "description": "E2B review sandbox with collaborative tools",
        "phase_type": "adw",
    },
    "adw_document_iso": {
        "template": "base",
        "purpose": "Documentation generation environment",
        "tools": ["git", "nodejs", "python3", "claude-cli", "pandoc", "latex"],
        "timeout_minutes": 30,
        "requirements": ["REQ-E2B-INTEGRATE-I9J0K1L2"],
        "workspace": "~/docs-workspace",
        "description": "E2B documentation sandbox with publishing tools",
        "phase_type": "adw",
    },
    "adw_ship_iso": {
        "template": "base",
        "purpose": "Staging and pre-production environment",
        "tools": ["git", "nodejs", "python3", "claude-cli", "docker", "kubernetes"],
        "timeout_minutes": 45,
        "requirements": ["REQ-E2B-INTEGRATE-I9J0K1L2"],
        "workspace": "~/staging-workspace",
        "description": "E2B staging sandbox for pre-production validation",
        "phase_type": "adw",
    },
    "adw_deploy_prod_zte": {
        "template": "base",
        "purpose": "Production deployment simulation",
        "tools": ["git", "nodejs", "python3", "claude-cli", "terraform", "ansible"],
        "timeout_minutes": 60,
        "requirements": ["REQ-E2B-INTEGRATE-I9J0K1L2"],
        "workspace": "~/production-workspace",
        "description": "E2B production simulation with deployment tools",
        "phase_type": "adw",
    },

    # ==============================================
    # Full-Stack Templates (from disler's agent-sandbox-skill)
    # ==============================================
    "full_stack_vue_fastapi": {
        "template": "fullstack-vue-fastapi-node22",
        "purpose": "Full-stack Vue+FastAPI+SQLite development",
        "tools": ["nodejs", "python3", "sqlite3", "vue-cli", "uvicorn"],
        "timeout_minutes": 720,  # 12 hours
        "requirements": ["REQ-E2B-FULLSTACK-001"],
        "workspace": "/home/user/project",
        "description": "Full-stack sandbox with Vue frontend, FastAPI backend, SQLite database",
        "phase_type": "fullstack",
        "frontend_port": 5173,
        "backend_port": 8000,
        "vcpu": 2,
        "ram_gb": 2,
        "cost_per_hour": 0.13,
    },
    "full_stack_standard": {
        "template": "fullstack-vue-fastapi-node22-standard",
        "purpose": "Standard full-stack with parallel builds",
        "tools": ["nodejs", "python3", "sqlite3", "vue-cli", "uvicorn"],
        "timeout_minutes": 720,
        "requirements": ["REQ-E2B-FULLSTACK-001"],
        "workspace": "/home/user/project",
        "description": "Standard tier sandbox for parallel builds and testing",
        "phase_type": "fullstack",
        "frontend_port": 5173,
        "backend_port": 8000,
        "vcpu": 4,
        "ram_gb": 4,
        "cost_per_hour": 0.27,
    },
    "full_stack_heavy": {
        "template": "fullstack-vue-fastapi-node22-heavy",
        "purpose": "Heavy full-stack with multi-browser support",
        "tools": ["nodejs", "python3", "sqlite3", "vue-cli", "uvicorn", "playwright"],
        "timeout_minutes": 720,
        "requirements": ["REQ-E2B-FULLSTACK-001"],
        "workspace": "/home/user/project",
        "description": "Heavy tier sandbox for multi-browser testing",
        "phase_type": "fullstack",
        "frontend_port": 5173,
        "backend_port": 8000,
        "vcpu": 4,
        "ram_gb": 8,
        "cost_per_hour": 0.33,
    },
    "full_stack_max": {
        "template": "fullstack-vue-fastapi-node22-max",
        "purpose": "Maximum performance full-stack",
        "tools": ["nodejs", "python3", "sqlite3", "vue-cli", "uvicorn", "playwright"],
        "timeout_minutes": 720,
        "requirements": ["REQ-E2B-FULLSTACK-001"],
        "workspace": "/home/user/project",
        "description": "Maximum performance sandbox for fastest builds",
        "phase_type": "fullstack",
        "frontend_port": 5173,
        "backend_port": 8000,
        "vcpu": 8,
        "ram_gb": 8,
        "cost_per_hour": 0.44,
    },

    # ==============================================
    # Browser Testing Templates
    # ==============================================
    "browser_testing": {
        "template": "fullstack-vue-fastapi-node22-lite",
        "purpose": "Browser automation and UI testing",
        "tools": ["nodejs", "playwright", "chromium"],
        "timeout_minutes": 60,
        "requirements": ["REQ-E2B-BROWSER-001"],
        "workspace": "/home/user/browser-tests",
        "description": "Browser testing sandbox with Playwright and Chromium",
        "phase_type": "browser",
        "vcpu": 2,
        "ram_gb": 4,
        "cost_per_hour": 0.15,
    },
    "browser_validation": {
        "template": "fullstack-vue-fastapi-node22-heavy",
        "purpose": "Multi-browser validation and screenshots",
        "tools": ["nodejs", "playwright", "chromium", "firefox", "webkit"],
        "timeout_minutes": 120,
        "requirements": ["REQ-E2B-BROWSER-001"],
        "workspace": "/home/user/validation",
        "description": "Multi-browser validation sandbox for comprehensive UI testing",
        "phase_type": "browser",
        "vcpu": 4,
        "ram_gb": 8,
        "cost_per_hour": 0.33,
    },
}


# ZTE ADW Agent to Phase Mapping
ZTE_SANDBOX_MAPPING: Dict[str, str] = {
    "design_agent": "adw_plan_iso",
    "implementation_agent": "adw_build_iso",
    "testing_agent": "adw_test_iso",
    "review_agent": "adw_review_iso",
    "documentation_agent": "adw_document_iso",
    "deployment_agent": "adw_deploy_prod_zte",
    "operations_agent": "adw_ship_iso",
}


def get_phase_config(phase_name: str) -> Optional[Dict[str, Any]]:
    """
    Get configuration for a specific phase.

    Args:
        phase_name: Name of the phase (e.g., 'adw_build_iso', 'full_stack_vue_fastapi')

    Returns:
        Phase configuration dictionary or None if not found

    REQ-E2B-PHASE-CONFIG-001: Phase configuration retrieval
    """
    return UNIFIED_PHASE_CONFIGS.get(phase_name)


def list_phases(phase_type: Optional[str] = None) -> List[str]:
    """
    List available phases, optionally filtered by type.

    Args:
        phase_type: Filter by phase type ('adw', 'fullstack', 'browser') or None for all

    Returns:
        List of phase names

    REQ-E2B-PHASE-CONFIG-002: Phase listing
    """
    if phase_type is None:
        return list(UNIFIED_PHASE_CONFIGS.keys())

    return [
        name for name, config in UNIFIED_PHASE_CONFIGS.items()
        if config.get("phase_type") == phase_type
    ]


def get_phase_for_agent(agent_name: str) -> Optional[str]:
    """
    Get the recommended phase for a ZTE ADW agent.

    Args:
        agent_name: Name of the agent (e.g., 'design_agent', 'testing_agent')

    Returns:
        Phase name or None if no mapping exists

    REQ-E2B-AGENT-MAPPING-001: Agent to phase mapping
    """
    return ZTE_SANDBOX_MAPPING.get(agent_name)


def get_tool_installation_commands() -> Dict[str, str]:
    """
    Get shell commands for installing tools in E2B sandboxes.

    Returns:
        Dictionary mapping tool names to installation commands

    REQ-E2B-TOOL-INSTALL-001: Tool installation commands
    """
    return {
        "git": "sudo apt-get install -y git",
        "nodejs": "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs",
        "python3": "sudo apt-get install -y python3 python3-pip",
        "claude-cli": "npm install -g @anthropic-ai/claude-code",
        "docker": "curl -fsSL https://get.docker.com | sudo sh",
        "gcc": "sudo apt-get install -y build-essential",
        "make": "sudo apt-get install -y make",
        "pytest": "pip3 install pytest",
        "jest": "npm install -g jest",
        "selenium": "pip3 install selenium",
        "code-server": "curl -fsSL https://code-server.dev/install.sh | sh",
        "pandoc": "sudo apt-get install -y pandoc",
        "latex": "sudo apt-get install -y texlive-latex-base",
        "kubernetes": "curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl && chmod +x kubectl && sudo mv kubectl /usr/local/bin/",
        "terraform": "wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip && unzip terraform_1.6.0_linux_amd64.zip && sudo mv terraform /usr/local/bin/",
        "ansible": "pip3 install ansible",
        "sqlite3": "sudo apt-get install -y sqlite3",
        "vue-cli": "npm install -g @vue/cli",
        "uvicorn": "pip3 install uvicorn fastapi",
        "playwright": "pip3 install playwright && playwright install chromium",
    }


if __name__ == "__main__":
    # Print available configurations
    print("=== Unified Phase Configurations ===\n")

    print("ADW Phases:")
    for phase in list_phases("adw"):
        config = get_phase_config(phase)
        print(f"  {phase}: {config['purpose']}")

    print("\nFull-Stack Phases:")
    for phase in list_phases("fullstack"):
        config = get_phase_config(phase)
        print(f"  {phase}: {config['purpose']} (${config.get('cost_per_hour', 'N/A')}/hr)")

    print("\nBrowser Testing Phases:")
    for phase in list_phases("browser"):
        config = get_phase_config(phase)
        print(f"  {phase}: {config['purpose']}")

    print("\nZTE Agent Mappings:")
    for agent, phase in ZTE_SANDBOX_MAPPING.items():
        print(f"  {agent} -> {phase}")
