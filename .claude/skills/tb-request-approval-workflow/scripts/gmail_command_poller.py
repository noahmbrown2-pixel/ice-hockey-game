#!/usr/bin/env python3
"""
Gmail Command Poller - Extract commands from Gmail inbox

REQ-CH-001: Gmail command extraction with auto-labeling
BLP: Durability (D), Self-Improvement (SI), Autonomy (AU)

Polls Gmail inbox for emails from authorized senders:
- craigmbrown@gmail.com
- babyproject418@gmail.com

Extracts commands and marks processed with 'tb-processed' label.

IMPORTANT NOTE: METADATA SCOPE LIMITATION
==========================================
The current Gmail token has 'metadata' scope only, which means:
- Can read: Subject, From, Date headers
- Cannot read: Email body content

WORKAROUND: Commands are extracted from the email SUBJECT line only.

TO UPGRADE TO FULL ACCESS:
1. Run: python3 /home/craigmbrown/.config/google_api/setup_full_gmail_access.py
2. Follow OAuth flow to grant 'gmail.readonly' scope
3. This will enable full email body access
"""

import pickle
import os
import json
import traceback
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from pathlib import Path
from googleapiclient.discovery import build
from google.auth.transport.requests import Request

# Import CommandStore
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from command_store import CommandStore


# REQ-CH-001: Configuration
GMAIL_TOKEN_PATH = "/home/craigmbrown/.config/google_api/gmail_full_token.pickle"
AUTHORIZED_SENDERS = ["craigmbrown@gmail.com", "babyproject418@gmail.com"]
POLL_INTERVAL_SECONDS = 300  # 5 minutes
PROCESSED_LABEL = "tb-processed"


