// 13s vertical anime duel: two otters, Kai (red headband, golden aura) vs Ren (blue scarf, cyan aura).
// Everything is drawn in one SVG world; a camera transform frames it. Clash runs in slow motion via simTime().
import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { AudioProps, StudioAudio } from "../studio/audio";
import { KAI, Look, Otter, OtterState, Pose, REN, pawWorld, toWorld } from "./Otter";

export const CLASH_FRAMES = 390;
export const clashDefaults: AudioProps = { musicSrc: "audio/otter-clash.wav", musicVolume: 1, sfx: [] };

// Timeline in frames @30fps. scripts/make-audio.mjs uses the same moments in seconds.
const T = { charge: 40, dash: 85, fight: 98, knock: 142, volley: 158, cup: 205, split: 215, unsplit: 240, fire: 255, clash: 265, burst: 340, after: 356, grin: 366, end: 390 };
const HITS = [100, 108, 116, 124, 132, 140];
const BLASTS = [166, 171, 176, 181, 186];
const JUMP = [168, 204];
const SLOW = [268, 340];
const RATE = 0.3;
const GROUND = 1250;
const HORIZON = 990;
const SPLASH_X = 1060;
const INK = "#1a0f0a";

const kf = (f: number, keys: [number, number][], easing = Easing.inOut(Easing.cubic)) =>
  interpolate(f, keys.map((k) => k[0]), keys.map((k) => k[1]), { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

// Wall-clock frame -> simulation time. Waves, spray, auras and fur all run on this, so the clash is slow-mo.
const simTime = (f: number) =>
  f <= SLOW[0] ? f : f <= SLOW[1] ? SLOW[0] + (f - SLOW[0]) * RATE : SLOW[0] + (SLOW[1] - SLOW[0]) * RATE + (f - SLOW[1]);

// ── Choreography ─────────────────────────────────────────────────────

const ATTACKS: ["A" | "B" | "both", "front" | "back"][] = [["A", "front"], ["B", "front"], ["A", "back"], ["B", "back"], ["A", "front"], ["both", "front"]];

const fightPose = (f: number, me: "A" | "B"): Pose => {
  const k = Math.min(ATTACKS.length - 1, Math.floor((f - T.fight) / 8));
  const u = f - T.fight - k * 8;
  const [who, arm] = ATTACKS[k];
  const base: Pose = { front: -115, back: -70, expr: "shout" };
  if (who === me || who === "both") {
    const angle = kf(u, [[0, -115], [2, -88], [5, -88], [8, -110]]);
    const ext = kf(u, [[0, 1], [2, 1.35], [5, 1.35], [8, 1]]);
    const lean = kf(u, [[0, 0], [2, 10], [6, 10], [8, 0]]);
    return arm === "front" ? { ...base, front: angle, frontExt: ext, lean } : { ...base, front: -60, back: angle, backExt: ext, lean };
  }
  return { ...base, lean: kf(u, [[0, 0], [3, -14], [7, 0]]), squash: kf(u, [[0, 1], [3, 0.92], [7, 1]]), expr: k % 2 === 0 ? "wince" : "focus" };
};

const sharedPose = (f: number, me: "A" | "B"): Pose | null => {
  if (f < T.charge) return { front: -40, back: -20, expr: "focus" };
  if (f < T.dash) return { front: 25, back: -15, squash: kf(f, [[T.charge, 1], [T.charge + 10, 0.93]]), expr: "shout" };
  if (f < T.fight) return { front: 50, back: 60, lean: 18, expr: "shout" };
  if (f < T.knock) return fightPose(f, me);
  if (f < T.volley) return { front: -120, back: -60, lean: kf(f, [[T.knock, -15], [T.volley, 0]]), expr: "wince" };
  if (f >= T.cup && f < T.fire) return { front: 65, back: 55, lean: -6, squash: 0.95, expr: "shout" };
  if (f >= T.fire && f < T.burst + 6) return { front: -90, back: -86, frontExt: 1.15, backExt: 1.15, lean: 8, expr: "shout" };
  if (f >= T.burst + 6 && f < T.grin) return { front: 10, back: -10, squash: 0.96, expr: "wince" };
  if (f >= T.grin) return { front: kf(f, [[T.grin + 4, 10], [T.grin + 12, -125]]), frontExt: 0.85, back: -10, expr: "grin" }; // fist pump, paw clear of the face
  return null;
};

const kaiPose = (f: number): Pose => {
  const shared = sharedPose(f, "A");
  if (shared) return shared;
  // volley: alternate paws, one golden blast each
  const i = BLASTS.findIndex((b) => f >= b && f < b + 4);
  if (i < 0) return { front: -70, back: -50, expr: f > BLASTS[BLASTS.length - 1] + 4 ? "focus" : "shout" };
  return i % 2 === 0 ? { front: -92, frontExt: 1.3, back: -50, lean: 8, expr: "shout" } : { front: -60, back: -92, backExt: 1.3, lean: 8, expr: "shout" };
};

const kaiAt = (f: number): OtterState => ({
  x: kf(f, [[0, 270], [T.dash, 270], [T.fight, 425], [T.knock, 425], [T.volley, 300], [SLOW[0], 285], [T.burst, 275], [T.after, 240], [T.end, 250]]),
  y: GROUND,
  s: 1,
  facing: 1,
  pose: kaiPose(f),
});

const renAt = (f: number): OtterState => {
  const x = kf(f, [[0, 810], [T.dash, 810], [T.fight, 655], [T.knock, 655], [T.volley, 780], [JUMP[0], 780], [JUMP[1], 840], [T.cup, 830], [SLOW[0], 850], [T.burst, 860], [T.after, 890], [T.end, 880]]);
  const shared = sharedPose(f, "B");
  if (shared) return { x, y: GROUND, s: 1, facing: -1, pose: shared };
  if (f < JUMP[0] - 4) return { x, y: GROUND, s: 1, facing: -1, pose: { front: -110, back: -60, expr: "focus" } };
  if (f < JUMP[0]) return { x, y: GROUND, s: 1, facing: -1, pose: { front: 30, back: 40, squash: 0.85, expr: "focus" } };
  if (f < JUMP[1]) {
    // backflip over the volley, rotating around the body centre rather than the feet
    const p = (f - JUMP[0]) / (JUMP[1] - JUMP[0]);
    const th = -360 * Easing.inOut(Easing.quad)(p);
    const r = (th * Math.PI) / 180;
    const lift = 4 * 340 * p * (1 - p);
    return {
      x: x - 170 * Math.sin(r) * -1,
      y: GROUND - lift - 170 + 170 * Math.cos(r),
      s: 1,
      facing: -1,
      pose: { front: -150, back: -170, lean: th, expr: "grin" },
    };
  }
  return { x, y: GROUND, s: 1, facing: -1, pose: { front: -110, back: -60, squash: kf(f, [[JUMP[1], 0.85], [JUMP[1] + 8, 1]]), expr: "grin" } };
};

const auraPower = (f: number) => kf(f, [[T.charge, 0], [70, 1], [T.dash, 0.8], [150, 0.55], [T.cup, 0.55], [230, 1], [T.burst, 1], [T.after, 0.15]]);
const clashPoint = (f: number) => ({ x: 540 + 34 * Math.sin(simTime(f) * 0.35), y: GROUND - 200 });

// ── Camera ───────────────────────────────────────────────────────────

type Cam = { z: number; fx: number; fy: number; rot: number; sx: number; sy: number; ax: number; ay: number };

const cameraAt = (f: number): Cam => {
  // Wide shots stay >= 1.18 so the fighters fill the vertical frame; only the volley pulls out to fit the backflip.
  const z = kf(f, [[0, 1.4], [T.charge, 1.18], [T.dash, 1.26], [T.fight - 2, 1.45], [T.knock, 1.45], [T.volley, 1.0], [T.cup, 1.05], [T.split, 1.2], [T.unsplit, 1.12], [T.fire, 1.12], [SLOW[0], 1.18], [T.burst, 1.4], [T.after, 1.15], [T.end, 1.22]]);
  const fx = kf(f, [[T.volley, 540], [170, 600], [T.cup, 600], [T.unsplit, 540], [T.end, 560]]);
  const fy = kf(f, [[0, 880], [T.charge, 1060], [T.fight - 2, 1090], [T.knock, 1090], [T.volley, 1060], [T.cup, 1040], [T.fire, 1060], [T.burst, 1060], [T.end, 1100]]);
  const rot = kf(f, [[T.fire, 0], [SLOW[0], -4], [T.burst, 3], [T.after, 0]]);
  let amp = kf(f, [[T.charge, 0], [80, 6], [T.dash, 0]]);
  for (const h of HITS) if (f >= h) amp += Math.exp(-(f - h) / 3) * (h === HITS[HITS.length - 1] ? 26 : 12);
  if (f >= T.clash && f < T.burst) amp += 5;
  if (f >= T.burst) amp += 40 * Math.exp(-(f - T.burst) / 8);
  if (f >= JUMP[1]) amp += 10 * Math.exp(-(f - JUMP[1]) / 3);
  return { z, fx, fy, rot, sx: (random(`sx${f}`) - 0.5) * 2 * amp, sy: (random(`sy${f}`) - 0.5) * 2 * amp, ax: 540, ay: 960 };
};

// ── Environment ──────────────────────────────────────────────────────

const Defs: React.FC = () => (
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#140d36" />
      <stop offset="0.5" stopColor="#5a2770" />
      <stop offset="0.82" stopColor="#e8664a" />
      <stop offset="1" stopColor="#ffbe7a" />
    </linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#e9845e" />
      <stop offset="0.05" stopColor="#3b3f86" />
      <stop offset="0.45" stopColor="#1d2a63" />
      <stop offset="1" stopColor="#0a1232" />
    </linearGradient>
    <radialGradient id="sunGlow">
      <stop offset="0" stopColor="#fff3d0" stopOpacity="1" />
      <stop offset="0.4" stopColor="#ffd18a" stopOpacity="0.6" />
      <stop offset="1" stopColor="#ffd18a" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.6" stopColor="#000" stopOpacity="0" />
      <stop offset="1" stopColor="#000" stopOpacity="0.6" />
    </radialGradient>
    <filter id="blur6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
    <filter id="blur16" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16" /></filter>
    <filter id="blur30" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="30" /></filter>
  </defs>
);

const CLOUDS = [
  { y: 180, w: 760, h: 56, x: 100, sp: 0.12, c: "#f19ab8", o: 0.55 },
  { y: 320, w: 520, h: 40, x: 900, sp: 0.2, c: "#ffb3a0", o: 0.5 },
  { y: 470, w: 900, h: 70, x: 600, sp: 0.08, c: "#c86aa8", o: 0.45 },
  { y: 640, w: 600, h: 46, x: 1500, sp: 0.16, c: "#ffc79a", o: 0.55 },
  { y: 790, w: 1000, h: 36, x: 300, sp: 0.1, c: "#ffd4a6", o: 0.5 },
];

const Sky: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-900} y={-700} width={2900} height={HORIZON + 700} fill="url(#sky)" />
    <circle cx={540} cy={940} r={380} fill="url(#sunGlow)" opacity={0.8} />
    <circle cx={540} cy={950} r={125} fill="#ffe4ae" />
    {CLOUDS.map((c, i) => (
      <rect key={i} x={((c.x + t * c.sp) % 2600) - 900} y={c.y} width={c.w} height={c.h} rx={c.h / 2} fill={c.c} opacity={c.o} />
    ))}
  </g>
);

