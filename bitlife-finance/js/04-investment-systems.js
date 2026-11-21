// ════════════════════════════════════════════════════════════════
//  INVESTMENT SYSTEMS
// ════════════════════════════════════════════════════════════════

const STOCKS = [
  // Tech / semiconductors
  {id:'APPL',name:'Applex',        sector:'tech',      price:180, vol:0.28},
  {id:'MSOF',name:'Microsafe',     sector:'tech',      price:340, vol:0.24},
  {id:'NVID',name:'NvidiaX',       sector:'tech',      price:620, vol:0.45},
  {id:'GOOG',name:'Googol',        sector:'tech',      price:145, vol:0.26},
  {id:'META',name:'Metabook',      sector:'tech',      price:420, vol:0.35},
  {id:'AMZN',name:'Amazone',       sector:'tech',      price:185, vol:0.30},
  {id:'NFLX',name:'Netflex',       sector:'tech',      price:560, vol:0.38},
  {id:'ADBE',name:'Adobex',        sector:'tech',      price:520, vol:0.27},
  {id:'CRM', name:'Salesfarm',     sector:'tech',      price:270, vol:0.32},
  {id:'ORCL',name:'Oraqle',        sector:'tech',      price:125, vol:0.22},
  {id:'AMD', name:'AMDx',          sector:'tech',      price:155, vol:0.48},
  {id:'INTC',name:'Inteel',        sector:'tech',      price:38,  vol:0.35},
  {id:'AVGO',name:'Broadcomb',     sector:'tech',      price:1450,vol:0.30},
  {id:'QCOM',name:'Qualcume',      sector:'tech',      price:165, vol:0.30},
  {id:'TSMC',name:'Taiwan Semix',  sector:'tech',      price:170, vol:0.32},
  {id:'PLTR',name:'Palantear',     sector:'tech',      price:28,  vol:0.60},
  {id:'SNOW',name:'Snowfall',      sector:'tech',      price:175, vol:0.45},
  {id:'ZM',  name:'Zume',          sector:'tech',      price:65,  vol:0.40},

  // Auto / EV
  {id:'TSLA',name:'Teslon',        sector:'auto',      price:250, vol:0.55},
  {id:'F',   name:'Ford-o',        sector:'auto',      price:12,  vol:0.28},
  {id:'GM',  name:'Generall Motor',sector:'auto',      price:44,  vol:0.30},
  {id:'RIVN',name:'Rivyne',        sector:'auto',      price:14,  vol:0.70},
  {id:'NIO', name:'Niox',          sector:'auto',      price:7,   vol:0.75},

  // Energy
  {id:'EXXO',name:'ExxoMobile',    sector:'energy',    price:110, vol:0.22},
  {id:'CVX', name:'Chevrox',       sector:'energy',    price:150, vol:0.22},
  {id:'SLB', name:'Schlumbergo',   sector:'energy',    price:48,  vol:0.30},
  {id:'COP', name:'ConocoPhillup', sector:'energy',    price:115, vol:0.25},
  {id:'ENPH',name:'Enphaze Solar', sector:'energy',    price:95,  vol:0.60},
  {id:'NEE', name:'NextEra Power', sector:'energy',    price:62,  vol:0.20},

  // Retail / consumer
  {id:'WLMT',name:'Wallmart',      sector:'retail',    price:58,  vol:0.18},
  {id:'COST',name:'Costcow',       sector:'retail',    price:720, vol:0.22},
  {id:'HD',  name:'Home Deposit',  sector:'retail',    price:380, vol:0.24},
  {id:'TGT', name:'Targit',        sector:'retail',    price:145, vol:0.28},
  {id:'NKE', name:'Nikey',         sector:'retail',    price:85,  vol:0.28},
  {id:'LULU',name:'Lulalemon',     sector:'retail',    price:340, vol:0.35},
  {id:'SBUX',name:'Starbuckz',     sector:'retail',    price:95,  vol:0.24},
  {id:'MCD', name:'McDoodle\'s',   sector:'retail',    price:290, vol:0.18},
  {id:'CMG', name:'Chipotler',     sector:'retail',    price:60,  vol:0.30},

  // Finance
  {id:'JPMG',name:'JP Morgen',     sector:'finance',   price:200, vol:0.20},
  {id:'BAC', name:'Bankz of Am.',  sector:'finance',   price:38,  vol:0.28},
  {id:'WFC', name:'Wellz Fargo',   sector:'finance',   price:55,  vol:0.27},
  {id:'GS',  name:'Goldmun Sachs', sector:'finance',   price:445, vol:0.27},
  {id:'MS',  name:'Morgun Stanley',sector:'finance',   price:92,  vol:0.28},
  {id:'V',   name:'Visaa',         sector:'finance',   price:270, vol:0.19},
  {id:'MA',  name:'Mastercash',    sector:'finance',   price:460, vol:0.20},
  {id:'PYPL',name:'PayPali',       sector:'finance',   price:65,  vol:0.40},
  {id:'SCHW',name:'Charlez Schwob',sector:'finance',   price:72,  vol:0.28},
  {id:'BRK', name:'Berkshore Hath.',sector:'finance',  price:420, vol:0.15},

  // Pharma / health
  {id:'PFIZ',name:'Pfaizer',       sector:'pharma',    price:28,  vol:0.19},
  {id:'JNJ', name:'Johnzon&Johnson',sector:'pharma',   price:160, vol:0.16},
  {id:'MRNA',name:'Moderno',       sector:'pharma',    price:88,  vol:0.70},
  {id:'LLY', name:'Eli Lilly-x',   sector:'pharma',    price:780, vol:0.32},
  {id:'UNH', name:'UnitedHelth',   sector:'pharma',    price:520, vol:0.22},
  {id:'ABBV',name:'AbbyVye',       sector:'pharma',    price:175, vol:0.18},
  {id:'CVS', name:'CVSdrug',       sector:'pharma',    price:66,  vol:0.22},

  // Consumer staples
  {id:'COKE',name:'Cola-Cola',     sector:'consumer',  price:62,  vol:0.13},
  {id:'PEP', name:'Pepsix',        sector:'consumer',  price:175, vol:0.15},
  {id:'PG',  name:'Proctor&Gambol',sector:'consumer',  price:155, vol:0.14},
  {id:'KO',  name:'Keuriq Drinks', sector:'consumer',  price:34,  vol:0.18},
  {id:'MO',  name:'Altrium',       sector:'consumer',  price:45,  vol:0.18},

  // Industrials / airlines
  {id:'BA',  name:'Boing',         sector:'industrial',price:180, vol:0.40},
  {id:'CAT', name:'Catawpillar',   sector:'industrial',price:360, vol:0.30},
  {id:'GE',  name:'Generall Elect',sector:'industrial',price:170, vol:0.28},
  {id:'UPS', name:'Unit. Parcel',  sector:'industrial',price:135, vol:0.22},
  {id:'DAL', name:'Deltax Air',    sector:'industrial',price:42,  vol:0.40},
  {id:'UAL', name:'Unitd Airs',    sector:'industrial',price:48,  vol:0.45},

  // Media / entertainment
  {id:'DIS', name:'Walt Disnee',   sector:'media',     price:95,  vol:0.30},
  {id:'WBD', name:'WarnerBrosz',   sector:'media',     price:9,   vol:0.55},
  {id:'SPOT',name:'Spotifye',      sector:'media',     price:340, vol:0.45},
  {id:'RBLX',name:'Robloxx',       sector:'media',     price:45,  vol:0.55},

  // Real estate / REITs
  {id:'AMT', name:'Amer. Towar',   sector:'reit',      price:210, vol:0.22},
  {id:'O',   name:'Realtee Income',sector:'reit',      price:55,  vol:0.18},
  {id:'SPG', name:'Simon Propz',   sector:'reit',      price:160, vol:0.28},

  // Speculative / meme / volatile
  {id:'GME', name:'GameStart',     sector:'meme',      price:14,  vol:1.10},
  {id:'AMC', name:'AMCx Theatres', sector:'meme',      price:4,   vol:1.20},
  {id:'COIN',name:'Coinbasa',      sector:'crypto',    price:195, vol:0.85},
  {id:'MSTR',name:'MicroStratify', sector:'crypto',    price:1400,vol:0.95},
  {id:'HOOD',name:'Robinwood',     sector:'finance',   price:28,  vol:0.75},
  {id:'SOFI',name:'Sofigh',        sector:'finance',   price:8,   vol:0.70},
  {id:'LCID',name:'Lucidd Motors', sector:'auto',      price:3,   vol:1.05},

  // ETFs (steady, index-like)
  {id:'SPY', name:'S&P 500 ETF',   sector:'etf',       price:450, vol:0.15, avgReturn:0.07},
  {id:'QQQ', name:'Nasdaq 100 ETF',sector:'etf',       price:440, vol:0.20, avgReturn:0.09},
  {id:'VTI', name:'Total Market ETF',sector:'etf',     price:245, vol:0.15, avgReturn:0.07},
  {id:'VOO', name:'Vanguaard S&P', sector:'etf',       price:415, vol:0.15, avgReturn:0.07},
  {id:'IWM', name:'Russell 2K ETF',sector:'etf',       price:200, vol:0.22, avgReturn:0.06},
  {id:'DIA', name:'Dow Jones ETF', sector:'etf',       price:375, vol:0.14, avgReturn:0.06},
  {id:'GLD', name:'Gold ETF',      sector:'etf',       price:215, vol:0.15, avgReturn:0.04},
  {id:'TLT', name:'20-yr Bond ETF',sector:'etf',       price:92,  vol:0.18, avgReturn:0.03},
];
const CRYPTOS = [
  // Majors
  {id:'BTC', name:'Bitcoin',     price:45000,  vol:0.80},
  {id:'ETH', name:'Ethereum',    price:2500,   vol:0.85},
  {id:'BNB', name:'BNB',         price:310,    vol:0.90},
  {id:'XRP', name:'XRP',         price:0.58,   vol:0.95},
  // L1s / smart contract platforms
  {id:'SOL', name:'Solana',      price:100,    vol:0.95},
  {id:'ADA', name:'Cardano',     price:0.42,   vol:1.00},
  {id:'AVAX',name:'Avalanche',   price:28,     vol:1.10},
  {id:'DOT', name:'Polkadot',    price:6.80,   vol:1.05},
  {id:'ATOM',name:'Cosmos',      price:8.20,   vol:1.10},
  {id:'NEAR',name:'Near Protocol',price:3.40,  vol:1.15},
  // L2s & scaling
  {id:'MATIC',name:'Polygon',    price:0.85,   vol:1.10},
  {id:'ARB', name:'Arbitrum',    price:1.15,   vol:1.25},
  {id:'OP',  name:'Optimism',    price:2.10,   vol:1.25},
  // DeFi
  {id:'LINK',name:'Chainlink',   price:14.50,  vol:1.00},
  {id:'UNI', name:'Uniswap',     price:6.50,   vol:1.15},
  {id:'AAVE',name:'Aave',        price:88,     vol:1.20},
  {id:'MKR', name:'Maker',       price:1850,   vol:1.05},
  // Memecoins (high vol)
  {id:'DOGE',name:'Dogecoin',    price:0.12,   vol:1.20},
  {id:'SHIB',name:'Shiba Inu',   price:0.0000095,vol:1.45},
  {id:'PEPE',name:'Pepe',        price:0.0000012,vol:1.70},
  {id:'WIF', name:'Dogwifhat',   price:2.30,   vol:1.80},
  {id:'BONK',name:'Bonk',        price:0.0000185,vol:1.75},
  {id:'FLOKI',name:'Floki',      price:0.00017,vol:1.60},
  // Tokens / utility
  {id:'LTC', name:'Litecoin',    price:68,     vol:0.90},
  {id:'BCH', name:'Bitcoin Cash',price:240,    vol:1.00},
  {id:'XLM', name:'Stellar',     price:0.11,   vol:0.95},
  {id:'ALGO',name:'Algorand',    price:0.18,   vol:1.10},
  {id:'ICP', name:'Internet Computer',price:11,vol:1.25},
  {id:'FIL', name:'Filecoin',    price:4.60,   vol:1.15},
  {id:'VET', name:'VeChain',     price:0.028,  vol:1.10},
  // AI / compute narrative
  {id:'FET', name:'Fetch.ai',    price:1.90,   vol:1.40},
  {id:'RNDR',name:'Render',      price:7.80,   vol:1.35},
  {id:'AKT', name:'Akash',       price:3.40,   vol:1.45},
  // Gaming / metaverse
  {id:'SAND',name:'The Sandbox', price:0.50,   vol:1.25},
  {id:'MANA',name:'Decentraland',price:0.42,   vol:1.25},
  {id:'AXS', name:'Axie Infinity',price:7.10,  vol:1.35},
  {id:'IMX', name:'Immutable',   price:1.80,   vol:1.30},
  // Privacy
  {id:'XMR', name:'Monero',      price:168,    vol:0.95},
  {id:'ZEC', name:'Zcash',       price:28,     vol:1.15},
  // Stable-ish large caps
  {id:'TRX', name:'Tron',        price:0.16,   vol:0.85},
  {id:'HBAR',name:'Hedera',      price:0.085,  vol:1.10},
];

