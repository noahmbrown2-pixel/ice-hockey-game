#!/usr/bin/env python3
"""One command per loop turn: fetch N batches, rebuild INDEX, print a compact summary.

    python roam.py                 # 3 batches of 40, then reindex
    python roam.py --batches 5 --max 40

Keeps loop output tiny (a couple of lines) so recurring runs stay cheap on context.
"""
import argparse, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
MANIFEST = os.path.join(HERE, "manifest.json")
ROAM_STATE = os.path.join(HERE, "roam_state.json")

# GitHub code search caps at ~1000 results/query, so we partition the ~200k
# public agent files into non-overlapping slices and rotate through them.
BASE = "path:.claude/agents extension:md"
QUERIES = [
    f"{BASE} size:<800",
    f"{BASE} size:800..1500",
    f"{BASE} size:1500..2500",
    f"{BASE} size:2500..4000",
    f"{BASE} size:4000..6000",
    f"{BASE} size:6000..10000",
    f"{BASE} size:>10000",
    f'{BASE} "You are"',
    f'{BASE} "proactively"',
    f'{BASE} "model:"',
    f'{BASE} "description:"',
    f'{BASE} "tools:"',
    f'{BASE} "Use this agent"',
    f'{BASE} "Examples:"',
    f'{BASE} "expert"',
    f'{BASE} "specialist"',
    f'{BASE} "MUST"',
    f'{BASE} "workflow"',
    f'{BASE} "review"',
    f'{BASE} "test"',
    f'{BASE} "database"',
    f'{BASE} "security"',
    f'{BASE} "frontend"',
    f'{BASE} "backend"',
    f'{BASE} "refactor"',
    f'{BASE} "debug"',
    f'{BASE} "documentation"',
    f'{BASE} "architect"',
    f'{BASE} "python"',
    f'{BASE} "typescript"',
    f'{BASE} "react"',
    f'{BASE} "api"',
    f'{BASE} "deploy"',
    f'{BASE} "analyze"',
    f'{BASE} "planner"',
    f'{BASE} "orchestrat"',
    f'{BASE} "sonnet"',
    f'{BASE} "haiku"',
    f'{BASE} "opus"',
    # second axis: other public agent-file conventions beyond .claude/agents
    'path:.claude/agents extension:md "subagent"',
    'path:.claude/agents extension:md "capabilities"',
    'path:.claude/agents extension:md "system prompt"',
    'path:.opencode/agent extension:md',
    'path:.config/agents extension:md',
    'path:agents "You are" "description:" extension:md',
    'filename:AGENTS.md "You are"',
    'path:.claude/agents extension:md "color:"',
    'path:.claude/agents extension:md "role"',
    'path:.claude/agents extension:md "context"',
    # third axis: adjacent agent ecosystems
    'path:.cursor/rules "You are" extension:mdc',
    'path:.github/chatmodes extension:md',
    'path:.roo extension:md "role"',
    'path:.windsurf/rules "You are"',
    'path:.gemini extension:md "You are"',
    'path:.opencode/agent extension:md "description"',
    'path:.claude/agents/subagents extension:md',
    'path:.claude extension:md "You are an expert"',
    'path:agents "You are an expert" extension:md',
    'filename:AGENTS.md "You are an expert"',
]


def count():
    if not os.path.exists(MANIFEST):
        return 0, 0, 0
    with open(MANIFEST, encoding="utf-8") as f:
        m = json.load(f)
    files = m["files"]
    return len(files), len({v["repo"] for v in files.values()}), len(m.get("flagged", []))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--batches", type=int, default=3)
    ap.add_argument("--max", type=int, default=40)
    args = ap.parse_args()

    f0, _, fl0 = count()
    py = sys.executable
    new_flags = []
    # rotate through partitioned queries; skip ones proven dry so batches aren't wasted
    rs = {"qi": 0, "exhausted": []}
    if os.path.exists(ROAM_STATE):
        with open(ROAM_STATE, encoding="utf-8") as f:
            rs = json.load(f)
    rs.setdefault("exhausted", [])
    exhausted = set(rs["exhausted"])
    # if everything's dry, reset AND rewind page cursors so the re-sweep re-scans
    # page 1 — where GitHub surfaces newly-indexed files since last sweep
    if len(exhausted) >= len(QUERIES):
        exhausted.clear()
        fs_path = os.path.join(HERE, "state.json")
        if os.path.exists(fs_path):
            with open(fs_path, encoding="utf-8") as f:
                fs = json.load(f)
            for q in fs.get("queries", {}).values():
                q["next_page"] = 1
            with open(fs_path, "w", encoding="utf-8") as f:
                json.dump(fs, f)
    tried = 0
    for _ in range(args.batches):
        # advance to the next non-exhausted query
        steps = 0
        while (rs["qi"] % len(QUERIES)) in exhausted and steps < len(QUERIES):
            rs["qi"] += 1; steps += 1
        qi = rs["qi"] % len(QUERIES)
        q = QUERIES[qi]
        rs["qi"] += 1
        tried += 1
        r = subprocess.run([py, os.path.join(HERE, "fetch_agents.py"),
                            "--query", q, "--max", str(args.max)],
                           cwd=HERE, capture_output=True, encoding="utf-8", errors="replace")
        pulled = 0
        for line in (r.stdout or "").splitlines():
            if line.startswith("    ") and "->" in line:   # flagged file lines
                new_flags.append(line.strip())
            m = re.search(r"pulled (\d+) new files", line)
            if m:
                pulled = int(m.group(1))
        if pulled == 0:                # this slice is fully deduped/paged out
            exhausted.add(qi)
        if r.returncode != 0:
            print(f"[fetch error] {(r.stderr or '').strip()[:200]}")
            break
    rs["exhausted"] = sorted(exhausted)
    with open(ROAM_STATE, "w", encoding="utf-8") as f:
        json.dump(rs, f)

    subprocess.run([py, os.path.join(HERE, "gen_index.py")], cwd=HERE,
                   capture_output=True, encoding="utf-8", errors="replace")
    f1, r1, fl1 = count()
    print(f"+{f1 - f0} files this run  ->  {f1} files, {r1} repos, {fl1} flagged"
          f"  ({len(exhausted)}/{len(QUERIES)} slices dry)")
    if fl1 > fl0:
        print(f"[!] {fl1 - fl0} new flag(s):")
        for line in new_flags[:8]:
            print(f"    {line}")


if __name__ == "__main__":
    main()
