import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clampInterp, springs, useEnter } from "./motion";
import { color, fonts } from "./theme";

// ── Text ──────────────────────────────────────────────────────────────

// Word-by-word rise with a slight blur-in. `delay` and `stagger` in frames.
export const RevealText: React.FC<{
  text: string;
  size: number;
  delay?: number;
  stagger?: number;
  weight?: number;
  color?: string;
  align?: "left" | "center";
  maxWidth?: number;
  lineHeight?: number;
  font?: string;
  letterSpacing?: string;
}> = ({
  text, size, delay = 0, stagger = 3, weight = 600, color: c = color.text,
  align = "left", maxWidth, lineHeight = 1.08, font = fonts.sans, letterSpacing = "-0.025em",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div
      style={{
        fontFamily: font, fontSize: size, fontWeight: weight, color: c, lineHeight,
        letterSpacing, textAlign: align, maxWidth,
        display: "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: size * 0.26,
      }}
    >
      {words.map((w, i) => {
        const t = Math.min(1, Math.max(0, (frame - delay - i * stagger) / (fps * 0.55)));
        const e = 1 - Math.pow(1 - t, 3);
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: size * 0.12 }}>
            <span
              style={{
                display: "inline-block",
                transform: `translateY(${(1 - e) * 70}%)`,
                opacity: e,
                filter: `blur(${(1 - e) * 6}px)`,
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// Small numbered section label: "01 — IDENTITY"
export const Kicker: React.FC<{ index: string; label: string; delay?: number; size?: number }> = ({
  index, label, delay = 0, size = 22,
}) => {
  const p = useEnter(delay);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: p, fontFamily: fonts.mono, fontSize: size, letterSpacing: "0.18em", color: color.muted }}>
      <span style={{ color: color.accent }}>{index}</span>
      <span style={{ width: 48 * p, height: 1, background: color.line }} />
      <span>{label}</span>
    </div>
  );
};

export const Counter: React.FC<{
  from?: number; to: number; start: number; duration: number;
  prefix?: string; decimals?: number; style?: React.CSSProperties;
}> = ({ from = 0, to, start, duration, prefix = "", decimals = 0, style }) => {
  const frame = useCurrentFrame();
  const v = clampInterp(frame, [start, start + duration], [from, to]);
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {prefix}
      {v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
};

// ── Surfaces ──────────────────────────────────────────────────────────

// Dot grid + soft vignette. Drifts slowly so static scenes still breathe.
export const Backdrop: React.FC<{ glow?: string }> = ({ glow = color.accent2 }) => {
  const frame = useCurrentFrame();
  const drift = frame * 0.15;
  return (
    <AbsoluteFill style={{ backgroundColor: color.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${color.line} 1.2px, transparent 1.2px)`,
          backgroundSize: "36px 36px",
          backgroundPosition: `${drift}px ${drift * 0.5}px`,
          opacity: 0.55,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 45%, ${glow}14, transparent 70%),
                       radial-gradient(ellipse 120% 90% at 50% 50%, transparent 55%, ${color.bg} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Slow push-in across the whole scene: the "camera".
export const Camera: React.FC<{ children: React.ReactNode; from?: number; to?: number; panY?: number }> = ({
  children, from = 1.04, to = 1, panY = 0,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = interpolate(frame, [0, durationInFrames], [from, to]);
  const y = interpolate(frame, [0, durationInFrames], [panY, 0]);
  return <AbsoluteFill style={{ transform: `scale(${s}) translateY(${y}px)` }}>{children}</AbsoluteFill>;
};

export const Panel: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div
    style={{
      background: `linear-gradient(180deg, ${color.panelHi}, ${color.panel})`,
      border: `1px solid ${color.line}`,
      borderRadius: 18,
      boxShadow: "0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Chip: React.FC<{ label: string; tone?: "accent" | "accent2" | "warn" | "muted"; delay?: number; size?: number }> = ({
  label, tone = "muted", delay = 0, size = 22,
}) => {
  const p = useEnter(delay, springs.snappy);
  const c = tone === "muted" ? color.muted : color[tone];
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: `${size * 0.35}px ${size * 0.7}px`, borderRadius: 999,
        border: `1px solid ${c}55`, background: `${c}14`, color: c,
        fontFamily: fonts.mono, fontSize: size, whiteSpace: "nowrap",
        opacity: p, transform: `scale(${0.85 + 0.15 * p})`,
      }}
    >
      {label}
    </span>
  );
};

// Circle with a check (or cross) that draws itself.
export const Mark: React.FC<{ delay?: number; size?: number; ok?: boolean }> = ({ delay = 0, size = 40, ok = true }) => {
  const p = useEnter(delay, springs.snappy);
  const draw = useEnter(delay + 4);
  const c = ok ? color.accent : color.warn;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ transform: `scale(${p})`, flexShrink: 0 }}>
      <circle cx="20" cy="20" r="18" fill={`${c}22`} stroke={c} strokeWidth="2" />
      {ok ? (
        <path d="M12 20.5l5.5 5.5L28 15" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="26" strokeDashoffset={26 * (1 - draw)} />
      ) : (
        <path d="M14 14l12 12M26 14L14 26" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round"
          strokeDasharray="34" strokeDashoffset={34 * (1 - draw)} />
      )}
    </svg>
  );
};

// ── Diagram primitives (absolute px coordinates in the frame) ────────

export type Pt = { x: number; y: number };

// Line that draws on from a -> b. Rendered in a full-frame SVG.
export const Edge: React.FC<{ a: Pt; b: Pt; delay?: number; dur?: number; tone?: string; dashed?: boolean; width?: number }> = ({
  a, b, delay = 0, dur = 18, tone = color.line, dashed = false, width = 2,
}) => {
  const frame = useCurrentFrame();
  const p = clampInterp(frame, [delay, delay + dur], [0, 1]);
  return (
    <svg style={{ position: "absolute", inset: 0, overflow: "visible" }} width="100%" height="100%">
      <line
        x1={a.x} y1={a.y} x2={a.x + (b.x - a.x) * p} y2={a.y + (b.y - a.y) * p}
        stroke={tone} strokeWidth={width} strokeLinecap="round"
        strokeDasharray={dashed ? "6 10" : undefined}
        opacity={p > 0 ? 1 : 0}
      />
    </svg>
  );
};

// Glowing dot travelling a -> b between frames [start, start+dur].
export const Packet: React.FC<{ a: Pt; b: Pt; start: number; dur: number; tone?: string; size?: number; label?: string }> = ({
  a, b, start, dur, tone = color.accent, size = 18, label,
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const p = clampInterp(frame, [start, start + dur], [0, 1]);
  const x = a.x + (b.x - a.x) * p;
  const y = a.y + (b.y - a.y) * p;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)" }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: tone, boxShadow: `0 0 ${size * 1.6}px ${tone}, 0 0 ${size * 0.6}px ${tone}` }} />
      {label ? (
        <div style={{ position: "absolute", top: -size * 2.4, left: "50%", transform: "translateX(-50%)", fontFamily: fonts.mono, fontSize: size * 1.4, color: tone, whiteSpace: "nowrap" }}>
          {label}
        </div>
      ) : null}
    </div>
  );
};

export type IconKind = "person" | "agent" | "subagent" | "merchant" | "gate";

// Simple line icons drawn in a 48x48 box.
export const Icon: React.FC<{ kind: IconKind; size: number; tone: string }> = ({ kind, size, tone }) => {
  const s = { fill: "none", stroke: tone, strokeWidth: 2.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const hex = "M24 5l16 9.5v19L24 43 8 33.5v-19z";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      {kind === "person" && (<><circle cx="24" cy="17" r="7.5" {...s} /><path d="M10 40c1.5-8 7-12 14-12s12.5 4 14 12" {...s} /></>)}
      {kind === "agent" && (<><path d={hex} {...s} /><circle cx="24" cy="24" r="5" fill={tone} /></>)}
      {kind === "subagent" && (<><path d={hex} {...s} strokeDasharray="5 4" /><circle cx="24" cy="24" r="3.5" fill={tone} /></>)}
      {kind === "merchant" && (<><path d="M8 18l3-9h26l3 9" {...s} /><path d="M8 18c0 3 2.5 5 5.3 5s5.4-2 5.4-5c0 3 2.5 5 5.3 5s5.3-2 5.3-5c0 3 2.6 5 5.4 5S40 21 40 18" {...s} /><path d="M11 23v16h26V23M20 39v-9h8v9" {...s} /></>)}
      {kind === "gate" && (<><path d="M24 5l15 6v11c0 10-6.5 17-15 21-8.5-4-15-11-15-21V11z" {...s} /><circle cx="24" cy="21" r="3.5" {...s} /><path d="M24 24.5V31" {...s} /></>)}
    </svg>
  );
};

// Labelled node: icon in a rounded tile + caption beneath.
export const Node: React.FC<{
  at: Pt; label: string; sub?: string; icon?: IconKind; delay?: number;
  tone?: string; size?: number; labelSize?: number;
}> = ({ at, label, sub, icon = "agent", delay = 0, tone = color.accent2, size = 120, labelSize = 26 }) => {
  const p = useEnter(delay, springs.snappy);
  return (
    <div
      style={{
        position: "absolute", left: at.x, top: at.y,
        transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * p})`, opacity: p,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 18,
      }}
    >
      <div
        style={{
          width: size, height: size, borderRadius: size * 0.3,
          border: `1.5px solid ${tone}88`, background: `radial-gradient(circle at 50% 35%, ${tone}30, ${color.panel} 70%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 40px ${tone}22`,
        }}
      >
        <Icon kind={icon} size={size * 0.52} tone={tone} />
      </div>
      <div style={{ position: "absolute", top: size + 16, textAlign: "center", whiteSpace: "nowrap" }}>
        <div style={{ fontFamily: fonts.sans, fontWeight: 600, fontSize: labelSize, color: color.text }}>{label}</div>
        {sub ? <div style={{ fontFamily: fonts.mono, fontSize: labelSize * 0.72, color: color.muted, marginTop: 6 }}>{sub}</div> : null}
      </div>
    </div>
  );
};
