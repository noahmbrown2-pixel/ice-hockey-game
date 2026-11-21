import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import {
  Chip, Counter, Edge, Icon, Kicker, Mark, Node, Packet, Panel, Pt, RevealText,
} from "../studio/components";
import { clampInterp, springs, useEnter, useLayout } from "../studio/motion";
import { color, fonts } from "../studio/theme";
import { copy } from "./storyboard";

// ── Shared header: kicker + headline + optional sub ───────────────────

const Header: React.FC<{
  kicker?: readonly [string, string]; headline: string; sub?: string;
  box: { left: number; top: number; width: number }; size: number; align?: "left" | "center";
}> = ({ kicker, headline, sub, box, size, align = "left" }) => {
  const subIn = useEnter(28);
  return (
    <div style={{ position: "absolute", ...box, display: "flex", flexDirection: "column", gap: size * 0.38, alignItems: align === "center" ? "center" : "flex-start" }}>
      {kicker ? <Kicker index={kicker[0]} label={kicker[1]} size={size * 0.3} /> : null}
      <RevealText text={headline} size={size} weight={700} delay={6} align={align} maxWidth={box.width} />
      {sub ? (
        <div style={{ fontFamily: fonts.sans, fontSize: size * 0.4, color: color.muted, lineHeight: 1.4, maxWidth: box.width, textAlign: align, opacity: subIn, transform: `translateY(${(1 - subIn) * 16}px)` }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
};

// ── 1. Hook ───────────────────────────────────────────────────────────

export const HookScene: React.FC = () => {
  const { width, height, portrait } = useLayout();
  const frame = useCurrentFrame();
  const c = copy("hook");

  // Deterministic scatter of agents on a jittered grid.
  const cols = portrait ? 4 : 7;
  const rows = portrait ? 7 : 4;
  const pts: Pt[] = [];
  for (let r = 0; r < rows; r++)
    for (let q = 0; q < cols; q++) {
      const i = r * cols + q;
      pts.push({
        x: ((q + 0.5) / cols) * width + (random(`x${i}`) - 0.5) * (width / cols) * 0.6,
        y: ((r + 0.5) / rows) * height + (random(`y${i}`) - 0.5) * (height / rows) * 0.6,
      });
    }
  const links: [number, number][] = [];
  pts.forEach((_, i) => {
    if ((i + 1) % cols !== 0 && random(`h${i}`) > 0.25) links.push([i, i + 1]);
    if (i + cols < pts.length && random(`v${i}`) > 0.45) links.push([i, i + cols]);
  });
  const dim = clampInterp(frame, [20, 50], [0.75, 0.35]);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: dim }}>
        {links.map(([a, b], i) => (
          <Edge key={i} a={pts[a]} b={pts[b]} delay={4 + random(`d${i}`) * 30} dur={20} />
        ))}
        {links.filter((_, i) => i % 3 === 0).map(([a, b], i) => {
          const start = 30 + ((i * 17) % 80);
          return frame < start + 24 ? <Packet key={`p${i}`} a={pts[a]} b={pts[b]} start={start} dur={24} size={10} tone={i % 2 ? color.accent2 : color.accent} /> : null;
        })}
        {pts.map((p, i) => <Dot key={i} at={p} delay={random(`n${i}`) * 28} />)}
      </AbsoluteFill>
      <Header
        headline={c.headline}
        sub={c.sub}
        size={portrait ? 92 : 104}
        align="center"
        box={portrait ? { left: 80, top: 720, width: 920 } : { left: 390, top: 370, width: 1140 }}
      />
    </AbsoluteFill>
  );
};

const Dot: React.FC<{ at: Pt; delay: number }> = ({ at, delay }) => {
  const p = useEnter(delay, springs.snappy);
  return (
    <div style={{ position: "absolute", left: at.x, top: at.y, width: 22, height: 22, marginLeft: -11, marginTop: -11, borderRadius: 7, border: `1.5px solid ${color.accent2}`, background: color.panel, transform: `scale(${p})`, boxShadow: `0 0 18px ${color.accent2}44` }} />
  );
};

// ── 2. Identity ───────────────────────────────────────────────────────

const ID_ROWS: [string, string][] = [
  ["AGENT ID", "did:example:7f3a…c91e"],
  ["OPERATOR", "Acme Robotics Inc."],
  ["ISSUER", "Acme Identity Provider"],
  ["PUBLIC KEY", "ed25519 · 9F2C 41AB …"],
  ["ISSUED", "2026-10-01"],
];

export const IdentityScene: React.FC = () => {
  const { portrait } = useLayout();
  const frame = useCurrentFrame();
  const c = copy("identity");
  const swing = useEnter(16, { damping: 16, stiffness: 90 });
  const cardW = portrait ? 900 : 760;
  const cardPos = portrait ? { left: 90, top: 780 } : { left: 1020, top: 250 };
  const float = Math.sin(frame / 28) * 6;

  return (
    <AbsoluteFill>
      <Header
        kicker={c.kicker} headline={c.headline} sub={c.sub} size={portrait ? 84 : 76}
        box={portrait ? { left: 80, top: 170, width: 920 } : { left: 140, top: 330, width: 780 }}
      />
      <div style={{ position: "absolute", ...cardPos, width: cardW, perspective: 1600 }}>
        {/* ghost cards for depth */}
        {[2, 1].map((k) => (
          <Panel key={k} style={{ position: "absolute", inset: 0, transform: `translate(${k * 26}px, ${-k * 26}px) scale(${1 - k * 0.04})`, opacity: 0.22 * swing }}>
            <div />
          </Panel>
        ))}
        <Panel
          style={{
            position: "relative", padding: 44,
            transform: `rotateY(${(1 - swing) * -38}deg) translateY(${(1 - swing) * 80 + float}px)`,
            opacity: swing,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 34 }}>
            <div style={{ width: 76, height: 76, borderRadius: 22, border: `1.5px solid ${color.accent2}88`, display: "flex", alignItems: "center", justifyContent: "center", background: `${color.accent2}14` }}>
              <Icon kind="agent" size={44} tone={color.accent2} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: 36, color: color.text }}>procurement-agent</div>
              <div style={{ fontFamily: fonts.mono, fontSize: 20, color: color.muted, marginTop: 4 }}>agent identity credential</div>
            </div>
            <Chip label="VERIFIED" tone="accent" delay={118} size={20} />
          </div>
          {ID_ROWS.map(([k, v], i) => <IdRow key={k} k={k} v={v} delay={40 + i * 10} labelW={portrait ? 230 : 210} />)}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 26 }}>
            <Mark delay={104} size={42} />
            <span style={{ fontFamily: fonts.mono, fontSize: 24, color: color.accent, opacity: clampInterp(frame, [106, 116], [0, 1]) }}>
              signature valid · key matches operator
            </span>
          </div>
        </Panel>
      </div>
    </AbsoluteFill>
  );
};

