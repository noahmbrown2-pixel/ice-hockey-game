# Video Studio — design rules

Remotion (React → frames → MP4) motion-design studio. Claude writes compositions; Remotion renders locally.
Everything renders offline: no paid generative APIs, no voice APIs. Ask before adding either.

## Layout of the repo

- `src/studio/` — reusable kit. `theme.ts` (colors, fonts, FPS), `motion.ts` (springs, `useEnter`, `useExit`,
  `useLayout`), `components.tsx` (RevealText, Kicker, Counter, Backdrop, Camera, Panel, Chip, Mark, Icon,
  Node, Edge, Packet), `audio.tsx` (optional music / voiceover / sfx props).
- `src/promo/` — "Agents You Can Verify" 30s promo. `storyboard.ts` is the single source for scene order,
  durations and copy; scenes read their text from it.
- `src/trailer/` — Monster Hunter 30s trailer, cut on a 120 BPM beat.
- `src/otters/` — 13s vertical anime otter duel. `Otter.tsx` is the posable character (Kai / Ren looks stay
  fixed); `OtterClash.tsx` holds the timeline `T`, the choreography and a `simTime()` slow-mo for the clash.
  Its own sunset palette, not the promo palette.
- `docs/edit-style-sports.md` — the user's target style: athlete fan edits (UFC/NFL). Read it before making one.
- `src/hello/` — 5s smoke test. Render it first on a new machine.
- `scripts/` — `capture-gameplay.mjs` (Playwright records real game footage), `make-audio.mjs` (ffmpeg-synth
  music beds), `contact-sheet.mjs` (review grid of N stills).

## Workflow (every new video)

1. Storyboard first: a `storyboard.ts` with scene ids, frame counts, copy and a one-line shot description.
2. Build scenes from `src/studio` pieces; add to the kit only when a piece is reused.
3. Register a 1920×1080 **and** a 1080×1920 composition. Portrait is recomposed (stacked layout via
   `useLayout().portrait`), never a scaled or cropped landscape.
4. `npm run sheet -- <CompositionId> 16 4` → read `out/review/<id>-sheet.png`. Check clipping, orphaned words,
   overlaps, z-order, washed-out frames. Fix, re-sheet, then render.
5. `npm run render:all` (or the per-video script). Thumbnails come from `remotion still`.

## Visual rules

- Base `#07090d`, one primary accent (mint `#6ee7c8` = allowed/verified), one secondary (blue `#8ab4ff` =
  identity/structure), amber `#f5b74f` only for denied/attention. No rainbow, no gradient title screens.
- Type: Inter (headlines 700–800, tight tracking), JetBrains Mono for data/labels. Pixel font only for game work.
- Motion: everything enters with a spring (`springs.smooth` for layout, `snappy` for chips/marks). Stagger
  word reveals 3 frames. Every scene sits inside `<Camera>` for a slow push-in. Vary transitions
  (fade / slide), don't repeat the same one back to back.
- Headlines must break into balanced lines: no single orphan word. Tune the box width rather than font size.
- Diagrams are drawn: SVG icons (`Icon`), not unicode glyphs (they can render as tofu in headless Chrome).
- Draw moving things (packets, labels) after the nodes they cross, so they aren't hidden.
- Any number or claim on screen must come from a real source (game source code, product facts). Placeholder
  orgs are obviously fictional (Acme, Paper Co.).

## Game footage rules

- Capture with `npm run capture`; it sets game state through the page's globals and drives real input.
- Review every clip as a strip (`ffmpeg ... select='not(mod(n,15))',tile`) before choosing trims; the crystal
  clip goes solid orange after ~frame 90 (an in-game screen effect), so it's trimmed to frames 0–89.
- Keep HUD cheats out of frame (HP is topped up by script, not set to 99999).
- Cut on the beat: `BEAT = 15` frames at 120 BPM @ 30fps. A 5-frame white flash marks each cut.

## Licensing

Remotion is free for individuals and teams of up to 3; companies above that need a license (remotion.pro).
