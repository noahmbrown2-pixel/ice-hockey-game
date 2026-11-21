import { Easing, SpringConfig, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const springs = {
  smooth: { damping: 200 }, // no overshoot
  snappy: { damping: 20, stiffness: 200 },
  bouncy: { damping: 12 },
};

// 0 -> 1 spring that starts `delay` frames into the current Sequence.
export const useEnter = (delay = 0, config: Partial<SpringConfig> = springs.smooth, durationInFrames?: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config, durationInFrames });
};

// 1 -> 0 over the last `frames` frames of the current Sequence.
export const useExit = (frames = 12) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return interpolate(frame, [durationInFrames - frames, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
};

export const clampInterp = (
  frame: number,
  input: number[],
  output: number[],
  easing: (t: number) => number = Easing.inOut(Easing.cubic),
) => interpolate(frame, input, output, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  return { width, height, portrait, cx: width / 2, cy: height / 2 };
};
