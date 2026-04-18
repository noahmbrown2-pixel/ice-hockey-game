const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const DINOSAURS = [
  {
    name: "Tyrannosaurus Rex",
    nickname: "T-Rex",
    era: "Late Cretaceous (68–66 MYA)",
    highlights:
      "The apex predator. Up to 40 feet long, 9 tons. Bite force of 12,800 pounds — strongest of any land animal ever. Could crush bone. Binocular vision for depth perception. Surprisingly fast for its size at ~25 mph. Built to kill large prey.",
  },
  {
    name: "Spinosaurus",
    nickname: "Spino",
    era: "Mid Cretaceous (99–93 MYA)",
    highlights:
      "Largest carnivorous dinosaur ever — up to 50 feet long, 7-9 tons. Massive sail on its back for intimidation/thermoregulation. Semi-aquatic hunter with crocodile-like jaws. Long arms with massive claws. Could fight on land and water.",
  },
  {
    name: "Velociraptor",
    nickname: "Raptor",
    era: "Late Cretaceous (75–71 MYA)",
    highlights:
      "Highly intelligent pack hunter. 6 feet long, ~33 lbs. Deadly 3-inch retractable sickle claw on each foot. Feathered, extremely agile and fast (~40 mph). Hunted in coordinated groups. Big brain-to-body ratio. The assassin of the dinosaur world.",
  },
  {
    name: "Triceratops",
    nickname: "Trike",
    era: "Late Cretaceous (68–66 MYA)",
    highlights:
      "30 feet long, up to 12 tons. Three horns — two brow horns up to 3 feet long. Massive bone frill as shield. Built like a tank. Known to have fought T-Rex (fossil evidence of healed horn wounds on T-Rex bones). The ultimate defensive fighter.",
  },
  {
    name: "Ankylosaurus",
    nickname: "Anky",
    era: "Late Cretaceous (68–66 MYA)",
    highlights:
      "Living tank. 20 feet long, 8 tons. Entire body covered in bony armor plates (osteoderms). Massive club tail that could shatter bones — estimated to deliver 5,000+ N of force. Even T-Rex struggled to bite through its armor. Low center of gravity, nearly impossible to flip.",
  },
  {
    name: "Giganotosaurus",
    nickname: "Giga",
    era: "Late Cretaceous (99–95 MYA)",
    highlights:
      "43 feet long, 6-8 tons. Larger than T-Rex in length. Powerful slashing bite designed to cause bleeding wounds. Fast runner at ~30 mph. Hunted massive sauropods like Argentinosaurus — possibly in packs. The South American apex predator.",
  },
  {
    name: "Utahraptor",
    nickname: "Utah",
    era: "Early Cretaceous (139–134 MYA)",
    highlights:
      "The giant raptor. 20 feet long, 1,100 lbs. 9-inch sickle claw — a disemboweling machine. Combined the intelligence and agility of raptors with serious size and power. Could take down prey many times its size. The perfect predator design.",
  },
  {
    name: "Therizinosaurus",
    nickname: "Scythe Lizard",
    era: "Late Cretaceous (70 MYA)",
    highlights:
      "33 feet long, 5 tons. Possessed the longest claws of any animal EVER — 3-foot-long scythe-like claws. Though primarily herbivorous, those claws were devastating defensive weapons that could disembowel any attacker. Bizarre but deadly.",
  },
  {
    name: "Carnotaurus",
    nickname: "Carno",
    era: "Late Cretaceous (72–69 MYA)",
    highlights:
      "26 feet long, 1.5 tons. The fastest large theropod — estimated 35+ mph sprint speed. Bull-like horns above the eyes for ramming. Extremely powerful tail muscles for explosive acceleration. A hit-and-run specialist. Tiny arms but devastating head-first attacks.",
  },
  {
    name: "Stegosaurus",
    nickname: "Stego",
    era: "Late Jurassic (155–150 MYA)",
    highlights:
      "30 feet long, 5 tons. Iconic back plates and deadly thagomizer tail — four tail spikes up to 3 feet long. Fossil evidence shows thagomizer punctured Allosaurus bones. Powerful tail swing could be lethal. Survived for millions of years as a proven battle design.",
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

  const promises = DINOSAURS.map((d) => {
    const system = `You are a passionate paleontologist and dinosaur combat analyst assigned to argue that ${d.name} (${d.nickname}) would win a 10-dinosaur battle royale free-for-all. Use real paleontological facts about anatomy, bite force, speed, armor, weapons, intelligence, and fighting strategy. Be persuasive, vivid, and bold. Keep your argument under 400 words.`;
    const user = `Make your opening argument for why ${d.name} ("${d.nickname}") from the ${d.era} would be the last dinosaur standing in a battle royale.\n\nKey facts: ${d.highlights}\n\nExplain your dinosaur's combat advantages, fighting strategy, and why it would defeat all 9 opponents. Be specific about matchups.`;

    console.log(`  → Agent for ${d.nickname} starting...`);
    return callAgent(system, user).then((text) => {
      console.log(`  ✓ ${d.nickname} argument complete`);
      return { player: d.name, argument: text };
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

  const promises = DINOSAURS.map((d) => {
    const otherArgs = openingArgs
      .filter((a) => a.player !== d.name)
      .map((a) => `**${a.player}**: ${a.argument}`)
      .join("\n\n---\n\n");

    const system = `You are a paleontologist advocating for ${d.name} (${d.nickname}) in a dinosaur battle royale debate. You are in rebuttal round ${roundNum}. Counter the other dinosaurs' claimed advantages with real paleontological facts. Expose weaknesses in their anatomy and fighting ability. Be sharp and scientific but entertaining. Keep your rebuttal under 350 words.`;

    const user = `Here are the other 9 agents' arguments:\n\n${otherArgs}${prevRebuttalSummary}\n\nDeliver your rebuttal. Defend ${d.name} and tear apart the competition. Why would the other dinosaurs lose to yours?`;

    console.log(`  → ${d.nickname} rebuttal round ${roundNum} starting...`);
    return callAgent(system, user).then((text) => {
      console.log(`  ✓ ${d.nickname} rebuttal round ${roundNum} complete`);
      return { player: d.name, round: roundNum, rebuttal: text };
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

  const system = `You are an impartial expert paleontologist and combat analyst judging a dinosaur battle royale debate. Evaluate all arguments based on: real anatomical advantages, offensive weapons, defensive capabilities, speed/agility, intelligence, size, stamina, and how well each advocate made their case. This is a free-for-all — consider alliance potential, threat assessment, and who other dinos would target first.

You MUST respond with valid JSON only — no markdown, no code fences, no extra text. Return this exact structure:
{
  "rankings": [
    { "rank": 1, "player": "Full Dinosaur Name", "reasoning": "..." },
    ...
  ],
  "champion_declaration": "...",
  "battle_narrative": "..."
}

The battle_narrative should be a vivid 3-4 sentence story of how the battle royale plays out and who falls when.`;

  const user = `Here is the complete debate transcript. Evaluate all arguments and determine the battle royale winner.

## OPENING ARGUMENTS

${openingSummary}

## REBUTTAL ROUND 1

${rebuttal1Summary}

## REBUTTAL ROUND 2

${rebuttal2Summary}

Produce your final 1-10 ranking with reasoning, a champion declaration, and a vivid battle narrative.`;

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

  const dinoEmojis = {
    "Tyrannosaurus Rex": "\uD83E\uDD96",
    "Spinosaurus": "\uD83D\uDC0A",
    "Velociraptor": "\uD83E\uDD96",
    "Triceratops": "\uD83E\uDD95",
    "Ankylosaurus": "\uD83D\uDEE1\uFE0F",
    "Giganotosaurus": "\uD83E\uDD96",
    "Utahraptor": "\uD83D\uDDE1\uFE0F",
    "Therizinosaurus": "\u2694\uFE0F",
    "Carnotaurus": "\uD83D\uDC02",
    "Stegosaurus": "\uD83E\uDD95",
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dinosaur Battle Royale</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #090b0a;
    --surface: #121a14;
    --surface2: #1a2a1e;
    --border: #2a3d2e;
    --text: #e8f0ea;
    --text-dim: #7a9a80;
    --accent: #4ade80;
    --accent-dark: #22803d;
    --gold: #ffd700;
    --silver: #c0c0c0;
    --bronze: #cd7f32;
    --blood: #dc2626;
    --fire: #f97316;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
    min-height: 100vh;
  }

  .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

  .hero {
    text-align: center;
    padding: 80px 24px 60px;
    background:
      radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.12) 0%, transparent 60%),
      linear-gradient(180deg, rgba(34,128,61,0.15) 0%, transparent 100%);
    border-bottom: 1px solid var(--border);
  }
  .hero-icon { font-size: 5rem; margin-bottom: 16px; display: block; }
  .hero-label {
    text-transform: uppercase;
    font-size: 13px;
    letter-spacing: 4px;
    color: var(--blood);
    font-weight: 700;
    margin-bottom: 12px;
  }
  .hero h1 {
    font-size: clamp(2.2rem, 6vw, 3.8rem);
    font-weight: 800;
    margin-bottom: 8px;
    background: linear-gradient(135deg, var(--accent), #16a34a);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero .subtitle {
    font-size: 1.15rem;
    color: var(--text-dim);
    max-width: 750px;
    margin: 16px auto 0;
  }
  .hero-badge {
    display: inline-block;
    margin-top: 20px;
    padding: 8px 20px;
    background: linear-gradient(135deg, var(--blood), #991b1b);
    color: white;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  /* ── Battle Narrative ── */
  .narrative-box {
    background: linear-gradient(135deg, rgba(220,38,38,0.08), rgba(249,115,22,0.08));
    border: 1px solid var(--blood);
    border-radius: 16px;
    padding: 32px;
    margin: 32px 0;
    text-align: center;
  }
  .narrative-box h3 {
    color: var(--fire);
    font-size: 1.3rem;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 2px;
  }
  .narrative-box p {
    color: var(--text-dim);
    max-width: 800px;
    margin: 0 auto;
    font-size: 1.05rem;
    line-height: 1.8;
    font-style: italic;
  }

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
  .tab.active { color: var(--accent); background: var(--surface); border-color: var(--accent); }

  .panel { display: none; padding: 32px 0; }
  .panel.active { display: block; }

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
  .ranking-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
  .rank-badge {
    flex-shrink: 0;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 1.3rem;
    background: var(--surface2);
    color: var(--text-dim);
  }
  .rank-1 .rank-badge { background: linear-gradient(135deg, #ffd700, #b8860b); color: #000; box-shadow: 0 0 24px rgba(255,215,0,0.5); font-size: 1.5rem; }
  .rank-2 .rank-badge { background: linear-gradient(135deg, #c0c0c0, #808080); color: #000; }
  .rank-3 .rank-badge { background: linear-gradient(135deg, #cd7f32, #8b4513); color: #fff; }
  .rank-info { flex: 1; }
  .rank-info h3 { font-size: 1.25rem; margin-bottom: 6px; }
  .rank-info .dino-emoji { margin-right: 8px; }
  .rank-info p { color: var(--text-dim); font-size: 0.95rem; }
  .eliminated { display: inline-block; margin-left: 8px; font-size: 11px; padding: 2px 8px; background: rgba(220,38,38,0.2); color: var(--blood); border-radius: 4px; font-weight: 600; }
  .survivor { display: inline-block; margin-left: 8px; font-size: 11px; padding: 2px 8px; background: rgba(74,222,128,0.2); color: var(--accent); border-radius: 4px; font-weight: 600; }

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
  .arg-chevron { transition: transform 0.2s; color: var(--text-dim); font-size: 1.2rem; }
  .arg-card.open .arg-chevron { transform: rotate(180deg); }
  .arg-body { max-height: 0; overflow: hidden; transition: max-height 0.35s ease; }
  .arg-card.open .arg-body { max-height: 3000px; }
  .arg-content { padding: 0 24px 24px; color: var(--text-dim); white-space: pre-wrap; font-size: 0.95rem; line-height: 1.7; }

  .rebuttal-group { margin-bottom: 32px; }
  .rebuttal-group h3 { font-size: 1.1rem; margin-bottom: 12px; color: var(--accent); }
  .rebuttal-entry { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 20px 24px; margin-bottom: 8px; }
  .rebuttal-entry .round-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-dim); margin-bottom: 8px; }
  .rebuttal-entry .rebuttal-text { white-space: pre-wrap; color: var(--text-dim); font-size: 0.93rem; line-height: 1.7; }

  .timeline { position: relative; padding-left: 40px; }
  .timeline::before { content: ''; position: absolute; left: 15px; top: 0; bottom: 0; width: 2px; background: var(--border); }
  .timeline-item { position: relative; margin-bottom: 32px; }
  .timeline-dot { position: absolute; left: -33px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: var(--accent); border: 3px solid var(--bg); box-shadow: 0 0 0 2px var(--accent); }
  .timeline-item.phase-end .timeline-dot { background: var(--blood); box-shadow: 0 0 0 2px var(--blood); }
  .timeline-phase { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: var(--accent); margin-bottom: 4px; font-weight: 600; }
  .timeline-title { font-weight: 600; margin-bottom: 4px; }
  .timeline-desc { color: var(--text-dim); font-size: 0.9rem; }

  .declaration {
    background: linear-gradient(135deg, rgba(74,222,128,0.08), rgba(255,215,0,0.08));
    border: 1px solid var(--accent-dark);
    border-radius: 16px;
    padding: 32px;
    text-align: center;
    margin: 32px 0;
  }
  .declaration h3 { color: var(--gold); font-size: 1.3rem; margin-bottom: 12px; }
  .declaration p { color: var(--text-dim); max-width: 800px; margin: 0 auto; font-size: 1rem; line-height: 1.7; }

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
const DINO_EMOJIS = ${JSON.stringify(dinoEmojis)};
</script>

<div class="hero">
  <span class="hero-icon">\uD83E\uDD96</span>
  <div class="hero-label">Dinosaur Battle Royale</div>
  <h1 id="hero-name"></h1>
  <p class="subtitle" id="hero-declaration"></p>
  <div class="hero-badge">Last One Standing</div>
</div>

<div class="container">
  <div class="tabs">
    <div class="tab active" data-panel="rankings">Final Rankings</div>
    <div class="tab" data-panel="opening">Battle Cases</div>
    <div class="tab" data-panel="rebuttals">Rebuttals</div>
    <div class="tab" data-panel="timeline">Battle Timeline</div>
  </div>

  <div class="panel active" id="panel-rankings">
    <div class="narrative-box" id="narrative-box"></div>
    <div id="rankings-list"></div>
    <div class="declaration" id="declaration-box"></div>
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
  Dinosaur Battle Royale &mdash; Powered by Gemini AI Multi-Agent System
</footer>

<script>
(function() {
  const { openingArgs, rebuttalRound1, rebuttalRound2, judgeResult } = DATA;

  const winner = judgeResult.rankings[0];
  document.getElementById('hero-name').textContent = (DINO_EMOJIS[winner.player] || '') + ' ' + winner.player;
  document.getElementById('hero-declaration').textContent = judgeResult.champion_declaration;

  const narBox = document.getElementById('narrative-box');
  narBox.innerHTML = '<h3>The Battle</h3><p>' + escHtml(judgeResult.battle_narrative) + '</p>';

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
    const emoji = DINO_EMOJIS[r.player] || '';
    const badge = r.rank === 1 ? '<span class="survivor">CHAMPION</span>' : '<span class="eliminated">#' + r.rank + ' ELIMINATED</span>';
    card.innerHTML =
      '<div class="rank-badge">' + r.rank + '</div>' +
      '<div class="rank-info"><h3><span class="dino-emoji">' + emoji + '</span>' + escHtml(r.player) + badge + '</h3><p>' + escHtml(r.reasoning) + '</p></div>';
    rankingsEl.appendChild(card);
  });

  const declBox = document.getElementById('declaration-box');
  declBox.innerHTML = '<h3>Champion Declaration</h3><p>' + escHtml(judgeResult.champion_declaration) + '</p>';

  const openingEl = document.getElementById('opening-list');
  openingArgs.forEach(a => {
    const emoji = DINO_EMOJIS[a.player] || '';
    const card = document.createElement('div');
    card.className = 'arg-card';
    card.innerHTML =
      '<div class="arg-header"><span>' + emoji + ' ' + escHtml(a.player) + '</span><span class="arg-chevron">&#x25BC;</span></div>' +
      '<div class="arg-body"><div class="arg-content">' + escHtml(a.argument) + '</div></div>';
    card.querySelector('.arg-header').addEventListener('click', () => card.classList.toggle('open'));
    openingEl.appendChild(card);
  });

  const rebuttalsEl = document.getElementById('rebuttals-list');
  const players = [...new Set(rebuttalRound1.map(r => r.player))];
  players.forEach(player => {
    const emoji = DINO_EMOJIS[player] || '';
    const group = document.createElement('div');
    group.className = 'rebuttal-group';
    const r1 = rebuttalRound1.find(r => r.player === player);
    const r2 = rebuttalRound2.find(r => r.player === player);
    let inner = '<h3>' + emoji + ' ' + escHtml(player) + '</h3>';
    if (r1) inner += '<div class="rebuttal-entry"><div class="round-label">Round 1 Rebuttal</div><div class="rebuttal-text">' + escHtml(r1.rebuttal) + '</div></div>';
    if (r2) inner += '<div class="rebuttal-entry"><div class="round-label">Round 2 Rebuttal</div><div class="rebuttal-text">' + escHtml(r2.rebuttal) + '</div></div>';
    group.innerHTML = inner;
    rebuttalsEl.appendChild(group);
  });

  const timelineEl = document.getElementById('timeline');
  const items = [];
  items.push({ phase: 'Phase 1', title: 'Battle Cases Begin', desc: '10 dinosaur advocates present their combat arguments.', end: false });
  openingArgs.forEach(a => {
    const emoji = DINO_EMOJIS[a.player] || '';
    items.push({ phase: 'Phase 1', title: emoji + ' ' + a.player + ' enters the arena', desc: a.argument.slice(0, 120) + '...', end: false });
  });
  items.push({ phase: 'Phase 1', title: 'All combatants assessed', desc: 'Opening arguments complete.', end: true });
  items.push({ phase: 'Phase 2', title: 'Rebuttal Round 1 — Claws Out', desc: 'Advocates attack each other\'s weaknesses.', end: false });
  items.push({ phase: 'Phase 2', title: 'Round 1 Complete', desc: 'First blood drawn in the debate.', end: true });
  items.push({ phase: 'Phase 2', title: 'Rebuttal Round 2 — Final Strikes', desc: 'Last chance to make the case.', end: false });
  items.push({ phase: 'Phase 2', title: 'Round 2 Complete', desc: 'All arguments delivered.', end: true });
  items.push({ phase: 'Phase 3', title: 'The Judge Rules', desc: 'Expert paleontologist delivers the final verdict.', end: false });
  items.push({ phase: 'Phase 3', title: (DINO_EMOJIS[winner.player] || '') + ' ' + winner.player + ' wins!', desc: (judgeResult.champion_declaration || '').slice(0, 150) + '...', end: true });

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
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║   DINOSAUR BATTLE ROYALE — Multi-Agent Simulator     ║");
  console.log("╚═══════════════════════════════════════════════════════╝");

  const startTime = Date.now();

  const openingArgs = await runOpeningArguments();
  const rebuttalRound1 = await runRebuttalRound(1, openingArgs, []);
  const rebuttalRound2 = await runRebuttalRound(2, openingArgs, rebuttalRound1);
  const judgeResult = await runJudge(openingArgs, rebuttalRound1, rebuttalRound2);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n══ Battle complete in ${elapsed}s ══\n`);

  console.log("EXTINCTION ORDER (last standing → first eliminated):");
  judgeResult.rankings.forEach((r) => {
    const tag = r.rank === 1 ? " ← CHAMPION" : "";
    console.log(`  #${r.rank} ${r.player}${tag}`);
  });

  const html = generateDashboard(openingArgs, rebuttalRound1, rebuttalRound2, judgeResult);
  const outPath = path.join(__dirname, "dashboard-dinos.html");
  fs.writeFileSync(outPath, html, "utf-8");
  console.log(`\nDashboard written to: ${outPath}`);
  console.log("Open dashboard-dinos.html in your browser to view results.");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
