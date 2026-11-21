import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadPixel } from "@remotion/google-fonts/PressStart2P";

export const fonts = {
  sans: loadInter("normal", { weights: ["400", "500", "600", "800"], subsets: ["latin"] }).fontFamily,
  mono: loadMono("normal", { weights: ["400", "600"], subsets: ["latin"] }).fontFamily,
  pixel: loadPixel("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
};

// Enterprise palette: near-black base, one primary accent, one secondary, one alert.
export const color = {
  bg: "#07090d",
  panel: "#0e131a",
  panelHi: "#141b24",
  line: "#223040",
  text: "#e8edf2",
  muted: "#8593a1",
  accent: "#6ee7c8", // mint: verified / allowed
  accent2: "#8ab4ff", // blue: identity / structure
  warn: "#f5b74f", // amber: denied / attention
};

export const FPS = 30;
