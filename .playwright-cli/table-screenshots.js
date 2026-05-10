// Captures screenshots of the new Work tab + Table modal for visual review.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000/bitlife-finance.html', { waitUntil: 'domcontentloaded' });
  await p.evaluate(() => { try { localStorage.removeItem('finlife_save'); } catch(e){} });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForSelector('#screen-new.active', { timeout: 5000 });
  await p.fill('#inp-name', 'Demo');
  await p.click('#btn-start');
  await p.waitForSelector('#screen-game.active', { timeout: 5000 });

  // 1. Work tab — Careers (with employed Software Developer)
  await p.evaluate(() => {
    GS.char.education = 'bachelors';
    GS.char.smarts = 80;
    const job = ALL_JOBS.find(j => j.id === 'software_developer');
    applyForJob(GS.char, job);
    GS.char.salary = 145000;
    GS.char.performance = 78;
    GS.char.bossMorale = 72;
    GS.char.yearsAtJob = 3;
    GS.char.monthsAtJob = 39;
    GS.char.sideHustleIncome = 24000;
    updateUI();
  });
  await p.click('.tab-btn[data-tab="work"]');
  await p.waitForTimeout(200);
  await p.screenshot({ path: 'C:/Users/noahm/Project/.playwright-cli/screen-work-tab.png', fullPage: false });

  // 2. Table modal — Standings (non-athlete: Software Developer)
  await p.click('#btn-table');
  await p.waitForSelector('#modal-overlay.open', { timeout: 3000 });
  await p.waitForTimeout(200);
  await p.screenshot({ path: 'C:/Users/noahm/Project/.playwright-cli/screen-standings-tech.png', fullPage: false });

  // 3. Table modal — Partners (non-athlete)
  await p.evaluate(() => {
    const partnersBtn = Array.from(document.querySelectorAll('#m-choices button')).find(b => /Partners/.test(b.textContent));
    partnersBtn.click();
  });
  await p.waitForTimeout(250);
  await p.screenshot({ path: 'C:/Users/noahm/Project/.playwright-cli/screen-partners-tech.png', fullPage: false });
  // Expand the full list
  await p.evaluate(() => { document.querySelector('#m-choices details')?.setAttribute('open',''); });
  await p.waitForTimeout(150);
  await p.screenshot({ path: 'C:/Users/noahm/Project/.playwright-cli/screen-partners-tech-expanded.png', fullPage: false });

  // 4. Switch to soccer player and capture athlete standings
  await p.evaluate(() => { document.getElementById('modal-close-x').click(); });
  await p.waitForTimeout(200);
  await p.evaluate(() => {
    const job = ALL_JOBS.find(j => j.id === 'soccer_player');
    applyForJob(GS.char, job);
    GS.char.salary = 18000000;
    GS.char.sportsTeam = 'Manchester United';
    GS.char._euroComp = 'champions';
    GS.char._euroInit = true;
    GS.char.performance = 84;
    GS.char.bossMorale = 80;
    GS.char._coworkers = null;
    GS.char._coworkersKey = null;
    GS.char._lgStandings = null;
    GS.char._euroStandings = null;
    updateUI();
  });
  await p.click('#btn-table');
  await p.waitForSelector('#modal-overlay.open', { timeout: 3000 });
  await p.waitForTimeout(200);
  await p.screenshot({ path: 'C:/Users/noahm/Project/.playwright-cli/screen-standings-soccer.png', fullPage: false });

  // 5. Athlete partners (round table)
  await p.evaluate(() => {
    const partnersBtn = Array.from(document.querySelectorAll('#m-choices button')).find(b => /Partners/.test(b.textContent));
    partnersBtn.click();
  });
  await p.waitForTimeout(250);
  await p.screenshot({ path: 'C:/Users/noahm/Project/.playwright-cli/screen-partners-soccer.png', fullPage: false });

  console.log('Screenshots saved.');
  await b.close();
})().catch(e => { console.error('FATAL', e.message || e); process.exit(1); });
