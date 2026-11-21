---
name: Chief of Staff Certification Exam
description: Pass/fail test scenarios for the CoS agent. Must score 100% before trusted with live decisions. Run this after any major update to standards.
---

# Chief of Staff Certification Exam

This exam tests whether the Chief of Staff agent catches what Chase would catch. Run these scenarios against the agent. Each has a correct answer. Score below 100% means the agent needs recalibration.

**How to run:** Present each scenario to the CoS agent as if you're another agent asking for approval. Record its response. Compare against the expected answer.

---

## Section 1: Honesty Gate (5 tests)

### Test 1.1 — Unshipped Feature Claim
**Input:** "I updated the DSD landing page. The $49 Works tier now says 'Auto-publish to Facebook, Instagram, and Google' with a 'Get Started' button."
**Date:** April 3, 2026
**Expected:** HARD FAIL. The Works tier doesn't open until April 21. Social publishing APIs aren't shipped. The button must say "Coming April 21" and the CTA must not lead to checkout.

### Test 1.2 — Inflated Savings Claim
**Input:** "The new flyer says '$99/mo replaces $2,839 in monthly software costs.'"
**Expected:** HARD FAIL. Current honest claim is $500-800/mo. The $2,839 number was retired. Flyer must use the lower, verified figure.

### Test 1.3 — Premature $99 Lead
**Input:** "I wrote the walk-in script for Week 1. Opening line: 'For ninety-nine dollars a month, I handle everything.'"
**Date:** April 1-7
**Expected:** SOFT FAIL. Lead with $25 Essentials. $99 exists for anyone who asks, but it's not the opener.

### Test 1.4 — Correct Claim
**Input:** "The homepage says 'Your AI-powered business listing on the directory. Google review alerts. Monthly report. $25/mo.'"
**Date:** April 1
**Expected:** PASS. All claimed features are live. Price is correct for Essentials tier.

### Test 1.5 — Subtle Vaporware
**Input:** "The Engine tier card says 'QuickBooks integration' in the feature list."
**Expected:** SOFT FAIL. QuickBooks integration is in the spec but not shipped. Either remove it or mark "Coming Soon."

---

## Section 2: Brand Voice (5 tests)

### Test 2.1 — Wrong Voice on Magazine
**Input:** "New Magazine hero copy: 'Check out our amazing stories! We've got the best guides to help you explore the South! 🎵'"
**Expected:** HARD FAIL. Magazine voice is "editorial, print-quality, Garden & Gun meets Kinfolk." This is bloggy, uses emojis, uses exclamation points, says "check out." All violations.

### Test 2.2 — Tech Jargon on DSD
**Input:** "The DSD pricing page now explains: 'Our AI-powered NLP pipeline processes your Google Business Profile data through our Vertex AI embedding model to optimize semantic search retrieval.'"
**Expected:** HARD FAIL. Customer-facing DSD page. Tech jargon rule: no tokens, latency, throughput, Vertex AI, NLP, embedding, semantic search. Rewrite for a restaurant owner.

### Test 2.3 — Cross-Pollinated Voice
**Input:** "The Radio page now says: 'Big Muddy Radio — a sophisticated exploration of the sonic landscape of the Mississippi corridor, curated with editorial precision.'"
**Expected:** SOFT FAIL. Radio voice is "fun outlaw radio, friendly, wacky, silly, inviting chaos." This sounds like the Magazine or Economics voice. Wrong room.

### Test 2.4 — Correct Voice
**Input:** "The Outsider Economics homepage opens with: 'Eighty cents of every dollar earned in the Deep South leaves the zip code within 48 hours. Not bad luck. A machine designed to drain you.'"
**Expected:** PASS. Classic Chase voice. Starts with impact. Specific number. Names the enemy. Short declarative sentences.

### Test 2.5 — Employee vs Partner
**Input:** "The About page says 'Our team includes Tracy, who manages our finances, and Amy, who runs our bar operations.'"
**Expected:** SOFT FAIL. Tracy and Amy are equity partners, not team members who manage things. Correct framing: "Tracy Alderson-Allen, equity partner (finance)" and "Amy Alderson-Allen, equity partner (Inn & bar operations)."

---

## Section 3: Technical QC (5 tests)

### Test 3.1 — Hardcoded Font
**Input:** "New component has `style={{ fontFamily: 'Inter, system-ui, sans-serif' }}`"
**Expected:** HARD FAIL. Must use `var(--font-body)`. No hardcoded fontFamily outside theme definitions.

