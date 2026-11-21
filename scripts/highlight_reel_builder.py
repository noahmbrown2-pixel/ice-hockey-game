#!/usr/bin/env python3
"""Build a highlight-reel trailer from clips pulled out of one or more source
videos, joined with crossfade transitions (video xfade + audio acrossfade).

Usage:
  python scripts/highlight_reel_builder.py MANIFEST.tsv OUTPUT.mp4 [options]

MANIFEST.tsv is tab-separated, one clip per line, no header:
  source_path<TAB>start_seconds<TAB>duration_seconds

Options:
  --transition-duration SECS  Crossfade length between clips (default: 0.5)
  --fps N                     Common frame rate all clips are normalized to
                               before transitions (default: 30)
  --width N --height N        Common output resolution (default: 1920x1080)
  --crf N                     x264 quality for the final encode (default: 18)

Why normalize first: xfade/acrossfade expect matching frame rate and
resolution across every input. Mixing e.g. a 60fps source with a 29.97fps
source without normalizing first produces broken/misaligned transitions.
"""
from __future__ import annotations

import argparse
import subprocess
import sys
import tempfile
from pathlib import Path


def extract_and_normalize(source: Path, start: float, duration: float,
                           fps: int, width: int, height: int, out_path: Path) -> None:
    vf = (
        f"fps={fps},scale={width}:{height}:force_original_aspect_ratio=decrease,"
        f"pad={width}:{height}:(ow-iw)/2:(oh-ih)/2,setsar=1"
    )
    cmd = [
        "ffmpeg", "-y", "-ss", str(start), "-t", str(duration), "-i", str(source),
        "-vf", vf, "-ar", "48000", "-ac", "2",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k",
        str(out_path),
    ]
    subprocess.run(cmd, capture_output=True, text=True, check=True)


def ffprobe_duration(path: Path) -> float:
    import json
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    )
    return float(json.loads(out.stdout)["format"]["duration"])


def build_crossfade_chain(clip_paths: list[Path], durations: list[float],
                           transition: float) -> tuple[str, str, str]:
    """Return (filter_complex, video_out_label, audio_out_label)."""
    n = len(clip_paths)
    parts = []
    v_label = "0:v"
    a_label = "0:a"
    cumulative = durations[0]
    for i in range(1, n):
        offset = cumulative - transition
        v_out = f"v{i}"
        a_out = f"a{i}"
        parts.append(
            f"[{v_label}][{i}:v]xfade=transition=fade:duration={transition}:offset={offset:.3f}[{v_out}]"
        )
        parts.append(
            f"[{a_label}][{i}:a]acrossfade=d={transition}[{a_out}]"
        )
        v_label, a_label = v_out, a_out
        cumulative += durations[i] - transition
    return ";".join(parts), v_label, a_label


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("manifest", type=Path)
    p.add_argument("output", type=Path)
    p.add_argument("--transition-duration", type=float, default=0.5)
    p.add_argument("--fps", type=int, default=30)
    p.add_argument("--width", type=int, default=1920)
    p.add_argument("--height", type=int, default=1080)
    p.add_argument("--crf", type=int, default=18)
    args = p.parse_args()

    entries = []
    for line in args.manifest.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        src, start, dur = line.split("\t")
        entries.append((Path(src), float(start), float(dur)))

    if len(entries) < 2:
        print("Need at least 2 clips to build transitions.", file=sys.stderr)
        return 1

    with tempfile.TemporaryDirectory(prefix="highlight_reel_") as tmp:
        tmp_dir = Path(tmp)
        norm_paths = []
        norm_durations = []
        for i, (src, start, dur) in enumerate(entries):
            out = tmp_dir / f"clip{i:02d}.mp4"
            print(f"Normalizing clip {i+1}/{len(entries)}: {src.name} @ {start:.1f}s ({dur:.1f}s)")
            extract_and_normalize(src, start, dur, args.fps, args.width, args.height, out)
            norm_paths.append(out)
            norm_durations.append(ffprobe_duration(out))

        filter_complex, v_out, a_out = build_crossfade_chain(
            norm_paths, norm_durations, args.transition_duration
        )

        cmd = ["ffmpeg", "-y"]
        for path in norm_paths:
            cmd += ["-i", str(path)]
        cmd += [
            "-filter_complex", filter_complex,
            "-map", f"[{v_out}]", "-map", f"[{a_out}]",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", str(args.crf),
            "-c:a", "aac", "-b:a", "192k",
            str(args.output),
        ]
        print("Rendering final crossfade edit...")
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print("FFmpeg failed:\n" + result.stderr[-4000:], file=sys.stderr)
            return 1

    total = sum(norm_durations) - args.transition_duration * (len(norm_durations) - 1)
    print(f"Done: {args.output} (~{total:.1f}s, {len(entries)} clips)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
