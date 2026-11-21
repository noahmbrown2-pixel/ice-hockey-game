// ============================================================
// MAIN GAME LOOP
// ============================================================
let lastTime = 0;
function gameLoop(ts) {
  if(!G.running) return;
  requestAnimationFrame(gameLoop);

  const dt = Math.min((ts - lastTime)/1000, 0.1);
  lastTime = ts;

  if(!G.paused) update(dt);
  draw();
}

function update(dt) {
  G.time += dt;

  // Day tracking
  const newDay = Math.floor(G.time/DAY_LEN)+1;
  if(newDay > G.day) {
    G.day = newDay;
    P.hunger = Math.min(P.maxHunger, P.hunger+10);
    P.thirst = Math.min(P.maxThirst, P.thirst+5);
    addMsg(`Day ${G.day} begins.`, '#ff8');
    checkAchievements();
  }

  // Weather
  G.weatherTimer -= dt;
  if(G.weatherTimer <= 0) {
    const weathers = ['clear','clear','clear','rain','fog'];
    G.weather = weathers[Math.floor(Math.random()*weathers.length)];
    G.weatherTimer = 60+Math.random()*120;
    if(G.weather!=='clear') addMsg(`Weather: ${G.weather}`,'#8af');
  }

  // Wave system
  G.waveTimer += dt;
  if(G.waveTimer >= G.nextWave) {
    G.waveTimer = 0;
    spawnWave();
    G.wave++;
    G.nextWave = Math.max(30, 90 - G.wave*3);
  }

  // Night ambient zombies
  if(isNight() && ZOMBIES.filter(z=>!z.dead).length < 5+G.wave*2) {
    G.spawnCooldown -= dt;
    if(G.spawnCooldown<=0) {
      const types = ['walker','walker','runner','screamer'];
      const a = Math.random()*Math.PI*2, r=500+Math.random()*200;
      spawnZombie(clamp(P.x+Math.cos(a)*r,50,WORLD_W-50),clamp(P.y+Math.sin(a)*r,50,WORLD_H-50),
        types[Math.floor(Math.random()*types.length)]);
      G.spawnCooldown = isNight()?2:6;
    }
  }

  // Night ambient sound
  G.nightAmbient -= dt;
  if(isNight() && G.nightAmbient<=0) {
    playAmbientNight();
    G.nightAmbient = 8+Math.random()*12;
  }

  // Supply drop random
  if(Math.random()<0.0005) spawnSupplyDrop();

  // Player movement
  if(!P.dead) {
    let mx=0,my=0;
    if(KEYS['w']||KEYS['arrowup']) my=-1;
    if(KEYS['s']||KEYS['arrowdown']) my=1;
    if(KEYS['a']||KEYS['arrowleft']) mx=-1;
    if(KEYS['d']||KEYS['arrowright']) mx=1;

    const moving = mx!==0||my!==0;
    const spd = P.speed * (P.effects.adrenaline?1.3:1) * (P.effects.haste?1.4:1) * (KEYS['shift']?1.5:1);

    if(moving) {
      const len = Math.hypot(mx,my)||1;
      P.x = clamp(P.x + mx/len*spd, 10, WORLD_W-10);
      P.y = clamp(P.y + my/len*spd, 10, WORLD_H-10);

      if(KEYS['shift']) {
        P.stamina = Math.max(0, P.stamina-dt*15);
        if(P.stamina<=0) {/* no sprint */}
      }
    }

    // Stamina regen
    if(!KEYS['shift']||!moving) P.stamina=Math.min(P.maxStamina,P.stamina+dt*8);

    // Hunger/thirst drain
    P.hunger = Math.max(0, P.hunger - dt*0.8);
    P.thirst = Math.max(0, P.thirst - dt*1.2);
    if(P.hunger<=0) P.hp=Math.max(1,P.hp-dt*2);
    if(P.thirst<=0) P.hp=Math.max(1,P.hp-dt*3);

    if(P.hunger<20&&Math.random()<0.002) addMsg('Hungry! Find food.','#fa8');
    if(P.thirst<20&&Math.random()<0.002) addMsg('Thirsty! Find water.','#4af');

    // Mouse aim
    P.angle = Math.atan2(MOUSE.y - sy(P.y), MOUSE.x - sx(P.x));

    // Attack cooldown
    if(P.attackCD>0) P.attackCD = Math.max(0, P.attackCD-dt);
    if(P.damageFlash>0) P.damageFlash=Math.max(0,P.damageFlash-dt*3);

    // Auto melee if holding left
    if(MOUSE.down && P.attackCD<=0) meleeAttack();
    // Auto shoot if holding right
    if(MOUSE.rdown && P.attackCD<=0) shootBullet();

    // Skill cooldowns
    ['Q','F','G'].forEach(k=>{ if(P.skillCDs[k]>0) P.skillCDs[k]=Math.max(0,P.skillCDs[k]-dt); });

    // Effects tick
    Object.keys(P.effects).forEach(k=>{
      if(typeof P.effects[k]==='number') {
        P.effects[k]=Math.max(0,P.effects[k]-dt);
        if(P.effects[k]<=0) delete P.effects[k];
      }
    });
  }

  // Camera lerp
  CAM.x += (P.x - W/2 - CAM.x) * 0.1;
  CAM.y += (P.y - H/2 - CAM.y) * 0.1;
  CAM.x = clamp(CAM.x, 0, WORLD_W-W);
  CAM.y = clamp(CAM.y, 0, WORLD_H-H);

  // Update zombies
  ZOMBIES.forEach(z=>updateZombie(z,dt));

  // Barricades block zombies
  ZOMBIES.forEach(z=>{
    G.barricades.forEach(b=>{
      if(b.hp<=0) return;
      const zx=z.x,zy=z.y;
      if(zx>b.x-b.w/2&&zx<b.x+b.w/2&&zy>b.y-b.h/2&&zy<b.y+b.h/2) {
        b.hp-=z.dmg*dt;
        z.vx*=-0.5; z.vy*=-0.5;
        z.x=clamp(z.x,b.x-b.w/2-z.size,b.x+b.w/2+z.size);
      }
    });
    // Traps
    G.traps.forEach(t=>{
      if(!t.active) return;
      if(dist(z,t)<15) {
        damageZombie(z,t.dmg);
        t.active=false;
        explosion(t.x,t.y,30);
      }
    });
  });

  // Update bullets
  BULLETS.forEach(b=>{
    b.x+=b.vx; b.y+=b.vy;
    b.dist+=Math.hypot(b.vx,b.vy);
    // Hit zombies
    if(b.fromPlayer) {
      ZOMBIES.forEach(z=>{
        if(!z.dead&&Math.hypot(z.x-b.x,z.y-b.y)<z.size+4) {
          damageZombie(z,b.dmg);
          b.dist=b.range;
          bloodSplatter(z.x,z.y,5);
        }
      });
    } else {
      if(!P.dead&&Math.hypot(P.x-b.x,P.y-b.y)<14) {
        damagePlayer(b.dmg,'bullet');
        b.dist=b.range;
      }
    }
  });
  BULLETS = BULLETS.filter(b=>b.dist<b.range&&b.x>0&&b.x<WORLD_W&&b.y>0&&b.y<WORLD_H);

  // Update particles
  PARTICLES.forEach(p=>{
    if(p.type==='loot') { p.life-=dt; return; }
    p.x+=p.vx; p.y+=p.vy;
    p.vx*=0.92; p.vy*=0.92;
    p.life-=dt;
  });
  PARTICLES = PARTICLES.filter(p=>p.life>0);

  // Float texts
  FLOATTEXTS.forEach(ft=>{ ft.y+=ft.vy; ft.life-=dt; });
  FLOATTEXTS = FLOATTEXTS.filter(ft=>ft.life>0);

  // Clean dead zombies
  if(ZOMBIES.filter(z=>z.dead).length > 30) ZOMBIES = ZOMBIES.filter(z=>!z.dead);

  checkAchievements();
}

function draw() {
  ctx.clearRect(0,0,W,H);
  drawBackground();
  drawGround();
  drawBuildings();
  drawBarricades();
  drawTraps();
  drawSupplyDrops();
  drawParticles();
  drawBullets();
  drawZombies();
  drawPlayer();
  drawFloatTexts();
  drawWeather();
  drawNightOverlay();
  if(!P.dead) drawHUD();

  if(G.paused) {
    ctx.fillStyle='rgba(0,0,0,0.5)';
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#fff';
    ctx.font='bold 30px Courier New';
    ctx.textAlign='center';
    ctx.fillText('PAUSED',W/2,H/2);
    ctx.textAlign='left';
  }
}

