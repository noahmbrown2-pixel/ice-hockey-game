\# claude.md — Wingman (VST3) Spec, Rationale, and Build Guide



> \*\*Blunt summary:\*\*

> Wingman is a \*\*chat-first VST3 plugin\*\* that \*\*generates MIDI\*\*, \*\*previews it in-plugin\*\*, and \*\*auto-routes\*\* it to the \*\*best track\*\* when confidence is high (with undo). The UI is \*\*brand-first\*\* (no model names anywhere). A \*\*Think Harder\*\* button triggers a deeper, pricier planning pass. If \*\*Magenta\*\* (your generator) hiccups, we gracefully degrade to \*\*chat + edit tools\*\*. Users pay \*\*$20/mo\*\* and see a \*\*$5 included API credit meter\*\* with a \*\*clear per-gen estimate\*\*.



---



\## 0) Goals / Non-Goals



\*\*Goals\*\*



\* Make \*\*chat\*\* the main interface for any producer using a DAW.

\* Generate \*\*usable MIDI\*\* fast, preview it instantly, then route to the right place with minimal setup.

\* Keep cognitive load low: \*\*single primary action\*\*, \*\*predictable layout\*\*, \*\*clear cost\*\*.

\* Never leak internal model names to users; \*\*brand is “Wingman.”\*\*



\*\*Non-Goals\*\*



\* Not building a full piano-roll editor. We do \*\*quick transforms\*\*, not full DAW.

\* Not automating every DAW operation natively; we use \*\*portable routing\*\* (virtual ports) and optional \*\*helpers\*\*.

\* Not exposing token pricing tables; \*\*config-driven\*\* estimates only.



\*\*Why\*\*

Producers want \*\*results\*\*, not menus. Chat drives intent faster than knobs. Auto-send keeps momentum. Costs must be predictable to avoid churn.



---



\## 1) Audience \& Use Cases



\*\*Who:\*\* Producers (beginner → advanced) in Ableton/FL/REAPER/Bitwig/Studio One/Logic (AU later).

\*\*Primary tasks:\*\*



\* “Make me \*\*4-bar trap hats\*\* with tasteful rolls.”

\* “Generate \*\*jazzy chords\*\* in \*\*C minor\*\* at \*\*120 BPM\*\*.”

\* “\*\*Transform\*\* this MIDI: humanize, transpose, swing.”

\* “If it’s good, \*\*send\*\* it to my \*\*Keys\*\* track.”



\*\*Why\*\*

They already live in the DAW. Wingman is the \*\*starting pistol\*\*: fast ideation, minimal wiring, aligns with existing workflows.



---



\## 2) Top-Level UX \& Information Architecture



```

┌──────────────────────────────────────────────────────────────────────────────┐

│ Wingman                      ♩120 | C minor | 4/4   ▷ Play  ■ Stop    (⚙)   │

│ \[Import MIDI] \[Export ▾]                            \[Fallback • Online]      │

├───────────────┬───────────────────────────────────────────┬──────────────────┤

│ Sessions ▸    │ Chat + Result Cards (hero)                │ Inspector        │

│               │  • messages                                │  • clip params   │

│               │  • result cards (piano-roll + controls)    │  • routing       │

│               │  • suggestion chips                        │  • transforms    │

│               │  • Composer (sticky bottom)                │                  │

├───────────────┴───────────────────────────────────────────┴──────────────────┤

│ Usage: $X.XX / $5 • Est next: ~$0.0Y • Latency 4ZZ ms • MIDI Out: Armed      │

└──────────────────────────────────────────────────────────────────────────────┘

```



\* \*\*Window:\*\* 900×600 (min 720×520).

\* \*\*Columns:\*\* 256px Sessions (collapsible) • fluid Chat • 320px Inspector.

\* \*\*Why\*\*: Fits cramped plugin slots; chat remains hero; inspector avoids modal hell.



---



\## 3) Components (What, How, Why)



\### 3.1 Top Bar



\* \*\*Wingman\*\* (click → About/Changelog). \*\*No model names\*\*.