function createInvState(){
  return {
    stocks:STOCKS.map(s=>({...s,history:[s.price]})),
    cryptos:CRYPTOS.map(c=>({...c,history:[c.price]})),
    portfolio:{},    // {stockId:{shares,avgCost}}
    cryptoHeld:{},   // {cryptoId:{coins,avgCost}}
    k401:0, ira:0, roth:0,
    properties:[],
    businesses:[],
    vehicles:[],     // [{name,type,price,value,monthlyCost,isElectric,age,depRate}]
    sponsors:[],     // [{name,icon,monthly,monthsLeft,signedAt,category}]
    sponsorOffers:null, // cached current offer set
    sponsorOffersMonth:-1,
    climate:'normal',
    climateYearsLeft:0,
  };
}

// ── VEHICLE CATALOG ──
// type: car | motorcycle | boat | plane ; depRate is yearly depreciation
const VEHICLE_CATALOG = [
  // ── CARS (gas) ──
  {icon:'🚗',name:'Honda Civic',type:'car',price:26000,monthlyCost:450,isElectric:false,depRate:0.12},
  {icon:'🚗',name:'Toyota Camry',type:'car',price:32000,monthlyCost:500,isElectric:false,depRate:0.11},
  {icon:'🚙',name:'Jeep Wrangler',type:'car',price:42000,monthlyCost:650,isElectric:false,depRate:0.10},
  {icon:'🚐',name:'Ford F-150',type:'car',price:48000,monthlyCost:700,isElectric:false,depRate:0.11},
  {icon:'🏎️',name:'BMW M3',type:'car',price:78000,monthlyCost:1100,isElectric:false,depRate:0.14},
  {icon:'🏎️',name:'Porsche 911',type:'car',price:145000,monthlyCost:1800,isElectric:false,depRate:0.10},
  {icon:'🏎️',name:'Lamborghini Huracán',type:'car',price:260000,monthlyCost:3200,isElectric:false,depRate:0.13},
  {icon:'🏎️',name:'Ferrari 488',type:'car',price:330000,monthlyCost:3500,isElectric:false,depRate:0.12},
  // ── CARS (electric) ──
  {icon:'⚡',name:'Tesla Model 3',type:'car',price:42000,monthlyCost:250,isElectric:true,depRate:0.09},
  {icon:'⚡',name:'Tesla Model Y',type:'car',price:52000,monthlyCost:290,isElectric:true,depRate:0.08},
  {icon:'⚡',name:'Rivian R1T Truck',type:'car',price:78000,monthlyCost:380,isElectric:true,depRate:0.10},
  {icon:'⚡',name:'Ford Mustang Mach-E',type:'car',price:48000,monthlyCost:280,isElectric:true,depRate:0.10},
  {icon:'⚡',name:'Tesla Model S Plaid',type:'car',price:95000,monthlyCost:450,isElectric:true,depRate:0.09},
  {icon:'⚡',name:'Lucid Air',type:'car',price:115000,monthlyCost:500,isElectric:true,depRate:0.08},
  {icon:'⚡',name:'Rimac Nevera',type:'car',price:2400000,monthlyCost:4500,isElectric:true,depRate:0.08},
  // ── MOTORCYCLES ──
  {icon:'🏍️',name:'Honda CBR Sport Bike',type:'motorcycle',price:12000,monthlyCost:180,isElectric:false,depRate:0.10},
  {icon:'🏍️',name:'Harley-Davidson Cruiser',type:'motorcycle',price:22000,monthlyCost:260,isElectric:false,depRate:0.08},
  {icon:'🏍️',name:'Ducati Panigale V4',type:'motorcycle',price:28000,monthlyCost:320,isElectric:false,depRate:0.11},
  {icon:'🏍️',name:'BMW R 1250 GS',type:'motorcycle',price:19000,monthlyCost:220,isElectric:false,depRate:0.09},
  {icon:'⚡',name:'Zero SR/F (EV)',type:'motorcycle',price:23000,monthlyCost:110,isElectric:true,depRate:0.09},
  {icon:'⚡',name:'LiveWire ONE (EV)',type:'motorcycle',price:24000,monthlyCost:120,isElectric:true,depRate:0.10},
  // ── BOATS ──
  {icon:'⛵',name:'Sailboat',type:'boat',price:45000,monthlyCost:500,isElectric:false,depRate:0.06},
  {icon:'🚤',name:'Speedboat',type:'boat',price:85000,monthlyCost:700,isElectric:false,depRate:0.08},
  {icon:'🛥️',name:'Cabin Cruiser',type:'boat',price:180000,monthlyCost:1400,isElectric:false,depRate:0.07},
  {icon:'⚡',name:'Candela C-8 (Electric Boat)',type:'boat',price:390000,monthlyCost:800,isElectric:true,depRate:0.06},
  {icon:'🛥️',name:'Luxury Yacht',type:'boat',price:1800000,monthlyCost:12000,isElectric:false,depRate:0.05},
  {icon:'🛥️',name:'Mega Yacht',type:'boat',price:15000000,monthlyCost:85000,isElectric:false,depRate:0.04},
  // ── PLANES ──
  {icon:'✈️',name:'Cessna 172 (Single-Engine)',type:'plane',price:400000,monthlyCost:1800,isElectric:false,depRate:0.04},
  {icon:'✈️',name:'Cirrus SR22',type:'plane',price:900000,monthlyCost:3000,isElectric:false,depRate:0.04},
  {icon:'⚡',name:'Pipistrel Velis (Electric)',type:'plane',price:220000,monthlyCost:900,isElectric:true,depRate:0.05},
  {icon:'🛩️',name:'Cirrus Vision Jet',type:'plane',price:3200000,monthlyCost:12000,isElectric:false,depRate:0.05},
  {icon:'🛩️',name:'Gulfstream G550 (Private Jet)',type:'plane',price:22000000,monthlyCost:55000,isElectric:false,depRate:0.05},
  {icon:'🛩️',name:'Bombardier Global 7500',type:'plane',price:78000000,monthlyCost:180000,isElectric:false,depRate:0.04},
];

function totalVehicleValue(inv){return (inv.vehicles||[]).reduce((s,v)=>s+v.value,0);}
function vehicleMonthlyCost(inv){return (inv.vehicles||[]).reduce((s,v)=>s+v.monthlyCost,0);}

function tickVehicles(inv){
  if(!inv.vehicles) inv.vehicles=[];
  for(const v of inv.vehicles){
    // Monthly depreciation = yearly rate / 12
    v.value = Math.max(Math.round(v.price*0.15), Math.round(v.value * (1 - v.depRate/12)));
    v.age = (v.age||0) + 1;
  }
}

function tickMarket(inv){
  if(inv.climateYearsLeft>0){inv.climateYearsLeft--;if(inv.climateYearsLeft===0)inv.climate='normal';}
  else{
    const r=Math.random();
    if(r<0.07){inv.climate='recession';inv.climateYearsLeft=ri(1,3);}
    else if(r<0.13){inv.climate='bear';inv.climateYearsLeft=ri(1,2);}
    else if(r<0.21){inv.climate='bull';inv.climateYearsLeft=ri(1,3);}
    else if(r<0.25){inv.climate='bubble';inv.climateYearsLeft=ri(1,2);}
    else inv.climate='normal';
  }
}

const CLIMATE_MULT = {
  normal:{stock:1.0,tech:1.0,crypto:1.0,re:1.0},
  bull:{stock:1.4,tech:1.5,crypto:1.3,re:1.15},
  bear:{stock:0.75,tech:0.70,crypto:0.65,re:0.90},
  bubble:{stock:1.1,tech:2.0,crypto:1.5,re:1.0},
  recession:{stock:0.70,tech:0.65,crypto:0.50,re:0.85},
};

function tickStocks(inv){
  const m=CLIMATE_MULT[inv.climate]||CLIMATE_MULT.normal;
  const SQRT12=Math.sqrt(12);
  for(const s of inv.stocks){
    const cm=s.sector==='tech'?m.tech:s.id==='SPY'?m.stock:m.stock;
    const annDrift=(s.avgReturn||0.08)*cm-1;
    const monthlyDrift=annDrift/12;
    const monthlyVol=s.vol/SQRT12;
    const z=randn();
    s.price=Math.max(0.01,+(s.price*(1+monthlyDrift+monthlyVol*z)).toFixed(2));
    s.history.push(s.price);if(s.history.length>50)s.history.shift();
  }
}

function tickCrypto(inv){
  const m=CLIMATE_MULT[inv.climate]||CLIMATE_MULT.normal;
  const SQRT12=Math.sqrt(12);
  for(const c of inv.cryptos){
    const z=randn();
    const monthlyDrift=rf(-0.3,0.5)*m.crypto/12;
    const monthlyVol=c.vol*0.3/SQRT12;
    const ret=monthlyDrift+monthlyVol*z;
    c.price=Math.max(0.00001,+(c.price*(1+ret)).toPrecision(5));
    c.history.push(c.price);if(c.history.length>50)c.history.shift();
  }
}

