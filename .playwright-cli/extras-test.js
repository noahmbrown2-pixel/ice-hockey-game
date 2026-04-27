// Smoke test for the Finlife extras (personal life, finance depth, sports
// depth, business depth, lifestyle, public, polish). All checks run against
// http://localhost:3000/bitlife-finance.html with a fresh save.

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('pageerror', e => errs.push('page: ' + e.message));

  await page.goto('http://localhost:3000/bitlife-finance.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { try { localStorage.removeItem('finlife_save'); localStorage.removeItem('finlife_slots_v1'); } catch(e){} });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#screen-new.active', { timeout: 5000 });
  await page.fill('#inp-name', 'ExtrasTest');
  await page.click('#btn-start');
  await page.waitForSelector('#screen-game.active', { timeout: 5000 });
  await page.waitForFunction(() => typeof window.__finlife === 'object' && !!document.getElementById('btn-family'), null, { timeout: 5000 });

  const results = [];
  function record(name, ok, detail) { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${detail ? ' :: ' + detail : ''}`); }

  // ── 1. Buttons injected ───────────────────────────────────────
  const btnIds = await page.evaluate(() => ['btn-family','btn-loans','btn-life','btn-public','btn-menu'].map(id => !!document.getElementById(id)));
  record('action buttons injected', btnIds.every(x => x), JSON.stringify(btnIds));

  // ── 2. State backfill ─────────────────────────────────────────
  const state = await page.evaluate(() => {
    const c = GS.char, inv = GS.inv;
    return {
      pet: c.pet === null,
      friends: Array.isArray(c.friends),
      will: c.willPctKids === 70,
      bonds: inv.bonds === 0,
      idx: inv.indexFunds === 0,
      hobbies: Array.isArray(inv.hobbies),
      politicalRank: c.politicalRank === 'none',
      followers: c.followers === 0,
      ngGen: c.ngGeneration === 0,
      scrapbook: Array.isArray(c.scrapbook),
    };
  });
  record('state fields backfilled', Object.values(state).every(v => v), JSON.stringify(state));

  // ── 3. Family: pet + friend + child + charity + will ──────────
  const family = await page.evaluate(() => {
    const f = window.__finlife;
    GS.char.checking = 100000;
    GS.char.relationship = 'married'; GS.char.spouseName = 'Pat'; GS.char.spouseIncome = 60000;
    const out = {};
    out.adopt = f.adoptPet(0, 'Rex');
    out.hasPet = !!GS.char.pet;
    out.adoptDup = f.adoptPet(0, 'Rex');
    out.makeFriend = f.makeFriend();
    out.friendCount = GS.char.friends.length;
    out.child = f.tryForChild();
    out.kids = GS.char.kids;
    out.donate = f.donate(1000);
    out.charity = GS.char.charityGiven;
    out.will = f.setWillKids(40);
    out.willPct = GS.char.willPctKids;
    return out;
  });
  record('family — adopt/dup/friend/child/donate/will',
    family.hasPet && family.adoptDup.startsWith('You already') && family.friendCount === 1 && family.kids === 1 && family.charity === 1000 && family.willPct === 40,
    JSON.stringify(family));

  // ── 4. Loans + bonds + index ──────────────────────────────────
  const fin = await page.evaluate(() => {
    const f = window.__finlife;
    GS.char.checking = 200000;
    GS.char.salary = 80000;
    GS.char.creditScore = 750;
    const r = {};
    r.borrow = f.takeLoan(50000);
    r.loanBal = GS.char.personalLoan;
    r.cashAfterBorrow = GS.char.checking; // 200k + 50k
    r.payback = f.payLoan(10000);
    r.loanAfterPay = GS.char.personalLoan;
    r.bonds = f.buyBonds(10000);
    r.bondsHeld = GS.inv.bonds;
    r.index = f.buyIndex(20000);
    r.indexHeld = GS.inv.indexFunds;
    f.tickBondsAndIndex(GS.inv); // monthly compound
    r.bondsCompounded = GS.inv.bonds > 10000;
    r.sellBonds = f.sellBonds(GS.inv.bonds);
    r.bondsAfterSell = GS.inv.bonds;
    return r;
  });
  record('finance — loans/bonds/index/sell',
    fin.loanBal === 50000 && fin.cashAfterBorrow === 250000 && fin.loanAfterPay === 40000 && fin.bondsHeld === 10000 && fin.indexHeld === 20000 && fin.bondsCompounded && fin.bondsAfterSell === 0,
    JSON.stringify(fin));

  // ── 5. Lifestyle: travel + hobby + casino ─────────────────────
  const life = await page.evaluate(() => {
    const f = window.__finlife;
    GS.char.checking = 200000;
    const r = {};
    r.travel = f.travel(0); // Paris
    r.travelCount = GS.inv.travels.length;
    r.hobbyBuy = f.buyHobby(0);
    r.hobCount = GS.inv.hobbies.length;
    r.preCash = GS.char.checking;
    r.casino = f.casinoPlay(100);
    r.cashChanged = GS.char.checking !== r.preCash;
    f.tickHobbies(GS.inv); // appreciate
    r.checkup = f.doCheckup();
    return r;
  });
  record('lifestyle — travel/hobby/casino/checkup',
    life.travelCount === 1 && life.hobCount === 1 && life.cashChanged && life.checkup.includes('Checkup'),
    JSON.stringify(life));

  // ── 6. Public: politics + influencer + sports ─────────────────
  const pub = await page.evaluate(() => {
    const f = window.__finlife;
    GS.char.checking = 100000000;
    GS.char.politicalApproval = 80;
    GS.inv.bonds = 0; GS.inv.indexFunds = 0;
    const r = {};
    r.runMayor = f.runForOffice(0);
    r.influencer = f.setInfluencer(true, 'grind');
    f.tickInfluencer(GS.char);
    r.followersGrew = GS.char.followers > 100;

    // Sports flow: athlete career
    GS.char.employed = true;
    GS.char.jobId = 'football_player';
    GS.char.jobTitle = 'NFL Football Player';
    GS.char.salary = 1000000;
    GS.char.sportsTeam = 'Hometown';
    GS.char.performance = 90;
    GS.char.monthAge = 30 * 12 + 6; // mid-year for awards check

    // Force awards 5 times to get one
    let awarded = false;
    for(let i=0;i<30 && !awarded;i++){
      GS.inbox = [];
      GS.char.careerAwards = [];
      f.tickSportsAwards(GS.char);
      if(GS.char.careerAwards.length > 0) awarded = true;
    }
    r.awardSystemFires = awarded;

    // Force injury
    let injured = false;
    GS.char.injuryMonthsLeft = 0;
    for(let i=0;i<200 && !injured;i++){
      f.tickInjury(GS.char);
      if(GS.char.injuryMonthsLeft > 0) injured = true;
    }
    r.injurySystemFires = injured;

    // HoF: must have 3+ awards and age 38+
    GS.char.careerAwards = [{award:'MVP'},{award:'MVP'},{award:'AS'}];
    GS.char.age = 40;
    GS.char.hofMember = false;
    GS.char.employed = false;
    f.honorHoF(GS.char);
    r.hofInducted = GS.char.hofMember;

    // Career encore: coaching
    GS.char.employed = false;
    r.coaching = f.acceptCoaching();
    r.coachingActive = !!GS.char.coachingCareer;
    return r;
  });
  record('public — politics/influencer/awards/injury/HoF/coaching',
    pub.runMayor.includes('Elected') || pub.runMayor.includes('Lost') /* RNG */ ? true : false,
    JSON.stringify(pub));
  record('public — followers grow', pub.followersGrew, JSON.stringify({fol: pub.followersGrew}));
  record('public — sports awards system fires', pub.awardSystemFires);
  record('public — injury system fires', pub.injurySystemFires);
  record('public — HoF induction', pub.hofInducted);
  record('public — coaching activates', pub.coachingActive, pub.coaching);

  // ── 7. Business: IPO/Acquire/Franchise/Pivot ─────────────────
  const biz = await page.evaluate(() => {
    const f = window.__finlife;
    GS.char.checking = 50000000;
    GS.inv.businesses = [{ name:'TestCorp', startCost:100000, value: 10000000, profit: 1000000, age:5, employees:[], equipTier:1, equipAge:0 }];
    const r = {};
    const before = GS.char.checking;
    r.ipo = f.ipoBusiness(0);
    r.ipoFlag = !!GS.inv.businesses[0].ipo;
    r.cashIncreased = GS.char.checking > before;
    const before2 = GS.char.checking;
    r.acq = f.acquireCompetitor(0);
    r.acqIncrease = GS.inv.businesses[0].value > 7000000; // grew after 0.7 dilution + 1.5x
    const before3 = GS.char.checking;
    r.frn = f.franchiseBusiness(0);
    r.frnCount = GS.inv.businesses[0].franchiseCount;
    const before4 = GS.char.checking;
    r.piv = f.pivotBusiness(0);
    r.pivFlag = !!GS.inv.businesses[0].pivoted;
    const dup = f.pivotBusiness(0);
    r.pivDup = dup.includes('Already pivoted');
    return r;
  });
  record('business — IPO/Acquire/Franchise/Pivot',
    biz.ipoFlag && biz.cashIncreased && biz.acqIncrease && biz.frnCount === 1 && biz.pivFlag && biz.pivDup,
    JSON.stringify(biz));

  // ── 8. Random tax filing + windfalls ──────────────────────────
  const rand = await page.evaluate(() => {
    const f = window.__finlife;
    const r = {};
    GS.char.charityGiven = 10000;
    GS.char.checking = 100000;
    GS.char.monthAge = 26 * 12 + 4; // April -> tax filing
    GS.char.lastTaxYear = 0;
    GS.inbox = [];
    f.tickTaxFiling(GS.char);
    r.taxItem = GS.inbox.find(i => i.subject && i.subject.startsWith('Tax return'));
    r.taxFiled = !!r.taxItem;

    // Force windfalls many times to verify it can fire (RNG-bound at 0.5%).
    // addInboxItem unshifts (newest at index 0).
    let inheritOk = false;
    for(let i=0;i<3000 && !inheritOk; i++){
      f.tickWindfalls(GS.char);
      if((GS.inbox||[]).some(it => it && it.subject === 'Letter from a lawyer')) inheritOk = true;
    }
    r.inheritOk = inheritOk;
    return r;
  });
  record('random — tax filing fires', rand.taxFiled);
  record('random — inheritance can fire', rand.inheritOk);

  // ── 9. Save slots ─────────────────────────────────────────────
  const slots = await page.evaluate(() => {
    const f = window.__finlife;
    const r = {};
    r.save1 = f.saveToSlot('TestSlot');
    const list = f.listSlots();
    r.listed = !!list.TestSlot;
    GS.char.checking = 999999;
    r.load = f.loadFromSlot('TestSlot');
    r.loadedCash = GS.char.checking;
    r.del = f.deleteSlot('TestSlot');
    r.afterDel = !!f.listSlots().TestSlot;
    return r;
  });
  record('polish — save slots round-trip',
    slots.listed && slots.loadedCash !== 999999 && !slots.afterDel,
    JSON.stringify(slots));

  // ── 10. NG+ ───────────────────────────────────────────────────
  const ngp = await page.evaluate(() => {
    const f = window.__finlife;
    const beforeName = GS.char.name;
    GS.char.checking = 10000000;
    GS.char.willPctKids = 100;
    f.startNGPlus();
    return { newName: GS.char.name, gen: GS.char.ngGeneration, hasState: !!GS.char.scrapbook };
  });
  record('polish — NG+ heir continuation', ngp.gen === 1 && ngp.newName.includes('Jr.') && ngp.hasState, JSON.stringify(ngp));

  // ── 11. Headhunter accept flow ─────────────────────────────────
  const hh = await page.evaluate(() => {
    const f = window.__finlife;
    GS.char.employed = true; GS.char.salary = 80000; GS.char.jobTitle = 'X';
    let fired = false;
    for(let i=0;i<400 && !fired;i++){
      const before = GS.inbox.length;
      f.tickHeadhunters(GS.char);
      if(GS.inbox.length > before){ fired = true; break; }
    }
    if(!fired) return { fired:false };
    const item = GS.inbox[GS.inbox.length-1];
    if(!item || !item.extAction) return { fired:true, hasAction:false };
    const before = GS.char.salary;
    const r = f.acceptHeadhunter(item.extAction);
    return { fired:true, hasAction:true, salaryRose: GS.char.salary > before, msg:r };
  });
  record('career — headhunter offer + accept', hh.fired && hh.hasAction && hh.salaryRose, JSON.stringify(hh));

  // ── 12. Multi-month tick — confirm no errors ──────────────────
  await page.evaluate(() => {
    GS.char.alive = true; GS.char.health = 90; GS.char.checking = 200000;
    GS.pendingEvents = [];
    if(document.getElementById('modal-overlay').classList.contains('open')) closeModal();
  });
  let tickFail = null;
  for (let i = 0; i < 30; i++) {
    // Drain any open modals + queued events first
    await page.evaluate(() => {
      let guard = 30;
      while (guard-- > 0) {
        const open = document.getElementById('modal-overlay').classList.contains('open');
        if (open) closeModal();
        if (!GS.pendingEvents || !GS.pendingEvents.length) break;
      }
      GS.pendingEvents = [];
    });
    try {
      await page.click('#btn-age', { timeout: 4000 });
    } catch(e) { tickFail = `month ${i}: ${e.message.split('\n')[0]}`; break; }
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => {
    if(document.getElementById('modal-overlay').classList.contains('open')) closeModal();
  });
  const tickInfo = await page.evaluate(() => ({alive: GS.char && GS.char.alive, age: GS.char && GS.char.age}));
  record('30-month tick survives without crash', tickFail === null, tickFail || `alive=${tickInfo.alive}, age=${tickInfo.age}`);

  // ── 13. UI: each new modal opens ──────────────────────────────
  for (const id of ['btn-family','btn-loans','btn-life','btn-public','btn-menu']) {
    await page.evaluate(() => { if(document.getElementById('modal-overlay').classList.contains('open')) closeModal(); });
    await page.waitForTimeout(80);
    await page.click('#' + id, { timeout: 4000 });
    await page.waitForTimeout(80);
    const open = await page.evaluate(() => document.getElementById('modal-overlay').classList.contains('open'));
    record(`UI — ${id} opens modal`, open);
    await page.evaluate(() => closeModal());
  }

  // ── 14. Console errors ────────────────────────────────────────
  record('no console / page errors', errs.length === 0, errs.join(' | '));

  console.log('\n──────────────────────────────────────');
  const passed = results.filter(r => r.ok).length;
  const total = results.length;
  console.log(`${passed}/${total} tests passed.`);
  if (passed < total) {
    console.log('Failures:');
    for (const r of results.filter(x => !x.ok)) console.log(`  - ${r.name}${r.detail ? ' :: '+r.detail : ''}`);
  }

  await browser.close();
  process.exit(passed === total ? 0 : 1);
})();
