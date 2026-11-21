// ════════════════════════════════════════════════════════════════
//  UNIFIED GAME STATE
// ════════════════════════════════════════════════════════════════

const GS = {
  char: null,    // core character
  inv: null,     // investment state
  nwHistory: [], // net worth over time
  pendingEvents: [],
  scenario: 'middle',
  inbox: [],     // news & bills
  billAccum: [], // bills accumulated for next 6-month receipt
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const GAME_START_YEAR = 2026;

const BILL_TEMPLATES = [
  {icon:'⚡',name:'Electric Bill',min:60,max:220,copy:'Utility company reports rates up slightly this cycle. Total due automatically deducted.'},
  {icon:'💧',name:'Water Bill',min:30,max:90,copy:'Quarterly water & sewer. Normal consumption range.'},
  {icon:'📡',name:'Internet / Wi-Fi',min:50,max:110,copy:'Your ISP billed the monthly fiber plan. No service interruptions.'},
  {icon:'📱',name:'Phone Bill',min:45,max:130,copy:'Mobile carrier charged your unlimited plan. Data usage within limits.'},
  {icon:'📺',name:'Streaming Subscriptions',min:30,max:90,copy:'Netflix, Hulu, Disney+, Max — yes, you still have all of them.'},
  {icon:'🛡️',name:'Auto / Renter Insurance',min:80,max:260,copy:'Policy renewed. Rates vary by credit and driving history.'},
  {icon:'💪',name:'Gym Membership',min:20,max:120,copy:'Monthly membership charge. Go more to feel better about it.'},
  {icon:'☁️',name:'Cloud / Software',min:10,max:50,copy:'iCloud, Dropbox, Notion, etc. Small charges that add up.'},
];

const NEWS_HEADLINES = [
  {icon:'🏛️',subject:'Fed Signals Policy Shift',body:'The Federal Reserve hints at adjusting rates in response to inflation data. Borrowing costs and mortgage rates may respond in the coming months. Expect ripples across equity markets.'},
  {icon:'⚖️',subject:'New Consumer Finance Law Passed',body:'Congress approves legislation reshaping credit card disclosures and overdraft fees. Banks have 90 days to comply. Consumers may see smaller fees on minor overages.'},
  {icon:'🛢️',subject:'Oil Prices Swing on Supply News',body:'Crude markets react to OPEC supply signals. Gas prices at the pump could move 10-15% over the next month depending on refinery output.'},
  {icon:'🏠',subject:'Housing Market Report',body:'Inventory tightens in major metros. Mortgage applications are mixed — first-time buyers remain priced out while cash buyers dominate competitive bids.'},
  {icon:'💼',subject:'Jobs Report Released',body:'Labor Department posts non-farm payrolls. Wage growth steady, unemployment rate holds. Tech and healthcare lead hiring; retail softens.'},
  {icon:'📊',subject:'Inflation Data Comes In',body:'CPI prints in line with expectations. Shelter and services remain sticky; goods deflation continues. Core measures diverge from headline.'},
  {icon:'🚀',subject:'Tech IPO Makes Waves',body:'A highly-anticipated tech company goes public. Underwriters pop the opening price; insider lockup expires in six months.'},
  {icon:'💔',subject:'Bank Loses Deposits',body:'A regional bank reports an outflow spike. Regulators monitor the situation. Depositors under FDIC limits remain protected.'},
  {icon:'🌍',subject:'Trade Deal Progress',body:'Negotiators announce preliminary agreement on tariffs. Affected sectors include autos, steel, agriculture. Full ratification still pending.'},
  {icon:'🔒',subject:'Cybersecurity Breach Reported',body:'Large retailer confirms customer data exposure. Consumers urged to check credit reports and enable alerts on card accounts.'},
  {icon:'🎓',subject:'Student Loan Update',body:'Department of Education adjusts repayment plans for income-driven borrowers. Eligible balances may see reduced monthly minimums.'},
  {icon:'⚕️',subject:'Healthcare Premiums Shift',body:'Employer-sponsored plans announce next year\'s rate schedules. HDHP options gain ground; HSA eligibility expands slightly.'},
  {icon:'🚗',subject:'EV Tax Credits Revised',body:'Federal EV credit rules update eligibility. Income caps and domestic-battery requirements affect 2026 model-year buyers.'},
  {icon:'₿',subject:'Crypto Regulation Advances',body:'Lawmakers advance stablecoin framework. Exchanges brace for new compliance rules. Institutional flows continue rising.'},
];

// Random downsides — 3% monthly chance to trigger one
// Each has a `cat` (insurance category) used to match bank insurance coverage.
// `apply` returns the RAW cost before insurance; insurance refund is applied in triggerDownside.
const DOWNSIDES = [
  {icon:'🚑', cat:'medical', subject:'Medical Emergency', body:'An unexpected ER visit hit you with a surprise bill. Deductibles and out-of-network charges add up fast.', apply:(c)=>{const cost=ri(400,2800); c.health=clamp(c.health-ri(3,10),0,100); return cost;}},
  {icon:'🔧', cat:'auto', subject:'Car Breakdown', body:'Your car broke down on the highway. Tow, diagnostics, and parts — none of it cheap.', apply:(c)=>{return ri(350,1800);}},
  {icon:'💻', cat:'tech', subject:'Laptop Fried', body:'Coffee spill killed your laptop. You needed a replacement immediately for work.', apply:(c)=>{c.happiness=clamp(c.happiness-5,0,100); return ri(600,1600);}},
  {icon:'🦷', cat:'medical', subject:'Emergency Dental Work', body:'Cracked molar, root canal, crown. Dental insurance didn\'t cover much.', apply:(c)=>{return ri(800,2400);}},
  {icon:'🏠', cat:'home', subject:'Home Repair Disaster', body:'Pipe burst in the wall. Water damage, emergency plumber, drywall repair.', apply:(c)=>{return ri(900,3500);}},
  {icon:'📱', cat:'tech', subject:'Phone Stolen', body:'Someone lifted your phone at a coffee shop. You had to replace it and change every password.', apply:(c)=>{c.happiness=clamp(c.happiness-4,0,100); return ri(300,1200);}},
  {icon:'🐕', cat:'pet', subject:'Pet Emergency', body:'Your pet swallowed something it shouldn\'t. Vet bills for surgery and meds stacked up.', apply:(c)=>{c.happiness=clamp(c.happiness-3,0,100); return ri(500,3000);}},
  {icon:'🎣', cat:'identity', subject:'Identity Theft', body:'Someone opened fraudulent accounts in your name. You\'re fighting to get it cleared, and your credit score took a hit.', apply:(c)=>{c.creditScore=clamp((c.creditScore||650)-ri(15,40),300,850); return ri(200,1500);}},
  {icon:'⚡', cat:'home', subject:'Electric Bill Shock', body:'Meter reading adjustment plus a heat wave = a brutal utility bill this month.', apply:(c)=>{return ri(250,900);}},
  {icon:'👮', cat:'auto', subject:'Traffic Ticket', body:'Caught speeding. The fine plus insurance hike stings.', apply:(c)=>{return ri(150,650);}},
  {icon:'🦴', cat:'medical', subject:'Minor Injury', body:'Slipped on ice / twisted an ankle. Urgent care, x-ray, and a few days off work.', apply:(c)=>{c.health=clamp(c.health-ri(4,12),0,100); c.happiness=clamp(c.happiness-4,0,100); return ri(200,900);}},
  {icon:'🪪', cat:'identity', subject:'Wallet Stolen', body:'Pickpocketed in a crowd. Lost cash, had to reissue cards, ID replacement fees.', apply:(c)=>{c.happiness=clamp(c.happiness-3,0,100); return ri(180,700);}},
  {icon:'🍔', cat:'medical', subject:'Food Poisoning', body:'Bad sushi. Missed two days of work, doctor visit, meds.', apply:(c)=>{c.health=clamp(c.health-ri(3,8),0,100); return ri(120,500);}},
  {icon:'🏚️', cat:'home', subject:'Landlord Raised Rent', body:'Lease renewal came with a 15% hike. You paid the deposit increase this month.', apply:(c)=>{c.happiness=clamp(c.happiness-5,0,100); return ri(400,1800);}},
  {icon:'📄', cat:'legal', subject:'IRS Audit Letter', body:'Routine audit flagged a discrepancy. Back-taxes and penalty owed.', apply:(c)=>{c.happiness=clamp(c.happiness-6,0,100); return ri(400,2500);}},
  {icon:'🧯', cat:'fire', subject:'Kitchen Fire', body:'Small grease fire. Smoke damage, replaced microwave and cabinets. Renters insurance covered some.', apply:(c)=>{return ri(500,2200);}},
];

function triggerDownside(c){
  const d = pick(DOWNSIDES);
  const rawCost = d.apply(c);
  const bank = c.bankId ? BANKS.find(b=>b.id===c.bankId) : null;
  const covFrac = bank ? (bank.covers[d.cat] || 0) : 0;
  const refund = Math.round(rawCost * covFrac);
  const netCost = rawCost - refund;
  c.checking -= netCost;
  const date = currentMonthDate(c);
  let body = `Amount: ${fmt$(rawCost)}\n`;
  if(refund > 0){
    body += `${bank.icon} ${bank.name} insurance covered ${fmt$(refund)} (${Math.round(covFrac*100)}%)\n`;
    body += `Out of pocket: ${fmt$(netCost)}\nStatus: Paid from checking\n\n${d.body}`;
  } else {
    if(bank) body += `${bank.icon} ${bank.name}: no coverage for ${d.cat} on your plan.\n`;
    body += `Status: Paid from checking\n\n${d.body}`;
  }
  addInboxItem({
    type:'bill', icon:d.icon, subject:`${d.subject} — ${fmt$(netCost)}`, date, body,
  });
  logEvent(`${d.icon} ${d.subject}: -${fmt$(netCost)}${refund>0?` (insurance -${fmt$(refund)})`:''}`, 'bad');
}

// ── Banks ──────────────────────────────────────────────────────────
// Each bank offers an insurance bundle that reduces specific downside costs.
// `covers` = fraction refunded on that category. `suits` = job sectors it fits best.
// `fee` = monthly maintenance fee. `signupBonus` = one-time cash on opening.
// `apyBonus` = percentage-point bonus on savings rate (applied to highYield).
const BANKS = [
  {id:'fnt',   icon:'🏛️', name:'First National Trust',       fee:5,  signupBonus:100,  apyBonus:0.0,  suits:['finance','education','other'],
    covers:{medical:0.25, auto:0.15, home:0.20, tech:0.10, identity:0.15},
    blurb:'Reliable nationwide bank. Light general coverage, suits most career paths.'},
  {id:'phcu',  icon:'⚕️', name:'Provident Health Credit Union', fee:18, signupBonus:150, apyBonus:0.3, suits:['healthcare','service','trades','transport','law','sports'],
    covers:{medical:0.70, pet:0.25},
    blurb:'Deep health coverage + HSA. Excellent for frontline & high-risk jobs.'},
  {id:'bgb',   icon:'🔨', name:'Builder\'s Guild Bank',        fee:10, signupBonus:200, apyBonus:0.1, suits:['trades','transport'],
    covers:{home:0.45, tech:0.40, auto:0.25, medical:0.15},
    blurb:'Tool + workers\'-comp supplement for the trades. Workshop-friendly.'},
  {id:'aab',   icon:'🚗', name:'Atlas Auto Bank',              fee:12, signupBonus:180, apyBonus:0.1, suits:['transport','trades','service'],
    covers:{auto:0.75, legal:0.20},
    blurb:'Bundled auto + roadside. Built for drivers, mechanics, delivery pros.'},
  {id:'mlb',   icon:'⚖️', name:'Metropolitan Legal Bank',      fee:22, signupBonus:100, apyBonus:0.2, suits:['law','finance'],
    covers:{legal:0.70, identity:0.30},
    blurb:'Legal defense + audit-response retainer. Designed for litigious careers.'},
  {id:'tsb',   icon:'🛡️', name:'TechShield Bank',             fee:14, signupBonus:150, apyBonus:0.2, suits:['tech','finance','creative'],
    covers:{identity:0.80, tech:0.55, legal:0.10},
    blurb:'Cyber + identity-theft shield. Best-in-class digital defense.'},
  {id:'cfu',   icon:'🎨', name:'Creators Federal',             fee:9,  signupBonus:120, apyBonus:0.1, suits:['creative','tech'],
    covers:{tech:0.70, identity:0.25, home:0.15},
    blurb:'Gear coverage for artists, photographers, editors. Replaces lost tools.'},
  {id:'ecu',   icon:'🎓', name:'Educator\'s Credit Union',     fee:4,  signupBonus:250, apyBonus:0.2, suits:['education'],
    covers:{medical:0.30, tech:0.20, identity:0.15},
    blurb:'Teacher-friendly. Lower fees, small bonuses. Ideal for school staff.'},
  {id:'spb',   icon:'✈️', name:'Skyway Pilot\'s Bank',         fee:16, signupBonus:200, apyBonus:0.2, suits:['transport'],
    covers:{auto:0.50, medical:0.35, tech:0.25},
    blurb:'Travel accident + medevac rider. Built for pilots, crews, long-haul.'},
  {id:'frt',   icon:'🌾', name:'Farm & Rural Trust',           fee:6,  signupBonus:120, apyBonus:0.1, suits:['trades','service','other'],
    covers:{home:0.65, fire:0.40, auto:0.20},
    blurb:'Home, flood, and outbuilding coverage. A rural staple.'},
  {id:'mub',   icon:'🏙️', name:'Midtown Urban Bank',           fee:8,  signupBonus:150, apyBonus:0.1, suits:['service','creative','tech'],
    covers:{home:0.45, identity:0.45, tech:0.15},
    blurb:'Renter\'s insurance + city-life identity protection. Urban essentials.'},
  {id:'pof',   icon:'🐾', name:'Pet Owner\'s Federal',         fee:7,  signupBonus:100, apyBonus:0.1, suits:['healthcare','service','other'],
    covers:{pet:0.85, medical:0.10},
    blurb:'Best-in-class pet insurance. Vet bills rarely hurt.'},
  {id:'vhb',   icon:'🎖️', name:'Veterans Heritage Bank',       fee:3,  signupBonus:250, apyBonus:0.3, suits:['law','trades'],
    covers:{medical:0.55, legal:0.25, home:0.20, auto:0.20},
    blurb:'Service-member focus. Low fees, broad disability & medical coverage.'},
  {id:'ghs',   icon:'🌅', name:'Golden Horizon Seniors',       fee:5,  signupBonus:200, apyBonus:0.4, suits:['retired','other'],
    covers:{medical:0.60, home:0.25},
    blurb:'Medicare supplement + life insurance. Retiree-friendly rates.'},
  {id:'pwb',   icon:'💎', name:'Prosperity Wealth Bank',       fee:45, signupBonus:500, apyBonus:0.8, suits:['finance','tech','law','healthcare','sports'],
    covers:{medical:0.35, auto:0.30, home:0.30, tech:0.30, identity:0.30, legal:0.30, pet:0.20, fire:0.30},
    blurb:'Premium fee, broad umbrella coverage. For high earners only.'},
  {id:'ssa',   icon:'📚', name:'Student Savings Alliance',     fee:0,  signupBonus:50,  apyBonus:0.0, suits:['education','creative','other'],
    covers:{identity:0.35, tech:0.20},
    blurb:'No fees, no bonuses. Thin coverage. Good while you\'re broke.'},
  {id:'cfh',   icon:'🔥', name:'Coastal Fire & Home Bank',     fee:11, signupBonus:150, apyBonus:0.1, suits:['law','trades','service'],
    covers:{fire:0.85, home:0.55, medical:0.15},
    blurb:'Fire + flood + coastal damage. For firefighters & high-risk housing.'},
  {id:'cgb',   icon:'🍳', name:'Culinary Guild Bank',          fee:8,  signupBonus:120, apyBonus:0.1, suits:['service'],
    covers:{fire:0.65, medical:0.35, tech:0.15},
    blurb:'Burn + knife + slip coverage. Chefs and kitchen staff favorite.'},
  {id:'gpc',   icon:'🌱', name:'Green Planet Credit Union',    fee:6,  signupBonus:150, apyBonus:0.2, suits:['transport','tech','other'],
    covers:{auto:0.50, identity:0.40, home:0.15},
    blurb:'EV + solar discounts. Identity protection. Eco-friendly portfolios.'},
  {id:'dnb',   icon:'🌍', name:'Digital Nomad Bank',           fee:10, signupBonus:180, apyBonus:0.2, suits:['tech','creative','transport'],
    covers:{identity:0.60, tech:0.35, home:0.25, medical:0.20},
    blurb:'Travel + cyber. Works anywhere; no foreign-transaction fees.'},
];

// Bank update events — sent to inbox for player's active bank ~monthly.
const BANK_UPDATES = [
  {kind:'rate_up',   icon:'📈', tmpl:(b)=>`${b.name}: APY raised to ${(2.0+b.apyBonus+0.2).toFixed(2)}%`,
    body:(b)=>`Your high-yield account just earned a bump. New APY reflected in next statement.`},
  {kind:'rate_down', icon:'📉', tmpl:(b)=>`${b.name}: APY trimmed this quarter`,
    body:(b)=>`Rates dropped across the industry. Your savings return dips slightly.`},
  {kind:'fee_inc',   icon:'💸', tmpl:(b)=>`${b.name}: Monthly fee reviewed`,
    body:(b)=>`Your monthly maintenance fee (${fmt$(b.fee)}) is being reviewed after Q2 earnings miss. Expect a notice.`},
  {kind:'fee_waiver',icon:'🎁', tmpl:(b)=>`${b.name}: Fee waived this month`,
    body:(b)=>`Loyalty reward — monthly fee waived. Thank you for being a member.`},
  {kind:'branch',    icon:'🏢', tmpl:(b)=>`${b.name}: New branch opening`,
    body:(b)=>`A new local branch opens next quarter with extended hours and notary services.`},
  {kind:'merger',    icon:'🤝', tmpl:(b)=>`${b.name}: Strategic merger announced`,
    body:(b)=>`${b.name} is merging with a regional partner. No action needed — all accounts migrate automatically.`},
  {kind:'breach',    icon:'🚨', tmpl:(b)=>`${b.name}: Security incident notice`,
    body:(b)=>`A minor data incident has been contained. Review statements. Identity theft protection remains active.`},
  {kind:'coverage',  icon:'🛡️', tmpl:(b)=>`${b.name}: Insurance coverage expanded`,
    body:(b)=>`Policy terms updated — some deductibles reduced on existing riders. Full details in your packet.`},
  {kind:'loyalty',   icon:'💰', tmpl:(b)=>`${b.name}: Loyalty bonus deposited`,
    body:(b)=>`A small loyalty credit has been added to your checking. Thanks for banking with us.`},
  {kind:'fraud_alert',icon:'⚠️',tmpl:(b)=>`${b.name}: Fraud alert on card`,
    body:(b)=>`Suspicious activity declined. A replacement card ships in 3–5 business days.`},
  {kind:'quarterly', icon:'📊', tmpl:(b)=>`${b.name}: Quarterly performance summary`,
    body:(b)=>`Your statement period closed. Balances, interest, and insurance claim activity summarized.`},
  {kind:'app_update',icon:'📱', tmpl:(b)=>`${b.name}: Mobile app update`,
    body:(b)=>`New app version adds mobile deposit, budgeting, and fraud alerts. Update on your phone.`},
];

function bankById(id){ return BANKS.find(b=>b.id===id) || null; }

function joinBank(c, bankId){
  const b = bankById(bankId);
  if(!b) return 'Bank not found.';
  const prev = c.bankId ? bankById(c.bankId) : null;
  // Switching fee
  if(prev && prev.id !== b.id){
    const fee = 50;
    if(c.checking < fee) return `Need ${fmt$(fee)} to close your ${prev.name} account.`;
    c.checking -= fee;
  }
  c.bankId = b.id;
  c.bankTenureMonths = 0;
  c.checking += b.signupBonus;
  const date = currentMonthDate(c);
  const covList = Object.entries(b.covers).map(([k,v])=>`  • ${k.padEnd(10,' ')} ${Math.round(v*100)}% coverage`).join('\n');
  addInboxItem({
    type:'news', icon:b.icon, subject:`Welcome to ${b.name}`, date,
    body:`${b.blurb}\n\nSignup bonus: +${fmt$(b.signupBonus)}\nMonthly fee: ${fmt$(b.fee)}\nAPY bonus on high-yield: +${b.apyBonus.toFixed(1)}%\n\n── Insurance Coverage ──\n${covList||'  (none)'}\n\n${prev?`Previous bank (${prev.name}) closed. -${fmt$(50)} closing fee.`:'Welcome aboard.'}`
  });
  return `Joined ${b.name}. +${fmt$(b.signupBonus)} signup bonus credited.`;
}

function maybeEmitBankUpdate(c){
  if(!c.bankId) return;
  if(!pct(0.09)) return;
  const b = bankById(c.bankId);
  if(!b) return;
  const u = pick(BANK_UPDATES);
  const date = currentMonthDate(c);
  // Side effects for certain kinds
  if(u.kind==='loyalty'){ const bonus = ri(25,150); c.checking += bonus; }
  if(u.kind==='fee_waiver'){ c._bankFeeWaivedMonth = (c.monthAge||0); }
  addInboxItem({
    type:'news', icon:u.icon, subject:u.tmpl(b), date,
    body:`From: ${b.name}\n\n${u.body(b)}\n\n— Member Services, ${b.name}`
  });
}

function currentMonthDate(c){
  const monthsSince = Math.max(0, (c.monthAge||264)-264);
  const gameYear = GAME_START_YEAR + Math.floor(monthsSince/12);
  const monthName = MONTH_NAMES[monthsSince%12];
  return `${monthName} ${gameYear}`;
}

function generateInboxItems(c, inv){
  const date = currentMonthDate(c);
  // News / briefing — always 1 per month
  const headline = pick(NEWS_HEADLINES);
  const climate = inv.climate || 'normal';
  const moodBlurb = {
    bull:'Markets trending higher. Bulls in control — momentum trades working.',
    bear:'Broad selling pressure. Defensive sectors outperform; cash levels rising.',
    bubble:'Euphoric conditions — valuations extended far above historical norms.',
    recession:'Recessionary signals strengthen. Utilities and bonds catching bids.',
    normal:'Mixed tape. Rotation between sectors continues; no clear trend.',
  }[climate];
  // Top stock & crypto movers
  const stockMovers=(inv.stocks||[]).map(s=>{
    const h=s.history;const prev=h&&h.length>1?h[h.length-2]:s.price;
    const chg=prev>0?((s.price-prev)/prev)*100:0;
    return {name:s.name,id:s.id,chg};
  }).sort((a,b)=>b.chg-a.chg);
  const topStk = stockMovers[0]; const botStk = stockMovers[stockMovers.length-1];
  const cryptoMovers=(inv.cryptos||[]).map(cx=>{
    const h=cx.history;const prev=h&&h.length>1?h[h.length-2]:cx.price;
    const chg=prev>0?((cx.price-prev)/prev)*100:0;
    return {name:cx.name,id:cx.id,chg};
  }).sort((a,b)=>b.chg-a.chg);
  const topCr = cryptoMovers[0]; const botCr = cryptoMovers[cryptoMovers.length-1];
  const marketPart = `\n\n── Markets ──\n${moodBlurb}\n• 📈 Top stock: ${topStk?.name||'—'} ${topStk?(topStk.chg>=0?'+':'')+topStk.chg.toFixed(1)+'%':''}\n• 📉 Worst stock: ${botStk?.name||'—'} ${botStk?(botStk.chg>=0?'+':'')+botStk.chg.toFixed(1)+'%':''}\n• ₿ Top crypto: ${topCr?.name||'—'} ${topCr?(topCr.chg>=0?'+':'')+topCr.chg.toFixed(1)+'%':''}\n• ₿ Worst crypto: ${botCr?.name||'—'} ${botCr?(botCr.chg>=0?'+':'')+botCr.chg.toFixed(1)+'%':''}`;
  addInboxItem({
    type:'news', icon:headline.icon, subject:headline.subject, date,
    body: headline.body + marketPart,
  });

  // Bills — accrue monthly silently; consolidated receipt sent in Jun and Jan
  if(!GS.billAccum) GS.billAccum=[];
  const monthlyCount = ri(2,3);
  const monthlyPicked = [...BILL_TEMPLATES].sort(()=>Math.random()-0.5).slice(0,monthlyCount);
  let monthlyBillTotal=0;
  const monthName = MONTH_NAMES[Math.max(0,(c.monthAge||264)-264)%12];
  for(const b of monthlyPicked){
    const amt = ri(b.min,b.max);
    monthlyBillTotal += amt;
    GS.billAccum.push({monthName, icon:b.icon, name:b.name, amt, copy:b.copy});
  }
  c.checking -= monthlyBillTotal;

  // Receipt in Jun and Jan — consolidated itemized statement
  if(monthName==='Jun' || monthName==='Jan'){
    const period = monthName==='Jun' ? 'H1 (Jan–Jun)' : 'H2 (Jul–Dec prior year)';
    const total = GS.billAccum.reduce((s,e)=>s+e.amt,0);
    const byMonth = {};
    for(const e of GS.billAccum){
      if(!byMonth[e.monthName]) byMonth[e.monthName]=[];
      byMonth[e.monthName].push(e);
    }
    let body = `━━━━━━━━━━━━━━━━━━━━━━━\n   SEMI-ANNUAL BILL SUMMARY\n     ${period}\n━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    const monthOrder = MONTH_NAMES;
    for(const m of monthOrder){
      if(!byMonth[m]) continue;
      body += `── ${m} ──\n`;
      for(const e of byMonth[m]){
        body += `  ${e.icon} ${e.name.padEnd(22,' ')} ${fmt$(e.amt)}\n`;
      }
      const subtot = byMonth[m].reduce((s,e)=>s+e.amt,0);
      body += `  ${''.padEnd(24,' ')}------\n`;
      body += `  ${'Subtotal'.padEnd(24,' ')} ${fmt$(subtot)}\n\n`;
    }
    body += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
    body += `TOTAL (${GS.billAccum.length} bills):  ${fmt$(total)}\n`;
    body += `Status: Auto-paid from checking each month\n`;
    body += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
    addInboxItem({
      type:'bill', icon:'🧾', subject:`Bill Report ${period} — ${fmt$(total)}`, date,
      body,
    });
    GS.billAccum = [];
  }

  // Cap inbox to last 40 items
  if(GS.inbox.length>40) GS.inbox=GS.inbox.slice(0,40);
}

// Auto-classify inbox items into a section ('opportunities' for offers/promos/raises/wins;
// 'bills_news' for everything else) and a priority color (red emergency, blue big offer, orange regular).
const INBOX_RED_RX  = /injury|hospital|hospitalized|lawsuit|sued|fine|penalty|relegat|fired|laid ?off|emergency|approval ratings collapse|robbery|burglary|crash|attack|assault|passed away|died|death|funeral|critical|cancer|surgery required|complications|bankrupt|foreclos|repossess|tornado|hurricane|earthquake|flood|fire damage|injured|broke|broken bone|fracture|concussion|defect|recall/i;
const INBOX_BLUE_RX = /\boffer\b|signed|signing|contract|raise|promotion|promoted|award|hall of fame|championship|brand deal|sponsorship|deal|bonus|won the lottery|callup|drafted|callback|book deal|nomination|grant|investment offer|equity|partnership offer|buyout/i;
const INBOX_OPP_RX  = /\boffer\b|signed|signing|contract|raise|promotion|promoted|brand deal|sponsorship|callup|drafted|bonus|book deal|investment offer|partnership offer|buyout|equity/i;

function classifyInboxItem(item){
  const subj = (item.subject||'') + ' ' + (item.body||'').slice(0,200);
  // Priority — explicit override wins
  let priority = item.priority;
  if(!priority){
    if(item.type === 'offer' && /raise|signing/i.test(subj)) priority = 'blue';
    else if(item.type === 'offer') priority = 'blue';
    else if(INBOX_RED_RX.test(subj)) priority = 'red';
    else if(INBOX_BLUE_RX.test(subj)) priority = 'blue';
    else priority = 'orange';
  }
  // Section
  let section = item.section;
  if(!section){
    section = (item.type === 'offer' || INBOX_OPP_RX.test(subj)) ? 'opportunities' : 'bills_news';
  }
  return { priority, section };
}

function addInboxItem(item){
  if(!GS.inbox) GS.inbox=[];
  const { priority, section } = classifyInboxItem(item);
  GS.inbox.unshift({id:`ib_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, read:false, priority, section, ...item});
  if(GS.inbox.length>40) GS.inbox.length=40;
}