function tickRetirement(inv, char){
  const baseRet={normal:0.07,bull:0.12,bear:0.02,bubble:0.09,recession:-0.05}[inv.climate]||0.07;
  const z=randn(); const r=baseRet+0.10*z;
  inv.k401=Math.max(0,Math.round(inv.k401*(1+r)));
  inv.ira=Math.max(0,Math.round(inv.ira*(1+r)));
  inv.roth=Math.max(0,Math.round(inv.roth*(1+r)));
  // Auto 401k contribution if employed
  if(char.employed&&char.salary>0){
    const contrib=Math.round(char.salary*0.05);
    const match=Math.round(char.salary*0.03);
    inv.k401+=contrib+match;
    char.checking-=contrib;
  }
}

function tickRealEstate(inv, ev){
  const m=CLIMATE_MULT[inv.climate]||CLIMATE_MULT.normal;
  let rentInc=0, mortPaid=0;
  for(const p of inv.properties){
    const z=randn(); const app=(0.03+0.06*z)*m.re;
    p.value=Math.max(10000,Math.round(p.value*(1+app)));
    if(p.debt>0){const pay=p.monthlyPayment*12;const int=p.debt*0.065;const prin=Math.min(p.debt,pay-int);p.debt=Math.max(0,p.debt-prin);mortPaid+=pay;}
    if(p.rented){p.rent=Math.round(p.rent*1.03);rentInc+=p.rent*12;}
    p.age++;
  }
  if(rentInc>0) ev.push({type:'good',text:`Rental income: ${fmt$(rentInc)}/yr`});
}

function tickBusinesses(inv, char, ev){
  for(const b of inv.businesses){
    if(!b.employees) b.employees=[];
    if(b.equipTier===undefined){ b.equipTier=1; b.equipAge=0; }
    const cm=CLIMATE_MULT[inv.climate]||CLIMATE_MULT.normal;
    const statF=(char.smarts/100)*0.6+(char.looks/100)*0.2+0.2;
    // Employee morale dampens boost: avg morale < 50 cuts effectiveness
    const avgMorale=b.employees.length ? b.employees.reduce((s,e)=>s+(e.morale||75),0)/b.employees.length : 75;
    const moraleF=0.4 + (avgMorale/100)*0.7;  // ~0.75 at 50 morale, ~1.05 at 90
    const empBoost=1 + b.employees.reduce((s,e)=>s+((e.boost||0)*((e.morale||75)/75)),0);
    const einfo = equipmentInfo(b);
    const equipF = 1 + einfo.tier.revBoost - (einfo.old ? 0.08 : 0);
    const rev=Math.round(b.startCost*b.revMult*statF*(cm.stock)*rf(0.75,1.25)*Math.max(0.5,Math.log(b.age+2))*empBoost*equipF);
    const wages=b.employees.reduce((s,e)=>s+(e.wage||0)*12,0);
    const exp=Math.round(rev*rf(0.55,0.75)+b.startCost*0.05)+wages;
    b.profit=rev-exp; b.value=Math.max(Math.round(b.startCost*0.3),Math.round(b.profit*rf(2,4)));
    b.age++;
    b.equipAge=(b.equipAge||0)+1;
    if(b.profit>0){char.checking+=b.profit;ev.push({type:'good',text:`${b.name} profit: ${fmt$(b.profit)} (wages ${fmt$(wages)}, morale ${Math.round(avgMorale)}%, equip ${einfo.tier.label}${einfo.old?' OLD':''})`});}
    else{char.checking+=b.profit;ev.push({type:'bad',text:`${b.name} loss: ${fmt$(Math.abs(b.profit))} (wages ${fmt$(wages)}, morale ${Math.round(avgMorale)}%, equip ${einfo.tier.label}${einfo.old?' OLD':''})`});}
  }
}

// ── Employee check-in messages — monthly morale drift + inbox updates ──
const WORKPLACE_PROBLEMS = [
  'The espresso machine is on its last legs — we might need a new one soon.',
  'Supplier raised prices again. Margins getting tight on the bestsellers.',
  'A couple of customers complained about long wait times last weekend.',
  'One of the part-timers has been late three times this week.',
  'POS system keeps freezing during the rush. Losing us maybe 10 mins/day.',
  'We ran out of napkins/supplies twice this month. Inventory needs attention.',
  'A competitor opened down the street. Noticed some of our regulars went over.',
  'The walk-in freezer is running warm — fridge guy says it\'s the compressor.',
  'Slip-and-fall in the back last Tuesday — nobody hurt, but we should fix that mat.',
  'Small argument between staff. Sorted it out, but the vibe was off for a day.',
  'Rent hike rumor going around for next year — landlord hinted at it.',
  'Wi-Fi keeps dropping during peak hours. Customers notice.',
  'Online reviews dipped a bit — one bad one is getting a lot of attention.',
  'Health inspector came through, minor notes — nothing cited but a heads-up.',
  'Nobody wants the weekend shifts. Scheduling is getting painful.',
];

const EMPLOYEE_POSITIVES = [
  'Had a record day yesterday — busiest Saturday in months.',
  'Team pulled together on the rush last weekend. Really solid work.',
  'Got a regular customer who\'s been recommending us all over town.',
  'Knocked out the monthly inventory two days early — everything checks out.',
  'New menu/product idea I\'ve been testing is getting great reactions.',
  'Trained the new part-timer. Quick learner, fits right in.',
  'We hit our target for the week — first time in a while. Team\'s feeling it.',
  'Got a small write-up in a local blog. Traffic bumped the next day.',
  'Everyone stayed late to help close out inventory. Good crew.',
];

const EQUIPMENT_COMPLAINTS = [
  'The equipment is genuinely past its life. Tools break mid-shift.',
  'Our gear is old — I\'m losing an hour a day working around it.',
  'Can we please upgrade the equipment? It\'s embarrassing in front of customers.',
  'The old machines keep jamming. Team is frustrated.',
  'Tried to fix the rig again yesterday. It needs replacing, not patching.',
];

function tickEmployeeMessages(c, inv){
  const bizs=inv.businesses||[];
  for(const b of bizs){
    if(!b.employees) continue;
    const einfo = equipmentInfo(b);
    // Compute biz health for morale drift
    const profitPerEmp = (b.profit||0) / Math.max(1, b.employees.length);
    for(const e of b.employees){
      e.tenure = (e.tenure||0)+1;
      if(e.morale===undefined) e.morale=75;
      // Monthly morale drift
      let drift = ri(-2,2);
      if(profitPerEmp > 5000) drift += 2;
      else if(profitPerEmp < -2000) drift -= 4;
      else if(profitPerEmp < 0) drift -= 2;
      // Old equipment erodes morale over time
      if(einfo.old) drift -= ri(1,3);
      else if(einfo.tier.tier >= 4) drift += 1;
      // Long tenure without pay bump → slight decay
      if(e.tenure > 24 && e.tenure % 12 === 0) drift -= 1;
      e.morale = clamp(e.morale + drift, 0, 100);
      // Message chance: ~12% per employee per month
      if(!pct(0.12)) continue;
      const date = currentMonthDate(c);
      const name = e.name || e.title;
      const roleIcon = (EMPLOYEE_ROLES.find(r=>r.title===e.title)?.icon) || '👥';
      // Pool complaints — include equipment complaints only when equipment is old
      const problemPool = einfo.old ? WORKPLACE_PROBLEMS.concat(EQUIPMENT_COMPLAINTS, EQUIPMENT_COMPLAINTS) : WORKPLACE_PROBLEMS;
      let subject, body, moodLabel;
      if(e.morale >= 80){
        moodLabel='High';
        const positive = pick(EMPLOYEE_POSITIVES);
        subject = `Good week at ${b.name} — ${name}`;
        body = `Hey boss,\n\n${positive}\n\nTeam morale feels strong — I'd say we're around ${e.morale}%. No real problems right now.\n\n— ${name}, ${e.title}`;
      } else if(e.morale >= 55){
        moodLabel='Steady';
        const maybeProblem = pct(0.5) ? pick(problemPool) : 'Nothing major going on — things are steady.';
        subject = `${b.name} check-in — ${name}`;
        body = `Hey boss,\n\nJust a quick update. Workplace morale's around ${e.morale}% — people show up, do the work, go home.\n\n${maybeProblem}\n\nLet me know if you want me to look into anything.\n\n— ${name}, ${e.title}`;
      } else if(e.morale >= 30){
        moodLabel='Low';
        const prob1 = pick(problemPool);
        const prob2 = pick(problemPool.filter(p=>p!==prob1));
        subject = `${b.name}: morale is slipping — ${name}`;
        body = `Hey boss,\n\nWanted to flag that morale here has been dropping. I'd put it around ${e.morale}% honestly.\n\nTwo things on my mind:\n• ${prob1}\n• ${prob2}\n\nOptions that would help: a bonus, a raise, a team day, training, or (if the gear is old) an equipment upgrade. Staff actions are in the Business tab under Manage Staff.\n\n— ${name}, ${e.title}`;
      } else {
        moodLabel='Critical';
        const prob = pick(problemPool);
        subject = `${b.name}: considering my options — ${name}`;
        body = `Hey boss,\n\nI've got to be honest — morale at ${e.morale}% is rough. Multiple issues stacking up:\n\n• ${prob}\n• Wages haven't kept up with the workload.\n• Long stretches without real recognition.\n\nI'm looking around. Happy to talk before I decide anything, but you should know. A bonus, raise, team event, or equipment upgrade from Manage Staff would seriously help.\n\n— ${name}, ${e.title}`;
      }
      addInboxItem({
        type:'news', icon:roleIcon, subject, date,
        body: `${body}\n\n── Snapshot ──\nBusiness: ${b.name}\nMorale: ${e.morale}% (${moodLabel})\nTenure: ${e.tenure} months\nWage: ${fmt$(e.wage)}/mo\nEquipment: ${einfo.tier.label} (${einfo.age}y${einfo.old?' — OLD':''})`
      });
    }
  }
}

const EMPLOYEE_ROLES = [
  {icon:'🧑‍🍳', title:'Part-Time Worker',  wage:1500, boost:0.15},
  {icon:'👨‍💼', title:'Full-Time Worker',  wage:3000, boost:0.32},
  {icon:'🧑‍💼', title:'Shift Manager',     wage:4500, boost:0.48},
  {icon:'👔', title:'Operations Manager', wage:6500, boost:0.70},
  {icon:'🧠', title:'Specialist / Senior',wage:8000, boost:0.90},
];