const Sea: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-900} y={HORIZON} width={2900} height={1700} fill="url(#sea)" />
    {Array.from({ length: 12 }, (_, i) => {
      const w = (190 - i * 10) * (0.7 + 0.3 * Math.sin(t * 0.3 + i * 1.3));
      return <rect key={i} x={540 - w / 2} y={HORIZON + 8 + i * 13 * (1 + i * 0.18)} width={w} height={5 + i * 0.6} rx={3} fill="#ffd9a0" opacity={0.85 - i * 0.05} />;
    })}
    {Array.from({ length: 16 }, (_, i) => {
      const d = (i + 1) / 16;
      const y = HORIZON + Math.pow(d, 1.7) * 900;
      const amp = 2 + d * 14;
      let path = "";
      for (let x = -900; x <= 2000; x += 40) {
        path += `${x === -900 ? "M" : "L"}${x} ${(y + Math.sin(x * (0.004 + 0.008 * (1 - d)) + t * 0.06 * (1 + d) + i) * amp).toFixed(1)} `;
      }
      return <path key={i} d={path} stroke="#9ec4ff" strokeWidth={1 + d * 3} opacity={0.12 + 0.25 * d} fill="none" />;
    })}
  </g>
);

const ISLAND_SIDE = "118,1385 130,1290 150,1262 260,1240 420,1234 600,1238 760,1234 900,1246 955,1270 975,1340 935,1425 880,1500 700,1545 500,1555 300,1535 180,1475";
const ISLAND_TOP = "135,1288 150,1262 260,1240 420,1234 600,1238 760,1234 900,1246 955,1270 900,1296 700,1300 450,1302 250,1296";

