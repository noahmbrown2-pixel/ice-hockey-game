// Cel-shaded anime otter, drawn facing right with feet at (0,0). Head top is about y = -345.
// All pose values are plain numbers so scenes can interpolate them frame by frame.
import React from "react";

export type Look = { fur: string; dark: string; belly: string; accent: string; aura: string; gear: "headband" | "scarf" };
export type Expr = "focus" | "shout" | "grin" | "wince";
export type Pose = {
  front: number; // arm angles in degrees: 0 = hanging down, -90 = pointing forward
  back: number;
  frontExt?: number; // arm length multiplier (punch extension)
  backExt?: number;
  lean?: number; // whole-body rotation around the feet
  squash?: number; // vertical scale around the feet
  expr: Expr;
};
export type OtterState = { x: number; y: number; s: number; facing: 1 | -1; pose: Pose };

export const KAI: Look = { fur: "#7a4a2a", dark: "#4a2a15", belly: "#ecd0a6", accent: "#d8342c", aura: "#ffcf3a", gear: "headband" };
export const REN: Look = { fur: "#b98a57", dark: "#7a5330", belly: "#f7e6c8", accent: "#2f7de0", aura: "#5fdcff", gear: "scarf" };

const INK = "#1a0f0a";
const FRONT_SHOULDER = { x: 28, y: -200 };
const BACK_SHOULDER = { x: -18, y: -205 };
const ARM = 90;

const rad = (d: number) => (d * Math.PI) / 180;

// Local otter point -> world point, matching the transform order used in <Otter>.
export const toWorld = (o: OtterState, p: { x: number; y: number }) => {
  const sq = o.pose.squash ?? 1;
  const l = rad(o.pose.lean ?? 0);
  const y0 = p.y * sq;
  const rx = p.x * Math.cos(l) - y0 * Math.sin(l);
  const ry = p.x * Math.sin(l) + y0 * Math.cos(l);
  return { x: o.x + rx * o.s * o.facing, y: o.y + ry * o.s };
};

export const pawLocal = (which: "front" | "back", pose: Pose) => {
  const sh = which === "front" ? FRONT_SHOULDER : BACK_SHOULDER;
  const a = rad(which === "front" ? pose.front : pose.back);
  const len = ARM * ((which === "front" ? pose.frontExt : pose.backExt) ?? 1);
  return { x: sh.x - len * Math.sin(a), y: sh.y + len * Math.cos(a) };
};

export const pawWorld = (o: OtterState, which: "front" | "back") => toWorld(o, pawLocal(which, o.pose));

const Arm: React.FC<{ at: { x: number; y: number }; angle: number; ext: number; look: Look }> = ({ at, angle, ext, look }) => (
  <g transform={`translate(${at.x},${at.y}) rotate(${angle})`}>
    <rect x={-15} y={-12} width={30} height={ARM * ext + 12} rx={15} fill={look.fur} stroke={INK} strokeWidth={3} />
    <circle cx={0} cy={ARM * ext} r={19} fill={look.dark} stroke={INK} strokeWidth={3} />
  </g>
);