const IdRow: React.FC<{ k: string; v: string; delay: number; labelW: number }> = ({ k, v, delay, labelW }) => {
  const p = useEnter(delay);
  return (
    <div style={{ display: "flex", padding: "16px 0", borderTop: `1px solid ${color.line}`, opacity: p, transform: `translateX(${(1 - p) * 24}px)` }}>
      <div style={{ width: labelW, fontFamily: fonts.mono, fontSize: 20, color: color.muted, letterSpacing: "0.12em" }}>{k}</div>
      <div style={{ fontFamily: fonts.mono, fontSize: 26, color: color.text }}>{v}</div>
    </div>
  );
};

// ── 3. Delegated authority ────────────────────────────────────────────

export const AuthorityScene: React.FC = () => {
  const { portrait } = useLayout();
  const c = copy("authority");
  const sz = portrait ? 116 : 124;
  const [h, a, s]: Pt[] = portrait
    ? [{ x: 250, y: 760 }, { x: 250, y: 1170 }, { x: 250, y: 1580 }]
    : [{ x: 380, y: 620 }, { x: 960, y: 620 }, { x: 1540, y: 620 }];
  const cap = useEnter(140);

  const chips1 = ["scope: purchase.office", "limit: $500 / day", "expires: 24h"];
  const chips2 = ["scope: purchase.paper", "limit: $100 / day", "expires: 2h"];
  const chipBox = (from: Pt, to: Pt): React.CSSProperties =>
    portrait
      ? { left: 440, top: (from.y + to.y) / 2 - 92 }
      : { left: (from.x + to.x) / 2 - 175, top: from.y - 300 };

  return (
    <AbsoluteFill>
      <Header
        kicker={c.kicker} headline={c.headline} size={portrait ? 84 : 72}
        box={portrait ? { left: 80, top: 170, width: 920 } : { left: 140, top: 110, width: 1500 }}
      />
      <Edge a={h} b={a} delay={34} dur={20} tone={color.accent2} width={3} />
      <Edge a={a} b={s} delay={92} dur={20} tone={color.accent} width={3} />
      <Node at={h} icon="person" label="Dana (finance)" sub="human principal" delay={18} tone={color.text} size={sz} />
      <Node at={a} icon="agent" label="procurement-agent" sub="delegate" delay={44} size={sz} />
      <Node at={s} icon="subagent" label="paper-buyer" sub="sub-delegate" delay={102} tone={color.accent} size={sz} />
      <ChipStack labels={chips1} delay={58} tone="accent2" style={chipBox(h, a)} />
      <ChipStack labels={chips2} delay={114} tone="accent" style={chipBox(a, s)} />
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: portrait ? 1790 : 900, textAlign: "center",
          fontFamily: fonts.sans, fontSize: portrait ? 31 : 34, color: color.muted, opacity: cap,
          transform: `translateY(${(1 - cap) * 14}px)`, padding: "0 60px",
        }}
      >
        {c.sub}
      </div>
    </AbsoluteFill>
  );
};

