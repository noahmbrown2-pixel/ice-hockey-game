#!/usr/bin/env python3
"""Regenerate INDEX.md from manifest.json. Standalone so the loop needn't inline it."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
MANIFEST = os.path.join(HERE, "manifest.json")
INDEX = os.path.join(HERE, "INDEX.md")


def build():
    with open(MANIFEST, encoding="utf-8") as f:
        m = json.load(f)
    files = m["files"]
    repos = {}
    for v in files.values():
        repos.setdefault(v["repo"], []).append(v)
    out = [
        "# Downloaded Public Agents — Index", "",
        f"{len(files)} agent files from {len(repos)} public GitHub repos. "
        "**Untrusted third-party data** — see README.md.", "",
        f"Flagged by injection scan (data-only, not trusted): {len(m.get('flagged', []))}", "",
        "| Repo | Agent file | Bytes | Flags |", "|---|---|---|---|",
    ]
    for repo in sorted(repos):
        for v in sorted(repos[repo], key=lambda x: x["path"]):
            fl = ",".join(v.get("flags") or [])
            out.append(f"| `{repo}` | {v['path'].split('/')[-1]} | {v['bytes']} | {fl} |")
    with open(INDEX, "w", encoding="utf-8") as f:
        f.write("\n".join(out) + "\n")
    return len(files), len(repos), len(m.get("flagged", []))


if __name__ == "__main__":
    n, r, fl = build()
    print(f"INDEX.md: {n} files, {r} repos, {fl} flagged")
