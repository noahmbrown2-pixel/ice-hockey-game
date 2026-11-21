"""
TB Action Handler - Processes personal/action tasks from email commands.
REQ-TB-ACTION: Handle non-code tasks (job applications, drafts, bookings, etc.)

Unlike BUILD (DITD pipeline) or RESEARCH (GA006), ACTION tasks are:
- Executed immediately via `claude --print`
- Results emailed back to the user for review
- No GitHub issues, no approval gates, no code changes

Flow: Email command -> Classify as ACTION -> claude --print -> Email results back
"""

import json
import logging
import os
import re
import shutil
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional

logger = logging.getLogger("tb-action-handler")

# Email sending
sys.path.insert(0, str(Path(__file__).parent))
sys.path.insert(0, "/home/craigmbrown/Project/scripts")

PROJECT_ROOT = Path("/home/craigmbrown/Project")
STATE_DIR = Path(__file__).parent.parent / "state"
RESULTS_DIR = STATE_DIR / "action_results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)


class TBActionHandler:
    """
    Handles ACTION-type commands by executing via claude --print
    and emailing results back to the user.
    """

    def __init__(self):
        self.claude_path = self._find_claude()
        self.email_to = "craigmbrown@gmail.com"
        self.max_prompt_tokens = 4000  # Keep prompts reasonable

    def _find_claude(self) -> Optional[str]:
        """Find claude CLI binary."""
        claude = shutil.which("claude")
        if claude:
            return claude
        # Common locations
        for path in [
            os.path.expanduser("~/.claude/local/claude"),
            "/usr/local/bin/claude",
            os.path.expanduser("~/.local/bin/claude"),
        ]:
            if os.path.isfile(path):
                return path
        return None

    def handle_action(self, command_context: Dict) -> Dict:
        """
        Process an ACTION command.

        Args:
            command_context: {
                "command_text": str,  # The user's instruction
                "source": str,       # Channel (gmail, transcript, etc.)
                "sender": str,       # Who sent it
                "command_id": str,    # Unique ID
                "raw_data": dict,    # Original email data (subject, body, etc.)
            }

        Returns:
            dict with status, result_file, email_sent
        """
        command_text = command_context.get("command_text", "")
        command_id = command_context.get("command_id", f"action_{int(time.time())}")
        raw_data = command_context.get("raw_data", {})

        logger.info(f"Processing ACTION: {command_text[:80]}...")

        # Extract any URLs from the email body
        body = raw_data.get("body_excerpt", "") or raw_data.get("body", "")
        urls = self._extract_urls(f"{command_text} {body}")

        # Build the prompt for claude
        prompt = self._build_prompt(command_text, body, urls, raw_data)

        # Execute via claude --print
        result = self._execute_claude(prompt, command_id)

        if result["status"] == "success":
            # Save result
            result_file = self._save_result(command_id, command_text, result["output"])

            # Email results back
            email_sent = self._email_results(
                command_text=command_text,
                result_text=result["output"],
                command_id=command_id,
                urls=urls,
            )

            return {
                "status": "COMPLETED",
                "result_file": str(result_file),
                "email_sent": email_sent,
                "output_length": len(result["output"]),
            }
        else:
            logger.error(f"Claude execution failed: {result.get('error')}")
            # Email failure notification
            self._email_failure(command_text, result.get("error", "Unknown error"), command_id)
            return {
                "status": "ACTION_ERROR",
                "error": result.get("error"),
            }

    def _extract_urls(self, text: str) -> list:
        """Extract URLs from text."""
        url_pattern = r'https?://[^\s<>"\')\]]+'
        return list(set(re.findall(url_pattern, text)))

    def _build_prompt(self, command_text: str, body: str, urls: list, raw_data: dict) -> str:
        """Build a focused prompt for claude --print."""
        subject = raw_data.get("subject", command_text)

        prompt_parts = [
            "You are a personal assistant handling a task request from Craig M. Brown.",
            f"\n## Task Request\n{command_text}",
        ]

        if body and body.strip() != command_text.strip():
            prompt_parts.append(f"\n## Additional Context from Email\n{body[:2000]}")

        if urls:
            prompt_parts.append(f"\n## URLs Referenced\n" + "\n".join(f"- {u}" for u in urls))

        prompt_parts.append("""
## Instructions
1. Research and understand the request thoroughly
2. If this involves a job application: Research the role, company, and prepare application materials
3. If this involves drafting something: Create a complete, polished draft
4. If this involves a personal action: Provide clear steps and any drafts needed
5. Format your response as a complete, actionable deliverable
6. Include any relevant links, context, or next steps
7. Be thorough but concise - this will be emailed back for review

## Output Format
Provide your response in clean, well-structured text suitable for email delivery.
Start with a brief summary of what you did, then the deliverable.
""")

        return "\n".join(prompt_parts)

    def _execute_claude(self, prompt: str, command_id: str) -> Dict:
        """Execute prompt via claude --print."""
        if not self.claude_path:
            return {"status": "error", "error": "Claude CLI not found"}

        try:
            logger.info(f"Executing claude --print for {command_id}")

            # Force OAuth fallback: ANTHROPIC_API_KEY in env may be an
            # unresolved Vault placeholder ("vault:secret/...") which the CLI
            # rejects as "Invalid API key" and exits non-zero before trying
            # OAuth. Strip any non-sk-ant key so OAuth login is used.
            # See: v5_memory/.../session_20260501_claude_cli_invoke_fix.md
            cli_env = {**os.environ, "CLAUDE_CODE_ENTRYPOINT": "cli"}
            _api_key = cli_env.get("ANTHROPIC_API_KEY", "")
            if _api_key and not _api_key.startswith("sk-"):
                cli_env.pop("ANTHROPIC_API_KEY", None)
                logger.info(f"Dropped non-sk ANTHROPIC_API_KEY for {command_id} (OAuth fallback)")

            # Cap tool-loop length so a long-running agentic task can't burn
            # the full timeout silently. 15 min wall-clock + 20-turn cap matches
            # typical "research + draft + email" deliverables.
            result = subprocess.run(
                [self.claude_path, "--print", "-p", prompt, "--max-turns", "20"],
                capture_output=True,
                text=True,
                timeout=900,  # 15 minute timeout
                cwd=str(PROJECT_ROOT),
                env=cli_env,
            )

            if result.returncode == 0 and result.stdout.strip():
                logger.info(f"Claude returned {len(result.stdout)} chars for {command_id}")
                return {"status": "success", "output": result.stdout.strip()}
            else:
                error = result.stderr.strip() or f"Exit code {result.returncode}"
                logger.error(f"Claude --print failed: {error[:200]}")
                return {"status": "error", "error": error[:500]}

        except subprocess.TimeoutExpired:
            logger.error(f"Claude --print timed out for {command_id}")
            return {"status": "error", "error": "Execution timed out (5 min limit)"}
        except Exception as e:
            logger.error(f"Claude execution error: {e}")
            return {"status": "error", "error": str(e)}

    def _save_result(self, command_id: str, command_text: str, output: str) -> Path:
        """Save result to state directory."""
        result_file = RESULTS_DIR / f"action_{command_id}.json"
        data = {
            "command_id": command_id,
            "command_text": command_text,
            "output": output,
            "completed_at": datetime.now().isoformat(),
            "output_length": len(output),
        }
        result_file.write_text(json.dumps(data, indent=2))
        logger.info(f"Saved result to {result_file}")
        return result_file

    def _email_results(self, command_text: str, result_text: str, command_id: str, urls: list) -> bool:
        """Email the action results back to the user."""
        try:
            # Build HTML email body (green-on-black theme per user preference)
            url_section = ""
            if urls:
                url_links = "".join(f'<li><a href="{u}" style="color:#00ff41;">{u}</a></li>' for u in urls)
                url_section = f'<h3 style="color:#00ff41;font-size:20px;">Referenced URLs</h3><ul>{url_links}</ul>'

            # Convert markdown-ish result to HTML
            result_html = result_text.replace("\n\n", "</p><p style='color:#00ff41;font-size:16px;'>")
            result_html = result_html.replace("\n", "<br>")

            html_body = f"""<div style="background:#0a0a0a;color:#00ff41;padding:20px;font-family:monospace;">
<h2 style="color:#00ff41;font-size:24px;border-bottom:2px solid #00ff41;padding-bottom:10px;">
Action Completed: {command_text[:80]}
</h2>
<p style="color:#888;font-size:14px;">Command ID: {command_id} | {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}</p>
{url_section}
<h3 style="color:#00ff41;font-size:20px;">Results</h3>
<div style="background:#111;padding:15px;border-left:3px solid #00ff41;border-radius:4px;">
<p style="color:#00ff41;font-size:16px;">{result_html}</p>
</div>
<hr style="border-color:#333;margin:20px 0;">
<p style="color:#666;font-size:12px;">Processed by TB Action Handler | Reply to provide feedback</p>
</div>"""

            # Use unified_email_responder for threaded HTML email.
            # Route via babyproject418 account: its pickle has Gmail send +
            # calendar scope and a working refresh_token. The craigmbrown
            # gmail_full_token.pickle drifts to invalid_grant whenever it gets
            # re-authed for a narrower scope set, which silently kills email
            # send for ACTION results (observed 2026-05-13).
            email_script = str(PROJECT_ROOT / "scripts" / "unified_email_responder.py")
            if os.path.isfile(email_script):
                result = subprocess.run(
                    [
                        sys.executable, email_script,
                        "reply",
                        "--to", self.email_to,
                        "--subject", f"TB Action Complete: {command_text[:60]}",
                        "--body", html_body,
                        "--account", "babyproject418",
                        "--from", '"Craig Brown - BlindOracle" <babyproject418@gmail.com>',
                    ],
                    capture_output=True, text=True, timeout=30,
                    cwd=str(PROJECT_ROOT),
                )
                if result.returncode == 0:
                    logger.info(f"Results emailed to {self.email_to}")
                    return True
                else:
                    logger.error(f"Email send failed: {result.stderr[:200]}")

            # Fallback: gmail_manager.py
            gmail_script = str(PROJECT_ROOT / "gmail_manager.py")
            if os.path.isfile(gmail_script):
                result = subprocess.run(
                    [
                        sys.executable, gmail_script,
                        "send",
                        "--to", self.email_to,
                        "--subject", f"TB Action Complete: {command_text[:60]}",
                        "--body", html_body,
                    ],
                    capture_output=True, text=True, timeout=30,
                    cwd=str(PROJECT_ROOT),
                )
                if result.returncode == 0:
                    logger.info(f"Results emailed via gmail_manager to {self.email_to}")
                    return True

            logger.error("No email method available")
            return False

        except Exception as e:
            logger.error(f"Failed to email results: {e}")
            return False

    def _email_failure(self, command_text: str, error: str, command_id: str) -> bool:
        """Email failure notification."""
        try:
            html_body = f"""<div style="background:#0a0a0a;color:#ff4444;padding:20px;font-family:monospace;">
<h2 style="color:#ff4444;font-size:24px;">Action Failed: {command_text[:80]}</h2>
<p style="color:#888;font-size:14px;">Command ID: {command_id}</p>
<div style="background:#1a0000;padding:15px;border-left:3px solid #ff4444;border-radius:4px;">
<p style="color:#ff4444;font-size:16px;">{error[:500]}</p>
</div>
<p style="color:#666;font-size:12px;">You may need to retry this task manually.</p>
</div>"""

            email_script = str(PROJECT_ROOT / "scripts" / "unified_email_responder.py")
            if os.path.isfile(email_script):
                subprocess.run(
                    [
                        sys.executable, email_script,
                        "reply",
                        "--account", "babyproject418",
                        "--from", '"Craig Brown - BlindOracle" <babyproject418@gmail.com>',
                        "--to", self.email_to,
                        "--subject", f"TB Action FAILED: {command_text[:60]}",
                        "--body", html_body,
                    ],
                    capture_output=True, text=True, timeout=30,
                    cwd=str(PROJECT_ROOT),
                )
                return True
        except Exception as e:
            logger.error(f"Failed to send failure email: {e}")
        return False
