#!/usr/bin/env python3
"""Turn a raw video into TikTok-ready vertical clips using ffmpeg.

Usage:
  python scripts/tiktok_clipper.py INPUT.mp4 [options]

Options:
  --out-dir DIR         Output directory (default: ./tiktok_output)
  --clip-length SECS    Max length per clip in seconds (default: 45)
  --start SECS          Only process from this timestamp onward (default: 0)
  --end SECS            Stop processing at this timestamp (default: end of file)
  --mode {pad,crop}     pad = blurred-background letterbox (keeps full frame)
                        crop = center-crop to fill 1080x1920 (default: pad)
  --captions            Burn in auto-generated captions (requires --whisper-model)
  --whisper-model PATH  Path to a whisper.cpp ggml model (*.bin) for --captions
  --crf N               x264 quality, lower = better/larger (default: 20)
  --trim-silence        Cut dead-air pauses out of the source before splitting
  --silence-threshold-db N   Below this is "silence" (default: -30)
  --silence-min-duration SECS  Minimum pause length worth cutting (default: 0.6)
  --silence-padding SECS       Silence kept around each cut, for a natural
                                sound instead of an abrupt jump (default: 0.2)

What it does:
  1. Probes the input with ffprobe.
  2. Optionally detects silent pauses (ffmpeg's silencedetect) and cuts them
     out first, so --clip-length isn't spent on dead air.
  3. Splits it into consecutive clips of --clip-length seconds (or one clip
     if the source is already short) between --start/--end.
  4. Reformats each clip to 1080x1920 (TikTok's native vertical format) via
     either a blurred-pad or a center-crop, so you never have to open an
     editor to reframe/export.
  5. Optionally transcribes each clip with ffmpeg's whisper.cpp filter and
     burns the result in as captions.

No source footage was available in this repo to run this against for real;
it was smoke-tested end-to-end against a synthetic generated clip (see
scripts/tiktok_clipper_smoketest.py).
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

VERTICAL_W, VERTICAL_H = 1080, 1920


def ffprobe_duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    )
    return float(json.loads(out.stdout)["format"]["duration"])


def detect_silence(path: Path, threshold_db: float, min_duration: float) -> list[tuple[float, float]]:
    """Return (start, end) pairs for silent stretches via ffmpeg's silencedetect."""
    result = subprocess.run(
        ["ffmpeg", "-i", str(path),
         "-af", f"silencedetect=noise={threshold_db}dB:d={min_duration}",
         "-f", "null", "-"],
        capture_output=True, text=True,
    )
    starts = [float(m) for m in re.findall(r"silence_start:\s*([\d.]+)", result.stderr)]
    ends = [float(m) for m in re.findall(r"silence_end:\s*([\d.]+)", result.stderr)]
    if len(starts) > len(ends):
        # Recording ended while still silent; close it off at EOF.
        ends.append(ffprobe_duration(path))
    return list(zip(starts, ends))


def compute_keep_segments(
    silences: list[tuple[float, float]], total_duration: float, padding: float
) -> list[tuple[float, float]]:
    """Complement of the silent ranges, padded so cuts don't sound abrupt."""
    keep: list[tuple[float, float]] = []
    cursor = 0.0
    for s, e in silences:
        seg_end = min(s + padding, total_duration)
        if seg_end > cursor:
            keep.append((cursor, seg_end))
        cursor = max(cursor, e - padding)
    if cursor < total_duration:
        keep.append((cursor, total_duration))

    merged: list[tuple[float, float]] = []
    for s, e in keep:
        if e <= s:
            continue
        if merged and s <= merged[-1][1] + 0.01:
            merged[-1] = (merged[-1][0], max(merged[-1][1], e))
        else:
            merged.append((s, e))
    return merged


