# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Server

Start the live-reload server (auto-refreshes browser on file save):
```
cd "C:\Users\noahm\Project" && npx browser-sync start --server --files "*.html" --port 3000
```
Open games at `http://localhost:3000/<filename>.html`. If the server is already running, changes auto-refresh — no restart needed.

## Deploying a Game to GitHub Pages

Each game gets its own GitHub repo with the HTML file renamed to `index.html`:
1. `gh repo create noahmbrown2-pixel/<repo-name> --public`
2. Create a temp folder, copy the file as `index.html`, `git init`, commit, push to `main`
3. Enable Pages: `gh api repos/noahmbrown2-pixel/<repo-name>/pages -X POST --field "source[branch]=main" --field "source[path]=/"`
4. Shareable link: `https://noahmbrown2-pixel.github.io/<repo-name>/`

## Project Structure

All games are **single self-contained HTML files** (inline CSS + JS, no dependencies, no build step). Each uses HTML5 Canvas with `requestAnimationFrame` game loops.

| Path | What it is |
|------|-----------|
| `*.html` (root) | Standalone browser games |
| `index.html` | 3D Minecraft game |
| `monster-hunter.html` | Open-world Monster Hunter (most complex — see memory for full architecture) |
| `manutd-news-extension/` | Chrome Extension (Manifest V3) — load unpacked in `chrome://extensions` |
| `wr-debate/` | Node.js multi-agent debate sim using Google Gemini API |
| `*.py` | AI image generation scripts using Google Imagen/Gemini |

## wr-debate (Node.js)

```
cd wr-debate && npm start
```
Requires a `.env` file with a Google API key. Uses `@google/generative-ai` and `dotenv`.

## Python Image Scripts

```
pip install -r requirements.txt
python <script>.py
```
Scripts use `google-genai`, `google-cloud-aiplatform`, and `Pillow`. Require Google Cloud credentials.

## Game Architecture Conventions

- **Canvas scaling**: Use `devicePixelRatio` for sharp rendering; set `canvas.style.width/height` separately from `canvas.width/height`
- **Mobile support**: Always include `<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">`, a `fitCanvas()` function that scales to `Math.min(window.innerWidth/W, window.innerHeight/H)`, and touch event listeners alongside mouse events
- **Touch drag offset**: When dragging pieces/objects on touch, apply a Y lift (~1.5× cell size) so the finger doesn't cover the element
- **Input normalization**: `evPt(e)` pattern — handles both mouse and touch, scales coords by `rect.width` so coordinate system stays consistent regardless of CSS scaling
- **Save/load**: `localStorage` for high scores and game state
