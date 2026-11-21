#!/usr/bin/env python3
"""
VM Fleet Configuration - Active/Standby Mode
REQ-001: VM Fleet Configuration with Active/Standby
BLP Properties: D (Durability), SR (Self-Replication)

This module provides:
- VM fleet configuration with roles
- Active/standby mode management
- Optimal task routing based on specialization
- Automatic failover handling

Standard I/O: All exceptions print details, all success prints before return (REQ-009)
"""

import os
import sys
import json
import subprocess
import traceback
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from enum import Enum

# REQ-005: VM Portability Configuration
PROJECT_DIR = Path(os.environ.get("TB_OPS_PROJECT_DIR", "/home/craigmbrown/Project"))
LOGS_DIR = Path(os.environ.get("TB_OPS_LOGS_DIR", PROJECT_DIR / "logs"))
LOGS_DIR.mkdir(parents=True, exist_ok=True)


class VMRole(Enum):
    """VM role in the fleet."""
    PRIMARY = "PRIMARY"
    STANDBY = "STANDBY"
    OFFLINE = "OFFLINE"


class VMStatus(Enum):
    """VM operational status."""
    ACTIVE = "ACTIVE"
    READY = "READY"
    DEGRADED = "DEGRADED"
    OFFLINE = "OFFLINE"


@dataclass
class VMNode:
    """
    REQ-001: VM node configuration
    BLP: D (Durability) - Maintains VM state for failover
    """
    name: str
    ip: str
    zone: str
    role: VMRole
    status: VMStatus
    optimal_for: List[str] = field(default_factory=list)
    has_all_capabilities: bool = True
    failover_priority: int = 99
    last_health_check: Optional[datetime] = None
    health_score: float = 1.0

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "name": self.name,
            "ip": self.ip,
            "zone": self.zone,
            "role": self.role.value,
            "status": self.status.value,
            "optimal_for": self.optimal_for,
            "has_all_capabilities": self.has_all_capabilities,
            "failover_priority": self.failover_priority,
            "last_health_check": self.last_health_check.isoformat() if self.last_health_check else None,
            "health_score": self.health_score
        }


# REQ-001: VM Fleet Configuration
# BLP: SR (Self-Replication) - All VMs have identical capabilities
VM_FLEET_CONFIG: Dict[str, VMNode] = {
    "thebaby": VMNode(
        name="thebaby",
        ip="34.58.12.50",
        zone="us-central1-c",
        role=VMRole.PRIMARY,
        status=VMStatus.ACTIVE,
        optimal_for=["orchestration", "general", "code", "analysis"],
        has_all_capabilities=True,
        failover_priority=1
    ),
    "chainlink-jobs-x10": VMNode(
        name="chainlink-jobs-x10",
        ip="35.196.95.90",
        zone="us-east1-b",
        role=VMRole.STANDBY,
        status=VMStatus.READY,
        optimal_for=["oracle", "financial", "chainlink", "market", "price"],
        has_all_capabilities=True,
        failover_priority=2
    ),
    "craigmbrown-website": VMNode(
        name="craigmbrown-website",
        ip="34.173.97.118",
        zone="us-central1-a",
        role=VMRole.STANDBY,
        status=VMStatus.READY,
        optimal_for=["web", "api", "frontend", "website"],
        has_all_capabilities=True,
        failover_priority=3
    ),
    "intercabalsquabble-website": VMNode(
        name="intercabalsquabble-website",
        ip="34.27.49.187",
        zone="us-central1-f",
        role=VMRole.STANDBY,
        status=VMStatus.READY,
        optimal_for=["web", "gaming", "social"],
        has_all_capabilities=True,
        failover_priority=4
    )
}


def log_operation(func_name: str, status: str, message: str, details: Dict = None):
    """
    REQ-009: Standard I/O - Log all operations
    BLP: A (Alignment) - Consistent logging format
    """
    timestamp = datetime.now().isoformat()
    log_entry = {
        "timestamp": timestamp,
        "function": func_name,
        "status": status,
        "message": message,
        "details": details or {}
    }

    log_file = LOGS_DIR / "vm-fleet-operations.log"
    with open(log_file, "a") as f:
        f.write(json.dumps(log_entry) + "\n")

    print(f"{status}: {func_name} - {message}")


