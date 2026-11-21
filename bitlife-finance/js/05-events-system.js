// ════════════════════════════════════════════════════════════════
//  EVENTS SYSTEM
// ════════════════════════════════════════════════════════════════

const EVENTS_POOL = [
  {id:'lottery',title:'Lucky Scratch Ticket',cat:'opportunity',icon:'🎟️',
   cond:c=>c.age>=18,
   desc:'A $5 scratch ticket at the gas station is calling your name.',
   choices:[
    {text:'Buy it ($5)',fn(c){const r=Math.random();if(r<0.005){const p=ri(10000,200000);c.checking+=p-5;return`JACKPOT! Won ${fmt$(p)}!`;}if(r<0.08){const p=pick([10,20,50,100]);c.checking+=p-5;return`Won ${fmt$(p)}! (Net ${fmt$(p-5)})`;}c.checking-=5;return'Lost $5. As expected.'}},
    {text:'Pass',fn(c){return'Kept your $5. Fiscally responsible.'}},
  ]},
  {id:'stock_tip',title:'Hot Stock Tip',cat:'opportunity',icon:'📊',
   cond:c=>c.age>=21&&c.checking>=500,
   desc:'Your friend whispers: "MOOV is going to the moon." His last tip tripled. His one before that? Down 80%.',
   choices:[
    {text:'Invest $500',fn(c){if(Math.random()<0.35){const g=ri(400,2000);c.checking+=g;return`Moon! +${fmt$(g)}`}c.checking-=500;return'Crashed. -$500. Your friend is unavailable.'}},
    {text:'Invest $2,000',fn(c){if(c.checking<2000)return'Not enough cash.';if(Math.random()<0.3){const g=ri(2000,10000);c.checking+=g;return`Big win! +${fmt$(g)}`}c.checking-=2000;return'Wiped. -$2,000.'}},
    {text:'Ignore',fn(c){return'Passed. No regrets. Probably.'}},
  ]},
  {id:'medical',title:'Medical Emergency',cat:'disaster',icon:'🏥',
   cond:c=>c.age>=18,
   desc:'Something alarming came up at your check-up. Hospital time.',
   choices:[
    {text:'Get treated',fn(c){const b=ri(5000,60000);c.checking-=b;c.health=clamp(c.health+10,0,100);return`Medical bill: ${fmt$(b)}. At least you're alive.`}},
    {text:'Use insurance',fn(c){const b=ri(5000,60000);const cov=Math.round(b*rf(0.4,0.8));c.checking-=b-cov;c.health=clamp(c.health+8,0,100);return`Insurance covered ${fmt$(cov)}. You paid ${fmt$(b-cov)}.`}},
    {text:'Delay (risky)',fn(c){if(pct(0.4)){c.health=clamp(c.health-25,0,100);const b=ri(10000,100000);c.checking-=b;return`Got worse. ${fmt$(b)} and declining health.`}c.health=clamp(c.health-8,0,100);return'Resolved itself. Lucky.'}},
  ]},
  {id:'car_break',title:'Car Breakdown',cat:'disaster',icon:'🚗',
   cond:c=>c.hasCar,
   desc:'It made a sound. Then smoke. Then silence.',
   choices:[
    {text:'Repair it',fn(c){const cost=pick([800,1400,2500,4000]);c.checking-=cost;return`Fixed for ${fmt$(cost)}.`}},
    {text:'Sell for scrap',fn(c){const net=ri(500,2000)-ri(6000,14000);c.checking+=net;return`Net cost: ${fmt$(Math.abs(net))}`}},
    {text:'Go without',fn(c){c.hasCar=false;c.happiness=clamp(c.happiness-15,0,100);return'No car. Bus pass acquired.'}},
  ]},
  {id:'house_repair',title:'Major Home Repair',cat:'disaster',icon:'🔧',
   cond:c=>c.hasHouse,
   desc:'The roof, the HVAC, the plumbing — something expensive just failed.',
   choices:[
    {text:'Fix properly',fn(c){const cost=pick([3000,6500,10000,18000]);c.checking-=cost;return`Fixed for ${fmt$(cost)}.`}},
    {text:'DIY it',fn(c){if(pct(0.5)){c.checking-=ri(500,2000);return'DIY success! Saved thousands.'}const cost=ri(8000,30000);c.checking-=cost;return`Made it worse. Pro cost ${fmt$(cost)}.`}},
  ]},
  {id:'inheritance',title:'Unexpected Inheritance',cat:'opportunity',icon:'📜',
   cond:c=>c.age>=28,
   desc:'A distant relative you barely remember has passed. You\'re in the will.',
   choices:[
    {text:'Accept',fn(c){const a=pick([10000,25000,50000,80000,120000,250000]);c.checking+=a;return`Inherited ${fmt$(a)}.`}},
    {text:'Donate to charity',fn(c){c.happiness=clamp(c.happiness+20,0,100);return'Donated it. Net worth: 0. Self-worth: +100.'}},
  ]},
  {id:'promotion',title:'Promotion Offer',cat:'opportunity',icon:'💼',
   cond:c=>c.employed&&c.age>=24&&c.salary>=30000,
   desc:'Your boss calls you in. There\'s a senior role opening. More pay. More meetings.',
   choices:[
    {text:'Accept',fn(c){const r=ri(8000,25000);c.salary+=r;c.happiness=clamp(c.happiness+12,0,100);return`Promoted! +${fmt$(r)}/yr raise.`}},
    {text:'Counter-offer',fn(c){if(pct(0.55)){const r=ri(15000,35000);c.salary+=r;return`Counter accepted! +${fmt$(r)}/yr`}const r=ri(3000,10000);c.salary+=r;return`Counter failed. Base raise: +${fmt$(r)}/yr`}},
    {text:'Decline',fn(c){c.happiness=clamp(c.happiness+8,0,100);return'Work-life balance chosen.'}},
  ]},
  {id:'signing_bonus',title:'Job Offer with Signing Bonus',cat:'opportunity',icon:'✉️',
   cond:c=>c.age>=22&&c.age<=55,
   desc:'A recruiter reached out. New company, better pay, signing bonus.',
   choices:[
    {text:'Accept',fn(c){const b=ri(5000,40000);const r=ri(5000,20000);c.checking+=b;c.salary=(c.salary||40000)+r;return`Bonus: ${fmt$(b)}, +${fmt$(r)}/yr`}},
    {text:'Use as leverage',fn(c){if(pct(0.6)){const r=ri(6000,18000);c.salary=(c.salary||40000)+r;return`Counter accepted! +${fmt$(r)}/yr`}return'Bluff called. Staying at same salary.'}},
    {text:'Decline',fn(c){return'Stayed put. Stability chosen.'}},
  ]},
  {id:'lawsuit',title:"You're Being Sued",cat:'disaster',icon:'⚖️',
   cond:c=>c.age>=22,
   desc:'Someone slipped. Something broke. There\'s a summons on your doorstep.',
   choices:[
    {text:'Settle',fn(c){const cost=ri(10000,75000);c.checking-=cost;return`Settled for ${fmt$(cost)}.`}},
    {text:'Fight it',fn(c){const legal=ri(20000,60000);if(pct(0.5)){c.checking-=legal;return`Won! But legal fees: ${fmt$(legal)}.`}const j=ri(25000,200000);c.checking-=(legal+j);return`Lost. Total damage: ${fmt$(legal+j)}.`}},
  ]},
  {id:'casino',title:'Casino Night',cat:'flavor',icon:'🎰',
   cond:c=>c.age>=21,
   desc:'Bachelor party. Office trip. Either way you\'re at the casino.',
   choices:[
    {text:'$100 limit',fn(c){if(pct(0.35)){const w=ri(50,400);c.checking+=w;return`Won ${fmt$(w)}!`}c.checking-=100;return'Lost $100. Still fun.'}},
    {text:'Go big $1,000',fn(c){if(c.checking<1000)return'Not enough cash.';if(pct(0.25)){const w=ri(500,5000);c.checking+=w;return`BIG WIN: +${fmt$(w)}!`}c.checking-=1000;return'Lost $1,000. The house always wins.'}},
    {text:'Just watch',fn(c){c.checking-=ri(30,80);return'Watched others lose. Smug and slightly drunk.'}},
  ]},
  {id:'work_bonus',title:'Surprise Work Bonus',cat:'flavor',icon:'🎁',
   cond:c=>c.employed&&c.salary>0,
   desc:'The company hit its targets. There\'s something extra in your paycheck.',
   choices:[
    {text:'Deposit it',fn(c){const b=Math.round((c.salary||50000)*rf(0.03,0.15));c.checking+=b;return`Bonus: ${fmt$(b)}!`}},
    {text:'Splurge',fn(c){const b=Math.round((c.salary||50000)*rf(0.03,0.15));const s=Math.round(b*rf(0.5,1));c.checking+=b-s;c.happiness=clamp(c.happiness+15,0,100);return`Bonus ${fmt$(b)}, splurged ${fmt$(s)}.`}},
  ]},
  {id:'side_hustle',title:'Side Hustle Opportunity',cat:'flavor',icon:'⚡',
   cond:c=>c.age>=20&&c.age<=55,
   desc:'Freelance gig, reselling, YouTube channel — opportunity knocked.',
   choices:[
    {text:'Start it',fn(c){const cost=ri(200,1500);const up=ri(3000,18000);if(pct(0.6)){c.checking+=up-cost;c.salary=Math.round((c.salary||0)+up*0.3);return`Side hustle paying off! ${fmt$(up-cost)} + recurring income.`}c.checking-=cost;return`Flopped. Lost ${fmt$(cost)}.`}},
    {text:'Too busy',fn(c){c.happiness=clamp(c.happiness+3,0,100);return'Weekend saved. Sanity retained.'}},
  ]},
  {id:'market_crash',title:'Market Crash Warning',cat:'disaster',icon:'📉',
   cond:c=>stockPortfolioValue(GS.inv)>5000,
   desc:'Your portfolio is exposed. Everyone\'s saying crash. Even the barista.',
   choices:[
    {text:'Sell everything',fn(c){const v=Math.round(stockPortfolioValue(GS.inv));const tax=Math.round(v*0.15);Object.keys(GS.inv.portfolio).forEach(k=>delete GS.inv.portfolio[k]);c.checking+=v-tax;return`Sold all stocks. Net: ${fmt$(v-tax)} after capital gains tax.`}},
    {text:'Hold — it recovers',fn(c){if(pct(0.55)){const loss=Math.round(stockPortfolioValue(GS.inv)*rf(0.2,0.5));Object.entries(GS.inv.portfolio).forEach(([k,p])=>{const s=GS.inv.stocks.find(x=>x.id===k);if(s)s.price=Math.round(s.price*rf(0.5,0.8));});return`Crash hit. Portfolio down ~${fmt$(loss)}. Holding.`}return'False alarm. Still invested.'}},
  ]},
  {id:'marriage',title:'Ready to Propose?',cat:'milestone',icon:'💍',
   cond:c=>c.relationship==='dating'&&c.age>=24&&!c._everMarried&&c.checking>=3000,
   desc:'You\'ve been together for a while. The ring is calling.',
   choices:[
    {text:'Propose! (full wedding)',fn(c){const w=ri(8000,45000);c.checking-=w;c.relationship='married';c._everMarried=true;c.happiness=clamp(c.happiness+30,0,100);return`Married! Wedding: ${fmt$(w)}. Love is worth it.`}},
    {text:'Elope',fn(c){const cost=ri(500,3000);c.checking-=cost;c.relationship='married';c._everMarried=true;c.happiness=clamp(c.happiness+25,0,100);return`Eloped! ${fmt$(cost)} total. Practical and romantic.`}},
    {text:'Not yet',fn(c){return'The ring stays in the drawer.'}},
  ]},
  {id:'baby',title:'Bundle of Joy',cat:'milestone',icon:'👶',
   cond:c=>c.relationship==='married'&&c.age>=24&&c.age<=42&&c.kids<4,
   desc:'There\'s a pregnancy test on the counter. The plus sign is very clear.',
   choices:[
    {text:'Welcome the baby',fn(c){c.kids++;const setup=ri(3000,8000);c.checking-=setup;c.happiness=clamp(c.happiness+20,0,100);return`Baby #${c.kids}! Setup cost ${fmt$(setup)}, +$15k/yr expenses.`}},
    {text:'Not right now',fn(c){c.happiness=clamp(c.happiness-5,0,100);return'Decided to wait.'}},
  ]},
  {id:'retirement_trig',title:'Time to Retire?',cat:'milestone',icon:'🌅',
   cond:c=>c.age>=65&&!c.retired,
   desc:'You\'re 65. The office door is still there. So is the exit.',
   choices:[
    {text:'Retire now',fn(c){c.retired=true;c.employed=false;c.salary=0;c.happiness=clamp(c.happiness+25,0,100);const draw=Math.round(totalRetirement(GS.inv)*0.04);c.checking+=draw;return`Retired! Annual draw: ${fmt$(draw)} (4% rule).`}},
    {text:'Work more years',fn(c){const b=ri(5000,20000);c.checking+=b;return`Worked another year. Retirement fund grows. Bonus: ${fmt$(b)}`}},
    {text:'Semi-retire',fn(c){c.salary=Math.round((c.salary||60000)*0.4);c.jobTitle='Consultant';c.happiness=clamp(c.happiness+15,0,100);return`Semi-retired. Part-time: ${fmt$(c.salary)}/yr`}},
  ]},
];

function selectEvents(char){
  const rw={opportunity:60,disaster:40,milestone:50,flavor:30};
  const elig=EVENTS_POOL.filter(e=>{try{return e.cond(char)}catch{return false}});
  if(!elig.length)return[];
  const pool=elig.map(e=>({e,w:rw[e.cat]||20}));
  const total=pool.reduce((s,x)=>s+x.w,0);
  const count=ri(1,3); const sel=[]; const used=new Set();
  for(let i=0;i<count;i++){
    const rem=pool.filter(x=>!used.has(x.e.id));
    if(!rem.length)break;
    let r=Math.random()*rem.reduce((s,x)=>s+x.w,0);
    for(const{e,w}of rem){r-=w;if(r<=0){sel.push(e);used.add(e.id);break;}}
  }
  return sel;
}

