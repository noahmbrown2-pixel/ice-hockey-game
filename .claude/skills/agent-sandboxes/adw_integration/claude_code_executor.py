#!/usr/bin/env python3
"""
Claude Code Executor - Non-TTY safe execution in E2B sandboxes.

@requirement: REQ-E2B-CLAUDE-EXEC-001
@blp_mapping: BLP-041-REPLICATE-PROD

CRITICAL DISCOVERY:
===================
Claude Code hangs in E2B sandboxes because E2B doesn't provide a TTY.
When absent, Claude Code waits for stdin input indefinitely.

SOLUTION:
- Always use stdin=subprocess.DEVNULL (Python) or < /dev/null (Bash)
- Use -p flag for non-interactive prompt mode
- Use --dangerously-skip-permissions to avoid permission prompts
- Use full path to claude binary: ~/.npm-global/bin/claude

This pattern was discovered in:
/home/craigmbrown/issue-97-tac-adw-project/adw_tests/sandbox_poc.py
"""

import json
import subprocess
import logging
from typing import Dict, Any, Optional, Union
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class OutputFormat(Enum):
    """Claude Code output format options."""
    TEXT = "text"
    JSON = "json"
    STREAM_JSON = "stream-json"


@dataclass
class ClaudeCodeResult:
    """Result from Claude Code execution."""
    success: bool
    exit_code: int
    stdout: str
    stderr: str
    result: Optional[str] = None
    cost_usd: Optional[float] = None
    duration_ms: Optional[int] = None
    error: Optional[str] = None