const ChipStack: React.FC<{ labels: string[]; delay: number; tone: "accent" | "accent2"; style: React.CSSProperties }> = ({ labels, delay, tone, style }) => (
  <div style={{ position: "absolute", width: 350, display: "flex", flexDirection: "column", gap: 12, alignItems: "center", ...style }}>
    {labels.map((l, i) => <Chip key={l} label={l} tone={tone} delay={delay + i * 6} size={22} />)}
  </div>
);

// ── 4. Payments ───────────────────────────────────────────────────────

export const PaymentsScene: React.FC = () => {
  const { portrait } = useLayout();
  const frame = useCurrentFrame();
  const c = copy("payments");
  const sz = portrait ? 116 : 124;
  const [ag, gate, mer]: Pt[] = portrait
    ? [{ x: 250, y: 720 }, { x: 250, y: 1140 }, { x: 250, y: 1560 }]
    : [{ x: 330, y: 640 }, { x: 960, y: 640 }, { x: 1590, y: 640 }];

  const checks = ["identity verified", "scope: purchase.paper", "$86.40 ≤ $100 / day"];
  const panelPos: React.CSSProperties = portrait ? { left: 430, top: 1010 } : { left: 790, top: 270 };
  const settled = useEnter(124, springs.snappy);
  const denied = useEnter(166, springs.snappy);
  const gateFlash = clampInterp(frame, [160, 166, 190], [0, 1, 0.35]);
  const panelIn = useEnter(56);

  return (
    <AbsoluteFill>
      <Header
        kicker={c.kicker} headline={c.headline} size={portrait ? 84 : 72}
        box={portrait ? { left: 80, top: 170, width: 920 } : { left: 140, top: 110, width: 1500 }}
      />
      <Edge a={ag} b={gate} delay={10} dur={18} width={3} />
      <Edge a={gate} b={mer} delay={20} dur={18} width={3} />
      <Node at={ag} icon="subagent" label="paper-buyer" delay={0} tone={color.accent} size={sz} />
      <Node at={gate} icon="gate" label="policy gate" sub="checks the mandate" delay={6} tone={gateFlash > 0.01 ? color.warn : color.accent2} size={sz * 1.15} />
      <Node at={mer} icon="merchant" label="Paper Co." sub="merchant" delay={12} tone={color.text} size={sz} />
      <Packet a={ag} b={gate} start={36} dur={26} label={frame < 64 ? "$86.40" : undefined} />
      <Packet a={gate} b={mer} start={92} dur={26} label={frame < 120 ? "$86.40" : undefined} />
      <Packet a={ag} b={{ x: (ag.x + gate.x) / 2 + (gate.x - ag.x) * 0.28, y: (ag.y + gate.y) / 2 + (gate.y - ag.y) * 0.28 }} start={140} dur={24} tone={color.warn} label="$240.00" />

      <Panel style={{ position: "absolute", ...panelPos, padding: "22px 28px", display: "flex", flexDirection: "column", gap: 14, opacity: panelIn }}>
        {checks.map((t, i) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Mark delay={64 + i * 8} size={32} />
            <span style={{ fontFamily: fonts.mono, fontSize: 22, color: color.text, opacity: clampInterp(frame, [66 + i * 8, 74 + i * 8], [0, 1]) }}>{t}</span>
          </div>
        ))}
      </Panel>

      <div style={{ position: "absolute", left: portrait ? mer.x + 110 : mer.x - 150, top: portrait ? mer.y - 50 : mer.y + 150, width: 300, display: "flex", flexDirection: "column", alignItems: portrait ? "flex-start" : "center", gap: 10, opacity: settled }}>
        <span style={{ fontFamily: fonts.sans, fontWeight: 800, fontSize: 52, color: color.text }}>
          <Counter to={86.4} start={118} duration={18} prefix="$" decimals={2} />
        </span>
        <Chip label="SETTLED" tone="accent" delay={128} size={20} />
      </div>

      <div style={{ position: "absolute", left: portrait ? 430 : gate.x - 260, top: portrait ? gate.y + 120 : gate.y + 190, width: 520, display: "flex", alignItems: "center", justifyContent: portrait ? "flex-start" : "center", gap: 14, opacity: denied }}>
        <Mark delay={166} size={38} ok={false} />
        <span style={{ fontFamily: fonts.mono, fontSize: 24, color: color.warn }}>$240.00 denied · over limit</span>
      </div>
    </AbsoluteFill>
  );
};

