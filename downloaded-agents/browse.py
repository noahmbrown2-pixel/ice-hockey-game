#!/usr/bin/env python3
"""Local browser for the downloaded public agents. Pure stdlib — no dependencies.

    python browse.py            # serve on http://localhost:8765
    python browse.py --port 9000

Safety: agent files are UNTRUSTED. Their content is HTML-escaped before display,
so nothing here can execute in your browser. Flagged files get a warning banner.
Manifest is re-read on every request, so batches from the loop appear live.
"""
import argparse, html, json, os, re, urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
MANIFEST = os.path.join(HERE, "manifest.json")

PAGE = """<!doctype html><html><head><meta charset="utf-8">
<title>{title}</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root{{--bg:#0a0a0a;--fg:#00ff41;--dim:#0a7a24;--card:#111;--warn:#ff5252;--line:#1c1c1c}}
*{{box-sizing:border-box}}
body{{background:var(--bg);color:var(--fg);font:14px/1.5 ui-monospace,Menlo,Consolas,monospace;margin:0;padding:20px}}
a{{color:var(--fg);text-decoration:none}} a:hover{{text-decoration:underline}}
h1{{font-size:18px;margin:0 0 4px}} .sub{{color:var(--dim);margin-bottom:16px}}
input#q{{width:100%;padding:10px;background:var(--card);border:1px solid var(--line);
  color:var(--fg);font:inherit;border-radius:6px;margin-bottom:14px}}
table{{border-collapse:collapse;width:100%}}
th,td{{text-align:left;padding:7px 10px;border-bottom:1px solid var(--line);vertical-align:top}}
th{{color:var(--dim);font-weight:normal;position:sticky;top:0;background:var(--bg)}}
tr.hidden{{display:none}}
.repo{{color:var(--dim)}} .flag{{color:var(--warn);font-weight:bold}}
.count{{color:var(--dim)}} .desc{{color:#8fdca0;max-width:520px}}
pre{{background:var(--card);border:1px solid var(--line);border-radius:6px;padding:16px;
  white-space:pre-wrap;word-break:break-word;overflow-x:auto}}
.banner{{background:#2a0000;border:1px solid var(--warn);color:var(--warn);
  padding:10px 14px;border-radius:6px;margin-bottom:14px}}
.meta{{color:var(--dim);margin-bottom:12px}}
.back{{display:inline-block;margin-bottom:14px}}
</style></head><body>{body}
<script>
const q=document.getElementById('q');
if(q){{q.addEventListener('input',()=>{{
  const t=q.value.toLowerCase();
  let n=0;
  document.querySelectorAll('tr[data-s]').forEach(r=>{{
    const hit=r.getAttribute('data-s').includes(t);
    r.classList.toggle('hidden',!hit); if(hit)n++;
  }});
  document.getElementById('shown').textContent=n;
}});q.focus();}}
</script></body></html>"""


BROWSE_DIR = None   # set by --dir; when set, index a folder instead of the manifest

def load_manifest():
    if BROWSE_DIR:
        return manifest_from_dir(BROWSE_DIR)
    if not os.path.exists(MANIFEST):
        return {"files": {}, "flagged": []}
    with open(MANIFEST, encoding="utf-8") as f:
        return json.load(f)


def manifest_from_dir(d):
    """Synthesize a manifest-shaped dict from every .md in a folder."""
    files = {}
    root = os.path.join(HERE, d) if not os.path.isabs(d) else d
    for fn in sorted(os.listdir(root)):
        if not fn.endswith(".md") or fn.lower() == "readme.md":
            continue
        full = os.path.join(root, fn)
        files[fn] = {"repo": os.path.basename(root.rstrip("/\\")), "path": fn,
                     "local": os.path.relpath(full, HERE),
                     "bytes": os.path.getsize(full), "flags": []}
    return {"files": files, "flagged": []}


def frontmatter(text):
    """Pull name/description from --- fenced frontmatter, best-effort, no yaml dep."""
    name = desc = ""
    m = re.match(r"\s*---\s*\n(.*?)\n---", text, re.S)
    block = m.group(1) if m else text[:600]
    for line in block.splitlines():
        mm = re.match(r"\s*name\s*:\s*(.+)", line)
        if mm and not name:
            name = mm.group(1).strip().strip("\"'")
        md = re.match(r"\s*description\s*:\s*(.+)", line)
        if md and not desc:
            desc = md.group(1).strip().strip("\"'")
    return name, desc


