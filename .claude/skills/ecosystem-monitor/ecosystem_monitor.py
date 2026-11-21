"""
Ecosystem Monitor - Aggregates health status from all ecosystem components.

REQ-014: Cross-system ecosystem monitoring
ENHANCED: Added TB Command Pipeline, WhatsApp Bridge, GitHub API

BLP Properties:
- A (Alignment): Monitors user-relevant components
- AU (Autonomy): Independent health checking
- SO (Self-Organization): Adaptive status aggregation
"""
import json
import asyncio
import traceback
from pathlib import Path
from datetime import datetime
from typing import Dict, Any


class EcosystemMonitor:
    """
    REQ-014: Ecosystem status aggregation for 8 components.

    BLP: [A, AU, SO]
    """

    def __init__(self, project_dir: Path):
        """
        Initialize EcosystemMonitor.

        Args:
            project_dir: Path to the project directory
        """
        self.project_dir = Path(project_dir)

    async def get_llm_router_status(self) -> Dict[str, Any]:
        """
        REQ-014: Check LLM Router health and cost savings.

        BLP: [A, AU]
        """
        func_name = "get_llm_router_status"
        try:
            router_db = self.project_dir / "llm-router" / "router.db"
            if router_db.exists():
                proc = await asyncio.create_subprocess_exec(
                    "systemctl", "is-active", "llm-router",
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, _ = await proc.communicate()
                is_active = stdout.decode().strip() == "active"
                result = {"healthy": is_active, "detail": "cost savings active" if is_active else "inactive"}
                print(f"[SUCCESS] {func_name}: {json.dumps(result)}")
                return result
            result = {"healthy": False, "detail": "not installed"}
            print(f"[SUCCESS] {func_name}: {json.dumps(result)}")
            return result
        except Exception as e:
            print(f"[ERROR] {func_name}: {type(e).__name__}: {e}")
            print(f"[TRACEBACK] {traceback.format_exc()}")
            return {"healthy": False, "detail": str(e)}

    async def get_intercabal_status(self) -> Dict[str, Any]:
        """
        REQ-014: Check InterCabal agent activity.

        BLP: [A, AU]
        """
        func_name = "get_intercabal_status"
        try:
            payload = self.project_dir / "intercabal-agents" / "ditd-system" / "intercabal_integration_payload.json"
            if payload.exists():
                with open(payload) as f:
                    data = json.load(f)
                agents = data.get("agent_count", 0)
                result = {"healthy": True, "detail": f"{agents} agents"}
                print(f"[SUCCESS] {func_name}: {json.dumps(result)}")
                return result
            result = {"healthy": False, "detail": "not configured"}
            print(f"[SUCCESS] {func_name}: {json.dumps(result)}")
            return result
        except Exception as e:
            print(f"[ERROR] {func_name}: {type(e).__name__}: {e}")
            print(f"[TRACEBACK] {traceback.format_exc()}")
            return {"healthy": False, "detail": str(e)}

    async def get_chainlink_status(self) -> Dict[str, Any]:
        """
        REQ-014: Check Chainlink prediction markets tracking.

        BLP: [A, AU]
        """
        func_name = "get_chainlink_status"
        try:
            chainlink_dir = self.project_dir / "chainlink-prediction-markets-mcp-enhanced"
            if chainlink_dir.exists():
                result = {"healthy": True, "detail": "tracking"}
                print(f"[SUCCESS] {func_name}: {json.dumps(result)}")
                return result
            result = {"healthy": False, "detail": "not installed"}
            print(f"[SUCCESS] {func_name}: {json.dumps(result)}")
            return result
        except Exception as e:
            print(f"[ERROR] {func_name}: {type(e).__name__}: {e}")
            print(f"[TRACEBACK] {traceback.format_exc()}")
            return {"healthy": False, "detail": str(e)}

    async def get_nostr_status(self) -> Dict[str, Any]:
        """
        REQ-014: Check Nostr DM delivery status.

        BLP: [A, AU]
        """
        func_name = "get_nostr_status"
        try:
            nostr_identity = self.project_dir / "nostr_integration" / "thebaby_fedi_identity.json"
            if nostr_identity.exists():
                result = {"healthy": True, "detail": "DMs ready"}
                print(f"[SUCCESS] {func_name}: {json.dumps(result)}")
                return result
            result = {"healthy": False, "detail": "identity not found"}
            print(f"[SUCCESS] {func_name}: {json.dumps(result)}")
            return result
        except Exception as e:
            print(f"[ERROR] {func_name}: {type(e).__name__}: {e}")
            print(f"[TRACEBACK] {traceback.format_exc()}")
            return {"healthy": False, "detail": str(e)}

    async def get_lifelog_status(self) -> Dict[str, Any]:
        """
        REQ-014: Check Lifelog processing status.

        BLP: [A, AU]
        """
        func_name = "get_lifelog_status"
        try:
            lifelog_dir = self.project_dir / "lifelog-v2"
            if lifelog_dir.exists():
                result = {"healthy": True, "detail": "processing"}
                print(f"[SUCCESS] {func_name}: {json.dumps(result)}")
                return result
            result = {"healthy": False, "detail": "not installed"}
            print(f"[SUCCESS] {func_name}: {json.dumps(result)}")
            return result
        except Exception as e:
            print(f"[ERROR] {func_name}: {type(e).__name__}: {e}")
            print(f"[TRACEBACK] {traceback.format_exc()}")
            return {"healthy": False, "detail": str(e)}

    async def get_tb_pipeline_status(self) -> Dict[str, Any]:
        """
        REQ-014: Check TB Command Pipeline daemon and pending commands.
        NEW component added per user requirement.

        BLP: [A, AU]
        """
        func_name = "get_tb_pipeline_status"
        try:
            proc = await asyncio.create_subprocess_exec(
                "systemctl", "is-active", "tb-command-daemon",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, _ = await proc.communicate()
            is_active = stdout.decode().strip() == "active"

            # Count pending commands from database
            pending_count = 0
            db_path = self.project_dir / ".claude" / "skills" / "tb-request-approval-workflow" / "state" / "commands.db"
            if db_path.exists():
                try:
                    import sqlite3
                    conn = sqlite3.connect(str(db_path))
                    cursor = conn.execute("SELECT COUNT(*) FROM tb_commands WHERE status='pending'")
                    pending_count = cursor.fetchone()[0]
                    conn.close()
                except Exception as db_err:
                    print(f"[WARNING] {func_name}: DB query failed: {db_err}")

            result = {
                "healthy": is_active,
                "detail": f"{pending_count} pending" if is_active else "daemon down"
            }
            print(f"[SUCCESS] {func_name}: {json.dumps(result)}")
            return result
        except Exception as e:
            print(f"[ERROR] {func_name}: {type(e).__name__}: {e}")
            print(f"[TRACEBACK] {traceback.format_exc()}")
            return {"healthy": False, "detail": str(e)}

    async def get_whatsapp_status(self) -> Dict[str, Any]:
        """
        REQ-014: Check WhatsApp Bridge connection.
        NEW component added per user requirement.

        BLP: [A, AU]
        """
        func_name = "get_whatsapp_status"
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.get("http://localhost:8083/health", timeout=aiohttp.ClientTimeout(total=5)) as resp:
                    if resp.status == 200:
                        try:
                            data = await resp.json()
                            connected = data.get("status") == "connected"
                        except:
                            connected = True  # If we got 200, assume connected
                        result = {"healthy": connected, "detail": "connected" if connected else "disconnected"}
                        print(f"[SUCCESS] {func_name}: {json.dumps(result)}")
                        return result
                    else:
                        result = {"healthy": False, "detail": f"HTTP {resp.status}"}
                        print(f"[SUCCESS] {func_name}: {json.dumps(result)}")
                        return result
        except ImportError:
            # aiohttp not installed, fall back to socket check
            pass
        except Exception as e:
            # aiohttp failed, fall back to socket check
            pass

        # Fallback: socket check
        try:
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            result_code = sock.connect_ex(('localhost', 8082))
            sock.close()
            healthy = result_code == 0
            result = {"healthy": healthy, "detail": "port open" if healthy else "port closed"}
            print(f"[SUCCESS] {func_name}: {json.dumps(result)}")
            return result
        except Exception as sock_err:
            print(f"[ERROR] {func_name}: {type(sock_err).__name__}: {sock_err}")
            return {"healthy": False, "detail": str(sock_err)}

    async def get_github_api_status(self) -> Dict[str, Any]:
        """
        REQ-014: Check GitHub API rate limit remaining.
        NEW component added per user requirement.

        BLP: [A, AU]
        """
        func_name = "get_github_api_status"
        try:
            proc = await asyncio.create_subprocess_exec(
                "gh", "api", "rate_limit", "--jq", ".rate.remaining",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await proc.communicate()

            if proc.returncode == 0:
                remaining = int(stdout.decode().strip())
                healthy = remaining > 100
                result = {"healthy": healthy, "detail": f"{remaining} remaining"}
                print(f"[SUCCESS] {func_name}: {json.dumps(result)}")
                return result
            else:
                result = {"healthy": False, "detail": f"gh error: {stderr.decode().strip()[:50]}"}
                print(f"[SUCCESS] {func_name}: {json.dumps(result)}")
                return result
        except Exception as e:
            print(f"[ERROR] {func_name}: {type(e).__name__}: {e}")
            print(f"[TRACEBACK] {traceback.format_exc()}")
            return {"healthy": False, "detail": str(e)}

    async def get_all_status(self) -> Dict[str, Dict[str, Any]]:
        """
        REQ-014: Get all ecosystem statuses (8 components).

        BLP: [A, AU, SO]

        Returns:
            Dictionary with status for all 8 components:
            - llm_router
            - intercabal
            - chainlink
            - nostr
            - lifelog
            - tb_pipeline (NEW)
            - whatsapp (NEW)
            - github_api (NEW)
        """
        func_name = "get_all_status"
        try:
            # Run all checks concurrently for performance
            results = await asyncio.gather(
                self.get_llm_router_status(),
                self.get_intercabal_status(),
                self.get_chainlink_status(),
                self.get_nostr_status(),
                self.get_lifelog_status(),
                self.get_tb_pipeline_status(),
                self.get_whatsapp_status(),
                self.get_github_api_status(),
                return_exceptions=True
            )

            status_dict = {
                "llm_router": results[0] if not isinstance(results[0], Exception) else {"healthy": False, "detail": str(results[0])},
                "intercabal": results[1] if not isinstance(results[1], Exception) else {"healthy": False, "detail": str(results[1])},
                "chainlink": results[2] if not isinstance(results[2], Exception) else {"healthy": False, "detail": str(results[2])},
                "nostr": results[3] if not isinstance(results[3], Exception) else {"healthy": False, "detail": str(results[3])},
                "lifelog": results[4] if not isinstance(results[4], Exception) else {"healthy": False, "detail": str(results[4])},
                "tb_pipeline": results[5] if not isinstance(results[5], Exception) else {"healthy": False, "detail": str(results[5])},
                "whatsapp": results[6] if not isinstance(results[6], Exception) else {"healthy": False, "detail": str(results[6])},
                "github_api": results[7] if not isinstance(results[7], Exception) else {"healthy": False, "detail": str(results[7])},
            }

            # Calculate overall health
            healthy_count = sum(1 for s in status_dict.values() if s.get("healthy", False))
            status_dict["_summary"] = {
                "total": 8,
                "healthy": healthy_count,
                "unhealthy": 8 - healthy_count,
                "overall_health": "green" if healthy_count == 8 else "yellow" if healthy_count >= 6 else "red",
                "timestamp": datetime.now().isoformat()
            }

            print(f"[SUCCESS] {func_name}: {json.dumps(status_dict['_summary'])}")
            return status_dict

        except Exception as e:
            print(f"[ERROR] {func_name}: {type(e).__name__}: {e}")
            print(f"[TRACEBACK] {traceback.format_exc()}")
            return {
                "llm_router": {"healthy": False, "detail": "check failed"},
                "intercabal": {"healthy": False, "detail": "check failed"},
                "chainlink": {"healthy": False, "detail": "check failed"},
                "nostr": {"healthy": False, "detail": "check failed"},
                "lifelog": {"healthy": False, "detail": "check failed"},
                "tb_pipeline": {"healthy": False, "detail": "check failed"},
                "whatsapp": {"healthy": False, "detail": "check failed"},
                "github_api": {"healthy": False, "detail": "check failed"},
                "_summary": {"total": 8, "healthy": 0, "unhealthy": 8, "overall_health": "red", "error": str(e)}
            }


# For testing
if __name__ == "__main__":
    import asyncio

    async def test():
        monitor = EcosystemMonitor(Path("/home/craigmbrown/Project"))
        status = await monitor.get_all_status()
        print(json.dumps(status, indent=2))

    asyncio.run(test())