const Island: React.FC<{ f: number }> = ({ f }) => {
  const crack = kf(f, [[50, 0], [80, 1]]);
  return (
    <g>
      <polygon points={ISLAND_SIDE} fill="#3a3550" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <g stroke="#2a2640" strokeWidth={4} fill="none" opacity={0.9}>
        <path d="M300 1300 L270 1420 L300 1520" />
        <path d="M520 1305 L560 1430 L530 1550" />
        <path d="M760 1300 L730 1400 L780 1510" />
      </g>
      <polygon points={ISLAND_TOP} fill="#7b7392" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M150 1262 L260 1240 L420 1234 L600 1238 L760 1234 L900 1246" stroke="#b0a8cc" strokeWidth={4} fill="none" />
      <polygon points="320,1262 380,1250 420,1268" fill="#625b7a" />
      <polygon points="640,1270 700,1256 730,1276" fill="#625b7a" />
      {crack > 0 ? (
        <g stroke={INK} strokeWidth={3} fill="none" opacity={crack}>
          <path d={`M270 1262 l${-40 * crack} ${12 * crack} l${-20 * crack} ${18 * crack}`} />
          <path d={`M810 1262 l${40 * crack} ${14 * crack} l${24 * crack} ${14 * crack}`} />
          <path d={`M540 1250 l${-10 * crack} ${30 * crack} l${16 * crack} ${20 * crack}`} />
        </g>
      ) : null}
    </g>
  );
};

