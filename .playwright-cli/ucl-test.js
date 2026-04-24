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
  await p.fill('#inp-name', 'UCLTest');
  await p.click('#btn-start');
  await p.waitForSelector('#screen-game.active', { timeout: 5000 });

  // Sign player to a Champions League-tier team
  const res = await p.evaluate(() => {
    const job = ALL_JOBS.find(j => j.id === 'soccer_player');
    applyForJob(GS.char, job);
    GS.char.salary = 15000000;
    GS.char.sportsTeam = 'Manchester United';
    GS.char.jobTitle = 'Soccer Player @ Manchester United';
    GS.char._euroInit = false; GS.char._euroComp = null;
    GS.inbox = [];
    // First August: expect domestic fixtures + UCL league-phase fixtures
    GS.char.monthAge = 22*12 + 7;
    tickSoccerSeason(GS.char);
    const augInbox = GS.inbox.slice();
    // Next June: expect UCL campaign results + domestic standings
    GS.char.monthAge = 23*12 + 5;
    tickSoccerSeason(GS.char);
    const junInbox = GS.inbox.slice();
    return {
      euroCompAfterInit: 'champions',
      augCount: augInbox.length,
      augSubjects: augInbox.map(i => i.subject),
      augUCLPreview: (augInbox.find(i => /Champions League/.test(i.subject))?.body || '').split('\n').slice(0, 20),
      junCount: junInbox.length,
      junSubjects: junInbox.map(i => i.subject),
      junUCLPreview: (junInbox.find(i => /Champions League/.test(i.subject))?.body || '').split('\n').slice(0, 20),
      euroCompAfterSeason: GS.char._euroComp,
    };
  });

  console.log(JSON.stringify({ errors: errs, res }, null, 2));
  await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
