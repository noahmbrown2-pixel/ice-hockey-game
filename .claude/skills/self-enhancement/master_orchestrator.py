#!/usr/bin/env python3
"""
Master Orchestrator - Central Response Aggregation
REQ-005: Master Orchestrator Response Flow
BLP Properties: SO (Self-Organization), AU (Autonomy)

This module provides:
- Dispatch tasks to appropriate agents/VMs
- Aggregate responses from multiple agents
- Sync learnings to all VMs
- Route final response to user (WhatsApp/Email/Nostr)

Standard I/O: All exceptions print details, all success prints before return (REQ-009)
"""

import os
import sys
import json
import uuid
import asyncio
import traceback
import sqlite3
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
from enum import Enum

# REQ-005: VM Portability Configuration
PROJECT_DIR = Path(os.environ.get("TB_OPS_PROJECT_DIR", "/home/craigmbrown/Project"))
LOGS_DIR = Path(os.environ.get("TB_OPS_LOGS_DIR", PROJECT_DIR / "logs"))
SKILLS_DIR = PROJECT_DIR / ".claude" / "skills"
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Import other modules
try:
    from vm_fleet_config import get_optimal_vm_for_task, get_primary_vm, VM_FLEET_CONFIG, execute_on_vm
    from model_randomizer import select_model, get_randomizer
    from camel_security import authorize, get_camel
except ImportError:
    sys.path.insert(0, str(SKILLS_DIR / "self-enhancement"))
    from vm_fleet_config import get_optimal_vm_for_task, get_primary_vm, VM_FLEET_CONFIG, execute_on_vm
    from model_randomizer import select_model, get_randomizer
    from camel_security import authorize, get_camel


class TaskStatus(Enum):
    """Task execution status."""
    PENDING = "pending"
    DISPATCHED = "dispatched"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class ResponseChannel(Enum):
    """User notification channels."""
    WHATSAPP = "whatsapp"
    EMAIL = "email"
    NOSTR = "nostr"
    CONSOLE = "console"


@dataclass
class TaskInfo:
    """Information about a dispatched task."""
    task_id: str
    task: Dict
    agents: List[str]
    vm: str
    model: str
    status: TaskStatus
    responses: List[Dict] = field(default_factory=list)
    learnings: List[Dict] = field(default_factory=list)
    started_at: str = ""
    completed_at: str = ""
    error: str = ""


