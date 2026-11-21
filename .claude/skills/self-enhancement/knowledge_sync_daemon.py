#!/usr/bin/env python3
"""
Knowledge Sync Daemon - Cross-VM Learning Sync
REQ-007: Cross-VM Knowledge Sync
BLP Properties: SR (Self-Replication), SO (Self-Organization)

This module provides:
- Export error patterns from local DB
- Push patterns to all standby VMs
- Import and deduplicate patterns
- Run every 15 minutes via cron

Standard I/O: All exceptions print details, all success prints before return (REQ-009)
"""

import os
import sys
import json
import hashlib
import subprocess
import traceback
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any, List, Optional, Set
from dataclasses import dataclass

# REQ-005: VM Portability Configuration
PROJECT_DIR = Path(os.environ.get("TB_OPS_PROJECT_DIR", "/home/craigmbrown/Project"))
LOGS_DIR = Path(os.environ.get("TB_OPS_LOGS_DIR", PROJECT_DIR / "logs"))
SKILLS_DIR = PROJECT_DIR / ".claude" / "skills"
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Import VM config
try:
    from vm_fleet_config import VM_FLEET_CONFIG, execute_on_vm
except ImportError:
    sys.path.insert(0, str(SKILLS_DIR / "self-enhancement"))
    from vm_fleet_config import VM_FLEET_CONFIG, execute_on_vm


@dataclass
class SyncResult:
    """Result of a sync operation."""
    source_vm: str
    target_vm: str
    patterns_exported: int
    patterns_imported: int
    patterns_new: int
    patterns_duplicate: int
    success: bool
    error: str = ""
    synced_at: str = ""