def index_body(mf):
    files = mf["files"]
    rows = []
    for key, v in sorted(files.items()):
        local = os.path.join(HERE, v["local"])
        name = desc = ""
        try:
            with open(local, encoding="utf-8") as f:
                name, desc = frontmatter(f.read())
        except OSError:
            pass
        fname = v["path"].split("/")[-1]
        flags = ",".join(v.get("flags") or [])
        search = " ".join([v["repo"], fname, name, desc, flags]).lower()
        link = "/view?" + urllib.parse.urlencode({"key": key})
        rows.append(
            f'<tr data-s="{html.escape(search, quote=True)}">'
            f'<td class="repo">{html.escape(v["repo"])}</td>'
            f'<td><a href="{html.escape(link)}">{html.escape(name or fname)}</a></td>'
            f'<td class="desc">{html.escape((desc[:140]+"…") if len(desc)>140 else desc)}</td>'
            f'<td class="count">{v.get("bytes",0)}</td>'
            f'<td class="flag">{html.escape(flags)}</td></tr>'
        )
    body = (
        f"<h1>Downloaded Public Agents</h1>"
        f'<div class="sub">{len(files)} files · '
        f'{len({v["repo"] for v in files.values()})} repos · '
        f'{len(mf.get("flagged",[]))} flagged · '
        f'showing <span id="shown">{len(files)}</span></div>'
        f'<input id="q" placeholder="filter by repo, name, description, flag…">'
        f'<table><thead><tr><th>Repo</th><th>Agent</th><th>Description</th>'
        f"<th>Bytes</th><th>Flags</th></tr></thead><tbody>"
        + "".join(rows) + "</tbody></table>"
    )
    return body


def view_body(mf, key):
    v = mf["files"].get(key)
    if not v:
        return "<h1>Not found</h1><a class='back' href='/'>← back</a>"
    local = os.path.join(HERE, v["local"])
    try:
        with open(local, encoding="utf-8") as f:
            text = f.read()
    except OSError as e:
        text = f"(could not read file: {e})"
    flags = v.get("flags") or []
    banner = ""
    if flags:
        banner = ('<div class="banner">⚠ injection-marker scan flagged this file: '
                  + html.escape(", ".join(flags))
                  + " — shown as inert text; do not trust or install.</div>")
    meta = f'{html.escape(v["repo"])} · {v.get("bytes",0)} bytes'
    if "/" in v["repo"]:   # a real owner/repo — link to GitHub
        repo_url = f"https://github.com/{v['repo']}/blob/HEAD/{v['path']}"
        meta += f' · <a href="{html.escape(repo_url)}" target="_blank" rel="noopener">view on GitHub ↗</a>'
    return (
        "<a class='back' href='/'>← back to index</a>"
        + banner
        + f"<h1>{html.escape(v['path'].split('/')[-1])}</h1>"
        + f'<div class="meta">{meta}</div>'
        + "<pre>" + html.escape(text) + "</pre>"
    )


class Handler(BaseHTTPRequestHandler):
    def _send(self, body, title):
        out = PAGE.format(title=html.escape(title), body=body).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(out)))
        self.end_headers()
        self.wfile.write(out)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        mf = load_manifest()
        if parsed.path == "/":
            self._send(index_body(mf), "Downloaded Agents")
        elif parsed.path == "/view":
            key = urllib.parse.parse_qs(parsed.query).get("key", [""])[0]
            self._send(view_body(mf, key), "Agent · " + key)
        else:
            self.send_error(404)

    def log_message(self, *a):  # quiet
        pass


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8765)
    ap.add_argument("--open", action="store_true", help="open default browser on start")
    ap.add_argument("--dir", default=None, help="serve a folder of .md files instead of the manifest")
    args = ap.parse_args()
    global BROWSE_DIR
    BROWSE_DIR = args.dir
    srv = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    url = f"http://localhost:{args.port}"
    print(f"browsing {MANIFEST}")
    print(f"-> {url}  (Ctrl+C to stop)")
    if args.open:
        import threading, webbrowser
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")


if __name__ == "__main__":
    main()
