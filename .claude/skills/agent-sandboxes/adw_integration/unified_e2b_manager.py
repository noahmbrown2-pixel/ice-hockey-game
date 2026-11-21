#!/usr/bin/env python3
"""
Unified E2B Manager - Merges ADW framework with disler's sandbox_cli.

@requirement: REQ-E2B-UNIFIED-001
@blp_mapping: BLP-041-REPLICATE-PROD, BLP-051-SELF-ORGANIZE-DEPLOY
@component: Unified_E2B_Manager_v1.0

Combines:
- ADW E2B integration framework (phase-based sandboxes)
- Disler's sandbox_cli capabilities (full-stack, browser testing)

Based on:
- /home/craigmbrown/issue-97-tac-adw-project/adw_e2b_integration_framework.py
- /home/craigmbrown/Project/.claude/skills/agent-sandboxes/sandbox_cli/
"""

import os
import json
import logging
import traceback
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

from .phase_configs import (
    UNIFIED_PHASE_CONFIGS,
    get_phase_config,
    list_phases,
    get_phase_for_agent,
    get_tool_installation_commands,
    ZTE_SANDBOX_MAPPING,
)
from .claude_code_executor import ClaudeCodeExecutor, execute_claude_in_sandbox

# Setup logging
logger = logging.getLogger(__name__)


def comprehensive_exception_handler(func):
    """
    Enhanced exception handler with requirement traceability.

    Based on comprehensive_exception_handler_v3_e2b from ADW framework.

    @requirement: REQ-E2B-EXCEPTION-001
    """
    def wrapper(*args, **kwargs):
        trace_id = str(uuid.uuid4())[:8]
        try:
            logger.info(f"[E2B-TRACE-{trace_id}] Entering {func.__name__}")
            result = func(*args, **kwargs)
            logger.info(f"[E2B-TRACE-{trace_id}] ✅ {func.__name__} completed successfully")
            return result
        except Exception as e:
            exc_type = type(e).__name__
            exc_message = str(e)
            full_traceback = traceback.format_exc()

            logger.error(f"[E2B-TRACE-{trace_id}] ❌ Exception in {func.__name__}:")
            logger.error(f"  Exception Type: {exc_type}")
            logger.error(f"  Exception Message: {exc_message}")
            logger.error(f"  Full Traceback:\n{full_traceback}")

            raise
    return wrapper


