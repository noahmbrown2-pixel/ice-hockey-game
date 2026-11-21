// Cuts the source moments listed in an edit's shot list into short h264 clips under public/.
//   node scripts/cut-clips.mjs src/edits/ronaldo.json
// Each clip starts at shot.at and is just long enough for frames/30 * rate seconds (plus a little slack).
// Keeps the source frame rate so slow-mo stays smooth. A shot can name one of edit.sources with `src`.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const listPath = process.argv[2];
if (!listPath) throw new Error("usage: node scripts/cut-clips.mjs <shot-list.json>");
const edit = JSON.parse(readFileSync(path.resolve(root, listPath), "utf8"));
const outDir = path.join(root, "public", edit.clipDir);
mkdirSync(outDir, { recursive: true });

for (const s of edit.shots) {
  if (s.clip) continue; // reuses another shot's clip
  const secs = (s.frames / 30) * s.rate + 0.3;
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error", "-ss", String(s.at), "-t", secs.toFixed(3), "-i", s.src ? edit.sources[s.src] : edit.source,
    "-an", "-c:v", "libx264", "-crf", "12", "-preset", "fast", "-pix_fmt", "yuv420p", path.join(outDir, `${s.id}.mp4`),
  ]);
  console.log(`${s.id.padEnd(10)} ${s.at}s +${secs.toFixed(2)}s`);
}
