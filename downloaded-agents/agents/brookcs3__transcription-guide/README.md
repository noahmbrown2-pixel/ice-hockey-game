# SEO Action Agents - Mac Transcription Guide

These micro-agents execute the comprehensive SEO improvements from `CONTENT_STRUCTURE_ANALYSIS.md`.

## Agent Fleet

### Priority 1 (Critical Fixes)
1. **h1-fixer** (Haiku) - Fixes H1 tags site-wide
2. **review-schema-adder** (Haiku) - Adds Review schema with star ratings
3. **hub-page-creator** (Sonnet) - Creates 4 missing hub pages
4. **link-enricher** (Haiku) - Replaces generic links with keyword-rich anchors

### Priority 2 (Structure)
5. **h3-subsection-adder** (Haiku) - Adds H3 hierarchy throughout
6. **toc-implementer** (Haiku) - Implements Table of Contents

## Deployment

All agents have Read, Write, Edit, Glob tools and can modify files directly.

Launch order:
1. h1-fixer (fixes foundation)
2. hub-page-creator (builds silo structure)
3. review-schema-adder (enables rich results)
4. link-enricher (improves internal linking)
5. toc-implementer (adds navigation)
6. h3-subsection-adder (refines hierarchy)

## Location
Agents stored: `/Users/cameronbrooks/Developer/transcription-guide/.claude/agents/`
Project root: `/Users/cameronbrooks/Developer/transcription-guide/`