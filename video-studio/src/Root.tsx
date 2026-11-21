import React from "react";
import { Composition } from "remotion";
import { HELLO_FRAMES, HelloStudio } from "./hello/HelloStudio";
import { AthleteEdit, EDIT_H, EDIT_W, Edit, editFrames } from "./edits/AthleteEdit";
import ronaldo from "./edits/ronaldo.json";
import ronaldo0810 from "./edits/ronaldo0810.json";
import ronaldoN0z from "./edits/ronaldo-n0z.json";
import ronaldoN0z3 from "./edits/ronaldo-n0z3.json";
import ronaldoRef1030 from "./edits/ronaldo-ref1030.json";
import { CLASH_FRAMES, OtterClash, clashDefaults } from "./otters/OtterClash";
import { AgentPromo, promoDefaults } from "./promo/AgentPromo";
import { PROMO_FRAMES } from "./promo/storyboard";
import { FPS } from "./studio/theme";
import { MonsterHunterTrailer, TRAILER_FRAMES, trailerDefaults } from "./trailer/MonsterHunterTrailer";

const LANDSCAPE = { width: 1920, height: 1080 };
const PORTRAIT = { width: 1080, height: 1920 };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="HelloStudio" component={HelloStudio} durationInFrames={HELLO_FRAMES} fps={FPS} {...LANDSCAPE} />
      <Composition id="AgentPromo-16x9" component={AgentPromo} durationInFrames={PROMO_FRAMES} fps={FPS} {...LANDSCAPE} defaultProps={promoDefaults} />
      <Composition id="AgentPromo-9x16" component={AgentPromo} durationInFrames={PROMO_FRAMES} fps={FPS} {...PORTRAIT} defaultProps={promoDefaults} />
      <Composition id="MonsterHunterTrailer-16x9" component={MonsterHunterTrailer} durationInFrames={TRAILER_FRAMES} fps={FPS} {...LANDSCAPE} defaultProps={trailerDefaults} />
      <Composition id="MonsterHunterTrailer-9x16" component={MonsterHunterTrailer} durationInFrames={TRAILER_FRAMES} fps={FPS} {...PORTRAIT} defaultProps={trailerDefaults} />
      <Composition id="OtterClash-9x16" component={OtterClash} durationInFrames={CLASH_FRAMES} fps={FPS} {...PORTRAIT} defaultProps={clashDefaults} />
      <Composition id="RonaldoEdit" component={AthleteEdit} durationInFrames={editFrames(ronaldo as Edit)} fps={FPS} width={EDIT_W} height={EDIT_H} defaultProps={{ edit: ronaldo as Edit }} />
      <Composition id="Ronaldo0810Edit" component={AthleteEdit} durationInFrames={editFrames(ronaldo0810 as Edit)} fps={FPS} width={EDIT_W} height={EDIT_H} defaultProps={{ edit: ronaldo0810 as Edit }} />
      <Composition id="RonaldoN0zEdit" component={AthleteEdit} durationInFrames={editFrames(ronaldoN0z as Edit)} fps={FPS} width={EDIT_W} height={EDIT_H} defaultProps={{ edit: ronaldoN0z as Edit }} />
      <Composition id="RonaldoN0z3Edit" component={AthleteEdit} durationInFrames={editFrames(ronaldoN0z3 as Edit)} fps={FPS} width={EDIT_W} height={EDIT_H} defaultProps={{ edit: ronaldoN0z3 as Edit }} />
      <Composition id="RonaldoRef1030Edit" component={AthleteEdit} durationInFrames={editFrames(ronaldoRef1030 as Edit)} fps={FPS} width={EDIT_W} height={EDIT_H} defaultProps={{ edit: ronaldoRef1030 as Edit }} />
    </>
  );
};
