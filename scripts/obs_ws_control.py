#!/usr/bin/env python3
"""Minimal obs-websocket (v5 protocol) client to start/stop OBS recording.

Requires OBS's built-in obs-websocket server enabled (Tools > WebSocket
Server Settings, or edit %APPDATA%\\obs-studio\\plugin_config\\obs-websocket\\
config.json: "server_enabled": true).

Usage:
  python scripts/obs_ws_control.py start
  python scripts/obs_ws_control.py stop
  python scripts/obs_ws_control.py status

Env overrides: OBS_WS_HOST (default 127.0.0.1), OBS_WS_PORT (default 4455),
OBS_WS_PASSWORD (default reads it from the config.json above).
"""
from __future__ import annotations

import asyncio
import base64
import hashlib
import json
import os
import sys
from pathlib import Path

import websockets

OP_HELLO = 0
OP_IDENTIFY = 1
OP_IDENTIFIED = 2
OP_REQUEST = 6
OP_REQUEST_RESPONSE = 7


def default_password() -> str | None:
    cfg = Path.home() / "AppData/Roaming/obs-studio/plugin_config/obs-websocket/config.json"
    if cfg.exists():
        return json.loads(cfg.read_text()).get("server_password")
    return None


def build_auth(password: str, salt: str, challenge: str) -> str:
    secret = base64.b64encode(hashlib.sha256((password + salt).encode()).digest())
    return base64.b64encode(hashlib.sha256(secret + challenge.encode()).digest()).decode()


async def call(request_type: str, request_data: dict | None = None) -> dict:
    host = os.environ.get("OBS_WS_HOST", "127.0.0.1")
    port = os.environ.get("OBS_WS_PORT", "4455")
    password = os.environ.get("OBS_WS_PASSWORD") or default_password()

    async with websockets.connect(f"ws://{host}:{port}") as ws:
        hello = json.loads(await ws.recv())
        assert hello["op"] == OP_HELLO, hello

        identify: dict = {"rpcVersion": hello["d"]["rpcVersion"]}
        auth_info = hello["d"].get("authentication")
        if auth_info:
            if not password:
                raise RuntimeError("Server requires auth but no password found/set.")
            identify["authentication"] = build_auth(
                password, auth_info["salt"], auth_info["challenge"]
            )
        await ws.send(json.dumps({"op": OP_IDENTIFY, "d": identify}))

        identified = json.loads(await ws.recv())
        assert identified["op"] == OP_IDENTIFIED, identified

        req_id = "cli-1"
        payload = {"op": OP_REQUEST, "d": {"requestType": request_type, "requestId": req_id}}
        if request_data:
            payload["d"]["requestData"] = request_data
        await ws.send(json.dumps(payload))

        while True:
            msg = json.loads(await ws.recv())
            if msg["op"] == OP_REQUEST_RESPONSE and msg["d"]["requestId"] == req_id:
                return msg["d"]


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in ("start", "stop", "status"):
        print(__doc__, file=sys.stderr)
        return 1
    action = sys.argv[1]
    request_type = {
        "start": "StartRecord",
        "stop": "StopRecord",
        "status": "GetRecordStatus",
    }[action]
    result = asyncio.run(call(request_type))
    print(json.dumps(result, indent=2))
    status = result.get("requestStatus", {})
    return 0 if status.get("result") else 1


if __name__ == "__main__":
    raise SystemExit(main())