// ── SPONSORS ─────────────────────────────────────────────────────
// Unlocked when total business value >= $500,000. Offers refresh each visit.
const SPONSOR_CATALOG = [
  {icon:'📱', name:'PixelTech Devices',   monthly: 2500, months:36, category:'tech'},
  {icon:'🥤', name:'FizzPop Beverages',   monthly: 3500, months:36, category:'consumer'},
  {icon:'🚗', name:'AutoLine Motors',     monthly: 5500, months:48, category:'auto'},
  {icon:'⚽', name:'KickStrike Sports',   monthly: 4000, months:60, category:'sports'},
  {icon:'🎮', name:'NovaPlay Gaming',     monthly: 3000, months:48, category:'entertainment'},
  {icon:'💎', name:'Marchetti Luxury',    monthly: 9000, months:60, category:'luxury'},
  {icon:'🏦', name:'Silverline Financial',monthly: 6500, months:60, category:'finance'},
  {icon:'🎬', name:'FrameOne Media',      monthly: 4500, months:48, category:'media'},
  {icon:'👟', name:'StrideCo Apparel',    monthly: 3200, months:36, category:'apparel'},
  {icon:'☕', name:'RoastHaus Coffee',    monthly: 2000, months:24, category:'food'},
  {icon:'🛫', name:'SkyRoute Airlines',   monthly: 7000, months:48, category:'travel'},
  {icon:'🎧', name:'AudioWave HQ',        monthly: 2800, months:36, category:'tech'},
  {icon:'🍔', name:'BigBun Foods',        monthly: 3800, months:48, category:'food'},
  {icon:'💊', name:'CoreHealth Pharma',   monthly: 5000, months:60, category:'health'},
  {icon:'🎨', name:'Palette Studios',     monthly: 2200, months:24, category:'creative'},
];
function sponsorsUnlocked(inv){ return totalBizValue(inv||GS.inv) >= 500000; }
function rollSponsorOffers(){
  const inv = GS.inv;
  const bizVal = totalBizValue(inv);
  const scale = Math.min(4, 1 + Math.log10(Math.max(1, bizVal/500000))); // 1x at 500k, ~2x at 5M, ~3x at 50M
  const pool = SPONSOR_CATALOG.slice();
  const picks = [];
  const n = Math.min(5, pool.length);
  for(let i=0;i<n;i++){
    const idx = ri(0, pool.length-1);
    const s = pool.splice(idx,1)[0];
    const monthly = Math.round(s.monthly * scale * rf(0.85, 1.25));
    picks.push({...s, monthly});
  }
  inv.sponsorOffers = picks;
  inv.sponsorOffersMonth = GS.char.monthAge;
  return picks;
}
function signSponsor(offer){
  const inv = GS.inv;
  if(!inv.sponsors) inv.sponsors = [];
  if(inv.sponsors.some(s=>s.name===offer.name)) return `Already signed with ${offer.name}.`;
  inv.sponsors.push({name:offer.name, icon:offer.icon, monthly:offer.monthly, monthsLeft:offer.months, signedAt:GS.char.monthAge, category:offer.category});
  // Signing bonus = 3 months upfront
  const bonus = offer.monthly * 3;
  GS.char.checking += bonus;
  logEvent(`🤝 Signed sponsor ${offer.icon} ${offer.name} — ${fmt$(offer.monthly)}/mo for ${offer.months}mo (+${fmt$(bonus)} signing bonus)`, 'good');
  addInboxItem({
    type:'news', icon:offer.icon,
    subject:`Sponsorship signed — ${offer.name}`,
    date: currentMonthDate(GS.char),
    body:`Signed with ${offer.name}.\n\nMonthly: ${fmt$(offer.monthly)}\nTerm: ${offer.months} months\nSigning bonus: ${fmt$(bonus)} (deposited to checking)\n\nPayments will hit monthly in Finances.`
  });
  // Remove from current offers
  inv.sponsorOffers = (inv.sponsorOffers||[]).filter(o=>o.name!==offer.name);
  saveGame();
  return `Signed ${offer.name}. +${fmt$(bonus)} upfront, then ${fmt$(offer.monthly)}/mo for ${offer.months} months.`;
}
// ── Sports Team Contract Offers ─────────────────────────────────
const SPORTS_TEAMS = {
  soccer_player: [
    {name:'Manchester United', league:'Premier League', emoji:'🔴', min:4000000,  max:15000000},
    {name:'Real Madrid',       league:'La Liga',       emoji:'👑', min:5000000,  max:20000000},
    {name:'FC Barcelona',      league:'La Liga',       emoji:'🔵', min:4500000,  max:18000000},
    {name:'Manchester City',   league:'Premier League',emoji:'🌆', min:4500000,  max:17000000},
    {name:'Liverpool FC',      league:'Premier League',emoji:'🔴', min:4000000,  max:14000000},
    {name:'Paris Saint-Germain',league:'Ligue 1',      emoji:'🇫🇷', min:5000000,  max:25000000},
    {name:'Bayern Munich',     league:'Bundesliga',    emoji:'🇩🇪', min:4000000,  max:15000000},
    {name:'AC Milan',          league:'Serie A',       emoji:'🔴⚫', min:3000000,  max:12000000},
    {name:'Inter Miami',       league:'MLS',           emoji:'🦩', min:1000000,  max:4000000},
  ],
  basketball_player: [
    {name:'New York Knicks',       league:'NBA', emoji:'🗽', min:3000000, max:40000000},
    {name:'Los Angeles Lakers',    league:'NBA', emoji:'💜', min:3000000, max:45000000},
    {name:'Boston Celtics',        league:'NBA', emoji:'☘️', min:3000000, max:42000000},
    {name:'Golden State Warriors', league:'NBA', emoji:'🌉', min:3000000, max:45000000},
    {name:'Chicago Bulls',         league:'NBA', emoji:'🐂', min:3000000, max:38000000},
    {name:'Miami Heat',            league:'NBA', emoji:'🔥', min:3000000, max:40000000},
    {name:'Brooklyn Nets',         league:'NBA', emoji:'🕸️', min:3000000, max:40000000},
    {name:'Dallas Mavericks',      league:'NBA', emoji:'🐴', min:3000000, max:38000000},
    {name:'Milwaukee Bucks',       league:'NBA', emoji:'🦌', min:3000000, max:38000000},
  ],
  football_player: [
    {name:'Dallas Cowboys',         league:'NFL', emoji:'🤠', min:2000000, max:30000000},
    {name:'Kansas City Chiefs',     league:'NFL', emoji:'🏹', min:2000000, max:45000000},
    {name:'New England Patriots',   league:'NFL', emoji:'🏰', min:2000000, max:25000000},
    {name:'Philadelphia Eagles',    league:'NFL', emoji:'🦅', min:2000000, max:28000000},
    {name:'San Francisco 49ers',    league:'NFL', emoji:'⛏️', min:2000000, max:35000000},
    {name:'Green Bay Packers',      league:'NFL', emoji:'🧀', min:2000000, max:40000000},
    {name:'Miami Dolphins',         league:'NFL', emoji:'🐬', min:2000000, max:30000000},
    {name:'Buffalo Bills',          league:'NFL', emoji:'🦬', min:2000000, max:32000000},
  ],
  baseball_player: [
    {name:'New York Yankees',       league:'MLB', emoji:'🧢', min:1500000, max:30000000},
    {name:'Los Angeles Dodgers',    league:'MLB', emoji:'🌴', min:1500000, max:32000000},
    {name:'Boston Red Sox',         league:'MLB', emoji:'🧦', min:1500000, max:28000000},
    {name:'Houston Astros',         league:'MLB', emoji:'🚀', min:1500000, max:26000000},
    {name:'Chicago Cubs',           league:'MLB', emoji:'🐻', min:1500000, max:25000000},
    {name:'San Francisco Giants',   league:'MLB', emoji:'🌁', min:1500000, max:25000000},
    {name:'Atlanta Braves',         league:'MLB', emoji:'🪓', min:1500000, max:27000000},
  ],
  hockey_player: [
    {name:'Toronto Maple Leafs',    league:'NHL', emoji:'🍁', min:1200000, max:12000000},
    {name:'Montreal Canadiens',     league:'NHL', emoji:'🇨🇦', min:1000000, max:10000000},
    {name:'New York Rangers',       league:'NHL', emoji:'🗽', min:1200000, max:11000000},
    {name:'Boston Bruins',          league:'NHL', emoji:'🐻', min:1200000, max:11000000},
    {name:'Chicago Blackhawks',     league:'NHL', emoji:'🏒', min:1000000, max:10000000},
    {name:'Pittsburgh Penguins',    league:'NHL', emoji:'🐧', min:1200000, max:12000000},
    {name:'Detroit Red Wings',      league:'NHL', emoji:'⚙️', min:1000000, max:10000000},
    {name:'Edmonton Oilers',        league:'NHL', emoji:'🛢️', min:1200000, max:13000000},
  ],
  tennis_player: [
    {name:'Wimbledon Circuit',      league:'Grand Slam', emoji:'🎾', min:800000, max:10000000},
    {name:'US Open Circuit',        league:'Grand Slam', emoji:'🗽', min:700000, max:9000000},
    {name:'French Open Circuit',    league:'Grand Slam', emoji:'🗼', min:600000, max:8000000},
    {name:'Australian Open Circuit',league:'Grand Slam', emoji:'🇦🇺', min:600000, max:8000000},
    {name:'Nike Tennis Sponsorship',league:'ATP/WTA',    emoji:'✓',  min:500000, max:8000000},
  ],
  golfer: [
    {name:'PGA Tour',             league:'Golf',   emoji:'⛳', min:800000,  max:15000000},
    {name:'LIV Golf',             league:'Golf',   emoji:'💰', min:2000000, max:30000000},
    {name:'The Masters Circuit',  league:'Major',  emoji:'🏆', min:1000000, max:12000000},
    {name:'DP World Tour',        league:'Golf',   emoji:'🌍', min:500000,  max:8000000},
  ],
  boxer: [
    {name:'Top Rank Boxing',      league:'Pro Boxing', emoji:'🥊', min:300000, max:5000000},
    {name:'Matchroom Boxing',     league:'Pro Boxing', emoji:'🥊', min:300000, max:5000000},
    {name:'Premier Boxing Champs',league:'Pro Boxing', emoji:'🥊', min:250000, max:4000000},
  ],
  mma_fighter: [
    {name:'UFC',                  league:'MMA', emoji:'🥋', min:200000, max:3500000},
    {name:'Bellator MMA',         league:'MMA', emoji:'🥋', min:150000, max:1500000},
    {name:'ONE Championship',     league:'MMA', emoji:'🏅', min:150000, max:1200000},
    {name:'PFL',                  league:'MMA', emoji:'🥇', min:150000, max:1500000},
  ],
  race_car_driver: [
    {name:'Ferrari F1',           league:'Formula 1', emoji:'🏎️', min:2000000, max:40000000},
    {name:'Mercedes-AMG F1',      league:'Formula 1', emoji:'⚡', min:2000000, max:35000000},
    {name:'Red Bull Racing',      league:'Formula 1', emoji:'🐂', min:2000000, max:50000000},
    {name:'McLaren F1',           league:'Formula 1', emoji:'🟠', min:1500000, max:25000000},
    {name:'Hendrick Motorsports', league:'NASCAR',    emoji:'🏁', min:800000,  max:12000000},
    {name:'Joe Gibbs Racing',     league:'NASCAR',    emoji:'🏁', min:800000,  max:10000000},
  ],
  esports_pro: [
    {name:'Team Liquid',          league:'Esports', emoji:'🟦', min:150000, max:1200000},
    {name:'FaZe Clan',            league:'Esports', emoji:'😈', min:150000, max:1500000},
    {name:'Cloud9',               league:'Esports', emoji:'☁️', min:120000, max:1000000},
    {name:'TSM',                  league:'Esports', emoji:'🎮', min:120000, max:1000000},
    {name:'G2 Esports',           league:'Esports', emoji:'🎯', min:120000, max:900000},
    {name:'Fnatic',               league:'Esports', emoji:'🟧', min:120000, max:900000},
  ],
  swimmer: [
    {name:'USA Swimming (Olympic)',     league:'Olympic', emoji:'🇺🇸', min:150000, max:2000000},
    {name:'International Swim League',  league:'ISL',     emoji:'🌊', min:100000, max:800000},
    {name:'Red Bull Athlete Sponsorship',league:'Sponsorship',emoji:'🐂',min:200000,max:1500000},
  ],
  track_athlete: [
    {name:'Nike Track Team',      league:'Track & Field', emoji:'✓',  min:120000, max:1200000},
    {name:'Diamond League',       league:'Track & Field', emoji:'💎', min:150000, max:2000000},
    {name:'Adidas Runners',       league:'Track & Field', emoji:'🟢', min:100000, max:1000000},
  ],
  olympic_athlete: [
    {name:'Team USA',             league:'Olympic', emoji:'🇺🇸', min:100000, max:1500000},
    {name:'Team GB',              league:'Olympic', emoji:'🇬🇧', min:100000, max:1200000},
    {name:'Team Canada',          league:'Olympic', emoji:'🇨🇦', min:80000,  max:1000000},
  ],
  semipro_athlete: [
    {name:'Minor League Club',    league:'Minor League',emoji:'🏟️', min:60000, max:180000},
    {name:'Regional Farm Team',   league:'Farm League', emoji:'🌾', min:55000, max:150000},
  ],
  team_coach: [
    {name:'NCAA Division I School',league:'NCAA', emoji:'🎓', min:400000, max:8000000},
    {name:'NBA Assistant Coach',   league:'NBA',  emoji:'🏀', min:500000, max:3000000},
    {name:'Premier League Staff',  league:'EPL',  emoji:'⚽', min:300000, max:1500000},
    {name:'NFL Position Coach',    league:'NFL',  emoji:'🏈', min:400000, max:2500000},
  ],
  athletic_trainer: [
    {name:'MLB Training Staff',   league:'MLB', emoji:'⚾', min:120000, max:400000},
    {name:'NFL Medical Team',     league:'NFL', emoji:'🏈', min:150000, max:500000},
    {name:'Team USA Wellness',    league:'Olympic',emoji:'🇺🇸', min:100000, max:350000},
    {name:'NBA Performance Staff',league:'NBA', emoji:'🏀', min:140000, max:450000},
  ],
};

