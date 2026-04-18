const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const PLAYERS = [
  {
    name: "Bruno Fernandes",
    position: "Midfielder",
    number: 8,
    nationality: "Portugal",
    age: 31,
    highlights:
      "Club captain. 6 goals, 12 assists in 23 appearances this season. Creative engine of the team. Consistently the highest contributor in goals and assists since joining in January 2020. PL assists leader multiple seasons.",
  },
  {
    name: "Bryan Mbeumo",
    position: "Forward",
    number: 19,
    nationality: "Cameroon",
    age: 26,
    highlights:
      "Team's top scorer this season with 9 goals in 21 appearances. Signed from Brentford where he was one of the Premier League's most lethal forwards. Pace, finishing, and intelligent movement.",
  },
  {
    name: "Benjamin Sesko",
    position: "Forward",
    number: 30,
    nationality: "Slovenia",
    age: 22,
    highlights:
      "6 goals in 21 appearances. One of Europe's most coveted young strikers, signed from RB Leipzig. 6'5\" with pace, power, and elite finishing ability. Huge upside at just 22.",
  },
  {
    name: "Matheus Cunha",
    position: "Forward",
    number: 10,
    nationality: "Brazil",
    age: 26,
    highlights:
      "6 goals and 2 assists in 23 appearances. Wears the iconic #10. Versatile attacker who can play across the front line. Brazilian flair combined with Premier League physicality. Signed from Wolves.",
  },
  {
    name: "Kobbie Mainoo",
    position: "Midfielder",
    number: 37,
    nationality: "England",
    age: 20,
    highlights:
      "Homegrown academy star. 2 assists in 17 appearances. Broke into the first team at 18 and became an England international. Composed beyond his years, elegant on the ball, strong in the tackle. The future of Man United's midfield.",
  },
  {
    name: "Lisandro Martínez",
    position: "Defender",
    number: 6,
    nationality: "Argentina",
    age: 28,
    highlights:
      "World Cup winner with Argentina (2022). 14 appearances this season. Nicknamed 'The Butcher' for his aggressive defending. Exceptional ball-playing ability from centre-back. Leader and warrior in the backline.",
  },
  {
    name: "Leny Yoro",
    position: "Defender",
    number: 15,
    nationality: "France",
    age: 20,
    highlights:
      "23 appearances this season. Signed from Lille as one of the most sought-after young defenders in world football. 6'3\", composed, excellent reader of the game. Tipped to be a generational centre-back.",
  },
  {
    name: "Patrick Dorgu",
    position: "Defender",
    number: 13,
    nationality: "Denmark",
    age: 21,
    highlights:
      "3 goals in 22 appearances as a defender. Dynamic wing-back/full-back signed from Lecce. Explosive pace, powerful runs from deep, and genuine goal threat from the backline. Denmark international.",
  },
  {
    name: "Amad Diallo",
    position: "Forward",
    number: 16,
    nationality: "Ivory Coast",
    age: 23,
    highlights:
      "2 goals and 2 assists in 20 appearances. Breakthrough star of the previous season with crucial late goals. Tricky winger with dribbling ability, vision, and big-game mentality. Fan favourite at Old Trafford.",
  },
  {
    name: "Casemiro",
    position: "Midfielder",
    number: 18,
    nationality: "Brazil",
    age: 33,
    highlights:
      "5 goals in 24 appearances. 5x Champions League winner with Real Madrid. Brings world-class experience and leadership. Reinvented himself this season with consistent performances. The most decorated player in the squad.",
  },
];

const MODEL = "gemini-2.0-flash";

async function callAgent(systemPrompt, userPrompt) {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContent(userPrompt);
  return result.response.text();
}

// ── Phase 1: Opening Arguments ──────────────────────────────────────────────

async function runOpeningArguments() {
  console.log("\n═══ PHASE 1: OPENING ARGUMENTS ═══\n");

  const promises = PLAYERS.map((p) => {
    const system = `You are a passionate Manchester United fan and football analyst assigned to argue that ${p.name} is the best and most important player in the current Manchester United squad (2025-26 season). Make the strongest possible case using their stats, qualities, impact on results, and what they bring to the team. Be persuasive, specific, and bold. Keep your argument under 400 words.`;
    const user = `Make your opening argument for why ${p.name} (#${p.number}, ${p.position}, age ${p.age}, ${p.nationality}) is the best player in the current Man United squad.\n\nKey facts: ${p.highlights}\n\nPresent your case with conviction. Explain why this player is more valuable than anyone else at Old Trafford right now.`;

    console.log(`  → Agent for ${p.name} starting...`);
    return callAgent(system, user).then((text) => {
      console.log(`  ✓ ${p.name} argument complete`);
      return { player: p.name, argument: text };
    });
  });

  return Promise.all(promises);
}

