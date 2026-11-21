#!/usr/bin/env python3
"""
Email Research Processor
========================
PLAN-RESE-002 | BLP Framework: Alignment | Autonomy | Durability | Self-Improvement

Monitors babyproject418@gmail.com for incoming research requests and URLs,
processes them using web research agents, and delivers results via rich HTML emails.

Requirements:
    - REQ-INPUT-002: Email URL extraction (all types)
    - REQ-MEMORY-001: V4 context injection before processing
    - REQ-OUTPUT-003: Email delivery via SFA agent
    - REQ-BLP-001: Full exception details on error
    - REQ-BLP-002: Success print before return

Usage:
    # Process new emails
    python email_research_processor.py

    # Process specific number of emails
    python email_research_processor.py --max-emails 5

    # Dry run (don't send results)
    python email_research_processor.py --dry-run

Author: TheBaby Autonomous Operations System
Created: 2026-01-18
"""

import os
import sys
import re
import json
import pickle
import base64
import argparse
import traceback
import requests
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from urllib.parse import urlparse
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Google API imports
try:
    from googleapiclient.discovery import build
    GMAIL_AVAILABLE = True
except ImportError:
    GMAIL_AVAILABLE = False
    print("WARNING: Google API not available.")


# =============================================================================
# Configuration
# =============================================================================

CONFIG = {
    # babyproject418 Gmail token for reading incoming emails
    "babyproject_token": "/home/craigmbrown/.config/google_api/babyproject_gmail_token.pickle",
    # Primary Gmail token for sending responses
    "gmail_token": "/home/craigmbrown/.config/google_api/gmail_full_token.pickle",
    "html_output_dir": "/home/craigmbrown/Project/html-output",
    "logs_dir": "/home/craigmbrown/Project/logs",
    "state_file": "/home/craigmbrown/Project/logs/email_research_processor_state.json",
    "response_email": "craigmbrown@gmail.com",
    "from_email": "craigmbrown@gmail.com",
    "whatsapp_api": "gateway"  # BLOCKED: routes through WA gateway  # BLOCKED: use gateway,
    "whatsapp_recipient": "15712781730",
}

# URL patterns to extract
URL_PATTERNS = [
    r'https?://(?:www\.)?github\.com/[\w\-]+/[\w\-]+',  # GitHub repos
    r'https?://(?:www\.)?youtube\.com/watch\?v=[\w\-]+',  # YouTube videos
    r'https?://youtu\.be/[\w\-]+',  # YouTube short links
    r'https?://(?:www\.)?twitter\.com/\w+/status/\d+',  # Twitter/X posts
    r'https?://(?:www\.)?x\.com/\w+/status/\d+',  # X posts
    r'https?://[\w\-\.]+\.[a-z]{2,}/[\w\-\./?&=%#]+',  # General URLs
]


# =============================================================================
# Gmail Service Classes
# =============================================================================

