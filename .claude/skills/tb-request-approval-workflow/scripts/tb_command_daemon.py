#!/usr/bin/env python3
"""
TB Command Processing Daemon
REQ-184: Multi-channel command ingestion and approval workflow

BLP Properties:
- Alignment: 95% - Processes user commands from multiple channels
- Autonomy: 90% - Continuous background polling and processing
- Durability: 95% - Systemd service with crash recovery, persistent state
- Self-Organization: 85% - Adaptive polling intervals based on activity

Workflow:
Multi-Channel Input -> Command Detection -> Deep Research -> Approval (Nostr DM + Email) -> DITD Execution

Input Channels:
- Transcript lifelog (primary)
- Gmail commands
- GitHub Stars
- Nostr Events
- Twitter/X Bookmarks
"""

import os
import sys
import json
import time
import signal
import logging
import threading
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Set
from dataclasses import dataclass, asdict, field
from queue import Queue, Empty
import hashlib

# Add script directory to path
sys.path.insert(0, str(Path(__file__).parent))

# Import workflow components
try:
    from tb_workflow_orchestrator import TBWorkflowOrchestrator, WorkflowState
    from nostr_approval_sender import NostrApprovalSender
    from email_approval_sender import EmailApprovalSender
    ORCHESTRATOR_AVAILABLE = True
except ImportError as e:
    print(f"WARNING: Could not import orchestrator: {e}")
    ORCHESTRATOR_AVAILABLE = False

# Import GA006 and BUILD handlers (new specialized handlers)
# REQ-TB-GA006: GA006 Topic Research Analyzer integration
# REQ-TB-BUILD: E2B Sandbox development integration
try:
    sys.path.insert(0, "/home/craigmbrown/Project/scripts")
    from ga006_tb_research_handler import GA006TBResearchHandler
    GA006_HANDLER_AVAILABLE = True
except ImportError as e:
    print(f"INFO: GA006 handler not available: {e}")
    GA006_HANDLER_AVAILABLE = False

try:
    from tb_build_handler import TBBuildHandler
    BUILD_HANDLER_AVAILABLE = True
except ImportError as e:
    print(f"INFO: BUILD handler not available: {e}")
    BUILD_HANDLER_AVAILABLE = False

# REQ-TB-ACTION: Action handler for personal tasks (apply, draft, send, etc.)
try:
    from tb_action_handler import TBActionHandler
    ACTION_HANDLER_AVAILABLE = True
except ImportError as e:
    print(f"INFO: ACTION handler not available: {e}")
    ACTION_HANDLER_AVAILABLE = False

# Import channel pollers (optional - graceful degradation)
try:
    from gmail_command_poller import GmailCommandPoller
    GMAIL_POLLER_AVAILABLE = True
except Exception as e:
    print(f"WARNING: Gmail poller not available: {e}")
    GMAIL_POLLER_AVAILABLE = False

try:
    from github_stars_poller import GitHubStarsPoller
    GITHUB_POLLER_AVAILABLE = True
except Exception as e:
    print(f"WARNING: GitHub Stars poller not available: {e}")
    GITHUB_POLLER_AVAILABLE = False

try:
    from nostr_events_poller import NostrEventsPoller
    NOSTR_POLLER_AVAILABLE = True
except Exception as e:
    print(f"WARNING: Nostr Events poller not available: {e}")
    NOSTR_POLLER_AVAILABLE = False

try:
    from twitter_bookmarks_poller import TwitterBookmarksPoller
    TWITTER_POLLER_AVAILABLE = True
except ImportError:
    TWITTER_POLLER_AVAILABLE = False