\* \*\*Transport:\*\* ▷/■ with \*\*Tempo\*\*, \*\*Key\*\*, \*\*Time Sig\*\* dropdowns.

\* \*\*Import/Export\*\*, \*\*Fallback status chip\*\* → Diagnostics modal.



\*\*How:\*\* React components; tooltips on hover; 120ms hover motion; all actions keyboardable.

\*\*Why:\*\* Always-visible transport = less context switching; status chip reassures power users.



---



\### 3.2 Sessions (Left)



\* \*\*New Chat\*\*; thread list: name • last activity • $ used; hover \*\*…\*\* (Rename/Duplicate/Archive).

\* Filter (All/Drums/Chords/Bass/Lead); collapses <860px width.



\*\*How:\*\* Virtualized list; persisted via local storage per-project.

\*\*Why:\*\* Quick recall; cost per thread helps budgeting mental model.



---



\### 3.3 Chat \& Result Cards (Center)



\*\*Messages\*\*: 60–72ch width; timestamps; copy button.

\*\*Suggestion chips\*\*: common tasks (“2-bar trap hats”, “Jazzy C-min”, “Boom-bap swing”, “1-bar arp 1/16”).



\*\*Result Card (every MIDI output)\*\*



\* Header: \*\*Clip Name\*\* • Bars • Tempo • Key • Instrument.

\* \*\*Piano-roll thumbnail\*\* + animated playhead + Play/Loop/Gain.

\* Primary actions:



&nbsp; \* \*\*Approve \& Send\*\* (to DAW)

&nbsp; \* \*\*Insert to Session\*\*

&nbsp; \* \*\*Download MIDI\*\*

&nbsp; \* \*\*Variations ×3\*\*

\* Quick edits: \*\*Transpose ±12\*\*, \*\*Quantize\*\*, \*\*Humanize\*\*, \*\*Swing%\*\*, \*\*Velocity min/max\*\*, \*\*Seed\*\*.

\* \*\*Auto-Send recommendation\*\* line:

&nbsp; “\*\*Recommended:\*\* Track 5 — Keys • Confidence 0.82 • \[Send] \[Change…]”



\*\*How:\*\*



\* Thumbnail generated from MIDI → canvas preview (off UI thread).

\* Preview audio via native synth (see §7).

\* Actions dispatch to bridge methods (send/download/insert).



\*\*Why:\*\*



\* Card is a \*\*decision unit\*\*. Everything you need is here. No tabbing. No hunting.



---



\### 3.4 Composer (Sticky Bottom)



\* Multiline input (“Describe what to make…”).

\* Left: \*\*Attach MIDI\*\*, Mic, token/char count.

\* Right: \*\*Generate\*\* (primary), \*\*Think Harder\*\* (secondary with ▶▼ to select depth).

\* Inline estimate: “Est: ~$0.02 (normal) • ~$0.08 (Harder)”.

\* \*\*Enter\*\* send; \*\*Shift+Enter\*\* newline.



\*\*How:\*\* Debounce estimator, show both normal/harder costs; disable Harder when credit insufficient with tooltip.

\*\*Why:\*\* Clear choice architecture; cost transparency; zero surprises.



---



\### 3.5 Inspector (Right)



\* \*\*Params:\*\* Instrument, Bars, Tempo, Key/Scale, Time Sig, Swing, Density, Velocity range, Seed.

\* \*\*Transforms:\*\* Quantize grid, Humanize (timing/vel), Legato, Strum, Invert, Arpify.

\* \*\*Routing:\*\* Role (Auto/Drums/Bass/Chords/Lead), Destination (Auto / Track list / Virtual port), \*\*Auto-send for this clip\*\*.

\* \*\*Export:\*\* MIDI, Copy, Drag handle.

\* \*\*Notes/Tags\*\*.



\*\*How:\*\* Controlled form, live parameter preview (don’t block), guard heavy transforms with a worker thread.

\*\*Why:\*\* Edit and route without leaving the artifact.



---



\### 3.6 Status Bar (Bottom)



\* \*\*Usage meter:\*\* `$ used / $5` (amber at 80%, red at 100%).

\* \*\*Est next\*\* cost (updates while typing).