class GmailCommandPoller:
    """
    Gmail command extractor with auto-labeling.

    REQ-CH-001: Extract commands from authorized Gmail senders
    BLP: Durability (D) - State persistence
         Self-Improvement (SI) - Track API failures
         Autonomy (AU) - Auto-recovery from transient errors
    """

    def __init__(
        self,
        command_store: CommandStore,
        state_dir: str = "/home/craigmbrown/Project/.claude/skills/tb-request-approval-workflow/state"
    ):
        """
        Initialize Gmail command poller.

        Args:
            command_store: CommandStore instance for persisting commands
            state_dir: Directory for state persistence
        """
        self.command_store = command_store
        self.state_dir = Path(state_dir)
        self.state_file = self.state_dir / "gmail_poll_state.json"

        # Ensure state directory exists
        self.state_dir.mkdir(parents=True, exist_ok=True)

        # Load state
        self.state = self._load_state()

        # Initialize Gmail service
        self.service = self._init_gmail_service()

        # Get or create tb-processed label
        self.processed_label_id = self._get_or_create_label(PROCESSED_LABEL)

        print(f"[GmailPoller] Initialized with state file: {self.state_file}")
        print(f"[GmailPoller] Processed label ID: {self.processed_label_id}")

    def _load_state(self) -> Dict[str, Any]:
        """
        Load polling state from disk.

        REQ-CH-001: State persistence for resumable polling
        BLP: Durability (D)

        Returns:
            State dictionary with last_poll_time, processed_ids, error_count
        """
        default_state = {
            "last_poll_time": None,
            "processed_ids": [],
            "error_count": 0,
            "last_error": None,
            "total_commands_extracted": 0
        }

        if not self.state_file.exists():
            print(f"[GmailPoller] No existing state file, using defaults")
            return default_state

        try:
            with open(self.state_file, 'r') as f:
                state = json.load(f)
            print(f"[GmailPoller] Loaded state: last_poll={state.get('last_poll_time')}, "
                  f"processed_count={len(state.get('processed_ids', []))}")
            return state
        except Exception as e:
            print(f"[GmailPoller] WARNING: Failed to load state: {e}, using defaults")
            return default_state

    def _save_state(self):
        """
        Persist polling state to disk.

        REQ-CH-001: State persistence
        BLP: Durability (D)
        """
        try:
            with open(self.state_file, 'w') as f:
                json.dump(self.state, f, indent=2)
            print(f"[GmailPoller] Saved state: processed_count={len(self.state['processed_ids'])}")
        except Exception as e:
            print(f"[GmailPoller] ERROR saving state: {e}")

    def _init_gmail_service(self):
        """
        Initialize Gmail API service with credentials.

        REQ-CH-001: Gmail API authentication
        BLP: Autonomy (AU) - Auto-refresh expired tokens

        Returns:
            Gmail API service instance

        Raises:
            FileNotFoundError: If token not found
            Exception: If authentication fails
        """
        if not os.path.exists(GMAIL_TOKEN_PATH):
            error_msg = f"Gmail token not found: {GMAIL_TOKEN_PATH}"
            print(f"[GmailPoller] ERROR: {error_msg}")
            raise FileNotFoundError(error_msg)

        try:
            # Load credentials
            with open(GMAIL_TOKEN_PATH, 'rb') as token:
                creds = pickle.load(token)

            # Refresh if expired
            if creds.expired and creds.refresh_token:
                print("[GmailPoller] Token expired, refreshing...")
                creds.refresh(Request())

                # Save refreshed token
                with open(GMAIL_TOKEN_PATH, 'wb') as token:
                    pickle.dump(creds, token)
                print("[GmailPoller] Token refreshed and saved")

            # Build service
            service = build('gmail', 'v1', credentials=creds)
            print(f"[GmailPoller] Gmail service initialized successfully")

            # Test connection
            profile = service.users().getProfile(userId='me').execute()
            print(f"[GmailPoller] Connected as: {profile.get('emailAddress')}")

            return service

        except Exception as e:
            print(f"[GmailPoller] ERROR initializing Gmail service: {e}")
            raise

    def _get_or_create_label(self, label_name: str) -> str:
        """
        Get existing label ID or create new label.

        REQ-CH-001: Auto-create tb-processed label
        BLP: Autonomy (AU)

        Args:
            label_name: Label name to find or create

        Returns:
            Label ID
        """
        try:
            # List existing labels
            results = self.service.users().labels().list(userId='me').execute()
            labels = results.get('labels', [])

            # Check if label already exists
            for label in labels:
                if label['name'] == label_name:
                    print(f"[GmailPoller] Found existing label: {label_name} (ID: {label['id']})")
                    return label['id']

            # Create new label
            label_object = {
                'name': label_name,
                'messageListVisibility': 'show',
                'labelListVisibility': 'labelShow'
            }

            created_label = self.service.users().labels().create(
                userId='me',
                body=label_object
            ).execute()

            print(f"[GmailPoller] Created new label: {label_name} (ID: {created_label['id']})")
            return created_label['id']

        except Exception as e:
            print(f"[GmailPoller] ERROR managing label '{label_name}': {e}")
            raise

    def _extract_email_address(self, from_header: str) -> Optional[str]:
        """
        Extract email address from 'From' header.

        Args:
            from_header: Email 'From' header (e.g., "John Doe <john@example.com>")

        Returns:
            Extracted email address or None
        """
        try:
            # Handle format: "Name <email@example.com>" or just "email@example.com"
            if '<' in from_header and '>' in from_header:
                start = from_header.index('<') + 1
                end = from_header.index('>')
                return from_header[start:end].strip().lower()
            else:
                return from_header.strip().lower()
        except Exception as e:
            print(f"[GmailPoller] WARNING: Failed to extract email from '{from_header}': {e}")
            return None

    def _get_message_body(self, message: Dict) -> str:
        """
        Extract plain text body from Gmail message.

        Args:
            message: Gmail message object

        Returns:
            Plain text body content
        """
        try:
            payload = message.get('payload', {})

            # Handle simple plain text body
            if payload.get('mimeType') == 'text/plain':
                data = payload.get('body', {}).get('data', '')
                if data:
                    import base64
                    return base64.urlsafe_b64decode(data).decode('utf-8')

            # Handle multipart messages
            parts = payload.get('parts', [])
            for part in parts:
                if part.get('mimeType') == 'text/plain':
                    data = part.get('body', {}).get('data', '')
                    if data:
                        import base64
                        return base64.urlsafe_b64decode(data).decode('utf-8')

            # If no plain text, return empty string
            return ""

        except Exception as e:
            print(f"[GmailPoller] WARNING: Failed to extract body: {e}")
            return ""

    def _clean_command_text(self, text: str) -> str:
        """
        Clean and normalize command text.

        Args:
            text: Raw command text

        Returns:
            Cleaned command text
        """
        # Remove extra whitespace
        text = ' '.join(text.split())

        # Remove common email artifacts
        text = text.replace('\r\n', ' ').replace('\n', ' ')

        # Trim to reasonable length
        if len(text) > 500:
            text = text[:500] + "..."

        return text.strip()

    def _generate_embedding_hash(self, text: str) -> str:
        """
        Generate hash for deduplication.

        Args:
            text: Command text

        Returns:
            SHA256 hash of normalized text
        """
        normalized = text.lower().strip()
        return hashlib.sha256(normalized.encode('utf-8')).hexdigest()

    def poll(self) -> List[Dict]:
        """
        Poll Gmail inbox for new commands from authorized senders.

        REQ-CH-001: Poll Gmail, extract commands, mark processed
        BLP: Self-Improvement (SI) - Track errors
             Autonomy (AU) - Auto-retry on transient failures

        Returns:
            List of newly extracted commands with metadata

        Raises:
            Exception: On critical errors (after retry)
        """
        try:
            print(f"[GmailPoller] Starting poll at {datetime.now().isoformat()}")

            # Get recent messages (without query, to work with metadata scope)
            # We'll filter by sender manually
            results = self.service.users().messages().list(
                userId='me',
                maxResults=100  # Get more to filter from
            ).execute()

            all_message_ids = [msg['id'] for msg in results.get('messages', [])]

            if not all_message_ids:
                print(f"[GmailPoller] No emails found in inbox")
                self.state['last_poll_time'] = datetime.now().isoformat()
                self._save_state()
                return []

            print(f"[GmailPoller] Fetched {len(all_message_ids)} recent emails")

            # Filter messages by checking sender and processed label
            message_ids = []
            for msg_id in all_message_ids:
                try:
                    # Get minimal message info
                    message = self.service.users().messages().get(
                        userId='me',
                        id=msg_id,
                        format='metadata',
                        metadataHeaders=['From']
                    ).execute()

                    # Check if already processed
                    labels = message.get('labelIds', [])
                    if self.processed_label_id in labels:
                        continue

                    # Check sender
                    headers = message['payload'].get('headers', [])
                    from_header = next((h['value'] for h in headers if h['name'] == 'From'), '')
                    sender_email = self._extract_email_address(from_header)

                    if sender_email in AUTHORIZED_SENDERS:
                        message_ids.append(msg_id)

                except Exception as e:
                    print(f"[GmailPoller] WARNING: Error checking message {msg_id}: {e}")
                    continue

            if not message_ids:
                print(f"[GmailPoller] No new emails from authorized senders")
                self.state['last_poll_time'] = datetime.now().isoformat()
                self._save_state()
                return []

            print(f"[GmailPoller] Found {len(message_ids)} emails from authorized senders to process")

            # Extract commands from each email
            extracted_commands = []

            for msg_id in message_ids:
                try:
                    command_data = self._process_email(msg_id)
                    if command_data:
                        extracted_commands.append(command_data)
                except Exception as e:
                    print(f"[GmailPoller] ERROR processing email {msg_id}: {e}")
                    # Continue processing other emails
                    continue

            # Update state
            self.state['last_poll_time'] = datetime.now().isoformat()
            self.state['total_commands_extracted'] += len(extracted_commands)
            self.state['error_count'] = 0  # Reset on success
            self.state['last_error'] = None
            self._save_state()

            print(f"[GmailPoller] Successfully extracted {len(extracted_commands)} commands")
            return extracted_commands

        except Exception as e:
            # REQ-CH-001: Error tracking for self-improvement
            self.state['error_count'] = self.state.get('error_count', 0) + 1
            self.state['last_error'] = {
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'traceback': traceback.format_exc()
            }
            self._save_state()

            print(f"[GmailPoller] ERROR during poll: {e}")
            print(f"[GmailPoller] Error count: {self.state['error_count']}")

            # BLP: Autonomy (AU) - Auto-retry with backoff
            if self.state['error_count'] < 3:
                print(f"[GmailPoller] Will retry on next poll cycle")
            else:
                print(f"[GmailPoller] ERROR threshold reached, manual intervention may be needed")

            raise

    def _process_email(self, msg_id: str) -> Optional[Dict]:
        """
        Process a single email and extract command.

        REQ-CH-001: Extract command from email

        Args:
            msg_id: Gmail message ID

        Returns:
            Command data dict or None if invalid
        """
        try:
            # Get message - try full format first, fall back to metadata if scope limited
            try:
                message = self.service.users().messages().get(
                    userId='me',
                    id=msg_id,
                    format='full'
                ).execute()
            except Exception as e:
                if 'Metadata scope' in str(e):
                    # Fall back to metadata format if full not allowed
                    print(f"[GmailPoller] Full format denied, using metadata format")
                    message = self.service.users().messages().get(
                        userId='me',
                        id=msg_id,
                        format='metadata',
                        metadataHeaders=['From', 'Subject', 'Date']
                    ).execute()
                else:
                    raise

            # Extract headers
            headers = message['payload'].get('headers', [])
            from_header = next((h['value'] for h in headers if h['name'] == 'From'), '')
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
            date_header = next((h['value'] for h in headers if h['name'] == 'Date'), '')

            # Validate sender
            sender_email = self._extract_email_address(from_header)
            if sender_email not in AUTHORIZED_SENDERS:
                print(f"[GmailPoller] Skipping email from unauthorized sender: {sender_email}")
                return None

            # Extract email body content (if available from full format)
            # For metadata format, use snippet instead
            if 'parts' in message.get('payload', {}):
                body_text = self._get_message_body(message)
            else:
                # Metadata format - use snippet as body fallback
                body_text = message.get('snippet', '')

            # Extract user question from email body (before checking for workflow commands)
            # The body often contains the user's actual question/context that the subject alone misses
            import re
            user_question = ""
            if body_text:
                # Clean body: strip signature blocks, forwarded headers, and whitespace
                clean_body = body_text.strip()
                # Remove common email signature patterns
                for sig_marker in ['\n--\n', '\nCMB\n', '\nCraig M. Brown', '\nSent from']:
                    sig_idx = clean_body.find(sig_marker)
                    if sig_idx > 0:
                        clean_body = clean_body[:sig_idx].strip()
                if clean_body and clean_body != subject:
                    user_question = clean_body
                    print(f"[GmailPoller] Extracted user_question from body: {user_question[:80]}...")

            # Check for workflow commands in body (from mailto: links)
            workflow_match = re.search(r'/run-workflow[^\s\n]+(?:\s+--[^\s]+\s+"[^"]*")*', body_text) if body_text else None

            if workflow_match:
                # Found a workflow command in body - use it
                original_text = workflow_match.group(0)
                print(f"[GmailPoller] Found workflow command in body: {original_text[:80]}...")
            else:
                # Fall back to subject
                original_text = subject

            # Skip system-generated approval/notification emails to prevent recursive loops
            skip_patterns = [
                'TB-APPROVAL',           # Approval notification emails
                '[TB-APPROVAL]',         # Bracketed version
                'Re: [TB-APPROVAL]',     # Replies to approval emails
                'APPROVE ',              # Approval responses
                'REJECT ',               # Rejection responses
                'TB REQUEST STATUS',     # Status notifications
                'GenUI Dashboard',       # Dashboard notifications
                'PR #',                  # PR notifications
                'Successfully Merged',   # Merge notifications
            ]

            if any(pattern in subject for pattern in skip_patterns):
                print(f"[GmailPoller] Skipping system notification email: {subject[:50]}...")
                self.mark_processed(msg_id)
                return None

            cleaned_text = self._clean_command_text(original_text)

            if not cleaned_text or cleaned_text == 'No Subject':
                print(f"[GmailPoller] Skipping email with empty/no subject: {msg_id}")
                self.mark_processed(msg_id)
                return None

            # Log what we're using as the command source
            print(f"[GmailPoller] Using {'body' if workflow_match else 'subject'} as command source")

            # Check for duplicates using CommandStore's processed hashes
            dedup_hash = self.command_store._compute_hash(cleaned_text, "gmail")
            processed_hashes = self.command_store._load_processed()
            if dedup_hash in processed_hashes:
                print(f"[GmailPoller] Duplicate command detected: {dedup_hash[:8]}...")
                self.mark_processed(msg_id)
                return None

            # Create Command object and add to store
            command_id = f"gmail-{msg_id}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            from command_store import Command
            command = Command(
                command_id=command_id,
                source_channel="gmail",
                command_text=cleaned_text,
                raw_data={
                    "email_id": msg_id,
                    "subject": subject,
                    "from": from_header,
                    "date": date_header,
                    "body_excerpt": (user_question or "")[:200],
                },
                detected_at=datetime.now().isoformat(),
                priority=5,
                metadata={
                    "original_text": original_text,
                    "user_question": user_question,
                }
            )
            added = self.command_store.add_command(command)
            if not added:
                print(f"[GmailPoller] Command already exists (dedup): {command_id}")
                self.mark_processed(msg_id)
                return None

            # Mark email as processed
            self.mark_processed(msg_id)

            # Add to processed list
            self.state['processed_ids'].append(msg_id)

            # Prepare result
            result = {
                'command_id': command_id,
                'email_id': msg_id,
                'sender': sender_email,
                'subject': subject,
                'cleaned_text': cleaned_text,
                'user_question': user_question,
                'source': 'gmail',
                'timestamp': datetime.now().isoformat()
            }

            print(f"[GmailPoller] Extracted command {command_id} from email {msg_id}")
            print(f"[GmailPoller]   Subject: {subject[:60]}...")
            print(f"[GmailPoller]   Text: {cleaned_text[:80]}...")

            return result

        except Exception as e:
            print(f"[GmailPoller] ERROR processing email {msg_id}: {e}")
            traceback.print_exc()
            return None

    def mark_processed(self, email_id: str) -> bool:
        """
        Mark email with tb-processed label.

        REQ-CH-001: Auto-label processed emails

        Args:
            email_id: Gmail message ID

        Returns:
            True if successful, False otherwise
        """
        try:
            self.service.users().messages().modify(
                userId='me',
                id=email_id,
                body={'addLabelIds': [self.processed_label_id]}
            ).execute()

            print(f"[GmailPoller] Marked email {email_id} as processed")
            return True

        except Exception as e:
            print(f"[GmailPoller] ERROR marking email {email_id} as processed: {e}")
            return False

    def get_poll_state(self) -> Dict:
        """
        Get current polling state.

        Returns:
            State dictionary with statistics
        """
        return {
            'last_poll_time': self.state.get('last_poll_time'),
            'processed_count': len(self.state.get('processed_ids', [])),
            'total_commands_extracted': self.state.get('total_commands_extracted', 0),
            'error_count': self.state.get('error_count', 0),
            'last_error': self.state.get('last_error'),
            'state_file': str(self.state_file)
        }


