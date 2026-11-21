// Records real gameplay clips from ../monster-hunter.html for the trailer.
// Each shot: fresh browser context -> set game state -> play scripted input -> save webm,
// then ffmpeg trims the setup lead-in and writes public/gameplay/<shot>.mp4.
//
//   node scripts/capture-gameplay.mjs
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, renameSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const gameUrl = pathToFileURL(path.join(root, "..", "monster-hunter.html")).href;
const outDir = path.join(root, "public", "gameplay");
const tmpDir = path.join(root, "out", "capture-tmp");
mkdirSync(outDir, { recursive: true });

const W = 960, H = 540;
const LEAD_IN = 1.2; // seconds of setup trimmed off each recording

// state: run in page before the shot. Globals (P, cam, gs, ST, dayTime, DAY_LEN) are top-level lets.
// play: scripted keyboard input while recording.
const shots = [
  { name: "title", secs: 3, state: "gs=ST.MENU", play: [] },
  { name: "village", secs: 3, state: "gs=ST.VILLAGE;villTab=0", play: [] },
  { name: "forest", secs: 5, state: setup(950, 0.25), play: hunt() },
  { name: "desert", secs: 5, state: setup(3250, 0.3), play: hunt() },
  { name: "jungle", secs: 5, state: setup(4350, 0.2), play: hunt() },
  { name: "volcanic", secs: 5, state: setup(5850, 0.3), play: hunt() },
  { name: "void", secs: 5, state: setup(7450, 0.7), play: hunt() },
  { name: "crystal", secs: 5, state: setup(8550, 0.4), play: hunt() },
];

function setup(x, dayPct) {
  // HP is topped up every frame-ish so the hunter survives without showing a cheat value in the HUD
  return `gs=ST.WORLD;P.x=${x};P.y=GY-P.h;setInterval(()=>{P.hp=P.maxHP},30);
    cam.x=Math.max(0,P.x-W/2+100);dayTime=DAY_LEN*${dayPct};`;
}

// walk right, swing, jump, keep swinging
function hunt() {
  return [
    ["down", "ArrowRight"], ["wait", 900], ["up", "ArrowRight"],
    ...Array.from({ length: 6 }, () => [["press", "KeyJ"], ["wait", 220]]).flat(),
    ["down", "ArrowRight"], ["press", "Space"], ["wait", 500], ["up", "ArrowRight"],
    ...Array.from({ length: 8 }, () => [["press", "KeyJ"], ["wait", 200]]).flat(),
  ];
}

const browser = await chromium.launch();
for (const shot of shots) {
  rmSync(tmpDir, { recursive: true, force: true });
  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir: tmpDir, size: { width: W, height: H } },
  });
  const page = await ctx.newPage();
  const t0 = Date.now();
  await page.goto(gameUrl);
  await page.evaluate("localStorage.removeItem('mh3')");
  await page.evaluate(shot.state);
  await page.waitForTimeout(Math.max(0, LEAD_IN * 1000 - (Date.now() - t0)));

  const end = Date.now() + shot.secs * 1000;
  for (const [op, arg] of shot.play) {
    if (Date.now() > end) break;
    if (op === "down") await page.keyboard.down(arg);
    else if (op === "up") await page.keyboard.up(arg);
    else if (op === "press") await page.keyboard.press(arg);
    else await page.waitForTimeout(arg);
  }
  await page.waitForTimeout(Math.max(0, end - Date.now() + 300));
  await ctx.close();

  const webm = path.join(tmpDir, readdirSync(tmpDir).find((f) => f.endsWith(".webm")));
  const mp4 = path.join(outDir, `${shot.name}.mp4`);
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error", "-ss", String(LEAD_IN), "-i", webm,
    "-t", String(shot.secs), "-r", "30", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", mp4,
  ]);
  console.log(`captured ${shot.name} -> ${path.relative(root, mp4)}`);
}
await browser.close();
rmSync(tmpDir, { recursive: true, force: true });
