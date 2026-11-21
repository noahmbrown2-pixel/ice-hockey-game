// Synthesizes the royalty-free music beds with ffmpeg (no samples, no APIs).
//   node scripts/make-audio.mjs
// trailer-beat.wav: 120 BPM (one beat = 0.5s = 15 frames @30fps). Kicks stop at 26s,
//                   one big impact lands on 26s for the end card.
// promo-pad.wav:    soft A-major pad with a gentle pulse every 2s.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dir = path.join(root, "public", "audio");
mkdirSync(dir, { recursive: true });

const PI2 = "2*PI";
const beatM = "mod(t,0.5)";
const kick = `sin(${PI2}*(55*${beatM}+7*(1-exp(-25*${beatM}))))*exp(-7*${beatM})`;
// sub-boom on the end-card hit
const impact = `if(gte(t,26),sin(${PI2}*(40*(t-26)+10*(1-exp(-8*(t-26)))))*exp(-1.6*(t-26)),0)`;
const drone = `0.10*sin(${PI2}*55*t)+0.06*sin(${PI2}*82.4*t)*(0.6+0.4*sin(${PI2}*0.25*t))`;
const trailer = `0.75*${kick}*lt(t,26)*gte(t,2)+0.9*${impact}+${drone}`;

const pulse = `exp(-3*mod(t,2))`;
const pad = [110, 164.81, 220, 277.18]
  .map((f, i) => `sin(${PI2}*${f}*t+${i})*(0.5+0.5*sin(${PI2}*${0.07 + i * 0.03}*t))`)
  .join("+");
const promo = `0.07*(${pad})+0.10*sin(${PI2}*55*t)*${pulse}`;

const make = (name, expr, secs) => {
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error",
    "-f", "lavfi", "-i", `aevalsrc='${expr}':s=48000:d=${secs}`,
    "-af", `afade=t=in:d=0.4,afade=t=out:st=${secs - 2}:d=2,alimiter=limit=0.9`,
    "-ac", "2", path.join(dir, name),
  ]);
  console.log(`wrote public/audio/${name}`);
};

make("trailer-beat.wav", trailer, 30);
make("promo-pad.wav", promo, 30);

// otter-clash.wav (13s): tonal hits from aevalsrc + pink-noise ocean/whoosh/roar shaped by a volume envelope.
// Times are frames/30 from src/otters/OtterClash.tsx.
const at = (t0, body) => `gte(t,${t0})*${body.replaceAll("D", `(t-${t0})`)}`;
const thump = (t0, a) => at(t0, `${a}*sin(${PI2}*(60*D+8*(1-exp(-30*D))))*exp(-16*D)`);
const zap = (t0) => at(t0, `0.22*sin(${PI2}*(900*D-1400*D*D))*exp(-11*D)`);
const clashTones = [
  `between(t,1.33,2.83)*0.14*sin(${PI2}*(80*t+40*(t-1.33)*(t-1.33)))`, // aura power-up hum
  ...[3.333, 3.6, 3.867, 4.133, 4.4].map((t0) => thump(t0, 0.55)),
  thump(4.667, 0.95),
  ...[5.533, 5.7, 5.867, 6.033, 6.2].map(zap),
  `between(t,6.83,8.5)*0.13*sin(${PI2}*(150*t+60*(t-6.83)*(t-6.83)))*(0.7+0.3*sin(${PI2}*9*t))`, // beam charge
  `between(t,8.5,11.33)*0.22*(sin(${PI2}*55*t)+0.5*sin(${PI2}*110*t)+0.3*sin(${PI2}*165*t))*(0.7+0.3*sin(${PI2}*5*t))`, // beam roar
  at(11.33, `0.95*sin(${PI2}*(34*D+14*(1-exp(-6*D))))*exp(-1.4*D)`), // explosion boom
].join("+");
const noiseEnv = [
  "0.30+0.10*sin(2*PI*0.4*t)", // ocean
  "0.35*between(t,1.33,2.83)*(t-1.33)/1.5",
  "0.7*between(t,2.83,3.3)",
  ...[6.06, 6.23, 6.4, 6.56, 6.73].map((t0) => `0.5*gte(t,${t0})*exp(-8*(t-${t0}))`), // blast splashes
  "0.9*between(t,8.5,11.33)",
  "1.6*gte(t,11.33)*exp(-1.2*(t-11.33))",
].join("+");
execFileSync("ffmpeg", [
  "-y", "-loglevel", "error",
  "-f", "lavfi", "-i", "anoisesrc=d=13:c=pink:a=0.5:r=48000",
  "-f", "lavfi", "-i", `aevalsrc='${clashTones}':s=48000:d=13`,
  "-filter_complex",
  `[0]lowpass=f=900,volume='${noiseEnv}':eval=frame[n];[1][n]amix=inputs=2:normalize=0,afade=t=in:d=0.3,afade=t=out:st=11.8:d=1.2,alimiter=limit=0.9`,
  "-ac", "2", path.join(dir, "otter-clash.wav"),
]);
console.log("wrote public/audio/otter-clash.wav");

