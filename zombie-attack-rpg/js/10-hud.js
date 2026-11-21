// ============================================================
// HUD
// ============================================================
function drawHUD() {
  const pad = 10;

  // ---- TOP LEFT: Status bars ----
  const bars = [
    {label:'HP',val:P.hp,max:P.maxHp,col:'#f44'},
    {label:'STA',val:P.stamina,max:P.maxStamina,col:'#48f'},
    {label:'HGR',val:P.hunger,max:P.maxHunger,col:'#fa8'},
    {label:'THR',val:P.thirst,max:P.maxThirst,col:'#4af'},
  ];
  bars.forEach((b,i) => {
    const y = pad + i*18;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(pad, y, 150, 14);
    ctx.fillStyle = b.val/b.max<0.25?'#f00':b.col;
    ctx.fillRect(pad, y, 150*(b.val/b.max), 14);
    ctx.strokeStyle='#666'; ctx.lineWidth=1;
    ctx.strokeRect(pad, y, 150, 14);
    ctx.fillStyle='#fff'; ctx.font='10px Courier New';
    ctx.fillText(`${b.label}: ${Math.ceil(b.val)}/${b.max}`, pad+3, y+11);
  });

  // Effects indicators
  let efx = [];
  if(P.effects.adrenaline) efx.push({t:'ADR',c:'#f44'});
  if(P.effects.stealth) efx.push({t:'HIDE',c:'#888'});
  if(P.effects.haste) efx.push({t:'HASTE',c:'#ff4'});
  if(P.effects.overclock) efx.push({t:'OVR',c:'#f4f'});
  efx.forEach((e,i) => {
    ctx.fillStyle=e.c;
    ctx.font='10px Courier New';
    ctx.fillText(e.t, pad+i*50, pad+4*18+14);
  });

  // ---- TOP RIGHT: XP / Level ----
  const xpW = 180, xpH = 14;
  const xpX = W - xpW - pad, xpY = pad;
  ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(xpX,xpY,xpW,xpH);
  ctx.fillStyle='#88f'; ctx.fillRect(xpX,xpY,xpW*(P.xp/P.xpNeeded),xpH);
  ctx.strokeStyle='#666'; ctx.lineWidth=1; ctx.strokeRect(xpX,xpY,xpW,xpH);
  ctx.fillStyle='#fff'; ctx.font='10px Courier New';
  ctx.fillText(`LVL ${P.level}  XP: ${P.xp}/${P.xpNeeded}`, xpX+4, xpY+11);

  // Stats
  ctx.fillStyle='rgba(0,0,0,0.6)';
  ctx.fillRect(xpX,xpY+18,xpW,58);
  ctx.fillStyle='#aaf'; ctx.font='11px Courier New';
  ctx.fillText(`Kills: ${G.kills}  Wave: ${G.wave}`,xpX+4,xpY+30);
  ctx.fillText(`Day ${G.day}  Score: ${G.kills*10}`,xpX+4,xpY+44);
  ctx.fillText(`SP: ${P.skillPoints}`,xpX+4,xpY+58);

  // Day/night clock
  const t = getDayT();
  const hour = Math.floor(t*24);
  const min = Math.floor((t*24%1)*60);
  const timeStr = `${hour.toString().padStart(2,'0')}:${min.toString().padStart(2,'0')}`;
  ctx.fillStyle = isNight()?'#88f':'#ff8';
  ctx.font = 'bold 13px Courier New';
  ctx.fillText(`${isNight()?'🌙':'☀'} ${timeStr} Day ${G.day}`, W-160, xpY+78);

  // Wave timer
  const waveIn = Math.max(0, G.nextWave - G.waveTimer);
  ctx.fillStyle = waveIn<30?'#f44':'#fa8';
  ctx.font='11px Courier New';
  ctx.fillText(`Next wave: ${waveIn.toFixed(0)}s`, W-160, xpY+95);

  // ---- BOTTOM CENTER: Hotbar ----
  const slotSz = 48, slots = 8;
  const hbX = W/2 - slots*slotSz/2, hbY = H - slotSz - pad;
  for(let i=0;i<slots;i++) {
    const it = P.hotbar[i];
    ctx.fillStyle = i===P.equipped?'rgba(255,200,0,0.3)':'rgba(0,0,0,0.7)';
    ctx.fillRect(hbX+i*slotSz, hbY, slotSz-2, slotSz-2);
    ctx.strokeStyle = i===P.equipped?'#fc0':'#666';
    ctx.lineWidth = i===P.equipped?2:1;
    ctx.strokeRect(hbX+i*slotSz, hbY, slotSz-2, slotSz-2);

    if(it) {
      ctx.fillStyle = it.type==='melee'?'#fa8':it.type==='ranged'?'#8af':'#8f8';
      ctx.font='18px serif';
      ctx.fillText(it.icon||'?', hbX+i*slotSz+8, hbY+28);
      if(it.ammo!==undefined) {
        ctx.fillStyle='#ff8'; ctx.font='9px Courier New';
        ctx.fillText(`${it.ammo}`, hbX+i*slotSz+2, hbY+slotSz-4);
      }
      if(it.dur&&it.dur<999) {
        ctx.fillStyle='#f80'; ctx.font='9px Courier New';
        ctx.fillText(`${it.dur}`, hbX+i*slotSz+30, hbY+slotSz-4);
      }
    }

    ctx.fillStyle='#888'; ctx.font='9px Courier New';
    ctx.fillText(i+1, hbX+i*slotSz+2, hbY+10);
  }

  // Current weapon + ammo
  const cw = getEquipped();
  const cr = getEquippedRanged();
  ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(W-200,H-95,195,90);
  ctx.fillStyle='#ff8'; ctx.font='bold 12px Courier New';
  ctx.fillText(cw?.name||'Fist', W-196, H-76);
  if(cw?.dur&&cw.dur<999) {
    ctx.fillStyle='#f80'; ctx.font='11px Courier New';
    ctx.fillText(`DUR: ${cw.dur}/${cw.maxDur}`, W-196, H-62);
  }
  if(cr) {
    ctx.fillStyle='#8af'; ctx.font='11px Courier New';
    ctx.fillText(`${cr.name}: ${cr.ammo}/${cr.maxAmmo}`, W-196, H-46);
  }
  ctx.fillStyle='#aaa'; ctx.font='10px Courier New';
  ctx.fillText('RClick:Shoot  R:Reload', W-196, H-30);
  ctx.fillText('LClick:Melee  E:Loot', W-196, H-16);

  // ---- MINIMAP (bottom right) ----
  drawMinimap();

  // ---- SKILL BAR ----
  drawSkillBar();

  // Zone name
  let curZone = null;
  ZONES.forEach(z => {
    if(P.x>z.x&&P.x<z.x+z.w&&P.y>z.y&&P.y<z.y+z.h) curZone=z.name;
  });
  if(curZone) {
    ctx.fillStyle='rgba(0,0,0,0.5)';
    ctx.fillRect(W/2-80, 10, 160, 20);
    ctx.fillStyle='#ff8'; ctx.font='12px Courier New';
    ctx.textAlign='center';
    ctx.fillText(curZone, W/2, 24);
    ctx.textAlign='left';
  }

  // Wave progress bar
  const waveY = H - slotSz - pad - 20;
  ctx.fillStyle='rgba(0,0,0,0.5)';
  ctx.fillRect(W/2-120, waveY, 240, 12);
  const waveAlive = ZOMBIES.filter(z=>!z.dead).length;
  if(waveAlive > 0) {
    ctx.fillStyle='#f44';
    ctx.fillRect(W/2-120, waveY, 240*(waveAlive/Math.max(1,waveAlive+5)), 12);
    ctx.fillStyle='#fff'; ctx.font='9px Courier New'; ctx.textAlign='center';
    ctx.fillText(`${waveAlive} zombies remaining`, W/2, waveY+10);
    ctx.textAlign='left';
  }

  // Kill counter top center
  ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(W/2-60,36,120,18);
  ctx.fillStyle='#f44'; ctx.font='bold 12px Courier New'; ctx.textAlign='center';
  ctx.fillText(`☠ ${G.kills} KILLS`, W/2, 50);
  ctx.textAlign='left';

  // Weather indicator
  if(G.weather!=='clear') {
    ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(pad,H/2-15,80,18);
    ctx.fillStyle='#8cf'; ctx.font='11px Courier New';
    ctx.fillText(G.weather==='rain'?'🌧 RAIN':'🌫 FOG', pad+4,H/2);
  }
}

