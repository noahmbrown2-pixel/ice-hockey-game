// ============================================================
// ZOMBIE SPAWNING & AI
// ============================================================
function spawnZombie(x,y,type='walker') {
  const def = ZOMBIE_TYPES[type];
  const nightMult = isNight() ? 1.5 : 1;
  ZOMBIES.push({
    x:x||rand(50,WORLD_W-50),
    y:y||rand(50,WORLD_H-50),
    vx:0,vy:0,
    hp:def.hp*nightMult*(1+G.wave*0.1),
    maxHp:def.hp*nightMult*(1+G.wave*0.1),
    type,
    speed:def.speed*(1+G.wave*0.03),
    dmg:def.dmg*(1+G.wave*0.05),
    size:def.size,
    color:def.color,
    dead:false,
    alert:false,
    alertTimer:0,
    state:'wander',
    wanderAngle:Math.random()*Math.PI*2,
    screamCD:0,
    attackCD:0,
    angle:0,
    stunned:0,
  });
}

function spawnWave() {
  const types = ['walker','runner','bloater','screamer'];
  const count = 5 + G.wave*3 + (isNight()?8:0);
  const boss = G.wave % 5 === 0;

  for(let i=0;i<count;i++) {
    // Spawn offscreen
    const side = Math.floor(Math.random()*4);
    let x,y;
    const r = 600 + Math.random()*200;
    const a = Math.random()*Math.PI*2;
    x = clamp(P.x + Math.cos(a)*r, 50, WORLD_W-50);
    y = clamp(P.y + Math.sin(a)*r, 50, WORLD_H-50);
    const type = types[Math.floor(Math.random()*types.length)];
    spawnZombie(x,y,type);
  }

  if(boss) {
    const a = Math.random()*Math.PI*2;
    spawnZombie(P.x+Math.cos(a)*500, P.y+Math.sin(a)*500,'boss');
    addMsg(`⚠ BOSS ZOMBIE INCOMING! Wave ${G.wave}`,'#f44');
  } else {
    addMsg(`Wave ${G.wave} — ${count} zombies!`, isNight()?'#f44':'#fa8');
  }

  beep(150,0.5,0.3,'sawtooth');
}

function updateZombie(z, dt) {
  if(z.dead || z.stunned > 0) { z.stunned = Math.max(0,z.stunned-dt); return; }

  const dp = dist(z,P);
  const sight = isNight() ? 250 : 180;

  // Screamer alert
  if(z.type==='screamer' && z.screamCD <= 0 && dp < sight) {
    z.screamCD = 10;
    ZOMBIES.forEach(oz => {
      if(!oz.dead && dist(oz,z)<300) { oz.alert=true; oz.alertTimer=8; }
    });
    beep(800,0.3,0.1,'sawtooth');
  }
  if(z.screamCD>0) z.screamCD-=dt;
  if(z.alertTimer>0) z.alertTimer-=dt;

  if(dp < sight || z.alert) {
    // Chase player
    const dx = P.x-z.x, dy = P.y-z.y;
    const d = Math.hypot(dx,dy)||1;
    z.vx = (dx/d)*z.speed*(P.effects.suppressed?0.3:1);
    z.vy = (dy/d)*z.speed*(P.effects.suppressed?0.3:1);
    z.angle = Math.atan2(dy,dx);

    // Boss special attack
    if(z.type==='boss' && z.attackCD<=0 && dp<400) {
      BULLETS.push({x:z.x,y:z.y,vx:(dx/d)*8,vy:(dy/d)*8,dmg:20,range:500,dist:0,fromPlayer:false,col:'#f44'});
      z.attackCD = 2;
      beep(200,0.2,0.2,'sawtooth');
    }
    if(z.attackCD>0) z.attackCD-=dt;

    // Attack player
    if(dp < z.size + 15 && z.attackCD<=0) {
      damagePlayer(z.dmg);
      z.attackCD = 1.5;
    }
  } else {
    // Wander
    z.wanderAngle += (Math.random()-0.5)*0.3;
    z.vx = Math.cos(z.wanderAngle)*z.speed*0.3;
    z.vy = Math.sin(z.wanderAngle)*z.speed*0.3;
  }

  // Zombie-zombie separation
  ZOMBIES.forEach(oz=>{
    if(oz===z||oz.dead) return;
    const d2 = dist(z,oz);
    if(d2 < (z.size+oz.size)) {
      const dx=(z.x-oz.x)/(d2||1), dy=(z.y-oz.y)/(d2||1);
      z.vx+=dx*0.5; z.vy+=dy*0.5;
    }
  });

  z.vx*=0.85; z.vy*=0.85;
  z.x = clamp(z.x+z.vx, 0, WORLD_W);
  z.y = clamp(z.y+z.vy, 0, WORLD_H);
}

