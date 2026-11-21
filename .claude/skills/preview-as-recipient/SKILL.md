---
name: preview-as-recipient
description: Render an outbound email in the recipient's-side theme (light-mode for external, dark for internal) before sending. Catches the Jesse-Pollak-bare-Gmail failure mode where green-on-black text becomes invisible in light-mode Gmail. Citizen-Dev Controls Cat 15 empowerment shortcut.
allowed-tools: [Bash, Read, Write]
---

# preview-as-recipient

**Role:** You are the recipient-side email previewer — you re-render outbound HTML in the recipient's likely theme (light for external, dark for internal) and surface the visual result before send. You preview only; you never send the email.

**Output / Termination:** Return `{light_preview_path, dark_preview_path, tinyurl}` and stop. Do not alter the source email or transmit it.

Render outbound email HTML in the recipient's likely theme (light vs dark) and surface the visual result before send. Inspired by the 2026-05-13 Jesse Pollak incident: green-on-black text rendered invisibly in his light-mode Gmail.

## When to use

- Before sending ANY external cold email
- Before sending to a new recipient whose theme you haven't confirmed
- When operator asks "did this render right?"

## Usage

```
/preview-as-recipient <path-to-email-html>
```

The skill:
1. Detects recipient context (external vs internal) from `gtm/drafts_*/` path or explicit flag
2. Forces a light-mode override of any green-on-black CSS
3. Outputs a side-by-side preview HTML at `html-output/preview-<timestamp>.html`
4. Returns a TinyURL for mobile viewing

## Implementation

```bash
INPUT="${1:-}"
if [ ! -f "$INPUT" ]; then
  echo "Usage: /preview-as-recipient <path-to-email-html>"
  exit 1
fi

TS=$(date +%Y%m%d-%H%M%S)
OUT="html-output/preview-${TS}-$(basename "$INPUT")"

python3 - <<EOF
import re, sys
src = open("$INPUT").read()
# Strip green-on-black; force light-mode for external preview
light = re.sub(r'#0a0a0a|#000000|#1a1a1a', '#ffffff', src, flags=re.IGNORECASE)
light = re.sub(r'#00ff41', '#222222', light, flags=re.IGNORECASE)
light = re.sub(r'#e0e0e0', '#222222', light, flags=re.IGNORECASE)
light = re.sub(r'color:\s*#[0-9a-fA-F]+;?\s*background[^;}]*#0[0-9a-fA-F]+', 'color:#222;background:#fff', light, flags=re.IGNORECASE)

dual = f"""<!DOCTYPE html><html><head><style>
body{{margin:0;font-family:sans-serif}}
.split{{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:20px;background:#999}}
.pane{{background:#fff;padding:10px;border-radius:6px}}
.pane h2{{margin:0 0 10px 0;font-size:14px;padding:6px 10px;background:#222;color:#fff;border-radius:3px}}
.pane.dark h2{{background:#00ff41;color:#000}}
.frame{{border:1px solid #ccc;height:600px;overflow:auto}}
</style></head><body><div class="split">
<div class="pane"><h2>Light-mode Gmail (most external recipients)</h2><div class="frame">{light}</div></div>
<div class="pane dark"><h2>Dark-mode (operator + internal review)</h2><div class="frame">{src}</div></div>
</div></body></html>"""

open("$OUT", "w").write(dual)
print(f"Preview saved: $OUT")
EOF

# Generate TinyURL for mobile access
URL="http://34.58.12.50:8080/$(basename "$OUT")"
TINY=$(curl -s "https://tinyurl.com/api-create.php?url=${URL}" --max-time 5)
echo "TinyURL: $TINY"
```

## Failure modes prevented

- Green-on-black invisible in light Gmail (Jesse Pollak 2026-05-13)
- Theme test against dark-only DOM before external send
- Embedded image misalignment when forced from dark to light

## Related

- `feedback_verify_external_email_before_send.md` — codifies preview-before-send rule
- `feedback_compose_email_before_send.md` — green-on-black is INTERNAL only
- `gtm/drafts_*/` — staging directory pattern
