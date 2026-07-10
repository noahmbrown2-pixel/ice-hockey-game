const camPos = new T.Vector3(0,4,-9), camLook = new T.Vector3(0,1,0);
function updateCamera(dt){
  let desired, look;
  if (state==='ground' && ground){
    const g=ground; const mx=(g.top.x+g.bottom.x)/2, mz=(g.top.z+g.bottom.z)/2;
    const ang = g.top.yaw;
    // tight, low side angle so the ground-and-pound fills the screen and the fists are clearly visible
    desired = new T.Vector3(mx - Math.sin(ang)*1.25 + Math.cos(ang)*1.05, 1.45, mz - Math.cos(ang)*1.25 - Math.sin(ang)*1.05);
    look = new T.Vector3(mx, 0.62, mz);
  } else {
    // FACE-TO-FACE side view: camera sits perpendicular to the line between the
    // two fighters, framing both in profile (player always on the left).
    const ax = cpu.x - player.x, az = cpu.z - player.z;
    const sep = Math.hypot(ax, az) || 1;
    const axis = { x: ax/sep, z: az/sep };
    const perp = { x: axis.z, z: -axis.x };   // perpendicular → keeps player on screen-left
    const mid = new T.Vector3((player.x+cpu.x)/2, 1.1, (player.z+cpu.z)/2);
    const camDist = Math.min(9, Math.max(4.4, 3.2 + sep*1.05));   // zoom out as they separate
    desired = new T.Vector3(mid.x + perp.x*camDist, 2.0, mid.z + perp.z*camDist);
    look = mid;
  }
  const k = 1-Math.exp(-6*dt);
  camPos.lerp(desired, k); camLook.lerp(look, k);
  let ox=0, oy=0;
  if (shake>0){ ox=(Math.random()-0.5)*shake; oy=(Math.random()-0.5)*shake; }
  camera.position.set(camPos.x+ox, camPos.y+oy, camPos.z);
  camera.lookAt(camLook);
}

// ─────────────────────────────────────────────
//  HUD update + burst projection
// ─────────────────────────────────────────────
const $ = id => document.getElementById(id);
function buildPips(id, n){ const c=$(id); c.innerHTML=''; for(let i=0;i<MAX_KD;i++){const d=document.createElement('div');d.className='pip'+(i<n?' on':'');c.appendChild(d);} }
function updateHud(){
  $('phpf').style.width=Math.max(0,player.hp/player.maxHp*100)+'%';
  $('chpf').style.width=Math.max(0,cpu.hp/cpu.maxHp*100)+'%';
  $('pstf').style.width=player.stamina+'%';
  $('cstf').style.width=cpu.stamina+'%';
  $('plgf').style.width=Math.min(100,player.legDmg)+'%';
  $('clgf').style.width=Math.min(100,cpu.legDmg)+'%';
  buildPips('ppips', player.knockdowns); buildPips('cpips', cpu.knockdowns);
  $('rnd').textContent='R'+round;
  const m=Math.floor(roundClock/60), s=Math.floor(roundClock%60);
  const clk=$('clk'); clk.textContent=m+':'+(s<10?'0':'')+s; clk.className='clk'+(roundClock<10?' danger':'');
  $('scr').textContent=scoreP+' - '+scoreC;
  // ground prompts
  const pr=$('prompt'), gu=$('getup');
  if (state==='ground' && ground){
    if (ground.top.isPlayer){ pr.style.display='block'; pr.textContent='FINISH!  J = punch · E = elbow'; gu.style.display='none'; }
    else { pr.style.display='block'; pr.textContent='DEFEND!  mash A / D / SPACE to get up'; gu.style.display='block'; $('getupf').style.width=(ground.getUp*100)+'%'; }
  } else { pr.style.display='none'; gu.style.display='none'; }
  // banner
  const bn=$('banner');
  if (state==='roundover'){ bn.style.display='block';
    bn.textContent = player.hp<=0?'YOU GOT FINISHED':cpu.hp<=0?'FINISH!':'END OF ROUND '+round; }
  else bn.style.display='none';
}
function updateBursts(dt){
  for (let i=bursts.length-1;i>=0;i--){ const b=bursts[i]; b.t+=dt; b.y+=b.vy*dt; b.vy-=2*dt;
    const a=1-b.t/b.life;
    if (a<=0){ b.el.remove(); bursts.splice(i,1); continue; }
    const v=new T.Vector3(b.x,b.y,b.z).project(camera);
    b.el.style.left=((v.x*0.5+0.5)*window.innerWidth)+'px';
    b.el.style.top=((-v.y*0.5+0.5)*window.innerHeight)+'px';
    b.el.style.opacity=a; b.el.style.transform='translate(-50%,-50%) scale('+(1+(1-a)*0.6)+')';
  }
}

// ─────────────────────────────────────────────
//  Main loop
// ─────────────────────────────────────────────
let last = performance.now();
function loop(now){
  requestAnimationFrame(loop);
  let dt=(now-last)/1000; last=now; if(dt>0.1)dt=0.1;
  if (slowmo>0){ slowmo-=dt; dt*=0.32; }

  if (state==='fight') update(dt);
  else if (state==='ground') updateGround(dt);

  if (player&&cpu){
    if (state==='ground' && ground){ poseGround(ground); }
    else { applyPose(player, dt); applyPose(cpu, dt); }
  }
  updateCamera(dt);
  updateBursts(dt);
  if (flashT>0){ flashT=Math.max(0,flashT-dt*1.5); $('flash').style.opacity=flashT; } else $('flash').style.opacity=0;
  if (shake>0) shake=Math.max(0,shake-dt*1.8);
  updateHud();
  renderer.render(scene, camera);
}

// dummy fighters for the title screen
setupRound(); state='title';
$('fightBtn').onclick = ()=>{ ensureAudio(); resetMatch(); };
$('rematchBtn').onclick = ()=>{ resetMatch(); };
requestAnimationFrame(loop);
