#!/usr/bin/env python3
"""
Ledger Manager - Central ledger management for Continuous-Claude integration.

Provides session continuity through ledger creation, loading, and management.
Integrates with pre_compact.py, session_start.py, and context_handoff.py.

Usage:
    python ledger_manager.py --test           # Run self-test
    python ledger_manager.py --list           # List all ledgers
    python ledger_manager.py --create         # Create test ledger
    python ledger_manager.py --load <id>      # Load specific ledger

GA006 Integration - P8 BUILD (Approved December 26, 2025)
Memory System Enhancement - Phase 1 (January 2026) - Now uses SQLite backend
"""

import json
import os
import sys
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, List, Any
from dataclasses import dataclass, asdict
import logging

# Import database backend
sys.path.insert(0, str(Path(__file__).parent))
from ledger_database import LedgerDatabase, LedgerEntry as DBLedgerEntry

# Configuration
THOUGHTS_DIR = Path("/home/craigmbrown/Project/thoughts/shared")
MAX_LEDGERS = 50
SENSITIVE_PATTERNS = ["api_key", "password", "secret", "token", "credential"]

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ledger_manager")


@dataclass
class LedgerEntry:
    """Single ledger entry representing session state."""
    session_id: str
    timestamp: str
    context_summary: str
    active_tasks: List[str]
    key_decisions: List[str]
    pending_actions: List[str]
    files_modified: List[str]
    learnings: List[str]
    metadata: Dict[str, Any]
    # Continuous-Claude-v2 addition (December 2025)
    context_percentage: Optional[float] = None  # Context usage % at time of ledger creation


