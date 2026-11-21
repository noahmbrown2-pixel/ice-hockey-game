#!/usr/bin/env python3
"""
ADW Integration Module - Merges ADW E2B framework with disler's sandbox_cli.

@requirement: REQ-E2B-UNIFIED-001
@blp_mapping: BLP-041-REPLICATE-PROD, BLP-051-SELF-ORGANIZE-DEPLOY

This module provides:
- Unified E2B manager combining ADW phase-based configs with sandbox_cli
- Non-TTY safe Claude Code execution in E2B environments
- Phase configurations for all ADW SDLC stages
"""

from .phase_configs import UNIFIED_PHASE_CONFIGS, get_phase_config, list_phases
from .unified_e2b_manager import UnifiedE2BManager
from .claude_code_executor import ClaudeCodeExecutor

__all__ = [
    "UNIFIED_PHASE_CONFIGS",
    "get_phase_config",
    "list_phases",
    "UnifiedE2BManager",
    "ClaudeCodeExecutor",
]