function getInboxPrefs(){
  if(!GS.inboxPrefs) GS.inboxPrefs = { showRed: true, showBlue: true, showOrange: true };
  return GS.inboxPrefs;
}

function renderInbox(){
  const items = GS.inbox||[];
  const prefs = getInboxPrefs();
  const counts = { red:0, blue:0, orange:0 };
  // Dot counts are based on dotSeen, not read — opening the inbox clears the dots
  // while per-item unread state still shows in the modal until the player taps each one.
  for(const i of items){ if(!i.dotSeen){ const p = i.priority || classifyInboxItem(i).priority; if(counts[p] !== undefined) counts[p]++; } }
  for(const color of ['red','blue','orange']){
    const el = $('ibd-'+color);
    if(!el) continue;
    const enabled = prefs['show'+color.charAt(0).toUpperCase()+color.slice(1)];
    const show = enabled && counts[color] > 0;
    el.textContent = counts[color];
    el.className = 'inbox-dot '+color+(show?' show':'');
  }
}

function toggleInboxPref(color){
  const prefs = getInboxPrefs();
  const key = 'show'+color.charAt(0).toUpperCase()+color.slice(1);
  prefs[key] = !prefs[key];
  renderInbox();
  showInboxModal(_inboxSection || 'bills_news');
}