function drawMinimap() {
  const mmW=160, mmH=160, mmX=W-mmW-10, mmY=H-mmH-120;
  const scaleX = mmW/WORLD_W, scaleY = mmH/WORLD_H;

  ctx.fillStyle='rgba(0,0,0,0.7)';
  ctx.fillRect(mmX,mmY,mmW,mmH);
  ctx.strokeStyle='#666'; ctx.lineWidth=1; ctx.strokeRect(mmX,mmY,mmW,mmH);

  // Zones
  ZONES.forEach(z => {
    ctx.fillStyle=z.color+'88';
    ctx.fillRect(mmX+z.x*scaleX, mmY+z.y*scaleY, z.w*scaleX, z.h*scaleY);
  });

  // Safe house
  const sh = BUILDINGS.find(b=>b.safe);
  if(sh) {
    ctx.fillStyle='#0f0';
    ctx.fillRect(mmX+sh.x*scaleX-2,mmY+sh.y*scaleY-2,4,4);
  }

  // Supply drops
  G.supplyDrops.forEach(sd=>{
    if(!sd.collected) {
      ctx.fillStyle='#fa4';
      ctx.fillRect(mmX+sd.x*scaleX-2,mmY+sd.y*scaleY-2,4,4);
    }
  });

  // Nearby zombies
  ctx.fillStyle='#f44';
  ZOMBIES.forEach(z=>{
    if(!z.dead && dist(z,P)<600) {
      ctx.fillRect(mmX+z.x*scaleX-1,mmY+z.y*scaleY-1,2,2);
    }
  });

  // Player
  ctx.fillStyle='#fff';
  ctx.beginPath();
  ctx.arc(mmX+P.x*scaleX, mmY+P.y*scaleY, 3, 0, Math.PI*2);
  ctx.fill();

  // FOV indicator on minimap
  ctx.strokeStyle='#ffffff44'; ctx.lineWidth=1;
  ctx.strokeRect(mmX+Math.max(0,P.x-W/2)*scaleX, mmY+Math.max(0,P.y-H/2)*scaleY, W*scaleX, H*scaleY);

  ctx.fillStyle='#aaa'; ctx.font='9px Courier New';
  ctx.fillText('MAP', mmX+mmW/2-10, mmY-3);
}

