// Smoke-test composition: proves fonts, springs, text reveal and counters render.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Backdrop, Camera, Chip, Counter, Kicker, RevealText } from "../studio/components";
import { useExit, useLayout } from "../studio/motion";
import { color, fonts } from "../studio/theme";

export const HELLO_FRAMES = 150;

export const HelloStudio: React.FC = () => {
  const { portrait } = useLayout();
  const out = useExit(15);
  return (
    <AbsoluteFill>
      <Backdrop />
      <Camera>
        <AbsoluteFill style={{ justifyContent: "center", padding: portrait ? 90 : 160, gap: 36, opacity: out }}>
          <Kicker index="00" label="STUDIO CHECK" />
          <RevealText text="Video Studio is online." size={portrait ? 104 : 120} weight={800} delay={8} />
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <Chip label="remotion ✓" tone="accent" delay={40} />
            <Chip label="react ✓" tone="accent" delay={46} />
            <Chip label="ffmpeg ✓" tone="accent" delay={52} />
          </div>
          <div style={{ fontFamily: fonts.mono, fontSize: 30, color: color.muted }}>
            frames rendered: <Counter to={HELLO_FRAMES} start={30} duration={90} style={{ color: color.text }} />
          </div>
        </AbsoluteFill>
      </Camera>
    </AbsoluteFill>
  );
};