let _inboxSection = 'bills_news';
function showInboxModal(section){
  section = section || _inboxSection || 'bills_news';
  _inboxSection = section;
  const items = GS.inbox || [];
  const prefs = getInboxPrefs();
  // Make sure all items are classified (legacy items) AND mark dots as seen so the
  // colored dots vanish from the inbox button the moment the modal opens.
  for(const it of items){
    if(!it.priority || !it.section){ const cl = classifyInboxItem(it); it.priority = it.priority || cl.priority; it.section = it.section || cl.section; }
    it.dotSeen = true;
  }
  renderInbox();
  const filtered = items.filter(i => i.section === section);
  const sectionUnread = filtered.filter(i=>!i.read).length;
  $('m-icon').textContent = '📬';
  $('m-tag').textContent = 'Inbox';
  $('m-tag').className = 'modal-tag fla';
  $('m-title').textContent = 'Inbox';
  $('m-body').textContent = items.length
    ? `${items.length} total · ${sectionUnread} unread in this section`
    : 'No mail yet. Age +1 month to receive news and bills.';
  $('m-result').style.display = 'none';
  const ch = $('m-choices');
  ch.innerHTML = '';

  // Section tabs
  const tabBar = document.createElement('div');
  tabBar.style.cssText = 'display:flex;gap:4px;margin-bottom:8px;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--bg2);z-index:2';
  const sections = [
    { id:'bills_news',    label:'📬 Bills & News' },
    { id:'opportunities', label:'💼 Offers & Promos' },
  ];
  sections.forEach(s => {
    const b = document.createElement('button');
    const active = s.id === section;
    const sCount = items.filter(i => i.section === s.id && !i.read).length;
    b.innerHTML = `${s.label}${sCount?` <span style="background:var(--gold);color:#000;border-radius:8px;padding:1px 6px;font-size:9px;margin-left:4px">${sCount}</span>`:''}`;
    b.style.cssText = `flex:1;padding:10px 6px;background:${active?'var(--bg3)':'transparent'};border:none;border-bottom:2px solid ${active?'var(--gold)':'transparent'};color:${active?'var(--gold)':'var(--muted)'};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;cursor:pointer;border-radius:6px 6px 0 0`;
    b.onclick = () => showInboxModal(s.id);
    tabBar.appendChild(b);
  });
  ch.appendChild(tabBar);

  // Settings strip — toggle which color dots show on the inbox button
  const setRow = document.createElement('div');
  setRow.style.cssText = 'display:flex;gap:4px;margin-bottom:10px;padding:8px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;flex-wrap:wrap;align-items:center';
  const setLabel = document.createElement('div');
  setLabel.style.cssText = 'font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;width:100%;margin-bottom:2px';
  setLabel.textContent = '🔔 Show notification dot for:';
  setRow.appendChild(setLabel);
  const colorMeta = [
    { color:'red',    icon:'🔴', label:'Emergencies', desc:'Injuries, lawsuits, deaths' },
    { color:'blue',   icon:'🔵', label:'Big Offers',  desc:'Contracts, raises, promotions' },
    { color:'orange', icon:'🟠', label:'Regular',     desc:'Bills, fixtures, news' },
  ];
  colorMeta.forEach(m => {
    const key = 'show'+m.color.charAt(0).toUpperCase()+m.color.slice(1);
    const on = prefs[key];
    const t = document.createElement('button');
    t.innerHTML = `<span style="font-size:13px">${m.icon}</span> <span>${m.label}</span> <span style="font-size:10px;opacity:.7">${on?'ON':'OFF'}</span>`;
    t.style.cssText = `flex:1;min-width:120px;padding:8px;background:${on?'var(--bg2)':'rgba(0,0,0,.25)'};border:1px solid ${on?'var(--gold-dim)':'var(--border)'};color:${on?'var(--text)':'var(--muted)'};border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;display:flex;align-items:center;gap:6px;justify-content:center;opacity:${on?1:.55}`;
    t.title = m.desc;
    t.onclick = () => toggleInboxPref(m.color);
    setRow.appendChild(t);
  });
  ch.appendChild(setRow);

  // Item list
  if(!filtered.length){
    const empty = document.createElement('div');
    empty.style.cssText = 'text-align:center;color:var(--muted);font-size:12px;padding:20px';
    empty.textContent = section === 'opportunities' ? 'No offers or promotions yet.' : 'No bills or news yet.';
    ch.appendChild(empty);
  } else {
    const priorityColor = { red:'#c44', blue:'#3a7bd0', orange:'#d68a3a' };
    filtered.forEach(i => {
      const preview = (i.body||'').split('\n')[0].substring(0,70);
      const pCol = priorityColor[i.priority] || priorityColor.orange;
      const div = document.createElement('div');
      div.className = `inbox-item ${i.read?'read':'unread'} ${i.type||''}`;
      div.style.cssText = `border-left:4px solid ${pCol}`;
      div.onclick = () => openInboxItem(i.id);
      div.innerHTML = `
        <div class="ii-hdr"><span class="ii-date">${i.date||''}</span><span style="font-size:9px;color:${pCol};font-weight:700;text-transform:uppercase">${i.priority||'orange'}</span></div>
        <div class="ii-subject">${i.icon||''} ${i.subject||''}</div>
        <div class="ii-preview">${preview}</div>`;
      ch.appendChild(div);
    });
  }
  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'choice-btn';
  closeBtn.textContent = 'Close';
  closeBtn.style.marginTop = '8px';
  closeBtn.onclick = () => closeModal();
  ch.appendChild(closeBtn);

  $('modal-box').classList.add('compact');
  $('modal-overlay').classList.add('open');
}