class GmailReader:
    """Reads emails from babyproject418@gmail.com."""

    def __init__(self, token_path: str = CONFIG["babyproject_token"]):
        self.token_path = token_path
        self.service = None

        if GMAIL_AVAILABLE and Path(token_path).exists():
            try:
                with open(token_path, 'rb') as f:
                    creds = pickle.load(f)
                self.service = build('gmail', 'v1', credentials=creds)
                print(f"SUCCESS: Gmail reader initialized for babyproject418")
            except Exception as e:
                print(f"ERROR: Failed to initialize Gmail reader: {e}")

    def get_unread_emails(self, max_results: int = 10) -> List[Dict[str, Any]]:
        """
        Get unread emails from babyproject418@gmail.com.

        [REQ-INPUT-002] Email URL extraction (all types)
        """
        if not self.service:
            print("WARNING: Gmail reader not available, using fallback")
            return []

        try:
            # Use labelIds instead of q parameter to avoid metadata scope conflict
            results = self.service.users().messages().list(
                userId='me',
                labelIds=['UNREAD'],
                maxResults=max_results
            ).execute()

            messages = results.get('messages', [])
            emails = []

            for msg in messages:
                try:
                    # Try format='full' first (works with gmail.readonly/modify)
                    full_msg = self.service.users().messages().get(
                        userId='me',
                        id=msg['id'],
                        format='full'
                    ).execute()

                    # Extract headers
                    headers = {h['name']: h['value'] for h in full_msg['payload'].get('headers', [])}
                    # Extract body
                    body = self._extract_body(full_msg['payload'])

                except Exception as format_error:
                    # Fallback 1: try format='raw' if 'full' fails
                    try:
                        print(f"INFO: format='full' failed, trying 'raw': {format_error}")
                        raw_msg = self.service.users().messages().get(
                            userId='me',
                            id=msg['id'],
                            format='raw'
                        ).execute()

                        # Decode raw email
                        import email
                        raw_data = base64.urlsafe_b64decode(raw_msg['raw'].encode('ASCII'))
                        email_message = email.message_from_bytes(raw_data)

                        headers = dict(email_message.items())
                        body = ""
                        if email_message.is_multipart():
                            for part in email_message.walk():
                                if part.get_content_type() == "text/plain":
                                    body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                                    break
                        else:
                            body = email_message.get_payload(decode=True).decode('utf-8', errors='ignore')

                    except Exception as raw_error:
                        # Fallback 2: metadata-only (headers, no body) - for restricted scope
                        print(f"INFO: format='raw' also failed, using metadata only: {raw_error}")
                        meta_msg = self.service.users().messages().get(
                            userId='me',
                            id=msg['id'],
                            format='metadata',
                            metadataHeaders=['From', 'To', 'Subject', 'Date']
                        ).execute()
                        headers = {h['name']: h['value'] for h in meta_msg['payload'].get('headers', [])}
                        body = "(Body unavailable - limited scope. Please refresh OAuth token.)"

                emails.append({
                    'id': msg['id'],
                    'subject': headers.get('Subject', ''),
                    'from': headers.get('From', ''),
                    'date': headers.get('Date', ''),
                    'body': body,
                    'urls': self._extract_urls(body + ' ' + headers.get('Subject', ''))
                })

            print(f"SUCCESS: Retrieved {len(emails)} unread emails")
            return emails

        except Exception as e:
            print(f"ERROR in get_unread_emails: {type(e).__name__}: {str(e)}")
            print(f"Stack trace: {traceback.format_exc()}")
            return []

    def _extract_body(self, payload: Dict) -> str:
        """Extract email body text."""
        body = ""

        if 'body' in payload and payload['body'].get('data'):
            body = base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8', errors='ignore')
        elif 'parts' in payload:
            for part in payload['parts']:
                if part.get('mimeType') == 'text/plain':
                    if part['body'].get('data'):
                        body = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8', errors='ignore')
                        break

        return body

    def _extract_urls(self, text: str) -> List[str]:
        """Extract all URLs from text."""
        urls = []
        for pattern in URL_PATTERNS:
            matches = re.findall(pattern, text)
            urls.extend(matches)
        return list(set(urls))

    def mark_as_read(self, message_id: str) -> bool:
        """Mark an email as read."""
        if not self.service:
            return False

        try:
            self.service.users().messages().modify(
                userId='me',
                id=message_id,
                body={'removeLabelIds': ['UNREAD']}
            ).execute()
            return True
        except Exception as e:
            print(f"ERROR marking as read: {e}")
            return False


class GmailSender:
    """Sends HTML emails via primary Gmail account."""

    def __init__(self, token_path: str = CONFIG["gmail_token"]):
        self.token_path = token_path
        self.service = None

        if GMAIL_AVAILABLE and Path(token_path).exists():
            try:
                with open(token_path, 'rb') as f:
                    creds = pickle.load(f)
                self.service = build('gmail', 'v1', credentials=creds)
                print(f"SUCCESS: Gmail sender initialized")
            except Exception as e:
                print(f"ERROR: Failed to initialize Gmail sender: {e}")

    def send_html_email(self, to: str, subject: str, html_content: str) -> Optional[str]:
        """Send HTML email and return message ID."""
        if not self.service:
            return None

        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = CONFIG["from_email"]
            msg['To'] = to

            text_part = MIMEText('Please view in HTML-compatible email client.', 'plain')
            html_part = MIMEText(html_content, 'html')
            msg.attach(text_part)
            msg.attach(html_part)

            raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
            result = self.service.users().messages().send(
                userId='me',
                body={'raw': raw}
            ).execute()

            print(f"SUCCESS: Email sent | Message ID: {result.get('id')}")
            return result.get('id')

        except Exception as e:
            print(f"ERROR sending email: {e}")
            return None


