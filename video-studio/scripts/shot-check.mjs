// Renders the first, middle and last frame of every shot in an athlete edit, so framing can be checked
// (is the player in frame the whole shot?).
//   node scripts/shot-check.mjs <CompositionId> <shot-list.json>
// -> out/review/<CompositionId>-shots/<nn>-<id>-<a|b|c>.png
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [id, listPath] = process.argv.slice(2);
if (!id || !listPath) throw new Error("usage: node scripts/shot-check.mjs <CompositionId> <shot-list.json>");
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const edit = JSON.parse(readFileSync(path.resolve(root, listPath), "utf8"));
const out = path.join(root, "out", "review", `${id}-shots`);
mkdirSync(out, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });
const composition = await selectComposition({ serveUrl, id });
let start = 0;
for (const [n, s] of edit.shots.entries()) {
  const picks = { a: start + 1, b: start + Math.floor(s.frames / 2), c: start + s.frames - 2 };
  for (const [k, frame] of Object.entries(picks)) {
    const file = `${String(n).padStart(2, "0")}-${s.id}-${k}.png`;
    await renderStill({ serveUrl, composition, frame, output: path.join(out, file), scale: 0.2 });
  }
  start += s.frames;
}
console.log(`stills: ${path.relative(root, out)}`);
