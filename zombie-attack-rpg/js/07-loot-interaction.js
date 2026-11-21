// ============================================================
// LOOT / INTERACTION
// ============================================================
function tryInteract() {
  // Buildings
  for(const b of BUILDINGS) {
    const d = Math.hypot(P.x-b.doorX, P.y-b.doorY);
    if(d < 50) {
      lootBuilding(b);
      return;
    }
  }
  // Supply drops
  for(const sd of G.supplyDrops) {
    if(!sd.collected && dist(sd,P)<50) {
      sd.items.forEach(id=>addToInv(id));
      sd.collected = true;
      addMsg('Supply drop collected!','#ff8');
      playPickup();
      return;
    }
  }
  // Ground loot
  for(let i=PARTICLES.length-1;i>=0;i--) {
    const p = PARTICLES[i];
    if(p.type==='loot' && Math.hypot(P.x-p.x,P.y-p.y)<30) {
      addToInv(p.id);
      playPickup();
      PARTICLES.splice(i,1);
      return;
    }
  }
}

function lootBuilding(b) {
  if(b.looted) { addMsg('Already looted.','#888'); return; }
  b.looted = true;
  const table = LOOT_TABLES[b.zone] || LOOT_TABLES.house;
  const count = 2 + Math.floor(Math.random()*3);
  const got = [];
  for(let i=0;i<count;i++) {
    const id = table[Math.floor(Math.random()*table.length)];
    if(addToInv(id)) got.push(ITEMS[id].name);
  }
  addMsg(`Found: ${got.join(', ')}`, '#8f8');
  playPickup();
  checkAchievements();
}

// ============================================================
// CRAFTING
// ============================================================
function openCraft() {
  const menu = document.getElementById('craftMenu');
  menu.style.display = 'block';
  document.getElementById('pauseMenu').style.display='none';
  renderCraftList();
}

function renderCraftList() {
  const list = document.getElementById('craftList');
  list.innerHTML = '';
  RECIPES.filter(r=>r.level<=P.level).forEach((r,i) => {
    const canMake = Object.entries(r.needs).every(([id,n])=>countItem(id)>=n);
    const needsStr = Object.entries(r.needs).map(([id,n])=>`${n}x${ITEMS[id]?.name||id}`).join(', ');
    const div = document.createElement('div');
    div.className = 'craft-recipe';
    div.style.opacity = canMake?'1':'0.5';
    div.innerHTML = `<span class="result">${r.name}</span><span class="needs">${needsStr}</span>`;
    if(canMake) div.onclick = ()=>doCraft(r);
    list.appendChild(div);
  });
}

function doCraft(recipe) {
  Object.entries(recipe.needs).forEach(([id,n])=>removeItem(id,n));
  for(let i=0;i<recipe.count;i++) addToInv(recipe.result);
  addMsg(`Crafted: ${recipe.name}!`,'#8f8');
  playPickup();
  renderCraftList();
}

// ============================================================
// INVENTORY UI
// ============================================================
function openInv() {
  const panel = document.getElementById('invPanel');
  panel.style.display = panel.style.display==='block'?'none':'block';
  if(panel.style.display==='block') renderInv();
}

function renderInv() {
  const grid = document.getElementById('invGrid');
  grid.innerHTML = '';
  P.inventory.forEach((it,i) => {
    const slot = document.createElement('div');
    slot.className = 'inv-slot';
    if(it) {
      slot.textContent = it.icon||it.name.slice(0,3);
      slot.title = it.name + (it.dur&&it.dur<999?` (${it.dur}/${it.maxDur})`:'') + (it.count>1?` x${it.count}`:'');
      if(it.count>1) {
        const c = document.createElement('div');
        c.className = 'count';
        c.textContent = it.count;
        slot.appendChild(c);
      }
      slot.onclick = ()=>useInventoryItem(i);
    }
    grid.appendChild(slot);
  });
  document.getElementById('invInfo').textContent = 'Click item to use/equip';
}

function useInventoryItem(idx) {
  const it = P.inventory[idx];
  if(!it) return;
  if(it.type==='consumable'||it.type==='food'||it.type==='drink') {
    if(it.heal) { P.hp=Math.min(P.maxHp,P.hp+it.heal); floatText(P.x,P.y-20,`+${it.heal}HP`,'#4f8',14); }
    if(it.hunger) P.hunger=Math.min(P.maxHunger,P.hunger+it.hunger);
    if(it.thirst) P.thirst=Math.min(P.maxThirst,P.thirst+it.thirst);
    removeItem(it.id,1);
    beep(500,0.1,0.2,'sine');
    addMsg(`Used ${it.name}`,'#8f8');
  } else if(it.type==='melee'||it.type==='ranged') {
    // Equip to hotbar
    for(let i=0;i<P.hotbar.length;i++) {
      if(!P.hotbar[i]) { P.hotbar[i]=it; P.inventory[idx]=null; addMsg(`Equipped ${it.name}`,'#8f8'); break; }
    }
  }
  renderInv();
}