// phonk-placeholder.wav (21s): stand-in until the user sends a real song. Modelled on the reference Shorts
// (spectrograms 2026-10-26): dense, distorted Brazilian-phonk drums that fill the mids, an upfront cowbell,
// chopped vocal-like stabs, muffled top end, loud (about -9 LUFS). One beat = 0.7s (21 frames @30fps); the
// grid is 16 steps of 0.175s per 2.8s bar. Sections match src/edits/ronaldo.json:
//   0–5.6 intro (bell + 808, no drums) | 5.6 drop (everything) | 15.4 drums out | 18.2 boom, bell tail
{
  const Q = 0.175, BAR = 2.8, DROP = 5.6, DOWN = 15.4, OUT = 18.2, LEN = 21;
  const step = `mod(floor(t/${Q}),16)`, u = `mod(t,${Q})`;
  const on = (steps) => `(${steps.map((k) => `eq(${step},${k})`).join("+")})`;
  const seq = (vals) => vals.map((v, k) => `${v}*eq(${step},${k})`).join("+");
  const drums = `between(t,${DROP},${DOWN})`;
  const live = `lt(t,${OUT})`;

  // distorted funk kick (tresillo-ish pattern), clipped hard so its harmonics land in the mids
  const kick = `${on([0, 3, 6, 8, 10, 11, 14])}*clip(4*sin(${PI2}*(66*${u}+10*(1-exp(-35*${u}))))*exp(-9*${u}),-1,1)`;
  // 808 alternating A1 / F1 every half bar, saturated
  const x = `mod(t,${BAR / 2})`;
  const f808 = `if(eq(mod(floor(t/${BAR / 2}),2),0),110,87.3)`;
  // sidechain-style pump: bass ducks on every kick so each hit punches through
  const duck = `(1-0.8*${drums}*${on([0, 3, 6, 8, 10, 11, 14])}*exp(-10*${u}))`;
  const bass = `clip(2.5*sin(${PI2}*${f808}*${x}+3*(1-exp(-25*${x}))),-1,1)*exp(-0.7*${x})`;
  // cowbell melody on every 16th
  const semis = [0, 0, 3, 0, 7, 0, 5, 3, 0, 0, 3, 0, -2, 0, -4, -5];
  const bellF = `587*pow(2,(${seq(semis)})/12)`;
  const bell = `exp(-20*${u})*(0.55*clip(2.5*sin(${PI2}*${bellF}*t),-1,1)+0.45*clip(2.5*sin(${PI2}*0.675*${bellF}*t),-1,1))`;
  const boom = `gte(t,${OUT})*clip(1.5*sin(${PI2}*(34*(t-${OUT})+14*(1-exp(-6*(t-${OUT}))))),-1,1)*exp(-1.1*(t-${OUT}))`;
  const tones = [
    `0.85*${kick}*${drums}`,
    `(0.14+0.28*${drums})*${bass}*${duck}*${live}`,
    `(0.2+0.35*${drums})*sin(${PI2}*${f808}/2*${x})*exp(-0.7*${x})*${duck}*${live}`, // clean sub under the 808
    `(0.2+0.25*${drums})*${bell}*${live}+0.12*${bell}*gte(t,${OUT})*exp(-1.2*(t-${OUT}))`,
    `0.9*${boom}`,
  ].join("+");

  // vocal-ish chops: a buzzy saw, bandpassed to the voice range, gated on off-beat 16ths
  const saw = Array.from({ length: 8 }, (_, k) => `sin(${PI2}*${220 * (k + 1)}*t)/${k + 1}`).join("+");
  const chop = `(${saw})*${on([2, 7, 12, 13])}*exp(-11*${u})*(0.35+0.65*between(t,${DROP},${OUT}))`;
  // clap on beats 2 and 4, hats on every 16th
  const noiseEnv = `(1.1*${on([4, 12])}*exp(-16*${u})+0.22*exp(-55*${u}))*${drums}+0.5*gte(t,${OUT})*exp(-1.5*(t-${OUT}))`;

  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error",
    "-f", "lavfi", "-i", `anoisesrc=d=${LEN}:c=white:a=0.5:r=48000`,
    "-f", "lavfi", "-i", `aevalsrc='${tones}':s=48000:d=${LEN}`,
    "-f", "lavfi", "-i", `aevalsrc='0.6*(${chop})':s=48000:d=${LEN}`,
    "-filter_complex",
    `[0]highpass=f=1800,volume='${noiseEnv}':eval=frame[n];` +
      `[2]bandpass=f=1100:w=900,volume=2.5[c];` +
      `[1][n][c]amix=inputs=3:normalize=0,acompressor=threshold=0.1:ratio=6:attack=5:release=80:makeup=3,` +
      `lowpass=f=6500,aecho=0.8:0.6:70:0.22,afade=t=in:d=0.15,afade=t=out:st=${LEN - 1.5}:d=1.5,` +
      `volume=13dB,alimiter=limit=0.93:attack=2:release=40:level=false`,
    "-ac", "2", path.join(dir, "phonk-placeholder.wav"),
  ]);
  console.log("wrote public/audio/phonk-placeholder.wav");
}
