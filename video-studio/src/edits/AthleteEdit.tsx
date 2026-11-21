// Athlete fan edit in the style of docs/edit-style-sports.md: dark contrast grade, beat cuts, slow-mo,
// punch-in zooms, shake, and a red hand-drawn scribble. Driven entirely by a shot-list JSON (src/edits/*.json),
// which scripts/cut-clips.mjs also reads to cut public/<clipDir>/<id>.mp4.
import React from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";

export type Shot = {
  id: string;
  src?: string; // key into edit.sources (and edit.sizes)
  clip?: string; // reuse another shot's clip instead of cutting a new one
  skip?: number; // seconds into the clip to start from
  at: number;
  frames: number;
  rate: number;
  fx: number;
  fy?: number;
  zoom?: number;
  push?: number;
  shake?: number;
  punch?: boolean;
  impactAt?: number;
  scribble?: boolean;
  scribbleAt?: { x: number; y: number; scale: number };
  dark?: boolean;
  fadeIn?: number;
  fadeOut?: number;
};
export type Edit = {
  title: string;
  clipDir: string;
  music?: string;
  scribbleText: string;
  // When set: a flat black layer at this opacity over everything (0.15 = 15% darker), no vignette,
  // no per-shot `dark`, and no brightness drop in the grade.
  darken?: number;
  grade?: string; // CSS filter that replaces the default grade (e.g. near black-and-white)
  letterbox?: number; // black bars top and bottom, as a fraction of the height each
  scribbleClip?: string; // a recorded scribble video (black background) screened over the shot instead of the drawn one
  sizes?: Record<string, number[]>; // source width/height when not 1920x1080
  shots: Shot[];
};

export const EDIT_W = 1080;
export const EDIT_H = 1350; // 4:5, like the reference edits
const DEFAULT_SRC = [1920, 1080];

