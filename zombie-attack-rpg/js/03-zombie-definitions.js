// ============================================================
// ZOMBIE DEFINITIONS
// ============================================================
const ZOMBIE_TYPES = {
  walker: {name:'Walker',hp:50,speed:0.9,dmg:8,color:'#4a4',score:10,size:16},
  runner: {name:'Runner',hp:35,speed:2.2,dmg:5,color:'#a84',score:15,size:14},
  bloater: {name:'Bloater',hp:90,speed:0.6,dmg:12,color:'#8a2',score:25,size:22,explodes:true},
  screamer: {name:'Screamer',hp:40,speed:1.3,dmg:6,color:'#a4a',score:20,size:15,screams:true},
  boss: {name:'Boss',hp:500,speed:1.1,dmg:25,color:'#f44',score:150,size:32,boss:true},
};

let ZOMBIES = [];
let BULLETS = [];
let PARTICLES = [];
let FLOATTEXTS = [];

// ============================================================
// WORLD GENERATION
// ============================================================
let ROADS = [];
function genRoads() {
  // Dirt paths leading from each corner zone to the central tavern
  ROADS = [
    {x1:1500,y1:0,   x2:1500,y2:3000,w:28}, // N-S dirt path
    {x1:0,   y1:1500,x2:3000,y2:1500,w:28}, // E-W dirt path
    {x1:400, y1:400, x2:1450,y2:1450,w:20}, // NW farmhouse to tavern
    {x1:2600,y1:400, x2:1550,y2:1450,w:20}, // NE barn to tavern
    {x1:400, y1:2600,x2:1450,y2:1550,w:20}, // SW crop to tavern
    {x1:2600,y1:2600,x2:1550,y2:1550,w:20}, // SE mill to tavern
  ];
}

// ============================================================
// SUPPLY DROPS
// ============================================================
function spawnSupplyDrop() {
  const x = 200 + Math.random()*(WORLD_W-400);
  const y = 200 + Math.random()*(WORLD_H-400);
  G.supplyDrops.push({x,y,collected:false,items:['medkit','ammo_pistol','ammo_rifle','food_can','water']});
  addMsg('⚠ Supply drop detected!','#ff8');
}

// ============================================================
// UTILITY
// ============================================================
function wx(sx){ return sx + CAM.x; }
function wy(sy){ return sy + CAM.y; }
function sx(wx){ return wx - CAM.x; }
function sy(wy){ return wy - CAM.y; }
function dist(a,b){ return Math.hypot(a.x-b.x,a.y-b.y); }
function rand(a,b){ return a + Math.random()*(b-a); }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }

function isNight() {
  const t = (G.time % DAY_LEN) / DAY_LEN;
  return t > 0.55 || t < 0.05;
}
function getDayT() {
  return (G.time % DAY_LEN) / DAY_LEN;
}
function getSkyColor() {
  const t = getDayT();
  if(t < 0.05) return lerpCol('#0a0520','#1a1540',t/0.05);
  if(t < 0.15) return lerpCol('#1a1540','#ff6b00',( t-0.05)/0.1);
  if(t < 0.25) return lerpCol('#ff6b00','#87ceeb',(t-0.15)/0.1);
  if(t < 0.5)  return '#87ceeb';
  if(t < 0.6)  return lerpCol('#87ceeb','#ff4400',(t-0.5)/0.1);
  if(t < 0.7)  return lerpCol('#ff4400','#0a0520',(t-0.6)/0.1);
  return '#0a0520';
}
function lerpCol(c0,c1,t) {
  t = clamp(t,0,1);
  const p=(s)=>parseInt(s.slice(1),16);
  const a=p(c0),b=p(c1);
  const r=Math.round(((a>>16)&255)+t*(((b>>16)&255)-((a>>16)&255)));
  const g=Math.round(((a>>8)&255)+t*(((b>>8)&255)-((a>>8)&255)));
  const bl=Math.round((a&255)+t*((b&255)-(a&255)));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${bl.toString(16).padStart(2,'0')}`;
}

function addMsg(txt, col='#ff8') {
  const el = document.createElement('div');
  el.className = 'msg';
  el.style.color = col;
  el.textContent = txt;
  document.getElementById('msgLog').appendChild(el);
  setTimeout(()=>el.remove(), 3000);
}

function floatText(x,y,txt,col='#ff8',size=14) {
  FLOATTEXTS.push({x,y,txt,col,size,life:1,vy:-1.5});
}

function addParticle(x,y,col,vx,vy,life,size=3) {
  PARTICLES.push({x,y,col,vx,vy,life,maxLife:life,size});
}

function bloodSplatter(x,y,count=8) {
  for(let i=0;i<count;i++) {
    const a = Math.random()*Math.PI*2;
    const s = 1+Math.random()*3;
    addParticle(x,y,'#c00',Math.cos(a)*s,Math.sin(a)*s,0.5+Math.random()*0.5,2+Math.random()*3);
  }
}

function muzzleFlash(x,y) {
  for(let i=0;i<6;i++) {
    const a = Math.random()*Math.PI*2;
    addParticle(x,y,'#ff8',Math.cos(a)*4,Math.sin(a)*4,0.15,3);
    addParticle(x,y,'#ff4',Math.cos(a)*2,Math.sin(a)*2,0.1,2);
  }
}

function explosion(x,y,r=80) {
  for(let i=0;i<30;i++) {
    const a = Math.random()*Math.PI*2;
    const s = 2+Math.random()*5;
    addParticle(x,y,Math.random()<0.5?'#f84':'#ff4',Math.cos(a)*s,Math.sin(a)*s,0.6+Math.random(),3+Math.random()*5);
  }
  floatText(x,y-30,'BOOM!','#f84',18);
}

