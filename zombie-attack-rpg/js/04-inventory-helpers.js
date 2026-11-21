// ============================================================
// INVENTORY HELPERS
// ============================================================
function getItem(id) { return id ? {...ITEMS[id], id} : null; }

function addToInv(id, count=1) {
  if(!id || !ITEMS[id]) return false;
  const item = ITEMS[id];
  // Stack consumables/materials
  if(['consumable','food','drink','material','ammo'].includes(item.type)) {
    for(let i=0;i<P.inventory.length;i++) {
      if(P.inventory[i]?.id === id) {
        P.inventory[i].count = (P.inventory[i].count||1) + count;
        return true;
      }
    }
  }
  for(let i=0;i<P.inventory.length;i++) {
    if(!P.inventory[i]) {
      P.inventory[i] = {id, count, ...ITEMS[id]};
      return true;
    }
  }
  addMsg('Inventory full!','#f44');
  return false;
}

function countItem(id) {
  let n=0;
  for(const it of P.inventory) if(it?.id===id) n += (it.count||1);
  return n;
}

function removeItem(id, count=1) {
  for(let i=0;i<P.inventory.length;i++) {
    if(P.inventory[i]?.id===id) {
      const c = P.inventory[i].count||1;
      if(c <= count) P.inventory[i]=null;
      else P.inventory[i].count = c - count;
      return true;
    }
  }
  return false;
}

function getEquipped() {
  return P.hotbar[P.equipped] || P.inventory.find(it=>it?.type==='melee') || {id:'fist',...ITEMS.fist};
}

function getEquippedRanged() {
  for(const it of P.hotbar) if(it?.type==='ranged') return it;
  for(const it of P.inventory) if(it?.type==='ranged') return it;
  return null;
}

