// ════════════════════════════════════════════════════════════════
//  ANNUAL TICK
// ════════════════════════════════════════════════════════════════

// ── Financial Tips ───────────────────────────────────────────────
const FINANCIAL_TIPS = [
  {icon:'💳', tip:'Pay your credit card balance in full every month. Carrying a balance at 20%+ APR costs you far more than any reward points you earn.'},
  {icon:'🏦', tip:'Move your savings to a high-yield account. A 4% high-yield account earns 20× more interest than a standard 0.2% savings account.'},
  {icon:'📊', tip:'Max out your 401(k) match before investing anywhere else. That employer match is an instant 50–100% return — nothing beats free money.'},
  {icon:'💰', tip:'Follow the 50/30/20 rule: 50% of take-home pay on needs, 30% on wants, 20% on savings and debt. It\'s a simple framework that works.'},
  {icon:'📈', tip:'Time in the market beats timing the market. Investing $500/month starting at 25 grows to ~$1.7M by 65 at 7% average returns.'},
  {icon:'🎯', tip:'Build a 3–6 month emergency fund before investing. Without it, one unexpected expense forces you to sell investments at the worst time.'},
  {icon:'🏠', tip:'Your home is a place to live, not your retirement plan. Don\'t neglect stocks and retirement accounts just because you own property.'},
  {icon:'📉', tip:'Don\'t panic sell during market crashes. Every major crash in history has recovered. Selling locks in your losses permanently.'},
  {icon:'🔄', tip:'Automate your savings. Set up automatic transfers on payday. Money you never see in checking is money you never spend.'},
  {icon:'💸', tip:'Avoid lifestyle inflation. When you get a raise, save at least 50% of it before upgrading your lifestyle. Future you will thank you.'},
  {icon:'🎓', tip:'Higher education pays off — but only if you earn more than your loan cost. Calculate your expected salary before taking on student debt.'},
  {icon:'🚗', tip:'Buy used cars, not new. A new car loses 20% of its value the moment you drive it off the lot. A 2-year-old car is often half the price.'},
  {icon:'📱', tip:'Audit your subscriptions. The average person pays for 4–5 services they barely use. That\'s $100–200/month of invisible spending.'},
  {icon:'🏋️', tip:'Investing in your health now saves massive medical bills later. Poor health is one of the biggest unexpected financial disasters.'},
  {icon:'📋', tip:'Track every dollar you spend for one month. Most people are shocked — the small daily purchases add up to thousands per year.'},
  {icon:'🤝', tip:'Negotiate your salary. Workers who negotiate earn $5,000–$20,000 more per year on average. That gap compounds over an entire career.'},
  {icon:'🔑', tip:'Real estate builds wealth through equity and appreciation. If you can afford a down payment, owning often beats renting long-term.'},
  {icon:'💎', tip:'Index funds beat most active fund managers over 10+ years. A simple S&P 500 ETF with low fees outperforms 90% of professional stock pickers.'},
  {icon:'📅', tip:'Pay yourself first. Treat your savings contribution like a bill due on payday. It\'s not optional — it\'s the rent you pay to your future self.'},
  {icon:'⚠️', tip:'Credit card debt is the most expensive debt you can carry. At 20% APR, a $5,000 balance costs you $1,000/year just in interest.'},
  {icon:'🌱', tip:'Compound interest is the 8th wonder of the world. $10,000 invested at 25 becomes $150,000 by 65 at 7% — without adding another cent.'},
  {icon:'🛡️', tip:'Get term life insurance if anyone depends on your income. A $500k policy can cost as little as $20/month in your 20s and 30s.'},
  {icon:'🎰', tip:'Gambling, crypto, and "hot stock tips" are entertainment budgets — not investment strategies. Never bet money you can\'t afford to lose.'},
  {icon:'👴', tip:'Start contributing to a Roth IRA as soon as you have earned income. Tax-free growth for 40+ years is one of the best deals in personal finance.'},
  {icon:'🏷️', tip:'Buy quality items once instead of cheap items repeatedly. A good pair of boots lasting 10 years is cheaper than buying $30 boots every year.'},
  {icon:'🔮', tip:'Diversify your investments. Don\'t put all your money in one stock, one sector, or one asset class. Diversification is the only free lunch in finance.'},
  {icon:'📞', tip:'Call and negotiate your bills annually — internet, insurance, phone. Companies offer retention deals. Most people save $50–200/month just by asking.'},
  {icon:'🏪', tip:'Cook at home. The average American spends $3,000–5,000/year dining out. Cutting that in half and investing the difference adds up to real wealth.'},
  {icon:'🧾', tip:'Keep your housing cost under 30% of gross income. Going higher squeezes out savings, investments, and financial flexibility.'},
  {icon:'💡', tip:'Side income is the fastest way to accelerate savings. Even an extra $500/month invested for 20 years at 7% grows to over $260,000.'},
];