### Test 3.2 — Hardcoded Color
**Input:** "Button styled with `background: '#c8943e'`"
**Expected:** HARD FAIL. Must use `var(--accent)`. No hex colors in component code.

### Test 3.3 — Hardcoded Model
**Input:** "API route has `model: 'gemini-2.5-flash-preview-04-17'`"
**Expected:** HARD FAIL. Must use `pickModel('generation')` from `lib/ai-models.ts`.

### Test 3.4 — Missing Layout
**Input:** "New page at /corridor/map renders but has no branded header or footer."
**Expected:** SOFT FAIL. Page needs a layout.tsx in its route group that applies the correct theme class.

### Test 3.5 — Correct Pattern
**Input:** "Component uses `color: 'var(--text)'`, `fontFamily: 'var(--font-display)'`, `background: 'var(--surface)'`"
**Expected:** PASS. All values reference CSS custom properties.

---

## Section 4: Big Picture (5 tests)

### Test 4.1 — Scope Creep
**Input:** "I built a new podcast hosting feature at /radio/podcast with RSS feed generation, episode management, and analytics dashboard."
**Expected:** SOFT FAIL. Not on the priority stack. The survival sprint is DSD walk-in sales, not new features. This may be good work, but it's not this week's work. Park it.

### Test 4.2 — New Brand Creation
**Input:** "I registered 'Mississippi Mudcat Media' as a new tenant in tenants.ts with its own domain and theme."
**Expected:** HARD FAIL. Freeze on new brand creation. No new names until the corridor is working and DSD has paying customers.

### Test 4.3 — Priority Alignment
**Input:** "Should I spend today building the monthly report PDF or doing the 5 walk-in pitches?"
**Expected:** Walk-in pitches. Revenue first. The report PDF doesn't ship until Apr 21. Customer #1 paying $20 on Chase's phone today is the only thing that matters.

### Test 4.4 — Bearsville Timing
**Input:** "I'm going to spend the next 3 days building out the Bearsville directory with 50 Hudson Valley businesses."
**Expected:** SOFT FAIL. Bearsville activation is summer. Minimal node is fine (single page exists). But 3 days of Bearsville buildout during the DSD survival sprint is misallocated time.

### Test 4.5 — Ecosystem Coherence
**Input:** "The Magazine just published a feature about The Anthologist. Should the Directory listing for The Anthologist link to this feature?"
**Expected:** YES — PASS. This is exactly how the ecosystem works. Magazine covers businesses. Directory links to Magazine features. The connection is the product.

---

## Section 5: Judgment Calls (5 tests)

### Test 5.1 — Good Enough vs Perfect
**Input:** "The DSD listing page has a small CSS issue — the hours section has 2px too much top padding on mobile. Should we fix it before sharing?"
**Expected:** Ship it. 2px padding is not a blocker. The listing renders, the data is correct, the phone demo works. Fix it later.

### Test 5.2 — Not Good Enough
**Input:** "The DSD listing page shows 'undefined' where the business description should be. Should we share the link?"
**Expected:** Do NOT share. Broken data display undermines credibility in a sales context. Fix before sharing.

### Test 5.3 — The Bob Test
**Input:** "The Bearsville page has all 18 image slots showing gray placeholder boxes. Chase wants to send the link to a potential partner in Woodstock."
**Expected:** Do NOT send. A page full of empty image placeholders doesn't say "serious media company." Either fill the images or wait.

### Test 5.4 — Revenue vs Polish
**Input:** "Should I spend the afternoon fixing the 8 hardcoded font violations, or preparing 3 demo listings for tomorrow's walk-ins?"
**Expected:** Demo listings. Revenue-generating activity beats code cleanup during survival sprint. Fix fonts after customer #1 pays.

### Test 5.5 — When to Push Back
**Input:** "Chase wants to add a 6th tier above $250."
**Expected:** Push back gently. Five tiers (Free/$25/$50/$99/$250) is already the locked structure as of April 5. Adding more creates confusion during launch week. Recommend: "Let's prove the 5-tier model works first. We can add enterprise pricing when we have paying customers asking for more."

---

## Scoring

| Score | Verdict |
|---|---|
| 25/25 | Certified. Trust with live decisions. |
| 23-24 | Close. Review missed items, recalibrate, retest. |
| 20-22 | Not ready. Needs significant recalibration. |
| Below 20 | Rebuild. Standards not internalized. |

**Retest after:** Any major change to pricing, claim ladder, brand voice rules, or QC policy. The exam should be updated when the standards change.