\* \*\*Latency\*\* (last generation).

\* \*\*MIDI Out\*\* (Armed/Muted) toggle.



\*\*Why:\*\* Budget and performance at a glance; no digging.



---



\## 4) “Think Harder” (Deeper Pass)



\*\*User-facing:\*\* A single button with a menu for depth (1/2/3 passes). Shows \*\*extra cost\*\*.

\*\*Under the hood:\*\*



1\. \*\*Planner\*\*: derive structure \& constraints.

2\. \*\*Generator\*\*: call Magenta with those constraints.

3\. \*\*Referee\*\* \*(if depth > 1)\*: score candidates → select best.

4\. Output MIDI with \*\*Hard\*\* badge; offer \*\*Compare\*\* (Normal vs Hard).



\*\*Why\*\*

When users want “better,” they want structure and coherence (voice leading, phrase length, motif). Harder adds that without forcing controls.



---



\## 5) Fallback Mode (When Magenta Fails)



\* \*\*Banner\*\*: “Generator degraded — using chat/edit tools. Some actions unavailable.”

\* Disabled generation buttons show a \*\*reason tooltip\*\* + \*\*Retry now\*\*.

\* Diagnostics modal: service statuses (OpenAI/Magenta), last error, next retry time.



\*\*Why\*\*

No dead ends. Don’t make them guess “is it me or you?” This saves support tickets.



---



\## 6) Auto-Send System (How to Look “Automatic” in VST3 Land)



\*\*Reality Check:\*\* VST3 plugins can’t universally create clips on arbitrary tracks. Hosts differ. So we layer routing strategies.



\### 6.1 Routing Tiers



1\. \*\*Base (works everywhere):\*\*



&nbsp;  \* \*\*Send to Current Track\*\* via VST3 \*\*event bus\*\*.

&nbsp;  \* If an instrument is on that track, it plays. This is the \*\*guarantee\*\*.



2\. \*\*Portable Auto-Send (recommended default):\*\*



&nbsp;  \* Create \*\*virtual MIDI ports per role\*\* via a helper (“Wingman Bridge”):



&nbsp;    \* \*\*Wingman Drums\*\*, \*\*Wingman Bass\*\*, \*\*Wingman Chords\*\*, \*\*Wingman Lead\*\*.

&nbsp;  \* User maps each port to a DAW track \*\*once\*\* (project template).

&nbsp;  \* Wingman emits to the \*\*role port\*\*; DAW routes to the corresponding track “automatically”.



&nbsp;  \*\*Platforms\*\*



&nbsp;  \* \*\*Windows:\*\* bundle signed UMDF virtual MIDI driver (or loopMIDI-style driver), wrap with RtMidi.

&nbsp;  \* \*\*macOS:\*\* CoreMIDI virtual sources; optionally auto-create IAC buses.



3\. \*\*Per-DAW optional helpers (power users)\*\*



&nbsp;  \* \*\*Ableton Live:\*\* Python Remote Script to arm tracks by name and drop clips.

&nbsp;  \* \*\*REAPER:\*\* ReaScript to insert items.

&nbsp;  \* \*\*Bitwig/Studio One/FL:\*\* templates with prewired inputs; APIs are limited.

&nbsp;  \* Wingman detects helper; uses it when present; otherwise sticks to virtual ports.



\*\*Why\*\*

We can’t rely on private APIs. Virtual ports are \*\*portable\*\* and \*\*predictable\*\*. Helpers are gravy.



---



\### 6.2 Who Decides to Send?



\* \*\*User\*\*: clicks \*\*Approve \& Send\*\* on the card.

\* \*\*AI\*\*: if \*\*Auto-send on high confidence\*\* is \*\*enabled\*\* and `confidence ≥ threshold` (default 0.80), Wingman \*\*auto-sends\*\*.



\*\*Safety:\*\* Toast: “\*\*Sent to ‘Keys’ (C-min, 4 bars). \[Undo]\*\*”



\* Undo (streaming): stop streaming and don’t resend.

\* Undo (helper clip): delete created item via helper.



\*\*Why\*\*

Fast flow for obvious wins; escape hatch for mistakes.



