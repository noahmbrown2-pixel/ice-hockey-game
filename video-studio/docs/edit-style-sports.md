# Sports fan-edit style (the user's reference videos)

The user wants to make videos like two WhatsApp clips they sent on 2026-10-22: a **UFC fighter edit** (Tom
Aspinall, 22.3s) and an **NFL player edit** (Falcons #5 Drake London, 21.0s). These notes are what was
measured from them (ffprobe, frame grids at 1 and 6 fps, scene-cut detection, audio onset analysis).

## Format
- Vertical-ish: source files were 464×592 (about 4:5) at 60fps, with thin black bars. They were compressed
  by WhatsApp, so make ours at 1080×1350 (4:5) or 1080×1920 (9:16), 30 or 60fps.
- Length is about 20–22s, one athlete per edit, real broadcast footage only (no graphics or titles).

## Structure (both edits follow the same arc)
1. **Cold open, 0–2s:** fade up from black on a close-up of the athlete (a hype face, a yell or a stare). Music is quieter here.
2. **Build, about 2–7s:** a few longer shots (1.5–3s each) showing hype moments: a celebration, climbing the cage,
   the belt interview, a sideline yell.
3. **Drop, about 7s on:** the music gets louder (UFC edit: about -12 dB to -7 dB) and the cuts start landing on the beat.
   This part has the action: finishes, ground-and-pound, catches, big hits.
4. **Rapid-fire section:** cuts every 0.4–0.6s for about 5s (NFL edit, 11–16s), often several angles of the same play.
5. **Outro:** slow down onto a close-up (a smile or the jersey number), then fade to black.

## Effects to reproduce
- **Color grade:** crushed blacks, high contrast, slightly desaturated, heavy vignette. The UFC edit is very dark and
  moody; the NFL edit is closer to natural colour with extra contrast.
- **Slow motion and speed ramps:** the key moments (cage climb, the catch) play at about 0.3–0.5x, then snap back to full speed.
- **Punch-in zooms:** tight crops on faces and hands, zoomed far enough to look soft or pixelated. Slow push-ins on stares.
- **Camera shake and motion blur** on impacts and fast cuts.
- **Red hand-drawn scribble:** a red marker-style "NO" plus a zigzag that draws itself on over the athlete
  (on his back or over a tackle) for about 1–1.5s, then gets cut away. It's the edits' signature overlay.
- Hard cuts, with fades only at the very start and end. No text, no captions, no logos added.

## Music and timing
- Loud, bass-heavy music (UFC edit mean -8.5 dB, peaks at 0 dB). The tempo felt like a slow, heavy beat:
  about 78 BPM in the UFC edit (beat ≈ 0.77s) and about 86 BPM in the NFL edit. This is probably half-time phonk or trap at double those numbers.
- Strong beats in the UFC edit landed every ≈0.77s from 12.9s to 15.3s, and its cuts sit within about 0.3s of a beat.
  Cut on the beat, and put the biggest hit or finish on the loudest bass hit.

## How to build one here (Remotion)
- **Footage:** the user has to supply the clips (their own recordings or downloaded highlights). We don't download
  broadcast footage. Put the clips in `public/clips/` and the song in `public/audio/`.
- Detect the song's beats with the onset/autocorrelation approach above. Use a numpy script; the one used for
  these notes is in the session scratchpad.
- `OffthreadVideo` with `playbackRate` for slow motion, CSS `filter` (contrast/saturate/brightness) plus a
  radial vignette for the grade, transforms for punch-ins and shake, and an SVG path with an animated
  `strokeDashoffset` for the red scribble.
- Review with `npm run sheet` like every other video.

## Update 2026-10-26: nine more references (YouTube Shorts, all from the channel "N0z")
Tom Aspinall ×2, De Ligt, Jon Jones, Kanté, Anderson Silva, R9 (Ronaldo Nazário), Neymar, Drogba. 17–31s each, about 4:5.
- **The red scribble is the letters "N0Z", the creator's tag**, not the word "NO". It shows up once per edit,
  drawn over the athlete. Only use "N0Z" if the user confirms it's their channel; otherwise use the athlete's tag (CR7).
- **Meme cold opens:** several start with an unrelated funny clip (a 3D physics "FORCE" animation, Spider-Man
  dancing, village footage) before cutting to the athlete. That needs the user to supply the meme clip.
- **Grade:** UFC edits are very dark and crushed. Football edits are close to natural colour with a little extra
  contrast and the softness of old footage. All of them dim or fade to black at the end.
- **Pacing:** this varies a lot. Neymar averages 0.42s per shot, with flurries of 1–3 frame flash cuts on the drop.
  Most others average 1.1–1.6s. A few (De Ligt, Kanté, Drogba) are long continuous runs with zooms.
- **Sound** (measured): loud, about -8 to -11 dB RMS; the energy sits in sub plus low-mid (sub <60Hz about 30–40%,
  60–250Hz about 30–55%, mids 15–35%, highs under 6%, which is the muffled slowed/reverb sound). The Aspinall and R9 edits
  share one song: dense, distorted Brazilian-phonk drums with every hit punching through. Others use melodic tracks with sustained pulsing 808s.
- `phonk-placeholder.wav` is now tuned to those numbers (distorted funk kick, pumping 808 with a sub layer,
  cowbell, vocal-ish chops, lowpass at 6.5k, about -10 dB). It still isn't a real song, so swap one in when the user sends it.

## Update 2026-10-30: measured grade + CapCut route
- ffmpeg `signalstats` on the 9 Shorts: average saturation is 3–8 (out of ~128) on 7 of 9, so the UFC edits are
  close to black and white, not just "slightly desaturated". Black level sits at Y≈16 (fully crushed); average
  brightness is 35–56 for the dark UFC/De Ligt edits. Kanté (13) and R9 (20) keep more colour.
- Drop timing: every edit gets about 5 dB louder at the drop, between 5.5s and 7.5s. In the Aspinall song,
  the drop is at 7.56s and the beat grid is 0.766s (78 BPM), with kicks at 7.56, 8.33, 9.10, 9.87…
- **CapCut route:** the user wants edits as CapCut drafts. VectCutAPI (`C:\Users\noahm\tools\VectCutAPI`, MCP
  server `capcut-api`) builds them. The working example is `C:\Users\noahm\Videos\n0z-edits\aspinall-recut\`:
  `shots.json` (cut list) plus `build.py`, which writes the song, N0Z scribble PNGs (3 jittered frames cycled every
  0.1s for the boil), an ffmpeg `preview.mp4`, and the CapCut draft.
  Reference downloads are in `C:\Users\noahm\Videos\n0z-refs\`.

## Update 2026-10-30: two more WhatsApp refs
- A 1.09s clip of the user's real red "N0Z" scribble on black (`public/overlays/n0z-scribble.mp4`). Edits can
  screen it over a shot with `scribbleClip` instead of the drawn glyphs.
- A 20.1s dark UFC edit (TJ Dillashaw). It's letterboxed: a 464×318 picture band inside 464×512, so about
  19% bars top and bottom (`letterbox: 0.19`). It's almost black and white (saturation 4 out of 128), so use
  `grade: "contrast(1.3) saturate(0.12)"`. The cuts: a long slow build until 4s, then a cut about every 0.8s
  (the half-time beat; the onset period is 0.395s). There's a 2–3 frame flash flurry from 13.63 to 14.39s and a
  3.2s outro with a fade. Its song is `public/audio/n0z-ufc-1030.mp3`. Built as `src/edits/ronaldo-ref1030.json`.
