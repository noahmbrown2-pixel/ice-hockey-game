#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# ///

# REQ-RQ132-001: ProofOfDelegation wiring into Agent/Task tool spawning | BLP: [SR, SO, D]
# REQ-RQ200-005: L4 damage-control whitelist hook | BLP: [Alignment, Autonomy, Durability, SR]

import json
import sys
import os
import re
import hashlib
import hmac
import time
from pathlib import Path
from utils.constants import ensure_session_log_dir

# REQ-RQ200-005: L4 damage-control hook (defer-load to keep startup < 50ms)
def _load_damage_control_l4():
    """Lazy import of damage_control_l4 to keep hook startup fast."""
    try:
        sys.path.insert(0, str(Path(__file__).parent))
        from damage_control_l4 import apply_damage_control_l4  # type: ignore
        return apply_damage_control_l4
    except Exception:
        return None

# REQ-RQ132-001.1: Delegation proof kind (Nostr Kind 30014) | BLP: [SO]
DELEGATION_KIND = 30014
# Path for append-only delegation proof log (relative to project root)
DELEGATION_LOG_RELATIVE = "data/delegation_proofs.json"


# ---------------------------------------------------------------------------
# Existing safety validators (unchanged)
# ---------------------------------------------------------------------------

def is_dangerous_rm_command(command):
    """
    Comprehensive detection of dangerous rm commands.
    Matches various forms of rm -rf and similar destructive patterns.
    """
    # Normalize command by removing extra spaces and converting to lowercase
    normalized = ' '.join(command.lower().split())

    # Pattern 1: Standard rm -rf variations
    patterns = [
        r'\brm\s+.*-[a-z]*r[a-z]*f',  # rm -rf, rm -fr, rm -Rf, etc.
        r'\brm\s+.*-[a-z]*f[a-z]*r',  # rm -fr variations
        r'\brm\s+--recursive\s+--force',  # rm --recursive --force
        r'\brm\s+--force\s+--recursive',  # rm --force --recursive
        r'\brm\s+-r\s+.*-f',  # rm -r ... -f
        r'\brm\s+-f\s+.*-r',  # rm -f ... -r
    ]

    # Check for dangerous patterns
    for pattern in patterns:
        if re.search(pattern, normalized):
            return True

    # Pattern 2: Check for rm with recursive flag targeting dangerous paths
    dangerous_paths = [
        r'/',           # Root directory
        r'/\*',         # Root with wildcard
        r'~',           # Home directory
        r'~/',          # Home directory path
        r'\$HOME',      # Home environment variable
        r'\.\.',        # Parent directory references
        r'\*',          # Wildcards in general rm -rf context
        r'\.',          # Current directory
        r'\.\s*$',      # Current directory at end of command
    ]

    if re.search(r'\brm\s+.*-[a-z]*r', normalized):  # If rm has recursive flag
        for path in dangerous_paths:
            if re.search(path, normalized):
                return True

    return False

def is_env_file_access(tool_name, tool_input):
    """
    Check if any tool is trying to access .env files containing sensitive data.
    """
    if tool_name in ['Read', 'Edit', 'MultiEdit', 'Write', 'Bash']:
        # Check file paths for file-based tools
        if tool_name in ['Read', 'Edit', 'MultiEdit', 'Write']:
            file_path = tool_input.get('file_path', '')
            if '.env' in file_path and not file_path.endswith('.env.sample'):
                return True

        # Check bash commands for .env file access
        elif tool_name == 'Bash':
            command = tool_input.get('command', '')
            # Pattern to detect .env file access (but allow .env.sample)
            env_patterns = [
                r'\b\.env\b(?!\.sample)',  # .env but not .env.sample
                r'cat\s+.*\.env\b(?!\.sample)',  # cat .env
                r'echo\s+.*>\s*\.env\b(?!\.sample)',  # echo > .env
                r'touch\s+.*\.env\b(?!\.sample)',  # touch .env
                r'cp\s+.*\.env\b(?!\.sample)',  # cp .env
                r'mv\s+.*\.env\b(?!\.sample)',  # mv .env
            ]

            for pattern in env_patterns:
                if re.search(pattern, command):
                    return True

    return False


# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# REQ-RQ146-005: ML Risk Scoring — additive, upstream of regex validators
# ---------------------------------------------------------------------------