function tickSportsOffers(c){
  if(!c.employed || c.jobSector !== 'sports') return;
  // 6% chance per month of receiving an offer
  if(!pct(0.06)) return;
  const teams = SPORTS_TEAMS[c.jobId];
  if(!teams || !teams.length) return;
  // Avoid repeat offers from the current team
  const team = pick(teams.filter(t => t.name !== c.sportsTeam)) || pick(teams);
  const cur = c.salary || 0;
  const baseOffer = ri(team.min, team.max);
  const newSalary = Math.max(baseOffer, Math.round(cur * rf(1.15, 1.8)));
  const raise = newSalary - cur;
  if(raise <= 0) return;
  const months = pick([12, 24, 36, 48]);
  const monthlyPay = Math.round(newSalary / 12);
  const curMonthly = Math.round(cur / 12);
  const raiseMonthly = monthlyPay - curMonthly;
  const y = Math.floor(c.monthAge/12), m = (c.monthAge%12)+1;
  addInboxItem({
    type:'offer',
    icon: team.emoji,
    subject: `${team.name} offers you a contract`,
    date: `Y${y}M${m}`,
    body: `Dear ${c.name},\n\n${team.name} (${team.league}) wants to sign you as a ${c.jobTitle} to a ${months}-month deal.\n\nCurrent: ${fmt$(cur)}/yr (${fmt$(curMonthly)}/mo)\nOffered: ${fmt$(newSalary)}/yr (${fmt$(monthlyPay)}/mo)\nRaise:   +${fmt$(raise)}/yr (+${fmt$(raiseMonthly)}/mo)\n\nSigning bonus: ${fmt$(Math.round(newSalary*0.08))}\n\nIf you accept, your salary is immediately replaced with the offered amount and paid out from the team.`,
    offer:{
      teamName: team.name,
      league: team.league,
      emoji: team.emoji,
      newSalary,
      months,
      raise,
      raiseMonthly,
      signingBonus: Math.round(newSalary*0.08),
    },
  });
}

// ── Soccer Season: Fixtures & Standings ─────────────────────────
const SOCCER_LEAGUE_TEAMS = {
  'Premier League': ['Arsenal','Aston Villa','Bournemouth','Brentford','Brighton','Burnley','Chelsea','Crystal Palace','Everton','Fulham','Leeds United','Luton Town','Newcastle United','Nottingham Forest','Sheffield United','Tottenham','West Ham','Wolves','Leicester City'],
  'La Liga': ['Atletico Madrid','Sevilla','Real Sociedad','Athletic Bilbao','Real Betis','Villarreal','Valencia','Girona','Osasuna','Getafe','Celta Vigo','Rayo Vallecano','Mallorca','Cadiz','Las Palmas','Alaves','Granada','Almeria','Espanyol'],
  'Ligue 1': ['AS Monaco','Lille OSC','Olympique Lyonnais','Olympique Marseille','OGC Nice','RC Lens','Stade Rennais','FC Nantes','RC Strasbourg','Stade de Reims','Montpellier','Clermont Foot','Toulouse FC','Stade Brestois','FC Metz','Le Havre','FC Lorient','FC Nancy','Angers SCO'],
  'Bundesliga': ['Borussia Dortmund','RB Leipzig','Bayer Leverkusen','VfB Stuttgart','Eintracht Frankfurt','Hoffenheim','SC Freiburg','Werder Bremen','VfL Wolfsburg','FC Augsburg','Mainz 05','Union Berlin','B. Monchengladbach','Heidenheim','VfL Bochum','Darmstadt','FC Koln','Hertha Berlin','Schalke 04'],
  'Serie A': ['Inter Milan','Juventus','Napoli','AS Roma','Lazio','Atalanta','Fiorentina','Bologna','Torino','Genoa','Monza','Hellas Verona','Udinese','Frosinone','Sassuolo','Cagliari','Empoli','Lecce','Salernitana'],
  'MLS': ['LA Galaxy','LAFC','Seattle Sounders','Portland Timbers','Atlanta United','NYCFC','NY Red Bulls','Toronto FC','Philadelphia Union','Columbus Crew','FC Cincinnati','DC United','Orlando City','New England','Chicago Fire','Colorado Rapids','Vancouver Whitecaps','Austin FC','FC Dallas','Houston Dynamo'],
};

function soccerPlayerTeamLeague(c){
  if(c.jobId !== 'soccer_player' || !c.sportsTeam) return null;
  const teams = SPORTS_TEAMS.soccer_player || [];
  const found = teams.find(t => t.name === c.sportsTeam);
  return found ? found.league : null;
}

function sendSoccerFixtures(c){
  const league = soccerPlayerTeamLeague(c);
  if(!league || !SOCCER_LEAGUE_TEAMS[league]) return;
  const pool = SOCCER_LEAGUE_TEAMS[league].slice();
  // Build fixture list: two legs vs each of 19 opponents = 38 matches across the season
  const shuffled = pool.slice().sort(()=>Math.random()-0.5);
  const months = ['Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'];
  const matches = [];
  for(let leg=0; leg<2; leg++){
    const order = shuffled.slice().sort(()=>Math.random()-0.5);
    order.forEach((opp, i) => {
      const monthIdx = Math.floor((leg*19 + i) / 4);
      const mn = months[Math.min(months.length-1, monthIdx)];
      const ha = (leg===0) ? (i%2===0 ? 'H' : 'A') : (i%2===0 ? 'A' : 'H');
      matches.push({m:mn, opp, ha});
    });
  }
  const body = `Fixtures released for the upcoming ${league} season.\n\nYour club: ${c.sportsTeam}\nMatchdays: ${matches.length}\n\n` +
    matches.map((x,i)=>`${String(i+1).padStart(2,'0')}. ${x.m}  ${x.ha==='H'?'🏠':'✈️'} ${x.ha==='H'?c.sportsTeam+' vs '+x.opp : x.opp+' vs '+c.sportsTeam}`).join('\n') +
    `\n\nGood luck this season. Top 5 → Champions League · 6 → Europa League · 7 → Conference League.`;
  const y = Math.floor(c.monthAge/12);
  addInboxItem({
    type:'news', icon:'📅',
    subject:`${c.sportsTeam} — ${league} fixtures released`,
    date:`Y${y}-Aug`,
    body,
  });
}

function sendSoccerStandings(c){
  const league = soccerPlayerTeamLeague(c);
  if(!league || !SOCCER_LEAGUE_TEAMS[league]) return;
  // Build 20-team table: player's team + 19 from league pool
  const others = SOCCER_LEAGUE_TEAMS[league].slice();
  const teams = [c.sportsTeam, ...others];
  // Player position weighted toward top half if recent salary is high
  const salaryFactor = Math.min(1, (c.salary||0) / 10000000);
  // Random placement biased by salaryFactor: 60% top-6 if salary rich
  let playerPos;
  const r = Math.random();
  if(salaryFactor > 0.5){
    playerPos = r < 0.35 ? ri(1,3) : r < 0.7 ? ri(4,7) : ri(8,20);
  } else if(salaryFactor > 0.2){
    playerPos = r < 0.25 ? ri(1,6) : r < 0.7 ? ri(7,14) : ri(15,20);
  } else {
    playerPos = r < 0.15 ? ri(1,7) : r < 0.6 ? ri(8,15) : ri(16,20);
  }
  // Random order for other teams
  const otherOrder = others.slice().sort(()=>Math.random()-0.5);
  const standings = [];
  let otherIdx = 0;
  for(let pos=1; pos<=20; pos++){
    if(pos === playerPos) standings.push(c.sportsTeam);
    else standings.push(otherOrder[otherIdx++]);
  }
  // Generate points (decreasing): champion ~90pts, relegated ~25
  const basePoints = [94,87,80,74,68,63,59,55,52,49,46,43,41,39,37,34,32,30,27,22];
  const tableLines = standings.map((t,i)=>{
    const pts = basePoints[i] + ri(-3,3);
    const w = Math.floor(pts/3 + ri(-2,2));
    const d = pts - w*3;
    const l = 38 - w - d;
    const mark = t === c.sportsTeam ? ' ← YOU' : '';
    const qual = i===0 ? ' 🏆' : (i<5 ? ' 🌟' : (i===5 ? ' 🥈' : (i===6 ? ' 🥉' : (i>=17 ? ' ⬇️' : ''))));
    return `${String(i+1).padStart(2,' ')}. ${t.padEnd(24,' ')} ${String(w).padStart(2,' ')}W ${String(d).padStart(2,' ')}D ${String(l).padStart(2,' ')}L  ${String(pts).padStart(2,' ')}pts${qual}${mark}`;
  }).join('\n');
  const champion = standings[0];
  let playerSummary;
  if(playerPos === 1){ playerSummary = `🏆 ${c.sportsTeam} won the ${league}! Champions!`; c._euroComp = 'champions'; }
  else if(playerPos <= 5){ playerSummary = `🌟 ${c.sportsTeam} finished ${ordinal(playerPos)} — qualified for the UEFA Champions League.`; c._euroComp = 'champions'; }
  else if(playerPos === 6){ playerSummary = `🥈 ${c.sportsTeam} finished 6th — qualified for the UEFA Europa League.`; c._euroComp = 'europa'; }
  else if(playerPos === 7){ playerSummary = `🥉 ${c.sportsTeam} finished 7th — qualified for the UEFA Conference League.`; c._euroComp = 'conference'; }
  else if(playerPos >= 18){ playerSummary = `⬇️ ${c.sportsTeam} finished ${ordinal(playerPos)} — relegation zone!`; c._euroComp = null; }
  else { playerSummary = `${c.sportsTeam} finished ${ordinal(playerPos)} — a mid-table season.`; c._euroComp = null; }

  // Small morale/happiness effect
  if(playerPos <= 5) c.happiness = clamp((c.happiness||75) + 8, 0, 100);
  else if(playerPos >= 18) c.happiness = clamp((c.happiness||75) - 8, 0, 100);

  const body = `🏆 Champion: ${champion}\n\n${playerSummary}\n\nQualification:\n• Top 5 → UEFA Champions League\n• 6th → UEFA Europa League\n• 7th → UEFA Conference League\n• 18th-20th → Relegation\n\nFinal Table:\n${tableLines}`;
  const y = Math.floor(c.monthAge/12);
  addInboxItem({
    type:'news', icon:'📊',
    subject:`${league} — Final Standings (${champion} Champions)`,
    date:`Y${y}-Jun`,
    body,
  });
}