def trim_silence(src: Path, out_path: Path, threshold_db: float,
                  min_duration: float, padding: float) -> Path:
    """Cut silent pauses out of src, writing the tightened result to out_path.

    Returns src unchanged if no cuttable silence was found (nothing to gain
    from a re-encode).
    """
    duration = ffprobe_duration(src)
    silences = detect_silence(src, threshold_db, min_duration)
    if not silences:
        return src

    keep = compute_keep_segments(silences, duration, padding)
    if len(keep) <= 1 and keep and keep[0] == (0.0, duration):
        return src  # padding swallowed every gap; nothing actually gets cut

    filter_parts = []
    concat_inputs = []
    for i, (s, e) in enumerate(keep):
        filter_parts.append(f"[0:v]trim=start={s}:end={e},setpts=PTS-STARTPTS[v{i}]")
        filter_parts.append(f"[0:a]atrim=start={s}:end={e},asetpts=PTS-STARTPTS[a{i}]")
        concat_inputs.append(f"[v{i}][a{i}]")
    filter_parts.append(f"{''.join(concat_inputs)}concat=n={len(keep)}:v=1:a=1[outv][outa]")

    cmd = [
        "ffmpeg", "-y", "-i", str(src),
        "-filter_complex", ";".join(filter_parts),
        "-map", "[outv]", "-map", "[outa]",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k",
        str(out_path),
    ]
    subprocess.run(cmd, capture_output=True, text=True, check=True)

    cut_total = duration - sum(e - s for s, e in keep)
    print(f"[trim-silence] Removed {cut_total:.1f}s of dead air across {len(silences)} pause(s)")
    return out_path


def build_video_filter(mode: str) -> str:
    if mode == "crop":
        return (
            f"scale={VERTICAL_W}:{VERTICAL_H}:force_original_aspect_ratio=increase,"
            f"crop={VERTICAL_W}:{VERTICAL_H}"
        )
    # pad: blurred, scaled copy of the frame fills the background so nothing
    # from the original shot gets cut off.
    return (
        f"split=2[bg][fg];"
        f"[bg]scale={VERTICAL_W}:{VERTICAL_H}:force_original_aspect_ratio=increase,"
        f"crop={VERTICAL_W}:{VERTICAL_H},gblur=sigma=20[bg];"
        f"[fg]scale={VERTICAL_W}:{VERTICAL_H}:force_original_aspect_ratio=decrease[fg];"
        f"[bg][fg]overlay=(W-w)/2:(H-h)/2"
    )


def transcribe_to_srt(clip_path: Path, model_path: str, srt_path: Path) -> bool:
    """Use ffmpeg's built-in whisper.cpp filter to produce an SRT sidecar.

    Runs with cwd=srt_path.parent and relative filenames in the filter
    string. Windows drive-letter colons (C:\\...) collide with the
    filtergraph's own ':' option separator, and this filter's option parser
    doesn't honor backslash-escaping the way e.g. "subtitles" does, so the
    only reliable fix is to keep colons out of the filter string entirely.
    """
    work_dir = srt_path.parent
    model_rel = os.path.relpath(Path(model_path).resolve(), work_dir).replace("\\", "/")
    srt_rel = os.path.relpath(srt_path.resolve(), work_dir).replace("\\", "/")
    cmd = [
        "ffmpeg", "-y", "-i", str(clip_path.resolve()),
        "-af", f"whisper=model={model_rel}:language=en:destination={srt_rel}:format=srt",
        "-f", "null", "-",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=work_dir)
    if result.returncode != 0 or not srt_path.exists():
        return False
    # A silent/no-speech clip produces a 0-byte (or entry-less) SRT that
    # ffmpeg's own "subtitles" filter then fails to open at all, so an
    # empty transcript must be treated as "no captions" rather than passed
    # through to the burn-in step.
    return "-->" in srt_path.read_text(encoding="utf-8", errors="ignore")


