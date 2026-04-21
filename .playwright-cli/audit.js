// Playwright audit for bitlife-finance.html
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  const warnings = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    if (msg.type() === 'warning') warnings.push(msg.text());
  });
  page.on('pageerror', err => pageErrors.push(err.message + ' | stack: ' + (err.stack||'').split('\n')[1]));

  const report = { consoleErrors, pageErrors, warnings, steps: [], snapshots: {} };

  function step(name, data) { report.steps.push({ name, ...data }); }

  await page.goto('http://localhost:3000/bitlife-finance.html', { waitUntil: 'domcontentloaded' });

  // Confirm new-game screen loads
  await page.waitForSelector('#screen-new.active', { timeout: 5000 });
  step('load', { ok: true });

  // Fill name, pick scenario, start
  await page.fill('#inp-name', 'Audit Bot');
  await page.click('#btn-start');
  await page.waitForSelector('#screen-game.active', { timeout: 5000 });
  step('start_game', { ok: true });

  // Capture initial state
  const initState = await page.evaluate(() => {
    const c = GS && GS.char || {};
    return {
      checking: c.checking, salary: c.salary, age: c.age, monthAge: c.monthAge,
      employed: c.employed, sideHustleIncome: c.sideHustleIncome,
      stockCount: (GS.inv.stocks||[]).length,
      cryptoCount: (GS.inv.cryptos||[]).length,
      bossMorale: c.bossMorale,
    };
  });
  report.snapshots.initial = initState;

  // Click inbox button — should open inbox modal
  await page.click('#btn-inbox');
  await page.waitForSelector('#modal-overlay.open', { timeout: 3000 });
  const inboxTitle = await page.textContent('#m-title');
  step('open_inbox', { title: inboxTitle });
  // Close modal
  await page.evaluate(() => closeModal && closeModal());

  // Click business button (should toast since no businesses)
  await page.click('#btn-biz');
  await page.waitForTimeout(300);
  const toast = await page.textContent('#toast').catch(()=>null);
  step('click_biz_no_business', { toast });

  // Click through Age +1 Month 36 times (3 years)
  const ageBtn = '#btn-age';
  async function advanceMonth(){
    // Close any lingering modal first
    await page.evaluate(() => { try{ closeModal && closeModal(); }catch(e){} });
    await page.waitForTimeout(40);
    await page.click(ageBtn, { force: true });
    await page.waitForTimeout(150);
    // Chain-close any stacked modals (events come in sequence)
    for (let k=0;k<5;k++) {
      const isOpen = await page.$('#modal-overlay.open');
      if (!isOpen) break;
      const btns = await page.$$('#m-choices button');
      let idx = -1;
      for (let j=0;j<btns.length;j++){
        const t = (await btns[j].textContent() || '').toLowerCase();
        if (/close|decline|cancel|skip|defer|back|no thanks/.test(t)) { idx = j; break; }
      }
      if (idx<0) idx = Math.max(0, btns.length - 1);
      if (btns[idx]) await btns[idx].click({ force: true }).catch(()=>{});
      await page.waitForTimeout(80);
    }
  }
  for (let i = 0; i < 36; i++) await advanceMonth();
  step('aged_36_months', { ok: true });

  // Capture mid-state
  const midState = await page.evaluate(() => {
    const c = GS.char;
    return {
      checking: c.checking, savings: c.savings, salary: c.salary, age: c.age,
      monthAge: c.monthAge, employed: c.employed, jobTitle: c.jobTitle,
      sideHustleIncome: c.sideHustleIncome, bossMorale: c.bossMorale, bossName: c.bossName,
      performance: c.performance, creditScore: c.creditScore,
      inboxCount: (GS.inbox||[]).length,
      belongings: (c.belongings||[]).length,
      pendingExpenses: (c.pendingExpenses||[]).length,
      businesses: (GS.inv.businesses||[]).length,
      vehicles: (GS.inv.vehicles||[]).length,
      properties: (GS.inv.properties||[]).length,
      nwHistoryLen: (GS.nwHistory||[]).length,
      alive: c.alive,
    };
  });
  report.snapshots.after3Years = midState;

  // Classify inbox by type
  const inboxBreakdown = await page.evaluate(() => {
    const items = GS.inbox||[];
    const byType = {};
    const bySubject = {};
    for (const i of items) {
      byType[i.type] = (byType[i.type]||0)+1;
      const key = (i.subject||'').split('—')[0].trim().substring(0,40);
      bySubject[key] = (bySubject[key]||0)+1;
    }
    return { total: items.length, byType, sampleSubjects: Object.keys(bySubject).slice(0,15), bossMsgs: items.filter(i=>/Year-end note|boss/i.test(i.subject||'')).length, billReports: items.filter(i=>/Bill Report/i.test(i.subject||'')).length };
  });
  report.inbox = inboxBreakdown;

  // Test side hustle
  await page.click('#btn-hustle');
  await page.waitForSelector('#modal-overlay.open');
  const hustleBtns = await page.$$('#m-choices button');
  // Pick first hustle (usually the first non-refresh one)
  let clicked = false;
  for (const b of hustleBtns) {
    const t = await b.textContent();
    if (!/refresh|business|close|cancel/i.test(t)) { await b.click(); clicked = true; break; }
  }
  await page.waitForTimeout(300);
  step('ran_side_hustle', { clicked });
  const hustleResult = await page.textContent('#m-result').catch(()=>null);
  step('hustle_result', { text: (hustleResult||'').substring(0,200) });
  // Close
  await page.evaluate(() => closeModal && closeModal());

  const afterHustle = await page.evaluate(() => ({
    sideHustleIncome: GS.char.sideHustleIncome,
    salary: GS.char.salary,
  }));
  report.snapshots.afterHustle = afterHustle;

  // Check that Life tab shows side hustle row
  await page.click('.tab-btn[data-tab="life"]').catch(()=>{});
  // Find by data-tab
  const lifeSalary = await page.textContent('#li-salary').catch(()=>null);
  const lifeSide = await page.textContent('#li-side').catch(()=>null);
  const lifeTotal = await page.textContent('#li-total-inc').catch(()=>null);
  const lifeMorale = await page.textContent('#li-morale').catch(()=>null);
  report.lifeTab = { salary: lifeSalary, side: lifeSide, total: lifeTotal, morale: lifeMorale };

  // Screenshot
  await page.screenshot({ path: '.playwright-cli/audit-screenshot.png', fullPage: false });

  // Age 60 more months to stress test + trigger bill reports & boss msgs
  for (let i = 0; i < 60; i++) await advanceMonth();
  step('aged_additional_60_months', { ok: true });

  const finalState = await page.evaluate(() => {
    const c = GS.char;
    return {
      age: c.age, monthAge: c.monthAge, alive: c.alive,
      checking: c.checking, savings: c.savings, salary: c.salary,
      sideHustleIncome: c.sideHustleIncome, performance: c.performance, bossMorale: c.bossMorale,
      belongings: (c.belongings||[]).length, creditScore: c.creditScore,
      inboxTotal: (GS.inbox||[]).length,
      bossMsgs: (GS.inbox||[]).filter(i=>/Year-end note/i.test(i.subject||'')).length,
      billReports: (GS.inbox||[]).filter(i=>/Bill Report/i.test(i.subject||'')).length,
      downsideMsgs: (GS.inbox||[]).filter(i=>i.type==='bill' && !/Bill Report/i.test(i.subject||'')).length,
    };
  });
  report.snapshots.final = finalState;

  // Screenshot final
  await page.screenshot({ path: '.playwright-cli/audit-final.png', fullPage: false });

  await browser.close();

  console.log(JSON.stringify(report, null, 2));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
