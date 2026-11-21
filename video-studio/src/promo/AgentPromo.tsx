import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { AudioProps, StudioAudio } from "../studio/audio";
import { Backdrop, Camera } from "../studio/components";
import { AuditScene, AuthorityScene, EndScene, HookScene, IdentityScene, PaymentsScene } from "./scenes";
import { TRANSITION, scenes } from "./storyboard";

export const promoDefaults: AudioProps = { musicSrc: "audio/promo-pad.wav", musicVolume: 0.7, sfx: [] };

const SCENES: Record<(typeof scenes)[number]["id"], React.FC> = {
  hook: HookScene, identity: IdentityScene, authority: AuthorityScene,
  payments: PaymentsScene, audit: AuditScene, end: EndScene,
};
// INTO[i] = transition into scene i+1
const INTO = [fade(), slide({ direction: "from-right" }), slide({ direction: "from-right" }), slide({ direction: "from-bottom" }), fade()];
const timing = springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION });

export const AgentPromo: React.FC<AudioProps> = (audio) => (
  <AbsoluteFill>
    <Backdrop />
    <TransitionSeries>
      {scenes.flatMap((s, i) => {
        const Scene = SCENES[s.id];
        const seq = (
          <TransitionSeries.Sequence key={s.id} durationInFrames={s.frames}>
            <Camera>
              <Scene />
            </Camera>
          </TransitionSeries.Sequence>
        );
        return i === 0 ? [seq] : [<TransitionSeries.Transition key={`t${i}`} presentation={INTO[i - 1]} timing={timing} />, seq];
      })}
    </TransitionSeries>
    <StudioAudio {...audio} />
  </AbsoluteFill>
);
