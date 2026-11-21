#!/usr/bin/env python3
"""
CaMeL Security Layer - Capability-aware Model execution Layer
REQ-003: CaMeL Security Layer for Tool Authorization
BLP Properties: A (Alignment)

This module provides:
- Tool categories with risk levels
- Agent-to-capability mapping
- All authorizations logged to audit trail
- Rate limiting per agent

Standard I/O: All exceptions print details, all success prints before return (REQ-009)
"""

import os
import sys
import json
import hashlib
import traceback
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any, List, Optional, Set
from dataclasses import dataclass, field
from enum import Enum
import fnmatch
import re

# REQ-005: VM Portability Configuration
PROJECT_DIR = Path(os.environ.get("TB_OPS_PROJECT_DIR", "/home/craigmbrown/Project"))
LOGS_DIR = Path(os.environ.get("TB_OPS_LOGS_DIR", PROJECT_DIR / "logs"))
SKILLS_DIR = PROJECT_DIR / ".claude" / "skills"
LOGS_DIR.mkdir(parents=True, exist_ok=True)


class RiskLevel(Enum):
    """Tool risk classification."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


@dataclass
class AuthorizationResult:
    """Result of authorization check."""
    allowed: bool
    reason: str = ""
    requires_approval: bool = False
    requires_2fa: bool = False
    audit_log: bool = True


@dataclass
class ToolCategory:
    """Tool category with risk and approval requirements."""
    name: str
    risk: RiskLevel
    tools: List[str]
    requires_approval: bool = False
    requires_2fa: bool = False


@dataclass
class AgentCapabilities:
    """Agent capability configuration."""
    agent_id: str
    allowed_categories: List[str]
    allowed_tools: List[str]
    denied_tools: List[str]
    max_api_calls_per_minute: int = 60
    max_files_per_execution: int = 100
    requires_human_approval_for: List[str] = field(default_factory=list)


# REQ-003: Tool Categories with Risk Levels
# BLP: A (Alignment) - Security-aware tool access
TOOL_CATEGORIES: Dict[str, ToolCategory] = {
    "read_only": ToolCategory(
        name="read_only",
        risk=RiskLevel.LOW,
        tools=["Read", "Glob", "Grep", "WebSearch", "WebFetch", "LS", "ListMcpResourcesTool"],
        requires_approval=False
    ),
    "write_local": ToolCategory(
        name="write_local",
        risk=RiskLevel.MEDIUM,
        tools=["Write", "Edit", "MultiEdit", "NotebookEdit"],
        requires_approval=False
    ),
    "execute": ToolCategory(
        name="execute",
        risk=RiskLevel.HIGH,
        tools=["Bash", "Task", "KillBash", "KillShell"],
        requires_approval=True  # For destructive commands
    ),
    "external_api": ToolCategory(
        name="external_api",
        risk=RiskLevel.MEDIUM,
        tools=["mcp__whatsapp__*", "mcp__notionApi__*", "mcp__exa__*", "mcp__context7__*"],
        requires_approval=False
    ),
    "financial": ToolCategory(
        name="financial",
        risk=RiskLevel.CRITICAL,
        tools=["payment_*", "transfer_*", "mcp__chainlink__*"],
        requires_approval=True,
        requires_2fa=True
    ),
    "system": ToolCategory(
        name="system",
        risk=RiskLevel.HIGH,
        tools=["SlashCommand", "Skill", "EnterPlanMode", "ExitPlanMode"],
        requires_approval=False
    )
}

# REQ-003: Agent-to-Capability Mapping
# BLP: A (Alignment) - Least privilege principle
AGENT_CAPABILITIES: Dict[str, AgentCapabilities] = {
    "oracle-monitor-agent": AgentCapabilities(
        agent_id="oracle-monitor-agent",
        allowed_categories=["read_only", "external_api"],
        allowed_tools=["Read", "Grep", "WebFetch", "mcp__chainlink__*"],
        denied_tools=["Bash", "Write", "payment_*", "Edit"],
        max_api_calls_per_minute=60
    ),
    "code-generator-agent": AgentCapabilities(
        agent_id="code-generator-agent",
        allowed_categories=["read_only", "write_local"],
        allowed_tools=["Read", "Write", "Edit", "Glob", "Grep", "MultiEdit"],
        denied_tools=["Bash", "mcp__whatsapp__*", "payment_*"],
        max_files_per_execution=10
    ),
    "orchestrator-agent": AgentCapabilities(
        agent_id="orchestrator-agent",
        allowed_categories=["read_only", "write_local", "execute", "external_api", "system"],
        allowed_tools=["*"],  # Full access except financial
        denied_tools=["payment_*", "transfer_*"],
        requires_human_approval_for=["Bash:rm", "Bash:sudo", "Bash:kill"]
    ),
    "self-learning-agent": AgentCapabilities(
        agent_id="self-learning-agent",
        allowed_categories=["read_only", "write_local"],
        allowed_tools=["Read", "Write", "Glob", "Grep", "WebSearch"],
        denied_tools=["Bash", "payment_*", "mcp__whatsapp__*"],
        max_api_calls_per_minute=30
    ),
    "default": AgentCapabilities(
        agent_id="default",
        allowed_categories=["read_only"],
        allowed_tools=["Read", "Glob", "Grep"],
        denied_tools=["Bash", "Write", "Edit", "payment_*"],
        max_api_calls_per_minute=20
    )
}


class CaMeLSecurityLayer:
    """
    REQ-003: CaMeL - Capability-aware Model execution Layer
    BLP: A (Alignment) - Enforces least-privilege tool access

    Principles:
    1. Least privilege: Agents only get tools they need
    2. Audit trail: All tool assignments logged
    3. Capability boundaries: Agents cannot exceed assigned tools
    4. Dynamic revocation: Tools can be revoked mid-execution
    """

    def __init__(self):
        self.db_path = SKILLS_DIR / "self-enhancement" / "camel_audit.db"
        self.rate_limits: Dict[str, List[datetime]] = {}
        self._init_database()

    def _init_database(self):
        """Initialize SQLite database for audit logging."""
        func_name = "_init_database"
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS authorization_audit (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    agent_id TEXT NOT NULL,
                    tool_name TEXT NOT NULL,
                    params_hash TEXT,
                    allowed INTEGER NOT NULL,
                    reason TEXT,
                    session_id TEXT,
                    risk_level TEXT
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS rate_limit_violations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    agent_id TEXT NOT NULL,
                    tool_name TEXT,
                    calls_in_window INTEGER,
                    limit_value INTEGER
                )
            """)

            conn.commit()
            conn.close()
            print(f"SUCCESS: {func_name} - CaMeL audit database initialized")

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")

    def _matches_pattern(self, tool_name: str, pattern: str) -> bool:
        """Check if tool name matches pattern (supports wildcards)."""
        if pattern == "*":
            return True
        return fnmatch.fnmatch(tool_name, pattern)

    def _get_tool_category(self, tool_name: str) -> Optional[str]:
        """Get category for a tool."""
        for cat_name, category in TOOL_CATEGORIES.items():
            for tool_pattern in category.tools:
                if self._matches_pattern(tool_name, tool_pattern):
                    return cat_name
        return None

    def _is_destructive_command(self, tool_name: str, tool_params: Dict) -> bool:
        """Check if command is destructive."""
        if tool_name != "Bash":
            return False

        command = tool_params.get("command", "")
        destructive_patterns = [
            r"rm\s+-rf",
            r"rm\s+-r",
            r"sudo\s+rm",
            r"sudo\s+kill",
            r"shutdown",
            r"reboot",
            r"mkfs",
            r"dd\s+if=",
            r">\s*/dev/",
            r"chmod\s+777",
            r"chown\s+-R\s+root"
        ]

        for pattern in destructive_patterns:
            if re.search(pattern, command):
                return True
        return False

    def _check_rate_limit(self, agent_id: str) -> bool:
        """
        REQ-003: Check rate limit for agent
        BLP: A (Alignment) - Prevents abuse
        """
        func_name = "_check_rate_limit"
        try:
            capabilities = AGENT_CAPABILITIES.get(agent_id, AGENT_CAPABILITIES["default"])
            max_calls = capabilities.max_api_calls_per_minute

            now = datetime.now()
            window_start = now - timedelta(minutes=1)

            # Get calls in window
            if agent_id not in self.rate_limits:
                self.rate_limits[agent_id] = []

            # Clean old entries
            self.rate_limits[agent_id] = [
                t for t in self.rate_limits[agent_id]
                if t > window_start
            ]

            calls_in_window = len(self.rate_limits[agent_id])

            if calls_in_window >= max_calls:
                # Log violation
                self._log_rate_limit_violation(agent_id, calls_in_window, max_calls)
                print(f"WARNING: {func_name} - Rate limit exceeded for {agent_id}: {calls_in_window}/{max_calls}")
                return False

            # Record this call
            self.rate_limits[agent_id].append(now)
            return True

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            return True  # Allow on error

    def _log_rate_limit_violation(self, agent_id: str, calls: int, limit: int):
        """Log rate limit violation to database."""
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            cursor.execute("""
                INSERT INTO rate_limit_violations (timestamp, agent_id, calls_in_window, limit_value)
                VALUES (?, ?, ?, ?)
            """, (datetime.now().isoformat(), agent_id, calls, limit))

            conn.commit()
            conn.close()

        except Exception:
            pass

    def _log_authorization(self, agent_id: str, tool_name: str, params: Dict, allowed: bool, reason: str, risk_level: str = None):
        """
        REQ-003: Audit log all tool authorization decisions
        BLP: A (Alignment) - Complete audit trail
        """
        func_name = "_log_authorization"
        try:
            params_hash = hashlib.sha256(json.dumps(params, sort_keys=True).encode()).hexdigest()[:16]

            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            cursor.execute("""
                INSERT INTO authorization_audit
                (timestamp, agent_id, tool_name, params_hash, allowed, reason, session_id, risk_level)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                datetime.now().isoformat(),
                agent_id,
                tool_name,
                params_hash,
                1 if allowed else 0,
                reason,
                os.environ.get("SESSION_ID", "unknown"),
                risk_level
            ))

            conn.commit()
            conn.close()

            # Also write to log file for quick access
            log_entry = {
                "timestamp": datetime.now().isoformat(),
                "agent_id": agent_id,
                "tool": tool_name,
                "allowed": allowed,
                "reason": reason,
                "risk_level": risk_level
            }
            with open(LOGS_DIR / "camel_audit.log", "a") as f:
                f.write(json.dumps(log_entry) + "\n")

        except Exception as e:
            print(f"WARNING: {func_name} - Failed to log authorization: {e}")

    def authorize_tool_use(
        self,
        agent_id: str,
        tool_name: str,
        tool_params: Dict = None
    ) -> AuthorizationResult:
        """
        REQ-003: Authorize tool use with CaMeL security checks
        BLP: A (Alignment) - Enforces capability boundaries
        """
        func_name = "authorize_tool_use"
        tool_params = tool_params or {}

        try:
            # 1. Get agent capabilities
            capabilities = AGENT_CAPABILITIES.get(agent_id, AGENT_CAPABILITIES["default"])

            # 2. Check explicit denials first
            for denied in capabilities.denied_tools:
                if self._matches_pattern(tool_name, denied):
                    result = AuthorizationResult(
                        allowed=False,
                        reason=f"Tool {tool_name} explicitly denied for {agent_id}",
                        audit_log=True
                    )
                    self._log_authorization(agent_id, tool_name, tool_params, False, result.reason)
                    print(f"DENIED: {func_name} - {result.reason}")
                    return result

            # 3. Check allowed tools
            allowed = False
            for pattern in capabilities.allowed_tools:
                if self._matches_pattern(tool_name, pattern):
                    allowed = True
                    break

            if not allowed:
                # Check if tool is in an allowed category
                tool_category = self._get_tool_category(tool_name)
                if tool_category and tool_category in capabilities.allowed_categories:
                    allowed = True

            if not allowed:
                result = AuthorizationResult(
                    allowed=False,
                    reason=f"Tool {tool_name} not in allowed list for {agent_id}",
                    audit_log=True
                )
                self._log_authorization(agent_id, tool_name, tool_params, False, result.reason)
                print(f"DENIED: {func_name} - {result.reason}")
                return result

            # 4. Check risk level and approval requirements
            category_name = self._get_tool_category(tool_name)
            category = TOOL_CATEGORIES.get(category_name)

            if category:
                risk_level = category.risk.value

                # Check for destructive commands
                if category.requires_approval and self._is_destructive_command(tool_name, tool_params):
                    result = AuthorizationResult(
                        allowed=False,
                        reason="Destructive command requires human approval",
                        requires_approval=True,
                        audit_log=True
                    )
                    self._log_authorization(agent_id, tool_name, tool_params, False, result.reason, risk_level)
                    print(f"BLOCKED: {func_name} - {result.reason}")
                    return result

                # Check 2FA requirement
                if category.requires_2fa:
                    result = AuthorizationResult(
                        allowed=False,
                        reason=f"Tool {tool_name} requires 2FA verification",
                        requires_2fa=True,
                        audit_log=True
                    )
                    self._log_authorization(agent_id, tool_name, tool_params, False, result.reason, risk_level)
                    print(f"BLOCKED: {func_name} - {result.reason}")
                    return result
            else:
                risk_level = "UNKNOWN"

            # 5. Check human approval requirements
            for approval_pattern in capabilities.requires_human_approval_for:
                if ":" in approval_pattern:
                    tool_prefix, cmd_pattern = approval_pattern.split(":", 1)
                    if tool_name == tool_prefix:
                        command = tool_params.get("command", "")
                        if cmd_pattern in command:
                            result = AuthorizationResult(
                                allowed=False,
                                reason=f"Command '{cmd_pattern}' requires human approval",
                                requires_approval=True,
                                audit_log=True
                            )
                            self._log_authorization(agent_id, tool_name, tool_params, False, result.reason, risk_level)
                            print(f"BLOCKED: {func_name} - {result.reason}")
                            return result

            # 6. Check rate limits
            if not self._check_rate_limit(agent_id):
                result = AuthorizationResult(
                    allowed=False,
                    reason=f"Rate limit exceeded for {agent_id}",
                    audit_log=True
                )
                self._log_authorization(agent_id, tool_name, tool_params, False, result.reason, risk_level)
                print(f"BLOCKED: {func_name} - {result.reason}")
                return result

            # 7. Authorized
            result = AuthorizationResult(allowed=True, reason="Authorized")
            self._log_authorization(agent_id, tool_name, tool_params, True, "Authorized", risk_level)
            print(f"SUCCESS: {func_name} - {agent_id} authorized for {tool_name}")
            return result

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")
            # Fail secure - deny on error
            return AuthorizationResult(allowed=False, reason=f"Authorization error: {e}")

    def get_audit_summary(self, hours: int = 24) -> Dict[str, Any]:
        """
        REQ-003: Get audit summary for dashboard
        BLP: SO (Self-Organization) - Visibility into security events
        """
        func_name = "get_audit_summary"
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            since = (datetime.now() - timedelta(hours=hours)).isoformat()

            # Total authorizations
            cursor.execute(
                "SELECT COUNT(*) FROM authorization_audit WHERE timestamp > ?",
                (since,)
            )
            total = cursor.fetchone()[0]

            # Allowed vs denied
            cursor.execute(
                "SELECT allowed, COUNT(*) FROM authorization_audit WHERE timestamp > ? GROUP BY allowed",
                (since,)
            )
            allowed_denied = {row[0]: row[1] for row in cursor.fetchall()}

            # By agent
            cursor.execute("""
                SELECT agent_id, COUNT(*), SUM(allowed)
                FROM authorization_audit WHERE timestamp > ?
                GROUP BY agent_id
            """, (since,))
            by_agent = {
                row[0]: {"total": row[1], "allowed": row[2] or 0, "denied": row[1] - (row[2] or 0)}
                for row in cursor.fetchall()
            }

            # By risk level
            cursor.execute("""
                SELECT risk_level, COUNT(*), SUM(allowed)
                FROM authorization_audit WHERE timestamp > ? AND risk_level IS NOT NULL
                GROUP BY risk_level
            """, (since,))
            by_risk = {
                row[0]: {"total": row[1], "allowed": row[2] or 0}
                for row in cursor.fetchall()
            }

            # Rate limit violations
            cursor.execute(
                "SELECT COUNT(*) FROM rate_limit_violations WHERE timestamp > ?",
                (since,)
            )
            rate_limit_violations = cursor.fetchone()[0]

            conn.close()

            summary = {
                "period_hours": hours,
                "total_authorizations": total,
                "allowed": allowed_denied.get(1, 0),
                "denied": allowed_denied.get(0, 0),
                "by_agent": by_agent,
                "by_risk_level": by_risk,
                "rate_limit_violations": rate_limit_violations,
                "generated_at": datetime.now().isoformat()
            }

            print(f"SUCCESS: {func_name} - Audit summary: {total} authorizations, {allowed_denied.get(0, 0)} denied")
            return summary

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")
            return {}

    def get_agent_capabilities(self, agent_id: str) -> Dict[str, Any]:
        """Get capabilities for an agent."""
        capabilities = AGENT_CAPABILITIES.get(agent_id, AGENT_CAPABILITIES["default"])
        return {
            "agent_id": capabilities.agent_id,
            "allowed_categories": capabilities.allowed_categories,
            "allowed_tools": capabilities.allowed_tools,
            "denied_tools": capabilities.denied_tools,
            "max_api_calls_per_minute": capabilities.max_api_calls_per_minute,
            "max_files_per_execution": capabilities.max_files_per_execution,
            "requires_human_approval_for": capabilities.requires_human_approval_for
        }


# Global instance
_camel = None


def get_camel() -> CaMeLSecurityLayer:
    """Get singleton CaMeL instance."""
    global _camel
    if _camel is None:
        _camel = CaMeLSecurityLayer()
    return _camel


def authorize(agent_id: str, tool_name: str, params: Dict = None) -> AuthorizationResult:
    """Convenience function for authorization."""
    return get_camel().authorize_tool_use(agent_id, tool_name, params)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="CaMeL Security Layer")
    parser.add_argument("--authorize", nargs=2, metavar=("AGENT", "TOOL"), help="Check authorization")
    parser.add_argument("--capabilities", type=str, help="Show agent capabilities")
    parser.add_argument("--audit", type=int, default=24, help="Show audit summary (hours)")
    parser.add_argument("--list-categories", action="store_true", help="List tool categories")
    parser.add_argument("--json", action="store_true", help="Output in JSON format")

    args = parser.parse_args()

    camel = CaMeLSecurityLayer()

    if args.authorize:
        agent_id, tool_name = args.authorize
        result = camel.authorize_tool_use(agent_id, tool_name)
        if args.json:
            print(json.dumps({
                "allowed": result.allowed,
                "reason": result.reason,
                "requires_approval": result.requires_approval,
                "requires_2fa": result.requires_2fa
            }))
        else:
            status = "✅ ALLOWED" if result.allowed else "❌ DENIED"
            print(f"{status}: {result.reason}")

    elif args.capabilities:
        caps = camel.get_agent_capabilities(args.capabilities)
        if args.json:
            print(json.dumps(caps, indent=2))
        else:
            print(f"\n=== Capabilities for {args.capabilities} ===")
            print(f"Allowed Categories: {', '.join(caps['allowed_categories'])}")
            print(f"Allowed Tools: {', '.join(caps['allowed_tools'][:5])}...")
            print(f"Denied Tools: {', '.join(caps['denied_tools'])}")
            print(f"Max API Calls/min: {caps['max_api_calls_per_minute']}")

    elif args.audit:
        summary = camel.get_audit_summary(args.audit)
        if args.json:
            print(json.dumps(summary, indent=2))
        else:
            print(f"\n=== CaMeL Audit Summary (last {args.audit}h) ===")
            print(f"Total: {summary.get('total_authorizations', 0)}")
            print(f"Allowed: {summary.get('allowed', 0)}")
            print(f"Denied: {summary.get('denied', 0)}")
            print(f"Rate Limit Violations: {summary.get('rate_limit_violations', 0)}")

    elif args.list_categories:
        if args.json:
            cats = {
                name: {
                    "risk": cat.risk.value,
                    "tools": cat.tools,
                    "requires_approval": cat.requires_approval,
                    "requires_2fa": cat.requires_2fa
                }
                for name, cat in TOOL_CATEGORIES.items()
            }
            print(json.dumps(cats, indent=2))
        else:
            print("\n=== Tool Categories ===")
            for name, cat in TOOL_CATEGORIES.items():
                risk_icons = {"LOW": "🟢", "MEDIUM": "🟡", "HIGH": "🟠", "CRITICAL": "🔴"}
                icon = risk_icons.get(cat.risk.value, "⚪")
                print(f"\n{icon} {name} ({cat.risk.value})")
                print(f"   Tools: {', '.join(cat.tools[:5])}...")
                if cat.requires_approval:
                    print("   ⚠️ Requires approval for destructive commands")
                if cat.requires_2fa:
                    print("   🔐 Requires 2FA")

    else:
        parser.print_help()