---



\### 6.3 Role Classifier (to pick destination)



\*\*Inputs\*\*



\* \*\*Prompt text\*\* clues (e.g., “808”, “hats”, “piano”, “pad”).

\* \*\*MIDI features\*\*:



&nbsp; \* Polyphony, note density, duration distribution, pitch range, drum map hits, velocity stats, 16th-grid regularity, syncopation.



\*\*Heuristic first (cheap, fast)\*\*



```ts

function classifyRole(f: Features): {role: Role, confidence: number} {

&nbsp; if (f.drumHitRate > 0.7 || (f.hat16thRate > 0.5 \&\& f.pitchVar < 0.2)) 

&nbsp;   return {role:'drums', confidence:0.9};

&nbsp; if (f.isMonophonic \&\& f.lowPitchShare > 0.65 \&\& f.avgNoteDur > 0.35)

&nbsp;   return {role:'bass', confidence:0.82};

&nbsp; if (f.polyphonyShare > 0.5 \&\& f.chordChangeRate > 0.1)

&nbsp;   return {role:'chords', confidence:0.78};

&nbsp; return {role:'lead', confidence:0.7};

}

```



\*\*Tiny ML fallback (optional)\*\*



\* Small logistic model or GPT-5-mini text pass if heuristics are indecisive.

\* Use only when needed (keeps cost negligible).



\*\*Why\*\*

80% of clips are obvious; don’t spend tokens unless you have to.



---



\## 7) Architecture (VST3 + React without CEF pain)



\*\*Plugin shell:\*\* \*\*JUCE 7\*\* (or iPlug2), VST3 target.

\*\*Editor UI:\*\* \*\*WebView2 (Win)\*\* / \*\*WKWebView (macOS)\*\* embedding your \*\*React\*\* app.

\*\*Standalone dev build:\*\* Electron is fine; reuse the React app.



\*\*Bridging (UI ↔ native)\*\*



\* \*\*Windows:\*\* `window.chrome.webview.postMessage` ↔ JUCE `WebBrowserComponent` handler.

\* \*\*macOS:\*\* `WKScriptMessageHandler`.

\* \*\*Message protocol:\*\* JSON (see below).



\*\*Hard rule:\*\* \*\*No heavy work on the audio thread.\*\* Use lock-free queues.

\*\*Preview synth:\*\* Native C++ synth (simple SFZ piano or tiny FM) that consumes a per-clip event buffer.



\*\*Why\*\*

CEF is heavy and brittle. WebView2/WKWebView are OS-blessed, smaller, faster. Native synth guarantees low latency and consistent sound.



---



\### 7.1 Message Protocol (types)



```ts

// UI -> Native

type UiToNative =

&nbsp; | { t:'PLAY', clipId:string }

&nbsp; | { t:'STOP' }

&nbsp; | { t:'SET\_TRANSPORT', tempo:number, key:string, tsig:'4/4'|'3/4'|'6/8' }

&nbsp; | { t:'RENDER\_MIDI', clip:MidiClip }                   // prepare preview

&nbsp; | { t:'SEND\_TO\_DAW', clipId:string, route:Dest }       // approve/auto

&nbsp; | { t:'SET\_ROUTING', role:Role, dest:Dest }

&nbsp; | { t:'PING\_STATUS' }

&nbsp; | { t:'SET\_FALLBACK', state:'online'|'degraded'|'offline' };



// Native -> UI

type NativeToUi =

&nbsp; | { t:'STATUS', fallback:'online'|'degraded'|'offline', latencyMs:number, midiOutArmed:boolean, helperAvailable:boolean }

&nbsp; | { t:'PLAYING', clipId:string }

&nbsp; | { t:'STOPPED' }

&nbsp; | { t:'ROUTING\_SAVED', ok:true }

&nbsp; | { t:'SENT', clipId:string, dest:Dest, undoAvailable:boolean }

&nbsp; | { t:'ERROR', code:string, msg:string };

```



\*\*Why\*\*

Explicit, typed messages are debuggable and testable. No guessing.



---



\### 7.2 Data Models (TS)