class ClaudeCodeExecutor:
    """
    Execute Claude Code safely in non-TTY E2B environments.

    @requirement: REQ-E2B-CLAUDE-EXEC-001
    @blp_mapping: BLP-041-REPLICATE-PROD

    CRITICAL: This class handles the non-TTY stdin issue that causes
    Claude Code to hang in E2B sandboxes.
    """

    # Default path where Claude Code is installed in E2B
    DEFAULT_CLAUDE_PATH = "~/.npm-global/bin/claude"

    # Installation command for Claude Code in E2B
    INSTALL_COMMAND = "npm config set prefix ~/.npm-global && npm install -g @anthropic-ai/claude-code"

    def __init__(
        self,
        claude_path: str = DEFAULT_CLAUDE_PATH,
        default_timeout: int = 30,
        output_format: OutputFormat = OutputFormat.JSON
    ):
        """
        Initialize Claude Code executor.

        Args:
            claude_path: Path to claude binary in sandbox
            default_timeout: Default timeout in seconds
            output_format: Default output format
        """
        self.claude_path = claude_path
        self.default_timeout = default_timeout
        self.output_format = output_format

        # REQ-E2B-CLAUDE-EXEC-001: Log initialization
        logger.info(f"ClaudeCodeExecutor initialized: path={claude_path}, timeout={default_timeout}")

    def build_command(
        self,
        prompt: str,
        output_format: Optional[OutputFormat] = None,
        skip_permissions: bool = True,
        working_dir: Optional[str] = None,
    ) -> str:
        """
        Build the Claude Code command string.

        Args:
            prompt: The prompt to send to Claude
            output_format: Output format (defaults to instance setting)
            skip_permissions: Whether to skip permission prompts
            working_dir: Working directory for the command

        Returns:
            Complete command string with non-TTY safe stdin redirect

        REQ-E2B-CLAUDE-EXEC-002: Command building
        """
        fmt = output_format or self.output_format

        # Build command parts
        parts = [self.claude_path]
        parts.append("-p")
        parts.append(f"'{prompt}'")
        parts.append(f"--output-format {fmt.value}")

        if skip_permissions:
            parts.append("--dangerously-skip-permissions")

        # CRITICAL: Redirect stdin from /dev/null to prevent hanging
        parts.append("< /dev/null")

        command = " ".join(parts)

        if working_dir:
            command = f"cd {working_dir} && {command}"

        return command

    def execute_in_sandbox(
        self,
        sandbox,
        prompt: str,
        timeout: Optional[int] = None,
        output_format: Optional[OutputFormat] = None,
        skip_permissions: bool = True,
        working_dir: Optional[str] = None,
    ) -> ClaudeCodeResult:
        """
        Execute Claude Code in an E2B sandbox.

        Args:
            sandbox: E2B Sandbox instance
            prompt: The prompt to send to Claude
            timeout: Timeout in milliseconds (default: self.default_timeout * 1000)
            output_format: Output format
            skip_permissions: Whether to skip permission prompts
            working_dir: Working directory

        Returns:
            ClaudeCodeResult with execution results

        REQ-E2B-CLAUDE-EXEC-003: Sandbox execution
        """
        try:
            command = self.build_command(
                prompt=prompt,
                output_format=output_format,
                skip_permissions=skip_permissions,
                working_dir=working_dir,
            )

            timeout_ms = (timeout or self.default_timeout) * 1000

            logger.info(f"Executing Claude Code in sandbox: {command[:100]}...")

            # Execute with shell=True to handle the < /dev/null redirect
            result = sandbox.commands.run(command, timeout=timeout_ms)

            # Parse result
            return self._parse_result(result, output_format or self.output_format)

        except Exception as e:
            logger.error(f"Claude Code execution failed: {e}")
            return ClaudeCodeResult(
                success=False,
                exit_code=-1,
                stdout="",
                stderr=str(e),
                error=str(e),
            )

    def execute_locally(
        self,
        prompt: str,
        timeout: Optional[int] = None,
        output_format: Optional[OutputFormat] = None,
        skip_permissions: bool = True,
        working_dir: Optional[str] = None,
    ) -> ClaudeCodeResult:
        """
        Execute Claude Code locally using subprocess.

        CRITICAL: Uses stdin=subprocess.DEVNULL to prevent hanging.

        Args:
            prompt: The prompt to send to Claude
            timeout: Timeout in seconds
            output_format: Output format
            skip_permissions: Whether to skip permission prompts
            working_dir: Working directory

        Returns:
            ClaudeCodeResult with execution results

        REQ-E2B-CLAUDE-EXEC-004: Local execution with non-TTY safety
        """
        try:
            fmt = output_format or self.output_format

            # Build command as list for subprocess
            cmd = [
                self.claude_path,
                "-p", prompt,
                "--output-format", fmt.value,
            ]

            if skip_permissions:
                cmd.append("--dangerously-skip-permissions")

            logger.info(f"Executing Claude Code locally: {cmd}")

            # CRITICAL: stdin=subprocess.DEVNULL prevents hanging in non-TTY
            result = subprocess.run(
                cmd,
                stdin=subprocess.DEVNULL,  # <-- CRITICAL for non-TTY
                capture_output=True,
                text=True,
                timeout=timeout or self.default_timeout,
                cwd=working_dir,
            )

            return self._parse_subprocess_result(result, fmt)

        except subprocess.TimeoutExpired:
            logger.error("Claude Code execution timed out")
            return ClaudeCodeResult(
                success=False,
                exit_code=-1,
                stdout="",
                stderr="Execution timed out",
                error="Execution timed out",
            )
        except Exception as e:
            logger.error(f"Claude Code execution failed: {e}")
            return ClaudeCodeResult(
                success=False,
                exit_code=-1,
                stdout="",
                stderr=str(e),
                error=str(e),
            )

    def _parse_result(
        self,
        result,
        output_format: OutputFormat
    ) -> ClaudeCodeResult:
        """
        Parse E2B command result into ClaudeCodeResult.

        REQ-E2B-CLAUDE-EXEC-005: Result parsing
        """
        success = result.exit_code == 0
        stdout = result.stdout or ""
        stderr = result.stderr or ""

        # Parse JSON output if applicable
        parsed_result = None
        cost_usd = None
        duration_ms = None

        if output_format == OutputFormat.JSON and stdout:
            try:
                data = json.loads(stdout)
                parsed_result = data.get("result")
                cost_usd = data.get("total_cost_usd")
                duration_ms = data.get("duration_ms")
            except json.JSONDecodeError:
                parsed_result = stdout

        return ClaudeCodeResult(
            success=success,
            exit_code=result.exit_code,
            stdout=stdout,
            stderr=stderr,
            result=parsed_result or stdout,
            cost_usd=cost_usd,
            duration_ms=duration_ms,
        )

    def _parse_subprocess_result(
        self,
        result: subprocess.CompletedProcess,
        output_format: OutputFormat
    ) -> ClaudeCodeResult:
        """
        Parse subprocess result into ClaudeCodeResult.

        REQ-E2B-CLAUDE-EXEC-006: Subprocess result parsing
        """
        success = result.returncode == 0
        stdout = result.stdout or ""
        stderr = result.stderr or ""

        # Parse JSON output if applicable
        parsed_result = None
        cost_usd = None
        duration_ms = None

        if output_format == OutputFormat.JSON and stdout:
            try:
                data = json.loads(stdout)
                parsed_result = data.get("result")
                cost_usd = data.get("total_cost_usd")
                duration_ms = data.get("duration_ms")
            except json.JSONDecodeError:
                parsed_result = stdout

        return ClaudeCodeResult(
            success=success,
            exit_code=result.returncode,
            stdout=stdout,
            stderr=stderr,
            result=parsed_result or stdout,
            cost_usd=cost_usd,
            duration_ms=duration_ms,
        )

    @staticmethod
    def get_install_commands() -> Dict[str, str]:
        """
        Get commands for installing Claude Code in E2B sandbox.

        Returns:
            Dictionary with setup commands

        REQ-E2B-CLAUDE-EXEC-007: Installation commands
        """
        return {
            "setup_npm": "npm config set prefix ~/.npm-global",
            "install_claude": "npm install -g @anthropic-ai/claude-code",
            "verify": "~/.npm-global/bin/claude --version",
            "full_install": "npm config set prefix ~/.npm-global && npm install -g @anthropic-ai/claude-code",
        }