// ── Phase 2: Rebuttals ──────────────────────────────────────────────────────

async function runRebuttalRound(roundNum, openingArgs, previousRebuttals) {
  console.log(`\n═══ PHASE 2: REBUTTAL ROUND ${roundNum} ═══\n`);

  const prevRebuttalSummary =
    previousRebuttals.length > 0
      ? "\n\nPrevious rebuttals:\n" +
        previousRebuttals
          .map((r) => `**${r.player}**: ${r.rebuttal}`)
          .join("\n\n---\n\n")
      : "";

  const promises = PLAYERS.map((p) => {
    const otherArgs = openingArgs
      .filter((a) => a.player !== p.name)
      .map((a) => `**${a.player}**: ${a.argument}`)
      .join("\n\n---\n\n");

    const system = `You are a passionate Manchester United fan advocating for ${p.name} as the best player in the current squad. You are in rebuttal round ${roundNum}. Defend your player against competing arguments and expose weaknesses in other candidates' cases. Be sharp, specific, and persuasive. Keep your rebuttal under 350 words.`;

    const user = `Here are the other 9 agents' arguments:\n\n${otherArgs}${prevRebuttalSummary}\n\nDeliver your rebuttal. Defend ${p.name} and counter the strongest competing cases. Why do the other arguments fall short?`;

    console.log(`  → ${p.name} rebuttal round ${roundNum} starting...`);
    return callAgent(system, user).then((text) => {
      console.log(`  ✓ ${p.name} rebuttal round ${roundNum} complete`);
      return { player: p.name, round: roundNum, rebuttal: text };
    });
  });

  return Promise.all(promises);
}

// ── Phase 3: Judge ──────────────────────────────────────────────────────────

async function runJudge(openingArgs, rebuttalRound1, rebuttalRound2) {
  console.log("\n═══ PHASE 3: JUDGE EVALUATION ═══\n");

  const openingSummary = openingArgs
    .map((a) => `### ${a.player} — Opening Argument\n${a.argument}`)
    .join("\n\n");

  const rebuttal1Summary = rebuttalRound1
    .map((r) => `### ${r.player} — Rebuttal Round 1\n${r.rebuttal}`)
    .join("\n\n");

  const rebuttal2Summary = rebuttalRound2
    .map((r) => `### ${r.player} — Rebuttal Round 2\n${r.rebuttal}`)
    .join("\n\n");

  const system = `You are an impartial, expert football analyst and judge presiding over a debate to determine the best player in Manchester United's current 2025-26 squad. Evaluate all arguments and rebuttals fairly, considering: current form and stats, overall quality, importance to the team system, leadership, consistency, and how well each advocate argued their case.

You MUST respond with valid JSON only — no markdown, no code fences, no extra text. Return this exact structure:
{
  "rankings": [
    { "rank": 1, "player": "Name", "reasoning": "..." },
    ...
  ],
  "mvp_declaration": "...",
  "debate_summary": "..."
}`;

  const user = `Here is the complete debate transcript. Evaluate all arguments and produce your final ranking of the best player in the current Man United squad.

## OPENING ARGUMENTS

${openingSummary}

## REBUTTAL ROUND 1

${rebuttal1Summary}

## REBUTTAL ROUND 2

${rebuttal2Summary}

Now produce your final 1-10 ranking with detailed reasoning for each player's placement, an MVP declaration, and overall debate summary.`;

  console.log("  → Judge evaluating all arguments...");
  const result = await callAgent(system, user);
  console.log("  ✓ Judge evaluation complete");

  try {
    return JSON.parse(result);
  } catch {
    const match = result.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Judge did not return valid JSON: " + result.slice(0, 200));
  }
}

// ── Dashboard HTML Generator ────────────────────────────────────────────────

