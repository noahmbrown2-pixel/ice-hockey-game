'use strict';

// ─────────────────────────────────────────────
//  Config
// ─────────────────────────────────────────────
const RING_HALF = 3.0;
const FLOOR_Y = 0;

// Punch table.  Zone field is which body region the punch targets.
// For zone "RIBS" the side (LEFT_RIBS / RIGHT_RIBS) is decided by which arm threw it.
const PUNCH = {
  jab:        { dmg: 0.75, stam: 5,  range: 1.6, windup:0.06, active:0.06, recover:0.18, knockback:0.12, zone:'HEAD',  word:'POW',   col:'#ffd700', power:1, family:'jab' },
  cross:      { dmg: 1.38, stam:10,  range: 1.6, windup:0.10, active:0.07, recover:0.22, knockback:0.20, zone:'HEAD',  word:'CRACK', col:'#ff7a00', power:2, family:'cross' },
  hook:       { dmg: 1.5,  stam:12,  range: 1.4, windup:0.14, active:0.08, recover:0.28, knockback:0.22, zone:'HEAD',  word:'BAM',   col:'#ff7a00', power:2, family:'hook' },
  uppercut:   { dmg: 2.5,  stam:20,  range: 1.2, windup:0.22, active:0.10, recover:0.36, knockback:0.36, zone:'CHEST', word:'BOOM',  col:'#ff3838', power:3, family:'uppercut' },
  overhand:   { dmg: 2.0,  stam:16,  range: 1.5, windup:0.16, active:0.09, recover:0.30, knockback:0.28, zone:'HEAD',  word:'WHAM',  col:'#ff3838', power:3, family:'overhand' },
  bodyShot:   { dmg: 1.13, stam: 8,  range: 1.3, windup:0.10, active:0.07, recover:0.22, knockback:0.16, zone:'ABS',   word:'THUD',  col:'#ff9a3a', power:2, family:'body' },
  liverShot:  { dmg: 1.75, stam:14,  range: 1.3, windup:0.12, active:0.08, recover:0.26, knockback:0.22, zone:'LIVER', word:'OOF',   col:'#ff5e3a', power:2, family:'body' },
  straight:   { dmg: 1.25, stam: 9,  range: 1.7, windup:0.09, active:0.07, recover:0.22, knockback:0.18, zone:'HEAD',  word:'POW',   col:'#ffd700', power:2, family:'straight' },
  checkHook:  { dmg: 1.38, stam:10,  range: 1.4, windup:0.10, active:0.07, recover:0.20, knockback:0.18, zone:'HEAD',  word:'SNAP',  col:'#ff7a00', power:2, family:'hook' },
  shovelHook: { dmg: 1.63, stam:12,  range: 1.3, windup:0.12, active:0.08, recover:0.26, knockback:0.22, zone:'RIBS',  word:'CRUNCH',col:'#ff7a00', power:2, family:'hook' },
  corkscrew:  { dmg: 1.5,  stam:11,  range: 1.5, windup:0.10, active:0.08, recover:0.24, knockback:0.20, zone:'HEAD',  word:'TWIST', col:'#ff7a00', power:2, family:'cross' },
  haymaker:   { dmg: 3.0,  stam:26,  range: 1.3, windup:0.30, active:0.12, recover:0.50, knockback:0.46, zone:'HEAD',  word:'KO!!!', col:'#ff3838', power:3, family:'haymaker' },
};

// Which punches use the lead arm always, the rear arm always, or alternate L/R per press.
// "lead" / "rear" map to a fighter's lead/rear stance.  Player = lead-left orthodox.
const PUNCH_HAND = {
  jab:'lead', cross:'rear', hook:'alt', uppercut:'alt', overhand:'alt',
  bodyShot:'alt', liverShot:'alt', straight:'alt', checkHook:'lead',
  shovelHook:'alt', corkscrew:'alt', haymaker:'alt',
};