```ts

type Role = 'auto'|'drums'|'bass'|'chords'|'lead';



type Dest =

&nbsp; | { type:'currentTrack' }

&nbsp; | { type:'virtualPort', name:'Wingman Drums'|'Wingman Bass'|'Wingman Chords'|'Wingman Lead' }

&nbsp; | { type:'helperTrack', trackId:string, trackName:string };



type MidiClip = {

&nbsp; id: string;

&nbsp; name: string;

&nbsp; bars: number;

&nbsp; tempo: number;

&nbsp; key: string; // e.g., 'Cmin'

&nbsp; instrument: string;

&nbsp; midiUrl: string; // blob: URL for export/drag

&nbsp; previewPng?: string;

&nbsp; previewAudio?: string;

&nbsp; params: { swing:number; density:number; velMin:number; velMax:number; seed:number; };

&nbsp; source: 'normal'|'hard';

&nbsp; role: Role;

&nbsp; confidence: number;    // 0..1

};

```



---



\## 8) Cost \& Usage (How to be Honest)



\* Bottom meter: \*\*$ used / $5\*\* with a small progress bar.

\* Composer shows \*\*Est: ~$X (normal) • ~$Y (Harder)\*\*.



\*\*Estimator (config-driven):\*\*



```ts

est = (inTokens \* priceIn + outTokens \* priceOut) \* passes;

```



\* Load `priceIn/out` from a config endpoint so you can change pricing without a client update.

\* Disable \*\*Think Harder\*\* when est > remaining credit; show tooltip “Not enough credit.”



\*\*Why\*\*

Users hate surprise bills. Estimates keep trust high and churn low.



---



\## 9) State \& Persistence



\*\*Zustand store\*\*



```ts

ui: { drawerOpen:boolean; fallback:'online'|'degraded'|'offline'; },

transport: { playing:boolean; tempo:number; key:string; tsig:string; },

usage: { spent:number; cap:number; estNext:number; latencyMs:number; },

routing: { roleMap:Record<Role, Dest>; autoSend:boolean; threshold:number; helperAvailable:boolean; },

chat: { threadId:string; messages:Message\[]; },

clips: Record<string, MidiClip>;

```



\* Persist \*\*routing\*\*, \*\*threads\*\*, \*\*clips\*\* to project-scoped storage.

\* Don’t block UI on disk I/O; write behind.



\*\*Why\*\*

Project continuity matters more than global continuity for musicians.



---



\## 10) Visual System (Pro Clean)



\* \*\*Dark-first\*\* palette

&nbsp; `--bg:#0F1115`, `--panel:#171A22`, `--card:#1C2030`,

&nbsp; `--text:#E7ECF5`, `--muted:#94A0B8`, `--accent:#79A9FF`,

&nbsp; `--good:#3ECF8E`, `--warn:#FFC14D`, `--bad:#FF6B6B`

\* \*\*Type:\*\* Inter/SF 12/14/16/20/24; body 14–16.

\* \*\*Spacing:\*\* 8-pt grid; \*\*Radius:\*\* 12–16px; \*\*Shadows:\*\* subtle.

\* \*\*Icons:\*\* Lucide, single stroke.

\* \*\*Motion:\*\* 120ms hover scale 1.01 + 2px outer ring; 60 FPS playhead.



\*\*Why\*\*

Audio UIs live in the dark. Keep it legible, tasteful, and fast.



---



\## 11) Accessibility \& Keyboard



\* Hit targets ≥ 40px; visible focus ring everywhere.

\* Shortcuts: `/` focus composer • `Enter` send • `Shift+Enter` newline • `Space` Play/Pause

&nbsp; `1–4` chips • `Cmd/Ctrl+K` action palette • `Cmd/Ctrl+S` export.



\*\*Why\*\*

Pro users live on keyboards. Respect that.



---



\## 12) Performance Budgets



\* \*\*Generation:\*\* < 6s Normal, < 12s Hard.

\* \*\*Preview latency:\*\* < 60ms note-to-sound.

\* \*\*CPU:\*\* preview synth ≤ 3% idle, ≤ 8% during 4-bar loop.



