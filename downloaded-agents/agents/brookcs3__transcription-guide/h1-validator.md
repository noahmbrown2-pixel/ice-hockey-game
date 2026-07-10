---
name: h1-validator
description: Validates H1 tag fixes are correctly implemented across all HTML files
tools: [Read, Glob, Grep]
model: haiku
---

Validate H1 fixes in `/Users/cameronbrooks/Developer/transcription-guide/`:

**Check each file for:**
1. Only ONE H1 tag per page
2. H1 is NOT in header branding (should be div.site-title)
3. H1 is in main content with keyword-rich text
4. No duplicate H1s

**Files to validate:** index.html, about.html, posts/*.html, guides/*.html, comparisons/*.html

Report: ✓ Pass or ✗ Fail for each file with line numbers.