def make_clip(src: Path, start: float, length: float, out_path: Path,
              mode: str, crf: int, captions: bool, whisper_model: str | None) -> None:
    vf = build_video_filter(mode)
    srt_path = out_path.with_suffix(".srt")
    used_captions = False

    if captions and whisper_model:
        # Cut the raw segment first so whisper only transcribes this clip's audio.
        raw_seg = out_path.with_suffix(".raw.mp4")
        subprocess.run(
            ["ffmpeg", "-y", "-ss", str(start), "-t", str(length), "-i", str(src),
             "-c", "copy", str(raw_seg)],
            capture_output=True, text=True, check=True,
        )
        used_captions = transcribe_to_srt(raw_seg, whisper_model, srt_path)
        seg_input = raw_seg
        seg_start_args: list[str] = []  # already trimmed
    else:
        seg_input = src
        seg_start_args = ["-ss", str(start), "-t", str(length)]

    if used_captions:
        # srt_path lives in out_path.parent, so a bare filename (no colon)
        # sidesteps the same drive-letter-colon problem as transcribe_to_srt.
        vf = f"{vf},subtitles='{srt_path.name}':force_style='Fontsize=20,PrimaryColour=&H00FFFFFF,Outline=2'"

    work_dir = out_path.parent
    cmd = [
        "ffmpeg", "-y", *seg_start_args, "-i", str(seg_input.resolve()),
        "-vf", vf,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", str(crf),
        "-c:a", "aac", "-b:a", "128k",
        out_path.name,
    ]
    subprocess.run(cmd, capture_output=True, text=True, check=True, cwd=work_dir)

    if captions and whisper_model:
        raw_seg.unlink(missing_ok=True)
    if srt_path.exists() and not used_captions:
        srt_path.unlink(missing_ok=True)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("input", type=Path)
    p.add_argument("--out-dir", type=Path, default=Path("tiktok_output"))
    p.add_argument("--clip-length", type=float, default=45.0)
    p.add_argument("--start", type=float, default=0.0)
    p.add_argument("--end", type=float, default=None)
    p.add_argument("--mode", choices=["pad", "crop"], default="pad")
    p.add_argument("--captions", action="store_true")
    p.add_argument("--whisper-model", type=str, default=None)
    p.add_argument("--crf", type=int, default=20)
    p.add_argument("--trim-silence", action="store_true")
    p.add_argument("--silence-threshold-db", type=float, default=-30.0)
    p.add_argument("--silence-min-duration", type=float, default=0.6)
    p.add_argument("--silence-padding", type=float, default=0.2)
    args = p.parse_args()

    if shutil.which("ffmpeg") is None or shutil.which("ffprobe") is None:
        print("ffmpeg/ffprobe not found on PATH.", file=sys.stderr)
        return 1
    if not args.input.exists():
        print(f"Input not found: {args.input}", file=sys.stderr)
        return 1
    if args.captions and not args.whisper_model:
        print("--captions requires --whisper-model <path to ggml .bin>", file=sys.stderr)
        return 1

    args.out_dir.mkdir(parents=True, exist_ok=True)

    source = args.input
    if args.trim_silence:
        trimmed_path = args.out_dir / f"{args.input.stem}.trimmed.mp4"
        source = trim_silence(
            args.input, trimmed_path, args.silence_threshold_db,
            args.silence_min_duration, args.silence_padding,
        )

    duration = ffprobe_duration(source)
    end = args.end if args.end is not None else duration

    t = args.start
    idx = 1
    made = []
    while t < end:
        length = min(args.clip_length, end - t)
        if length < 1.0:
            break
        out_path = args.out_dir / f"{args.input.stem}_clip{idx:02d}.mp4"
        make_clip(source, t, length, out_path, args.mode, args.crf,
                  args.captions, args.whisper_model)
        made.append(out_path)
        print(f"Created {out_path} ({length:.1f}s)")
        t += length
        idx += 1

    if source != args.input:
        source.unlink(missing_ok=True)

    if not made:
        print("No clips produced (check --start/--end/--clip-length).", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