# ========== CLI Testing ==========

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Gmail Command Poller for TB Command Pipeline')
    parser.add_argument('--test', action='store_true', help='Run test mode')
    parser.add_argument('--status', action='store_true', help='Show polling status')
    args = parser.parse_args()

    print("=" * 60)
    print("Gmail Command Poller - TB Request Approval Workflow")
    print("=" * 60)
    print()

    try:
        # Initialize command store
        print("1. Initializing command store...")
        store = CommandStore()
        print("   SUCCESS: Command store ready")
        print()

        # Initialize Gmail poller
        print("2. Initializing Gmail poller...")
        poller = GmailCommandPoller(command_store=store)
        print("   SUCCESS: Gmail poller ready")
        print()

        if args.status:
            # Show status
            print("3. Polling status:")
            state = poller.get_poll_state()
            print(f"   Last poll: {state['last_poll_time']}")
            print(f"   Processed emails: {state['processed_count']}")
            print(f"   Commands extracted: {state['total_commands_extracted']}")
            print(f"   Error count: {state['error_count']}")
            if state['last_error']:
                print(f"   Last error: {state['last_error']['timestamp']}")
                print(f"                {state['last_error']['error']}")
            print(f"   State file: {state['state_file']}")

            result = {
                'status': 'ok',
                'state': state
            }
            print(f"\n[SUCCESS] gmail: {json.dumps(result)}")

        else:
            # Run poll
            print("3. Polling Gmail inbox...")
            commands = poller.poll()
            print(f"   SUCCESS: Extracted {len(commands)} commands")
            print()

            # Show results
            if commands:
                print("4. Extracted commands:")
                for i, cmd in enumerate(commands, 1):
                    print(f"   {i}. Command ID: {cmd['command_id']}")
                    print(f"      Email ID: {cmd['email_id']}")
                    print(f"      Sender: {cmd['sender']}")
                    print(f"      Subject: {cmd['subject'][:60]}...")
                    print(f"      Text: {cmd['cleaned_text'][:80]}...")
                    print()
            else:
                print("4. No new commands found")
                print()

            # Show state
            print("5. Updated state:")
            state = poller.get_poll_state()
            print(f"   Total processed: {state['processed_count']}")
            print(f"   Total extracted: {state['total_commands_extracted']}")
            print()

            result = {
                'commands_extracted': len(commands),
                'commands': commands,
                'state': state
            }
            print(f"[SUCCESS] gmail: {json.dumps(result)}")

    except Exception as e:
        error_result = {
            'error': str(e),
            'error_type': type(e).__name__
        }
        print(f"[ERROR] gmail: {type(e).__name__}: {e}")
        print(f"[TRACEBACK] {traceback.format_exc()}")
        sys.exit(1)

    print()
    print("=" * 60)
    print("Test complete!")
    print("=" * 60)
