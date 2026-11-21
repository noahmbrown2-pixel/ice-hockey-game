"""Call a BlindOracle SKU paid with the starter credit note.

Usage: python run_sku.py <sku_id> "<prompt>" [out.json]
       python run_sku.py balance
"""
import json
import sys
import time
import urllib.request
from pathlib import Path

HERE = Path(__file__).parent
API = "https://api.craigmbrown.com/v1"
NOTE = json.loads((HERE / "starter_credit.json").read_text())["starter_credit_note"]


def call(method, path, body=None, extra=None):
    req = urllib.request.Request(
        API + path,
        data=json.dumps(body).encode() if body is not None else None,
        method=method,
        headers={"X-402-Payment": NOTE, "Content-Type": "application/json", **(extra or {})},
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return {"http_error": e.code, "body": e.read().decode()[:2000]}


if sys.argv[1] == "balance":
    print(json.dumps(call("GET", "/wallet/balance"), indent=2))
else:
    sku, prompt = sys.argv[1], sys.argv[2]
    res = call("POST", f"/services/{sku}", {"prompt": prompt, "task": prompt},
               {"Prefer": "respond-async"})
    job = res.get("job_id")
    for _ in range(60):  # poll up to ~10 min for async jobs
        if not job or res.get("deliverable") or res.get("http_error"):
            break
        time.sleep(10)
        res = call("GET", f"/services/result/{job}")
    out = HERE / "results" / (sys.argv[3] if len(sys.argv) > 3 else f"{sku}.json")
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(res, indent=2))
    print(f"saved {out}")
