const bursts = [];
function burst(b, txt, color, hgt){
  const el = document.createElement('div');
  el.textContent = txt;
  el.style.cssText = 'position:fixed;font-family:Arial Black;font-weight:900;font-size:40px;letter-spacing:1px;text-shadow:0 3px 0 #000,0 0 12px rgba(0,0,0,.8);pointer-events:none;transform:translate(-50%,-50%);z-index:6;color:'+color;
  document.body.appendChild(el);
  bursts.push({ el, x:b.x, y:1+hgt, z:b.z, t:0, life:0.75, vy:1.2 });
}

// ─────────────────────────────────────────────
//  Movement / update
// ─────────────────────────────────────────────
function clampToCage(b){
  const d = Math.hypot(b.x,b.z);
  const lim = R-0.5;
  if (d>lim){ b.x*=lim/d; b.z*=lim/d; }
}
function separate(a,b){
  const dx=b.x-a.x, dz=b.z-a.z, d=Math.hypot(dx,dz);
  const min=0.95;
  if (d<min && d>0.001){ const push=(min-d)/2; a.x-=dx/d*push; a.z-=dz/d*push; b.x+=dx/d*push; b.z+=dz/d*push; }
}
// Fighters hold the pocket: if knockback shoves a fighter past reaching
// distance, they automatically walk back in until they're in range again.
const REACH = 1.5;
function maintainPosition(b, opp, dt){
  if (b.action==='ko' || b.action==='hit') return;
  const d = dist2(b, opp);
  if (d > REACH){
    const ang = faceTo(b, opp);
    const fwd = { x:Math.sin(ang), z:Math.cos(ang) };
    const legSlow = 1 - Math.min(0.45, b.legDmg*0.005);
    // close at a walking pace — quicker the farther you've been shoved, but never a snap
    const speed = (d > REACH + 1.6 ? 3.0 : 1.7) * legSlow;
    const close = Math.min(d - REACH, speed*dt);
    b.x += fwd.x*close; b.z += fwd.z*close;
    b.legPhase = (b.legPhase + 5*dt) % 1;
    b.moveF = 1; b.moveS = 0;
  } else {
    b.moveF = 0; b.moveS = 0;
  }
}

function tickPlayer(b, dt){
  b.yaw = faceTo(b, cpu);
  // Footwork is automatic now (see maintainPosition) — no joystick / WASD movement.
  if (b.action==='block'&&!keys[' ']) endAction(b);
  if (b.action==='idle'){
    if (keys['q']) startDodge(b);
    else if (keys[' ']) startBlock(b);
    else { for (const k in SK){ if(keys[k]){ startStrike(b,SK[k]); break; } } }
  }
  tickAction(b, dt);
}
function tickAction(b, dt){
  if (b.dodgeCD>0) b.dodgeCD=Math.max(0,b.dodgeCD-dt);
  if (b.action!=='dodge') b.kneesBent=Math.max(0,b.kneesBent-dt*6);
  if (b.flinch>0) b.flinch=Math.max(0,b.flinch-dt);
  if (b.legDmg>0) b.legDmg=Math.max(0,b.legDmg-dt*1.5);
  // flying knee jump
  if (b.action==='flyingknee'){ const s=STRIKES.flyingknee; const pr=Math.min(1,b.actionT/(s.windup+s.active)); b.jumpY=Math.sin(pr*Math.PI)*0.55; }
  else b.jumpY = Math.max(0, b.jumpY - dt*3);

  if (b.action==='ko'){ b.actionT+=dt; return; }
  if (b.action==='hit'){ b.actionT+=dt; if(b.actionT>=b.actionDur)endAction(b); return; }
  if (b.action==='block'){ b.stamina=Math.max(0,b.stamina-4*dt); return; }
  if (b.action==='dodge'){ b.actionT+=dt; b.kneesBent=Math.sin((b.actionT/b.actionDur)*Math.PI); if(b.actionT>=b.actionDur){b.kneesBent=0;endAction(b);} return; }
  if (STRIKES[b.action]){
    const s=STRIKES[b.action];
    b.actionT+=dt;
    // step into the strike — every attack shifts the fighter forward through the blow
    if (b.actionT < s.windup+s.active){
      const fwd={x:Math.sin(b.yaw),z:Math.cos(b.yaw)};
      b.x += fwd.x*2.4*dt; b.z += fwd.z*2.4*dt;
    }
    if(b.actionT>=b.actionDur)endAction(b);
  }
  if (b.action==='idle'&&b.stamina<b.maxStam) b.stamina=Math.min(b.maxStam,b.stamina+17*dt);
}

