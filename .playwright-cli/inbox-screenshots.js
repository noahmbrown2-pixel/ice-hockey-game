const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000/bitlife-finance.html', { waitUntil: 'domcontentloaded' });
  await p.evaluate(() => { try { localStorage.removeItem('finlife_save'); } catch(e){} });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForSelector('#screen-new.active', { timeout: 5000 });
  await p.fill('#inp-name', 'Demo');
  await p.click('#btn-start');
  await p.waitForSelector('#screen-game.active', { timeout: 5000 });
  await p.evaluate(() => {
    GS.inbox = [];
    addInboxItem({type:'bill', icon:'🧾', subject:'Bill Report Jan — $4,200', date:'Y22-Jan', body:'Monthly bill total.'});
    addInboxItem({type:'news', icon:'📅', subject:'Premier League fixtures released', date:'Y22-Aug', body:'Season fixtures.'});
    addInboxItem({type:'offer', icon:'⚽', subject:'Real Madrid offers you a contract', date:'Y23-Mar', body:'Sign with us for $20M/yr.'});
    addInboxItem({type:'news', icon:'🚑', subject:'Injury: Sprained ankle', date:'Y22-Apr', body:'You will miss 4 weeks.'});
    addInboxItem({type:'news', icon:'📜', subject:'Lawsuit filed against you', date:'Y22-May', body:'Former coworker is suing.'});
    addInboxItem({type:'news', icon:'🤝', subject:'Promotion to Senior Engineer', date:'Y22-Jun', body:'Congrats on the raise!'});
    addInboxItem({type:'news', icon:'💔', subject:'Your spouse passed away', date:'Y22-Jul', body:'Funeral arrangements.'});
    addInboxItem({type:'news', icon:'🏆', subject:'Hall of Fame induction', date:'Y22-Aug', body:'You\'ve made it.'});
    renderInbox();
  });
  await p.waitForTimeout(150);
  // 1. Inbox button with all 3 dots
  await p.locator('#btn-inbox').screenshot({ path: 'C:/Users/noahm/Project/.playwright-cli/screen-inbox-button.png' });
  // 2. Inbox modal — Bills & News section
  await p.click('#btn-inbox');
  await p.waitForSelector('#modal-overlay.open', { timeout: 3000 });
  await p.waitForTimeout(200);
  await p.screenshot({ path: 'C:/Users/noahm/Project/.playwright-cli/screen-inbox-bills.png', fullPage: false });
  // 3. Switch to Offers tab
  await p.evaluate(() => {
    const off = Array.from(document.querySelectorAll('#m-choices > div:first-child button')).find(t => /Offers/.test(t.textContent));
    off.click();
  });
  await p.waitForTimeout(150);
  await p.screenshot({ path: 'C:/Users/noahm/Project/.playwright-cli/screen-inbox-offers.png', fullPage: false });
  // 4. Toggle orange off
  await p.evaluate(() => {
    const orange = Array.from(document.querySelectorAll('#m-choices button')).find(b => /Regular/.test(b.textContent));
    orange.click();
  });
  await p.waitForTimeout(150);
  await p.evaluate(() => { document.getElementById('modal-close-x').click(); });
  await p.waitForTimeout(200);
  await p.locator('#btn-inbox').screenshot({ path: 'C:/Users/noahm/Project/.playwright-cli/screen-inbox-button-orange-off.png' });
  console.log('OK');
  await b.close();
})().catch(e => { console.error('FATAL', e.message || e); process.exit(1); });
