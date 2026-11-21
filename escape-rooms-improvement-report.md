# SECTOR — Improvement Report

_Generated 2026-06-20 via agent-vs-agent (Retention Designer vs Systems Purist) battle over `escape-rooms.html`._
_Note: code line numbers below are approximate pointers from the debate — verify against the current file before editing (it has changed several times)._

## Executive Summary

SECTOR's core loop (puzzle hunt in pitch-black procedural rooms) is atmospherically unique but currently **hard on mobile** and **unfair to new players** in the giant dark rooms. Two phases recommended: **(1) foundational fairness/perf** (grid culling, vault beacon, settings menu, joystick polish), then **(2) retention polish** that makes wins memorable (audio, escape sequence, digit feedback).

## Prioritized Improvements

| Rank | Improvement | Why It Matters | Effort | Impact | Winner |
|------|-------------|----------------|--------|--------|--------|
| 1 | Spatial grid culling (only render quads within ~40m) | ~239K quads choke mobile FPS; grid buys 60fps on most devices without gutting atmosphere | M | High | Systems |
| 2 | Settings menu + key rebinds + left-hand mode | Left-handers locked out by one-sided button layout; F-key remap is table-stakes accessibility | M | High | Systems |
| 3 | Vault glow + audio beacon (visible 30m+, tone rises toward vault) | New players wander aimlessly in the dark; beacon guides them fairly while preserving the dark vibe | S | High | Systems |
| 4 | Joystick deadzone + frame-independent drag-look | Mobile touch-look is jittery; clamp + normalize the input vector | S | Med | Systems |
| 5 | Digit-panel glow + ascending tone when all 4 found | Collection milestones aren't *felt*; glow + tone celebrates "found them all" | S | Med | Retention |
| 6 | Escape sequence (light flood + bass rumble + particles on unlock) | Code-entry success is silent/flat; theatrical exit = memorable payoff | S | Med | Retention |
| 7 | Contextual toast hints (first time near ladder, etc.) | Onboarding is buried in start-screen text; in-game hints keep players in the experience | S | Med | Retention |
| 8 | Spatial 3D audio from hidden items (soft tones pulse stronger when near) | Audio "pulls" players toward furniture with digits without breaking immersion | M | Med | Retention |
| 9 | Audio suite (menu theme, ambient hum, pick-up chime, plank-crack SFX) | Game is utterly silent; sound provides tactile feedback and atmosphere | M | Med | Retention |
| 10 | Furniture density tuning (more searchable furniture per room) | Flat digit-find rate; denser furniture = faster search pacing | S | Low | Retention |
| 11 | Per-digit collection flash + HUD confirmation | Removes "did I miss one?" anxiety | S | Low | Retention |
| 12 | Camera FOV slider in settings | Motion-sickness accessibility | S | Low | Systems |

## Top 5 (rationale)

1. **Spatial grid culling** — Without it, FPS sags on mobile (and FPS affects code-pad tap accuracy). Foundational blocker.
2. **Settings + rebinds + left-hand mode** — ~20% of players are locked out by single-sided controls; an access ramp, not a feature.
3. **Vault glow + audio beacon** — Vault is deterministically map-center, but in darkness experts find it in 30s and novices in 15min. That gap is unfair, not pacing.
4. **Digit glow + tone sweep** — The final-digit moment should feel special; today it's a silent HUD update.
5. **Escape sequence** — "ACCESS GRANTED" → next room is *nothing*; a 2s light-flood + rumble + particles makes the ending a moment.

## Quick Wins (≤1hr each)

- **Vault glow** — the vault already has a glowing status strip; make it emissive / boost its render range so it's visible at 30m+.
- **Digit-panel glow** — digit mounts already exist in `meshFurn()`; add an emissive/glow flag so they self-light.
- **Joystick deadzone** — in `joyMove`, clamp the input vector below a small deadzone before normalizing; add `const DEADZONE=0.12`.
- **First-climb hint** — when `player.nearLadder` first goes true, fire a one-time toast "Hold SPACE / tap CLIMB to go upstairs".
- **Escape-sequence skeleton** — in `submitPad()` success path, before `gotoRoom()`, run a ~1.2s white-flood fill + rumble + rising particles.

## Biggest Unresolved Disagreement

- **Retention Designer:** emotional payoff (sound, glow, theatrics) drives replayability — high-leverage, low-cost — prioritize juice.
- **Systems Purist:** foundational playability (fair navigation, stable FPS, accessible controls) is a prerequisite — players bounce before they feel anything — prioritize enablers.
- **Resolution:** Ship both, but **order matters**. Phase 1 = culling, settings, vault beacon, joystick. Phase 2 = audio, digit glow, escape sequence, spatial audio. Phase-1 makes new players survive long enough to feel Phase-2's hooks.
