// ============================================================
// PLAYER
// ============================================================
let P = {
  x: 1500, y: 1500,
  w: 20, h: 20,
  vx: 0, vy: 0,
  hp: 100, maxHp: 100,
  stamina: 100, maxStamina: 100,
  hunger: 100, maxHunger: 100,
  thirst: 100, maxThirst: 100,
  xp: 0, level: 1, xpNeeded: 100,
  speed: 3.0,
  damage: 1.0,
  defense: 1.0,
  class: 'soldier',
  skillCDs: {Q:0, F:0, G:0},
  skillActive: {},
  effects: {},
  inventory: Array(20).fill(null),
  hotbar: Array(8).fill(null),
  equipped: 0,
  equippedRanged: null,
  coins: 0,
  skillPoints: 0,
  passives: {},
  dead: false,
  secondWindUsed: false,
  facing: 0,
  attackCD: 0,
  damageFlash: 0,
  angle: 0,
};

// ============================================================
// ITEM DEFINITIONS
// ============================================================
const ITEMS = {
  fist:       {name:'Fist',type:'melee',dmg:5,dur:999,maxDur:999,color:'#fa8',speed:0.3,range:30,icon:'✊'},
  bat:        {name:'Baseball Bat',type:'melee',dmg:15,dur:80,maxDur:80,color:'#a84',speed:0.5,range:35,icon:'🏏'},
  machete:    {name:'Machete',type:'melee',dmg:22,dur:60,maxDur:60,color:'#aaf',speed:0.4,range:38,icon:'⚔'},
  axe:        {name:'Axe',type:'melee',dmg:30,dur:50,maxDur:50,color:'#888',speed:0.7,range:36,icon:'🪓'},
  chainsaw:   {name:'Chainsaw',type:'melee',dmg:45,dur:40,maxDur:40,color:'#f44',speed:0.25,range:40,icon:'⛏'},
  spiked_bat: {name:'Spiked Bat',type:'melee',dmg:28,dur:70,maxDur:70,color:'#f84',speed:0.45,range:35,icon:'🔩'},
  pistol:     {name:'Pistol',type:'ranged',dmg:25,dur:999,maxDur:999,color:'#aaa',ammo:12,maxAmmo:12,spread:0.05,speed:1.0,range:400,icon:'🔫'},
  shotgun:    {name:'Shotgun',type:'ranged',dmg:18,dur:999,maxDur:999,color:'#888',ammo:6,maxAmmo:6,spread:0.25,pellets:6,speed:1.2,range:250,icon:'🔫'},
  rifle:      {name:'Rifle',type:'ranged',dmg:55,dur:999,maxDur:999,color:'#4a4',ammo:8,maxAmmo:8,spread:0.02,speed:1.5,range:600,icon:'🔫'},
  smg:        {name:'SMG',type:'ranged',dmg:15,dur:999,maxDur:999,color:'#48f',ammo:30,maxAmmo:30,spread:0.12,speed:0.25,range:300,icon:'🔫'},
  ammo_pistol:{name:'Pistol Ammo',type:'ammo',for:'pistol',count:12,icon:'•'},
  ammo_shotgun:{name:'Shotgun Ammo',type:'ammo',for:'shotgun',count:6,icon:'•'},
  ammo_rifle: {name:'Rifle Ammo',type:'ammo',for:'rifle',count:8,icon:'•'},
  ammo_smg:   {name:'SMG Ammo',type:'ammo',for:'smg',count:30,icon:'•'},
  bandage:    {name:'Bandage',type:'consumable',heal:20,icon:'🩹'},
  medkit:     {name:'Medkit',type:'consumable',heal:60,icon:'🏥'},
  food_can:   {name:'Canned Food',type:'food',hunger:40,icon:'🥫'},
  rations:    {name:'Rations',type:'food',hunger:25,icon:'🍱'},
  water:      {name:'Water Bottle',type:'drink',thirst:50,icon:'💧'},
  soda:       {name:'Soda',type:'drink',thirst:30,hunger:10,icon:'🥤'},
  wood:       {name:'Wood',type:'material',icon:'🪵'},
  nails:      {name:'Nails',type:'material',icon:'📌'},
  alcohol:    {name:'Alcohol',type:'material',icon:'🧴'},
  cloth:      {name:'Cloth',type:'material',icon:'🧶'},
  metal:      {name:'Metal Scrap',type:'material',icon:'⚙'},
  gunpowder:  {name:'Gunpowder',type:'material',icon:'💣'},
  flashlight: {name:'Flashlight',type:'tool',icon:'🔦'},
  key_card:   {name:'Key Card',type:'key',icon:'🔑'},
  blueprint:  {name:'Blueprint',type:'blueprint',icon:'📋'},
  armor_vest: {name:'Armor Vest',type:'armor',defense:0.4,icon:'🦺'},
  helmet:     {name:'Helmet',type:'armor',defense:0.2,icon:'⛑'},
  grenade_item:{name:'Grenade',type:'throwable',dmg:80,radius:120,icon:'💣'},
};

// ============================================================
// CRAFTING RECIPES
// ============================================================
const RECIPES = [
  {result:'medkit',count:1,needs:{bandage:2,alcohol:1},name:'Medkit',level:1},
  {result:'spiked_bat',count:1,needs:{bat:1,nails:2},name:'Spiked Bat',level:1},
  {result:'ammo_pistol',count:1,needs:{gunpowder:2,metal:1},name:'Pistol Ammo',level:3},
  {result:'armor_vest',count:1,needs:{cloth:3,metal:2},name:'Armor Vest',level:2},
  {result:'helmet',count:1,needs:{metal:3},name:'Helmet',level:2},
  {result:'grenade_item',count:1,needs:{metal:2,gunpowder:3},name:'Grenade',level:4},
];