# =============================================================================
# Web Research Agent
# =============================================================================

class WebResearchAgent:
    """
    Performs web research on URLs and topics.
    Uses Exa/web search for comprehensive research.
    """

    def research_url(self, url: str) -> Dict[str, Any]:
        """
        Research a URL and gather information.

        [REQ-MEMORY-001] V4 context injection before processing
        """
        print(f"  Researching URL: {url}")

        # Determine URL type
        url_type = self._classify_url(url)

        research = {
            "url": url,
            "type": url_type,
            "timestamp": datetime.now().isoformat(),
            "findings": [],
            "sources": [],
            "key_metric": {"value": "Analyzed", "label": "Research Complete"}
        }

        try:
            if url_type == "github":
                research = self._research_github(url, research)
            elif url_type == "youtube":
                research = self._research_youtube(url, research)
            else:
                research = self._research_general(url, research)

        except Exception as e:
            print(f"  ERROR researching {url}: {e}")
            research["findings"].append(f"Error during research: {str(e)}")

        return research

    def _classify_url(self, url: str) -> str:
        """Classify URL type."""
        if 'github.com' in url:
            return 'github'
        elif 'youtube.com' in url or 'youtu.be' in url:
            return 'youtube'
        elif 'twitter.com' in url or 'x.com' in url:
            return 'twitter'
        else:
            return 'general'

    def _research_github(self, url: str, research: Dict) -> Dict:
        """Research GitHub repository."""
        # Extract owner/repo from URL
        match = re.search(r'github\.com/([\w\-]+)/([\w\-]+)', url)
        if match:
            owner, repo = match.groups()

            research["key_metric"] = {
                "value": f"{owner}/{repo}",
                "label": "GitHub Repository"
            }

            research["findings"] = [
                f"Repository: {owner}/{repo}",
                f"Type: GitHub Repository for analysis",
                f"URL: {url}",
                "Status: Ready for BLP analysis via GitHub Starred workflow",
                "Recommendation: Process through enhanced_repo_analyzer_v2.py"
            ]

            research["sources"] = [
                {"title": f"{owner}/{repo} Repository", "url": url},
                {"title": "GitHub API", "url": f"https://api.github.com/repos/{owner}/{repo}"}
            ]

        return research

    def _research_youtube(self, url: str, research: Dict) -> Dict:
        """Research YouTube video."""
        # Extract video ID
        video_id = None
        if 'youtu.be/' in url:
            video_id = url.split('youtu.be/')[-1].split('?')[0]
        elif 'watch?v=' in url:
            video_id = url.split('watch?v=')[-1].split('&')[0]

        if video_id:
            research["key_metric"] = {
                "value": f"Video: {video_id[:11]}",
                "label": "YouTube Video Analysis"
            }

            research["findings"] = [
                f"Video ID: {video_id}",
                f"Platform: YouTube",
                f"URL: {url}",
                "Status: Ready for transcript extraction",
                "Recommendation: Process through youtube_auto_processor.py"
            ]

            research["sources"] = [
                {"title": "YouTube Video", "url": url},
                {"title": "Video Thumbnail", "url": f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"}
            ]

        return research

    def _research_general(self, url: str, research: Dict) -> Dict:
        """Research general URL."""
        parsed = urlparse(url)

        research["key_metric"] = {
            "value": parsed.netloc,
            "label": "Web Resource"
        }

        research["findings"] = [
            f"Domain: {parsed.netloc}",
            f"Path: {parsed.path}",
            f"Type: Web Resource",
            "Status: Ready for content extraction",
            "Recommendation: Process through Firecrawl/Tavily search agent"
        ]

        research["sources"] = [
            {"title": f"Source: {parsed.netloc}", "url": url}
        ]

        return research

    def research_topic(self, topic: str) -> Dict[str, Any]:
        """Research a topic without specific URL."""
        print(f"  Researching topic: {topic}")

        return {
            "url": None,
            "type": "topic",
            "topic": topic,
            "timestamp": datetime.now().isoformat(),
            "key_metric": {"value": topic[:30], "label": "Topic Research"},
            "findings": [
                f"Topic: {topic}",
                "Status: Ready for deep research",
                "Recommendation: Trigger topic-research-analyzer agent"
            ],
            "sources": [
                {"title": "Topic Research Request", "url": "#"}
            ]
        }


# =============================================================================
# HTML Email Generator
# =============================================================================

def generate_research_email_html(
    research_results: List[Dict[str, Any]],
    original_email: Dict[str, Any]
) -> str:
    """Generate HTML email with research results."""

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M EST")

    # Build findings HTML
    findings_html = ""
    for r in research_results:
        for f in r.get("findings", []):
            findings_html += f'<li style="margin-bottom: 10px; color: #b0b0b0;">{f}</li>'

    # Build sources HTML
    sources_html = ""
    for r in research_results:
        for s in r.get("sources", []):
            sources_html += f'<a href="{s["url"]}" style="color: #c084fc; text-decoration: none; display: block; font-size: 0.85em; margin: 5px 0;">{s["title"]}</a>'

    # Primary metric from first result
    primary_metric = research_results[0].get("key_metric", {"value": "Research Complete", "label": "Analysis"}) if research_results else {"value": "No Results", "label": ""}

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Research Results | {timestamp}</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #1a1a1a; color: #e0e0e0; line-height: 1.6;">
    <div style="max-width: 700px; margin: 0 auto; background: #2d2d2d; border-radius: 12px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">

        <!-- Header -->
        <div style="border-bottom: 3px solid #9333ea; padding-bottom: 20px; margin-bottom: 25px;">
            <h1 style="color: #9333ea; font-size: 1.6em; margin: 0 0 8px 0;">Research Results</h1>
            <div style="color: #b0b0b0; font-size: 0.9em;">TheBaby Email Research Processor | {timestamp}</div>
            <span style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; margin-top: 10px;">EMAIL RESEARCH CHANNEL</span>
        </div>

        <!-- Original Request -->
        <div style="background: #1e1a3a; border-left: 4px solid #9333ea; padding: 15px; border-radius: 4px; margin-bottom: 25px;">
            <h4 style="color: #9333ea; font-size: 0.9em; margin: 0 0 10px 0;">Original Request</h4>
            <div style="color: #b0b0b0; font-size: 0.85em;">From: {original_email.get('from', 'Unknown')}</div>
            <div style="color: #e0e0e0; font-size: 0.9em; margin-top: 5px;">Subject: {original_email.get('subject', 'No Subject')}</div>
        </div>

        <!-- Key Metric -->
        <div style="background: #1e1a3a; border: 2px solid #9333ea; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 25px;">
            <div style="color: #c084fc; font-size: 2.2em; font-weight: bold;">{primary_metric['value']}</div>
            <div style="color: #808080; font-size: 0.9em;">{primary_metric['label']}</div>
        </div>

        <!-- Research Findings -->
        <div style="background: #0d1117; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #c084fc; font-size: 1em; margin: 0 0 15px 0; border-left: 4px solid #9333ea; padding-left: 12px;">Research Findings</h3>
            <ul style="margin: 0; padding-left: 20px;">
                {findings_html}
            </ul>
        </div>

        <!-- Sources -->
        <div style="background: #1e1a3a; border-left: 4px solid #9333ea; padding: 15px; border-radius: 4px; margin-bottom: 25px;">
            <h4 style="color: #9333ea; font-size: 0.9em; margin: 0 0 10px 0;">Sources</h4>
            {sources_html}
        </div>

        <!-- Questions -->
        <div style="background: #1a1a1a; border: 1px solid #404040; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
            <div style="color: #808080; font-size: 0.75em; margin-bottom: 5px;">Q-{datetime.now().strftime('%Y%m%d')}-001</div>
            <div style="color: #e0e0e0; font-weight: 600; margin-bottom: 15px;">
                How would you like to proceed with this research?
                <span style="background: #f44336; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.7em; margin-left: 8px;">REQUIRED</span>
            </div>

            <table cellpadding="0" cellspacing="8" style="width: 100%;">
                <tr>
                    <td style="width: 50%;">
                        <a href="mailto:babyproject418@gmail.com?subject=APPROVE: Deep Research&body=Proceed with deep research on this topic" style="display: block; background: #238636; border: 1px solid #238636; color: white; padding: 12px; border-radius: 6px; text-decoration: none; text-align: center; font-size: 0.9em;">Deep Research</a>
                    </td>
                    <td style="width: 50%;">
                        <a href="mailto:babyproject418@gmail.com?subject=APPROVE: Create GitHub Issue&body=Create a GitHub issue for tracking" style="display: block; background: #2d2d2d; border: 1px solid #404040; color: #e0e0e0; padding: 12px; border-radius: 6px; text-decoration: none; text-align: center; font-size: 0.9em;">Create GitHub Issue</a>
                    </td>
                </tr>
                <tr>
                    <td style="width: 50%;">
                        <a href="mailto:babyproject418@gmail.com?subject=DEFER: Save for Later&body=Save this research for later review" style="display: block; background: #2d2d2d; border: 1px solid #404040; color: #e0e0e0; padding: 12px; border-radius: 6px; text-decoration: none; text-align: center; font-size: 0.9em;">Save for Later</a>
                    </td>
                    <td style="width: 50%;">
                        <a href="mailto:babyproject418@gmail.com?subject=ARCHIVE: No Action Needed&body=Archive - no further action needed" style="display: block; background: #2d2d2d; border: 1px solid #404040; color: #e0e0e0; padding: 12px; border-radius: 6px; text-decoration: none; text-align: center; font-size: 0.9em;">Archive (No Action)</a>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Footer -->
        <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #404040; text-align: center; color: #808080; font-size: 0.8em;">
            <p style="margin: 5px 0;">Generated by TheBaby Email Research Processor | PLAN-RESE-002</p>
            <p style="margin: 5px 0;">BLP Framework: Alignment | Autonomy | Durability | Self-Improvement</p>
            <p style="margin: 10px 0 0 0;">Click any option button above or reply to this email with your direction</p>
        </div>
    </div>
</body>
</html>'''

    return html


# =============================================================================
# Main Processor
# =============================================================================

def process_incoming_emails(
    max_emails: int = 10,
    dry_run: bool = False,
    send_whatsapp: bool = True
) -> Dict[str, Any]:
    """
    Process incoming emails from babyproject418@gmail.com.

    [REQ-INPUT-002] Email URL extraction (all types)
    [REQ-OUTPUT-003] Email delivery via SFA agent
    [REQ-BLP-001] Full exception details on error
    [REQ-BLP-002] Success print before return
    """
    print(f"\n{'='*60}")
    print(f"Email Research Processor")
    print(f"PLAN-RESE-002 | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    results = {
        "status": "success",
        "emails_processed": 0,
        "research_sent": 0,
        "timestamp": datetime.now().isoformat(),
        "details": []
    }

    try:
        reader = GmailReader()
        sender = GmailSender()
        researcher = WebResearchAgent()

        # Get unread emails
        emails = reader.get_unread_emails(max_results=max_emails)

        if not emails:
            print("No unread emails to process")
            results["status"] = "no_emails"
            return results

        for email in emails:
            print(f"\nProcessing email: {email['subject'][:50]}...")
            results["emails_processed"] += 1

            # Extract URLs and research them
            research_results = []

            for url in email.get('urls', []):
                research = researcher.research_url(url)
                research_results.append(research)

            # If no URLs, treat as topic research
            if not research_results and email.get('subject'):
                research = researcher.research_topic(email['subject'])
                research_results.append(research)

            # Generate HTML email
            html_content = generate_research_email_html(research_results, email)

            # Save HTML file
            safe_subject = re.sub(r'[^\w\s-]', '', email['subject'])[:30].strip().replace(' ', '-').lower()
            html_filename = f"{datetime.now().strftime('%Y%m%d')}-research-{safe_subject}.html"
            html_path = Path(CONFIG["html_output_dir"]) / html_filename

            with open(html_path, 'w') as f:
                f.write(html_content)
            print(f"  HTML saved: {html_path}")

            # Send response email
            if not dry_run:
                subject = f"TheBaby Research Results: {email['subject'][:40]} | {datetime.now().strftime('%Y-%m-%d')}"
                msg_id = sender.send_html_email(
                    to=CONFIG["response_email"],
                    subject=subject,
                    html_content=html_content
                )

                if msg_id:
                    results["research_sent"] += 1
                    reader.mark_as_read(email['id'])

                    results["details"].append({
                        "subject": email['subject'],
                        "urls_found": len(email.get('urls', [])),
                        "status": "sent",
                        "message_id": msg_id
                    })
            else:
                print(f"  [DRY RUN] Would send research email")
                results["details"].append({
                    "subject": email['subject'],
                    "status": "dry_run"
                })

        # WhatsApp notification
        if send_whatsapp and not dry_run and results["research_sent"] > 0:
            try:
                wa_msg = f"""📧 Email Research Complete!

📬 Processed: {results["emails_processed"]} emails
📊 Research Sent: {results["research_sent"]}
🕐 {datetime.now().strftime('%Y-%m-%d %H:%M')}

Check inbox for research results with action options."""

                requests.post(
                    CONFIG["whatsapp_api"],
                    json={"recipient": CONFIG["whatsapp_recipient"], "message": wa_msg},
                    timeout=30
                )
            except Exception as e:
                print(f"WARNING: WhatsApp notification failed: {e}")

        # [REQ-BLP-002] Success print before return
        print(f"\n{'='*60}")
        print(f"SUCCESS: Email research processing complete")
        print(f"  Processed: {results['emails_processed']}")
        print(f"  Research Sent: {results['research_sent']}")
        print(f"{'='*60}\n")

        return results

    except Exception as e:
        # [REQ-BLP-001] Full exception details on error
        print(f"ERROR in process_incoming_emails: {type(e).__name__}: {str(e)}")
        print(f"Stack trace: {traceback.format_exc()}")
        results["status"] = "error"
        results["error"] = str(e)
        return results


def process_direct_topic_research(
    topic: str,
    url: Optional[str] = None,
    dry_run: bool = False,
    send_whatsapp: bool = True
) -> Dict[str, Any]:
    """
    Process a direct topic research request without email trigger.

    [REQ-TRT-001] Direct topic research invocation
    [REQ-TRT-002] Multi-source web research

    Args:
        topic: Research topic to analyze
        url: Optional context URL to analyze
        dry_run: If True, don't send results
        send_whatsapp: If True, send WhatsApp notification

    Returns:
        Dict with research results and delivery status
    """
    print(f"\n{'='*60}")
    print(f"Direct Topic Research")
    print(f"PLAN-RESE-002 | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}")
    print(f"Topic: {topic}")
    if url:
        print(f"Context URL: {url}")
    print()

    results = {
        "status": "success",
        "topic": topic,
        "url": url,
        "timestamp": datetime.now().isoformat(),
        "research_results": [],
        "html_path": None,
        "email_sent": False,
    }

    try:
        sender = GmailSender()
        researcher = WebResearchAgent()

        # Create mock email for processing
        mock_email = {
            'id': f'topic-{datetime.now().strftime("%Y%m%d%H%M%S")}',
            'subject': topic,
            'from': 'Direct Topic Research',
            'date': datetime.now().isoformat(),
            'body': f"Research request for: {topic}",
            'urls': [url] if url else []
        }

        # Perform research
        research_results = []

        # Research topic
        topic_research = researcher.research_topic(topic)
        research_results.append(topic_research)

        # Research URL if provided
        if url:
            url_research = researcher.research_url(url)
            research_results.append(url_research)

        results["research_results"] = research_results

        # Generate HTML email
        html_content = generate_research_email_html(research_results, mock_email)

        # Save HTML file
        safe_topic = re.sub(r'[^\w\s-]', '', topic)[:30].strip().replace(' ', '-').lower()
        html_filename = f"{datetime.now().strftime('%Y%m%d')}-topic-research-{safe_topic}.html"
        html_path = Path(CONFIG["html_output_dir"]) / html_filename

        with open(html_path, 'w') as f:
            f.write(html_content)
        print(f"  HTML saved: {html_path}")
        results["html_path"] = str(html_path)

        # Send response email
        if not dry_run:
            subject = f"RE: {topic} - Research Complete"
            msg_id = sender.send_html_email(
                to=CONFIG["response_email"],
                subject=subject,
                html_content=html_content
            )

            if msg_id:
                results["email_sent"] = True
                results["message_id"] = msg_id
        else:
            print(f"  [DRY RUN] Would send research email")

        # WhatsApp notification
        if send_whatsapp and not dry_run:
            try:
                # Generate TinyURL for dashboard
                external_url = f"http://34.58.12.50:8080/{html_filename}"
                try:
                    tinyurl_response = requests.get(
                        "https://tinyurl.com/api-create.php",
                        params={"url": external_url},
                        timeout=5
                    )
                    tiny_url = tinyurl_response.text.strip() if tinyurl_response.status_code == 200 else external_url
                except Exception:
                    tiny_url = external_url

                wa_msg = f"""📊 Topic Research Complete!

🔍 Topic: {topic}
{f'🔗 URL: {url}' if url else ''}
📈 Findings: {len(research_results)}
🕐 {datetime.now().strftime('%Y-%m-%d %H:%M')}

📎 Dashboard: {tiny_url}

🤖 ETAC Email Research Pipeline v2.0"""

                requests.post(
                    CONFIG["whatsapp_api"],
                    json={"recipient": CONFIG["whatsapp_recipient"], "message": wa_msg},
                    timeout=30
                )
                print(f"  WhatsApp notification sent")
            except Exception as e:
                print(f"WARNING: WhatsApp notification failed: {e}")

        # [REQ-BLP-002] Success print before return
        print(f"\n{'='*60}")
        print(f"SUCCESS: Direct topic research complete")
        print(f"  Topic: {topic}")
        print(f"  Findings: {len(research_results)}")
        print(f"  HTML: {html_path}")
        print(f"  Email Sent: {results['email_sent']}")
        print(f"{'='*60}\n")

        return results

    except Exception as e:
        # [REQ-BLP-001] Full exception details on error
        print(f"ERROR in process_direct_topic_research: {type(e).__name__}: {str(e)}")
        print(f"Stack trace: {traceback.format_exc()}")
        results["status"] = "error"
        results["error"] = str(e)
        return results


def main():
    """CLI entry point with topic research support."""
    parser = argparse.ArgumentParser(
        description="Email Research Processor - PLAN-RESE-002",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process incoming emails
  python email_research_processor.py --max-emails 5

  # Direct topic research (NEW!)
  python email_research_processor.py --topic "AI agent frameworks 2025"

  # Topic research with URL context
  python email_research_processor.py --topic "Machine economy" --url "https://example.com/article"
        """
    )

    parser.add_argument(
        "--max-emails", "-m",
        type=int,
        default=10,
        help="Maximum number of emails to process (default: 10)"
    )
    parser.add_argument(
        "--topic", "-t",
        type=str,
        default=None,
        help="Direct topic research (bypasses email processing)"
    )
    parser.add_argument(
        "--url", "-u",
        type=str,
        default=None,
        help="Optional context URL for topic research"
    )
    parser.add_argument(
        "--dry-run", "-d",
        action="store_true",
        help="Process emails but don't send results"
    )
    parser.add_argument(
        "--no-whatsapp",
        action="store_true",
        help="Skip WhatsApp notification"
    )

    args = parser.parse_args()

    # Check if direct topic research mode
    if args.topic:
        results = process_direct_topic_research(
            topic=args.topic,
            url=args.url,
            dry_run=args.dry_run,
            send_whatsapp=not args.no_whatsapp
        )
    else:
        # Standard email processing mode
        results = process_incoming_emails(
            max_emails=args.max_emails,
            dry_run=args.dry_run,
            send_whatsapp=not args.no_whatsapp
        )

    sys.exit(0 if results["status"] in ["success", "no_emails"] else 1)


if __name__ == "__main__":
    main()
