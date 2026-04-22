// Stress test — run the game N times, exercise different paths, collect errors.
const { chromium } = require('playwright');

const N = parseInt(process.env.N || '15', 10);
const MONTHS = parseInt(process.env.MONTHS || '240', 10); // 20 years per run

(async () => {
  const browser = await chromium.launch({ headless: true });
  const aggregate = {
    runs: 0,
    consoleErrors: [],
    pageErrors: [],
    runs_detail: [],
    stateAnomalies: [],
  };

  for (let r = 0; r < N; r++) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    const runErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') runErrors.push('console: ' + msg.text()); });
    page.on('pageerror', err => runErrors.push('page: ' + err.message));

    try {
      await page.goto('http://localhost:3000/bitlife-finance.html', { waitUntil: 'domcontentloaded' });
      // Force a clean state (new game — not resume)
      await page.evaluate(() => { try { localStorage.removeItem('finlife_save'); } catch(e){} });
      await page.reload({ waitUntil: 'domcontentloaded' });

      await page.waitForSelector('#screen-new.active', { timeout: 5000 });
      await page.fill('#inp-name', `Stress Bot ${r}`);
      // Randomize starting scenario
      const scenarios = ['broke','middle','rich'];
      await page.evaluate((s) => {
        const rb = document.querySelector(`input[name="scn"][value="${s}"]`);
        if (rb) rb.checked = true;
      }, scenarios[r % scenarios.length]);
      await page.click('#btn-start');
      await page.waitForSelector('#screen-game.active', { timeout: 5000 });

      // Path variant: each run exercises different combinations
      const path = r % 5;
      async function closeAnyModals() {
        for (let k = 0; k < 8; k++) {
          const open = await page.$('#modal-overlay.open');
          if (!open) return;
          const btns = await page.$$('#m-choices button');
          let idx = -1;
          for (let j = 0; j < btns.length; j++) {
            const t = (await btns[j].textContent() || '').toLowerCase();
            if (/close|back|cancel|skip|no thanks/.test(t)) { idx = j; break; }
          }
          if (idx < 0) idx = Math.max(0, btns.length - 1);
          if (btns[idx]) await btns[idx].click({ force: true }).catch(()=>{});
          await page.waitForTimeout(40);
        }
      }

      // Optional: pick a bank after a few months
      async function tryJoinRandomBank() {
        await closeAnyModals();
        await page.click('#btn-bank', { force: true }).catch(()=>{});
        await page.waitForTimeout(100);
        const btns = await page.$$('#m-choices button');
        // Click a bank button (ones with fee format and bank name)
        const bankBtns = [];
        for (const b of btns) {
          const t = (await b.textContent() || '');
          if (/\/mo ·/.test(t) && !/Move \$|Loan|Pay off|coverage/i.test(t)) bankBtns.push(b);
        }
        if (bankBtns.length) {
          const pick = bankBtns[Math.floor(Math.random() * Math.min(5, bankBtns.length))];
          await pick.click({ force: true }).catch(()=>{});
          await page.waitForTimeout(80);
        }
        await closeAnyModals();
      }

      // Optional: start a business after a while
      async function tryStartBusiness() {
        await closeAnyModals();
        await page.click('#btn-hustle', { force: true }).catch(()=>{});
        await page.waitForTimeout(100);
        const btns = await page.$$('#m-choices button');
        // Find "Start a Real Business" then pick first business option
        for (const b of btns) {
          const t = (await b.textContent() || '');
          if (/Start a Real Business|Launch a Business/i.test(t)) {
            await b.click({ force: true }).catch(()=>{});
            break;
          }
        }
        await page.waitForTimeout(120);
        const bizBtns = await page.$$('#m-choices button');
        if (bizBtns.length > 1) {
          await bizBtns[0].click({ force: true }).catch(()=>{});
        }
        await closeAnyModals();
      }

      async function tryHire() {
        await closeAnyModals();
        await page.click('#btn-biz', { force: true }).catch(()=>{});
        await page.waitForTimeout(100);
        const btns = await page.$$('#m-choices button');
        if (btns.length) { await btns[0].click({ force: true }).catch(()=>{}); }
        await page.waitForTimeout(100);
        const hireBtns = await page.$$('#m-choices button');
        // Click first "Hire Part-Time" button
        for (const b of hireBtns) {
          const t = (await b.textContent() || '');
          if (/Hire Part-Time/i.test(t)) { await b.click({ force: true }).catch(()=>{}); break; }
        }
        await closeAnyModals();
      }

      // Advance month with robust modal dismissal
      async function advanceMonth() {
        await closeAnyModals();
        await page.click('#btn-age', { force: true }).catch(()=>{});
        await page.waitForTimeout(30);
        await closeAnyModals();
      }

      // Run the life for MONTHS months, inject variations at key months
      for (let m = 0; m < MONTHS; m++) {
        await advanceMonth();
        if (path === 0 && m === 24) await tryJoinRandomBank();
        if (path === 1 && m === 36) await tryStartBusiness();
        if (path === 2 && m === 36) { await tryStartBusiness(); await advanceMonth(); await tryHire(); }
        if (path === 3 && m === 12) await tryJoinRandomBank();
        if (path === 4 && m === 48) { await tryJoinRandomBank(); await tryStartBusiness(); }
      }

      const state = await page.evaluate(() => {
        const c = GS.char || {};
        const inv = GS.inv || {};
        return {
          alive: c.alive,
          age: c.age,
          monthAge: c.monthAge,
          checking: c.checking,
          savings: c.savings,
          highYield: c.highYield,
          debt: c.debt,
          salary: c.salary,
          bankId: c.bankId || null,
          bossMorale: c.bossMorale,
          employed: c.employed,
          inboxTotal: (GS.inbox||[]).length,
          inboxByType: (GS.inbox||[]).reduce((a,i)=>{a[i.type]=(a[i.type]||0)+1;return a;},{}),
          businesses: (inv.businesses||[]).length,
          employees: (inv.businesses||[]).reduce((s,b)=>s+((b.employees||[]).length),0),
          avgEmpMorale: (() => {
            const all=(inv.businesses||[]).flatMap(b=>(b.employees||[]));
            if(!all.length) return null;
            return Math.round(all.reduce((s,e)=>s+(e.morale||75),0)/all.length);
          })(),
          properties: (inv.properties||[]).length,
          stockPositions: Object.keys(inv.portfolio||{}).length,
          cryptoPositions: Object.keys(inv.cryptoHeld||{}).length,
          belongings: (c.belongings||[]).length,
          creditScore: c.creditScore,
        };
      });

      // State invariants / anomalies
      const anomalies = [];
      if (typeof state.checking !== 'number' || isNaN(state.checking)) anomalies.push('checking NaN');
      if (state.age !== Math.floor(state.monthAge/12)) anomalies.push(`age/monthAge mismatch: ${state.age} vs ${state.monthAge}/12`);
      if (state.salary < 0) anomalies.push(`negative salary ${state.salary}`);
      if (state.inboxTotal > 40) anomalies.push(`inbox over cap: ${state.inboxTotal}`);
      if (state.bossMorale !== undefined && state.bossMorale !== null && (state.bossMorale < 0 || state.bossMorale > 100)) anomalies.push(`bossMorale out of range: ${state.bossMorale}`);
      if (state.creditScore !== undefined && (state.creditScore < 300 || state.creditScore > 850)) anomalies.push(`creditScore out of range: ${state.creditScore}`);
      if (state.avgEmpMorale !== null && (state.avgEmpMorale < 0 || state.avgEmpMorale > 100)) anomalies.push(`emp morale out of range: ${state.avgEmpMorale}`);

      aggregate.runs++;
      aggregate.runs_detail.push({
        run: r, path, scenario: scenarios[r % scenarios.length],
        runErrors: runErrors.length,
        state, anomalies,
      });
      for (const e of runErrors) aggregate.consoleErrors.push(`run ${r}: ${e}`);
      for (const a of anomalies) aggregate.stateAnomalies.push(`run ${r}: ${a}`);
    } catch (e) {
      aggregate.pageErrors.push(`run ${r} fatal: ${e.message}`);
    } finally {
      await ctx.close();
    }
  }

  // Compute summary
  const alive = aggregate.runs_detail.filter(r=>r.state && r.state.alive).length;
  const avgChecking = aggregate.runs_detail.reduce((s,r)=>s+(r.state?.checking||0),0) / aggregate.runs_detail.length;
  const avgSalary = aggregate.runs_detail.reduce((s,r)=>s+(r.state?.salary||0),0) / aggregate.runs_detail.length;
  const avgAge = aggregate.runs_detail.reduce((s,r)=>s+(r.state?.age||0),0) / aggregate.runs_detail.length;
  const joinedBank = aggregate.runs_detail.filter(r=>r.state?.bankId).length;
  const startedBiz = aggregate.runs_detail.filter(r=>r.state?.businesses>0).length;
  const hiredStaff = aggregate.runs_detail.filter(r=>r.state?.employees>0).length;

  console.log(JSON.stringify({
    summary: {
      runs: aggregate.runs,
      consoleErrors: aggregate.consoleErrors.length,
      pageErrors: aggregate.pageErrors.length,
      stateAnomalies: aggregate.stateAnomalies.length,
      alive, avgChecking: Math.round(avgChecking), avgSalary: Math.round(avgSalary), avgAgeReached: Math.round(avgAge*10)/10,
      joinedBank, startedBiz, hiredStaff,
    },
    consoleErrors: aggregate.consoleErrors.slice(0, 20),
    pageErrors: aggregate.pageErrors.slice(0, 20),
    stateAnomalies: aggregate.stateAnomalies.slice(0, 20),
    runs_detail: aggregate.runs_detail,
  }, null, 2));

  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
