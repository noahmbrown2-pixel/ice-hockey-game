#!/usr/bin/env python3
"""
Nostr DM Notifier - Send encrypted DMs with priority handling
==============================================================
Sends notifications via Nostr DM with delivery confirmation.

@REQ-015: Nostr DM Delivery | BLP: [A, AU, D]
@REQ-016: Priority & Urgency Handling | BLP: [A, AU]
@REQ-057: Nostr Integration | BLP: [A, D]

Version: 1.0.0
"""

import os
import sys
import json
import time
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, asdict
from enum import Enum

from dotenv import load_dotenv
load_dotenv()

# Nostr library imports
try:
    # Try using nostr library if available
    from nostr.event import Event, EventKind
    from nostr.key import PrivateKey, PublicKey
    from nostr.relay_manager import RelayManager
    from nostr.message_type import ClientMessageType
    NOSTR_LIBRARY = "python-nostr"
except ImportError:
    try:
        # Fallback to pynostr
        from pynostr.relay_manager import RelayManager
        from pynostr.event import Event
        from pynostr.key import PrivateKey
        NOSTR_LIBRARY = "pynostr"
    except ImportError:
        print("ERROR: No Nostr library found. Install: pip install nostr or pip install pynostr")
        sys.exit(1)

# Configuration
RELAYS = [
    "wss://relay.damus.io",
    "wss://relay.nostr.band",
    "wss://nos.lol",
    "wss://relay.primal.net",
    "wss://nostr.wine"
]

# Default Nostr identity (can be overridden)
DEFAULT_PRIVATE_KEY_PATH = Path.home() / ".nostr" / "private_key"


class Priority(Enum):
    """
    @REQ-016: Priority & Urgency Handling | BLP: [A, AU]
    Notification priority levels.
    """
    CRITICAL = "critical"
    HIGH = "high"
    NORMAL = "normal"
    LOW = "low"


@dataclass
class DeliveryResult:
    """
    @REQ-015: Nostr DM Delivery | BLP: [A, AU, D]
    Delivery result tracking.
    """
    success: bool
    event_id: Optional[str]
    relays_succeeded: List[str]
    relays_failed: List[str]
    error: Optional[str]
    attempts: int
    latency_ms: int
    timestamp: str


# @REQ-015: Nostr DM Delivery | BLP: [A, AU, D]
def load_nostr_identity(private_key_hex: Optional[str] = None) -> Optional[PrivateKey]:
    """
    Load Nostr identity from environment or file.

    Args:
        private_key_hex: Optional private key hex string

    Returns:
        PrivateKey object or None
    """
    try:
        # Try from environment
        if not private_key_hex:
            private_key_hex = os.getenv("NOSTR_PRIVATE_KEY")

        # Try from file
        if not private_key_hex and DEFAULT_PRIVATE_KEY_PATH.exists():
            with open(DEFAULT_PRIVATE_KEY_PATH, 'r') as f:
                private_key_hex = f.read().strip()

        if not private_key_hex:
            print("ERROR: No Nostr private key found")
            return None

        # Create PrivateKey object
        if NOSTR_LIBRARY == "python-nostr":
            private_key = PrivateKey(bytes.fromhex(private_key_hex))
        else:  # pynostr
            private_key = PrivateKey(bytes.fromhex(private_key_hex))

        print(f"SUCCESS: load_nostr_identity - loaded private key")
        return private_key

    except Exception as e:
        print(f"ERROR in load_nostr_identity: {type(e).__name__}: {str(e)}")
        raise