def classify_risk(tool_name, tool_input, session_id, permission_mode=''):
    """
    REQ-RQ146-005: ML risk classification in hook fast path | BLP: [AL-005]

    Returns risk score 0-100, or None if disabled/unavailable.
    Env toggle: RISK_CLASSIFIER_ENABLED=1 to enable (default: 0/off).
    Any exception returns None (fail-safe: falls through to regex validators).
    """
    if os.environ.get("RISK_CLASSIFIER_ENABLED", "0") != "1":
        return None
    try:
        _project_root = str(Path(__file__).resolve().parent.parent.parent)
        if _project_root not in sys.path:
            sys.path.insert(0, _project_root)
        from services.risk_classifier.classifier import RiskClassifier
        classifier = RiskClassifier.get_instance()
        result = classifier.classify({
            "tool_name": tool_name,
            "tool_input": tool_input,
            "session_id": session_id,
            "permission_mode": permission_mode,
            "timestamp": int(time.time()),
        })
        return result.score
    except Exception:
        return None  # Fail-safe: fall through to regex validators

# REQ-RQ132-002: Delegation context generation | BLP: [SR, SO]
# ---------------------------------------------------------------------------

def generate_delegator_passport_hash(session_id: str, timestamp: int) -> str:
    """
    REQ-RQ132-002: Generate a delegator passport hash from session_id + timestamp.

    Uses SHA-256 of the concatenated session_id and timestamp to produce a
    stable, verifiable identity token for the parent session.

    Args:
        session_id: The parent Claude session ID
        timestamp: Unix timestamp of delegation event

    Returns:
        Hex string (64 chars) — the delegator passport hash
    """
    raw = f"{session_id}:{timestamp}"
    return hashlib.sha256(raw.encode()).hexdigest()


def generate_delegation_signature(session_id: str, delegate_desc: str, timestamp: int) -> str:
    """
    REQ-RQ132-003: Generate HMAC-SHA256 signature for delegation proof | BLP: [D]

    Uses a session-derived key so signatures are self-consistent within a session
    without requiring a stored secret.

    Args:
        session_id: Parent session identifier
        delegate_desc: Description of the spawned sub-agent
        timestamp: Unix timestamp

    Returns:
        Hex HMAC-SHA256 signature string
    """
    session_key = hashlib.sha256(f"delegation_key:{session_id}".encode()).digest()
    message = f"{session_id}:{delegate_desc}:{timestamp}".encode()
    return hmac.new(session_key, message, hashlib.sha256).hexdigest()


def _mint_delegation_canary(session_id: str) -> str:
    """
    REQ-RQ249-002: Mint a DELEGATION-channel canary for embedding in DELEGATION_CONTEXT.

    Returns canary token string, or empty string on any error (fail-safe).
    The canary is NOT registered here — registration happens in emit_delegation_proof()
    after we have the full proof context.
    """
    try:
        import sys as _sys
        _project_root = str(Path(__file__).resolve().parent.parent.parent)
        if _project_root not in _sys.path:
            _sys.path.insert(0, _project_root)
        _scripts_dir = str(Path(_project_root) / "scripts")
        if _scripts_dir not in _sys.path:
            _sys.path.insert(0, _scripts_dir)
        import canary_token_manager as _ctm
        return _ctm.mint("DELEGATION")
    except Exception:
        return ""


def build_delegation_context_block(session_id: str, delegate_desc: str) -> str:
    """
    REQ-RQ132-004: Build the DELEGATION_CONTEXT block to inject into agent prompts | BLP: [SR, SO]
    REQ-RQ249-002: Embeds a DELEGATION-channel canary for silent-leak detection.

    This block provides the sub-agent with verifiable parent context so the
    delegation chain can be reconstructed for audit and proof purposes.

    Args:
        session_id: Parent Claude session ID
        delegate_desc: Description/prompt of the sub-agent being spawned

    Returns:
        Formatted DELEGATION_CONTEXT string for prompt injection
    """
    ts = int(time.time())
    passport_hash = generate_delegator_passport_hash(session_id, ts)
    signature = generate_delegation_signature(session_id, delegate_desc[:128], ts)

    # RQ-249: embed canary for confidentiality monitoring
    canary_token = _mint_delegation_canary(session_id)
    canary_line = f"  delegation_canary: {canary_token}\n" if canary_token else ""

    block = (
        "\n\n---\n"
        "DELEGATION_CONTEXT (injected by pre_tool_use hook — do not modify):\n"
        f"  parent_session_id: {session_id}\n"
        f"  delegator_passport_hash: {passport_hash}\n"
        f"  delegation_timestamp: {ts}\n"
        f"  delegation_kind: {DELEGATION_KIND}\n"
        f"  delegation_signature: {signature}\n"
        f"{canary_line}"
        "---\n"
    )
    return block, canary_token  # return canary so emit_delegation_proof can register it


