// ============================================================
// DRAWING
// ============================================================
function drawBackground() {
  const sky = getSkyColor();
  ctx.fillStyle = sky;
  ctx.fillRect(0,0,W,H);

  // Stars at night
  const t = getDayT();
  if(t > 0.6 || t < 0.15) {
    const alpha = t>0.6 ? Math.min(1,(t-0.6)/0.1) : Math.min(1,(0.15-t)/0.05);
    ctx.fillStyle = `rgba(255,255,255,${alpha*0.8})`;
    // Static stars based on seed
    for(let i=0;i<200;i++) {
      const sx2 = (i*137.5%1)*W;
      const sy2 = (i*97.3%1)*H*0.6;
      ctx.fillRect(sx2,sy2,1+i%2,1+i%2);
    }
    // Moon
    ctx.beginPath();
    ctx.arc(W*0.8, H*0.15, 30, 0, Math.PI*2);
    ctx.fillStyle = `rgba(240,240,200,${alpha*0.9})`;
    ctx.fill();
  }
}

function drawGround() {
  // Base grass
  ctx.fillStyle = '#3a6a18';
  ctx.fillRect(0, 0, W, H);

  // Zone fills
  ZONES.forEach(z => {
    ctx.fillStyle = z.color;
    ctx.fillRect(sx(z.x), sy(z.y), z.w, z.h);

    // Hay field rows — horizontal golden lines
    if(z.loot==='crop' || z.name.includes('Hay Field')) {
      ctx.strokeStyle = 'rgba(180,130,20,0.45)';
      ctx.lineWidth = 5;
      ctx.setLineDash([]);
      const rowSpacing = 22;
      const startRow = Math.floor(z.y/rowSpacing)*rowSpacing;
      for(let wy=startRow; wy<z.y+z.h; wy+=rowSpacing) {
        const screenY = sy(wy);
        if(screenY < -10 || screenY > H+10) continue;
        ctx.beginPath();
        ctx.moveTo(sx(z.x), screenY);
        ctx.lineTo(sx(z.x+z.w), screenY);
        ctx.stroke();
      }
    }
  });

  // Dirt paths
  ctx.setLineDash([]);
  ROADS.forEach(r => {
    ctx.strokeStyle = '#9b7040';
    ctx.lineWidth = r.w;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx(r.x1),sy(r.y1));
    ctx.lineTo(sx(r.x2),sy(r.y2));
    ctx.stroke();
    // Worn center strip
    ctx.strokeStyle = '#b08850';
    ctx.lineWidth = r.w * 0.35;
    ctx.setLineDash([30,20]);
    ctx.beginPath();
    ctx.moveTo(sx(r.x1),sy(r.y1));
    ctx.lineTo(sx(r.x2),sy(r.y2));
    ctx.stroke();
    ctx.setLineDash([]);
  });
  ctx.lineCap = 'butt';
}

function drawBuildings() {
  BUILDINGS.forEach(b => {
    const bsx = sx(b.x), bsy = sy(b.y);
    if(bsx > W+100 || bsx < -b.w-100 || bsy > H+100 || bsy < -b.h-100) return;

    const looted = b.looted;

    // Building body
    ctx.fillStyle = looted ? '#554433' : b.color;
    ctx.fillRect(bsx, bsy, b.w, b.h);

    // Roof / inner floor tint
    ctx.fillStyle = looted ? '#665544' : b.color2;
    ctx.fillRect(bsx+3, bsy+3, b.w-6, b.h-6);

    // Tavern special: timber frame lines
    if(b.isTavern) {
      ctx.strokeStyle = '#5a3810';
      ctx.lineWidth = 4;
      ctx.strokeRect(bsx+3, bsy+3, b.w-6, b.h-6);
      // Cross beams
      ctx.beginPath();
      ctx.moveTo(bsx+3, bsy+b.h/2); ctx.lineTo(bsx+b.w-3, bsy+b.h/2);
      ctx.moveTo(bsx+b.w/2, bsy+3); ctx.lineTo(bsx+b.w/2, bsy+b.h-3);
      ctx.stroke();
      // Tavern sign above door
      ctx.fillStyle = '#3a2005';
      ctx.fillRect(bsx+b.w/2-35, bsy-22, 70, 18);
      ctx.fillStyle = '#f0c060';
      ctx.font = 'bold 11px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('🍺 TAVERN', bsx+b.w/2, bsy-9);
      ctx.textAlign = 'left';
    }

    // Barn: red siding planks
    if(b.zone==='barn') {
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 2;
      for(let i=1;i<4;i++) {
        ctx.beginPath();
        ctx.moveTo(bsx, bsy+b.h*i/4);
        ctx.lineTo(bsx+b.w, bsy+b.h*i/4);
        ctx.stroke();
      }
      // X on barn door
      ctx.strokeStyle = '#5a1008';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx(b.doorX), sy(b.doorY)-20);
      ctx.lineTo(sx(b.doorX)+24, sy(b.doorY));
      ctx.moveTo(sx(b.doorX)+24, sy(b.doorY)-20);
      ctx.lineTo(sx(b.doorX), sy(b.doorY));
      ctx.stroke();
    }

    // Windows (farmhouse / tavern / mill)
    if(b.zone!=='barn') {
      ctx.fillStyle = isNight() ? 'rgba(255,230,100,0.7)' : 'rgba(140,210,255,0.5)';
      const wCount = Math.max(1, Math.floor(b.w/30));
      for(let i=0;i<wCount;i++) {
        ctx.fillRect(bsx+10+i*26, bsy+10, 14, 11);
        if(b.h>60) ctx.fillRect(bsx+10+i*26, bsy+b.h-28, 14, 11);
      }
    }

    // Door
    ctx.fillStyle = b.isTavern ? '#4a2800' : '#6a4020';
    ctx.fillRect(sx(b.doorX), sy(b.doorY)-18, 22, 20);

    // Safe house label
    if(b.safe) {
      ctx.fillStyle = '#0f0';
      ctx.font = 'bold 11px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('SAFE HOUSE', bsx+b.w/2, bsy-8);
      ctx.textAlign = 'left';
    }

    // Looting prompt
    if(Math.hypot(P.x-b.doorX,P.y-b.doorY)<55) {
      ctx.fillStyle = '#ff8';
      ctx.font = '12px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText(looted?'[Empty]':'[E] Loot', bsx+b.w/2, bsy-8);
      ctx.textAlign = 'left';
    }
  });
}