\*\*Why\*\*

If it lags, they’ll mute you and never unmute.



---



\## 13) Error Handling \& Copy (Direct, Not Cute)



\* \*\*Fallback banner:\*\* “\*\*Generator degraded\*\* — using chat + edit tools. Some actions unavailable.”

\* \*\*Auto-send toast:\*\* “\*\*Sent to ‘Keys’. \[Undo]\*\*”

\* \*\*Not enough credit:\*\* “\*\*Not enough credit for Think Harder.\*\* Reduce depth or enable overages.”

\* \*\*Routing missing:\*\* “\*\*No destination mapped for ‘Chords’.\*\* Choose a track or use ‘Current Track’.”



\*\*Why\*\*

Tell the truth. Short and specific beats clever.



---



\## 14) Telemetry, Privacy, Security



\*\*Metrics (anonymized)\*\*



\* Time to first clip, % using Think Harder, variation rate, auto-send acceptance rate, undo rate, fallback frequency, average cost per session.



\*\*Logs\*\*



\* Structured: `ui.action`, `bridge.send`, `bridge.error`, `gen.start/end`, `autosend.fire`, `undo`.

\* Include project-local IDs, never raw MIDI content unless user opts in (debug).



\*\*Privacy\*\*



\* No prompts or MIDI leave the machine unless needed for generation.

\* \*\*Redact project names\*\* in logs.

\* Provide \*\*“Delete all local data for this project”\*\*.



\*\*Why\*\*

Pros care about IP and privacy. Don’t be sloppy.



---



\## 15) QA Matrix



\* \*\*Min size (720×520):\*\* composer visible, no overlaps.

\* \*\*Think Harder gating:\*\* correct at 0/80/100% credit.

\* \*\*Fallback:\*\* banner + disabled actions + Retry tooltips.

\* \*\*VST3 MIDI Out:\*\* Ableton, FL, REAPER, Bitwig (sanity pass each).

\* \*\*Virtual ports:\*\* created and persisted; error if driver/IAC unavailable with clear instructions.

\* \*\*Auto-send:\*\* honors threshold; Undo works (streaming + helper).

\* \*\*Export vs Drag:\*\* identical note data.

\* \*\*Shortcuts:\*\* no conflicts with common DAW binds (avoid global Ctrl+Space collisions).



---



\## 16) Release Plan \& Feature Flags



\* \*\*Flags\*\*



&nbsp; \* `autosend\_enabled`

&nbsp; \* `helper\_detection`

&nbsp; \* `think\_harder\_depth\_max`

&nbsp; \* `fallback\_ui\_enabled`

\* \*\*Phases\*\*



&nbsp; 1. Core UI + Normal gen + preview + export.

&nbsp; 2. Variations + transforms + usage meter.

&nbsp; 3. Routing (virtual ports) + Approve \& Send.

&nbsp; 4. Auto-send (threshold) + Think Harder.

&nbsp; 5. Helpers (Ableton/REAPER) + diagnostics polish.



\*\*Why\*\*

Ship value early. Keep risky bits behind flags.



---



\## 17) Rationale Cheatsheet (Design Choices)



\* \*\*Chat-first:\*\* Faster intent capture; less UI bloat; mirrors how producers request ideas.

\* \*\*No model names:\*\* Brand cohesion; avoid confusing users with model soup.

\* \*\*Portable routing:\*\* Works today in every DAW; helpers are optional power-ups.

\* \*\*Think Harder:\*\* Clear quality lever with explicit cost—user chooses.

\* \*\*Cost meter \& estimator:\*\* Builds trust; reduces churn \& refunds.

\* \*\*Inspector instead of modals:\*\* Keeps the decision context tight.



---



\## 18) Developer Notes (C++/React Pointers)



\*\*JUCE\*\*



\* Use `AudioProcessorEditor` to host `WebView2/WKWebView`.

\* Lock-free queue from UI thread to audio thread for play events.

\* Preview synth: simple SFZ with preloaded piano or a 2-op FM; sample-accurate scheduling.



\*\*React\*\*



\* Tailwind; component lib is your own; avoid blocking effects; use workers for heavy MIDI transforms.

