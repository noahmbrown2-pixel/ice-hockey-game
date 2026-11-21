#!/usr/bin/env python3
"""
TB Command Store - Persistent command storage with deduplication.

REQ-CH-005: Deduplication via content hash
BLP: Durability (D) - Persistent JSON storage
BLP: Self-Organization (SO) - Priority-based queue ordering

Used by all channel pollers to store detected commands.
"""

import hashlib
import json
import threading
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass, asdict, field
from typing import Dict, List, Optional, Set


@dataclass
class Command:
    """Represents a detected TB command from any channel."""
    command_id: str
    source_channel: str  # transcript, gmail, github_stars, nostr, twitter
    command_text: str
    raw_data: Dict
    detected_at: str
    priority: int = 5  # 1-10, higher = more urgent
    metadata: Dict = field(default_factory=dict)
    processed_at: Optional[str] = None
    result: Optional[str] = None

    def to_dict(self) -> Dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict) -> 'Command':
        """Create Command from dict."""
        return cls(
            command_id=data.get("command_id", ""),
            source_channel=data.get("source_channel", "unknown"),
            command_text=data.get("command_text", ""),
            raw_data=data.get("raw_data", {}),
            detected_at=data.get("detected_at", datetime.now().isoformat()),
            priority=data.get("priority", 5),
            metadata=data.get("metadata", {}),
            processed_at=data.get("processed_at"),
            result=data.get("result")
        )


class CommandStore:
    """
    Persistent storage for commands with deduplication.

    REQ-CH-005: Deduplication via content hash
    BLP: Durability (D) - JSON file persistence
    BLP: Self-Organization (SO) - Priority queue
    """

    def __init__(self, store_path: Path = None):
        if store_path is None:
            store_path = Path("/home/craigmbrown/Project/.claude/skills/tb-request-approval-workflow/data")

        self.store_path = Path(store_path)
        self.store_path.mkdir(parents=True, exist_ok=True)
        self.commands_file = self.store_path / "commands.json"
        self.processed_file = self.store_path / "processed_hashes.json"
        self._lock = threading.Lock()

    def _load_commands(self) -> Dict[str, Dict]:
        """Load commands from persistent storage."""
        if self.commands_file.exists():
            try:
                return json.loads(self.commands_file.read_text())
            except json.JSONDecodeError:
                print("[ERROR] CommandStore: Corrupted commands file, starting fresh")
                return {"commands": {}, "queue": []}
        return {"commands": {}, "queue": []}

    def _save_commands(self, data: Dict):
        """Save commands to persistent storage."""
        self.commands_file.write_text(json.dumps(data, indent=2))

    def _load_processed(self) -> Set[str]:
        """Load processed command hashes."""
        if self.processed_file.exists():
            try:
                data = json.loads(self.processed_file.read_text())
                return set(data.get("hashes", []))
            except json.JSONDecodeError:
                return set()
        return set()

    def _save_processed(self, hashes: Set[str]):
        """Save processed command hashes."""
        self.processed_file.write_text(json.dumps({
            "hashes": list(hashes),
            "updated_at": datetime.now().isoformat()
        }))

    def _compute_hash(self, command_text: str, source: str) -> str:
        """Compute deduplication hash for command."""
        content = f"{source}:{command_text.strip().lower()}"
        return hashlib.sha256(content.encode()).hexdigest()[:16]

    def add_command(self, command: Command) -> bool:
        """
        Add command if not duplicate.
        Returns True if added, False if duplicate.
        """
        with self._lock:
            content_hash = self._compute_hash(command.command_text, command.source_channel)
            processed = self._load_processed()

            if content_hash in processed:
                print(f"[DEBUG] CommandStore: Duplicate command ignored: {content_hash}")
                return False

            # Add to processed hashes
            processed.add(content_hash)
            self._save_processed(processed)

            # Add to commands store
            data = self._load_commands()
            command.metadata["content_hash"] = content_hash
            data["commands"][command.command_id] = command.to_dict()
            data["queue"].append(command.command_id)
            self._save_commands(data)

            print(f"[INFO] CommandStore: Added command: {command.command_id} from {command.source_channel}")
            return True

    def get_pending(self, limit: int = 10) -> List[Command]:
        """Get pending commands from queue."""
        with self._lock:
            data = self._load_commands()
            pending = []

            for cmd_id in data["queue"][:limit]:
                if cmd_id in data["commands"]:
                    cmd_data = data["commands"][cmd_id]
                    pending.append(Command.from_dict(cmd_data))

            return pending

    def get_all_pending(self) -> List[Command]:
        """Get all pending commands."""
        return self.get_pending(limit=1000)

    def mark_processed(self, command_id: str, result: str):
        """Mark command as processed with result."""
        with self._lock:
            data = self._load_commands()

            if command_id in data["commands"]:
                data["commands"][command_id]["processed_at"] = datetime.now().isoformat()
                data["commands"][command_id]["result"] = result

            if command_id in data["queue"]:
                data["queue"].remove(command_id)

            self._save_commands(data)
            print(f"[INFO] CommandStore: Marked processed: {command_id} -> {result}")

    def get_command(self, command_id: str) -> Optional[Command]:
        """Get a specific command by ID."""
        with self._lock:
            data = self._load_commands()
            if command_id in data["commands"]:
                return Command.from_dict(data["commands"][command_id])
            return None

    def remove_command(self, command_id: str) -> bool:
        """Remove a command from the store."""
        with self._lock:
            data = self._load_commands()

            if command_id in data["commands"]:
                del data["commands"][command_id]

            if command_id in data["queue"]:
                data["queue"].remove(command_id)

            self._save_commands(data)
            return True

    def clear_processed_hashes(self, older_than_days: int = 30):
        """Clear old processed hashes to prevent unbounded growth."""
        # For now, just clear all if file gets too large
        with self._lock:
            processed = self._load_processed()
            if len(processed) > 10000:
                # Keep only the most recent 5000
                processed = set(list(processed)[-5000:])
                self._save_processed(processed)
                print(f"[INFO] CommandStore: Cleared old hashes, kept 5000")

    def get_stats(self) -> Dict:
        """Get command store statistics."""
        with self._lock:
            data = self._load_commands()
            processed = self._load_processed()

            # Count by status
            pending_count = len(data["queue"])
            total_count = len(data["commands"])
            processed_count = total_count - pending_count

            # Count by source
            by_source = {}
            for cmd in data["commands"].values():
                source = cmd.get("source_channel", "unknown")
                by_source[source] = by_source.get(source, 0) + 1

            return {
                "total_commands": total_count,
                "pending_queue": pending_count,
                "processed_count": processed_count,
                "unique_hashes": len(processed),
                "by_source": by_source,
                "timestamp": datetime.now().isoformat()
            }

    def list_recent(self, limit: int = 20) -> List[Dict]:
        """List recent commands (both pending and processed)."""
        with self._lock:
            data = self._load_commands()
            commands = list(data["commands"].values())
            # Sort by detected_at descending
            commands.sort(key=lambda x: x.get("detected_at", ""), reverse=True)
            return commands[:limit]


