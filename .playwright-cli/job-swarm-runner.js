// Tests every job in the requested sector. Usage: node job-swarm-runner.js <sector|all>
const { chromium } = require('playwright');
const sector = process.argv[2] || 'all';

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
  await p.fill('#inp-name', 'Swarm');
  await p.click('#btn-start');
  await p.waitForSelector('#screen-game.active', { timeout: 5000 });

  const results = await p.evaluate((sector) => {
    const jobs = (sector === 'all') ? ALL_JOBS.slice() : ALL_JOBS.filter(j => j.sector === sector);
    const out = [];
    for (const job of jobs) {
      const r = { id: job.id, name: job.name, sector: job.sector, edu: job.edu, tier: job.tier, min: job.min, max: job.max };
      try {
        // Reset character to a fully-qualified state
        const c = GS.char;
        c.employed = false;
        c.jobId = null;
        c.jobTitle = null;
        c.jobSector = null;
        c.salary = 0;
        c.sportsTeam = null;
        c.education = 'doctoral';
        c.smarts = 75;
        c.health = 75;
        c.happiness = 75;
        c.checking = 50000;
        c.performance = 70;
        c.bossMorale = 65;
        c.yearsAtJob = 0;
        c.monthsAtJob = 0;
        c._euroInit = false; c._euroComp = null;

        applyForJob(c, job);

        const lo = Math.round(job.min * (0.7 + 0.6 * (75/100)));
        const hi = Math.round(job.max * (0.7 + 0.6 * (75/100)));

        r.checks = {
          employed: c.employed === true,
          jobId: c.jobId === job.id,
          title: c.jobTitle === job.name,
          sector: c.jobSector === job.sector,
          tier: c.careerTierId === 'tier' + job.tier,
          salaryNum: typeof c.salary === 'number' && c.salary > 0,
          salaryRange: c.salary >= lo && c.salary <= hi,
          bossSet: typeof c.bossMorale === 'number',
        };
        r.salary = c.salary;
        r.salaryLo = lo;
        r.salaryHi = hi;

        // Tick the career a couple times to ensure no crashes (layoff is a valid game outcome, not a failure)
        const evBuf = [];
        for (let i = 0; i < 3; i++) tickCareerNew(c, evBuf);
        r.checks.tickNoCrash = true;
        r.salaryAfterTicks = c.salary;
        r.laidOffAfterTicks = !c.employed;

        // Sport-specific: applyForJob clears sportsTeam, then sportsOffer/season ticks should not crash
        if (job.sector === 'sports') {
          GS.inbox = [];
          // Force-roll some monthly sports offer ticks
          for (let i = 0; i < 30; i++) tickSportsOffers(c);
          // Sports season ticks for relevant jobs
          c.monthAge = 22*12 + 7; // August
          if (job.id === 'soccer_player') {
            c.sportsTeam = 'Manchester United';
            tickSoccerSeason(c);
          }
          if (job.id === 'football_player') {
            c.sportsTeam = 'Kansas City Chiefs';
            c.monthAge = 22*12 + 8;
            tickNFLSeason(c);
          }
          if (job.id === 'hockey_player') {
            c.sportsTeam = 'Toronto Maple Leafs';
            c.monthAge = 22*12 + 9;
            tickNHLSeason(c);
          }
          r.checks.sportsTickOK = true;
        }

        r.pass = Object.values(r.checks).every(Boolean);
        if (!r.pass) r.failedChecks = Object.entries(r.checks).filter(([k,v]) => !v).map(([k]) => k);
      } catch (e) {
        r.error = String(e && e.message || e);
        r.pass = false;
      }
      out.push(r);
    }
    return out;
  }, sector);

  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass);
  console.log(JSON.stringify({
    sector,
    total: results.length,
    passed,
    failedCount: failed.length,
    pageErrors: errs,
    failedDetails: failed,
    sample: results.slice(0, 3),
  }, null, 2));
  await b.close();
})().catch(e => { console.error('FATAL', e.message || e); process.exit(1); });
