#!/usr/bin/env python3
"""Watch an OBS recording output folder and auto-generate TikTok clips.

Polls --watch-dir for new video files. OBS holds an exclusive write lock on a
recording while it's in progress, so a file is only processed once its size
has stopped changing across consecutive polls AND it can be opened for
reading+writing (proof OBS released its lock). Each finished recording is
handed to scripts/tiktok_clipper.py, and results land in a per-recording
subfolder under --out-dir.

Usage:
  python scripts/obs_autoclip_watcher.py [options]

Options:
  --watch-dir DIR       Folder OBS writes recordings into
                        (default: %USERPROFILE%\\Videos\\OBS)
  --out-dir DIR         Base folder for generated clips
                        (default: <watch-dir>\\tiktok_output)
  --poll-secs N         Seconds between directory scans (default: 5)
  --stable-checks N     Consecutive stable-size polls before a file is
                        considered "done recording" (default: 3)
  --clip-length SECS    Passed through to tiktok_clipper.py (default: 45)
  --mode {pad,crop}     Passed through to tiktok_clipper.py (default: pad)
  --captions            Passed through to tiktok_clipper.py
  --whisper-model PATH  Passed through to tiktok_clipper.py
  --trim-silence        Passed through to tiktok_clipper.py
  --silence-threshold-db N      Passed through to tiktok_clipper.py
  --silence-min-duration SECS   Passed through to tiktok_clipper.py
  --silence-padding SECS        Passed through to tiktok_clipper.py
  --once                Do a single scan/process pass and exit (for testing)

State is kept in <watch-dir>\\.autoclip_state.json so restarts don't
reprocess old recordings.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

VIDEO_EXTS = {".mkv", ".mp4", ".mov", ".flv", ".ts"}
SCRIPT_DIR = Path(__file__).resolve().parent


def load_state(state_path: Path) -> dict:
    if state_path.exists():
        try:
            return json.loads(state_path.read_text())
        except (json.JSONDecodeError, OSError):
            pass
    return {"processed": {}}


def save_state(state_path: Path, state: dict) -> None:
    state_path.write_text(json.dumps(state, indent=2))


def is_unlocked(path: Path) -> bool:
    """True if we can open the file for read+write (OBS released its lock)."""
    try:
        with open(path, "r+b"):
            return True
    except OSError:
        return False


def process_recording(video: Path, out_dir: Path, args) -> bool:
    dest = out_dir / video.stem
    dest.mkdir(parents=True, exist_ok=True)
    cmd = [
        sys.executable, str(SCRIPT_DIR / "tiktok_clipper.py"), str(video),
        "--out-dir", str(dest),
        "--clip-length", str(args.clip_length),
        "--mode", args.mode,
    ]
    if args.captions:
        cmd.append("--captions")
        if args.whisper_model:
            cmd += ["--whisper-model", args.whisper_model]
    if args.trim_silence:
        cmd += [
            "--trim-silence",
            "--silence-threshold-db", str(args.silence_threshold_db),
            "--silence-min-duration", str(args.silence_min_duration),
            "--silence-padding", str(args.silence_padding),
        ]

    print(f"[autoclip] Processing {video.name} -> {dest}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"[autoclip] FAILED on {video.name}:\n{result.stderr}", file=sys.stderr)
        return False
    print(result.stdout.strip())
    print(f"[autoclip] Done: {video.name}")
    return True


def scan_once(watch_dir: Path, out_dir: Path, state: dict, pending: dict, args) -> None:
    processed = state["processed"]
    seen_now = set()

    for entry in sorted(watch_dir.iterdir()):
        if not entry.is_file() or entry.suffix.lower() not in VIDEO_EXTS:
            continue
        key = entry.name
        seen_now.add(key)
        if key in processed:
            continue

        try:
            size = entry.stat().st_size
        except OSError:
            continue

        prev = pending.get(key)
        if prev is None or prev["size"] != size:
            pending[key] = {"size": size, "stable": 0}
            continue

        pending[key]["stable"] += 1
        if pending[key]["stable"] < args.stable_checks:
            continue
        if not is_unlocked(entry):
            continue

        ok = process_recording(entry, out_dir, args)
        processed[key] = {
            "processed_at": time.time(),
            "status": "ok" if ok else "failed",
        }
        pending.pop(key, None)
        save_state(watch_dir / ".autoclip_state.json", state)

    # Drop pending-tracking for files that vanished (e.g. moved/deleted).
    for key in list(pending):
        if key not in seen_now:
            pending.pop(key, None)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--watch-dir", type=Path, default=Path.home() / "Videos" / "OBS")
    p.add_argument("--out-dir", type=Path, default=None)
    p.add_argument("--poll-secs", type=float, default=5.0)
    p.add_argument("--stable-checks", type=int, default=3)
    p.add_argument("--clip-length", type=float, default=45.0)
    p.add_argument("--mode", choices=["pad", "crop"], default="pad")
    p.add_argument("--captions", action="store_true")
    p.add_argument("--whisper-model", type=str, default=None)
    p.add_argument("--trim-silence", action="store_true")
    p.add_argument("--silence-threshold-db", type=float, default=-30.0)
    p.add_argument("--silence-min-duration", type=float, default=0.6)
    p.add_argument("--silence-padding", type=float, default=0.2)
    p.add_argument("--once", action="store_true")
    args = p.parse_args()

    watch_dir: Path = args.watch_dir
    out_dir: Path = args.out_dir or (watch_dir / "tiktok_output")
    watch_dir.mkdir(parents=True, exist_ok=True)
    out_dir.mkdir(parents=True, exist_ok=True)

    state_path = watch_dir / ".autoclip_state.json"
    state = load_state(state_path)
    pending: dict = {}

    print(f"[autoclip] Watching {watch_dir} (poll every {args.poll_secs}s)")
    print(f"[autoclip] Clips will land in {out_dir}\\<recording-name>\\")

    if args.once:
        scan_once(watch_dir, out_dir, state, pending, args)
        save_state(state_path, state)
        return 0

    try:
        while True:
            scan_once(watch_dir, out_dir, state, pending, args)
            time.sleep(args.poll_secs)
    except KeyboardInterrupt:
        print("\n[autoclip] Stopped.")
        save_state(state_path, state)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