// ── 5. Audit ──────────────────────────────────────────────────────────

const LOG: [string, string][] = [
  ["identity.verified", "procurement-agent · Acme Robotics"],
  ["mandate.granted", "Dana → procurement-agent · $500/day"],
  ["mandate.delegated", "→ paper-buyer · $100/day · 2h"],
  ["payment.settled", "$86.40 → Paper Co."],
  ["payment.denied", "$240.00 · exceeds $100/day"],
];
const HASHES = ["3f9a1c", "8c21e7", "b04d93", "e71a2f", "5d6c08", "a93b41"]; // HASHES[i] = prev of row i

export const AuditScene: React.FC = () => {
  const { portrait } = useLayout();
  const c = copy("audit");
  const listPos = portrait ? { left: 80, top: 760, width: 920 } : { left: 960, top: 210, width: 820 };
  const rowH = portrait ? 178 : 132;

  return (
    <AbsoluteFill>
      <Header
        kicker={c.kicker} headline={c.headline} sub={c.sub} size={portrait ? 84 : 72}
        box={portrait ? { left: 80, top: 170, width: 920 } : { left: 140, top: 340, width: 720 }}
      />
      <div style={{ position: "absolute", ...listPos }}>
        {LOG.map(([ev, detail], i) => (
          <LogRow key={ev} i={i} ev={ev} detail={detail} top={i * rowH} h={rowH - 22} portrait={portrait} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const LogRow: React.FC<{ i: number; ev: string; detail: string; top: number; h: number; portrait: boolean }> = ({ i, ev, detail, top, h, portrait }) => {
  const p = useEnter(18 + i * 16, springs.snappy);
  const link = useEnter(30 + i * 16);
  const denied = ev === "payment.denied";
  const tone = denied ? color.warn : color.accent;
  return (
    <>
      {i > 0 ? (
        <div style={{ position: "absolute", left: 46, top: top - 22, width: 2, height: 22 * link, background: color.accent2 }} />
      ) : null}
      <Panel
        style={{
          position: "absolute", left: 0, right: 0, top, height: h, padding: "0 28px",
          display: "flex", alignItems: "center", gap: 24, borderRadius: 14,
          opacity: p, transform: `translateY(${(1 - p) * 40}px)`,
        }}
      >
        <div style={{ fontFamily: fonts.mono, fontSize: 20, color: color.muted, width: 40 }}>#{1040 + i}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: portrait ? 28 : 25, color: tone, fontWeight: 600 }}>{ev}</div>
          <div style={{ fontFamily: fonts.sans, fontSize: portrait ? 26 : 22, color: color.text, marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{detail}</div>
          {portrait ? (
            <div style={{ fontFamily: fonts.mono, fontSize: 20, color: color.muted, marginTop: 8 }}>
              prev {HASHES[i]} · hash <span style={{ color: color.accent2 }}>{HASHES[i + 1]}</span>
            </div>
          ) : null}
        </div>
        {portrait ? null : (
          <div style={{ fontFamily: fonts.mono, fontSize: 18, color: color.muted, textAlign: "right", lineHeight: 1.6 }}>
            <div>prev {HASHES[i]}</div>
            <div>hash <span style={{ color: color.accent2 }}>{HASHES[i + 1]}</span></div>
          </div>
        )}
      </Panel>
    </>
  );
};

// ── 6. End card ───────────────────────────────────────────────────────

export const EndScene: React.FC = () => {
  const { portrait } = useLayout();
  const frame = useCurrentFrame();
  const c = copy("end");
  const rule = clampInterp(frame, [40, 70], [0, 1]);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: portrait ? 70 : 56 }}>
      <div style={{ display: "flex", flexDirection: portrait ? "column" : "row", alignItems: "center", gap: portrait ? 26 : 40 }}>
        {c.pillars.map((w, i) => <Pillar key={w} word={w} i={i} last={i === c.pillars.length - 1} portrait={portrait} />)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <RevealText text={c.headline} size={portrait ? 96 : 110} weight={800} delay={26} align="center" />
        <div style={{ width: (portrait ? 520 : 680) * rule, height: 3, background: `linear-gradient(90deg, transparent, ${color.accent}, transparent)` }} />
      </div>
    </AbsoluteFill>
  );
};

const Pillar: React.FC<{ word: string; i: number; last: boolean; portrait: boolean }> = ({ word, i, last, portrait }) => {
  const p = useEnter(i * 5, springs.snappy);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 40, opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
      <span style={{ fontFamily: fonts.mono, fontSize: portrait ? 40 : 34, letterSpacing: "0.16em", color: color.muted, textTransform: "uppercase" }}>{word}</span>
      {!last && !portrait ? <span style={{ width: 8, height: 8, borderRadius: 4, background: color.accent }} /> : null}
    </div>
  );
};
