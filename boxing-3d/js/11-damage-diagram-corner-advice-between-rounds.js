'use strict';
// ─────────────────────────────────────────────
//  Damage diagram + corner advice (between rounds)
// ─────────────────────────────────────────────
function totalZoneDamage(zoneDmg){
  let s = 0;
  for (const k in zoneDmg) s += zoneDmg[k] || 0;
  return s;
}

function buildBodySvg(zoneDmg){
  // Six zones as colored regions.
  const col = {
    HEAD:       zoneFill(zoneDmg.HEAD),
    CHEST:      zoneFill(zoneDmg.CHEST),
    ABS:        zoneFill(zoneDmg.ABS),
    LIVER:      zoneFill(zoneDmg.LIVER),
    LEFT_RIBS:  zoneFill(zoneDmg.LEFT_RIBS),
    RIGHT_RIBS: zoneFill(zoneDmg.RIGHT_RIBS),
  };
  // Numbers shown as small labels.
  const n = (z)=> Math.round(zoneDmg[z] || 0);
  return `
  <svg viewBox="0 0 160 230" width="160" height="230">
    <!-- Head -->
    <ellipse cx="80" cy="32" rx="22" ry="26" fill="${col.HEAD}" stroke="#ffd700" stroke-width="1.5"/>
    <text x="80" y="35" text-anchor="middle" font-size="9" fill="#000" font-weight="bold">HEAD ${n('HEAD')}</text>
    <!-- Neck -->
    <rect x="71" y="56" width="18" height="10" fill="#c89a55" stroke="#5a3f24" stroke-width="1"/>
    <!-- Shoulders -->
    <rect x="38" y="66" width="84" height="14" rx="6" fill="#c89a55" stroke="#5a3f24" stroke-width="1"/>
    <!-- Chest (split into chest, ribs L/R) -->
    <!-- Chest (center) -->
    <path d="M55 80 L105 80 L105 120 L55 120 Z" fill="${col.CHEST}" stroke="#ffd700" stroke-width="1.5"/>
    <text x="80" y="103" text-anchor="middle" font-size="9" fill="#000" font-weight="bold">CHEST ${n('CHEST')}</text>
    <!-- LEFT ribs (viewer's left = opponent's right = LEFT_RIBS label) -->
    <path d="M38 80 L55 80 L55 130 L42 132 Z" fill="${col.LEFT_RIBS}" stroke="#ffd700" stroke-width="1.5"/>
    <text x="48" y="106" text-anchor="middle" font-size="6" fill="#000" font-weight="bold">L-RIB</text>
    <text x="48" y="116" text-anchor="middle" font-size="7" fill="#000" font-weight="bold">${n('LEFT_RIBS')}</text>
    <!-- RIGHT ribs (viewer's right) -->
    <path d="M105 80 L122 80 L118 132 L105 130 Z" fill="${col.RIGHT_RIBS}" stroke="#ffd700" stroke-width="1.5"/>
    <text x="113" y="106" text-anchor="middle" font-size="6" fill="#000" font-weight="bold">R-RIB</text>
    <text x="113" y="116" text-anchor="middle" font-size="7" fill="#000" font-weight="bold">${n('RIGHT_RIBS')}</text>
    <!-- Abs -->
    <path d="M55 120 L105 120 L100 165 L60 165 Z" fill="${col.ABS}" stroke="#ffd700" stroke-width="1.5"/>
    <text x="80" y="148" text-anchor="middle" font-size="9" fill="#000" font-weight="bold">ABS ${n('ABS')}</text>
    <!-- Liver (lower right of viewer = opponent's right side = LIVER) -->
    <path d="M100 130 L118 132 L114 168 L100 165 Z" fill="${col.LIVER}" stroke="#ff6a00" stroke-width="2"/>
    <text x="108" y="150" text-anchor="middle" font-size="6" fill="#000" font-weight="bold">LIVER</text>
    <text x="108" y="160" text-anchor="middle" font-size="7" fill="#000" font-weight="bold">${n('LIVER')}</text>
    <!-- Belt -->
    <rect x="55" y="165" width="50" height="10" fill="#ffd700" stroke="#000" stroke-width="0.5"/>
    <!-- Shorts -->
    <path d="M55 175 L105 175 L100 215 L60 215 Z" fill="#552020" stroke="#000" stroke-width="0.5"/>
  </svg>`;
}
function zoneFill(amount){
  amount = amount || 0;
  if (amount > 28) return '#e64545';
  if (amount > 12) return '#f4d35a';
  return '#f6efe2';
}

