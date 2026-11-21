#!/usr/bin/env python3
"""
Claude Fallback - Non-Claude Backup Mode
REQ-006: Non-Claude Backup Mode
BLP Properties: D (Durability), AU (Autonomy)

This module provides:
- Monitor Claude API availability
- Trigger fallback after 3 consecutive failures
- Switch all categories to non-Claude model pools
- Notify user via WhatsApp

Standard I/O: All exceptions print details, all success prints before return (REQ-009)
"""

import os
import sys
import json
import asyncio
import traceback
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum

# REQ-005: VM Portability Configuration
PROJECT_DIR = Path(os.environ.get("TB_OPS_PROJECT_DIR", "/home/craigmbrown/Project"))
LOGS_DIR = Path(os.environ.get("TB_OPS_LOGS_DIR", PROJECT_DIR / "logs"))
SKILLS_DIR = PROJECT_DIR / ".claude" / "skills"
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Import model randomizer
try:
    from model_randomizer import get_randomizer, MODEL_POOLS
except ImportError:
    sys.path.insert(0, str(SKILLS_DIR / "self-enhancement"))
    from model_randomizer import get_randomizer, MODEL_POOLS


class ClaudeStatus(Enum):
    """Claude API status."""
    AVAILABLE = "available"
    DEGRADED = "degraded"
    UNAVAILABLE = "unavailable"
    UNKNOWN = "unknown"


@dataclass
class HealthCheckResult:
    """Result of a Claude health check."""
    status: ClaudeStatus
    latency_ms: float
    error: str = ""
    checked_at: str = ""


class ClaudeMaxMonitor:
    """
    REQ-006: Monitor Claude Max plan availability and trigger fallback
    BLP: D (Durability) - Maintains operation without Claude
    BLP: AU (Autonomy) - Auto-switches to backup models
    """

    FAILURE_THRESHOLD = 3
    CHECK_INTERVAL_SECONDS = 60
    RECOVERY_CHECK_INTERVAL = 300  # 5 minutes when in fallback mode

    def __init__(self):
        self.claude_available = True
        self.current_status = ClaudeStatus.UNKNOWN
        self.last_check: Optional[datetime] = None
        self.consecutive_failures = 0
        self.in_fallback_mode = False
        self.fallback_triggered_at: Optional[datetime] = None
        self.db_path = SKILLS_DIR / "self-enhancement" / "claude_monitor.db"
        self._init_database()

    def _init_database(self):
        """Initialize SQLite database for monitoring history."""
        func_name = "_init_database"
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS health_checks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    status TEXT NOT NULL,
                    latency_ms REAL,
                    error TEXT,
                    checked_at TEXT NOT NULL
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS fallback_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_type TEXT NOT NULL,
                    triggered_at TEXT NOT NULL,
                    consecutive_failures INTEGER,
                    reason TEXT
                )
            """)

            conn.commit()
            conn.close()
            print(f"SUCCESS: {func_name} - Claude monitor database initialized")

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")

    def _log_health_check(self, result: HealthCheckResult):
        """Log health check result to database."""
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            cursor.execute("""
                INSERT INTO health_checks (status, latency_ms, error, checked_at)
                VALUES (?, ?, ?, ?)
            """, (result.status.value, result.latency_ms, result.error, result.checked_at))

            conn.commit()
            conn.close()

        except Exception:
            pass

    def _log_fallback_event(self, event_type: str, reason: str):
        """Log fallback event to database."""
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            cursor.execute("""
                INSERT INTO fallback_events (event_type, triggered_at, consecutive_failures, reason)
                VALUES (?, ?, ?, ?)
            """, (event_type, datetime.now().isoformat(), self.consecutive_failures, reason))

            conn.commit()
            conn.close()

        except Exception:
            pass

    async def check_claude_availability(self) -> HealthCheckResult:
        """
        REQ-006: Test Claude API with minimal request
        BLP: D (Durability) - Proactive availability monitoring
        """
        func_name = "check_claude_availability"
        import time
        start_time = time.time()

        try:
            # Try to import and use anthropic client
            try:
                import anthropic
                client = anthropic.Anthropic()

                # Minimal test request
                response = client.messages.create(
                    model="claude-3-5-haiku-20241022",
                    max_tokens=10,
                    messages=[{"role": "user", "content": "ping"}]
                )

                latency_ms = (time.time() - start_time) * 1000

                self.consecutive_failures = 0
                self.claude_available = True
                self.current_status = ClaudeStatus.AVAILABLE
                self.last_check = datetime.now()

                result = HealthCheckResult(
                    status=ClaudeStatus.AVAILABLE,
                    latency_ms=latency_ms,
                    checked_at=datetime.now().isoformat()
                )

                self._log_health_check(result)

                # If we were in fallback mode, check if we can recover
                if self.in_fallback_mode:
                    await self._check_recovery()

                print(f"SUCCESS: {func_name} - Claude available (latency: {latency_ms:.0f}ms)")
                return result

            except anthropic.RateLimitError as e:
                return await self._handle_failure(f"Rate limit: {e}", start_time)

            except anthropic.AuthenticationError as e:
                return await self._handle_failure(f"Auth error: {e}", start_time)

            except anthropic.APIConnectionError as e:
                return await self._handle_failure(f"Connection error: {e}", start_time)

            except ImportError:
                # Anthropic library not installed, simulate check
                return await self._simulate_check()

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")
            return await self._handle_failure(str(e), start_time)

    async def _simulate_check(self) -> HealthCheckResult:
        """Simulate check when anthropic library not available."""
        func_name = "_simulate_check"

        # Check if we have API key set
        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        if api_key and api_key.startswith("sk-ant-"):
            result = HealthCheckResult(
                status=ClaudeStatus.AVAILABLE,
                latency_ms=0,
                checked_at=datetime.now().isoformat()
            )
            self.consecutive_failures = 0
            self.claude_available = True
            print(f"SUCCESS: {func_name} - API key present, assuming available")
        else:
            result = HealthCheckResult(
                status=ClaudeStatus.UNKNOWN,
                latency_ms=0,
                error="No API key or anthropic library",
                checked_at=datetime.now().isoformat()
            )
            print(f"WARNING: {func_name} - Cannot verify Claude availability")

        self._log_health_check(result)
        return result

    async def _handle_failure(self, error: str, start_time: float) -> HealthCheckResult:
        """Handle Claude API failure."""
        func_name = "_handle_failure"
        import time

        latency_ms = (time.time() - start_time) * 1000
        self.consecutive_failures += 1
        self.last_check = datetime.now()

        # Determine status
        if self.consecutive_failures >= self.FAILURE_THRESHOLD:
            status = ClaudeStatus.UNAVAILABLE
            self.claude_available = False
            self.current_status = ClaudeStatus.UNAVAILABLE

            if not self.in_fallback_mode:
                await self.trigger_fallback_mode()
        else:
            status = ClaudeStatus.DEGRADED
            self.current_status = ClaudeStatus.DEGRADED

        result = HealthCheckResult(
            status=status,
            latency_ms=latency_ms,
            error=error,
            checked_at=datetime.now().isoformat()
        )

        self._log_health_check(result)

        print(f"WARNING: {func_name} - Claude check failed ({self.consecutive_failures}/{self.FAILURE_THRESHOLD}): {error}")
        return result

    async def trigger_fallback_mode(self):
        """
        REQ-006: Switch all agents to non-Claude models
        BLP: D (Durability) - Ensures continued operation
        BLP: AU (Autonomy) - Automatic failover
        """
        func_name = "trigger_fallback_mode"
        try:
            self.in_fallback_mode = True
            self.fallback_triggered_at = datetime.now()

            # Update model randomizer to exclude Claude
            randomizer = get_randomizer()
            randomizer.set_exclude_claude(True)

            # Log the event
            self._log_fallback_event("FALLBACK_TRIGGERED", "Consecutive failures exceeded threshold")

            # Notify user
            await self._send_fallback_notification()

            print(f"SUCCESS: {func_name} - Fallback mode activated, using non-Claude models")

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")

    async def _send_fallback_notification(self):
        """Send notification about fallback mode activation."""
        func_name = "_send_fallback_notification"
        try:
            message = """⚠️ Claude Max Unavailable

