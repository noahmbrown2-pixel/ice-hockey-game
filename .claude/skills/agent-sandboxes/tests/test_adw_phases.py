#!/usr/bin/env python3
"""
ADW Phase Integration Tests.

@requirement: REQ-E2B-ADW-TEST-001
@blp_mapping: BLP-041-REPLICATE-PROD

Tests for ADW (Automated Development Workflow) phase-specific functionality.
"""

import os
import sys
import pytest
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from adw_integration.phase_configs import (
    UNIFIED_PHASE_CONFIGS,
    PHASE_REQUIREMENT_REGISTRY,
    get_phase_config,
    list_phases,
    get_phase_for_agent,
    ZTE_SANDBOX_MAPPING,
)


class TestADWPhaseConfigs:
    """Test ADW phase configuration completeness."""

    def test_all_adw_phases_have_requirements(self):
        """Test that all ADW phases have requirement mappings."""
        adw_phases = list_phases("adw")

        for phase in adw_phases:
            config = get_phase_config(phase)
            assert "requirements" in config, f"Missing requirements in {phase}"
            assert len(config["requirements"]) > 0, f"Empty requirements in {phase}"

    def test_adw_phase_tools_defined(self):
        """Test that all ADW phases have tools defined."""
        adw_phases = list_phases("adw")

        for phase in adw_phases:
            config = get_phase_config(phase)
            assert "tools" in config, f"Missing tools in {phase}"
            assert len(config["tools"]) > 0, f"Empty tools in {phase}"
            # All ADW phases should have git
            assert "git" in config["tools"], f"Missing git in {phase}"

    def test_adw_phase_workspaces(self):
        """Test that all ADW phases have workspace defined."""
        adw_phases = list_phases("adw")

        for phase in adw_phases:
            config = get_phase_config(phase)
            assert "workspace" in config, f"Missing workspace in {phase}"
            assert config["workspace"].startswith("~"), f"Invalid workspace in {phase}"

    def test_adw_phase_timeouts(self):
        """Test that ADW phase timeouts are reasonable."""
        adw_phases = list_phases("adw")

        for phase in adw_phases:
            config = get_phase_config(phase)
            timeout = config["timeout_minutes"]
            assert timeout >= 30, f"Timeout too short in {phase}: {timeout}m"
            assert timeout <= 120, f"Timeout too long in {phase}: {timeout}m"

    def test_requirement_registry_coverage(self):
        """Test that requirement registry covers all ADW phases."""
        all_phases_in_registry = set()

        for req_id, req_info in PHASE_REQUIREMENT_REGISTRY.items():
            if "adw" in str(req_info.get("phases", [])):
                all_phases_in_registry.update(req_info.get("phases", []))

        adw_phases = set(list_phases("adw"))
        assert adw_phases.issubset(all_phases_in_registry), \
            f"Some ADW phases not in registry: {adw_phases - all_phases_in_registry}"


class TestZTEAgentMapping:
    """Test ZTE agent to phase mapping."""

    def test_all_agents_mapped(self):
        """Test that all standard agents have mappings."""
        expected_agents = [
            "design_agent",
            "implementation_agent",
            "testing_agent",
            "deployment_agent",
            "operations_agent",
        ]

        for agent in expected_agents:
            assert agent in ZTE_SANDBOX_MAPPING, f"Missing mapping for {agent}"

    def test_mappings_valid_phases(self):
        """Test that all mapped phases exist."""
        for agent, phase in ZTE_SANDBOX_MAPPING.items():
            config = get_phase_config(phase)
            assert config is not None, f"Invalid phase {phase} for agent {agent}"

    def test_mapping_to_adw_phases_only(self):
        """Test that agents map to ADW phases only."""
        adw_phases = set(list_phases("adw"))

        for agent, phase in ZTE_SANDBOX_MAPPING.items():
            assert phase in adw_phases, f"Agent {agent} maps to non-ADW phase {phase}"

    def test_get_phase_for_agent_function(self):
        """Test get_phase_for_agent returns correct mappings."""
        for agent, expected_phase in ZTE_SANDBOX_MAPPING.items():
            result = get_phase_for_agent(agent)
            assert result == expected_phase, f"Mismatch for {agent}"

    def test_get_phase_for_unknown_agent(self):
        """Test get_phase_for_agent handles unknown agents."""
        result = get_phase_for_agent("nonexistent_agent")
        assert result is None