function generateAdvice(){
  const lines = [];
  const pZones = player.zoneDmg, cZones = cpu.zoneDmg;
  // Player-side advice (priority order: defense red, low stamina, low offense, opp hurt)
  if (pZones.HEAD > 28) lines.push("<b>Hands UP, kid.</b> Your chin is a bullseye out there — tighten that guard and quit eating jabs.");
  if (pZones.LIVER > 28 || pZones.ABS > 28) lines.push("<b>Elbows in.</b> He's parking shots on your body. Tuck those elbows and stop dropping the right hand.");
  if (player.lowStaminaTicks > 6) lines.push("<b>Pace yourself.</b> You're loading up on every shot. Stick the jab, breathe, and stay light on the toes.");
  if (player.punchesThrown < 6) lines.push("<b>Let your hands GO.</b> Doubles, triples on the jab — make him respect your range.");
  if (cZones.LIVER > 24 || cZones.ABS > 24) lines.push("<b>He's hurt to the body.</b> Dig in — shovel hooks, liver shots, finish the job.");
  if (cZones.HEAD > 24) lines.push("<b>You've found his chin.</b> Set up the right hand behind that jab and put him out.");
  if (lines.length === 0) lines.push("<b>Good round.</b> Cleaner footwork next, keep circling left, work behind that jab.");
  // Pick top 2.
  return lines.slice(0, 2);
}

function showInterlude(onContinue){
  const wrap = document.getElementById('interlude');
  document.getElementById('interlude-title').textContent = 'END OF ROUND ' + round;
  const diagrams = document.getElementById('diagrams');
  diagrams.innerHTML = `
    <div class="diag">
      <div class="who">YOU</div>
      ${buildBodySvg(player.zoneDmg)}
      <div style="font-size:11px;color:#cfc8b8">Total: ${Math.round(totalZoneDamage(player.zoneDmg))}</div>
    </div>
    <div class="diag">
      <div class="who">BRUNO</div>
      ${buildBodySvg(cpu.zoneDmg)}
      <div style="font-size:11px;color:#cfc8b8">Total: ${Math.round(totalZoneDamage(cpu.zoneDmg))}</div>
    </div>
  `;
  const adviceEl = document.getElementById('advice');
  adviceEl.innerHTML = '<div style="margin-bottom:6px;font-size:13px;color:#ffd700;letter-spacing:1px">CORNER:</div>' +
    generateAdvice().map(l => '<div>• ' + l + '</div>').join('');
  wrap.classList.add('active');
  let elapsed = 0;
  const tEl = document.getElementById('interlude-timer');
  const intervalId = setInterval(() => {
    elapsed += 0.25;
    const left = Math.max(0, Math.ceil(6 - elapsed));
    tEl.textContent = 'Auto-advance in ' + left + 's';
    if (elapsed >= 6){
      clearInterval(intervalId);
      finish();
    }
  }, 250);
  function finish(){
    clearInterval(intervalId);
    wrap.classList.remove('active');
    document.getElementById('btn-continue').onclick = null;
    onContinue();
  }
  document.getElementById('btn-continue').onclick = () => finish();
}

function roundEnd(){
  let winner = null;
  if (player.hp <= 0) winner = 'cpu';
  else if (cpu.hp <= 0) winner = 'player';
  else if (player.hp > cpu.hp) winner = 'player';
  else if (cpu.hp > player.hp) winner = 'cpu';
  if (winner === 'player') scorePlayer++;
  else if (winner === 'cpu') scoreCpu++;
  const matchOver = (round >= TOTAL_ROUNDS) || player.hp <= 0 || cpu.hp <= 0;
  if (matchOver){
    finishMatch();
  } else {
    showInterlude(() => {
      round++;
      const prevPlayerHp = player.hp;
      const prevCpuHp    = cpu.hp;
      setupRound(false);
      // Corner recovery: restore only 15% of max HP
      player.hp = Math.min(player.maxHp, prevPlayerHp + player.maxHp * 0.15);
      cpu.hp    = Math.min(cpu.maxHp,    prevCpuHp    + cpu.maxHp    * 0.15);
      state = 'fight';
      playBell();
    });
  }
}

