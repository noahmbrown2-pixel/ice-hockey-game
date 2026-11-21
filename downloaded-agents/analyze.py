#!/usr/bin/env python3
"""Analyze the downloaded agent corpus: parse frontmatter, score quality, dedupe
by content, and rank. Popularity = how many distinct repos ship a near-identical
copy (agents that get copied a lot are, empirically, the respected ones).

    python analyze.py            # prints ranked shortlists
"""
import hashlib, json, os, re
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
AGENTS = os.path.join(HERE, "agents")

ZW = re.compile(r"[​‌‍⁠]")

def parse(text):
    name = desc = model = ""
    tools = ""
    m = re.match(r"\s*---\s*\n(.*?)\n---", text, re.S)
    fm = m.group(1) if m else ""
    body = text[m.end():] if m else text
    for line in fm.splitlines():
        mm = re.match(r"\s*name\s*:\s*(.+)", line)
        if mm and not name: name = mm.group(1).strip().strip("\"'")
        md = re.match(r"\s*description\s*:\s*(.+)", line)
        if md and not desc: desc = md.group(1).strip().strip("\"'")
        mo = re.match(r"\s*model\s*:\s*(.+)", line)
        if mo and not model: model = mo.group(1).strip().strip("\"'")
        mt = re.match(r"\s*tools\s*:\s*(.+)", line)
        if mt and not tools: tools = mt.group(1).strip()
    return name, desc, model, tools, fm, body

def norm(body):
    b = ZW.sub("", body).lower()
    b = re.sub(r"\s+", " ", b)
    return b.strip()

def score(name, desc, fm, body):
    s = 0.0
    if name: s += 5
    if desc: s += min(len(desc) / 40.0, 12)          # a real description
    if "tools:" in fm.lower(): s += 4
    if re.search(r"model\s*:", fm): s += 2
    headers = len(re.findall(r"(?m)^#{1,4}\s", body))
    s += min(headers * 1.5, 18)                        # structure
    if re.search(r"```", body): s += 4                 # code / examples
    if re.search(r"(?i)<example|example:|for example|## examples", body): s += 4
    if re.search(r"(?i)(step 1|1\.\s|workflow|process:|checklist)", body): s += 3
    if re.search(r"(?i)(you are|your role|responsibilit)", body): s += 3
    words = len(body.split())
    # sweet-spot: reward substance, mild penalty for bloat past ~2500 words
    s += min(words / 120.0, 16) - max(0, (words - 2500) / 1500.0)
    return round(s, 1)

def main():
    clusters = {}                 # hash -> dict
    total = 0
    for root, _, files in os.walk(AGENTS):
        for fn in files:
            if not fn.endswith(".md"): continue
            p = os.path.join(root, fn)
            try:
                with open(p, encoding="utf-8") as f: text = f.read()
            except OSError: continue
            total += 1
            name, desc, model, tools, fm, body = parse(text)
            if len(body.strip()) < 80: continue        # skip stubs
            h = hashlib.sha1(norm(body).encode()).hexdigest()
            repo = os.path.basename(root)
            c = clusters.get(h)
            if c is None:
                clusters[h] = {"name": name, "desc": desc, "model": model,
                               "tools": tools, "score": score(name, desc, fm, body),
                               "words": len(body.split()), "repos": {repo},
                               "path": os.path.relpath(p, HERE)}
            else:
                c["repos"].add(repo)
                if not c["name"] and name: c["name"] = name

    rows = list(clusters.values())
    for r in rows: r["copies"] = len(r["repos"])
    print(f"scanned {total} files -> {len(rows)} distinct agents\n")

    print("=== TOP 25 BY QUALITY SCORE (distinct) ===")
    for r in sorted(rows, key=lambda x: -x["score"])[:25]:
        print(f"{r['score']:5.1f}  x{r['copies']:<4} {r['name'][:34]:34} | {r['path']}")

    print("\n=== TOP 25 BY POPULARITY (copied across repos) ===")
    for r in sorted(rows, key=lambda x: -x["copies"])[:25]:
        print(f"x{r['copies']:<5} {r['score']:5.1f}  {r['name'][:34]:34} | {r['desc'][:60]}")

    # combined: quality AND adopted by many repos, distinct names
    seen = set(); combo = []
    for r in sorted(rows, key=lambda x: -(x["score"] * (1 + (x["copies"]) ** 0.5))):
        key = re.sub(r"[^a-z]", "", r["name"].lower())
        if key in seen: continue
        seen.add(key); combo.append(r)
    print("\n=== TOP 30 COMBINED (quality x adoption, distinct names) ===")
    for r in combo[:30]:
        print(f"{r['score']:5.1f}  x{r['copies']:<4} {r['name'][:30]:30} | {r['path']}")

if __name__ == "__main__":
    main()