const BIZ_TYPES = [
  {icon:'🚚', name:'Food Truck',   cost:20000,  revMult:1.5},
  {icon:'☕', name:'Coffee Shop',  cost:60000,  revMult:1.3},
  {icon:'🛍️', name:'Retail Store', cost:80000,  revMult:1.3},
  {icon:'💻', name:'Tech Startup', cost:30000,  revMult:3.0},
  {icon:'🍝', name:'Restaurant',   cost:120000, revMult:1.4},
  {icon:'🏋️', name:'Gym / Studio', cost:75000,  revMult:1.6},
  {icon:'🍸', name:'Bar / Lounge', cost:90000,  revMult:1.5},
  {icon:'🚿', name:'Car Wash',     cost:45000,  revMult:1.2},
  {icon:'🧺', name:'Laundromat',   cost:55000,  revMult:1.2},
  {icon:'☁️', name:'SaaS Company', cost:40000,  revMult:3.5},
];

const EQUIPMENT_TIERS = [
  {tier:1, label:'Basic',             revBoost:0.00, moraleFloor:40, upgradeCost:15000},
  {tier:2, label:'Standard',          revBoost:0.05, moraleFloor:50, upgradeCost:30000},
  {tier:3, label:'Pro',               revBoost:0.10, moraleFloor:60, upgradeCost:60000},
  {tier:4, label:'Premium',           revBoost:0.18, moraleFloor:70, upgradeCost:120000},
  {tier:5, label:'State-of-the-art',  revBoost:0.28, moraleFloor:80, upgradeCost:null},
];
function equipmentInfo(b){
  const tier = EQUIPMENT_TIERS.find(e=>e.tier===(b.equipTier||1)) || EQUIPMENT_TIERS[0];
  const age = b.equipAge||0;
  // Old equipment: age > 5 years OR tier 1 + age > 2 years
  const old = age >= 6 || (tier.tier===1 && age>=3) || (tier.tier===2 && age>=5);
  const next = EQUIPMENT_TIERS.find(e=>e.tier===tier.tier+1) || null;
  return {tier, age, old, next};
}