let _lastTipIndex = -1;

function generateTipEvent(){
  let idx;
  do { idx = ri(0, FINANCIAL_TIPS.length-1); } while(idx === _lastTipIndex);
  _lastTipIndex = idx;
  const t = FINANCIAL_TIPS[idx];
  return {
    id:'financial_tip',
    title:'Financial Tip',
    cat:'tip',
    icon:'💡',
    desc: t.tip,
    choices:[{text:'Got it, thanks!', fn(c){ return ''; }}],
  };
}

// ── Pending Expense Tick ──────────────────────────────────────────
function tickPendingExpenses(char, ev){
  if(!char.pendingExpenses) char.pendingExpenses=[];
  const stillPending=[];
  for(const exp of char.pendingExpenses){
    exp.monthsLeft--;
    if(exp.monthsLeft<=0){
      // Time's up — force-pay regardless of balance
      const hadFunds = char.checking >= exp.cost;
      char.checking -= exp.cost;
      // Credit score hit: -15 to -25, worse if it pushed balance negative
      const scoreDrop = hadFunds ? ri(15,25) : ri(30,50);
      char.creditScore = clamp(char.creditScore - scoreDrop, 300, 850);
      const balanceNote = !hadFunds ? ` Account went negative!` : '';
      if(!char.belongings) char.belongings=[];
      char.belongings.push({id:`b_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, name:exp.name, icon:exp.icon, cost:exp.cost, purchasedAt:char.monthAge});
      ev.push({type:'bad', text:`⚠️ Forced payment: ${exp.icon} ${exp.name} — ${fmt$(exp.cost)} auto-deducted. Credit score -${scoreDrop}.${balanceNote}`});
    } else {
      stillPending.push(exp);
    }
  }
  char.pendingExpenses = stillPending;
}

// ── Monthly Expense Generator ─────────────────────────────────────
function generateMonthlyExpenseEvent(char){
  if(char.age < 16) return null;
  // Pick 4 distinct items, each with its own rolled cost
  const pool = MONTHLY_EXPENSES.slice();
  const picks = [];
  const count = Math.min(4, pool.length);
  for(let i=0; i<count; i++){
    const idx = ri(0, pool.length-1);
    const item = pool.splice(idx, 1)[0];
    picks.push({item, cost: ri(item.min, item.max)});
  }
  const descLines = picks.map(p => `${p.item.icon} ${p.item.name} — ${fmt$(p.cost)}`).join('  ·  ');
  const choices = [];
  for(const p of picks){
    choices.push({
      text:`Buy ${p.item.icon} ${p.item.name} — ${fmt$(p.cost)}`,
      fn(c){
        c.checking -= p.cost;
        const bump = ri(1,3);
        c.creditScore = clamp(c.creditScore + bump, 300, 850);
        if(!c.belongings) c.belongings=[];
        c.belongings.push({id:`b_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, name:p.item.name, icon:p.item.icon, cost:p.cost, purchasedAt:c.monthAge});
        return `Paid ${fmt$(p.cost)} for ${p.item.name}. Added to belongings — sell anytime from Assets tab. Credit score +${bump}.`;
      }
    });
  }
  for(const p of picks){
    choices.push({
      text:`Defer ${p.item.icon} ${p.item.name} — ${fmt$(p.cost)} (10 mo)`,
      fn(c){
        if(!c.pendingExpenses) c.pendingExpenses=[];
        c.pendingExpenses.push({name:p.item.name, icon:p.item.icon, cost:p.cost, monthsLeft:10});
        return `Deferred ${p.item.name}. ${fmt$(p.cost)} due in 10 months. Miss it and your credit takes a hit.`;
      }
    });
  }
  choices.push({
    text:`Pass — none of these`,
    fn(){ return `Skipped this month's offers. Maybe next time.`; }
  });
  return {
    id: 'monthly_expense_'+Date.now(),
    title: 'Monthly Shopping Offers',
    cat: 'expense',
    icon: picks[0].item.icon,
    desc: `Four items caught your eye this month. Pick one to buy, defer the cost up to 10 months, or pass entirely.\n\n${descLines}`,
    choices,
  };
}

