// ============================================================
// CONSTANTS & CONFIG
// ============================================================
const WORLD_W = 3000, WORLD_H = 3000;
const TILE = 40;
const DAY_LEN = 480; // seconds per full day
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

let W = window.innerWidth, H = window.innerHeight;
canvas.width = W; canvas.height = H;
window.onresize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; };

// ============================================================
// AUDIO
// ============================================================
let AC;
function initAudio() { try { AC = new AudioContext(); } catch(e){} }
function beep(freq, dur, vol=0.3, type='square') {
  if(!AC) return;
  try {
    const o = AC.createOscillator(), g = AC.createGain();
    o.connect(g); g.connect(AC.destination);
    o.frequency.value = freq; o.type = type;
    g.gain.setValueAtTime(vol, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + dur);
    o.start(); o.stop(AC.currentTime + dur);
  } catch(e){}
}
function playGunshot(type='pistol') {
  if(!AC) return;
  try {
    const buf = AC.createBuffer(1, AC.sampleRate*0.15, AC.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/d.length, type==='shotgun'?1.5:3);
    const src = AC.createBufferSource(), g = AC.createGain();
    src.buffer = buf; src.connect(g); g.connect(AC.destination);
    g.gain.value = type==='shotgun'?0.6:0.4;
    src.start();
  } catch(e){}
}
function playHit() { beep(80+Math.random()*40, 0.08, 0.2, 'sawtooth'); }
function playDeath() { beep(60, 0.4, 0.3, 'sawtooth'); beep(40, 0.6, 0.2, 'square'); }
function playLevelUp() { [400,500,600,800].forEach((f,i) => setTimeout(()=>beep(f,0.15,0.3,'sine'),i*100)); }
function playPickup() { beep(600, 0.08, 0.15, 'sine'); }
function playAmbientNight() {
  if(!AC) return;
  try {
    const o = AC.createOscillator(), g = AC.createGain();
    o.type='sine'; o.frequency.value=60+Math.random()*20;
    g.gain.setValueAtTime(0,AC.currentTime);
    g.gain.linearRampToValueAtTime(0.04,AC.currentTime+1);
    g.gain.linearRampToValueAtTime(0,AC.currentTime+3);
    o.connect(g); g.connect(AC.destination);
    o.start(); o.stop(AC.currentTime+3);
  } catch(e){}
}

// ============================================================
// CLASSES
// ============================================================
const CLASSES = {
  soldier: {
    name:'Soldier', color:'#4af', icon:'★',
    desc:'Combat veteran. High damage, military training, can use all guns.',
    stats:{hp:120,stamina:100,speed:2.8,damage:1.4,defense:0.8},
    skills:['adrenaline','grenade','suppression'],
    startItems:['pistol','ammo_pistol','bandage','rations']
  },
  medic: {
    name:'Medic', color:'#4f8', icon:'✚',
    desc:'Field medic. Strong healing abilities, can revive and buff allies.',
    stats:{hp:100,stamina:110,speed:3.0,damage:0.8,defense:0.7},
    skills:['heal_surge','medkit_craft','adrenaline_shot'],
    startItems:['bat','bandage','bandage','medkit','water']
  },
  engineer: {
    name:'Engineer', color:'#fa4', icon:'⚙',
    desc:'Resourceful builder. Superior crafting, can build barricades and traps.',
    stats:{hp:110,stamina:100,speed:2.7,damage:1.0,defense:1.0},
    skills:['build_barricade','trap_deploy','overclock'],
    startItems:['axe','wood','wood','nails','rations']
  },
  survivor: {
    name:'Survivor', color:'#f84', icon:'◈',
    desc:'Street-smart scavenger. Balanced stats, stealth bonus, lucky looting.',
    stats:{hp:110,stamina:120,speed:3.2,damage:1.0,defense:0.9},
    skills:['stealth','scavenge','second_wind'],
    startItems:['machete','bandage','water','food_can','flashlight']
  }
};

const SKILL_DEFS = {
  adrenaline:{name:'Adrenaline',key:'Q',cd:20,color:'#f44',desc:'Speed+damage boost 5s'},
  grenade:{name:'Grenade',key:'E',cd:25,color:'#f84',desc:'Throw grenade (AoE)'},
  suppression:{name:'Suppression',key:'R',cd:30,color:'#48f',desc:'Slow all nearby zombies 4s'},
  heal_surge:{name:'Heal Surge',key:'Q',cd:15,color:'#4f8',desc:'Heal 40 HP instantly'},
  medkit_craft:{name:'Field Medkit',key:'E',cd:45,color:'#8f8',desc:'Craft medkit from inventory'},
  adrenaline_shot:{name:'Stim Shot',key:'R',cd:35,color:'#ff4',desc:'Full stamina + haste 8s'},
  build_barricade:{name:'Barricade',key:'Q',cd:20,color:'#fa4',desc:'Place wood barricade'},
  trap_deploy:{name:'Bear Trap',key:'E',cd:30,color:'#a84',desc:'Deploy spike trap'},
  overclock:{name:'Overclock',key:'R',cd:40,color:'#f4f',desc:'Double attack speed 6s'},
  stealth:{name:'Stealth',key:'Q',cd:25,color:'#888',desc:'Invisible to zombies 5s'},
  scavenge:{name:'Scavenge',key:'E',cd:60,color:'#8f8',desc:'Find random supply cache'},
  second_wind:{name:'Second Wind',key:'R',cd:90,color:'#4ff',desc:'Revive self with 50 HP (once per death)'},
};

// ============================================================
// GAME STATE
// ============================================================
let G = {
  running: false, paused: false,
  time: 0, day: 1,
  wave: 1, waveTimer: 0, nextWave: 90,
  kills: 0, dayKills: 0,
  selectedClass: 'soldier',
  spawnCooldown: 0,
  nightAmbient: 0,
  barricades: [], traps: [],
  supplyDrops: [], survivors: [],
  weatherTimer: 200, weather: 'clear',
  achievements: {}
};

let CAM = { x: 0, y: 0 };
let KEYS = {};
let MOUSE = { x: 0, y: 0, down: false, rdown: false };