function startBusiness(idx){
  const bz=BIZ_TYPES[idx]; if(!bz) return;
  const c=GS.char;
  if(c.checking<bz.cost){ showToast(`Need ${fmt$(bz.cost)} to start ${bz.name}.`); return; }
  c.checking-=bz.cost;
  GS.inv.businesses.push({name:bz.name,startCost:bz.cost,value:bz.cost,revMult:bz.revMult,profit:0,age:0,employees:[],equipTier:1,equipAge:0});
  logEvent(`${bz.icon} Started ${bz.name} — invested ${fmt$(bz.cost)}`, 'good');
  showToast(`Started ${bz.name}!`);
  saveGame();
  const nw=calcNetWorth(GS.char,GS.inv);
  updateUI(null,nw,nw);
}

function upgradeEquipment(bizIdx){
  const b=GS.inv.businesses[bizIdx]; if(!b) return;
  const info=equipmentInfo(b);
  if(!info.next){ showToast('Already at top-tier equipment.'); return; }
  const cost = info.tier.upgradeCost;
  if(GS.char.checking < cost){ showToast(`Need ${fmt$(cost)} to upgrade.`); return; }
  GS.char.checking -= cost;
  b.equipTier = info.next.tier;
  b.equipAge = 0;
  // Morale bump for all employees
  for(const e of (b.employees||[])){ e.morale = clamp((e.morale||75) + ri(6,12), 0, 100); }
  logEvent(`🛠️ Upgraded ${b.name} equipment → ${info.next.label} (${fmt$(cost)})`, 'good');
  saveGame();
  showHireModal(bizIdx);
  renderBusinessTab();
}