const FOAM_AT = [[130, 1495], [330, 1565], [540, 1585], [760, 1565], [960, 1470]];

const Foam: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d="M90 1470 Q300 1575 540 1580 Q790 1570 1000 1440" stroke="#e8f4ff" strokeWidth={14} fill="none" opacity={0.6} strokeLinecap="round" />
    {FOAM_AT.map(([x, y], i) => {
      const age = (t + i * 19) % 55;
      const r = 12 + age * 1.3;
      return (
        <g key={i} opacity={Math.max(0, 1 - age / 55)} fill="#f4fbff">
          <circle cx={x - r * 0.6} cy={y - age * 0.5} r={r * 0.6} />
          <circle cx={x} cy={y - age * 0.8} r={r * 0.8} />
          <circle cx={x + r * 0.7} cy={y - age * 0.4} r={r * 0.5} />
        </g>
      );
    })}
  </g>
);

const ForegroundWave: React.FC<{ t: number }> = ({ t }) => {
  let d = "M-900 2700 ";
  for (let x = -900; x <= 2000; x += 30) d += `L${x} ${(1720 + Math.sin(x * 0.006 + t * 0.05) * 30 + Math.sin(x * 0.017 - t * 0.08) * 12).toFixed(1)} `;
  d += "L2000 2700 Z";
  let crest = "";
  for (let x = -900; x <= 2000; x += 30) crest += `${x === -900 ? "M" : "L"}${x} ${(1716 + Math.sin(x * 0.006 + t * 0.05) * 30 + Math.sin(x * 0.017 - t * 0.08) * 12).toFixed(1)} `;
  return (
    <g>
      <path d={d} fill="#0e1a44" />
      <path d={crest} stroke="#dff0ff" strokeWidth={10} fill="none" opacity={0.75} strokeLinecap="round" />
    </g>
  );
};