# Backward-compat shim: callers that unpack just the block string
def _build_delegation_context_block_str(session_id: str, delegate_desc: str) -> str:
    """Returns only the block string (drops canary for callers that don't need it)."""
    result = build_delegation_context_block(session_id, delegate_desc)
    if isinstance(result, tuple):
        return result[0]
    return result


# ---------------------------------------------------------------------------
# REQ-RQ132-005: ProofOfDelegation emission to delegation_proofs.json | BLP: [D, SO]
# ---------------------------------------------------------------------------

def _read_last_proof_hash(log_path: Path) -> str:
    """Return the event_id of the last record in the proof log (or '' if empty).

    Used to build hash chain — each new proof carries prev_hash = previous
    record's event_id. Pattern adopted from abaxxlabs/agents audit-logger.ts.
    Reads from end of file (cheap regardless of log size).
    """
    if not log_path.exists() or log_path.stat().st_size == 0:
        return ""
    try:
        with open(log_path, "rb") as f:
            f.seek(0, 2)
            file_size = f.tell()
            # Read last 4KB (enough for one full record)
            block_size = min(4096, file_size)
            f.seek(-block_size, 2)
            tail = f.read(block_size).decode("utf-8", errors="replace")
        last_line = tail.rstrip("\n").split("\n")[-1]
        if not last_line.strip():
            return ""
        last = json.loads(last_line)
        return last.get("event_id", "")
    except Exception:
        return ""


