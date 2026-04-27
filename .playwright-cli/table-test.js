// Validates new Work tab + Table action work as expected.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('page: ' + e.message));
  p.on('console', m => { if (m.type()==='error') errs.push('console: ' + m.text()); });
  await p.goto('http://localhost:3000/bitlife-finance.html', { waitUntil: 'domcontentloaded' });
  await p.evaluate(() => { try { localStorage.removeItem('finlife_save'); } catch(e){} });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForSelector('#screen-new.active', { timeout: 5000 });
  await p.fill('#inp-name', 'TableTest');
  await p.click('#btn-start');
  await p.waitForSelector('#screen-game.active', { timeout: 5000 });

  // 1. Verify the new tab order: Life, Finances, Business, Work, Invest, Assets
  const tabOrder = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('.tabs .tab-btn')).map(b => b.dataset.tab);
  });

  // 2. Verify btn-table exists, btn-job is gone
  const btnState = await p.evaluate(() => ({
    hasTable: !!document.getElementById('btn-table'),
    hasJob: !!document.getElementById('btn-job'),
    tableLabel: document.getElementById('btn-table')?.textContent.trim(),
  }));

  // 3. Click Work tab and verify content loads
  await p.click('.tab-btn[data-tab="work"]');
  await p.waitForTimeout(150);
  const workTab = await p.evaluate(() => {
    const isActive = document.getElementById('tab-work').classList.contains('active');
    const careersList = document.getElementById('wk-careers-list')?.children.length || 0;
    const sideList = document.getElementById('wk-side-list')?.children.length || 0;
    const jobName = document.getElementById('wk-job')?.textContent;
    return { isActive, careersList, sideList, jobName };
  });

  // 4. Switch to Side Projects subtab
  await p.evaluate(() => {
    document.querySelector('.wk-tab-btn[data-wktab="side"]').click();
  });
  await p.waitForTimeout(100);
  const sideSubtab = await p.evaluate(() => ({
    careersHidden: document.getElementById('wk-careers-pane').style.display === 'none',
    sideShown: document.getElementById('wk-side-pane').style.display !== 'none',
    sideListCount: document.getElementById('wk-side-list')?.children.length,
  }));

  // 5. Apply for a job via Work tab
  await p.evaluate(() => {
    document.querySelector('.wk-tab-btn[data-wktab="careers"]').click();
  });
  await p.waitForTimeout(100);
  const applied = await p.evaluate(() => {
    // Set up: education to bachelors so jobs are available
    GS.char.education = 'bachelors';
    GS.char.smarts = 80;
  });
  // Re-render so jobs appear
  await p.evaluate(() => { if (typeof renderWorkTab === 'function') renderWorkTab(); });
  await p.waitForTimeout(100);
  const beforeApply = await p.evaluate(() => ({ employed: GS.char.employed, jobs: document.querySelectorAll('.wk-apply-btn').length }));
  if (beforeApply.jobs > 0) {
    await p.click('.wk-apply-btn');
    await p.waitForTimeout(200);
  }
  const afterApply = await p.evaluate(() => ({
    employed: GS.char.employed,
    jobTitle: GS.char.jobTitle,
    salary: GS.char.salary,
    workTabJob: document.getElementById('wk-job')?.textContent,
    workTabSalary: document.getElementById('wk-salary')?.textContent,
  }));

  // 6. Open Table modal — Standings (non-athlete view)
  await p.click('#btn-table');
  await p.waitForSelector('#modal-overlay.open', { timeout: 3000 });
  const stand1 = await p.evaluate(() => {
    const title = document.getElementById('m-title')?.textContent;
    const ch = document.getElementById('m-choices');
    const hasStandingsTab = Array.from(ch.querySelectorAll('button')).some(b => /Standings/.test(b.textContent));
    const hasPartnersTab = Array.from(ch.querySelectorAll('button')).some(b => /Partners/.test(b.textContent));
    const text = ch.textContent;
    return {
      title,
      hasStandingsTab, hasPartnersTab,
      hasRevenue: /Annual Revenue/.test(text),
      hasSentiment: /Customer Sentiment/.test(text),
      hasEfficiency: /Workplace Efficiency/.test(text),
      hasJobRank: /Job Rank in Field/.test(text),
      hasMonthlyPerf: /Monthly Performance/.test(text),
    };
  });

  // 7. Switch to Partners tab — non-athlete
  await p.evaluate(() => {
    const ch = document.getElementById('m-choices');
    const partnersBtn = Array.from(ch.querySelectorAll('button')).find(b => /Partners/.test(b.textContent));
    partnersBtn.click();
  });
  await p.waitForTimeout(150);
  const partners1 = await p.evaluate(() => {
    const ch = document.getElementById('m-choices');
    const text = ch.textContent;
    return {
      hasBoss: /Boss.s Office/.test(text),
      hasSenior: /Senior Table/.test(text),
      hasCoworkers: /Coworker Table/.test(text),
      hasNewHire: /NEW HIRE/.test(text) || /NEW/.test(text),
      hasFullList: /Full Coworker List/.test(text),
    };
  });

  // 8. Switch player to soccer player → Standings should show vertical league table
  await p.evaluate(() => {
    document.getElementById('modal-close-x').click();
  });
  await p.waitForTimeout(200);
  await p.evaluate(() => {
    const job = ALL_JOBS.find(j => j.id === 'soccer_player');
    applyForJob(GS.char, job);
    GS.char.salary = 12000000;
    GS.char.sportsTeam = 'Manchester United';
    GS.char._euroComp = 'champions';
    GS.char._euroInit = true;
  });
  await p.click('#btn-table');
  await p.waitForSelector('#modal-overlay.open', { timeout: 3000 });
  await p.waitForTimeout(150);
  const sportStandings = await p.evaluate(() => {
    const ch = document.getElementById('m-choices');
    const text = ch.textContent;
    return {
      hasMatchReports: /Match Reports/.test(text),
      hasPremierLeague: /Premier League/.test(text),
      hasChampionsLeague: /Champions League/.test(text),
      hasManUtd: /Manchester United/.test(text),
      // Look for vertical table header (P W D L Pts)
      hasTableHeader: /Pts/.test(text),
    };
  });

  // 9. Partners for athlete (soccer team)
  await p.evaluate(() => {
    const ch = document.getElementById('m-choices');
    const partnersBtn = Array.from(ch.querySelectorAll('button')).find(b => /Partners/.test(b.textContent));
    partnersBtn.click();
  });
  await p.waitForTimeout(150);
  const partnersSport = await p.evaluate(() => {
    const ch = document.getElementById('m-choices');
    const text = ch.textContent;
    return {
      hasBoss: /Boss.s Office/.test(text) || /Head Coach/.test(text),
      coworkerCount: ch.querySelectorAll('[style*="border-radius:50%"][style*="border:2px"]').length,
    };
  });

  console.log(JSON.stringify({
    errors: errs.slice(0, 6),
    tabOrder, btnState, workTab, sideSubtab, beforeApply, afterApply,
    stand1, partners1, sportStandings, partnersSport,
  }, null, 2));
  await b.close();
})().catch(e => { console.error('FATAL', e.message || e); process.exit(1); });