// Pebbles lift during the power-up; bigger debris lifts during the clash. Both run on sim time.
const Debris: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const groups = [
    { start: simTime(48), spread: 30, n: 14, size: 7, from: T.charge, to: T.dash + 6 },
    { start: simTime(T.clash), spread: 12, n: 16, size: 14, from: T.clash, to: T.burst + 4 },
  ];
  return (
    <g fill="#5a5372" stroke={INK} strokeWidth={2}>
      {groups.map((g, gi) =>
        f < g.from || f > g.to
          ? null
          : Array.from({ length: g.n }, (_, i) => {
              const age = t - (g.start + random(`d${gi}${i}`) * g.spread);
              if (age < 0) return null;
              const x = 180 + random(`dx${gi}${i}`) * 720 + Math.sin(age * 0.1 + i) * 8;
              const y = 1270 - age * (1.6 + random(`dv${gi}${i}`) * 2.4);
              const s = g.size * (0.6 + random(`ds${gi}${i}`));
              return <rect key={`${gi}-${i}`} x={x - s / 2} y={y - s / 2} width={s} height={s * 0.8} rx={2} transform={`rotate(${age * 3 + i * 40} ${x} ${y})`} />;
            }),
      )}
    </g>
  );
};

// ── Ki effects ───────────────────────────────────────────────────────

const Aura: React.FC<{ o: OtterState; look: Look; power: number; t: number; seed: number }> = ({ o, look, power, t, seed }) => {
  if (power < 0.02) return null;
  const c = toWorld(o, { x: 0, y: -170 });
  const flame = (scale: number, phase: number) =>
    Array.from({ length: 36 }, (_, i) => {
      const th = (i / 36) * Math.PI * 2;
      const top = Math.max(0, -Math.sin(th));
      const m = 1 + 0.12 * Math.sin(th * 5 + t * 0.6 + seed + phase) + top * (0.45 + 0.3 * Math.sin(t * 0.9 + i * 1.7 + seed));
      return `${(c.x + Math.cos(th) * 125 * scale * m).toFixed(1)},${(c.y + Math.sin(th) * 205 * scale * m).toFixed(1)}`;
    }).join(" ");
  return (
    <g opacity={power}>
      <polygon points={flame(1.15, 0)} fill={look.aura} opacity={0.45} filter="url(#blur16)" />
      <polygon points={flame(0.85, 2)} fill="#fffbe8" opacity={0.35} filter="url(#blur6)" />
      {Array.from({ length: 12 }, (_, i) => {
        const cyc = t + i * 7 + seed;
        const age = cyc % 36;
        const x = c.x + (random(`sp${seed}${i}${Math.floor(cyc / 36)}`) - 0.5) * 260;
        return <ellipse key={i} cx={x} cy={c.y + 170 - age * 9} rx={3} ry={12} fill={look.aura} opacity={1 - age / 36} />;
      })}
    </g>
  );
};

const Blasts: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {BLASTS.map((b, i) => {
      if (f < b) return null;
      const from = pawWorld(kaiAt(b), i % 2 === 0 ? "front" : "back");
      const a = f - b;
      const x = from.x + 45 * a;
      const y = from.y + a * 1.5;
      if (x < SPLASH_X) {
        return (
          <g key={i}>
            {a < 4 ? <circle cx={from.x} cy={from.y} r={50 - a * 10} fill="#fff6c0" opacity={0.9} /> : null}
            <ellipse cx={x - 50} cy={y} rx={60} ry={13} fill="#ffcf3a" opacity={0.55} />
            <circle cx={x} cy={y} r={46} fill="#ffcf3a" opacity={0.55} filter="url(#blur6)" />
            <circle cx={x} cy={y} r={20} fill="#fff6c0" stroke="#ffb020" strokeWidth={4} />
          </g>
        );
      }
      const hit = a - (SPLASH_X - from.x) / 45;
      if (hit > 24) return null;
      const sy = from.y + ((SPLASH_X - from.x) / 45) * 1.5;
      return (
        <g key={i}>
          <circle cx={SPLASH_X} cy={sy} r={30 + hit * 6} fill="#fff6c0" opacity={Math.max(0, 0.8 - hit / 8)} />
          {Array.from({ length: 12 }, (_, k) => {
            const vx = (random(`bx${i}${k}`) - 0.5) * 10;
            const vy = -(6 + random(`by${i}${k}`) * 10);
            return <circle key={k} cx={SPLASH_X + vx * hit} cy={sy + vy * hit + 0.45 * hit * hit} r={4 + random(`br${i}${k}`) * 6} fill="#e8f6ff" opacity={1 - hit / 24} />;
          })}
        </g>
      );
    })}
  </g>
);

