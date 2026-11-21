// 30s trailer for ../monster-hunter.html, cut on the beat of public/audio/trailer-beat.wav
// (120 BPM -> one beat = 15 frames). Footage is real gameplay from scripts/capture-gameplay.mjs.
// Facts in captions are counted from the game source: 25 monsters, 7 biomes, 9 weapons.
import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AudioProps, StudioAudio } from "../studio/audio";
import { clampInterp, springs, useEnter, useLayout } from "../studio/motion";
import { fonts } from "../studio/theme";

export const BEAT = 15;
export const TRAILER_FRAMES = 900;
export const trailerDefaults: AudioProps = { musicSrc: "audio/trailer-beat.wav", musicVolume: 0.9, sfx: [] };

const RED = "#cc2222"; // the game's own title colour
const GAME_W = 960;
const GAME_H = 540;

type Shot = { clip: string; from: number; len: number; trim: number; caption?: string }; // "\n" in caption = portrait line break

// Each story shot is 6 beats; the montage is 1 beat per cut; end card lands on the 26s impact.
const STORY: Shot[] = [
  { clip: "village", from: 60, len: 90, trim: 0, caption: "LEAVE THE VILLAGE" },
  { clip: "forest", from: 150, len: 90, trim: 30, caption: "25 MONSTERS" },
  { clip: "desert", from: 240, len: 90, trim: 30, caption: "7 BIOMES" },
  { clip: "jungle", from: 330, len: 90, trim: 30, caption: "9 WEAPONS" },
  { clip: "volcanic", from: 420, len: 90, trim: 40, caption: "BURN. FREEZE.\nPOISON." },
  { clip: "void", from: 510, len: 90, trim: 30, caption: "HUNT BY NIGHT" },
  { clip: "crystal", from: 600, len: 90, trim: 0, caption: "TO THE EDGE\nOF THE WORLD" },
];
// Trims picked from reviewed frames; crystal.mp4 turns solid orange after frame ~90 (in-game screen effect).
const MONTAGE: Shot[] = ([["volcanic", 110], ["forest", 100], ["void", 95], ["desert", 105], ["crystal", 45], ["jungle", 120]] as const).map(
  ([clip, trim], i) => ({ clip, from: 690 + i * BEAT, len: BEAT, trim }),
);
const END_AT = 780;

export const MonsterHunterTrailer: React.FC<AudioProps> = (audio) => {
  const frame = useCurrentFrame();
  // A small zoom pulse on every beat once the kicks start (frame 60) and until the end card.
  const beatPulse = frame >= 60 && frame < END_AT ? Math.exp(-(frame % BEAT) / 3) : 0;
  const cuts = [...STORY, ...MONTAGE].map((s) => s.from).concat(END_AT);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.012 * beatPulse})` }}>
        <Sequence durationInFrames={60}>
          <ColdOpen />
        </Sequence>
        {[...STORY, ...MONTAGE].map((s) => (
          <Sequence key={`${s.clip}${s.from}`} from={s.from} durationInFrames={s.len}>
            <Footage shot={s} />
            {s.caption ? <Caption text={s.caption} /> : null}
          </Sequence>
        ))}
        <Sequence from={END_AT}>
          <EndCard />
        </Sequence>
      </AbsoluteFill>
      <Flash cuts={cuts} />
      <StudioAudio {...audio} />
    </AbsoluteFill>
  );
};

// ── Footage, composed per aspect ratio ────────────────────────────────

// Game-space rows to keep visible: hides the HUD bar at the top and the hint/minimap strip at the bottom.
const KEEP_TOP = 58;
const KEEP_BOTTOM = 500;

// chrome=false drops the letterbox / portrait title, for use as a background plate.
const Footage: React.FC<{ shot: Shot; blur?: number; chrome?: boolean }> = ({ shot, blur = 0, chrome = true }) => {
  const { width, height, portrait } = useLayout();
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, shot.len], [1, 1.06]); // slow push-in per shot

  // Landscape: fill the frame width, crop rows outside KEEP_* behind letterbox bars.
  // Portrait: scale up so the kept rows fill a tall window, centred on the hunter (~42% across).
  const keptH = KEEP_BOTTOM - KEEP_TOP;
  const winH = portrait ? 1000 : height - 2 * LETTERBOX;
  const scale = portrait ? winH / keptH : width / GAME_W;
  const vidW = GAME_W * scale;
  const vidH = GAME_H * scale;
  const left = portrait ? width / 2 - vidW * 0.42 : 0;
  const winTop = portrait ? 470 : LETTERBOX;
  const top = portrait ? -KEEP_TOP * scale : (winH - vidH) / 2 + (GAME_H / 2 - (KEEP_TOP + KEEP_BOTTOM) / 2) * scale;

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, top: winTop, width, height: winH, overflow: "hidden", filter: blur ? `blur(${blur}px) brightness(0.45)` : undefined }}>
        <div style={{ position: "absolute", left, top, width: vidW, height: vidH, transform: `scale(${push})`, transformOrigin: "42% 60%" }}>
          <OffthreadVideo
            src={staticFile(`gameplay/${shot.clip}.mp4`)}
            trimBefore={shot.trim}
            muted
            style={{ width: "100%", height: "100%", imageRendering: "pixelated" }}
          />
        </div>
      </div>
      {chrome ? (portrait ? <PortraitFrame /> : <Letterbox />) : null}
    </AbsoluteFill>
  );
};

const LETTERBOX = 110;

const Letterbox: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: LETTERBOX, background: "#000" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: LETTERBOX, background: "#000" }} />
  </>
);

// Vertical layout: soft edges on the footage window + a fixed title in the lower third.
const PortraitFrame: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 470, height: 1000, boxShadow: "inset 0 0 120px 40px #000" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", fontFamily: fonts.pixel, fontSize: 52, color: RED, textShadow: "0 6px 0 #000" }}>
      MONSTER HUNTER
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1650, textAlign: "center", fontFamily: fonts.pixel, fontSize: 22, color: "#bbb", letterSpacing: "0.1em" }}>
      OPEN WORLD EXPEDITION
    </div>
  </>
);

// ── Type ──────────────────────────────────────────────────────────────

const Caption: React.FC<{ text: string }> = ({ text }) => {
  const { portrait } = useLayout();
  const slam = useEnter(4, springs.snappy);
  const frame = useCurrentFrame();
  const out = clampInterp(frame, [78, 88], [1, 0]);
  const longest = Math.max(...text.split("\n").map((l) => l.length));
  const size = portrait ? (longest > 12 ? 52 : 64) : 58;
  const box: React.CSSProperties = portrait
    ? { left: 0, right: 0, top: 220, textAlign: "center", padding: "0 50px" }
    : { left: 120, bottom: LETTERBOX + 70 };
  return (
    <div
      style={{
        position: "absolute", ...box, whiteSpace: "pre-line", fontFamily: fonts.pixel, fontSize: size, lineHeight: 1.4, color: "#fff",
        textShadow: `0 6px 0 #000, 0 0 30px ${RED}`, opacity: slam * out,
        transform: `scale(${1.5 - 0.5 * slam})`, transformOrigin: portrait ? "50% 50%" : "0% 50%",
      }}
    >
      {portrait ? text : text.replace("\n", " ")}
    </div>
  );
};