def execute_claude_in_sandbox(
    sandbox,
    prompt: str,
    timeout: int = 30000,
    output_format: str = "json",
) -> Dict[str, Any]:
    """
    Convenience function to execute Claude Code in a sandbox.

    CRITICAL: This function handles the non-TTY stdin issue.

    Args:
        sandbox: E2B Sandbox instance
        prompt: The prompt to send to Claude
        timeout: Timeout in milliseconds
        output_format: Output format ('text', 'json', 'stream-json')

    Returns:
        Dictionary with exit_code, stdout, stderr, and parsed result

    REQ-E2B-CLAUDE-EXEC-008: Convenience function
    """
    # Build command with stdin redirect
    command = (
        f"~/.npm-global/bin/claude -p '{prompt}' "
        f"--output-format {output_format} "
        f"--dangerously-skip-permissions < /dev/null"
    )

    result = sandbox.commands.run(command, timeout=timeout)

    response = {
        "exit_code": result.exit_code,
        "stdout": result.stdout,
        "stderr": result.stderr,
        "success": result.exit_code == 0,
    }

    # Parse JSON if applicable
    if output_format == "json" and result.stdout:
        try:
            data = json.loads(result.stdout)
            response["result"] = data.get("result")
            response["cost_usd"] = data.get("total_cost_usd")
            response["duration_ms"] = data.get("duration_ms")
        except json.JSONDecodeError:
            response["result"] = result.stdout

    return response


if __name__ == "__main__":
    # Example usage demonstration
    print("=== Claude Code Executor ===\n")
    print("CRITICAL: This executor handles the non-TTY stdin issue in E2B sandboxes.\n")

    executor = ClaudeCodeExecutor()

    print("Build command example:")
    cmd = executor.build_command("What is 2+2?")
    print(f"  {cmd}\n")

    print("Install commands:")
    for name, cmd in ClaudeCodeExecutor.get_install_commands().items():
        print(f"  {name}: {cmd}")
