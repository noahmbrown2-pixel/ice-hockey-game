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
  await page.fill('#inp-name', 'NFLTest');
  await page.click('#btn-start');
  await page.waitForSelector('#screen-game.active', { timeout: 5000 });

  // NFL flow
  const nflRes = await page.evaluate(() => {
    const job = ALL_JOBS.find(j => j.id === 'football_player');
    applyForJob(GS.char, job);
    GS.char.salary = 20000000;
    GS.char.sportsTeam = 'Kansas City Chiefs';
    GS.char.jobTitle = 'NFL Football Player @ Kansas City Chiefs';
    GS.inbox = [];
    GS.char.monthAge = 22*12 + 8; tickNFLSeason(GS.char); // Sep
    const sep = GS.inbox[0];
    GS.char.monthAge = 23*12 + 0; tickNFLSeason(GS.char); // Jan playoffs
    const jan = GS.inbox[0];
    GS.char.monthAge = 23*12 + 1; tickNFLSeason(GS.char); // Feb Super Bowl
    const feb = GS.inbox[0];
    GS.char.monthAge = 23*12 + 3; tickNFLSeason(GS.char); // Apr - should NOT fire
    return {
      inboxCount: GS.inbox.length,
      sepSubject: sep.subject,
      sepWeeks: (sep.body.match(/Wk \d{2}/g)||[]).length,
      janSubject: jan.subject,
      janHasWC: /Wild Card/.test(jan.body),
      janHasStandings: (jan.body.match(/\n\s*\d+\./g)||[]).length,
      febSubject: feb.subject,
      febBody: feb.body.split('\n').slice(0,4).join('\n'),
    };
  });

  // NHL flow
  const nhlRes = await page.evaluate(() => {
    const job = ALL_JOBS.find(j => j.id === 'hockey_player');
    applyForJob(GS.char, job);
    GS.char.salary = 8000000;
    GS.char.sportsTeam = 'Toronto Maple Leafs';
    GS.char.jobTitle = 'Hockey Player @ Toronto Maple Leafs';
    GS.inbox = [];
    GS.char.monthAge = 25*12 + 9; tickNHLSeason(GS.char); // Oct
    const oct = GS.inbox[0];
    GS.char.monthAge = 26*12 + 3; tickNHLSeason(GS.char); // Apr play-in
    const apr = GS.inbox[0];
    GS.char.monthAge = 26*12 + 5; tickNHLSeason(GS.char); // Jun Cup
    const jun = GS.inbox[0];
    return {
      inboxCount: GS.inbox.length,
      octSubject: oct.subject,
      octHasPlayInRule: /play-in/.test(oct.body),
      aprSubject: apr.subject,
      aprHasPlayIn: /Play-in Results/.test(apr.body),
      aprHasStandings: (apr.body.match(/\n\s*\d+\./g)||[]).length,
      junSubject: jun.subject,
      junBody: jun.body.split('\n').slice(0,4).join('\n'),
    };
  });

  console.log(JSON.stringify({ errors: errs, nflRes, nhlRes }, null, 2));
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