const Eye: React.FC<{ x: number; y: number; r: number; expr: Expr }> = ({ x, y, r, expr }) => {
  if (expr === "grin") return <path d={`M${x - r} ${y + 2} Q${x} ${y - r * 1.4} ${x + r} ${y + 2}`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />;
  if (expr === "wince") return <path d={`M${x - r} ${y - r * 0.8} L${x + r * 0.6} ${y} L${x - r} ${y + r * 0.8}`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={r} ry={r * 1.4} fill={INK} />
      <circle cx={x - r * 0.3} cy={y - r * 0.55} r={r * 0.38} fill="#fff" />
      <circle cx={x + r * 0.35} cy={y + r * 0.5} r={r * 0.18} fill="#fff" />
    </g>
  );
};

export const Otter: React.FC<{ o: OtterState; look: Look; t: number; id: string; rim?: number }> = ({ o, look, t, id, rim = 0 }) => {
  const { pose } = o;
  const breathe = 1 + 0.012 * Math.sin(t * 0.25);
  const sway = Math.sin(t * 0.18) * 6;
  const flutter = Math.sin(t * 0.7);
  const fe = pose.frontExt ?? 1;
  const be = pose.backExt ?? 1;
  const tr = `translate(${o.x},${o.y}) scale(${o.facing * o.s},${o.s}) rotate(${pose.lean ?? 0}) scale(1,${(pose.squash ?? 1) * breathe})`;
  const brow = pose.expr === "focus" || pose.expr === "shout";

  return (
    <g transform={tr}>
      <defs>
        <clipPath id={`${id}-body`}>
          <ellipse cx={5} cy={-130} rx={68} ry={105} />
        </clipPath>
        <clipPath id={`${id}-head`}>
          <circle cx={15} cy={-280} r={60} />
        </clipPath>
      </defs>

      {/* tail */}
      <path d={`M-40 -75 Q-125 ${-60 + sway} -160 ${-8 + sway} Q-118 ${-22 + sway} -36 -30 Z`} fill={look.dark} stroke={INK} strokeWidth={3} />
      <Arm at={BACK_SHOULDER} angle={pose.back} ext={be} look={{ ...look, fur: look.dark }} />

      {/* legs + feet */}
      <ellipse cx={-22} cy={-30} rx={26} ry={36} fill={look.dark} stroke={INK} strokeWidth={3} />
      <ellipse cx={-14} cy={-5} rx={34} ry={12} fill={look.dark} stroke={INK} strokeWidth={3} />

      {/* body with cel shadow, belly and fur strokes */}
      <ellipse cx={5} cy={-130} rx={68} ry={105} fill={look.fur} stroke={INK} strokeWidth={3} />
      <g clipPath={`url(#${id}-body)`}>
        <ellipse cx={-52} cy={-128} rx={52} ry={120} fill={look.dark} opacity={0.5} />
        <ellipse cx={24} cy={-128} rx={42} ry={86} fill={look.belly} />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${-40 + i * 9} ${-180 + i * 30} q-8 10 -4 22`} stroke={look.dark} strokeWidth={3} fill="none" opacity={0.7} />
        ))}
      </g>
      {rim > 0 ? <ellipse cx={5} cy={-130} rx={68} ry={105} fill="none" stroke={look.aura} strokeWidth={5} opacity={rim} /> : null}

      <ellipse cx={34} cy={-28} rx={26} ry={36} fill={look.fur} stroke={INK} strokeWidth={3} />
      <ellipse cx={44} cy={-5} rx={34} ry={12} fill={look.dark} stroke={INK} strokeWidth={3} />

      {/* neck + head */}
      <ellipse cx={12} cy={-212} rx={48} ry={40} fill={look.fur} />
      <circle cx={-28} cy={-326} r={15} fill={look.dark} stroke={INK} strokeWidth={3} />
      <circle cx={-28} cy={-326} r={7} fill={look.belly} />
      <circle cx={38} cy={-334} r={13} fill={look.dark} stroke={INK} strokeWidth={3} />
      <circle cx={15} cy={-280} r={60} fill={look.fur} stroke={INK} strokeWidth={3} />
      <g clipPath={`url(#${id}-head)`}>
        <circle cx={-30} cy={-280} r={48} fill={look.dark} opacity={0.45} />
        {look.gear === "headband" ? <rect x={-50} y={-322} width={140} height={20} fill={look.accent} stroke={INK} strokeWidth={3} /> : null}
      </g>
      {rim > 0 ? <circle cx={15} cy={-280} r={60} fill="none" stroke={look.aura} strokeWidth={5} opacity={rim} /> : null}
      {look.gear === "headband" ? (
        <g fill={look.accent} stroke={INK} strokeWidth={3}>
          <path d={`M-40 -314 Q-80 ${-325 + flutter * 12} -118 ${-300 + flutter * 18} L-112 ${-288 + flutter * 16} Q-78 ${-305 + flutter * 8} -42 -304 Z`} />
          <path d={`M-40 -308 Q-72 ${-290 - flutter * 10} -104 ${-268 - flutter * 14} L-96 ${-258 - flutter * 12} Q-70 ${-282 - flutter * 6} -40 -300 Z`} />
        </g>
      ) : null}

      {/* face */}
      <ellipse cx={46} cy={-260} rx={35} ry={25} fill={look.belly} stroke={INK} strokeWidth={2.5} />
      <Eye x={30} y={-292} r={9.5} expr={pose.expr} />
      <Eye x={63} y={-294} r={7.5} expr={pose.expr} />
      {brow ? (
        <g stroke={INK} strokeWidth={5} strokeLinecap="round">
          <line x1={16} y1={-318} x2={40} y2={-307} />
          <line x1={56} y1={-308} x2={74} y2={-317} />
        </g>
      ) : null}
      <ellipse cx={72} cy={-272} rx={11} ry={8} fill={INK} />
      <circle cx={69} cy={-275} r={3} fill="#fff" opacity={0.7} />
      {pose.expr === "shout" ? (
        <g>
          <ellipse cx={62} cy={-246} rx={12} ry={11} fill={INK} />
          <ellipse cx={62} cy={-240} rx={7} ry={4} fill="#e8707a" />
        </g>
      ) : pose.expr === "grin" ? (
        <g>
          <path d="M46 -258 Q62 -232 80 -258 Z" fill={INK} />
          <path d="M54 -248 Q62 -240 72 -248 Z" fill="#e8707a" />
        </g>
      ) : (
        <path d="M54 -252 Q62 -246 72 -252" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
      )}
      <g stroke={INK} strokeWidth={2} opacity={0.8}>
        <line x1={60} y1={-262} x2={102} y2={-270} />
        <line x1={60} y1={-256} x2={102} y2={-252} />
        <line x1={34} y1={-260} x2={2} y2={-266} />
      </g>

      {look.gear === "scarf" ? (
        <g fill={look.accent} stroke={INK} strokeWidth={3}>
          <path d={`M-24 -222 Q-70 ${-214 + flutter * 14} -116 ${-196 + flutter * 20} L-108 ${-180 + flutter * 18} Q-66 ${-198 + flutter * 8} -22 -206 Z`} />
          <ellipse cx={14} cy={-216} rx={52} ry={16} />
        </g>
      ) : null}

      <Arm at={FRONT_SHOULDER} angle={pose.front} ext={fe} look={look} />
    </g>
  );
};
