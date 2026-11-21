'use strict';
// ─────────────────────────────────────────────
//  Hit-text bursts
// ─────────────────────────────────────────────
const hitBursts = [];
function spawnHitText(word, target, color){
  const el = document.createElement('div');
  el.className = 'hit-burst';
  el.textContent = word;
  el.style.color = color;
  document.body.appendChild(el);
  hitBursts.push({ el, t: 0, life: 0.7, color, follow: target });
}
function updateHitBursts(dt){
  for (let i = hitBursts.length - 1; i >= 0; i--){
    const h = hitBursts[i];
    h.t += dt;
    const a = 1 - (h.t / h.life);
    if (a <= 0){ h.el.remove(); hitBursts.splice(i, 1); continue; }
    const target = h.follow;
    const v = new THREE.Vector3(target.pos.x, 2.4, target.pos.z);
    v.project(camera);
    const x = (v.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-v.y * 0.5 + 0.5) * window.innerHeight - (1 - a) * 60;
    h.el.style.transform = 'translate(-50%,-50%) scale(' + (1 + (1 - a) * 0.4) + ')';
    h.el.style.left = x + 'px';
    h.el.style.top  = y + 'px';
    h.el.style.opacity = a;
  }
}

// ─────────────────────────────────────────────
//  HUD
// ─────────────────────────────────────────────
function updateHud(){
  if (!player || !cpu) return;
  if (!raceMode){
    document.getElementById('hp-p').style.width = (player.hp / player.maxHp * 100) + '%';
    document.getElementById('hp-c').style.width = (cpu.hp / cpu.maxHp * 100) + '%';
    document.getElementById('hp-p-num').textContent = Math.round(player.hp);
    document.getElementById('hp-c-num').textContent = Math.round(cpu.hp);
    document.getElementById('round-score').textContent = scorePlayer + '-' + scoreCpu;
  } else {
    // Race: show running damage score instead of score display
    document.getElementById('race-dmg').textContent = Math.round(raceDamageDealt) + ' DMG';
  }
  const spEl = document.getElementById('stam-p');
  const scEl = document.getElementById('stam-c');
  spEl.style.width = (player.stamina / player.maxStam * 100) + '%';
  scEl.style.width = (cpu.stamina / cpu.maxStam * 100) + '%';
  const stamColor = (s) => s > 50 ? '#4dff91' : s > 28 ? '#f5c542' : '#ff3b3b';
  spEl.style.background = stamColor(player.stamina);
  scEl.style.background = stamColor(cpu.stamina);
  const gasPulse = (el, s) => { if (s < 28) el.style.opacity = 0.5 + 0.5 * Math.abs(Math.sin(performance.now() * 0.006)); else el.style.opacity = 1; };
  gasPulse(spEl, player.stamina); gasPulse(scEl, cpu.stamina);
  const m = Math.floor(roundClock / 60);
  const s = Math.floor(roundClock % 60);
  document.getElementById('round-time').textContent = m + ':' + (s < 10 ? '0' : '') + s;
  document.getElementById('round-time').classList.toggle('danger', raceMode ? roundClock < 30 : roundClock < 10);
}