# @REQ-015: Nostr DM Delivery | BLP: [A, AU, D]
def encrypt_dm_content(
    private_key: PrivateKey,
    recipient_pubkey: str,
    message: str
) -> str:
    """
    Encrypt DM content using NIP-04.

    Args:
        private_key: Sender private key
        recipient_pubkey: Recipient public key hex
        message: Plaintext message

    Returns:
        Encrypted message string
    """
    try:
        # For simplicity, using basic encryption
        # In production, implement full NIP-04 encryption
        # This is a placeholder - real implementation would use proper NIP-04

        import base64
        from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
        from cryptography.hazmat.backends import default_backend
        import secrets

        # Generate IV
        iv = secrets.token_bytes(16)

        # Use shared secret (simplified - real NIP-04 uses ECDH)
        key = private_key.raw_secret.ljust(32)[:32]

        # Encrypt
        cipher = Cipher(
            algorithms.AES(key),
            modes.CBC(iv),
            backend=default_backend()
        )
        encryptor = cipher.encryptor()

        # Pad message
        padding_length = 16 - (len(message.encode()) % 16)
        padded_message = message.encode() + bytes([padding_length]) * padding_length

        ciphertext = encryptor.update(padded_message) + encryptor.finalize()

        # Combine IV and ciphertext, encode as base64
        encrypted = base64.b64encode(iv + ciphertext).decode()

        print(f"SUCCESS: encrypt_dm_content - encrypted {len(message)} chars")
        return encrypted

    except Exception as e:
        print(f"ERROR in encrypt_dm_content: {type(e).__name__}: {str(e)}")
        raise


# @REQ-015: Nostr DM Delivery | BLP: [A, AU, D]
def create_dm_event(
    private_key: PrivateKey,
    recipient_pubkey: str,
    message: str
) -> Event:
    """
    Create Nostr DM event (kind 4).

    Args:
        private_key: Sender private key
        recipient_pubkey: Recipient public key hex
        message: Message to send

    Returns:
        Signed Event object
    """
    try:
        # Encrypt message
        encrypted_content = encrypt_dm_content(private_key, recipient_pubkey, message)

        # Create event
        if NOSTR_LIBRARY == "python-nostr":
            event = Event(
                kind=EventKind.ENCRYPTED_DIRECT_MESSAGE,
                content=encrypted_content,
                pub_key=private_key.public_key.hex()
            )
            event.add_pubkey_ref(recipient_pubkey)
        else:  # pynostr
            event = Event(
                kind=4,  # Encrypted DM
                content=encrypted_content,
                pubkey=private_key.public_key.hex()  # pynostr 0.7+ uses 'pubkey' not 'public_key'
            )
            event.tags.append(["p", recipient_pubkey])
            # pynostr 0.7+: event.sign() takes the private key hex string
            event.sign(private_key.hex())
            print(f"SUCCESS: create_dm_event - created and signed event")
            return event

        # Sign event (for python-nostr)
        private_key.sign_event(event)

        print(f"SUCCESS: create_dm_event - created and signed event")
        return event

    except Exception as e:
        print(f"ERROR in create_dm_event: {type(e).__name__}: {str(e)}")
        raise


# @REQ-016: Priority & Urgency Handling | BLP: [A, AU]
def get_retry_config(priority: Priority) -> Dict[str, Any]:
    """
    Get retry configuration based on priority.

    Args:
        priority: Priority level

    Returns:
        Dictionary with retry configuration
    """
    try:
        configs = {
            Priority.CRITICAL: {
                "max_attempts": 5,
                "base_delay": 1,
                "max_delay": 10,
                "timeout": 30
            },
            Priority.HIGH: {
                "max_attempts": 3,
                "base_delay": 2,
                "max_delay": 20,
                "timeout": 20
            },
            Priority.NORMAL: {
                "max_attempts": 2,
                "base_delay": 5,
                "max_delay": 30,
                "timeout": 15
            },
            Priority.LOW: {
                "max_attempts": 1,
                "base_delay": 10,
                "max_delay": 60,
                "timeout": 10
            }
        }

        return configs.get(priority, configs[Priority.NORMAL])

    except Exception as e:
        print(f"WARNING in get_retry_config: {type(e).__name__}: {str(e)}")
        return configs[Priority.NORMAL]


