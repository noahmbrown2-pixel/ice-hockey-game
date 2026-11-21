// ============================================================
// INPUT
// ============================================================
window.addEventListener('keydown', e=>{
  const k = e.key.toLowerCase();
  KEYS[k]=true;
  if(!G.running) return;
  if(k==='escape') { pauseGame(); return; }
  if(G.paused) return;
  if(k==='e') { tryInteract(); return; }
  if(k==='r') { reloadWeapon(); return; }
  if(k==='q') { useSkill('Q'); return; }
  if(k==='f') { useSkill('E'); return; }
  if(k==='g') { useSkill('R'); return; }
  if(k==='c') { G.paused=true; openCraft(); return; }
  if(k==='tab') { openInv(); e.preventDefault(); return; }
  if(k==='i') { openInv(); return; }
  if(k>='1'&&k<='8') { P.equipped=parseInt(k)-1; return; }
});

window.addEventListener('keyup', e=>{ KEYS[e.key.toLowerCase()]=false; });

canvas.addEventListener('mousemove', e=>{ MOUSE.x=e.clientX; MOUSE.y=e.clientY; });
canvas.addEventListener('mousedown', e=>{
  if(e.button===0) { MOUSE.down=true; if(G.running&&!G.paused) meleeAttack(); }
  if(e.button===2) { MOUSE.rdown=true; if(G.running&&!G.paused) shootBullet(); }
});
canvas.addEventListener('mouseup', e=>{ if(e.button===0) MOUSE.down=false; if(e.button===2) MOUSE.rdown=false; });
canvas.addEventListener('contextmenu', e=>e.preventDefault());
canvas.addEventListener('touchstart', e=>e.preventDefault(), {passive:false});
canvas.addEventListener('touchmove',  e=>e.preventDefault(), {passive:false});

// ============================================================
// MOBILE CONTROLS
// ============================================================
const isMobile = () => ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

function showMobileControls() {
  document.getElementById('mobileControls').style.display = 'block';
  // Hide skill bar (redundant with mobile buttons)
  document.getElementById('skillBar').style.display = 'none';
}

// Auto-aim: point MOUSE toward nearest zombie on screen
function mobileAutoAim() {
  let best = null, bestDist = Infinity;
  for(const m of MONSTERS) {
    if(m.dead) continue;
    const dx = m.x - P.x, dy = m.y - P.y;
    const d = Math.sqrt(dx*dx+dy*dy);
    if(d < bestDist) { bestDist = d; best = m; }
  }
  if(best) {
    MOUSE.x = sx(best.x);
    MOUSE.y = sy(best.y);
  } else {
    // aim in direction player is facing
    MOUSE.x = W/2 + Math.cos(P.angle)*150;
    MOUSE.y = H/2 + Math.sin(P.angle)*150;
  }
}

// Joystick
(function() {
  const zone = document.getElementById('joystickZone');
  const knob = document.getElementById('joystickKnob');
  const R = 65; // max radius
  let touching = false, tid = -1, ox = 0, oy = 0;

  function getCenter() {
    const r = zone.getBoundingClientRect();
    return { x: r.left + r.width/2, y: r.top + r.height/2 };
  }

  zone.addEventListener('touchstart', e => {
    e.preventDefault();
    touching = true;
    tid = e.changedTouches[0].identifier;
    const c = getCenter();
    ox = c.x; oy = c.y;
  }, {passive:false});

  window.addEventListener('touchmove', e => {
    if(!touching) return;
    for(const t of e.changedTouches) {
      if(t.identifier !== tid) continue;
      e.preventDefault();
      let dx = t.clientX - ox, dy = t.clientY - oy;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if(dist > R) { dx = dx/dist*R; dy = dy/dist*R; }
      knob.style.left = (39+dx)+'px';
      knob.style.top  = (39+dy)+'px';
      const threshold = 18;
      KEYS['w'] = dy < -threshold;
      KEYS['s'] = dy >  threshold;
      KEYS['a'] = dx < -threshold;
      KEYS['d'] = dx >  threshold;
    }
  }, {passive:false});

  function endTouch(e) {
    for(const t of e.changedTouches) {
      if(t.identifier !== tid) continue;
      touching = false;
      knob.style.left = '39px'; knob.style.top = '39px';
      KEYS['w']=KEYS['s']=KEYS['a']=KEYS['d']=false;
    }
  }
  window.addEventListener('touchend', endTouch);
  window.addEventListener('touchcancel', endTouch);
})();

// Mobile action buttons
function mbind(id, fn) {
  const el = document.getElementById(id);
  if(!el) return;
  el.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); fn(); }, {passive:false});
}

mbind('mbtnMelee',    () => { if(G.running&&!G.paused) { mobileAutoAim(); meleeAttack(); } });
mbind('mbtnShoot',    () => { if(G.running&&!G.paused) { mobileAutoAim(); shootBullet(); } });
mbind('mbtnInteract', () => { if(G.running&&!G.paused) tryInteract(); });
mbind('mbtnReload',   () => { if(G.running&&!G.paused) reloadWeapon(); });
mbind('mbtnSkillQ',   () => { if(G.running&&!G.paused) { mobileAutoAim(); useSkill('Q'); } });
mbind('mbtnSkillE',   () => { if(G.running&&!G.paused) { mobileAutoAim(); useSkill('E'); } });
mbind('mbtnSkillR',   () => { if(G.running&&!G.paused) { mobileAutoAim(); useSkill('R'); } });
mbind('mbtnCraft',    () => { if(G.running) { G.paused=true; openCraft(); } });
mbind('mbtnInv',      () => { if(G.running) openInv(); });