function drawBarricades() {
  G.barricades.forEach(b => {
    if(b.hp<=0) return;
    const ratio = b.hp/b.maxHp;
    ctx.save();
    ctx.translate(sx(b.x), sy(b.y));
    ctx.fillStyle = `rgba(${Math.floor(100+100*(1-ratio))},${Math.floor(80*ratio)},0,1)`;
    ctx.fillRect(-b.w/2,-b.h/2,b.w,b.h);
    // HP bar
    ctx.fillStyle='#f00'; ctx.fillRect(-b.w/2,-b.h/2-6,b.w,4);
    ctx.fillStyle='#0f0'; ctx.fillRect(-b.w/2,-b.h/2-6,b.w*ratio,4);
    ctx.restore();
  });
}

function drawTraps() {
  G.traps.forEach(t => {
    if(!t.active) return;
    ctx.fillStyle = '#888';
    ctx.fillRect(sx(t.x)-8, sy(t.y)-3, 16, 6);
    ctx.fillStyle = '#a44';
    ctx.fillRect(sx(t.x)-1, sy(t.y)-8, 2, 16);
  });
}

function drawSupplyDrops() {
  G.supplyDrops.forEach(sd => {
    if(sd.collected) return;
    const time = Date.now()/500;
    const bx = sx(sd.x), by = sy(sd.y);
    ctx.fillStyle = '#fa4';
    ctx.fillRect(bx-15, by-15+(Math.sin(time)*3), 30, 20);
    ctx.fillStyle = '#f84';
    ctx.fillRect(bx-20, by-18+(Math.sin(time)*3), 40, 6);
    ctx.fillStyle = '#fff';
    ctx.font = '10px Courier New';
    ctx.fillText('SUPPLY', bx-18, by-20+(Math.sin(time)*3));

    if(dist(sd,P)<50) {
      ctx.fillStyle='#ff8';
      ctx.font='12px Courier New';
      ctx.fillText('[E] Collect',bx-25,by-30);
    }
  });
}

