#!/usr/bin/env python3
"""Automated QA check for a generated video clip/trailer.

Catches the classes of bugs that came up building the TikTok-clip and
highlight-reel pipelines by hand: wrong resolution, near-silent audio (the
OBS mic bug), black/frozen stretches, and persistent corner overlays
(subscribe buttons, watermarks, stuck scorebugs) via a temporal-variance
heuristic, instead of eyeballing every output.

Usage:
  python scripts/video_qa_check.py VIDEO.mp4 [options]

Options:
  --expect-width N / --expect-height N   Fail if resolution doesn't match
  --min-duration SECS / --max-duration SECS   Sanity bounds on duration
  --silence-threshold-db N   Mean volume below this = FAIL (default: -50)
  --frames N                 Frames sampled for the overlay heuristic (default: 20)
  --contact-sheet PATH       Also write a tiled thumbnail sheet of the sampled frames
  --json                     Machine-readable output instead of the report

Exit code: 0 if no FAILs (WARNs allowed), 1 if any check FAILs.
"""
from __future__ import annotations

import argparse
import json as jsonlib
import re
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    import numpy as np
    from PIL import Image
    HAVE_IMAGING = True
except ImportError:
    HAVE_IMAGING = False


def ffprobe_info(path: Path) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries",
         "format=duration:stream=codec_type,codec_name,width,height,r_frame_rate",
         "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    )
    data = jsonlib.loads(out.stdout)
    info = {"duration": float(data["format"]["duration"]), "video": None, "audio": None}
    for s in data["streams"]:
        if s["codec_type"] == "video" and info["video"] is None:
            info["video"] = {"width": s.get("width"), "height": s.get("height"),
                              "codec": s.get("codec_name"), "fps": s.get("r_frame_rate")}
        elif s["codec_type"] == "audio" and info["audio"] is None:
            info["audio"] = {"codec": s.get("codec_name")}
    return info