class KnowledgeSyncDaemon:
    """
    REQ-007: Cross-VM pattern synchronization
    BLP: SR (Self-Replication) - Distributes knowledge across fleet
    BLP: SO (Self-Organization) - Self-organizes learning distribution
    """

    def __init__(self):
        self.local_vm = os.environ.get("VM_NAME", "thebaby")
        self.db_path = SKILLS_DIR / "self-enhancement" / "knowledge_sync.db"
        self.export_dir = SKILLS_DIR / "self-enhancement" / "exports"
        self.export_dir.mkdir(parents=True, exist_ok=True)
        self._init_database()

    def _init_database(self):
        """Initialize SQLite database for sync tracking."""
        func_name = "_init_database"
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sync_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    source_vm TEXT NOT NULL,
                    target_vm TEXT NOT NULL,
                    patterns_exported INTEGER,
                    patterns_imported INTEGER,
                    patterns_new INTEGER,
                    patterns_duplicate INTEGER,
                    success INTEGER NOT NULL,
                    error TEXT,
                    synced_at TEXT NOT NULL
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS pattern_hashes (
                    hash TEXT PRIMARY KEY,
                    source_vm TEXT NOT NULL,
                    imported_at TEXT NOT NULL
                )
            """)

            conn.commit()
            conn.close()
            print(f"SUCCESS: {func_name} - Knowledge sync database initialized")

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")

    def _get_pattern_hash(self, pattern: Dict) -> str:
        """Generate hash for pattern deduplication."""
        key_fields = {
            "error_type": pattern.get("error_type"),
            "pattern": pattern.get("pattern"),
            "solution": pattern.get("solution")
        }
        return hashlib.sha256(json.dumps(key_fields, sort_keys=True).encode()).hexdigest()[:16]

    def _is_pattern_known(self, pattern_hash: str) -> bool:
        """Check if pattern hash is already known."""
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()
            cursor.execute("SELECT 1 FROM pattern_hashes WHERE hash = ?", (pattern_hash,))
            result = cursor.fetchone() is not None
            conn.close()
            return result
        except Exception:
            return False

    def _record_pattern_hash(self, pattern_hash: str, source_vm: str):
        """Record pattern hash as known."""
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR IGNORE INTO pattern_hashes (hash, source_vm, imported_at)
                VALUES (?, ?, ?)
            """, (pattern_hash, source_vm, datetime.now().isoformat()))
            conn.commit()
            conn.close()
        except Exception:
            pass

    def export_local_patterns(self) -> Dict[str, Any]:
        """
        REQ-007: Export error patterns from local DB
        BLP: SR (Self-Replication) - Prepares knowledge for distribution
        """
        func_name = "export_local_patterns"
        try:
            # Export from error_learner database
            error_learner_db = SKILLS_DIR / "self-enhancement" / "error_patterns.db"
            if not error_learner_db.exists():
                print(f"WARNING: {func_name} - Error patterns database not found")
                return {"patterns": [], "count": 0}

            conn = sqlite3.connect(str(error_learner_db))
            cursor = conn.cursor()

            # Get patterns from last 24 hours
            since = (datetime.now() - timedelta(hours=24)).isoformat()
            cursor.execute("""
                SELECT error_type, pattern, solution, context, created_at
                FROM error_patterns
                WHERE created_at > ?
            """, (since,))

            patterns = []
            for row in cursor.fetchall():
                pattern = {
                    "error_type": row[0],
                    "pattern": row[1],
                    "solution": row[2],
                    "context": row[3],
                    "created_at": row[4],
                    "source_vm": self.local_vm
                }
                pattern["hash"] = self._get_pattern_hash(pattern)
                patterns.append(pattern)

            conn.close()

            # Also export agent learnings
            learnings_db = SKILLS_DIR / "self-enhancement" / "agent_learnings.db"
            if learnings_db.exists():
                conn = sqlite3.connect(str(learnings_db))
                cursor = conn.cursor()

                cursor.execute("""
                    SELECT agent_id, memory_type, task_type, pattern, insight, created_at
                    FROM learnings
                    WHERE created_at > ?
                """, (since,))

                for row in cursor.fetchall():
                    learning = {
                        "type": "learning",
                        "agent_id": row[0],
                        "memory_type": row[1],
                        "task_type": row[2],
                        "pattern": row[3],
                        "insight": row[4],
                        "created_at": row[5],
                        "source_vm": self.local_vm
                    }
                    learning["hash"] = hashlib.sha256(
                        json.dumps({"pattern": row[3], "insight": row[4]}, sort_keys=True).encode()
                    ).hexdigest()[:16]
                    patterns.append(learning)

                conn.close()

            export_data = {
                "source_vm": self.local_vm,
                "exported_at": datetime.now().isoformat(),
                "pattern_count": len(patterns),
                "patterns": patterns
            }

            # Save to export file
            export_file = self.export_dir / f"export_{self.local_vm}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(export_file, "w") as f:
                json.dump(export_data, f, indent=2)

            print(f"SUCCESS: {func_name} - Exported {len(patterns)} patterns to {export_file.name}")
            return export_data

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")
            return {"patterns": [], "count": 0, "error": str(e)}

    def import_patterns(self, patterns: List[Dict], source_vm: str) -> Dict[str, int]:
        """
        REQ-007: Import patterns from other VMs with deduplication
        BLP: SI (Self-Improvement) - Acquires knowledge from fleet
        """
        func_name = "import_patterns"
        try:
            imported = 0
            duplicates = 0

            for pattern in patterns:
                pattern_hash = pattern.get("hash") or self._get_pattern_hash(pattern)

                if self._is_pattern_known(pattern_hash):
                    duplicates += 1
                    continue

                # Import based on type
                if pattern.get("type") == "learning":
                    self._import_learning(pattern)
                else:
                    self._import_error_pattern(pattern)

                # Record hash
                self._record_pattern_hash(pattern_hash, source_vm)
                imported += 1

            result = {"imported": imported, "duplicates": duplicates}
            print(f"SUCCESS: {func_name} - Imported {imported} patterns ({duplicates} duplicates)")
            return result

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")
            return {"imported": 0, "duplicates": 0, "error": str(e)}

    def _import_error_pattern(self, pattern: Dict):
        """Import an error pattern to local database."""
        try:
            error_learner_db = SKILLS_DIR / "self-enhancement" / "error_patterns.db"
            conn = sqlite3.connect(str(error_learner_db))
            cursor = conn.cursor()

            cursor.execute("""
                INSERT OR IGNORE INTO error_patterns
                (error_type, pattern, solution, context, created_at, source_vm)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                pattern.get("error_type"),
                pattern.get("pattern"),
                pattern.get("solution"),
                pattern.get("context"),
                pattern.get("created_at", datetime.now().isoformat()),
                pattern.get("source_vm", "unknown")
            ))

            conn.commit()
            conn.close()

        except Exception as e:
            print(f"WARNING: _import_error_pattern - {e}")

    def _import_learning(self, learning: Dict):
        """Import a learning to local database."""
        try:
            learnings_db = SKILLS_DIR / "self-enhancement" / "agent_learnings.db"
            conn = sqlite3.connect(str(learnings_db))
            cursor = conn.cursor()

            learning_id = f"sync_{learning.get('source_vm')}_{datetime.now().strftime('%Y%m%d%H%M%S%f')}"

            cursor.execute("""
                INSERT OR IGNORE INTO learnings
                (learning_id, agent_id, memory_type, task_type, pattern, insight, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                learning_id,
                learning.get("agent_id"),
                learning.get("memory_type", "LEARNED"),
                learning.get("task_type"),
                learning.get("pattern"),
                learning.get("insight"),
                learning.get("created_at", datetime.now().isoformat())
            ))

            conn.commit()
            conn.close()

        except Exception as e:
            print(f"WARNING: _import_learning - {e}")

    def sync_to_vm(self, target_vm: str) -> SyncResult:
        """
        REQ-007: Sync patterns to a specific VM
        BLP: SR (Self-Replication) - Distributes to target
        """
        func_name = "sync_to_vm"
        try:
            if target_vm not in VM_FLEET_CONFIG:
                raise ValueError(f"VM {target_vm} not in fleet config")

            vm_config = VM_FLEET_CONFIG[target_vm]

            # Export local patterns
            export_data = self.export_local_patterns()
            patterns_exported = export_data.get("pattern_count", 0)

            if patterns_exported == 0:
                result = SyncResult(
                    source_vm=self.local_vm,
                    target_vm=target_vm,
                    patterns_exported=0,
                    patterns_imported=0,
                    patterns_new=0,
                    patterns_duplicate=0,
                    success=True,
                    synced_at=datetime.now().isoformat()
                )
                print(f"INFO: {func_name} - No patterns to sync to {target_vm}")
                return result

            # Create temp file for transfer
            temp_file = f"/tmp/sync_to_{target_vm}.json"
            with open(temp_file, "w") as f:
                json.dump(export_data, f)

            # SCP to target VM
            scp_result = subprocess.run(
                ["gcloud", "compute", "scp", temp_file,
                 f"{target_vm}:/tmp/sync_import.json",
                 f"--zone={vm_config.zone}"],
                capture_output=True, text=True, timeout=60
            )

            if scp_result.returncode != 0:
                raise RuntimeError(f"SCP failed: {scp_result.stderr}")

            # Run import on target VM
            import_cmd = f"python3 {SKILLS_DIR}/self-enhancement/knowledge_sync_daemon.py --import-file /tmp/sync_import.json"
            ssh_result = subprocess.run(
                ["gcloud", "compute", "ssh", target_vm,
                 f"--zone={vm_config.zone}",
                 f"--command={import_cmd}"],
                capture_output=True, text=True, timeout=120
            )

            # Parse import result
            patterns_new = 0
            patterns_duplicate = 0
            if ssh_result.returncode == 0:
                # Try to extract counts from output
                output = ssh_result.stdout
                if "imported:" in output.lower():
                    try:
                        parts = output.lower().split("imported:")
                        if len(parts) > 1:
                            patterns_new = int(parts[1].split()[0])
                    except:
                        pass

            result = SyncResult(
                source_vm=self.local_vm,
                target_vm=target_vm,
                patterns_exported=patterns_exported,
                patterns_imported=patterns_new + patterns_duplicate,
                patterns_new=patterns_new,
                patterns_duplicate=patterns_duplicate,
                success=True,
                synced_at=datetime.now().isoformat()
            )

            # Log sync
            self._log_sync(result)

            print(f"SUCCESS: {func_name} - Synced {patterns_exported} patterns to {target_vm}")
            return result

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")

            result = SyncResult(
                source_vm=self.local_vm,
                target_vm=target_vm,
                patterns_exported=0,
                patterns_imported=0,
                patterns_new=0,
                patterns_duplicate=0,
                success=False,
                error=str(e),
                synced_at=datetime.now().isoformat()
            )
            self._log_sync(result)
            return result

    def sync_to_all(self) -> List[SyncResult]:
        """
        REQ-007: Sync patterns to all VMs in fleet
        BLP: SR (Self-Replication) - Fleet-wide distribution
        """
        func_name = "sync_to_all"
        results = []

        try:
            for vm_name in VM_FLEET_CONFIG:
                if vm_name != self.local_vm:
                    print(f"Syncing to {vm_name}...")
                    result = self.sync_to_vm(vm_name)
                    results.append(result)

            successful = sum(1 for r in results if r.success)
            total_exported = sum(r.patterns_exported for r in results)
            total_new = sum(r.patterns_new for r in results)

            print(f"SUCCESS: {func_name} - Synced to {successful}/{len(results)} VMs, {total_new} new patterns")
            return results

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")
            return results

    def _log_sync(self, result: SyncResult):
        """Log sync result to database."""
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            cursor.execute("""
                INSERT INTO sync_history
                (source_vm, target_vm, patterns_exported, patterns_imported,
                 patterns_new, patterns_duplicate, success, error, synced_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                result.source_vm,
                result.target_vm,
                result.patterns_exported,
                result.patterns_imported,
                result.patterns_new,
                result.patterns_duplicate,
                1 if result.success else 0,
                result.error,
                result.synced_at
            ))

            conn.commit()
            conn.close()

        except Exception:
            pass

    def get_sync_stats(self) -> Dict[str, Any]:
        """Get sync statistics."""
        func_name = "get_sync_stats"
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            # Total syncs
            cursor.execute("SELECT COUNT(*) FROM sync_history")
            total_syncs = cursor.fetchone()[0]

            # Successful syncs
            cursor.execute("SELECT COUNT(*) FROM sync_history WHERE success = 1")
            successful_syncs = cursor.fetchone()[0]

            # Total patterns synced
            cursor.execute("SELECT SUM(patterns_new) FROM sync_history WHERE success = 1")
            total_patterns = cursor.fetchone()[0] or 0

            # Recent syncs
            cursor.execute("""
                SELECT target_vm, patterns_new, success, synced_at
                FROM sync_history
                ORDER BY id DESC LIMIT 10
            """)
            recent_syncs = [
                {"target": r[0], "patterns": r[1], "success": bool(r[2]), "at": r[3]}
                for r in cursor.fetchall()
            ]

            # Pattern hashes count
            cursor.execute("SELECT COUNT(*) FROM pattern_hashes")
            known_patterns = cursor.fetchone()[0]

            conn.close()

            stats = {
                "total_syncs": total_syncs,
                "successful_syncs": successful_syncs,
                "success_rate": successful_syncs / total_syncs if total_syncs > 0 else 0,
                "total_patterns_synced": total_patterns,
                "known_patterns": known_patterns,
                "recent_syncs": recent_syncs,
                "local_vm": self.local_vm,
                "generated_at": datetime.now().isoformat()
            }

            print(f"SUCCESS: {func_name} - Stats: {total_syncs} syncs, {total_patterns} patterns")
            return stats

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")
            return {}


# Global instance
_daemon = None


def get_daemon() -> KnowledgeSyncDaemon:
    """Get singleton daemon instance."""
    global _daemon
    if _daemon is None:
        _daemon = KnowledgeSyncDaemon()
    return _daemon


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Knowledge Sync Daemon")
    parser.add_argument("--export", action="store_true", help="Export local patterns")
    parser.add_argument("--sync", type=str, help="Sync to specific VM")
    parser.add_argument("--sync-all", action="store_true", help="Sync to all VMs")
    parser.add_argument("--import-file", type=str, help="Import patterns from file")
    parser.add_argument("--stats", action="store_true", help="Show sync stats")
    parser.add_argument("--json", action="store_true", help="Output in JSON format")

    args = parser.parse_args()

    daemon = KnowledgeSyncDaemon()

    if args.export:
        export_data = daemon.export_local_patterns()
        if args.json:
            print(json.dumps(export_data, indent=2))
        else:
            print(f"Exported {export_data.get('pattern_count', 0)} patterns")

    elif args.sync:
        result = daemon.sync_to_vm(args.sync)
        if args.json:
            print(json.dumps({
                "source": result.source_vm,
                "target": result.target_vm,
                "exported": result.patterns_exported,
                "new": result.patterns_new,
                "success": result.success
            }, indent=2))
        else:
            status = "✅" if result.success else "❌"
            print(f"{status} Sync to {result.target_vm}: {result.patterns_new} new patterns")

    elif args.sync_all:
        results = daemon.sync_to_all()
        if args.json:
            print(json.dumps([{
                "target": r.target_vm,
                "new": r.patterns_new,
                "success": r.success
            } for r in results], indent=2))
        else:
            for r in results:
                status = "✅" if r.success else "❌"
                print(f"{status} {r.target_vm}: {r.patterns_new} new patterns")

    elif args.import_file:
        with open(args.import_file) as f:
            data = json.load(f)
        result = daemon.import_patterns(data.get("patterns", []), data.get("source_vm", "unknown"))
        if args.json:
            print(json.dumps(result, indent=2))
        else:
            print(f"Imported: {result.get('imported', 0)}, Duplicates: {result.get('duplicates', 0)}")

    elif args.stats:
        stats = daemon.get_sync_stats()
        if args.json:
            print(json.dumps(stats, indent=2))
        else:
            print("\n=== Knowledge Sync Stats ===")
            print(f"Total Syncs: {stats.get('total_syncs', 0)}")
            print(f"Success Rate: {stats.get('success_rate', 0):.1%}")
            print(f"Total Patterns Synced: {stats.get('total_patterns_synced', 0)}")
            print(f"Known Patterns: {stats.get('known_patterns', 0)}")

    else:
        parser.print_help()