def emit_delegation_proof(
    session_id: str,
    delegate_desc: str,
    project_root: str,
    scope: "str | None" = None,
    constraints: "list | None" = None,
    constraint_mode: str = "open",
    canary_token: str = "",
) -> bool:
    """
    REQ-RQ132-005: Emit a ProofOfDelegation record (Kind 30014) to the delegation log.

    Creates an append-only JSONL record in data/delegation_proofs.json containing:
      - delegator: parent_session_id
      - delegate: sub-agent description (truncated to 256 chars)
      - timestamp: unix epoch
      - kind: 30014 (Nostr ProofOfDelegation)
      - signature: HMAC-SHA256 with session-derived key
      - event_id: SHA-256 of the full proof payload
      - prev_hash: event_id of previous record (hash chain — added 2026-05-12)

    Phase-2 additive fields (REQ-VITAP-101..103, added 2026-05-16):
      - scope: optional free-form string (Mastercard L2-equivalent scope text)
      - constraints: optional Mastercard-style structured constraint objects
        validated against schemas/delegation_constraints.schema.json.
      - constraint_mode: 'open' (default) or 'closed' — open mandates reject
        unknown constraint types per Mastercard rule.

    Backwards-compat: if neither scope nor constraints is supplied, the record
    schema is unchanged from pre-Phase-2 behavior.

    Hash chain: tamper-evidence inspired by abaxxlabs/agents audit-logger.ts.
    Any sed -i edit on prior records will be detectable by `verify_delegation_chain`
    because the chain of event_id → prev_hash references breaks.

    This is non-blocking: any error is suppressed to avoid breaking tool dispatch.

    Args:
        session_id: Parent Claude session ID
        delegate_desc: Description/prompt of the sub-agent being spawned
        project_root: Absolute path to the project root directory
        scope: optional free-form scope string (Phase 2, additive)
        constraints: optional list of structured constraint objects (Phase 2)
        constraint_mode: 'open' or 'closed' (Phase 2)

    Returns:
        True if proof was successfully written, False otherwise
    """
    try:
        ts = int(time.time())
        passport_hash = generate_delegator_passport_hash(session_id, ts)
        signature = generate_delegation_signature(session_id, delegate_desc[:256], ts)

        log_path = Path(project_root) / DELEGATION_LOG_RELATIVE

        # Hash chain: link this record to the previous one
        prev_hash = _read_last_proof_hash(log_path)

        proof_record = {
            "kind": DELEGATION_KIND,
            "proof_type": "ProofOfDelegation",
            "delegator": session_id,
            "delegator_passport_hash": passport_hash,
            "delegate": delegate_desc[:256],
            "delegation_timestamp": ts,
            "signature": signature,
            "status": "active",
            "prev_hash": prev_hash,  # tamper-evident hash chain (2026-05-12)
        }

        # REQ-RQ249-004: Embed canary in proof envelope (not in public summary)
        # The canary is stored alongside the proof so leak detection can match token → proof.
        # It is SAFE to store canaries in internal logs (they're public-by-design honeypots).
        if canary_token:
            proof_record["canary_token"] = canary_token
            # Also register the canary with context so the monitor can correlate
            try:
                import sys as _sys
                _scripts_dir = str(Path(project_root) / "scripts")
                if _scripts_dir not in _sys.path:
                    _sys.path.insert(0, _scripts_dir)
                import canary_token_manager as _ctm  # type: ignore
                _ctm.register(canary_token, "DELEGATION", {
                    "session_id": session_id[:16],
                    "delegate_desc_prefix": delegate_desc[:32],
                })
            except Exception:
                pass  # registration failure must never block proof emission

        # Phase-2 additive fields: merge in scope/constraints when supplied.
        # Validation failure is logged and the fields are dropped so the proof
        # still emits — hook must NEVER block tool dispatch.
        if scope is not None or constraints is not None:
            try:
                import sys as _sys
                _sys.path.insert(0, str(Path(project_root) / "scripts"))
                from delegation_constraints import build_delegation_extras  # type: ignore
                extras = build_delegation_extras(
                    scope=scope, constraints=constraints, mode=constraint_mode
                )
                proof_record.update(extras)
            except Exception:
                # Drop the additive fields on validation/import error; keep
                # the bare proof so the chain stays intact.
                pass

        # Compute event_id as SHA-256 of canonical payload (INCLUDES prev_hash
        # so the chain is verifiable — any mutation breaks downstream chain)
        canonical = json.dumps(proof_record, sort_keys=True, separators=(",", ":"))
        proof_record["event_id"] = hashlib.sha256(canonical.encode()).hexdigest()

        # Write to append-only JSONL file
        log_path.parent.mkdir(parents=True, exist_ok=True)

        with open(log_path, "a") as f:
            f.write(json.dumps(proof_record) + "\n")

        return True

    except Exception:
        # REQ-RQ132-005: Must be non-blocking — suppress all errors
        return False


def verify_delegation_chain(project_root: str) -> dict:
    """Walk the entire delegation_proofs.json log and verify the hash chain.

    Two integrity checks per record:
      1. Per-record integrity: re-compute event_id from canonical payload
         (excluding event_id itself) and verify it matches stored event_id.
         Detects any field-level tampering.
      2. Chain integrity: each record's prev_hash must equal the previous
         record's event_id. Detects record-level insertion/deletion.

    Returns dict with:
      ok            : bool — True if entire chain is intact
      total_records : int  — count of records in log
      chained_records: int — count of records carrying prev_hash field
      first_break_at: int | None — index of first broken record (0-based)
      details       : list of break descriptions

    Records written BEFORE the chain was added (no prev_hash field) skip
    chain check but still get per-record integrity check.

    Pattern adopted from abaxxlabs/agents audit-logger.ts verifyChain().
    Pure-read, never modifies the log.
    """
    log_path = Path(project_root) / DELEGATION_LOG_RELATIVE
    result: dict = {
        "ok": True,
        "total_records": 0,
        "chained_records": 0,
        "first_break_at": None,
        "details": [],
    }
    if not log_path.exists():
        return result

    last_event_id = None
    last_was_chained = False
    with open(log_path, "r") as f:
        for i, line in enumerate(f):
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue
            result["total_records"] += 1

            # ── Per-record integrity: recompute event_id ──
            stored_event_id = rec.get("event_id")
            if stored_event_id:
                payload = {k: v for k, v in rec.items() if k != "event_id"}
                canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
                computed_event_id = hashlib.sha256(canonical.encode()).hexdigest()
                if computed_event_id != stored_event_id:
                    result["ok"] = False
                    if result["first_break_at"] is None:
                        result["first_break_at"] = i
                    result["details"].append({
                        "idx": i,
                        "type": "field_tamper",
                        "stored_event_id": stored_event_id[:16] + "...",
                        "computed_event_id": computed_event_id[:16] + "...",
                    })

            # ── Chain integrity: prev_hash → previous event_id ──
            if "prev_hash" not in rec:
                last_event_id = stored_event_id
                last_was_chained = False
                continue

            result["chained_records"] += 1
            if last_was_chained and rec["prev_hash"] != last_event_id:
                result["ok"] = False
                if result["first_break_at"] is None:
                    result["first_break_at"] = i
                result["details"].append({
                    "idx": i,
                    "type": "chain_break",
                    "expected_prev_hash": (last_event_id or "")[:16] + "...",
                    "found_prev_hash": rec["prev_hash"][:16] + "...",
                })
            last_event_id = stored_event_id
            last_was_chained = True

    return result