function ordinal(n){
  const s=['th','st','nd','rd'], v=n%100;
  return n + (s[(v-20)%10]||s[v]||s[0]);
}

// ── European / International Club Competitions ──
// Pools include top-division clubs from Europe, North America, and South America so any
// qualified soccer player plays a continental-style tournament regardless of region.
const EURO_COMP_POOLS = {
  champions: [
    'Manchester City','Liverpool','Arsenal','Manchester United',
    'Real Madrid','Barcelona','Atletico Madrid','Sevilla',
    'Inter Milan','AC Milan','Juventus','Napoli',
    'Bayern Munich','Borussia Dortmund','RB Leipzig','Bayer Leverkusen',
    'Paris Saint-Germain','AS Monaco','Lille OSC','Olympique Lyonnais',
    'FC Porto','SL Benfica','Ajax','PSV Eindhoven',
    'Inter Miami','LAFC','Seattle Sounders','Club America',
    'Tigres UANL','CF Monterrey','Chivas de Guadalajara','Toronto FC',
    'Flamengo','Palmeiras','Boca Juniors','River Plate',
  ],
  europa: [
    'Chelsea','Tottenham','Newcastle United','Aston Villa',
    'Real Sociedad','Villarreal','Real Betis','Athletic Bilbao',
    'AS Roma','Lazio','Atalanta','Fiorentina',
    'Eintracht Frankfurt','VfB Stuttgart','Hoffenheim','SC Freiburg',
    'Olympique Marseille','OGC Nice','RC Lens','Stade Rennais',
    'Sporting CP','SC Braga','Feyenoord','AZ Alkmaar',
    'NYCFC','NY Red Bulls','Philadelphia Union','Atlanta United',
    'Columbus Crew','Cruz Azul','Pumas UNAM','Pachuca',
    'Corinthians','Sao Paulo FC','Independiente','Racing Club',
  ],
  conference: [
    'West Ham','Brighton','Crystal Palace','Brentford',
    'Valencia','Getafe','Osasuna','Girona',
    'Bologna','Torino','Genoa','Monza',
    'Werder Bremen','VfL Wolfsburg','Union Berlin','FC Augsburg',
    'FC Nantes','RC Strasbourg','Stade de Reims','Montpellier',
    'Legia Warsaw','Olympiacos','AEK Athens','Anderlecht',
    'FC Cincinnati','DC United','Orlando City','New England Revolution',
    'Santos Laguna','Club Leon','Toluca','Club Tijuana',
    'Fluminense','Internacional','Velez Sarsfield','San Lorenzo',
  ],
};
const EURO_COMP_META = {
  champions: { label:'UEFA Champions League', short:'Champions League', icon:'🏆' },
  europa:    { label:'UEFA Europa League',    short:'Europa League',    icon:'🥈' },
  conference:{ label:'UEFA Conference League',short:'Conference League',icon:'🥉' },
};
const DEFAULT_EURO_COMP_TIER = {
  champions: new Set(['Manchester City','Liverpool','Arsenal','Manchester United','Real Madrid','Barcelona','Atletico Madrid','Inter Milan','AC Milan','Juventus','Napoli','Bayern Munich','Borussia Dortmund','RB Leipzig','Bayer Leverkusen','Paris Saint-Germain']),
  europa: new Set(['Chelsea','Tottenham','Newcastle United','Sevilla','AS Roma','Lazio','Atalanta','Eintracht Frankfurt','VfB Stuttgart','Olympique Marseille','Villarreal','Real Betis','AS Monaco','Lille OSC']),
  conference: new Set(['Aston Villa','West Ham','Brighton','Real Sociedad','Fiorentina','Bologna','OGC Nice','Athletic Bilbao','SC Freiburg','Hoffenheim']),
};
function initEuroCompForTeam(c){
  if(c.jobId !== 'soccer_player' || !c.sportsTeam) return;
  for(const [comp, teams] of Object.entries(DEFAULT_EURO_COMP_TIER)){
    if(teams.has(c.sportsTeam)){ c._euroComp = comp; return; }
  }
  c._euroComp = null;
}
function sendEuroCompFixtures(c){
  const comp = c._euroComp;
  if(!comp || !EURO_COMP_POOLS[comp]) return;
  const meta = EURO_COMP_META[comp];
  const opponents = EURO_COMP_POOLS[comp].filter(t => t !== c.sportsTeam);
  const picked = opponents.slice().sort(()=>Math.random()-0.5).slice(0,8);
  const ha = ['H','H','H','H','A','A','A','A'].sort(()=>Math.random()-0.5);
  const mds = ['Sep','Sep','Oct','Nov','Nov','Dec','Jan','Jan'];
  const lines = picked.map((opp,i) => {
    const side = ha[i];
    const v = side==='H' ? `${c.sportsTeam} vs ${opp}` : `${opp} vs ${c.sportsTeam}`;
    return `MD${i+1}  ${mds[i].padEnd(3,' ')}  ${side==='H'?'🏠':'✈️'} ${v}`;
  }).join('\n');
  const y = Math.floor(c.monthAge/12);
  const body =
    `${meta.icon} ${meta.label} — League Phase\n\n`+
    `Your club: ${c.sportsTeam}\n`+
    `Format: 36 clubs · 8 matches each (4 home · 4 away)\n\n`+
    `Advancement:\n• Top 8 → straight to Round of 16\n• 9th–24th → Knockout Playoff Round\n• 25th–36th → eliminated\n\n`+
    `Your fixtures:\n${lines}\n\n`+
    `Knockout path (two-legged aggregate, except final):\n`+
    `• Round of 16 — Feb/Mar\n• Quarterfinals — Apr\n• Semifinals — May\n• Final — single match, early June\n\n`+
    `Tied on aggregate? → Extra time, then penalties. No away-goals rule.`;
  addInboxItem({
    type:'news', icon: meta.icon,
    subject: `${meta.short} — ${c.sportsTeam} league-phase fixtures`,
    date: `Y${y}-Aug`,
    body,
  });
}
function sendEuroCompResults(c){
  const comp = c._euroComp;
  if(!comp || !EURO_COMP_POOLS[comp]) return;
  const meta = EURO_COMP_META[comp];
  const pool = EURO_COMP_POOLS[comp].filter(t => t !== c.sportsTeam);
  const salaryFactor = Math.min(1, (c.salary||0) / 10000000);
  // League-phase finish position (1-36), salary-biased
  const r = Math.random();
  let leaguePos;
  if(salaryFactor > 0.5) leaguePos = r<0.5 ? ri(1,8) : r<0.85 ? ri(9,24) : ri(25,36);
  else if(salaryFactor > 0.2) leaguePos = r<0.3 ? ri(1,8) : r<0.75 ? ri(9,24) : ri(25,36);
  else leaguePos = r<0.15 ? ri(1,8) : r<0.6 ? ri(9,24) : ri(25,36);
  const path = [];
  path.push(`League phase: finished ${ordinal(leaguePos)} of 36`);
  let champion = null;
  let eliminatedAt = null;
  const shuffleOpp = () => pool[Math.floor(Math.random()*pool.length)];
  const aggScore = (win) => {
    const a = win ? ri(2,4) : ri(0,2);
    const b = win ? ri(0,2) : ri(2,4);
    if(a === b) return `${a}-${b} (${win?'won':'lost'} on penalties)`;
    return `${a}-${b} agg`;
  };
  if(leaguePos > 24){
    eliminatedAt = 'league phase';
  } else {
    if(leaguePos > 8){
      const kpOpp = shuffleOpp();
      const win = Math.random() < (0.45 + salaryFactor*0.2);
      path.push(`Knockout Playoff vs ${kpOpp} — ${aggScore(win)} ${win?'✅':'❌'}`);
      if(!win) eliminatedAt = 'Knockout Playoff';
    } else {
      path.push(`Top 8 finish → direct to Round of 16 ✅`);
    }
    if(!eliminatedAt){
      const rounds = ['Round of 16','Quarterfinal','Semifinal','Final'];
      for(const round of rounds){
        const opp = shuffleOpp();
        const isFinal = round === 'Final';
        const baseWin = 0.5 + salaryFactor*0.15;
        const win = Math.random() < baseWin;
        const scoreTxt = isFinal
          ? (win ? `${ri(1,3)}-${ri(0,2)}` : `${ri(0,2)}-${ri(1,3)}`) + ' (single match)'
          : aggScore(win);
        path.push(`${round} vs ${opp} — ${scoreTxt} ${win?'✅':'❌'}`);
        if(!win){ eliminatedAt = round; break; }
        if(isFinal){ champion = c.sportsTeam; break; }
      }
    }
  }
  if(!champion) champion = pool[Math.floor(Math.random()*pool.length)];
  const won = champion === c.sportsTeam;
  // Effects
  if(won){
    c.happiness = clamp((c.happiness||75) + 15, 0, 100);
    c.checking += Math.round((c.salary||0) * 0.15);
  } else if(eliminatedAt === 'league phase'){
    c.happiness = clamp((c.happiness||75) - 4, 0, 100);
  }
  const summary = won
    ? `🏆 ${c.sportsTeam} WON the ${meta.label}! Continental champions!`
    : `Campaign ended in the ${eliminatedAt || 'final'}.`;
  const body =
    `${meta.icon} ${meta.label} — Campaign Summary\n\n`+
    `${summary}\n\n`+
    `🏆 ${meta.short} Winner: ${champion}\n\n`+
    `Your path:\n${path.map((p,i)=>`${i+1}. ${p}`).join('\n')}\n\n`+
    (won ? `Prize: ${fmt$(Math.round((c.salary||0)*0.15))} bonus credited. +15 happiness.\n\n` : '') +
    `Next season's European qualification depends on your domestic league finish.`;
  const y = Math.floor(c.monthAge/12);
  addInboxItem({
    type:'news', icon: won ? '🏆' : meta.icon,
    subject: won ? `${meta.short} CHAMPIONS — ${c.sportsTeam}!` : `${meta.short} — ${c.sportsTeam} campaign ended`,
    date: `Y${y}-Jun`,
    body,
  });
  c._euroComp = null;
}

