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
  await page.fill('#inp-name', 'Athlete');
  await page.click('#btn-start');
  await page.waitForSelector('#screen-game.active', { timeout: 5000 });

  // Force-apply a soccer player job and force offers to fire
  const setup = await page.evaluate(() => {
    const job = ALL_JOBS.find(j => j.id === 'soccer_player');
    applyForJob(GS.char, job);
    GS.char.salary = 150000;
    // Generate 10 forced offers
    const before = GS.inbox.length;
    for(let i=0;i<30;i++) tickSportsOffers(GS.char);
    // Force-trigger at least one by bypassing RNG
    for(let i=0;i<5;i++){
      const teams = SPORTS_TEAMS['soccer_player'];
      const t = teams[Math.floor(Math.random()*teams.length)];
      addInboxItem({
        type:'offer', icon:t.emoji,
        subject:`${t.name} offers you a contract`,
        date:'Y22M1',
        body:`Test body`,
        offer:{teamName:t.name,league:t.league,emoji:t.emoji,newSalary:8000000,months:24,raise:7850000,raiseMonthly:Math.round(7850000/12),signingBonus:640000}
      });
    }
    return { jobId:GS.char.jobId, jobTitle:GS.char.jobTitle, jobSector:GS.char.jobSector, salary:GS.char.salary, offerCount: GS.inbox.filter(i=>i.type==='offer').length };
  });

  // Sign the first offer
  const signResult = await page.evaluate(() => {
    const offer = GS.inbox.find(i => i.type==='offer');
    const msg = signSportsContract(offer);
    return { msg, newSalary:GS.char.salary, jobTitle:GS.char.jobTitle, sportsTeam:GS.char.sportsTeam, checking:GS.char.checking };
  });

  console.log(JSON.stringify({ errors: errs, setup, signResult }, null, 2));
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
