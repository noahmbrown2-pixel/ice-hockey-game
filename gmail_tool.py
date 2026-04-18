"""Gmail CLI tool — read, send, and search Gmail via the Gmail API."""

import base64
import sys
from email.mime.text import MIMEText
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
]

CREDENTIALS_FILE = Path(__file__).parent / "credentials.json"
TOKEN_FILE = Path(__file__).parent / "token.json"


def get_service():
    creds = None
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not CREDENTIALS_FILE.exists():
                print("ERROR: credentials.json not found. Download it from Google Cloud Console.")
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0, open_browser=False)
        TOKEN_FILE.write_text(creds.to_json())
    return build("gmail", "v1", credentials=creds)


def read_emails(max_results=10):
    service = get_service()
    results = service.users().messages().list(
        userId="me", labelIds=["INBOX"], maxResults=max_results
    ).execute()
    messages = results.get("messages", [])
    if not messages:
        print("No messages found.")
        return
    print(f"Last {len(messages)} inbox messages:\n")
    for i, msg_ref in enumerate(messages, 1):
        msg = service.users().messages().get(
            userId="me", id=msg_ref["id"], format="metadata",
            metadataHeaders=["From", "Subject"]
        ).execute()
        headers = {h["name"]: h["value"] for h in msg["payload"]["headers"]}
        sender = headers.get("From", "(unknown)")
        subject = headers.get("Subject", "(no subject)")
        snippet = msg.get("snippet", "")
        print(f"{i:2}. From:    {sender}")
        print(f"    Subject: {subject}")
        print(f"    {snippet[:100]}")
        print()


def send_email(to, subject, body):
    service = get_service()
    message = MIMEText(body)
    message["to"] = to
    message["subject"] = subject
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    service.users().messages().send(userId="me", body={"raw": raw}).execute()
    print(f"Email sent to {to}.")


def search_emails(query, max_results=10):
    service = get_service()
    results = service.users().messages().list(
        userId="me", q=query, maxResults=max_results
    ).execute()
    messages = results.get("messages", [])
    if not messages:
        print(f"No messages found for query: {query!r}")
        return
    print(f"Found {len(messages)} message(s) for query {query!r}:\n")
    for i, msg_ref in enumerate(messages, 1):
        msg = service.users().messages().get(
            userId="me", id=msg_ref["id"], format="metadata",
            metadataHeaders=["From", "Subject"]
        ).execute()
        headers = {h["name"]: h["value"] for h in msg["payload"]["headers"]}
        sender = headers.get("From", "(unknown)")
        subject = headers.get("Subject", "(no subject)")
        snippet = msg.get("snippet", "")
        print(f"{i:2}. From:    {sender}")
        print(f"    Subject: {subject}")
        print(f"    {snippet[:100]}")
        print()


def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python gmail_tool.py read             # last 10 inbox emails")
        print("  python gmail_tool.py send             # prompts for to/subject/body")
        print("  python gmail_tool.py search <query>   # Gmail search syntax")
        sys.exit(0)

    cmd = sys.argv[1].lower()

    if cmd == "read":
        read_emails()
    elif cmd == "send":
        to = input("To: ").strip()
        subject = input("Subject: ").strip()
        print("Body (end with a line containing only '.'): ")
        lines = []
        while True:
            line = input()
            if line == ".":
                break
            lines.append(line)
        send_email(to, subject, "\n".join(lines))
    elif cmd == "search":
        if len(sys.argv) < 3:
            print("Usage: python gmail_tool.py search <query>")
            sys.exit(1)
        query = " ".join(sys.argv[2:])
        search_emails(query)
    else:
        print(f"Unknown command: {cmd!r}")
        sys.exit(1)


if __name__ == "__main__":
    main()