// ============================================================
// SKILLS
// ============================================================
function useSkill(key) {
  if(P.dead || G.paused) return;
  const cls = CLASSES[P.class];
  const skillId = key==='Q'?cls.skills[0]:key==='F'?cls.skills[1]:cls.skills[2];
  if(!skillId) return;
  const def = SKILL_DEFS[skillId];
  if(!def) return;
  if(P.skillCDs[key] > 0) { addMsg(`${def.name} on cooldown: ${P.skillCDs[key].toFixed(1)}s`,'#f84'); return; }

  P.skillCDs[key] = def.cd;

  switch(skillId) {
    case 'adrenaline':
      P.effects.adrenaline = 5;
      P.effects.speedBoost = 5;
      addMsg('Adrenaline Rush!','#f44');
      beep(500,0.2,0.3,'square');
      break;
    case 'grenade': {
      const a = P.angle;
      const tx = P.x+Math.cos(a)*200, ty = P.y+Math.sin(a)*200;
      setTimeout(()=>{
        explosion(tx,ty,120);
        ZOMBIES.forEach(z=>{if(!z.dead&&dist(z,{x:tx,y:ty})<120)damageZombie(z,80);});
      },500);
      addMsg('Grenade thrown!','#f84');
      beep(300,0.15,0.2);
      break;
    }
    case 'suppression':
      P.effects.suppressed_enemies = 4;
      ZOMBIES.forEach(z=>{ if(dist(z,P)<300) { z.stunned=4; } });
      addMsg('Suppression fire!','#48f');
      break;
    case 'heal_surge':
      P.hp = Math.min(P.maxHp, P.hp+40);
      floatText(P.x,P.y-20,'+40 HP','#4f8',16);
      beep(600,0.2,0.3,'sine');
      addMsg('Heal Surge!','#4f8');
      break;
    case 'medkit_craft':
      if(countItem('bandage')>=2&&countItem('alcohol')>=1) {
        removeItem('bandage',2); removeItem('alcohol',1);
        addToInv('medkit');
        addMsg('Crafted Medkit!','#4f8');
      } else addMsg('Need: 2x Bandage, 1x Alcohol','#f44');
      break;
    case 'adrenaline_shot':
      P.stamina = P.maxStamina;
      P.effects.haste = 8;
      addMsg('Stim Shot!','#ff4');
      beep(700,0.15,0.3,'sine');
      break;
    case 'build_barricade':
      if(countItem('wood')>=2) {
        removeItem('wood',2);
        G.barricades.push({x:P.x+Math.cos(P.angle)*60,y:P.y+Math.sin(P.angle)*60,hp:100,maxHp:100,w:50,h:12});
        addMsg('Barricade placed!','#fa4');
        beep(300,0.15,0.2,'square');
      } else addMsg('Need: 2x Wood','#f44');
      break;
    case 'trap_deploy':
      if(countItem('metal')>=1) {
        removeItem('metal',1);
        G.traps.push({x:P.x+Math.cos(P.angle)*40,y:P.y+Math.sin(P.angle)*40,active:true,dmg:60});
        addMsg('Trap deployed!','#a84');
      } else addMsg('Need: 1x Metal','#f44');
      break;
    case 'overclock':
      P.effects.overclock = 6;
      addMsg('Overclock active!','#f4f');
      beep(800,0.2,0.3,'square');
      break;
    case 'stealth':
      P.effects.stealth = 5;
      addMsg('Stealth activated!','#888');
      break;
    case 'scavenge': {
      const items = ['bandage','food_can','water','ammo_pistol','metal','cloth','wood'];
      const picks = 3+Math.floor(Math.random()*3);
      for(let i=0;i<picks;i++) addToInv(items[Math.floor(Math.random()*items.length)]);
      addMsg('Scavenged supplies!','#8f8');
      playPickup();
      break;
    }
    case 'second_wind':
      addMsg('Second Wind ready! (auto-activates on death)','#4ff');
      break;
  }
}