function generateDashboard(openingArgs, rebuttalRound1, rebuttalRound2, judgeResult) {
  const debateData = JSON.stringify(
    { openingArgs, rebuttalRound1, rebuttalRound2, judgeResult },
    null,
    2
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Man United Best Player Debate</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #1a1016;
    --surface2: #2a1a22;
    --border: #3d2030;
    --text: #f0e6ea;
    --text-dim: #9a8690;
    --accent: #da291c;
    --accent-glow: rgba(218, 41, 28, 0.3);
    --gold: #ffd700;
    --silver: #c0c0c0;
    --bronze: #cd7f32;
    --green: #00b894;
    --mufc-red: #da291c;
    --mufc-yellow: #fbe122;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
    min-height: 100vh;
  }

  .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

  /* ── Hero ── */
  .hero {
    text-align: center;
    padding: 80px 24px 60px;
    background: linear-gradient(180deg, rgba(218,41,28,0.2) 0%, transparent 100%);
    border-bottom: 1px solid var(--border);
  }
  .hero-label {
    text-transform: uppercase;
    font-size: 13px;
    letter-spacing: 3px;
    color: var(--mufc-red);
    font-weight: 600;
    margin-bottom: 12px;
  }
  .hero h1 {
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 800;
    margin-bottom: 8px;
    background: linear-gradient(135deg, var(--mufc-red), #ff4444);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero .subtitle {
    font-size: 1.2rem;
    color: var(--text-dim);
    max-width: 700px;
    margin: 16px auto 0;
  }
  .crest { font-size: 4rem; margin-bottom: 16px; display: block; }
  .hero-badge {
    display: inline-block;
    margin-top: 20px;
    padding: 8px 20px;
    background: var(--mufc-red);
    color: white;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1px;
  }

  /* ── Nav tabs ── */
  .tabs {
    display: flex;
    gap: 4px;
    padding: 16px 0;
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
    justify-content: center;
    flex-wrap: wrap;
  }
  .tab {
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-dim);
    background: transparent;
    border: 1px solid transparent;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .tab:hover { color: var(--text); background: var(--surface); }
  .tab.active {
    color: var(--mufc-red);
    background: var(--surface);
    border-color: var(--mufc-red);
  }

  .panel { display: none; padding: 32px 0; }
  .panel.active { display: block; }

  /* ── Rankings ── */
  .ranking-card {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    padding: 24px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    margin-bottom: 12px;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .ranking-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }
  .rank-badge {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 1.2rem;
    background: var(--surface2);
    color: var(--text-dim);
  }
  .rank-1 .rank-badge { background: linear-gradient(135deg, #ffd700, #f39c12); color: #000; box-shadow: 0 0 20px rgba(255,215,0,0.4); }
  .rank-2 .rank-badge { background: linear-gradient(135deg, #c0c0c0, #95a5a6); color: #000; }
  .rank-3 .rank-badge { background: linear-gradient(135deg, #cd7f32, #d35400); color: #fff; }
  .rank-info { flex: 1; }
  .rank-info h3 { font-size: 1.25rem; margin-bottom: 6px; }
  .rank-info p { color: var(--text-dim); font-size: 0.95rem; }

  /* ── Argument cards ── */
  .arg-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    margin-bottom: 12px;
    overflow: hidden;
  }
  .arg-header {
    padding: 18px 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
    font-size: 1.05rem;
    user-select: none;
    transition: background 0.15s;
  }
  .arg-header:hover { background: var(--surface2); }
  .arg-chevron {
    transition: transform 0.2s;
    color: var(--text-dim);
    font-size: 1.2rem;
  }
  .arg-card.open .arg-chevron { transform: rotate(180deg); }
  .arg-body {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s ease;
  }
  .arg-card.open .arg-body { max-height: 3000px; }
  .arg-content {
    padding: 0 24px 24px;
    color: var(--text-dim);
    white-space: pre-wrap;
    font-size: 0.95rem;
    line-height: 1.7;
  }

  /* ── Rebuttal thread ── */
  .rebuttal-group { margin-bottom: 32px; }
  .rebuttal-group h3 {
    font-size: 1.1rem;
    margin-bottom: 12px;
    color: var(--mufc-red);
  }
  .rebuttal-entry {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 20px 24px;
    margin-bottom: 8px;
  }
  .rebuttal-entry .round-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text-dim);
    margin-bottom: 8px;
  }
  .rebuttal-entry .rebuttal-text {
    white-space: pre-wrap;
    color: var(--text-dim);
    font-size: 0.93rem;
    line-height: 1.7;
  }

  /* ── Timeline ── */
  .timeline { position: relative; padding-left: 40px; }
  .timeline::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--border);
  }
  .timeline-item {
    position: relative;
    margin-bottom: 32px;
  }
  .timeline-dot {
    position: absolute;
    left: -33px;
    top: 4px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--mufc-red);
    border: 3px solid var(--bg);
    box-shadow: 0 0 0 2px var(--mufc-red);
  }
  .timeline-item.phase-end .timeline-dot { background: var(--green); box-shadow: 0 0 0 2px var(--green); }
  .timeline-phase {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--mufc-red);
    margin-bottom: 4px;
    font-weight: 600;
  }
  .timeline-title { font-weight: 600; margin-bottom: 4px; }
  .timeline-desc { color: var(--text-dim); font-size: 0.9rem; }

  /* ── Declaration box ── */
  .declaration {
    background: linear-gradient(135deg, rgba(218,41,28,0.1), rgba(255,215,0,0.1));
    border: 1px solid var(--mufc-red);
    border-radius: 16px;
    padding: 32px;
    text-align: center;
    margin: 32px 0;
  }
  .declaration h3 {
    color: var(--gold);
    font-size: 1.3rem;
    margin-bottom: 12px;
  }
  .declaration p {
    color: var(--text-dim);
    max-width: 800px;
    margin: 0 auto;
    font-size: 1rem;
    line-height: 1.7;
  }

  /* ── Summary ── */
  .summary-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 28px;
    margin-top: 20px;
    color: var(--text-dim);
    line-height: 1.8;
    white-space: pre-wrap;
  }

  /* ── Footer ── */
  footer {
    text-align: center;
    padding: 40px 24px;
    color: var(--text-dim);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 60px;
  }
