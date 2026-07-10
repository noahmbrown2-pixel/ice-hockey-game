function startGroundStrike(g, kind){
  const cost = kind==='elbow'?7:5; if (g.top.stamina<cost) return;
  g.poundSide = g.poundSide ? 0 : 1;   // alternate fists each strike for a visible flurry
  g.top.stamina=Math.max(0,g.top.stamina-cost); g.tAction=kind; g.tT=0; g.tDur=kind==='elbow'?0.34:0.28; g.tHitDone=false; g.cooldown=0.06;
}
function groundLand(g){
  const kind=g.tAction; const guarded=Math.random()<0.30;
  const dmg=(kind==='elbow'?11:7)*(guarded?0.35:1);
  g.bottom.hp-=dmg; g.getUp=Math.max(0,g.getUp-(kind==='elbow'?0.10:0.06)); g.bottom.flinch=0.2;
  playHit(kind==='elbow'?'elbow':'jab'); shake=Math.max(shake,kind==='elbow'?0.5:0.36);
  if (g.top.isPlayer && !guarded) flashT=Math.max(flashT,0.10);   // pop the screen on each landed pound
  burst(g.bottom, guarded?'GUARD':(kind==='elbow'?'SLICE':'POUND'), guarded?'#9fdcff':(kind==='elbow'?'#ff2b2b':'#ffd23b'), 1.35);
  if (g.bottom.hp<=0){ g.bottom.hp=0; flashT=0.25; slowmo=1.2; }
}
function groundStandUp(){
  const b=ground.bottom;
  // less recovery health each subsequent knockdown — you bounce back weaker
  const recover = Math.max(12, Math.round(b.maxHp*0.20) - (Math.max(1,b.knockdowns)-1)*Math.round(b.maxHp*0.08));
  b.hp=Math.max(b.hp,recover); b.action='idle'; b.actionT=0; b.flinch=0;
  ground.top.action='idle'; ground.top.actionT=0;
  player.x=0; player.z=-1.6; cpu.x=0; cpu.z=1.6;
  burst(b,'UP!','#44ff88',2.2);
  ground=null; state='fight';
}
function groundFinish(winner){
  ground.bottom.action='ko'; ground=null; state='roundover';
  endTitle = winner.isPlayer?'VICTORY!':'DEFEAT';
  endSub = 'Round '+round+' · '+winner.name+' wins by TKO (ground & pound)';
  setTimeout(()=>finishMatch(winner.isPlayer?'player':'cpu', true), 1400);
}

function roundEnd(){
  if (state!=='roundover') return;
  let winner=null;
  if (player.hp<=0) winner='cpu'; else if (cpu.hp<=0) winner='player';
  else if (player.hp>cpu.hp) winner='player'; else if (cpu.hp>player.hp) winner='cpu';
  if (winner==='player') scoreP++; else if (winner==='cpu') scoreC++;
  const over = (round>=TOTAL_ROUNDS)||player.hp<=0||cpu.hp<=0;
  if (over) finishMatch(winner);
  else { round++; setupRound(); state='fight'; playBell(); }
}
function finishMatch(winner, tko){
  state='end';
  let title='DRAW', sub='';
  if (tko){ title=endTitle; sub=endSub; }
  else if (player.hp<=0){ title='KNOCKED OUT'; sub='Round '+round+' · '+cpu.name+' wins by KO'; }
  else if (cpu.hp<=0){ title='VICTORY!'; sub='Round '+round+' · You win by KO!'; }
  else if (scoreP>scoreC){ title='VICTORY!'; sub='You win on the cards · '+scoreP+'-'+scoreC; }
  else if (scoreC>scoreP){ title='DEFEAT'; sub=cpu.name+' wins on the cards · '+scoreC+'-'+scoreP; }
  else { title='DRAW'; sub='Split decision · '+scoreP+'-'+scoreC; }
  document.getElementById('endt').textContent=title;
  document.getElementById('ends').textContent=sub;
  document.getElementById('endx').textContent='Knockdowns — you dropped '+cpu.name+' '+cpu.knockdowns+'× · you were dropped '+player.knockdowns+'×   •   HP: you '+Math.round(player.hp)+' · '+cpu.name+' '+Math.round(cpu.hp);
  document.getElementById('endscr').classList.add('active');
  playBell();
}

