#!/usr/bin/env python3
"""
Integration tests for Agent Sandboxes skill.

@requirement: REQ-E2B-TEST-001
@blp_mapping: BLP-041-REPLICATE-PROD

These tests verify:
- ADW phase sandbox creation and setup
- Full-stack sandbox deployment
- Claude Code execution in non-TTY environments
- File operations and command execution
- Browser automation capabilities

Note: Tests that create actual E2B sandboxes require E2B_API_KEY.
Run with: pytest test_sandbox_integration.py -v
"""

import os
import sys
import json
import pytest
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from adw_integration.phase_configs import (
    UNIFIED_PHASE_CONFIGS,
    get_phase_config,
    list_phases,
    get_phase_for_agent,
    get_tool_installation_commands,
    ZTE_SANDBOX_MAPPING,
)
from adw_integration.claude_code_executor import (
    ClaudeCodeExecutor,
    ClaudeCodeResult,
    OutputFormat,
)


# ============================================
# Phase Configuration Tests
# ============================================

class TestPhaseConfigs:
    """Test phase configuration functionality."""

    def test_unified_configs_not_empty(self):
        """Test that UNIFIED_PHASE_CONFIGS contains entries."""
        assert len(UNIFIED_PHASE_CONFIGS) > 0

    def test_adw_phases_exist(self):
        """Test that all ADW phases are defined."""
        adw_phases = [
            "adw_plan_iso",
            "adw_build_iso",
            "adw_test_iso",
            "adw_review_iso",
            "adw_document_iso",
            "adw_ship_iso",
            "adw_deploy_prod_zte",
        ]
        for phase in adw_phases:
            assert phase in UNIFIED_PHASE_CONFIGS, f"Missing ADW phase: {phase}"

    def test_fullstack_phases_exist(self):
        """Test that full-stack phases are defined."""
        fullstack_phases = [
            "full_stack_vue_fastapi",
            "full_stack_standard",
            "full_stack_heavy",
            "full_stack_max",
        ]
        for phase in fullstack_phases:
            assert phase in UNIFIED_PHASE_CONFIGS, f"Missing fullstack phase: {phase}"

    def test_browser_phases_exist(self):
        """Test that browser testing phases are defined."""
        browser_phases = ["browser_testing", "browser_validation"]
        for phase in browser_phases:
            assert phase in UNIFIED_PHASE_CONFIGS, f"Missing browser phase: {phase}"

    def test_get_phase_config(self):
        """Test get_phase_config returns correct data."""
        config = get_phase_config("adw_build_iso")
        assert config is not None
        assert "template" in config
        assert "tools" in config
        assert "timeout_minutes" in config
        assert config["phase_type"] == "adw"

    def test_get_phase_config_unknown(self):
        """Test get_phase_config returns None for unknown phase."""
        config = get_phase_config("unknown_phase")
        assert config is None

    def test_list_phases_all(self):
        """Test list_phases returns all phases."""
        all_phases = list_phases()
        assert len(all_phases) > 0
        assert "adw_build_iso" in all_phases
        assert "full_stack_vue_fastapi" in all_phases

    def test_list_phases_by_type(self):
        """Test list_phases filters by type."""
        adw_phases = list_phases("adw")
        assert all("adw" in phase for phase in adw_phases)

        fullstack_phases = list_phases("fullstack")
        assert all("full_stack" in phase for phase in fullstack_phases)

    def test_zte_agent_mapping(self):
        """Test ZTE agent to phase mapping."""
        assert ZTE_SANDBOX_MAPPING["design_agent"] == "adw_plan_iso"
        assert ZTE_SANDBOX_MAPPING["implementation_agent"] == "adw_build_iso"
        assert ZTE_SANDBOX_MAPPING["testing_agent"] == "adw_test_iso"

    def test_get_phase_for_agent(self):
        """Test get_phase_for_agent function."""
        assert get_phase_for_agent("design_agent") == "adw_plan_iso"
        assert get_phase_for_agent("unknown_agent") is None

    def test_tool_installation_commands(self):
        """Test tool installation commands are defined."""
        commands = get_tool_installation_commands()
        assert "git" in commands
        assert "nodejs" in commands
        assert "python3" in commands
        assert "playwright" in commands

    def test_phase_config_structure(self):
        """Test that all phase configs have required fields."""
        required_fields = ["template", "purpose", "tools", "timeout_minutes", "phase_type"]

        for phase_name, config in UNIFIED_PHASE_CONFIGS.items():
            for field in required_fields:
                assert field in config, f"Missing {field} in {phase_name}"