function renderBusinessTab(){
  const inv=GS.inv||{}; const c=GS.char;
  const startEl=$('biz-start-list'); const listEl=$('biz-tab-list');
  if(startEl){
    startEl.innerHTML = BIZ_TYPES.map((bz,i)=>{
      const afford = c && c.checking>=bz.cost;
      return `<button class="choice-btn" onclick="startBusiness(${i})" ${afford?'':'disabled style="opacity:0.5"'}>${bz.icon} ${bz.name} — ${fmt$(bz.cost)} · ${bz.revMult.toFixed(1)}x revenue mult</button>`;
    }).join('');
  }
  if(listEl){
    const bizs=(inv.businesses||[]);
    if(!bizs.length){
      listEl.innerHTML='<p style="color:var(--muted);font-size:12px">No businesses owned. Start one above.</p>';
    } else {
      listEl.innerHTML = bizs.map((b,i)=>{
        const emps=(b.employees||[]);
        const wages=emps.reduce((s,e)=>s+(e.wage||0),0);
        const avgMorale=emps.length ? Math.round(emps.reduce((s,e)=>s+(e.morale||75),0)/emps.length) : 0;
        const moraleTag=emps.length?` · Morale ${avgMorale}%`:'';
        const profitTag=b.profit?` · Last yr: <span class="${b.profit>=0?'pos':'neg'}">${b.profit>=0?'+':''}${fmt$(b.profit)}</span>`:'';
        return `<div class="section" style="padding:8px;margin:4px 0">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:6px">
            <b>${b.name}</b><span style="color:var(--muted);font-size:11px">Age ${b.age||0}y</span>
          </div>
          <div style="font-size:11px;color:var(--muted);margin:3px 0">Value ${fmt$(b.value)} · 👥 ${emps.length} · Wages ${fmt$(wages)}/mo${moraleTag}${profitTag}</div>
          <button class="choice-btn" style="margin-top:4px" onclick="showHireModal(${i})">Manage Staff</button>
        </div>`;
      }).join('');
    }
  }
}