const EnergyBall: React.FC<{ o: OtterState; f: number }> = ({ o, f }) => {
  if (f < T.cup || f >= T.fire) return null;
  const a = pawWorld(o, "front");
  const b = pawWorld(o, "back");
  const x = (a.x + b.x) / 2;
  const y = (a.y + b.y) / 2;
  const r = kf(f, [[T.cup, 4], [T.fire - 5, 42]]) * (1 + 0.1 * Math.sin(f * 1.3));
  return (
    <g>
      <circle cx={x} cy={y} r={r * 2.6} fill="#4fb8ff" opacity={0.55} filter="url(#blur16)" />
      <circle cx={x} cy={y} r={r} fill="#eafcff" stroke="#8fe6ff" strokeWidth={6} />
      {Array.from({ length: 4 }, (_, k) => {
        const ang = random(`eb${o.facing}${k}${Math.floor(f / 2)}`) * Math.PI * 2;
        const L = r * 1.9;
        return (
          <polyline key={k} points={`${x},${y} ${x + Math.cos(ang + 0.3) * L * 0.5},${y + Math.sin(ang + 0.3) * L * 0.5} ${x + Math.cos(ang) * L},${y + Math.sin(ang) * L}`} stroke="#d8f8ff" strokeWidth={3} fill="none" />
        );
      })}
    </g>
  );
};

const Beam: React.FC<{ o: OtterState; f: number; t: number }> = ({ o, f, t }) => {
  if (f < T.fire || f >= T.burst + 6) return null;
  const p = pawWorld(o, "front");
  const end = clashPoint(f).x;
  const len = kf(f, [[T.fire, 0], [T.clash, 1]], Easing.out(Easing.cubic)) * (end - p.x);
  const h = 58 + 10 * Math.sin(t * 0.9 + o.facing);
  const x0 = Math.min(p.x, p.x + len);
  const w = Math.abs(len);
  return (
    <g>
      <rect x={x0} y={p.y - h} width={w} height={h * 2} rx={h} fill="#3fa8ff" opacity={0.5} filter="url(#blur16)" />
      <rect x={x0} y={p.y - h / 2} width={w} height={h} rx={h / 2} fill="#6fd3ff" />
      <rect x={x0} y={p.y - h / 5} width={w} height={(h * 2) / 5} rx={h / 5} fill="#ffffff" />
      <circle cx={p.x} cy={p.y} r={h * 0.8} fill="#eafcff" stroke="#8fe6ff" strokeWidth={6} />
    </g>
  );
};

const Clash: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.clash || f >= T.burst + 14) return null;
  const c = clashPoint(f);
  const grow = kf(f, [[T.clash, 50], [T.burst, 115], [T.burst + 8, 1500]], Easing.in(Easing.quad));
  const r = grow * (1 + 0.12 * Math.sin(f * 0.7));
  return (
    <g>
      <circle cx={c.x} cy={c.y} r={r * 2.2} fill="#8fe6ff" opacity={0.6} filter="url(#blur30)" />
      <circle cx={c.x} cy={c.y} r={r} fill="#ffffff" stroke="#bff3ff" strokeWidth={10} />
      {Array.from({ length: 7 }, (_, k) => {
        const ang = random(`bolt${k}${Math.floor(f / 2)}`) * Math.PI * 2;
        const pts = Array.from({ length: 6 }, (_, j) => {
          const d = r * (0.9 + j * 0.35);
          const wob = (random(`bj${k}${j}${Math.floor(f / 2)}`) - 0.5) * 0.5;
          return `${(c.x + Math.cos(ang + wob) * d).toFixed(1)},${(c.y + Math.sin(ang + wob) * d).toFixed(1)}`;
        }).join(" ");
        return <polyline key={k} points={pts} stroke="#e6fbff" strokeWidth={5} fill="none" strokeLinejoin="round" />;
      })}
    </g>
  );
};