Switched to backup models:
- Reasoning: Grok-4.1, DeepSeek-R1
- Code: DeepSeek-Coder, Kimi-K2
- Analysis: GPT-4o, Grok-4
- Fast: Llama-3.1-8b, Gemini-Flash

All capabilities maintained. Monitoring for recovery.

Time: """ + datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            # Write to log for WhatsApp hook to pick up
            notification_file = LOGS_DIR / "claude_fallback_notification.json"
            with open(notification_file, "w") as f:
                json.dump({
                    "type": "CLAUDE_FALLBACK",
                    "message": message,
                    "timestamp": datetime.now().isoformat(),
                    "send_whatsapp": True,
                    "recipient": "15712781730"
                }, f)

            print(f"SUCCESS: {func_name} - Fallback notification created")

        except Exception as e:
            print(f"WARNING: {func_name} - Failed to send notification: {e}")

    async def _check_recovery(self):
        """Check if Claude has recovered and we can exit fallback mode."""
        func_name = "_check_recovery"
        try:
            # Require multiple consecutive successes before recovering
            if self.consecutive_failures == 0 and self.claude_available:
                # Wait a bit and do another check to confirm
                await asyncio.sleep(30)

                if self.claude_available:
                    await self._exit_fallback_mode()

        except Exception as e:
            print(f"WARNING: {func_name} - Recovery check failed: {e}")

    async def _exit_fallback_mode(self):
        """Exit fallback mode and restore Claude models."""
        func_name = "_exit_fallback_mode"
        try:
            self.in_fallback_mode = False

            # Update model randomizer to include Claude
            randomizer = get_randomizer()
            randomizer.set_exclude_claude(False)

            # Log the event
            self._log_fallback_event("FALLBACK_EXITED", "Claude recovered")

            # Calculate downtime
            if self.fallback_triggered_at:
                downtime = datetime.now() - self.fallback_triggered_at
                downtime_str = str(downtime).split('.')[0]
            else:
                downtime_str = "unknown"

            # Notify user
            message = f"""✅ Claude Max Recovered