function payBonuses(bizIdx){
  const b=GS.inv.businesses[bizIdx]; if(!b||!b.employees||!b.employees.length) return;
  const per=500, total=per*b.employees.length;
  if(GS.char.checking<total){ showToast(`Need ${fmt$(total)} for bonuses.`); return; }
  GS.char.checking-=total;
  for(const e of b.employees){ e.morale=clamp((e.morale||75)+ri(10,18),0,100); }
  logEvent(`🎁 Paid $${per} bonus × ${b.employees.length} at ${b.name} (${fmt$(total)})`, 'good');
  saveGame(); showHireModal(bizIdx); renderBusinessTab();
}
function raiseWages(bizIdx){
  const b=GS.inv.businesses[bizIdx]; if(!b||!b.employees||!b.employees.length) return;
  for(const e of b.employees){ e.wage=Math.round((e.wage||0)*1.08); e.morale=clamp((e.morale||75)+ri(6,10),0,100); e.tenure=0; }
  logEvent(`📈 8% raise at ${b.name} — team morale up`, 'good');
  saveGame(); showHireModal(bizIdx); renderBusinessTab();
}
function throwTeamParty(bizIdx){
  const b=GS.inv.businesses[bizIdx]; if(!b||!b.employees||!b.employees.length) return;
  const cost=2000 + 300*b.employees.length;
  if(GS.char.checking<cost){ showToast(`Need ${fmt$(cost)} for the party.`); return; }
  GS.char.checking-=cost;
  for(const e of b.employees){ e.morale=clamp((e.morale||75)+ri(5,10),0,100); }
  logEvent(`🎉 Team party at ${b.name} (${fmt$(cost)})`, 'good');
  saveGame(); showHireModal(bizIdx); renderBusinessTab();
}
function trainingProgram(bizIdx){
  const b=GS.inv.businesses[bizIdx]; if(!b||!b.employees||!b.employees.length) return;
  const per=3000, total=per*b.employees.length;
  if(GS.char.checking<total){ showToast(`Need ${fmt$(total)} for training.`); return; }
  GS.char.checking-=total;
  for(const e of b.employees){
    e.morale=clamp((e.morale||75)+ri(8,14),0,100);
    e.boost=Math.min(1.5,(e.boost||0)+0.04);
  }
  logEvent(`📚 Training program at ${b.name} (${fmt$(total)}) — +4% rev each`, 'good');
  saveGame(); showHireModal(bizIdx); renderBusinessTab();
}

function showHireModal(bizIdx){
  const b=GS.inv.businesses[bizIdx]; if(!b) return;
  if(!b.employees) b.employees=[];
  if(b.equipTier===undefined){ b.equipTier=1; b.equipAge=0; }
  $('m-icon').textContent='👥';
  $('m-tag').textContent='Staffing';
  $('m-tag').className='modal-tag fla';
  $('m-title').textContent=`${b.name} — Staff`;
  const curWages=b.employees.reduce((s,e)=>s+(e.wage||0),0);
  const curBoost=Math.round(b.employees.reduce((s,e)=>s+(e.boost||0),0)*100);
  const avgMorale=b.employees.length ? Math.round(b.employees.reduce((s,e)=>s+(e.morale||75),0)/b.employees.length) : 0;
  const moraleTag = b.employees.length ? ` · Morale ${avgMorale}%` : '';
  const einfo=equipmentInfo(b);
  const equipLine = `Equipment: ${einfo.tier.label} (T${einfo.tier.tier}, ${einfo.age}y${einfo.old?' — OLD ⚠️':''}) · +${Math.round(einfo.tier.revBoost*100)}% rev`;
  $('m-body').textContent=`Staff: ${b.employees.length} · Wages: ${fmt$(curWages)}/mo · Boost: +${curBoost}%${moraleTag}\n${equipLine}`;
  $('m-result').style.display='none';
  const ch=$('m-choices');
  // Morale boosters (only if staff exists)
  let moraleBtns='';
  if(b.employees.length){
    const bonusTot = 500*b.employees.length;
    const partyTot = 2000 + 300*b.employees.length;
    const trainTot = 3000*b.employees.length;
    moraleBtns = `<button class="choice-btn" onclick="payBonuses(${bizIdx})" style="border-color:#80cbc4;color:#80cbc4">🎁 Pay $500 bonuses (${fmt$(bonusTot)} total) · +10–18 morale</button>`
      + `<button class="choice-btn" onclick="raiseWages(${bizIdx})" style="border-color:#80cbc4;color:#80cbc4">📈 Raise wages 8% · +6–10 morale (ongoing cost)</button>`
      + `<button class="choice-btn" onclick="throwTeamParty(${bizIdx})" style="border-color:#80cbc4;color:#80cbc4">🎉 Team party (${fmt$(partyTot)}) · +5–10 morale</button>`
      + `<button class="choice-btn" onclick="trainingProgram(${bizIdx})" style="border-color:#80cbc4;color:#80cbc4">📚 Training program (${fmt$(trainTot)}) · +8–14 morale, +4% boost each</button>`;
  }
  // Equipment upgrade
  let equipBtn='';
  if(einfo.next){
    equipBtn = `<button class="choice-btn" onclick="upgradeEquipment(${bizIdx})" style="border-color:#ffb74d;color:#ffb74d">🛠️ Upgrade → ${einfo.next.label} (T${einfo.next.tier}) — ${fmt$(einfo.tier.upgradeCost)} · +${Math.round(einfo.next.revBoost*100)}% rev, resets age, morale boost</button>`;
  } else {
    equipBtn = `<div style="padding:8px;text-align:center;color:var(--muted);font-size:11px">Equipment is at max tier — State-of-the-art.</div>`;
  }
  const hireBtns = EMPLOYEE_ROLES.map(r=>{
    return `<button class="choice-btn" onclick="hireEmployee(${bizIdx},'${r.title}')">${r.icon} Hire ${r.title} — ${fmt$(r.wage)}/mo · +${Math.round(r.boost*100)}% rev</button>`;
  }).join('');
  const fireBtns = b.employees.map((e,ei)=>{
    const m = e.morale||75;
    const moodIco = m>=80?'😄':m>=55?'🙂':m>=30?'😟':'😠';
    const nameTag = e.name ? ` — ${e.name}` : '';
    return `<button class="choice-btn" onclick="fireEmployee(${bizIdx},${ei})" style="border-color:var(--red);color:var(--red)">${moodIco} ${m}% · ✖ Fire ${e.title}${nameTag} (${fmt$(e.wage)}/mo)</button>`;
  }).join('');
  const sep = `<div style="height:1px;background:var(--border);margin:6px 0"></div>`;
  ch.innerHTML = equipBtn
    + (moraleBtns ? sep + moraleBtns : '')
    + sep + hireBtns
    + (fireBtns ? sep + fireBtns : '')
    + `<button class="choice-btn" onclick="closeModal()">Close</button>`;
  $('modal-box').classList.add('compact');
  $('modal-overlay').classList.add('open');
}