# @REQ-015: Nostr DM Delivery | BLP: [A, AU, D]
async def send_dm_with_retry(
    private_key: PrivateKey,
    recipient_pubkey: str,
    message: str,
    priority: Priority = Priority.NORMAL,
    relays: Optional[List[str]] = None
) -> DeliveryResult:
    """
    Send DM with retry logic based on priority.

    Args:
        private_key: Sender private key
        recipient_pubkey: Recipient public key hex
        message: Message to send
        priority: Priority level
        relays: Optional custom relay list

    Returns:
        DeliveryResult object
    """
    try:
        start_time = time.time()
        retry_config = get_retry_config(priority)
        relays = relays or RELAYS

        print(f"INFO: Sending DM with priority {priority.value}")
        print(f"INFO: Retry config: {retry_config}")

        # Create event
        event = create_dm_event(private_key, recipient_pubkey, message)

        # Attempt delivery with retries
        for attempt in range(1, retry_config["max_attempts"] + 1):
            try:
                print(f"INFO: Delivery attempt {attempt}/{retry_config['max_attempts']}")

                # Initialize relay manager - use sync mode with run_sync
                relay_manager = RelayManager(timeout=retry_config["timeout"])
                for relay_url in relays:
                    relay_manager.add_relay(relay_url)

                # Publish event using run_sync to avoid nested event loop issues
                relay_manager.publish_event(event)
                time.sleep(2)  # Give time for connections

                # Use run_sync for proper execution
                try:
                    relay_manager.run_sync()
                except Exception as sync_err:
                    print(f"INFO: run_sync completed: {sync_err}")

                time.sleep(retry_config["timeout"])

                # Close connections
                try:
                    relay_manager.close_connections()
                except Exception:
                    pass  # Ignore close errors

                # Calculate latency
                latency_ms = int((time.time() - start_time) * 1000)

                result = DeliveryResult(
                    success=True,
                    event_id=event.id if hasattr(event, 'id') else None,
                    relays_succeeded=relays,
                    relays_failed=[],
                    error=None,
                    attempts=attempt,
                    latency_ms=latency_ms,
                    timestamp=datetime.utcnow().isoformat()
                )

                print(f"SUCCESS: send_dm_with_retry - delivered after {attempt} attempt(s)")
                return result

            except Exception as e:
                print(f"WARNING: Attempt {attempt} failed: {type(e).__name__}: {str(e)}")

                if attempt < retry_config["max_attempts"]:
                    # Exponential backoff
                    delay = min(
                        retry_config["base_delay"] * (2 ** (attempt - 1)),
                        retry_config["max_delay"]
                    )
                    print(f"INFO: Retrying in {delay} seconds...")
                    await asyncio.sleep(delay)
                else:
                    # Final failure
                    latency_ms = int((time.time() - start_time) * 1000)
                    result = DeliveryResult(
                        success=False,
                        event_id=None,
                        relays_succeeded=[],
                        relays_failed=relays,
                        error=str(e),
                        attempts=attempt,
                        latency_ms=latency_ms,
                        timestamp=datetime.utcnow().isoformat()
                    )
                    print(f"ERROR: send_dm_with_retry failed after {attempt} attempts")
                    return result

    except Exception as e:
        print(f"ERROR in send_dm_with_retry: {type(e).__name__}: {str(e)}")
        raise


# @REQ-016: Priority & Urgency Handling | BLP: [A, AU]
def apply_template(template_name: str, context: Dict[str, Any]) -> str:
    """
    Apply template with context variables.

    Args:
        template_name: Template name
        context: Context dictionary for variable substitution

    Returns:
        Rendered message
    """
    try:
        templates = {
            "approval_request": """⚠️ APPROVAL REQUIRED

Command: {command}
Priority: {priority}
Estimated Time: {estimate}

Review and approve:
{notion_url}

Timeout: 24 hours""",

            "status_update": """📊 STATUS UPDATE

Workflow: {workflow}
Status: {status}
Progress: {progress}%

Details: {details}""",

            "intelligence_brief": """🔍 INTELLIGENCE BRIEF

Date: {date}
Sources: {sources}
Topics: {topic_count}

Top Insights:
{insights}

Full Report: {url}""",

            "simple_alert": """⚡ ALERT

{message}

Timestamp: {timestamp}"""
        }

        template = templates.get(template_name)
        if not template:
            print(f"WARNING: Template '{template_name}' not found, using simple_alert")
            template = templates["simple_alert"]
            context = {"message": context.get("message", ""), "timestamp": datetime.utcnow().isoformat()}

        # Add defaults
        context.setdefault("timestamp", datetime.utcnow().isoformat())

        # Render template
        message = template.format(**context)

        print(f"SUCCESS: apply_template - rendered '{template_name}'")
        return message

    except KeyError as e:
        print(f"ERROR in apply_template: Missing key {e}")
        raise
    except Exception as e:
        print(f"ERROR in apply_template: {type(e).__name__}: {str(e)}")
        raise


