// ============================================================
// COMBAT
// ============================================================
function meleeAttack() {
  if(P.attackCD > 0 || P.dead) return;
  const weapon = getEquipped();
  const wDef = ITEMS[weapon.id] || ITEMS.fist;
  P.attackCD = (wDef.speed||0.5) * (P.effects.overclock?0.5:1);

  const mx = Math.cos(P.angle), my = Math.sin(P.angle);
  const range = wDef.range || 35;
  let hit = false;

  ZOMBIES.forEach(z => {
    if(z.dead) return;
    const dx = z.x - P.x, dy = z.y - P.y;
    const d = Math.hypot(dx,dy);
    if(d < range + z.size) {
      const dot = (dx*mx + dy*my)/d;
      if(dot > 0.3) {
        let dmg = wDef.dmg * P.damage * (P.effects.adrenaline?1.5:1);
        // Headshot chance
        const headshot = Math.random() < 0.15;
        if(headshot) { dmg *= 2; floatText(z.x,z.y-20,'HEADSHOT!','#ff4',13); }
        const crit = Math.random() < 0.1;
        if(crit) { dmg = Math.floor(dmg * 1.5); floatText(z.x,z.y-20,'CRIT!','#f88',12); }
        dmg = Math.floor(dmg);
        damageZombie(z, dmg);
        // Knockback
        z.vx = dx/d * 4; z.vy = dy/d * 4;
        hit = true;
        beep(150+Math.random()*50,0.1,0.15,'sawtooth');
        // Weapon durability
        if(weapon.dur && weapon.dur < 999) weapon.dur = Math.max(0,weapon.dur-1);
      }
    }
  });
  if(!hit) beep(200,0.05,0.08,'square');

  // Swing particle
  for(let i=0;i<5;i++) {
    addParticle(P.x+mx*30,P.y+my*30,'#ff8',
      mx*3+rand(-1,1),my*3+rand(-1,1),0.2,2);
  }
}

function shootBullet() {
  const weapon = getEquippedRanged();
  if(!weapon || P.dead) return;
  if(weapon.ammo <= 0) { addMsg('Out of ammo! Reload with R','#f44'); beep(100,0.1,0.2); return; }
  if(P.attackCD > 0) return;

  P.attackCD = weapon.speed || 0.5;
  weapon.ammo--;

  const angle = P.angle;
  const spread = weapon.spread || 0.05;
  const pellets = weapon.pellets || 1;

  playGunshot(weapon.id);
  muzzleFlash(P.x + Math.cos(angle)*15, P.y + Math.sin(angle)*15);

  for(let p=0;p<pellets;p++) {
    const a = angle + (Math.random()-0.5)*spread*2;
    BULLETS.push({
      x:P.x, y:P.y,
      vx:Math.cos(a)*12, vy:Math.sin(a)*12,
      dmg:weapon.dmg*P.damage, range:weapon.range||400,
      dist:0, fromPlayer:true, col:'#ff8'
    });
  }
}

function reloadWeapon() {
  const weapon = getEquippedRanged();
  if(!weapon) return;
  const ammoId = 'ammo_' + weapon.id;
  const ammoItem = P.inventory.find(it=>it?.id===ammoId) || P.hotbar.find(it=>it?.id===ammoId);
  if(!ammoItem) { addMsg('No ammo to reload!','#f44'); return; }
  const need = weapon.maxAmmo - weapon.ammo;
  if(need <= 0) return;
  const take = Math.min(need, ammoItem.count||1);
  weapon.ammo += take;
  if(ammoItem.count > take) ammoItem.count -= take;
  else {
    const idx = P.inventory.indexOf(ammoItem);
    if(idx>=0) P.inventory[idx]=null;
  }
  addMsg(`Reloaded ${weapon.name}!`,'#8f8');
  beep(300,0.1,0.2,'square');
}

function damageZombie(z, dmg) {
  z.hp -= dmg;
  floatText(z.x, z.y-20, `-${dmg}`, '#f44', 12);
  bloodSplatter(z.x, z.y);
  playHit();
  z.alert = true; z.alertTimer = 10;

  if(z.hp <= 0) killZombie(z);
}