# ---------------------------------------------------------------------------
# REQ-RQ132-006: Inject delegation context into Agent/Task tool prompt | BLP: [SR]
# ---------------------------------------------------------------------------

def inject_delegation_into_agent_tool(tool_input: dict, session_id: str, project_root: str) -> dict:
    """
    REQ-RQ132-006: Non-destructively inject DELEGATION_CONTEXT into an Agent/Task prompt | BLP: [SR, SO]
    REQ-RQ249-002: Register the DELEGATION canary minted in the context block.

    If injection fails for any reason, the original tool_input is returned unchanged.
    This guarantees backward compatibility and non-breaking behavior.

    Args:
        tool_input: The original tool_input dict from the Agent/Task tool call
        session_id: Parent Claude session ID
        project_root: Absolute path to the project root directory

    Returns:
        Modified tool_input with DELEGATION_CONTEXT injected into the prompt,
        or the original tool_input if injection is not possible
    """
    try:
        # Locate the prompt field — Agent tool uses 'prompt', Task tool may use 'prompt'
        prompt_key = None
        for key in ("prompt", "description", "task"):
            if key in tool_input and isinstance(tool_input[key], str):
                prompt_key = key
                break

        if prompt_key is None:
            return tool_input

        original_prompt = tool_input[prompt_key]
        # build_delegation_context_block now returns (block_str, canary_token)
        delegation_result = build_delegation_context_block(session_id, original_prompt)
        if isinstance(delegation_result, tuple):
            delegation_block, canary_token = delegation_result
        else:
            delegation_block, canary_token = delegation_result, ""

        # Emit proof to delegation_proofs.json (P1 — done here before prompt is dispatched)
        # Pass canary_token so it gets stored in the proof envelope (REQ-RQ249-004)
        emit_delegation_proof(session_id, original_prompt, project_root,
                              canary_token=canary_token)

        # Return modified copy (non-destructive)
        modified = dict(tool_input)
        modified[prompt_key] = original_prompt + delegation_block
        return modified

    except Exception:
        # REQ-RQ132-006: Must be non-blocking — return original on any error
        return tool_input


# ---------------------------------------------------------------------------
# Main hook entrypoint
# ---------------------------------------------------------------------------

