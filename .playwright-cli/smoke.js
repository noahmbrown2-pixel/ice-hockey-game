// Quick smoke check — load page, start game, age ~24 months, ensure no console/page errors.
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
  await page.fill('#inp-name', 'Smoke');
  await page.click('#btn-start');
  await page.waitForSelector('#screen-game.active', { timeout: 5000 });
  for (let i = 0; i < 60; i++) {
    // auto-dismiss modals so we can keep aging
    for (let k = 0; k < 8; k++) {
      const open = await page.$('#modal-overlay.open');
      if (!open) break;
      const btns = await page.$$('#m-choices button');
      let idx = -1;
      for (let j = 0; j < btns.length; j++) {
        const t = (await btns[j].textContent() || '').toLowerCase();
        if (/pass|close|cancel|skip|continue|back/.test(t)) { idx = j; break; }
      }
      if (idx < 0) idx = Math.max(0, btns.length - 1);
      if (btns[idx]) await btns[idx].click({ force: true }).catch(()=>{});
      await page.waitForTimeout(30);
    }
    await page.click('#btn-age', { force: true }).catch(()=>{});
    await page.waitForTimeout(40);
  }
  const seenExpenseOffer = await page.evaluate(() => {
    return (GS.inbox||[]).length;
  });
  console.log(JSON.stringify({ errors: errs, inbox: seenExpenseOffer }, null, 2));
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
