// Renders evenly spaced stills from a composition and tiles them into one review image.
//   node scripts/contact-sheet.mjs <CompositionId> [count=16] [cols=4]
// -> out/review/<CompositionId>-sheet.png  (frames listed in reading order on stdout)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [id, count = "16", cols = "4"] = process.argv.slice(2);
if (!id) throw new Error("usage: node scripts/contact-sheet.mjs <CompositionId> [count] [cols]");

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const tmp = path.join(root, "out", "review", `${id}-frames`);
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });
const comp = await selectComposition({ serveUrl, id });
const n = Number(count);
const frames = Array.from({ length: n }, (_, i) => Math.round(((i + 0.5) / n) * (comp.durationInFrames - 1)));

for (const [i, frame] of frames.entries()) {
  await renderStill({ serveUrl, composition: comp, frame, output: path.join(tmp, `${String(i).padStart(3, "0")}.png`), scale: 0.35 });
}
console.log(`frames: ${frames.join(", ")}`);

const sheet = path.join(root, "out", "review", `${id}-sheet.png`);
const rows = Math.ceil(n / Number(cols));
execFileSync("ffmpeg", [
  "-y", "-loglevel", "error", "-framerate", "1", "-i", path.join(tmp, "%03d.png"),
  "-vf", `pad=iw+8:ih+8:4:4:color=0x333333,tile=${cols}x${rows}`, "-frames:v", "1", sheet,
]);
console.log(`sheet: ${path.relative(root, sheet)}`);