def check_volume(path: Path) -> tuple[float, float]:
    result = subprocess.run(
        ["ffmpeg", "-i", str(path), "-af", "volumedetect", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    mean = re.search(r"mean_volume:\s*(-?[\d.]+)", result.stderr)
    peak = re.search(r"max_volume:\s*(-?[\d.]+)", result.stderr)
    return (float(mean.group(1)) if mean else float("-inf"),
            float(peak.group(1)) if peak else float("-inf"))


def check_black(path: Path, duration: float) -> list[tuple[float, float]]:
    result = subprocess.run(
        ["ffmpeg", "-i", str(path), "-vf", "blackdetect=d=0.5:pic_th=0.98",
         "-f", "null", "-"],
        capture_output=True, text=True,
    )
    spans = []
    for m in re.finditer(r"black_start:([\d.]+) black_end:([\d.]+)", result.stderr):
        spans.append((float(m.group(1)), float(m.group(2))))
    return spans


def check_freeze(path: Path) -> list[tuple[float, float]]:
    result = subprocess.run(
        ["ffmpeg", "-i", str(path), "-vf", "freezedetect=n=-60dB:d=1.0",
         "-f", "null", "-"],
        capture_output=True, text=True,
    )
    spans = []
    starts = [float(m) for m in re.findall(r"freeze_start:\s*([\d.]+)", result.stderr)]
    ends = [float(m) for m in re.findall(r"freeze_end:\s*([\d.]+)", result.stderr)]
    for s, e in zip(starts, ends):
        spans.append((s, e))
    return spans


def sample_frames(path: Path, duration: float, n: int, tmp_dir: Path) -> list[Path]:
    paths = []
    margin = min(1.0, duration * 0.05)
    for i in range(n):
        t = margin + (duration - 2 * margin) * i / max(1, n - 1)
        out = tmp_dir / f"f{i:03d}.jpg"
        subprocess.run(
            ["ffmpeg", "-y", "-ss", f"{t:.2f}", "-i", str(path),
             "-frames:v", "1", "-vf", "scale=320:-1", str(out)],
            capture_output=True, text=True,
        )
        if out.exists():
            paths.append(out)
    return paths


def overlay_heuristic(frame_paths: list[Path]) -> dict:
    """Flag corners that stay near-static while the rest of the frame moves."""
    if not HAVE_IMAGING or len(frame_paths) < 4:
        return {}
    arrays = [np.asarray(Image.open(p).convert("L")) for p in frame_paths]
    h, w = arrays[0].shape
    cw, ch = int(w * 0.16), int(h * 0.16)
    regions = {
        "top-left": (slice(0, ch), slice(0, cw)),
        "top-right": (slice(0, ch), slice(w - cw, w)),
        "bottom-left": (slice(h - ch, h), slice(0, cw)),
        "bottom-right": (slice(h - ch, h), slice(w - cw, w)),
        "center": (slice(h // 2 - ch, h // 2 + ch), slice(w // 2 - cw, w // 2 + cw)),
    }
    stack = np.stack(arrays)
    scores = {}
    center_std = None
    for name, (rs, cs) in regions.items():
        region_stack = stack[:, rs, cs].astype(np.float32)
        temporal_std = region_stack.std(axis=0).mean()
        scores[name] = float(temporal_std)
        if name == "center":
            center_std = temporal_std

    if center_std is not None and center_std < 2.0:
        # The whole frame has almost no motion (likely black/frozen content,
        # already caught by the black-frames/frozen-frames checks) - a
        # near-zero center makes the corner ratio meaningless noise.
        return {"scores": scores, "flags": [], "skipped": "insufficient frame variance"}

    flags = []
    for name, std in scores.items():
        if name == "center":
            continue
        ratio = std / center_std if center_std else 0.0
        if ratio < 0.15 and std < 8.0:
            flags.append(f"{name} (temporal variance {ratio:.0%} of center) - likely a static overlay/watermark, verify visually")
    return {"scores": scores, "flags": flags}


def build_contact_sheet(frame_paths: list[Path], out_path: Path) -> None:
    if not frame_paths:
        return
    import math
    cols = math.ceil(math.sqrt(len(frame_paths) * 16 / 9))
    rows = math.ceil(len(frame_paths) / cols)
    thumb = Image.open(frame_paths[0])
    tw, th = thumb.size
    sheet = Image.new("RGB", (tw * cols, th * rows), (20, 20, 20))
    for i, fp in enumerate(frame_paths):
        img = Image.open(fp)
        sheet.paste(img, ((i % cols) * tw, (i // cols) * th))
    sheet.save(out_path)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("video", type=Path)
    p.add_argument("--expect-width", type=int, default=None)
    p.add_argument("--expect-height", type=int, default=None)
    p.add_argument("--min-duration", type=float, default=None)
    p.add_argument("--max-duration", type=float, default=None)
    p.add_argument("--silence-threshold-db", type=float, default=-50.0)
    p.add_argument("--frames", type=int, default=20)
    p.add_argument("--contact-sheet", type=Path, default=None)
    p.add_argument("--json", action="store_true")
    args = p.parse_args()

    if not args.video.exists():
        print(f"File not found: {args.video}", file=sys.stderr)
        return 1

    results = []

    def add(check, status, detail):
        results.append({"check": check, "status": status, "detail": detail})

    info = ffprobe_info(args.video)
    duration = info["duration"]

    if info["video"] is None:
        add("video-stream", "FAIL", "No video stream found")
    else:
        add("video-stream", "PASS", f"{info['video']['width']}x{info['video']['height']} {info['video']['codec']} @ {info['video']['fps']}")
        if args.expect_width and info["video"]["width"] != args.expect_width:
            add("resolution-width", "FAIL", f"expected {args.expect_width}, got {info['video']['width']}")
        if args.expect_height and info["video"]["height"] != args.expect_height:
            add("resolution-height", "FAIL", f"expected {args.expect_height}, got {info['video']['height']}")

    add("duration", "PASS", f"{duration:.1f}s")
    if args.min_duration and duration < args.min_duration:
        add("duration-min", "FAIL", f"{duration:.1f}s < minimum {args.min_duration}s")
    if args.max_duration and duration > args.max_duration:
        add("duration-max", "WARN", f"{duration:.1f}s > expected max {args.max_duration}s")

    if info["audio"] is None:
        add("audio-stream", "WARN", "No audio stream found")
    else:
        mean_db, peak_db = check_volume(args.video)
        status = "FAIL" if mean_db < args.silence_threshold_db else "PASS"
        add("audio-level", status, f"mean {mean_db:.1f}dB, peak {peak_db:.1f}dB (threshold {args.silence_threshold_db}dB)")

    black_spans = check_black(args.video, duration)
    black_total = sum(e - s for s, e in black_spans)
    if black_total > 0:
        pct = black_total / duration * 100
        status = "WARN" if pct < 10 else "FAIL"
        add("black-frames", status, f"{black_total:.1f}s black ({pct:.0f}% of duration) across {len(black_spans)} span(s)")
    else:
        add("black-frames", "PASS", "none detected")

    freeze_spans = check_freeze(args.video)
    if freeze_spans:
        add("frozen-frames", "WARN", f"{len(freeze_spans)} frozen span(s): {freeze_spans[:5]}")
    else:
        add("frozen-frames", "PASS", "none detected")

    if HAVE_IMAGING:
        with tempfile.TemporaryDirectory(prefix="video_qa_") as tmp:
            tmp_dir = Path(tmp)
            frames = sample_frames(args.video, duration, args.frames, tmp_dir)
            overlay = overlay_heuristic(frames)
            if overlay.get("skipped"):
                add("overlay-check", "PASS", f"skipped ({overlay['skipped']}, see black/frozen-frames checks)")
            elif overlay.get("flags"):
                add("overlay-check", "WARN", "; ".join(overlay["flags"]))
            elif frames:
                add("overlay-check", "PASS", "no static corner overlay detected")
            else:
                add("overlay-check", "WARN", "could not sample frames")
            if args.contact_sheet and frames:
                build_contact_sheet(frames, args.contact_sheet)
                add("contact-sheet", "PASS", f"written to {args.contact_sheet}")
    else:
        add("overlay-check", "WARN", "PIL/numpy not available, skipped")

    if args.json:
        print(jsonlib.dumps(results, indent=2))
    else:
        print(f"QA report: {args.video.name}")
        for r in results:
            print(f"  [{r['status']:4s}] {r['check']:18s} {r['detail']}")

    has_fail = any(r["status"] == "FAIL" for r in results)
    if not args.json:
        print("\nRESULT:", "FAIL" if has_fail else "PASS")
    return 1 if has_fail else 0


if __name__ == "__main__":
    raise SystemExit(main())