function drawSkillBar() {
  const cls = CLASSES[P.class];
  const keys = ['Q','F','G'];
  const skillX = W/2-75, skillY = H - 140;

  keys.forEach((key,i) => {
    const skillId = cls.skills[i];
    const def = SKILL_DEFS[skillId];
    if(!def) return;
    const cd = P.skillCDs[key]||0;
    const maxCd = def.cd;
    const x = skillX + i*55;

    ctx.fillStyle='rgba(0,0,0,0.7)';
    ctx.fillRect(x,skillY,48,48);
    ctx.strokeStyle=cd>0?'#666':def.color||'#888';
    ctx.lineWidth=2; ctx.strokeRect(x,skillY,48,48);

    // CD overlay
    if(cd>0) {
      ctx.fillStyle=`rgba(0,0,0,${0.7*cd/maxCd})`;
      ctx.fillRect(x,skillY,48,48*(cd/maxCd));
    }

    ctx.fillStyle=cd>0?'#666':'#fff';
    ctx.font='10px Courier New'; ctx.textAlign='center';
    ctx.fillText(def.name.slice(0,6), x+24, skillY+28);
    ctx.fillStyle='#aaa'; ctx.font='9px Courier New';
    ctx.fillText(key, x+24, skillY+10);
    if(cd>0) ctx.fillText(cd.toFixed(0)+'s', x+24, skillY+42);
    ctx.textAlign='left';
  });
}