function drawZombies() {
  ZOMBIES.forEach(z => {
    if(z.dead) return;
    const zsx = sx(z.x), zsy = sy(z.y);
    if(zsx < -50 || zsx > W+50 || zsy < -50 || zsy > H+50) return;

    ctx.save();
    ctx.translate(zsx, zsy);

    // Body
    ctx.fillStyle = z.color;
    ctx.beginPath();
    ctx.arc(0, 0, z.size, 0, Math.PI*2);
    ctx.fill();

    // Face direction
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(Math.cos(z.angle)*z.size*0.5, Math.sin(z.angle)*z.size*0.5, 3, 0, Math.PI*2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#f00';
    const ey = -z.size*0.3;
    ctx.fillRect(-z.size*0.35, ey, 5, 4);
    ctx.fillRect(z.size*0.1, ey, 5, 4);

    // Boss indicator
    if(z.type==='boss') {
      ctx.strokeStyle='#f44'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(0,0,z.size+4,0,Math.PI*2); ctx.stroke();
    }

    // HP bar
    const hpRatio = z.hp/z.maxHp;
    const bw = z.size*2+4;
    ctx.fillStyle='#400'; ctx.fillRect(-bw/2,-z.size-8,bw,4);
    ctx.fillStyle=hpRatio>0.5?'#0f0':'#f80'; ctx.fillRect(-bw/2,-z.size-8,bw*hpRatio,4);

    // Stunned indicator
    if(z.stunned>0) {
      ctx.fillStyle='rgba(100,100,255,0.5)';
      ctx.beginPath(); ctx.arc(0,0,z.size,0,Math.PI*2); ctx.fill();
    }

    ctx.restore();
  });
}

function drawBullets() {
  BULLETS.forEach(b => {
    ctx.fillStyle = b.fromPlayer ? '#ff8' : '#f44';
    ctx.beginPath();
    ctx.arc(sx(b.x), sy(b.y), 3, 0, Math.PI*2);
    ctx.fill();
  });
}

function drawParticles() {
  PARTICLES.forEach(p => {
    if(p.type==='loot') {
      // Ground loot
      ctx.fillStyle = '#ff8';
      ctx.font = '14px serif';
      ctx.fillText(ITEMS[p.id]?.icon||'?', sx(p.x)-7, sy(p.y)+7);
      if(dist(p,P)<40) {
        ctx.fillStyle='#ff8';
        ctx.font='11px Courier New';
        ctx.fillText(`[E] ${ITEMS[p.id]?.name||p.id}`,sx(p.x)-20,sy(p.y)-15);
      }
      return;
    }
    const alpha = p.life/p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.col;
    ctx.beginPath();
    ctx.arc(sx(p.x), sy(p.y), p.size, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function drawPlayer() {
  const px = sx(P.x), py = sy(P.y);
  ctx.save();
  ctx.translate(px, py);

  // Stealth
  if(P.effects.stealth) ctx.globalAlpha = 0.4;

  // Damage flash
  if(P.damageFlash > 0) {
    ctx.shadowColor='#f00'; ctx.shadowBlur=20;
  }

  // Body
  const cls = CLASSES[P.class];
  ctx.fillStyle = P.dead ? '#555' : cls.color;
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI*2);
  ctx.fill();

  // Direction indicator
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(Math.cos(P.angle)*8, Math.sin(P.angle)*8, 4, 0, Math.PI*2);
  ctx.fill();

  // Class icon
  ctx.fillStyle = '#000';
  ctx.font = '10px serif';
  ctx.textAlign = 'center';
  ctx.fillText(cls.icon, 0, 4);
  ctx.textAlign = 'left';

  // Weapon indication
  const w = getEquipped();
  if(w && w.type==='melee' && P.attackCD>0) {
    ctx.strokeStyle='#ff8'; ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(P.angle)*12, Math.sin(P.angle)*12);
    ctx.lineTo(Math.cos(P.angle)*35, Math.sin(P.angle)*35);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawFloatTexts() {
  FLOATTEXTS.forEach(ft => {
    ctx.globalAlpha = ft.life;
    ctx.fillStyle = ft.col;
    ctx.font = `bold ${ft.size}px Courier New`;
    ctx.fillText(ft.txt, sx(ft.x), sy(ft.y));
    ctx.globalAlpha = 1;
  });
}

function drawWeather() {
  if(G.weather==='rain') {
    ctx.strokeStyle = 'rgba(150,200,255,0.3)';
    ctx.lineWidth = 1;
    for(let i=0;i<100;i++) {
      const x = (Date.now()/10+i*127)%W;
      const y = (Date.now()/5+i*97)%H;
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+2,y+10); ctx.stroke();
    }
  } else if(G.weather==='fog') {
    ctx.fillStyle = 'rgba(180,180,200,0.25)';
    ctx.fillRect(0,0,W,H);
  }
}

function drawNightOverlay() {
  const t = getDayT();
  let alpha = 0;
  if(t > 0.7) alpha = Math.min(0.65, (t-0.7)*6);
  else if(t < 0.05) alpha = Math.min(0.65, (0.05-t)*6);
  else if(t > 0.6) alpha = Math.min(0.5, (t-0.6)*5);

  if(alpha > 0) {
    ctx.fillStyle = `rgba(0,0,30,${alpha})`;
    ctx.fillRect(0,0,W,H);

    // Flashlight cone
    if(P.inventory.some(it=>it?.id==='flashlight')||P.hotbar.some(it=>it?.id==='flashlight')) {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      const px = sx(P.x), py = sy(P.y);
      const grad = ctx.createRadialGradient(px,py,0,px,py,200);
      grad.addColorStop(0,'rgba(0,0,0,0.8)');
      grad.addColorStop(0.5,'rgba(0,0,0,0.5)');
      grad.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=grad;
      ctx.beginPath();
      ctx.moveTo(px,py);
      ctx.arc(px,py,200,P.angle-0.6,P.angle+0.6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
}

