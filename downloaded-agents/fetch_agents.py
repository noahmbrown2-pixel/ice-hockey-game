#!/usr/bin/env python3
"""Roam public GitHub for Claude Code agent files and download them into quarantine.

Safety model: everything downloaded is treated as UNTRUSTED DATA.
- Saved under agents/<owner>__<repo>/... — NEVER into the live .claude/agents/.
- Each file is scanned for prompt-injection / trap markers; hits recorded in manifest.
- Nothing is executed or installed.

Usage: python fetch_agents.py [--query Q] [--page N] [--max M]
State persists in state.json + manifest.json so each run continues roaming.
"""
import base64, json, os, re, subprocess, sys, argparse, time

HERE = os.path.dirname(os.path.abspath(__file__))
AGENTS_DIR = os.path.join(HERE, "agents")
MANIFEST = os.path.join(HERE, "manifest.json")
STATE = os.path.join(HERE, "state.json")

# untrusted-content red flags (data-only scan; we never obey these)
INJECTION_PATTERNS = [
    r"(?i)ignore\s+(all\s+)?(previous|prior|above)\s+instructions",
    r"(?i)new\s+system\s+prompt",
    r"(?i)system\s*:\s*you\s+are\s+now",
    r"(?i)disregard\s+(the\s+)?(above|previous)",
    r"data:text/html;base64,",
    r"(?i)exfiltrat",
    r"(?i)curl\s+.*\|\s*(bash|sh)\b",
    r"[​‌‍⁠]",   # zero-width chars
]


def gh_json(args):
    r = subprocess.run(["gh", "api", *args], capture_output=True,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip()[:400])
    try:
        return json.loads(r.stdout)
    except (json.JSONDecodeError, TypeError) as e:
        # empty / non-JSON body (transient rate-limit, truncated response) —
        # surface as RuntimeError so callers skip this item instead of crashing
        raise RuntimeError(f"bad JSON from gh api: {str(e)[:120]}")


def load(path, default):
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return default


def save(path, obj):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2)


def scan(text):
    return sorted({p for p in INJECTION_PATTERNS if re.search(p, text)})


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--query", default="path:.claude/agents extension:md")
    ap.add_argument("--page", type=int, default=None, help="override next page")
    ap.add_argument("--max", type=int, default=40, help="max files to pull this run")
    args = ap.parse_args()

    os.makedirs(AGENTS_DIR, exist_ok=True)
    manifest = load(MANIFEST, {"files": {}, "flagged": []})
    state = load(STATE, {"queries": {}})
    q = args.query
    page = args.page if args.page is not None else state["queries"].get(q, {}).get("next_page", 1)

    seen = manifest["files"]
    pulled = 0
    new_repos = set()
    flagged_now = []
    try:
        data = gh_json(["-X", "GET", "search/code", "-f", f"q={q}",
                        "-f", "per_page=100", "-f", f"page={page}"])
    except RuntimeError as e:
        print(f"[search error] {e}")
        return
    items = data.get("items", [])
    total = data.get("total_count", 0)
    print(f"query='{q}'  page={page}  total_count={total}  items={len(items)}")

    for it in items:
        if pulled >= args.max:
            break
        repo = it["repository"]["full_name"]
        path = it["path"]
        key = f"{repo}::{path}"
        if key in seen:
            continue
        owner, name = repo.split("/", 1)
        try:
            c = gh_json(["-X", "GET", f"repos/{repo}/contents/{path}"])
            if not isinstance(c, dict) or c.get("encoding") != "base64":
                continue
            raw = base64.b64decode(c["content"])
            text = raw.decode("utf-8", "replace")
        except Exception as e:
            print(f"  skip {key}: {str(e)[:80]}")
            continue
        safe_repo = re.sub(r"[^A-Za-z0-9_.-]", "_", f"{owner}__{name}")
        dest_dir = os.path.join(AGENTS_DIR, safe_repo)
        os.makedirs(dest_dir, exist_ok=True)
        dest = os.path.join(dest_dir, re.sub(r"[^A-Za-z0-9_.-]", "_", os.path.basename(path)))
        with open(dest, "w", encoding="utf-8") as f:
            f.write(text)
        hits = scan(text)
        seen[key] = {"repo": repo, "path": path, "sha": c.get("sha"),
                     "bytes": len(raw), "local": os.path.relpath(dest, HERE),
                     "flags": hits}
        if hits:
            manifest["flagged"].append(key)
            flagged_now.append((key, hits))
        pulled += 1
        new_repos.add(repo)
        time.sleep(0.05)

    state["queries"].setdefault(q, {})["next_page"] = page + 1
    state["queries"][q]["total_count"] = total
    save(MANIFEST, manifest)
    save(STATE, state)

    print(f"pulled {pulled} new files from {len(new_repos)} repos "
          f"(collection now {len(seen)} files)")
    if flagged_now:
        print(f"[!] {len(flagged_now)} file(s) tripped injection-marker scan (quarantined, not trusted):")
        for k, h in flagged_now[:10]:
            print(f"    {k}  ->  {h}")


if __name__ == "__main__":
    main()