function finishRace(){
  // CPU difficulty reached by end of race
  const finalTier = Math.min(4, knockdownsCpu + Math.floor(totalCpuKnockdowns * 0.5));
  const tierLabels = ['Rookie','Amateur','Pro','Elite','Champion'];
  const dmg = Math.round(raceDamageDealt);

  // Grade based on damage dealt in 5 minutes
  const grade = dmg >= 600 ? 'S — UNSTOPPABLE' : dmg >= 450 ? 'A — DEVASTATING' :
                dmg >= 300 ? 'B — SOLID' : dmg >= 150 ? 'C — AVERAGE' : 'D — KEEP TRAINING';

  document.getElementById('end-title').textContent = "TIME'S UP!";
  document.getElementById('end-sub').textContent   = 'You dealt ' + dmg + ' damage to Bruno';
  document.getElementById('end-stats').textContent =
    'Grade: ' + grade +
    '  •  KOs landed: ' + knockdownsCpu +
    '  •  CPU difficulty reached: ' + tierLabels[finalTier] +
    '  •  Knockdowns taken: ' + knockdownsPlayer;

  gloveRaiseMode = null;
  playBell();
  showScreen('screen-end');
}

function finishMatch(){
  state = 'end';
  let title = 'DRAW', sub = '';
  let damageWinner = null;
  const pTotal = totalZoneDamage(player.zoneDmg);
  const cTotal = totalZoneDamage(cpu.zoneDmg);

  if (player.hp <= 0)              { title = 'KNOCKED OUT'; sub = 'Round ' + round + ' · Bruno wins by KO'; }
  else if (cpu.hp <= 0)            { title = 'VICTORY!';    sub = 'Round ' + round + ' · You win by KO!'; }
  else {
    // Final round non-KO: cumulative damage tiebreaker.
    if (pTotal < cTotal){ title = 'VICTORY!'; sub = 'Cleaner work — less damage taken'; damageWinner = 'player'; }
    else if (cTotal < pTotal){ title = 'DEFEAT'; sub = 'You took more damage'; damageWinner = 'cpu'; }
    else {
      if (scorePlayer > scoreCpu){ title = 'VICTORY!'; sub = 'You win on points · ' + scorePlayer + '-' + scoreCpu; damageWinner = 'player'; }
      else if (scoreCpu > scorePlayer){ title = 'DEFEAT'; sub = 'Bruno wins on points · ' + scoreCpu + '-' + scorePlayer; damageWinner = 'cpu'; }
      else { title = 'DRAW'; sub = 'Split decision'; damageWinner = null; }
    }
  }
  document.getElementById('end-title').textContent = title;
  document.getElementById('end-sub').textContent = sub;
  document.getElementById('end-stats').textContent =
    'Damage taken: You ' + Math.round(pTotal) + ' · Bruno ' + Math.round(cTotal) +
    '  •  Knockdowns: You ' + knockdownsCpu + ' · Bruno ' + knockdownsPlayer +
    '  •  HP left: You ' + Math.round(player.hp) + ' · Bruno ' + Math.round(cpu.hp);

  // Glove raise if not by KO and we have a damage winner.
  if (damageWinner && player.hp > 0 && cpu.hp > 0){
    gloveRaiseMode = { who: damageWinner, t: 0 };
    backPulse = 1.2;
    setTimeout(() => {
      showScreen('screen-end');
      playBell();
    }, 2200);
  } else {
    showScreen('screen-end');
    playBell();
  }
}

function showScreen(id){ document.getElementById(id).classList.add('active'); }
function hideScreen(id){ document.getElementById(id).classList.remove('active'); }

document.getElementById('btn-fight').onclick   = () => { ensureAudio(); raceMode = false; gloveRaiseMode = null; resetMatch(); };
document.getElementById('btn-race').onclick    = () => { ensureAudio(); raceMode = true;  gloveRaiseMode = null; resetMatch(); };
document.getElementById('btn-rematch').onclick = () => { ensureAudio(); gloveRaiseMode = null; resetMatch(); };

