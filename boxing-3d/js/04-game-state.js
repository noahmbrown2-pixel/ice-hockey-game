'use strict';
// ─────────────────────────────────────────────
//  Game state
// ─────────────────────────────────────────────
let state = 'title';
let paused = false;
let round = 1;
let roundClock = ROUND_LEN;
let scorePlayer = 0, scoreCpu = 0;
let knockdownsPlayer = 0, knockdownsCpu = 0, totalCpuKnockdowns = 0;
let slowmoT = 0;
let cameraShake = 0;
let flashAmount = 0;
let gloveRaiseMode = null; // {who:'player'|'cpu', t:0}
let raceMode = false;
let raceDamageDealt = 0; // total damage player has landed on CPU this race
const RACE_DURATION = 300; // 5 minutes in seconds

function makeBoxer(opts){
  const profile = opts.physicsProfile || null;
  // Allow profile to override colors when caller didn't pin them.
  const trunks = (profile && opts.useProfileColors) ? profile.trunks : opts.trunks;
  const skin   = (profile && opts.useProfileColors) ? profile.skin   : (opts.skin || 0xd6a26b);
  const gloveC = (profile && opts.useProfileColors) ? profile.gloveColor : opts.gloveColor;
  const maxHp   = profile ? profile.maxHp   : 100;
  const maxStam = profile ? profile.maxStam : 100;
  const b = {
    name: opts.name,
    isPlayer: !!opts.isPlayer,
    pos: new THREE.Vector3(opts.x || 0, FLOOR_Y, opts.z || 0),
    facing: opts.facing || 1,
    yaw: (opts.facing > 0) ? 0 : Math.PI,
    targetYaw: 0,
    hp: maxHp, maxHp: maxHp,
    stamina: maxStam, maxStam: maxStam,
    color: opts.color,
    trunks: trunks,
    skin: skin,
    gloveColor: gloveC,
    action: 'idle',
    actionT: 0, actionDur: 0,
    activeArm: 'lead',
    actionKind: null,
    hitFrameDone: false,
    flinch: 0, flinchDir: 0, flinchHistory: 0,
    aiTimer: 0, aiState: 'idle',
    aiAggression: (profile && profile.aiAggression!=null) ? profile.aiAggression : 0.5,
    aiReaction:   (profile && profile.aiReaction!=null)   ? profile.aiReaction   : 0.4,
    circleDir: Math.random() < 0.5 ? -1 : 1,
    circleTimer: 1.5 + Math.random() * 1.5,
    stunned: false, stunT: 0,
    koStaggered: false,
    legPhase: 0,      // 0-1 walking cycle
    kneesBent: 0,     // 0=straight 1=fully crouched
    dodgeCooldown: 0, // seconds until next dodge allowed
    nextSide: { jab:'lead', cross:'rear', hook:'lead', uppercut:'rear', overhand:'rear',
                bodyShot:'lead', liverShot:'lead', straight:'rear', checkHook:'lead',
                shovelHook:'lead', corkscrew:'rear', haymaker:'rear' },
    // Punch animation state
    armTimers: { lead: 0, rear: 0 },
    // CPU weave / parry state
    weaveT: 0, weaveDir: 0, parryT: 0, parryArm: null,
    // Stats
    punchesThrown: 0, punchesLanded: 0, lowStaminaTicks: 0,
    // Damage taken by zone
    zoneDmg: { HEAD:0, CHEST:0, ABS:0, LIVER:0, LEFT_RIBS:0, RIGHT_RIBS:0 },
    // Fighter archetype profile (multipliers + special rule)
    physicsProfile: profile,
    lastHitTime: 0,   // ms — for counter-puncher window
    rig: createBoxer3D({ trunks: trunks, skin: skin, gloveColor: gloveC }),
  };
  // Lead = left arm (orthodox), Rear = right arm.
  return b;
}

let player, cpu;

