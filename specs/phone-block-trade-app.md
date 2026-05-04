# Plan: Phone Block Trade App

**Type:** feature · **Complexity:** medium
**Target file:** `finlife-3d.html` (single self-contained HTML game)
**New asset:** `blocktrade.html` (local copy of the user's deployed game)

## Task Description

Add a 9th app to the FinLife 3D phone called **Block Trade**. Tapping it loads the player's existing browser game from `https://noahmbrown2-pixel.github.io/blocktrade/` inside the phone screen so they can play it without leaving FinLife. Pressing the phone's back button returns to the phone home with the game state preserved.

The phrase *"copy and paste this github game ... into the coding"* is interpreted as **embed the game inside the phone app**. Two ways to satisfy that:

- **(Recommended) Local-iframe**: download the deployed page once → save as `blocktrade.html` in the project root → embed via `<iframe src="./blocktrade.html">` in the phone app's content slot. Same-origin (saves work via `localStorage`), zero conflicts with FinLife's globals.
- **(Alternative) True inline**: paste the entire game body+style+script into a sandboxed `<div>` inside FinLife. Requires re-namespacing the game's globals/CSS. Higher conflict risk — see Notes.

This plan implements the recommended local-iframe approach.

## Objective

When the player presses **E** in-world to open the phone, taps the new **🧱 Block Trade** app icon, the game loads inside the phone screen at full app-area size. Tapping **← Home** returns to the phone home with the iframe stashed (game state preserved across navigations). Tapping the app a second time resumes the same iframe — the game does not reload.

## Problem Statement

The user wants their existing standalone game accessible from inside FinLife's phone UI. Inlining the full game source into FinLife's already-large `finlife-3d.html` file (~120k chars in the IIFE) creates four real risks:

1. **CSS bleed** — the game's body-level styles override FinLife's
2. **Global collisions** — both files use `requestAnimationFrame`, `localStorage`, top-level constants
3. **Event-listener double-fire** — keyboard/resize listeners from the game run alongside FinLife's
4. **File bloat** — pushes a single HTML file beyond comfortable maintenance

iframing the **live** GitHub Pages URL solves the conflict problem but introduces a hard runtime dependency on the network and on a URL the user might rename. The local-iframe approach preserves both isolation and offline play.

## Solution Approach

1. **Acquire source** — first try copying one of the existing `block-trader-*.html` files in the project root if it matches the deployed game (the user already has `block-trader-v3-factory.html`, `-crypto.html`, `-stocks.html`, `-tycoon.html` as local variants). Fall back to fetching the deployed page via `curl -L` and saving the result.
2. **Save as** `C:\Users\noahm\Project\blocktrade.html` so it's served from the same browser-sync origin as `finlife-3d.html`.
3. **Add a 9th phone app** with `data-app="blocktrade"` to `#phone-home`.
4. **Special-case the open handler** — `openApp('blocktrade')` mounts a single cached `<iframe src="./blocktrade.html">` into `#phone-app-content`, hides the home grid, shows the back button.
5. **Persist the iframe** — on "← Home", remove the iframe from `#phone-app-content` but stash it in a hidden div so its DOM (and therefore the running game) survives. Re-mount on next open.

## Relevant Files

- `C:\Users\noahm\Project\finlife-3d.html` — primary edits: phone home button, openApp branch, return-to-home cleanup.
- `C:\Users\noahm\Project\blocktrade.html` — **NEW** file. Local copy of the BlockTrader game.
- Reference: `block-trader-v3-factory.html`, `block-trader-crypto.html`, `block-trader-stocks.html`, etc. — existing local variants in the project root. One of these may already be the source of the deployed `blocktrade` repo. Check with `gh repo view noahmbrown2-pixel/blocktrade --json defaultBranchRef`, or by diffing `block-trader-v3-factory.html` (the most likely candidate) against the live page.

### New files
- `blocktrade.html` — single-file HTML game, ~the same size as `block-trader-v3-factory.html` likely.

## Implementation Phases

### Phase 1 — Acquire and validate source
Get a local file. Verify it stands alone (no missing assets, no remote-fetch errors).

### Phase 2 — Phone UI: button + open handler
Add the app icon and the `openApp('blocktrade')` branch.

### Phase 3 — Iframe persistence + back-navigation cleanup
Stash the iframe in a hidden DOM element so re-opens are instant and stateful.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Acquire `blocktrade.html`
- Try (cheapest): `gh repo view noahmbrown2-pixel/blocktrade --json defaultBranchRef` to confirm the repo and branch exist, then `gh api repos/noahmbrown2-pixel/blocktrade/contents/index.html --jq .download_url` to get a raw URL.
- Download:
  ```powershell
  curl -L https://noahmbrown2-pixel.github.io/blocktrade/ -o blocktrade.html
  ```
- Smoke test: open `http://localhost:3000/blocktrade.html` directly in a browser. Confirm the game starts, no console errors, no broken images.
- If the file references CDN scripts (e.g. tone.js, three.js): leave them — they will load fine inside an iframe at runtime.

### 2. Add the app icon to the phone home grid
- In `finlife-3d.html`, find the existing `#phone-home` block (right after the `data-app="maps"` button) and append:
  ```html
  <button class="blocktrade" data-app="blocktrade"><span class="papp-ico">🧱</span>Block Trade</button>
  ```
- Add a CSS accent rule alongside the other `.phone-home button.<app>{...}` lines:
  ```css
  .phone-home button.blocktrade{border-color:var(--orange)}
  ```

### 3. Declare iframe state
- Near the top of the IIFE, with the other `let phoneOpen` / `mapsTarget` declarations, add:
  ```js
  let blockTradeIframe = null;
  let blockTradeStash  = null; // hidden div that holds the iframe between mounts
  ```

### 4. Special-case `openApp('blocktrade')`
- At the top of the existing `openApp(name)` function (already special-cases `inbox` and `maps`) add:
  ```js
  if (name === 'blocktrade'){
    if (!blockTradeStash){
      blockTradeStash = document.createElement('div');
      blockTradeStash.style.display = 'none';
      document.body.appendChild(blockTradeStash);
    }
    if (!blockTradeIframe){
      blockTradeIframe = document.createElement('iframe');
      blockTradeIframe.src = './blocktrade.html';
      blockTradeIframe.title = 'Block Trade';
      blockTradeIframe.allow = 'autoplay; gamepad; fullscreen';
      blockTradeIframe.style.cssText =
        'width:100%;height:100%;border:0;display:block;background:#000';
    }
    returnTabContent();
    const apc = $$('phone-app-content');
    apc.appendChild(blockTradeIframe);
    apc.classList.add('active');
    apc.dataset.fullbleed = '1';        // marker for CSS to remove padding
    $$('phone-home').style.display = 'none';
    $$('phone-back').classList.add('show');
    return;
  }
  ```

### 5. Stash the iframe on back / close
- Update `returnTabContent()` so it also moves the iframe back into the stash (instead of leaving it in `#phone-app-content` to be swept later):
  ```js
  function returnTabContent(){
    const apc = $$('phone-app-content');
    // Iframe gets stashed (preserves running game state)
    if (blockTradeIframe && blockTradeIframe.parentElement === apc){
      blockTradeStash.appendChild(blockTradeIframe);
    }
    while (apc.firstChild){
      const tab = apc.firstChild;
      const lp = $$('left-panel');
      if (lp) lp.appendChild(tab); else apc.removeChild(tab);
    }
    apc.classList.remove('active');
    delete apc.dataset.fullbleed;
  }
  ```
- Add CSS to make the app content fill the phone screen edge-to-edge when fullbleed:
  ```css
  .phone-app-content[data-fullbleed]{padding:0;height:calc(100% - 36px)}
  ```

### 6. Suspend FinLife key handlers while the iframe has focus
- In the existing keydown listener (the one that maps `e` → phone, `f` → interact), add a guard at the very top:
  ```js
  if (document.activeElement === blockTradeIframe) return;
  ```
- Reason: when the user clicks into the game and presses keys, the iframe should receive them; FinLife should not also pop the phone closed.

### 7. CLAUDE.md note (optional)
- Add a one-line entry to the `finlife-3d.html` row in `CLAUDE.md`:
  *"Phone has a Block Trade app that iframes `blocktrade.html` (the user's deployed BlockTrader game)."*

### 8. Verify end-to-end
- Run validation commands below.
- Open `http://localhost:3000/finlife-3d.html`, click **Begin Life**, press **E**, tap **🧱 Block Trade** → game loads.
- Tap **← Home**, tap **Block Trade** again → confirm the running game state was preserved (score, position, etc., not reset to 0).
- Press **E** to close phone → press **E** to reopen → tap **Block Trade** → confirm same behavior.
- Inside the iframe, try in-game keys (arrows, space, etc.) — they should reach the game, not toggle FinLife's phone.

## Testing Strategy

- **Manual click-through** as described above.
- **Headless smoke test** (Playwright):
  ```js
  await page.goto('http://localhost:3000/finlife-3d.html');
  await page.click('#btn-start');
  await page.waitForTimeout(800);
  await page.keyboard.press('e');                              // open phone
  await page.click('#phone-home button[data-app="blocktrade"]');
  await page.waitForTimeout(500);
  // 1. iframe is mounted
  const present = await page.locator('#phone-app-content iframe').count();
  // 2. iframe loaded the right URL
  const src = await page.locator('#phone-app-content iframe').getAttribute('src');
  // 3. game inside the iframe reports DOMContentLoaded
  const inner = page.frameLocator('#phone-app-content iframe');
  const innerLoaded = await inner.locator('body').isVisible();
  ```
- **Persistence check**: tap back, tap app again, assert iframe element identity persists (use `evaluate` to compare `Object.is(prev, current)` on the iframe handle).
- **Console-error scan**: collect `pageerror` events; assert empty.

## Acceptance Criteria

- [ ] `blocktrade.html` exists at the project root, opens in the browser standalone, no missing assets.
- [ ] Phone home shows a 9th app icon labeled **Block Trade** with the 🧱 emoji.
- [ ] Tapping the app loads the game inside the phone's content area, edge-to-edge.
- [ ] Tapping **← Home** returns to phone home; tapping Block Trade again resumes the same running game (no reload).
- [ ] No JS errors in either FinLife or the iframe console.
- [ ] FinLife's E/Tab/F shortcuts do **not** fire while the iframe has keyboard focus.
- [ ] On a fresh page reload, the iframe lazy-creates only on first tap (not on game start) so initial scene load isn't slowed.

## Validation Commands

Run from `C:\Users\noahm\Project`:

- `node -e "console.log(require('fs').statSync('blocktrade.html').size)"` — confirms the local copy exists and is non-trivial.
- `node -e "const h=require('fs').readFileSync('finlife-3d.html','utf8'); for (const tok of ['data-app=\"blocktrade\"','blockTradeIframe','./blocktrade.html']) console.log(tok, h.includes(tok));"` — confirms all three integration points are wired.
- `node -e "const fs=require('fs');const h=fs.readFileSync('finlife-3d.html','utf8');const m=[...h.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/g)];new Function(m[m.length-1][1]);console.log('parse OK');"` — last script block parses cleanly.
- Manual: `http://localhost:3000/finlife-3d.html` → Begin Life → E → tap 🧱 Block Trade.

## Notes

- **Source freshness**: re-running `curl -L https://noahmbrown2-pixel.github.io/blocktrade/ -o blocktrade.html` updates the snapshot. If the user updates their game, this is a one-line refresh.
- **Local fallback**: if one of the existing `block-trader-*.html` files in the project root *is* the source of the deployed `blocktrade` repo, the curl step can be replaced by `cp block-trader-v3-factory.html blocktrade.html` (or whichever variant is correct). Check by visually comparing `block-trader-v3-factory.html` against `https://noahmbrown2-pixel.github.io/blocktrade/`.
- **Future cross-game integration**: a `postMessage` bridge could let the BlockTrader game's earnings flow into FinLife's `c.checking` (and vice versa: FinLife's bankroll could fund in-game trades). Out of scope for this plan but trivial to add later given the iframe is same-origin.
- **Inline alternative** (if the user explicitly rejects iframe): wrap the game in a top-level `<div id="bt-mount">`, prefix all of its CSS selectors with `#bt-mount`, IIFE-scope every top-level `let`/`const`/`function` from the game's `<script>`, replace the game's `localStorage` key with a unique one, and only register its key/resize listeners while the app is the active phone view. This is roughly 1–3 hours of careful surgery per game-internal global; the iframe path is ~15 minutes total.
- **Mobile**: the phone overlay already adapts to `@media (max-width:680px)`. The iframe inherits via `width:100%`, so mobile play works out of the box.
- **CSP / sandbox**: the iframe inherits FinLife's origin (file or localhost). No `sandbox=` attribute is needed for trust-your-own-game; if you ever want to harden, add `sandbox="allow-scripts allow-same-origin"`.