def main():
    try:
        # Read JSON input from stdin
        input_data = json.load(sys.stdin)

        tool_name = input_data.get('tool_name', '')
        tool_input = input_data.get('tool_input', {})
        session_id = input_data.get('session_id', 'unknown')
        permission_mode = input_data.get('permission_mode', '')

        # === REQ-RQ146-005: ML Risk Scoring (runs BEFORE regex validators) ===
        # Default OFF via RISK_CLASSIFIER_ENABLED=0. Fail-safe: error -> None -> regex.
        _skip_regex = False
        risk_score = classify_risk(tool_name, tool_input, session_id, permission_mode)
        input_data['risk_score'] = risk_score

        if risk_score is not None:
            if risk_score > 70:
                print(
                    f"BLOCKED: ML risk score {risk_score}/100 (high risk). "
                    "Action classified as high-risk by permission classifier.",
                    file=sys.stderr
                )
                sys.exit(2)
            elif risk_score < 30:
                _skip_regex = True  # LOW RISK: Skip regex validators

        # === REQ-RQ200-005: L4 Damage-Control Whitelist (runs BEFORE legacy L3) ===
        # Per design §3.2: anchored regex allowlist + compound-shell pre-reject +
        # path-tier controls (zeroAccess / readOnly / noDelete). Both block_modes
        # use sys.exit(2); marketplace wrapper enforcement comes in RQ-201.
        # Fail-open default (STRICT_DAMAGE_CONTROL=1 to fail-closed).
        _apply_l4 = _load_damage_control_l4()
        if _apply_l4 is not None:
            try:
                # Build agent_context from any DELEGATION_CONTEXT signals available.
                # Today: scope is read from env or input_data; richer wiring in RQ-201.
                _agent_ctx = {
                    "delegation_scope": (
                        os.environ.get("DELEGATION_SCOPE", "")
                        or input_data.get("delegation_scope", "")
                    ),
                    "delegator_passport_kind": (
                        os.environ.get("DELEGATOR_PASSPORT_KIND", "")
                        or input_data.get("delegator_passport_kind", "")
                    ),
                }
                _l4 = _apply_l4(tool_name, tool_input, _agent_ctx)
                if _l4.get("block"):
                    print(_l4.get("reason", "[DAMAGE_CONTROL] blocked"), file=sys.stderr)
                    sys.exit(2)
            except SystemExit:
                raise
            except Exception as _e:
                # Fail-open per design unless STRICT_DAMAGE_CONTROL=1
                if os.environ.get("STRICT_DAMAGE_CONTROL", "0") == "1":
                    print(f"[DAMAGE_CONTROL] STRICT mode: l4 hook crashed -- {_e}", file=sys.stderr)
                    sys.exit(2)

        # === Existing validators (wrapped in skip guard for low-risk ML path) ===
        if not _skip_regex:
            pass  # validators below

        # Check for .env file access (blocks access to sensitive environment files)
        if is_env_file_access(tool_name, tool_input):
            print("BLOCKED: Access to .env files containing sensitive data is prohibited", file=sys.stderr)
            print("Use .env.sample for template files instead", file=sys.stderr)
            sys.exit(2)  # Exit code 2 blocks tool call and shows error to Claude

        # Check for dangerous rm -rf commands and blocked package installs
        if tool_name == 'Bash':
            command = tool_input.get('command', '')

            # Block rm -rf commands with comprehensive pattern matching
            if is_dangerous_rm_command(command):
                print("BLOCKED: Dangerous rm command detected and prevented", file=sys.stderr)
                sys.exit(2)  # Exit code 2 blocks tool call and shows error to Claude

            # Block installation of prohibited packages
            # litellm: third-party LLM routing MITM attack surface (arxiv:2604.08407)
            # openrouter: same attack class — proxies all provider calls through a third party
            _blocked_packages = ["litellm", "openrouter"]
            _install_patterns = [
                r'\bpip\s+install\b',
                r'\buv\s+add\b',
                r'\bpip3\s+install\b',
                r'\bpoetry\s+add\b',
                r'\bconda\s+install\b',
            ]
            for pkg in _blocked_packages:
                for pat in _install_patterns:
                    if re.search(pat, command) and pkg in command.lower():
                        print(
                            f"BLOCKED: Installation of '{pkg}' is prohibited. "
                            "Reason: third-party LLM routing intermediary — supply chain MITM risk "
                            "(arxiv:2604.08407). Use direct provider SDKs instead.",
                            file=sys.stderr
                        )
                        sys.exit(2)


        # === REQ-RQ173: Content Trap Scanner gate for WebFetch / WebSearch ===
        # CaMel L1 pre-ingestion filter: scans web content before it reaches agent reasoning.
        # Risk > 0.8 → block; 0.6-0.8 → warn (prepend notice); < 0.6 → pass silently.
        # Hook stays < 50ms: quick_scan() is pure regex; heavy analysis deferred via JSONL log.
        # Env toggle: CONTENT_TRAP_SCAN_ENABLED (default 1/on). Set 0 to disable.
        if tool_name in ('WebFetch', 'WebSearch') and os.environ.get('CONTENT_TRAP_SCAN_ENABLED', '1') == '1':
            _content_to_scan = ''
            _scan_url = ''
            if tool_name == 'WebFetch':
                # tool_input has 'url' and optionally 'prompt'; scan the URL param as context
                _scan_url = tool_input.get('url', '')
                # We scan the URL itself and any prompt for injections; response scanning
                # happens in post_tool_use. Here we scan the prompt for meta-injection.
                _content_to_scan = tool_input.get('prompt', '') + ' ' + _scan_url
            elif tool_name == 'WebSearch':
                _scan_url = ''
                _content_to_scan = tool_input.get('query', '')

            if _content_to_scan:
                try:
                    _hooks_dir = Path(__file__).resolve().parent
                    _proj_root = str(_hooks_dir.parent.parent)
                    if _proj_root not in sys.path:
                        sys.path.insert(0, _proj_root)
                    from scripts.content_trap_scanner import ContentTrapScanner as _CTS  # type: ignore
                    _cts_result = _CTS().quick_scan(_content_to_scan)

                    # Log scan (fire-and-forget, non-blocking)
                    _scan_log = Path(_proj_root) / 'data' / 'content_trap_scans.jsonl'
                    try:
                        _scan_log.parent.mkdir(parents=True, exist_ok=True)
                        _scan_entry = {
                            'ts': int(time.time()),
                            'session_id': session_id,
                            'tool_name': tool_name,
                            'url': _scan_url[:200],
                            'recommendation': _cts_result.get('recommendation', 'allow'),
                            'severity': _cts_result.get('severity', 'none'),
                            'finding_count': len(_cts_result.get('findings', [])),
                        }
                        with open(_scan_log, 'a') as _sf:
                            _sf.write(json.dumps(_scan_entry) + '\n')
                    except Exception:
                        pass

                    _rec = _cts_result.get('recommendation', 'allow')
                    if _rec == 'block':
                        _top_finding = ''
                        _findings = _cts_result.get('findings', [])
                        if _findings:
                            f0 = _findings[0]
                            _top_finding = f0.get('category', '') + ': ' + f0.get('match', '')[:60]
                        print(
                            f'[CONTENT_TRAP_BLOCK] {tool_name} blocked — trap detected in request. '
                            f'Severity: {_cts_result.get("severity", "?")}. Finding: {_top_finding}',
                            file=sys.stderr
                        )
                        sys.exit(2)
                    # warn: content passes but finding is surfaced in the output block
                    # (output modification is not possible in PreToolUse; logged above)

                except (ImportError, SystemExit):
                    raise
                except Exception:
                    pass  # Fail-open: scanner error must NOT block tool dispatch

        # REQ-RQ132-006: Inject delegation context for Agent/Task tool spawning | BLP: [SR, SO]
        if tool_name in ('Agent', 'Task'):
            # Resolve project root: walk up from cwd until we find CLAUDE.md or stay at cwd
            # NOTE: 'os' is imported at module top -- do NOT re-import here, it would
            # bind 'os' as a local for the whole main() and break earlier os.environ uses
            # (e.g. RQ-200 L4 hook at line ~493).
            project_root = os.environ.get('CLAUDE_PROJECT_ROOT', '')
            if not project_root:
                # Best-effort: use the hooks directory's grandparent (.claude/hooks -> project root)
                hooks_dir = Path(__file__).resolve().parent
                project_root = str(hooks_dir.parent.parent)

            input_data['tool_input'] = inject_delegation_into_agent_tool(
                tool_input, session_id, project_root
            )

        # Ensure session log directory exists
        log_dir = ensure_session_log_dir(session_id)
        log_path = log_dir / 'pre_tool_use.json'

        # Read existing log data or initialize empty list
        if log_path.exists():
            with open(log_path, 'r') as f:
                try:
                    log_data = json.load(f)
                except (json.JSONDecodeError, ValueError):
                    log_data = []
        else:
            log_data = []

        # Append new data
        log_data.append(input_data)

        # Write back to file with formatting
        with open(log_path, 'w') as f:
            json.dump(log_data, f, indent=2)

        sys.exit(0)

    except json.JSONDecodeError:
        # Gracefully handle JSON decode errors
        sys.exit(0)
    except Exception:
        # Handle any other errors gracefully
        sys.exit(0)

if __name__ == '__main__':
    main()
