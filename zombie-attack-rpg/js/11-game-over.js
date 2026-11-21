// ============================================================
// GAME OVER
// ============================================================
function showGameOver() {
  G.running = false;
  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;z-index:500;font-family:Courier New;';
  d.innerHTML = `
    <div style="font-size:60px;color:#f00;text-shadow:0 0 30px #f00;">YOU DIED</div>
    <div style="font-size:16px;color:#aaa;margin:20px 0;">Day ${G.day} | Wave ${G.wave} | ${G.kills} Kills | Level ${P.level}</div>
    <div style="font-size:14px;color:#fa8;margin-bottom:30px;">Score: ${G.kills*10 + P.level*100 + G.day*50}</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;font-size:12px;">
      ${Object.entries(G.achievements).filter(([,v])=>v).map(([id])=>`<div style="background:#222;padding:8px;border:1px solid #666;color:#ff8;">🏆 ${ACHIEVEMENTS_DEF[id]?.name||id}</div>`).join('')}
    </div>
    <button onclick="location.reload()" style="padding:14px 40px;background:#c00;color:#fff;border:none;font-size:18px;cursor:pointer;font-family:Courier New;">PLAY AGAIN</button>
  `;
  document.body.appendChild(d);
}

// ============================================================
// PAUSE / RESUME
// ============================================================
function pauseGame() {
  if(P.dead) return;
  G.paused = !G.paused;
  document.getElementById('pauseMenu').style.display = G.paused?'block':'none';
  document.getElementById('pauseBtn').innerHTML = G.paused ? '&#9654; RESUME' : '&#9646;&#9646; PAUSE';
}
function resumeGame() {
  G.paused = false;
  document.getElementById('pauseMenu').style.display='none';
  document.getElementById('craftMenu').style.display='none';
  document.getElementById('invPanel').style.display='none';
  document.getElementById('pauseBtn').innerHTML = '&#9646;&#9646; PAUSE';
}