// ─────────────────────────────────────────────
//  Posing — set target rotations, lerp toward them
// ─────────────────────────────────────────────
function phase(b){ const s=STRIKES[b.action]; const t=b.actionT;
  if (t<s.windup) return t/s.windup;
  if (t<s.windup+s.active) return 1;
  return Math.max(0, 1-(t-s.windup-s.active)/s.recover);
}
function computePose(b){
  // rest fighting stance (hands up, knees bent, legs spread)
  // dominant wide athletic stance: feet spread, knees bent, weight loaded
  const p = {
    torsoX:0.06, torsoY:0.16, torsoZ:0, rootDip:-0.07, lunge:0, lift:0,   // torsoY = blade upper body; rootDip seats the wide stance on the mat
    shLx:-0.55, shLz:0.55, elL:-1.75,
    shRx:-0.55, shRz:-0.55, elR:-1.75,
    // SOUTHPAW bladed stance — WIDE base: RIGHT leg leads (well forward), LEFT leg trails (well back)
    hipRx:-0.45, hipRz:-0.30, knR:0.55,   // lead leg — planted well out in front, flat-footed
    hipLx:0.32,  hipLz:0.30,  knL:0.16,   // rear power leg — straight & angled back, foot planted on the mat
  };
  const a = b.action, s = STRIKES[a];
  const e = s ? phase(b) : 0;
  if (a==='block'){ p.shLx=-0.7; p.shRx=-0.7; p.elL=-2.1; p.elR=-2.1; p.shLz=0.3; p.shRz=-0.3; p.torsoX=0.2; }
  else if (a==='dodge'){ p.rootDip=-b.kneesBent*0.3; p.torsoX=0.15+b.kneesBent*0.2; p.torsoZ=0.2; }
  else if (a==='hit'){ p.torsoX=-0.25; p.shLx=-0.2; p.shRx=-0.2; }
  else if (s){
    // every strike drives the body forward (lunge) so the blow actually reaches the target
    if (a==='jab'){ p.shLx=-0.5-e*1.0; p.elL=-1.7+e*1.6; p.torsoY=-e*0.15; p.lunge=e*0.16; }
    else if (a==='cross'){ p.shRx=-0.5-e*1.1; p.elR=-1.7+e*1.6; p.torsoY=e*0.4; p.torsoX=0.08+e*0.05; p.lunge=e*0.20; }
    else if (a==='hook'){ p.shRx=-1.2; p.shRz=-0.5-e*0.9; p.elR=-1.3; p.torsoY=e*0.5; p.lunge=e*0.18; }
    else if (a==='uppercut'){ p.shRx=-0.3-e*0.7; p.elR=-2.2+e*1.0; p.torsoY=e*0.35; p.torsoX=0.08-e*0.1; p.lunge=e*0.18; }
    // LOW kick — REAR (left) shin to the thigh: rear leg sweeps forward-low
    else if (a==='legkick'){ p.hipLx=0.32-e*1.55; p.knL=0.16-e*0.1; p.hipLz=0.30+e*0.30; p.torsoX=0.06+e*0.18; p.torsoZ=e*0.22; p.lunge=e*0.42; }
    // MID kick — REAR shin to the ribs: rear leg swings to hip/torso height, hips turn over
    else if (a==='bodykick'){ p.hipLx=0.32-e*2.15; p.knL=0.16-e*0.08; p.hipLz=0.30+e*0.40; p.torsoX=0.06+e*0.22; p.torsoZ=e*0.32; p.shRx=-1.0; p.lunge=e*0.46; }
    // HIGH kick — REAR shin whips up ABOVE hip height to the head + body lifts & leans back
    else if (a==='headkick'){ p.hipLx=0.32-e*3.05; p.knL=0.16-e*0.1; p.hipLz=0.30+e*0.5; p.torsoX=0.06-e*0.30; p.torsoZ=e*0.45; p.shRx=-1.4; p.shLx=0.3; p.lunge=e*0.46; p.lift=e*0.22; }
    // KNEE — drives the REAR knee up into the body, close range
    else if (a==='knee'){ p.hipLx=0.32-e*2.05; p.knL=0.16+e*1.95; p.torsoX=0.06+e*0.15; p.shLx=-1.0; p.shRx=-1.0; p.elL=-2.0; p.elR=-2.0; p.lunge=e*0.34; }
    // FLYING KNEE — leaps in (jumpY) and spears the REAR knee to the head, lead leg tucks
    else if (a==='flyingknee'){ p.hipLx=0.32-e*1.95; p.knL=0.16+e*2.15; p.hipRx=-0.45+e*0.85; p.knR=0.55+e*1.0; p.shLx=-1.2; p.shRx=-1.2; p.lunge=e*0.55; }
    else if (a==='elbow'){ p.shRx=-1.3; p.shRz=-0.3-e*0.6; p.elR=-2.2+e*0.5; p.torsoY=e*0.4; p.lunge=e*0.18; }
  }
  return p;
}
