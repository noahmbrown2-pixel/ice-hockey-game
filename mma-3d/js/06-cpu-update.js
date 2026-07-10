function tickCpu(c, dt){
  c.yaw = faceTo(c, player);
  c.aiTimer -= dt;
  const d = dist2(c, player);
  const ps = STRIKES[player.action];
  const incoming = ps && player.actionT < ps.windup+ps.active;
  const heavy = incoming && (ps.crit>=0.2||ps.type==='kick'||ps.type==='knee');
  if (heavy && d<2.4 && Math.random()<c.aiRct*dt*55){
    if (c.dodgeCD<=0 && ps.height!=='low' && Math.random()<0.5) startDodge(c);
    else if (c.action==='idle') startBlock(c);
  } else if (incoming && ps.type==='punch' && d<1.7 && Math.random()<c.aiRct*dt*35){
    if (c.dodgeCD<=0 && Math.random()<0.3) startDodge(c);
  } else if (c.action==='block' && (!incoming||d>2.4)) endAction(c);

  if (c.action==='idle' && c.aiTimer<=0){
    c.aiTimer = 0.28+Math.random()*0.55;
    if (d>4) c.aiState='advance';
    else if (d>2.3) c.aiState = (Math.random()<c.aiAgg)?(Math.random()<0.5?'advance':'pick'):'bob';
    else { if (c.stamina<22) c.aiState='retreat';
      else { const r=Math.random(); c.aiState = r<c.aiAgg*0.62?'strike':r<0.85?'sidestep':'guard'; } }
  }
  // positioning is automatic (maintainPosition keeps the pocket) — AI only decides strikes/guard
  if (c.action==='idle'){
    if (c.aiState==='pick'){ if(d<2.2) startStrike(c, Math.random()<0.6?'jab':'legkick'); }
    else if (c.aiState==='strike'){
      const r=Math.random(); let pick;
      if (d<1.25) pick = r<0.4?'knee':r<0.7?'uppercut':'elbow';
      else if (d<1.65) pick = r<0.3?'cross':r<0.55?'hook':r<0.8?'bodykick':'uppercut';
      else pick = r<0.35?'legkick':r<0.6?'bodykick':r<0.82?'headkick':'flyingknee';
      startStrike(c, pick);
    } else if (c.aiState==='guard') startBlock(c);
  }
  tickAction(c, dt);
}

function update(dt){
  roundClock -= dt;
  tickPlayer(player, dt);
  tickCpu(cpu, dt);
  maintainPosition(player, cpu, dt);
  maintainPosition(cpu, player, dt);
  separate(player, cpu);
  clampToCage(player); clampToCage(cpu);
  checkHit(player, cpu); checkHit(cpu, player);
  if (player.hp<=0||cpu.hp<=0){ state='roundover'; setTimeout(roundEnd,1500); }
  else if (roundClock<=0){ roundClock=0; state='roundover'; setTimeout(roundEnd,800); }
}

// ─────────────────────────────────────────────
//  Ground & pound
// ─────────────────────────────────────────────
function updateGround(dt){
  const g=ground; g.enterT+=dt;
  if (g.cooldown>0) g.cooldown=Math.max(0,g.cooldown-dt);
  if (g.top.flinch>0) g.top.flinch=Math.max(0,g.top.flinch-dt);
  if (g.bottom.flinch>0) g.bottom.flinch=Math.max(0,g.bottom.flinch-dt);
  if (g.tAction!=='idle'){
    g.tT+=dt; const contact=g.tDur*0.72;   // hit lands at the bottom of the slam
    if (!g.tHitDone && g.tT>=contact){ g.tHitDone=true; groundLand(g); }
    if (g.tT>=g.tDur){ g.tAction='idle'; g.tT=0; }
  }
  if (g.tAction==='idle' && g.cooldown<=0){
    if (g.top.isPlayer){ if(keys['j'])startGroundStrike(g,'punch'); else if(keys['e'])startGroundStrike(g,'elbow'); }
    else { g.aiTimer-=dt; if(g.aiTimer<=0){ g.aiTimer=0.45+Math.random()*0.35; startGroundStrike(g, Math.random()<0.6?'punch':'elbow'); } }
  }
  // Escape gets HARDER each time you're dropped. 1st knockdown = easy to recover,
  // every subsequent one slows the get-up meter (and drains stamina faster).
  const kd = Math.max(1, g.bottom.knockdowns);          // 1 on first drop, 2 on second…
  const diff = 1 + (kd - 1) * 1.15;                      // 1.0, 2.15, 3.3 …
  let fill = (0.10*dt) / diff;
  if (g.bottom.isPlayer){ const m=keys['a']||keys['d']||keys[' ']; if(m&&!g.mashPrev)fill+=0.06/diff; g.mashPrev=m; }
  else fill += ((0.10+g.bottom.aiRct*0.15)*dt) / diff;
  g.getUp = Math.min(1, g.getUp+fill);
  if (g.bottom.hp<=0){ groundFinish(g.top); return; }
  if (g.getUp>=1 && g.enterT>0.6){ groundStandUp(); return; }
}
