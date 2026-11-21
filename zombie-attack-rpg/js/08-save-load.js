// ============================================================
// SAVE / LOAD
// ============================================================
function saveGame() {
  const save = {
    P: JSON.parse(JSON.stringify(P)),
    G: JSON.parse(JSON.stringify(G)),
    CAM: {...CAM},
  };
  localStorage.setItem('zar_save', JSON.stringify(save));
  addMsg('Game saved!','#8f8');
}

function loadGame() {
  const s = localStorage.getItem('zar_save');
  if(!s) { addMsg('No save found.','#f44'); return; }
  const save = JSON.parse(s);
  Object.assign(P, save.P);
  Object.assign(G, save.G);
  Object.assign(CAM, save.CAM);
  addMsg('Game loaded!','#8f8');
  document.getElementById('pauseMenu').style.display='none';
  G.paused = false;
}

// ============================================================
// ACHIEVEMENTS
// ============================================================
const ACHIEVEMENTS_DEF = {
  first_blood:{name:'First Blood',desc:'Kill your first zombie',cond:()=>G.kills>=1},
  kills_10:{name:'Zombie Slayer',desc:'Kill 10 zombies',cond:()=>G.kills>=10},
  kills_50:{name:'Mass Murderer',desc:'Kill 50 zombies',cond:()=>G.kills>=50},
  kills_100:{name:'Century',desc:'Kill 100 zombies',cond:()=>G.kills>=100},
  level_5:{name:'Veteran',desc:'Reach level 5',cond:()=>P.level>=5},
  level_10:{name:'Legend',desc:'Reach level 10',cond:()=>P.level>=10},
  day_3:{name:'Survivor',desc:'Survive to day 3',cond:()=>G.day>=3},
  day_7:{name:'One Week',desc:'Survive 7 days',cond:()=>G.day>=7},
  wave_10:{name:'Horde Slayer',desc:'Survive wave 10',cond:()=>G.wave>=10},
};

function checkAchievements() {
  Object.entries(ACHIEVEMENTS_DEF).forEach(([id,ach]) => {
    if(!G.achievements[id] && ach.cond()) {
      G.achievements[id] = true;
      showAchievement(ach.name, ach.desc);
    }
  });
}

function showAchievement(name, desc) {
  const el = document.getElementById('achieveToast');
  el.innerHTML = `🏆 Achievement: <b>${name}</b><br><small>${desc}</small>`;
  el.style.display = 'block';
  beep(800,0.1,0.2,'sine'); beep(1000,0.1,0.2,'sine');
  setTimeout(()=>el.style.display='none', 3500);
}