</style>
</head>
<body>

<script>
const DATA = ${debateData};
</script>

<div class="hero">
  <span class="crest">&#9917;</span>
  <div class="hero-label">Manchester United 2025-26 &mdash; Best Player Debate</div>
  <h1 id="hero-name"></h1>
  <p class="subtitle" id="hero-declaration"></p>
  <div class="hero-badge">SQUAD MVP</div>
</div>

<div class="container">
  <div class="tabs" id="tabs">
    <div class="tab active" data-panel="rankings">Final Rankings</div>
    <div class="tab" data-panel="opening">Opening Arguments</div>
    <div class="tab" data-panel="rebuttals">Rebuttals</div>
    <div class="tab" data-panel="timeline">Debate Timeline</div>
  </div>

  <div class="panel active" id="panel-rankings">
    <div id="rankings-list"></div>
    <div class="declaration" id="declaration-box"></div>
    <div class="summary-box" id="summary-box"></div>
  </div>

  <div class="panel" id="panel-opening">
    <div id="opening-list"></div>
  </div>

  <div class="panel" id="panel-rebuttals">
    <h2 style="margin-bottom: 24px;">Rebuttal Rounds</h2>
    <div id="rebuttals-list"></div>
  </div>

  <div class="panel" id="panel-timeline">
    <div class="timeline" id="timeline"></div>
  </div>
</div>

<footer>
  Man United Best Player Debate &mdash; Powered by Gemini AI Multi-Agent System
</footer>