function killZombie(z) {
  if(z.dead) return;
  z.dead = true;
  G.kills++;
  G.dayKills++;
  playDeath();

  const def = ZOMBIE_TYPES[z.type];
  P.xp += def.score * G.wave;
  floatText(z.x,z.y-10,`+${def.score*G.wave}XP`,'#8f8',11);

  if(z.type==='bloater') {
    explosion(z.x,z.y,100);
    ZOMBIES.forEach(oz=>{
      if(!oz.dead && dist(oz,z)<100) damageZombie(oz,40);
    });
    if(dist(z,P)<100) damagePlayer(30,'explosion');
  }

  // Drop loot
  if(Math.random()<0.3) {
    const drops = ['bandage','food_can','water','ammo_pistol','cloth','nails'];
    const drop = drops[Math.floor(Math.random()*drops.length)];
    PARTICLES.push({type:'loot',x:z.x,y:z.y,id:drop,life:15,col:'#ff8'});
  }

  checkAchievements();

  if(P.xp >= P.xpNeeded) levelUp();
}

function damagePlayer(dmg, src='zombie') {
  if(P.dead || P.effects.stealth) return;
  const reduction = P.defense * (P.effects.armored?1.3:1);
  dmg = Math.max(1, Math.floor(dmg / reduction));
  P.hp -= dmg;
  P.damageFlash = 0.5;
  floatText(P.x, P.y-20, `-${dmg}`, '#f44', 14);
  beep(80,0.15,0.25,'sawtooth');

  if(P.hp <= 0) {
    if(P.class==='survivor' && !P.secondWindUsed && P.skills && SKILL_DEFS.second_wind) {
      P.secondWindUsed = true;
      P.hp = 50;
      addMsg('SECOND WIND! Survived death!','#4ff');
    } else {
      P.hp = 0;
      P.dead = true;
      setTimeout(()=>showGameOver(), 1500);
    }
  }
}

function levelUp() {
  P.level++;
  P.xp -= P.xpNeeded;
  P.xpNeeded = Math.floor(P.xpNeeded * 1.4);
  P.maxHp += 5;
  P.hp = Math.min(P.hp+20, P.maxHp);
  P.skillPoints++;
  playLevelUp();
  addMsg(`LEVEL UP! Now level ${P.level}!`,'#ff4');
  floatText(P.x,P.y-40,'LEVEL UP!','#ff4',20);
  showLevelUpChoice();
}

let levelUpChoices = [];
function showLevelUpChoice() {
  const upgrades = [
    {name:'+20 Max HP',apply:()=>{P.maxHp+=20;P.hp=Math.min(P.hp+20,P.maxHp);}},
    {name:'+15% Damage',apply:()=>{P.damage*=1.15;}},
    {name:'+10% Speed',apply:()=>{P.speed*=1.1;}},
    {name:'+15 Stamina',apply:()=>{P.maxStamina+=15;P.stamina=Math.min(P.stamina+15,P.maxStamina);}},
    {name:'+0.2 Defense',apply:()=>{P.defense+=0.2;}},
    {name:'+15% XP Gain',apply:()=>{P.passives.xpBonus=(P.passives.xpBonus||1)*1.15;}},
  ];
  levelUpChoices = [upgrades[Math.floor(Math.random()*upgrades.length)],upgrades[Math.floor(Math.random()*upgrades.length)],upgrades[Math.floor(Math.random()*upgrades.length)]];
  showLevelUpMenu();
}

function showLevelUpMenu() {
  G.paused = true;
  const menu = document.getElementById('pauseMenu');
  menu.style.display = 'none';

  let html = '<div id="lvlUpMenu" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.97);border:2px solid gold;padding:25px;color:#fff;z-index:300;text-align:center;">';
  html += '<h2 style="color:gold;margin-bottom:15px;">LEVEL UP! Choose Upgrade</h2>';
  levelUpChoices.forEach((ch,i) => {
    html += `<button onclick="applyLevelUpChoice(${i})" style="display:block;width:100%;margin:6px 0;padding:12px;background:#222;color:#ff8;border:1px solid gold;cursor:pointer;font-size:14px;font-family:Courier New;">${ch.name}</button>`;
  });
  html += '</div>';

  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function applyLevelUpChoice(idx) {
  levelUpChoices[idx].apply();
  const menu = document.getElementById('lvlUpMenu');
  if(menu) menu.parentElement.remove();
  G.paused = false;
}

