// Lifetime simulation: applies each job at age 22, runs monthlyTick until death or 90,
// auto-buys real estate / side hustles when affordable, reports aggregate stats per job.
// Usage: node lifetime-sim.js <sector|all> [livesPerJob=3]
const { chromium } = require('playwright');
const sector = process.argv[2] || 'all';
const lives = parseInt(process.argv[3] || '3', 10);

(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(90000);
  await p.goto('http://localhost:3000/bitlife-finance.html', { waitUntil: 'domcontentloaded' });
  await p.evaluate(() => { try { localStorage.removeItem('finlife_save'); } catch(e){} });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForSelector('#screen-new.active', { timeout: 5000 });
  await p.fill('#inp-name', 'LifeSim');
  await p.click('#btn-start');
  await p.waitForSelector('#screen-game.active', { timeout: 5000 });

  const results = await p.evaluate(({ sector, lives }) => {
    // Stub DOM-touching helpers so monthlyTick can run headless
    window.logEvent = () => {};
    window.showToast = () => {};
    window.updateUI = () => {};
    window.showGameOver = () => {};
    window.renderInbox = () => {};
    window.processNextEvent = () => {};

    const jobs = (sector === 'all') ? ALL_JOBS.slice() : ALL_JOBS.filter(j => j.sector === sector);

    // Snapshot the game's actual fresh char/inv structures (already initialized at game start)
    const baseChar = JSON.parse(JSON.stringify(GS.char));
    const baseInv  = JSON.parse(JSON.stringify(GS.inv));
    function freshChar() {
      const c = JSON.parse(JSON.stringify(baseChar));
      c.age = 22; c.monthAge = 22*12; c.alive = true;
      c.education = 'doctoral'; c.smarts = 75; c.health = 75; c.happiness = 75;
      c.checking = 5000; c.savings = 0; c.highYield = 0; c.debt = 0;
      c.employed = false; c.retired = false; c.inSchool = false;
      c.bossMorale = 65; c.performance = 70;
      c.sponsors = []; c.pendingExpenses = [];
      c.sideHustleIncome = 0;
      return c;
    }
    function freshInv() {
      const i = JSON.parse(JSON.stringify(baseInv));
      i.properties = []; i.vehicles = []; i.businesses = [];
      i.k401 = 0; i.ira = 0; i.roth = 0;
      return i;
    }

    function simOne(job) {
      GS.char = freshChar();
      GS.inv = freshInv();
      GS.nwHistory = [];
      GS.inbox = [];
      GS.billAccum = [];
      GS.pendingEvents = [];
      applyForJob(GS.char, job);
      // Track outcomes
      let retiredAt = null;
      let propsBought = 0;
      let hustlesTaken = 0;
      let peakSalary = GS.char.salary;
      let peakNW = 0;
      const cap = 90 * 12;
      while (GS.char.alive && GS.char.monthAge < cap) {
        try { monthlyTick(); } catch (e) { /* ignore */ break; }
        peakSalary = Math.max(peakSalary, GS.char.salary || 0);
        peakNW = Math.max(peakNW, calcNetWorth(GS.char, GS.inv));
        // Yearly auto-actions on January (monthAge % 12 === 0 → Jan in our calendar proxy)
        if (GS.char.monthAge % 12 === 0) {
          // Auto-retire at 65 if eligible
          if (GS.char.age >= 65 && !GS.char.retired) {
            GS.char.retired = true;
            GS.char.employed = false;
            const draw = Math.round((GS.inv.k401 + GS.inv.ira + GS.inv.roth) * 0.04);
            GS.char.checking += draw;
            retiredAt = GS.char.monthAge - 22*12;
          }
          // Auto-buy real estate when cash > $250k and < 3 properties
          if (GS.char.checking > 250000 && GS.inv.properties.length < 3 && !GS.char.retired) {
            const value = 250000;
            const down = 50000;
            GS.char.checking -= down;
            GS.inv.properties.push({
              id:'p'+(GS.inv.properties.length+1),
              name: GS.inv.properties.length === 0 ? 'Starter Home' : 'Investment Property',
              value, debt: value - down, rent: 1800, livedIn: GS.inv.properties.length === 0,
              monthlyMort: 1200,
            });
            propsBought++;
          }
          // Auto-take side hustle ~25% of years
          if (Math.random() < 0.25 && Array.isArray(window.SIDE_HUSTLES) && SIDE_HUSTLES.length){
            const h = SIDE_HUSTLES[Math.floor(Math.random()*SIDE_HUSTLES.length)];
            if (GS.char.checking >= (h.cost||0)) {
              try { runSideHustle(h); hustlesTaken++; } catch(e){}
            }
          }
        }
      }
      const monthsLived = GS.char.monthAge - 22*12;
      return {
        monthsLived,
        retiredAtMonth: retiredAt,
        retiredAtAge: retiredAt != null ? Math.floor((retiredAt + 22*12)/12) : null,
        died: !GS.char.alive,
        finalAge: GS.char.age,
        finalHealth: GS.char.health,
        finalHappiness: GS.char.happiness,
        finalNetWorth: calcNetWorth(GS.char, GS.inv),
        peakNetWorth: peakNW,
        peakSalary,
        propertiesOwned: GS.inv.properties.length,
        sideHustleIncome: GS.char.sideHustleIncome || 0,
        hustlesTaken,
        propsBought,
      };
    }

    const out = [];
    const errs = [];
    for (const job of jobs) {
      const runs = [];
      for (let i = 0; i < lives; i++) {
        try { runs.push(simOne(job)); }
        catch (e) { runs.push({ error: String(e.message||e) }); errs.push({job:job.id, err:String(e.message||e)}); }
      }
      const ok = runs.filter(r => !r.error);
      const avg = (k) => ok.length ? Math.round(ok.reduce((s,r)=>s+(r[k]||0),0)/ok.length) : 0;
      out.push({
        id: job.id, name: job.name, sector: job.sector, tier: job.tier, edu: job.edu,
        baseMin: job.min, baseMax: job.max,
        runs: ok.length,
        avgMonthsLived: avg('monthsLived'),
        avgRetireMonth: ok.filter(r=>r.retiredAtMonth!=null).length
          ? Math.round(ok.filter(r=>r.retiredAtMonth!=null).reduce((s,r)=>s+r.retiredAtMonth,0) / ok.filter(r=>r.retiredAtMonth!=null).length)
          : null,
        retiredCount: ok.filter(r=>r.retiredAtMonth!=null).length,
        avgFinalHealth: avg('finalHealth'),
        avgFinalHappiness: avg('finalHappiness'),
        avgPeakSalary: avg('peakSalary'),
        avgFinalNW: avg('finalNetWorth'),
        avgPeakNW: avg('peakNetWorth'),
        avgProps: ok.length ? +(ok.reduce((s,r)=>s+r.propertiesOwned,0)/ok.length).toFixed(2) : 0,
        avgSideHustleInc: avg('sideHustleIncome'),
        avgHustlesTaken: ok.length ? +(ok.reduce((s,r)=>s+r.hustlesTaken,0)/ok.length).toFixed(1) : 0,
      });
    }
    return { results: out, errs };
  }, { sector, lives });
  const { results: jobsResults, errs: simErrs } = results;

  // Aggregate by sector
  const bySector = {};
  for (const j of jobsResults) {
    bySector[j.sector] = bySector[j.sector] || [];
    bySector[j.sector].push(j);
  }
  const sectorSummary = {};
  for (const [sec, jobs] of Object.entries(bySector)) {
    const avg = (k) => Math.round(jobs.reduce((s,j)=>s+j[k],0) / jobs.length);
    sectorSummary[sec] = {
      jobCount: jobs.length,
      avgMonthsLived: avg('avgMonthsLived'),
      avgRetireMonth: (() => {
        const r = jobs.filter(j=>j.avgRetireMonth!=null);
        return r.length ? Math.round(r.reduce((s,j)=>s+j.avgRetireMonth,0)/r.length) : null;
      })(),
      avgFinalHealth: avg('avgFinalHealth'),
      avgFinalHappiness: avg('avgFinalHappiness'),
      avgPeakSalary: avg('avgPeakSalary'),
      avgFinalNW: avg('avgFinalNW'),
      avgProps: +(jobs.reduce((s,j)=>s+j.avgProps,0)/jobs.length).toFixed(2),
      avgSideHustleInc: avg('avgSideHustleInc'),
      avgHustlesTaken: +(jobs.reduce((s,j)=>s+j.avgHustlesTaken,0)/jobs.length).toFixed(1),
    };
  }

  console.log(JSON.stringify({ sector, lives, jobCount: jobsResults.length, sectorSummary, jobs: jobsResults.slice(0,3), debugErrs: simErrs.slice(0,5) }, null, 2));
  await b.close();
})().catch(e => { console.error('FATAL', e.message || e); process.exit(1); });