export const editFrames = (edit: Edit) =>
  edit.shots.reduce((n, s) => n + s.frames, 0);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const ShotView: React.FC<{
  shot: Shot;
  clipDir: string;
  scribbleText: string;
  flat: boolean;
  size: number[];
  grade?: string;
  bandH: number;
  scribbleClip?: string;
}> = ({
  shot,
  clipDir,
  scribbleText,
  flat,
  size,
  grade: gradeOverride,
  bandH,
  scribbleClip,
}) => {
  const f = useCurrentFrame();
  const p = f / shot.frames;
  let z = (shot.zoom ?? 1.1) * (1 + (shot.push ?? 0) * p);
  if (shot.punch) z *= 1 + 0.18 * Math.exp(-f / 4);

  // shake: decays from the cut, plus an extra hit at impactAt
  let amp = (shot.shake ?? 0) * Math.exp(-f / 6);
  if (shot.impactAt !== undefined && f >= shot.impactAt)
    amp += 16 * Math.exp(-(f - shot.impactAt) / 4);
  const sx = (random(`x${shot.id}${f}`) - 0.5) * 2 * amp;
  const sy = (random(`y${shot.id}${f}`) - 0.5) * 2 * amp;

  // cover-fit the source into the picture band (4:5 without letterbox), framed on fx/fy, never showing an edge
  const cover = Math.max(EDIT_W / size[0], bandH / size[1]) * z;
  const w = size[0] * cover;
  const h = size[1] * cover;
  const left = Math.min(0, Math.max(EDIT_W - w, EDIT_W / 2 - shot.fx * w));
  // default fy sits a little high so the broadcast score badge in the bottom-left gets cropped out
  const top = Math.min(
    0,
    Math.max(bandH - h, bandH / 2 - (shot.fy ?? 0.4) * h),
  );

  const fade = Math.min(
    shot.fadeIn ? interpolate(f, [0, shot.fadeIn], [0, 1], clamp) : 1,
    shot.fadeOut
      ? interpolate(f, [shot.frames - shot.fadeOut, shot.frames], [1, 0], clamp)
      : 1,
  );
  const grade =
    gradeOverride ??
    (flat
      ? "contrast(1.12) saturate(0.95)"
      : `contrast(1.22) saturate(0.85) brightness(${shot.dark ? 0.72 : 0.9})`);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: (EDIT_H - bandH) / 2,
          width: EDIT_W,
          height: bandH,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: left + sx,
            top: top + sy,
            width: w,
            height: h,
            filter: grade,
            opacity: fade,
          }}
        >
          <OffthreadVideo
            trimBefore={Math.round((shot.skip ?? 0) * 30)}
            src={staticFile(`${clipDir}/${shot.clip ?? shot.id}.mp4`)}
            playbackRate={shot.rate}
            muted
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
      {shot.scribble && scribbleClip ? (
        <OffthreadVideo
          src={staticFile(scribbleClip)}
          // a .webm with alpha draws as solid red over anything; an .mp4 on black has to be screened (fades on red shirts)
          transparent={scribbleClip.endsWith(".webm")}
          style={{
            position: "absolute",
            left: (shot.scribbleAt ?? { x: 0 }).x,
            top: (shot.scribbleAt ?? { y: 0 }).y,
            width: 512 * (shot.scribbleAt?.scale ?? 1),
            mixBlendMode: scribbleClip.endsWith(".webm") ? "normal" : "screen",
          }}
        />
      ) : shot.scribble ? (
        <Scribble
          frame={f}
          len={shot.frames}
          text={scribbleText}
          at={shot.scribbleAt ?? { x: 230, y: 360, scale: 1 }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

// Hand-drawn red marker strokes. Letters are simple polylines; points "boil" (jitter) every 3 frames.
const GLYPHS: Record<string, [number, number][][]> = {
  C: [
    Array.from({ length: 12 }, (_, i) => {
      const th = ((-40 - (280 * i) / 11) * Math.PI) / 180;
      return [55 + 60 * Math.cos(th), 80 + 75 * Math.sin(th)] as [
        number,
        number,
      ];
    }),
  ],
  R: [
    [
      [10, 0],
      [10, 160],
    ],
    [
      [10, 0],
      [75, 6],
      [90, 42],
      [66, 74],
      [10, 80],
    ],
    [
      [40, 78],
      [100, 160],
    ],
  ],
  "7": [
    [
      [0, 4],
      [95, 0],
      [35, 160],
    ],
  ],
  N: [
    [
      [0, 160],
      [0, 0],
      [80, 160],
      [80, 0],
    ],
  ],
  O: [
    Array.from({ length: 13 }, (_, i) => {
      const th = ((-90 + 360 * (i / 12)) * Math.PI) / 180;
      return [50 + 50 * Math.cos(th), 80 + 80 * Math.sin(th)] as [
        number,
        number,
      ];
    }),
  ],
  Z: [
    [
      [0, 0],
      [90, 0],
      [0, 160],
      [95, 160],
    ],
  ],
  "1": [
    [
      [10, 30],
      [40, 0],
      [40, 160],
    ],
  ],
  "0": [
    Array.from({ length: 13 }, (_, i) => {
      const th = ((-90 + 360 * (i / 12)) * Math.PI) / 180;
      return [45 + 45 * Math.cos(th), 80 + 80 * Math.sin(th)] as [
        number,
        number,
      ];
    }),
  ],
};
const ADVANCE = 125;

const Scribble: React.FC<{
  frame: number;
  len: number;
  text: string;
  at: { x: number; y: number; scale: number };
}> = ({ frame, len, text, at }) => {
  const ox = 0;
  const oy = 0;
  const strokes: [number, number][][] = [];
  [...text].forEach((ch, i) =>
    (GLYPHS[ch] ?? []).forEach((s) =>
      strokes.push(s.map(([x, y]) => [ox + i * ADVANCE + x, oy + y])),
    ),
  );
  const zw = text.length * ADVANCE + 40;
  strokes.push(
    Array.from(
      { length: 7 },
      (_, i) =>
        [ox - 30 + (zw * i) / 6, oy + 205 + (i % 2 === 0 ? 0 : -32)] as [
          number,
          number,
        ],
    ),
  );

  const drawn = interpolate(frame, [2, len * 0.6], [0, strokes.length], clamp);
  const boil = Math.floor(frame / 3);
  return (
    <svg
      width={EDIT_W}
      height={EDIT_H}
      style={{ position: "absolute", inset: 0 }}
    >
      <g transform={`translate(${at.x},${at.y}) scale(${at.scale})`}>
        {strokes.map((pts, i) => {
          const prog = Math.max(0, Math.min(1, drawn - i));
          if (prog <= 0) return null;
          const d = pts
            .map(
              ([x, y], k) =>
                `${k ? "L" : "M"}${(x + (random(`bx${i}${k}${boil}`) - 0.5) * 6).toFixed(1)} ${(y + (random(`by${i}${k}${boil}`) - 0.5) * 6).toFixed(1)}`,
            )
            .join(" ");
          return (
            <path
              key={i}
              d={d}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - prog}
              stroke="#e3141b"
              strokeWidth={11}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 6px rgba(227,20,27,0.6))" }}
            />
          );
        })}
      </g>
    </svg>
  );
};

export const AthleteEdit: React.FC<{ edit: Edit }> = ({ edit }) => {
  const total = editFrames(edit);
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {edit.shots.map((s) => {
        const seq = (
          <Sequence key={s.id} from={from} durationInFrames={s.frames}>
            <ShotView
              shot={s}
              clipDir={edit.clipDir}
              scribbleText={edit.scribbleText}
              flat={edit.darken !== undefined}
              size={(s.src && edit.sizes?.[s.src]) || DEFAULT_SRC}
              grade={edit.grade}
              bandH={EDIT_H * (1 - 2 * (edit.letterbox ?? 0))}
              scribbleClip={edit.scribbleClip}
            />
          </Sequence>
        );
        from += s.frames;
        return seq;
      })}
      <AbsoluteFill
        style={{
          background:
            edit.darken !== undefined
              ? `rgba(0,0,0,${edit.darken})`
              : "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.75) 100%)",
          pointerEvents: "none",
        }}
      />
      {edit.music ? (
        <Audio
          src={staticFile(edit.music)}
          volume={(f) => interpolate(f, [total - 30, total], [1, 0], clamp)}
        />
      ) : null}
    </AbsoluteFill>
  );
};
