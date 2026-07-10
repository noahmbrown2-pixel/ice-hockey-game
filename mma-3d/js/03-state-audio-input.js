const STRIKES = {
  jab:        { type:'punch', height:'high', dmg:5,  stam:5,  range:1.55, windup:.06, active:.07, recover:.18, kb:0.10, crit:0   },
  cross:      { type:'punch', height:'high', dmg:9,  stam:9,  range:1.60, windup:.10, active:.08, recover:.24, kb:0.16, crit:.05 },
  hook:       { type:'punch', height:'high', dmg:11, stam:12, range:1.45, windup:.14, active:.08, recover:.28, kb:0.20, crit:.08 },
  uppercut:   { type:'punch', height:'high', dmg:14, stam:18, range:1.35, windup:.20, active:.10, recover:.34, kb:0.26, crit:.20 },
  legkick:    { type:'kick',  height:'low',  dmg:8,  stam:10, range:1.95, windup:.12, active:.09, recover:.26, kb:0.12, crit:0,  leg:true },
  bodykick:   { type:'kick',  height:'mid',  dmg:13, stam:16, range:2.00, windup:.16, active:.10, recover:.32, kb:0.22, crit:.06 },
  headkick:   { type:'kick',  height:'high', dmg:20, stam:24, range:2.05, windup:.26, active:.11, recover:.44, kb:0.34, crit:.50 },
  knee:       { type:'knee',  height:'mid',  dmg:14, stam:14, range:1.25, windup:.14, active:.08, recover:.28, kb:0.20, crit:.24 },
  flyingknee: { type:'knee',  height:'high', dmg:24, stam:28, range:1.85, windup:.20, active:.11, recover:.42, kb:0.40, crit:.60 },
  elbow:      { type:'elbow', height:'high', dmg:12, stam:10, range:1.20, windup:.10, active:.07, recover:.24, kb:0.14, crit:.22 },
};

const ROUND_LEN = 60, TOTAL_ROUNDS = 3, MAX_KD = 3;

let state = 'title';
let round = 1, roundClock = ROUND_LEN, scoreP = 0, scoreC = 0;
let slowmo = 0, flashT = 0, shake = 0;
let endTitle = '', endSub = '';
let ground = null;

function makeBoxer(cfg){
  const fr = makeFighter(cfg);
  return {
    name: cfg.name, isPlayer: !!cfg.isPlayer, rig: fr, parts: fr.parts, root: fr.root,
    x: cfg.x, z: cfg.z, vx:0, vz:0, yaw: 0,
    hp:175, maxHp:175, stamina:100, maxStam:100,
    action:'idle', actionT:0, actionDur:0, hitDone:false,
    flinch:0, legPhase:0, kneesBent:0, legDmg:0, dodgeCD:0,
    knockdowns:0, aiTimer:0, aiState:'idle', aiAgg:0.5, aiRct:0.4,
    jumpY:0,
    cur:{}, tgt:{},  // pose state
  };
}
let player, cpu;

function setupRound(){
  if (player) { scene.remove(player.root); }
  if (cpu) { scene.remove(cpu.root); }
  player = makeBoxer({ name:'YOU', isPlayer:true, x:0, z:-2.6, skin:0xd6a26b, trunks:0xc01818, glove:0xff3838, hair:0x1a0d0d });
  cpu    = makeBoxer({ name:'VOLKOV', x:0, z:2.6, skin:0xc08550, trunks:0x15407a, glove:0x3da2ff, hair:0x241a12 });
  cpu.aiAgg = 0.45 + round*0.12; cpu.aiRct = 0.35 + round*0.10;
  roundClock = ROUND_LEN; ground = null;
  document.getElementById('cname').textContent = cpu.name;
}
function resetMatch(){
  round = 1; scoreP = 0; scoreC = 0; ground = null;
  setupRound(); state = 'fight';
  document.getElementById('title').classList.remove('active');
  document.getElementById('endscr').classList.remove('active');
  playBell();
}

// ─────────────────────────────────────────────
//  Audio
// ─────────────────────────────────────────────
let actx = null;
function ensureAudio(){ if(!actx){try{actx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){actx=null;}} if(actx&&actx.state==='suspended')actx.resume(); }
function tone({freq=200,dur=.08,type='sine',vol=.3,attack=.005}){ if(!actx)return; const t=actx.currentTime,o=actx.createOscillator(),g=actx.createGain(); o.type=type;o.frequency.setValueAtTime(freq,t); g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+attack);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+dur); }
function playHit(kind){ ensureAudio(); if(!actx)return; const s=STRIKES[kind]||{}; if(s.type==='punch'){ if(kind==='jab')tone({freq:420,dur:.06,type:'square',vol:.18}); else {tone({freq:220,dur:.10,type:'square',vol:.24});tone({freq:110,dur:.12,vol:.18});} } else if(s.type==='kick'){tone({freq:140,dur:.12,type:'sawtooth',vol:.3});tone({freq:70,dur:.16,vol:.22});} else if(s.type==='knee'){tone({freq:100,dur:.16,type:'sawtooth',vol:.32});tone({freq:55,dur:.20,vol:.24});} else {tone({freq:320,dur:.07,type:'square',vol:.22});tone({freq:90,dur:.10,vol:.18});} }
function playBlock(){ ensureAudio(); tone({freq:700,dur:.05,type:'square',vol:.12}); }
function playBell(){ ensureAudio(); for(const f of[880,1318,1760])tone({freq:f,dur:1.2,vol:.16}); }

// ─────────────────────────────────────────────
//  Input
// ─────────────────────────────────────────────
const keys = {};
const KL = ['w','a','s','d','j','k','u','i','z','x','c','v','b','e','q',' '];
window.addEventListener('keydown',e=>{ ensureAudio(); const k=e.key.toLowerCase(); if(KL.includes(k))e.preventDefault(); keys[k]=true; });
window.addEventListener('keyup',e=>{ keys[e.key.toLowerCase()]=false; });
document.querySelectorAll('#touch .tb[data-k]').forEach(b=>{ const k=b.dataset.k;
  b.addEventListener('touchstart',e=>{e.preventDefault();ensureAudio();keys[k]=true;});
  b.addEventListener('touchend',e=>{e.preventDefault();keys[k]=false;});
  b.addEventListener('touchcancel',()=>{keys[k]=false;}); });
const SK = { j:'jab', k:'cross', u:'hook', i:'uppercut', z:'legkick', x:'bodykick', c:'headkick', v:'knee', b:'flyingknee', e:'elbow' };

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────