class UnifiedE2BManager:
    """
    Unified E2B Manager combining ADW framework with sandbox_cli.

    @requirement: REQ-E2B-UNIFIED-001
    @blp_mapping: BLP-041-REPLICATE-PROD, BLP-051-SELF-ORGANIZE-DEPLOY

    Capabilities:
    - ADW phase-based sandbox creation and management
    - Full-stack application scaffolding (Vue+FastAPI+SQLite)
    - Browser automation with Playwright
    - Claude Code execution in non-TTY environments
    - Session persistence and recovery
    """

    def __init__(self, env_file: Optional[str] = None):
        """
        Initialize the Unified E2B Manager.

        Args:
            env_file: Path to .env file (defaults to project root)
        """
        # Load environment
        if env_file:
            load_dotenv(env_file)
        else:
            # Try common locations
            for path in [".env", "../.env", "../../.env", "../../../.env"]:
                if Path(path).exists():
                    load_dotenv(path)
                    break

        self.api_key = os.getenv("E2B_API_KEY")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")

        # Active sandbox tracking
        self.active_sandboxes: Dict[str, Dict[str, Any]] = {}

        # Session storage directory
        self.session_dir = Path("e2b_sessions")
        self.session_dir.mkdir(exist_ok=True)

        # Claude Code executor
        self.claude_executor = ClaudeCodeExecutor()

        # REQ-E2B-UNIFIED-001: Log initialization
        logger.info("UnifiedE2BManager initialized")
        logger.info(f"API Key present: {bool(self.api_key)}")
        logger.info(f"Session directory: {self.session_dir}")

    # ==========================================
    # ADW Phase Methods (from ADW framework)
    # ==========================================

    @comprehensive_exception_handler
    def create_adw_phase_sandbox(
        self,
        phase_name: str,
        issue_number: str,
        adw_id: str,
    ) -> Dict[str, Any]:
        """
        Create E2B sandbox configured for specific ADW phase.

        Args:
            phase_name: ADW phase name (e.g., 'adw_build_iso')
            issue_number: GitHub issue number
            adw_id: ADW workflow ID

        Returns:
            Session info dictionary with sandbox_id and configuration

        @requirement: REQ-E2B-ADW-PHASE-001
        """
        from e2b import Sandbox

        config = get_phase_config(phase_name)
        if not config:
            raise ValueError(f"Unknown phase: {phase_name}. Available: {list_phases('adw')}")

        logger.info(f"🚀 Creating E2B session for {phase_name} (Issue #{issue_number}, ADW: {adw_id})")
        logger.info(f"Purpose: {config['purpose']}")
        logger.info(f"Tools: {', '.join(config['tools'])}")

        # Create sandbox with phase-specific template
        timeout_seconds = config["timeout_minutes"] * 60
        sandbox = Sandbox.create(
            template=config["template"],
            timeout=timeout_seconds,
            metadata={
                "phase": phase_name,
                "issue_number": issue_number,
                "adw_id": adw_id,
            }
        )

        session_info = {
            "sandbox_id": sandbox.sandbox_id,
            "phase": phase_name,
            "issue_number": issue_number,
            "adw_id": adw_id,
            "created_at": datetime.now().isoformat(),
            "config": config,
            "dashboard_url": f"https://e2b.dev/dashboard/sandboxes/{sandbox.sandbox_id}",
            "status": "created",
        }

        # Track active sandbox
        self.active_sandboxes[sandbox.sandbox_id] = session_info

        # Save session
        self._save_session(session_info)

        logger.info(f"✅ E2B Sandbox created: {sandbox.sandbox_id}")
        logger.info(f"🌐 Dashboard: {session_info['dashboard_url']}")

        return session_info

    @comprehensive_exception_handler
    def setup_adw_environment(
        self,
        sandbox_id: str,
        phase_name: str,
    ) -> bool:
        """
        Setup E2B environment with phase-specific tools.

        Args:
            sandbox_id: The sandbox ID
            phase_name: ADW phase name

        Returns:
            True if setup succeeded, False otherwise

        @requirement: REQ-E2B-ADW-SETUP-001
        """
        from e2b import Sandbox

        config = get_phase_config(phase_name)
        if not config:
            raise ValueError(f"Unknown phase: {phase_name}")

        sandbox = Sandbox.connect(sandbox_id)
        logger.info(f"🔧 Setting up {phase_name} environment in sandbox {sandbox_id}")

        # Update system
        result = sandbox.commands.run("sudo apt-get update", timeout=120000)
        if result.exit_code != 0:
            logger.warning(f"apt update warning: {result.stderr}")

        # Install tools
        tool_commands = get_tool_installation_commands()
        installed_tools = []
        failed_tools = []

        for tool in config["tools"]:
            if tool in tool_commands:
                logger.info(f"  Installing {tool}...")
                try:
                    timeout_ms = 120000 if tool == "claude-cli" else 300000
                    result = sandbox.commands.run(tool_commands[tool], timeout=timeout_ms)
                    if result.exit_code == 0:
                        installed_tools.append(tool)
                        logger.info(f"  ✅ {tool} installed successfully")
                    else:
                        if tool == "claude-cli":
                            logger.warning(f"  ⚠️ {tool} installation skipped (optional)")
                        else:
                            failed_tools.append(tool)
                            logger.error(f"  ❌ {tool} installation failed: {result.stderr}")
                except Exception as e:
                    if tool == "claude-cli":
                        logger.warning(f"  ⚠️ {tool} installation skipped: {str(e)[:100]}")
                    else:
                        failed_tools.append(tool)
                        logger.error(f"  ❌ {tool} installation error: {str(e)[:100]}")

        # Create workspace
        workspace = config.get("workspace", "/home/user/workspace")
        result = sandbox.commands.run(f"mkdir -p {workspace}", timeout=30000)
        if result.exit_code == 0:
            logger.info(f"✅ Workspace created: {workspace}")

        success = len(installed_tools) > len(failed_tools)
        logger.info(f"🎯 Environment setup {'completed' if success else 'partial'}: "
                   f"{len(installed_tools)}/{len(config['tools'])} tools installed")

        return success

    @comprehensive_exception_handler
    def deploy_adw_phase(
        self,
        phase_name: str,
        issue_number: str,
        adw_id: str,
    ) -> Dict[str, Any]:
        """
        Deploy complete E2B session for ADW phase.

        Args:
            phase_name: ADW phase name
            issue_number: GitHub issue number
            adw_id: ADW workflow ID

        Returns:
            Complete session info with setup status

        @requirement: REQ-E2B-ADW-DEPLOY-001
        """
        # Create session
        session_info = self.create_adw_phase_sandbox(phase_name, issue_number, adw_id)

        # Setup environment
        setup_success = self.setup_adw_environment(session_info["sandbox_id"], phase_name)
        session_info["setup_success"] = setup_success
        session_info["status"] = "ready" if setup_success else "partial"

        # Update saved session
        self._save_session(session_info)

        return session_info

    # ==========================================
    # Disler's Sandbox Methods
    # ==========================================

    @comprehensive_exception_handler
    def init_sandbox(
        self,
        timeout: int = 43200,
        template: Optional[str] = None,
        envs: Optional[Dict[str, str]] = None,
        metadata: Optional[Dict[str, str]] = None,
    ) -> str:
        """
        Initialize a new sandbox (mirrors sbx init command).

        Args:
            timeout: Timeout in seconds (default: 12 hours)
            template: Sandbox template name
            envs: Environment variables
            metadata: Custom metadata

        Returns:
            Sandbox ID

        @requirement: REQ-E2B-INIT-001
        """
        from e2b import Sandbox

        sandbox = Sandbox.create(
            template=template,
            timeout=timeout,
            envs=envs,
            metadata=metadata,
        )

        session_info = {
            "sandbox_id": sandbox.sandbox_id,
            "created_at": datetime.now().isoformat(),
            "template": template,
            "timeout": timeout,
            "status": "running",
        }

        self.active_sandboxes[sandbox.sandbox_id] = session_info
        logger.info(f"✅ Sandbox initialized: {sandbox.sandbox_id}")

        return sandbox.sandbox_id

    @comprehensive_exception_handler
    def exec_command(
        self,
        sandbox_id: str,
        command: str,
        cwd: Optional[str] = None,
        shell: bool = False,
        timeout: int = 60,
        background: bool = False,
        root: bool = False,
    ) -> Dict[str, Any]:
        """
        Execute command in sandbox (mirrors sbx exec).

        Args:
            sandbox_id: The sandbox ID
            command: Command to execute
            cwd: Working directory
            shell: Enable shell features (pipes, redirects)
            timeout: Timeout in seconds
            background: Run in background
            root: Run as root

        Returns:
            Execution result dictionary

        @requirement: REQ-E2B-EXEC-001
        """
        from e2b import Sandbox

        sandbox = Sandbox.connect(sandbox_id)

        if shell:
            result = sandbox.commands.run(
                command,
                timeout=timeout * 1000,
                cwd=cwd,
                user="root" if root else "user",
            )
        else:
            result = sandbox.commands.run(
                command,
                timeout=timeout * 1000,
                cwd=cwd,
                user="root" if root else "user",
            )

        return {
            "exit_code": result.exit_code,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "success": result.exit_code == 0,
        }

    @comprehensive_exception_handler
    def file_operations(
        self,
        sandbox_id: str,
        operation: str,
        path: str,
        content: Optional[str] = None,
        local_path: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Perform file operations in sandbox (mirrors sbx files).

        Args:
            sandbox_id: The sandbox ID
            operation: Operation type ('read', 'write', 'upload', 'download', 'ls', 'rm', 'mkdir')
            path: Remote path in sandbox
            content: Content for write operations
            local_path: Local path for upload/download

        Returns:
            Operation result dictionary

        @requirement: REQ-E2B-FILES-001
        """
        from e2b import Sandbox

        sandbox = Sandbox.connect(sandbox_id)

        if operation == "read":
            content = sandbox.files.read(path)
            return {"success": True, "content": content}

        elif operation == "write":
            sandbox.files.write(path, content or "")
            return {"success": True, "path": path}

        elif operation == "upload":
            with open(local_path, "rb") as f:
                sandbox.files.write(path, f.read())
            return {"success": True, "path": path}

        elif operation == "download":
            content = sandbox.files.read(path)
            with open(local_path, "wb") as f:
                f.write(content if isinstance(content, bytes) else content.encode())
            return {"success": True, "local_path": local_path}

        elif operation == "ls":
            files = sandbox.files.list(path)
            return {"success": True, "files": [f.name for f in files]}

        elif operation == "rm":
            sandbox.files.remove(path)
            return {"success": True, "path": path}

        elif operation == "mkdir":
            sandbox.files.make_dir(path)
            return {"success": True, "path": path}

        else:
            raise ValueError(f"Unknown operation: {operation}")

    @comprehensive_exception_handler
    def get_host_url(
        self,
        sandbox_id: str,
        port: int = 5173,
    ) -> str:
        """
        Get public URL for exposed port (mirrors sbx sandbox get-host).

        Args:
            sandbox_id: The sandbox ID
            port: Port number (default: 5173 for Vite)

        Returns:
            Public URL string

        @requirement: REQ-E2B-HOST-001
        """
        from e2b import Sandbox

        sandbox = Sandbox.connect(sandbox_id)
        host = sandbox.get_host(port)
        return f"https://{host}"

    # ==========================================
    # Full-Stack Methods
    # ==========================================

    @comprehensive_exception_handler
    def create_full_stack_sandbox(
        self,
        config: Optional[Dict[str, Any]] = None,
        tier: str = "standard",
    ) -> Dict[str, Any]:
        """
        Create full-stack sandbox (Vue+FastAPI+SQLite).

        Args:
            config: Custom configuration
            tier: Template tier ('standard', 'heavy', 'max')

        Returns:
            Session info with sandbox details

        @requirement: REQ-E2B-FULLSTACK-001
        """
        # Select template based on tier
        phase_map = {
            "lite": "full_stack_vue_fastapi",
            "standard": "full_stack_standard",
            "heavy": "full_stack_heavy",
            "max": "full_stack_max",
        }

        phase_name = phase_map.get(tier, "full_stack_vue_fastapi")
        phase_config = get_phase_config(phase_name)

        if not phase_config:
            raise ValueError(f"Unknown tier: {tier}")

        from e2b import Sandbox

        timeout_seconds = phase_config["timeout_minutes"] * 60

        sandbox = Sandbox.create(
            template=phase_config["template"],
            timeout=timeout_seconds,
            metadata={"tier": tier, "type": "full_stack"},
        )

        session_info = {
            "sandbox_id": sandbox.sandbox_id,
            "phase": phase_name,
            "tier": tier,
            "created_at": datetime.now().isoformat(),
            "config": phase_config,
            "frontend_port": phase_config.get("frontend_port", 5173),
            "backend_port": phase_config.get("backend_port", 8000),
            "status": "running",
        }

        self.active_sandboxes[sandbox.sandbox_id] = session_info

        logger.info(f"✅ Full-stack sandbox created: {sandbox.sandbox_id} (tier: {tier})")

        return session_info

    @comprehensive_exception_handler
    def run_playwright_tests(
        self,
        sandbox_id: str,
        test_url: str,
        test_actions: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Run Playwright browser tests in sandbox.

        Args:
            sandbox_id: The sandbox ID
            test_url: URL to test
            test_actions: List of actions to perform

        Returns:
            Test results dictionary

        @requirement: REQ-E2B-BROWSER-001
        """
        from e2b import Sandbox

        sandbox = Sandbox.connect(sandbox_id)

        # Initialize browser
        init_result = sandbox.commands.run(
            "cd /home/user && playwright install chromium",
            timeout=180000
        )

        if init_result.exit_code != 0:
            return {"success": False, "error": "Failed to initialize Playwright"}

        # Create test script
        test_script = f'''
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("{test_url}")
    page.screenshot(path="/home/user/screenshot.png")
    title = page.title()
    browser.close()
    print(f"Page title: {{title}}")
'''

        sandbox.files.write("/home/user/test_browser.py", test_script)

        # Run test
        result = sandbox.commands.run(
            "cd /home/user && python test_browser.py",
            timeout=60000
        )

        return {
            "success": result.exit_code == 0,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "screenshot_path": "/home/user/screenshot.png",
        }

    # ==========================================
    # Claude Code Execution
    # ==========================================

    @comprehensive_exception_handler
    def execute_claude_code(
        self,
        sandbox_id: str,
        prompt: str,
        timeout: int = 30000,
    ) -> Dict[str, Any]:
        """
        Execute Claude Code in sandbox (non-TTY safe).

        CRITICAL: Uses stdin redirect to prevent hanging.

        Args:
            sandbox_id: The sandbox ID
            prompt: Prompt for Claude
            timeout: Timeout in milliseconds

        Returns:
            Execution result

        @requirement: REQ-E2B-CLAUDE-001
        """
        from e2b import Sandbox

        sandbox = Sandbox.connect(sandbox_id)
        return execute_claude_in_sandbox(sandbox, prompt, timeout)

    # ==========================================
    # Utility Methods
    # ==========================================

    def _save_session(self, session_info: Dict[str, Any]) -> None:
        """Save session info to disk."""
        session_file = self.session_dir / f"session_{session_info['sandbox_id']}.json"
        with open(session_file, "w") as f:
            # Convert config to serializable format
            serializable = {k: v for k, v in session_info.items()}
            json.dump(serializable, f, indent=2, default=str)

    def list_active_sandboxes(self) -> List[Dict[str, Any]]:
        """List all active sandboxes."""
        return list(self.active_sandboxes.values())

    def get_sandbox_info(self, sandbox_id: str) -> Optional[Dict[str, Any]]:
        """Get info for a specific sandbox."""
        return self.active_sandboxes.get(sandbox_id)

    @staticmethod
    def list_available_phases() -> Dict[str, List[str]]:
        """List all available phases by type."""
        return {
            "adw": list_phases("adw"),
            "fullstack": list_phases("fullstack"),
            "browser": list_phases("browser"),
        }


if __name__ == "__main__":
    print("=== Unified E2B Manager ===\n")

    manager = UnifiedE2BManager()

    print("Available Phases:")
    for phase_type, phases in manager.list_available_phases().items():
        print(f"\n{phase_type.upper()}:")
        for phase in phases:
            config = get_phase_config(phase)
            print(f"  - {phase}: {config['purpose']}")

    print("\n\nZTE Agent Mappings:")
    for agent, phase in ZTE_SANDBOX_MAPPING.items():
        print(f"  {agent} -> {phase}")