# ============================================
# Claude Code Executor Tests
# ============================================

class TestClaudeCodeExecutor:
    """Test Claude Code executor functionality."""

    def test_executor_initialization(self):
        """Test executor initializes with defaults."""
        executor = ClaudeCodeExecutor()
        assert executor.claude_path == ClaudeCodeExecutor.DEFAULT_CLAUDE_PATH
        assert executor.default_timeout == 30
        assert executor.output_format == OutputFormat.JSON

    def test_executor_custom_init(self):
        """Test executor initializes with custom values."""
        executor = ClaudeCodeExecutor(
            claude_path="/custom/path/claude",
            default_timeout=60,
            output_format=OutputFormat.TEXT,
        )
        assert executor.claude_path == "/custom/path/claude"
        assert executor.default_timeout == 60
        assert executor.output_format == OutputFormat.TEXT

    def test_build_command_basic(self):
        """Test command building with basic prompt."""
        executor = ClaudeCodeExecutor()
        cmd = executor.build_command("What is 2+2?")

        assert "~/.npm-global/bin/claude" in cmd
        assert "-p" in cmd
        assert "'What is 2+2?'" in cmd
        assert "--output-format json" in cmd
        assert "--dangerously-skip-permissions" in cmd
        assert "< /dev/null" in cmd

    def test_build_command_text_format(self):
        """Test command building with text format."""
        executor = ClaudeCodeExecutor()
        cmd = executor.build_command("test", output_format=OutputFormat.TEXT)

        assert "--output-format text" in cmd

    def test_build_command_with_working_dir(self):
        """Test command building with working directory."""
        executor = ClaudeCodeExecutor()
        cmd = executor.build_command("test", working_dir="/home/user/project")

        assert "cd /home/user/project &&" in cmd

    def test_build_command_no_skip_permissions(self):
        """Test command building without skip permissions."""
        executor = ClaudeCodeExecutor()
        cmd = executor.build_command("test", skip_permissions=False)

        assert "--dangerously-skip-permissions" not in cmd

    def test_stdin_redirect_present(self):
        """Test that stdin redirect is always present (CRITICAL)."""
        executor = ClaudeCodeExecutor()
        cmd = executor.build_command("test")

        # CRITICAL: This must always be present to prevent hanging
        assert "< /dev/null" in cmd

    def test_install_commands(self):
        """Test install commands are defined."""
        commands = ClaudeCodeExecutor.get_install_commands()

        assert "setup_npm" in commands
        assert "install_claude" in commands
        assert "verify" in commands
        assert "full_install" in commands


# ============================================
# Mock E2B Sandbox Tests
# ============================================

class TestUnifiedE2BManagerMocked:
    """Test UnifiedE2BManager with mocked E2B SDK."""

    @pytest.fixture
    def mock_sandbox(self):
        """Create a mock E2B sandbox."""
        sandbox = Mock()
        sandbox.sandbox_id = "sbx_test_123"
        sandbox.commands = Mock()
        sandbox.files = Mock()
        sandbox.get_host = Mock(return_value="5173-sbx_test_123.e2b.dev")

        # Mock command result
        cmd_result = Mock()
        cmd_result.exit_code = 0
        cmd_result.stdout = "Success"
        cmd_result.stderr = ""
        sandbox.commands.run = Mock(return_value=cmd_result)

        return sandbox

    @patch("adw_integration.unified_e2b_manager.Sandbox")
    def test_init_sandbox(self, mock_sandbox_class, mock_sandbox):
        """Test sandbox initialization."""
        mock_sandbox_class.create.return_value = mock_sandbox

        from adw_integration.unified_e2b_manager import UnifiedE2BManager

        manager = UnifiedE2BManager()
        sandbox_id = manager.init_sandbox(timeout=43200)

        assert sandbox_id == "sbx_test_123"
        mock_sandbox_class.create.assert_called_once()

    @patch("adw_integration.unified_e2b_manager.Sandbox")
    def test_exec_command(self, mock_sandbox_class, mock_sandbox):
        """Test command execution."""
        mock_sandbox_class.connect.return_value = mock_sandbox

        from adw_integration.unified_e2b_manager import UnifiedE2BManager

        manager = UnifiedE2BManager()
        result = manager.exec_command("sbx_test_123", "echo hello")

        assert result["success"] is True
        assert result["exit_code"] == 0
        mock_sandbox.commands.run.assert_called()

    @patch("adw_integration.unified_e2b_manager.Sandbox")
    def test_get_host_url(self, mock_sandbox_class, mock_sandbox):
        """Test getting host URL."""
        mock_sandbox_class.connect.return_value = mock_sandbox

        from adw_integration.unified_e2b_manager import UnifiedE2BManager

        manager = UnifiedE2BManager()
        url = manager.get_host_url("sbx_test_123", port=5173)

        assert "https://" in url
        assert "e2b.dev" in url


