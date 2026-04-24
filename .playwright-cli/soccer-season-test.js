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
  await page.fill('#inp-name', 'SeasonTest');
  await page.click('#btn-start');
  await page.waitForSelector('#screen-game.active', { timeout: 5000 });

  // Sign player as soccer player with Man United
  const res = await page.evaluate(() => {
    const job = ALL_JOBS.find(j => j.id === 'soccer_player');
    applyForJob(GS.char, job);
    GS.char.salary = 8000000;
    GS.char.sportsTeam = 'Manchester United';
    GS.char.jobTitle = 'Soccer Player @ Manchester United';
    // Force August tick
    const beforeAug = GS.inbox.length;
    GS.char.monthAge = 22*12 + 7; // August
    tickSoccerSeason(GS.char);
    const afterAug = GS.inbox.length;
    const augItem = GS.inbox[0];
    // Force June tick
    GS.char.monthAge = 23*12 + 5; // June next year
    tickSoccerSeason(GS.char);
    const afterJun = GS.inbox.length;
    const junItem = GS.inbox[0];
    // Verify non-August months do nothing
    GS.char.monthAge = 23*12 + 2;
    tickSoccerSeason(GS.char);
    const afterOther = GS.inbox.length;
    return {
      inboxBefore: beforeAug,
      inboxAfterAug: afterAug,
      inboxAfterJun: afterJun,
      inboxAfterOther: afterOther,
      augSubject: augItem.subject,
      augBodyPreview: augItem.body.split('\n').slice(0,5).join('\n'),
      augFixtureCount: (augItem.body.match(/\d{2}\. /g)||[]).length,
      junSubject: junItem.subject,
      junBodyPreview: junItem.body.split('\n').slice(0,10).join('\n'),
      junTableRows: (junItem.body.match(/\n\s*\d+\.\s+/g)||[]).length,
    };
  });

  console.log(JSON.stringify({ errors: errs, res }, null, 2));
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
