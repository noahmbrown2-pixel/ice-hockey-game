// ════════════════════════════════════════════════════════════════
//  FINLIFE EXTRAS — Personal life, deeper finance, lifestyle, NG+
//  All additive: wraps existing systems via init/tick/UI hooks.
// ════════════════════════════════════════════════════════════════
(function(){
  'use strict';

  // ── State backfill (idempotent) ────────────────────────────────
  function ensureExtras(c, inv){
    if(!c) return;
    if(c.pet === undefined) c.pet = null;
    if(c.friends === undefined) c.friends = [];
    if(c.charityGiven === undefined) c.charityGiven = 0;
    if(c.willPctKids === undefined) c.willPctKids = 70;
    if(c.followers === undefined) c.followers = 0;
    if(c.influencerActive === undefined) c.influencerActive = false;
    if(c.influencerCadence === undefined) c.influencerCadence = 'casual';
    if(c.politicalRank === undefined) c.politicalRank = 'none';
    if(c.politicalApproval === undefined) c.politicalApproval = 50;
    if(c.politicalSalary === undefined) c.politicalSalary = 0;
    if(c.injuryMonthsLeft === undefined) c.injuryMonthsLeft = 0;
    if(c.injuryReason === undefined) c.injuryReason = '';
    if(c.careerAwards === undefined) c.careerAwards = [];
    if(c.nationalTeamCalls === undefined) c.nationalTeamCalls = 0;
    if(c.hofMember === undefined) c.hofMember = false;
    if(c.coachingCareer === undefined) c.coachingCareer = null;
    if(c.broadcasting === undefined) c.broadcasting = null;
    if(c.headhunterCount === undefined) c.headhunterCount = 0;
    if(c.ngGeneration === undefined) c.ngGeneration = 0;
    if(c.scrapbook === undefined) c.scrapbook = [];
    if(c.lastTaxYear === undefined) c.lastTaxYear = 0;
    if(c.personalLoan === undefined) c.personalLoan = 0;
    if(c.personalLoanRate === undefined) c.personalLoanRate = 0;
    if(c._extraNW === undefined) c._extraNW = 0;
    if(inv){
      if(inv.bonds === undefined) inv.bonds = 0;
      if(inv.indexFunds === undefined) inv.indexFunds = 0;
      if(inv.hobbies === undefined) inv.hobbies = [];
      if(inv.travels === undefined) inv.travels = [];
    }
  }

  // ── Catalogs ───────────────────────────────────────────────────
  const PET_SPECIES = [
    {emoji:'🐶',name:'Dog',cost:800,life:144,upkeep:120,joy:8},
    {emoji:'🐱',name:'Cat',cost:300,life:180,upkeep:80,joy:6},
    {emoji:'🐰',name:'Rabbit',cost:120,life:96,upkeep:40,joy:4},
    {emoji:'🐦',name:'Parrot',cost:1200,life:480,upkeep:60,joy:7},
    {emoji:'🐢',name:'Turtle',cost:200,life:600,upkeep:30,joy:3},
    {emoji:'🦎',name:'Lizard',cost:200,life:240,upkeep:50,joy:3},
    {emoji:'🐹',name:'Hamster',cost:30,life:36,upkeep:20,joy:3},
  ];
  const CITIES = [
    {emoji:'🗼',name:'Paris',cost:3500,joy:8,buff:'culture'},
    {emoji:'🗾',name:'Tokyo',cost:4200,joy:9,buff:'tech'},
    {emoji:'🏖️',name:'Bali',cost:2800,joy:9,buff:'wellness'},
    {emoji:'🎰',name:'Las Vegas',cost:2500,joy:7,buff:'gambling'},
    {emoji:'🏛️',name:'Rome',cost:3200,joy:8,buff:'culture'},
    {emoji:'🏔️',name:'Reykjavik',cost:3900,joy:7,buff:'wellness'},
    {emoji:'🦁',name:'Cape Town',cost:4400,joy:8,buff:'adventure'},
    {emoji:'🌆',name:'Dubai',cost:5500,joy:8,buff:'luxury'},
    {emoji:'🏯',name:'Kyoto',cost:4500,joy:9,buff:'culture'},
    {emoji:'🗽',name:'New York',cost:2800,joy:7,buff:'tech'},
  ];
  const HOBBY_CATALOG = [
    {emoji:'🎨', name:'Modern Art', cost:25000, apprY:0.06, vol:0.20},
    {emoji:'🍷', name:'Vintage Wine Cellar', cost:15000, apprY:0.05, vol:0.10},
    {emoji:'⌚', name:'Luxury Watch Collection', cost:30000, apprY:0.04, vol:0.08},
    {emoji:'🪙', name:'Rare Coin Set', cost:8000, apprY:0.05, vol:0.15},
    {emoji:'📜', name:'First-Edition Books', cost:12000, apprY:0.04, vol:0.12},
    {emoji:'🎸', name:'Vintage Guitars', cost:20000, apprY:0.05, vol:0.18},
    {emoji:'🃏', name:'Trading Cards', cost:5000, apprY:0.07, vol:0.30},
  ];
  const POL_LADDER = [
    {rank:'mayor',     title:'Mayor',     cost:100000,    nwReq:200000,   sal:120000,  approvalReq:0},
    {rank:'governor',  title:'Governor',  cost:1000000,   nwReq:2000000,  sal:180000,  approvalReq:55},
    {rank:'senator',   title:'Senator',   cost:5000000,   nwReq:10000000, sal:240000,  approvalReq:60},
    {rank:'president', title:'President', cost:50000000,  nwReq:100000000,sal:400000,  approvalReq:70},
  ];
  const SPORTS_JOBS = new Set(['soccer_player','tennis_player','golfer','baseball_player','hockey_player','football_player','basketball_player','race_car_driver','olympic_athlete','swimmer','track_athlete','mma_fighter','boxer','esports_pro','semipro_athlete']);

  // ── Helpers ────────────────────────────────────────────────────
  function logScrap(c, text, kind){
    if(!c.scrapbook) c.scrapbook = [];
    c.scrapbook.push({age: ageDisplay(c), year: GAME_START_YEAR + Math.floor((c.monthAge - 264)/12), text, kind:kind||'info'});
    if(c.scrapbook.length > 200) c.scrapbook.shift();
  }
  function isAthlete(c){ return c.employed && SPORTS_JOBS.has(c.jobId); }
  function inboxNow(c, item){ item.id = 'ext_'+Math.random().toString(36).slice(2,9); addInboxItem(item); }

  // ── PERSONAL LIFE ──────────────────────────────────────────────
  function adoptPet(idx, name){
    const c=GS.char; const sp=PET_SPECIES[idx];
    if(!sp) return 'Pick a species.';
    if(c.pet) return `You already have ${c.pet.name}.`;
    if(c.checking < sp.cost) return `Need ${fmt$(sp.cost)} to adopt.`;
    c.checking -= sp.cost;
    c.pet = {emoji:sp.emoji, species:sp.name, name:name||'Buddy', ageMonths:1, lifeExpect:sp.life, upkeep:sp.upkeep, joy:sp.joy};
    c.happiness = clamp(c.happiness + 6, 0, 100);
    logScrap(c, `Adopted ${sp.emoji} ${c.pet.name} (${sp.name})`, 'good');
    return `Welcome ${sp.emoji} ${c.pet.name}! +6 happiness.`;
  }
  function tickPet(c){
    if(!c.pet) return;
    c.pet.ageMonths++;
    c.checking -= c.pet.upkeep;
    if(c.monthAge % 12 === 0) c.happiness = clamp(c.happiness + Math.round(c.pet.joy * 0.4), 0, 100);
    const ratio = c.pet.ageMonths / c.pet.lifeExpect;
    const deathPct = ratio < 0.7 ? 0.0005 : ratio < 0.95 ? 0.006 : 0.06;
    if(pct(deathPct)){
      inboxNow(c, {type:'news', icon:'💔', subject:`${c.pet.name} passed away`, date:currentMonthDate(c),
        body:`Your ${c.pet.species.toLowerCase()} ${c.pet.name} passed peacefully at ${(c.pet.ageMonths/12).toFixed(1)} years old. They will be missed.`});
      c.happiness = clamp(c.happiness - 8, 0, 100);
      logScrap(c, `Lost pet ${c.pet.name}`, 'bad');
      c.pet = null;
    }
  }

  function genFriendName(){
    const f=['Sam','Riley','Max','Jamie','Taylor','Sky','Kai','Ash','Drew','Quinn','Blake','Sage','Reese','Jules'];
    const l=['T.','J.','M.','R.','S.','P.','K.','D.','B.','C.','H.'];
    return pick(f)+' '+pick(l);
  }
  function makeFriend(){
    const c=GS.char;
    if(c.friends.length >= 5) return 'Your circle is full (5 friends).';
    const f={name:genFriendName(), closeness:ri(40,70), since:c.age};
    c.friends.push(f);
    return `New friend: ${f.name} (${f.closeness}% closeness).`;
  }
  function tickFriends(c){
    for(const f of c.friends){ f.closeness = clamp(f.closeness + ri(-2, 2), 0, 100); }
    c.friends = c.friends.filter(f=>f.closeness > 10);
    if(pct(0.018) && c.friends.length){
      const f = pick(c.friends);
      const ask = ri(500, 5000);
      inboxNow(c, {type:'news', icon:'🤝', subject:`${f.name} needs a favor`, date:currentMonthDate(c),
        body:`Your friend ${f.name} (closeness ${f.closeness}%) is in a tight spot and is asking to borrow ${fmt$(ask)}. They say they'll pay you back.`});
    }
  }

  // Health: quick checkup + elective surgery
  function doCheckup(){
    const c=GS.char, cost=250;
    if(c.checking < cost) return `Need ${fmt$(cost)}.`;
    c.checking -= cost;
    const rec = ri(2,8);
    c.health = clamp(c.health + rec, 0, 100);
    return `Checkup: +${rec} health, -${fmt$(cost)}.`;
  }
  function doSurgery(){
    const c=GS.char;
    const cost = ri(8000, 25000);
    const bank = c.bankId ? BANKS.find(b=>b.id===c.bankId) : null;
    const cov = bank ? (bank.covers.medical || 0) : 0;
    const refund = Math.round(cost*cov);
    const net = cost - refund;
    if(c.checking < net) return `Need ${fmt$(net)} for surgery (insurance covers ${fmt$(refund)}).`;
    c.checking -= net;
    c.health = clamp(c.health + ri(15, 30), 0, 100);
    logScrap(c, `Elective surgery (${fmt$(cost)})`, 'info');
    return `Surgery successful. Cost ${fmt$(cost)}, insurance covered ${fmt$(refund)}.`;
  }

  // Have a child (married only)
  function tryForChild(){
    const c=GS.char;
    if(c.relationship !== 'married') return 'Need to be married.';
    if(c.checking < 8000) return 'Need $8,000 hospital fees.';
    if(c.kids >= 6) return 'You have a full nest.';
    c.checking -= 8000;
    c.kids++;
    c.happiness = clamp(c.happiness + 12, 0, 100);
    logScrap(c, `Had child #${c.kids}`, 'gold');
    return `Welcome child #${c.kids}! +12 happiness.`;
  }

  // Will (% to kids vs charity)
  function setWillKids(p){ GS.char.willPctKids = clamp(p, 0, 100); return `Will: ${p}% to kids, ${100-p}% to charity.`; }

  // Charity (one-shot donation)
  function donate(amount){
    const c=GS.char;
    if(c.checking < amount) return `Need ${fmt$(amount)}.`;
    c.checking -= amount;
    c.charityGiven += amount;
    c.happiness = clamp(c.happiness + Math.min(8, Math.round(amount/5000) + 2), 0, 100);
    if(c.creditScore !== undefined) c.creditScore = clamp(c.creditScore + 1, 300, 850);
    return `Donated ${fmt$(amount)}. Lifetime: ${fmt$(c.charityGiven)}.`;
  }

  // ── DEEPER FINANCE ─────────────────────────────────────────────
  function buyBonds(amount){
    const c=GS.char, inv=GS.inv;
    if(amount < 100) return 'Minimum $100.';
    if(c.checking < amount) return `Need ${fmt$(amount)}.`;
    c.checking -= amount;
    inv.bonds = (inv.bonds||0) + amount;
    return `Bought ${fmt$(amount)} in 5-yr Treasuries (~4.5%/yr).`;
  }
  function sellBonds(amount){
    const inv=GS.inv, c=GS.char;
    const a = Math.min(inv.bonds||0, amount);
    if(a <= 0) return 'No bonds to sell.';
    inv.bonds -= a; c.checking += a;
    return `Redeemed ${fmt$(a)} in bonds.`;
  }
  function buyIndex(amount){
    const c=GS.char, inv=GS.inv;
    if(c.checking < amount) return `Need ${fmt$(amount)}.`;
    c.checking -= amount;
    inv.indexFunds = (inv.indexFunds||0) + amount;
    return `Bought ${fmt$(amount)} in S&P 500 index fund.`;
  }
  function sellIndex(amount){
    const inv=GS.inv, c=GS.char;
    const a = Math.min(inv.indexFunds||0, amount);
    if(a <= 0) return 'No index funds to sell.';
    inv.indexFunds -= a; c.checking += a;
    return `Sold ${fmt$(a)} of index funds.`;
  }
  function tickBondsAndIndex(inv){
    if(!inv) return;
    inv.bonds = Math.round((inv.bonds||0) * (1 + 0.045/12));
    const baseRet = {normal:0.08, bull:0.14, bear:0.01, bubble:0.10, recession:-0.05}[inv.climate]||0.08;
    const r = baseRet + 0.18 * randn();
    inv.indexFunds = Math.max(0, Math.round((inv.indexFunds||0) * (1 + r/12)));
  }

  // Personal loans (separate from existing student debt / credit cards)
  function takeLoan(amount){
    const c=GS.char;
    const cs = c.creditScore || 580;
    const rate = cs>=750?0.06 : cs>=680?0.09 : cs>=620?0.13 : 0.20;
    const max = Math.round(((c.salary||30000) + 0.1*(c.savings||0)) * (cs>=720?2:1));
    if(amount > max) return `Max ${fmt$(max)} at credit ${cs}.`;
    c.checking += amount;
    c.personalLoan = (c.personalLoan||0) + amount;
    c.personalLoanRate = rate;
    return `Borrowed ${fmt$(amount)} at ${(rate*100).toFixed(1)}% APR.`;
  }
  function payLoan(amount){
    const c=GS.char;
    if((c.personalLoan||0) <= 0) return 'No active loans.';
    if(c.checking < amount) return `Need ${fmt$(amount)}.`;
    const pay = Math.min(amount, c.personalLoan);
    c.checking -= pay;
    c.personalLoan -= pay;
    if(c.personalLoan <= 0){
      c.creditScore = clamp((c.creditScore||580) + 12, 300, 850);
      return `Loan paid off! +12 credit.`;
    }
    return `Paid ${fmt$(pay)}. Balance: ${fmt$(c.personalLoan)}.`;
  }
  function tickLoan(c){
    if((c.personalLoan||0) <= 0) return;
    const interest = Math.round(c.personalLoan * (c.personalLoanRate||0.10) / 12);
    const minPay = Math.max(50, Math.round(c.personalLoan * 0.02));
    if(c.checking >= minPay){
      c.checking -= minPay;
      c.personalLoan = Math.max(0, c.personalLoan + interest - minPay);
    } else {
      c.personalLoan += interest;
      c.creditScore = clamp((c.creditScore||580) - 3, 300, 850);
    }
  }

  // Annual tax filing: charity write-off + audit chance
  function tickTaxFiling(c){
    if(c.monthAge % 12 !== 4) return; // April
    const year = GAME_START_YEAR + Math.floor((c.monthAge-264)/12);
    if(c.lastTaxYear === year) return;
    c.lastTaxYear = year;
    let msg = `Filed your ${year} taxes. `;
    if(c.charityGiven > 0){
      const deduct = Math.round(c.charityGiven * 0.22);
      c.checking += deduct;
      msg += `Charity write-off refund: ${fmt$(deduct)}. `;
    }
    const auditChance = 0.04 + (c.charityGiven > 50000 ? 0.04 : 0) + (c.salary > 500000 ? 0.04 : 0);
    if(pct(auditChance)){
      const owed = ri(2000, 15000);
      c.checking -= owed;
      msg += `⚠️ Audit triggered — back-taxes ${fmt$(owed)}. `;
    }
    inboxNow(c, {type:'news', icon:'🧾', subject:`Tax return ${year}`, date:currentMonthDate(c), body:msg});
  }

  // ── CAREER DEPTH ───────────────────────────────────────────────
  function tickHeadhunters(c){
    if(!c.employed || c.inSchool || c.injuryMonthsLeft > 0 || c.salary <= 0) return;
    if(!pct(0.04)) return;
    const bump = rf(0.10, 0.40);
    const newSal = Math.round(c.salary * (1 + bump));
    const company = pick(['Apex Industries','Verdant Holdings','Northwind Labs','Stellar Group','Helix Partners','Axiom Tech','Crestwood Co.']);
    const recruiter = pick(['Maya Chen','Jordan Patel','Amir Ross','Lena Park','Devon Hill']);
    c.headhunterCount++;
    inboxNow(c, {
      type:'news', icon:'📨', subject:`${company} wants to hire you`, date:currentMonthDate(c),
      body:`Hi ${(c.name.split(' ')[0])||c.name},\n\n${recruiter} from ${company}. We saw your work as ${c.jobTitle||'a professional'} and have an opening at ${fmt$(newSal)}/yr — ${(bump*100).toFixed(0)}% over your current.\n\nUse the Inbox to ACCEPT or COUNTER.\n\n— ${recruiter}`,
      extAction:{kind:'headhunter', salary:newSal, company, bump},
    });
  }
  function acceptHeadhunter(action){
    const c=GS.char;
    c.salary = action.salary;
    c.yearsAtJob = 0;
    c.jobTitle = `${(c.jobTitle||'Specialist')} @ ${action.company}`;
    c.bossMorale = ri(60, 75);
    c.bossName = pick(['Alex Mercer','Dana Rhodes','Sam Whitaker']);
    logScrap(c, `Joined ${action.company} (${fmt$(c.salary)}/yr)`, 'good');
    return `Accepted! Now at ${action.company}, ${fmt$(c.salary)}/yr.`;
  }
  function counterHeadhunter(action){
    const c=GS.char;
    if(pct(0.55 + (c.bossMorale||60)/200)){
      const newSal = Math.round((c.salary + action.salary)/2);
      c.salary = newSal;
      return `Counter accepted! New salary: ${fmt$(newSal)}/yr.`;
    }
    c.bossMorale = clamp((c.bossMorale||60) - 8, 0, 100);
    return `Counter rejected. Boss is annoyed (-morale).`;
  }

  // Add HR/lawsuit/fire/etc downsides if not already
  if(typeof DOWNSIDES !== 'undefined' && Array.isArray(DOWNSIDES)){
    const existing = new Set(DOWNSIDES.map(d=>d.subject));
    const adds = [
      {icon:'⚖️',cat:'legal',subject:'Lawsuit Served',body:'A former contractor filed suit alleging unpaid invoices.',apply:c=>ri(2000,12000)},
      {icon:'🏢',cat:'legal',subject:'HR Complaint',body:'A workplace dispute escalated. HR mediation cost a settlement.',apply:c=>{c.happiness=clamp(c.happiness-8,0,100);return ri(1500,8000);}},
      {icon:'🔥',cat:'fire',subject:'House Fire',body:'Electrical fire caused major damage to your living space.',apply:c=>{c.happiness=clamp(c.happiness-10,0,100);return ri(5000,40000);}},
      {icon:'💥',cat:'auto',subject:'Major Car Accident',body:'Collision at an intersection — repairs and rental.',apply:c=>{c.health=clamp(c.health-ri(3,12),0,100);return ri(1500,9000);}},
      {icon:'🦹',cat:'home',subject:'Home Burglary',body:'Forced entry. Stolen electronics and a mess to clean.',apply:c=>{c.happiness=clamp(c.happiness-5,0,100);return ri(800,7000);}},
    ];
    for(const a of adds){ if(!existing.has(a.subject)) DOWNSIDES.push(a); }
  }

  // ── SPORTS DEPTH ───────────────────────────────────────────────
  function tickSportsAwards(c){
    if(!isAthlete(c) || c.injuryMonthsLeft > 0) return;
    if(c.monthAge % 12 !== 6) return;
    if(!pct(0.10 + (c.performance||50)/300)) return;
    const award = pick(['MVP','Rookie of the Year','All-Star','Defensive Player of the Year','Golden Boot','Comeback Player','League Scoring Title']);
    const bonus = ri(50000, 500000);
    c.checking += bonus;
    c.careerAwards.push({year: GAME_START_YEAR + Math.floor((c.monthAge-264)/12), award, sport:c.jobTitle});
    inboxNow(c, {type:'news', icon:'🏆', subject:`Award: ${award}`, date:currentMonthDate(c),
      body:`Voted ${award} this season! Bonus payout: ${fmt$(bonus)}. Endorsement value rises.`});
    logScrap(c, `${award} (${c.jobTitle})`, 'gold');
  }
  function tickInjury(c){
    if(c.injuryMonthsLeft > 0){
      c.injuryMonthsLeft--;
      if(c.injuryMonthsLeft === 0){
        inboxNow(c, {type:'news', icon:'💪', subject:'Cleared for return', date:currentMonthDate(c),
          body:`Doctors cleared you to return after ${c.injuryReason||'injury'} rehab.`});
        c.injuryReason = '';
      }
      return;
    }
    if(!isAthlete(c)) return;
    if(pct(0.012)){
      const months = ri(2,8);
      const reason = pick(['ACL tear','hamstring strain','concussion','broken hand','shoulder dislocation','high ankle sprain','torn meniscus']);
      c.injuryMonthsLeft = months;
      c.injuryReason = reason;
      const cost = Math.round((c.salary||0) * months / 12 * 0.4);
      c.checking -= cost;
      inboxNow(c, {type:'news', icon:'🚑', subject:`Injury: ${reason}`, date:currentMonthDate(c),
        body:`You suffered a ${reason}. Expected rehab: ${months} months. Lost earnings: ${fmt$(cost)}.`});
      logScrap(c, `Injury: ${reason} (${months}mo)`, 'bad');
    }
  }
  function tickTradeDemand(c){
    if(!isAthlete(c) || !c.sportsTeam) return;
    if(!pct(0.01)) return;
    inboxNow(c, {type:'news', icon:'🔄', subject:'Trade rumors swirl', date:currentMonthDate(c),
      body:`Outlets report your team is exploring trades; a contender is interested. Use Inbox to demand a trade.`,
      extAction:{kind:'trade'}});
  }
  function honorHoF(c){
    if(c.hofMember) return;
    if(c.careerAwards.length >= 3 && (c.age >= 38 || !isAthlete(c))){
      c.hofMember = true;
      inboxNow(c, {type:'news', icon:'🏛️', subject:'Hall of Fame induction', date:currentMonthDate(c),
        body:`Voters elected you to the Hall of Fame. ${c.careerAwards.length} career awards.`});
      logScrap(c, 'Hall of Fame inducted', 'gold');
    }
  }
  function tickPostRetireSports(c){
    if(c.employed) return;
    if(!c.careerAwards.length) return;
    if(c.coachingCareer || c.broadcasting) return;
    if(c.age < 35 || c.age > 65) return;
    if(!pct(0.04)) return;
    inboxNow(c, {type:'news', icon:'🎙️', subject:'Post-playing offers', date:currentMonthDate(c),
      body:`Networks and franchises are calling about post-playing roles:\n• Coach: $200k–$1.2M/yr\n• Broadcaster: $150k–$800k/yr\n\nVisit Public → Career Encore to accept.`});
  }
  function acceptCoaching(){
    const c=GS.char;
    if(c.employed) return 'Quit your current job first.';
    const sal = ri(200000, 1200000);
    c.coachingCareer = {role:'Head Coach', team: pick(['Hometown Heroes','Coastal Wave','Mountain Peaks','Capital United']), salary:sal, years:0};
    c.employed = true; c.jobId = 'team_coach';
    c.jobTitle = `Head Coach, ${c.coachingCareer.team}`;
    c.salary = sal;
    return `Now coaching ${c.coachingCareer.team} for ${fmt$(sal)}/yr.`;
  }
  function acceptBroadcasting(){
    const c=GS.char;
    if(c.employed) return 'Quit your current job first.';
    const sal = ri(150000, 800000);
    c.broadcasting = {network: pick(['ESPN','TNT','Fox Sports','Sky']), salary:sal, years:0};
    c.employed = true; c.jobId = 'broadcaster';
    c.jobTitle = `Analyst, ${c.broadcasting.network}`;
    c.salary = sal;
    return `Joined ${c.broadcasting.network} broadcasting for ${fmt$(sal)}/yr.`;
  }
  function tickNationalTeam(c){
    if(!isAthlete(c)) return;
    if(c.monthAge % 24 !== 12) return;
    if(!pct(0.25 + (c.performance||50)/400)) return;
    c.nationalTeamCalls++;
    const event = pick(['World Cup','Olympics','Continental Championship','International Friendly Tour']);
    const stipend = ri(50000, 500000);
    c.checking += stipend;
    inboxNow(c, {type:'news', icon:'🌍', subject:`National team callup: ${event}`, date:currentMonthDate(c),
      body:`Selected to represent your country at the ${event}. Stipend ${fmt$(stipend)}. Calls so far: ${c.nationalTeamCalls}.`});
    logScrap(c, `National team: ${event}`, 'gold');
  }

  // ── BUSINESS DEPTH ─────────────────────────────────────────────
  function ipoBusiness(idx){
    const inv=GS.inv, c=GS.char;
    const b = (inv.businesses||[])[idx];
    if(!b) return 'No business.';
    if(b.ipo) return 'Already public.';
    if(b.value < 5000000) return 'Need $5M+ valuation to IPO.';
    const proceeds = Math.round(b.value * 0.4);
    c.checking += proceeds;
    b.ipo = true;
    b.value = Math.round(b.value * 0.7);
    logScrap(c, `IPO'd ${b.name} (${fmt$(proceeds)})`, 'gold');
    return `IPO! Raised ${fmt$(proceeds)}, retained controlling stake.`;
  }
  function acquireCompetitor(idx){
    const inv=GS.inv, c=GS.char;
    const b = (inv.businesses||[])[idx];
    if(!b) return 'No business.';
    const cost = Math.round(b.value * 0.6);
    if(c.checking < cost) return `Need ${fmt$(cost)} for acquisition.`;
    c.checking -= cost;
    b.value = Math.round(b.value * 1.5);
    if(b.profit) b.profit = Math.round(b.profit * 1.4);
    return `Acquired competitor for ${fmt$(cost)}. Value +50%, profit +40%.`;
  }
  function franchiseBusiness(idx){
    const inv=GS.inv, c=GS.char;
    const b = (inv.businesses||[])[idx];
    if(!b) return 'No business.';
    if(b.value < 1000000) return 'Need $1M+ business to franchise.';
    const setupCost = 100000;
    if(c.checking < setupCost) return `Need ${fmt$(setupCost)} setup cost.`;
    c.checking -= setupCost;
    b.franchiseCount = (b.franchiseCount||0) + 1;
    return `Opened franchise location #${b.franchiseCount}. Royalty stream begins.`;
  }
  function pivotBusiness(idx){
    const inv=GS.inv;
    const b = (inv.businesses||[])[idx];
    if(!b) return 'No business.';
    if(b.pivoted) return 'Already pivoted (one per business).';
    b.pivoted = true;
    b.value = Math.round(b.value * 0.5);
    if(b.profit) b.profit = 0;
    return `Pivoted (50% value haircut, profit reset).`;
  }
  function tickFranchiseRoyalty(inv, c){
    for(const b of (inv.businesses||[])){
      if(b.franchiseCount && c.monthAge % 12 === 0){
        const royalty = b.franchiseCount * ri(20000, 80000);
        c.checking += royalty;
      }
    }
  }

  // ── LIFESTYLE ──────────────────────────────────────────────────
  function travel(idx){
    const c=GS.char, inv=GS.inv;
    const city = CITIES[idx];
    if(!city) return 'Pick a city.';
    if(c.checking < city.cost) return `Need ${fmt$(city.cost)}.`;
    c.checking -= city.cost;
    c.happiness = clamp(c.happiness + city.joy, 0, 100);
    if(city.buff === 'wellness') c.health = clamp(c.health + 5, 0, 100);
    if(city.buff === 'culture') c.smarts = clamp(c.smarts + 2, 0, 100);
    inv.travels.push({name:city.name, year: GAME_START_YEAR + Math.floor((c.monthAge-264)/12)});
    logScrap(c, `Traveled to ${city.name}`, 'good');
    return `Traveled to ${city.emoji} ${city.name}! +${city.joy} happiness.`;
  }
  function buyHobby(idx){
    const c=GS.char, inv=GS.inv;
    const h = HOBBY_CATALOG[idx]; if(!h) return 'Pick a hobby.';
    if(c.checking < h.cost) return `Need ${fmt$(h.cost)}.`;
    c.checking -= h.cost;
    inv.hobbies.push({emoji:h.emoji, name:h.name, base:h.cost, value:h.cost, apprY:h.apprY, vol:h.vol, ageY:0});
    return `Acquired ${h.emoji} ${h.name} for ${fmt$(h.cost)}.`;
  }
  function sellHobby(idx){
    const c=GS.char, inv=GS.inv;
    const h = (inv.hobbies||[])[idx]; if(!h) return 'Pick a hobby.';
    inv.hobbies.splice(idx, 1);
    c.checking += h.value;
    return `Sold ${h.name} at auction for ${fmt$(h.value)}.`;
  }
  function tickHobbies(inv){
    for(const h of (inv.hobbies||[])){
      const monthly = h.apprY/12 + (randn() * h.vol / 12);
      h.value = Math.max(Math.round(h.base * 0.4), Math.round(h.value * (1 + monthly)));
      h.ageY += 1/12;
    }
  }
  function casinoPlay(amount){
    const c=GS.char;
    if(c.checking < amount) return `Need ${fmt$(amount)}.`;
    c.checking -= amount;
    const r = Math.random();
    if(r < 0.005){ const win = amount * 100; c.checking += win; logScrap(c, `Casino jackpot ${fmt$(win)}`, 'gold'); return `🎰 JACKPOT! Won ${fmt$(win)}.`; }
    if(r < 0.10){ const win = amount * 5; c.checking += win; return `Big win! +${fmt$(win)}.`; }
    if(r < 0.43){ const win = Math.round(amount * 1.6); c.checking += win; return `Won ${fmt$(win)}.`; }
    return `Lost ${fmt$(amount)}.`;
  }

  // ── PUBLIC LIFE: Politics + Influencer ─────────────────────────
  function runForOffice(idx){
    const c=GS.char, inv=GS.inv;
    const step = POL_LADDER[idx];
    if(!step) return 'Pick an office.';
    const nw = calcNetWorth(c, inv);
    if(nw < step.nwReq) return `Need ${fmt$(step.nwReq)} net worth.`;
    if(c.checking < step.cost) return `Campaign costs ${fmt$(step.cost)} upfront.`;
    if(c.politicalApproval < step.approvalReq) return `Need ${step.approvalReq}% approval (currently ${c.politicalApproval}%).`;
    c.checking -= step.cost;
    if(pct(0.4 + (c.politicalApproval - 50)/200)){
      c.politicalRank = step.rank;
      c.politicalSalary = step.sal;
      c.politicalApproval = clamp(c.politicalApproval + 10, 0, 100);
      logScrap(c, `Elected ${step.title}`, 'gold');
      return `🏛️ Elected ${step.title}! Salary +${fmt$(step.sal)}/yr.`;
    }
    c.politicalApproval = clamp(c.politicalApproval - 5, 0, 100);
    return `Lost the race for ${step.title}. -approval, -${fmt$(step.cost)}.`;
  }
  function tickPolitics(c){
    if(c.politicalRank === 'none') return;
    if(c.monthAge % 12 === 0){
      c.checking += c.politicalSalary;
      c.politicalApproval = clamp(c.politicalApproval + ri(-8, 6), 0, 100);
      if(c.politicalApproval < 25 && pct(0.3)){
        inboxNow(c, {type:'news', icon:'📰', subject:'Approval ratings collapse', date:currentMonthDate(c),
          body:`Approval at ${c.politicalApproval}%. Calls for resignation grow louder.`});
      }
    }
  }
  function setInfluencer(active, cadence){
    const c=GS.char;
    c.influencerActive = active;
    if(cadence) c.influencerCadence = cadence;
    return active ? `Posting ${c.influencerCadence}.` : 'Stopped posting.';
  }
  function tickInfluencer(c){
    if(!c.influencerActive) return;
    const rate = c.influencerCadence === 'grind' ? 1.04 : 1.015;
    const seed = Math.max(100, c.followers || 100);
    c.followers = Math.max(0, Math.round(seed * rate + ri(-50, 200)));
    if(c.influencerCadence === 'grind') c.happiness = clamp(c.happiness - 0.5, 0, 100);
    const revenue = Math.round((c.followers || 0) * 0.005);
    c.checking += revenue;
    if((c.followers || 0) > 1000000 && pct(0.015)){
      const deal = ri(50000, 500000);
      c.checking += deal;
      inboxNow(c, {type:'news', icon:'📱', subject:'Brand deal', date:currentMonthDate(c),
        body:`A brand paid ${fmt$(deal)} for a sponsored post.`});
    }
  }

  // ── RANDOM WINDFALLS ───────────────────────────────────────────
  function tickWindfalls(c){
    if(pct(0.005)){
      const amt = ri(20000, 1500000);
      c.checking += amt;
      inboxNow(c, {type:'news', icon:'📜', subject:'Letter from a lawyer', date:currentMonthDate(c),
        body:`We represent the estate of a distant relative. After probate, you've been allocated ${fmt$(amt)}.`});
      logScrap(c, `Inheritance: ${fmt$(amt)}`, 'good');
    }
    if(pct(0.0008)){
      const lottery = ri(5000, 25000000);
      c.checking += lottery - 5;
      inboxNow(c, {type:'news', icon:'🎟️', subject:'You won the lottery!', date:currentMonthDate(c),
        body:`Prize: ${fmt$(lottery)} (after the $5 ticket).`});
      logScrap(c, `Lottery: ${fmt$(lottery)}`, 'good');
    }
  }

  // ── SAVE SLOTS ─────────────────────────────────────────────────
  const SLOT_KEY = 'finlife_slots_v1';
  function listSlots(){
    try{ return JSON.parse(localStorage.getItem(SLOT_KEY))||{}; } catch(e){ return {}; }
  }
  function saveToSlot(name){
    const slots = listSlots();
    slots[name] = {char:GS.char, inv:GS.inv, nwHistory:GS.nwHistory, inbox:GS.inbox, billAccum:GS.billAccum, savedAt:Date.now()};
    try{ localStorage.setItem(SLOT_KEY, JSON.stringify(slots)); return `Saved to "${name}".`; }
    catch(e){ return 'Save failed (storage).'; }
  }
  function loadFromSlot(name){
    const slots = listSlots();
    const s = slots[name];
    if(!s) return 'No save under that name.';
    GS.char = s.char; GS.inv = s.inv; GS.nwHistory = s.nwHistory||[]; GS.inbox = s.inbox||[]; GS.billAccum = s.billAccum||[];
    ensureExtras(GS.char, GS.inv);
    updateUI(null, GS.nwHistory[GS.nwHistory.length-2]||0, calcNetWorth(GS.char, GS.inv));
    renderExtras();
    return `Loaded "${name}".`;
  }
  function deleteSlot(name){
    const slots = listSlots();
    delete slots[name];
    try{ localStorage.setItem(SLOT_KEY, JSON.stringify(slots)); return `Deleted "${name}".`; } catch(e){ return 'Delete failed.'; }
  }

  // ── NG+ ────────────────────────────────────────────────────────
  function startNGPlus(){
    const c = GS.char;
    const peakNW = c ? calcNetWorth(c, GS.inv) : 0;
    const inheritedKids = Math.round(peakNW * (c?c.willPctKids/100:0)) || 0;
    const startCash = Math.min(5000000, Math.max(0, Math.round(inheritedKids * 0.01)));
    const heirName = c ? `${(c.name.split(' ')[0])||c.name} Jr.` : 'New Player';
    const newGen = (c?c.ngGeneration:0) + 1;
    GS.scenario = startCash > 1000000 ? 'rich' : startCash > 50000 ? 'middle' : 'broke';
    GS.char = createChar(heirName, GS.scenario);
    GS.char.checking = Math.max(GS.char.checking, startCash);
    GS.char.ngGeneration = newGen;
    GS.inv = createInvState();
    GS.nwHistory = [calcNetWorth(GS.char, GS.inv)];
    GS.inbox = [];
    GS.billAccum = [];
    GS.pendingEvents = [];
    ensureExtras(GS.char, GS.inv);
    showScreen('game');
    renderExtras();
    updateUI(null, 0, calcNetWorth(GS.char, GS.inv));
    showToast(`NG+ Generation ${newGen} — inherited ${fmt$(startCash)}`);
  }

  // ── BUTTON INJECTION ───────────────────────────────────────────
  function injectButtons(){
    const grid = document.querySelector('.actions-grid');
    if(!grid) return;
    if(document.getElementById('btn-family')) return;
    const inboxBtn = document.getElementById('btn-inbox');
    const make = (id, cls, label, icon) => {
      const b = document.createElement('button');
      b.className = `act-btn ${cls}`; b.id = id;
      b.innerHTML = `<span class="aico">${icon}</span>${label}`;
      grid.insertBefore(b, inboxBtn);
      return b;
    };
    make('btn-family',  'fam',     'Family',    '💞');
    make('btn-loans',   'loans',   'Loans',     '💸');
    make('btn-life',    'life',    'Lifestyle', '✈️');
    make('btn-public',  'public',  'Public',    '🏛️');
    make('btn-menu',    'menu',    'Menu',      '⚙️');

    const css = document.createElement('style');
    css.textContent = `
      .act-btn.fam{border-color:#f48fb1;color:#f48fb1}
      .act-btn.loans{border-color:#ff8a80;color:#ff8a80}
      .act-btn.life{border-color:#80deea;color:#80deea}
      .act-btn.public{border-color:#b39ddb;color:#b39ddb}
      .act-btn.menu{border-color:var(--gold);color:var(--gold)}
      .ext-pill{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;background:var(--bg3);border:1px solid var(--border);margin-right:4px;margin-top:3px}
      .ext-pill.gold{border-color:var(--gold);color:var(--gold)}
      .ext-pill.green{border-color:var(--green);color:var(--green)}
      .ext-pill.red{border-color:var(--red);color:var(--red)}
      .scrap-row{display:flex;gap:8px;align-items:flex-start;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:11px}
      .scrap-age{color:var(--muted);min-width:50px;text-align:right;font-variant-numeric:tabular-nums}
      .scrap-text{flex:1}
      .scrap-text.gold{color:var(--gold)}
      .scrap-text.bad{color:var(--red)}
      .scrap-text.good{color:var(--green)}
    `;
    document.head.appendChild(css);

    document.getElementById('btn-family').onclick = openFamilyModal;
    document.getElementById('btn-loans').onclick = openLoansModal;
    document.getElementById('btn-life').onclick = openLifestyleModal;
    document.getElementById('btn-public').onclick = openPublicModal;
    document.getElementById('btn-menu').onclick = openMenuModal;
  }

  // ── MODALS ─────────────────────────────────────────────────────
  function openFamilyModal(){
    const c = GS.char;
    const desc = `Spouse: ${c.spouseName||'—'} · Kids: ${c.kids} · Pet: ${c.pet?c.pet.emoji+' '+c.pet.name:'—'} · Friends: ${c.friends.length} · Charity: ${fmt$(c.charityGiven)} · Will: ${c.willPctKids}%→kids`;
    const choices = [
      {header:'Children'},
      {text:`👶 Try for a child (need spouse · $8,000)`, fn: tryForChild},
      {header:'Pet'},
      ...(c.pet ? [{text:`💔 Say goodbye to ${c.pet.name}`, fn(){ const n=c.pet.name; c.pet=null; c.happiness=clamp(c.happiness-6,0,100); return `Said goodbye to ${n}.`;}}] :
        PET_SPECIES.map((sp,i)=>({
          text:`${sp.emoji} Adopt ${sp.name} — ${fmt$(sp.cost)} (~${Math.round(sp.life/12)}y, ${fmt$(sp.upkeep)}/mo)`,
          fn(){ return adoptPet(i, 'Buddy'); }
        }))),
      {header:'Friends'},
      {text:'🤝 Make a new friend', fn: makeFriend},
      ...c.friends.map(f=>({text:`👋 Hang out with ${f.name} ($200) — closeness ${f.closeness}%`, fn(){ if(c.checking<200)return 'Need $200.'; c.checking-=200; f.closeness=clamp(f.closeness+10,0,100); return `Hung out with ${f.name}. +closeness.`;}})),
      {header:'Charity'},
      ...[1000,10000,100000,1000000].map(amt=>({text:`❤️ Donate ${fmt$(amt)}`, fn(){ return donate(amt); }})),
      {header:'Will & Estate'},
      ...[0,25,50,75,100].map(p=>({text:`Will: ${p}% to kids${c.willPctKids===p?' ✓':''}`, fn(){ return setWillKids(p); }})),
    ];
    showActionModal('Family & Estate', desc, choices);
  }

  function openLoansModal(){
    const c=GS.char, inv=GS.inv;
    const cs = c.creditScore||580;
    const rate = cs>=750?6 : cs>=680?9 : cs>=620?13 : 20;
    const desc = `Credit ${cs} · Loan rate ${rate}% APR · Loan ${fmt$(c.personalLoan||0)} · Bonds ${fmt$(inv.bonds||0)} · Index ${fmt$(inv.indexFunds||0)}`;
    const choices = [
      {header:'Personal loans'},
      ...[5000,25000,100000,500000].map(amt=>({text:`Borrow ${fmt$(amt)}`, fn(){ return takeLoan(amt); }})),
      ...[1000,5000,25000].map(amt=>({text:`Pay ${fmt$(amt)} on loan`, fn(){ return payLoan(amt); }})),
      {header:'Bonds (5-yr Treasury, ~4.5%/yr)'},
      ...[1000,10000,100000].map(amt=>({text:`Buy ${fmt$(amt)} bonds`, fn(){ return buyBonds(amt); }})),
      {text:`Sell all bonds`, fn(){ return sellBonds(inv.bonds||0); }},
      {header:'Index funds (S&P 500)'},
      ...[1000,10000,100000].map(amt=>({text:`Buy ${fmt$(amt)} index`, fn(){ return buyIndex(amt); }})),
      {text:`Sell all index funds`, fn(){ return sellIndex(inv.indexFunds||0); }},
    ];
    showActionModal('Loans & Fixed-Income', desc, choices);
  }

  function openLifestyleModal(){
    const c=GS.char, inv=GS.inv;
    const desc = `Health ${Math.round(c.health)} · Hobbies ${fmt$((inv.hobbies||[]).reduce((s,h)=>s+h.value,0))} · Travels ${(inv.travels||[]).length}`;
    const choices = [
      {header:'Health'},
      {text:`💉 Doctor checkup ($250)`, fn: doCheckup},
      {text:`🏥 Elective surgery ($8k–$25k)`, fn: doSurgery},
      {header:'Travel'},
      ...CITIES.map((ct,i)=>({text:`${ct.emoji} ${ct.name} — ${fmt$(ct.cost)} (+${ct.joy} happy)`, fn(){ return travel(i); }})),
      {header:'Hobbies — buy'},
      ...HOBBY_CATALOG.map((h,i)=>({text:`${h.emoji} ${h.name} — ${fmt$(h.cost)} (~${Math.round(h.apprY*100)}%/yr)`, fn(){ return buyHobby(i); }})),
      ...((inv.hobbies||[]).map((h,i)=>({text:`💰 Sell ${h.emoji} ${h.name} — now ${fmt$(h.value)} (paid ${fmt$(h.base)})`, fn(){ return sellHobby(i); }}))),
      {header:'Casino & lottery'},
      ...[100,1000,10000].map(amt=>({text:`🎰 Gamble ${fmt$(amt)}`, fn(){ return casinoPlay(amt); }})),
    ];
    showActionModal('Lifestyle', desc, choices);
  }

  function openPublicModal(){
    const c=GS.char;
    const desc = `Office: ${c.politicalRank==='none'?'private citizen':c.politicalRank} · Approval ${c.politicalApproval}% · Followers ${(c.followers||0).toLocaleString()}${c.influencerActive?' ('+c.influencerCadence+')':''} · Awards ${c.careerAwards.length}${c.hofMember?' · 🏛️ HoF':''}`;
    const choices = [
      {header:'Politics'},
      ...POL_LADDER.map((step,i)=>({text:`Run for ${step.title} — cost ${fmt$(step.cost)} (need ${fmt$(step.nwReq)} NW${step.approvalReq?', '+step.approvalReq+'%':''})`, fn(){ return runForOffice(i); }})),
      {header:'Influencer'},
      {text:c.influencerActive&&c.influencerCadence==='casual'?'✓ Casual posting':'📱 Post casually', fn(){ return setInfluencer(true,'casual'); }},
      {text:c.influencerActive&&c.influencerCadence==='grind'?'✓ Grind mode':'🚀 Grind mode (-happiness, faster)', fn(){ return setInfluencer(true,'grind'); }},
      {text:c.influencerActive?'⏸️ Stop posting':'⏸️ (Not posting)', fn(){ return setInfluencer(false); }},
      {header:'Career encore (post-playing)'},
      {text:'🎙️ Become a broadcaster', fn: acceptBroadcasting},
      {text:'🏃 Become a coach', fn: acceptCoaching},
    ];
    showActionModal('Public Life', desc, choices);
  }

  function openMenuModal(){
    const c=GS.char;
    const slots = listSlots();
    const slotNames = Object.keys(slots);
    const desc = `Generation ${c.ngGeneration||0} · Saves: ${slotNames.length} · Scrapbook: ${(c.scrapbook||[]).length} entries`;
    const choices = [
      {header:'Save slots'},
      {text:`💾 Save to "Slot ${slotNames.length+1}"`, fn(){ return saveToSlot('Slot '+(slotNames.length+1)); }},
      ...slotNames.map(n=>({text:`📂 Load "${n}" (${new Date(slots[n].savedAt).toLocaleDateString()})`, fn(){ return loadFromSlot(n); }})),
      ...slotNames.map(n=>({text:`🗑️ Delete "${n}"`, fn(){ return deleteSlot(n); }})),
      {header:'Scrapbook'},
      {text:'📖 View life timeline', fn: openScrapbookModal},
      {header:'Game'},
      {text:'⏭️ Start NG+ as your heir', fn(){ startNGPlus(); return 'NG+ started.'; }},
    ];
    showActionModal('Menu', desc, choices);
  }

  function openScrapbookModal(){
    const c=GS.char;
    const sb = c.scrapbook||[];
    const lines = sb.length ? sb.slice().reverse().map(s=>`<div class="scrap-row"><div class="scrap-age">${s.age||s.year}</div><div class="scrap-text ${s.kind||'info'}">${s.text}</div></div>`).join('') : '<div style="color:var(--muted)">No entries yet — live a little!</div>';
    const overlay=$('modal-overlay');
    $('m-icon').textContent='📖';
    $('m-tag').textContent='Life Timeline'; $('m-tag').className='modal-tag mil';
    $('m-title').textContent='Scrapbook';
    $('m-body').innerHTML = `<div style="text-align:left;max-height:50vh;overflow-y:auto">${lines}</div>`;
    $('m-result').style.display='none';
    $('m-choices').innerHTML = '<button class="choice-btn" onclick="closeModal()">Close</button>';
    overlay.classList.add('open');
  }

  // ── RENDER LIFE-TAB EXTRAS ─────────────────────────────────────
  function renderExtras(){
    const c=GS.char, inv=GS.inv;
    if(!c) return;
    let host = document.getElementById('extras-section');
    if(!host){
      const tab = document.getElementById('tab-life');
      if(!tab) return;
      host = document.createElement('div');
      host.id = 'extras-section';
      host.className = 'section';
      tab.appendChild(host);
    }
    const pet = c.pet ? `<span class="ext-pill">${c.pet.emoji} ${c.pet.name} (${(c.pet.ageMonths/12).toFixed(1)}y)</span>` : '';
    const inj = c.injuryMonthsLeft>0 ? `<span class="ext-pill red">🤕 ${c.injuryReason} (${c.injuryMonthsLeft}mo)</span>` : '';
    const hof = c.hofMember ? `<span class="ext-pill gold">🏛️ HoF</span>` : '';
    const pol = c.politicalRank!=='none' ? `<span class="ext-pill gold">${c.politicalRank} (${c.politicalApproval}%)</span>` : '';
    const inf = c.influencerActive ? `<span class="ext-pill">📱 ${(c.followers||0).toLocaleString()} followers</span>` : '';
    const ng  = (c.ngGeneration||0) > 0 ? `<span class="ext-pill gold">Gen ${c.ngGeneration}</span>` : '';
    const loan = (c.personalLoan||0) > 0 ? `<span class="ext-pill red">Loan ${fmt$(c.personalLoan)}</span>` : '';
    const bonds = (inv && inv.bonds||0) > 0 ? `<span class="ext-pill green">Bonds ${fmt$(inv.bonds)}</span>` : '';
    const idx   = (inv && inv.indexFunds||0) > 0 ? `<span class="ext-pill green">Index ${fmt$(inv.indexFunds)}</span>` : '';
    const hob = (inv && inv.hobbies||[]).length ? `<span class="ext-pill">🎨 ${inv.hobbies.length} hobbies (${fmt$(inv.hobbies.reduce((s,h)=>s+h.value,0))})</span>` : '';
    const charity = c.charityGiven ? `<span class="ext-pill green">❤️ ${fmt$(c.charityGiven)} given</span>` : '';
    const friends = c.friends.length ? `<span class="ext-pill">🤝 ${c.friends.length} friends</span>` : '';
    const awards = c.careerAwards.length ? `<span class="ext-pill gold">🏆 ${c.careerAwards.length} awards</span>` : '';
    const natl = c.nationalTeamCalls ? `<span class="ext-pill">🌍 ${c.nationalTeamCalls} natl calls</span>` : '';
    const coach = c.coachingCareer ? `<span class="ext-pill gold">🏃 ${c.coachingCareer.team}</span>` : '';
    const cast = c.broadcasting ? `<span class="ext-pill gold">🎙️ ${c.broadcasting.network}</span>` : '';
    host.innerHTML = `<h3>Life Extras</h3><div>${[pet,inj,hof,pol,inf,ng,loan,bonds,idx,hob,charity,friends,awards,natl,coach,cast].filter(Boolean).join(' ')||'<span style="color:var(--muted);font-size:11px">Visit Family / Loans / Lifestyle / Public to begin.</span>'}</div>`;
  }

  // ── PATCH calcNetWorth to include new assets/liabilities ───────
  const _origCalcNW = window.calcNetWorth;
  window.calcNetWorth = function(char, inv){
    const base = _origCalcNW(char, inv);
    const bondsV = (inv && inv.bonds)||0;
    const idxV = (inv && inv.indexFunds)||0;
    const hobV = ((inv && inv.hobbies)||[]).reduce((s,h)=>s+h.value, 0);
    const loan = (char && char.personalLoan)||0;
    return base + bondsV + idxV + hobV - loan;
  };

  // ── PATCH openInboxItem to render Accept/Counter buttons ───────
  const _origOpenInbox = window.openInboxItem;
  if(typeof _origOpenInbox === 'function'){
    window.openInboxItem = function(id){
      _origOpenInbox(id);
      const item = (GS.inbox||[]).find(i=>i.id===id);
      if(!item || !item.extAction) return;
      const a = item.extAction;
      const ch = $('m-choices');
      const extra = document.createElement('div');
      extra.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin-bottom:6px';
      if(a.kind === 'headhunter'){
        extra.innerHTML = `
          <button class="choice-btn" id="ext-accept" style="background:linear-gradient(135deg,#4caf50,#2e7d32);color:#fff;font-weight:700">✅ Accept ${fmt$(a.salary)}/yr</button>
          <button class="choice-btn" id="ext-counter">⚖️ Counter-offer (use as leverage)</button>`;
        ch.insertBefore(extra, ch.firstChild);
        document.getElementById('ext-accept').onclick = ()=>{
          const msg = acceptHeadhunter(a);
          item.extAction = null;
          $('m-result').style.display='block'; $('m-result').textContent = msg;
          ch.innerHTML = '<button class="choice-btn" onclick="showInboxModal()">← Back to Inbox</button>';
          renderExtras();
        };
        document.getElementById('ext-counter').onclick = ()=>{
          const msg = counterHeadhunter(a);
          item.extAction = null;
          $('m-result').style.display='block'; $('m-result').textContent = msg;
          ch.innerHTML = '<button class="choice-btn" onclick="showInboxModal()">← Back to Inbox</button>';
        };
      } else if(a.kind === 'trade'){
        extra.innerHTML = `<button class="choice-btn" id="ext-trade" style="background:linear-gradient(135deg,#1976d2,#0d47a1);color:#fff;font-weight:700">🔄 Demand a trade (+15% salary)</button>`;
        ch.insertBefore(extra, ch.firstChild);
        document.getElementById('ext-trade').onclick = ()=>{
          GS.char.sportsTeam = pick(['Coastal Wave','Mountain Peaks','Northbridge United','Capital City FC']);
          GS.char.salary = Math.round(GS.char.salary * 1.15);
          item.extAction = null;
          $('m-result').style.display='block'; $('m-result').textContent = `Traded to ${GS.char.sportsTeam}, +15% salary.`;
          ch.innerHTML = '<button class="choice-btn" onclick="showInboxModal()">← Back to Inbox</button>';
        };
      }
    };
  }

  // ── PATCH renderBusinessTab to add IPO/Acquire/Franchise/Pivot ─
  const _origRenderBiz = window.renderBusinessTab;
  if(typeof _origRenderBiz === 'function'){
    window.renderBusinessTab = function(){
      _origRenderBiz();
      const list = document.getElementById('biz-tab-list');
      if(!list) return;
      const inv = GS.inv;
      const bizs = (inv && inv.businesses)||[];
      if(!bizs.length) return;
      const wrap = document.createElement('div');
      wrap.style.cssText = 'margin-top:8px;display:flex;flex-direction:column;gap:6px';
      bizs.forEach((b, i) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:6px';
        const head = `<div style="flex-basis:100%;font-size:11px;color:var(--muted);margin-bottom:3px"><b style="color:var(--gold)">${b.name||('Business '+i)}</b> · adv. options${b.ipo?' · 📈 PUBLIC':''}${b.franchiseCount?' · '+b.franchiseCount+' franchises':''}${b.pivoted?' · pivoted':''}</div>`;
        const btns = `
          <button class="choice-btn" data-bizact="ipo" data-idx="${i}" style="flex:1;min-width:110px;padding:6px 8px;font-size:11px">📈 IPO ${b.ipo?'✓':''}</button>
          <button class="choice-btn" data-bizact="acq" data-idx="${i}" style="flex:1;min-width:110px;padding:6px 8px;font-size:11px">🎯 Acquire</button>
          <button class="choice-btn" data-bizact="frn" data-idx="${i}" style="flex:1;min-width:110px;padding:6px 8px;font-size:11px">🏪 Franchise (${b.franchiseCount||0})</button>
          <button class="choice-btn" data-bizact="piv" data-idx="${i}" style="flex:1;min-width:110px;padding:6px 8px;font-size:11px">🔀 Pivot ${b.pivoted?'✓':''}</button>
        `;
        row.innerHTML = head + btns;
        wrap.appendChild(row);
      });
      list.appendChild(wrap);
      wrap.querySelectorAll('button[data-bizact]').forEach(btn => {
        btn.onclick = () => {
          const k = btn.dataset.bizact, i = +btn.dataset.idx;
          const fn = {ipo:ipoBusiness, acq:acquireCompetitor, frn:franchiseBusiness, piv:pivotBusiness}[k];
          if(!fn) return;
          const r = fn(i);
          showToast(r);
          window.renderBusinessTab();
          const nw = calcNetWorth(GS.char, GS.inv);
          if(GS.nwHistory.length) GS.nwHistory[GS.nwHistory.length-1] = nw;
          updateUI(null, nw, nw);
          renderExtras();
        };
      });
    };
  }

  // ── PATCH showGameOver to add NG+ button ───────────────────────
  const _origGO = window.showGameOver;
  if(typeof _origGO === 'function'){
    window.showGameOver = function(){
      _origGO();
      const card = document.querySelector('#screen-gameover .go-card');
      if(card && !document.getElementById('btn-ngplus')){
        const btn = document.createElement('button');
        btn.id = 'btn-ngplus';
        btn.className = 'btn-retry';
        btn.style.marginTop = '8px';
        btn.style.background = 'linear-gradient(135deg,#2a5a2a,#3d8c3d)';
        btn.style.borderColor = 'var(--gold)';
        btn.style.color = 'var(--gold)';
        btn.textContent = '⏭️ Continue as Heir (NG+)';
        btn.onclick = startNGPlus;
        card.appendChild(btn);
      }
    };
  }

  // ── HOOK btn-age — extras tick alongside the original tick ─────
  const _ageBtn = document.getElementById('btn-age');
  if(_ageBtn){
    const _origAgeHandler = _ageBtn.onclick;
    _ageBtn.onclick = function(){
      if(!GS.char||!GS.char.alive) return;
      ensureExtras(GS.char, GS.inv);
      preTickExtras();
      _origAgeHandler();
      if(GS.char && GS.char.alive){
        postTickExtras();
        renderExtras();
        if(typeof renderBusinessTab === 'function') renderBusinessTab();
        try{ saveGame(); }catch(e){}
      }
    };
  }

  function preTickExtras(){
    const c=GS.char, inv=GS.inv;
    tickPet(c);
    tickFriends(c);
    tickBondsAndIndex(inv);
    tickLoan(c);
    tickHobbies(inv);
    tickInfluencer(c);
    tickPolitics(c);
    tickFranchiseRoyalty(inv, c);
  }
  function postTickExtras(){
    const c=GS.char;
    tickHeadhunters(c);
    tickSportsAwards(c);
    tickInjury(c);
    tickTradeDemand(c);
    tickPostRetireSports(c);
    tickNationalTeam(c);
    honorHoF(c);
    tickWindfalls(c);
    tickTaxFiling(c);
  }

  // ── BOOTSTRAP after btn-start runs ─────────────────────────────
  function bootstrap(){
    injectButtons();
    if(GS.char) ensureExtras(GS.char, GS.inv);
    renderExtras();
    if(typeof renderBusinessTab === 'function') renderBusinessTab();
  }
  const _startBtn = document.getElementById('btn-start');
  if(_startBtn){
    const _oldStart = _startBtn.onclick;
    _startBtn.onclick = function(){
      _oldStart();
      setTimeout(bootstrap, 50);
    };
  }
  if(GS.char) bootstrap();

  // ── Test API exposed on window ─────────────────────────────────
  window.__finlife = {
    ensureExtras, adoptPet, makeFriend, donate, takeLoan, payLoan,
    buyBonds, sellBonds, buyIndex, sellIndex,
    travel, buyHobby, sellHobby, casinoPlay,
    runForOffice, setInfluencer, tryForChild, setWillKids,
    ipoBusiness, acquireCompetitor, franchiseBusiness, pivotBusiness,
    tickPet, tickFriends, tickBondsAndIndex, tickLoan, tickHobbies, tickInfluencer, tickPolitics,
    tickHeadhunters, tickSportsAwards, tickInjury, tickTradeDemand, tickNationalTeam, honorHoF,
    tickWindfalls, tickTaxFiling, tickFranchiseRoyalty, tickPostRetireSports,
    listSlots, saveToSlot, loadFromSlot, deleteSlot, startNGPlus,
    acceptHeadhunter, counterHeadhunter, acceptCoaching, acceptBroadcasting,
    doCheckup, doSurgery,
    openFamilyModal, openLoansModal, openLifestyleModal, openPublicModal, openMenuModal, openScrapbookModal,
    PET_SPECIES, CITIES, HOBBY_CATALOG, POL_LADDER, SPORTS_JOBS,
    bootstrap, renderExtras, preTickExtras, postTickExtras,
  };
})();