const Shockwaves: React.FC<{ f: number }> = ({ f }) => {
  const emits: number[] = [];
  for (let e = T.clash; e < T.burst; e += 14) emits.push(e);
  emits.push(T.burst, T.burst + 4);
  const c = clashPoint(f);
  return (
    <g fill="none">
      {emits.map((e, i) => {
        const a = f - e;
        if (a < 0 || a > 45) return null;
        const big = e >= T.burst ? 2.2 : 1;
        const rx = (60 + a * 16) * big;
        const k = 1 - a / 45;
        return (
          <g key={i}>
            <ellipse cx={c.x} cy={c.y} rx={rx} ry={rx * 0.3} stroke="#ffffff" strokeWidth={2 + 8 * k} opacity={0.8 * k} />
            <ellipse cx={540} cy={1545} rx={rx * 1.4} ry={rx * 0.18} stroke="#dff2ff" strokeWidth={2 + 6 * k} opacity={0.6 * k} />
          </g>
        );
      })}
    </g>
  );
};

// Ocean spray thrown up by the clash, then a bigger burst on the explosion. Driven by sim time.
const Spray: React.FC<{ t: number }> = ({ t }) => {
  const groups = [
    { n: 90, start: simTime(T.clash + 5), span: simTime(T.burst) - simTime(T.clash + 5), vy: [7, 9] },
    { n: 110, start: simTime(T.burst), span: 6, vy: [12, 14] },
  ];
  return (
    <g fill="#e8f6ff">
      {groups.map((g, gi) =>
        Array.from({ length: g.n }, (_, i) => {
          const age = t - (g.start + random(`ss${gi}${i}`) * g.span);
          if (age < 0) return null;
          const left = random(`sl${gi}${i}`) < 0.5;
          const x0 = left ? 20 + random(`sx${gi}${i}`) * 200 : 860 + random(`sx${gi}${i}`) * 200;
          const y0 = 1470 + random(`sy${gi}${i}`) * 90;
          const vx = (left ? -1 : 1) * random(`svx${gi}${i}`) * 4;
          const vy = -(g.vy[0] + random(`svy${gi}${i}`) * g.vy[1]);
          const y = y0 + vy * age + 0.35 * age * age;
          if (y > y0 + 40) return null;
          return <circle key={`${gi}-${i}`} cx={x0 + vx * age} cy={y} r={3 + random(`sr${gi}${i}`) * 9} opacity={0.85} />;
        }),
      )}
    </g>
  );
};

const ImpactSparks: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {HITS.map((h, i) => {
      const a = f - h;
      if (a < 0 || a >= 8) return null;
      const big = i === HITS.length - 1 ? 1.8 : 1;
      const out = (40 + a * 20) * big;
      const inn = (14 + a * 6) * big;
      const pts = Array.from({ length: 16 }, (_, k) => {
        const r = k % 2 === 0 ? out : inn;
        const th = (k / 16) * Math.PI * 2 + i;
        return `${540 + Math.cos(th) * r},${GROUND - 200 + Math.sin(th) * r}`;
      }).join(" ");
      return (
        <g key={i} opacity={1 - a / 8}>
          <polygon points={pts} fill="#fff7c2" stroke="#ffb020" strokeWidth={3} />
          <circle cx={540} cy={GROUND - 200} r={a * 18 * big} fill="none" stroke="#fff" strokeWidth={6} />
        </g>
      );
    })}
  </g>
);

// ── Composition ──────────────────────────────────────────────────────

const World: React.FC<{ f: number; cam: Cam; id: string }> = ({ f, cam, id }) => {
  const t = simTime(f);
  const kai = kaiAt(f);
  const ren = renAt(f);
  const power = auraPower(f);
  return (
    <g transform={`translate(${cam.ax + cam.sx},${cam.ay + cam.sy}) scale(${cam.z}) rotate(${cam.rot}) translate(${-cam.fx},${-cam.fy})`}>
      <Sky t={t} />
      <Sea t={t} />
      <Island f={f} />
      <Foam t={t} />
      <Debris f={f} t={t} />
      <Aura o={kai} look={KAI} power={power} t={t} seed={1} />
      <Aura o={ren} look={REN} power={power} t={t} seed={7} />
      <Otter o={kai} look={KAI} t={t} id={`${id}kai`} rim={power * 0.9} />
      <Otter o={ren} look={REN} t={t} id={`${id}ren`} rim={power * 0.9} />
      <Blasts f={f} />
      <EnergyBall o={kai} f={f} />
      <EnergyBall o={ren} f={f} />
      <Beam o={kai} f={f} t={t} />
      <Beam o={ren} f={f} t={t} />
      <Clash f={f} />
      <Shockwaves f={f} />
      <Spray t={t} />
      <ImpactSparks f={f} />
      <ForegroundWave t={t} />
    </g>
  );
};