// ============================================================
// LOOT TABLES
// ============================================================
const LOOT_TABLES = {
  tavern:    ['food_can','food_can','soda','water','alcohol','bandage','bat','machete','cloth'],
  farmhouse: ['food_can','water','bandage','cloth','bat','wood','nails','flashlight'],
  barn:      ['wood','wood','nails','metal','axe','cloth','food_can','armor_vest'],
  mill:      ['wood','metal','nails','food_can','water'],
  crop:      ['food_can','food_can','food_can','water','cloth','bandage'],
  forest:    ['wood','wood','cloth','food_can'],
  // kept for compatibility
  house:     ['bandage','food_can','water','wood','nails','cloth','bat','flashlight'],
  hospital:  ['medkit','bandage','bandage','alcohol','cloth','water'],
  military:  ['pistol','ammo_pistol','ammo_rifle','rifle','armor_vest','helmet','grenade_item'],
  mall:      ['food_can','soda','cloth','armor_vest','bat','machete','flashlight'],
};

// ============================================================
// ZONE / MAP DEFINITIONS
// ============================================================
const ZONES = [
  {name:'Tavern',      x:1350,y:1350,w:300,h:300,color:'#6b4c1e',danger:2,loot:'tavern'},
  {name:'North Hay Field', x:400,y:80, w:2200,h:700,color:'#c8a030',danger:1,loot:'crop'},
  {name:'South Hay Field', x:400,y:2220,w:2200,h:700,color:'#c8a030',danger:1,loot:'crop'},
  {name:'West Hay Field',  x:80, y:400,w:600, h:2200,color:'#c8a030',danger:1,loot:'crop'},
  {name:'East Hay Field',  x:2320,y:400,w:600,h:2200,color:'#c8a030',danger:1,loot:'crop'},
  {name:'Old Farmhouse',   x:150,y:150,w:500,h:500,color:'#7a6040',danger:1,loot:'farmhouse'},
  {name:'Barn',            x:2350,y:150,w:500,h:450,color:'#7a2a1a',danger:2,loot:'barn'},
  {name:'Crop Fields',     x:150,y:2350,w:500,h:500,color:'#4a7a20',danger:1,loot:'crop'},
  {name:'Old Mill',        x:2350,y:2350,w:500,h:500,color:'#6a5030',danger:2,loot:'mill'},
];

// ============================================================
// BUILDINGS
// ============================================================
let BUILDINGS = [];
function genBuildings() {
  BUILDINGS = [];

  // Tavern — fixed large central building
  BUILDINGS.push({x:1390,y:1390,w:220,h:180,zone:'tavern',looted:false,
    doorX:1500,doorY:1565,isTavern:true,name:'Tavern',
    color:'#8b5e2a',color2:'#a0702e'});

  // Old Farmhouse zone — 4-6 farmhouses
  const fhZone = ZONES.find(z=>z.name==='Old Farmhouse');
  for(let i=0;i<5;i++){
    const bw=90+Math.random()*40, bh=80+Math.random()*40;
    const bx=fhZone.x+30+Math.random()*(fhZone.w-bw-60);
    const by=fhZone.y+30+Math.random()*(fhZone.h-bh-60);
    BUILDINGS.push({x:bx,y:by,w:bw,h:bh,zone:'farmhouse',looted:false,
      doorX:bx+bw/2-10,doorY:by+bh-5,name:'Farmhouse',
      color:'#8a7050',color2:'#9a8060'});
  }
  // Safehouse is the first farmhouse
  BUILDINGS[1].safe=true; BUILDINGS[1].name='Safe House';

  // Barn zone — 2 big barns + small sheds
  const barnZone = ZONES.find(z=>z.name==='Barn');
  for(let i=0;i<3;i++){
    const bw=120+Math.random()*60, bh=100+Math.random()*50;
    const bx=barnZone.x+30+Math.random()*(barnZone.w-bw-60);
    const by=barnZone.y+30+Math.random()*(barnZone.h-bh-60);
    BUILDINGS.push({x:bx,y:by,w:bw,h:bh,zone:'barn',looted:false,
      doorX:bx+bw/2-10,doorY:by+bh-5,name:'Barn',
      color:'#7a2010',color2:'#8b3020'});
  }

  // Crop Fields — scattered sheds
  const cropZone = ZONES.find(z=>z.name==='Crop Fields');
  for(let i=0;i<3;i++){
    const bw=60+Math.random()*30, bh=50+Math.random()*30;
    const bx=cropZone.x+20+Math.random()*(cropZone.w-bw-40);
    const by=cropZone.y+20+Math.random()*(cropZone.h-bh-40);
    BUILDINGS.push({x:bx,y:by,w:bw,h:bh,zone:'crop',looted:false,
      doorX:bx+bw/2-10,doorY:by+bh-5,name:'Storage Shed',
      color:'#6a5030',color2:'#7a6040'});
  }

  // Old Mill zone — mill + sheds
  const millZone = ZONES.find(z=>z.name==='Old Mill');
  for(let i=0;i<3;i++){
    const bw=70+Math.random()*50, bh=70+Math.random()*50;
    const bx=millZone.x+20+Math.random()*(millZone.w-bw-40);
    const by=millZone.y+20+Math.random()*(millZone.h-bh-40);
    BUILDINGS.push({x:bx,y:by,w:bw,h:bh,zone:'mill',looted:false,
      doorX:bx+bw/2-10,doorY:by+bh-5,name:'Mill',
      color:'#7a6040',color2:'#8a7050'});
  }
}