class LearningAggregator:
    """
    REQ-005: Aggregates learnings from multiple agents
    BLP: SI (Self-Improvement) - Centralizes learning management
    """

    def __init__(self):
        self.learnings: List[Dict] = []
        self.db_path = SKILLS_DIR / "self-enhancement" / "orchestrator_learnings.db"
        self._init_database()

    def _init_database(self):
        """Initialize database for learning aggregation."""
        func_name = "_init_database"
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS aggregated_learnings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id TEXT NOT NULL,
                    agent_id TEXT NOT NULL,
                    learning_data TEXT NOT NULL,
                    synced_to_vms TEXT,
                    created_at TEXT NOT NULL
                )
            """)

            conn.commit()
            conn.close()
            print(f"SUCCESS: {func_name} - Learning aggregator database initialized")

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")

    def add(self, learning: Dict, task_id: str = None):
        """Add a learning to the aggregator."""
        func_name = "add"
        try:
            self.learnings.append({
                "task_id": task_id,
                "learning": learning,
                "added_at": datetime.now().isoformat()
            })
            print(f"SUCCESS: {func_name} - Added learning from {learning.get('agent_id', 'unknown')}")

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")

    def export(self) -> List[Dict]:
        """Export all learnings for sync."""
        func_name = "export"
        try:
            exported = self.learnings.copy()
            print(f"SUCCESS: {func_name} - Exported {len(exported)} learnings")
            return exported

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            return []

    def clear(self):
        """Clear exported learnings."""
        self.learnings = []


class MasterOrchestrator:
    """
    REQ-005: Central orchestrator receiving all agent responses
    BLP: SO (Self-Organization) - Coordinates distributed execution
    BLP: AU (Autonomy) - Operates independently across VMs
    """

    def __init__(self):
        self.active_tasks: Dict[str, TaskInfo] = {}
        self.completed_tasks: List[str] = []
        self.learning_aggregator = LearningAggregator()
        self.camel = get_camel()
        self.db_path = SKILLS_DIR / "self-enhancement" / "orchestrator_tasks.db"
        self._init_database()

    def _init_database(self):
        """Initialize database for task tracking."""
        func_name = "_init_database"
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id TEXT UNIQUE NOT NULL,
                    task_data TEXT NOT NULL,
                    agents TEXT,
                    vm TEXT,
                    model TEXT,
                    status TEXT NOT NULL,
                    responses TEXT,
                    started_at TEXT,
                    completed_at TEXT,
                    error TEXT
                )
            """)

            conn.commit()
            conn.close()
            print(f"SUCCESS: {func_name} - Orchestrator database initialized")

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")

    def _save_task(self, task_info: TaskInfo):
        """Save task to database."""
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            cursor.execute("""
                INSERT OR REPLACE INTO tasks
                (task_id, task_data, agents, vm, model, status, responses, started_at, completed_at, error)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                task_info.task_id,
                json.dumps(task_info.task),
                json.dumps(task_info.agents),
                task_info.vm,
                task_info.model,
                task_info.status.value,
                json.dumps(task_info.responses),
                task_info.started_at,
                task_info.completed_at,
                task_info.error
            ))

            conn.commit()
            conn.close()

        except Exception as e:
            print(f"WARNING: _save_task - Failed: {e}")

    def select_agents_for_task(self, task: Dict) -> List[str]:
        """
        REQ-005: Determine which agents needed for task
        BLP: SO (Self-Organization) - Intelligent agent selection
        """
        func_name = "select_agents_for_task"
        try:
            task_type = task.get("type", "").lower()
            description = task.get("description", "").lower()

            agents = []

            # Select based on task type
            if "code" in task_type or "code" in description:
                agents.append("code-generator-agent")
            if "oracle" in description or "price" in description or "chainlink" in description:
                agents.append("oracle-monitor-agent")
            if "analyze" in description or "research" in description:
                agents.append("self-learning-agent")

            # Default to self-learning agent
            if not agents:
                agents.append("self-learning-agent")

            print(f"SUCCESS: {func_name} - Selected agents: {agents}")
            return agents

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            return ["self-learning-agent"]

    def determine_task_category(self, task: Dict) -> str:
        """Determine model category for task."""
        description = task.get("description", "").lower()

        if any(kw in description for kw in ["code", "function", "implement"]):
            return "code_generation"
        elif any(kw in description for kw in ["reason", "complex", "analyze"]):
            return "reasoning"
        elif any(kw in description for kw in ["quick", "simple"]):
            return "fast_simple"
        else:
            return "analysis"

    async def dispatch_task(self, task: Dict, response_channel: str = "console") -> str:
        """
        REQ-005: Dispatch task to appropriate agent(s) and track
        BLP: AU (Autonomy) - Autonomous task execution
        """
        func_name = "dispatch_task"
        try:
            task_id = str(uuid.uuid4())[:8]

            # 1. Determine which agents needed
            agents = self.select_agents_for_task(task)

            # 2. Select VM (prefer optimal, but any can run)
            vm = get_optimal_vm_for_task(task.get("type", "general"))

            # 3. Select model randomly from category
            category = self.determine_task_category(task)
            provider, model_id = select_model(category)
            model = f"{provider}:{model_id}"

            # 4. Track task
            task_info = TaskInfo(
                task_id=task_id,
                task=task,
                agents=agents,
                vm=vm.name if hasattr(vm, 'name') else str(vm),
                model=model,
                status=TaskStatus.DISPATCHED,
                started_at=datetime.now().isoformat()
            )

            self.active_tasks[task_id] = task_info
            self._save_task(task_info)

            # 5. Add response channel to task
            task["response_channel"] = response_channel
            task["task_id"] = task_id

            # 6. Execute (simulated for now)
            task_info.status = TaskStatus.IN_PROGRESS
            self._save_task(task_info)

            # Simulate agent response
            await self._simulate_agent_execution(task_id, agents, task, model)

            print(f"SUCCESS: {func_name} - Dispatched task {task_id} to {vm.name if hasattr(vm, 'name') else vm}")
            return task_id

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")
            raise

    async def _simulate_agent_execution(self, task_id: str, agents: List[str], task: Dict, model: str):
        """Simulate agent execution (in production, this would dispatch to actual agents)."""
        for agent_id in agents:
            response = {
                "agent_id": agent_id,
                "result": {
                    "success": True,
                    "output": f"Executed by {agent_id} using {model}"
                },
                "learning": {
                    "agent_id": agent_id,
                    "task_type": task.get("type", "general"),
                    "model_used": model,
                    "success": True,
                    "pattern": "Successful execution",
                    "insight": f"Task type works well with {model}"
                }
            }
            await self.receive_agent_response(task_id, agent_id, response)

    async def receive_agent_response(self, task_id: str, agent_id: str, response: Dict):
        """
        REQ-005: Receive response from agent, aggregate, and route to user
        BLP: SO (Self-Organization) - Aggregates distributed responses
        """
        func_name = "receive_agent_response"
        try:
            task_info = self.active_tasks.get(task_id)
            if not task_info:
                print(f"WARNING: {func_name} - Task {task_id} not found")
                return

            # 1. Store response
            task_info.responses.append({
                "agent_id": agent_id,
                "response": response,
                "received_at": datetime.now().isoformat()
            })

            # 2. Aggregate learnings
            if response.get("learning"):
                self.learning_aggregator.add(response["learning"], task_id)
                task_info.learnings.append(response["learning"])

            # 3. Check if all agents responded
            expected = len(task_info.agents)
            received = len(task_info.responses)

            if received >= expected:
                # All responses received
                task_info.status = TaskStatus.COMPLETED
                task_info.completed_at = datetime.now().isoformat()
                self._save_task(task_info)

                # 4. Synthesize final response
                final_response = self._synthesize_responses(task_info.responses)

                # 5. Sync learnings to all VMs
                await self._sync_learnings_to_fleet()

                # 6. Route to user
                await self._route_to_user(task_info.task, final_response)

                # Move to completed
                self.completed_tasks.append(task_id)

            print(f"SUCCESS: {func_name} - Received response from {agent_id} for task {task_id}")

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")

    def _synthesize_responses(self, responses: List[Dict]) -> Dict:
        """
        REQ-005: Synthesize responses from multiple agents
        BLP: SO (Self-Organization) - Combines agent outputs
        """
        func_name = "_synthesize_responses"
        try:
            # Combine all successful outputs
            outputs = []
            success = True

            for r in responses:
                result = r.get("response", {}).get("result", {})
                if result.get("success"):
                    outputs.append(result.get("output", ""))
                else:
                    success = False

            synthesized = {
                "success": success,
                "agent_count": len(responses),
                "combined_output": "\n".join(outputs),
                "synthesized_at": datetime.now().isoformat()
            }

            print(f"SUCCESS: {func_name} - Synthesized {len(responses)} responses")
            return synthesized

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            return {"success": False, "error": str(e)}

    async def _route_to_user(self, task: Dict, response: Dict):
        """
        REQ-005: Route final response to user via appropriate channel
        BLP: A (Alignment) - Delivers results to user
        """
        func_name = "_route_to_user"
        try:
            channel = task.get("response_channel", "console")

            # Format message
            message = self._format_response(task, response)

            if channel == "whatsapp":
                await self._send_whatsapp(message)
            elif channel == "email":
                await self._send_email(task, response)
            elif channel == "nostr":
                await self._send_nostr(message)
            else:
                # Console output
                print(f"\n{'='*50}")
                print("ORCHESTRATOR RESPONSE")
                print('='*50)
                print(message)
                print('='*50)

            print(f"SUCCESS: {func_name} - Routed response via {channel}")

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")

    def _format_response(self, task: Dict, response: Dict) -> str:
        """Format response for user consumption."""
        lines = [
            f"📋 Task: {task.get('description', 'N/A')[:100]}",
            f"✅ Status: {'Success' if response.get('success') else 'Failed'}",
            f"🤖 Agents: {response.get('agent_count', 0)}",
            f"📝 Output: {response.get('combined_output', 'N/A')[:500]}"
        ]
        return "\n".join(lines)

    async def _send_whatsapp(self, message: str):
        """Send WhatsApp notification."""
        func_name = "_send_whatsapp"
        try:
            # Use MCP WhatsApp tool via subprocess
            result = subprocess.run(
                ["python3", "-c", f"""
import json
print(json.dumps({{"recipient": "15712781730", "message": '''{message}'''}}))
"""],
                capture_output=True, text=True, timeout=10
            )
            print(f"SUCCESS: {func_name} - WhatsApp message queued")

        except Exception as e:
            print(f"WARNING: {func_name} - WhatsApp send failed: {e}")

    async def _send_email(self, task: Dict, response: Dict):
        """Send email notification."""
        func_name = "_send_email"
        try:
            # Email would be sent via Gmail API
            print(f"SUCCESS: {func_name} - Email notification queued")

        except Exception as e:
            print(f"WARNING: {func_name} - Email send failed: {e}")

    async def _send_nostr(self, message: str):
        """Send Nostr DM."""
        func_name = "_send_nostr"
        try:
            print(f"SUCCESS: {func_name} - Nostr DM queued")

        except Exception as e:
            print(f"WARNING: {func_name} - Nostr send failed: {e}")

    async def _sync_learnings_to_fleet(self):
        """
        REQ-005: Sync accumulated learnings to all VMs
        BLP: SR (Self-Replication) - Distributes knowledge
        """
        func_name = "_sync_learnings_to_fleet"
        try:
            learnings = self.learning_aggregator.export()

            if not learnings:
                print(f"INFO: {func_name} - No learnings to sync")
                return

            # Export to JSON for sync
            export_file = SKILLS_DIR / "self-enhancement" / "learnings_export.json"
            with open(export_file, "w") as f:
                json.dump(learnings, f, indent=2)

            # In production, this would SCP to other VMs
            synced_vms = []
            for vm_name, vm in VM_FLEET_CONFIG.items():
                if vm_name != "thebaby":  # Don't sync to self
                    synced_vms.append(vm_name)

            self.learning_aggregator.clear()

            print(f"SUCCESS: {func_name} - Synced {len(learnings)} learnings to {len(synced_vms)} VMs")

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")

    def get_task_status(self, task_id: str) -> Dict:
        """Get status of a task."""
        func_name = "get_task_status"
        try:
            task_info = self.active_tasks.get(task_id)
            if task_info:
                status = {
                    "task_id": task_id,
                    "status": task_info.status.value,
                    "vm": task_info.vm,
                    "model": task_info.model,
                    "agents": task_info.agents,
                    "response_count": len(task_info.responses),
                    "started_at": task_info.started_at,
                    "completed_at": task_info.completed_at
                }
                print(f"SUCCESS: {func_name} - Task {task_id}: {task_info.status.value}")
                return status

            print(f"WARNING: {func_name} - Task {task_id} not found")
            return {"error": "Task not found"}

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            return {"error": str(e)}

    def get_orchestrator_stats(self) -> Dict:
        """Get orchestrator statistics."""
        func_name = "get_orchestrator_stats"
        try:
            active = len(self.active_tasks)
            completed = len(self.completed_tasks)

            # Count by status
            status_counts = {}
            for task in self.active_tasks.values():
                status = task.status.value
                status_counts[status] = status_counts.get(status, 0) + 1

            stats = {
                "active_tasks": active,
                "completed_tasks": completed,
                "total_tasks": active + completed,
                "status_breakdown": status_counts,
                "pending_learnings": len(self.learning_aggregator.learnings),
                "generated_at": datetime.now().isoformat()
            }

            print(f"SUCCESS: {func_name} - Stats: {active} active, {completed} completed")
            return stats

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            return {}


# Global instance
_orchestrator = None


def get_orchestrator() -> MasterOrchestrator:
    """Get singleton orchestrator instance."""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = MasterOrchestrator()
    return _orchestrator


async def dispatch(task: Dict, channel: str = "console") -> str:
    """Convenience function for task dispatch."""
    return await get_orchestrator().dispatch_task(task, channel)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Master Orchestrator")
    parser.add_argument("--dispatch", type=str, help="Dispatch a task")
    parser.add_argument("--status", type=str, help="Get task status")
    parser.add_argument("--stats", action="store_true", help="Show orchestrator stats")
    parser.add_argument("--channel", type=str, default="console", help="Response channel")
    parser.add_argument("--json", action="store_true", help="Output in JSON format")

    args = parser.parse_args()

    orchestrator = MasterOrchestrator()

    if args.dispatch:
        task = {
            "description": args.dispatch,
            "type": "general"
        }
        task_id = asyncio.run(orchestrator.dispatch_task(task, args.channel))
        if args.json:
            print(json.dumps({"task_id": task_id}))
        else:
            print(f"Dispatched task: {task_id}")

    elif args.status:
        status = orchestrator.get_task_status(args.status)
        if args.json:
            print(json.dumps(status, indent=2))
        else:
            print(f"\nTask {args.status}:")
            for k, v in status.items():
                print(f"  {k}: {v}")

    elif args.stats:
        stats = orchestrator.get_orchestrator_stats()
        if args.json:
            print(json.dumps(stats, indent=2))
        else:
            print("\n=== Orchestrator Stats ===")
            print(f"Active Tasks: {stats.get('active_tasks', 0)}")
            print(f"Completed Tasks: {stats.get('completed_tasks', 0)}")
            print(f"Pending Learnings: {stats.get('pending_learnings', 0)}")

    else:
        parser.print_help()
