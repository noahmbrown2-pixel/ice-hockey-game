// Verify that every job refresh includes one of each of the 11 required categories.
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('pageerror', e => errs.push('page: ' + e.message));
  await page.goto('http://localhost:3000/bitlife-finance.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { try { localStorage.removeItem('finlife_save'); } catch(e){} });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#screen-new.active', { timeout: 5000 });
  await page.fill('#inp-name', 'CatTester');
  await page.click('#btn-start');
  await page.waitForSelector('#screen-game.active', { timeout: 5000 });

  // Fast-forward to age 30 to unlock max education tiers for best eligibility mix
  const results = await page.evaluate(() => {
    GS.char.education = 'doctoral';
    GS.char.smarts = 90;
    const required = ['healthcare','tech','trades','education','law','finance','creative','service','transport','environment','sports'];
    const runs = [];
    for(let i=0;i<20;i++){
      const jobs = getBalancedJobChoices(GS.char);
      const cats = {};
      jobs.forEach(j => { const c = jobCategory(j); cats[c] = (cats[c]||0)+1; });
      const missing = required.filter(c => !cats[c]);
      runs.push({ count: jobs.length, cats, missing });
    }
    // Test with lower education too (high school only)
    GS.char.education = 'high_school';
    const hsRuns = [];
    for(let i=0;i<10;i++){
      const jobs = getBalancedJobChoices(GS.char);
      const cats = {};
      jobs.forEach(j => { const c = jobCategory(j); cats[c] = (cats[c]||0)+1; });
      hsRuns.push({ count: jobs.length, cats });
    }
    return { doctoral: runs, highSchool: hsRuns };
  });

  const docFails = results.doctoral.filter(r => r.missing.length > 0);
  const randomness = new Set(results.doctoral.map(r => JSON.stringify(r.cats))).size;

  console.log(JSON.stringify({
    errors: errs,
    doctoralRuns: results.doctoral.length,
    doctoralFails: docFails.length,
    doctoralFailures: docFails,
    doctoralUniqueMixes: randomness,
    sampleDoctoralRun: results.doctoral[0],
    highSchoolSample: results.highSchool[0],
    highSchoolCountAvg: Math.round(results.highSchool.reduce((s,r)=>s+r.count,0)/results.highSchool.length),
  }, null, 2));
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