function hireEmployee(bizIdx, title){
  const b=GS.inv.businesses[bizIdx]; if(!b) return;
  const role=EMPLOYEE_ROLES.find(r=>r.title===title); if(!role) return;
  const signing=role.wage; // one month wage as signing cost
  if(GS.char.checking < signing){ showToast(`Need ${fmt$(signing)} upfront to hire.`); return; }
  GS.char.checking -= signing;
  if(!b.employees) b.employees=[];
  const firstNames=['Alex','Jordan','Taylor','Sam','Morgan','Casey','Riley','Jamie','Quinn','Dakota','Robin','Drew','Kai','Reese','Avery','Skylar','Parker','Rowan','Sage','Emerson','Hayden','Frankie','Blake','Marley','Cameron','Harper','Ellis','Sasha','Charlie','Lennon'];
  const lastNames=['Chen','Patel','Nguyen','Kim','Reyes','Cruz','Khan','Singh','Diaz','Lopez','Brooks','Hayes','Miller','Carter','Bennett','Murphy','Walsh','Russo','Cole','Price','Kelly','Shaw','Long','Vega','Ward','Ortiz','Stone','Adams','Sanchez','Burke'];
  const name=`${pick(firstNames)} ${pick(lastNames)}`;
  b.employees.push({title:role.title, wage:role.wage, boost:role.boost, hiredAt:GS.char.monthAge, name, morale:ri(70,85), tenure:0});
  logEvent(`${role.icon} Hired ${name} (${role.title}) at ${b.name} — ${fmt$(role.wage)}/mo`, 'info');
  renderBusinessTab();
  // Welcome note from the new hire
  addInboxItem({
    type:'news', icon:role.icon,
    subject:`Hi from ${name} — new ${role.title} at ${b.name}`,
    date: currentMonthDate(GS.char),
    body:`Hey boss,\n\nJust wanted to introduce myself. I'm ${name}, your new ${role.title} at ${b.name}. Starting at ${fmt$(role.wage)}/mo. I'll send updates about how things are going, the team vibe, and anything that comes up.\n\nExcited to get started!\n\n— ${name}`
  });
  saveGame();
  showHireModal(bizIdx);
}

function fireEmployee(bizIdx, empIdx){
  const b=GS.inv.businesses[bizIdx]; if(!b||!b.employees) return;
  const e=b.employees[empIdx]; if(!e) return;
  const sev=Math.round((e.wage||0)*1.5); // severance = 1.5 months
  GS.char.checking -= sev;
  b.employees.splice(empIdx,1);
  logEvent(`✖ Fired ${e.title} at ${b.name} — severance ${fmt$(sev)}`, 'bad');
  saveGame();
  showHireModal(bizIdx);
  renderBusinessTab();
}

function openInboxItem(id){
  const item=(GS.inbox||[]).find(i=>i.id===id); if(!item) return;
  item.read=true; renderInbox();
  $('modal-box').classList.remove('compact');
  $('m-icon').textContent=item.icon||'📬';
  const tag = item.type==='bill' ? 'Bill' : (item.type==='offer' ? 'Offer' : 'News');
  $('m-tag').textContent = tag;
  $('m-tag').className='modal-tag '+(item.type==='bill'?'exp':(item.type==='offer'?'gld':'fla'));
  $('m-title').textContent=item.subject;
  $('m-body').textContent=item.body;
  $('m-result').style.display='none';
  const ch=$('m-choices');
  if(item.type==='offer' && item.offer && !item.signed){
    ch.innerHTML = `
      <button class="choice-btn" style="background:linear-gradient(135deg,#4caf50,#2e7d32);color:#fff;font-weight:700" id="ib-sign">✅ Sign Contract — ${fmt$(item.offer.newSalary)}/yr</button>
      <button class="choice-btn" id="ib-decline">❌ Decline offer</button>
      <button class="choice-btn" onclick="showInboxModal()">← Back to Inbox</button>`;
    $('ib-sign').onclick=()=>{
      const msg = signSportsContract(item);
      $('m-body').textContent = item.body;
      $('m-result').style.display='block';
      $('m-result').textContent = msg;
      ch.innerHTML = `<button class="choice-btn" onclick="showInboxModal()">← Back to Inbox</button><button class="choice-btn" onclick="closeModal()">Close</button>`;
      updateUI({monthExp:0,monthInc:0},0,0);
    };
    $('ib-decline').onclick=()=>{
      item.declined=true;
      $('m-result').style.display='block';
      $('m-result').textContent = `Declined ${item.offer.teamName}'s offer.`;
      ch.innerHTML = `<button class="choice-btn" onclick="showInboxModal()">← Back to Inbox</button><button class="choice-btn" onclick="closeModal()">Close</button>`;
    };
  } else {
    ch.innerHTML='<button class="choice-btn" onclick="showInboxModal()">← Back to Inbox</button><button class="choice-btn" onclick="closeModal()">Close</button>';
  }
  $('modal-overlay').classList.add('open');
}