function tickSoccerSeason(c){
  if(c.jobId !== 'soccer_player' || !c.sportsTeam) return;
  if(c._euroInit !== true){ initEuroCompForTeam(c); c._euroInit = true; }
  const monthInYear = c.monthAge % 12; // 0-indexed month position in life year
  // Proxy: monthInYear 7 = August (season start), monthInYear 5 = June (season end)
  if(monthInYear === 7){
    sendSoccerFixtures(c);
    if(c._euroComp) sendEuroCompFixtures(c);
  } else if(monthInYear === 5){
    if(c._euroComp) sendEuroCompResults(c); // must fire before standings so the slot is clear
    sendSoccerStandings(c);
  }
}

// ── NFL Season: Schedule, Standings, Playoffs ───────────────────
const NFL_CONFERENCES = {
  AFC: {
    East: ['Buffalo Bills','Miami Dolphins','New England Patriots','New York Jets'],
    North: ['Baltimore Ravens','Cincinnati Bengals','Cleveland Browns','Pittsburgh Steelers'],
    South: ['Houston Texans','Indianapolis Colts','Jacksonville Jaguars','Tennessee Titans'],
    West: ['Denver Broncos','Kansas City Chiefs','Las Vegas Raiders','Los Angeles Chargers'],
  },
  NFC: {
    East: ['Dallas Cowboys','New York Giants','Philadelphia Eagles','Washington Commanders'],
    North: ['Chicago Bears','Detroit Lions','Green Bay Packers','Minnesota Vikings'],
    South: ['Atlanta Falcons','Carolina Panthers','New Orleans Saints','Tampa Bay Buccaneers'],
    West: ['Arizona Cardinals','Los Angeles Rams','San Francisco 49ers','Seattle Seahawks'],
  },
};
function flattenConf(conf){
  return Object.values(conf).flat();
}
function playerNFLConf(team){
  for(const [conf, divs] of Object.entries(NFL_CONFERENCES)){
    for(const list of Object.values(divs)){
      if(list.includes(team)) return conf;
    }
  }
  return null;
}
function sendNFLSchedule(c){
  const team = c.sportsTeam;
  if(!team) return;
  const conf = playerNFLConf(team) || 'AFC';
  const allTeams = [...flattenConf(NFL_CONFERENCES.AFC), ...flattenConf(NFL_CONFERENCES.NFC)].filter(t=>t!==team);
  const opps = allTeams.slice().sort(()=>Math.random()-0.5).slice(0,17);
  const months=['Sep','Sep','Sep','Sep','Oct','Oct','Oct','Oct','Nov','Nov','Nov','Nov','Dec','Dec','Dec','Jan','Jan'];
  const body = `NFL regular season schedule released. 17 games across 18 weeks.\n\nYour team: ${team} (${conf})\n\n` +
    opps.map((o,i)=>{
      const ha = i%2===0?'🏠':'✈️';
      const m = months[Math.min(months.length-1,i)];
      return `Wk ${String(i+1).padStart(2,'0')}  ${m}  ${ha} ${ha==='🏠'?team+' vs '+o : o+' vs '+team}`;
    }).join('\n') +
    `\n\nPlayoffs: top 7 per conference qualify. #1 seed gets a bye. Seeds 2-7 play Wild Card → Divisional → Conference Championship → Super Bowl.`;
  const y = Math.floor(c.monthAge/12);
  addInboxItem({type:'news', icon:'🏈', subject:`${team} — NFL schedule released`, date:`Y${y}-Sep`, body});
}
function sendNFLPlayoffs(c){
  const team = c.sportsTeam;
  if(!team) return;
  const conf = playerNFLConf(team) || 'AFC';
  const confTeams = flattenConf(NFL_CONFERENCES[conf]);
  const otherConf = conf==='AFC' ? 'NFC' : 'AFC';
  const otherTeams = flattenConf(NFL_CONFERENCES[otherConf]);
  const salaryFactor = Math.min(1, (c.salary||0)/20000000);
  const r = Math.random();
  let seed;
  if(salaryFactor > 0.5) seed = r<0.4?ri(1,3):r<0.75?ri(4,7):ri(8,16);
  else if(salaryFactor > 0.2) seed = r<0.25?ri(1,5):r<0.7?ri(6,11):ri(12,16);
  else seed = r<0.15?ri(1,7):r<0.6?ri(8,12):ri(13,16);
  const confShuf = confTeams.slice().sort(()=>Math.random()-0.5);
  const standings = [];
  let oi = 0;
  const others = confShuf.filter(t=>t!==team);
  for(let pos=1;pos<=16;pos++){
    if(pos===seed) standings.push(team);
    else standings.push(others[oi++]);
  }
  const playoffTeams = standings.slice(0,7);
  const otherPlayoffTeams = otherTeams.slice().sort(()=>Math.random()-0.5).slice(0,7);
  const tbl = standings.map((t,i)=>{
    const wins = Math.max(1, 14 - Math.floor(i*0.85) + ri(-1,1));
    const losses = 17 - wins;
    const mark = t===team?' ← YOU':'';
    const qual = i===0?' 🏆 #1 seed (BYE)':(i<7?` 🌟 seed ${i+1} — playoff`:(i>=13?' ⬇️':''));
    return `${String(i+1).padStart(2,' ')}. ${t.padEnd(24,' ')} ${String(wins).padStart(2,' ')}-${String(losses).padStart(2,' ')}${qual}${mark}`;
  }).join('\n');
  // Wild Card results: 2v7, 3v6, 4v5 per conference
  const wc = [[1,6],[2,5],[3,4]]; // indexes within seeds 2-7 (playoffTeams[1..6])
  const wcResults = wc.map(([a,b])=>{
    const ta=playoffTeams[a], tb=playoffTeams[b];
    const winA = Math.random() < 0.6;
    return winA?`${ta} def. ${tb}`:`${tb} def. ${ta}`;
  });
  let playerNote;
  if(seed===1) playerNote = `🏆 ${team} finished ${seed===1?'#1':`#${seed}`} — FIRST-ROUND BYE. Advance straight to Divisional round.`;
  else if(seed<=7) playerNote = `🌟 ${team} finished seed ${seed} — entering Wild Card round.`;
  else playerNote = `${team} finished seed ${seed} — missed the playoffs.`;
  const body = `🏈 ${conf} Playoff Picture\n\n${playerNote}\n\nWild Card Round (${conf}):\n• ${wcResults.join('\n• ')}\n\nFinal ${conf} Standings:\n${tbl}\n\n${otherConf} #1 seed: ${otherPlayoffTeams[0]} (BYE)\n${otherConf} playoff teams: ${otherPlayoffTeams.slice(0,7).join(', ')}`;
  const y = Math.floor(c.monthAge/12);
  addInboxItem({type:'news', icon:'🏈', subject:`${conf} Playoffs — ${team} seed ${seed>7?'—':`#${seed}`}`, date:`Y${y}-Jan`, body});
  c._nflPlayoffSeed = seed;
  c._nflConf = conf;
  c._nflOtherConfChamp = otherPlayoffTeams[ri(0,3)];
}
function sendNFLSuperBowl(c){
  const team = c.sportsTeam;
  if(!team) return;
  const seed = c._nflPlayoffSeed || 16;
  const conf = c._nflConf || 'AFC';
  const otherConfChamp = c._nflOtherConfChamp || 'Kansas City Chiefs';
  const inPlayoffs = seed <= 7;
  const playerTeamChance = Math.max(0.02, (8-seed)/9 * (seed<=7?1:0));
  const playerWinsConf = inPlayoffs && Math.random() < playerTeamChance;
  let outcome;
  const salaryFactor = Math.min(1, (c.salary||0)/20000000);
  if(playerWinsConf){
    const sbWin = Math.random() < (0.35 + salaryFactor*0.25);
    if(sbWin){
      outcome = `🏆 SUPER BOWL CHAMPIONS! ${team} defeats ${otherConfChamp}.\nConfetti. Parade. Ring ceremony.`;
      c.happiness = clamp((c.happiness||75)+15,0,100);
      c.checking += Math.round((c.salary||0)*0.15);
      logEvent(`Super Bowl Champion with ${team}!`, 'gold');
    } else {
      outcome = `🥈 ${team} lost the Super Bowl to ${otherConfChamp}. Heartbreak.`;
      c.happiness = clamp((c.happiness||75)-5,0,100);
    }
  } else if(inPlayoffs){
    const rounds = ['Wild Card','Divisional','Conference Championship'];
    const exitRound = pick(rounds);
    outcome = `${team} exited in the ${exitRound} round.\n\nSuper Bowl: ${otherConfChamp} wins it all.`;
  } else {
    const afcChamp = otherConfChamp;
    const nfcChamp = pick(flattenConf(NFL_CONFERENCES[conf==='AFC'?'NFC':'AFC']));
    outcome = `${team} missed the playoffs this year.\n\nSuper Bowl: ${afcChamp} defeats ${nfcChamp}.`;
  }
  const body = `🏆 Super Bowl Results\n\n${outcome}\n\nOff-season begins. Roster moves ahead.`;
  const y = Math.floor(c.monthAge/12);
  addInboxItem({type:'news', icon:'🏆', subject:`Super Bowl — ${playerWinsConf?'VICTORY':'Results'}`, date:`Y${y}-Feb`, body});
}
function tickNFLSeason(c){
  if(c.jobId !== 'football_player' || !c.sportsTeam) return;
  const m = c.monthAge % 12; // 0=Jan … 8=Sep
  if(m === 8) sendNFLSchedule(c);       // September: schedule
  else if(m === 0) sendNFLPlayoffs(c);  // January: playoffs/standings
  else if(m === 1) sendNFLSuperBowl(c); // February: Super Bowl
}

// ── NHL Season: Schedule, Standings, Play-in, Playoffs ──────────
const NHL_CONFERENCES = {
  Eastern: ['Toronto Maple Leafs','Montreal Canadiens','New York Rangers','Boston Bruins','Buffalo Sabres','Ottawa Senators','Detroit Red Wings','Florida Panthers','Tampa Bay Lightning','Carolina Hurricanes','Washington Capitals','Philadelphia Flyers','Pittsburgh Penguins','New Jersey Devils','New York Islanders','Columbus Blue Jackets'],
  Western: ['Chicago Blackhawks','Minnesota Wild','Colorado Avalanche','Dallas Stars','Nashville Predators','Winnipeg Jets','St. Louis Blues','Vancouver Canucks','Edmonton Oilers','Calgary Flames','Los Angeles Kings','Anaheim Ducks','San Jose Sharks','Vegas Golden Knights','Arizona Coyotes','Seattle Kraken'],
};
function playerNHLConf(team){
  for(const [conf, list] of Object.entries(NHL_CONFERENCES)){
    if(list.includes(team)) return conf;
  }
  return null;
}
function sendNHLSchedule(c){
  const team = c.sportsTeam;
  if(!team) return;
  const conf = playerNHLConf(team) || 'Eastern';
  const all = [...NHL_CONFERENCES.Eastern, ...NHL_CONFERENCES.Western].filter(t=>t!==team);
  // Full NHL season = 82 games. Show a condensed preview of 20.
  const opps = [];
  while(opps.length < 20){
    opps.push(all[Math.floor(Math.random()*all.length)]);
  }
  const months=['Oct','Oct','Nov','Nov','Dec','Dec','Jan','Jan','Feb','Feb','Feb','Mar','Mar','Mar','Apr','Apr','Apr','Apr','Apr','Apr'];
  const body = `NHL regular season schedule released. 82 games.\n\nYour team: ${team} (${conf} Conference)\n\nPreview (first 20 matchdays):\n` +
    opps.map((o,i)=>{
      const ha = i%2===0?'🏠':'✈️';
      return `G${String(i+1).padStart(2,'0')}  ${months[i]}  ${ha} ${ha==='🏠'?team+' vs '+o : o+' vs '+team}`;
    }).join('\n') +
    `\n\nPlayoffs: top 6 per conference auto-qualify. Seeds 7-10 enter a play-in tournament (7v10, 8v9, best-of-3) — winners take seeds 7 & 8 in the main bracket.\nMain playoffs: best-of-7 series across 4 rounds → Stanley Cup Final.`;
  const y = Math.floor(c.monthAge/12);
  addInboxItem({type:'news', icon:'🏒', subject:`${team} — NHL schedule released`, date:`Y${y}-Oct`, body});
}
function sendNHLPlayins(c){
  const team = c.sportsTeam;
  if(!team) return;
  const conf = playerNHLConf(team) || 'Eastern';
  const confTeams = NHL_CONFERENCES[conf];
  const salaryFactor = Math.min(1, (c.salary||0)/10000000);
  const r = Math.random();
  let seed;
  if(salaryFactor > 0.5) seed = r<0.35?ri(1,4):r<0.7?ri(5,10):ri(11,16);
  else if(salaryFactor > 0.2) seed = r<0.25?ri(1,6):r<0.7?ri(7,12):ri(13,16);
  else seed = r<0.2?ri(1,8):r<0.6?ri(9,13):ri(14,16);
  const others = confTeams.filter(t=>t!==team).sort(()=>Math.random()-0.5);
  const standings = [];
  let oi = 0;
  for(let pos=1;pos<=16;pos++){
    if(pos===seed) standings.push(team);
    else standings.push(others[oi++]);
  }
  const tbl = standings.map((t,i)=>{
    const pts = Math.max(55, 115 - i*4 + ri(-3,3));
    const wins = Math.floor(pts/2.4);
    const losses = 82 - wins - ri(3,10);
    const ot = 82 - wins - losses;
    const mark = t===team?' ← YOU':'';
    const qual = i<6 ? ' 🌟 auto playoff' : (i<10 ? ' 🎟️ play-in' : (i>=14?' ⬇️':''));
    return `${String(i+1).padStart(2,' ')}. ${t.padEnd(22,' ')} ${String(wins).padStart(2,' ')}-${String(losses).padStart(2,' ')}-${String(ot).padStart(1,' ')}  ${String(pts).padStart(3,' ')}pts${qual}${mark}`;
  }).join('\n');
  // Play-in bracket: seeds 7v10 and 8v9
  const s7=standings[6], s10=standings[9], s8=standings[7], s9=standings[8];
  const winA = Math.random()<0.55 ? s7 : s10;
  const winB = Math.random()<0.55 ? s8 : s9;
  let playerNote;
  if(seed===1) playerNote = `🥇 ${team} finished 1st in ${conf} — clinched division, top seed.`;
  else if(seed<=6) playerNote = `🌟 ${team} finished ${ordinal(seed)} — automatic playoff berth.`;
  else if(seed<=10) playerNote = `🎟️ ${team} finished ${ordinal(seed)} — entering the play-in tournament.`;
  else playerNote = `${team} finished ${ordinal(seed)} — missed the postseason.`;
  const body = `🏒 ${conf} Conference — Regular Season Recap\n\n${playerNote}\n\nPlay-in Results (best-of-3):\n• ${s7} vs ${s10} — winner: ${winA}\n• ${s8} vs ${s9} — winner: ${winB}\n\n${winA} and ${winB} now fill seeds 7 & 8 in the main playoff bracket.\n\nFinal ${conf} Standings:\n${tbl}`;
  const y = Math.floor(c.monthAge/12);
  addInboxItem({type:'news', icon:'🏒', subject:`${conf} — standings + play-in (${team} ${ordinal(seed)})`, date:`Y${y}-Apr`, body});
  c._nhlSeed = seed;
  c._nhlConf = conf;
}
function sendNHLStanleyCup(c){
  const team = c.sportsTeam;
  if(!team) return;
  const seed = c._nhlSeed || 16;
  const conf = c._nhlConf || 'Eastern';
  const otherConf = conf==='Eastern'?'Western':'Eastern';
  const otherChamp = pick(NHL_CONFERENCES[otherConf]);
  const inPlayoffs = seed <= 10; // 1-6 auto, 7-10 via play-in
  const salaryFactor = Math.min(1, (c.salary||0)/10000000);
  let outcome;
  if(inPlayoffs){
    const advChance = seed<=4?0.55:seed<=6?0.4:seed<=8?0.25:0.12;
    const wonConf = Math.random() < advChance;
    if(wonConf){
      const cupWin = Math.random() < (0.4 + salaryFactor*0.2);
      if(cupWin){
        outcome = `🏆 STANLEY CUP CHAMPIONS! ${team} defeats ${otherChamp} in the Finals.\nLord Stanley's Cup is yours. Name engraved.`;
        c.happiness = clamp((c.happiness||75)+18,0,100);
        c.checking += Math.round((c.salary||0)*0.20);
        logEvent(`Stanley Cup Champion with ${team}!`, 'gold');
      } else {
        outcome = `🥈 ${team} lost the Stanley Cup Final to ${otherChamp}. Gut-wrenching.`;
        c.happiness = clamp((c.happiness||75)-5,0,100);
      }
    } else {
      const rounds = ['First Round','Second Round','Conference Final'];
      const exitRound = pick(rounds);
      outcome = `${team} was eliminated in the ${exitRound}.\n\nStanley Cup: ${otherChamp} defeats a ${conf} rival.`;
    }
  } else {
    const eastC = pick(NHL_CONFERENCES.Eastern);
    const westC = pick(NHL_CONFERENCES.Western);
    outcome = `${team} missed the playoffs this year.\n\nStanley Cup: ${eastC} vs ${westC} — champion: ${pick([eastC,westC])}.`;
  }
  const body = `🏆 Stanley Cup Final — Results\n\n${outcome}\n\nDraft and free agency ahead.`;
  const y = Math.floor(c.monthAge/12);
  addInboxItem({type:'news', icon:'🏆', subject:`Stanley Cup — ${inPlayoffs?'Results':'Recap'}`, date:`Y${y}-Jun`, body});
}
function tickNHLSeason(c){
  if(c.jobId !== 'hockey_player' || !c.sportsTeam) return;
  const m = c.monthAge % 12;
  if(m === 9) sendNHLSchedule(c);        // October
  else if(m === 3) sendNHLPlayins(c);    // April — standings + play-in
  else if(m === 5) sendNHLStanleyCup(c); // June — Stanley Cup
}

function signSportsContract(item){
  const c = GS.char;
  if(!item || !item.offer) return 'Invalid offer.';
  if(c.jobSector !== 'sports'){ return 'You\'re no longer a pro athlete.'; }
  const o = item.offer;
  c.salary = o.newSalary;
  c.sportsTeam = o.teamName;
  // Reset jobTitle to the base role (strip any prior team), then append new team
  const baseRole = (c.jobTitle||'').split(' @ ')[0];
  c.jobTitle = `${baseRole} @ ${o.teamName}`;
  // Reset European qualification — new team, re-seed next tick
  c._euroInit = false; c._euroComp = null;
  c.checking += o.signingBonus;
  item.signed = true;
  item.body += `\n\n✅ Signed. New salary applied: ${fmt$(o.newSalary)}/yr. Signing bonus ${fmt$(o.signingBonus)} credited.`;
  showToast(`Signed with ${o.teamName}! +${fmt$(o.signingBonus)} bonus`);
  logEvent(`Signed with ${o.teamName} — new salary ${fmt$(o.newSalary)}/yr`, 'gold');
  return `Signed with ${o.teamName}! Salary now ${fmt$(o.newSalary)}/yr. Signing bonus of ${fmt$(o.signingBonus)} deposited.`;
}

function tickSponsors(inv, char){
  if(!inv.sponsors || !inv.sponsors.length) return;
  const remaining=[];
  for(const s of inv.sponsors){
    char.checking += s.monthly;
    s.monthsLeft--;
    if(s.monthsLeft <= 0){
      addInboxItem({
        type:'news', icon:s.icon,
        subject:`Sponsorship ended — ${s.name}`,
        date: currentMonthDate(char),
        body:`Your deal with ${s.name} has run its course.\n\nTotal monthly payments over the term added up over time. You can re-sign if they're still available in the Sponsors tab.`
      });
    } else {
      remaining.push(s);
    }
  }
  inv.sponsors = remaining;
}

function stockPortfolioValue(inv){
  return Object.entries(inv.portfolio).reduce((s,[id,pos])=>{
    const st=inv.stocks.find(x=>x.id===id);return s+(st?st.price*pos.shares:0);},0);
}
function cryptoPortfolioValue(inv){
  return Object.entries(inv.cryptoHeld).reduce((s,[id,pos])=>{
    const c=inv.cryptos.find(x=>x.id===id);return s+(c?c.price*pos.coins:0);},0);
}
function totalRetirement(inv){return inv.k401+inv.ira+inv.roth;}
function totalPropertyValue(inv){return inv.properties.reduce((s,p)=>s+p.value,0);}
function totalPropertyEquity(inv){return inv.properties.reduce((s,p)=>s+(p.value-p.debt),0);}
function totalBizValue(inv){return inv.businesses.reduce((s,b)=>s+b.value,0);}

function calcNetWorth(char, inv){
  const liquid=char.checking+char.savings+char.highYield;
  const invested=stockPortfolioValue(inv)+cryptoPortfolioValue(inv)+totalRetirement(inv)+totalPropertyEquity(inv)+totalBizValue(inv)+totalVehicleValue(inv);
  const debt=char.debt+(inv.properties.reduce((s,p)=>s+p.debt,0));
  return liquid+invested-debt;
}