class TestADWPhaseDeployment:
    """Test ADW phase deployment functionality."""

    @pytest.fixture
    def mock_sandbox(self):
        """Create a mock E2B sandbox."""
        sandbox = Mock()
        sandbox.sandbox_id = "sbx_adw_test"
        sandbox.commands = Mock()
        sandbox.files = Mock()

        cmd_result = Mock()
        cmd_result.exit_code = 0
        cmd_result.stdout = "Success"
        cmd_result.stderr = ""
        sandbox.commands.run = Mock(return_value=cmd_result)

        return sandbox

    @patch("adw_integration.unified_e2b_manager.Sandbox")
    def test_create_adw_phase_sandbox(self, mock_sandbox_class, mock_sandbox):
        """Test creating ADW phase sandbox."""
        mock_sandbox_class.create.return_value = mock_sandbox

        from adw_integration.unified_e2b_manager import UnifiedE2BManager

        manager = UnifiedE2BManager()
        session = manager.create_adw_phase_sandbox(
            phase_name="adw_build_iso",
            issue_number="123",
            adw_id="ADW-TEST-001",
        )

        assert session["sandbox_id"] == "sbx_adw_test"
        assert session["phase"] == "adw_build_iso"
        assert session["issue_number"] == "123"
        assert session["adw_id"] == "ADW-TEST-001"
        assert "config" in session
        assert session["status"] == "created"

    @patch("adw_integration.unified_e2b_manager.Sandbox")
    def test_create_adw_phase_invalid(self, mock_sandbox_class):
        """Test creating sandbox with invalid phase."""
        from adw_integration.unified_e2b_manager import UnifiedE2BManager

        manager = UnifiedE2BManager()

        with pytest.raises(ValueError) as exc_info:
            manager.create_adw_phase_sandbox(
                phase_name="invalid_phase",
                issue_number="123",
                adw_id="ADW-TEST-001",
            )

        assert "Unknown phase" in str(exc_info.value)

    @patch("adw_integration.unified_e2b_manager.Sandbox")
    def test_setup_adw_environment(self, mock_sandbox_class, mock_sandbox):
        """Test setting up ADW environment."""
        mock_sandbox_class.connect.return_value = mock_sandbox

        from adw_integration.unified_e2b_manager import UnifiedE2BManager

        manager = UnifiedE2BManager()
        success = manager.setup_adw_environment("sbx_adw_test", "adw_build_iso")

        # Should have called commands.run for tool installation
        assert mock_sandbox.commands.run.called
        assert success is True

    @patch("adw_integration.unified_e2b_manager.Sandbox")
    def test_deploy_adw_phase_complete(self, mock_sandbox_class, mock_sandbox):
        """Test complete ADW phase deployment."""
        mock_sandbox_class.create.return_value = mock_sandbox
        mock_sandbox_class.connect.return_value = mock_sandbox

        from adw_integration.unified_e2b_manager import UnifiedE2BManager

        manager = UnifiedE2BManager()
        session = manager.deploy_adw_phase(
            phase_name="adw_test_iso",
            issue_number="456",
            adw_id="ADW-TEST-002",
        )

        assert session["sandbox_id"] == "sbx_adw_test"
        assert session["phase"] == "adw_test_iso"
        assert "setup_success" in session
        assert session["status"] in ["ready", "partial"]


class TestADWPhaseIntegrationWithExisting:
    """Test integration with existing ADW E2B framework."""

    def test_phase_configs_match_existing(self):
        """Test that phase configs match existing ADW framework patterns."""
        # These phases should match the ones in adw_e2b_integration_framework.py
        existing_phases = [
            "adw_plan_iso",
            "adw_build_iso",
            "adw_test_iso",
            "adw_review_iso",
            "adw_document_iso",
            "adw_ship_iso",
            "adw_deploy_prod_zte",
        ]

        for phase in existing_phases:
            config = get_phase_config(phase)
            assert config is not None, f"Phase {phase} missing from unified configs"
            assert config["template"] == "base", f"Phase {phase} should use 'base' template"

    def test_requirement_ids_format(self):
        """Test that requirement IDs follow the existing format."""
        for phase_name, config in UNIFIED_PHASE_CONFIGS.items():
            if config.get("phase_type") == "adw":
                for req_id in config.get("requirements", []):
                    assert req_id.startswith("REQ-E2B-"), \
                        f"Invalid requirement format in {phase_name}: {req_id}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