function getArm(b, which){
  return (which === 'lead') ? b.rig.armL : b.rig.armR;
}

function resetMatch(){
  state = 'fight';
  paused = false;
  document.getElementById('pause-screen').style.display = 'none';
  round = 1;
  roundClock = raceMode ? RACE_DURATION : ROUND_LEN;
  raceDamageDealt = 0;
  scorePlayer = 0; scoreCpu = 0;
  knockdownsPlayer = 0; knockdownsCpu = 0;
  document.getElementById('hud').classList.toggle('race-mode', raceMode);
  document.getElementById('race-banner').style.display = raceMode ? 'block' : 'none';
  document.getElementById('round-num').textContent = raceMode ? 'RACE' : 'R1';
  setupRound(true);
  hideScreen('screen-title');
  hideScreen('screen-end');
  hideScreen('interlude');
  playBell();
}

function setupRound(freshMatch){
  if (player) scene.remove(player.rig.root);
  if (cpu)    scene.remove(cpu.rig.root);
  const pProfile = selectedFighter || FIGHTERS[0];
  player = makeBoxer({ name:'YOU', isPlayer:true, x:-1.6, z:0, facing:1, color:0x7d2424,
    trunks:pProfile.trunks, gloveColor:pProfile.gloveColor, skin:pProfile.skin,
    physicsProfile:pProfile });
  // CPU: always Brawler archetype as default opponent, but keep classic blue look.
  const cpuProfile = FIGHTERS[0];
  cpu    = makeBoxer({ name:'BRUNO',                x:1.6, z:0, facing:-1, color:0x1f3d6e,
    trunks:0x0066cc, gloveColor:0x3da2ff, skin:0xc08550,
    physicsProfile:cpuProfile });
  cpu.aiAggression = 0.45 + round*0.12;
  cpu.aiReaction   = 0.35 + round*0.10;
  scene.add(player.rig.root);
  scene.add(cpu.rig.root);
  player.rig.root.position.copy(player.pos);
  cpu.rig.root.position.copy(cpu.pos);
  player.rig.root.rotation.y = 0;
  cpu.rig.root.rotation.y = Math.PI;
  roundClock = raceMode ? RACE_DURATION : ROUND_LEN;
  document.getElementById('round-num').textContent = raceMode ? 'RACE' : 'R' + round;
  // Carry zone-damage forward across rounds (cumulative for the whole match).
  if (!freshMatch && window._matchZone){
    player.zoneDmg = window._matchZone.player;
    cpu.zoneDmg    = window._matchZone.cpu;
  } else {
    window._matchZone = { player: player.zoneDmg, cpu: cpu.zoneDmg };
  }
}

// ─────────────────────────────────────────────
//  Audio
// ─────────────────────────────────────────────
let audioCtx = null;
function ensureAudio(){
  if (!audioCtx){
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e){ audioCtx = null; }
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}
function playTone({freq=200, dur=0.08, type='sine', vol=0.3, attack=0.005}){
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(t); o.stop(t + dur);
}
function playHit(power){
  ensureAudio();
  if (!audioCtx) return;
  if (power === 1){ playTone({ freq: 400, dur: 0.06, type: 'square', vol: 0.18 }); }
  else if (power === 2){ playTone({ freq: 220, dur: 0.10, type: 'square', vol: 0.25 }); playTone({ freq: 110, dur: 0.12, type: 'sine', vol: 0.18 }); }
  else { playTone({ freq: 90, dur: 0.18, type: 'sawtooth', vol: 0.3 }); playTone({ freq: 50, dur: 0.20, type: 'sine', vol: 0.22 }); }
}
function playBlock(){ ensureAudio(); playTone({ freq: 700, dur: 0.05, type: 'square', vol: 0.12 }); }
function playBell(){
  ensureAudio();
  for (const f of [880, 1318, 1760]) playTone({ freq: f, dur: 1.2, type: 'sine', vol: 0.16 });
}