\* Zustand store; selectors to keep rerenders cheap.

\* Canvas for piano-roll; requestAnimationFrame for playhead.



\*\*Cross-platform\*\*



\* Windows code-sign virtual MIDI driver; macOS uses CoreMIDI.

\* Keep all DAW helper integrations \*\*optional\*\* and sandboxed.



---



\## 19) Pseudo-code: Auto-Send Decision



```ts

function maybeAutoSend(clip: MidiClip, settings: Settings) {

&nbsp; if (!settings.autoSend) return;



&nbsp; const {role, confidence} = classifyRole(extractFeatures(clip));

&nbsp; clip.role = role;

&nbsp; clip.confidence = confidence;



&nbsp; if (confidence >= settings.threshold) {

&nbsp;   const dest = resolveDestForRole(role, settings.routing);

&nbsp;   if (dest) {

&nbsp;     bridge.send({t:'SEND\_TO\_DAW', clipId: clip.id, route: dest});

&nbsp;     toast(`Sent to '${destName(dest)}'`, {undo: () => undoSend(clip, dest)});

&nbsp;   }

&nbsp; } else {

&nbsp;   // Soft nudge: show recommendation row on the card

&nbsp;   showRecommendation(clip, role, confidence);

&nbsp; }

}

```



---



\## 20) Copy Blocks (i18n-ready)



\* \*\*Empty:\*\* “\*\*Make your first clip.\*\*”

&nbsp; CTAs: \*\*Generate Drums\*\* • \*\*Generate Chords\*\* • \*\*Import MIDI\*\*

&nbsp; Prompts: “Lo-fi 4-bar C-min @80”, “16th hats with rolls”.

\* \*\*Fallback:\*\* “\*\*Generator degraded.\*\* Some actions are disabled. We’ll retry.”

\* \*\*Credit:\*\* “\*\*$3.86 of $5 used.\*\*”

\* \*\*Not enough credit:\*\* “\*\*Not enough credit for Think Harder.\*\* Reduce depth or enable overages.”

\* \*\*Routing needed:\*\* “\*\*Map a destination for ‘Chords’.\*\* Choose a track or use Current Track.”



---



\## 21) Open Questions / Risks



\* \*\*Windows virtual MIDI driver:\*\* ship our own or require a third-party (loopMIDI-style)?

\* \*\*Live auto-send vs clip create:\*\* some DAWs won’t accept programmatic clip creation without scripting. Are we OK with live-stream only?

\* \*\*Latency variability:\*\* what’s acceptable for preview on low-end machines?

\* \*\*Overages:\*\* do we allow paid overages beyond $5? If yes, UX needs a toggle + warning.



---



\## 22) Future Work



\* \*\*AU build\*\* for Logic (same architecture, different wrapper).

\* \*\*Style lockers\*\* (e.g., “stay in Dorian”, “no parallel 5ths”).

\* \*\*Arrangement primitives\*\* (AABA, intro/verse/chorus).

\* \*\*In-DAW item placement\*\* via deeper helper integrations.

\* \*\*Collaboration\*\*: shareable prompts + results.



---



\## 23) 5-Day Build Plan (Focused)



\* \*\*Day 1:\*\* App shell (TopBar, StatusBar, Composer), suggestion chips, empty state.

\* \*\*Day 2:\*\* ResultCard (piano-roll + native preview synth), Insert/Download.

\* \*\*Day 3:\*\* Routing: virtual role ports + Settings; Approve \& Send; toast + Undo; role heuristic classifier.

\* \*\*Day 4:\*\* Think Harder pipeline + estimator + usage meter + gating; threshold + auto-send.

\* \*\*Day 5:\*\* Fallback banner/diagnostics; Inspector transforms; polish (icons, spacing, tooltips); VST3 smoke tests (Ableton/FL/REAPER/Bitwig).



---



\### Final word



Keep it \*\*fast\*\*, \*\*predictable\*\*, and \*\*honest\*\*. Wingman succeeds if users can go from prompt → \*\*finished MIDI in their track\*\* in \*\*under 10 seconds\*\* without touching a menu.