# Configure logging
LOG_DIR = Path("/home/craigmbrown/Project/logs")
LOG_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.FileHandler(LOG_DIR / "tb-command-daemon.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("tb-command-daemon")


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
    processed_at: Optional[str] = None  # Added to fix TypeError in get_pending
    result: Optional[str] = None  # Processing result
    task_type: str = "BUILD"  # RESEARCH, REMINDER, BUILD, ANALYSIS (REQ-100a)

    def to_dict(self) -> Dict:
        return asdict(self)


# REQ-100a: Task Type Classification
SLASH_COMMANDS = {
    "/research": "RESEARCH",
    "/find": "RESEARCH",
    "/remind": "REMINDER",
    "/reminder": "REMINDER",
    "/build": "BUILD",
    "/implement": "BUILD",
    "/analyze": "ANALYSIS",
}

TASK_TYPE_KEYWORDS = {
    "RESEARCH": [
        "find", "search", "look up", "research", "get me", "show me",
        "what is", "how much", "compare", "options", "flights", "prices",
        "investigate", "summarize", "look into", "check out"
    ],
    "REMINDER": [
        "remind", "reminder", "calendar", "schedule", "meeting",
        "appointment", "event", "put on calendar", "set a reminder",
        "put a meeting", "add to calendar"
    ],
    "BUILD": [
        "build", "create", "implement", "develop", "set up", "configure",
        "add feature", "fix", "enhance", "upgrade", "deploy", "install",
        "we need to", "capture", "expand"
    ],
    "ANALYSIS": [
        "quantify", "measure", "track", "metrics", "statistics",
        "dashboard", "report on", "data on", "insights", "analyze"
    ],
    "ACTION": [
        "apply", "draft", "send", "write", "book", "buy", "order",
        "sign up", "register", "subscribe", "cancel", "update my",
        "prepare", "review", "answer these", "respond to",
        "ready to apply", "keep in memory", "remember this",
        "save this", "email me", "get ready"
    ]
}


def detect_task_type(command_text: str) -> tuple[str, str]:
    """
    Detect task type from slash command prefix or keywords.
    REQ-100a: Task Type Classification

    Returns:
        tuple: (task_type, cleaned_command_text)
    """
    text = command_text.strip().lower()

    # Check for explicit slash commands first
    for slash_cmd, task_type in SLASH_COMMANDS.items():
        if text.startswith(slash_cmd):
            # Remove the slash command from the text
            cleaned = command_text.strip()[len(slash_cmd):].strip()
            logger.info(f"Slash command detected: {slash_cmd} -> {task_type}")
            return task_type, cleaned

    # Auto-detect from keywords
    text_lower = text

    # Check REMINDER first (specific keywords)
    for keyword in TASK_TYPE_KEYWORDS["REMINDER"]:
        if keyword in text_lower:
            logger.info(f"Auto-detected REMINDER from keyword: {keyword}")
            return "REMINDER", command_text

    # Check RESEARCH (flights, prices, options, etc.)
    for keyword in TASK_TYPE_KEYWORDS["RESEARCH"]:
        if keyword in text_lower:
            logger.info(f"Auto-detected RESEARCH from keyword: {keyword}")
            return "RESEARCH", command_text

    # Check ANALYSIS (quantify, metrics, etc.)
    for keyword in TASK_TYPE_KEYWORDS["ANALYSIS"]:
        if keyword in text_lower:
            logger.info(f"Auto-detected ANALYSIS from keyword: {keyword}")
            return "ANALYSIS", command_text

    # Check ACTION (apply, draft, send, book, etc.) - personal tasks
    for keyword in TASK_TYPE_KEYWORDS["ACTION"]:
        if keyword in text_lower:
            logger.info(f"Auto-detected ACTION from keyword: {keyword}")
            return "ACTION", command_text

    # Default to BUILD for development/feature requests
    logger.info(f"Defaulting to BUILD task type")
    return "BUILD", command_text


class CommandStore:
    """
    Persistent storage for commands with deduplication.
    REQ-CH-005: Deduplication via content hash
    """

    def __init__(self, store_path: Path):
        self.store_path = store_path
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
                logger.error("Corrupted commands file, starting fresh")
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
        self.processed_file.write_text(json.dumps({"hashes": list(hashes)}))

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
                logger.debug(f"Duplicate command ignored: {content_hash}")
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

            logger.info(f"Added command: {command.command_id} from {command.source_channel}")
            return True

    def get_pending(self, limit: int = 10) -> List[Command]:
        """Get pending commands from queue."""
        with self._lock:
            data = self._load_commands()
            pending = []

            for cmd_id in data["queue"][:limit]:
                if cmd_id in data["commands"]:
                    cmd_data = data["commands"][cmd_id]
                    pending.append(Command(**cmd_data))

            return pending

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
            logger.info(f"Marked processed: {command_id} -> {result}")

    def get_stats(self) -> Dict:
        """Get command store statistics."""
        with self._lock:
            data = self._load_commands()
            processed = self._load_processed()

            return {
                "total_commands": len(data["commands"]),
                "pending_queue": len(data["queue"]),
                "unique_hashes": len(processed),
                "timestamp": datetime.now().isoformat()
            }

    def find_by_hash(self, content_hash: str) -> Optional[Command]:
        """
        Find a command by its content hash.

        REQ-CH-005: Deduplication lookup via content hash
        BLP: Self-Organization (SO) - Hash-based retrieval

        Args:
            content_hash: The SHA-256 hash prefix (16 chars) to search for

        Returns:
            Command if found, None otherwise
        """
        with self._lock:
            data = self._load_commands()

            for cmd_data in data["commands"].values():
                # Check in metadata where hash is stored
                if cmd_data.get("metadata", {}).get("content_hash") == content_hash:
                    return Command(**cmd_data)

            return None

    def is_hash_processed(self, content_hash: str) -> bool:
        """
        Check if a content hash has already been processed.

        REQ-CH-005: Deduplication check

        Args:
            content_hash: The hash to check

        Returns:
            True if hash exists (already processed), False otherwise
        """
        with self._lock:
            processed = self._load_processed()
            return content_hash in processed

    def create_command(
        self,
        original_text: str,
        cleaned_text: str,
        embedding_hash: str,
        transcript_id: str,
        source_date=None
    ) -> Optional[str]:
        """
        Create a new command from raw inputs (compatibility wrapper for pollers).

        REQ-CH-001: Gmail command extraction
        BLP: Self-Organization (SO) - Unified command creation interface

        Args:
            original_text: Raw command text
            cleaned_text: Cleaned/normalized text
            embedding_hash: Content hash for deduplication
            transcript_id: Source identifier (e.g., "gmail:MSG_ID")
            source_date: Optional date of source

        Returns:
            command_id if created, None if duplicate
        """
        import time

        # Determine source channel from transcript_id
        source_channel = "gmail" if transcript_id.startswith("gmail:") else "unknown"

        # Generate unique command ID
        command_id = f"{source_channel}_{embedding_hash[:8]}_{int(time.time())}"

        # REQ-100a: Detect task type from command text
        task_type, classified_text = detect_task_type(cleaned_text)

        # Create Command object
        command = Command(
            command_id=command_id,
            source_channel=source_channel,
            command_text=classified_text,
            raw_data={
                "original_text": original_text,
                "transcript_id": transcript_id,
                "source_date": str(source_date) if source_date else None
            },
            detected_at=datetime.now().isoformat(),
            priority=5,
            metadata={
                "content_hash": embedding_hash,
                "original_text": original_text
            },
            task_type=task_type
        )

        # Add via existing method (handles deduplication)
        if self.add_command(command):
            return command_id
        return None


class TranscriptPoller:
    """
    Polls Limitless Lifelog transcripts for TB commands.
    Primary input channel.

    Fixed 2025-12-22: Now reads from transcript_archive with date folders
    REQ-184: Multi-channel command ingestion
    """

    TB_PATTERNS = [
        r'(?i)(?:^|[.\s])tb[,:]?\s+([^.]+)',  # "TB: do something" or "TB, do something"
        r'(?i)(?:^|[.\s])thebaby[,:]?\s+([^.]+)',  # "thebaby: do something"
        r'(?i)hey\s+(?:tb|thebaby)[,:]?\s+([^.]+)',  # "hey TB, do something"
        r'(?i)(?:tb|thebaby)\s+please\s+([^.]+)',  # "TB please do something"
    ]

    # Patterns to EXCLUDE — context window check (10 chars before, 20 chars after match start).
    # Fixed 2026-05-16: Limitless daily-insights summaries narrate ABOUT TB ("TB is supposed
    # to email you", "TB has not yet shipped", "the system that TB will use") and were being
    # picked up as commands. These reference patterns block the noise. Real voice commands
    # use imperative verbs ("TB send", "TB find", "TB please do") which pass through.
    EXCLUDE_PATTERNS = [
        r'chatbot',          # chatbot contains "tb"
        r'heartb',           # heartbeat/heartbreaking contains "tb"
        r'football',         # football contains "tb"
        r'tb\s+is\b',        # "TB is supposed/responsible/the system"
        r'tb\s+was\b',       # "TB was working/down/etc"
        r'tb\s+will\b',      # "TB will email you/handle"
        r'tb\s+has\b',       # "TB has been/not"
        r'tb\s+had\b',       # "TB had emailed"
        r'tb\s+have\b',      # "TB have done"
        r'tb\s+would\b',     # "TB would handle"
        r'tb\s+should\b',    # "TB should email"
        r'tb\s+could\b',     # "TB could handle"
        r'tb\s+can\b',       # "TB can handle"
        r'tb\s+may\b',       # "TB may need"
        r'tb\s+might\b',     # "TB might fail"
        r'tb\s+pipeline\b',  # "TB pipeline broke"
        r'tb\s+daemon\b',    # "TB daemon stopped"
        r'tb\s+system\b',    # "TB system constitution"
        r'tb\s+(?:cmd|command|action)\s+(?:was|is|has|will)\b',  # talking about TB cmds, not issuing one
        r'that\s+tb\b',      # "the system that TB"
        r'about\s+tb\b',     # "talked about TB"
        r'with\s+tb\b',      # "spoke with TB"
        r'to\s+tb\b',        # "spoke to TB"
        r'from\s+tb\b',      # "email from TB"
        r'tb\s+on\s+(?:sending|the\s+topic|that|this|him|her|them|us|me|you)\b',  # narrative "TB on X" not cmd
        r'(?:your|the|a)\s+tb\b',  # "your TB", "the TB"
    ]

    def __init__(self, config: Dict):
        self.config = config
        # Updated path to transcript archive
        self.lifelog_dir = Path(config.get("lifelog_dir", "/home/craigmbrown/Project/Limitless-Lifelog-Manager/transcripts_archive"))
        self.archive_mode = config.get("archive_mode", True)
        self.scan_recent_days = config.get("scan_recent_days", 3)
        # REVERTED 2026-05-17: the 2026-05-15 "fix" went the wrong direction.
        # The two patterns co-exist with different meanings:
        #   *_LC.json = Limitless Chat exports (text chats with Limitless's AI; source_type="limitless_chat")
        #              — contain NO TB voice content, only operator/AI text turns. Zero TB matches.
        #   *_TB.json = TB-keyword-tagged voice transcripts (upstream extractor flags these when "TB"
        #              spoken in voice). Includes pre-computed extracted_markers field with the
        #              keyword + position. This is the file shape we actually want to scan.
        # Evidence on 2026-05-17: 240 *_LC.json files today, 0 contain "TB"; 1 *_TB.json contains
        # operator saying "theBaby. TB." + extracted_markers={keyword: TB, position: 99}.
        # 24 *_TB.json files orphaned across 2026-05-11 through 2026-05-17 due to wrong glob.
        self.file_pattern = config.get("file_pattern", "*_TB.json")
        self.state_dir = Path("/home/craigmbrown/Project/.claude/skills/tb-request-approval-workflow/state")
        self.processed_transcripts_file = self.state_dir / "processed_transcript_ids.json"
        self._load_processed_ids()

    def _load_processed_ids(self):
        """Load list of already processed transcript IDs."""
        try:
            if self.processed_transcripts_file.exists():
                self.processed_ids = set(json.loads(self.processed_transcripts_file.read_text()))
            else:
                self.processed_ids = set()
        except Exception as e:
            logger.warning(f"Could not load processed IDs: {e}")
            self.processed_ids = set()

    def _save_processed_ids(self):
        """Save processed transcript IDs to prevent reprocessing."""
        try:
            self.processed_transcripts_file.write_text(json.dumps(list(self.processed_ids)))
        except Exception as e:
            logger.warning(f"Could not save processed IDs: {e}")

    def _get_recent_date_folders(self) -> List[Path]:
        """Get date folders from the last N days."""
        folders = []
        today = datetime.now()

        for i in range(self.scan_recent_days):
            date = today - timedelta(days=i)
            folder = self.lifelog_dir / date.strftime("%Y-%m-%d")
            if folder.exists() and folder.is_dir():
                folders.append(folder)

        return folders

    def _is_false_positive(self, text: str, match_start: int) -> bool:
        """Check if TB match is a false positive (part of another word)."""
        import re
        # Get context around the match
        start = max(0, match_start - 10)
        end = min(len(text), match_start + 20)
        context = text[start:end].lower()

        for pattern in self.EXCLUDE_PATTERNS:
            if re.search(pattern, context):
                return True
        return False

    def poll(self) -> List[Command]:
        """Poll transcripts for TB commands from archive folders."""
        import re
        commands = []
        newly_processed = 0

        try:
            # Get recent date folders
            date_folders = self._get_recent_date_folders()
            logger.info(f"Scanning {len(date_folders)} date folders for TB commands")

            transcript_files = []
            for folder in date_folders:
                # Find files matching the pattern (e.g., *_TB.json)
                for tf in folder.glob(self.file_pattern):
                    transcript_files.append(tf)

            # Sort by modification time, most recent first
            transcript_files.sort(key=lambda p: p.stat().st_mtime, reverse=True)

            # Fixed 2026-05-16: was [:10] which got swamped by Limitless system
            # re-archives (same transcript_id every ~5min) and never reached real
            # TB-utterance transcripts deeper in the recent list. Widened to 200;
            # dedup-by-transcript_id below skips already-processed work cheaply,
            # so this only costs JSON parses on first run after a backlog.
            for tf in transcript_files[:200]:
                try:
                    data = json.loads(tf.read_text())
                    transcript_id = data.get("transcript_id", tf.stem)

                    # Get transcript text from content, markdown, or nested fields
                    transcript_text = (
                        data.get("content", "") or
                        data.get("markdown", "") or
                        data.get("metadata", {}).get("markdown", "") or
                        data.get("text", "")
                    )

                    if not transcript_text:
                        continue

                    # Dedup by transcript_id + CONTENT hash (not id alone): Limitless
                    # progressively re-archives the same transcript_id as a conversation
                    # grows, so an early command-less snapshot must not block the later
                    # snapshot that contains the actual command. Downstream CommandStore
                    # dedups by command content-hash, so re-scans never create duplicates.
                    # Fix 2026-05-23: principles.md request was lost to id-only dedup.
                    content_key = f"{transcript_id}:{hashlib.sha256(transcript_text.encode()).hexdigest()[:12]}"
                    if content_key in self.processed_ids:
                        continue

                    for pattern in self.TB_PATTERNS:
                        for match in re.finditer(pattern, transcript_text):
                            # Check for false positives
                            if self._is_false_positive(transcript_text, match.start()):
                                continue

                            command_text = match.group(1) if match.groups() else match.group(0)
                            command_text = command_text.strip()

                            # Skip very short or very long commands
                            if len(command_text) < 5 or len(command_text) > 500:
                                continue

                            # REQ-100a: Detect task type from command text
                            task_type, cleaned_text = detect_task_type(command_text)

                            cmd = Command(
                                command_id=f"transcript_{hashlib.md5(command_text.encode()).hexdigest()[:8]}_{int(time.time())}",
                                source_channel="transcript",
                                command_text=cleaned_text,
                                raw_data={
                                    "file": str(tf),
                                    "pattern": pattern,
                                    "transcript_id": transcript_id,
                                    "archived_at": data.get("archived_at", ""),
                                    "original_command": command_text
                                },
                                detected_at=datetime.now().isoformat(),
                                priority=7,  # Transcripts are high priority
                                task_type=task_type
                            )
                            commands.append(cmd)
                            logger.info(f"Found TB command [{task_type}] in transcript {transcript_id}: {cleaned_text[:50]}...")

                    # Mark as processed (by content_key, not bare transcript_id)
                    self.processed_ids.add(content_key)
                    newly_processed += 1

                except Exception as e:
                    logger.warning(f"Error parsing transcript {tf}: {e}")

            # Persist whenever the processed set grew — NOT only when commands were
            # found. The old `if commands:` guard let the in-memory set diverge from
            # disk for days (frozen 2026-05-17), so a daemon restart re-scanned nothing
            # reliably. (Fix 2026-05-23.)
            if newly_processed:
                self._save_processed_ids()

        except Exception as e:
            logger.error(f"Transcript polling error: {e}")

        return commands


class TBCommandDaemon:
    """
    Main daemon that coordinates all input channels and workflow processing.

    REQ-184: Multi-channel command processing pipeline
    BLP: Autonomy, Durability, Self-Organization
    """

    def __init__(self):
        self.base_path = Path("/home/craigmbrown/Project/.claude/skills/tb-request-approval-workflow")
        self.data_path = self.base_path / "data"
        self.state_path = self.base_path / "state"
        self.config_path = self.base_path / "config"

        # Ensure directories exist
        for p in [self.data_path, self.state_path, self.config_path]:
            p.mkdir(parents=True, exist_ok=True)

        # Initialize command store
        self.command_store = CommandStore(self.data_path)

        # Load configuration
        self.config = self._load_config()

        # Initialize workflow orchestrator
        self.orchestrator = TBWorkflowOrchestrator() if ORCHESTRATOR_AVAILABLE else None

        # Initialize channel pollers
        self.pollers = {}
        self._init_pollers()

        # Processing queue
        self.process_queue = Queue()

        # Daemon state
        self.running = False
        self.stats = {
            "started_at": None,
            "commands_processed": 0,
            "approvals_sent": 0,
            "errors": 0,
            "last_poll": {}
        }

        # Signal handlers
        signal.signal(signal.SIGTERM, self._handle_signal)
        signal.signal(signal.SIGINT, self._handle_signal)

        logger.info("TB Command Daemon initialized")

    def _load_config(self) -> Dict:
        """Load daemon configuration."""
        config_file = self.config_path / "daemon_config.json"

        default_config = {
            "polling_intervals": {
                "transcript": 30,    # Check transcripts every 30 seconds
                "gmail": 120,        # Check Gmail every 2 minutes
                "github_stars": 300, # Check GitHub stars every 5 minutes
                "nostr": 60,         # Check Nostr events every minute
                "twitter": 300       # Check Twitter bookmarks every 5 minutes
            },
            "processing": {
                "batch_size": 5,
                "approval_timeout_hours": 24,
                "retry_failed": True,
                "max_retries": 3
            },
            "channels": {
                "transcript": {"enabled": True, "lifelog_dir": "/home/craigmbrown/.config/limitless-lifelog"},
                "gmail": {"enabled": GMAIL_POLLER_AVAILABLE},
                "github_stars": {"enabled": GITHUB_POLLER_AVAILABLE},
                "nostr": {"enabled": NOSTR_POLLER_AVAILABLE},
                "twitter": {"enabled": TWITTER_POLLER_AVAILABLE}
            },
            "approval": {
                "channels": ["nostr", "email"],  # Send via BOTH channels
                "dual_delivery": True  # No fallback - send both simultaneously
            }
        }

        if config_file.exists():
            try:
                user_config = json.loads(config_file.read_text())
                # Merge user config with defaults
                for key in user_config:
                    if key in default_config and isinstance(default_config[key], dict):
                        default_config[key].update(user_config[key])
                    else:
                        default_config[key] = user_config[key]
            except Exception as e:
                logger.warning(f"Error loading config, using defaults: {e}")

        # Save merged config
        config_file.write_text(json.dumps(default_config, indent=2))
        return default_config

    def _init_pollers(self):
        """Initialize available channel pollers."""
        channels = self.config.get("channels", {})

        # Transcript poller (always available)
        if channels.get("transcript", {}).get("enabled", True):
            self.pollers["transcript"] = TranscriptPoller(channels.get("transcript", {}))
            logger.info("Transcript poller initialized")

        # Gmail poller
        if GMAIL_POLLER_AVAILABLE and channels.get("gmail", {}).get("enabled", True):
            try:
                self.pollers["gmail"] = GmailCommandPoller(self.command_store)
                logger.info("Gmail poller initialized")
            except Exception as e:
                logger.warning(f"Gmail poller init failed: {e}")

        # GitHub Stars poller
        if GITHUB_POLLER_AVAILABLE and channels.get("github_stars", {}).get("enabled", True):
            try:
                self.pollers["github_stars"] = GitHubStarsPoller(self.command_store)
                logger.info("GitHub Stars poller initialized")
            except Exception as e:
                logger.warning(f"GitHub Stars poller init failed: {e}")

        # Nostr Events poller
        if NOSTR_POLLER_AVAILABLE and channels.get("nostr", {}).get("enabled", True):
            try:
                self.pollers["nostr"] = NostrEventsPoller(self.command_store)
                logger.info("Nostr Events poller initialized")
            except Exception as e:
                logger.warning(f"Nostr Events poller init failed: {e}")

        # Twitter Bookmarks poller
        if TWITTER_POLLER_AVAILABLE and channels.get("twitter", {}).get("enabled", True):
            try:
                self.pollers["twitter"] = TwitterBookmarksPoller(self.command_store)
                logger.info("Twitter Bookmarks poller initialized")
            except Exception as e:
                logger.warning(f"Twitter Bookmarks poller init failed: {e}")

        logger.info(f"Initialized {len(self.pollers)} channel pollers: {list(self.pollers.keys())}")

    def _handle_signal(self, signum, frame):
        """Handle shutdown signals gracefully."""
        logger.info(f"Received signal {signum}, shutting down...")
        self.running = False

    def _poll_channel(self, channel: str):
        """Poll a specific channel for commands."""
        if channel not in self.pollers:
            return

        try:
            poller = self.pollers[channel]

            # Check if poll method is async (coroutine)
            if hasattr(poller, 'poll'):
                poll_result = poller.poll()

                # Handle async pollers (nostr_events_poller returns coroutine)
                if hasattr(poll_result, '__await__') or hasattr(poll_result, 'cr_frame'):
                    try:
                        # Run async poll in new event loop
                        import asyncio
                        try:
                            loop = asyncio.get_event_loop()
                            if loop.is_running():
                                # Can't use asyncio.run() if loop already running
                                # Skip this poll cycle for async pollers
                                logger.debug(f"Skipping async {channel} poll - event loop already running")
                                return
                        except RuntimeError:
                            pass
                        commands = asyncio.run(poll_result)
                    except Exception as async_err:
                        logger.warning(f"Async poll error for {channel}: {async_err}")
                        commands = []
                else:
                    commands = poll_result if poll_result else []
            else:
                commands = []

            for cmd in commands:
                # Gmail poller already adds to CommandStore and returns dicts
                if isinstance(cmd, dict):
                    cmd_id = cmd.get("command_id", "unknown")
                    self.process_queue.put(cmd_id)
                    logger.info(f"Queued command from {channel}: {cmd_id}")
                elif self.command_store.add_command(cmd):
                    self.process_queue.put(cmd.command_id)
                    logger.info(f"Queued command from {channel}: {cmd.command_id}")

            self.stats["last_poll"][channel] = datetime.now().isoformat()

        except Exception as e:
            logger.error(f"Error polling {channel}: {e}")
            self.stats["errors"] += 1

    def _process_commands(self):
        """Process commands from the queue.

        REQ-TB-GA006: Route RESEARCH/ANALYSIS to GA006 Topic Research Analyzer
        REQ-TB-BUILD: Route BUILD to TB Build Handler with E2B sandbox
        """
        pending = self.command_store.get_pending(limit=self.config["processing"]["batch_size"])

        for cmd in pending:
            try:
                logger.info(f"Processing command: {cmd.command_id} (type: {cmd.task_type})")

                # REQ-TB-ACTION: Route ACTION to action handler (no approval needed)
                if cmd.task_type == "ACTION" and ACTION_HANDLER_AVAILABLE:
                    result = self._handle_action_task(cmd)

                # REQ-TB-GA006: Route RESEARCH/ANALYSIS to GA006 handler
                elif cmd.task_type in ["RESEARCH", "ANALYSIS"] and GA006_HANDLER_AVAILABLE:
                    result = self._handle_ga006_research(cmd)

                # REQ-TB-BUILD: Route BUILD to TB Build handler with E2B
                elif cmd.task_type == "BUILD" and BUILD_HANDLER_AVAILABLE:
                    result = self._handle_tb_build(cmd)

                # Fallback to existing orchestrator workflow
                elif self.orchestrator:
                    state = self.orchestrator.process_request(cmd.command_text)
                    if state:
                        result = state.phase
                        if state.phase == "AWAITING_APPROVAL":
                            self.stats["approvals_sent"] += 1
                    else:
                        result = "FAILED"
                        self.stats["errors"] += 1
                else:
                    logger.warning("No orchestrator or specialized handler available")
                    result = "NO_HANDLER"
                    self.stats["errors"] += 1

                self.stats["commands_processed"] += 1
                self.command_store.mark_processed(cmd.command_id, result)
                logger.info(f"Processed {cmd.command_id}: {result}")

            except Exception as e:
                logger.error(f"Error processing {cmd.command_id}: {e}")
                self.command_store.mark_processed(cmd.command_id, f"ERROR: {str(e)}")
                self.stats["errors"] += 1

    def _handle_ga006_research(self, cmd: Command) -> str:
        """
        Route RESEARCH/ANALYSIS commands to GA006 Topic Research Analyzer.
        REQ-TB-GA006: Creates GitHub issue with research plan for approval.

        Returns:
            str: Result status (PENDING_APPROVAL, ERROR, etc.)
        """
        try:
            logger.info(f"Routing to GA006 handler: {cmd.command_text}")
            handler = GA006TBResearchHandler()

            # Build command context
            command_context = {
                "type": cmd.task_type,
                "topic": cmd.command_text,
                "source": cmd.source_channel,
                "sender": cmd.metadata.get("sender", "unknown"),
                "original_message": cmd.raw_data.get("original_message", cmd.command_text),
                "command_id": cmd.command_id,
            }

            # Handle research command (creates GitHub issue + approval request).
            # 2026-05-17: handle_tb_research_command is async; @standard_io is sync-wrap.
            # The decorator returns the coroutine from func(...), so we must asyncio.run it.
            import asyncio
            coro_or_result = handler.handle_tb_research_command(command_context)
            if asyncio.iscoroutine(coro_or_result):
                result = asyncio.run(coro_or_result)
            else:
                result = coro_or_result

            if result.get("status") == "pending_approval":
                logger.info(f"GA006 research plan created: Issue #{result.get('issue_number')}, "
                           f"Request ID: {result.get('request_id')}")
                self.stats["approvals_sent"] += 1
                return f"PENDING_APPROVAL:GA006:{result.get('request_id')}"
            else:
                logger.error(f"GA006 handler returned unexpected status: {result}")
                return f"GA006_ERROR:{result.get('error', 'unknown')}"

        except Exception as e:
            logger.error(f"Error in GA006 handler: {e}")
            return f"GA006_ERROR:{str(e)}"

    def _handle_tb_build(self, cmd: Command) -> str:
        """
        Route BUILD commands to TB Build Handler with E2B sandbox.
        REQ-TB-BUILD: Creates GitHub issue with build plan, provisions E2B sandbox.

        IMPORTANT: Only uploads files RELEVANT to the build request, NOT entire codebase.

        Returns:
            str: Result status (PENDING_APPROVAL, ERROR, etc.)
        """
        try:
            logger.info(f"Routing to TB Build handler: {cmd.command_text}")
            handler = TBBuildHandler()

            # Build command context
            command_context = {
                "type": cmd.task_type,
                "feature": cmd.command_text,
                "source": cmd.source_channel,
                "sender": cmd.metadata.get("sender", "unknown"),
                "original_message": cmd.raw_data.get("original_message", cmd.command_text),
                "command_id": cmd.command_id,
                # Target defaults to TheBaby system (entire Project directory)
                "target": cmd.metadata.get("target", "TheBaby"),
            }

            # Handle build command (creates GitHub issue + provisions sandbox)
            result = handler.handle_build_command(command_context)

            if result.get("status") == "pending_approval":
                logger.info(f"TB Build plan created: Issue #{result.get('issue_number')}, "
                           f"Request ID: {result.get('request_id')}, "
                           f"Sandbox tier: {result.get('sandbox_config', {}).get('tier', 'standard')}")
                self.stats["approvals_sent"] += 1
                return f"PENDING_APPROVAL:BUILD:{result.get('request_id')}"
            else:
                logger.error(f"TB Build handler returned unexpected status: {result}")
                return f"BUILD_ERROR:{result.get('error', 'unknown')}"

        except Exception as e:
            logger.error(f"Error in TB Build handler: {e}")
            return f"BUILD_ERROR:{str(e)}"

    def _handle_action_task(self, cmd: Command) -> str:
        """
        Route ACTION commands to TB Action Handler.
        REQ-TB-ACTION: Execute personal tasks via claude --print, email results back.
        No approval needed - executes immediately and emails results.

        Returns:
            str: Result status (COMPLETED, ACTION_ERROR, etc.)
        """
        try:
            logger.info(f"Routing to ACTION handler: {cmd.command_text[:80]}")
            handler = TBActionHandler()

            command_context = {
                "command_text": cmd.command_text,
                "source": cmd.source_channel,
                "sender": cmd.metadata.get("sender", "unknown"),
                "command_id": cmd.command_id,
                "raw_data": cmd.raw_data if isinstance(cmd.raw_data, dict) else {},
            }

            result = handler.handle_action(command_context)

            if result.get("status") == "COMPLETED":
                logger.info(f"ACTION completed: {cmd.command_id}, "
                           f"email_sent={result.get('email_sent')}, "
                           f"output_length={result.get('output_length')}")
                return "COMPLETED"
            else:
                logger.error(f"ACTION handler error: {result.get('error')}")
                return f"ACTION_ERROR:{result.get('error', 'unknown')}"

        except Exception as e:
            logger.error(f"Error in ACTION handler: {e}")
            return f"ACTION_ERROR:{str(e)}"

    def _check_approvals(self):
        """Check for approval responses and execute approved workflows."""
        if not self.orchestrator:
            return

        try:
            pending = self.orchestrator.list_pending_workflows()

            for workflow in pending:
                request_id = workflow.get("request_id")
                if request_id:
                    state = self.orchestrator.check_and_execute(request_id)
                    if state and state.phase in ["APPROVED", "COMPLETED", "REJECTED", "EXPIRED"]:
                        logger.info(f"Workflow {request_id} updated: {state.phase}")

        except Exception as e:
            logger.error(f"Error checking approvals: {e}")

    def _polling_loop(self):
        """Main polling loop for all channels."""
        intervals = self.config.get("polling_intervals", {})
        last_poll = {channel: 0 for channel in self.pollers}

        while self.running:
            current_time = time.time()

            for channel in self.pollers:
                interval = intervals.get(channel, 60)
                if current_time - last_poll[channel] >= interval:
                    self._poll_channel(channel)
                    last_poll[channel] = current_time

            time.sleep(5)  # Check every 5 seconds

    def _processing_loop(self):
        """Main processing loop for commands."""
        while self.running:
            self._process_commands()
            time.sleep(10)  # Process every 10 seconds

    def _approval_loop(self):
        """Main loop for checking approval responses."""
        while self.running:
            self._check_approvals()
            time.sleep(30)  # Check approvals every 30 seconds

    def _save_stats(self):
        """Save daemon statistics."""
        stats_file = self.state_path / "daemon_stats.json"
        self.stats["updated_at"] = datetime.now().isoformat()
        self.stats["store_stats"] = self.command_store.get_stats()
        stats_file.write_text(json.dumps(self.stats, indent=2))

    def _stats_loop(self):
        """Periodically save statistics."""
        while self.running:
            self._save_stats()
            time.sleep(60)  # Save stats every minute

    def run(self):
        """Run the daemon."""
        logger.info("="*60)
        logger.info("TB COMMAND DAEMON STARTING")
        logger.info("="*60)
        logger.info(f"Available pollers: {list(self.pollers.keys())}")
        logger.info(f"Orchestrator: {'Available' if self.orchestrator else 'Not available'}")
        logger.info("="*60)

        self.running = True
        self.stats["started_at"] = datetime.now().isoformat()

        # Start threads
        threads = [
            threading.Thread(target=self._polling_loop, name="polling", daemon=True),
            threading.Thread(target=self._processing_loop, name="processing", daemon=True),
            threading.Thread(target=self._approval_loop, name="approvals", daemon=True),
            threading.Thread(target=self._stats_loop, name="stats", daemon=True),
        ]

        for t in threads:
            t.start()
            logger.info(f"Started thread: {t.name}")

        # Main loop - keep daemon alive
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("Keyboard interrupt received")

        # Shutdown
        self.running = False
        logger.info("Waiting for threads to finish...")

        for t in threads:
            t.join(timeout=5)

        self._save_stats()
        logger.info("TB Command Daemon stopped")


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="TB Command Processing Daemon")
    parser.add_argument("--test", action="store_true", help="Run in test mode")
    parser.add_argument("--stats", action="store_true", help="Show current stats")
    parser.add_argument("--process", help="Process a single command")

    args = parser.parse_args()

    daemon = TBCommandDaemon()

    if args.stats:
        stats = daemon.command_store.get_stats()
        print(json.dumps(stats, indent=2))
        return

    if args.process:
        if daemon.orchestrator:
            state = daemon.orchestrator.process_request(args.process)
            print(f"Result: {state.phase if state else 'FAILED'}")
        else:
            print("Orchestrator not available")
        return

    if args.test:
        logger.info("Running in test mode")
        daemon.running = True
        daemon._poll_channel("transcript")
        daemon._process_commands()
        daemon._save_stats()
        print("Test completed. Check logs and state files.")
        return

    # Run daemon
    daemon.run()


if __name__ == "__main__":
    main()