function annualTick(){ monthlyTick(); } // alias kept for compatibility

function monthlyTick(){
  const c=GS.char, inv=GS.inv;
  const ev=[];

  c.monthAge++;
  const prevAge = c.age;
  c.age = Math.floor(c.monthAge / 12);
  const isNewYear = c.age > prevAge; // a full year just completed

  // Auto high school at 14
  if(c.age===14&&isNewYear&&c.education==='none'&&!c.inSchool){
    c.inSchool=true;c.schoolType='high_school';c.schoolMonthsLeft=48;c.schoolCostMonthly=0;
    ev.push({type:'info',text:'Started high school.'});
  }

  // School progress (monthly)
  tickSchool(c, ev);

  // Auto seek job
  if(!c.inSchool&&!c.employed&&!c.retired&&c.age>=16&&pct(0.065)){
    const avail=getAvailableJobs(c);
    if(avail.length){const j=avail[ri(0,Math.min(2,avail.length-1))];applyForJob(c,j);ev.push({type:'good',text:`Got job: ${c.jobTitle} — ${fmt$(c.salary)}/yr`});}
  }

  // Monthly markets: prices update every month
  tickStocks(inv);
  tickCrypto(inv);
  tickVehicles(inv);

  // Annual systems: fire once per year
  if(isNewYear){
    tickCareerNew(c, ev);
    tickRelationship(c, ev);
    tickMarket(inv);
    tickRetirement(inv, c);
    tickRealEstate(inv, ev);
    tickBusinesses(inv, c, ev);
    if(c.age>40) c.health=clamp(c.health-rf(0.5,1.5),0,100);
  }

  // Tick deferred expenses (auto-pay overdue ones)
  tickPendingExpenses(c, ev);

  // Monthly sponsor payments + term tracking
  tickSponsors(inv, c);

  // Sports team contract offers (monthly chance for athletes)
  tickSportsOffers(c);

  // Soccer season events (fixtures in Aug, standings in Jun)
  tickSoccerSeason(c);
  // NFL season: Sep schedule, Jan playoffs, Feb Super Bowl
  tickNFLSeason(c);
  // NHL season: Oct schedule, Apr play-in, Jun Stanley Cup
  tickNHLSeason(c);

  // Monthly finances
  const fin=tickFinances(c, ev);

  // Happiness drifts slowly each month
  c.happiness=clamp(Math.round(c.happiness+(55-c.happiness)*0.004),0,100);

  // Net worth
  const prevNW = GS.nwHistory.length?GS.nwHistory[GS.nwHistory.length-1]:0;
  const nw=calcNetWorth(c,inv);
  GS.nwHistory.push(nw);

  // Log background events
  for(const e of ev) logEvent(e.text, e.type||'info');

  // Death check (monthly probability)
  if(tickDeath(c)){
    setTimeout(()=>showGameOver(),500);
    return;
  }

  // Build event queue: monthly expense first, then life event, then occasional tip
  GS.pendingEvents=[];
  const expEvent = generateMonthlyExpenseEvent(c);
  if(expEvent) GS.pendingEvents.push(expEvent);
  if(pct(0.30)){
    const events=selectEvents(c);
    if(events.length) GS.pendingEvents.push(events[0]);
  }
  // Financial tip: roughly every 4-5 months
  if(pct(0.22)) GS.pendingEvents.push(generateTipEvent());

  // Inbox: monthly news + bills
  generateInboxItems(c, inv);

  // Downside event: 3% monthly chance
  if(pct(0.03)) triggerDownside(c);

  // Bank update message: ~9% monthly chance (about 1/year per bank feature)
  maybeEmitBankUpdate(c);

  // Employee check-ins: monthly morale drift + inbox messages from staff
  tickEmployeeMessages(c, inv);

  updateUI(fin, prevNW, nw);
  saveGame();

  if(GS.pendingEvents.length>0) showNextEvent();
}

