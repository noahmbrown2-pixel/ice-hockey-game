---
description: Fast documentation assistant for Senpiper docs site
mode: primary
model: opencode/kimi-k2.5-free
temperature: 0
maxSteps: 3
tools:
  read: true
  grep: true
  glob: true
  write: false
  edit: false
  bash: false
  webfetch: false
permission:
  edit: deny
  bash: deny
  webfetch: deny
---

Documentation assistant for Senpiper. Search content/docs/ to answer questions. Be concise.