// Key → punch.  Buttons that share L/R use the same key.
const KEY_PUNCH = {
  'j':'jab', 'k':'cross', 'u':'hook', 'i':'uppercut', 'o':'overhand',
  'b':'bodyShot', 'v':'liverShot', 'y':'straight', 'h':'checkHook',
  'g':'shovelHook', 'c':'corkscrew', 'x':'haymaker',
};

const ROUND_LEN = 60;
const TOTAL_ROUNDS = 3;

// ─────────────────────────────────────────────
//  Fighter archetypes — physics/stat profiles
// ─────────────────────────────────────────────
// Each profile defines stat multipliers + visual color overrides.
// Stat bars (0–10) drive the preview UI only.
const FIGHTERS = [
  { id:'brawler',  name:'BRAWLER',           desc:'Heavy hands and a slow windup. Knockback for days; gas tank suffers.',
    skin:0xc88555, trunks:0x7d1212, gloveColor:0xcc1a1a,
    dmgMult:1.4, staminaMult:1.0, windupMult:1.5, recoverMult:1.2, rangeMult:1.0,
    speedMult:0.92, maxHp:100, maxStam:90, blockMult:1.0, damageTakenMult:1.0, kbMult:1.5, staminaRegen:0.75,
    bars:{ speed:3, power:9, defense:5, stamina:4 }, specialRule:null,
    aiAggression:0.85, aiReaction:0.35 },
  { id:'speedster', name:'SPEEDSTER',        desc:'Fast hands, fast feet, but stings instead of cracks. Great recovery.',
    skin:0xd9b08a, trunks:0xffd700, gloveColor:0xffe066,
    dmgMult:0.7, staminaMult:0.8, windupMult:0.6, recoverMult:0.65, rangeMult:1.0,
    speedMult:1.3, maxHp:90, maxStam:120, blockMult:1.0, damageTakenMult:1.0, kbMult:0.85, staminaRegen:1.4,
    bars:{ speed:10, power:3, defense:5, stamina:9 }, specialRule:null,
    aiAggression:0.55, aiReaction:0.7 },
  { id:'counter',  name:'COUNTER PUNCHER',   desc:'Patient. Bait a punch, then crack a thunderous reply within a heartbeat.',
    skin:0xb88060, trunks:0x222244, gloveColor:0x7a3aff,
    dmgMult:1.0, staminaMult:1.0, windupMult:1.0, recoverMult:1.0, rangeMult:1.0,
    speedMult:1.0, maxHp:100, maxStam:100, blockMult:1.1, damageTakenMult:1.0, kbMult:1.0, staminaRegen:1.0,
    bars:{ speed:6, power:7, defense:7, stamina:6 }, specialRule:'counterPunch',
    aiAggression:0.5, aiReaction:0.6 },
  { id:'tank',     name:'TANK',              desc:'Walking wall of granite. Takes a beating, plods forward, never runs out of gas.',
    skin:0xa07050, trunks:0x2a2a2a, gloveColor:0x444444,
    dmgMult:1.0, staminaMult:0.5, windupMult:1.15, recoverMult:1.1, rangeMult:1.0,
    speedMult:0.75, maxHp:140, maxStam:100, blockMult:1.15, damageTakenMult:0.7, kbMult:0.7, staminaRegen:1.2,
    bars:{ speed:2, power:6, defense:10, stamina:9 }, specialRule:null,
    aiAggression:0.6, aiReaction:0.4 },
  { id:'boxer',    name:'BOXER',             desc:'Technical, long-range. Crisp jabs and crosses; hooks lose some venom.',
    skin:0xd6a070, trunks:0x1166aa, gloveColor:0x3da2ff,
    dmgMult:1.0, staminaMult:0.85, windupMult:0.9, recoverMult:0.9, rangeMult:1.15,
    speedMult:1.1, maxHp:100, maxStam:115, blockMult:1.1, damageTakenMult:0.95, kbMult:1.0, staminaRegen:1.2,
    bars:{ speed:8, power:6, defense:7, stamina:9 }, specialRule:null,
    punchTypeMults:{ jab:1.3, cross:1.3, straight:1.3, hook:0.8, checkHook:0.8, haymaker:0.8, shovelHook:0.85 },
    aiAggression:0.55, aiReaction:0.65 },
  { id:'slugger',  name:'SLUGGER',           desc:'One-shot finisher. Loops bombs from the hip — if they land, it is over.',
    skin:0xb56a3a, trunks:0x222222, gloveColor:0xff3838,
    dmgMult:1.0, staminaMult:1.25, windupMult:1.25, recoverMult:1.8, rangeMult:1.0,
    speedMult:0.9, maxHp:100, maxStam:85, blockMult:0.95, damageTakenMult:1.05, kbMult:1.35, staminaRegen:0.8,
    bars:{ speed:3, power:10, defense:4, stamina:3 }, specialRule:'sluggerStun',
    punchTypeMults:{ haymaker:1.6, overhand:1.6, hook:1.6, checkHook:1.4 },
    aiAggression:0.9, aiReaction:0.3 },
  { id:'pressure', name:'PRESSURE FIGHTER',  desc:'Constant forward march. Drains the opponent every time leather lands.',
    skin:0xc89060, trunks:0x9b1818, gloveColor:0xff7a3a,
    dmgMult:1.0, staminaMult:1.1, windupMult:0.95, recoverMult:0.95, rangeMult:1.0,
    speedMult:1.15, maxHp:100, maxStam:105, blockMult:1.0, damageTakenMult:1.0, kbMult:1.05, staminaRegen:1.1,
    bars:{ speed:8, power:6, defense:6, stamina:7 }, specialRule:'staminaDrain',
    aiAggression:0.85, aiReaction:0.55 },
  { id:'glass',    name:'GLASS CANNON',      desc:'A live wire. Hits like a freight train, folds like wet paper.',
    skin:0xeac09a, trunks:0xff3838, gloveColor:0xffd700,
    dmgMult:1.6, staminaMult:1.0, windupMult:0.85, recoverMult:0.9, rangeMult:1.0,
    speedMult:1.1, maxHp:65, maxStam:70, blockMult:0.85, damageTakenMult:1.4, kbMult:1.2, staminaRegen:0.9,
    bars:{ speed:7, power:10, defense:2, stamina:4 }, specialRule:null,
    aiAggression:0.8, aiReaction:0.55 },
  { id:'defensive',name:'DEFENSIVE SPECIALIST', desc:'Shoulder rolls, blocks, slips. Punishes the patient.',
    skin:0xb88a60, trunks:0x336699, gloveColor:0x99ccff,
    dmgMult:0.75, staminaMult:0.7, windupMult:1.0, recoverMult:1.0, rangeMult:1.0,
    speedMult:1.05, maxHp:100, maxStam:120, blockMult:1.6, damageTakenMult:0.85, kbMult:0.9, staminaRegen:1.3,
    bars:{ speed:7, power:4, defense:10, stamina:9 }, specialRule:'shortDodgeCd',
    aiAggression:0.4, aiReaction:0.8 },
  { id:'street',   name:'STREET FIGHTER',    desc:'Dirty boxer. Liver shots, body rips, and shovel hooks. Headhunters beware.',
    skin:0xa86840, trunks:0x3a3a1a, gloveColor:0x666633,
    dmgMult:1.0, staminaMult:1.0, windupMult:1.0, recoverMult:1.0, rangeMult:1.0,
    speedMult:1.0, maxHp:100, maxStam:100, blockMult:1.0, damageTakenMult:1.0, kbMult:1.3, staminaRegen:1.0,
    bars:{ speed:6, power:7, defense:6, stamina:7 }, specialRule:null,
    punchTypeMults:{ bodyShot:1.7, liverShot:1.7, shovelHook:1.7, jab:0.8, cross:0.8, straight:0.8, hook:0.85 },
    aiAggression:0.7, aiReaction:0.55 },
];

let selectedFighter = FIGHTERS[0];