# ============================================
# Skill Registration Tests
# ============================================

class TestSkillRegistration:
    """Test skill registration functionality."""

    def test_skill_metadata_complete(self):
        """Test that skill metadata is complete."""
        from register_skill import AGENT_SANDBOXES_METADATA

        required_fields = [
            "skill_name",
            "version",
            "description",
            "blp_properties",
            "dependencies",
            "integration_points",
            "compute_advantage_target",
        ]

        for field in required_fields:
            assert field in AGENT_SANDBOXES_METADATA, f"Missing field: {field}"

    def test_skill_blp_properties(self):
        """Test that BLP properties are defined."""
        from register_skill import AGENT_SANDBOXES_METADATA

        blp_props = AGENT_SANDBOXES_METADATA["blp_properties"]
        assert len(blp_props) >= 5
        assert all(prop.startswith("REQ-BLP-") for prop in blp_props)

    def test_skill_adw_phases(self):
        """Test that ADW phases are listed."""
        from register_skill import AGENT_SANDBOXES_METADATA

        adw_phases = AGENT_SANDBOXES_METADATA["adw_phases"]
        assert "adw_build_iso" in adw_phases
        assert "adw_deploy_prod_zte" in adw_phases

    def test_skill_zte_agent_mapping(self):
        """Test that ZTE agent mapping is defined."""
        from register_skill import AGENT_SANDBOXES_METADATA

        mapping = AGENT_SANDBOXES_METADATA["zte_agent_mapping"]
        assert mapping["design_agent"] == "adw_plan_iso"


# ============================================
# Integration Tests (require E2B_API_KEY)
# ============================================

@pytest.mark.skipif(
    not os.getenv("E2B_API_KEY"),
    reason="E2B_API_KEY not set - skipping live tests"
)
class TestLiveE2BSandbox:
    """Live integration tests requiring E2B_API_KEY."""

    @pytest.fixture
    def manager(self):
        """Create UnifiedE2BManager for tests."""
        from adw_integration.unified_e2b_manager import UnifiedE2BManager
        return UnifiedE2BManager()

    @pytest.mark.asyncio
    async def test_create_sandbox(self, manager):
        """Test creating a real sandbox."""
        sandbox_id = manager.init_sandbox(timeout=300)  # 5 min timeout
        assert sandbox_id is not None
        assert sandbox_id.startswith("sbx_")

        # Clean up
        from e2b import Sandbox
        Sandbox.kill(sandbox_id)

    @pytest.mark.asyncio
    async def test_exec_in_sandbox(self, manager):
        """Test executing command in sandbox."""
        sandbox_id = manager.init_sandbox(timeout=300)

        try:
            result = manager.exec_command(sandbox_id, "echo 'Hello, E2B!'")
            assert result["success"] is True
            assert "Hello, E2B!" in result["stdout"]
        finally:
            from e2b import Sandbox
            Sandbox.kill(sandbox_id)

    @pytest.mark.asyncio
    async def test_file_operations(self, manager):
        """Test file operations in sandbox."""
        sandbox_id = manager.init_sandbox(timeout=300)

        try:
            # Write file
            result = manager.file_operations(
                sandbox_id,
                "write",
                "/home/user/test.txt",
                content="Test content"
            )
            assert result["success"] is True

            # Read file
            result = manager.file_operations(
                sandbox_id,
                "read",
                "/home/user/test.txt"
            )
            assert result["success"] is True
            assert "Test content" in result["content"]
        finally:
            from e2b import Sandbox
            Sandbox.kill(sandbox_id)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