<script>
(function() {
  const { openingArgs, rebuttalRound1, rebuttalRound2, judgeResult } = DATA;

  const winner = judgeResult.rankings[0];
  document.getElementById('hero-name').textContent = winner.player;
  document.getElementById('hero-declaration').textContent = judgeResult.mvp_declaration;

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-' + tab.dataset.panel).classList.add('active');
    });
  });

  const rankingsEl = document.getElementById('rankings-list');
  judgeResult.rankings.forEach(r => {
    const card = document.createElement('div');
    card.className = 'ranking-card rank-' + r.rank;
    card.innerHTML =
      '<div class="rank-badge">' + r.rank + '</div>' +
      '<div class="rank-info"><h3>' + escHtml(r.player) + '</h3><p>' + escHtml(r.reasoning) + '</p></div>';
    rankingsEl.appendChild(card);
  });

  const declBox = document.getElementById('declaration-box');
  declBox.innerHTML = '<h3>MVP Declaration</h3><p>' + escHtml(judgeResult.mvp_declaration) + '</p>';
  document.getElementById('summary-box').textContent = judgeResult.debate_summary;

  const openingEl = document.getElementById('opening-list');
  openingArgs.forEach(a => {
    const card = document.createElement('div');
    card.className = 'arg-card';
    card.innerHTML =
      '<div class="arg-header"><span>' + escHtml(a.player) + '</span><span class="arg-chevron">&#x25BC;</span></div>' +
      '<div class="arg-body"><div class="arg-content">' + escHtml(a.argument) + '</div></div>';
    card.querySelector('.arg-header').addEventListener('click', () => card.classList.toggle('open'));
    openingEl.appendChild(card);
  });

  const rebuttalsEl = document.getElementById('rebuttals-list');
  const players = [...new Set(rebuttalRound1.map(r => r.player))];
  players.forEach(player => {
    const group = document.createElement('div');
    group.className = 'rebuttal-group';
    const r1 = rebuttalRound1.find(r => r.player === player);
    const r2 = rebuttalRound2.find(r => r.player === player);
    let inner = '<h3>' + escHtml(player) + '</h3>';
    if (r1) inner += '<div class="rebuttal-entry"><div class="round-label">Round 1 Rebuttal</div><div class="rebuttal-text">' + escHtml(r1.rebuttal) + '</div></div>';
    if (r2) inner += '<div class="rebuttal-entry"><div class="round-label">Round 2 Rebuttal</div><div class="rebuttal-text">' + escHtml(r2.rebuttal) + '</div></div>';
    group.innerHTML = inner;
    rebuttalsEl.appendChild(group);
  });

  const timelineEl = document.getElementById('timeline');
  const items = [];
  items.push({ phase: 'Phase 1', title: 'Opening Arguments Begin', desc: '10 AI agents each advocate for their assigned Man United player.', end: false });
  openingArgs.forEach(a => {
    items.push({ phase: 'Phase 1', title: a.player + ' presents case', desc: a.argument.slice(0, 120) + '...', end: false });
  });
  items.push({ phase: 'Phase 1', title: 'Opening Arguments Complete', desc: 'All 10 agents have presented their cases.', end: true });
  items.push({ phase: 'Phase 2', title: 'Rebuttal Round 1 Begins', desc: 'Agents respond to competing arguments.', end: false });
  items.push({ phase: 'Phase 2', title: 'Rebuttal Round 1 Complete', desc: 'All agents delivered first rebuttals.', end: true });
  items.push({ phase: 'Phase 2', title: 'Rebuttal Round 2 Begins', desc: 'Final round of counterarguments.', end: false });
  items.push({ phase: 'Phase 2', title: 'Rebuttal Round 2 Complete', desc: 'All rebuttals delivered.', end: true });
  items.push({ phase: 'Phase 3', title: 'Judge Evaluation', desc: 'Impartial judge reviews all arguments and rebuttals.', end: false });
  items.push({ phase: 'Phase 3', title: winner.player + ' declared MVP', desc: (judgeResult.mvp_declaration || '').slice(0, 150) + '...', end: true });

  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'timeline-item' + (item.end ? ' phase-end' : '');
    el.innerHTML =
      '<div class="timeline-dot"></div>' +
      '<div class="timeline-phase">' + escHtml(item.phase) + '</div>' +
      '<div class="timeline-title">' + escHtml(item.title) + '</div>' +
      '<div class="timeline-desc">' + escHtml(item.desc) + '</div>';
    timelineEl.appendChild(el);
  });

  function escHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
</script>
</body>
</html>`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║  Man United Best Player Debate — Multi-Agent System ║");
  console.log("╚══════════════════════════════════════════════════════╝");

  const startTime = Date.now();

  const openingArgs = await runOpeningArguments();
  const rebuttalRound1 = await runRebuttalRound(1, openingArgs, []);
  const rebuttalRound2 = await runRebuttalRound(2, openingArgs, rebuttalRound1);
  const judgeResult = await runJudge(openingArgs, rebuttalRound1, rebuttalRound2);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n══ Debate complete in ${elapsed}s ══\n`);

  console.log("FINAL RANKINGS:");
  judgeResult.rankings.forEach((r) => {
    console.log(`  #${r.rank} ${r.player}`);
  });
  console.log(`\nMVP: ${judgeResult.rankings[0].player}`);

  const html = generateDashboard(openingArgs, rebuttalRound1, rebuttalRound2, judgeResult);
  const outPath = path.join(__dirname, "dashboard-mufc.html");
  fs.writeFileSync(outPath, html, "utf-8");
  console.log(`\nDashboard written to: ${outPath}`);
  console.log("Open dashboard-mufc.html in your browser to view results.");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