def get_primary_vm() -> Optional[VMNode]:
    """
    REQ-001: Get the current primary VM
    BLP: D (Durability) - Ensures primary is always identified
    """
    func_name = "get_primary_vm"
    try:
        for vm in VM_FLEET_CONFIG.values():
            if vm.role == VMRole.PRIMARY and vm.status == VMStatus.ACTIVE:
                result = vm
                print(f"SUCCESS: {func_name} - Primary VM: {result.name} ({result.ip})")
                return result

        print(f"WARNING: {func_name} - No active primary VM found")
        return None

    except Exception as e:
        print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
        print(f"TRACEBACK: {traceback.format_exc()}")
        raise


def get_optimal_vm_for_task(task_type: str) -> VMNode:
    """
    REQ-001: Route task to optimal VM based on specialization
    BLP: SO (Self-Organization) - Intelligent task routing
    """
    func_name = "get_optimal_vm_for_task"
    try:
        task_lower = task_type.lower()

        # Check each VM's specializations
        for vm_name, vm in VM_FLEET_CONFIG.items():
            if vm.status in [VMStatus.ACTIVE, VMStatus.READY]:
                for specialty in vm.optimal_for:
                    if specialty in task_lower:
                        result = vm
                        print(f"SUCCESS: {func_name} - Task '{task_type}' routed to {result.name} (specialty: {specialty})")
                        return result

        # Default to primary VM
        primary = get_primary_vm()
        if primary:
            print(f"SUCCESS: {func_name} - Task '{task_type}' routed to primary VM {primary.name}")
            return primary

        # Fallback to first available
        for vm in VM_FLEET_CONFIG.values():
            if vm.status in [VMStatus.ACTIVE, VMStatus.READY]:
                print(f"SUCCESS: {func_name} - Task '{task_type}' routed to fallback VM {vm.name}")
                return vm

        raise RuntimeError("No available VMs in fleet")

    except Exception as e:
        print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
        print(f"TRACEBACK: {traceback.format_exc()}")
        raise


def check_vm_health(vm_name: str) -> Dict[str, Any]:
    """
    REQ-001: Check health of a specific VM
    BLP: D (Durability) - Health monitoring for failover
    """
    func_name = "check_vm_health"
    try:
        vm = VM_FLEET_CONFIG.get(vm_name)
        if not vm:
            raise ValueError(f"VM {vm_name} not found in fleet")

        # Try to ping the VM
        result = subprocess.run(
            ["ping", "-c", "1", "-W", "2", vm.ip],
            capture_output=True, text=True, timeout=5
        )

        health_data = {
            "vm_name": vm_name,
            "ip": vm.ip,
            "reachable": result.returncode == 0,
            "checked_at": datetime.now().isoformat()
        }

        if result.returncode == 0:
            vm.health_score = 1.0
            vm.last_health_check = datetime.now()
            health_data["status"] = "healthy"
        else:
            vm.health_score = 0.0
            health_data["status"] = "unreachable"

        print(f"SUCCESS: {func_name} - VM {vm_name} health: {health_data['status']}")
        return health_data

    except subprocess.TimeoutExpired:
        print(f"WARNING: {func_name} - Health check timeout for {vm_name}")
        return {"vm_name": vm_name, "status": "timeout", "reachable": False}

    except Exception as e:
        print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
        print(f"TRACEBACK: {traceback.format_exc()}")
        raise


def trigger_failover(failed_vm: str) -> Optional[VMNode]:
    """
    REQ-001: Trigger failover from failed VM to next priority
    BLP: D (Durability) - Automatic failover handling
    """
    func_name = "trigger_failover"
    try:
        failed = VM_FLEET_CONFIG.get(failed_vm)
        if not failed:
            raise ValueError(f"VM {failed_vm} not found")

        # Mark failed VM as offline
        failed.status = VMStatus.OFFLINE
        failed.role = VMRole.OFFLINE
        log_operation(func_name, "WARNING", f"VM {failed_vm} marked as offline")

        # Find next available VM by priority
        available_vms = [
            vm for vm in VM_FLEET_CONFIG.values()
            if vm.status in [VMStatus.READY, VMStatus.ACTIVE] and vm.name != failed_vm
        ]
        available_vms.sort(key=lambda x: x.failover_priority)

        if available_vms:
            new_primary = available_vms[0]
            new_primary.role = VMRole.PRIMARY
            new_primary.status = VMStatus.ACTIVE

            log_operation(func_name, "SUCCESS", f"Failover complete: {failed_vm} -> {new_primary.name}")
            print(f"SUCCESS: {func_name} - Failover to {new_primary.name} ({new_primary.ip})")
            return new_primary

        print(f"ERROR: {func_name} - No available VMs for failover")
        return None

    except Exception as e:
        print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
        print(f"TRACEBACK: {traceback.format_exc()}")
        raise