const ColdOpen: React.FC = () => {
  const { portrait } = useLayout();
  const frame = useCurrentFrame();
  const a = clampInterp(frame, [6, 30], [0, 1]);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", backgroundColor: "#000" }}>
      <div style={{ fontFamily: fonts.pixel, fontSize: portrait ? 40 : 44, color: "#ccc", opacity: a, letterSpacing: "0.12em", textAlign: "center", lineHeight: 1.8 }}>
        A NEW{portrait ? <br /> : " "}EXPEDITION<span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>_</span>
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const { portrait } = useLayout();
  const frame = useCurrentFrame();
  const hit = useEnter(0, { damping: 10, stiffness: 160 });
  const sub = useEnter(18);
  const cta = useEnter(40);
  const shake = Math.exp(-frame / 5) * 14;
  return (
    <AbsoluteFill>
      <Footage shot={{ clip: "void", from: 0, len: 120, trim: 20 }} blur={10} chrome={false} />
      <AbsoluteFill
        style={{
          alignItems: "center", justifyContent: "center", flexDirection: "column", gap: portrait ? 50 : 40,
          transform: `translate(${Math.sin(frame * 2.1) * shake}px, ${Math.cos(frame * 1.7) * shake}px)`,
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.2), rgba(0,0,0,0.85))",
        }}
      >
        <div style={{ fontFamily: fonts.pixel, fontSize: portrait ? 76 : 120, color: RED, textAlign: "center", lineHeight: 1.25, textShadow: "0 10px 0 #000, 0 0 60px #ff000066", transform: `scale(${2 - hit})`, opacity: Math.min(1, hit * 1.5) }}>
          MONSTER{portrait ? <br /> : " "}HUNTER
        </div>
        <div style={{ fontFamily: fonts.pixel, fontSize: portrait ? 26 : 30, color: "#ddd", letterSpacing: "0.14em", opacity: sub }}>
          OPEN WORLD EXPEDITION
        </div>
        <div style={{ marginTop: 30, padding: "18px 30px", border: "4px solid #fff", fontFamily: fonts.pixel, fontSize: portrait ? 24 : 26, color: "#fff", opacity: cta, transform: `translateY(${(1 - cta) * 20}px)`, textAlign: "center", lineHeight: 1.6 }}>
          PLAY FREE IN YOUR BROWSER
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// White flash that decays over 5 frames after every cut.
const Flash: React.FC<{ cuts: number[] }> = ({ cuts }) => {
  const frame = useCurrentFrame();
  const since = Math.min(...cuts.map((c) => (frame >= c ? frame - c : Infinity)));
  const a = since === Infinity ? 0 : interpolate(since, [0, 5], [0.55, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ backgroundColor: "#fff", opacity: a, pointerEvents: "none" }} />;
};