class LedgerManager:
    """Manages session ledgers for Continuous-Claude integration.

    Now uses SQLite database backend for better performance and queryability.
    Maintains backward compatibility with file-based interface.
    """

    def __init__(self, thoughts_dir: Path = THOUGHTS_DIR):
        """
        Initialize ledger manager with database backend.

        Args:
            thoughts_dir: Compatibility parameter (now unused, kept for API compat)
        """
        self.thoughts_dir = thoughts_dir  # Keep for handoff files
        self.thoughts_dir.mkdir(parents=True, exist_ok=True)
        self.db = LedgerDatabase()  # Use database backend

    def create_ledger(
        self,
        session_id: str,
        context_summary: str = "",
        active_tasks: Optional[List[str]] = None,
        key_decisions: Optional[List[str]] = None,
        pending_actions: Optional[List[str]] = None,
        files_modified: Optional[List[str]] = None,
        learnings: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        context_percentage: Optional[float] = None  # Continuous-Claude-v2
    ) -> Path:
        """
        Create a new session ledger in database.

        Args:
            session_id: Unique session identifier
            context_summary: Brief summary of current context
            active_tasks: List of active tasks
            key_decisions: Important decisions made
            pending_actions: Actions pending completion
            files_modified: Files changed in session
            learnings: Key learnings from session
            metadata: Additional metadata
            context_percentage: Context usage % at creation (v2)

        Returns:
            Path (for compatibility - returns database path with ID)
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Create database entry
        db_entry = DBLedgerEntry(
            session_id=session_id,
            timestamp=timestamp,
            context_summary=self._filter_sensitive(context_summary),
            active_tasks=active_tasks or [],
            key_decisions=key_decisions or [],
            pending_actions=pending_actions or [],
            files_modified=files_modified or [],
            learnings=learnings or [],
            metadata=metadata or {},
            context_percentage=context_percentage
        )

        # Store in database
        ledger_id = self.db.create_ledger(db_entry)

        logger.info(f"Created ledger ID {ledger_id} for session {session_id[:8]}")

        # Return fake path for compatibility (contains ID)
        return Path(f"/home/craigmbrown/.claude/data/ledgers.db#{ledger_id}")

    def load_ledger(self, ledger_id: str) -> Optional[LedgerEntry]:
        """
        Load a specific ledger by ID or session ID.

        Args:
            ledger_id: Database ID or session ID

        Returns:
            LedgerEntry if found, None otherwise
        """
        # Try as database ID first
        try:
            db_id = int(ledger_id)
            db_entry = self.db.load_ledger(ledger_id=db_id)
            if db_entry:
                return self._db_to_api_entry(db_entry)
        except ValueError:
            pass  # Not an integer, try as session ID

        # Try as session ID
        db_entry = self.db.load_ledger(session_id=ledger_id)
        if db_entry:
            return self._db_to_api_entry(db_entry)

        logger.warning(f"Ledger not found: {ledger_id}")
        return None

    def load_latest(self, session_id: Optional[str] = None) -> Optional[LedgerEntry]:
        """
        Load the most recent ledger from database, optionally filtered by session ID.

        Args:
            session_id: Optional session ID to filter by

        Returns:
            Most recent LedgerEntry if found
        """
        db_entry = self.db.load_latest(session_id=session_id)
        if db_entry:
            return self._db_to_api_entry(db_entry)
        return None

    def list_ledgers(self, limit: int = 20) -> List[Dict[str, str]]:
        """
        List available ledgers from database with metadata.

        Args:
            limit: Maximum number to return

        Returns:
            List of ledger summaries
        """
        return self.db.list_ledgers(limit=limit)

    def create_handoff(
        self,
        session_id: str,
        context: str,
        next_steps: List[str],
        critical_info: Optional[Dict[str, Any]] = None
    ) -> Path:
        """
        Create a handoff file for session resume.

        Args:
            session_id: Session identifier
            context: Current context summary
            next_steps: Recommended next steps
            critical_info: Critical information to preserve

        Returns:
            Path to handoff file
        """
        handoff = {
            "session_id": session_id,
            "created_at": datetime.now().isoformat(),
            "context": self._filter_sensitive(context),
            "next_steps": next_steps,
            "critical_info": critical_info or {},
            "resume_instructions": "Load this handoff to continue previous session context."
        }

        filepath = self.thoughts_dir / f"handoff_{session_id[:8]}.json"

        with open(filepath, 'w') as f:
            json.dump(handoff, f, indent=2)

        logger.info(f"Created handoff: {filepath}")
        return filepath

    def get_pending_handoff(self) -> Optional[Dict[str, Any]]:
        """
        Get most recent pending handoff file.

        Returns:
            Handoff data if exists
        """
        handoffs = sorted(self.thoughts_dir.glob("handoff_*.json"), reverse=True)
        if handoffs:
            with open(handoffs[0]) as f:
                return json.load(f)
        return None

    def _db_to_api_entry(self, db_entry: DBLedgerEntry) -> LedgerEntry:
        """Convert database LedgerEntry to API LedgerEntry (for compatibility)."""
        return LedgerEntry(
            session_id=db_entry.session_id,
            timestamp=db_entry.timestamp,
            context_summary=db_entry.context_summary,
            active_tasks=db_entry.active_tasks,
            key_decisions=db_entry.key_decisions,
            pending_actions=db_entry.pending_actions,
            files_modified=db_entry.files_modified,
            learnings=db_entry.learnings,
            metadata=db_entry.metadata,
            context_percentage=db_entry.context_percentage
        )

    def _filter_sensitive(self, text: str) -> str:
        """Filter sensitive content from text."""
        filtered = text
        for pattern in SENSITIVE_PATTERNS:
            # Simple masking - replace potential sensitive values
            import re
            filtered = re.sub(
                rf'({pattern}["\s:=]+)[^\s"\']+',
                r'\1[FILTERED]',
                filtered,
                flags=re.IGNORECASE
            )
        return filtered

    # Rotation is now handled by LedgerDatabase automatically


def self_test():
    """Run self-test to verify functionality."""
    print("Running LedgerManager self-test...")

    manager = LedgerManager()

    # Test 1: Create ledger (returns database path)
    ledger_path = manager.create_ledger(
        session_id="test-session-12345",
        context_summary="Testing ledger creation for Continuous-Claude",
        active_tasks=["Create ledger manager", "Test functionality"],
        key_decisions=["Use SQLite backend", "50 ledger retention"],
        learnings=["Ledger system works correctly with database"]
    )
    # Path now contains database ID
    assert "#" in str(ledger_path), "Ledger path should contain database ID"
    print(f"  [PASS] Created ledger: {ledger_path}")

    # Test 2: List ledgers
    ledgers = manager.list_ledgers(limit=5)
    assert len(ledgers) > 0, "No ledgers found"
    print(f"  [PASS] Listed {len(ledgers)} ledgers")

    # Test 3: Load ledger
    loaded = manager.load_latest()
    assert loaded is not None, "Failed to load ledger"
    assert loaded.session_id == "test-session-12345", "Session ID mismatch"
    print(f"  [PASS] Loaded ledger: {loaded.session_id}")

    # Test 4: Create handoff
    handoff_path = manager.create_handoff(
        session_id="test-session-12345",
        context="Test handoff context",
        next_steps=["Resume testing", "Verify handoff loading"]
    )
    assert handoff_path.exists(), "Handoff file not created"
    print(f"  [PASS] Created handoff: {handoff_path.name}")

    # Test 5: Get pending handoff
    handoff = manager.get_pending_handoff()
    assert handoff is not None, "No pending handoff found"
    print(f"  [PASS] Retrieved handoff: {handoff['session_id']}")

    # Test 6: Sensitive filtering
    sensitive_text = "api_key: sk-12345 password: secret123"
    filtered = manager._filter_sensitive(sensitive_text)
    assert "sk-12345" not in filtered, "API key not filtered"
    assert "secret123" not in filtered, "Password not filtered"
    print("  [PASS] Sensitive content filtered")

    print("\n[SUCCESS] All tests passed!")
    return True


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Ledger Manager for Continuous-Claude")
    parser.add_argument("--test", action="store_true", help="Run self-test")
    parser.add_argument("--list", action="store_true", help="List all ledgers")
    parser.add_argument("--create", action="store_true", help="Create test ledger")
    parser.add_argument("--load", type=str, help="Load specific ledger by ID")

    args = parser.parse_args()

    if args.test:
        self_test()
    elif args.list:
        manager = LedgerManager()
        ledgers = manager.list_ledgers()
        print(f"Found {len(ledgers)} ledgers:")
        for l in ledgers:
            print(f"  - {l['filename']}: {l['context_summary'][:50]}...")
    elif args.create:
        manager = LedgerManager()
        path = manager.create_ledger(
            session_id=f"cli-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            context_summary="Created via CLI"
        )
        print(f"Created: {path}")
    elif args.load:
        manager = LedgerManager()
        ledger = manager.load_ledger(args.load)
        if ledger:
            print(json.dumps(asdict(ledger), indent=2))
        else:
            print(f"Ledger not found: {args.load}")
    else:
        parser.print_help()