// Anime focus lines in screen space.
const FocusLines: React.FC<{ f: number; amount: number }> = ({ f, amount }) => {
  if (amount < 0.02) return null;
  const k = Math.floor(f / 2);
  return (
    <g fill="#ffffff" opacity={amount * 0.55}>
      {Array.from({ length: 70 }, (_, i) => {
        const th = ((i + random(`fl${i}${k}`) * 0.8) / 70) * Math.PI * 2;
        const rin = 420 + random(`fr${i}${k}`) * 300;
        const w = 0.006 + random(`fw${i}${k}`) * 0.01;
        const p = (r: number, a: number) => `${540 + Math.cos(a) * r},${960 + Math.sin(a) * r * 1.4}`;
        return <polygon key={i} points={`${p(rin, th)} ${p(1400, th - w)} ${p(1400, th + w)}`} />;
      })}
    </g>
  );
};

// Slanted split-screen close-ups of both fighters charging their beams.
const SplitCloseUps: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.split || f >= T.unsplit) return null;
  const inA = kf(f, [[T.split, -1100], [T.split + 5, 0]], Easing.out(Easing.cubic));
  const inB = kf(f, [[T.split + 3, 1100], [T.split + 8, 0]], Easing.out(Easing.cubic));
  const kai = kaiAt(f);
  const ren = renAt(f);
  const close = (o: OtterState, ay: number): Cam => ({ z: 2.3, fx: o.x + o.facing * 10, fy: GROUND - 230, rot: 0, sx: (random(`cx${f}${ay}`) - 0.5) * 6, sy: 0, ax: 540, ay });
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill="#000" />
      <defs>
        <clipPath id="panelA"><polygon points="0,0 1080,0 1080,860 0,1010" /></clipPath>
        <clipPath id="panelB"><polygon points="0,1050 1080,900 1080,1920 0,1920" /></clipPath>
      </defs>
      <g transform={`translate(${inA},0)`}>
        <g clipPath="url(#panelA)"><World f={f} cam={close(kai, 520)} id="pa" /></g>
        <polygon points="0,0 1080,0 1080,860 0,1010" fill="none" stroke="#fff" strokeWidth={10} />
      </g>
      <g transform={`translate(${inB},0)`}>
        <g clipPath="url(#panelB)"><World f={f} cam={close(ren, 1460)} id="pb" /></g>
        <polygon points="0,1050 1080,900 1080,1920 0,1920" fill="none" stroke="#fff" strokeWidth={10} />
      </g>
    </g>
  );
};

export const OtterClash: React.FC<AudioProps> = (audio) => {
  const f = useCurrentFrame();
  const focus = kf(f, [[T.dash - 1, 0], [T.dash, 0.8], [T.knock + 8, 0.8], [T.knock + 9, 0], [T.fire - 1, 0], [T.fire, 1], [SLOW[0], 0.4], [T.burst, 0.6], [T.burst + 10, 0]], Easing.linear);
  let flash = kf(f, [[T.burst, 0], [T.burst + 5, 1], [T.burst + 12, 1], [T.after + 8, 0]]);
  for (const c of [T.fight, T.split, T.unsplit, T.fire]) if (f >= c && f < c + 5) flash = Math.max(flash, 0.6 * (1 - (f - c) / 5));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <Defs />
        <World f={f} cam={cameraAt(f)} id="main" />
        <FocusLines f={f} amount={focus} />
        <SplitCloseUps f={f} />
        <rect x={0} y={0} width={1080} height={1920} fill="url(#vignette)" />
        <rect x={0} y={0} width={1080} height={1920} fill="#fff" opacity={flash} />
      </svg>
      <StudioAudio {...audio} />
    </AbsoluteFill>
  );
};