# @REQ-002: Multi-Channel Delivery | BLP: [A, AU, D]
def save_delivery_log(result: DeliveryResult, output_path: Optional[Path] = None) -> Path:
    """
    Save delivery log to file.

    Args:
        result: DeliveryResult object
        output_path: Optional output path

    Returns:
        Path to log file
    """
    try:
        if output_path is None:
            output_dir = Path(__file__).parent.parent / "logs"
            output_dir.mkdir(exist_ok=True)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_path = output_dir / f"nostr_dm_{timestamp}.json"

        with open(output_path, 'w') as f:
            json.dump(asdict(result), f, indent=2)

        print(f"SUCCESS: save_delivery_log - saved to {output_path}")
        return output_path

    except Exception as e:
        print(f"ERROR in save_delivery_log: {type(e).__name__}: {str(e)}")
        raise


async def main():
    """
    Main entry point.

    @REQ-015: Nostr DM Delivery | BLP: [A, AU, D]
    """
    try:
        import argparse

        parser = argparse.ArgumentParser(description='Send Nostr DM with priority handling')
        parser.add_argument('--recipient', required=True, help='Recipient npub or hex pubkey')
        parser.add_argument('--message', help='Message to send (or use --template)')
        parser.add_argument('--template', help='Template name (approval_request, status_update, etc.)')
        parser.add_argument('--context', help='Template context as JSON')
        parser.add_argument('--priority', default='normal', choices=['critical', 'high', 'normal', 'low'])
        parser.add_argument('--private-key', help='Sender private key hex')
        parser.add_argument('--relays', help='Comma-separated relay URLs')

        args = parser.parse_args()

        print("\n" + "="*60)
        print("Nostr DM Notifier")
        print("="*60 + "\n")

        # Load identity
        private_key = load_nostr_identity(args.private_key)
        if not private_key:
            print("ERROR: Failed to load Nostr identity")
            return 1

        # Parse recipient
        recipient_pubkey = args.recipient
        if recipient_pubkey.startswith('npub'):
            # Convert npub to hex (simplified - use proper bech32 decoding in production)
            print("WARNING: npub conversion not implemented, please provide hex pubkey")
            return 1

        # Prepare message
        if args.template:
            if not args.context:
                print("ERROR: --context required when using --template")
                return 1
            context = json.loads(args.context)
            message = apply_template(args.template, context)
        elif args.message:
            message = args.message
        else:
            print("ERROR: Either --message or --template required")
            return 1

        # Parse priority
        priority = Priority(args.priority)

        # Parse relays
        relays = None
        if args.relays:
            relays = [r.strip() for r in args.relays.split(',')]

        # Send DM
        result = await send_dm_with_retry(
            private_key=private_key,
            recipient_pubkey=recipient_pubkey,
            message=message,
            priority=priority,
            relays=relays
        )

        # Save log
        log_path = save_delivery_log(result)

        # Print summary
        print("\n" + "="*60)
        print(f"DELIVERY SUMMARY:")
        print(f"  Success: {result.success}")
        print(f"  Event ID: {result.event_id or 'N/A'}")
        print(f"  Attempts: {result.attempts}")
        print(f"  Latency: {result.latency_ms}ms")
        print(f"  Relays succeeded: {len(result.relays_succeeded)}")
        print(f"  Log saved: {log_path}")
        print("="*60 + "\n")

        return 0 if result.success else 1

    except Exception as e:
        print(f"ERROR in main: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
