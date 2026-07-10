function dist2(a,b){ const dx=b.x-a.x, dz=b.z-a.z; return Math.hypot(dx,dz); }
function faceTo(a,b){ return Math.atan2(b.x-a.x, b.z-a.z); }

function startStrike(b, kind){
  if (b.hp<=0||b.action==='ko') return;
  if (b.action!=='idle'&&b.action!=='block') return;
  const s = STRIKES[kind]; if(!s) return;
  if (b.stamina < s.stam*0.5) return;
  b.stamina = Math.max(0, b.stamina - s.stam);
  b.action = kind; b.actionT = 0; b.actionDur = s.windup+s.active+s.recover; b.hitDone = false;
}
function startBlock(b){ b.action='block'; b.actionT=0; }
function endAction(b){ b.action='idle'; b.actionT=0; }
function startDodge(b){ if(b.hp<=0||b.action==='ko')return; if(b.dodgeCD>0||b.action!=='idle')return; b.action='dodge'; b.actionT=0; b.actionDur=0.4; b.dodgeCD=0.9; }

function takeHit(target, source, kind){
  const s = STRIKES[kind];
  const blocked = target.action==='block';
  if (!blocked && target.action==='dodge' && target.kneesBent>0.4 && s.height!=='low' && s.type!=='knee'){
    burst(target,'SLIP!','#44ff88',1.9); return;
  }
  let dmg = s.dmg;
  if (blocked){
    dmg *= (s.height==='low') ? 0.55 : 0.18;
    target.stamina = Math.max(0, target.stamina - s.stam*0.5);
    playBlock();
    if (s.type==='kick'){
      // a blocked kick still has force — shove the blocker backward
      const dx=target.x-source.x, dz=target.z-source.z, d=Math.hypot(dx,dz)||1;
      const kbk = s.kb*1.7 + 0.28;            // heavier kicks shove harder
      target.x += dx/d*kbk; target.z += dz/d*kbk;
      target.flinch = 0.22;                    // brief stagger
      shake = Math.max(shake, 0.3);
      burst(target,'BLOCKED!','#9fdcff', s.height==='high'?2.0:s.height==='mid'?1.4:0.9);
    } else {
      burst(target,'BLOCK','#9fdcff',2.0);
    }
    if (s.leg) target.legDmg = Math.min(100, target.legDmg + dmg*0.4);
    target.hp -= dmg; if (target.hp<=0){target.hp=0; doKO(target,source);} return;
  }
  target.flinch = 0.35;
  if (target.action!=='ko'){ target.action='hit'; target.actionT=0; target.actionDur=s.windup+0.06; }
  // knockback along source→target
  const dx = target.x-source.x, dz = target.z-source.z, d=Math.hypot(dx,dz)||1;
  target.x += dx/d*s.kb; target.z += dz/d*s.kb;
  playHit(kind);
  const word = s.type==='kick'?'CRACK':s.type==='knee'?'THUD':s.type==='elbow'?'SLICE':(kind==='jab'?'POW':'BAM');
  const col = s.crit>=0.4?'#ff2b2b':s.type==='kick'?'#ff7a00':s.type==='knee'?'#ff4fa0':'#ffd23b';
  burst(target, word, col, s.height==='high'?2.0:s.height==='mid'?1.4:0.9);
  if (s.leg) target.legDmg = Math.min(100, target.legDmg + dmg);
  shake = Math.max(shake, s.crit>=0.4?0.5:s.type==='kick'?0.3:0.18);
  if (s.crit>=0.3) flashT = Math.max(flashT,0.12);
  target.hp -= dmg;
  const lethal = target.hp<=0;
  const critRoll = s.crit>0 && Math.random()<s.crit;
  if (lethal || (critRoll && target.hp < target.maxHp*0.3)){
    if (target.knockdowns+1>=MAX_KD || target.hp<=-15){ target.hp=Math.max(0,target.hp); doKO(target,source); }
    else triggerKnockdown(target, source);
  }
}
function doKO(target,source){ target.hp=0; target.action='ko'; target.actionT=0; target.actionDur=1.6; slowmo=1.5; flashT=0.25; shake=0.6; target.knockdowns++; }
function triggerKnockdown(target,source){
  target.hp=Math.max(8,target.hp); target.knockdowns++; slowmo=1.0; flashT=0.2; shake=0.55;
  burst(target,'DOWN!','#ff2b2b',2.0);
  ground = { top:source, bottom:target, tAction:'idle', tT:0, tDur:0, tHitDone:false, cooldown:0.5, getUp:0, mashPrev:false, aiTimer:0.6, enterT:0, poundSide:0 };
  source.action='mount'; source.actionT=0; target.action='downed'; target.actionT=0;
  state='ground';
}

function checkHit(att, def){
  const s = STRIKES[att.action]; if(!s) return;
  const e = att.actionT;
  if (!(e>=s.windup && e<=s.windup+s.active)) return;
  if (att.hitDone) return;
  const d = dist2(att, def); if (d > s.range) return;
  // must roughly face defender (within ~70°)
  const want = faceTo(att, def);
  let diff = Math.abs(((want - att.yaw + Math.PI*3)%(Math.PI*2)) - Math.PI);
  if (diff > 1.3) return;
  att.hitDone = true;
  takeHit(def, att, att.action);
}

// hit-text bursts in 3D → projected to screen
