// ============================================================
// START SCREEN
// ============================================================
function buildStartScreen() {
  const grid = document.getElementById('classGrid');
  Object.entries(CLASSES).forEach(([id,cls])=>{
    const card = document.createElement('div');
    card.className='class-card';
    card.id='card_'+id;
    const statStr = `HP:${cls.stats.hp} SPD:${cls.stats.speed} DMG:${cls.stats.damage}`;
    const skillNames = cls.skills.map(s=>SKILL_DEFS[s]?.name||s).join(', ');
    card.innerHTML = `<h3 style="color:${cls.color}">${cls.icon} ${cls.name}</h3><p>${cls.desc}</p><div class="stats">${statStr}<br>Skills: ${skillNames}</div>`;
    card.onclick = ()=>{
      document.querySelectorAll('.class-card').forEach(c=>c.classList.remove('selected'));
      card.classList.add('selected');
      G.selectedClass = id;
    };
    grid.appendChild(card);
  });
  // Default select
  document.getElementById('card_soldier').classList.add('selected');
}

function startGame() {
  initAudio();
  const cls = CLASSES[G.selectedClass];

  // Set player stats
  P.class = G.selectedClass;
  P.hp = P.maxHp = cls.stats.hp;
  P.stamina = P.maxStamina = cls.stats.stamina;
  P.speed = cls.stats.speed;
  P.damage = cls.stats.damage;
  P.defense = cls.stats.defense;
  P.x = 320; P.y = 320; // Start at Old Farmhouse (safe house)

  // Starting items
  cls.startItems.forEach(id=>addToInv(id));

  // Equip first melee/ranged to hotbar
  P.inventory.forEach((it,i)=>{
    if(it&&(it.type==='melee'||it.type==='ranged')) {
      const emptyHotbar = P.hotbar.findIndex(h=>!h);
      if(emptyHotbar>=0) { P.hotbar[emptyHotbar]=it; P.inventory[i]=null; }
    }
  });

  genBuildings();
  genRoads();

  // Initial spawn
  for(let i=0;i<8;i++) {
    const a=Math.random()*Math.PI*2, r=400+Math.random()*300;
    spawnZombie(clamp(P.x+Math.cos(a)*r,50,WORLD_W-50),clamp(P.y+Math.sin(a)*r,50,WORLD_H-50),'walker');
  }

  // First supply drop
  G.supplyDrops.push({x:700,y:500,collected:false,items:['medkit','ammo_pistol','food_can','water','bandage']});

  document.getElementById('overlay').style.display='none';
  document.getElementById('pauseBtn').style.display='block';
  if(isMobile()) showMobileControls();
  G.running = true;
  CAM.x = P.x - W/2;
  CAM.y = P.y - H/2;

  requestAnimationFrame(ts=>{ lastTime=ts; gameLoop(ts); });
  addMsg(`Welcome, ${cls.name}. Survive.`, cls.color);
  addMsg('WASD:Move  LClick:Melee  RClick:Shoot  E:Loot  R:Reload  Q/F/G:Skills  C:Craft  I:Inv','#aaa');
}

// ============================================================
// BOOT
// ============================================================
buildStartScreen();
