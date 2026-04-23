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
  await page.fill('#inp-name', 'FitTest');
  await page.evaluate(() => { const rb=document.querySelector('input[name="scn"][value="rich"]'); if(rb) rb.checked=true; });
  await page.click('#btn-start');
  await page.waitForSelector('#screen-game.active', { timeout: 5000 });

  // First: non-athlete flow
  const resNonAthlete = await page.evaluate(() => {
    GS.char.checking = 50000;
    GS.char.health = 60;
    GS.char.happiness = 60;
    GS.char.jobSector = 'finance';
    const hBefore = GS.char.health, pBefore = GS.char.happiness, cashBefore = GS.char.checking;
    const r = buyFitness(FITNESS_GYM[1]); // Basic gym
    return { result: r, hAfter: GS.char.health, pAfter: GS.char.happiness, cashAfter: GS.char.checking, hBefore, pBefore, cashBefore };
  });

  // Second: athlete unlocked
  const resAthlete = await page.evaluate(() => {
    GS.char.checking = 100000;
    GS.char.health = 50;
    GS.char.happiness = 50;
    GS.char.jobSector = 'sports';
    GS.char.jobTitle = 'MMA Fighter';
    // Open fitness modal and count categories
    document.getElementById('btn-fitness').click();
    const btns = document.querySelectorAll('#m-choices button');
    return { buttonCount: btns.length };
  });

  // Check modal shows Athlete Exclusives header
  const hasAthleteHeader = await page.evaluate(() => {
    const divs = document.querySelectorAll('#m-choices > div');
    return Array.from(divs).some(d => d.textContent.includes('Athlete Exclusives'));
  });

  console.log(JSON.stringify({ errors: errs, resNonAthlete, resAthlete, hasAthleteHeader }, null, 2));
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