# Convenience functions for direct script usage
def get_store() -> CommandStore:
    """Get the default command store instance."""
    return CommandStore()


def add_tb_command(text: str, source: str = "manual", priority: int = 5, metadata: Dict = None) -> bool:
    """Add a TB command to the store."""
    import time
    store = get_store()
    cmd = Command(
        command_id=f"{source}_{hashlib.md5(text.encode()).hexdigest()[:8]}_{int(time.time())}",
        source_channel=source,
        command_text=text,
        raw_data={"manual_entry": True},
        detected_at=datetime.now().isoformat(),
        priority=priority,
        metadata=metadata or {}
    )
    return store.add_command(cmd)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="TB Command Store")
    parser.add_argument("--stats", action="store_true", help="Show store statistics")
    parser.add_argument("--list", action="store_true", help="List recent commands")
    parser.add_argument("--pending", action="store_true", help="List pending commands")
    parser.add_argument("--add", help="Add a manual command")
    parser.add_argument("--source", default="manual", help="Source channel for --add")

    args = parser.parse_args()
    store = CommandStore()

    if args.stats:
        stats = store.get_stats()
        print(json.dumps(stats, indent=2))

    elif args.list:
        recent = store.list_recent()
        print(f"Recent commands ({len(recent)}):")
        for cmd in recent:
            status = "pending" if cmd.get("processed_at") is None else "processed"
            print(f"  [{status}] {cmd['command_id']}: {cmd['command_text'][:50]}...")

    elif args.pending:
        pending = store.get_pending(limit=50)
        print(f"Pending commands ({len(pending)}):")
        for cmd in pending:
            print(f"  [{cmd.priority}] {cmd.command_id}: {cmd.command_text[:50]}...")

    elif args.add:
        success = add_tb_command(args.add, source=args.source)
        print(f"Added: {success}")

    else:
        parser.print_help()