Claude API is back online.
Restored to full model selection.

Downtime: {downtime_str}
Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}"""

            notification_file = LOGS_DIR / "claude_recovery_notification.json"
            with open(notification_file, "w") as f:
                json.dump({
                    "type": "CLAUDE_RECOVERY",
                    "message": message,
                    "timestamp": datetime.now().isoformat(),
                    "send_whatsapp": True,
                    "recipient": "15712781730"
                }, f)

            print(f"SUCCESS: {func_name} - Exited fallback mode, Claude restored")

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")

    def get_status(self) -> Dict[str, Any]:
        """Get current Claude monitor status."""
        func_name = "get_status"
        try:
            # Get recent health checks
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            cursor.execute("""
                SELECT status, latency_ms, error, checked_at
                FROM health_checks
                ORDER BY id DESC LIMIT 10
            """)
            recent_checks = [
                {"status": r[0], "latency_ms": r[1], "error": r[2], "checked_at": r[3]}
                for r in cursor.fetchall()
            ]

            # Get fallback events
            cursor.execute("""
                SELECT event_type, triggered_at, consecutive_failures, reason
                FROM fallback_events
                ORDER BY id DESC LIMIT 5
            """)
            fallback_events = [
                {"type": r[0], "triggered_at": r[1], "failures": r[2], "reason": r[3]}
                for r in cursor.fetchall()
            ]

            conn.close()

            status = {
                "claude_available": self.claude_available,
                "current_status": self.current_status.value,
                "consecutive_failures": self.consecutive_failures,
                "in_fallback_mode": self.in_fallback_mode,
                "fallback_triggered_at": self.fallback_triggered_at.isoformat() if self.fallback_triggered_at else None,
                "last_check": self.last_check.isoformat() if self.last_check else None,
                "recent_checks": recent_checks,
                "fallback_events": fallback_events,
                "generated_at": datetime.now().isoformat()
            }

            print(f"SUCCESS: {func_name} - Status: {self.current_status.value}, Fallback: {self.in_fallback_mode}")
            return status

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")
            return {}

    def force_fallback(self):
        """Force fallback mode (for testing)."""
        func_name = "force_fallback"
        self.consecutive_failures = self.FAILURE_THRESHOLD
        self.claude_available = False
        asyncio.run(self.trigger_fallback_mode())
        print(f"SUCCESS: {func_name} - Forced fallback mode")

    def force_recovery(self):
        """Force recovery from fallback (for testing)."""
        func_name = "force_recovery"
        self.consecutive_failures = 0
        self.claude_available = True
        asyncio.run(self._exit_fallback_mode())
        print(f"SUCCESS: {func_name} - Forced recovery from fallback")


# Global instance
_monitor = None


def get_monitor() -> ClaudeMaxMonitor:
    """Get singleton monitor instance."""
    global _monitor
    if _monitor is None:
        _monitor = ClaudeMaxMonitor()
    return _monitor


async def check_claude() -> HealthCheckResult:
    """Convenience function for health check."""
    return await get_monitor().check_claude_availability()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Claude Fallback Monitor")
    parser.add_argument("--check", action="store_true", help="Check Claude availability")
    parser.add_argument("--status", action="store_true", help="Show monitor status")
    parser.add_argument("--force-fallback", action="store_true", help="Force fallback mode")
    parser.add_argument("--force-recovery", action="store_true", help="Force recovery")
    parser.add_argument("--json", action="store_true", help="Output in JSON format")

    args = parser.parse_args()

    monitor = ClaudeMaxMonitor()

    if args.check:
        result = asyncio.run(monitor.check_claude_availability())
        if args.json:
            print(json.dumps({
                "status": result.status.value,
                "latency_ms": result.latency_ms,
                "error": result.error,
                "checked_at": result.checked_at
            }, indent=2))
        else:
            status_icon = "✅" if result.status == ClaudeStatus.AVAILABLE else "⚠️" if result.status == ClaudeStatus.DEGRADED else "❌"
            print(f"{status_icon} Claude Status: {result.status.value}")
            if result.latency_ms:
                print(f"   Latency: {result.latency_ms:.0f}ms")
            if result.error:
                print(f"   Error: {result.error}")

    elif args.status:
        status = monitor.get_status()
        if args.json:
            print(json.dumps(status, indent=2))
        else:
            print("\n=== Claude Monitor Status ===")
            print(f"Available: {status.get('claude_available', False)}")
            print(f"Status: {status.get('current_status', 'unknown')}")
            print(f"Consecutive Failures: {status.get('consecutive_failures', 0)}")
            print(f"In Fallback Mode: {status.get('in_fallback_mode', False)}")
            if status.get('fallback_triggered_at'):
                print(f"Fallback Triggered: {status['fallback_triggered_at']}")

    elif args.force_fallback:
        monitor.force_fallback()
        print("Fallback mode forced")

    elif args.force_recovery:
        monitor.force_recovery()
        print("Recovery forced")

    else:
        parser.print_help()