def get_fleet_status() -> Dict[str, Any]:
    """
    REQ-001: Get complete fleet status
    BLP: SO (Self-Organization) - Fleet-wide visibility
    """
    func_name = "get_fleet_status"
    try:
        total = len(VM_FLEET_CONFIG)
        active = sum(1 for vm in VM_FLEET_CONFIG.values() if vm.status == VMStatus.ACTIVE)
        ready = sum(1 for vm in VM_FLEET_CONFIG.values() if vm.status == VMStatus.READY)
        offline = sum(1 for vm in VM_FLEET_CONFIG.values() if vm.status == VMStatus.OFFLINE)

        primary = get_primary_vm()

        status = {
            "total_vms": total,
            "active_vms": active,
            "ready_vms": ready,
            "offline_vms": offline,
            "primary_vm": primary.name if primary else None,
            "fleet_health": (active + ready) / total if total > 0 else 0,
            "vms": {name: vm.to_dict() for name, vm in VM_FLEET_CONFIG.items()},
            "checked_at": datetime.now().isoformat()
        }

        print(f"SUCCESS: {func_name} - Fleet: {active} active, {ready} ready, {offline} offline")
        return status

    except Exception as e:
        print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
        print(f"TRACEBACK: {traceback.format_exc()}")
        raise


def execute_on_vm(vm_name: str, command: str) -> Dict[str, Any]:
    """
    REQ-001: Execute command on specific VM via SSH
    BLP: SR (Self-Replication) - Distributed execution
    """
    func_name = "execute_on_vm"
    try:
        vm = VM_FLEET_CONFIG.get(vm_name)
        if not vm:
            raise ValueError(f"VM {vm_name} not found")

        if vm.status == VMStatus.OFFLINE:
            raise RuntimeError(f"VM {vm_name} is offline")

        # Execute via gcloud SSH
        result = subprocess.run(
            ["gcloud", "compute", "ssh", vm.name, f"--zone={vm.zone}",
             f"--command={command}"],
            capture_output=True, text=True, timeout=120
        )

        execution_result = {
            "vm_name": vm_name,
            "command": command,
            "returncode": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "success": result.returncode == 0,
            "executed_at": datetime.now().isoformat()
        }

        if result.returncode == 0:
            print(f"SUCCESS: {func_name} - Command executed on {vm_name}")
        else:
            print(f"WARNING: {func_name} - Command failed on {vm_name}: {result.stderr[:200]}")

        return execution_result

    except subprocess.TimeoutExpired:
        print(f"ERROR: {func_name} - Command timeout on {vm_name}")
        return {"vm_name": vm_name, "success": False, "error": "timeout"}

    except Exception as e:
        print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
        print(f"TRACEBACK: {traceback.format_exc()}")
        raise


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="VM Fleet Configuration Manager")
    parser.add_argument("--status", action="store_true", help="Show fleet status")
    parser.add_argument("--health", type=str, help="Check health of specific VM")
    parser.add_argument("--optimal", type=str, help="Get optimal VM for task type")
    parser.add_argument("--json", action="store_true", help="Output in JSON format")

    args = parser.parse_args()

    if args.status:
        status = get_fleet_status()
        if args.json:
            print(json.dumps(status, indent=2))
        else:
            print("\n=== VM Fleet Status ===")
            print(f"Total VMs: {status['total_vms']}")
            print(f"Active: {status['active_vms']}")
            print(f"Ready: {status['ready_vms']}")
            print(f"Offline: {status['offline_vms']}")
            print(f"Primary: {status['primary_vm']}")
            print(f"Fleet Health: {status['fleet_health']*100:.1f}%")
            print("\nVM Details:")
            for name, vm in status['vms'].items():
                role_icon = "🟢" if vm['role'] == "PRIMARY" else "🟡" if vm['status'] == "READY" else "🔴"
                print(f"  {role_icon} {name} ({vm['ip']}) - {vm['role']} - {vm['status']}")
                print(f"      Optimal for: {', '.join(vm['optimal_for'])}")

    elif args.health:
        health = check_vm_health(args.health)
        if args.json:
            print(json.dumps(health, indent=2))
        else:
            status_icon = "✅" if health.get('reachable') else "❌"
            print(f"{status_icon} {args.health}: {health.get('status', 'unknown')}")

    elif args.optimal:
        vm = get_optimal_vm_for_task(args.optimal)
        if args.json:
            print(json.dumps(vm.to_dict(), indent=2))
        else:
            print(f"Optimal VM for '{args.optimal}': {vm.name} ({vm.ip})")

    else:
        parser.print_help()
